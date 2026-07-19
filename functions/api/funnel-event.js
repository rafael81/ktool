import {
  BUILD_ID,
  FUNNEL_EVENT_NAMES,
  INGEST_MAX_EVENTS_PER_WINDOW,
  INGEST_WINDOW_MS,
  MAX_BODY_BYTES,
  RESULT_TYPES,
  RETENTION_MS,
  SESSION_MAX_MS,
  SOURCE_TYPES,
  STORAGE_MODES,
  TOOL_PATH_BY_ID,
  UUID_V4
} from "../../shared/funnel-contract.mjs";
import {
  readJsonBody,
  response,
  validateRequestSource
} from "../_shared/analytics-request.js";

function isEnum(value, values) {
  return typeof value === "string" && values.includes(value);
}

export function validatePayload(input, { canary = false } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, status: 400, error: "invalid_payload" };
  }

  const payload = {
    event_id: input.event_id,
    session_id: input.session_id,
    event_name: input.event_name,
    result_type: input.result_type ?? null,
    tool_id: input.tool_id,
    page_path: input.page_path,
    source: input.source,
    storage_mode: input.storage_mode,
    session_age_ms: input.session_age_ms,
    build_id: input.build_id,
    synthetic: input.synthetic === true
  };

  if (!UUID_V4.test(payload.event_id || "") || !UUID_V4.test(payload.session_id || "")) {
    return { ok: false, status: 400, error: "invalid_id" };
  }
  if (!isEnum(payload.event_name, FUNNEL_EVENT_NAMES)) {
    return { ok: false, status: 400, error: "invalid_event" };
  }
  if (payload.event_name === "useful_result") {
    if (!isEnum(payload.result_type, RESULT_TYPES)) {
      return { ok: false, status: 400, error: "invalid_result" };
    }
  } else if (payload.result_type !== null) {
    return { ok: false, status: 400, error: "unexpected_result" };
  }
  if (!Object.hasOwn(TOOL_PATH_BY_ID, payload.tool_id)) {
    return { ok: false, status: 400, error: "invalid_tool" };
  }
  if (payload.page_path !== TOOL_PATH_BY_ID[payload.tool_id]) {
    return { ok: false, status: 400, error: "invalid_path" };
  }
  if (!isEnum(payload.source, SOURCE_TYPES) || !isEnum(payload.storage_mode, STORAGE_MODES)) {
    return { ok: false, status: 400, error: "invalid_session" };
  }
  if (
    !Number.isInteger(payload.session_age_ms) ||
    payload.session_age_ms < 0 ||
    payload.session_age_ms > SESSION_MAX_MS
  ) {
    return { ok: false, status: 400, error: "invalid_session_age" };
  }
  if (!BUILD_ID.test(payload.build_id || "")) {
    return { ok: false, status: 400, error: "invalid_build" };
  }
  if (payload.synthetic && !canary) {
    return { ok: false, status: 403, error: "synthetic_denied" };
  }
  if (payload.synthetic !== (payload.source === "synthetic")) {
    return { ok: false, status: 400, error: "synthetic_source_mismatch" };
  }

  return { ok: true, payload };
}

export async function reserveIngestBudget(db, now = Date.now()) {
  const windowStart = Math.floor(now / INGEST_WINDOW_MS) * INGEST_WINDOW_MS;
  const row = await db
    .prepare(
      `INSERT INTO funnel_ingest_windows (window_start, accepted_events)
       VALUES (?, 1)
       ON CONFLICT(window_start) DO UPDATE SET accepted_events = accepted_events + 1
       WHERE accepted_events < ?
       RETURNING accepted_events`
    )
    .bind(windowStart, INGEST_MAX_EVENTS_PER_WINDOW)
    .first();
  return Boolean(row);
}

export async function writeFunnelEvent(db, payload, now = Date.now()) {
  const startedAt = now - payload.session_age_ms;
  const cutoff = now - RETENTION_MS;
  const session = db
    .prepare(
      `INSERT OR IGNORE INTO funnel_sessions
       (session_id, started_at, source, storage_mode, synthetic)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(payload.session_id, startedAt, payload.source, payload.storage_mode, payload.synthetic ? 1 : 0);
  const event = db
    .prepare(
      `INSERT OR IGNORE INTO funnel_events
       (event_id, session_id, tool_id, event_name, result_type, page_path, build_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      payload.event_id,
      payload.session_id,
      payload.tool_id,
      payload.event_name,
      payload.result_type,
      payload.page_path,
      payload.build_id,
      now
    );
  const retention = db.prepare("DELETE FROM funnel_sessions WHERE started_at < ?").bind(cutoff);
  const windowRetention = db
    .prepare("DELETE FROM funnel_ingest_windows WHERE window_start < ?")
    .bind(now - 2 * INGEST_WINDOW_MS);
  await db.batch([session, event, retention, windowRetention]);
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "POST") return response(405, "method_not_allowed");

  const sourceCheck = validateRequestSource(request, env);
  if (!sourceCheck.ok) return response(sourceCheck.status, sourceCheck.error);
  if (!env.ANALYTICS_DB) return response(503, "database_unavailable");

  let body;
  try {
    body = await readJsonBody(request, MAX_BODY_BYTES);
  } catch {
    return response(400, "body_read_failed");
  }
  if (!body.ok) return response(body.status, body.error);
  const validation = validatePayload(body.value, { canary: sourceCheck.canary });
  if (!validation.ok) return response(validation.status, validation.error);

  try {
    if (!(await reserveIngestBudget(env.ANALYTICS_DB))) return response(429, "rate_limited");
    await writeFunnelEvent(env.ANALYTICS_DB, validation.payload);
    return response(204);
  } catch {
    return response(503, "write_failed");
  }
}
