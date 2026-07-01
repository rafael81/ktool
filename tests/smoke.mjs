import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const port = Number(process.env.SMOKE_PORT || 4322);
const baseUrl = `http://127.0.0.1:${port}`;
const productionUrl = "https://k-document-tool.pages.dev";

const routes = [
  { path: "/", h1: "K문서툴" },
  { path: "/tools/", h1: "전체 도구" },
  { path: "/tools/submission-file-prep/", h1: "제출용 파일 준비", faq: true, submissionPrep: true },
  {
    path: "/workflows/photo-scan-submission/",
    h1: "사진·스캔 제출 패키지",
    faq: true,
    workflowPackage: "photo-scan-submission"
  },
  {
    path: "/workflows/business-document-submission/",
    h1: "사업자 서류 제출 패키지",
    faq: true,
    workflowPackage: "business-document-submission"
  },
  {
    path: "/workflows/freelance-billing/",
    h1: "프리랜서 정산·청구 패키지",
    faq: true,
    workflowPackage: "freelance-billing"
  },
  { path: "/problems/", h1: "문제별 해결", problemHub: true },
  { path: "/problems/file-format-error/", h1: "파일 형식 오류 해결", faq: true, problemPage: true },
  { path: "/problems/heic-jpg-submit/", h1: "HEIC JPG 제출 준비", faq: true, problemPage: true },
  { path: "/problems/photo-under-1mb/", h1: "사진 1MB 이하로 줄이기", faq: true, problemPage: true },
  { path: "/problems/image-pixel-limit/", h1: "사진 크기 제한 맞추기", faq: true, problemPage: true },
  { path: "/problems/sideways-scan/", h1: "사진 방향 바로잡기", faq: true, problemPage: true },
  { path: "/problems/document-photo-crop/", h1: "문서 사진 여백 자르기", faq: true, problemPage: true },
  { path: "/problems/images-to-one-pdf/", h1: "여러 장 이미지 PDF로 묶기", faq: true, problemPage: true },
  { path: "/categories/business/", h1: "업무 문서 도구" },
  { path: "/categories/pdf/", h1: "PDF 도구" },
  { path: "/categories/image/", h1: "이미지 도구" },
  { path: "/tools/business-nameplate-maker/", h1: "사업자 명판 만들기 무료", faq: true, nameplateTool: true },
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

      if (route.path !== "/") {
        const jsonLdItems = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) =>
          nodes.map((node) => JSON.parse(node.textContent || "{}"))
        );
        const breadcrumb = jsonLdItems.find((item) => item["@type"] === "BreadcrumbList");
        assert(breadcrumb, `${route.path} should include BreadcrumbList JSON-LD`);
        const crumbs = breadcrumb.itemListElement || [];
        assert(crumbs[0]?.name === "K문서툴", `${route.path} breadcrumb should start at the homepage`);
        assert(
          crumbs.at(-1)?.item === `${productionUrl}${route.path}`,
          `${route.path} breadcrumb should end at the canonical URL`
        );
      }

      if (route.robots) {
        const robots = await page.locator('meta[name="robots"]').getAttribute("content");
        assert(robots === route.robots, `${route.path} robots should be ${route.robots}`);
      }

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      );
      assert(!overflow, `${route.path} has horizontal overflow on mobile viewport`);

      if (route.path.startsWith("/tools/") && route.path !== "/tools/") {
        const visibleSidePanels = await page.locator(".side-panel").evaluateAll((panels) =>
          panels.filter((panel) => {
            const rect = panel.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && getComputedStyle(panel).display !== "none";
          }).length
        );
        assert(visibleSidePanels === 0, `${route.path} should not show explanatory side panels in the workspace`);
        const visibleProblemArrivalCount = await page.locator("[data-problem-arrival]:not([hidden])").count();
        assert(visibleProblemArrivalCount === 0, `${route.path} should hide the problem arrival banner on direct visits`);
      }

      if (route.nameplateTool) {
        const nameplateDownloadCount = await page.locator("[data-nameplate-download]").count();
        assert(nameplateDownloadCount === 1, `${route.path} should expose one primary PNG save action`);
        const firstActionText = await page.locator(".nameplate-actions .btn").first().innerText();
        assert(firstActionText.includes("PNG 저장"), `${route.path} should show PNG save as the first form action`);
        const previewMetrics = await page.locator("[data-nameplate-preview-panel]").evaluate((panel) => {
          const canvas = panel.querySelector("[data-nameplate-preview-canvas]");
          const canvasRect = canvas?.getBoundingClientRect();
          return {
            panelHeight: panel.getBoundingClientRect().height,
            panelScrollHeight: panel.scrollHeight,
            panelScrollWidth: panel.scrollWidth,
            panelClientWidth: panel.clientWidth,
            canvasWidth: canvasRect?.width || 0,
            canvasHeight: canvasRect?.height || 0,
            canvasRatio: canvasRect ? canvasRect.width / canvasRect.height : 0
          };
        });
        assert(
          previewMetrics.canvasWidth > 0 &&
            previewMetrics.canvasHeight > 0 &&
            previewMetrics.canvasRatio > 1.9 &&
            previewMetrics.canvasRatio < 2.3,
          `${route.path} should render the nameplate preview at the document aspect ratio`
        );
        assert(
          previewMetrics.panelHeight < 260 &&
            previewMetrics.panelScrollHeight <= previewMetrics.panelHeight + 2 &&
            previewMetrics.panelScrollWidth <= previewMetrics.panelClientWidth + 2,
          `${route.path} should not create a tall or internally scrolling nameplate preview`
        );
        await page.locator('[data-field="company"]').fill("테스트상사");
        await page.locator("[data-nameplate-download]").click();
        await page.waitForFunction(() => {
          return window.dataLayer?.some(
            (event) => event.event === "tool_download" && event.tool_id === "business-nameplate"
          );
        });
        const nameplateDownloadEvent = await page.evaluate(() => {
          return window.dataLayer?.findLast?.(
            (event) => event.event === "tool_download" && event.tool_id === "business-nameplate"
          );
        });
        assert(
          nameplateDownloadEvent?.file_format === "png" &&
            nameplateDownloadEvent.background === "transparent" &&
            nameplateDownloadEvent.has_stamp === false &&
            nameplateDownloadEvent.changed_field_count >= 1 &&
            nameplateDownloadEvent.filled_field_count >= 6 &&
            nameplateDownloadEvent.sample_data === false &&
            nameplateDownloadEvent.source === "direct",
          `${route.path} should track safe nameplate download quality signals`
        );
      }

      const headerSearchCount = await page.locator(".site-search-link").count();
      assert(headerSearchCount === 1, `${route.path} should expose one compact header search entry`);
      const visibleNavTargets = await page.locator("header nav a").evaluateAll((links) =>
        links
          .map((link) => ({
            label: link.textContent?.trim(),
            height: link.getBoundingClientRect().height,
            visible: link.getClientRects().length > 0
          }))
          .filter((link) => link.visible)
      );
      assert(visibleNavTargets.length <= 6, `${route.path} should keep visible header nav compact`);
      const shortNavTargets = visibleNavTargets.filter((link) => link.height < 36);
      assert(shortNavTargets.length === 0, `${route.path} has visible nav targets below 36px: ${JSON.stringify(shortNavTargets)}`);
      if (route.path !== "/" && visibleNavTargets.length > 0) {
        const activeNavCount = await page.locator("header nav a.is-active").count();
        assert(activeNavCount >= 1, `${route.path} should expose an active header nav state`);
      }

      if (route.faq) {
        const jsonLdCount = await page.locator('script[type="application/ld+json"]').count();
        assert(jsonLdCount >= 2, `${route.path} should include page structured data and FAQ JSON-LD`);
        const detailsCount = await page.locator("details").count();
        assert(detailsCount >= 5, `${route.path} should render visible FAQ entries`);
      }

      if (route.path === "/" || route.path === "/tools/") {
        if (route.path === "/tools/") {
          const packageLinkCount = await page.locator('a[data-analytics-event="package_nav_click"][data-analytics-package-id]').count();
          assert(packageLinkCount >= 3, `${route.path} should expose workflow package links`);
        }
        if (route.path === "/") {
          const homeJsonLdItems = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) =>
            nodes.map((node) => JSON.parse(node.textContent || "{}"))
          );
          const websiteSchema = homeJsonLdItems.find((item) => item["@type"] === "WebSite");
          const searchActionTarget = websiteSchema?.potentialAction?.target?.urlTemplate || "";
          assert(
            searchActionTarget === `${productionUrl}/?q={search_term_string}`,
            `${route.path} should expose a WebSite SearchAction for homepage search`
          );
          const workbenchCount = await page.locator(".home-hero .workbench").count();
          assert(workbenchCount === 0, `${route.path} should not render the decorative workbench`);
          const homeSearchRootCount = await page.locator("[data-home-tool-search]").count();
          assert(homeSearchRootCount === 1, `${route.path} should render one homepage tool search`);
          const allToolCount = await page.locator("[data-home-all-tool]").count();
          assert(allToolCount === 16, `${route.path} should render all tools as direct links`);
          const removedLongSections = await page.locator(".workflow-list, .featured-tool-row, .category-ledger").count();
          assert(removedLongSections === 0, `${route.path} should not render long explanatory home sections`);
          const defaultHomeSearchRows = await page
            .locator("[data-home-search-item]:not([hidden])")
            .count();
          assert(defaultHomeSearchRows === 0, `${route.path} should keep homepage search results collapsed by default`);
          const homeQuickStartCount = await page.locator("[data-home-quick-start]").count();
          assert(homeQuickStartCount === 4, `${route.path} should expose four first-screen quick-start links`);
          const homeQuickStartHrefs = await page
            .locator("[data-home-quick-start]")
            .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
          [
            "/tools/jpg-to-pdf-converter/?from=quick-start&source=home-quick-start",
            "/tools/photo-size-reducer/?preset=1mb&source=home-quick-start",
            "/tools/heic-jpg-converter/?preset=jpg&source=home-quick-start",
            "/tools/transaction-statement-generator/?source=home-quick-start"
          ].forEach((href) => {
            assert(homeQuickStartHrefs.includes(href), `${route.path} should include quick-start link ${href}`);
          });
          const homeQuickStartAnalyticsCount = await page
            .locator('[data-home-quick-start][data-analytics-event="home_quick_start_click"][data-analytics-tool-id]')
            .count();
          assert(
            homeQuickStartAnalyticsCount === 4,
            `${route.path} should tag every quick-start link for analytics`
          );
          await page.locator("[data-home-search-input]").fill("HEIC");
          await page.waitForTimeout(450);
          const heicHomeRows = await page.locator("[data-home-search-item]:not([hidden])").count();
          const heicHomeText = (await page.locator("[data-home-search-item]:not([hidden])").allTextContents()).join(" ");
          assert(
            heicHomeRows >= 2 &&
              heicHomeText?.includes("HEIC JPG 변환") &&
              heicHomeText.includes("HEIC JPG 제출 준비"),
            `${route.path} should search tools and problem pages directly from the homepage`
          );
          await page.locator("[data-home-search-input]").fill("1MB");
          await page.waitForTimeout(450);
          const oneMbHomeText = (await page.locator("[data-home-search-item]:not([hidden])").allTextContents()).join(" ");
          assert(
            oneMbHomeText?.includes("사진 1MB 이하로 줄이기"),
            `${route.path} should surface problem-intent pages from homepage search`
          );
          const problemIntentSearches = [
            ["업로드 용량 초과", "사진 1MB 이하로 줄이기"],
            ["사진이 옆으로", "사진 방향 바로잡기"],
            ["문서 여백 제거", "문서 사진 여백 자르기"],
            ["지원하지 않는 파일 형식", "파일 형식 오류 해결"],
            ["아이폰 사진 안열림", "HEIC JPG 제출 준비"],
            ["한 파일로 제출", "여러 장 이미지 PDF로 묶기"]
          ];
          for (const [query, expectedTitle] of problemIntentSearches) {
            await page.locator("[data-home-search-input]").fill(query);
            await page.waitForTimeout(450);
            const intentSearchText = (await page.locator("[data-home-search-item]:not([hidden])").allTextContents()).join(" ");
            assert(
              intentSearchText.includes(expectedTitle),
              `${route.path} should match "${query}" to "${expectedTitle}" from homepage search`
            );
          }
          await page.goto(`${baseUrl}/?q=1MB`, { waitUntil: "networkidle" });
          const urlQueryValue = await page.locator("[data-home-search-input]").inputValue();
          const urlQueryText = (await page.locator("[data-home-search-item]:not([hidden])").allTextContents()).join(" ");
          assert(
            urlQueryValue === "1MB" && urlQueryText.includes("사진 1MB 이하로 줄이기"),
            `${route.path} should restore homepage search results from the q URL parameter`
          );
          await page.locator("[data-home-search-input]").fill("없는도구");
          await page.waitForTimeout(450);
          const emptyHomeRows = await page.locator("[data-home-search-item]:not([hidden])").count();
          const homeEmptyHidden = await page.locator("[data-home-search-empty]").getAttribute("hidden");
          const homeSuggestionHidden = await page.locator("[data-home-search-suggestions]").getAttribute("hidden");
          const homeSuggestionLinks = await page.locator("[data-home-search-suggestions] a").count();
          assert(emptyHomeRows === 0 && homeEmptyHidden === null, `${route.path} should show an empty homepage search state`);
          assert(
            homeSuggestionHidden === null && homeSuggestionLinks === 4,
            `${route.path} should show four recovery links for empty homepage search`
          );
          const homeEvents = [];
          await page.exposeFunction("captureHomeSearchEvent", (payload) => {
            homeEvents.push(payload);
          });
          await page.addInitScript(() => {
            window.addEventListener("kdoc:analytics", (event) => {
              window["captureHomeSearchEvent"]?.(event.detail);
            });
          });
          await page.reload({ waitUntil: "networkidle" });
          await page.locator("[data-home-search-input]").fill("SECRET-HOME-QUERY");
          await page.waitForTimeout(450);
          const homeEventText = JSON.stringify(homeEvents);
          assert(!homeEventText.includes("SECRET-HOME-QUERY"), `${route.path} should not send raw homepage search text`);
          assert(
            homeEventText.includes("home_search_change") && homeEventText.includes("search_query_length"),
            `${route.path} should track homepage search using only metadata`
          );
        }
        if (route.path === "/") {
          const shortcutRootCount = await page.locator("[data-prep-shortcuts]").count();
          assert(shortcutRootCount === 0, `${route.path} should keep the homepage free of prep shortcut sections`);
        } else {
          const shortcutRootCount = await page.locator("[data-prep-shortcuts]").count();
          assert(shortcutRootCount === 1, `${route.path} should render one prep shortcut section`);
          const shortcutClickCount = await page
            .locator('[data-prep-shortcuts] a[data-analytics-event="catalog_prep_shortcut_click"]')
            .count();
          assert(shortcutClickCount === 7, `${route.path} should track seven problem-situation shortcuts`);
          const shortcutIdCount = await page.locator("[data-prep-shortcuts] a[data-analytics-shortcut-id]").count();
          assert(shortcutIdCount === 7, `${route.path} should tag each prep shortcut with a stable shortcut id`);
          const shortcutToolCount = await page.locator("[data-prep-shortcuts] a[data-analytics-tool-id]").count();
          assert(shortcutToolCount === 7, `${route.path} should tag each prep shortcut with its target tool id`);
          const shortcutPresetCount = await page.locator("[data-prep-shortcuts] a[data-analytics-target-preset]").count();
          assert(shortcutPresetCount === 6, `${route.path} should tag preset-backed prep shortcuts with their target preset`);
          const shortcutText = await page.locator("[data-prep-shortcuts]").textContent();
          assert(
            shortcutText?.includes("파일 형식 오류") &&
              shortcutText.includes("용량 초과") &&
              shortcutText.includes("크기 제한") &&
              shortcutText.includes("여러 장 PDF"),
            `${route.path} should expose problem-situation shortcut labels`
          );
          const expectedShortcutLinks = [
            "/tools/image-converter/?preset=jpg&source=prep-shortcut&shortcut_id=format-jpg",
            "/tools/heic-jpg-converter/?preset=jpg&source=prep-shortcut&shortcut_id=heic-jpg",
            "/tools/photo-size-reducer/?preset=1mb&source=prep-shortcut&shortcut_id=compress-1mb",
            "/tools/image-resizer/?preset=long-1200&source=prep-shortcut&shortcut_id=resize-long-1200",
            "/tools/image-rotator/?preset=right&source=prep-shortcut&shortcut_id=rotate-right",
            "/tools/image-cropper/?preset=document&source=prep-shortcut&shortcut_id=crop-document",
            "/tools/jpg-to-pdf-converter/?from=prep-shortcut&source=prep-shortcut&shortcut_id=bundle-jpg-pdf"
          ];
          for (const href of expectedShortcutLinks) {
            const count = await page.locator(`[data-prep-shortcuts] a[href="${href}"]`).count();
            assert(count === 1, `${route.path} should include one prep shortcut to ${href}`);
          }
        }
      }

      if (route.path === "/tools/") {
        const problemHubQuickLink = await page.locator('.quick-links a[href="/problems/"]').count();
        assert(problemHubQuickLink === 1, `${route.path} should expose the problem hub from catalog quick links`);
        const catalogShortcutRows = await page.locator("[data-prep-shortcuts] .shortcut-row").count();
        assert(catalogShortcutRows === 7, `${route.path} should render prep shortcuts as compact rows`);
        const problemEntryRows = await page.locator("[data-problem-entry-list] .workflow-row").count();
        assert(problemEntryRows === 7, `${route.path} should link to seven problem intent pages`);
        const problemEntryHref = await page
          .locator('[data-problem-entry-list] a[href="/problems/photo-under-1mb/"]')
          .count();
        assert(problemEntryHref === 1, `${route.path} should link to the 1MB photo problem page`);
        const catalogRootCount = await page.locator("[data-tool-catalog]").count();
        assert(catalogRootCount === 1, `${route.path} should render one searchable tool catalog`);
        const catalogQuickStartCount = await page.locator("[data-catalog-quick-start]").count();
        assert(catalogQuickStartCount === 4, `${route.path} should expose four catalog quick-start links`);
        const catalogQuickStartHrefs = await page
          .locator("[data-catalog-quick-start]")
          .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
        [
          "/tools/jpg-to-pdf-converter/?from=quick-start&source=catalog-quick-start",
          "/tools/photo-size-reducer/?preset=1mb&source=catalog-quick-start",
          "/tools/heic-jpg-converter/?preset=jpg&source=catalog-quick-start",
          "/tools/transaction-statement-generator/?source=catalog-quick-start"
        ].forEach((href) => {
          assert(catalogQuickStartHrefs.includes(href), `${route.path} should include catalog quick-start link ${href}`);
        });
        const catalogQuickStartAnalyticsCount = await page
          .locator('[data-catalog-quick-start][data-analytics-event="catalog_quick_start_click"][data-analytics-tool-id]')
          .count();
        assert(
          catalogQuickStartAnalyticsCount === 4,
          `${route.path} should tag every catalog quick-start link for analytics`
        );
        const catalogRowCount = await page.locator("[data-tool-search-item]").count();
        const catalogToolRowCount = await page.locator('[data-tool-search-item][data-tool-search-kind="tool"]').count();
        const catalogProblemRowCount = await page.locator('[data-tool-search-item][data-tool-search-kind="problem"]').count();
        assert(catalogToolRowCount >= 16, `${route.path} should render all tool rows in the catalog`);
        assert(catalogProblemRowCount === 7, `${route.path} should render seven search-only problem rows in the catalog`);
        const initialVisibleRows = await page.locator("[data-tool-search-item]:not([hidden])").count();
        assert(
          initialVisibleRows === catalogToolRowCount && catalogRowCount === catalogToolRowCount + catalogProblemRowCount,
          `${route.path} should show only tools before searching and keep problem rows search-only`
        );
        await page.locator('[data-tool-filter="image"]').click();
        const imageVisibleRows = await page.locator("[data-tool-search-item]:not([hidden])").count();
        const imageResultText = await page.locator("[data-tool-result-count]").textContent();
        assert(imageVisibleRows === 6 && imageResultText?.includes("6개"), `${route.path} should filter to six image tools`);
        await page.locator("[data-tool-search]").fill("HEIC");
        await page.waitForTimeout(450);
        const heicVisibleRows = await page.locator("[data-tool-search-item]:not([hidden])").count();
        const heicVisibleText = (await page.locator("[data-tool-search-item]:not([hidden])").allTextContents()).join(" ");
        assert(
          heicVisibleRows >= 2 &&
            heicVisibleText?.includes("HEIC JPG 변환") &&
            heicVisibleText.includes("HEIC JPG 제출 준비"),
          `${route.path} should search tools and problem pages within the selected category`
        );
        await page.locator('[data-tool-filter="all"]').click();
        const catalogIntentSearches = [
          ["업로드 용량 초과", "사진 1MB 이하로 줄이기"],
          ["사진이 옆으로", "사진 방향 바로잡기"],
          ["지원하지 않는 파일 형식", "파일 형식 오류 해결"]
        ];
        for (const [query, expectedTitle] of catalogIntentSearches) {
          await page.locator("[data-tool-search]").fill(query);
          await page.waitForTimeout(450);
          const intentRows = await page.locator('[data-tool-search-item][data-tool-search-kind="problem"]:not([hidden])').count();
          const intentText = (await page.locator("[data-tool-search-item]:not([hidden])").allTextContents()).join(" ");
          assert(
            intentRows >= 1 && intentText.includes(expectedTitle),
            `${route.path} should match "${query}" to "${expectedTitle}" from catalog search`
          );
        }
        await page.goto(`${baseUrl}/tools/?q=${encodeURIComponent("업로드 용량 초과")}`, { waitUntil: "networkidle" });
        const catalogUrlQueryValue = await page.locator("[data-tool-search]").inputValue();
        const catalogUrlQueryText = (await page.locator("[data-tool-search-item]:not([hidden])").allTextContents()).join(" ");
        const catalogUrlResultText = await page.locator("[data-tool-result-count]").textContent();
        assert(
          catalogUrlQueryValue === "업로드 용량 초과" &&
            catalogUrlQueryText.includes("사진 1MB 이하로 줄이기") &&
            catalogUrlResultText?.includes("결과"),
          `${route.path} should restore catalog search results from the q URL parameter`
        );
        await page.locator("[data-tool-search]").fill("없는도구");
        await page.waitForTimeout(450);
        const emptyVisibleRows = await page.locator("[data-tool-search-item]:not([hidden])").count();
        const emptyHidden = await page.locator("[data-tool-empty]").getAttribute("hidden");
        const emptySuggestionHidden = await page.locator("[data-tool-empty-suggestions]").getAttribute("hidden");
        const emptySuggestionLinks = await page.locator("[data-tool-empty-suggestions] a").count();
        assert(emptyVisibleRows === 0 && emptyHidden === null, `${route.path} should show an empty catalog state`);
        assert(
          emptySuggestionHidden === null && emptySuggestionLinks === 4,
          `${route.path} should show four recovery links for empty catalog search`
        );
        const events = [];
        await page.exposeFunction("captureCatalogEvent", (payload) => {
          events.push(payload);
        });
        await page.addInitScript(() => {
          window.addEventListener("kdoc:analytics", (event) => {
            window["captureCatalogEvent"]?.(event.detail);
          });
        });
        await page.reload({ waitUntil: "networkidle" });
        await page.locator("[data-tool-search]").fill("SECRET-CATALOG-QUERY");
        await page.waitForTimeout(450);
        const eventText = JSON.stringify(events);
        assert(!eventText.includes("SECRET-CATALOG-QUERY"), `${route.path} should not send raw catalog search text`);
        assert(
          eventText.includes("catalog_search_change") && eventText.includes("search_query_length"),
          `${route.path} should track catalog search using only metadata`
        );
      }

      if (route.workflowPackage) {
        const workflowRootCount = await page
          .locator(`[data-workflow-package="${route.workflowPackage}"]`)
          .count();
        assert(workflowRootCount === 1, `${route.path} should tag the workflow package root`);
        const workflowText = await page.locator("[data-workflow-package]").textContent();
        assert(
          workflowText?.includes("막히는 상황 선택") &&
            workflowText.includes("추천 순서") &&
            workflowText.includes("이 흐름에 필요한 도구"),
          `${route.path} should render problem, sequence, and tool sections`
        );
        const primaryActionCount = await page.locator("[data-workflow-primary-action]").count();
        assert(primaryActionCount === 1, `${route.path} should expose one first-screen primary workflow action`);
        const primaryActionText = await page.locator("[data-workflow-primary-action]").textContent();
        const primaryActionHref = await page.locator("[data-workflow-primary-action]").getAttribute("href");
        const primaryActionPackage = await page.locator("[data-workflow-primary-action]").getAttribute("data-analytics-package-id");
        const primaryActionProblem = await page.locator("[data-workflow-primary-action]").getAttribute("data-analytics-problem-id");
        const primaryActionTargetTool = await page.locator("[data-workflow-primary-action]").getAttribute("data-analytics-target-tool-id");
        assert(
          primaryActionText?.includes("바로 시작") &&
            primaryActionHref?.startsWith("/tools/") &&
            primaryActionPackage === route.workflowPackage &&
            Boolean(primaryActionProblem) &&
            Boolean(primaryActionTargetTool),
          `${route.path} primary workflow action should jump to a tagged tool preset`
        );
        const stepsLinkHref = await page.locator("[data-workflow-steps-link]").getAttribute("href");
        const stepsSectionCount = await page.locator("#workflow-steps").count();
        const problemsSectionCount = await page.locator("#workflow-problems").count();
        assert(
          stepsLinkHref === "#workflow-steps" && stepsSectionCount === 1 && problemsSectionCount === 1,
          `${route.path} should expose direct anchors for workflow problems and steps`
        );
        const problemClickCount = await page.locator('[data-analytics-event="package_problem_click"]').count();
        assert(problemClickCount >= 6, `${route.path} should render package problem shortcuts`);
        const problemPackageIds = await page
          .locator('[data-analytics-event="package_problem_click"]')
          .evaluateAll((links) => links.map((link) => link.getAttribute("data-analytics-package-id")));
        assert(
          problemPackageIds.every((packageId) => packageId === route.workflowPackage),
          `${route.path} should tag every problem shortcut with the package id`
        );
        const targetToolCount = await page.locator('[data-analytics-event="package_problem_click"][data-analytics-target-tool-id]').count();
        assert(targetToolCount === problemClickCount, `${route.path} should tag every problem shortcut with a target tool`);
        const packageToolClickCount = await page.locator('[data-analytics-event="package_tool_click"]').count();
        assert(packageToolClickCount >= 4, `${route.path} should track package step and tool clicks`);
        const packageToolIds = await page
          .locator('[data-analytics-event="package_tool_click"]')
          .evaluateAll((links) => links.map((link) => link.getAttribute("data-analytics-package-id")));
        assert(
          packageToolIds.every((packageId) => packageId === route.workflowPackage),
          `${route.path} should tag every package tool click with the package id`
        );
      }

      if (route.problemHub) {
        const problemHubRootCount = await page.locator("[data-problem-hub]").count();
        assert(problemHubRootCount === 1, `${route.path} should render one problem hub section`);
        const problemRows = await page.locator("[data-problem-hub] .workflow-row").count();
        assert(problemRows === 7, `${route.path} should link to seven problem intent pages`);
        const problemHubText = await page.locator("[data-problem-hub]").textContent();
        assert(
          problemHubText?.includes("파일 형식 오류 해결") &&
            problemHubText.includes("사진 1MB 이하로 줄이기") &&
            problemHubText.includes("여러 장 이미지 PDF로 묶기"),
          `${route.path} should expose the main problem intents`
        );
        const photoProblemHref = await page
          .locator('[data-problem-hub] a[href="/problems/photo-under-1mb/"]')
          .count();
        assert(photoProblemHref === 1, `${route.path} should link to the 1MB photo problem page`);
        const taggedProblemRows = await page
          .locator(
            '[data-problem-hub] a[data-analytics-event="problem_hub_click"][data-analytics-target-problem-id][data-analytics-target-tool-id]'
          )
          .count();
        assert(taggedProblemRows === 7, `${route.path} should tag every problem row with problem and tool metadata`);
        const jsonLdItems = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) =>
          nodes.map((node) => JSON.parse(node.textContent || "{}"))
        );
        const collectionPage = jsonLdItems.find((item) => item["@type"] === "CollectionPage");
        assert(
          collectionPage?.mainEntity?.itemListElement?.length === 7,
          `${route.path} should expose a CollectionPage ItemList for problem pages`
        );
      }

      if (route.problemPage) {
        const problemRootCount = await page.locator("[data-problem-page]").count();
        assert(problemRootCount === 1, `${route.path} should tag the problem page root`);
        const problemId = await page.locator("[data-problem-page]").getAttribute("data-problem-id");
        const problemTitle = await page.locator("[data-problem-page]").getAttribute("data-problem-title");
        assert(problemId && problemTitle, `${route.path} should expose stable problem analytics metadata`);
        const pageViewEvent = await page.evaluate(() => {
          return window.dataLayer?.find((event) => event.event === "page_view");
        });
        assert(
          pageViewEvent?.problem_id === problemId && pageViewEvent.problem_title === problemTitle,
          `${route.path} page_view should include problem analytics context`
        );
        const problemJsonLdItems = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) =>
          nodes.map((node) => JSON.parse(node.textContent || "{}"))
        );
        const webPageSchema = problemJsonLdItems.find((item) => item["@type"] === "WebPage");
        assert(
          webPageSchema?.url === `${productionUrl}${route.path}` &&
            webPageSchema.name?.includes(problemTitle) &&
            typeof webPageSchema.keywords === "string" &&
            webPageSchema.keywords.includes(problemTitle.split(" ")[0]),
          `${route.path} should expose a WebPage schema with URL, title, and problem keywords`
        );
        const primaryLink = page.locator("[data-problem-primary-link]");
        const primaryLinkCount = await primaryLink.count();
        assert(primaryLinkCount === 1, `${route.path} should expose one primary problem CTA`);
        const primaryHref = await primaryLink.getAttribute("href");
        assert(primaryHref?.startsWith("/tools/"), `${route.path} primary CTA should send users to a tool`);
        const primaryTargetUrl = new URL(primaryHref, baseUrl);
        assert(
          primaryTargetUrl.searchParams.get("source") === "problem" &&
            primaryTargetUrl.searchParams.get("problem_id") === problemId,
          `${route.path} primary CTA should carry a whitelisted problem source into the target tool`
        );
        await page.evaluate(() => {
          document.querySelector("[data-problem-primary-link]")?.addEventListener(
            "click",
            (event) => event.preventDefault(),
            { once: true }
          );
        });
        await primaryLink.click();
        const primaryClickEvent = await page.evaluate(() => {
          return window.dataLayer?.findLast?.((event) => event.event === "problem_primary_tool_click");
        });
        assert(
          primaryClickEvent?.problem_id === problemId &&
            primaryClickEvent.problem_title === problemTitle &&
            primaryClickEvent.tool_id &&
            primaryClickEvent.tool_title,
          `${route.path} primary CTA analytics should include problem and target tool context`
        );
        const arrivalPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
        try {
          await arrivalPage.goto(`${baseUrl}${primaryHref}`, { waitUntil: "networkidle" });
          const arrivalEvent = await arrivalPage.evaluate(() => {
            return window.dataLayer?.find((event) => event.event === "tool_problem_arrival");
          });
          assert(
            arrivalEvent?.source === "problem" &&
              arrivalEvent.problem_id === problemId &&
              arrivalEvent.problem_title === problemTitle &&
              arrivalEvent.tool_id &&
              arrivalEvent.tool_title,
            `${route.path} target tool page should emit a problem-source arrival event`
          );
          const arrivalBannerCount = await arrivalPage.locator("[data-problem-arrival]:not([hidden])").count();
          const arrivalBannerText = await arrivalPage.locator("[data-problem-arrival]").textContent();
          const arrivalBackHref = await arrivalPage.locator("[data-problem-arrival-link]").evaluate((link) => link.href);
          assert(
            arrivalBannerCount === 1 &&
              arrivalBannerText?.includes(problemTitle) &&
              arrivalBackHref === `${baseUrl}${route.path}`,
            `${route.path} target tool page should show a contextual problem arrival banner`
          );
          await arrivalPage.evaluate(() => {
            document.querySelector("[data-problem-arrival-link]")?.addEventListener(
              "click",
              (event) => event.preventDefault(),
              { once: true }
            );
          });
          await arrivalPage.locator("[data-problem-arrival-link]").click();
          const backClickEvent = await arrivalPage.evaluate(() => {
            return window.dataLayer?.findLast?.((event) => event.event === "problem_arrival_back_click");
          });
          assert(
            backClickEvent?.target_problem_id === problemId &&
              backClickEvent.target_problem_title === problemTitle &&
              backClickEvent.tool_id &&
              backClickEvent.tool_title,
            `${route.path} problem arrival back link should include problem and tool analytics context`
          );
        } finally {
          await arrivalPage.close();
        }
        const actionLinkCount = await page.locator('[data-problem-action] a[data-analytics-event="problem_tool_click"]').count();
        assert(actionLinkCount === 1, `${route.path} should track the recommended tool click`);
        const intentTagCount = await page.locator("[data-problem-intents] .meta-tag").count();
        assert(intentTagCount === 6, `${route.path} should expose six visible blocked-state intent phrases`);
        const intentText = await page.locator("[data-problem-intents]").textContent();
        if (route.path === "/problems/photo-under-1mb/") {
          assert(intentText?.includes("업로드 용량 초과"), `${route.path} should expose the upload-size blocked state`);
        }
        if (route.path === "/problems/sideways-scan/") {
          assert(intentText?.includes("사진이 옆으로"), `${route.path} should expose the sideways-photo blocked state`);
        }
        const stepRows = await page.locator("[data-problem-steps] .workflow-row").count();
        assert(stepRows >= 4, `${route.path} should render a short handling sequence`);
        const relatedRows = await page.locator("[data-related-problems] .workflow-row").count();
        assert(relatedRows === 3, `${route.path} should link to three adjacent problem pages`);
        const relatedTargetProblemCount = await page
          .locator("[data-related-problems] a[data-analytics-target-problem-id][data-analytics-target-problem-title]")
          .count();
        assert(relatedTargetProblemCount === 3, `${route.path} should tag adjacent problem links with target problem metadata`);
        const faqRows = await page.locator("[data-problem-faq] details").count();
        assert(faqRows >= 5, `${route.path} should render problem FAQs`);
      }

      if (route.path === "/categories/image/" || route.path === "/categories/pdf/") {
        const shortcutRootCount = await page.locator("[data-prep-shortcuts]").count();
        assert(shortcutRootCount === 1, `${route.path} should render one category prep shortcut section`);
        const shortcutClickCount = await page
          .locator('[data-prep-shortcuts] a[data-analytics-event="category_prep_shortcut_click"]')
          .count();
        assert(shortcutClickCount === 7, `${route.path} should track seven category prep shortcuts`);
        const shortcutIdCount = await page.locator("[data-prep-shortcuts] a[data-analytics-shortcut-id]").count();
        assert(shortcutIdCount === 7, `${route.path} should tag each category prep shortcut with a stable shortcut id`);
        const shortcutToolCount = await page.locator("[data-prep-shortcuts] a[data-analytics-tool-id]").count();
        assert(shortcutToolCount === 7, `${route.path} should tag each category prep shortcut with its target tool id`);
        const shortcutPresetCount = await page.locator("[data-prep-shortcuts] a[data-analytics-target-preset]").count();
        assert(shortcutPresetCount === 6, `${route.path} should tag preset-backed category prep shortcuts with their target preset`);
        const shortcutText = await page.locator("[data-prep-shortcuts]").textContent();
        assert(
          shortcutText?.includes("파일 형식 오류") &&
            shortcutText.includes("iPhone HEIC") &&
            shortcutText.includes("용량 초과") &&
            shortcutText.includes("여러 장 PDF"),
          `${route.path} should expose category problem-situation shortcut labels`
        );
        const expectedShortcutLinks = [
          "/tools/image-converter/?preset=jpg&source=prep-shortcut&shortcut_id=format-jpg",
          "/tools/heic-jpg-converter/?preset=jpg&source=prep-shortcut&shortcut_id=heic-jpg",
          "/tools/photo-size-reducer/?preset=1mb&source=prep-shortcut&shortcut_id=compress-1mb",
          "/tools/image-resizer/?preset=long-1200&source=prep-shortcut&shortcut_id=resize-long-1200",
          "/tools/image-rotator/?preset=right&source=prep-shortcut&shortcut_id=rotate-right",
          "/tools/image-cropper/?preset=document&source=prep-shortcut&shortcut_id=crop-document",
          "/tools/jpg-to-pdf-converter/?from=prep-shortcut&source=prep-shortcut&shortcut_id=bundle-jpg-pdf"
        ];
        for (const href of expectedShortcutLinks) {
          const count = await page.locator(`[data-prep-shortcuts] a[href="${href}"]`).count();
          assert(count === 1, `${route.path} should include one category prep shortcut to ${href}`);
        }
      }

      if (route.path.startsWith("/categories/")) {
        const categoryMainText = await page.locator("main").textContent();
        assert(
          !categoryMainText?.includes("다음 PDF 도구 후보") &&
            !categoryMainText?.includes("다음 이미지 도구 후보") &&
            !categoryMainText?.includes("업무 문서 도구를 먼저 키우는 이유") &&
            !categoryMainText?.includes("PDF 합치기나 압축"),
          `${route.path} should show usable tools only, not roadmap or strategy copy`
        );
      }

      if (route.submissionPrep) {
        const pdfPathStepCount = await page.locator("[data-pdf-path] a").count();
        assert(pdfPathStepCount >= 5, `${route.path} should render the highlighted PDF submission path`);
        const pdfPathCtaCount = await page
          .locator('[data-pdf-path] a[href="/tools/jpg-to-pdf-converter/"][data-analytics-label="PDF 묶기 CTA"]')
          .count();
        assert(pdfPathCtaCount === 1, `${route.path} should include one highlighted JPG PDF CTA`);
        const pdfDecisionText = await page.locator("[data-pdf-decision]").textContent();
        assert(
          pdfDecisionText?.includes("용량 초과") &&
            pdfDecisionText.includes("파일 형식 오류") &&
            pdfDecisionText.includes("변환 후 PDF") &&
            pdfDecisionText.includes("사진압축 먼저") &&
            pdfDecisionText.includes("JPG PDF 변환"),
          `${route.path} should explain error-message-driven PDF prep decisions`
        );
        const pdfDecisionClickCount = await page.locator('[data-analytics-event="prep_pdf_decision_click"]').count();
        assert(pdfDecisionClickCount >= 5, `${route.path} should track PDF decision hint clicks`);
        const formatPathText = await page.locator("[data-format-path]").textContent();
        assert(
          formatPathText?.includes("형식 오류가 뜰 때") &&
            formatPathText.includes("HEIC") &&
            formatPathText.includes("WebP") &&
            formatPathText.includes("PDF로 묶기"),
          `${route.path} should highlight the format-error-to-PDF prep path`
        );
        const formatPathClickCount = await page.locator('[data-analytics-event="prep_format_path_click"]').count();
        assert(formatPathClickCount === 3, `${route.path} should track the three format path steps`);
        const compressionPathText = await page.locator("[data-compression-path]").textContent();
        assert(
          compressionPathText?.includes("용량 초과가 뜰 때") &&
            compressionPathText.includes("500KB") &&
            compressionPathText.includes("1MB") &&
            compressionPathText.includes("3MB") &&
            compressionPathText.includes("PDF로 묶기"),
          `${route.path} should highlight the compression-limit-to-PDF prep path`
        );
        const compressionPathClickCount = await page.locator('[data-analytics-event="prep_compression_path_click"]').count();
        assert(compressionPathClickCount === 4, `${route.path} should track the four compression path steps`);
        const resizePresetRouteCount = await page.locator('[data-submission-prep] a[href="/tools/image-resizer/?preset=long-1200"]').count();
        assert(resizePresetRouteCount >= 3, `${route.path} should route image size limits to the 1200px resize preset`);
        const cropPresetRouteCount = await page.locator('[data-submission-prep] a[href="/tools/image-cropper/?preset=document"]').count();
        assert(cropPresetRouteCount >= 3, `${route.path} should route margin/background issues to the document crop preset`);
        const rotationPresetRouteCount = await page.locator('[data-submission-prep] a[href="/tools/image-rotator/?preset=right"]').count();
        assert(rotationPresetRouteCount >= 4, `${route.path} should route sideways images to the right-rotation preset`);
        const imageFormatPresetRouteCount = await page.locator('[data-submission-prep] a[href="/tools/image-converter/?preset=jpg"]').count();
        assert(imageFormatPresetRouteCount >= 4, `${route.path} should route format errors to the JPG image-converter preset`);
        const heicPresetRouteCount = await page.locator('[data-submission-prep] a[href="/tools/heic-jpg-converter/?preset=jpg"]').count();
        assert(heicPresetRouteCount >= 4, `${route.path} should route HEIC errors to the JPG HEIC preset`);
        const situationCount = await page.locator(".situation-link").count();
        assert(situationCount >= 6, `${route.path} should render situation-based routing links`);
        const expectedLinks = [
          "/tools/heic-jpg-converter/",
          "/tools/image-converter/",
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
        if (route.path === "/tools/transaction-statement-generator/") {
          await page.goto(`${baseUrl}${route.path}?source=home-quick-start`, { waitUntil: "networkidle" });
          const documentQuickStartArrivalEvent = await page.evaluate(() => {
            return window.dataLayer?.findLast?.((event) => event.event === "document_tool_quick_start_arrival");
          });
          assert(
            documentQuickStartArrivalEvent?.tool_id === "transaction-statement" &&
              documentQuickStartArrivalEvent.document_title === "거래명세서" &&
              documentQuickStartArrivalEvent.source === "home-quick-start",
            `${route.path} should track document quick-start arrivals with source`
          );
          await page.evaluate(() => {
            window.print = () => {
              window.__kdocPrintCalled = true;
            };
          });
          await page.locator("[data-print]").click();
          const printEvent = await page.evaluate(() => {
            return {
              event: window.dataLayer?.findLast?.((item) => item.event === "tool_print"),
              printCalled: window.__kdocPrintCalled === true
            };
          });
          assert(
            printEvent.printCalled &&
              printEvent.event?.tool_id === "transaction-statement" &&
              printEvent.event.document_title === "거래명세서" &&
              printEvent.event.source === "home-quick-start" &&
              printEvent.event.row_count >= 1,
            `${route.path} should preserve quick-start source through print/PDF analytics`
          );
        }
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
        const pdfUploadState = await page.locator("[data-upload-zone]").evaluate((zone) => {
          const rect = zone.getBoundingClientRect();
          return { height: rect.height, text: zone.textContent || "" };
        });
        assert(
          pdfUploadState.height >= 300 &&
            pdfUploadState.text.includes("사진을 여기로 끌어다 놓으세요") &&
            pdfUploadState.text.includes("사진 선택") &&
            pdfUploadState.text.includes("무료") &&
            pdfUploadState.text.includes("설치 없음") &&
            pdfUploadState.text.includes("서버 전송 없음") &&
            pdfUploadState.text.includes("최대 20장"),
          `${route.path} should make the upload area the primary first-screen action`
        );
        const compressedIntakeText = await page.locator("[data-compressed-intake]").textContent();
        assert(
          compressedIntakeText?.includes("정리한 이미지로 PDF 만들기") &&
            compressedIntakeText.includes("사진 용량 줄이기") &&
            compressedIntakeText.includes("이미지 편집") &&
            compressedIntakeText.includes("형식 변환"),
          `${route.path} should explain the compressed-image-to-PDF arrival flow`
        );
        await page.locator("[data-sample]").click();
        await page.waitForFunction(() => document.querySelectorAll(".file-row").length === 2);
        const preflightAfterSample = await page.locator("[data-preflight]").textContent();
        assert(
          preflightAfterSample?.includes("2장 선택됨") &&
            preflightAfterSample.includes("목록 순서대로 PDF 페이지"),
          `${route.path} should update the preflight checklist after sample selection`
        );
        const sizesBefore = await page.locator(".file-row p").allTextContents();
        await page.locator(".file-row").first().scrollIntoViewIfNeeded();
        await page.locator(".file-row").nth(1).scrollIntoViewIfNeeded();
        await page.locator(".file-row").first().dragTo(page.locator(".file-row").nth(1));
        const sizesAfterDrag = await page.locator(".file-row p").allTextContents();
        assert(
          sizesBefore.length === 2 &&
            sizesBefore[0] === sizesAfterDrag[1] &&
            sizesBefore[1] === sizesAfterDrag[0],
          `${route.path} should drag reorder selected images before PDF generation`
        );
        await page.locator('[data-move-file="1"][data-direction="up"]').click();
        const sizesAfterButton = await page.locator(".file-row p").allTextContents();
        assert(
          sizesAfterButton[0] === sizesBefore[0] && sizesAfterButton[1] === sizesBefore[1],
          `${route.path} should button reorder selected images before PDF generation`
        );
        await page.locator("[data-generate]").click();
        await page.waitForFunction(() => {
          const status = document.querySelector("[data-output-status]")?.textContent || "";
          const link = document.querySelector("[data-download]");
          return status.includes("PDF 준비 완료") && link?.href.startsWith("blob:");
        });
        const preflightAfterGenerate = await page.locator("[data-preflight]").textContent();
        assert(
          preflightAfterGenerate?.includes("저장 준비 완료"),
          `${route.path} should show the PDF is ready in the preflight checklist`
        );
        const pdfDownloadHint = await page.locator("[data-pdf-download-hint]").textContent();
        const pdfDownloadHintHidden = await page.locator("[data-pdf-download-hint]").getAttribute("hidden");
        assert(
          pdfDownloadHintHidden === null && pdfDownloadHint?.includes("PDF 저장을 눌러"),
          `${route.path} should make the final PDF save action obvious after generation`
        );
        const fileCount = await page.locator(".file-row").count();
        assert(fileCount === 2, `${route.path} should render two sample image rows`);
        await page.locator('[data-remove-file="0"]').click();
        const reducedFileCount = await page.locator(".file-row").count();
        const reducedStatus = await page.locator("[data-output-status]").textContent();
        assert(reducedFileCount === 1 && reducedStatus.includes("1장"), `${route.path} should remove one selected image`);

        await page.goto(`${baseUrl}${route.path}?from=quick-start&source=home-quick-start`, { waitUntil: "networkidle" });
        const quickStartIntakeState = await page.locator("[data-compressed-intake]").getAttribute("data-state");
        const quickStartArrivalText = await page.locator("[data-compressed-intake]").textContent();
        const quickStartLayout = await page.evaluate(() => ({
          intakeTop: document.querySelector("[data-compressed-intake]")?.getBoundingClientRect().top || 0,
          uploadTop: document.querySelector("[data-upload-zone]")?.getBoundingClientRect().top || 0
        }));
        const quickStartArrivalEvent = await page.evaluate(() => {
          return window.dataLayer?.findLast?.((event) => event.event === "jpg_pdf_quick_start_arrival");
        });
        assert(
          quickStartIntakeState === "highlight" &&
            quickStartArrivalText?.includes("여러 장 이미지 PDF로 묶기") &&
            quickStartArrivalText.includes("제출용 PDF") &&
            quickStartLayout.intakeTop < quickStartLayout.uploadTop &&
            quickStartArrivalEvent?.source === "home-quick-start",
          `${route.path} should tailor the arrival cue for quick-start visitors`
        );
        await page.goto(`${baseUrl}${route.path}?from=prep-shortcut&source=prep-shortcut&shortcut_id=bundle-jpg-pdf`, { waitUntil: "networkidle" });
        const prepShortcutArrivalEvent = await page.evaluate(() => {
          return window.dataLayer?.findLast?.((event) => event.event === "jpg_pdf_prep_shortcut_arrival");
        });
        assert(
          prepShortcutArrivalEvent?.source === "prep-shortcut" &&
            prepShortcutArrivalEvent.shortcut_id === "bundle-jpg-pdf",
          `${route.path} should preserve prep shortcut id on JPG PDF arrival analytics`
        );

        await page.goto(`${baseUrl}${route.path}?from=compressed-images`, { waitUntil: "networkidle" });
        const compressedIntakeState = await page.locator("[data-compressed-intake]").getAttribute("data-state");
        assert(
          compressedIntakeState === "highlight",
          `${route.path} should highlight the compressed-image arrival cue when opened from the compressor`
        );
        const compressedArrivalText = await page.locator("[data-compressed-intake]").textContent();
        assert(
          compressedArrivalText?.includes("압축 이미지로 PDF 만들기"),
          `${route.path} should tailor the arrival cue for compressed images`
        );

        await page.goto(`${baseUrl}${route.path}?from=rotated-images`, { waitUntil: "networkidle" });
        const rotatedIntakeState = await page.locator("[data-compressed-intake]").getAttribute("data-state");
        const rotatedArrivalText = await page.locator("[data-compressed-intake]").textContent();
        assert(
          rotatedIntakeState === "highlight" && rotatedArrivalText?.includes("회전한 이미지로 PDF 만들기"),
          `${route.path} should tailor the arrival cue for rotated images`
        );

        await page.goto(`${baseUrl}${route.path}?from=resized-images`, { waitUntil: "networkidle" });
        const resizedIntakeState = await page.locator("[data-compressed-intake]").getAttribute("data-state");
        const resizedArrivalText = await page.locator("[data-compressed-intake]").textContent();
        assert(
          resizedIntakeState === "highlight" && resizedArrivalText?.includes("리사이즈한 이미지로 PDF 만들기"),
          `${route.path} should tailor the arrival cue for resized images`
        );

        await page.goto(`${baseUrl}${route.path}?from=cropped-images`, { waitUntil: "networkidle" });
        const croppedIntakeState = await page.locator("[data-compressed-intake]").getAttribute("data-state");
        const croppedArrivalText = await page.locator("[data-compressed-intake]").textContent();
        assert(
          croppedIntakeState === "highlight" && croppedArrivalText?.includes("잘라낸 이미지로 PDF 만들기"),
          `${route.path} should tailor the arrival cue for cropped images`
        );

        await page.goto(`${baseUrl}${route.path}?from=format-converted-images`, { waitUntil: "networkidle" });
        const formatConvertedIntakeState = await page.locator("[data-compressed-intake]").getAttribute("data-state");
        const formatConvertedArrivalText = await page.locator("[data-compressed-intake]").textContent();
        assert(
          formatConvertedIntakeState === "highlight" &&
            formatConvertedArrivalText?.includes("변환한 이미지로 PDF 만들기"),
          `${route.path} should tailor the arrival cue for format-converted images`
        );

        await page.goto(`${baseUrl}${route.path}?from=heic-converted-images`, { waitUntil: "networkidle" });
        const heicConvertedIntakeState = await page.locator("[data-compressed-intake]").getAttribute("data-state");
        const heicConvertedArrivalText = await page.locator("[data-compressed-intake]").textContent();
        assert(
          heicConvertedIntakeState === "highlight" &&
            heicConvertedArrivalText?.includes("HEIC 변환 이미지로 PDF 만들기"),
          `${route.path} should tailor the arrival cue for HEIC-converted images`
        );
      }

      if (route.imageCompressor) {
        const compressorUploadState = await page.locator(".upload-dropzone").evaluate((zone) => {
          const rect = zone.getBoundingClientRect();
          return { height: rect.height, text: zone.textContent || "" };
        });
        assert(
          compressorUploadState.height >= 220 &&
            compressorUploadState.text.includes("사진을 선택하세요") &&
            compressorUploadState.text.includes("파일 선택") &&
            compressorUploadState.text.includes("무료") &&
            compressorUploadState.text.includes("설치 없음") &&
            compressorUploadState.text.includes("서버 전송 없음") &&
            compressorUploadState.text.includes("최대 20장"),
          `${route.path} should expose a large direct photo upload area`
        );
        const compressionCheck = await page.locator("[data-compression-check]").textContent();
        assert(
          compressionCheck?.includes("1MB 이하") && compressionCheck.includes("JPG"),
          `${route.path} should show the default submission compression target`
        );
        await page.goto(`${baseUrl}${route.path}?preset=500kb`, { waitUntil: "networkidle" });
        const presetCompressionCheck = await page.locator("[data-compression-check]").textContent();
        const presetNote = await page.locator("[data-preset-note]").textContent();
        const presetArrivalText = await page.locator("[data-preset-arrival]").textContent();
        const presetArrivalHidden = await page.locator("[data-preset-arrival]").getAttribute("hidden");
        assert(
          presetCompressionCheck?.includes("500KB 이하") &&
            presetCompressionCheck.includes("JPG") &&
            presetNote?.includes("빡빡한") &&
            presetArrivalHidden === null &&
            presetArrivalText?.includes("500KB 이하로 시작"),
          `${route.path} should accept a URL preset for the 500KB compression target`
        );
        await page.goto(`${baseUrl}${route.path}?preset=1mb&source=home-quick-start`, { waitUntil: "networkidle" });
        const compressorPresetArrivalEvent = await page.evaluate(() => {
          return window.dataLayer?.findLast?.((event) => event.event === "image_compressor_preset_arrival");
        });
        assert(
          compressorPresetArrivalEvent?.source === "home-quick-start" &&
            compressorPresetArrivalEvent.preset === "1mb",
          `${route.path} should preserve quick-start source on compressor preset arrival analytics`
        );
        await page.goto(`${baseUrl}${route.path}?preset=1mb&source=prep-shortcut&shortcut_id=compress-1mb`, { waitUntil: "networkidle" });
        const compressorShortcutArrivalEvent = await page.evaluate(() => {
          return window.dataLayer?.findLast?.((event) => event.event === "image_compressor_preset_arrival");
        });
        assert(
          compressorShortcutArrivalEvent?.source === "prep-shortcut" &&
            compressorShortcutArrivalEvent.shortcut_id === "compress-1mb" &&
            compressorShortcutArrivalEvent.preset === "1mb",
          `${route.path} should preserve prep shortcut id on compressor preset arrival analytics`
        );
        await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
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
        const postCompressionCheck = await page.locator("[data-compression-check]").textContent();
        const compressedRowsText = await page.locator("[data-compress-list]").textContent();
        assert(
          postCompressionCheck?.includes("모두 1MB 이하 통과") && compressedRowsText?.includes("기준 통과"),
          `${route.path} should show submission target pass status after compression`
        );
        const nextPdfText = await page.locator("[data-next-pdf]").textContent();
        const nextPdfHref = await page.locator("[data-next-pdf-link]").getAttribute("href");
        assert(
          nextPdfText?.includes("다음 단계: PDF로 묶기") &&
            nextPdfText.includes("압축 이미지를 저장") &&
            nextPdfText.includes("저장 버튼을 먼저") &&
            nextPdfHref === "/tools/jpg-to-pdf-converter/?from=compressed-images",
          `${route.path} should offer a next-step CTA to the JPG PDF converter after compression`
        );
      }

      if (route.imageResizer) {
        await page.goto(`${baseUrl}${route.path}?preset=square-800`, { waitUntil: "networkidle" });
        const resizePresetState = await page.evaluate(() => ({
          preset: document.querySelector("[data-resize-preset]")?.value,
          mode: document.querySelector("[data-resize-mode]")?.value,
          width: document.querySelector("[data-target-width]")?.value,
          height: document.querySelector("[data-target-height]")?.value,
          keepAspect: document.querySelector("[data-keep-aspect]")?.checked,
          note: document.querySelector("[data-resize-preset-note]")?.textContent || ""
        }));
        assert(
          resizePresetState.preset === "square-800" &&
            resizePresetState.mode === "exact" &&
            resizePresetState.width === "800" &&
            resizePresetState.height === "800" &&
            resizePresetState.keepAspect === true &&
            resizePresetState.note.includes("800×800px"),
          `${route.path} should accept a URL preset for the 800x800-fit resize target`
        );
        await page.goto(`${baseUrl}${route.path}?preset=long-1200&source=prep-shortcut&shortcut_id=resize-long-1200`, { waitUntil: "networkidle" });
        const resizeShortcutArrivalEvent = await page.evaluate(() => {
          return window.dataLayer?.findLast?.((event) => event.event === "image_resize_preset_arrival");
        });
        assert(
          resizeShortcutArrivalEvent?.source === "prep-shortcut" &&
            resizeShortcutArrivalEvent.shortcut_id === "resize-long-1200" &&
            resizeShortcutArrivalEvent.preset === "long-1200",
          `${route.path} should preserve prep shortcut id on resize preset arrival analytics`
        );
        await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
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
        const nextPdfText = await page.locator("[data-next-pdf]").textContent();
        const nextPdfHref = await page.locator("[data-next-pdf-link]").getAttribute("href");
        assert(
          nextPdfText?.includes("다음 단계: PDF로 묶기") &&
            nextPdfText.includes("리사이즈 이미지를 저장") &&
            nextPdfText.includes("저장 버튼을 먼저") &&
            nextPdfHref === "/tools/jpg-to-pdf-converter/?from=resized-images",
          `${route.path} should offer a next-step CTA to the JPG PDF converter after resizing`
        );
      }

      if (route.imageCropper) {
        await page.goto(`${baseUrl}${route.path}?preset=profile`, { waitUntil: "networkidle" });
        const cropPresetState = await page.evaluate(() => ({
          preset: document.querySelector("[data-crop-preset]")?.value,
          aspect: document.querySelector("[data-aspect-preset]")?.value,
          outputFormat: document.querySelector("[data-output-format]")?.value,
          quality: document.querySelector("[data-quality]")?.value,
          note: document.querySelector("[data-crop-preset-note]")?.textContent || ""
        }));
        assert(
          cropPresetState.preset === "profile" &&
            cropPresetState.aspect === "1:1" &&
            cropPresetState.outputFormat === "image/jpeg" &&
            cropPresetState.quality === "90" &&
            cropPresetState.note.includes("프로필"),
          `${route.path} should accept a URL preset for the profile crop target`
        );
        await page.goto(`${baseUrl}${route.path}?preset=document&source=prep-shortcut&shortcut_id=crop-document`, { waitUntil: "networkidle" });
        const cropShortcutArrivalEvent = await page.evaluate(() => {
          return window.dataLayer?.findLast?.((event) => event.event === "image_crop_preset_arrival");
        });
        assert(
          cropShortcutArrivalEvent?.source === "prep-shortcut" &&
            cropShortcutArrivalEvent.shortcut_id === "crop-document" &&
            cropShortcutArrivalEvent.preset === "document",
          `${route.path} should preserve prep shortcut id on crop preset arrival analytics`
        );
        await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
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
        const nextPdfText = await page.locator("[data-next-pdf]").textContent();
        const nextPdfHref = await page.locator("[data-next-pdf-link]").getAttribute("href");
        assert(
          nextPdfText?.includes("다음 단계: PDF로 묶기") &&
            nextPdfText.includes("잘라낸 이미지를 저장") &&
            nextPdfText.includes("저장 버튼을 먼저") &&
            nextPdfHref === "/tools/jpg-to-pdf-converter/?from=cropped-images",
          `${route.path} should offer a next-step CTA to the JPG PDF converter after cropping`
        );
      }

      if (route.imageRotator) {
        await page.goto(`${baseUrl}${route.path}?preset=left`, { waitUntil: "networkidle" });
        const rotationPresetState = await page.evaluate(() => ({
          angle: document.querySelector("[data-rotation-angle]")?.value,
          note: document.querySelector("[data-rotation-preset-note]")?.textContent || ""
        }));
        assert(
          rotationPresetState.angle === "-90" && rotationPresetState.note.includes("왼쪽"),
          `${route.path} should accept a URL preset for left rotation`
        );
        await page.goto(`${baseUrl}${route.path}?preset=right&source=prep-shortcut&shortcut_id=rotate-right`, { waitUntil: "networkidle" });
        const rotateShortcutArrivalEvent = await page.evaluate(() => {
          return window.dataLayer?.findLast?.((event) => event.event === "image_rotate_preset_arrival");
        });
        assert(
          rotateShortcutArrivalEvent?.source === "prep-shortcut" &&
            rotateShortcutArrivalEvent.shortcut_id === "rotate-right" &&
            rotateShortcutArrivalEvent.preset === "right",
          `${route.path} should preserve prep shortcut id on rotation preset arrival analytics`
        );
        await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
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
        const nextPdfText = await page.locator("[data-next-pdf]").textContent();
        const nextPdfHref = await page.locator("[data-next-pdf-link]").getAttribute("href");
        assert(
          nextPdfText?.includes("다음 단계: PDF로 묶기") &&
            nextPdfText.includes("회전 이미지를 저장") &&
            nextPdfText.includes("저장 버튼을 먼저") &&
            nextPdfHref === "/tools/jpg-to-pdf-converter/?from=rotated-images",
          `${route.path} should offer a next-step CTA to the JPG PDF converter after rotation`
        );
      }

      if (route.imageConverter) {
        await page.goto(`${baseUrl}${route.path}?preset=png`, { waitUntil: "networkidle" });
        const formatPresetState = await page.evaluate(() => ({
          outputFormat: document.querySelector("[data-output-format]")?.value,
          quality: document.querySelector("[data-quality]")?.value,
          note: document.querySelector("[data-format-preset-note]")?.textContent || ""
        }));
        assert(
          formatPresetState.outputFormat === "image/png" &&
            formatPresetState.quality === "90" &&
            formatPresetState.note.includes("투명"),
          `${route.path} should accept a URL preset for PNG output`
        );
        await page.goto(`${baseUrl}${route.path}?preset=jpg&source=prep-shortcut&shortcut_id=format-jpg`, { waitUntil: "networkidle" });
        const convertShortcutArrivalEvent = await page.evaluate(() => {
          return window.dataLayer?.findLast?.((event) => event.event === "image_convert_preset_arrival");
        });
        assert(
          convertShortcutArrivalEvent?.source === "prep-shortcut" &&
            convertShortcutArrivalEvent.shortcut_id === "format-jpg" &&
            convertShortcutArrivalEvent.preset === "jpg",
          `${route.path} should preserve prep shortcut id on image-converter preset arrival analytics`
        );
        await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
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
        const nextPdfText = await page.locator("[data-next-pdf]").textContent();
        const nextPdfHref = await page.locator("[data-next-pdf-link]").getAttribute("href");
        assert(
          nextPdfText?.includes("다음 단계: PDF로 묶기") &&
            nextPdfText.includes("변환 이미지를 저장") &&
            nextPdfText.includes("저장 버튼을 먼저") &&
            nextPdfHref === "/tools/jpg-to-pdf-converter/?from=format-converted-images",
          `${route.path} should offer a next-step CTA to the JPG PDF converter after format conversion`
        );
      }

      if (route.heicConverter) {
        const heicUploadState = await page.locator(".upload-dropzone").evaluate((zone) => {
          const rect = zone.getBoundingClientRect();
          return { height: rect.height, text: zone.textContent || "" };
        });
        assert(
          heicUploadState.height >= 220 &&
            heicUploadState.text.includes("HEIC 사진을 선택하세요") &&
            heicUploadState.text.includes("파일 선택") &&
            heicUploadState.text.includes("무료") &&
            heicUploadState.text.includes("설치 없음") &&
            heicUploadState.text.includes("서버 전송 없음"),
          `${route.path} should expose a large direct HEIC upload area`
        );
        await page.goto(`${baseUrl}${route.path}?preset=png`, { waitUntil: "networkidle" });
        const heicPresetState = await page.evaluate(() => ({
          outputFormat: document.querySelector("[data-output-format]")?.value,
          quality: document.querySelector("[data-quality]")?.value,
          label: document.querySelector("[data-convert-label]")?.textContent || "",
          note: document.querySelector("[data-format-preset-note]")?.textContent || "",
          arrivalHidden: document.querySelector("[data-format-preset-arrival]")?.hasAttribute("hidden"),
          arrivalText: document.querySelector("[data-format-preset-arrival]")?.textContent || ""
        }));
        assert(
          heicPresetState.outputFormat === "image/png" &&
            heicPresetState.quality === "90" &&
            heicPresetState.label.includes("PNG") &&
            heicPresetState.note.includes("PNG") &&
            heicPresetState.arrivalHidden === false &&
            heicPresetState.arrivalText.includes("PNG로 시작"),
          `${route.path} should accept a URL preset for PNG output`
        );
        await page.goto(`${baseUrl}${route.path}?preset=jpg&source=catalog-quick-start`, { waitUntil: "networkidle" });
        const heicPresetArrivalEvent = await page.evaluate(() => {
          return window.dataLayer?.findLast?.((event) => event.event === "heic_convert_preset_arrival");
        });
        assert(
          heicPresetArrivalEvent?.source === "catalog-quick-start" &&
            heicPresetArrivalEvent.preset === "jpg",
          `${route.path} should preserve quick-start source on HEIC preset arrival analytics`
        );
        await page.goto(`${baseUrl}${route.path}?preset=jpg&source=prep-shortcut&shortcut_id=heic-jpg`, { waitUntil: "networkidle" });
        const heicShortcutArrivalEvent = await page.evaluate(() => {
          return window.dataLayer?.findLast?.((event) => event.event === "heic_convert_preset_arrival");
        });
        assert(
          heicShortcutArrivalEvent?.source === "prep-shortcut" &&
            heicShortcutArrivalEvent.shortcut_id === "heic-jpg" &&
            heicShortcutArrivalEvent.preset === "jpg",
          `${route.path} should preserve prep shortcut id on HEIC preset arrival analytics`
        );
        await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
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
        const nextPdfText = await page.locator("[data-next-pdf]").textContent();
        const nextPdfHref = await page.locator("[data-next-pdf-link]").getAttribute("href");
        assert(
          nextPdfText?.includes("다음 단계: PDF로 묶기") &&
            nextPdfText.includes("변환 이미지를 저장") &&
            nextPdfText.includes("저장 버튼을 먼저") &&
            nextPdfHref === "/tools/jpg-to-pdf-converter/?from=heic-converted-images",
          `${route.path} should offer a next-step CTA to the JPG PDF converter after HEIC conversion`
        );
      }

      await page.close();
    }

    await assertSitemapMetadata();
    await assertIndexNowKey();
    await assertSearchShortcut(browser);
    await assertAnalyticsSanitizer(browser);
    await assertAnalyticsPrivacy(browser);
    await assertFileAnalyticsPrivacy(browser);
  } finally {
    await browser?.close();
    server.kill("SIGTERM");
  }
}

