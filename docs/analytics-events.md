# Analytics event contract

This project keeps analytics provider-neutral. Events are pushed to `window.dataLayer` and also emitted as a browser `kdoc:analytics` `CustomEvent`.

Cloudflare Web Analytics is installed through the public beacon script in `src/layouts/BaseLayout.astro`.

## Common payload

Every event includes:

- `event`: event name
- `page_path`: canonical app path
- `page_title`: current page title
- `event_time`: ISO timestamp

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
| `tool_nav_click` | Header tool nav click | `tool_id`, `tool_title`, `label`, `href` |
| `catalog_nav_click` | Header catalog link click | `label`, `href` |
| `workflow_nav_click` | Header submission-prep workflow link click | `label`, `href` |
| `package_nav_click` | Header, home, or catalog workflow package link click | `label`, `href`, `package_id` |
| `category_nav_click` | Header category link click | `label`, `href` |
| `catalog_quick_link_click` | Home catalog quick-link click | `label`, `href` |
| `home_prep_shortcut_click` | Home problem-situation shortcut click | `label`, `href`, `shortcut_id`, `tool_id`, `tool_title`, optional `target_preset` |
| `category_quick_link_click` | Home category quick-link click | `label`, `href` |
| `home_category_click` | Home category card click | `label`, `href` |
| `home_all_tools_click` | Home representative-tool section link to the full catalog | `label`, `href` |
| `catalog_workflow_quick_link_click` | Tool catalog submission-prep quick-link click | `label`, `href` |
| `catalog_prep_shortcut_click` | Tool catalog problem-situation shortcut click | `label`, `href`, `shortcut_id`, `tool_id`, `tool_title`, optional `target_preset` |
| `catalog_category_click` | Tool catalog category link click | `label`, `href` |
| `catalog_filter_change` | Tool catalog category filter changes | `catalog_category`, `visible_count`, `search_query_length` |
| `catalog_search_change` | Tool catalog search input changes | `catalog_category`, `visible_count`, `search_query_length` |
| `catalog_tool_click` | Tool catalog tool row click | `tool_id`, `tool_title`, `label`, `href` |
| `problem_entry_click` | Tool catalog problem-intent row click | `label`, `href` |
| `home_search_problem_click` | Home search problem-intent result click | `tool_id`, `tool_title`, `label`, `href`, optional `target_preset` |
| `tool_problem_arrival` | Tool page opens from a problem page CTA | `tool_id`, `tool_title`, `source`, `problem_id`, optional `target_preset` |
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
| `planned_category_related_click` | Planned category related tool click | `tool_id`, `tool_title`, `label`, `href` |
| `tool_quick_link_click` | Tool quick-link click | `tool_id`, `tool_title`, `label`, `href` |
| `home_tool_click` | Home tool card click | `tool_id`, `tool_title`, `label`, `href` |
| `prep_quick_tool_click` | Submission-prep page quick tool link click | `tool_id`, `tool_title`, `label`, `href` |
| `prep_pdf_path_click` | Submission-prep highlighted PDF workflow step or CTA click | `tool_id`, `tool_title`, `label`, `href` |
| `prep_pdf_decision_click` | Submission-prep PDF workflow decision hint click | `tool_id`, `tool_title`, `label`, `href` |
| `prep_format_path_click` | Submission-prep format-error workflow step click | `tool_id`, `tool_title`, `label`, `href` |
| `prep_compression_path_click` | Submission-prep compression-limit workflow step click | `tool_id`, `tool_title`, `label`, `href` |
| `prep_situation_click` | Submission-prep situation card click | `tool_id`, `tool_title`, `label`, `href` |
| `prep_flow_tool_click` | Submission-prep flow step tool click | `tool_id`, `tool_title`, `label`, `href` |
| `prep_tool_click` | Submission-prep tool card click | `tool_id`, `tool_title`, `label`, `href` |
| `tool_sample_apply` | Sample data is applied | `tool_id`, `tool_title` |
| `tool_reset` | Tool form is reset | `tool_id`, `tool_title` |
| `tool_stamp_select` | Nameplate stamp image is selected | `file_type`, `file_size` |
| `tool_validation_error` | Client-side validation blocks an action | `reason` |
| `tool_download` | Nameplate PNG is generated and download starts | `file_format`, `background`, `has_stamp` |
| `tool_row_add` | A document item row is added | `row_count`, `document_title` |
| `tool_row_remove` | A document item row is removed | `row_count`, `document_title` |
| `tool_print` | Print/PDF action is requested | `row_count`, `vat_mode`, `document_title` |
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
| `image_compressor_file_select` | Photo size reducer images are selected | `file_count`, `total_size`, `file_types` |
| `image_compressor_sample_apply` | Photo size reducer sample images are applied | `file_count` |
| `image_compressor_preset_arrival` | Photo size reducer is opened with a URL preset | `preset`, `target_size`, `source` |
| `image_compressor_preset_change` | Photo size reducer submission target preset changes | `preset`, `target_size` |
| `image_compressor_compress` | Photo size reducer creates compressed image blobs | `file_count`, `total_size`, `output_size`, `output_format`, `quality`, `max_side`, `preset`, `target_size`, `file_types` |
| `image_compressor_download` | Photo size reducer download link is clicked | `output_format`, `before_size`, `after_size` |
| `image_compressor_next_pdf_click` | Photo size reducer next-step JPG PDF converter CTA is clicked | `file_count`, `output_size`, `preset`, `target_size`, `target_tool_id`, `href` |
| `image_compressor_reset` | Photo size reducer is reset | none |
| `image_compressor_validation_error` | Photo size reducer blocks invalid input or compression failure | `reason`, optional `file_count`, optional `total_size` |
| `image_resize_file_select` | Image resizer images are selected | `file_count`, `total_size`, `file_types` |
| `image_resize_sample_apply` | Image resizer sample images are applied | `file_count` |
| `image_resize_preset_arrival` | Image resizer is opened with a URL preset | `source`, `preset`, `resize_mode`, `long_side`, `width`, `height`, `keep_aspect` |
| `image_resize_preset_change` | Image resizer submission size preset changes | `preset`, `resize_mode`, `long_side`, `width`, `height`, `keep_aspect` |
| `image_resize_resize` | Image resizer creates resized image blobs | `file_count`, `total_size`, `output_size`, `resize_mode`, `output_format`, `quality`, `keep_aspect`, `preset`, `file_types` |
| `image_resize_download` | Image resizer download link is clicked | `output_format`, `before_size`, `after_size`, `output_width`, `output_height` |
| `image_resize_next_pdf_click` | Image resizer next-step JPG PDF converter CTA is clicked | `file_count`, `output_size`, `output_format`, `resize_mode`, `preset`, `target_tool_id`, `href` |
| `image_resize_reset` | Image resizer is reset | none |
| `image_resize_validation_error` | Image resizer blocks invalid input or resize failure | `reason`, optional `file_count`, optional `total_size` |
| `image_crop_file_select` | Image cropper image is selected | `file_count`, `total_size`, `file_types` |
| `image_crop_sample_apply` | Image cropper sample image is applied | `file_count` |
| `image_crop_preset_arrival` | Image cropper is opened with a URL preset | `source`, `preset`, `aspect_preset` |
| `image_crop_preset_change` | Image cropper submission area preset changes | `preset`, `aspect_preset` |
| `image_crop_aspect_change` | Image cropper aspect ratio changes directly | `aspect_preset` |
| `image_crop_crop` | Image cropper creates a cropped image blob | `file_count`, `total_size`, `output_size`, `output_format`, `quality`, `crop_width`, `crop_height`, `aspect_preset`, `preset`, `file_types` |
| `image_crop_download` | Image cropper download link is clicked | `output_format`, `after_size`, `output_width`, `output_height` |
| `image_crop_next_pdf_click` | Image cropper next-step JPG PDF converter CTA is clicked | `file_count`, `output_size`, `output_format`, `crop_width`, `crop_height`, `aspect_preset`, `preset`, `target_tool_id`, `href` |
| `image_crop_reset` | Image cropper is reset | none |
| `image_crop_validation_error` | Image cropper blocks invalid input or crop failure | `reason`, optional `file_count`, optional `total_size` |
| `image_rotate_file_select` | Image rotator images are selected | `file_count`, `total_size`, `file_types` |
| `image_rotate_sample_apply` | Image rotator sample images are applied | `file_count` |
| `image_rotate_preset_arrival` | Image rotator is opened with a URL preset | `source`, `preset`, `rotation_angle` |
| `image_rotate_preset_change` | Image rotator submission direction preset changes | `preset`, `rotation_angle` |
| `image_rotate_rotate` | Image rotator creates rotated image blobs | `file_count`, `total_size`, `output_size`, `output_format`, `quality`, `rotation_angle`, `preset`, `file_types` |
| `image_rotate_download` | Image rotator download link is clicked | `output_format`, `before_size`, `after_size`, `output_width`, `output_height`, `rotation_angle`, `preset` |
| `image_rotate_next_pdf_click` | Image rotator next-step JPG PDF converter CTA is clicked | `file_count`, `output_size`, `output_format`, `rotation_angle`, `preset`, `target_tool_id`, `href` |
| `image_rotate_reset` | Image rotator is reset | none |
| `image_rotate_validation_error` | Image rotator blocks invalid input or rotation failure | `reason`, optional `file_count`, optional `total_size` |
| `image_convert_file_select` | Image converter images are selected | `file_count`, `total_size`, `file_types` |
| `image_convert_sample_apply` | Image converter sample images are applied | `file_count` |
| `image_convert_preset_arrival` | Image converter is opened with a URL preset | `source`, `preset`, `output_format`, `quality` |
| `image_convert_preset_change` | Image converter output format preset changes | `preset`, `output_format`, `quality` |
| `image_convert_convert` | Image converter creates converted image blobs | `file_count`, `total_size`, `output_size`, `output_format`, `quality`, `preset`, `file_types` |
| `image_convert_download` | Image converter download link is clicked | `source_type`, `output_format`, `before_size`, `after_size`, `preset` |
| `image_convert_next_pdf_click` | Image converter next-step JPG PDF converter CTA is clicked | `file_count`, `output_size`, `output_format`, `quality`, `preset`, `target_tool_id`, `href` |
| `image_convert_reset` | Image converter is reset | none |
| `image_convert_validation_error` | Image converter blocks invalid input or conversion failure | `reason`, optional `file_count`, optional `total_size` |
| `heic_convert_file_select` | HEIC converter files are selected | `file_count`, `total_size`, `file_types` |
| `heic_convert_sample_apply` | HEIC converter sample file is applied | `file_count` |
| `heic_convert_preset_arrival` | HEIC converter is opened with a URL preset | `source`, `preset`, `output_format`, `quality` |
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
