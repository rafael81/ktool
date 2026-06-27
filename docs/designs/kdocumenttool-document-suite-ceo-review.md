---
status: ACTIVE
generated: 2026-06-27 KST
mode: SELECTIVE_EXPANSION
repo: rafael81/ktool
branch: main
---

# CEO Review: K문서툴 Document Suite

## Verdict

K문서툴의 다음 목표는 `PDF 합치기` 같은 단일 commodity tool이 아니다. 이미 17개 도구와 3개 카테고리, 제출 준비 허브, 문제상황 shortcut, Cloudflare Analytics, Google/Naver 등록 흐름이 있다. 이제 제품은 아래 한 문장으로 좁혀야 한다.

```text
한국 사용자가 문서나 파일을 제출하기 직전, 막히는 조건을 브라우저에서 바로 해결하는 문서 도구 사이트.
```

좋은 방향:

```text
제출처 조건
  -> 문제상황 shortcut
  -> 이미지/문서/PDF 도구
  -> 저장/인쇄/다운로드
  -> 다음 제출 단계
  -> analytics로 다음 도구 결정
```

나쁜 방향:

```text
경쟁 사이트에 있는 PDF 기능을 하나씩 복제
  -> PDF 합치기
  -> PDF 압축
  -> PDF 나누기
  -> 검색 결과에서 iLovePDF, Adobe, Smallpdf, PDF24, Allinpdf와 정면 승부
```

결론: SELECTIVE EXPANSION. 현재 스코프를 버리지 말고, "제출 업무 흐름"을 강화하는 확장만 받아들인다.

## Sources Checked

