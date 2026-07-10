# Analytics event contract

This project keeps analytics provider-neutral. Events are pushed to `window.dataLayer` and also emitted as a browser `kdoc:analytics` `CustomEvent`.

Cloudflare Web Analytics is installed through the public beacon script in `src/layouts/BaseLayout.astro`.

## Common payload

Every event includes:

- `event`: event name
- `page_path`: canonical app path
- `page_title`: current page title
- `event_time`: ISO timestamp

The shared `window.kdocTrack` helper drops known sensitive keys such as filenames, raw image bytes, OCR text, document text, business numbers, addresses, customer names, email, and phone values. String values are length-limited, object payloads are ignored, and tracked same-origin `href` values keep only safe routing parameters: `from`, `preset`, `problem_id`, `shortcut_id`, and `source`.

Tool pages also include:

- `tool_id`: stable tool id from `src/data/tools.ts`
- `tool_title`: visible tool title

Problem-intent pages also include:

- `problem_id`: stable problem id from `src/data/problemPages.ts`
- `problem_title`: visible problem title

## Events

| Event | When it fires | Important extra fields |
| --- | --- | --- |
| `page_view` | Page analytics boot completes | `tool_id`, `tool_title` on tool pages; `problem_id`, `problem_title` on problem pages |
| `tool_start` | First input/change inside a tool | `tool_id`, `tool_title` |
| `catalog_nav_click` | Header catalog link click | `label`, `href` |
| `problem_hub_nav_click` | Header or catalog problem-hub link click | `label`, `href` |
| `package_nav_click` | Header, home, or catalog workflow package link click | `label`, `href`, `package_id` |
| `category_nav_click` | Header category link click | `label`, `href` |
| `header_search_click` | Header search shortcut click or keyboard shortcut | `label`, `href`, optional `trigger` |
| `home_search_change` | Home search input or category filter changes | `search_category`, `visible_count`, `search_query_length` |
| `home_search_tool_click` | Home search tool result click | `tool_id`, `tool_title`, `label`, `href` |
| `home_search_problem_click` | Home search problem-intent result click | `tool_id`, `tool_title`, `label`, `href`, optional `target_preset` |
| `home_search_empty_click` | Home empty-search recovery link click | `label`, `href` |
| `home_quick_start_click` | Home first-screen quick-start link click | `tool_id`, `tool_title`, `label`, `href`, optional `target_preset` |
| `home_problem_start_click` | Home first-screen problem card click | `problem_id`, `target_problem_id`, `target_problem_title`, `target_tool_id`, `target_tool_title`, optional `target_preset`, `label`, `href` |
| `home_problem_all_click` | Home problem section link to all problem pages | `label`, `href` |
| `home_catalog_all_click` | Home category section link to the full catalog | `label`, `href` |
| `home_all_tool_click` | Home category tool row click | `tool_id`, `tool_title`, `label`, `href` |
| `catalog_workflow_quick_link_click` | Tool catalog submission-prep quick-link click | `label`, `href` |
| `catalog_quick_start_click` | Tool catalog first-screen quick-start link click | `tool_id`, `tool_title`, `label`, `href`, optional `target_preset` |
| `catalog_prep_shortcut_click` | Tool catalog problem-situation shortcut click | `label`, `href`, `shortcut_id`, `tool_id`, `tool_title`, optional `target_preset` |
| `catalog_category_click` | Tool catalog category link click | `label`, `href` |
| `catalog_filter_change` | Tool catalog category filter changes | `catalog_category`, `visible_count`, `search_query_length` |
| `catalog_search_change` | Tool catalog search input changes | `catalog_category`, `visible_count`, `search_query_length` |
| `catalog_search_empty_click` | Tool catalog empty-search recovery link click | `label`, `href` |
| `catalog_tool_click` | Tool catalog tool row click | `tool_id`, `tool_title`, `label`, `href` |
| `catalog_problem_search_click` | Tool catalog search-only problem result click | `problem_id`, `target_problem_id`, `target_problem_title`, `target_tool_id`, `target_tool_title`, `label`, `href`, optional `target_preset` |
| `problem_entry_click` | Tool catalog problem-intent row click | `label`, `href` |
| `problem_hub_catalog_click` | Problem hub link to the full tool catalog | `label`, `href` |
| `problem_hub_submission_prep_click` | Problem hub link to the submission-prep flow | `label`, `href` |
| `problem_hub_category_click` | Problem hub quick category link click | `label`, `href` |
| `problem_hub_click` | Problem hub problem-intent row click | `problem_id`, `target_problem_id`, `target_problem_title`, `target_tool_id`, `target_tool_title`, `label`, `href`, optional `target_preset` |
| `tool_problem_arrival` | Tool page opens from a problem page CTA | `tool_id`, `tool_title`, `source`, `problem_id`, `problem_title`, optional `target_preset` |
| `problem_arrival_back_click` | Problem-source tool page banner link back to the problem page | `tool_id`, `tool_title`, `target_problem_id`, `target_problem_title`, `label`, `href` |
| `problem_primary_tool_click` | Problem page first CTA click | `problem_id`, `problem_title`, `tool_id`, `tool_title`, `label`, `href`, optional `target_preset` |
| `problem_tool_click` | Problem page recommended tool row click | `problem_id`, `problem_title`, `tool_id`, `tool_title`, `label`, `href`, optional `target_preset` |
| `problem_submission_prep_click` | Problem page link to submission-prep hub | `problem_id`, `problem_title`, `label`, `href` |
| `problem_related_click` | Problem page adjacent problem click | `problem_id`, `problem_title`, `target_problem_id`, `target_problem_title`, `label`, `href` |
| `category_workflow_quick_link_click` | Category page submission-prep quick-link click | `label`, `href` |
| `category_workflow_click` | Category page workflow card click | `label`, `href` |
| `category_prep_shortcut_click` | Category page problem-situation shortcut click | `label`, `href`, `shortcut_id`, `tool_id`, `tool_title`, optional `target_preset` |
| `category_tool_quick_link_click` | Category page quick-link click | `tool_id`, `tool_title`, `label`, `href` |
| `category_tool_click` | Category page tool card click | `tool_id`, `tool_title`, `label`, `href` |
| `related_tool_click` | Related tool card click | `tool_id`, `tool_title`, `label`, `href` |
| `package_related_click` | Workflow package related link click | `label`, `href`, `package_id` |
| `package_problem_click` | Workflow package problem shortcut click | `label`, `href`, `package_id`, `problem_id`, `target_tool_id`, optional `target_preset` |
| `package_tool_click` | Workflow package step or tool card click | `tool_id`, `tool_title`, `label`, `href`, `package_id` |
| `tool_quick_link_click` | Tool quick-link click | `tool_id`, `tool_title`, `label`, `href` |
| `prep_quick_tool_click` | Submission-prep page quick tool link click | `tool_id`, `tool_title`, `label`, `href` |
| `prep_problem_click` | Submission-prep problem card click | `problem_id`, `target_problem_id`, `target_problem_title`, `target_tool_id`, `target_tool_title`, optional `target_preset`, `label`, `href` |
| `prep_pdf_path_click` | Submission-prep highlighted PDF workflow step or CTA click | `tool_id`, `tool_title`, `label`, `href` |
| `prep_pdf_decision_click` | Submission-prep PDF workflow decision hint click | `tool_id`, `tool_title`, `label`, `href` |
| `prep_format_path_click` | Submission-prep format-error workflow step click | `tool_id`, `tool_title`, `label`, `href` |
| `prep_compression_path_click` | Submission-prep compression-limit workflow step click | `tool_id`, `tool_title`, `label`, `href` |
| `prep_situation_click` | Submission-prep situation card click | `tool_id`, `tool_title`, `label`, `href` |
| `prep_flow_tool_click` | Submission-prep flow step tool click | `tool_id`, `tool_title`, `label`, `href` |
| `prep_tool_click` | Submission-prep tool card click | `tool_id`, `tool_title`, `label`, `href` |
| `tool_sample_apply` | Sample data is applied | `tool_id`, `tool_title`, optional `changed_field_count`, `filled_field_count`, `sample_data`, `source` |
| `tool_reset` | Tool form is reset | `tool_id`, `tool_title`, optional `changed_field_count`, `filled_field_count`, `sample_data`, `source` |
| `tool_stamp_select` | Nameplate stamp image is selected | `file_type`, `file_size` |
| `tool_validation_error` | Client-side validation blocks an action | `reason` |
| `tool_download` | Nameplate PNG is generated and download starts | `file_format`, `background`, `has_stamp`, `changed_field_count`, `filled_field_count`, `sample_data`, `source` |
| `document_tool_quick_start_arrival` | A document generator opens from a home or catalog quick-start CTA | `tool_id`, `tool_title`, `document_title`, `source` |
| `tool_row_add` | A document item row is added | `row_count`, `document_title`, `source` |
| `tool_row_remove` | A document item row is removed | `row_count`, `document_title`, `source` |
| `tool_print` | Print/PDF action is requested | `row_count`, `vat_mode`, `document_title`, `source` |
| `calculator_mode_change` | VAT calculator mode changes | `calculator_mode` |
| `calculator_sample_apply` | VAT calculator sample amount is applied | `calculator_mode` |
| `calculator_reset` | VAT calculator is reset | `calculator_mode` |
| `calculator_copy` | VAT calculator result is copied | `calculator_mode` |
| `calculator_copy_error` | VAT calculator result copy fails | `calculator_mode` |
| `amount_converter_sample_apply` | Korean amount converter sample is applied | none |
| `amount_converter_reset` | Korean amount converter is reset | none |
| `amount_converter_copy` | Korean amount converter result is copied | none |
| `amount_converter_copy_error` | Korean amount converter result copy fails | none |
| `amount_converter_validation_error` | Korean amount converter input is clamped or rejected | `reason` |
| `withholding_calculator_mode_change` | 3.3% calculator mode changes | `calculator_mode` |
| `withholding_calculator_sample_apply` | 3.3% calculator sample amount is applied | `calculator_mode` |
| `withholding_calculator_reset` | 3.3% calculator is reset | `calculator_mode` |
| `withholding_calculator_copy` | 3.3% calculator result is copied | `calculator_mode` |
| `withholding_calculator_copy_error` | 3.3% calculator result copy fails | `calculator_mode` |
| `stamp_background_file_select` | Stamp background remover image file is selected | `file_type`, `file_size` |
| `stamp_background_sample_apply` | Stamp background remover sample image is applied | none |
| `stamp_background_adjust` | Stamp background remover controls change | `control`, optional `enabled` |
| `stamp_background_download` | Transparent stamp PNG is downloaded | `threshold`, `red_only` |
| `stamp_background_reset` | Stamp background remover is reset | none |
| `stamp_background_validation_error` | Stamp background remover blocks invalid input | `reason`, optional `file_size` |
| `jpg_pdf_file_select` | JPG PDF converter images are selected | `file_count`, `total_size`, `file_types` |
| `jpg_pdf_sample_apply` | JPG PDF converter sample images are applied | `file_count` |
| `jpg_pdf_quick_start_arrival` | JPG PDF converter is opened from a home or catalog quick-start CTA | `source` |
| `jpg_pdf_prep_shortcut_arrival` | JPG PDF converter is opened from a problem-situation shortcut | `source`, `shortcut_id` |
| `jpg_pdf_compressed_arrival` | JPG PDF converter is opened from the photo-size reducer next-step CTA | `source` |
| `jpg_pdf_rotated_arrival` | JPG PDF converter is opened from the image rotator next-step CTA | `source` |
| `jpg_pdf_resized_arrival` | JPG PDF converter is opened from the image resizer next-step CTA | `source` |
| `jpg_pdf_cropped_arrival` | JPG PDF converter is opened from the image cropper next-step CTA | `source` |
| `jpg_pdf_format_converted_arrival` | JPG PDF converter is opened from the image converter next-step CTA | `source` |
| `jpg_pdf_heic_converted_arrival` | JPG PDF converter is opened from the HEIC converter next-step CTA | `source` |
| `jpg_pdf_reorder` | JPG PDF converter image order changes | `from_position`, `to_position`, `file_count`, `method` |
| `jpg_pdf_remove` | JPG PDF converter image is removed from the selected list | `from_position`, `file_count` |
| `jpg_pdf_generate` | JPG PDF converter creates a PDF blob | `file_count`, `total_size`, `output_size`, `page_size`, `margin`, `file_types` |
| `jpg_pdf_download` | JPG PDF converter download link is clicked | `file_count`, `output_size`, `page_size`, `margin` |
| `jpg_pdf_reset` | JPG PDF converter is reset | none |
| `jpg_pdf_validation_error` | JPG PDF converter blocks invalid input or generation failure | `reason`, optional `file_count`, optional `total_size` |
| `photo_merge_file_select` | Photo merger images are selected | `method`, `file_count`, `total_size`, `file_types` |
| `photo_merge_sample_apply` | Photo merger sample images are applied | `file_count` |
| `photo_merge_layout_change` | Photo merger layout or spacing controls change | `layout_mode`, `output_format`, `gap`, `padding`, `border`, `label_mode` |
| `photo_merge_format_change` | Photo merger output format changes | `layout_mode`, `output_format`, `gap`, `padding`, `border`, `label_mode` |
| `photo_merge_reorder` | Photo merger image order changes | `from_position`, `to_position`, `file_count` |
| `photo_merge_remove` | Photo merger image is removed from the selected list | `from_position`, `file_count` |
| `photo_merge_generate` | Photo merger creates a single merged image blob | `file_count`, `total_size`, `file_types`, `output_size`, `output_width`, `output_height`, `output_format`, `layout_mode`, `gap`, `padding`, `border`, `label_mode` |
| `photo_merge_download` | Photo merger download link is clicked | `file_count`, `output_size`, `output_width`, `output_height`, `output_format`, `layout_mode` |
| `photo_merge_reset` | Photo merger is reset | none |
| `photo_merge_validation_error` | Photo merger blocks invalid input or merge failure | `reason`, optional `file_count`, optional `total_size` |
| `photo_date_file_select` | Photo date stamper image is selected | `method`, `file_count`, `total_size`, `file_types`, `has_exif_date` |
| `photo_date_sample_apply` | Photo date stamper sample image is applied | `file_count` |
| `photo_date_stamp_option_change` | Photo date stamper date, position, size, or background controls change | `stamp_position`, `stamp_size`, `date_format`, `background_mode`, `date_source` |
| `photo_date_format_change` | Photo date stamper output format changes | `output_format` |
| `photo_date_generate` | Photo date stamper creates a stamped image blob | `file_count`, `total_size`, `file_types`, `output_size`, `output_width`, `output_height`, `output_format`, `stamp_position`, `stamp_size`, `date_source`, `has_exif_date`, `background_mode` |
| `photo_date_download` | Photo date stamper download link is clicked | `output_size`, `output_width`, `output_height`, `output_format`, `stamp_position`, `date_source` |
| `photo_date_reset` | Photo date stamper is reset | none |
| `photo_date_validation_error` | Photo date stamper blocks invalid input or stamping failure | `reason`, optional `file_count`, optional `total_size` |
| `pdf_edit_file_select` | PDF editor file is selected | `method`, `file_count`, `total_size`, `file_types`, `page_count` |
| `pdf_edit_sample_apply` | PDF editor sample file is applied | `file_count` |
| `pdf_edit_tool_select` | PDF editor active tool changes | `edit_tool` |
| `pdf_edit_option_change` | PDF editor text length or size setting changes | `edit_tool`, `size`, `text_length` |
| `pdf_edit_signature_ready` | PDF editor signature pad is prepared or cleared | `method` |
| `pdf_edit_stamp_select` | PDF editor stamp/image is prepared | `method`, optional `file_count`, optional `total_size`, optional `file_types` |
| `pdf_edit_annotation_add` | PDF editor annotation is added to a page | `edit_tool`, `page_number`, `annotation_count`, `size` |
| `pdf_edit_annotation_remove` | PDF editor annotation is removed | `annotation_count` |
| `pdf_edit_page_change` | PDF editor preview page changes | `page_number` |
| `pdf_edit_rotate` | PDF editor selected page is rotated | `page_number`, `rotation` |
| `pdf_edit_generate` | PDF editor creates an edited PDF blob | `file_count`, `total_size`, `file_types`, `page_count`, `annotation_count`, `rotated_page_count`, `output_size`, `edit_tools` |
| `pdf_edit_download` | PDF editor download link is clicked | `page_count`, `annotation_count`, `rotated_page_count`, `output_size` |
| `pdf_edit_reset` | PDF editor is reset | none |
| `pdf_edit_validation_error` | PDF editor blocks invalid input or editing failure | `reason`, optional `file_count`, optional `total_size` |
| `pdf_half_file_select` | PDF half splitter file is selected | `method`, `file_count`, `total_size`, `file_types`, `page_count`, `output_page_count`, `order` |
| `pdf_half_sample_apply` | PDF half splitter sample file is applied | `file_count` |
| `pdf_half_order_change` | PDF half splitter page order changes | `order`, `page_count`, `output_page_count` |
| `pdf_half_generate` | PDF half splitter creates a left/right split PDF blob | `file_count`, `total_size`, `file_types`, `page_count`, `output_page_count`, `output_size`, `order` |
| `pdf_half_download` | PDF half splitter download link is clicked | `page_count`, `output_page_count`, `output_size`, `order` |
| `pdf_half_reset` | PDF half splitter is reset | none |
| `pdf_half_validation_error` | PDF half splitter blocks invalid input or split failure | `reason`, optional `file_count`, optional `total_size` |
| `pdf_two_up_file_select` | PDF 2-up merger file is selected | `method`, `file_count`, `total_size`, `file_types`, `page_count`, `output_page_count`, `order`, `add_blank_page` |
| `pdf_two_up_sample_apply` | PDF 2-up merger sample file is applied | `file_count` |
| `pdf_two_up_order_change` | PDF 2-up merger page placement order changes | `order`, `add_blank_page`, `page_count`, `output_page_count` |
| `pdf_two_up_blank_change` | PDF 2-up merger odd-page blank setting changes | `order`, `add_blank_page`, `page_count`, `output_page_count` |
| `pdf_two_up_generate` | PDF 2-up merger creates a two-pages-per-sheet PDF blob | `file_count`, `total_size`, `file_types`, `page_count`, `output_page_count`, `blank_page_count`, `output_size`, `order`, `add_blank_page` |
| `pdf_two_up_download` | PDF 2-up merger download link is clicked | `page_count`, `output_page_count`, `blank_page_count`, `output_size`, `order`, `add_blank_page` |
| `pdf_two_up_reset` | PDF 2-up merger is reset | none |
| `pdf_two_up_validation_error` | PDF 2-up merger blocks invalid input or generation failure | `reason`, optional `file_count`, optional `total_size` |
| `pdf_crop_file_select` | PDF cropper file is selected | `method`, `file_count`, `total_size`, `file_types`, `page_count`, `margin_left`, `margin_right`, `margin_top`, `margin_bottom`, `crop_mode` |
| `pdf_crop_sample_apply` | PDF cropper sample file is applied | `file_count` |
| `pdf_crop_auto_detect` | PDF cropper detects margins from the first rendered page | `margin_left`, `margin_right`, `margin_top`, `margin_bottom`, `crop_mode`, `page_count`, `detected_width`, `detected_height` |
| `pdf_crop_margin_change` | PDF cropper manual margin inputs change | `margin_left`, `margin_right`, `margin_top`, `margin_bottom`, `crop_mode`, `page_count` |
| `pdf_crop_preset_apply` | PDF cropper applies a quick margin preset | `preset_margin`, `margin_left`, `margin_right`, `margin_top`, `margin_bottom`, `crop_mode`, `page_count` |
| `pdf_crop_generate` | PDF cropper creates a cropped PDF blob | `file_count`, `total_size`, `file_types`, `page_count`, `output_page_count`, `output_size`, `margin_left`, `margin_right`, `margin_top`, `margin_bottom`, `crop_mode` |
| `pdf_crop_download` | PDF cropper download link is clicked | `page_count`, `output_page_count`, `output_size`, `margin_left`, `margin_right`, `margin_top`, `margin_bottom`, `crop_mode` |
| `pdf_crop_reset` | PDF cropper is reset | none |
| `pdf_crop_validation_error` | PDF cropper blocks invalid input, auto-detection, or generation failure | `reason`, optional `file_count`, optional `total_size` |
| `pdf_text_file_select` | PDF text extractor file is selected | `method`, `file_count`, `total_size`, `file_types`, `page_count` |
| `pdf_text_sample_apply` | PDF text extractor sample file is applied | `file_count` |
| `pdf_text_extract` | PDF text extractor extracts selectable text from a PDF | `trigger`, `file_count`, `total_size`, `file_types`, `page_count`, `pages_with_text`, `character_count`, `output_size`, `include_page_headers` |
| `pdf_text_header_toggle` | PDF text extractor page-header export option changes | `page_count`, `pages_with_text`, `character_count`, `include_page_headers` |
| `pdf_text_copy` | PDF text extractor copied extracted text to clipboard | `page_count`, `pages_with_text`, `character_count`, `include_page_headers` |
| `pdf_text_copy_error` | PDF text extractor clipboard copy failed | `reason` |
| `pdf_text_download` | PDF text extractor TXT download link is clicked | `page_count`, `pages_with_text`, `character_count`, `output_size`, `include_page_headers` |
| `pdf_text_reset` | PDF text extractor is reset | none |
| `pdf_text_validation_error` | PDF text extractor blocks invalid input or extraction failure | `reason`, optional `file_count`, optional `total_size` |
| `pdf_merge_file_select` | PDF merger files are selected | `file_count`, `total_size`, `file_types` |
| `pdf_merge_sample_apply` | PDF merger sample files are applied | `file_count` |
| `pdf_merge_reorder` | PDF merger file order changes | `from_position`, `to_position`, `file_count`, `method` |
| `pdf_merge_remove` | PDF merger file is removed from the selected list | `from_position`, `file_count` |
| `pdf_merge_generate` | PDF merger creates a merged PDF blob | `file_count`, `total_size`, `output_size`, `page_count`, `file_types` |
| `pdf_merge_download` | PDF merger download link is clicked | `file_count`, `output_size`, `page_count` |
| `pdf_merge_reset` | PDF merger is reset | none |
| `pdf_merge_validation_error` | PDF merger blocks invalid input or generation failure | `reason`, optional `file_count`, optional `total_size` |
| `pdf_delete_file_select` | PDF page remover file is selected | `method`, `file_count`, `total_size`, `file_types`, `page_count` |
| `pdf_delete_sample_apply` | PDF page remover sample file is applied | `file_count` |
| `pdf_delete_page_toggle` | PDF page remover page delete selection changes | `page_count`, `deleted_page_count`, `kept_page_count` |
| `pdf_delete_generate` | PDF page remover creates a cleaned PDF blob | `file_count`, `total_size`, `file_types`, `page_count`, `deleted_page_count`, `kept_page_count`, `output_size` |
| `pdf_delete_download` | PDF page remover download link is clicked | `file_count`, `output_size`, `page_count`, `deleted_page_count`, `kept_page_count` |
| `pdf_delete_reset` | PDF page remover is reset | none |
| `pdf_delete_validation_error` | PDF page remover blocks invalid input or generation failure | `reason`, optional `file_count`, optional `total_size` |
| `pdf_split_file_select` | PDF splitter file is selected | `method`, `file_count`, `total_size`, `file_types`, `page_count` |
| `pdf_split_sample_apply` | PDF splitter sample file is applied | `file_count` |
| `pdf_split_range_change` | PDF splitter range text changes | `page_count`, `range_count`, `has_error`, `range_text_length` |
| `pdf_split_preset_apply` | PDF splitter preset range is applied | `preset`, `page_count`, `range_count` |
| `pdf_split_generate` | PDF splitter creates split PDF blobs | `file_count`, `total_size`, `file_types`, `page_count`, `range_count`, `output_page_count`, `output_size` |
| `pdf_split_download` | PDF splitter download link is clicked | `file_count`, `output_size`, `page_count`, `range_count`, `split_index` |
| `pdf_split_reset` | PDF splitter is reset | none |
| `pdf_split_validation_error` | PDF splitter blocks invalid input or generation failure | `reason`, optional `file_count`, optional `total_size` |
| `pdf_image_file_select` | PDF to image converter file is selected | `method`, `file_count`, `total_size`, `file_types`, `page_count` |
| `pdf_image_sample_apply` | PDF to image converter sample file is applied | `file_count` |
| `pdf_image_format_change` | PDF to image converter output format changes | `output_format` |
| `pdf_image_quality_change` | PDF to image converter render quality changes | `render_scale` |
| `pdf_image_generate` | PDF to image converter creates JPG or PNG blobs | `file_count`, `total_size`, `file_types`, `page_count`, `output_count`, `output_size`, `output_format`, `render_scale` |
| `pdf_image_download` | PDF to image converter download link is clicked | `page_count`, `output_count`, `output_size`, `output_format`, `page_number` |
| `pdf_image_reset` | PDF to image converter is reset | none |
| `pdf_image_validation_error` | PDF to image converter blocks invalid input or generation failure | `reason`, optional `file_count`, optional `total_size` |
| `image_compressor_file_select` | Photo size reducer images are selected | `file_count`, `total_size`, `file_types` |
| `image_compressor_sample_apply` | Photo size reducer sample images are applied | `file_count` |
| `image_compressor_preset_arrival` | Photo size reducer is opened with a URL preset | `preset`, `target_size`, `source`, optional `shortcut_id` |
| `image_compressor_preset_change` | Photo size reducer submission target preset changes | `preset`, `target_size` |
| `image_compressor_compress` | Photo size reducer creates compressed image blobs | `file_count`, `total_size`, `output_size`, `output_format`, `quality`, `max_side`, `preset`, `target_size`, `file_types` |
| `image_compressor_download` | Photo size reducer download link is clicked | `output_format`, `before_size`, `after_size` |
| `image_compressor_next_pdf_click` | Photo size reducer next-step JPG PDF converter CTA is clicked | `file_count`, `output_size`, `preset`, `target_size`, `target_tool_id`, `href` |
| `image_compressor_reset` | Photo size reducer is reset | none |
| `image_compressor_validation_error` | Photo size reducer blocks invalid input or compression failure | `reason`, optional `file_count`, optional `total_size` |
| `image_resize_file_select` | Image resizer images are selected | `file_count`, `total_size`, `file_types` |
| `image_resize_sample_apply` | Image resizer sample images are applied | `file_count` |
| `image_resize_preset_arrival` | Image resizer is opened with a URL preset | `source`, optional `shortcut_id`, `preset`, `resize_mode`, `long_side`, `width`, `height`, `keep_aspect` |
| `image_resize_preset_change` | Image resizer submission size preset changes | `preset`, `resize_mode`, `long_side`, `width`, `height`, `keep_aspect` |
| `image_resize_resize` | Image resizer creates resized image blobs | `file_count`, `total_size`, `output_size`, `resize_mode`, `output_format`, `quality`, `keep_aspect`, `preset`, `file_types` |
| `image_resize_download` | Image resizer download link is clicked | `output_format`, `before_size`, `after_size`, `output_width`, `output_height` |
| `image_resize_next_pdf_click` | Image resizer next-step JPG PDF converter CTA is clicked | `file_count`, `output_size`, `output_format`, `resize_mode`, `preset`, `target_tool_id`, `href` |
| `image_resize_reset` | Image resizer is reset | none |
| `image_resize_validation_error` | Image resizer blocks invalid input or resize failure | `reason`, optional `file_count`, optional `total_size` |
| `image_crop_file_select` | Image cropper image is selected | `file_count`, `total_size`, `file_types` |
| `image_crop_sample_apply` | Image cropper sample image is applied | `file_count` |
| `image_crop_preset_arrival` | Image cropper is opened with a URL preset | `source`, optional `shortcut_id`, `preset`, `aspect_preset` |
| `image_crop_preset_change` | Image cropper submission area preset changes | `preset`, `aspect_preset` |
| `image_crop_aspect_change` | Image cropper aspect ratio changes directly | `aspect_preset` |
| `image_crop_crop` | Image cropper creates a cropped image blob | `file_count`, `total_size`, `output_size`, `output_format`, `quality`, `crop_width`, `crop_height`, `aspect_preset`, `preset`, `file_types` |
| `image_crop_download` | Image cropper download link is clicked | `output_format`, `after_size`, `output_width`, `output_height` |
| `image_crop_next_pdf_click` | Image cropper next-step JPG PDF converter CTA is clicked | `file_count`, `output_size`, `output_format`, `crop_width`, `crop_height`, `aspect_preset`, `preset`, `target_tool_id`, `href` |
| `image_crop_reset` | Image cropper is reset | none |
| `image_crop_validation_error` | Image cropper blocks invalid input or crop failure | `reason`, optional `file_count`, optional `total_size` |
| `image_rotate_file_select` | Image rotator images are selected | `file_count`, `total_size`, `file_types` |
| `image_rotate_sample_apply` | Image rotator sample images are applied | `file_count` |
| `image_rotate_preset_arrival` | Image rotator is opened with a URL preset | `source`, optional `shortcut_id`, `preset`, `rotation_angle` |
| `image_rotate_preset_change` | Image rotator submission direction preset changes | `preset`, `rotation_angle` |
| `image_rotate_rotate` | Image rotator creates rotated image blobs | `file_count`, `total_size`, `output_size`, `output_format`, `quality`, `rotation_angle`, `preset`, `file_types` |
| `image_rotate_download` | Image rotator download link is clicked | `output_format`, `before_size`, `after_size`, `output_width`, `output_height`, `rotation_angle`, `preset` |
| `image_rotate_next_pdf_click` | Image rotator next-step JPG PDF converter CTA is clicked | `file_count`, `output_size`, `output_format`, `rotation_angle`, `preset`, `target_tool_id`, `href` |
| `image_rotate_reset` | Image rotator is reset | none |
| `image_rotate_validation_error` | Image rotator blocks invalid input or rotation failure | `reason`, optional `file_count`, optional `total_size` |
| `image_convert_file_select` | Image converter images are selected | `file_count`, `total_size`, `file_types` |
| `image_convert_sample_apply` | Image converter sample images are applied | `file_count` |
| `image_convert_preset_arrival` | Image converter is opened with a URL preset | `source`, optional `shortcut_id`, `preset`, `output_format`, `quality` |
| `image_convert_preset_change` | Image converter output format preset changes | `preset`, `output_format`, `quality` |
| `image_convert_convert` | Image converter creates converted image blobs | `file_count`, `total_size`, `output_size`, `output_format`, `quality`, `preset`, `file_types` |
| `image_convert_download` | Image converter download link is clicked | `source_type`, `output_format`, `before_size`, `after_size`, `preset` |
| `image_convert_next_pdf_click` | Image converter next-step JPG PDF converter CTA is clicked | `file_count`, `output_size`, `output_format`, `quality`, `preset`, `target_tool_id`, `href` |
| `image_convert_reset` | Image converter is reset | none |
| `image_convert_validation_error` | Image converter blocks invalid input or conversion failure | `reason`, optional `file_count`, optional `total_size` |
| `svg_crop_file_select` | SVG cropper file is selected | `method`, `file_count`, `total_size`, `file_types` |
| `svg_crop_sample_apply` | SVG cropper sample SVG is applied | `file_count` |
| `svg_crop_trim` | SVG cropper trims viewBox around visible SVG graphics | `trigger`, `method`, `file_count`, `total_size`, `file_types`, `input_size`, `output_size`, `original_width`, `original_height`, `crop_x`, `crop_y`, `crop_width`, `crop_height`, `padding` |
| `svg_crop_copy` | SVG cropper copied trimmed markup to clipboard | `method`, `input_size`, `output_size`, `original_width`, `original_height`, `crop_x`, `crop_y`, `crop_width`, `crop_height`, `padding` |
| `svg_crop_copy_error` | SVG cropper clipboard copy failed | `reason` |
| `svg_crop_download` | SVG cropper download link is clicked | `method`, `input_size`, `output_size`, `original_width`, `original_height`, `crop_x`, `crop_y`, `crop_width`, `crop_height`, `padding` |
| `svg_crop_reset` | SVG cropper is reset | none |
| `svg_crop_validation_error` | SVG cropper blocks invalid input or trimming failure | `reason`, optional `method`, optional `file_count`, optional `total_size`, optional `input_size` |
| `image_base64_file_select` | Image Base64 converter file is selected | `method`, `file_count`, `total_size`, `file_types` |
| `image_base64_sample_apply` | Image Base64 converter sample image is applied | `file_count` |
| `image_base64_encode` | Image Base64 converter creates a data URI | `method`, `mime_type`, `file_count`, `total_size`, `file_types`, `input_size`, `output_length`, `base64_length`, `image_width`, `image_height` |
| `image_base64_copy` | Image Base64 converter output is copied | `copy_type`, `method`, `mime_type`, `output_length`, `base64_length` |
| `image_base64_copy_error` | Image Base64 converter clipboard copy failed | `reason`, `copy_type` |
| `image_base64_decode` | Image Base64 converter restores an image from Base64 | `input_type`, `mime_type`, `byte_length`, `image_width`, `image_height`, `input_length` |
| `image_base64_download` | Restored Base64 image download link is clicked | `mime_type`, `output_size`, `image_width`, `image_height`, `input_type` |
| `image_base64_reset` | Image Base64 converter panel is reset | `target` |
| `image_base64_validation_error` | Image Base64 converter blocks invalid input or conversion failure | `reason`, optional `file_count`, optional `total_size`, optional `input_length` |
| `video_gif_file_select` | Video GIF converter file is selected | `method`, `file_count`, `total_size`, `file_types`, `duration`, `source_width`, `source_height` |
| `video_gif_sample_apply` | Video GIF converter sample video is applied | `file_count` |
| `video_gif_option_change` | Video GIF converter settings change | `output_width`, `output_height`, `fps`, `quality`, `speed`, `repeat`, `loop_pause`, `frame_count` |
| `video_gif_generate` | Video GIF converter creates a GIF blob | `trigger`, `file_count`, `total_size`, `file_types`, `duration`, `start_time`, `end_time`, `output_width`, `output_height`, `fps`, `quality`, `speed`, `repeat`, `loop_pause`, `frame_count`, `output_size` |
| `video_gif_download` | Video GIF converter download link is clicked | `output_size`, `output_width`, `output_height`, `fps`, `quality`, `frame_count` |
| `video_gif_reset` | Video GIF converter is reset | none |
| `video_gif_validation_error` | Video GIF converter blocks invalid input or generation failure | `reason`, optional `file_count`, optional `total_size` |
| `heic_convert_file_select` | HEIC converter files are selected | `file_count`, `total_size`, `file_types` |
| `heic_convert_sample_apply` | HEIC converter sample file is applied | `file_count` |
| `heic_convert_preset_arrival` | HEIC converter is opened with a URL preset | `source`, optional `shortcut_id`, `preset`, `output_format`, `quality` |
| `heic_convert_preset_change` | HEIC converter output format preset changes | `preset`, `output_format`, `quality` |
| `heic_convert_convert` | HEIC converter creates JPG or PNG blobs | `file_count`, `total_size`, `output_size`, `output_format`, `quality`, `preset`, `file_types` |
| `heic_convert_download` | HEIC converter download link is clicked | `output_format`, `before_size`, `after_size`, `preset` |
| `heic_convert_next_pdf_click` | HEIC converter next-step JPG PDF converter CTA is clicked | `file_count`, `output_size`, `output_format`, `quality`, `preset`, `target_tool_id`, `href` |
| `heic_convert_reset` | HEIC converter is reset | none |
| `heic_convert_validation_error` | HEIC converter blocks invalid input or conversion failure | `reason`, optional `file_count`, optional `total_size` |

Never send image filenames, raw image bytes, OCR text, document text, raw home/catalog search queries, business numbers, addresses, or customer names in analytics events.

## File tool funnel

Browser-local file tools should follow this event shape:

```text
file_select or sample_apply
  -> generate/compress/resize/convert success
  -> download

validation_error
  -> user corrects input
  -> generate/compress/resize/convert success
```

File tool payloads may include only aggregate file counts, total bytes, MIME buckets, output settings, and output sizes. They must not include filenames, image bytes, OCR text, document content, addresses, or business identifiers.

## Provider hook example

```js
window.addEventListener("kdoc:analytics", (event) => {
  // Example: send event.detail to GA4, Plausible, or a first-party endpoint.
  console.log(event.detail);
});
```
