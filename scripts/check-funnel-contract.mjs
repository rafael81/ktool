import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { RESULT_EVENT_TYPES, RESULT_TYPES, TOOL_PATH_BY_ID } from "../shared/funnel-contract.mjs";

function propertyText(object, name) {
  const property = object.properties.find(
    (candidate) =>
      ts.isPropertyAssignment(candidate) &&
      ((ts.isIdentifier(candidate.name) && candidate.name.text === name) ||
        (ts.isStringLiteral(candidate.name) && candidate.name.text === name))
  );
  return property && ts.isStringLiteralLike(property.initializer) ? property.initializer.text : null;
}

function toolRegistryFromTypeScript() {
  const sourceText = readFileSync("src/data/tools.ts", "utf8");
  const source = ts.createSourceFile("tools.ts", sourceText, ts.ScriptTarget.Latest, true);
  let registry = null;

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "tools" &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      registry = Object.fromEntries(
        node.initializer.elements
          .filter(ts.isObjectLiteralExpression)
          .map((entry) => [propertyText(entry, "id"), propertyText(entry, "path")])
          .filter(([id, path]) => id && path)
      );
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
  if (!registry) throw new Error("Could not read the tools registry from src/data/tools.ts");
  return registry;
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const sourceEvents = new Set();
for (const path of walk("src").concat(walk("public"))) {
  if (!/\.(astro|js|mjs|ts)$/.test(path)) continue;
  const text = readFileSync(path, "utf8");
  const patterns = [
    /data-analytics-event\s*=\s*["']([^"']+)["']/g,
    /\bkdocTrack(?:\?\.)?\(\s*["']([^"']+)["']/g,
    /\btrack(?:\?\.)?\(\s*["']([^"']+)["']/g,
    /\btrack(?:\?\.)?\([^,)]*,\s*["']([^"']+)["']/g
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) sourceEvents.add(match[1]);
  }
}

const documented = readFileSync("docs/analytics-events.md", "utf8");
const sourceRegistry = toolRegistryFromTypeScript();
const contractRegistry = { ...TOOL_PATH_BY_ID };
const issues = [];

if (JSON.stringify(sourceRegistry) !== JSON.stringify(contractRegistry)) {
  const ids = new Set([...Object.keys(sourceRegistry), ...Object.keys(contractRegistry)]);
  for (const id of ids) {
    if (sourceRegistry[id] !== contractRegistry[id]) {
      issues.push(`tool registry mismatch: ${id} (${sourceRegistry[id]} != ${contractRegistry[id]})`);
    }
  }
}

for (const [eventName, resultType] of Object.entries(RESULT_EVENT_TYPES)) {
  if (!RESULT_TYPES.includes(resultType)) issues.push(`invalid result type: ${eventName} -> ${resultType}`);
  if (!sourceEvents.has(eventName)) issues.push(`useful-result event not found in source: ${eventName}`);
  if (!documented.includes(`| \`${eventName}\` |`)) issues.push(`useful-result event not documented: ${eventName}`);
}

if (issues.length) {
  console.error("Funnel contract errors:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(
  `Funnel contract OK: ${Object.keys(contractRegistry).length} tools and ${Object.keys(RESULT_EVENT_TYPES).length} result events.`
);
