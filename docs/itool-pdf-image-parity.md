# iTool PDF/Image Parity

Checked: 2026-07-04

Sources:

- https://itool.co.kr/pdf/
- https://itool.co.kr/image/

## PDF

| iTool tool | K문서툴 status | K문서툴 URL | Notes |
| --- | --- | --- | --- |
| PDF 합치기 | Done | `/tools/pdf-merge/` | Browser-local merge, reorder, sample PDFs, E2E covered. |
| PDF 페이지 삭제 | Done | `/tools/pdf-delete-pages/` | Browser-local page removal, sample 4-page PDF, E2E covered. |
| PDF 나누기 | Done | `/tools/pdf-split/` | Browser-local range split, sample 5-page PDF, E2E covered. |
| 이미지 -> PDF 변환 | Done | `/tools/jpg-to-pdf-converter/` | JPG, PNG, WebP to one PDF. |
| PDF 간편 편집(서명) | Done | `/tools/pdf-editor/` | Browser-local text overlay, check/cross/circle marks, signature drawing, stamp/image overlay, page rotation, E2E covered. |
| PDF to JPG | Done | `/tools/pdf-to-image-converter/` | Browser-local PDF page rendering to JPG, sample PDF, E2E covered. |
| PDF to PNG | Done | `/tools/pdf-to-image-converter/` | Same converter supports PNG output, E2E covered. |
| PDF 페이지 반으로 나누기 | Done | `/tools/pdf-split-in-half/` | Browser-local book scan left/right split, left-to-right or right-to-left order, E2E and rendered PDF check covered. |
| PDF 페이지 2장씩 1장으로 합치기 | Done | `/tools/pdf-two-up/` | Browser-local 2-up layout, left/right order, blank page option, E2E and rendered PDF check covered. |
| PDF 여백 자르기 | Done | `/tools/pdf-crop/` | Browser-local crop, first-page auto margin detection, manual/preset margins, E2E and rendered PDF check covered. |
| PDF 텍스트 추출 | Done | `/tools/pdf-text-extractor/` | Browser-local selectable text extraction, page-separated output, copy/TXT download, E2E and extraction checks covered. |

## Image

| iTool tool | K문서툴 status | K문서툴 URL | Notes |
| --- | --- | --- | --- |
| HEIC 뷰어 | Done | `/tools/heic-jpg-converter/` | Browser-local HEIC/HEIF decode, viewer-style converted preview, JPG/PNG download, E2E covered. |
| 사진 용량 줄이기 | Done | `/tools/photo-size-reducer/` | Browser-local compression, E2E covered. |
| Image to JPG | Done | `/tools/image-converter/?preset=jpg` | Generic converter supports JPG output from JPG/PNG/WebP/GIF/AVIF/BMP/SVG, E2E covered. |
| Image to PNG | Done | `/tools/image-converter/?preset=png` | Generic converter supports PNG output from JPG/PNG/WebP/GIF/AVIF/BMP/SVG, E2E covered. |
| Image to WebP | Done | `/tools/image-converter/?preset=webp` | Generic converter supports WebP output from JPG/PNG/WebP/GIF/AVIF/BMP/SVG, E2E covered. |
| 사진 날짜 표시 | Done | `/tools/photo-date-stamper/` | Browser-local EXIF date detection, manual date fallback, seven-segment orange stamp, JPG/PNG output, E2E covered. |
| 사진 합치기 | Done | `/tools/photo-merge/` | Browser-local multi-image canvas merge with vertical, horizontal, grid, captions, spacing, border, E2E covered. |
| SVG 여백 제거 | Done | `/tools/svg-crop/` | Browser-local SVG viewBox trimming, file upload, markup input, padding, copy/download, E2E covered. |
| 이미지 Base64 변환기 | Done | `/tools/image-base64-converter/` | Browser-local image to Base64 data URI, Base64/data URI restore, HTML/CSS copy, E2E covered. |
| 동영상 GIF 변환 | Done | `/tools/video-to-gif-converter/` | Browser-local MP4/MOV/WebM to GIF, start/end range, width, FPS, quality, speed, loop pause, sample video, E2E covered. |

## Current Next Priority

All public iTool PDF/image tools are implemented in K문서툴. Next pass: verify rendered behavior against production and decide whether to add separate SEO landing aliases for Image to JPG, Image to PNG, and Image to WebP.
