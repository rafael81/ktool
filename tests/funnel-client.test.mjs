import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { webcrypto } from "node:crypto";

function loadClientApi() {
  const window = {
    crypto: webcrypto,
    location: { origin: "https://k-document-tool.pages.dev" },
    navigator: {}
  };
  vm.runInNewContext(readFileSync("public/scripts/funnel-analytics.js", "utf8"), {
    URL,
    Uint8Array,
    window
  });
  return window.__KDOC_FUNNEL_TEST__;
}

const api = loadClientApi();

test("classifies referrers without retaining their URL", () => {
  const origin = "https://k-document-tool.pages.dev";
  assert.equal(api.classifySource("https://search.naver.com/search.naver?query=secret", origin), "naver");
  assert.equal(api.classifySource("https://www.google.co.kr/search?q=secret", origin), "google");
  assert.equal(api.classifySource("https://www.bing.com/search?q=secret", origin), "search_other");
  assert.equal(api.classifySource("https://blog.naver.com/example", origin), "referral");
  assert.equal(api.classifySource("https://drive.google.com/file/d/example", origin), "referral");
  assert.equal(api.classifySource("https://google.evil.example/search?q=secret", origin), "referral");
  assert.equal(api.classifySource(`${origin}/tools/`, origin), "internal");
  assert.equal(api.classifySource("https://example.com/article", origin), "referral");
  assert.equal(api.classifySource("", origin), "direct");
  assert.equal(api.classifySource("not a url", origin), "unknown");
});

test("normalizes only exact tool stages and explicit result events", () => {
  const config = {
    toolPaths: { "vat-calculator": "/tools/vat-calculator/" },
    resultEvents: { calculator_copy: "copy" }
  };
  const base = { tool_id: "vat-calculator", page_path: "/tools/vat-calculator/" };
  assert.deepEqual(
    { ...api.normalizeEvent({ ...base, event: "page_view" }, config) },
    { ...base, event_name: "tool_view", result_type: null }
  );
  assert.deepEqual(
    { ...api.normalizeEvent({ ...base, event: "calculator_copy" }, config) },
    { ...base, event_name: "useful_result", result_type: "copy" }
  );
  assert.equal(api.normalizeEvent({ ...base, event: "calculator_copy_error" }, config), null);
  assert.equal(api.normalizeEvent({ ...base, page_path: "/wrong/", event: "page_view" }, config), null);
  assert.equal(api.normalizeEvent({ ...base, tool_id: "unknown", event: "page_view" }, config), null);
});

test("normalizes feedback without accepting extra detail on positive ratings", () => {
  const config = {
    toolPaths: { "vat-calculator": "/tools/vat-calculator/" },
    feedbackRatings: ["helpful", "not_helpful"],
    feedbackReasons: ["hard_to_use", "error"],
    feedbackContexts: ["completion", "manual"],
    feedbackMaxCommentLength: 200
  };
  const base = {
    tool_id: "vat-calculator",
    page_path: "/tools/vat-calculator/",
    feedback_context: "completion"
  };
  assert.deepEqual(
    { ...api.normalizeFeedbackInput({ ...base, rating: "helpful", reason: null, comment: null }, config) },
    { ...base, rating: "helpful", reason: null, comment: null }
  );
  assert.equal(
    api.normalizeFeedbackInput({ ...base, rating: "helpful", reason: "error" }, config),
    null
  );
  assert.deepEqual(
    {
      ...api.normalizeFeedbackInput(
        { ...base, rating: "not_helpful", reason: "hard_to_use", comment: "  어려워요  " },
        config
      )
    },
    { ...base, rating: "not_helpful", reason: "hard_to_use", comment: "어려워요" }
  );
  assert.equal(
    api.normalizeFeedbackInput({ ...base, rating: "not_helpful", reason: "unknown" }, config),
    null
  );
});

test("sends feedback with the current anonymous session only", async () => {
  const requests = [];
  const config = {
    feedbackEndpoint: "/api/tool-feedback",
    buildId: "abcdef012345",
    sessionMaxMs: 10_000,
    toolPaths: { "vat-calculator": "/tools/vat-calculator/" },
    feedbackRatings: ["helpful", "not_helpful"],
    feedbackReasons: ["error"],
    feedbackContexts: ["completion", "manual"],
    feedbackMaxCommentLength: 200
  };
  const sender = api.createFeedbackSender({
    sessions: {
      current: () => ({
        sessionId: "223e4567-e89b-42d3-a456-426614174001",
        source: "naver",
        storageMode: "session",
        startedAt: Date.now() - 100
      })
    },
    config,
    fetchApi: async (url, options) => {
      requests.push({ url, options, body: JSON.parse(options.body) });
      return { ok: true, status: 204 };
    }
  });
  await sender.submit({
    tool_id: "vat-calculator",
    page_path: "/tools/vat-calculator/",
    rating: "not_helpful",
    reason: "error",
    comment: "계산이 안 돼요",
    feedback_context: "manual"
  });
  assert.equal(requests[0].url, "/api/tool-feedback");
  assert.deepEqual(Object.keys(requests[0].body).sort(), [
    "build_id",
    "comment",
    "feedback_context",
    "page_path",
    "rating",
    "reason",
    "session_age_ms",
    "session_id",
    "source",
    "storage_mode",
    "tool_id"
  ]);
  assert.equal(requests[0].body.source, "naver");
});

