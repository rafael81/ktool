import { defineConfig } from "astro/config";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";
import { sitemapLastmod } from "./scripts/sitemap-lastmod.mjs";

export default defineConfig({
  site: "https://kdoctool.kr",
  integrations: [
    sitemap({
      serialize(item) {
        const url = new URL(item.url);
        const path = url.pathname;
        const lastmod = sitemapLastmod(path);
        if (path === "/") {
          return { ...item, lastmod, changefreq: ChangeFreqEnum.DAILY, priority: 1 };
        }
        if (path === "/tools/") {
          return { ...item, lastmod, changefreq: ChangeFreqEnum.DAILY, priority: 0.95 };
        }
        if (path === "/problems/") {
          return { ...item, lastmod, changefreq: ChangeFreqEnum.WEEKLY, priority: 0.9 };
        }
        if (path.startsWith("/problems/") || path.startsWith("/workflows/")) {
          return { ...item, lastmod, changefreq: ChangeFreqEnum.WEEKLY, priority: 0.8 };
        }
        if (path.startsWith("/tools/")) {
          const priority =
            path === "/tools/jpg-to-pdf-converter/" ||
            path === "/tools/photo-size-reducer/" ||
            path === "/tools/business-nameplate-maker/" ||
            path === "/tools/transaction-statement-generator/"
              ? 0.9
              : 0.8;
          return { ...item, lastmod, changefreq: ChangeFreqEnum.WEEKLY, priority };
        }
        if (path.startsWith("/categories/")) {
          return { ...item, lastmod, changefreq: ChangeFreqEnum.WEEKLY, priority: 0.85 };
        }
        return { ...item, lastmod, changefreq: ChangeFreqEnum.MONTHLY, priority: 0.7 };
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
