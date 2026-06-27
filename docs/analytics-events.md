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

## Events

| Event | When it fires | Important extra fields |
| --- | --- | --- |
| `page_view` | Page analytics boot completes | `tool_id`, `tool_title` on tool pages |
| `tool_start` | First input/change inside a tool | `tool_id`, `tool_title` |
| `tool_nav_click` | Header tool nav click | `tool_id`, `tool_title`, `label`, `href` |
| `catalog_nav_click` | Header catalog link click | `label`, `href` |
| `category_nav_click` | Header category link click | `label`, `href` |
| `catalog_quick_link_click` | Home catalog quick-link click | `label`, `href` |
| `category_quick_link_click` | Home category quick-link click | `label`, `href` |
| `home_category_click` | Home category card click | `label`, `href` |
| `catalog_category_click` | Tool catalog category link click | `label`, `href` |
| `catalog_tool_click` | Tool catalog tool card click | `tool_id`, `tool_title`, `label`, `href` |
| `category_tool_quick_link_click` | Category page quick-link click | `tool_id`, `tool_title`, `label`, `href` |
| `category_tool_click` | Category page tool card click | `tool_id`, `tool_title`, `label`, `href` |
| `related_tool_click` | Related tool card click | `tool_id`, `tool_title`, `label`, `href` |
| `planned_category_related_click` | Planned category related tool click | `tool_id`, `tool_title`, `label`, `href` |
| `tool_quick_link_click` | Tool quick-link click | `tool_id`, `tool_title`, `label`, `href` |
| `home_tool_click` | Home tool card click | `tool_id`, `tool_title`, `label`, `href` |
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

## Provider hook example

```js
window.addEventListener("kdoc:analytics", (event) => {
  // Example: send event.detail to GA4, Plausible, or a first-party endpoint.
  console.log(event.detail);
});
```