async function assertIndexNowKey() {
  const key = "7f9e3a1c0d8b4f6a9c2e5d0a1b3c4e6f";
  const response = await fetch(`${baseUrl}/${key}.txt`);
  assert(response.ok, "IndexNow key file should load during preview");
  const text = await response.text();
  assert(text.trim() === key, "IndexNow key file should contain the configured key");
}

async function assertSitemapMetadata() {
  const response = await fetch(`${baseUrl}/sitemap-0.xml`);
  assert(response.ok, "sitemap-0.xml should load during preview");
  const xml = await response.text();
  for (const path of [
    "/",
    "/tools/",
    "/problems/",
    "/problems/file-format-error/",
    "/problems/photo-under-1mb/",
    "/problems/images-to-one-pdf/",
    "/tools/jpg-to-pdf-converter/",
    "/tools/photo-size-reducer/",
    "/tools/business-nameplate-maker/",
    "/tools/transaction-statement-generator/"
  ]) {
    assert(xml.includes(`<loc>${productionUrl}${path}</loc>`), `${path} should be listed in sitemap-0.xml`);
  }
  assert(xml.includes("<lastmod>"), "sitemap should include lastmod metadata");
  assert(xml.includes("<changefreq>daily</changefreq>"), "sitemap should mark core discovery pages as daily");
  assert(xml.includes("<priority>1.0</priority>"), "sitemap should mark the homepage as highest priority");
  assertSitemapUrlMetadata(xml, "/problems/", "weekly", "0.9");
  assertSitemapUrlMetadata(xml, "/problems/photo-under-1mb/", "weekly", "0.8");
  assertSitemapUrlMetadata(xml, "/workflows/photo-scan-submission/", "weekly", "0.8");
}

