import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { RETENTION_MS } from "../shared/funnel-contract.mjs";

const ORGANIC_SOURCES = ["naver", "google", "search_other"];

export function buildFeedbackSql({ days = 7, organic = false, comments = false } = {}) {
  const sourceFilter = organic ? `AND f.source IN (${ORGANIC_SOURCES.map((source) => `'${source}'`).join(", ")})` : "";
  const commentRows = comments
    ? `
UNION ALL
SELECT
  'comment' AS row_type,
  tool_id,
  source,
  0 AS total,
  0 AS helpful,
  0 AS not_helpful,
  completed,
  reason,
  comment,
  updated_at AS created_at
FROM feedback_with_completion
WHERE comment IS NOT NULL`
    : "";

  return `
WITH window AS (
  SELECT
    CAST(strftime('%s', 'now', '+9 hours', 'start of day', '-${days - 1} days', '-9 hours') AS INTEGER) * 1000 AS from_ms,
    CAST(strftime('%s', 'now', '+9 hours', 'start of day', '+1 day', '-9 hours') AS INTEGER) * 1000 AS to_ms
),
feedback_with_completion AS (
  SELECT
    f.*,
    EXISTS (
      SELECT 1
      FROM funnel_events e
      WHERE e.session_id = f.session_id
        AND e.tool_id = f.tool_id
        AND e.event_name = 'useful_result'
    ) AS completed
  FROM tool_feedback f, window w
  WHERE f.updated_at >= w.from_ms
    AND f.updated_at < w.to_ms
    ${sourceFilter}
)
SELECT
  'summary' AS row_type,
  tool_id,
  source,
  COUNT(*) AS total,
  SUM(CASE WHEN rating = 'helpful' THEN 1 ELSE 0 END) AS helpful,
  SUM(CASE WHEN rating = 'not_helpful' THEN 1 ELSE 0 END) AS not_helpful,
  SUM(completed) AS completed,
  NULL AS reason,
  NULL AS comment,
  NULL AS created_at
FROM feedback_with_completion
GROUP BY tool_id, source
UNION ALL
SELECT
  'reason',
  '*',
  '*',
  COUNT(*),
  0,
  COUNT(*),
  SUM(completed),
  reason,
  NULL,
  NULL
FROM feedback_with_completion
WHERE rating = 'not_helpful'
GROUP BY reason${commentRows}
ORDER BY row_type, total DESC, tool_id, source;
`.trim();
}

export function extractRows(parsed) {
  if (!Array.isArray(parsed)) throw new Error("Unexpected Wrangler JSON response");
  return parsed.flatMap((entry) => entry?.results || entry?.result?.flatMap((item) => item?.results || []) || []);
}

function number(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function summarizeFeedbackRows(rows) {
  return {
    summaries: rows
      .filter((row) => row.row_type === "summary")
      .map((row) => ({
        toolId: row.tool_id,
        source: row.source,
        total: number(row.total),
        helpful: number(row.helpful),
        notHelpful: number(row.not_helpful),
        completed: number(row.completed)
      })),
    reasons: rows
      .filter((row) => row.row_type === "reason")
      .map((row) => ({ reason: row.reason, count: number(row.total) })),
    comments: rows
      .filter((row) => row.row_type === "comment")
      .map((row) => ({
        toolId: row.tool_id,
        source: row.source,
        completed: Boolean(number(row.completed)),
        reason: row.reason,
        comment: row.comment,
        createdAt: number(row.created_at)
      }))
      .sort((left, right) => right.createdAt - left.createdAt)
  };
}

function parseArgs(argv) {
  const options = { days: 7, preview: false, local: false, organic: false, comments: false, json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--days") options.days = Number(argv[++index]);
    else if (argument === "--preview") options.preview = true;
    else if (argument === "--local") options.local = true;
    else if (argument === "--organic") options.organic = true;
    else if (argument === "--comments") options.comments = true;
    else if (argument === "--json") options.json = true;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (!Number.isInteger(options.days) || options.days < 1 || options.days > 90) {
    throw new Error("--days must be an integer between 1 and 90");
  }
  return options;
}

function executeDatabase(database, sql, { local = false } = {}) {
  const result = spawnSync(
    "npx",
    ["wrangler", "d1", "execute", database, local ? "--local" : "--remote", "--command", sql, "--json"],
    { cwd: process.cwd(), encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }
  );
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "Wrangler D1 query failed").trim());
  }
  return extractRows(JSON.parse(result.stdout));
}

function rate(numerator, denominator) {
  return denominator ? `${((numerator / denominator) * 100).toFixed(1)}%` : "-";
}

function printReport(summary, options) {
  const scope = options.organic ? "organic search" : "all sources";
  console.log(`K문서툴 피드백 · 최근 ${options.days}일 · ${scope}`);
  console.log("도구                         유입            응답  도움  아쉬움  만족률  완료후");
  for (const row of summary.summaries) {
    console.log(
      `${row.toolId.padEnd(28)} ${row.source.padEnd(13)} ${String(row.total).padStart(4)}  ${String(row.helpful).padStart(4)}  ${String(row.notHelpful).padStart(6)}  ${rate(row.helpful, row.total).padStart(6)}  ${String(row.completed).padStart(6)}`
    );
  }
  if (!summary.summaries.length) console.log("아직 수집된 피드백이 없습니다.");
  if (summary.reasons.length) {
    console.log("\n아쉬운 이유");
    for (const row of summary.reasons) console.log(`${row.reason.padEnd(20)} ${row.count}`);
  }
  if (options.comments && summary.comments.length) {
    console.log("\n한 줄 의견");
    for (const row of summary.comments) {
      console.log(`- [${row.toolId}/${row.source}${row.completed ? "/완료후" : ""}] ${row.comment}`);
    }
  }
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const database = options.preview ? "k-document-tool-analytics-preview" : "k-document-tool-analytics";
  executeDatabase(database, `DELETE FROM tool_feedback WHERE updated_at < ${Date.now() - RETENTION_MS};`, options);
  const rows = executeDatabase(database, buildFeedbackSql(options), options);
  const summary = summarizeFeedbackRows(rows);
  if (options.json) console.log(JSON.stringify(summary, null, 2));
  else printReport(summary, options);
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main().catch((error) => {
    console.error(`Feedback report failed: ${error.message}`);
    process.exitCode = 1;
  });
}
