# Minimal Funnel Analytics

K문서툴 stores an exact three-stage funnel in Cloudflare D1 while Cloudflare Web Analytics remains the source for
human visits and referrers.

```text
tool_view -> tool_start -> useful_result
```

`useful_result` means a download, copy, or print flow was initiated. It does not prove that a browser finished
saving a file or that a document was physically printed.

## Operations

```bash
npm run analytics:funnel -- --days 7
npm run analytics:funnel -- --local --all-sources
npm run analytics:funnel -- --preview --all-sources
npm run analytics:funnel -- --preview --all-sources --include-synthetic
npm run analytics:feedback -- --days 7
npm run analytics:feedback -- --organic --comments
npm run analytics:feedback -- --local --comments
npm run analytics:migrate:local
npm run analytics:migrate:preview
npm run analytics:migrate:production
```

The default report is organic-only and excludes synthetic canaries. Do not make a roadmap decision until it says
`READY`, which requires at least 14 elapsed days, 30 organic sessions inside the selected report period, and no
more than 5% orphan milestone sessions. Compare tool views with Cloudflare Web Analytics before acting on the
result.

The public endpoint is anonymous. Origin and Fetch Metadata checks reject ordinary cross-site submissions but
are not user authentication and can be forged by non-browser clients. A D1-backed global limit accepts at most
600 valid events per hour as an abuse backstop. Treat any unexplained spike as suspect and reconcile the funnel
with Cloudflare Web Analytics before making a product decision.

Tool feedback is stored separately from the unique three-stage funnel. One row per tab session and tool is
upserted, so retries and changed answers do not inflate response counts. The feedback endpoint has its own
120-valid-submission hourly backstop. The default report is aggregate-only; use `--comments` to print optional
free-text responses.

## Privacy Boundary

- Files and form values stay in the browser.
- No filename, file metadata, document content, raw referrer, query, IP address, or user agent is written to D1.
- Explicit feedback may include a user-entered comment of up to 200 characters. The UI warns against entering
  personal information, and comments are shown by the report only when `--comments` is requested.
- The source is reduced to `naver`, `google`, `search_other`, `referral`, `direct`, `internal`, or `unknown`.
- GPC or DNT prevents first-party funnel delivery.
- A session is a random tab-scoped UUID with 30-minute inactivity and four-hour absolute expiration.
- Accepted writes and report runs remove sessions older than the operational 90-day target. This is an operating
  target rather than a guaranteed hard deletion deadline while the site is completely idle.

The schema is versioned in `migrations/`, and shared allowlists are in `shared/funnel-contract.mjs` and
`shared/feedback-contract.mjs`. `public/_routes.json` sends all requests through the Pages middleware so the
legacy `pages.dev` hostname can redirect permanently while API routes continue to use Pages Functions.
