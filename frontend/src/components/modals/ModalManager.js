import { store } from "../../state/store.js";
import { toast } from "../toast/Toast.js";
import confetti from "canvas-confetti";
import { renderRimsLogoMark } from "../brand/RimsLogo.js";


export class ModalManager {
  constructor() {
    this.dialog = null;
    this.ensureDialog();
  }

  ensureDialog() {
    let d = document.getElementById("app-dialog");
    if (!d) {
      d = document.createElement("dialog");
      d.id = "app-dialog";
      d.className = "app-dialog";
      document.body.appendChild(d);

      // Light dismiss when clicking backdrop
      d.addEventListener("click", (e) => {
        const rect = d.getBoundingClientRect();
        const isInDialog =
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width;
        if (!isInDialog) {
          this.close();
        }
      });
    }
    this.dialog = d;
  }

  open(contentHtml, afterRender = null, modalClass = "") {
    this.ensureDialog();
    this.dialog.className = `app-dialog ${modalClass}`.trim();
    this.dialog.innerHTML = `
      <div class="dialog-card">
        ${contentHtml}
      </div>
    `;
    this.dialog.showModal();

    if (window.lucide) {
      window.lucide.createIcons({ root: this.dialog });
    }

    const closeButtons = this.dialog.querySelectorAll(".btn-modal-close");
    closeButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.close());
    });

    if (afterRender) {
      afterRender(this.dialog);
    }
  }

  close() {
    if (this.dialog && this.dialog.open) {
      this.dialog.close();
      this.dialog.innerHTML = "";
    }
  }

  // --- Add or Edit Product Modal ---
  openProductModal(product = null) {
    const isEdit = Boolean(product);
    const suppliers = store.getSuppliers();
    const warehouses = store.getWarehouses();

    const title = isEdit ? "Edit Product Specifications" : "Add New Retail Product";
    const sub = isEdit
      ? `Updating SKU: <strong>${product.sku}</strong>`
      : "Register SKU into Product Information Management (PIM) catalog";

    const content = `
      <div class="modal-header">
        <div>
          <h3>${title}</h3>
          <p class="text-muted text-sm">${sub}</p>
        </div>
        <button type="button" class="btn-icon btn-modal-close">&times;</button>
      </div>

      <form id="form-product" class="modal-form">
        <div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 10px;">
          <!-- Row 1: Identification (12 cols) -->
          <div class="form-group" style="grid-column: span 6;">
            <label>Product Name *</label>
            <input type="text" name="name" required value="${product?.name || ""}" placeholder="e.g. UltraFit Active Sport Earbuds" />
          </div>

          <div class="form-group" style="grid-column: span 3;">
            <label>Category *</label>
            <select name="category" required>
              ${["Electronics", "Apparel", "Home & Furniture", "Grocery & Gourmet", "Sports & Fitness", "Health & Personal Care"]
                .map((cat) => `<option value="${cat}" ${product?.category === cat ? "selected" : ""}>${cat}</option>`)
                .join("")}
            </select>
          </div>

          <div class="form-group" style="grid-column: span 3;">
            <label>Brand Name *</label>
            <input type="text" name="brand" required value="${product?.brand || ""}" placeholder="e.g. AuraSound" />
          </div>

          <!-- Row 2: SKU, Barcode, Pricing (12 cols) -->
          <div class="form-group" style="grid-column: span 3;">
            <label>SKU (Stock Keeping Unit)</label>
            <div class="input-with-action">
              <input type="text" name="sku" id="input-sku" required value="${product?.sku || ""}" placeholder="SKU-AUTO" />
              <button type="button" id="btn-gen-sku" class="btn btn-secondary btn-sm" title="Auto-generate standardized SKU" style="padding: 0 8px;">Auto</button>
            </div>
          </div>

          <div class="form-group" style="grid-column: span 3;">
            <label>Barcode (EAN-13 / UPC)</label>
            <input type="text" name="barcode" id="input-barcode" required value="${product?.barcode || ""}" placeholder="e.g. 8901234567890" />
          </div>

          <div class="form-group" style="grid-column: span 3;">
            <label>Cost Price ($) *</label>
            <input type="number" step="0.01" name="costPrice" id="input-cost" required value="${product?.costPrice || ""}" placeholder="0.00" />
          </div>

          <div class="form-group" style="grid-column: span 3;">
            <label>Selling Price ($) *</label>
            <input type="number" step="0.01" name="sellingPrice" id="input-price" required value="${product?.sellingPrice || ""}" placeholder="0.00" />
          </div>

          <!-- Row 3: Margin, Reorder, Max, Unit (12 cols) -->
          <div class="form-group" style="grid-column: span 3;">
            <label>Profit Margin (%)</label>
            <div class="margin-preview-box" style="height: 36px; padding: 4px 10px; display: flex; flex-direction: column; justify-content: center; box-sizing: border-box; margin: 0;">
              <div class="flex-between">
                <span style="font-size: 0.72rem; font-weight: 600;">Margin:</span>
                <span id="margin-calc" class="font-bold text-accent" style="font-size: 0.78rem;">0.0%</span>
              </div>
              <div class="progress-bar-container" style="height: 4px; margin-top: 2px;">
                <div id="margin-bar" class="progress-bar" style="width: 0%"></div>
              </div>
            </div>
          </div>

          <div class="form-group" style="grid-column: span 3;">
            <label>Reorder Point *</label>
            <input type="number" name="reorderPoint" required value="${product?.reorderPoint || 25}" />
          </div>

          <div class="form-group" style="grid-column: span 3;">
            <label>Max Capacity *</label>
            <input type="number" name="maxStock" required value="${product?.maxStock || 200}" />
          </div>

          <div class="form-group" style="grid-column: span 3;">
            <label>Unit of Measure</label>
            <select name="unit">
              ${["Units", "Packs", "Sets", "Boxes", "Cartons", "Pallets"]
                .map((u) => `<option value="${u}" ${product?.unit === u ? "selected" : ""}>${u}</option>`)
                .join("")}
            </select>
          </div>

          <!-- Row 4: Primary Supplier & Stock Setup (12 cols) -->
          <div class="form-group" style="grid-column: span ${isEdit ? "12" : "4"};">
            <label>Primary Supplier</label>
            <select name="primarySupplierId">
              ${suppliers.map((s) => `<option value="${s.id}" ${product?.primarySupplierId === s.id ? "selected" : ""}>${s.name} (${s.code})</option>`).join("")}
            </select>
          </div>

          ${
            !isEdit
              ? `
          <div class="form-group" style="grid-column: span 4;">
            <label>Initial Stock (Units)</label>
            <input type="number" name="initialStock" value="50" min="0" />
          </div>
          <div class="form-group" style="grid-column: span 4;">
            <label>Initial Warehouse</label>
            <select name="initialWarehouse">
              ${warehouses.map((w) => `<option value="${w.id}">${w.name} (${w.city})</option>`).join("")}
            </select>
          </div>
          `
              : ""
          }

          <!-- Row 5: Product Description (12 cols) -->
          <div class="form-group" style="grid-column: span 12;">
            <label>Product Description & Specs</label>
            <input type="text" name="description" placeholder="Brief technical and retail specs" value="${product?.description || ""}" />
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-modal-close">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? "Save Changes" : "Create Product"}</button>
        </div>
      </form>
    `;

    this.open(content, (dialog) => {
      const form = dialog.querySelector("#form-product");
      const costInput = dialog.querySelector("#input-cost");
      const priceInput = dialog.querySelector("#input-price");
      const marginText = dialog.querySelector("#margin-calc");
      const marginBar = dialog.querySelector("#margin-bar");
      const genSkuBtn = dialog.querySelector("#btn-gen-sku");
      const skuInput = dialog.querySelector("#input-sku");
      const barcodeInput = dialog.querySelector("#input-barcode");

      const updateMargin = () => {
        const cost = parseFloat(costInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        if (price > 0) {
          const margin = (((price - cost) / price) * 100).toFixed(1);
          marginText.textContent = `${margin}% ($${(price - cost).toFixed(2)})`;
          const pct = Math.max(0, Math.min(100, margin));
          marginBar.style.width = `${pct}%`;
          if (margin < 20) {
            marginBar.style.backgroundColor = "var(--color-danger)";
          } else if (margin < 35) {
            marginBar.style.backgroundColor = "var(--color-warning)";
          } else {
            marginBar.style.backgroundColor = "var(--color-success)";
          }
        } else {
          marginText.textContent = "0.0%";
          marginBar.style.width = "0%";
        }
      };

      costInput.addEventListener("input", updateMargin);
      priceInput.addEventListener("input", updateMargin);
      updateMargin();

      if (genSkuBtn) {
        genSkuBtn.addEventListener("click", () => {
          const cat = form.category.value.substring(0, 4).toUpperCase();
          const brand = form.brand.value.trim().substring(0, 3).toUpperCase() || "GEN";
          const rnd = Math.floor(100 + Math.random() * 900);
          skuInput.value = `${cat}-${brand}-${rnd}`;
          if (!barcodeInput.value) {
            barcodeInput.value = `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
          }
        });
      }

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.sku) {
          data.sku = `PROD-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        if (!data.barcode) {
          data.barcode = `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        }

        if (isEdit) {
          store.updateProduct(product.id, data);
          toast.success(`Updated SKU ${product.sku} successfully`);
        } else {
          store.addProduct(data);
          toast.success(`Registered new product ${data.name} in PIM catalog`);
        }
        this.close();
      });
    }, "modal-wide");
  }

  // --- Cycle Count Stock Adjustment Modal ---
  openStockAdjustModal(productId, warehouseId, currentBin = "A-01-01") {
    const product = store.getProduct(productId);
    const warehouse = store.getWarehouse(warehouseId);
    const existingRec = store
      .getStock()
      .find((s) => s.productId === productId && s.warehouseId === warehouseId && s.bin === currentBin);
    const currentOnHand = existingRec ? existingRec.onHand : 0;

    const content = `
      <div class="modal-header">
        <div>
          <h3>Physical Cycle Count Reconciliation</h3>
          <p class="text-muted text-sm">${product?.name} (${product?.sku}) at <strong>${warehouse?.name}</strong></p>
        </div>
        <button type="button" class="btn-icon btn-modal-close">&times;</button>
      </div>

      <form id="form-adjust" class="modal-form">
        <div class="reconciliation-header">
          <div class="stat-pill">
            <span class="label">System SOH</span>
            <span class="value">${currentOnHand} Units</span>
          </div>
          <div class="stat-pill">
            <span class="label">Bin Location</span>
            <span class="value text-accent">${currentBin}</span>
          </div>
          <div class="stat-pill">
            <span class="label">Unit Cost</span>
            <span class="value">$${product?.costPrice.toFixed(2)}</span>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group col-span-2">
            <label>Physical Counted Quantity *</label>
            <input type="number" id="input-physical" name="physicalCount" required min="0" value="${currentOnHand}" />
          </div>

          <div class="form-group col-span-2 variance-box">
            <div class="flex-between">
              <span>Inventory Variance:</span>
              <span id="variance-val" class="font-bold">0 Units ($0.00)</span>
            </div>
          </div>

          <div class="form-group col-span-2">
            <label>Adjustment Reason Code *</label>
            <select name="reason" required>
              <option value="Cycle Count Variance Correction">Cycle Count Variance Correction</option>
              <option value="Damaged / Broken in Transit">Damaged / Broken in Transit</option>
              <option value="Shrinkage / Unexplained Loss">Shrinkage / Unexplained Loss</option>
              <option value="Found Unrecorded Stock">Found Unrecorded Stock</option>
              <option value="Expired / Past Shelf Life">Expired / Past Shelf Life</option>
              <option value="Internal Quality Scrap">Internal Quality Scrap</option>
            </select>
          </div>

          <div class="form-group col-span-2">
            <label>Audit Justification / Notes</label>
            <textarea name="notes" rows="2" placeholder="Required for compliance audits if variance > 0..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-modal-close">Cancel</button>
          <button type="submit" class="btn btn-warning">Sign Off & Adjust Ledger</button>
        </div>
      </form>
    `;

    this.open(content, (dialog) => {
      const physicalInput = dialog.querySelector("#input-physical");
      const varianceVal = dialog.querySelector("#variance-val");
      const form = dialog.querySelector("#form-adjust");

      const updateVariance = () => {
        const physical = parseInt(physicalInput.value) || 0;
        const diff = physical - currentOnHand;
        const dollarImpact = (diff * (product?.costPrice || 0)).toFixed(2);
        if (diff > 0) {
          varianceVal.innerHTML = `<span class="text-success font-bold">+${diff} Units (+$${dollarImpact})</span>`;
        } else if (diff < 0) {
          varianceVal.innerHTML = `<span class="text-danger font-bold">${diff} Units (-$${Math.abs(dollarImpact)})</span>`;
        } else {
          varianceVal.innerHTML = `<span class="text-muted">0 Units ($0.00 - Balanced)</span>`;
        }
      };

      physicalInput.addEventListener("input", updateVariance);
      updateVariance();

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const physical = parseInt(physicalInput.value) || 0;
        const reason = form.reason.value;
        const notes = form.notes.value;

        store.adjustStock(productId, warehouseId, currentBin, physical, reason, notes);
        toast.warning(`Adjusted ${product.sku} at ${warehouse.name} to ${physical} units`);
        this.close();
      });
    });
  }

  // --- Create Purchase Order Modal ---
  openCreatePOModal(defaultSupplierId = null) {
    const suppliers = store.getSuppliers();
    const warehouses = store.getWarehouses();
    const products = store.getProducts();

    const content = `
      <div class="modal-header">
        <div>
          <h3>Issue New Purchase Order (PO)</h3>
          <p class="text-muted text-sm">Procure inventory from approved vendors into distribution network</p>
        </div>
        <button type="button" class="btn-icon btn-modal-close">&times;</button>
      </div>

      <form id="form-po" class="modal-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Vendor / Supplier *</label>
            <select name="supplierId" id="po-supplier" required>
              ${suppliers
                .map(
                  (s) =>
                    `<option value="${s.id}" ${defaultSupplierId === s.id ? "selected" : ""}>${s.name} (${s.paymentTerms}, Lead: ${s.leadTimeDays}d)</option>`
                )
                .join("")}
            </select>
          </div>

          <div class="form-group">
            <label>Receiving Destination Warehouse *</label>
            <select name="warehouseId" required>
              ${warehouses.map((w) => `<option value="${w.id}">${w.name} (${w.city}, ${w.state})</option>`).join("")}
            </select>
          </div>

          <div class="form-group col-span-2">
            <div class="flex-between" style="margin-bottom: 4px;">
              <label>PO Line Items *</label>
              <button type="button" id="btn-add-po-line" class="btn btn-secondary btn-sm" style="padding: 2px 8px; font-size: 0.75rem;">+ Add Line Item</button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 90px 110px 32px; gap: 8px; padding: 0 10px 2px 10px; font-size: 0.72rem; font-weight: 600; color: var(--text-muted);">
              <span>Product / SKU</span>
              <span>Quantity</span>
              <span>Unit Cost ($)</span>
              <span></span>
            </div>
            <div id="po-lines-container" class="order-items-builder" style="max-height: 110px; overflow-y: auto; overflow-x: hidden; padding: 2px;">
              <!-- Item rows injected here -->
            </div>
          </div>

          <div class="form-group col-span-2 po-summary-card" style="padding: 8px 14px; margin: 0;">
            <div class="flex-between">
              <span style="font-size: 0.85rem; font-weight: 600;">Total Estimated PO Capital:</span>
              <span id="po-total-calc" class="font-bold text-accent text-base">$0.00</span>
            </div>
          </div>

          <div class="form-group col-span-2">
            <label>Special Shipping Instructions / Notes</label>
            <input type="text" name="notes" placeholder="e.g. Deliver between 08:00 - 15:00 at Receiving Dock 3" value="Deliver between 08:00 - 15:00 at Receiving Dock 3" style="width: 100%;" />
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-modal-close">Cancel</button>
          <button type="submit" class="btn btn-primary">Approve & Issue PO</button>
        </div>
      </form>
    `;

    this.open(content, (dialog) => {
      const container = dialog.querySelector("#po-lines-container");
      const addLineBtn = dialog.querySelector("#btn-add-po-line");
      const totalCalc = dialog.querySelector("#po-total-calc");
      const form = dialog.querySelector("#form-po");

      const createLineRow = (selectedProdId = null, qty = 50) => {
        const row = document.createElement("div");
        row.className = "order-item-row";
        row.style.cssText = "display: grid; grid-template-columns: 1fr 90px 110px 32px; gap: 8px; align-items: center; padding: 5px 8px;";
        row.innerHTML = `
          <div style="min-width: 0;">
            <select class="po-item-prod" required style="width: 100%; height: 34px;">
              ${products
                .map((p) => `<option value="${p.id}" data-cost="${p.costPrice}" ${selectedProdId === p.id ? "selected" : ""}>${p.name} (${p.sku}) - $${p.costPrice.toFixed(2)}</option>`)
                .join("")}
            </select>
          </div>
          <div style="min-width: 0;">
            <input type="number" class="po-item-qty" min="1" value="${qty}" placeholder="Qty" required style="width: 100%; height: 34px;" />
          </div>
          <div style="min-width: 0;">
            <input type="number" step="0.01" class="po-item-cost" placeholder="Unit Cost" required style="width: 100%; height: 34px;" />
          </div>
          <button type="button" class="btn-icon btn-remove-line" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;" title="Remove line">&times;</button>
        `;

        const prodSelect = row.querySelector(".po-item-prod");
        const costInput = row.querySelector(".po-item-cost");
        const qtyInput = row.querySelector(".po-item-qty");
        const removeBtn = row.querySelector(".btn-remove-line");

        const syncCost = () => {
          const opt = prodSelect.options[prodSelect.selectedIndex];
          costInput.value = parseFloat(opt.dataset.cost).toFixed(2);
          updatePOTotal();
        };

        prodSelect.addEventListener("change", syncCost);
        costInput.addEventListener("input", updatePOTotal);
        qtyInput.addEventListener("input", updatePOTotal);

        removeBtn.addEventListener("click", () => {
          if (container.children.length > 1) {
            row.remove();
            updatePOTotal();
          } else {
            toast.warning("PO must have at least one line item");
          }
        });

        container.appendChild(row);
        syncCost();
      };

      const updatePOTotal = () => {
        let total = 0;
        const rows = container.querySelectorAll(".order-item-row");
        rows.forEach((r) => {
          const q = parseInt(r.querySelector(".po-item-qty").value) || 0;
          const c = parseFloat(r.querySelector(".po-item-cost").value) || 0;
          total += q * c;
        });
        totalCalc.textContent = `$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      };

      addLineBtn.addEventListener("click", () => createLineRow());

      // Start with 2 initial rows
      createLineRow(products[0]?.id, 75);
      createLineRow(products[1]?.id, 40);

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const rows = container.querySelectorAll(".order-item-row");
        const items = [];
        rows.forEach((r) => {
          items.push({
            productId: r.querySelector(".po-item-prod").value,
            quantity: parseInt(r.querySelector(".po-item-qty").value) || 1,
            unitCost: parseFloat(r.querySelector(".po-item-cost").value) || 10
          });
        });

        const po = store.createPurchaseOrder({
          supplierId: form.supplierId.value,
          warehouseId: form.warehouseId.value,
          items,
          notes: form.notes.value
        });

        toast.success(`Purchase Order ${po.poNumber} created and approved`);
        this.close();
      });
    }, "modal-wide");
  }

  // --- Inbound Goods Receipt Note (GRN) Receiving Modal ---
  openReceiveGRNModal(poId) {
    const po = store.getPurchaseOrders().find((p) => p.id === poId);
    if (!po) return;

    const supplier = store.getSupplier(po.supplierId);
    const warehouse = store.getWarehouse(po.warehouseId);

    const content = `
      <div class="modal-header">
        <div>
          <h3>Inbound Receiving Dock (GRN)</h3>
          <p class="text-muted text-sm">Verify vendor delivery for <strong>${po.poNumber}</strong> at ${warehouse?.name}</p>
        </div>
        <button type="button" class="btn-icon btn-modal-close">&times;</button>
      </div>

      <form id="form-grn" class="modal-form">
        <div class="grn-meta-banner">
          <div><strong>Supplier:</strong> ${supplier?.name}</div>
          <div><strong>Dock:</strong> ${warehouse?.name}</div>
          <div><strong>PO Total:</strong> $${po.totalAmount.toFixed(2)}</div>
        </div>

        <div class="form-group">
          <div class="flex-between" style="margin-bottom: 8px;">
            <label>Delivery Inspection Breakdown</label>
            <button type="button" id="btn-fill-all-grn" class="btn btn-secondary btn-sm">Receive All Remaining</button>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>Product / SKU</th>
                <th>Ordered</th>
                <th>Prior Recv</th>
                <th>Receiving Now</th>
              </tr>
            </thead>
            <tbody>
              ${po.items
                .map((it) => {
                  const prod = store.getProduct(it.productId);
                  const remaining = Math.max(0, it.quantity - (it.receivedQty || 0));
                  return `
                  <tr data-prod-id="${it.productId}">
                    <td>
                      <div class="font-bold">${prod?.name || it.productId}</div>
                      <div class="text-xs text-muted">${prod?.sku}</div>
                    </td>
                    <td>${it.quantity}</td>
                    <td>${it.receivedQty || 0}</td>
                    <td>
                      <input type="number" class="grn-qty-input" min="0" max="${remaining + 50}" value="${remaining}" data-remaining="${remaining}" style="width: 90px;" />
                    </td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>Receiving Inspector Name *</label>
            <input type="text" name="clerk" required value="Marcus Vance (WH Lead)" />
          </div>
          <div class="form-group">
            <label>Damage / Discrepancy Notes</label>
            <input type="text" name="notes" placeholder="e.g. Cartons intact, barcode stickers verified" />
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-modal-close">Cancel</button>
          <button type="submit" class="btn btn-success">Confirm Goods Receipt & Ingest Stock</button>
        </div>
      </form>
    `;

    this.open(content, (dialog) => {
      const form = dialog.querySelector("#form-grn");
      const fillAllBtn = dialog.querySelector("#btn-fill-all-grn");

      fillAllBtn.addEventListener("click", () => {
        const inputs = dialog.querySelectorAll(".grn-qty-input");
        inputs.forEach((input) => {
          input.value = input.dataset.remaining;
        });
      });

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const map = {};
        const rows = dialog.querySelectorAll("tbody tr");
        rows.forEach((row) => {
          const prodId = row.dataset.prodId;
          const qty = parseInt(row.querySelector(".grn-qty-input").value) || 0;
          map[prodId] = qty;
        });

        store.receiveGoodsReceipt(poId, map, form.clerk.value, form.notes.value);
        toast.success(`GRN completed for ${po.poNumber}. Stock ingested into ${warehouse?.name}!`);
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
        this.close();
      });
    });
  }

  // --- Inter-Warehouse Stock Transfer Modal ---
  openCreateTransferModal() {
    const warehouses = store.getWarehouses();
    const products = store.getProducts();

    const content = `
      <div class="modal-header">
        <div>
          <h3>Create Inter-Warehouse Stock Transfer (STO)</h3>
          <p class="text-muted text-sm">Relocate inventory between regional hubs with in-transit tracking</p>
        </div>
        <button type="button" class="btn-icon btn-modal-close">&times;</button>
      </div>

      <form id="form-transfer" class="modal-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Origin Warehouse (Sending) *</label>
            <select name="fromWarehouseId" id="trf-origin" required>
              ${warehouses.map((w) => `<option value="${w.id}">${w.name} (${w.city})</option>`).join("")}
            </select>
          </div>

          <div class="form-group">
            <label>Destination Warehouse (Receiving) *</label>
            <select name="toWarehouseId" id="trf-dest" required>
              ${warehouses.map((w, i) => `<option value="${w.id}" ${i === 1 ? "selected" : ""}>${w.name} (${w.city})</option>`).join("")}
            </select>
          </div>

          <div class="form-group">
            <label>Freight Logistics Carrier</label>
            <select name="carrier">
              <option value="Schneider National Dedicated">Schneider National Dedicated</option>
              <option value="Old Dominion Express Freight">Old Dominion Express Freight</option>
              <option value="FedEx Freight Priority">FedEx Freight Priority</option>
              <option value="XPO Logistics Intermodal">XPO Logistics Intermodal</option>
            </select>
          </div>

          <div class="form-group">
            <label>Estimated Arrival (ETA)</label>
            <input type="text" name="eta" value="In 3 Business Days" />
          </div>

          <div class="form-group col-span-2" style="display: grid; grid-template-columns: 2.2fr 1fr 1.3fr; gap: 10px; align-items: flex-end;">
            <div style="min-width: 0;">
              <label style="display: block; font-size: 0.78rem; font-weight: 600; color: var(--text-muted); margin-bottom: 4px;">Select Product to Transfer *</label>
              <select id="trf-product" required style="width: 100%;">
                ${products.map((p) => `<option value="${p.id}">${p.name} (${p.sku})</option>`).join("")}
              </select>
            </div>
            <div style="min-width: 0;">
              <label style="display: block; font-size: 0.78rem; font-weight: 600; color: var(--text-muted); margin-bottom: 4px;">Transfer Qty *</label>
              <input type="number" id="trf-qty" min="1" value="20" required style="width: 100%;" />
            </div>
            <div style="min-width: 0;">
              <label style="display: block; font-size: 0.78rem; font-weight: 600; color: var(--text-muted); margin-bottom: 4px;">Origin Stock</label>
              <div id="origin-stock-indicator" class="stat-pill" style="height: 36px; display: flex; align-items: center; justify-content: center; padding: 0 8px; box-sizing: border-box;">
                <span class="value text-accent font-bold" style="font-size: 0.78rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Checking...</span>
              </div>
            </div>
          </div>

          <div class="form-group col-span-2">
            <label>Transfer Reason / Operational Justification</label>
            <input type="text" name="reason" value="Balancing regional stock for promotional campaign" required />
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-modal-close">Cancel</button>
          <button type="submit" class="btn btn-primary">Dispatch Transfer Order</button>
        </div>
      </form>
    `;

    this.open(content, (dialog) => {
      const originSelect = dialog.querySelector("#trf-origin");
      const destSelect = dialog.querySelector("#trf-dest");
      const prodSelect = dialog.querySelector("#trf-product");
      const qtyInput = dialog.querySelector("#trf-qty");
      const originStockIndicator = dialog.querySelector("#origin-stock-indicator .value");
      const form = dialog.querySelector("#form-transfer");

      const checkOriginStock = () => {
        const whId = originSelect.value;
        const prodId = prodSelect.value;
        const stockRec = store.getStock().find((s) => s.productId === prodId && s.warehouseId === whId);
        const onHand = stockRec ? stockRec.onHand : 0;
        const reserved = stockRec ? stockRec.reserved : 0;
        const available = Math.max(0, onHand - reserved);
        originStockIndicator.textContent = `${available} Avail (${onHand} Total)`;
        qtyInput.max = available > 0 ? available : 1;
      };

      originSelect.addEventListener("change", checkOriginStock);
      prodSelect.addEventListener("change", checkOriginStock);
      checkOriginStock();

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (originSelect.value === destSelect.value) {
          toast.error("Origin and Destination warehouses cannot be identical!");
          return;
        }

        const qty = parseInt(qtyInput.value) || 1;
        const transfer = store.createStockTransfer({
          fromWarehouseId: form.fromWarehouseId.value,
          toWarehouseId: form.toWarehouseId.value,
          carrier: form.carrier.value,
          eta: form.eta.value,
          reason: form.reason.value,
          items: [{ productId: prodSelect.value, quantity: qty }]
        });

        toast.success(`Transfer ${transfer.transferNumber} dispatched in-transit`);
        this.close();
      });
    });
  }

  // --- Create Customer Order Modal ---
  openCreateOrderModal() {
    const products = store.getProducts();
    const warehouses = store.getWarehouses();

    const content = `
      <div class="modal-header">
        <div>
          <h3>Create Omnichannel Sales Order</h3>
          <p class="text-muted text-sm">Simulate incoming customer order across retail, web, or B2B channels</p>
        </div>
        <button type="button" class="btn-icon btn-modal-close">&times;</button>
      </div>

      <form id="form-order" class="modal-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Customer Name *</label>
            <input type="text" name="customerName" required value="Metro Lifestyle Store" />
          </div>

          <div class="form-group">
            <label>Customer Email *</label>
            <input type="email" name="customerEmail" required value="orders@metrolifestyle.com" />
          </div>

          <div class="form-group">
            <label>Sales Channel</label>
            <select name="channel">
              <option value="E-Commerce Direct">E-Commerce Direct</option>
              <option value="B2B Wholesale">B2B Wholesale</option>
              <option value="Retail POS Storefront">Retail POS Storefront</option>
              <option value="Mobile App Store">Mobile App Store</option>
            </select>
          </div>

          <div class="form-group">
            <label>Fulfillment Warehouse *</label>
            <select name="warehouseId" required>
              ${warehouses.map((w) => `<option value="${w.id}">${w.name} (${w.city})</option>`).join("")}
            </select>
          </div>

          <div class="form-group col-span-2">
            <label>Shipping Destination Address *</label>
            <input type="text" name="shippingAddress" required value="1500 Broadway, New York, NY 10036" />
          </div>

          <div class="form-group">
            <label>Carrier</label>
            <select name="carrier">
              <option value="FedEx Ground">FedEx Ground</option>
              <option value="UPS Next Day Air">UPS Next Day Air</option>
              <option value="DHL Express">DHL Express</option>
              <option value="USPS Priority">USPS Priority</option>
            </select>
          </div>

          <div class="form-group">
            <label>Order Priority</label>
            <select name="priority">
              <option value="Normal">Normal</option>
              <option value="High">High Priority</option>
              <option value="Rush">Rush Fulfillment</option>
            </select>
          </div>

          <div class="form-group" style="grid-column: span 1;">
            <label>Order Item *</label>
            <select id="order-prod" required>
              ${products.map((p) => `<option value="${p.id}">${p.name} ($${p.sellingPrice.toFixed(2)})</option>`).join("")}
            </select>
          </div>

          <div class="form-group" style="grid-column: span 1;">
            <label>Order Quantity *</label>
            <input type="number" id="order-qty" min="1" value="2" required />
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-modal-close">Cancel</button>
          <button type="submit" class="btn btn-primary">Place Order & Reserve Inventory</button>
        </div>
      </form>
    `;

    this.open(content, (dialog) => {
      const form = dialog.querySelector("#form-order");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const prodId = dialog.querySelector("#order-prod").value;
        const qty = parseInt(dialog.querySelector("#order-qty").value) || 1;

        const order = store.createSalesOrder({
          customerName: form.customerName.value,
          customerEmail: form.customerEmail.value,
          channel: form.channel.value,
          warehouseId: form.warehouseId.value,
          shippingAddress: form.shippingAddress.value,
          carrier: form.carrier.value,
          priority: form.priority.value,
          items: [{ productId: prodId, quantity: qty }]
        });

        toast.success(`Sales Order ${order.orderNumber} placed. Stock reserved!`);
        this.close();
      });
    });
  }

  // --- Printable Digital Packing Slip Modal ---
  openPackingSlipModal(orderId) {
    const order = store.getSalesOrders().find((o) => o.id === orderId);
    if (!order) return;
    const warehouse = store.getWarehouse(order.warehouseId);

    const content = `
      <div class="modal-header no-print">
        <div>
          <h3>Digital Commercial Packing Slip</h3>
          <p class="text-muted text-sm">Packing verification for Order: <strong>${order.orderNumber}</strong></p>
        </div>
        <div class="flex-center gap-sm">
          <button type="button" id="btn-print-slip" class="btn btn-primary btn-sm">Print Packing Slip</button>
          <button type="button" class="btn-icon btn-modal-close">&times;</button>
        </div>
      </div>

      <div class="printable-slip">
        <div class="slip-header">
          <div>
            <div class="slip-brand">STOCKORA LOGISTICS CORP</div>
            <div class="text-xs text-muted">Advanced Retail Fulfillment Network</div>
            <div class="text-xs text-muted">Fulfillment Hub: ${warehouse?.name}</div>
            <div class="text-xs text-muted">${warehouse?.address}</div>
          </div>
          <div class="text-right">
            <div class="slip-barcode">||| | | |||| || ||| |||| |</div>
            <div class="font-bold">${order.orderNumber}</div>
            <div class="text-xs text-muted">Date: ${order.orderDate}</div>
            <div class="badge badge-accent">${order.customer.channel}</div>
          </div>
        </div>

        <hr class="slip-divider" />

        <div class="slip-addresses">
          <div>
            <div class="text-xs font-bold text-muted">SHIP TO:</div>
            <button type="button" id="btn-slip-view-customer" class="font-bold text-main" title="Click to view Customer Account Profile" style="background: none; border: none; padding: 0; cursor: pointer; text-decoration: underline; font-size: 1rem; text-align: left; color: var(--color-primary, #2563eb);">${order.customer.name}</button>
            <div class="text-sm">${order.customer.shippingAddress}</div>
            <div class="text-xs text-muted">${order.customer.email}</div>
          </div>
          <div>
            <div class="text-xs font-bold text-muted">LOGISTICS DETAILS:</div>
            <div class="text-sm"><strong>Carrier:</strong> ${order.carrier}</div>
            <div class="text-sm"><strong>Tracking:</strong> ${order.trackingNumber}</div>
            <div class="text-sm"><strong>Status:</strong> ${order.status}</div>
          </div>
        </div>

        <table class="data-table" style="margin-top: 16px;">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Description</th>
              <th>Bin Location</th>
              <th>Qty Ordered</th>
              <th>Verified Pick</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map((it) => {
                const prod = store.getProduct(it.productId);
                const stockRec = store.getStock().find((s) => s.productId === it.productId && s.warehouseId === order.warehouseId);
                return `
                <tr>
                  <td class="font-mono">${prod?.sku}</td>
                  <td>${prod?.name}</td>
                  <td><span class="badge badge-subtle">${stockRec?.bin || "A-01-01"}</span></td>
                  <td class="font-bold">${it.quantity}</td>
                  <td>[ ✔ Verified ]</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>

        <div class="slip-footer">
          <div class="text-xs text-muted">
            Thank you for your order! For returns and RMA queries, visit <strong>returns.stockora.in</strong> with your order # ${order.orderNumber}.
          </div>
          <div class="slip-total">
            Total Declared Value: <strong>$${order.totalAmount.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    `;

    this.open(content, (dialog) => {
      const printBtn = dialog.querySelector("#btn-print-slip");
      printBtn.addEventListener("click", () => {
        window.print();
      });

      const custBtn = dialog.querySelector("#btn-slip-view-customer");
      if (custBtn) {
        custBtn.addEventListener("click", () => {
          this.openCustomerModal(order.customer);
        });
      }
    });
  }

  // --- Customer Profile & Account Details Modal (Accessed from Orders) ---
  openCustomerModal(customerIdentifier) {
    const customers = store.getCustomers ? store.getCustomers() : [];
    let cust = null;
    if (typeof customerIdentifier === "string") {
      cust = customers.find(
        (c) =>
          c.email?.toLowerCase() === customerIdentifier.toLowerCase() ||
          c.name?.toLowerCase() === customerIdentifier.toLowerCase() ||
          c.id === customerIdentifier
      );
    } else if (customerIdentifier && typeof customerIdentifier === "object") {
      cust =
        customers.find(
          (c) => c.email?.toLowerCase() === customerIdentifier.email?.toLowerCase()
        ) || customerIdentifier;
    }

    if (!cust) {
      cust = {
        name: typeof customerIdentifier === "string" ? customerIdentifier : "Retail Customer",
        email: "customer@retailhub.in",
        phone: "+91 98200 12345",
        shippingAddress: "Regional Fulfillment Address",
        channel: "Direct Storefront",
        ordersCount: 1,
        totalSpent: 120.0,
        status: "Active"
      };
    }

    const allOrders = store.getSalesOrders();
    const customerOrders = allOrders.filter(
      (o) =>
        o.customer?.email?.toLowerCase() === cust.email?.toLowerCase() ||
        o.customer?.name?.toLowerCase() === cust.name?.toLowerCase()
    );

    const lifetimeSpend = cust.totalSpent || customerOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const orderCount = cust.ordersCount || customerOrders.length;
    const avgOrder = orderCount > 0 ? (lifetimeSpend / orderCount).toFixed(2) : "0.00";

    const content = `
      <div class="modal-header">
        <div class="flex-align-center gap-3">
          <div class="user-avatar-initials" style="width: 44px; height: 44px; font-size: 1.1rem; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: 700;">
            ${cust.name ? cust.name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "CU"}
          </div>
          <div>
            <div class="flex-align-center gap-2">
              <h3 style="margin: 0;">${cust.name}</h3>
              <span class="badge badge-success text-xxs font-bold">Verified Account</span>
            </div>
            <p class="text-muted text-xs" style="margin: 2px 0 0 0;">Customer ID: <span class="font-mono">${cust.id || "CUST-1001"}</span> &bull; Channel: ${cust.channel || "Storefront"}</p>
          </div>
        </div>
        <button type="button" class="btn-icon btn-modal-close">&times;</button>
      </div>

      <div class="customer-modal-body" style="padding: 0;">
        <!-- Metrics Row -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="background: var(--bg-surface-secondary, #f8fafc); border: 1px solid var(--border-color, #e2e8f0); border-radius: 8px; padding: 12px; text-align: center;">
            <div class="text-muted text-xs font-semibold">Total Orders</div>
            <div class="font-mono font-bold text-lg" style="margin-top: 4px; color: var(--text-main, #0f172a);">${orderCount}</div>
          </div>
          <div style="background: var(--bg-surface-secondary, #f8fafc); border: 1px solid var(--border-color, #e2e8f0); border-radius: 8px; padding: 12px; text-align: center;">
            <div class="text-muted text-xs font-semibold">Lifetime Value</div>
            <div class="font-mono font-bold text-lg text-accent" style="margin-top: 4px;">$${Number(lifetimeSpend).toFixed(2)}</div>
          </div>
          <div style="background: var(--bg-surface-secondary, #f8fafc); border: 1px solid var(--border-color, #e2e8f0); border-radius: 8px; padding: 12px; text-align: center;">
            <div class="text-muted text-xs font-semibold">Average Order</div>
            <div class="font-mono font-bold text-lg" style="margin-top: 4px; color: var(--text-main, #0f172a);">$${avgOrder}</div>
          </div>
        </div>

        <!-- Contact & Address Details -->
        <div style="background: var(--bg-surface, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: 8px; padding: 14px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted, #64748b);">Contact & Shipping Information</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.85rem;">
            <div>
              <span class="text-muted">Email:</span>
              <div class="font-mono font-semibold" style="margin-top: 2px;">${cust.email}</div>
            </div>
            <div>
              <span class="text-muted">Phone:</span>
              <div class="font-mono font-semibold" style="margin-top: 2px;">${cust.phone || "+91 98200 12345"}</div>
            </div>
            <div style="grid-column: span 2;">
              <span class="text-muted">Primary Delivery Address:</span>
              <div class="font-semibold" style="margin-top: 2px;">${cust.shippingAddress}</div>
            </div>
          </div>
        </div>

        <!-- Associated Orders History -->
        <div>
          <div class="flex-between" style="margin-bottom: 8px;">
            <h4 style="margin: 0; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted, #64748b);">Customer Order History (${customerOrders.length})</h4>
          </div>
          ${
            customerOrders.length === 0
              ? `
            <div class="text-muted text-xs" style="padding: 16px; text-align: center; border: 1px dashed var(--border-color, #e2e8f0); border-radius: 6px;">No recorded sales orders for this profile yet.</div>
          `
              : `
            <div class="table-responsive" style="max-height: 220px; overflow-y: auto; border: 1px solid var(--border-color, #e2e8f0); border-radius: 6px;">
              <table class="data-table" style="font-size: 0.82rem;">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th class="text-right">Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${customerOrders
                    .map(
                      (o) => `
                    <tr>
                      <td class="font-mono font-bold text-main">${o.orderNumber}</td>
                      <td class="text-muted">${o.orderDate ? o.orderDate.split(" ")[0] : "Recent"}</td>
                      <td>${(o.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0)} units</td>
                      <td class="text-right font-mono font-bold text-accent">$${o.totalAmount.toFixed(2)}</td>
                      <td><span class="badge ${o.status === "Delivered" ? "badge-success" : o.status === "Dispatched" ? "badge-accent" : "badge-warning"}">${o.status}</span></td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          `
          }
        </div>

        <div class="modal-footer" style="margin-top: 20px; padding: 0;">
          <button type="button" class="btn btn-secondary btn-modal-close">Close Details</button>
        </div>
      </div>
    `;

    this.open(content);
  }

  // --- Interactive Barcode Scanner Simulator Modal ---
  openBarcodeScannerModal() {
    const products = store.getProducts();
    const content = `
      <div class="modal-header">
        <div>
          <h3>Optical Barcode Scanner Terminal</h3>
          <p class="text-muted text-sm">Simulate laser handheld warehouse scanner (EAN-13 / UPC lookup)</p>
        </div>
        <button type="button" class="btn-icon btn-modal-close">&times;</button>
      </div>

      <div class="scanner-container" style="gap: 12px;">
        <div class="scanner-screen" style="height: 75px;">
          <div class="laser-beam"></div>
          <div class="scanner-status" id="scan-feedback">READY - AIM SCANNER AT BARCODE</div>
        </div>

        <div class="scanner-input-bar">
          <input type="text" id="manual-barcode-input" placeholder="Type or click barcode below (e.g. 8901234567890)" />
          <button type="button" id="btn-trigger-scan" class="btn btn-primary" style="flex-shrink: 0; padding: 0 18px;">Scan</button>
        </div>

        <div class="quick-barcode-list">
          <div class="text-xs text-muted" style="margin-bottom: 4px; font-weight: 600;">QUICK SCAN DEMO BARCODES:</div>
          <div class="barcode-pills" style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${products
              .slice(0, 6)
              .map(
                (p) =>
                  `<button type="button" class="barcode-pill" data-barcode="${p.barcode}" data-sku="${p.sku}" style="padding: 4px 8px; font-size: 0.72rem;">
                    <span class="font-mono">${p.barcode}</span>
                    <span class="text-xs text-muted">(${p.sku})</span>
                  </button>`
              )
              .join("")}
          </div>
        </div>

        <div id="scanner-result" class="scanner-result-card" style="display: none; padding: 12px 14px; margin-top: 4px;">
          <!-- Result populates on scan -->
        </div>
      </div>
    `;

    this.open(content, (dialog) => {
      const input = dialog.querySelector("#manual-barcode-input");
      const scanBtn = dialog.querySelector("#btn-trigger-scan");
      const feedback = dialog.querySelector("#scan-feedback");
      const resultCard = dialog.querySelector("#scanner-result");
      const pills = dialog.querySelectorAll(".barcode-pill");

      const playBeep = () => {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(1800, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.12);
        } catch (e) {}
      };

      const executeScan = (barcode) => {
        barcode = barcode.trim();
        playBeep();
        feedback.textContent = `BEEP! DECODED: ${barcode}`;
        feedback.style.color = "var(--color-success)";

        const prod = products.find((p) => p.barcode === barcode || p.sku.toLowerCase() === barcode.toLowerCase());
        resultCard.style.display = "block";

        if (prod) {
          const summary = store.getProductStockSummary(prod.id);
          resultCard.innerHTML = `
            <div class="flex-between">
              <div>
                <span class="badge badge-success">MATCH VERIFIED</span>
                <h4 style="margin: 6px 0 2px 0;">${prod.name}</h4>
                <div class="text-sm font-mono text-muted">SKU: ${prod.sku} | Barcode: ${prod.barcode}</div>
              </div>
              <div class="text-right">
                <div class="text-xs text-muted">Total Stock</div>
                <div class="text-xl font-bold text-accent">${summary.onHand} Units</div>
                <div class="text-xs text-muted">${summary.available} Available</div>
              </div>
            </div>

            <div class="scanner-stock-locations" style="margin-top: 12px;">
              <div class="text-xs font-bold text-muted" style="margin-bottom: 4px;">FACILITY STOCK BREAKDOWN:</div>
              <div class="locations-grid">
                ${summary.records
                  .map((r) => {
                    const wh = store.getWarehouse(r.warehouseId);
                    return `
                    <div class="loc-card">
                      <span class="font-bold">${wh?.city || r.warehouseId}</span>
                      <span class="badge badge-subtle">Bin ${r.bin}</span>
                      <span>${r.onHand} units</span>
                    </div>
                  `;
                  })
                  .join("")}
              </div>
            </div>
          `;
        } else {
          resultCard.innerHTML = `
            <div class="text-danger font-bold">NO MATCH FOUND IN CATALOG</div>
            <p class="text-sm text-muted">Barcode '${barcode}' is not mapped to any active SKU.</p>
          `;
        }
      };

      scanBtn.addEventListener("click", () => {
        if (input.value) executeScan(input.value);
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (input.value) executeScan(input.value);
        }
      });

      pills.forEach((p) => {
        p.addEventListener("click", () => {
          input.value = p.dataset.barcode;
          executeScan(p.dataset.barcode);
        });
      });
    });
  }

  // --- Administrator Authentication & Login Modal ---
  openLoginModal(onSuccess = null) {
    const content = `
      <div class="modal-header" style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border-subtle);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="login-brand-icon" style="width: 32px; height: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); background: rgba(26, 100, 240, 0.08); border: 1px solid rgba(26, 100, 240, 0.15); padding: 2px;">
            <img src="/stockora-icon.png" alt="Stockora" style="width: 100%; height: 100%; object-fit: contain;" />
          </div>
          <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-main); margin: 0; line-height: 1;">Stockora Administrator Login</h3>
        </div>
        <button type="button" class="btn-icon btn-modal-close" aria-label="Close dialog">&times;</button>
      </div>

      <div class="login-modal-body" style="padding: 0;">
        
        <!-- Administrator Scope Badge -->
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(26, 100, 240, 0.06); border: 1px solid rgba(26, 100, 240, 0.15); border-radius: 8px; margin-bottom: 18px;">
          <i data-lucide="shield-check" style="width: 16px; height: 16px; color: #1a64f0; flex-shrink: 0;"></i>
          <span style="font-size: 0.78rem; color: var(--text-main); line-height: 1.3;">
            Authorized for <strong>Warehouse & Inventory Management</strong> personnel only.
          </span>
        </div>

        <form id="form-login" class="modal-form">
          <div id="login-error-alert" class="alert-box alert-danger" style="display: none; margin-bottom: 14px; padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; align-items: center; gap: 8px;">
            <i data-lucide="alert-circle" style="width: 15px; height: 15px; flex-shrink: 0;"></i>
            <span id="login-error-text">Invalid administrator credentials.</span>
          </div>

          <div class="form-group" style="margin-bottom: 14px;">
            <label for="login-email" style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 5px;">Admin Email / Username</label>
            <div class="input-with-icon" style="position: relative;">
              <i data-lucide="mail" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; color: #94a3b8;"></i>
              <input 
                type="email" 
                id="login-email" 
                name="email" 
                required 
                placeholder="admin@retailhub.in" 
                value="" 
                autocomplete="off" 
                style="width: 100%; padding: 9px 12px 9px 36px; border: 1px solid var(--border-subtle); border-radius: 6px; font-size: 0.86rem; background: var(--bg-surface); color: var(--text-main); transition: border-color 0.2s;"
              />
            </div>
            <div id="login-email-error" style="display: none; color: #dc2626; font-size: 0.75rem; margin-top: 5px; align-items: center; gap: 4px;">
              <i data-lucide="alert-circle" style="width: 12px; height: 12px; flex-shrink: 0;"></i>
              <span id="login-email-error-text">Please enter a valid administrator email.</span>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 16px;">
            <label for="login-password" style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 5px;">Password</label>
            <div class="input-with-icon" style="position: relative;">
              <i data-lucide="lock" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; color: #94a3b8;"></i>
              <input 
                type="password" 
                id="login-password" 
                name="password" 
                required 
                placeholder="" 
                value="" 
                autocomplete="off" 
                style="width: 100%; padding: 9px 36px 9px 36px; border: 1px solid var(--border-subtle); border-radius: 6px; font-size: 0.86rem; background: var(--bg-surface); color: var(--text-main);"
              />
              <button 
                type="button" 
                id="btn-toggle-pwd" 
                class="btn-icon-inside" 
                title="Show/Hide Password"
                style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px;"
              >
                <i data-lucide="eye" id="pwd-icon" style="width: 15px; height: 15px;"></i>
              </button>
            </div>
          </div>

          <!-- Remember Me Row -->
          <div class="login-remember-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
            <label for="modal-login-remember" style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.82rem; color: var(--text-main); user-select: none;">
              <input 
                type="checkbox" 
                id="modal-login-remember" 
                name="rememberMe" 
                style="width: 16px; height: 16px; accent-color: var(--color-primary); cursor: pointer; border-radius: 4px;"
              />
              <span style="font-weight: 500;">Remember me</span>
            </label>
            <span class="text-xs text-muted">Keep session signed in</span>
          </div>

          <div class="modal-footer" style="display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding-top: 14px; border-top: 1px solid var(--border-subtle);">
            <button type="button" class="btn btn-ghost btn-sm btn-modal-close">Cancel</button>
            <button type="submit" id="btn-submit-login" class="btn btn-primary btn-sm">
              <i data-lucide="log-in"></i>
              <span id="submit-login-text">Sign In to Admin Console</span>
            </button>
          </div>
        </form>
      </div>
    `;

    this.open(content, (dialog) => {
      const form = dialog.querySelector("#form-login");
      const emailInput = dialog.querySelector("#login-email");
      const pwdInput = dialog.querySelector("#login-password");
      const rememberCheckbox = dialog.querySelector("#modal-login-remember");
      const togglePwd = dialog.querySelector("#btn-toggle-pwd");
      const pwdIcon = dialog.querySelector("#pwd-icon");
      const errorBox = dialog.querySelector("#login-error-alert");
      const errorText = dialog.querySelector("#login-error-text");
      const submitBtn = dialog.querySelector("#btn-submit-login");
      const submitText = dialog.querySelector("#submit-login-text");
      const emailError = dialog.querySelector("#login-email-error");
      const emailErrorText = dialog.querySelector("#login-email-error-text");

      // Email validation logic on blur and submit
      const validateEmail = (showError = true) => {
        const val = emailInput ? emailInput.value.trim() : "";
        if (!val) {
          if (showError && emailError && emailErrorText) {
            emailErrorText.textContent = "Admin email or username is required.";
            emailError.style.display = "flex";
            if (emailInput) emailInput.style.borderColor = "#ef4444";
            if (window.lucide) window.lucide.createIcons({ root: emailError });
          }
          return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          if (showError && emailError && emailErrorText) {
            emailErrorText.textContent = "Please enter a valid email address.";
            emailError.style.display = "flex";
            if (emailInput) emailInput.style.borderColor = "#ef4444";
            if (window.lucide) window.lucide.createIcons({ root: emailError });
          }
          return false;
        }

        if (emailError) emailError.style.display = "none";
        if (emailInput) emailInput.style.borderColor = "var(--border-subtle)";
        return true;
      };

      emailInput?.addEventListener("blur", () => {
        validateEmail(true);
      });

      emailInput?.addEventListener("input", () => {
        if (emailError && emailError.style.display !== "none") {
          validateEmail(true);
        }
      });

      // Password visibility toggle
      if (togglePwd && pwdInput) {
        togglePwd.addEventListener("click", () => {
          const isPwd = pwdInput.type === "password";
          pwdInput.type = isPwd ? "text" : "password";
          if (pwdIcon) {
            pwdIcon.setAttribute("data-lucide", isPwd ? "eye-off" : "eye");
            if (window.lucide) window.lucide.createIcons({ root: togglePwd });
          }
        });
      }

      // Submit handler
      form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (errorBox) errorBox.style.display = "none";

        const isEmailValid = validateEmail(true);
        if (!isEmailValid) {
          emailInput?.focus();
          return;
        }

        if (submitBtn) submitBtn.disabled = true;
        if (submitText) submitText.textContent = "Authenticating...";

        const email = emailInput?.value.trim();
        const password = pwdInput?.value;
        const rememberMe = Boolean(rememberCheckbox?.checked);

        const result = await store.login(email, password, null, rememberMe);

        if (result.success) {
          this.close();
          toast.success(`Welcome back, ${result.user.name}! Administrator session active.`);
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.8 }
            });
          } catch (err) {}

          // Navigate to existing Admin Dashboard
          if (typeof onSuccess === "function") {
            onSuccess("dashboard");
          } else {
            window.location.hash = "#dashboard";
          }
        } else {
          if (errorBox) errorBox.style.display = "flex";
          if (errorText) errorText.textContent = result.message || "Invalid administrator credentials.";
          if (submitBtn) submitBtn.disabled = false;
          if (submitText) submitText.textContent = "Sign In to Admin Console";
          if (window.lucide) window.lucide.createIcons({ root: errorBox });
        }
      });
    }, "modal-sm");
  }

  // --- Modern Sign Out Confirmation Modal ---
  openSignOutConfirmModal(onConfirm) {
    const user = store.getCurrentUser ? store.getCurrentUser() : null;
    const name = user?.name || "ADITYA MAURYA";
    const email = user?.email || "adityamaurya@retailhub.in";
    const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2) || "AM";

    const content = `
      <div class="confirm-dialog-content">
        <button type="button" class="btn-icon btn-modal-close" style="position: absolute; top: 12px; right: 14px;" title="Close">&times;</button>
        
        <div class="confirm-icon-badge danger">
          <i data-lucide="log-out"></i>
        </div>

        <h3 class="confirm-title">Sign Out of Stockora?</h3>
        
        <p class="confirm-description">
          Are you sure you want to end your active administrator session? You will need to enter your credentials to access the console again.
        </p>

        <div class="confirm-user-card">
          <div class="user-avatar-initials" style="width: 36px; height: 36px; font-size: 0.88rem; font-weight: 700; background: var(--color-primary, #3b82f6); color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${initials}
          </div>
          <div style="min-width: 0; flex: 1;">
            <div class="font-bold text-main" style="font-size: 0.88rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${name}</div>
            <div class="text-muted text-xs" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${email}</div>
          </div>
          <span class="badge badge-subtle" style="font-size: 0.68rem; text-transform: uppercase;">Admin</span>
        </div>

        <div class="confirm-actions">
          <button type="button" class="btn btn-secondary" id="btn-cancel-signout">Cancel</button>
          <button type="button" class="btn btn-danger" id="btn-confirm-signout">
            <i data-lucide="log-out"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    `;

    this.open(content, (dialog) => {
      const cancelBtn = dialog.querySelector("#btn-cancel-signout");
      const confirmBtn = dialog.querySelector("#btn-confirm-signout");

      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
          this.close();
        });
      }

      if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
          this.close();
          if (typeof onConfirm === "function") {
            onConfirm();
          }
        });
      }
    }, "modal-confirm");
  }
}

export const modals = new ModalManager();
