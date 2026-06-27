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

Next after crawl data appears:

1. Request indexing/collection for `/categories/pdf/`, `/tools/jpg-to-pdf-converter/`, `/categories/image/`, and `/tools/photo-size-reducer/`, plus any previously unrequested business tool pages.
2. Compare starts, print events, calculator copy events, amount-converter copy events, 3.3% calculator copy events, stamp-background downloads, JPG PDF generate/download events, and image compressor compress/download events across the tool set.
3. If 청구서, 영수증, 부가세 계산기, 금액 한글 변환기, 3.3% 계산기, 도장 배경 제거, JPG PDF 변환, or 사진 용량 줄이기 gets impressions but weak starts, tighten page title, intro copy, and sample defaults before adding another tool.
4. If JPG PDF 변환 or 사진 용량 줄이기 gets generation/compression events but weak downloads, compare reorder usage, file list feedback, output status, and download affordance before adding more file tools.
