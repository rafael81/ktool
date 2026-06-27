# Keyword Scorecard

Generated: 2026-06-25 KST
Project: K문서툴
Status: v0.3, Naver DataLab demand added, active improvement loop

## Implementation Update

Updated: 2026-06-27 KST

Implemented and deployed:

- 사업자 명판 만들기 무료
- 거래명세서 자동작성
- 견적서 자동작성
- 영수증 자동작성
- 청구서 자동작성
- 부가세 계산기
- 금액 한글 변환기
- 3.3% 계산기
- 도장 배경 제거
- JPG PDF 변환
- 사진 용량 줄이기
- 이미지 리사이즈
- WebP JPG 변환
- HEIC JPG 변환
- 제출용 파일 준비
- 이미지 자르기
- 이미지 회전

Generic PDF merge, split, and compression tools remain deferred. The first PDF wedge is JPG PDF 변환 because it connects directly to Korean document submission workflows and can run browser-local with clear file limits.
The first image wedge is 사진 용량 줄이기 because DataLab demand is strong, the workflow is adjacent to document submission, and browser-local compression keeps the privacy promise intact.
The second image wedge is 이미지 리사이즈 because it strengthens the same submission-prep path without requiring server upload or heavy dependencies.
The third image wedge is WebP JPG 변환 because it reuses the same browser-local file path and solves a concrete format-compatibility problem before document upload.
The fourth image wedge is HEIC JPG 변환 because iPhone HEIC compatibility is a concrete submission blocker and the decoder can be lazy-loaded only when users convert.
The submission-prep hub is now added as a cross-tool workflow page because the image/PDF tool set is large enough to route users by upload error or submission condition instead of forcing them to pick a tool name first.
The fifth image wedge is 이미지 자르기 because it completes the common submission-prep sequence after format, size, and compression: remove irrelevant margins or background before resizing or PDF bundling.
The sixth image wedge is 이미지 회전 because sideways scan/photo orientation is a common low-friction blocker before crop, resize, and JPG PDF bundling.
The current improvement loop connects 사진 용량 줄이기, 이미지 리사이즈, 이미지 자르기, and 이미지 회전 to JPG PDF 변환 more tightly because edited image submissions need a visible handoff, not just a generic related-tool link.

## Decision

Build these first 3 tools:

1. **사업자 명판 만들기 무료**
   - Route idea: `/tools/business-nameplate-maker`
   - Why: Korean business-admin fit is very high, SERP is fragmented across iTool, blogs, shopping/product pages, and paid 제작 services.
   - V1 behavior: user enters company name, registration number, 대표자, address, phone/fax/email, uploads optional stamp PNG, then downloads transparent PNG/PDF.

2. **거래명세서 자동작성 / 거래명세서 양식 무료**
   - Route idea: `/tools/transaction-statement-generator`
   - Why: clear Korean office task, current results are form-download sites, Adobe content, blogs, and template pages. A browser fill-in generator can be more useful than static HWP/XLS downloads.
   - V1 behavior: user enters supplier/customer/items/tax fields, previews 거래명세서, then downloads PDF/PNG or copies printable output.

3. **견적서 자동작성 / 견적서 양식 무료**
   - Route idea: `/tools/estimate-generator`
   - Why: Naver DataLab demand is stronger than 도장 누끼, implementation can reuse the same document-generator architecture as 거래명세서, and the trust burden is manageable with clear copy.
   - V1 behavior: user enters client/project/item/price/VAT fields, previews 견적서, then downloads PDF/PNG or copies printable output.

Do **not** build generic PDF merge, split, or compression first. They have demand, but the SERPs are dominated by iLovePDF, Adobe, PDF24, Smallpdf, and other mature incumbents. A narrower JPG PDF 변환 tool is acceptable as a workflow-specific PDF wedge.

Do **not** build 도장 누끼 as a standalone v1 page. Keep it as a supporting feature or fast follow-up for the 명판/직인 workflow.

## Method

Scores are 1-5. Total score is:

```text
Demand + Competition weakness + Korean workflow fit + Implementation ease + Monetization fit + Trust safety
```

Interpretation:

