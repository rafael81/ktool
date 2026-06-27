import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const port = Number(process.env.SMOKE_PORT || 4322);
const baseUrl = `http://127.0.0.1:${port}`;
const productionUrl = "https://k-document-tool.pages.dev";

const routes = [
  { path: "/", h1: "K문서툴로 문서 제출 직전을 가볍게" },
  { path: "/tools/", h1: "전체 도구" },
  { path: "/tools/submission-file-prep/", h1: "제출용 파일 준비", faq: true, submissionPrep: true },
  { path: "/categories/business/", h1: "업무 문서 도구" },
  { path: "/categories/pdf/", h1: "PDF 도구" },
  { path: "/categories/image/", h1: "이미지 도구" },
  { path: "/tools/business-nameplate-maker/", h1: "사업자 명판 만들기 무료", faq: true },
  { path: "/tools/transaction-statement-generator/", h1: "거래명세서 자동작성", faq: true, documentPreview: true },
  { path: "/tools/estimate-generator/", h1: "견적서 자동작성", faq: true, documentPreview: true },
  { path: "/tools/invoice-generator/", h1: "청구서 자동작성", faq: true, documentPreview: true },
  { path: "/tools/receipt-generator/", h1: "영수증 자동작성", faq: true, documentPreview: true },
  { path: "/tools/vat-calculator/", h1: "부가세 계산기", faq: true },
  { path: "/tools/amount-korean-converter/", h1: "금액 한글 변환기", faq: true },
  { path: "/tools/freelance-withholding-calculator/", h1: "3.3% 계산기", faq: true },
  { path: "/tools/stamp-background-remover/", h1: "도장 배경 제거", faq: true, stampTool: true },
  { path: "/tools/jpg-to-pdf-converter/", h1: "JPG PDF 변환", faq: true, pdfImageTool: true },
  { path: "/tools/photo-size-reducer/", h1: "사진 용량 줄이기", faq: true, imageCompressor: true },
  { path: "/tools/image-resizer/", h1: "이미지 리사이즈", faq: true, imageResizer: true },
  { path: "/tools/image-cropper/", h1: "이미지 자르기", faq: true, imageCropper: true },
  { path: "/tools/image-rotator/", h1: "이미지 회전", faq: true, imageRotator: true },
  { path: "/tools/image-converter/", h1: "WebP JPG 변환", faq: true, imageConverter: true },
  { path: "/tools/heic-jpg-converter/", h1: "HEIC JPG 변환", faq: true, heicConverter: true }
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
        assert(jsonLdCount >= 2, `${route.path} should include page structured data and FAQ JSON-LD`);
        const detailsCount = await page.locator("details").count();
        assert(detailsCount >= 5, `${route.path} should render visible FAQ entries`);
      }

      if (route.submissionPrep) {
        const situationCount = await page.locator(".situation-link").count();
        assert(situationCount >= 6, `${route.path} should render situation-based routing links`);
        const expectedLinks = [
          "/tools/heic-jpg-converter/",
          "/tools/photo-size-reducer/",
          "/tools/image-rotator/",
          "/tools/image-cropper/",
          "/tools/image-resizer/",
          "/tools/jpg-to-pdf-converter/",
          "/tools/transaction-statement-generator/",
          "/tools/business-nameplate-maker/"
        ];
        for (const href of expectedLinks) {
          const count = await page.locator(`[data-submission-prep] a[href="${href}"]`).count();
          assert(count >= 1, `${route.path} should link to ${href}`);
        }
      }

      if (route.documentPreview) {
        const previewText = await page.locator("[data-document-preview]").textContent();
        assert(previewText?.includes("합계 한글"), `${route.path} should render Korean total amount in preview`);
      }

      if (route.stampTool) {
        await page.locator("[data-sample]").click();
        await page.waitForFunction(() => {
          const button = document.querySelector("[data-download]");
          return button && !button.disabled;
        });
        const hasTransparentPixels = await page.evaluate(() => {
          const canvas = document.querySelector("[data-result-canvas]");
          const ctx = canvas?.getContext("2d", { willReadFrequently: true });
          if (!canvas || !ctx) return false;
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          for (let index = 3; index < data.length; index += 4) {
            if (data[index] === 0) return true;
          }
          return false;
        });
        assert(hasTransparentPixels, `${route.path} should create transparent PNG pixels from the sample image`);
      }

      if (route.pdfImageTool) {
        await page.locator("[data-sample]").click();
        await page.waitForFunction(() => document.querySelectorAll(".file-row").length === 2);
        const sizesBefore = await page.locator(".file-row p").allTextContents();
        await page.locator('[data-move-file="0"][data-direction="down"]').click();
        const sizesAfter = await page.locator(".file-row p").allTextContents();
        assert(
          sizesBefore.length === 2 &&
            sizesBefore[0] === sizesAfter[1] &&
            sizesBefore[1] === sizesAfter[0],
          `${route.path} should reorder selected images before PDF generation`
        );
        await page.locator("[data-generate]").click();
        await page.waitForFunction(() => {
          const status = document.querySelector("[data-output-status]")?.textContent || "";
          const link = document.querySelector("[data-download]");
          return status.includes("PDF 준비 완료") && link?.href.startsWith("blob:");
        });
        const fileCount = await page.locator(".file-row").count();
        assert(fileCount === 2, `${route.path} should render two sample image rows`);
      }

      if (route.imageCompressor) {
        await page.locator("[data-sample]").click();
        await page.waitForFunction(() => document.querySelectorAll(".compress-row").length === 2);
        await page.locator("[data-compress]").click();
        await page.waitForFunction(() => {
          const status = document.querySelector("[data-output-status]")?.textContent || "";
          const link = document.querySelector("[data-download-image]");
          return status.includes("압축 완료") && link?.href.startsWith("blob:");
        });
        const didReduce = await page.locator("[data-download-image]").first().evaluate((link) => {
          return Number(link.dataset.afterSize || 0) < Number(link.dataset.beforeSize || 0);
        });
        assert(didReduce, `${route.path} should reduce the sample image size`);
      }

      if (route.imageResizer) {
        await page.locator("[data-sample]").click();
        await page.waitForFunction(() => document.querySelectorAll(".resize-row").length === 2);
        await page.locator("[data-resize]").click();
        await page.waitForFunction(() => {
          const status = document.querySelector("[data-output-status]")?.textContent || "";
          const link = document.querySelector("[data-download-image]");
          return status.includes("리사이즈 완료") && link?.href.startsWith("blob:");
        });
        const firstResult = await page.locator("[data-download-image]").first().evaluate((link) => ({
          width: Number(link.dataset.outputWidth || 0),
          height: Number(link.dataset.outputHeight || 0),
          afterSize: Number(link.dataset.afterSize || 0)
        }));
        assert(
          firstResult.width === 1200 && firstResult.height === 800 && firstResult.afterSize > 0,
          `${route.path} should resize the landscape sample to 1200x800`
        );
      }

      if (route.imageCropper) {
        await page.locator("[data-sample]").click();
        await page.waitForFunction(() => {
          const canvas = document.querySelector("[data-preview-canvas]");
          return canvas && canvas.width > 0 && canvas.height > 0;
        });
        await page.locator("[data-crop]").click();
        await page.waitForFunction(() => {
          const status = document.querySelector("[data-output-status]")?.textContent || "";
          const link = document.querySelector("[data-download-image]");
          return status.includes("자르기 완료") && link?.href.startsWith("blob:");
        });
        const firstResult = await page.locator("[data-download-image]").evaluate(async (link) => {
          const response = await fetch(link.href);
          const bytes = new Uint8Array(await response.arrayBuffer());
          return {
            outputFormat: link.dataset.outputFormat,
            width: Number(link.dataset.outputWidth || 0),
            height: Number(link.dataset.outputHeight || 0),
            afterSize: Number(link.dataset.afterSize || 0),
            magic: Array.from(bytes.slice(0, 3))
          };
        });
        assert(
          firstResult.outputFormat === "image/jpeg" &&
            firstResult.width === firstResult.height &&
            firstResult.afterSize > 0 &&
            firstResult.magic.join(",") === "255,216,255",
          `${route.path} should crop the sample to a square JPG blob`
        );
      }

      if (route.imageRotator) {
        await page.locator("[data-sample]").click();
        await page.waitForFunction(() => document.querySelectorAll(".rotate-row").length === 2);
        await page.locator("[data-rotate]").click();
        await page.waitForFunction(() => {
          const status = document.querySelector("[data-output-status]")?.textContent || "";
          const link = document.querySelector("[data-download-image]");
          return status.includes("회전 완료") && link?.href.startsWith("blob:");
        });
        const firstResult = await page.locator("[data-download-image]").first().evaluate(async (link) => {
          const response = await fetch(link.href);
          const bytes = new Uint8Array(await response.arrayBuffer());
          return {
            outputFormat: link.dataset.outputFormat,
            width: Number(link.dataset.outputWidth || 0),
            height: Number(link.dataset.outputHeight || 0),
            afterSize: Number(link.dataset.afterSize || 0),
            magic: Array.from(bytes.slice(0, 3))
          };
        });
        assert(
          firstResult.outputFormat === "image/jpeg" &&
            firstResult.width === 1200 &&
            firstResult.height === 1800 &&
            firstResult.afterSize > 0 &&
            firstResult.magic.join(",") === "255,216,255",
          `${route.path} should rotate the landscape sample to a portrait JPG blob`
        );
      }

      if (route.imageConverter) {
        await page.locator("[data-sample]").click();
        await page.waitForFunction(() => document.querySelectorAll(".convert-row").length === 2);
        await page.locator("[data-convert]").click();
        await page.waitForFunction(() => {
          const status = document.querySelector("[data-output-status]")?.textContent || "";
          const link = document.querySelector("[data-download-image]");
          return status.includes("변환 완료") && link?.href.startsWith("blob:");
        });
        const firstResult = await page.locator("[data-download-image]").first().evaluate(async (link) => {
          const response = await fetch(link.href);
          const bytes = new Uint8Array(await response.arrayBuffer());
          return {
            sourceType: link.dataset.sourceType,
            outputFormat: link.dataset.outputFormat,
            afterSize: Number(link.dataset.afterSize || 0),
            magic: Array.from(bytes.slice(0, 3))
          };
        });
        assert(
          firstResult.sourceType === "image/webp" &&
            firstResult.outputFormat === "image/jpeg" &&
            firstResult.afterSize > 0 &&
            firstResult.magic.join(",") === "255,216,255",
          `${route.path} should convert the WebP sample to a JPG blob`
        );
      }

      if (route.heicConverter) {
        await page.locator("[data-sample]").click();
        await page.waitForFunction(() => document.querySelectorAll(".heic-row").length === 1);
        await page.locator("[data-convert]").click();
        await page.waitForFunction(() => {
          const status = document.querySelector("[data-output-status]")?.textContent || "";
          const link = document.querySelector("[data-download-image]");
          return status.includes("변환 완료") && link?.href.startsWith("blob:");
        }, null, { timeout: 60_000 });
        const firstResult = await page.locator("[data-download-image]").first().evaluate(async (link) => {
          const response = await fetch(link.href);
          const bytes = new Uint8Array(await response.arrayBuffer());
          return {
            outputFormat: link.dataset.outputFormat,
            afterSize: Number(link.dataset.afterSize || 0),
            magic: Array.from(bytes.slice(0, 3))
          };
        });
        assert(
          firstResult.outputFormat === "image/jpeg" &&
            firstResult.afterSize > 0 &&
            firstResult.magic.join(",") === "255,216,255",
          `${route.path} should convert the HEIC sample to a JPG blob`
        );
      }

      await page.close();
    }

    await assertAnalyticsPrivacy(browser);
    await assertFileAnalyticsPrivacy(browser);
  } finally {
    await browser?.close();
    server.kill("SIGTERM");
  }
}

