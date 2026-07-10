import assert from "node:assert/strict";
import test from "node:test";
import { buildFunnelSql, extractRows, summarizeRows } from "../scripts/funnel-report.mjs";

test("builds a KST half-open cohort query with exact stage intersections", () => {
  const sql = buildFunnelSql({ days: 7 });
  assert.match(sql, /'\+9 hours', 'start of day', '-6 days', '-9 hours'/);
  assert.match(sql, /'\+1 day', '-9 hours'/);
  assert.match(sql, /synthetic = 0 AND source IN \('naver', 'google', 'search_other'\)/);
  assert.match(sql, /WHERE viewed = 1/);
  assert.match(sql, /started = 1 AND useful = 1/);
});

test("extracts Wrangler D1 result rows", () => {
  assert.deepEqual(extractRows([{ results: [{ row_type: "meta" }] }]), [{ row_type: "meta" }]);
  assert.throws(() => extractRows({}), /Unexpected Wrangler/);
});

test("marks a clean 14-day, 30-session organic sample ready", () => {
  const now = Date.UTC(2026, 6, 10);
  const rows = [
    {
      row_type: "tool",
      tool_id: "vat-calculator",
      viewed: 20,
      started: 10,
      useful: 8,
      post_start: 7
    },
    {
      row_type: "overall",
      viewed: 32,
      started: 18,
      useful: 12,
      post_start: 11
    },
    {
      row_type: "meta",
      period_sessions: 32,
      total_sessions: 32,
      orphan_sessions: 1,
      milestone_sessions: 32,
      first_started_at: now - 15 * 24 * 60 * 60 * 1_000,
      last_started_at: now
    }
  ];
  const summary = summarizeRows(rows, now);
  assert.equal(summary.meta.ready, true);
  assert.equal(summary.meta.orphanRate, 1 / 32);
  assert.equal(summary.overall.postStart, 11);
});

test("blocks a verdict for low samples or excessive orphan events", () => {
  const now = Date.UTC(2026, 6, 10);
  const base = {
    row_type: "meta",
    period_sessions: 12,
    total_sessions: 12,
    orphan_sessions: 0,
    milestone_sessions: 12,
    first_started_at: now - 3 * 24 * 60 * 60 * 1_000,
    last_started_at: now
  };
  assert.equal(summarizeRows([base], now).meta.ready, false);
  assert.equal(
    summarizeRows(
      [{ ...base, period_sessions: 1, total_sessions: 30, first_started_at: now - 15 * 24 * 60 * 60 * 1_000 }],
      now
    ).meta.ready,
    false
  );
  assert.equal(
    summarizeRows(
      [{ ...base, total_sessions: 40, orphan_sessions: 4, milestone_sessions: 40, first_started_at: now - 20 * 24 * 60 * 60 * 1_000 }],
      now
    ).meta.ready,
    false
  );
});