- **Demand**: Naver DataLab relative demand, adjusted by visible search activity and category familiarity.
- **Competition weakness**: higher means easier to beat. Fragmented blogs/shopping/thin pages score higher; dominant tools/government/large brands score lower.
- **Korean workflow fit**: higher means the task is specifically Korean office/business/admin work.
- **Implementation ease**: higher means browser/static-first v1 is feasible.
- **Monetization fit**: higher means likely useful for AdSense/organic utility traffic.
- **Trust safety**: higher means lower legal/correctness/privacy burden.

Veto rules:

- Veto if the SERP is dominated by official/government pages or authority incumbents.
- Veto if the tool implies legal validity without official sourcing.
- Veto if v1 requires server upload of sensitive files.
- Veto if the implementation depends on heavy libraries without lazy loading, max file limits, and mobile handling.
- Veto if the search intent is too broad to know what the user actually wants.

## Source Notes

Primary sources checked: live web/SERP review and Naver DataLab Search Trend API on 2026-06-25.

Naver DataLab method:

- Period: 2025-06-01 to 2026-06-24, monthly.
- Anchor: `PDF 압축`.
- Query groups were compared in batches with `PDF 압축` included in each batch.
- `Naver Rel.` means average search-trend ratio relative to the anchor group in the same batch.
- Naver DataLab returns relative trend, not absolute monthly search volume.

Key DataLab findings:

| Keyword | Naver Rel. vs PDF 압축 | Trend last3 vs first3 | Impact |
|---|---:|---:|---|
| 사업자 명판 만들기 무료 | 37.8 | -1.7% | Smaller demand, but strong SERP weakness and workflow fit keep it in v1. |
| 도장 누끼 따기 | 14.3 | +12.9% | Interesting and rising, but too small for standalone v1 page. |
| 거래명세서 자동작성 | 323.8 | -23.8% | Strong enough to build first. |
| 견적서 자동작성 | 344.7 | -23.9% | Strong enough to replace 도장 누끼 as a top-3 page. |
| 도장 이미지 만들기 | 315.6 | -13.3% | Strong demand, but direct tool competitors and trust ambiguity remain. |
| PDF 합치기 | 1292.2 | -5.3% | Demand confirmed, but still deferred due incumbent-dominated SERP. |
| 사진 용량 줄이기 | 437.1 | -6.8% | Strong later candidate, but less Korean-specific. |
| QR 코드 만들기 | 2378.8 | +5.5% | Strong later candidate, but weaker fit with the first business-doc wedge. |
| 글자수 세기 | 17609.9 | -7.8% | Huge demand, but Naver/job portals dominate. |
| 맞춤법 검사기 | 130528.6 | -20.3% | Huge demand, but NLP quality burden and incumbents are too strong. |

Observed competitor patterns:

- PDF queries: iLovePDF, Adobe Acrobat, PDF24, Smallpdf, FreePDFConvert, Convertio-like tools dominate.
- Image queries: iLoveIMG, Adobe Express, imgPresso, ResizePixel, Convertio, remove.bg, TinyPNG-like tools dominate.
- Stamp/signature/nameplate queries: Stampng, Donue, Modusign, Yesform, Stampit, Sign.Plus, iTool, blogs, YouTube tutorials, and physical stamp shopping pages are mixed.
- Forms queries: courts/government pages, Adobe content, Yesform, Bizforms, Canva, Tistory/blog downloads, and tax/accounting office downloads are mixed.
- Calculator queries: MOEL, Employment Insurance, Saramin, NodongOK, Shiftee, Alba, Albamon, FindSemusa, and other authority/high-trust calculators dominate.

Reference URLs checked:

- iLovePDF merge/compress/split/PDF-to-JPG: https://www.ilovepdf.com/ko/merge_pdf
- Adobe PDF/image pages: https://www.adobe.com/kr/acrobat/online/compress-pdf.html
- PDF24 Korean tools: https://tools.pdf24.org/ko/merge-pdf
- Smallpdf Korean PDF tools: https://smallpdf.com/kr/compress-pdf
- Stampng: https://stampng.com/
- Donue signature/stamp: https://donue.co.kr/service/signature/
- Modusign stamp/sign: https://modusign.co.kr/event-stamp
- iTool stamp/nameplate pages: https://itool.co.kr/util/stamp-maker/
- Trodat/gogostamp business nameplate products: https://trodatstamp.co.kr/category/%EC%82%AC%EC%97%85%EC%9E%90%EB%AA%85%ED%8C%90%EC%A3%BC%EC%86%8C%EB%AA%85%ED%8C%90/24/
- iLoveIMG image compression/HEIC: https://www.iloveimg.com/ko/compress-image
- imgPresso: https://imgpresso.co.kr/
- remove.bg Korean page: https://www.remove.bg/ko
- Seoul court contract forms: https://seoul.scourt.go.kr/contract/new/DocListAction.work
- MOEL standard labor contract: https://www.moel.go.kr/info/etc/dataroom/view.do?bbs_seq=1358755286341
- MOEL retirement calculator: https://www.moel.go.kr/retirementpayCal.do
- Employment Insurance unemployment calculator: https://eiac.ei.go.kr/ei/m/pf/MOW-PF-00-180-C.html
- NTS comprehensive income tax filing guide: https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239072

