# K문서툴 Growth Loop

Status: v0.2
Updated: 2026-06-27 KST

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
- `workflow_nav_click`
- `home_workflow_click`
- `home_prep_shortcut_click`
- `catalog_workflow_click`
- `catalog_prep_shortcut_click`
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

Next after crawl data appears:

1. Request indexing/collection for `/tools/submission-file-prep/`, `/categories/pdf/`, `/tools/jpg-to-pdf-converter/`, `/categories/image/`, `/tools/photo-size-reducer/`, `/tools/image-resizer/`, `/tools/image-cropper/`, `/tools/image-rotator/`, `/tools/image-converter/`, `/tools/heic-jpg-converter/`, plus any previously unrequested business tool pages.
2. Compare starts, print events, calculator copy events, amount-converter copy events, 3.3% calculator copy events, stamp-background downloads, JPG PDF compressed-arrival/rotated-arrival/resized-arrival/cropped-arrival/format-converted-arrival/HEIC-converted-arrival/reorder/remove/generate/download events, image compressor preset-arrival/preset-change/compress/download/next-PDF events, image resize preset-arrival/preset-change/resize/download/next-PDF events, image crop preset-arrival/preset-change/crop/download/next-PDF events, image rotate preset-arrival/preset-change/rotate/download/next-PDF events, image convert preset-arrival/preset-change/convert/download/next-PDF events, HEIC convert preset-arrival/preset-change/convert/download/next-PDF events, home/catalog/category prep shortcut clicks, and submission-prep click-through events including `prep_format_path_click` and `prep_compression_path_click` across the tool set.
3. If `/tools/submission-file-prep/` gets page views but weak `prep_*` clicks, compare `prep_pdf_path_click`, `prep_pdf_decision_click`, situation clicks, and flow clicks before adding another tool.
4. If 청구서, 영수증, 부가세 계산기, 금액 한글 변환기, 3.3% 계산기, 도장 배경 제거, JPG PDF 변환, 사진 용량 줄이기, 이미지 리사이즈, 이미지 자르기, 이미지 회전, WebP JPG 변환, or HEIC JPG 변환 gets impressions but weak starts, tighten page title, intro copy, and sample defaults before adding another tool.
5. If JPG PDF 변환, 사진 용량 줄이기, 이미지 리사이즈, 이미지 자르기, 이미지 회전, WebP JPG 변환, or HEIC JPG 변환 gets generation/compression/resize/crop/rotate/convert events but weak downloads, compare compressed-arrival follow-through, preflight feedback, target/size/area/direction/output-format preset feedback, post-compression next-step clicks, file list editing, output status, and download affordance before adding more file tools.
