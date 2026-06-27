# First Sprint Spec

Generated: 2026-06-25 KST
Source: `docs/keyword-scorecard.md` v0.2
Status: ready for implementation

## Goal

Ship the first 3 Korean business-document utilities as static, crawlable, no-login, browser-only tools.

First sprint tools:

1. `사업자 명판 만들기 무료`
2. `거래명세서 자동작성 / 거래명세서 양식 무료`
3. `견적서 자동작성 / 견적서 양식 무료`

## Product Rules

- No login.
- No server upload for user inputs or files in v1.
- Tool pages must work on desktop and mobile.
- Tool pages must be crawlable without using the tool.
- Each page must include Korean instructions, examples, FAQ, privacy/trust copy, and related links.
- Do not add PDF merge/compress/split tools in this sprint.
- Do not build standalone `도장 누끼` in this sprint. It can appear only as optional support copy or future related tool.

## Technical Direction

Recommended stack: static-first frontend app.

Architecture:

```text
docs/keyword-scorecard.md
  -> docs/first-sprint-spec.md
  -> src/tools/registry
  -> static tool pages
  -> browser-only form/canvas/print interactions
  -> generated downloadable result
```

Implementation shape:

- `src/tools/registry.*` — route, category, SEO metadata, FAQ, analytics event names, trust copy, related links.
- `src/tools/business-nameplate/` — business nameplate UI and image generation.
- `src/tools/transaction-statement/` — 거래명세서 UI and document generation.
- `src/tools/estimate/` — 견적서 UI and document generation.
- `src/components/` — shared form fields, document preview, toolbar, SEO content blocks.
- `src/lib/` — formatting, VAT math, download helpers, analytics wrapper.
- `public/robots.txt` — crawl policy.
- Sitemap generation or static sitemap before launch.

## Shared UX

All 3 pages should follow one pattern:

```text
SEO intro
  -> tool form
  -> live preview
  -> action toolbar
  -> result/download
  -> examples
  -> FAQ
  -> privacy/trust note
  -> related tools
```

Desktop layout:

- Left: input form.
- Right: live preview.
- Toolbar near preview: reset, print, download PNG/PDF where available.

Mobile layout:

- Form first.
- Sticky compact action bar near bottom.
- Preview after primary fields.
- No horizontal scrolling.

Common states:

- Empty state with sample data button.
- Valid preview.
- Missing required field errors.
- Download/print success.
- Unsupported browser or download failure fallback.

## Tool 1: 사업자 명판 만들기 무료

Route:

- `/tools/business-nameplate-maker`

Korean page title:

- `사업자 명판 만들기 무료 - 회사 정보 이미지 생성`

Meta description:

- `사업자명, 대표자, 사업자등록번호, 주소를 입력해 문서에 넣을 수 있는 사업자 명판 이미지를 무료로 만드세요. 로그인 없이 브라우저에서 처리됩니다.`

Target queries:

- 사업자 명판 만들기 무료
- 사업자 명판 이미지
- 전자 사업자 명판
- 명판 도장 합성 이미지

Input fields:

- 상호, required.
- 대표자, optional.
- 사업자등록번호, optional, formatted as `000-00-00000` when possible.
- 주소, optional, supports 2 lines.
- 업태, optional.
- 종목, optional.
- 전화, optional.
- 팩스, optional.
- 이메일, optional.
- 도장 이미지, optional PNG/JPG upload. Browser-only.
- 명판 스타일: 기본, compact, invoice.
- 배경: 투명, 흰색.

Output:

- Live preview.
- Download PNG.
- Print-friendly preview.
- PDF download can be deferred if print works well.

Core behavior:

- Render Korean text cleanly.
- Preserve line breaks.
- Allow optional stamp image on right/bottom.
- Generate transparent PNG through canvas or DOM-to-image.
- Never upload image or text to server.

Trust copy:

> 문서 삽입용 이미지 생성 도구입니다. 법적 효력, 인감 증명, 전자서명 인증을 대신하지 않습니다.

FAQ seeds:

- 사업자 명판 이미지는 어디에 쓰나요?
- 법적 효력이 있나요?
- 입력한 정보가 서버에 저장되나요?
- 배경을 투명하게 만들 수 있나요?
- 도장 이미지를 같이 넣을 수 있나요?

