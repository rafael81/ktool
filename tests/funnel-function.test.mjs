import assert from "node:assert/strict";
import test from "node:test";
import { onRequest, validatePayload } from "../functions/api/funnel-event.js";

const endpoint = "https://k-document-tool.pages.dev/api/funnel-event";
const validPayload = {
  event_id: "123e4567-e89b-42d3-a456-426614174000",
  session_id: "223e4567-e89b-42d3-a456-426614174001",
  event_name: "tool_view",
  result_type: null,
  tool_id: "vat-calculator",
  page_path: "/tools/vat-calculator/",
  source: "naver",
  storage_mode: "session",
  session_age_ms: 1_000,
  build_id: "abcdef012345",
  synthetic: false
};

function request(payload = validPayload, headers = {}) {
  return new Request(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://k-document-tool.pages.dev",
      "sec-fetch-site": "same-origin",
      ...headers
    },
    body: JSON.stringify(payload)
  });
}

function mockDatabase({ fail = false, rateLimited = false } = {}) {
  const statements = [];
  return {
    statements,
    prepare(sql) {
      const statement = {
        sql,
        values: [],
        bind(...values) {
          this.values = values;
          return this;
        },
        async first() {
          if (fail) throw new Error("D1 unavailable");
          return rateLimited ? null : { accepted_events: 1 };
        }
      };
      statements.push(statement);
      return statement;
    },
    async batch(batch) {
      assert.equal(batch.length, 4);
      if (fail) throw new Error("D1 unavailable");
      return batch.map(() => ({ success: true }));
    }
  };
}

test("accepts a same-origin event and uses prepared statements", async () => {
  const db = mockDatabase();
  const response = await onRequest({ request: request(), env: { ANALYTICS_DB: db } });
  assert.equal(response.status, 204);
  assert.equal(db.statements.length, 5);
  assert.match(db.statements[0].sql, /INSERT INTO funnel_ingest_windows/);
  assert.match(db.statements[1].sql, /INSERT OR IGNORE INTO funnel_sessions/);
  assert.match(db.statements[2].sql, /INSERT OR IGNORE INTO funnel_events/);
  assert.deepEqual(db.statements[2].values.slice(0, 4), [
    validPayload.event_id,
    validPayload.session_id,
    validPayload.tool_id,
    validPayload.event_name
  ]);
});

test("rejects cross-origin, missing-source, and wrong-method requests", async () => {
  const db = mockDatabase();
  const crossOrigin = await onRequest({
    request: request(validPayload, { origin: "https://example.com" }),
    env: { ANALYTICS_DB: db }
  });
  assert.equal(crossOrigin.status, 403);

  const missingSourceRequest = new Request(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(validPayload)
  });
  assert.equal(
    (await onRequest({ request: missingSourceRequest, env: { ANALYTICS_DB: db } })).status,
    403
  );
  assert.equal(
    (await onRequest({ request: new Request(endpoint), env: { ANALYTICS_DB: db } })).status,
    405
  );
});

test("accepts a same-origin Referer fallback and rejects conflicting browser metadata", async () => {
  const refererOnly = new Request(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      referer: "https://k-document-tool.pages.dev/tools/vat-calculator/",
      "sec-fetch-site": "same-origin"
    },
    body: JSON.stringify(validPayload)
  });
  assert.equal(
    (await onRequest({ request: refererOnly, env: { ANALYTICS_DB: mockDatabase() } })).status,
    204
  );

  const conflicting = request(validPayload, { referer: "https://example.com/path" });
  assert.equal(
    (await onRequest({ request: conflicting, env: { ANALYTICS_DB: mockDatabase() } })).status,
    403
  );
  const crossSiteMetadata = request(validPayload, { "sec-fetch-site": "cross-site" });
  assert.equal(
    (await onRequest({ request: crossSiteMetadata, env: { ANALYTICS_DB: mockDatabase() } })).status,
    403
  );
});

test("rejects invalid schemas and strips unknown fields", () => {
  assert.equal(validatePayload({ ...validPayload, event_name: "unknown" }).ok, false);
  assert.equal(validatePayload({ ...validPayload, page_path: "/wrong/" }).ok, false);
  assert.equal(validatePayload({ ...validPayload, build_id: "dev" }).ok, false);
  assert.equal(validatePayload({ ...validPayload, synthetic: true, source: "synthetic" }).status, 403);

  const withUnknown = validatePayload({ ...validPayload, file_name: "secret.pdf", raw_value: "secret" });
  assert.equal(withUnknown.ok, true);
  assert.equal(Object.hasOwn(withUnknown.payload, "file_name"), false);
  assert.equal(Object.hasOwn(withUnknown.payload, "raw_value"), false);
});

test("requires a matching result type for useful results", () => {
  assert.equal(
    validatePayload({ ...validPayload, event_name: "useful_result", result_type: "download" }).ok,
    true
  );
  assert.equal(validatePayload({ ...validPayload, event_name: "useful_result" }).ok, false);
  assert.equal(validatePayload({ ...validPayload, result_type: "copy" }).ok, false);
});

test("allows authenticated synthetic canaries only", async () => {
  const db = mockDatabase();
  const payload = { ...validPayload, synthetic: true, source: "synthetic" };
  const canaryRequest = new Request(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-kdoc-canary-key": "canary-secret"
    },
    body: JSON.stringify(payload)
  });
  const response = await onRequest({
    request: canaryRequest,
    env: { ANALYTICS_DB: db, ANALYTICS_CANARY_KEY: "canary-secret" }
  });
  assert.equal(response.status, 204);
  assert.equal(db.statements[1].values.at(-1), 1);
});

test("caps declared and streamed request bodies", async () => {
  const oversized = request(validPayload, { "content-length": "4096" });
  assert.equal((await onRequest({ request: oversized, env: { ANALYTICS_DB: mockDatabase() } })).status, 413);

  const streamedOversized = new Request(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://k-document-tool.pages.dev",
      "sec-fetch-site": "same-origin"
    },
    body: "x".repeat(4096)
  });
  assert.equal(streamedOversized.headers.get("content-length"), null);
  assert.equal(
    (await onRequest({ request: streamedOversized, env: { ANALYTICS_DB: mockDatabase() } })).status,
    413
  );
});

test("rejects malformed bodies and applies the shared ingest budget", async () => {
  const malformed = new Request(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://k-document-tool.pages.dev"
    },
    body: "{"
  });
  assert.equal((await onRequest({ request: malformed, env: { ANALYTICS_DB: mockDatabase() } })).status, 400);
  assert.equal(
    (await onRequest({ request: request(), env: { ANALYTICS_DB: mockDatabase({ rateLimited: true }) } })).status,
    429
  );
});

test("returns a service error when D1 is unavailable", async () => {
  assert.equal((await onRequest({ request: request(), env: {} })).status, 503);
  assert.equal(
    (await onRequest({ request: request(), env: { ANALYTICS_DB: mockDatabase({ fail: true }) } })).status,
    503
  );
});
