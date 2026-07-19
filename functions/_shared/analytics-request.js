const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

export function response(status, error) {
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

async function readBodyText(request, maxBytes) {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
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

export async function readJsonBody(request, maxBytes) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return { ok: false, status: 415, error: "json_required" };
  }
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > maxBytes) {
    return { ok: false, status: 413, error: "body_too_large" };
  }
  const text = await readBodyText(request, maxBytes);
  if (text === null) {
    return { ok: false, status: 413, error: "body_too_large" };
  }
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400, error: "invalid_json" };
  }
}
