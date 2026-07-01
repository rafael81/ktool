const currency = new Intl.NumberFormat("ko-KR");
const koreanDigits = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
const koreanSmallUnits = ["", "십", "백", "천"];
const koreanBigUnits = ["", "만", "억", "조"];

function numberValue(input) {
  const value = Number(String(input?.value ?? "0").replaceAll(",", ""));
  return Number.isFinite(value) ? value : 0;
}

function money(value) {
  return currency.format(Math.round(value));
}

function convertKoreanChunk(chunk) {
  const padded = String(chunk).padStart(4, "0");
  let text = "";
  for (let index = 0; index < padded.length; index += 1) {
    const digit = Number(padded[index]);
    if (!digit) continue;
    text += `${koreanDigits[digit]}${koreanSmallUnits[3 - index]}`;
  }
  return text;
}

function koreanAmount(value) {
  const safeValue = Math.max(0, Math.min(Math.round(value), 999999999999999));
  if (safeValue === 0) return "영원";

  const chunks = [];
  let rest = safeValue;
  while (rest > 0) {
    chunks.push(rest % 10000);
    rest = Math.floor(rest / 10000);
  }

  const parts = [];
  for (let index = chunks.length - 1; index >= 0; index -= 1) {
    const chunk = chunks[index];
    if (!chunk) continue;
    parts.push(`${convertKoreanChunk(chunk)}${koreanBigUnits[index]}`);
  }
  return `${parts.join("")}원`;
}

function documentAmount(value) {
  return `금 ${koreanAmount(value)}정`;
}

