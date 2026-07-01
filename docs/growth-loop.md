# K문서툴 Growth Loop

Status: v0.2
Updated: 2026-07-02 KST

## Weekly Decision Loop

Run this loop once a week after Google and Naver have had time to crawl new pages.

```text
Search Console / Naver / Cloudflare data
  -> page and query review
  -> keyword scorecard update
  -> choose one next action
  -> implement, test, deploy
  -> request indexing where useful
```

Run the public technical check before looking at login-only reports:

```bash
npm run seo:health
```

This verifies the live `robots.txt`, sitemap index, sitemap URLs, canonical tags, `noindex` meta, and page headings. It does not replace Google Search Console, Naver Search Advisor, or Cloudflare Web Analytics because those require account data.

Run the analytics contract check before relying on browser events:

```bash
npm run analytics:check
```

This verifies that every statically discoverable analytics event used in the source is documented in `docs/analytics-events.md`.

Run the build performance budget after generating `dist/`:

```bash
npm run perf:budget
```

This checks that file-heavy tools keep their initial route scripts small and continue loading heavy converters only after the user starts the task.

## Signals To Check

### Google Search Console

- Pages indexed.
- Sitemap discovered.
- Impressions by page.
- Queries by page.
- CTR by query.
- Average position.

### Naver Search Advisor

- Site ownership status.
- Sitemap submission status.
- robots.txt status.
- URL collection status for new pages.
- Query/page signals if available.

### Public SEO Health

- `robots.txt` loads and points at the production sitemap index.
- Sitemap index lists same-origin sitemap files.
- Every sitemap URL returns HTML without redirecting to another canonical URL.
- Every sitemap URL has a matching canonical tag, no `noindex`, and an `h1`.

### Cloudflare Web Analytics

- Page views by path.
- Referrers.
- Top pages.
- Country/device split.
- Bot and crawler patterns when visible.

### K문서툴 Browser Events

Events are provider-neutral and pushed to `window.dataLayer` plus `kdoc:analytics`.

- `page_view`
- `tool_start`
- `tool_download`
- `tool_print`
- `tool_validation_error`
- `tool_row_add`
- `tool_row_remove`
- `calculator_copy`
- `amount_converter_copy`
- `withholding_calculator_copy`
- `stamp_background_download`
- `jpg_pdf_reorder`
- `jpg_pdf_generate`
- `jpg_pdf_download`
- `image_compressor_compress`
- `image_compressor_download`
- `image_resize_preset_arrival`
- `image_resize_preset_change`
- `image_resize_resize`
- `image_resize_download`
- `image_crop_preset_arrival`
- `image_crop_preset_change`
- `image_crop_crop`
- `image_crop_download`
- `image_rotate_preset_arrival`
- `image_rotate_preset_change`
- `image_rotate_rotate`
- `image_rotate_download`
- `image_convert_preset_arrival`
- `image_convert_preset_change`
- `image_convert_convert`
- `image_convert_download`
- `heic_convert_preset_arrival`
- `heic_convert_preset_change`
- `heic_convert_convert`
- `heic_convert_download`
- `header_search_click`
- `home_search_change`
- `home_search_tool_click`
- `home_search_problem_click`
- `home_catalog_all_click`
- `home_all_tool_click`
- `package_nav_click`
- `package_problem_click`
- `package_tool_click`
- `catalog_prep_shortcut_click`
- `catalog_filter_change`
- `catalog_search_change`
- `category_workflow_click`
- `category_prep_shortcut_click`
- `prep_situation_click`
- `prep_flow_tool_click`
- `prep_tool_click`

Do not send raw document text, business numbers, filenames, addresses, customer names, or uploaded file data.

## Decision Rules

### Build another business-document tool when:

- A current business tool gets impressions or clicks.
- Related queries appear around 영수증, 청구서, 명세서, 견적서, 사업자 정보, 명판, 직인.
- Current pages show users starting or printing/downloading tools.

