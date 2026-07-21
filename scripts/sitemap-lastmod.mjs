import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

const SHARED_CONTENT_FILES = ["src/data/tools.ts", "src/data/seo.ts"];

function normalizePathname(pathname) {
  const parsed = new URL(pathname, "https://kdoctool.kr");
  return parsed.pathname === "/" ? "/" : `/${parsed.pathname.replace(/^\/+|\/+$/g, "")}/`;
}

export function routeContentFiles(pathname, { cwd = process.cwd(), fileExists } = {}) {
  const normalized = normalizePathname(pathname);
  const exists = fileExists || ((file) => existsSync(resolve(cwd, file)));
  const route = normalized === "/" ? "index" : normalized.slice(1, -1);
  const candidates = [`src/pages/${route}.astro`, `src/pages/${route}/index.astro`];
  const files = candidates.filter(exists);

  const usesToolContent =
    normalized === "/" || /^\/(tools|categories|problems|workflows)(\/|$)/.test(normalized);
  if (usesToolContent) {
    for (const sharedFile of SHARED_CONTENT_FILES) {
      if (exists(sharedFile)) files.push(sharedFile);
    }
  }

  return [...new Set(files)];
}

function validDate(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string" && /^\d+$/.test(value)) {
    value = Number(value) * 1000;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function readGitDate(files, cwd) {
  if (files.length === 0) return null;
  try {
    const output = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...files], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    return validDate(output);
  } catch {
    return null;
  }
}

function readNewestFileDate(files, cwd) {
  const dates = files.flatMap((file) => {
    try {
      return [statSync(resolve(cwd, file)).mtime];
    } catch {
      return [];
    }
  });
  return dates.sort((left, right) => right.getTime() - left.getTime())[0] || null;
}

export function sitemapLastmod(
  pathname,
  {
    cwd = process.cwd(),
    fileExists,
    gitDate,
    fallbackDate = process.env.SITEMAP_LASTMOD || process.env.SOURCE_DATE_EPOCH
  } = {}
) {
  const files = routeContentFiles(pathname, { cwd, fileExists });
  const fromGit = gitDate === undefined ? readGitDate(files, cwd) : validDate(gitDate);
  if (fromGit) return fromGit;

  const fromFiles = readNewestFileDate(files, cwd);
  if (fromFiles) return fromFiles;

  const fallback = validDate(fallbackDate);
  if (fallback) return fallback;

  throw new Error(`Unable to determine sitemap lastmod for ${normalizePathname(pathname)}`);
}