## Scorecard

| # | Keyword | Category | User moment | Demand | Top competitors / SERP pattern | Weakness | Fit | Ease | Monet. | Trust | Total | Decision | Reason |
|---:|---|---|---|---:|---|---:|---:|---:|---:|---:|---:|---|---|
| 1 | 사업자 명판 만들기 무료 | Business admin | invoice/contract에 넣을 사업자 정보 명판이 필요함 | 4 | iTool, Tistory guide, shopping/product pages, stamp vendors | 5 | 5 | 5 | 3 | 4 | 26 | **BUILD** | DataLab demand is moderate, but SERP weakness and Korean-specific workflow make it the strongest low-competition wedge. |
| 2 | 명판 도장 합성 이미지 | Business admin | 사업자 명판과 직인을 한 이미지로 합성해야 함 | 3 | iTool, blogs, paid 제작 pages, stamp shops | 5 | 5 | 4 | 3 | 4 | 24 | MERGE | Fold into #1 as a secondary query and feature. |
| 3 | 도장 누끼 따기 | Stamp/image | 종이에 찍은 도장을 투명 PNG로 만들고 싶음 | 3 | remove.bg, eformsign blog, YouTube/tutorial posts, iTool | 4 | 5 | 4 | 3 | 4 | 23 | **BUILD** | Built as a supporting browser-local stamp background remover connected to the nameplate workflow. |
| 4 | 스캔 도장 투명하게 | Stamp/image | 스캔/촬영한 도장 배경을 제거해야 함 | 3 | tutorials, eformsign, remove.bg, generic image tools | 4 | 5 | 4 | 3 | 4 | 23 | MERGE | Merged into the stamp background remover page as a secondary query and use case. |
| 5 | 거래명세서 자동작성 | Forms | 공급자/공급받는자/품목을 입력해 바로 출력해야 함 | 5 | Yesform, Adobe, blogs, tax office downloads, Canva | 3 | 5 | 5 | 4 | 3 | 25 | **BUILD** | High DataLab demand, clear Korean office workflow, and stronger product angle than static downloads. |
| 6 | 거래명세서 양식 무료 | Forms | HWP/XLS/PDF 거래명세서 양식이 필요함 | 5 | Yesform, Adobe, Tistory, tax/accounting offices, Canva | 3 | 5 | 5 | 4 | 3 | 25 | MERGE | Use as SEO target and secondary query for #5. |
| 7 | 견적서 자동작성 | Forms | 견적 내용을 입력해 PDF/출력물로 보내야 함 | 5 | Adobe, Canva, Bizforms, blogs, YouTube | 2 | 5 | 5 | 4 | 4 | 25 | **BUILD** | High DataLab demand and same generator architecture as 거래명세서, with manageable trust burden. |
| 8 | 견적서 양식 무료 | Forms | 무료 견적서 양식을 다운로드해야 함 | 5 | Adobe, Canva, Bizforms, Yesform, blogs | 2 | 5 | 5 | 4 | 4 | 25 | MERGE | Use as SEO target and secondary query for #7. |
| 9 | 영수증 양식 무료 | Forms | 간단한 영수증을 만들어 출력해야 함 | 5 | blogs, form sites, template downloads | 3 | 5 | 5 | 3 | 4 | 25 | EXPLORE | Demand is high but better as a follow-up after the document generator pattern ships. |
| 10 | 세금계산서 양식 | Forms | 세금계산서 유사 문서/양식이 필요함 | 5 | official/tax content, blogs, form sites | 2 | 5 | 4 | 4 | 2 | 22 | DEFER | Trust/legal ambiguity; electronic tax invoice wording risk. |
| 11 | 무료 계약서 양식 | Forms/legal | 계약서 초안이 필요함 | 4 | court pages, law firms, Sign.Plus, Yesform, Bizforms | 1 | 4 | 4 | 4 | 1 | 18 | DEFER | Demand high, but authority/legal trust burden is too high for v1. |
| 12 | 차용증 양식 | Forms/legal | 개인 금전거래 차용증이 필요함 | 5 | law firms, tax offices, blogs, Yesform | 1 | 4 | 4 | 3 | 1 | 18 | DEFER | Legal/tax consequences; needs sourced legal review. |
| 13 | 근로계약서 양식 | Forms/legal | 표준 근로계약서가 필요함 | 5 | MOEL official, law/tax sites, form sites | 1 | 5 | 4 | 3 | 1 | 19 | DEFER | Official MOEL page is the right answer for many users. |
| 14 | 위임장 양식 | Forms/legal | 대리 제출용 위임장이 필요함 | 5 | blogs, law/form sites, government context | 3 | 4 | 5 | 3 | 2 | 22 | EXPLORE | Possible later, but legal wording/source needs care. |
| 15 | 도장 이미지 만들기 | Stamp/signature | 이름/회사명으로 온라인 도장을 만들고 싶음 | 5 | Stampng, Donue, Modusign, Yesform, Stampit, iTool | 2 | 5 | 4 | 3 | 3 | 22 | EXPLORE | DataLab demand is strong, but direct generator competitors and legal-validity ambiguity keep it out of v1. |
| 16 | 법인 도장 만들기 | Stamp/signature | 회사 직인/대표이사 도장 PNG가 필요함 | 5 | Donue, Modusign, Yesform, Stampit, iTool | 3 | 5 | 4 | 3 | 2 | 22 | DEFER | Strong fit, but legal validity confusion risk. |
| 17 | 회사 직인 만들기 | Stamp/signature | 회사 직인 이미지를 문서에 넣어야 함 | 4 | stamp/signature generators, blogs, iTool | 3 | 5 | 4 | 3 | 2 | 21 | DEFER | Same legal ambiguity as #16. |
| 18 | 전자서명 만들기 | Stamp/signature | 이름/손글씨 서명 PNG가 필요함 | 5 | Sign.Plus, Glosign, Donue, Modusign, Wizlogo | 2 | 4 | 4 | 4 | 2 | 21 | DEFER | International and contract platforms are strong. |
| 19 | PDF 합치기 | PDF | 여러 PDF를 하나로 합쳐 제출해야 함 | 5 | iLovePDF, PDF24, Smallpdf, Adobe, FreePDFConvert | 1 | 3 | 3 | 4 | 4 | 20 | DEFER | DataLab confirms high demand, but commodity SERP is dominated by mature PDF tools. |
| 20 | PDF 압축 | PDF | 업로드 제한 때문에 PDF 용량을 줄여야 함 | 5 | Adobe, Smallpdf, iLovePDF, PDF24, FreePDFConvert | 1 | 3 | 2 | 4 | 4 | 19 | DEFER | DataLab confirms high demand, but implementation cost and incumbent strength are poor for v1. |
| 21 | PDF 용량 줄이기 | PDF | PDF 파일 크기를 줄여 이메일/사이트 업로드해야 함 | 5 | Adobe, PDF24, iLovePDF, Smallpdf | 1 | 3 | 2 | 4 | 4 | 19 | DEFER | Same as #20; not first wedge. |
| 22 | PDF 나누기 | PDF | 필요한 페이지만 분리해야 함 | 5 | iLovePDF, PDF24, Smallpdf, AddPDF, FoxyUtils | 1 | 3 | 3 | 4 | 4 | 20 | DEFER | Commodity; no Korean-specific advantage yet. |
| 23 | PDF JPG 변환 | PDF | PDF 페이지를 이미지로 바꿔야 함 | 5 | Adobe, iLovePDF, Smallpdf, PDF24, CoolUtils | 1 | 3 | 2 | 4 | 4 | 19 | DEFER | Heavy implementation and dominant incumbents. |
| 24 | PDF 서명 | PDF | PDF에 서명/도장 이미지를 넣어야 함 | 2 | Adobe, Smallpdf, iLovePDF, e-sign platforms | 2 | 4 | 3 | 4 | 3 | 18 | EXPLORE | Could pair with stamp/nameplate later, not first. |
| 25 | PDF 페이지 삭제 | PDF | PDF에서 특정 페이지를 삭제해야 함 | 4 | iLovePDF, Smallpdf, PDF24, AddPDF | 2 | 3 | 3 | 3 | 4 | 19 | DEFER | Useful but too commodity. |
| 26 | PDF 회전 | PDF | 스캔 PDF 방향을 돌려야 함 | 3 | iLovePDF, Smallpdf, PDF24 | 2 | 2 | 4 | 3 | 5 | 19 | DEFER | Easy but low differentiation. |
| 27 | 사진 용량 줄이기 | Image | 사진 파일을 업로드/제출 가능한 크기로 줄여야 함 | 5 | iLoveIMG, imgPresso, ResizePixel, Adobe Express, blogs | 2 | 3 | 4 | 4 | 5 | 23 | **BUILD** | Built as the first image category wedge after business/PDF pages, with browser-local compression and a document-submission angle. |
| 28 | 이미지 압축 | Image | JPG/PNG/GIF 용량을 줄여야 함 | 5 | iLoveIMG, TinyPNG-like guides, imgPresso, ResizePixel | 2 | 3 | 4 | 4 | 5 | 23 | EXPLORE | Viable later with browser-local privacy angle. |
| 29 | 이미지 리사이즈 | Image | 특정 가로/세로 크기로 줄여야 함 | 4 | Adobe Express, ResizePixel, Shrink.media, blogs | 2 | 3 | 5 | 4 | 5 | 23 | **BUILD** | Built after 사진 용량 줄이기 as the second image submission-prep tool using the shared file-tool helper path. |
| 30 | HEIC JPG 변환 | Image | iPhone HEIC 사진을 JPG로 바꿔야 함 | 5 | iLoveIMG, Convertio, CleverPDF, PDF24, iMazing | 2 | 3 | 3 | 4 | 5 | 22 | **BUILD** | Built with lazy-loaded `heic-to` so the heavy decoder is fetched only when users run HEIC conversion. |
| 31 | 이미지 Base64 변환 | Dev/image | 이미지를 Data URI/Base64로 바꿔야 함 | 1 | base64-image.de, ioDraw, Aspose, Vivoldi, YTool | 4 | 2 | 5 | 2 | 5 | 19 | DEFER | Easy but smaller developer intent and weaker monetization. |
| 32 | 이미지 배경 제거 | Image | 사진 배경을 투명하게 지워야 함 | 5 | remove.bg, Adobe, Canva, AI background removers | 1 | 3 | 2 | 4 | 4 | 19 | DEFER | Demand is strong, but generic AI/background-removal incumbents are too strong; stamp-specific support is better. |
| 33 | WebP JPG 변환 | Image | WebP 이미지를 JPG/PNG로 바꿔야 함 | 4 | Convertio-like tools, browser utilities, blogs | 3 | 3 | 4 | 3 | 5 | 22 | **BUILD** | Built as the third browser-local image utility, focused on format compatibility for upload and document-editing flows. |
| 34 | 퇴직금 계산기 | Calculator | 예상 퇴직금을 계산해야 함 | 5 | MOEL, Saramin, NodongOK, Shiftee, FindSemusa | 1 | 5 | 3 | 4 | 1 | 19 | DEFER | Official/authority pages dominate; formula maintenance burden high. |
| 35 | 실업급여 계산기 | Calculator | 퇴사 후 실업급여 예상액을 알고 싶음 | 5 | Employment Insurance, Saramin, NodongOK, Albamon, FindSemusa | 1 | 5 | 3 | 4 | 1 | 19 | DEFER | Official source and eligibility complexity make this poor v1. |
| 36 | 주휴수당 계산기 | Calculator | 알바/파트타임 주휴수당을 계산해야 함 | 5 | Shiftee, Alba, NodongOK, Shopl, FindSemusa | 1 | 5 | 4 | 4 | 2 | 21 | DEFER | Demand high, but labor correctness and competitors are strong. |
| 37 | 3.3% 계산기 | Calculator | 프리랜서 원천징수 후 실수령액을 알고 싶음 | 5 | Pluuug, K-Calculator, withholding.kr, tax sites | 3 | 5 | 5 | 3 | 3 | 24 | **BUILD** | Simple formula, strong business-document adjacency, and NTS source supports a careful calculator with disclaimers. |
| 38 | 부가세 계산기 | Calculator | 공급가/부가세/합계 금액을 빠르게 계산해야 함 | 5 | tax calculators, accounting tools, blogs | 2 | 5 | 5 | 3 | 3 | 23 | EXPLORE | Simple later calculator; not first because docs wedge is stronger. |
| 39 | 4대보험 계산기 | Calculator | 급여에서 보험료를 계산해야 함 | 5 | official/HR/payroll calculators, tax/accounting sites | 1 | 5 | 2 | 4 | 1 | 18 | DEFER | Rate updates and authority burden too high. |
| 40 | 연차 계산기 | Calculator | 입사일 기준 연차를 계산해야 함 | 5 | Saramin, Shiftee, Shopl, labor sites | 2 | 5 | 4 | 4 | 2 | 22 | DEFER | Labor rule edge cases; later only with official source. |
| 41 | 대출이자 계산기 | Calculator | 원리금/이자 상환액을 계산해야 함 | 5 | banks, finance sites, calculators | 1 | 3 | 4 | 4 | 3 | 20 | DEFER | Crowded and not aligned with business-doc wedge. |
| 42 | QR 코드 만들기 | Utility | URL/text QR을 만들어 인쇄/공유해야 함 | 5 | QR generators, browser utilities, design tools | 2 | 3 | 5 | 3 | 5 | 23 | EXPLORE | DataLab demand is high and trend positive, but weaker fit with the first business-document wedge. |
| 43 | QR 코드 읽기 | Utility | 캡처 이미지의 QR 내용을 PC에서 읽어야 함 | 4 | iTool, QR reader sites, app pages | 3 | 3 | 4 | 3 | 5 | 22 | EXPLORE | Could be useful adjacent utility, not first. |
| 44 | 글자수 세기 | Utility/text | 자기소개서/문서 글자수를 세야 함 | 5 | Naver, Saramin, JobKorea, text tools | 1 | 3 | 5 | 4 | 5 | 23 | DEFER | Huge demand, but Naver/job portals dominate and differentiation is weak. |
| 45 | 맞춤법 검사기 | Utility/text | 한국어 문서 맞춤법을 검사해야 함 | 5 | Naver/Pusan tools, job portals, AI tools | 1 | 4 | 2 | 4 | 4 | 20 | DEFER | Huge demand, but NLP quality burden and dominant incumbents make it a bad v1 target. |
| 46 | 금액 한글 변환기 | Business utility | 계약서/청구서/견적서에 숫자 금액과 한글 금액을 함께 넣어야 함 | 3 | blogs, calculators, spreadsheet snippets | 4 | 5 | 5 | 2 | 4 | 23 | EXPLORE | Lower confidence than DataLab-backed form terms, but strong adjacency to document generators and low implementation risk. |
| 47 | JPG PDF 변환 | PDF/image | 스캔 사진과 증빙 이미지를 한 PDF로 묶어 제출해야 함 | 4 | iLovePDF, Adobe, Smallpdf, PDF24, image converters | 2 | 4 | 4 | 4 | 5 | 23 | **BUILD** | Narrower than generic PDF tools, browser-local, and tied to Korean document submission workflows. |
| 48 | 제출용 파일 준비 | Workflow hub | 제출처 오류 문구에 맞춰 사진, PDF, 문서 도구를 골라야 함 | 3 | blogs, generic PDF/image tool lists, competitor category pages | 4 | 5 | 5 | 3 | 5 | 25 | **BUILD** | Built as a cross-tool routing page after the image/PDF cluster reached enough breadth to support workflow-led discovery. |
| 49 | 이미지 자르기 | Image | 사진의 여백, 주변 배경, 불필요한 영역을 제거해야 함 | 4 | Adobe Express, iLoveIMG, Canva, ResizePixel, crop utilities | 2 | 4 | 5 | 3 | 5 | 23 | **BUILD** | Built as the next browser-local submission-prep tool after the workflow hub exposed a clear crop-before-resize/PDF path. |
| 50 | 이미지 회전 | Image | 옆으로 누운 스캔본이나 사진 방향을 바로잡아야 함 | 3 | iLoveIMG, Adobe Express, ResizePixel, PDF/image utility sites | 3 | 4 | 5 | 3 | 5 | 23 | **BUILD** | Built as a small, high-fit browser-local tool that strengthens the scan/photo submission path before crop, resize, or PDF bundling. |