- Existing product docs: `docs/keyword-scorecard.md`, `docs/growth-loop.md`, `docs/analytics-events.md`, `docs/search-registration.md`.
- Prior approved design: `/Users/user/.gstack/projects/itoolclone/user-main-design-20260625-222707.md`.
- Prior CEO plans: `/Users/user/.gstack/projects/itoolclone/ceo-plans/2026-06-27-kdocumenttool-expansion-loop.md`, `/Users/user/.gstack/projects/itoolclone/ceo-plans/2026-06-27-kdocumenttool-submission-workflow.md`.
- Current site registry: `src/data/tools.ts`, `src/data/prepShortcuts.ts`.
- Current competitor surface:
  - [iLovePDF](https://www.ilovepdf.com/) offers broad PDF merge, split, compress, convert, edit, security, and intelligence tools.
  - [Adobe Acrobat online tools](https://www.adobe.com/acrobat/online.html) presents 25+ PDF and e-sign tools.
  - [Smallpdf](https://smallpdf.com/) presents 30 popular PDF tools and a broader document-management pitch.
  - [PDF24](https://tools.pdf24.org/en/) emphasizes free PDF tools, no limits, no watermarks, online and offline options.
  - [Allinpdf](https://allinpdf.com/) covers PDF combine, split, rotate, compress, document conversion, and Korean PDF merge pages.
  - [Naver DataLab Search Trend API](https://developers.naver.com/docs/serviceapi/datalab/search/search.md) returns relative search-trend JSON and has a daily 1,000-call limit.
  - [Cloudflare Pages Web Analytics docs](https://developers.cloudflare.com/pages/how-to/web-analytics/) describe free privacy-first analytics for websites.

## System Audit

Current state:

- 17 live tools:
  - Business: 사업자 명판, 거래명세서, 견적서, 영수증, 청구서, 부가세, 금액 한글, 3.3%, 도장 배경 제거.
  - PDF: JPG PDF 변환.
  - Image: 사진 용량 줄이기, 이미지 리사이즈, 이미지 자르기, 이미지 회전, WebP JPG 변환, HEIC JPG 변환.
  - Workflow: 제출용 파일 준비.
- 3 category routes: `/categories/business/`, `/categories/pdf/`, `/categories/image/`.
- Tool metadata contract exists in `src/data/tools.ts`.
- Problem-situation shortcuts exist in `src/data/prepShortcuts.ts`.
- Analytics contract exists and now includes stable `shortcut_id`, target tool, and target preset metadata.
- Smoke tests cover SEO, privacy, mobile overflow, routes, file tool flows, and shortcut metadata.
- Deployment path is static Astro to Cloudflare Pages.

Recent implementation trajectory:

```text
business document tools
  -> PDF wedge: JPG PDF 변환
  -> image submission tools
  -> submission-prep workflow hub
  -> preset routing
  -> problem-situation shortcuts
  -> shortcut analytics metadata
```

Interpretation:

The strategy is already working at the architecture level. The risk is now product sprawl: adding another isolated tool without strengthening the user journey.

## Premise Challenge

Wrong question:

```text
"PDF 합치기를 만들까?"
```

Better question:

```text
"어떤 제출 직전 상황이 아직 K문서툴 안에서 끝까지 해결되지 않는가?"
```

If we build generic PDF merge next, we enter the strongest incumbent zone too early. If we build workflow pages and package-level journeys next, we compound existing assets: business documents, image cleanup, JPG-to-PDF bundling, trust copy, and analytics.

## Implementation Alternatives

### Approach A: Add Generic PDF Merge Now

Summary: Build a browser-local `PDF 합치기` page and expose it in the PDF category.

Effort: M human / S-M with Codex  
Risk: Medium  
Completeness: 5/10

Pros:

- High demand keyword.
- Fits the PDF category name.
- Reuses some drag ordering concepts from JPG PDF.

Cons:

- Directly fights iLovePDF, Adobe, Smallpdf, PDF24, and Allinpdf.
- Needs heavier PDF parsing/merge edge-case handling than JPG-to-PDF.
- Does not sharpen the Korean submission workflow story.

Reuses:

- `pdf-lib`, `jpg-to-pdf-converter`, file helper patterns.

### Approach B: Build Workflow Package Pages

Summary: Add workflow-led pages that package existing tools by real Korean user jobs: 사진/스캔 제출, 사업자 서류 제출, 프리랜서 정산/청구.

Effort: M human / S with Codex  
Risk: Low  
Completeness: 9/10

Pros:

- Converts 17 separate tools into a coherent product.
- Creates internal links and landing pages without heavy new file-processing risk.
- Produces cleaner analytics: users click through a package flow before tool starts/downloads.
- Helps SEO because the page targets task phrases, not only tool names.

Cons:

- It feels less shiny than a brand-new converter.
- Requires good copy and hierarchy so it does not become another directory page.

Reuses:

- `src/data/tools.ts`, `src/data/prepShortcuts.ts`, category pages, `docs/growth-loop.md`, analytics events, smoke route checks.

### Approach C: Build More Business Document Generators

Summary: Add another document generator such as 납품서, 발주서, 입금표, 위임장-like forms.

Effort: M human / S-M with Codex  
Risk: Medium  
Completeness: 7/10

Pros:

- Reuses document-generator logic and trust copy patterns.
- Keeps Korean business admin differentiation.
- Could expand SEO surface.

Cons:

- Without workflow packaging, it worsens tool sprawl.
- Some forms drift into legal/tax ambiguity.
- More generators before search data may dilute learning.

Reuses:

- `public/scripts/document-tool.js`, existing business document pages, shared VAT/amount patterns.

### Approach D: Build A Full PDF Suite

Summary: Prioritize PDF merge, split, compress, rotate, delete, reorder, sign, and watermark.

Effort: XL human / M-L with Codex  
Risk: High  
Completeness: 6/10

Pros:

- Obvious category expansion.
- Strong keyword demand.
- Easy for users to understand.

Cons:

- Competes where incumbents are strongest.
- Adds processing, security, mobile-performance, and browser-compatibility load.
- Pulls the product away from Korean-specific document submission.

Reuses:

- `pdf-lib`, file helper patterns, current PDF category.

Recommendation: Approach B. It is the smallest move that makes the product feel larger, not just longer.

## Selected Mode

SELECTIVE_EXPANSION.

Reason: this is no longer a greenfield site. The current product has enough tools that the next leverage point is composition. Show users the path through existing tools before adding heavier commodity tools.

## Product Architecture

The site should organize around jobs, not file extensions.

```text
K문서툴
  ├─ 작성: 거래명세서, 견적서, 청구서, 영수증, 명판, 금액 한글
  ├─ 계산: 부가세, 3.3%
  ├─ 정리: 압축, 리사이즈, 자르기, 회전, 형식 변환, HEIC 변환
  ├─ 묶기: JPG PDF 변환, future PDF merge/reorder/delete
  └─ 제출: workflow package pages, checklist, next-step CTAs
```

The public IA should become:

```text
Home
  -> 제출 준비
  -> 전체 도구
  -> 업무 문서
  -> 이미지
  -> PDF
  -> workflow packages
       -> 사진/스캔 제출 패키지
       -> 사업자 서류 제출 패키지
       -> 프리랜서 정산/청구 패키지
```

## 12-Month Ideal

```text
CURRENT
17 useful tools
problem-situation shortcuts
analytics and indexing set up

NEXT
workflow package layer
existing tools grouped by urgent job
analytics compares package -> shortcut -> tool -> download

12-MONTH IDEAL
Korean no-login document submission workspace
30-50 tools
search-led expansion
each tool has a reason inside a workflow
browser-local by default
server processing only for proven high-value tasks
```

## Scope Decisions

| # | Proposal | Effort | Decision | Reasoning |
|---:|---|---:|---|---|
| 1 | Build workflow package pages before another heavy file tool | M | ACCEPTED | This compounds the 17 existing tools and clarifies the product. |
| 2 | Add three initial package pages: 사진/스캔 제출, 사업자 서류 제출, 프리랜서 정산/청구 | M | ACCEPTED | These map to current assets and do not require new risky processing. |
| 3 | Add package click analytics | S | ACCEPTED | We need to compare package starts against downstream tool starts/downloads. |
| 4 | Keep generic PDF merge deferred | M | DEFERRED | Build only after package data shows PDF bundling demand beyond JPG-to-PDF. |
| 5 | Add PDF page reorder/delete before full PDF merge | M | DEFERRED | This may be a better PDF wedge than merge, but it should follow package evidence. |
| 6 | Add legal forms such as 계약서/차용증/위임장 | L | SKIPPED | Trust and legal ambiguity are too high without official sources and 기준일. |
| 7 | Add account/history/autosave | L | SKIPPED | It breaks the no-login, no-server-upload v1 promise before demand is proven. |

## Accepted Scope

- Add a workflow package layer.
- Reuse existing tools instead of inventing new processing first.
- Track package click-through events.
- Update `docs/growth-loop.md` and `docs/analytics-events.md` so package pages become part of the weekly decision loop.
- Keep all user document/file content browser-local.

## NOT In Scope

- Generic PDF suite parity.
- Server-side uploads.
- Login, saved documents, history, CRM, or customer database.
- Legal/tax/labor document authority.
- AI OCR or form extraction until there is enough traffic and a security plan.

## Proposed Package Pages

### 1. 사진/스캔 제출 패키지

User moment:

```text
"사진이나 스캔본을 올려야 하는데 용량, 크기, 방향, 형식, PDF 조건 중 하나에 걸렸다."
```

Primary tools:

- 사진 용량 줄이기
- 이미지 리사이즈
- 이미지 자르기
- 이미지 회전
- WebP JPG 변환
- HEIC JPG 변환
- JPG PDF 변환

Page flow:

```text
문제 선택
  -> 용량 초과 / 크기 제한 / 방향 오류 / 형식 오류 / 여백 많음 / 여러 장 PDF
  -> preset shortcut
  -> tool action
  -> JPG PDF or download next step
```

### 2. 사업자 서류 제출 패키지

User moment:

```text
"거래처나 기관에 사업자 정보가 들어간 서류를 빠르게 만들어 제출해야 한다."
```

Primary tools:

- 사업자 명판 만들기
- 도장 배경 제거
- 거래명세서
- 견적서
- 청구서
- 영수증
- 금액 한글 변환
- JPG PDF 변환

Page flow:

```text
서류 종류 선택
  -> 명판/도장 준비
  -> 문서 작성
  -> 인쇄/PDF 저장
  -> 첨부 이미지 PDF 묶기
```

### 3. 프리랜서 정산/청구 패키지

User moment:

```text
"프리랜서 작업 후 청구 금액, 3.3%, 영수증/청구서를 빠르게 정리해야 한다."
```

Primary tools:

- 3.3% 계산기
- 청구서
- 영수증
- 견적서
- 부가세 계산기
- 금액 한글 변환

Page flow:

```text
정산 방식 선택
  -> 3.3% 또는 부가세 계산
  -> 청구서/영수증 작성
  -> 한글 금액 확인
  -> 인쇄/PDF 저장
```

## Analytics Plan

New events:

| Event | When | Fields |
|---|---|---|
| `package_nav_click` | Header or card links to a package page | `label`, `href`, `package_id` |
| `package_problem_click` | Problem card inside a package page | `package_id`, `problem_id`, `target_tool_id`, `target_preset`, `href` |
| `package_tool_click` | Direct tool card inside a package page | `package_id`, `tool_id`, `tool_title`, `href` |

Funnel:

```text
package page view
  -> package_problem_click or package_tool_click
  -> tool_start
  -> tool generate/print/download
```

Do not send:

- file names
- document text
- business numbers
- addresses
- customer names
- OCR text

## Error And Rescue Registry

| Codepath | Failure | Rescue action | User sees | Test |
|---|---|---|---|---|
| Package route render | Missing package metadata | Build or smoke failure | No broken route ships | Smoke route test |
| Package card link | Link points to missing tool | Smoke fails on anchor status | No dead link ships | Link existence test |
| Preset handoff | Unknown preset param | Tool falls back to default with no crash | Default tool state | Existing preset smoke |
| Analytics click payload | Sensitive fields accidentally added | Whitelist package/tool/preset ids only | No sensitive data leaves browser | Event payload test |
| Mobile package layout | Cards overflow | CSS/grid smoke detects overflow | Usable mobile page | Mobile overflow test |

## Failure Modes

| Failure mode | Severity | Mitigation |
|---|---:|---|
| Package pages become thin SEO landing pages | High | Each page must have actual problem cards and direct tool paths. |
| Users get lost between packages and categories | Medium | Keep category nav, but package pages lead with user problems. |
| Analytics cannot distinguish package intent | High | Add stable `package_id` and `problem_id`. |
| Generic PDF temptation returns too early | Medium | Only build after package and Search Console data show a PDF-specific gap. |
| Legal/trust copy overpromises | High | Keep disclaimers and avoid official/legal authority claims. |

## Design And UX Rules

- Package pages are not marketing pages.
- First viewport shows the actual problem choices, not a hero-only introduction.
- Use compact cards with clear Korean labels.
- Keep navigation category-first as tool count grows.
- Every package page needs:
  - H1 tied to the job.
  - 5-7 problem choices.
  - A short "추천 순서" section.
  - Direct tool cards.
  - privacy/trust copy.
  - related category links.

User flow:

```text
User sees an upload/document blocker
  -> opens package page
  -> clicks the matching problem
  -> lands on a preset tool state
  -> completes action
  -> follows next-step CTA if needed
```

## Test Plan

Add smoke coverage for:

- package routes render H1, canonical, no framework overlay.
- package pages have no mobile horizontal overflow.
- each package has at least one problem card and one tool card.
- package problem cards include `package_id`, `problem_id`, `target_tool_id`, and optional `target_preset`.
- all package links resolve to existing local routes.
- event payloads do not include raw text/file fields.

Commands:

```bash
npm run check
npm run build
npm run test:smoke
```

## Implementation Tasks

- [ ] **T1 (P1, human: ~2h / Codex: ~20min)** — Package registry — Add `src/data/packages.ts` with package metadata, problem cards, target tool ids, and preset targets.
  - Files: `src/data/packages.ts`, `src/data/tools.ts`.
  - Verify: TypeScript catches missing tool ids.

- [ ] **T2 (P1, human: ~3h / Codex: ~35min)** — Package pages — Add the three workflow package routes.
  - Files: `src/pages/workflows/photo-scan-submission.astro`, `src/pages/workflows/business-document-submission.astro`, `src/pages/workflows/freelance-billing.astro`.
  - Verify: routes render, internal links work, no mobile overflow.

- [ ] **T3 (P1, human: ~1h / Codex: ~10min)** — Analytics — Add package click metadata to `BaseLayout` click tracking and document it.
  - Files: `src/layouts/BaseLayout.astro`, `docs/analytics-events.md`.
  - Verify: event payload includes ids and omits raw input.

- [ ] **T4 (P2, human: ~1h / Codex: ~10min)** — Growth loop — Add package funnel comparison to the weekly loop.
  - Files: `docs/growth-loop.md`, `docs/search-registration.md`.
  - Verify: package URLs are listed for indexing and weekly review.

- [ ] **T5 (P2, human: ~2h / Codex: ~20min)** — Navigation — Add compact package entry points without making the header longer.
  - Files: `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `src/pages/tools/index.astro`.
  - Verify: all tools remain reachable through `/tools/`, mobile nav does not overflow.

## Next-Step Recommendation

Build T1-T4 as the next implementation loop. Skip T5 unless the package links need a visible navigation entry immediately.

Recommended first package to ship:

```text
사진/스캔 제출 패키지
```

Reason: it directly reuses the newest shortcut analytics and the strongest current tool cluster: compress, resize, crop, rotate, convert, HEIC, JPG PDF.

## Completion Summary

```text
+====================================================================+
|            CEO REVIEW COMPLETION SUMMARY                           |
+====================================================================+
| Mode selected        | SELECTIVE_EXPANSION                         |
| System Audit         | 17 tools, 3 categories, workflow hub live    |
| Premise              | Win submission moments, not generic PDFs     |
| Approach selected    | B: workflow package pages                    |
| Scope proposals      | 7 proposed, 3 accepted, 2 deferred, 2 skipped|
| Architecture         | package registry + routes + analytics        |
| Security             | browser-local, analytics whitelist           |
| UX                   | problem-first package pages                  |
| Tests                | route, link, metadata, overflow, payload     |
| Next build           | 사진/스캔 제출 패키지 first                  |
+====================================================================+
```

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|---|---|---|---:|---|---|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | CLEAR | SELECTIVE_EXPANSION, package layer accepted, generic PDF suite deferred |
| Eng Review | `/plan-eng-review` | Architecture & tests | 1 | STALE | Prior review predates current shortcut/package direction |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | NOT RUN | Recommended after package pages ship |

- **VERDICT:** CEO direction clear. Next required gate after implementation is a fresh eng review if package routes touch navigation, analytics, and smoke tests.

NO UNRESOLVED DECISIONS