Analytics events:

- `business_nameplate_view`
- `business_nameplate_sample_loaded`
- `business_nameplate_preview_updated`
- `business_nameplate_download_png`
- `business_nameplate_print`
- `business_nameplate_error`

Tests:

- Korean company name renders in preview.
- Long address wraps without overflow.
- Optional stamp can be shown/hidden.
- Download PNG works.
- Empty required field shows Korean error.
- No network request contains user input or uploaded image.

## Tool 2: 거래명세서 자동작성

Route:

- `/tools/transaction-statement-generator`

Korean page title:

- `거래명세서 자동작성 - 무료 거래명세서 양식`

Meta description:

- `공급자, 거래처, 품목, 수량, 단가를 입력해 거래명세서를 바로 작성하세요. 무료 양식, 인쇄, 다운로드를 지원합니다.`

Target queries:

- 거래명세서 자동작성
- 거래명세서 양식 무료
- 거래명세표 양식
- 거래명세서 PDF

Input fields:

- 공급자 상호, optional.
- 공급자 사업자등록번호, optional.
- 공급자 주소, optional.
- 공급받는자 상호, required.
- 거래일, required, default today.
- 품목 rows: 품목명, 규격, 수량, 단가, 공급가액, 세액.
- 비고, optional.
- 부가세 방식: 별도, 포함, 없음.
- 명판/도장 이미지, optional, browser-only.

Output:

- Live document preview.
- Add/remove item rows.
- Print.
- Download PNG.
- PDF download can be deferred unless easy through browser print.

Core behavior:

- Calculate 공급가액, 세액, 합계.
- Support VAT included/excluded/no VAT.
- Support at least 20 item rows.
- Keep print layout clean on A4.

Trust copy:

> 일반 거래 내역 정리용 양식입니다. 세금계산서나 전자세금계산서 발행을 대신하지 않습니다.

FAQ seeds:

- 거래명세서와 세금계산서는 다른가요?
- 부가세 포함 금액도 계산할 수 있나요?
- 거래명세서를 PDF로 저장할 수 있나요?
- 입력한 거래처 정보가 저장되나요?
- 모바일에서도 작성할 수 있나요?

Analytics events:

- `transaction_statement_view`
- `transaction_statement_row_added`
- `transaction_statement_row_removed`
- `transaction_statement_vat_mode_changed`
- `transaction_statement_download`
- `transaction_statement_print`
- `transaction_statement_error`

Tests:

- VAT 별도 계산 is correct.
- VAT 포함 계산 is correct.
- Empty item row is handled.
- Add/remove rows updates totals.
- Print layout renders without horizontal overflow.
- No network request contains document data.

## Tool 3: 견적서 자동작성

Route:

- `/tools/estimate-generator`

Korean page title:

- `견적서 자동작성 - 무료 견적서 양식`

Meta description:

- `고객명, 품목, 수량, 단가를 입력해 견적서를 무료로 작성하세요. 브라우저에서 바로 미리보기, 인쇄, 다운로드할 수 있습니다.`

Target queries:

- 견적서 자동작성
- 견적서 양식 무료
- 무료 견적서 양식
- 견적서 PDF

Input fields:

- 공급자/회사명, optional.
- 담당자, optional.
- 연락처, optional.
- 고객명, required.
- 견적일, required, default today.
- 유효기간, optional.
- 품목 rows: 품목명, 설명, 수량, 단가, 공급가액, 세액.
- 할인, optional.
- 비고/조건, optional.
- 부가세 방식: 별도, 포함, 없음.
- 명판/도장 이미지, optional, browser-only.

Output:

- Live document preview.
- Add/remove item rows.
- Print.
- Download PNG.
- PDF download can be deferred unless easy through browser print.

Core behavior:

- Reuse 거래명세서 item-row and VAT calculation logic.
- Support quote validity date and conditions.
- Keep A4 print layout clean.

Trust copy:

> 견적 전달용 문서 생성 도구입니다. 계약 체결이나 세금계산서 발행을 대신하지 않습니다.

FAQ seeds:

