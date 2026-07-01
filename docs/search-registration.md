# Search registration checklist

Production URL:

- `https://k-document-tool.pages.dev/`

Sitemap:

- `https://k-document-tool.pages.dev/sitemap-index.xml`

Robots:

- `https://k-document-tool.pages.dev/robots.txt`

Public health check:

- `npm run seo:health`

## Google Search Console

Recommended property type for the current launch:

- URL prefix property
- URL: `https://k-document-tool.pages.dev/`

After verification:

1. Open Sitemaps.
2. Submit `https://k-document-tool.pages.dev/sitemap-index.xml`.
3. Inspect these URLs and request indexing:
   - `https://k-document-tool.pages.dev/`
   - `https://k-document-tool.pages.dev/tools/`
   - `https://k-document-tool.pages.dev/tools/submission-file-prep/`
   - `https://k-document-tool.pages.dev/workflows/photo-scan-submission/`
   - `https://k-document-tool.pages.dev/workflows/business-document-submission/`
   - `https://k-document-tool.pages.dev/workflows/freelance-billing/`
   - `https://k-document-tool.pages.dev/problems/`
   - `https://k-document-tool.pages.dev/problems/file-format-error/`
   - `https://k-document-tool.pages.dev/problems/heic-jpg-submit/`
   - `https://k-document-tool.pages.dev/problems/photo-under-1mb/`
   - `https://k-document-tool.pages.dev/problems/image-pixel-limit/`
   - `https://k-document-tool.pages.dev/problems/sideways-scan/`
   - `https://k-document-tool.pages.dev/problems/document-photo-crop/`
   - `https://k-document-tool.pages.dev/problems/images-to-one-pdf/`
   - `https://k-document-tool.pages.dev/categories/business/`
   - `https://k-document-tool.pages.dev/categories/pdf/`
   - `https://k-document-tool.pages.dev/categories/image/`
   - `https://k-document-tool.pages.dev/tools/business-nameplate-maker/`
   - `https://k-document-tool.pages.dev/tools/transaction-statement-generator/`
   - `https://k-document-tool.pages.dev/tools/estimate-generator/`
   - `https://k-document-tool.pages.dev/tools/invoice-generator/`
   - `https://k-document-tool.pages.dev/tools/receipt-generator/`
   - `https://k-document-tool.pages.dev/tools/vat-calculator/`
   - `https://k-document-tool.pages.dev/tools/amount-korean-converter/`
   - `https://k-document-tool.pages.dev/tools/freelance-withholding-calculator/`
   - `https://k-document-tool.pages.dev/tools/stamp-background-remover/`
   - `https://k-document-tool.pages.dev/tools/jpg-to-pdf-converter/`
   - `https://k-document-tool.pages.dev/tools/photo-size-reducer/`
   - `https://k-document-tool.pages.dev/tools/image-resizer/`
   - `https://k-document-tool.pages.dev/tools/image-cropper/`
   - `https://k-document-tool.pages.dev/tools/image-rotator/`
   - `https://k-document-tool.pages.dev/tools/image-converter/`
   - `https://k-document-tool.pages.dev/tools/heic-jpg-converter/`

The PDF and image categories are now indexable because each has a live browser-local tool.

If Google gives an HTML verification file, place it in `public/`, rebuild, and redeploy.
If Google gives a meta verification tag, add it to `src/layouts/BaseLayout.astro`, rebuild, and redeploy.

## Naver Search Advisor

Site URL:

- `https://k-document-tool.pages.dev/`

After site ownership verification:

1. Submit sitemap: `https://k-document-tool.pages.dev/sitemap-index.xml`.
2. Request collection for the same thirty-three indexable URLs listed above.
3. Check that robots.txt is detected as allowed.

If Naver gives an HTML verification file, place it in `public/`, rebuild, and redeploy.
If Naver gives a meta verification tag, add it to `src/layouts/BaseLayout.astro`, rebuild, and redeploy.

### Collection Request Log

- `2026-07-02 02:52 KST`: requested collection for the three workflow package URLs:
  - `https://k-document-tool.pages.dev/workflows/photo-scan-submission/`
  - `https://k-document-tool.pages.dev/workflows/business-document-submission/`
  - `https://k-document-tool.pages.dev/workflows/freelance-billing/`
- At the same check, Google Search Console still showed `0` clicks and `1` impression over the available 28-day performance view. Visible impression pages were `/` and `/tools/business-nameplate-maker/`.

## IndexNow

IndexNow is enabled for Naver/Bing-style discovery signals.

- Key file: `https://k-document-tool.pages.dev/7f9e3a1c0d8b4f6a9c2e5d0a1b3c4e6f.txt`
- Submit command after a production build: `npm run seo:indexnow`
- Dry run: `npm run seo:indexnow -- --dry-run`

Use this after adding or materially updating indexable URLs. It notifies participating search engines that pages changed, but it does not guarantee indexing or ranking.

## Later custom domain

When a custom domain is ready, update these files before deploying:

- `astro.config.mjs`
- `public/robots.txt`
- `src/data/seo.ts`
- `public/7f9e3a1c0d8b4f6a9c2e5d0a1b3c4e6f.txt` if changing the IndexNow key or host

Then rebuild and resubmit the new sitemap in Google Search Console and Naver Search Advisor.