function assertSitemapUrlMetadata(xml, path, changefreq, priority) {
  const loc = `${productionUrl}${path}`;
  const blockPattern = new RegExp(`<url>\\s*<loc>${escapeRegExp(loc)}</loc>[\\s\\S]*?</url>`);
  const block = xml.match(blockPattern)?.[0] || "";
  assert(block, `${path} should have a sitemap URL block`);
  assert(block.includes(`<changefreq>${changefreq}</changefreq>`), `${path} sitemap changefreq should be ${changefreq}`);
  assert(block.includes(`<priority>${priority}</priority>`), `${path} sitemap priority should be ${priority}`);
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

async function assertSearchShortcut(browser) {
  const homePage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    await homePage.goto(baseUrl, { waitUntil: "networkidle" });
    await homePage.keyboard.press("Control+K");
    const focusedHomeSearch = await homePage.evaluate(() => {
      return document.activeElement?.matches("[data-home-search-input]");
    });
    const shortcutEvent = await homePage.evaluate(() => {
      return window.dataLayer?.findLast?.((event) => event.event === "header_search_click");
    });
    assert(focusedHomeSearch, "Ctrl+K should focus the homepage search input");
    assert(
      shortcutEvent?.trigger === "keyboard" && shortcutEvent.href === "/",
      "Ctrl+K should track a sanitized keyboard search shortcut event"
    );
  } finally {
    await homePage.close();
  }

  const catalogPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    await catalogPage.goto(`${baseUrl}/tools/`, { waitUntil: "networkidle" });
    await catalogPage.keyboard.press("Control+K");
    await catalogPage.waitForURL(`${baseUrl}/#tool-search`);
    const focusedHomeSearch = await catalogPage.evaluate(() => {
      return document.activeElement?.matches("[data-home-search-input]");
    });
    assert(focusedHomeSearch, "Ctrl+K from another page should open and focus homepage search");
  } finally {
    await catalogPage.close();
  }
}

