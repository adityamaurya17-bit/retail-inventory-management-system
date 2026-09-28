import { store } from "../../state/store.js";
import { toast } from "../toast/Toast.js";
import confetti from "canvas-confetti";


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

  open(contentHtml, afterRender = null) {
    this.ensureDialog();
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
        <div class="form-grid">
          <div class="form-group col-span-2">
            <label>Product Name *</label>
            <input type="text" name="name" required value="${product?.name || ""}" placeholder="e.g. UltraFit Active Sport Earbuds" />
          </div>

          <div class="form-group">
            <label>Category *</label>
            <select name="category" required>
              ${["Electronics", "Apparel", "Home & Furniture", "Grocery & Gourmet", "Sports & Fitness", "Health & Personal Care"]
                .map((cat) => `<option value="${cat}" ${product?.category === cat ? "selected" : ""}>${cat}</option>`)
                .join("")}
            </select>
          </div>

          <div class="form-group">
            <label>Brand Name *</label>
            <input type="text" name="brand" required value="${product?.brand || ""}" placeholder="e.g. AuraSound" />
          </div>

          <div class="form-group">
            <label>SKU (Stock Keeping Unit)</label>
            <div class="input-with-action">
              <input type="text" name="sku" id="input-sku" required value="${product?.sku || ""}" placeholder="Auto-generated if empty" />
              <button type="button" id="btn-gen-sku" class="btn btn-secondary btn-sm" title="Auto-generate standardized SKU">Auto</button>
            </div>
          </div>

          <div class="form-group">
            <label>Barcode (EAN-13 / UPC)</label>
            <input type="text" name="barcode" id="input-barcode" required value="${product?.barcode || ""}" placeholder="e.g. 8901234567890" />
          </div>

          <div class="form-group">
            <label>Cost Price ($) *</label>
            <input type="number" step="0.01" name="costPrice" id="input-cost" required value="${product?.costPrice || ""}" placeholder="0.00" />
          </div>

          <div class="form-group">
            <label>Selling Price ($) *</label>
            <input type="number" step="0.01" name="sellingPrice" id="input-price" required value="${product?.sellingPrice || ""}" placeholder="0.00" />
          </div>

          <div class="form-group col-span-2 margin-preview-box">
            <div class="flex-between">
              <span class="text-sm">Gross Profit Margin:</span>
              <span id="margin-calc" class="font-bold text-accent">0.0%</span>
            </div>
            <div class="progress-bar-container">
              <div id="margin-bar" class="progress-bar" style="width: 0%"></div>
            </div>
          </div>

          <div class="form-group">
            <label>Reorder Point (Threshold) *</label>
            <input type="number" name="reorderPoint" required value="${product?.reorderPoint || 25}" />
          </div>

          <div class="form-group">
            <label>Max Warehouse Capacity *</label>
            <input type="number" name="maxStock" required value="${product?.maxStock || 200}" />
          </div>

          <div class="form-group">
            <label>Unit of Measure</label>
            <select name="unit">
              ${["Units", "Packs", "Sets", "Boxes", "Cartons", "Pallets"]
                .map((u) => `<option value="${u}" ${product?.unit === u ? "selected" : ""}>${u}</option>`)
                .join("")}
            </select>
          </div>

          <div class="form-group">
            <label>Primary Supplier</label>
            <select name="primarySupplierId">
              ${suppliers.map((s) => `<option value="${s.id}" ${product?.primarySupplierId === s.id ? "selected" : ""}>${s.name} (${s.code})</option>`).join("")}
            </select>
          </div>

          ${
            !isEdit
              ? `
          <div class="form-group">
            <label>Initial Stock (Units)</label>
            <input type="number" name="initialStock" value="50" min="0" />
          </div>
          <div class="form-group">
            <label>Initial Warehouse</label>
            <select name="initialWarehouse">
              ${warehouses.map((w) => `<option value="${w.id}">${w.name} (${w.city})</option>`).join("")}
            </select>
          </div>
          `
              : ""
          }

          <div class="form-group col-span-2">
            <label>Product Description & Specs</label>
            <textarea name="description" rows="2" placeholder="Brief technical and retail specs">${product?.description || ""}</textarea>
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
    });
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
            <div class="flex-between">
              <label>PO Line Items *</label>
              <button type="button" id="btn-add-po-line" class="btn btn-secondary btn-sm">+ Add Line Item</button>
            </div>
            <div id="po-lines-container" class="order-items-builder">
              <!-- Item rows injected here -->
            </div>
          </div>

          <div class="form-group col-span-2 po-summary-card">
            <div class="flex-between">
              <span>Total Estimated PO Capital:</span>
              <span id="po-total-calc" class="font-bold text-accent text-lg">$0.00</span>
            </div>
          </div>

          <div class="form-group col-span-2">
            <label>Special Shipping Instructions / Notes</label>
            <textarea name="notes" rows="2" placeholder="e.g. Deliver between 08:00 - 15:00 at Receiving Dock 3"></textarea>
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
        row.innerHTML = `
          <div class="form-group flex-1">
            <select class="po-item-prod" required>
              ${products
                .map((p) => `<option value="${p.id}" data-cost="${p.costPrice}" ${selectedProdId === p.id ? "selected" : ""}>${p.name} (${p.sku}) - $${p.costPrice.toFixed(2)}</option>`)
                .join("")}
            </select>
          </div>
          <div class="form-group" style="width: 110px;">
            <input type="number" class="po-item-qty" min="1" value="${qty}" placeholder="Qty" required />
          </div>
          <div class="form-group" style="width: 120px;">
            <input type="number" step="0.01" class="po-item-cost" placeholder="Unit Cost" required />
          </div>
          <button type="button" class="btn-icon btn-remove-line" title="Remove line">&times;</button>
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
    });
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

          <div class="form-group col-span-2">
            <label>Select Product to Transfer *</label>
            <select id="trf-product" required>
              ${products.map((p) => `<option value="${p.id}">${p.name} (${p.sku})</option>`).join("")}
            </select>
          </div>

          <div class="form-group">
            <label>Transfer Quantity *</label>
            <input type="number" id="trf-qty" min="1" value="20" required />
          </div>

          <div class="form-group">
            <label>Stock at Origin Available</label>
            <div id="origin-stock-indicator" class="stat-pill">
              <span class="value text-accent font-bold">Checking...</span>
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
        originStockIndicator.textContent = `${available} Units Available (OnHand: ${onHand})`;
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

          <div class="form-group col-span-2">
            <label>Order Item *</label>
            <select id="order-prod" required>
              ${products.map((p) => `<option value="${p.id}">${p.name} ($${p.sellingPrice.toFixed(2)})</option>`).join("")}
            </select>
          </div>

          <div class="form-group">
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
            <div class="slip-brand">RIMS LOGISTICS CORP</div>
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
            <div class="font-bold">${order.customer.name}</div>
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
            Thank you for your order! For returns and RMA queries, visit <strong>returns.rims-retail.com</strong> with your order # ${order.orderNumber}.
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
    });
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

      <div class="scanner-container">
        <div class="scanner-screen">
          <div class="laser-beam"></div>
          <div class="scanner-status" id="scan-feedback">READY - AIM SCANNER AT BARCODE</div>
        </div>

        <div class="scanner-input-bar">
          <input type="text" id="manual-barcode-input" placeholder="Type or click barcode below (e.g. 8901234567890)" />
          <button type="button" id="btn-trigger-scan" class="btn btn-primary">Scan</button>
        </div>

        <div class="quick-barcode-list">
          <div class="text-xs text-muted" style="margin-bottom: 6px;">QUICK SCAN DEMO BARCODES:</div>
          <div class="barcode-pills">
            ${products
              .slice(0, 6)
              .map(
                (p) =>
                  `<button type="button" class="barcode-pill" data-barcode="${p.barcode}" data-sku="${p.sku}">
                    <span class="font-mono">${p.barcode}</span>
                    <span class="text-xs text-muted">(${p.sku})</span>
                  </button>`
              )
              .join("")}
          </div>
        </div>

        <div id="scanner-result" class="scanner-result-card" style="display: none;">
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

  // --- Authentication & Login Modal ---
  openLoginModal() {
    const content = `
      <div class="modal-header">
        <div class="flex-align-center gap-3">
          <div class="login-brand-icon">
            <i data-lucide="shield-check"></i>
          </div>
          <div>
            <h3>RIMS Enterprise Sign In</h3>
            <p class="text-muted text-sm">Authenticate your session to access authorized inventory operations</p>
          </div>
        </div>
        <button type="button" class="btn-icon btn-modal-close">&times;</button>
      </div>

      <div class="login-modal-body">
        <!-- Quick Role Selector Cards -->
        <div class="quick-login-section">
          <label class="section-micro-label">Quick Sign In as Pre-Configured Role:</label>
          <div class="quick-roles-grid">
            <button type="button" class="quick-role-btn active-admin" data-email="admin@retailhub.in" data-role="Admin">
              <span class="role-icon">👑</span>
              <div class="role-text">
                <span class="role-title">System Admin</span>
                <span class="role-user">Aarav Sharma</span>
              </div>
            </button>
            <button type="button" class="quick-role-btn" data-email="inventory@retailhub.in" data-role="Inventory Manager">
              <span class="role-icon">📦</span>
              <div class="role-text">
                <span class="role-title">Inventory Mgr</span>
                <span class="role-user">Priya Patel</span>
              </div>
            </button>
            <button type="button" class="quick-role-btn" data-email="sales@retailhub.in" data-role="Sales Manager">
              <span class="role-icon">💼</span>
              <div class="role-text">
                <span class="role-title">Sales Lead</span>
                <span class="role-user">Rohan Verma</span>
              </div>
            </button>
            <button type="button" class="quick-role-btn" data-email="supplier@retailhub.in" data-role="Supplier Manager">
              <span class="role-icon">🚚</span>
              <div class="role-text">
                <span class="role-title">Supplier Mgr</span>
                <span class="role-user">Ananya Iyer</span>
              </div>
            </button>
          </div>
        </div>

        <div class="login-divider">
          <span>OR ENTER CREDENTIALS</span>
        </div>

        <form id="form-login" class="modal-form">
          <div id="login-error-alert" class="alert-box alert-danger" style="display: none;">
            <i data-lucide="alert-circle"></i>
            <span id="login-error-text">Invalid email or password</span>
          </div>

          <div class="form-group">
            <label for="login-email">Email Address</label>
            <div class="input-with-icon">
              <i data-lucide="mail"></i>
              <input type="email" id="login-email" name="email" required placeholder="admin@retailhub.in" value="admin@retailhub.in" autocomplete="username" />
            </div>
          </div>

          <div class="form-group">
            <label for="login-password">Password</label>
            <div class="input-with-icon">
              <i data-lucide="lock"></i>
              <input type="password" id="login-password" name="password" required placeholder="••••••••" value="Password123!" autocomplete="current-password" />
              <button type="button" id="btn-toggle-pwd" class="btn-icon-inside" title="Show/Hide Password">
                <i data-lucide="eye" id="pwd-icon"></i>
              </button>
            </div>
          </div>

          <div class="login-features-info">
            <div class="feature-item">
              <i data-lucide="check-circle-2"></i>
              <span>JWT Bearer Token Authentication</span>
            </div>
            <div class="feature-item">
              <i data-lucide="check-circle-2"></i>
              <span>PostgreSQL 18 RBAC Authorization</span>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-ghost btn-modal-close">Cancel</button>
            <button type="submit" id="btn-submit-login" class="btn btn-primary">
              <i data-lucide="log-in"></i>
              <span id="submit-login-text">Sign In as Admin</span>
            </button>
          </div>
        </form>
      </div>
    `;

    this.open(content, (dialog) => {
      const form = dialog.querySelector("#form-login");
      const emailInput = dialog.querySelector("#login-email");
      const pwdInput = dialog.querySelector("#login-password");
      const togglePwd = dialog.querySelector("#btn-toggle-pwd");
      const pwdIcon = dialog.querySelector("#pwd-icon");
      const errorBox = dialog.querySelector("#login-error-alert");
      const errorText = dialog.querySelector("#login-error-text");
      const submitBtn = dialog.querySelector("#btn-submit-login");
      const submitText = dialog.querySelector("#submit-login-text");
      const quickBtns = dialog.querySelectorAll(".quick-role-btn");

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

      // Quick role autofill
      quickBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          quickBtns.forEach((b) => b.classList.remove("active-admin"));
          btn.classList.add("active-admin");
          const email = btn.dataset.email;
          const role = btn.dataset.role;
          emailInput.value = email;
          pwdInput.value = "Password123!";
          submitText.textContent = `Sign In as ${role}`;
        });
      });

      emailInput.addEventListener("input", () => {
        submitText.textContent = "Sign In";
      });

      // Submit handler
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorBox.style.display = "none";
        submitBtn.disabled = true;
        submitText.textContent = "Authenticating...";

        const email = emailInput.value.trim();
        const password = pwdInput.value;

        const result = await store.login(email, password);

        if (result.success) {
          this.close();
          toast.success(`Welcome back, ${result.user.name}! Authenticated as [${result.user.role}].`);
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.8 }
            });
          } catch (err) {}
        } else {
          errorBox.style.display = "flex";
          errorText.textContent = result.message || "Invalid credentials.";
          submitBtn.disabled = false;
          submitText.textContent = "Sign In";
          if (window.lucide) window.lucide.createIcons({ root: errorBox });
        }
      });
    });
  }
}

export const modals = new ModalManager();