## First Sprint Spec Seeds

### 1. 사업자 명판 만들기 무료

Target query:

- 사업자 명판 만들기 무료
- 사업자 명판 이미지
- 전자 사업자 명판
- 명판 도장 합성 이미지

Core behavior:

- Input: 상호, 대표자, 사업자등록번호, 주소, 업태/종목, 전화/FAX/email, optional 도장 PNG.
- Output: transparent PNG and print/PDF-ready preview.
- Processing: browser canvas only; no server upload.

Trust copy:

- "문서 삽입용 이미지 생성 도구이며, 법적 효력이나 인감 증명을 대신하지 않습니다."

Acceptance gate:

- Must support Korean text, 2-line address, optional stamp, transparent background, and mobile preview.

### 2. 거래명세서 자동작성 / 거래명세서 양식 무료

Target query:

- 거래명세서 자동작성
- 거래명세서 양식 무료
- 거래명세표 양식
- 거래명세서 PDF

Core behavior:

- Input: 공급자/공급받는자, 거래일, 품목, 수량, 단가, 세액, 비고, optional 직인/명판 image.
- Output: print view, PDF/PNG download, maybe copyable table.
- Processing: static/browser-generated document.

Trust copy:

- "일반 거래 내역 정리용 양식입니다. 세금계산서나 전자세금계산서 발행을 대신하지 않습니다."