### Improve existing pages when:

- Impressions exist but CTR is weak.
- Average position is 8-30 and page title/description can be tightened.
- Users land but do not start the tool.
- One page gets indexed and related pages do not.

### Add PDF tools when:

- K문서툴 has indexed business-document pages.
- There is a clear Korean workflow angle, such as "거래명세서 PDF 합치기" or "사업자 서류 PDF 만들기."
- Browser-local processing can be implemented with file limits, progress state, recoverable errors, and mobile-safe performance.

### Do not build when:

- The keyword is dominated by government or high-authority official pages.
- The tool implies legal, tax, labor, or government-process correctness without official source and 기준일.
- The implementation requires server upload of sensitive user files for v1.
- The only reason is "competitors have it."

## Current Loop

Completed:

1. Add `/tools/` and category pages.
2. Strengthen `src/data/tools.ts` as the tool contract.
3. Add SEO/privacy/mobile smoke tests.
4. Add adjacent business-document tools: `영수증 자동작성`, `청구서 자동작성`.
5. Add a supporting business calculator: `부가세 계산기`.
6. Add a supporting document formatter: `금액 한글 변환기`.
7. Add Korean total amount rows to generated business documents.
8. Add a supporting business calculator: `3.3% 계산기`.
9. Add a supporting stamp image tool: `도장 배경 제거`.
10. Add the first browser-local PDF tool: `JPG PDF 변환`.
11. Add image order adjustment to `JPG PDF 변환`.
12. Add the first browser-local image tool: `사진 용량 줄이기`.
13. Extract shared browser-local file helper logic for image/PDF tools.
14. Add the next image submission tool: `이미지 리사이즈`.
15. Add the next image format utility: `WebP JPG 변환`.
16. Add the iPhone photo compatibility utility: `HEIC JPG 변환`.
17. Add the cross-tool workflow hub: `제출용 파일 준비`.
18. Add the next image submission-prep tool: `이미지 자르기`.
19. Add the next image submission-prep tool: `이미지 회전`.
20. Tighten `JPG PDF 변환` file-list editing with drag reorder and per-image removal.
21. Highlight the submission-prep PDF path so users can move from image cleanup to `JPG PDF 변환` faster.
22. Add a `JPG PDF 변환` preflight checklist so users confirm selected count, order, settings, and save readiness before submission.
23. Add error-message decision hints to `제출용 파일 준비` so users can route from compression/rotation/cropping issues into the final JPG PDF bundling step.
24. Add `사진 용량 줄이기` submission target presets so users arriving from a "용량 초과" path can choose 500KB/1MB/3MB targets and see pass/fail status after compression.
25. Add a post-compression next-step CTA from `사진 용량 줄이기` to `JPG PDF 변환` so users with multiple compressed images can continue the submission workflow.
26. Add a compressed-image arrival cue on `JPG PDF 변환` so users coming from `사진 용량 줄이기` see the exact next steps and emit a separate arrival signal.
27. Add a post-rotation next-step CTA from `이미지 회전` to `JPG PDF 변환` so sideways scan/photo fixes can continue into final PDF bundling.
28. Add post-resize and post-crop next-step CTAs to `JPG PDF 변환` so edited submission images can continue into final PDF bundling from the whole image-prep cluster.
29. Add post-format-conversion next-step CTAs from `WebP JPG 변환` and `HEIC JPG 변환` to `JPG PDF 변환` so compatibility fixes can continue into final PDF bundling.
30. Add a `제출용 파일 준비` format-error path so users can route from HEIC/WebP incompatibility to conversion tools and then final PDF bundling.
31. Add a `제출용 파일 준비` compression-limit path and URL preset support so users can route from 500KB/1MB/3MB upload limits to compression and then final PDF bundling.
32. Add `이미지 리사이즈` submission size presets and URL preset routing so users with pixel limits can land directly on 800px, 1200px, 1600px, or 800×800-fit settings.
33. Add `이미지 자르기` submission area presets and URL preset routing so users with margin/background problems can land directly on document, profile, portrait, wide, or free crop settings.
34. Add `이미지 회전` submission direction URL presets so users with sideways or upside-down photos can land directly on right, left, or 180-degree rotation settings.
35. Add `WebP JPG 변환` and `HEIC JPG 변환` output format URL presets so users with unsupported image format errors land directly on JPG-compatible output settings.
36. Add home and tool-catalog problem-situation shortcuts so users can move from common upload errors directly into preset tool states without first knowing each tool name.
37. Add image and PDF category problem-situation shortcuts so category visitors can move directly from upload/PDF-prep errors into preset tool states.
38. Add stable shortcut analytics metadata (`shortcut_id`, target tool, and target preset) to problem-situation shortcuts so follow-up decisions can compare each shortcut against downstream tool starts and downloads.
39. Run the updated CEO review for the document-suite expansion loop and choose workflow package pages as the next product layer before adding generic PDF suite tools.
40. Add three workflow package pages for photo/scan submission, business document submission, and freelance billing, then simplify header navigation so users start from a package or category instead of a long tool list.
41. Replace the long `/tools/` card catalog with a searchable dense list and category filters so users can find a document tool by task, file type, or error wording without scrolling through template-like cards.
42. Replace the `/tools/` problem-situation card grid with compact action rows so the catalog page keeps one utilitarian scanning rhythm from workflow packages through search.
43. Add the `/problems/` problem-intent hub so common upload and submission blockers have one crawlable entry point with compact internal links.
44. Add `npm run seo:health` as the public technical SEO check for live robots, sitemap, canonical, `noindex`, and heading regressions.
45. Expand homepage problem-intent matching so colloquial blocked-state searches like upload failures, iPhone photo issues, sideways scans, document margins, and multi-image PDF submission route to the right problem page.
46. Expand `/tools/` catalog search with search-only problem-intent rows so blocked-state queries route to the right problem page without cluttering the default tool list.
47. Surface blocked-state intent phrases visibly on each problem page so those pages explain the same real-world wording used by homepage and catalog search.
48. Add query-linked `/tools/?q=...` catalog search so problem-intent search states can be shared, tested, and revisited directly.
49. Add WebPage structured data to problem pages with problem-intent keywords so visible blocked-state wording and JSON-LD metadata stay aligned.
50. Add `problem_title` to problem-to-tool arrival analytics so downstream tool starts and downloads can be read without joining against the problem registry.
51. Raise sitemap freshness hints for problem and workflow entry pages so crawler signals match the current search-intent architecture.
52. Replace visible "처리 원칙" wording on tool-side trust panels with direct user-facing privacy labels like "서버 전송 없음" and "입력값 저장 안 함".
53. Add a central analytics sanitizer so event payloads drop sensitive keys, clamp long strings, and remove raw search-query parameters from tracked href values.
54. Add `npm run analytics:check` so analytics event names cannot drift from `docs/analytics-events.md` as new routes and CTA events are added.
55. Lazy-load `pdf-lib` on `JPG PDF 변환` so the initial route script stays small until the user actually creates a PDF.
56. Add `npm run perf:budget` to keep initial file-tool scripts under a route-level budget after build.
57. Make the visible `⌘K`/Ctrl+K search shortcut real so users can jump to homepage tool search from anywhere.
58. Add empty-search recovery links on the homepage and `/tools/` catalog so failed searches can jump to high-intent tools or the problem hub without a dead end.
59. Make the first-screen upload areas larger and more action-led on `사진 용량 줄이기`, `JPG PDF 변환`, and `HEIC JPG 변환` so search visitors can start the core file task before reading secondary settings.
60. Make post-processing save actions harder to miss across image cleanup tools and `JPG PDF 변환` so users know to save generated files before continuing or submitting.
61. Remove roadmap-style candidate sections from category pages so visitors see only usable tools and direct submission workflows.
62. Add first-screen primary actions to workflow package pages so search visitors can start the recommended tool path without scanning the whole page.
63. Tighten the indexed `사업자 명판 만들기 무료` page with a shorter first-screen promise, primary PNG save action, and fixed-ratio preview that avoids internal scrolling.
64. Add homepage first-screen quick-start links for JPG PDF, 1MB compression, HEIC JPG, and 거래명세서 so visitors can run high-intent tools without typing a search.
65. Add `/tools/` first-screen quick-start links for JPG PDF, 1MB compression, HEIC JPG, and 거래명세서 so catalog visitors can run common tools without filtering or typing.
66. Show first-screen preset arrival cues on `사진 용량 줄이기` and `HEIC JPG 변환` so quick-start visitors can see the selected target before choosing files.
67. Route home and catalog JPG PDF quick starts through `from=quick-start` so visitors see a tailored first-screen PDF bundling cue before selecting images.
68. Preserve home/catalog quick-start source parameters on JPG PDF, photo compression, and HEIC preset arrival events so early traffic can be segmented by entry surface.

