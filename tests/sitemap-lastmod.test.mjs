import assert from "node:assert/strict";
import test from "node:test";

import { routeContentFiles, sitemapLastmod } from "../scripts/sitemap-lastmod.mjs";

const existingFiles = new Set([
  "src/pages/index.astro",
  "src/pages/tools/index.astro",
  "src/pages/tools/jpg-to-pdf-converter.astro",
  "src/pages/privacy.astro",
  "src/data/tools.ts",
  "src/data/seo.ts"
]);
const fileExists = (file) => existingFiles.has(file);

test("maps homepage, directory, and tool routes to their source files", () => {
  assert.deepEqual(routeContentFiles("/", { fileExists }), [
    "src/pages/index.astro",
    "src/data/tools.ts",
    "src/data/seo.ts"
  ]);
  assert.deepEqual(routeContentFiles("/tools/", { fileExists }), [
    "src/pages/tools/index.astro",
    "src/data/tools.ts",
    "src/data/seo.ts"
  ]);
  assert.deepEqual(routeContentFiles("/tools/jpg-to-pdf-converter/", { fileExists }), [
    "src/pages/tools/jpg-to-pdf-converter.astro",
    "src/data/tools.ts",
    "src/data/seo.ts"
  ]);
  assert.deepEqual(routeContentFiles("/privacy/", { fileExists }), ["src/pages/privacy.astro"]);
});

test("uses a validated git date for sitemap lastmod", () => {
  const date = sitemapLastmod("/tools/jpg-to-pdf-converter/", {
    fileExists,
    gitDate: "2026-07-10T19:20:12+09:00"
  });
  assert.equal(date.toISOString(), "2026-07-10T10:20:12.000Z");
});

test("rejects a route when no source or fallback date can be established", () => {
  assert.throws(
    () =>
      sitemapLastmod("/missing/", {
        fileExists: () => false,
        gitDate: null,
        fallbackDate: null
      }),
    /Unable to determine sitemap lastmod/
  );
});