async function assertFileAnalyticsPrivacy(browser) {
  const secret = "SECRET-FILENAME-777";
  const fileTools = [
    { path: "/tools/image-resizer/", input: "[data-image-input]", name: `${secret}.png`, mimeType: "image/png" },
    { path: "/tools/image-cropper/", input: "[data-image-input]", name: `${secret}.png`, mimeType: "image/png" },
    { path: "/tools/image-rotator/", input: "[data-image-input]", name: `${secret}.png`, mimeType: "image/png" },
    { path: "/tools/image-converter/", input: "[data-image-input]", name: `${secret}.png`, mimeType: "image/png" },
    { path: "/tools/heic-jpg-converter/", input: "[data-heic-input]", name: `${secret}.heic`, mimeType: "image/heic" }
  ];
  const onePixelPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
    "base64"
  );

  for (const tool of fileTools) {
    const events = [];
    const leakedRequests = [];
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

    await page.exposeFunction("captureFileEvent", (payload) => {
      events.push(payload);
    });
    await page.addInitScript(() => {
      window.addEventListener("kdoc:analytics", (event) => {
        window["captureFileEvent"]?.(event.detail);
      });
    });
    page.on("request", (request) => {
      const body = request.postData() || "";
      const target = `${request.url()} ${body}`;
      if (target.includes(secret)) leakedRequests.push(request.url());
    });

    try {
      await page.goto(`${baseUrl}${tool.path}`, { waitUntil: "networkidle" });
      await page.locator(tool.input).setInputFiles({
        name: tool.name,
        mimeType: tool.mimeType,
        buffer: onePixelPng
      });
      await page.waitForFunction(() => document.querySelector("[data-file-label]")?.textContent?.includes("1장"));

      const eventText = JSON.stringify(events);
      assert(!eventText.includes(secret), `${tool.path} analytics event payload leaked the uploaded filename`);
      assert(
        leakedRequests.length === 0,
        `${tool.path} network request leaked uploaded filename: ${leakedRequests.join(", ")}`
      );
    } finally {
      await page.close();
    }
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
