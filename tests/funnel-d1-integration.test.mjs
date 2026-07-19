import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { Miniflare } from "miniflare";
import { reserveIngestBudget } from "../functions/api/funnel-event.js";
import { reserveFeedbackBudget } from "../functions/api/tool-feedback.js";
import { buildFeedbackSql, summarizeFeedbackRows } from "../scripts/feedback-report.mjs";
import { buildFunnelSql, extractRows, summarizeRows } from "../scripts/funnel-report.mjs";
import { INGEST_MAX_EVENTS_PER_WINDOW, INGEST_WINDOW_MS } from "../shared/funnel-contract.mjs";
import {
  FEEDBACK_INGEST_MAX_PER_WINDOW,
  FEEDBACK_INGEST_WINDOW_MS
} from "../shared/feedback-contract.mjs";

const database = "k-document-tool-analytics";
const dayMs = 24 * 60 * 60 * 1_000;

function runWrangler(args) {
  const result = spawnSync("npx", ["wrangler", ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, CI: "1", NO_COLOR: "1" },
    maxBuffer: 10 * 1024 * 1024
  });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || `wrangler ${args.join(" ")} failed`).trim());
  }
  return result.stdout;
}

function executeLocal(persistTo, sql) {
  const output = runWrangler([
    "d1",
    "execute",
    database,
    "--local",
    "--persist-to",
    persistTo,
    "--command",
    sql,
    "--json"
  ]);
  return extractRows(JSON.parse(output));
}

test(
  "applies the real D1 migration and reports an exact three-stage cohort",
  { timeout: 60_000 },
  () => {
    const persistTo = mkdtempSync(join(tmpdir(), "kdoc-funnel-d1-"));
    try {
      runWrangler([
        "d1",
        "migrations",
        "apply",
        database,
        "--local",
        "--persist-to",
        persistTo
      ]);

      const now = Date.now();
      const statements = [];
      for (let index = 0; index < 30; index += 1) {
        const sessionId = `session-${String(index).padStart(2, "0")}`;
        const startedAt = index === 0 ? now - 15 * dayMs : now - index * 1_000;
        statements.push(
          `INSERT INTO funnel_sessions (session_id, started_at, source, storage_mode, synthetic) VALUES ('${sessionId}', ${startedAt}, 'naver', 'session', 0)`
        );
        for (const [stageIndex, eventName] of ["tool_view", "tool_start", "useful_result"].entries()) {
          const resultType = eventName === "useful_result" ? "'copy'" : "NULL";
          statements.push(
            `INSERT INTO funnel_events (event_id, session_id, tool_id, event_name, result_type, page_path, build_id, created_at) VALUES ('event-${index}-${stageIndex}', '${sessionId}', 'vat-calculator', '${eventName}', ${resultType}, '/tools/vat-calculator/', 'abcdef012345', ${startedAt + stageIndex})`
          );
        }
      }
      statements.push(
        "INSERT OR IGNORE INTO funnel_events (event_id, session_id, tool_id, event_name, result_type, page_path, build_id, created_at) VALUES ('duplicate-stage', 'session-00', 'vat-calculator', 'tool_view', NULL, '/tools/vat-calculator/', 'abcdef012345', 1)"
      );
      executeLocal(persistTo, `${statements.join(";\n")};`);

      const countRows = executeLocal(persistTo, "SELECT COUNT(*) AS event_count FROM funnel_events;");
      assert.equal(Number(countRows[0].event_count), 90);

      const rows = executeLocal(persistTo, buildFunnelSql({ days: 30 }));
      const summary = summarizeRows(rows, now);
      assert.equal(summary.meta.periodSessions, 30);
      assert.equal(summary.meta.orphanSessions, 0);
      assert.equal(summary.overall.viewed, 30);
      assert.equal(summary.overall.started, 30);
      assert.equal(summary.overall.useful, 30);
      assert.equal(summary.meta.ready, true);

      executeLocal(
        persistTo,
        `INSERT INTO tool_feedback (session_id, tool_id, page_path, source, rating, reason, comment, feedback_context, build_id, created_at, updated_at)
         VALUES
         ('session-00', 'vat-calculator', '/tools/vat-calculator/', 'naver', 'helpful', NULL, NULL, 'completion', 'abcdef012345', ${now}, ${now}),
         ('session-01', 'vat-calculator', '/tools/vat-calculator/', 'naver', 'not_helpful', 'hard_to_use', '입력이 어려워요', 'manual', 'abcdef012345', ${now}, ${now});`
      );
      const feedbackRows = executeLocal(
        persistTo,
        buildFeedbackSql({ days: 1, organic: true, comments: true })
      );
      const feedback = summarizeFeedbackRows(feedbackRows);
      assert.equal(feedback.summaries[0].total, 2);
      assert.equal(feedback.summaries[0].helpful, 1);
      assert.equal(feedback.summaries[0].notHelpful, 1);
      assert.equal(feedback.summaries[0].completed, 2);
      assert.deepEqual(feedback.reasons, [{ reason: "hard_to_use", count: 1 }]);
      assert.equal(feedback.comments[0].comment, "입력이 어려워요");

    } finally {
      rmSync(persistTo, { recursive: true, force: true });
    }
  }
);

