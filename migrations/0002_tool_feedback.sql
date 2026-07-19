CREATE TABLE tool_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  tool_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN (
    'naver', 'google', 'search_other', 'referral',
    'direct', 'internal', 'unknown'
  )),
  rating TEXT NOT NULL CHECK (rating IN ('helpful', 'not_helpful')),
  reason TEXT CHECK (reason IS NULL OR reason IN (
    'result_issue', 'hard_to_use', 'missing_feature', 'error', 'other'
  )),
  comment TEXT CHECK (comment IS NULL OR length(comment) <= 200),
  feedback_context TEXT NOT NULL CHECK (feedback_context IN ('completion', 'manual')),
  build_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(session_id, tool_id)
);

CREATE TABLE feedback_ingest_windows (
  window_start INTEGER PRIMARY KEY,
  accepted_feedback INTEGER NOT NULL CHECK (accepted_feedback >= 0)
);

CREATE INDEX idx_tool_feedback_created_source
  ON tool_feedback(created_at, source);
CREATE INDEX idx_tool_feedback_tool_rating
  ON tool_feedback(tool_id, rating);
