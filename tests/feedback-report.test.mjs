import assert from "node:assert/strict";
import test from "node:test";
import { buildFeedbackSql, summarizeFeedbackRows } from "../scripts/feedback-report.mjs";

test("builds a KST feedback report joined to useful results", () => {
  const sql = buildFeedbackSql({ days: 7, organic: true, comments: true });
  assert.match(sql, /'-6 days'/);
  assert.match(sql, /e\.event_name = 'useful_result'/);
  assert.match(sql, /f\.source IN \('naver', 'google', 'search_other'\)/);
  assert.match(sql, /'comment' AS row_type/);
});

test("summarizes ratings, reasons, and recent comments", () => {
  const summary = summarizeFeedbackRows([
    {
      row_type: "summary",
      tool_id: "stamp-background",
      source: "naver",
      total: 3,
      helpful: 2,
      not_helpful: 1,
      completed: 3
    },
    { row_type: "reason", reason: "hard_to_use", total: 1 },
    {
      row_type: "comment",
      tool_id: "stamp-background",
      source: "naver",
      completed: 1,
      reason: "hard_to_use",
      comment: "경계 조절이 어려워요",
      created_at: 10
    }
  ]);
  assert.deepEqual(summary.summaries[0], {
    toolId: "stamp-background",
    source: "naver",
    total: 3,
    helpful: 2,
    notHelpful: 1,
    completed: 3
  });
  assert.deepEqual(summary.reasons, [{ reason: "hard_to_use", count: 1 }]);
  assert.equal(summary.comments[0].completed, true);
});