- 견적서와 거래명세서는 어떻게 다른가요?
- 부가세 포함 견적도 만들 수 있나요?
- 견적 유효기간을 넣을 수 있나요?
- PDF로 저장할 수 있나요?
- 입력한 고객 정보가 서버에 저장되나요?

Analytics events:

- `estimate_view`
- `estimate_row_added`
- `estimate_row_removed`
- `estimate_vat_mode_changed`
- `estimate_download`
- `estimate_print`
- `estimate_error`

Tests:

- VAT 별도 계산 is correct.
- VAT 포함 계산 is correct.
- Discount/notes render safely.
- Add/remove rows updates totals.
- Print layout renders without horizontal overflow.
- No network request contains document data.

## Shared Calculation Rules

Currency:

- KRW only in v1.
- Display with comma separators.
- Decimal quantities allowed.
- Unit price should allow integer KRW only by default.

VAT:

```text
VAT separate:
  supply = quantity * unitPrice
  vat = round(supply * 0.1)
  total = supply + vat

VAT included:
  total = quantity * unitPrice
  supply = round(total / 1.1)
  vat = total - supply

No VAT:
  supply = quantity * unitPrice
  vat = 0
  total = supply
```

Rounding:

- Use whole KRW.
- Document the rounding behavior in code comments and tests.

## SEO Content Requirements

Each page must include:

- H1 matching primary target query.
- 120-160 character Korean meta description.
- Tool instructions.
- 2 realistic examples.
- FAQ block.
- Privacy/trust note.
- Related links to the other two tools.
- Canonical URL.
- Open Graph title/description.
- Structured data decision. FAQPage is acceptable if content is visible on page.

## Privacy And Security

- No server upload in v1.
- Do not store form data in analytics.
- Do not log user-entered business numbers, names, addresses, document details, filenames, or image data.
- Optional local autosave is deferred.
- If sample data exists, it must be fake and clearly generic.

## Accessibility

- All inputs have labels.
- Error messages are visible and associated with fields.
- Keyboard users can add/remove rows.
- Buttons have clear Korean text.
- Color is not the only error indicator.
- Preview should not be the only source of entered information.

## Performance

- Initial page content must render before any heavy export library loads.
- Document export helpers should be lazy loaded on first download/print action if heavy.
- File uploads are optional and must define size limits.
- Do not add PDF-heavy dependencies unless browser print is not enough.

## Test Matrix

Unit tests:

- VAT separate calculation.
- VAT included calculation.
- No VAT calculation.
- KRW formatting.
- Required field validation.
- Business registration number formatting.

E2E tests:

- Each route renders H1, meta content, FAQ, and tool form.
- Sample data fills the form.
- Add/remove rows works for 거래명세서 and 견적서.
- Download/print action is available.
- Mobile viewport has no horizontal overflow.
- No network request sends form data or uploaded image data.

Manual checks:

- Korean text wrapping in preview.
- A4 print preview looks acceptable.
- Naver/Google sitemap and robots setup before deploy.

## Out Of Scope

- Login/accounts.
- Server-side file processing.
- Standalone PDF merge/compress/split tools.
- Standalone 도장 누끼 page.
- 법적 효력 보장 copy.
- Electronic tax invoice issuance.
- Payment, templates marketplace, affiliate flows.
- Multi-currency.
- Cloud save/history.

## Acceptance Criteria

Sprint is complete when:

- All 3 routes exist.
- All 3 pages have crawlable Korean SEO content.
- All 3 tools work without login.
- 거래명세서 and 견적서 share calculation logic.
- 사업자 명판 can export an image.
- 거래명세서 and 견적서 can print cleanly.
- Required tests pass.
- No user-entered content is sent to analytics or server endpoints.
- `robots.txt` and sitemap are ready for deployment.

## Recommended Implementation Order

1. Scaffold static frontend app.
2. Create tool registry.
3. Build shared form, preview, toolbar, currency, VAT, and download helpers.
4. Implement 사업자 명판.
5. Implement 거래명세서.
6. Implement 견적서 by reusing 거래명세서 document-generator pieces.
7. Add SEO content, FAQ, robots, sitemap.
8. Add tests.
9. Run `/plan-design-review`.
10. Run `/qa-only` or `/qa`.
