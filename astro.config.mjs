import { defineConfig } from "astro/config";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";

const lastmod = new Date("2026-07-02T00:00:00+09:00");

export default defineConfig({
  site: "https://k-document-tool.pages.dev",
  integrations: [
    sitemap({
      lastmod,
      serialize(item) {
        const url = new URL(item.url);
        const path = url.pathname;
        if (path === "/") {
          return { ...item, changefreq: ChangeFreqEnum.DAILY, priority: 1 };
        }
        if (path === "/tools/") {
          return { ...item, changefreq: ChangeFreqEnum.DAILY, priority: 0.95 };
        }
        if (path === "/problems/") {
          return { ...item, changefreq: ChangeFreqEnum.WEEKLY, priority: 0.9 };
        }
        if (path.startsWith("/problems/") || path.startsWith("/workflows/")) {
          return { ...item, changefreq: ChangeFreqEnum.WEEKLY, priority: 0.8 };
        }
        if (path.startsWith("/tools/")) {
          const priority =
            path === "/tools/jpg-to-pdf-converter/" ||
            path === "/tools/photo-size-reducer/" ||
            path === "/tools/business-nameplate-maker/" ||
            path === "/tools/transaction-statement-generator/"
              ? 0.9
              : 0.8;
          return { ...item, changefreq: ChangeFreqEnum.WEEKLY, priority };
        }
        if (path.startsWith("/categories/")) {
          return { ...item, changefreq: ChangeFreqEnum.WEEKLY, priority: 0.85 };
        }
        return { ...item, changefreq: ChangeFreqEnum.MONTHLY, priority: 0.7 };
      }
    })
  ],
  output: "static",
  vite: {
    optimizeDeps: {
      include: ["pdf-lib", "heic-to/csp"]
    }
  },
  devToolbar: {
    enabled: false
  }
});
