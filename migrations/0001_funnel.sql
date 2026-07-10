CREATE TABLE funnel_sessions (
  session_id TEXT PRIMARY KEY,
  started_at INTEGER NOT NULL,
  source TEXT NOT NULL CHECK (source IN (
    'naver', 'google', 'search_other', 'referral',
    'direct', 'internal', 'unknown', 'synthetic'
  )),
  storage_mode TEXT NOT NULL CHECK (storage_mode IN ('session', 'memory')),
  synthetic INTEGER NOT NULL DEFAULT 0 CHECK (synthetic IN (0, 1))
);

CREATE TABLE funnel_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL UNIQUE,
  session_id TEXT NOT NULL REFERENCES funnel_sessions(session_id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  event_name TEXT NOT NULL CHECK (event_name IN (
    'tool_view', 'tool_start', 'useful_result'
  )),
  result_type TEXT CHECK (result_type IS NULL OR result_type IN (
    'download', 'copy', 'print'
  )),
  page_path TEXT NOT NULL,
  build_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(session_id, tool_id, event_name)
);

CREATE TABLE funnel_ingest_windows (
  window_start INTEGER PRIMARY KEY,
  accepted_events INTEGER NOT NULL CHECK (accepted_events >= 0)
);

CREATE INDEX idx_funnel_sessions_started_source
  ON funnel_sessions(started_at, source, synthetic);
CREATE INDEX idx_funnel_events_session_tool
  ON funnel_events(session_id, tool_id, event_name);
CREATE INDEX idx_funnel_events_created
  ON funnel_events(created_at);
