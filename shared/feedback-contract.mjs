export const FEEDBACK_RATINGS = Object.freeze(["helpful", "not_helpful"]);
export const FEEDBACK_REASONS = Object.freeze([
  "result_issue",
  "hard_to_use",
  "missing_feature",
  "error",
  "other"
]);
export const FEEDBACK_CONTEXTS = Object.freeze(["completion", "manual"]);
export const FEEDBACK_MAX_COMMENT_LENGTH = 200;
export const FEEDBACK_MAX_BODY_BYTES = 2_048;
export const FEEDBACK_INGEST_WINDOW_MS = 60 * 60 * 1_000;
export const FEEDBACK_INGEST_MAX_PER_WINDOW = 120;
