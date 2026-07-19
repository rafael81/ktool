import {
  FEEDBACK_CONTEXTS,
  FEEDBACK_INGEST_MAX_PER_WINDOW,
  FEEDBACK_INGEST_WINDOW_MS,
  FEEDBACK_MAX_BODY_BYTES,
  FEEDBACK_MAX_COMMENT_LENGTH,
  FEEDBACK_RATINGS,
  FEEDBACK_REASONS
} from "../../shared/feedback-contract.mjs";
import {
  BUILD_ID,
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

export function validateFeedbackPayload(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, status: 400, error: "invalid_payload" };
  }

  const comment = typeof input.comment === "string" ? input.comment.trim() : "";
  const payload = {
    session_id: input.session_id,
    tool_id: input.tool_id,
    page_path: input.page_path,
    source: input.source,
    storage_mode: input.storage_mode,
    session_age_ms: input.session_age_ms,
    build_id: input.build_id,
    rating: input.rating,
    reason: input.reason ?? null,
    comment: comment || null,
    feedback_context: input.feedback_context
  };

  if (!UUID_V4.test(payload.session_id || "")) {
    return { ok: false, status: 400, error: "invalid_id" };
  }
  if (!Object.hasOwn(TOOL_PATH_BY_ID, payload.tool_id)) {
    return { ok: false, status: 400, error: "invalid_tool" };
  }
  if (payload.page_path !== TOOL_PATH_BY_ID[payload.tool_id]) {
    return { ok: false, status: 400, error: "invalid_path" };
  }
  if (!isEnum(payload.source, SOURCE_TYPES.filter((source) => source !== "synthetic"))) {
    return { ok: false, status: 400, error: "invalid_source" };
  }
  if (!isEnum(payload.storage_mode, STORAGE_MODES)) {
    return { ok: false, status: 400, error: "invalid_storage" };
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
  if (!isEnum(payload.rating, FEEDBACK_RATINGS)) {
    return { ok: false, status: 400, error: "invalid_rating" };
  }
  if (!isEnum(payload.feedback_context, FEEDBACK_CONTEXTS)) {
    return { ok: false, status: 400, error: "invalid_context" };
  }
  if (payload.rating === "helpful" && (payload.reason !== null || payload.comment !== null)) {
    return { ok: false, status: 400, error: "unexpected_detail" };
  }
  if (payload.rating === "not_helpful" && !isEnum(payload.reason, FEEDBACK_REASONS)) {
    return { ok: false, status: 400, error: "reason_required" };
  }
  if (payload.comment && payload.comment.length > FEEDBACK_MAX_COMMENT_LENGTH) {
    return { ok: false, status: 400, error: "comment_too_long" };
  }

  return { ok: true, payload };
}

export async function reserveFeedbackBudget(db, now = Date.now()) {
  const windowStart = Math.floor(now / FEEDBACK_INGEST_WINDOW_MS) * FEEDBACK_INGEST_WINDOW_MS;
  const row = await db
    .prepare(
      `INSERT INTO feedback_ingest_windows (window_start, accepted_feedback)
       VALUES (?, 1)
       ON CONFLICT(window_start) DO UPDATE SET accepted_feedback = accepted_feedback + 1
       WHERE accepted_feedback < ?
       RETURNING accepted_feedback`
    )
    .bind(windowStart, FEEDBACK_INGEST_MAX_PER_WINDOW)
    .first();
  return Boolean(row);
}

export async function writeToolFeedback(db, payload, now = Date.now()) {
  const feedback = db
    .prepare(
      `INSERT INTO tool_feedback
       (session_id, tool_id, page_path, source, rating, reason, comment, feedback_context, build_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(session_id, tool_id) DO UPDATE SET
         rating = excluded.rating,
         reason = excluded.reason,
         comment = excluded.comment,
         feedback_context = excluded.feedback_context,
         build_id = excluded.build_id,
         updated_at = excluded.updated_at`
    )
    .bind(
      payload.session_id,
      payload.tool_id,
      payload.page_path,
      payload.source,
      payload.rating,
      payload.reason,
      payload.comment,
      payload.feedback_context,
      payload.build_id,
      now,
      now
    );
  const retention = db.prepare("DELETE FROM tool_feedback WHERE updated_at < ?").bind(now - RETENTION_MS);
  const windowRetention = db
    .prepare("DELETE FROM feedback_ingest_windows WHERE window_start < ?")
    .bind(now - 2 * FEEDBACK_INGEST_WINDOW_MS);
  await db.batch([feedback, retention, windowRetention]);
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "POST") return response(405, "method_not_allowed");

  const sourceCheck = validateRequestSource(request, env);
  if (!sourceCheck.ok) return response(sourceCheck.status, sourceCheck.error);
  if (!env.ANALYTICS_DB) return response(503, "database_unavailable");

  let body;
  try {
    body = await readJsonBody(request, FEEDBACK_MAX_BODY_BYTES);
  } catch {
    return response(400, "body_read_failed");
  }
  if (!body.ok) return response(body.status, body.error);
  const validation = validateFeedbackPayload(body.value);
  if (!validation.ok) return response(validation.status, validation.error);

  try {
    if (!(await reserveFeedbackBudget(env.ANALYTICS_DB))) return response(429, "rate_limited");
    await writeToolFeedback(env.ANALYTICS_DB, validation.payload);
    return response(204);
  } catch {
    return response(503, "write_failed");
  }
}