Acceptance gate:

- Must calculate supply amount/VAT/total clearly, allow item rows add/remove, and print cleanly on mobile/desktop.

### 3. 견적서 자동작성 / 견적서 양식 무료

Target query:

- 견적서 자동작성
- 견적서 양식 무료
- 무료 견적서 양식
- 견적서 PDF

Core behavior:

- Input: 공급자/고객, 견적일, 유효기간, 품목, 수량, 단가, 세액, 비고, optional 명판/직인 image.
- Output: print view, PDF/PNG download, maybe copyable table.
- Processing: static/browser-generated document.

Trust copy:

- "견적 전달용 문서 생성 도구입니다. 계약 체결이나 세금계산서 발행을 대신하지 않습니다."

Acceptance gate:

- Must reuse the document-generator foundation from 거래명세서, support item rows add/remove, and render cleanly for mobile preview and print/PDF.

## Supporting Tool Seed

### 도장 누끼 따기 / 스캔 도장 투명 PNG

Target query:

- 도장 누끼 따기
- 스캔 도장 투명하게
- 도장 배경 제거
- 도장 PNG 만들기

Core behavior:

- Input: JPG/PNG stamp photo.
- Controls: background threshold, red-strength cleanup, red-focused mode, preview on white/checker background.
- Output: transparent PNG.
- Processing: browser-only; no network upload.