test("rotates a tab session after idle and absolute expiry", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value)
  };
  let now = 1_000;
  let nextId = 0;
  const sessions = api.createSessionStore({
    storage,
    source: "naver",
    idleMs: 30 * 60 * 1_000,
    maxMs: 4 * 60 * 60 * 1_000,
    now: () => now,
    createId: () => `session-${++nextId}`
  });

  const first = sessions.current();
  assert.equal(first.sessionId, "session-1");
  assert.equal(first.storageMode, "session");
  now += 10 * 60 * 1_000;
  assert.equal(sessions.current().sessionId, "session-1");
  now += 31 * 60 * 1_000;
  assert.equal(sessions.current().sessionId, "session-2");
  now += 4 * 60 * 60 * 1_000 + 1;
  assert.equal(sessions.current().sessionId, "session-3");
});

test("uses memory when sessionStorage is unavailable", () => {
  let now = 1_000;
  const sessions = api.createSessionStore({
    storage: {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      }
    },
    source: "direct",
    idleMs: 30 * 60 * 1_000,
    maxMs: 4 * 60 * 60 * 1_000,
    now: () => now,
    createId: () => "session-memory"
  });
  assert.equal(sessions.current().storageMode, "memory");
  now += 1_000;
  assert.equal(sessions.current().sessionId, "session-memory");
});

test("forces a fresh session when a tab inherits sessionStorage", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value)
  };
  const firstStore = api.createSessionStore({
    storage,
    source: "naver",
    idleMs: 1_000,
    maxMs: 10_000,
    now: () => 100,
    createId: () => "session-original"
  });
  assert.equal(firstStore.current().sessionId, "session-original");

  const copiedStore = api.createSessionStore({
    storage,
    source: "direct",
    idleMs: 1_000,
    maxMs: 10_000,
    forceNew: true,
    now: () => 200,
    createId: () => "session-copied-tab"
  });
  const copied = copiedStore.current();
  assert.equal(copied.sessionId, "session-copied-tab");
  assert.equal(copied.source, "direct");
});

test("detects a same-origin opener without leaking state through window.name", () => {
  const sameOrigin = {
    location: { origin: "https://k-document-tool.pages.dev" },
    opener: { location: { origin: "https://k-document-tool.pages.dev" } }
  };
  assert.equal(api.copiedSameOriginOpener(sameOrigin), true);
  assert.equal(sameOrigin.opener, null);

  const crossOriginOpener = {};
  Object.defineProperty(crossOriginOpener, "location", {
    get() {
      throw new Error("cross-origin");
    }
  });
  const crossOrigin = {
    location: { origin: "https://k-document-tool.pages.dev" },
    opener: crossOriginOpener
  };
  assert.equal(api.copiedSameOriginOpener(crossOrigin), false);
  assert.equal(crossOrigin.opener, null);
});

test("replays prerequisite stages after session rotation", () => {
  let session = {
    sessionId: "session-a",
    source: "naver",
    startedAt: 100,
    storageMode: "session"
  };
  const sent = [];
  const tracker = api.createStageTracker({
    sessions: { current: () => session },
    send: (event, currentSession) => sent.push(`${currentSession.sessionId}:${event.event_name}`)
  });
  const base = { tool_id: "vat-calculator", page_path: "/tools/vat-calculator/", result_type: null };

  tracker.attempt({ ...base, event_name: "tool_start" });
  tracker.attempt({ ...base, event_name: "tool_start" });
  assert.deepEqual(sent, ["session-a:tool_view", "session-a:tool_start"]);

  session = { ...session, sessionId: "session-b" };
  tracker.attempt({ ...base, event_name: "useful_result", result_type: "copy" });
  assert.deepEqual(sent.slice(2), [
    "session-b:tool_view",
    "session-b:tool_start",
    "session-b:useful_result"
  ]);
});

test("honors GPC and DNT privacy signals", () => {
  assert.equal(api.privacySignalEnabled({ globalPrivacyControl: true }, {}), true);
  assert.equal(api.privacySignalEnabled({ doNotTrack: "1" }, {}), true);
  assert.equal(api.privacySignalEnabled({}, { doNotTrack: "1" }), true);
  assert.equal(api.privacySignalEnabled({ doNotTrack: "0" }, {}), false);
});
