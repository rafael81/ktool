import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const port = Number(process.env.SMOKE_PORT || 4322);
const baseUrl = `http://127.0.0.1:${port}`;
const productionUrl = "https://k-document-tool.pages.dev";

const routes = [
  { path: "/", h1: "K문서툴로 문서 제출 직전을 가볍게" },
  { path: "/tools/", h1: "전체 도구" },
  { path: "/categories/business/", h1: "업무 문서 도구" },
  { path: "/categories/pdf/", h1: "PDF 도구", robots: "noindex,follow" },
  { path: "/tools/business-nameplate-maker/", h1: "사업자 명판 만들기 무료", faq: true },
  { path: "/tools/transaction-statement-generator/", h1: "거래명세서 자동작성", faq: true, documentPreview: true },
  { path: "/tools/estimate-generator/", h1: "견적서 자동작성", faq: true, documentPreview: true },
  { path: "/tools/invoice-generator/", h1: "청구서 자동작성", faq: true, documentPreview: true },
  { path: "/tools/receipt-generator/", h1: "영수증 자동작성", faq: true, documentPreview: true },
  { path: "/tools/vat-calculator/", h1: "부가세 계산기", faq: true },
  { path: "/tools/amount-korean-converter/", h1: "금액 한글 변환기", faq: true },
  { path: "/tools/freelance-withholding-calculator/", h1: "3.3% 계산기", faq: true }
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForPreview(server) {
  const started = Date.now();
  while (Date.now() - started < 20_000) {
    if (server.exitCode !== null) {
      throw new Error(`Preview server exited with code ${server.exitCode}`);
    }
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      await delay(250);
    }
  }
  throw new Error("Preview server did not start within 20s");
}

async function run() {
  const server = spawn(
    "npm",
    ["run", "preview", "--", "--host", "127.0.0.1", "--port", String(port)],
    {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  server.stdout.on("data", (chunk) => process.stdout.write(chunk));
  server.stderr.on("data", (chunk) => process.stderr.write(chunk));

  let browser;
  try {
    await waitForPreview(server);
    browser = await chromium.launch();

    for (const route of routes) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      const response = await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
      assert(response?.ok(), `${route.path} did not load successfully`);

      const h1 = await page.locator("h1").first().textContent();
      assert(h1?.includes(route.h1), `${route.path} expected h1 containing "${route.h1}", got "${h1}"`);

      const description = await page.locator('meta[name="description"]').getAttribute("content");
      assert(description && description.length >= 40, `${route.path} is missing a useful meta description`);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      assert(canonical === `${productionUrl}${route.path}`, `${route.path} canonical got "${canonical}"`);

      if (route.robots) {
        const robots = await page.locator('meta[name="robots"]').getAttribute("content");
        assert(robots === route.robots, `${route.path} robots should be ${route.robots}`);
      }

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      );
      assert(!overflow, `${route.path} has horizontal overflow on mobile viewport`);

      if (route.faq) {
        const jsonLdCount = await page.locator('script[type="application/ld+json"]').count();
        assert(jsonLdCount >= 2, `${route.path} should include SoftwareApplication and FAQ JSON-LD`);
        const detailsCount = await page.locator("details").count();
        assert(detailsCount >= 5, `${route.path} should render visible FAQ entries`);
      }

      if (route.documentPreview) {
        const previewText = await page.locator("[data-document-preview]").textContent();
        assert(previewText?.includes("합계 한글"), `${route.path} should render Korean total amount in preview`);
      }

      await page.close();
    }

    await assertAnalyticsPrivacy(browser);
  } finally {
    await browser?.close();
    server.kill("SIGTERM");
  }
}

async function assertAnalyticsPrivacy(browser) {
  const secret = "SECRET-BIZ-999-88-77777";
  const leakedRequests = [];
  const events = [];
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    await page.exposeFunction("captureKdocEvent", (payload) => {
      events.push(payload);
    });
    await page.addInitScript(() => {
      window.addEventListener("kdoc:analytics", (event) => {
        window["captureKdocEvent"]?.(event.detail);
      });
    });
    page.on("request", (request) => {
      const body = request.postData() || "";
      const target = `${request.url()} ${body}`;
      if (target.includes(secret)) leakedRequests.push(request.url());
    });

    await page.goto(`${baseUrl}/tools/transaction-statement-generator/`, {
      waitUntil: "networkidle"
    });
    await page.locator("[data-supplier-meta]").fill(secret);
    await delay(250);

    const eventText = JSON.stringify(events);
    assert(!eventText.includes(secret), "Analytics event payload leaked raw document input");
    assert(leakedRequests.length === 0, `Network request leaked raw document input: ${leakedRequests.join(", ")}`);
  } finally {
    await page.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
