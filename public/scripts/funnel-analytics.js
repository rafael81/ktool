(() => {
  "use strict";

  const SESSION_KEY = "kdoc_funnel_session_v1";
  const ACTIVITY_WRITE_INTERVAL_MS = 60_000;
  const NAVER_SEARCH_HOSTS = new Set(["search.naver.com", "m.search.naver.com"]);
  const GOOGLE_SEARCH_HOSTS = new Set([
    "google.com",
    "www.google.com",
    "google.co.kr",
    "www.google.co.kr",
    "google.co.jp",
    "www.google.co.jp"
  ]);
  const OTHER_SEARCH_HOSTS = new Set([
    "bing.com",
    "www.bing.com",
    "cn.bing.com",
    "search.daum.net",
    "search.yahoo.com",
    "search.yahoo.co.jp",
    "duckduckgo.com",
    "html.duckduckgo.com",
    "lite.duckduckgo.com"
  ]);

  function uuidV4(cryptoApi = window.crypto) {
    if (typeof cryptoApi?.randomUUID === "function") return cryptoApi.randomUUID();
    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((value) => value.toString(16).padStart(2, "0"));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
      .slice(6, 8)
      .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
  }

  function classifySource(referrer, currentOrigin) {
    if (!referrer) return "direct";
    try {
      const url = new URL(referrer);
      const hostname = url.hostname.toLowerCase();
      if (NAVER_SEARCH_HOSTS.has(hostname)) return "naver";
      if (GOOGLE_SEARCH_HOSTS.has(hostname)) return "google";
      if (OTHER_SEARCH_HOSTS.has(hostname)) return "search_other";
      if (url.origin === currentOrigin) return "internal";
      return "referral";
    } catch {
      return "unknown";
    }
  }

  function privacySignalEnabled(navigatorApi = window.navigator, windowApi = window) {
    return (
      navigatorApi?.globalPrivacyControl === true ||
      navigatorApi?.doNotTrack === "1" ||
      windowApi?.doNotTrack === "1"
    );
  }

  function normalizeEvent(detail, config) {
    if (!detail || typeof detail !== "object") return null;
    const toolId = detail.tool_id;
    const pagePath = detail.page_path;
    if (!toolId || config.toolPaths?.[toolId] !== pagePath) return null;

    if (detail.event === "page_view") {
      return { tool_id: toolId, page_path: pagePath, event_name: "tool_view", result_type: null };
    }
    if (detail.event === "tool_start") {
      return { tool_id: toolId, page_path: pagePath, event_name: "tool_start", result_type: null };
    }
    const resultType = config.resultEvents?.[detail.event];
    if (resultType) {
      return {
        tool_id: toolId,
        page_path: pagePath,
        event_name: "useful_result",
        result_type: resultType
      };
    }
    return null;
  }

  function isSessionRecord(record, now, idleMs, maxMs) {
    return Boolean(
      record &&
        typeof record === "object" &&
        typeof record.sessionId === "string" &&
        Number.isFinite(record.startedAt) &&
        Number.isFinite(record.lastSeenAt) &&
        now >= record.startedAt &&
        now - record.lastSeenAt <= idleMs &&
        now - record.startedAt <= maxMs
    );
  }

  function createSessionStore({
    storage,
    source,
    idleMs,
    maxMs,
    forceNew = false,
    now = () => Date.now(),
    createId = () => uuidV4()
  }) {
    let memoryRecord = null;
    let storageAvailable = Boolean(storage);
    let shouldForceNew = forceNew;

    function readStored() {
      if (!storageAvailable) return memoryRecord;
      try {
        const value = storage.getItem(SESSION_KEY);
        return value ? JSON.parse(value) : null;
      } catch {
        storageAvailable = false;
        return memoryRecord;
      }
    }

    function writeStored(record) {
      if (storageAvailable) {
        try {
          storage.setItem(SESSION_KEY, JSON.stringify(record));
          return "session";
        } catch {
          storageAvailable = false;
        }
      }
      memoryRecord = record;
      return "memory";
    }

    function current() {
      const timestamp = now();
      let record = readStored();
      if (shouldForceNew || !isSessionRecord(record, timestamp, idleMs, maxMs)) {
        record = {
          sessionId: createId(),
          source,
          startedAt: timestamp,
          lastSeenAt: timestamp
        };
      } else {
        record.lastSeenAt = timestamp;
      }
      shouldForceNew = false;
      const storageMode = writeStored(record);
      return { ...record, storageMode };
    }

    return { current };
  }

  function copiedSameOriginOpener(windowApi = window) {
    let copied = false;
    try {
      copied = Boolean(
        windowApi.opener && windowApi.opener.location?.origin === windowApi.location?.origin
      );
    } catch {
      copied = false;
    }
    try {
      if (windowApi.opener) windowApi.opener = null;
    } catch {
      // A cross-origin opener cannot share this origin's sessionStorage.
    }
    return copied;
  }

  function createStageTracker({ sessions, send }) {
    const attemptedStages = new Set();

    function attemptStage(event, session) {
      const key = `${session.sessionId}:${event.tool_id}:${event.event_name}`;
      if (attemptedStages.has(key)) return;
      attemptedStages.add(key);
      send(event, session);
    }

    function attempt(event) {
      const session = sessions.current();
      if (event.event_name !== "tool_view") {
        attemptStage({ ...event, event_name: "tool_view", result_type: null }, session);
      }
      if (event.event_name === "useful_result") {
        attemptStage({ ...event, event_name: "tool_start", result_type: null }, session);
      }
      attemptStage(event, session);
    }

    return { attempt };
  }

  const testApi = Object.freeze({
    classifySource,
    copiedSameOriginOpener,
    createSessionStore,
    createStageTracker,
    isSessionRecord,
    normalizeEvent,
    privacySignalEnabled,
    uuidV4
  });
  Object.defineProperty(window, "__KDOC_FUNNEL_TEST__", { value: testApi, configurable: true });

  const config = window.__KDOC_FUNNEL_CONFIG__;
  if (!config || privacySignalEnabled()) return;
  if (!/^[0-9a-f]{7,40}$/i.test(config.buildId || "")) return;

  let storage = null;
  try {
    storage = window.sessionStorage;
  } catch {
    storage = null;
  }

  const source = classifySource(document.referrer, window.location.origin);
  const sessions = createSessionStore({
    storage,
    source,
    idleMs: config.sessionIdleMs,
    maxMs: config.sessionMaxMs,
    forceNew: copiedSameOriginOpener()
  });

  function deliver(event, session) {
    const payload = {
      event_id: uuidV4(),
      session_id: session.sessionId,
      event_name: event.event_name,
      result_type: event.result_type,
      tool_id: event.tool_id,
      page_path: event.page_path,
      source: session.source,
      storage_mode: session.storageMode,
      session_age_ms: Math.max(0, Math.min(config.sessionMaxMs, Date.now() - session.startedAt)),
      build_id: config.buildId,
      synthetic: false
    };

    try {
      Promise.resolve(
        window.fetch(config.endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "same-origin",
          keepalive: true
        })
      ).catch(() => {});
    } catch {
      // Analytics is fail-open: tool behavior must never depend on delivery.
    }
  }

  const stages = createStageTracker({ sessions, send: deliver });

  window.addEventListener("kdoc:analytics", (customEvent) => {
    const event = normalizeEvent(customEvent.detail, config);
    if (!event) return;
    stages.attempt(event);
  });

  let lastActivityWrite = 0;
  const touchSession = () => {
    const timestamp = Date.now();
    if (timestamp - lastActivityWrite < ACTIVITY_WRITE_INTERVAL_MS) return;
    lastActivityWrite = timestamp;
    sessions.current();
  };
  document.addEventListener("click", touchSession, { capture: true, passive: true });
  document.addEventListener("input", touchSession, { capture: true, passive: true });
  document.addEventListener("keydown", touchSession, { capture: true, passive: true });
})();