async function assertAnalyticsSanitizer(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const payload = await page.evaluate(() => {
      window.kdocTrack("privacy_probe", {
        label: "x".repeat(220),
        href: "/tools/?q=SECRETQUERY&preset=jpg&source=problem&problem_id=photo-under-1mb&shortcut_id=compress-1mb&unsafe=SECRET",
        file_name: "SECRET-FILENAME.jpg",
        business_number: "SECRET-BIZ-999-88-77777",
        event: "SECRET-EVENT-OVERRIDE",
        raw_image: "SECRET-RAW-IMAGE",
        file_types: ["image/png", { secret: "SECRET-OBJECT" }, "image/jpeg"]
      });
      return window.dataLayer.at(-1);
    });
    const eventText = JSON.stringify(payload);
    const href = new URL(payload.href, baseUrl);
    assert(payload.event === "privacy_probe", "analytics sanitizer should keep the event name");
    assert(payload.label.length === 160, "analytics sanitizer should clamp long labels");
    assert(payload.file_name === undefined, "analytics sanitizer should drop filename fields");
    assert(payload.business_number === undefined, "analytics sanitizer should drop business number fields");
    assert(payload.raw_image === undefined, "analytics sanitizer should drop raw image fields");
    assert(!eventText.includes("SECRET"), "analytics sanitizer should not keep sensitive probe values");
    assert(href.pathname === "/tools/", "analytics sanitizer should keep same-origin href paths");
    assert(href.searchParams.get("preset") === "jpg", "analytics sanitizer should keep safe href preset");
    assert(href.searchParams.get("source") === "problem", "analytics sanitizer should keep safe href source");
    assert(
      href.searchParams.get("problem_id") === "photo-under-1mb",
      "analytics sanitizer should keep safe href problem_id"
    );
    assert(href.searchParams.get("shortcut_id") === "compress-1mb", "analytics sanitizer should keep safe href shortcut_id");
    assert(!href.searchParams.has("q"), "analytics sanitizer should drop raw search query href params");
    assert(!href.searchParams.has("unsafe"), "analytics sanitizer should drop unknown href params");
    assert(
      payload.file_types.length === 2 && payload.file_types.every((fileType) => typeof fileType === "string"),
      "analytics sanitizer should keep only primitive aggregate array values"
    );
  } finally {
    await page.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