Next after crawl data appears:

1. Request indexing/collection for `/workflows/photo-scan-submission/`, `/workflows/business-document-submission/`, `/workflows/freelance-billing/`, `/tools/submission-file-prep/`, `/categories/pdf/`, `/tools/jpg-to-pdf-converter/`, `/categories/image/`, `/tools/photo-size-reducer/`, `/tools/image-resizer/`, `/tools/image-cropper/`, `/tools/image-rotator/`, `/tools/image-converter/`, `/tools/heic-jpg-converter/`, plus any previously unrequested business tool pages.
2. Compare starts, print events, calculator copy events, amount-converter copy events, 3.3% calculator copy events, stamp-background downloads, JPG PDF compressed-arrival/rotated-arrival/resized-arrival/cropped-arrival/format-converted-arrival/HEIC-converted-arrival/reorder/remove/generate/download events, image compressor preset-arrival/preset-change/compress/download/next-PDF events, image resize preset-arrival/preset-change/resize/download/next-PDF events, image crop preset-arrival/preset-change/crop/download/next-PDF events, image rotate preset-arrival/preset-change/rotate/download/next-PDF events, image convert preset-arrival/preset-change/convert/download/next-PDF events, HEIC convert preset-arrival/preset-change/convert/download/next-PDF events, home/catalog/category prep shortcut clicks by `shortcut_id` and `target_preset`, catalog filter/search events by `catalog_category`, problem page views, CTA clicks, and `tool_problem_arrival` by `problem_id`, package click-through events by `package_id` and `problem_id`, and submission-prep click-through events including `prep_format_path_click` and `prep_compression_path_click` across the tool set.
3. If `/tools/submission-file-prep/` gets page views but weak `prep_*` clicks, compare `prep_pdf_path_click`, `prep_pdf_decision_click`, situation clicks, and flow clicks before adding another tool.
4. If 청구서, 영수증, 부가세 계산기, 금액 한글 변환기, 3.3% 계산기, 도장 배경 제거, JPG PDF 변환, 사진 용량 줄이기, 이미지 리사이즈, 이미지 자르기, 이미지 회전, WebP JPG 변환, or HEIC JPG 변환 gets impressions but weak starts, tighten page title, intro copy, and sample defaults before adding another tool.
5. If JPG PDF 변환, 사진 용량 줄이기, 이미지 리사이즈, 이미지 자르기, 이미지 회전, WebP JPG 변환, or HEIC JPG 변환 gets generation/compression/resize/crop/rotate/convert events but weak downloads, compare compressed-arrival follow-through, preflight feedback, target/size/area/direction/output-format preset feedback, post-compression next-step clicks, file list editing, output status, and download affordance before adding more file tools.
6. If package pages get page views but weak `package_problem_click` or `package_tool_click`, tighten package H1, problem labels, and first-screen ordering before adding generic PDF merge/split/compress tools.
