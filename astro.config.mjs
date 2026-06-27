import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://k-document-tool.pages.dev",
  integrations: [sitemap()],
  output: "static",
  devToolbar: {
    enabled: false
  }
});
