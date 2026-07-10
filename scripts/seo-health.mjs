const defaultSite = "https://k-document-tool.pages.dev";
const args = new Set(process.argv.slice(2));
const siteArg = process.argv.find((arg) => arg.startsWith("--site="));
const site = new URL(siteArg?.slice("--site=".length) || process.env.SITE_URL || defaultSite);
site.pathname = "/";
site.search = "";
site.hash = "";

const origin = site.origin;
const jsonOutput = args.has("--json");
const userAgent = "KDocumentToolSEOHealth/1.0";
const failures = [];
const warnings = [];

function fail(message, detail = {}) {
  failures.push({ message, ...detail });
}

function warn(message, detail = {}) {
  warnings.push({ message, ...detail });
}

function siteUrl(path = "/") {
  return new URL(path, origin).toString();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": userAgent,
      accept: "text/html,application/xml,text/xml,text/plain,*/*"
    },
    redirect: "follow"
  });
  const text = await response.text();
  return {
    url,
    finalUrl: response.url,
    status: response.status,
    ok: response.ok,
    contentType: response.headers.get("content-type") || "",
    text
  };
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => match[1].trim());
}

function extractPageEntries(xml) {
  return [...xml.matchAll(/<url>\s*([\s\S]*?)\s*<\/url>/g)].map((match) => {
    const body = match[1];
    return {
      loc: body.match(/<loc>\s*([^<]+?)\s*<\/loc>/)?.[1]?.trim() || "",
      lastmod: body.match(/<lastmod>\s*([^<]+?)\s*<\/lastmod>/)?.[1]?.trim() || ""
    };
  });
}

