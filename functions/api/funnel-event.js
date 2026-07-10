import {
  FUNNEL_EVENT_NAMES,
  INGEST_MAX_EVENTS_PER_WINDOW,
  INGEST_WINDOW_MS,
  MAX_BODY_BYTES,
  RESULT_TYPES,
  RETENTION_MS,
  SESSION_MAX_MS,
  SOURCE_TYPES,
  STORAGE_MODES,
  TOOL_PATH_BY_ID
} from "../../shared/funnel-contract.mjs";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BUILD_ID = /^[0-9a-f]{7,40}$/i;
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

function response(status, error) {
  if (!error) return new Response(null, { status });
  return new Response(JSON.stringify({ error }), { status, headers: JSON_HEADERS });
}
function parseOrigin(value) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return "invalid";
  }
}

export function validateRequestSource(request, env = {}) {
  const requestOrigin = new URL(request.url).origin;
  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");
  const origin = parseOrigin(originHeader);
  const refererOrigin = parseOrigin(refererHeader);
  const fetchSite = request.headers.get("sec-fetch-site");
  const canaryKey = request.headers.get("x-kdoc-canary-key");
  const canary = Boolean(
    env.ANALYTICS_CANARY_KEY &&
      canaryKey &&
      canaryKey.length === env.ANALYTICS_CANARY_KEY.length &&
      canaryKey === env.ANALYTICS_CANARY_KEY
  );

  if (canary) return { ok: true, canary: true };
  if (!origin && !refererOrigin) return { ok: false, status: 403, error: "source_required" };
  if (origin === "invalid" || refererOrigin === "invalid") {
    return { ok: false, status: 403, error: "source_invalid" };
  }
  if (origin && origin !== requestOrigin) return { ok: false, status: 403, error: "origin_denied" };
  if (refererOrigin && refererOrigin !== requestOrigin) {
    return { ok: false, status: 403, error: "referer_denied" };
  }
  if (fetchSite && fetchSite !== "same-origin") {
    return { ok: false, status: 403, error: "fetch_site_denied" };
  }
  return { ok: true, canary: false };
}

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

async function readBodyText(request) {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

async function readJsonBody(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return { ok: false, status: 415, error: "json_required" };
  }
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: "body_too_large" };
  }
  const text = await readBodyText(request);
  if (text === null) {
    return { ok: false, status: 413, error: "body_too_large" };
  }
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400, error: "invalid_json" };
  }
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
    body = await readJsonBody(request);
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