function todayLocal() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function daysFromToday(days) {
  const offset = Number.isFinite(days) ? days : 0;
  const now = new Date();
  now.setDate(now.getDate() + offset);
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function escapeText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function calculateLine(quantity, unitPrice, vatMode) {
  const base = quantity * unitPrice;
  if (vatMode === "included") {
    const supply = Math.round(base / 1.1);
    return { supply, vat: base - supply, total: base };
  }
  if (vatMode === "none") {
    return { supply: base, vat: 0, total: base };
  }
  const vat = Math.round(base * 0.1);
  return { supply: base, vat, total: base + vat };
}

function toolContext(root) {
  return {
    tool_id: root?.dataset.toolId || null,
    tool_title: root?.dataset.toolTitle || null,
    document_title: root?.dataset.documentTitle || null,
    source: documentSource()
  };
}

function track(root, eventName, params = {}) {
  window.kdocTrack?.(eventName, {
    ...toolContext(root),
    ...params
  });
}

function documentSource() {
  const source = new URLSearchParams(window.location.search).get("source");
  return /^[a-z0-9-]{1,80}$/i.test(source || "") ? source : "direct";
}

function isQuickStartSource(source) {
  return source === "home-quick-start" || source === "catalog-quick-start";
}

function rowTemplate(root, index) {
  const sampleName = root?.dataset.sampleItemName || "디자인 작업";
  const sampleDesc = root?.dataset.sampleItemDesc || "문서 및 이미지 제작";
  const sampleQty = root?.dataset.sampleItemQty || "1";
  const samplePrice = root?.dataset.sampleItemPrice || "150000";
  const removeIconHtml = root?.querySelector("[data-remove-row]")?.innerHTML.trim() || "×";

  return `
    <div class="item-row" data-row>
      <label class="field">
        <span>품목</span>
        <input data-item-name value="${index === 0 ? escapeText(sampleName) : ""}" />
      </label>
      <label class="field">
        <span>설명</span>
        <input data-item-desc value="${index === 0 ? escapeText(sampleDesc) : ""}" />
      </label>
      <label class="field compact">
        <span>수량</span>
        <input data-item-qty inputmode="decimal" value="${index === 0 ? escapeText(sampleQty) : ""}" />
      </label>
      <label class="field compact">
        <span>단가</span>
        <input data-item-price inputmode="numeric" value="${index === 0 ? escapeText(samplePrice) : ""}" />
      </label>
      <button class="btn row-remove" type="button" data-remove-row aria-label="품목 삭제">
        ${removeIconHtml}
      </button>
    </div>
  `;
}

function collectRows(root) {
  return [...root.querySelectorAll("[data-row]")]
    .map((row) => {
      const name = row.querySelector("[data-item-name]")?.value.trim() || "";
      const desc = row.querySelector("[data-item-desc]")?.value.trim() || "";
      const quantity = numberValue(row.querySelector("[data-item-qty]"));
      const unitPrice = numberValue(row.querySelector("[data-item-price]"));
      return { name, desc, quantity, unitPrice };
    })
    .filter((row) => row.name || row.desc || row.quantity || row.unitPrice);
}

function renderDocument(root) {
  const preview = root.querySelector("[data-document-preview]");
  const title = root.dataset.documentTitle || "문서";
  const receiverLabel = root.dataset.receiverLabel || "공급받는자";
  const supplier = root.querySelector("[data-supplier]")?.value.trim() || "샘플상사";
  const supplierMeta = root.querySelector("[data-supplier-meta]")?.value.trim() || "";
  const receiver = root.querySelector("[data-receiver]")?.value.trim() || "거래처";
  const date = root.querySelector("[data-date]")?.value || todayLocal();
  const validUntil = root.querySelector("[data-valid-until]")?.value || "";
  const note = root.querySelector("[data-note]")?.value.trim() || "";
  const vatMode = root.querySelector("[data-vat-mode]")?.value || "separate";
  const rows = collectRows(root);
  const metaLabel = root.dataset.metaLabel || (title === "견적서" ? "유효기간" : "사업자 정보");
  const metaValueSource = root.dataset.metaValueSource || (title === "견적서" ? "valid-until" : "supplier-meta");
  const metaValue = metaValueSource === "valid-until" ? validUntil || "-" : supplierMeta || "-";
  const extraDateLabel = root.dataset.extraDateLabel || "";
  const extraMetaLabel = root.dataset.extraMetaLabel || "";
  const extraMetaValue = root.dataset.extraMetaValue || "";

  let supplyTotal = 0;
  let vatTotal = 0;
  let grandTotal = 0;
  const bodyRows = rows
    .map((row, index) => {
      const calc = calculateLine(row.quantity, row.unitPrice, vatMode);
      supplyTotal += calc.supply;
      vatTotal += calc.vat;
      grandTotal += calc.total;
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeText(row.name || "-")}<br/><small>${escapeText(row.desc)}</small></td>
          <td class="right">${money(row.quantity)}</td>
          <td class="right">${money(row.unitPrice)}</td>
          <td class="right">${money(calc.supply)}</td>
          <td class="right">${money(calc.vat)}</td>
          <td class="right">${money(calc.total)}</td>
        </tr>
      `;
    })
    .join("");

  preview.innerHTML = `
    <div class="doc-inner">
      <h2 class="doc-title">${escapeText(title)}</h2>
      <table class="doc-table">
        <tbody>
          <tr>
            <th>작성일</th>
            <td>${escapeText(date)}</td>
            <th>${escapeText(receiverLabel)}</th>
            <td>${escapeText(receiver)}</td>
          </tr>
          <tr>
            <th>공급자</th>
            <td>${escapeText(supplier)}</td>
            <th>${escapeText(metaLabel)}</th>
            <td>${escapeText(metaValue)}</td>
          </tr>
          ${
            extraDateLabel
              ? `<tr>
                  <th>${escapeText(extraDateLabel)}</th>
                  <td>${escapeText(validUntil || "-")}</td>
                  <th>${escapeText(extraMetaLabel || "안내")}</th>
                  <td>${escapeText(extraMetaValue || "-")}</td>
                </tr>`
              : ""
          }
        </tbody>
      </table>
      <table class="doc-table line-table">
        <thead>
          <tr>
            <th>No</th>
            <th>품목</th>
            <th class="right">수량</th>
            <th class="right">단가</th>
            <th class="right">공급가액</th>
            <th class="right">세액</th>
            <th class="right">합계</th>
          </tr>
        </thead>
        <tbody>
          ${bodyRows || '<tr><td colspan="7">품목을 입력하면 미리보기가 표시됩니다.</td></tr>'}
        </tbody>
        <tfoot>
          <tr>
            <th colspan="4">합계</th>
            <th class="right">${money(supplyTotal)}</th>
            <th class="right">${money(vatTotal)}</th>
            <th class="right">${money(grandTotal)}</th>
          </tr>
          <tr class="total-korean-row">
            <th colspan="4">합계 한글</th>
            <td class="right korean-total" colspan="3">${escapeText(documentAmount(grandTotal))}</td>
          </tr>
        </tfoot>
      </table>
      ${note ? `<p class="document-note">${escapeText(note)}</p>` : ""}
    </div>
  `;
}

for (const root of document.querySelectorAll("[data-document-tool]")) {
  const rows = root.querySelector("[data-rows]");
  const add = root.querySelector("[data-add-row]");
  const sample = root.querySelector("[data-sample]");
  const reset = root.querySelector("[data-reset]");
  const print = root.querySelector("[data-print]");
  const dateInput = root.querySelector("[data-date]");
  const validUntilInput = root.querySelector("[data-valid-until]");

  if (dateInput && !dateInput.value) {
    dateInput.value = todayLocal();
  }
  if (validUntilInput && !validUntilInput.value && root.dataset.defaultValidDays) {
    validUntilInput.value = daysFromToday(Number(root.dataset.defaultValidDays));
  }

  function bind() {
    root.querySelectorAll("input, textarea, select").forEach((input) => {
      input.removeEventListener("input", update);
      input.addEventListener("input", update);
      input.removeEventListener("change", update);
      input.addEventListener("change", update);
    });
    root.querySelectorAll("[data-remove-row]").forEach((button) => {
      button.onclick = () => {
        if (root.querySelectorAll("[data-row]").length > 1) {
          button.closest("[data-row]")?.remove();
          update();
          track(root, "tool_row_remove", {
            row_count: root.querySelectorAll("[data-row]").length
          });
        }
      };
    });
  }

  function update() {
    renderDocument(root);
  }

  add?.addEventListener("click", () => {
    rows.insertAdjacentHTML("beforeend", rowTemplate(root, root.querySelectorAll("[data-row]").length));
    bind();
    update();
    track(root, "tool_row_add", {
      row_count: root.querySelectorAll("[data-row]").length
    });
  });

  sample?.addEventListener("click", () => {
    root.querySelector("[data-supplier]").value = root.dataset.sampleSupplier || "샘플상사";
    root.querySelector("[data-supplier-meta]").value = root.dataset.sampleSupplierMeta || "123-45-67890";
    root.querySelector("[data-receiver]").value = root.dataset.sampleReceiver || "거래처";
    root.querySelector("[data-note]").value = root.dataset.sampleNote || "";
    if (validUntilInput && root.dataset.defaultValidDays) {
      validUntilInput.value = daysFromToday(Number(root.dataset.defaultValidDays));
    }
    rows.innerHTML = rowTemplate(root, 0);
    bind();
    update();
    track(root, "tool_sample_apply");
  });

  reset?.addEventListener("click", () => {
    root.querySelectorAll("input, textarea").forEach((input) => {
      if (input.type !== "date") input.value = "";
    });
    rows.innerHTML = rowTemplate(root, 1);
    bind();
    update();
    track(root, "tool_reset");
  });

  print?.addEventListener("click", () => {
    track(root, "tool_print", {
      row_count: root.querySelectorAll("[data-row]").length,
      vat_mode: root.querySelector("[data-vat-mode]")?.value || null
    });
    window.print();
  });

  bind();
  update();
  const source = documentSource();
  if (isQuickStartSource(source)) {
    track(root, "document_tool_quick_start_arrival", { source });
  }
}
