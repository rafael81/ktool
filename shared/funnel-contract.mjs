export const TOOL_PATH_BY_ID = Object.freeze({
  "business-nameplate": "/tools/business-nameplate-maker/",
  "transaction-statement": "/tools/transaction-statement-generator/",
  estimate: "/tools/estimate-generator/",
  receipt: "/tools/receipt-generator/",
  invoice: "/tools/invoice-generator/",
  "vat-calculator": "/tools/vat-calculator/",
  "amount-korean": "/tools/amount-korean-converter/",
  "withholding-tax": "/tools/freelance-withholding-calculator/",
  "stamp-background": "/tools/stamp-background-remover/",
  "pdf-edit": "/tools/pdf-editor/",
  "pdf-split-half": "/tools/pdf-split-in-half/",
  "pdf-two-up": "/tools/pdf-two-up/",
  "pdf-crop": "/tools/pdf-crop/",
  "pdf-text-extract": "/tools/pdf-text-extractor/",
  "pdf-split": "/tools/pdf-split/",
  "pdf-delete-pages": "/tools/pdf-delete-pages/",
  "pdf-merge": "/tools/pdf-merge/",
  "pdf-to-image": "/tools/pdf-to-image-converter/",
  "jpg-to-pdf": "/tools/jpg-to-pdf-converter/",
  "photo-date-stamp": "/tools/photo-date-stamper/",
  "photo-merge": "/tools/photo-merge/",
  "image-compressor": "/tools/photo-size-reducer/",
  "image-resizer": "/tools/image-resizer/",
  "image-cropper": "/tools/image-cropper/",
  "image-rotator": "/tools/image-rotator/",
  "image-converter": "/tools/image-converter/",
  "svg-crop": "/tools/svg-crop/",
  "image-base64": "/tools/image-base64-converter/",
  "video-to-gif": "/tools/video-to-gif-converter/",
  "heic-to-jpg": "/tools/heic-jpg-converter/"
});

export const RESULT_EVENT_TYPES = Object.freeze({
  tool_download: "download",
  tool_print: "print",
  calculator_copy: "copy",
  amount_converter_copy: "copy",
  withholding_calculator_copy: "copy",
  stamp_background_download: "download",
  jpg_pdf_download: "download",
  photo_merge_download: "download",
  photo_date_download: "download",
  pdf_edit_download: "download",
  pdf_half_download: "download",
  pdf_two_up_download: "download",
  pdf_crop_download: "download",
  pdf_text_copy: "copy",
  pdf_text_download: "download",
  pdf_merge_download: "download",
  pdf_delete_download: "download",
  pdf_split_download: "download",
  pdf_image_download: "download",
  image_compressor_download: "download",
  image_resize_download: "download",
  image_crop_download: "download",
  image_rotate_download: "download",
  image_convert_download: "download",
  svg_crop_copy: "copy",
  svg_crop_download: "download",
  image_base64_copy: "copy",
  image_base64_download: "download",
  video_gif_download: "download",
  heic_convert_download: "download"
});

export const FUNNEL_EVENT_NAMES = Object.freeze(["tool_view", "tool_start", "useful_result"]);
export const RESULT_TYPES = Object.freeze(["download", "copy", "print"]);
export const SOURCE_TYPES = Object.freeze([
  "naver",
  "google",
  "search_other",
  "referral",
  "direct",
  "internal",
  "unknown",
  "synthetic"
]);
export const STORAGE_MODES = Object.freeze(["session", "memory"]);

export const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const BUILD_ID = /^[0-9a-f]{7,40}$/i;

export const MAX_BODY_BYTES = 2_048;
export const SESSION_IDLE_MS = 30 * 60 * 1_000;
export const SESSION_MAX_MS = 4 * 60 * 60 * 1_000;
export const RETENTION_MS = 90 * 24 * 60 * 60 * 1_000;
export const INGEST_WINDOW_MS = 60 * 60 * 1_000;
export const INGEST_MAX_EVENTS_PER_WINDOW = 600;