test("reserves the production ingest budget atomically at the D1 boundary", async () => {
  const miniflare = new Miniflare({
    modules: true,
    script: "export default { fetch() { return new Response(null, { status: 204 }); } }",
    d1Databases: { ANALYTICS_DB: "funnel-budget-test" }
  });
  try {
    const db = await miniflare.getD1Database("ANALYTICS_DB");
    const now = Date.now();
    const windowStart = Math.floor(now / INGEST_WINDOW_MS) * INGEST_WINDOW_MS;
    await db.exec(
      "CREATE TABLE funnel_ingest_windows (window_start INTEGER PRIMARY KEY, accepted_events INTEGER NOT NULL CHECK (accepted_events >= 0));"
    );
    await db
      .prepare("INSERT INTO funnel_ingest_windows (window_start, accepted_events) VALUES (?, ?)")
      .bind(windowStart, INGEST_MAX_EVENTS_PER_WINDOW - 1)
      .run();

    const reservations = await Promise.all([
      reserveIngestBudget(db, now),
      reserveIngestBudget(db, now)
    ]);
    assert.deepEqual(reservations.sort(), [false, true]);
    const row = await db
      .prepare("SELECT accepted_events FROM funnel_ingest_windows WHERE window_start = ?")
      .bind(windowStart)
      .first();
    assert.equal(Number(row.accepted_events), INGEST_MAX_EVENTS_PER_WINDOW);
  } finally {
    await miniflare.dispose();
  }
});

test("reserves the feedback budget atomically at the D1 boundary", async () => {
  const miniflare = new Miniflare({
    modules: true,
    script: "export default { fetch() { return new Response(null, { status: 204 }); } }",
    d1Databases: { ANALYTICS_DB: "feedback-budget-test" }
  });
  try {
    const db = await miniflare.getD1Database("ANALYTICS_DB");
    const now = Date.now();
    const windowStart = Math.floor(now / FEEDBACK_INGEST_WINDOW_MS) * FEEDBACK_INGEST_WINDOW_MS;
    await db.exec(
      "CREATE TABLE feedback_ingest_windows (window_start INTEGER PRIMARY KEY, accepted_feedback INTEGER NOT NULL CHECK (accepted_feedback >= 0));"
    );
    await db
      .prepare("INSERT INTO feedback_ingest_windows (window_start, accepted_feedback) VALUES (?, ?)")
      .bind(windowStart, FEEDBACK_INGEST_MAX_PER_WINDOW - 1)
      .run();

    const reservations = await Promise.all([
      reserveFeedbackBudget(db, now),
      reserveFeedbackBudget(db, now)
    ]);
    assert.deepEqual(reservations.sort(), [false, true]);
    const row = await db
      .prepare("SELECT accepted_feedback FROM feedback_ingest_windows WHERE window_start = ?")
      .bind(windowStart)
      .first();
    assert.equal(Number(row.accepted_feedback), FEEDBACK_INGEST_MAX_PER_WINDOW);
  } finally {
    await miniflare.dispose();
  }
});
