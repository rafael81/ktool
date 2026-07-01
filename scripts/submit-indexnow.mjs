import { readFile } from "node:fs/promises";

const site = "https://k-document-tool.pages.dev";
const host = new URL(site).hostname;
const key = process.env.INDEXNOW_KEY || "7f9e3a1c0d8b4f6a9c2e5d0a1b3c4e6f";
const endpoint = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";
const keyLocation = `${site}/${key}.txt`;
const sitemapPath = new URL("../dist/sitemap-0.xml", import.meta.url);
const isDryRun = process.argv.includes("--dry-run");

function extractUrls(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => match[1])
    .filter((url) => {
      try {
        return new URL(url).hostname === host;
      } catch {
        return false;
      }
    });
}

const sitemap = await readFile(sitemapPath, "utf8").catch((error) => {
  if (error.code === "ENOENT") {
    throw new Error("dist/sitemap-0.xml not found. Run `npm run build` before submitting IndexNow URLs.");
  }
  throw error;
});
const urlList = extractUrls(sitemap);

if (urlList.length === 0) {
  throw new Error("No URLs found in dist/sitemap-0.xml.");
}

const payload = {
  host,
  key,
  keyLocation,
  urlList
};

if (isDryRun) {
  console.log(JSON.stringify({ endpoint, ...payload }, null, 2));
  process.exit(0);
}

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    "content-type": "application/json; charset=utf-8"
  },
  body: JSON.stringify(payload)
});
const body = await response.text();

console.log(
  JSON.stringify(
    {
      endpoint,
      status: response.status,
      ok: response.ok,
      submitted: urlList.length,
      response: body.trim()
    },
    null,
    2
  )
);

if (![200, 202].includes(response.status)) {
  process.exitCode = 1;
}