Trust copy:

- "업로드한 이미지는 브라우저 안에서만 처리됩니다. 중요한 인감/법인도장 이미지는 보관과 공유에 주의하세요."

Acceptance gate:

- Must show max file size, reject unsupported files, handle Korean filenames, and provide recoverable error messages.

## Deferred But Promising

- 도장 누끼 따기: built as a support tool for scanned stamp transparent PNG creation.
- 사진 용량 줄이기 / 이미지 압축, 이미지 리사이즈, WebP JPG 변환, HEIC JPG 변환: built as the first browser-local image utility cluster after the Korean business-doc and JPG PDF wedges shipped. 사진 용량 줄이기 now has 500KB/1MB/3MB submission presets and a post-compression JPG PDF next step because "용량 초과" users need an immediate target and a clear route to bundling multiple compressed images.
- JPG PDF 변환: improved after the image-tool cluster with drag reorder, per-image removal, a preflight checklist, and source-aware image-tool arrival cues because page order, save-readiness, and post-edit handoff mistakes are direct submission-prep failure points.
- 제출용 파일 준비: improved with a highlighted PDF submission path and error-message decision hints, because users with multiple images need a clearer route from cleanup tools to JPG PDF bundling.
- 3.3% 계산기: built after adding NTS source/date/disclaimer discipline.
- QR 코드 만들기/읽기: easy utility, but weaker business wedge and lower monetization fit.

## Next Step

Use crawl and analytics data to decide whether the next loop should improve image-tool conversion, tighten PDF submission-prep completion, explore QR/image extraction utilities, or return to a Korean business-document form.
