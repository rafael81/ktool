import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { RETENTION_MS } from "../shared/funnel-contract.mjs";

const DAY_MS = 24 * 60 * 60 * 1_000;
const ORGANIC_FILTER = "synthetic = 0 AND source IN ('naver', 'google', 'search_other')";

export function buildFunnelSql({ days = 7, allSources = false, includeSynthetic = false } = {}) {
  const startOffset = Math.max(0, days - 1);
  const filter = allSources
    ? includeSynthetic
      ? "1 = 1"
      : "synthetic = 0"
    : includeSynthetic
      ? `((${ORGANIC_FILTER}) OR synthetic = 1)`
      : ORGANIC_FILTER;

  return `
WITH
window AS (
  SELECT
    CAST(strftime('%s', 'now', '+9 hours', 'start of day', '-${startOffset} days', '-9 hours') AS INTEGER) * 1000 AS from_ms,
    CAST(strftime('%s', 'now', '+9 hours', 'start of day', '+1 day', '-9 hours') AS INTEGER) * 1000 AS to_ms
),
period_sessions AS (
  SELECT s.*
  FROM funnel_sessions s, window w
  WHERE s.started_at >= w.from_ms AND s.started_at < w.to_ms AND ${filter}
),
tool_flags AS (
  SELECT
    s.session_id,
    e.tool_id,
    MAX(CASE WHEN e.event_name = 'tool_view' THEN 1 ELSE 0 END) AS viewed,
    MAX(CASE WHEN e.event_name = 'tool_start' THEN 1 ELSE 0 END) AS started,
    MAX(CASE WHEN e.event_name = 'useful_result' THEN 1 ELSE 0 END) AS useful
  FROM period_sessions s
  JOIN funnel_events e ON e.session_id = s.session_id
  GROUP BY s.session_id, e.tool_id
),
valid_tool_flags AS (
  SELECT * FROM tool_flags WHERE viewed = 1
),
tool_metrics AS (
  SELECT
    tool_id,
    COUNT(*) AS viewed,
    SUM(CASE WHEN started = 1 THEN 1 ELSE 0 END) AS started,
    SUM(CASE WHEN useful = 1 THEN 1 ELSE 0 END) AS useful,
    SUM(CASE WHEN started = 1 AND useful = 1 THEN 1 ELSE 0 END) AS post_start
  FROM valid_tool_flags
  GROUP BY tool_id
),
session_flags AS (
  SELECT
    session_id,
    MAX(viewed) AS viewed,
    MAX(CASE WHEN started = 1 THEN 1 ELSE 0 END) AS started,
    MAX(CASE WHEN useful = 1 THEN 1 ELSE 0 END) AS useful,
    MAX(CASE WHEN started = 1 AND useful = 1 THEN 1 ELSE 0 END) AS post_start
  FROM valid_tool_flags
  GROUP BY session_id
),
period_meta AS (
  SELECT
    COUNT(DISTINCT s.session_id) AS period_sessions,
    COUNT(DISTINCT CASE WHEN f.viewed = 0 THEN f.session_id END) AS orphan_sessions,
    COUNT(DISTINCT f.session_id) AS milestone_sessions
  FROM period_sessions s
  LEFT JOIN tool_flags f ON f.session_id = s.session_id
),
all_meta AS (
  SELECT
    COUNT(DISTINCT session_id) AS total_sessions,
    MIN(started_at) AS first_started_at,
    MAX(started_at) AS last_started_at
  FROM funnel_sessions
  WHERE ${filter}
)
SELECT
  'tool' AS row_type,
  tool_id,
  viewed,
  started,
  useful,
  post_start,
  0 AS period_sessions,
  0 AS orphan_sessions,
  0 AS milestone_sessions,
  0 AS total_sessions,
  NULL AS first_started_at,
  NULL AS last_started_at
FROM tool_metrics
UNION ALL
SELECT
  'overall',
  '*',
  COALESCE(SUM(viewed), 0),
  COALESCE(SUM(started), 0),
  COALESCE(SUM(useful), 0),
  COALESCE(SUM(post_start), 0),
  0, 0, 0, 0, NULL, NULL
FROM session_flags
UNION ALL
SELECT
  'meta',
  '*',
  0, 0, 0, 0,
  p.period_sessions,
  p.orphan_sessions,
  p.milestone_sessions,
  a.total_sessions,
  a.first_started_at,
  a.last_started_at
FROM period_meta p, all_meta a;
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

export function summarizeRows(rows, now = Date.now()) {
  const tools = rows
    .filter((row) => row.row_type === "tool")
    .map((row) => ({
      toolId: row.tool_id,
      viewed: number(row.viewed),
      started: number(row.started),
      useful: number(row.useful),
      postStart: number(row.post_start)
    }))
    .sort((left, right) => right.viewed - left.viewed || left.toolId.localeCompare(right.toolId));
  const overallRow = rows.find((row) => row.row_type === "overall") || {};
  const metaRow = rows.find((row) => row.row_type === "meta") || {};
  const firstStartedAt = number(metaRow.first_started_at);
  const milestoneSessions = number(metaRow.milestone_sessions);
  const orphanSessions = number(metaRow.orphan_sessions);
  const elapsedDays = firstStartedAt ? (now - firstStartedAt) / DAY_MS : 0;
  const orphanRate = milestoneSessions ? orphanSessions / milestoneSessions : 0;

  return {
    tools,
    overall: {
      viewed: number(overallRow.viewed),
      started: number(overallRow.started),
      useful: number(overallRow.useful),
      postStart: number(overallRow.post_start)
    },
    meta: {
      periodSessions: number(metaRow.period_sessions),
      totalSessions: number(metaRow.total_sessions),
      orphanSessions,
      milestoneSessions,
      orphanRate,
      firstStartedAt,
      lastStartedAt: number(metaRow.last_started_at),
      elapsedDays,
      ready:
        elapsedDays >= 14 &&
        number(metaRow.period_sessions) >= 30 &&
        number(metaRow.total_sessions) >= 30 &&
        orphanRate <= 0.05
    }
  };
}

function parseArgs(argv) {
  const options = {
    days: 7,
    preview: false,
    local: false,
    allSources: false,
    includeSynthetic: false,
    json: false
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--days") options.days = Number(argv[++index]);
    else if (argument === "--preview") options.preview = true;
    else if (argument === "--local") options.local = true;
    else if (argument === "--all-sources") options.allSources = true;
    else if (argument === "--include-synthetic") options.includeSynthetic = true;
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
  const scope = options.allSources ? "all sources" : "organic search";
  console.log(`K문서툴 퍼널 · 최근 ${options.days}일 · ${scope}`);
  console.log("도구                         방문  시작  결과  시작률  결과률  시작후결과률");
  for (const tool of summary.tools) {
    console.log(
      `${tool.toolId.padEnd(28)} ${String(tool.viewed).padStart(4)}  ${String(tool.started).padStart(4)}  ${String(
        tool.useful
      ).padStart(4)}  ${rate(tool.started, tool.viewed).padStart(6)}  ${rate(tool.useful, tool.viewed).padStart(6)}  ${rate(
        tool.postStart,
        tool.started
      ).padStart(10)}`
    );
  }
  const overall = summary.overall;
  console.log(
    `${"전체 세션".padEnd(24)} ${String(overall.viewed).padStart(4)}  ${String(overall.started).padStart(4)}  ${String(
      overall.useful
    ).padStart(4)}  ${rate(overall.started, overall.viewed).padStart(6)}  ${rate(overall.useful, overall.viewed).padStart(
      6
    )}  ${rate(overall.postStart, overall.started).padStart(10)}`
  );
  console.log(
    `무결성: 고아 세션 ${summary.meta.orphanSessions}/${summary.meta.milestoneSessions} (${rate(
      summary.meta.orphanSessions,
      summary.meta.milestoneSessions
    )})`
  );
  if (!options.allSources && !options.includeSynthetic) {
    const status = summary.meta.ready ? "READY" : "WAIT";
    console.log(
      `의사결정: ${status} · ${summary.meta.elapsedDays.toFixed(1)}/14일 · 기간 오가닉 ${summary.meta.periodSessions}/30세션 · 누적 ${summary.meta.totalSessions}세션`
    );
    console.log("Cloudflare Web Analytics의 사람 방문수와 비교한 뒤 제품 결정을 내리세요.");
  }
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const database = options.preview ? "k-document-tool-analytics-preview" : "k-document-tool-analytics";
  const cutoff = Date.now() - RETENTION_MS;
  executeDatabase(database, `DELETE FROM funnel_sessions WHERE started_at < ${cutoff};`, options);
  const rows = executeDatabase(database, buildFunnelSql(options), options);
  const summary = summarizeRows(rows);
  if (options.json) console.log(JSON.stringify(summary, null, 2));
  else printReport(summary, options);
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main().catch((error) => {
    console.error(`Funnel report failed: ${error.message}`);
    process.exitCode = 1;
  });
}
