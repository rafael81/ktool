import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const sourceRoots = ["src", "public"];
const sourceFilePattern = /\.(astro|js|mjs|ts)$/;
const eventNamePattern = /^[a-z][a-z0-9_]*$/;
const documentedEventsPath = "docs/analytics-events.md";

function walkFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) return walkFiles(path);
    return sourceFilePattern.test(path) ? [path] : [];
  });
}

function collectMatches(text, patterns) {
  const values = new Set();
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const value = match[1]?.trim();
      if (value && eventNamePattern.test(value)) values.add(value);
    }
  }
  return values;
}

function collectSourceEvents() {
  const patterns = [
    /data-analytics-event\s*=\s*["']([^"']+)["']/g,
    /\bkdocTrack(?:\?\.)?\(\s*["']([^"']+)["']/g,
    /\btrack(?:\?\.)?\(\s*["']([^"']+)["']/g,
    /\btrack(?:\?\.)?\([^,)]*,\s*["']([^"']+)["']/g,
    /\beventName\s*:\s*["']([^"']+)["']/g,
    /\bevent\s*:\s*["']([^"']+)["']/g
  ];
  const sourceText = sourceRoots
    .flatMap(walkFiles)
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
  return collectMatches(sourceText, patterns);
}

function collectDocumentedEvents() {
  const markdown = readFileSync(documentedEventsPath, "utf8");
  return collectMatches(markdown, [/^\| `([^`]+)` \|/gm]);
}

function listDifference(left, right) {
  return [...left].filter((item) => !right.has(item)).sort();
}

const sourceEvents = collectSourceEvents();
const documentedEvents = collectDocumentedEvents();
const undocumentedEvents = listDifference(sourceEvents, documentedEvents);
const staleDocumentedEvents = listDifference(documentedEvents, sourceEvents);

if (undocumentedEvents.length > 0) {
  console.error("Analytics events are used in source but missing from docs/analytics-events.md:");
  for (const event of undocumentedEvents) console.error(`- ${event}`);
  process.exitCode = 1;
} else {
  console.log(`Analytics contract OK: ${sourceEvents.size} source events are documented.`);
}

if (staleDocumentedEvents.length > 0) {
  console.log("Documented events not found by static scan:");
  for (const event of staleDocumentedEvents) console.log(`- ${event}`);
}
