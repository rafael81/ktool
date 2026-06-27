const currency = new Intl.NumberFormat("ko-KR");

function numberValue(input) {
  const value = Number(String(input?.value ?? "0").replaceAll(",", ""));
  return Number.isFinite(value) ? value : 0;
}

function money(value) {
  return currency.format(Math.round(value));
}

function todayLocal() {
  const now = new Date();
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
    document_title: root?.dataset.documentTitle || null
  };
}

function track(root, eventName, params = {}) {
  window.kdocTrack?.(eventName, {
    ...toolContext(root),
    ...params
  });
}

function rowTemplate(index) {
  return `
    <div class="item-row" data-row>
      <label class="field">
        <span>품목</span>
        <input data-item-name value="${index === 0 ? "디자인 작업" : ""}" />
      </label>
      <label class="field">
        <span>설명</span>
        <input data-item-desc value="${index === 0 ? "문서 및 이미지 제작" : ""}" />
      </label>
      <label class="field compact">
        <span>수량</span>
        <input data-item-qty inputmode="decimal" value="${index === 0 ? "1" : ""}" />
      </label>
      <label class="field compact">
        <span>단가</span>
        <input data-item-price inputmode="numeric" value="${index === 0 ? "150000" : ""}" />
      </label>
      <button class="btn row-remove" type="button" data-remove-row aria-label="품목 삭제">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
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
            <th>${title === "견적서" ? "유효기간" : "사업자 정보"}</th>
            <td>${escapeText(title === "견적서" ? validUntil || "-" : supplierMeta || "-")}</td>
          </tr>
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

  if (dateInput && !dateInput.value) {
    dateInput.value = todayLocal();
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
    rows.insertAdjacentHTML("beforeend", rowTemplate(root.querySelectorAll("[data-row]").length));
    bind();
    update();
    track(root, "tool_row_add", {
      row_count: root.querySelectorAll("[data-row]").length
    });
  });

  sample?.addEventListener("click", () => {
    root.querySelector("[data-supplier]").value = root.dataset.sampleSupplier || "샘플상사";
    root.querySelector("[data-supplier-meta]").value = "123-45-67890";
    root.querySelector("[data-receiver]").value = root.dataset.sampleReceiver || "거래처";
    root.querySelector("[data-note]").value = root.dataset.sampleNote || "";
    rows.innerHTML = rowTemplate(0);
    bind();
    update();
    track(root, "tool_sample_apply");
  });

  reset?.addEventListener("click", () => {
    root.querySelectorAll("input, textarea").forEach((input) => {
      if (input.type !== "date") input.value = "";
    });
    rows.innerHTML = rowTemplate(1);
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
}