function extractCanonical(html) {
  const linkTags = html.match(/<link\b[^>]*>/gi) || [];
  const canonicalTag = linkTags.find((tag) => /\brel=["'][^"']*\bcanonical\b[^"']*["']/i.test(tag));
  return canonicalTag?.match(/\bhref=["']([^"']+)["']/i)?.[1] || "";
}

function extractRobotsMeta(html) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];
  const robotsTag = metaTags.find((tag) => /\bname=["']robots["']/i.test(tag));
  return robotsTag?.match(/\bcontent=["']([^"']+)["']/i)?.[1] || "";
}

function hasH1(html) {
  return /<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(html);
}

function normalizeUrl(url, base = origin) {
  const parsed = new URL(url, base);
  parsed.hash = "";
  return parsed.toString();
}

function sameNormalizedUrl(left, right) {
  try {
    return normalizeUrl(left) === normalizeUrl(right);
  } catch {
    return false;
  }
}

function sameOrigin(url) {
  try {
    return new URL(url).origin === origin;
  } catch {
    return false;
  }
}

async function checkRobots() {
  const robotsUrl = siteUrl("/robots.txt");
  const robots = await fetchText(robotsUrl);
  if (!robots.ok) {
    fail("robots.txt did not load", { url: robotsUrl, status: robots.status });
    return robots;
  }
  if (!/User-agent:\s*\*/i.test(robots.text)) {
    fail("robots.txt is missing User-agent: *", { url: robotsUrl });
  }
  if (!/Allow:\s*\//i.test(robots.text)) {
    fail("robots.txt is missing Allow: /", { url: robotsUrl });
  }
  const sitemapLine = robots.text.match(/Sitemap:\s*(\S+)/i)?.[1] || "";
  if (sitemapLine !== siteUrl("/sitemap-index.xml")) {
    fail("robots.txt sitemap does not point at the current sitemap index", {
      expected: siteUrl("/sitemap-index.xml"),
      actual: sitemapLine || null
    });
  }
  return robots;
}

async function checkSitemaps() {
  const indexUrl = siteUrl("/sitemap-index.xml");
  const index = await fetchText(indexUrl);
  if (!index.ok) {
    fail("sitemap-index.xml did not load", { url: indexUrl, status: index.status });
    return { urls: [], lastmods: [] };
  }

  const sitemapUrls = extractLocs(index.text).filter(sameOrigin);
  if (sitemapUrls.length === 0) {
    fail("sitemap-index.xml does not list any same-origin sitemap files", { url: indexUrl });
    return { urls: [], lastmods: [] };
  }

  const urls = [];
  const lastmods = [];
  for (const sitemapUrl of sitemapUrls) {
    const sitemap = await fetchText(sitemapUrl);
    if (!sitemap.ok) {
      fail("listed sitemap did not load", { url: sitemapUrl, status: sitemap.status });
      continue;
    }
    const entries = extractPageEntries(sitemap.text).filter((entry) => sameOrigin(entry.loc));
    const pageUrls = entries.map((entry) => entry.loc);
    if (pageUrls.length === 0) {
      fail("listed sitemap does not contain same-origin URLs", { url: sitemapUrl });
    }
    for (const entry of entries) {
      if (!entry.lastmod) {
        fail("sitemap URL is missing lastmod", { url: entry.loc });
        continue;
      }
      const timestamp = Date.parse(entry.lastmod);
      if (!Number.isFinite(timestamp)) {
        fail("sitemap URL has invalid lastmod", { url: entry.loc, lastmod: entry.lastmod });
        continue;
      }
      if (timestamp > Date.now() + 24 * 60 * 60 * 1000) {
        fail("sitemap URL has future lastmod", { url: entry.loc, lastmod: entry.lastmod });
        continue;
      }
      lastmods.push(new Date(timestamp).toISOString());
    }
    urls.push(...pageUrls);
  }

  const uniqueUrls = [...new Set(urls.map((url) => normalizeUrl(url)))].sort();
  if (uniqueUrls.length !== urls.length) {
    warn("sitemap contains duplicate URLs", {
      listed: urls.length,
      unique: uniqueUrls.length
    });
  }
  return { urls: uniqueUrls, lastmods };
}

async function checkPage(url) {
  const page = await fetchText(url);
  const result = {
    url,
    status: page.status,
    finalUrl: page.finalUrl,
    canonical: "",
    robots: "",
    hasH1: false
  };

  if (!page.ok) {
    fail("sitemap URL did not load", { url, status: page.status });
    return result;
  }
  if (!sameNormalizedUrl(page.finalUrl, url)) {
    fail("sitemap URL redirects to a different URL", {
      url,
      finalUrl: page.finalUrl
    });
  }
  if (!page.contentType.includes("text/html")) {
    fail("sitemap URL is not HTML", {
      url,
      contentType: page.contentType
    });
    return result;
  }

  result.canonical = extractCanonical(page.text);
  result.robots = extractRobotsMeta(page.text);
  result.hasH1 = hasH1(page.text);

  if (!sameNormalizedUrl(result.canonical, url)) {
    fail("page canonical does not match sitemap URL", {
      url,
      canonical: result.canonical || null
    });
  }
  if (/\bnoindex\b/i.test(result.robots)) {
    fail("indexable sitemap URL has noindex robots meta", {
      url,
      robots: result.robots
    });
  }
  if (!result.hasH1) {
    fail("page is missing an h1", { url });
  }

  return result;
}

const robots = await checkRobots();
const sitemap = await checkSitemaps();
const sitemapUrls = sitemap.urls;
const pageResults = [];
for (const url of sitemapUrls) {
  pageResults.push(await checkPage(url));
}

const report = {
  site: origin,
  checkedAt: new Date().toISOString(),
  robots: {
    url: siteUrl("/robots.txt"),
    status: robots?.status ?? null
  },
  sitemapUrlCount: sitemapUrls.length,
  sitemapLastmod: {
    count: sitemap.lastmods.length,
    oldest: [...sitemap.lastmods].sort()[0] || null,
    newest: [...sitemap.lastmods].sort().at(-1) || null
  },
  checkedPageCount: pageResults.length,
  failures,
  warnings
};

if (jsonOutput) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`SEO health for ${origin}`);
  console.log(`Checked ${pageResults.length} sitemap URLs.`);
  console.log(`Valid sitemap lastmod values: ${sitemap.lastmods.length}.`);
  console.log(`Failures: ${failures.length}`);
  console.log(`Warnings: ${warnings.length}`);
  if (failures.length > 0) {
    console.log("\nFailures");
    for (const item of failures) {
      console.log(`- ${item.message}: ${item.url || item.expected || ""}`.trim());
      const details = Object.entries(item)
        .filter(([key]) => !["message", "url"].includes(key))
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(" ");
      if (details) console.log(`  ${details}`);
    }
  }
  if (warnings.length > 0) {
    console.log("\nWarnings");
    for (const item of warnings) {
      console.log(`- ${item.message}`);
    }
  }
}

if (failures.length > 0) {
  process.exitCode = 1;
}
