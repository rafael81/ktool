import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const routeBudgets = [
  {
    path: "/tools/jpg-to-pdf-converter/",
    htmlPath: "dist/tools/jpg-to-pdf-converter/index.html",
    maxInitialScriptBytes: 90 * 1024
  },
  {
    path: "/tools/heic-jpg-converter/",
    htmlPath: "dist/tools/heic-jpg-converter/index.html",
    maxInitialScriptBytes: 90 * 1024
  }
];

function scriptSources(html) {
  return [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => match[1])
    .filter((src) => src.startsWith("/"));
}

function assetSize(src) {
  return statSync(join("dist", src)).size;
}

const failures = [];

for (const budget of routeBudgets) {
  const html = readFileSync(budget.htmlPath, "utf8");
  const scripts = scriptSources(html).map((src) => ({
    src,
    bytes: assetSize(src)
  }));
  const initialScriptBytes = scripts.reduce((sum, script) => sum + script.bytes, 0);
  if (initialScriptBytes > budget.maxInitialScriptBytes) {
    failures.push({
      path: budget.path,
      initialScriptBytes,
      maxInitialScriptBytes: budget.maxInitialScriptBytes,
      scripts
    });
  }
  console.log(
    `${budget.path} initial script ${(initialScriptBytes / 1024).toFixed(1)} KB / ${(
      budget.maxInitialScriptBytes / 1024
    ).toFixed(1)} KB`
  );
}

if (failures.length > 0) {
  console.error("Build budget failed:");
  for (const failure of failures) {
    console.error(
      `- ${failure.path}: ${(failure.initialScriptBytes / 1024).toFixed(1)} KB > ${(
        failure.maxInitialScriptBytes / 1024
      ).toFixed(1)} KB`
    );
    for (const script of failure.scripts) {
      console.error(`  ${(script.bytes / 1024).toFixed(1)} KB ${script.src}`);
    }
  }
  process.exitCode = 1;
}
