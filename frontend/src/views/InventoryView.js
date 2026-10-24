import { store } from "../state/store.js";
import { modals } from "../components/modals/ModalManager.js";
import { toast } from "../components/toast/Toast.js";

// Persistent View Filter State
let selectedWarehouse = "All";
let selectedStockHealth = "All"; // "All" | "InStock" | "LowStock" | "OutOfStock"
let selectedCategory = "All";
let searchQuery = "";
let sortBy = "atp-asc"; // "atp-asc" | "atp-desc" | "soh-desc" | "value-desc" | "name" | "sku"

export function renderInventoryView() {
  const stockRecords = store.getStock();
  const products = store.getProducts();
  const warehouses = store.getWarehouses();

  // Compute Network-Wide Aggregates
  let totalSoh = 0;
  let totalReserved = 0;
  let totalAtp = 0;
  let totalAssetValuation = 0;
  let criticalAlertsCount = 0;
  const occupiedBins = new Set();

  stockRecords.forEach((record) => {
    const product = products.find((p) => p.id === record.productId);
    const onHand = record.onHand || 0;
    const reserved = record.reserved || 0;
    const atp = Math.max(0, onHand - reserved);
    const costPrice = product ? product.costPrice : 0;
    const rPoint = product ? product.reorderPoint : 10;

    totalSoh += onHand;
    totalReserved += reserved;
    totalAtp += atp;
    totalAssetValuation += onHand * costPrice;
    if (record.bin) occupiedBins.add(`${record.warehouseId}-${record.bin}`);
    if (atp <= rPoint || onHand === 0) criticalAlertsCount++;
  });

  // Extract unique categories and warehouses for filter options
  const categories = ["All", ...new Set(products.map((p) => p.category))];

  // Filter records
  let filteredRecords = stockRecords.filter((record) => {
    const product = products.find((p) => p.id === record.productId);
    const warehouse = warehouses.find((w) => w.id === record.warehouseId);
    if (!product) return false;

    // Warehouse Filter
    if (selectedWarehouse !== "All" && record.warehouseId !== selectedWarehouse) {
      return false;
    }

    // Category Filter
    if (selectedCategory !== "All" && product.category !== selectedCategory) {
      return false;
    }

    // Stock Health Filter
    const onHand = record.onHand || 0;
    const reserved = record.reserved || 0;
    const atp = Math.max(0, onHand - reserved);
    const rPoint = product.reorderPoint || 10;

    if (selectedStockHealth === "InStock" && atp <= rPoint) return false;
    if (selectedStockHealth === "LowStock" && (atp > rPoint || atp === 0)) return false;
    if (selectedStockHealth === "OutOfStock" && atp > 0 && onHand > 0) return false;

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchSku = product.sku.toLowerCase().includes(q);
      const matchBarcode = product.barcode ? product.barcode.includes(q) : false;
      const matchBin = record.bin ? record.bin.toLowerCase().includes(q) : false;
      const matchBatch = record.batch ? record.batch.toLowerCase().includes(q) : false;
      const matchWhName = warehouse ? warehouse.name.toLowerCase().includes(q) : false;
      const matchWhCode = warehouse ? warehouse.code.toLowerCase().includes(q) : false;

      if (!matchName && !matchSku && !matchBarcode && !matchBin && !matchBatch && !matchWhName && !matchWhCode) {
        return false;
      }
    }

    return true;
  });

  // Sort filtered records
  filteredRecords.sort((a, b) => {
    const prodA = products.find((p) => p.id === a.productId);
    const prodB = products.find((p) => p.id === b.productId);
    const atpA = Math.max(0, (a.onHand || 0) - (a.reserved || 0));
    const atpB = Math.max(0, (b.onHand || 0) - (b.reserved || 0));
    const valA = (a.onHand || 0) * (prodA?.costPrice || 0);
    const valB = (b.onHand || 0) * (prodB?.costPrice || 0);

    if (sortBy === "atp-asc") return atpA - atpB;
    if (sortBy === "atp-desc") return atpB - atpA;
    if (sortBy === "soh-desc") return (b.onHand || 0) - (a.onHand || 0);
    if (sortBy === "value-desc") return valB - valA;
    if (sortBy === "name") return (prodA?.name || "").localeCompare(prodB?.name || "");
    if (sortBy === "sku") return (prodA?.sku || "").localeCompare(prodB?.sku || "");
    return 0;
  });

  return `
    <div class="view-container animate-fade-in" id="inventory-view-root">
      <!-- Semantic View Header -->
      <header class="view-header flex-between flex-wrap gap-sm">
        <div>
          <div class="flex-center gap-xs" style="justify-content: flex-start; margin-bottom: 6px;">
            <span class="badge badge-accent font-mono"><i data-lucide="boxes" aria-hidden="true"></i> Inventory Ledger</span>
            <span class="badge badge-subtle">3D Bin Topology</span>
            <span class="badge badge-success">Atomic ATP Balances</span>
            <span class="badge badge-info">OCC Concurrency Verified</span>
          </div>
          <h1 class="view-title">Multi-Warehouse Stock Balances & Inventory Ledger</h1>
          <p class="view-subtitle">Physical unit on-hand balances, reserved stock, real-time Available to Promise (ATP), spatial bin addresses, and cycle count variance reconciliation.</p>
        </div>
        <div class="header-actions">
          <button type="button" id="btn-export-inventory-csv" class="btn btn-secondary btn-sm" title="Export Stock Balances as CSV">
            <i data-lucide="download" aria-hidden="true"></i>
            <span>Export Ledger CSV</span>
          </button>
          <button type="button" id="btn-open-cycle-count-modal" class="btn btn-primary btn-sm" title="Reconcile physical stock count">
            <i data-lucide="scale" aria-hidden="true"></i>
            <span>Cycle Count Adjustment</span>
          </button>
        </div>
      </header>

      <!-- Semantic Inventory Top KPI Metric Cards Section -->
      <section class="charter-kpis-grid" style="margin-bottom: 24px;" aria-label="Inventory Health Metrics">
        <article class="charter-kpi-card" role="region" aria-label="Total Units On Hand">
          <header class="charter-kpi-label">
            <i data-lucide="package" class="text-accent" aria-hidden="true"></i>
            <h2 class="text-xs font-bold" style="display: inline; margin: 0;">Total Units On Hand (SOH)</h2>
          </header>
          <p class="charter-kpi-val text-main font-mono">${totalSoh.toLocaleString()}</p>
          <footer class="charter-kpi-delta text-xs text-muted">
            Physical inventory units across ${warehouses.length} active distribution hubs
          </footer>
        </article>

        <article class="charter-kpi-card" role="region" aria-label="Committed or Reserved Units">
          <header class="charter-kpi-label">
            <i data-lucide="lock" class="text-warning" aria-hidden="true"></i>
            <h2 class="text-xs font-bold" style="display: inline; margin: 0;">Committed / Reserved Units</h2>
          </header>
          <p class="charter-kpi-val text-warning font-mono">${totalReserved.toLocaleString()}</p>
          <footer class="charter-kpi-delta text-xs text-muted">
            Allocated to unfulfilled customer sales orders & wave pick lists
          </footer>
        </article>

        <article class="charter-kpi-card" role="region" aria-label="Available to Promise">
          <header class="charter-kpi-label">
            <i data-lucide="check-circle" class="text-success" aria-hidden="true"></i>
            <h2 class="text-xs font-bold" style="display: inline; margin: 0;">Available to Promise (ATP)</h2>
          </header>
          <p class="charter-kpi-val text-success font-mono">${totalAtp.toLocaleString()}</p>
          <footer class="charter-kpi-delta text-xs text-muted">
            SOH minus Reserved units uncommitted and available for instant order booking
          </footer>
        </article>

        <article class="charter-kpi-card" role="region" aria-label="Total Inventory Asset Value">
          <header class="charter-kpi-label">
            <i data-lucide="dollar-sign" class="text-primary" aria-hidden="true"></i>
            <h2 class="text-xs font-bold" style="display: inline; margin: 0;">Total Inventory Asset Value</h2>
          </header>
          <p class="charter-kpi-val text-accent font-mono">$${totalAssetValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <footer class="charter-kpi-delta text-xs text-muted">
            Valuation basis at cost across ${occupiedBins.size} active warehouse storage bins
          </footer>
        </article>
      </section>

      <!-- Semantic Filters & Search Toolbar Navigation -->
      <nav class="toolbar-card" style="margin-bottom: 24px;" aria-label="Inventory search and filters">
        <div class="search-input-wrapper">
          <i data-lucide="search" class="search-icon" aria-hidden="true"></i>
          <label for="inventory-search" class="sr-only">Search Inventory</label>
          <input type="search" id="inventory-search" placeholder="Search by SKU, Product Name, Barcode, Bin (e.g. A-01-01), Lot..." value="${searchQuery}" autocomplete="off" />
          ${searchQuery ? `<button id="btn-clear-inventory-search" class="btn-clear-text">&times;</button>` : ""}
        </div>

        <div class="toolbar-controls flex-wrap gap-sm">
          <!-- Warehouse Filter -->
          <div class="select-wrapper">
            <label class="text-xs text-muted font-semibold">Warehouse Hub:</label>
            <select id="select-inv-warehouse">
              <option value="All" ${selectedWarehouse === "All" ? "selected" : ""}>All Distribution Hubs (${warehouses.length})</option>
              ${warehouses
                .map(
                  (wh) => `
                <option value="${wh.id}" ${selectedWarehouse === wh.id ? "selected" : ""}>
                  ${wh.name} (${wh.code || wh.id})
                </option>
              `
                )
                .join("")}
            </select>
          </div>

          <!-- Stock Health Filter -->
          <div class="select-wrapper">
            <label class="text-xs text-muted font-semibold">Stock Health:</label>
            <select id="select-inv-health">
              <option value="All" ${selectedStockHealth === "All" ? "selected" : ""}>All Stock Levels</option>
              <option value="InStock" ${selectedStockHealth === "InStock" ? "selected" : ""}>Healthy (ATP &gt; ROP)</option>
              <option value="LowStock" ${selectedStockHealth === "LowStock" ? "selected" : ""}>Low Stock Warning (ATP &le; ROP)</option>
              <option value="OutOfStock" ${selectedStockHealth === "OutOfStock" ? "selected" : ""}>Critical / Out of Stock</option>
            </select>
          </div>

          <!-- Category Filter -->
          <div class="select-wrapper">
            <label class="text-xs text-muted font-semibold">Category:</label>
            <select id="select-inv-category">
              ${categories
                .map(
                  (c) => `
                <option value="${c}" ${selectedCategory === c ? "selected" : ""}>${c}</option>
              `
                )
                .join("")}
            </select>
          </div>

          <!-- Sort Filter -->
          <div class="select-wrapper">
            <label class="text-xs text-muted font-semibold">Sort By:</label>
            <select id="select-inv-sort">
              <option value="atp-asc" ${sortBy === "atp-asc" ? "selected" : ""}>ATP: Low to High (Stockout Priority)</option>
              <option value="atp-desc" ${sortBy === "atp-desc" ? "selected" : ""}>ATP: High to Low</option>
              <option value="soh-desc" ${sortBy === "soh-desc" ? "selected" : ""}>Total SOH: High to Low</option>
              <option value="value-desc" ${sortBy === "value-desc" ? "selected" : ""}>Asset Value: High to Low</option>
              <option value="sku" ${sortBy === "sku" ? "selected" : ""}>SKU Identifier (A-Z)</option>
              <option value="name" ${sortBy === "name" ? "selected" : ""}>Product Name (A-Z)</option>
            </select>
          </div>

          ${
            selectedWarehouse !== "All" || selectedStockHealth !== "All" || selectedCategory !== "All" || searchQuery.trim()
              ? `
            <button id="btn-reset-inv-filters" class="btn btn-secondary btn-sm" title="Reset all search filters">
              <i data-lucide="rotate-ccw"></i>
              <span>Reset</span>
            </button>
          `
              : ""
          }
        </div>
      </nav>

      <!-- Semantic Stock Balances Table Card Section -->
      <section class="content-card" aria-label="Physical Stock Balances Ledger">
        <header class="card-header flex-between flex-wrap gap-sm" style="margin-bottom: 16px;">
          <div>
            <h2 class="card-title">Physical Stock Balances Ledger</h2>
            <p class="card-subtitle text-xs text-muted">Showing ${filteredRecords.length} of ${stockRecords.length} inventory records &bull; Invariant: ATP = SOH - Reserved &ge; 0</p>
          </div>
          <div class="flex-center gap-xs">
            ${criticalAlertsCount > 0 ? `<span class="badge badge-danger"><i data-lucide="alert-triangle" aria-hidden="true"></i> ${criticalAlertsCount} Reorder Alerts</span>` : `<span class="badge badge-success"><i data-lucide="check" aria-hidden="true"></i> All Items Stocked</span>`}
          </div>
        </header>

        <div class="table-container">
          <table class="data-table" id="inventory-stock-table" role="table">
            <thead>
              <tr>
                <th scope="col">Product & SKU</th>
                <th scope="col">Warehouse Facility</th>
                <th scope="col">Spatial Bin Address</th>
                <th scope="col" class="text-right">On Hand (SOH)</th>
                <th scope="col" class="text-right">Reserved (RES)</th>
                <th scope="col" class="text-right">Available (ATP)</th>
                <th scope="col" class="text-center">ROP Status</th>
                <th scope="col" class="text-right">Total Valuation ($)</th>
                <th scope="col">Batch / Lot</th>
                <th scope="col" class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${
                filteredRecords.length === 0
                  ? `
                <tr>
                  <td colspan="10" style="text-align: center; padding: 48px;">
                    <i data-lucide="search-x" style="width: 36px; height: 36px; color: var(--text-dim); margin-bottom: 8px;"></i>
                    <h4 style="font-weight: 700; color: var(--text-main);">No stock records match current filters</h4>
                    <p class="text-xs text-muted" style="margin-top: 4px;">Try changing the warehouse hub, clearing the search query, or resetting filters.</p>
                  </td>
                </tr>
              `
                  : filteredRecords
                      .map((record) => {
                        const product = products.find((p) => p.id === record.productId);
                        const warehouse = warehouses.find((w) => w.id === record.warehouseId);
                        const onHand = record.onHand || 0;
                        const reserved = record.reserved || 0;
                        const atp = Math.max(0, onHand - reserved);
                        const costPrice = product ? product.costPrice : 0;
                        const totalVal = (onHand * costPrice).toFixed(2);
                        const rPoint = product ? product.reorderPoint : 10;

                        const isOutOfStock = onHand === 0 || atp === 0;
                        const isBelowRop = atp <= rPoint;

                        return `
                    <tr class="${isOutOfStock ? "bg-danger-subtle" : isBelowRop ? "bg-warning-subtle" : ""}">
                      <td>
                        <div class="font-mono font-bold text-accent" style="font-size: 0.85rem;">${product?.sku || record.productId}</div>
                        <div class="font-semibold text-main text-sm" style="margin-top: 2px;">${product?.name || "Unknown Item"}</div>
                        <span class="badge badge-subtle text-xs" style="margin-top: 4px;">${product?.category || "General"}</span>
                      </td>
                      <td>
                        <div class="font-bold text-main">${warehouse?.name || record.warehouseId}</div>
                        <div class="text-xs text-muted font-mono">${warehouse?.code || record.warehouseId} &bull; ${warehouse?.location || "US Metro Hub"}</div>
                      </td>
                      <td>
                        <span class="badge badge-subtle font-mono font-bold" title="Spatial Bin Coordinate: Zone-Aisle-Shelf-Bin">
                          <i data-lucide="map-pin" style="width: 12px; height: 12px;"></i>
                          ${record.bin || "A-01-01"}
                        </span>
                      </td>
                      <td class="text-right font-mono font-bold text-main" style="font-size: 0.95rem;">
                        ${onHand.toLocaleString()}
                      </td>
                      <td class="text-right font-mono text-warning font-semibold">
                        ${reserved.toLocaleString()}
                      </td>
                      <td class="text-right font-mono font-bold" style="font-size: 1rem;">
                        <span class="${isOutOfStock ? "text-danger" : isBelowRop ? "text-warning" : "text-success"}">
                          ${atp.toLocaleString()}
                        </span>
                      </td>
                      <td class="text-center">
                        ${
                          isOutOfStock
                            ? `<span class="badge badge-danger">Out of Stock</span>`
                            : isBelowRop
                            ? `<span class="badge badge-warning" title="Trigger Reorder (ATP <= ${rPoint} ROP)">Below ROP (${rPoint})</span>`
                            : `<span class="badge badge-success">Healthy (&gt; ${rPoint})</span>`
                        }
                      </td>
                      <td class="text-right font-mono">
                        <div class="font-bold text-main">$${parseFloat(totalVal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div class="text-xs text-muted font-mono">@ $${costPrice.toFixed(2)}/u</div>
                      </td>
                      <td>
                        <span class="badge badge-subtle font-mono text-xs">${record.batch || "LOT-2026-N1"}</span>
                      </td>
                      <td class="text-right">
                        <div class="flex-center gap-xs" style="justify-content: flex-end;">
                          <button type="button" class="btn btn-secondary btn-xs btn-row-cycle-count" data-product-id="${record.productId}" data-wh-id="${record.warehouseId}" data-bin="${record.bin || "A-01-01"}" title="Perform cycle count adjustment on this bin">
                            <i data-lucide="scale"></i>
                            <span>Adjust</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                      })
                      .join("")
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

export function setupInventoryEvents(onRefresh) {
  // Real-time Search Input (Focus preserved!)
  const searchInput = document.getElementById("inventory-search");
  const clearSearchBtn = document.getElementById("btn-clear-inventory-search");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      onRefresh();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      searchQuery = "";
      onRefresh();
    });
  }

  // Filter selects
  const whSelect = document.getElementById("select-inv-warehouse");
  if (whSelect) {
    whSelect.addEventListener("change", (e) => {
      selectedWarehouse = e.target.value;
      onRefresh();
    });
  }

  const healthSelect = document.getElementById("select-inv-health");
  if (healthSelect) {
    healthSelect.addEventListener("change", (e) => {
      selectedStockHealth = e.target.value;
      onRefresh();
    });
  }

  const catSelect = document.getElementById("select-inv-category");
  if (catSelect) {
    catSelect.addEventListener("change", (e) => {
      selectedCategory = e.target.value;
      onRefresh();
    });
  }

  const sortSelect = document.getElementById("select-inv-sort");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      sortBy = e.target.value;
      onRefresh();
    });
  }

  const resetBtn = document.getElementById("btn-reset-inv-filters");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      selectedWarehouse = "All";
      selectedStockHealth = "All";
      selectedCategory = "All";
      searchQuery = "";
      sortBy = "atp-asc";
      onRefresh();
    });
  }

  // Row-level cycle count adjustment buttons
  document.querySelectorAll(".btn-row-cycle-count").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const prodId = e.currentTarget.dataset.productId;
      const whId = e.currentTarget.dataset.whId;
      const bin = e.currentTarget.dataset.bin;
      modals.openCycleCountModal(prodId, whId, bin);
    });
  });

  // Global cycle count adjustment button in header
  const headerCycleBtn = document.getElementById("btn-open-cycle-count-modal");
  if (headerCycleBtn) {
    headerCycleBtn.addEventListener("click", () => {
      const stock = store.getStock();
      if (stock.length > 0) {
        // Default to first stock record or lowest ATP item
        const lowestAtp = [...stock].sort((a, b) => (a.onHand - a.reserved) - (b.onHand - b.reserved))[0];
        modals.openCycleCountModal(lowestAtp.productId, lowestAtp.warehouseId, lowestAtp.bin || "A-01-01");
      } else {
        toast.info("No stock records registered to reconcile.");
      }
    });
  }

  // Export CSV
  const exportCsvBtn = document.getElementById("btn-export-inventory-csv");
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", () => {
      const stockRecords = store.getStock();
      const products = store.getProducts();
      const warehouses = store.getWarehouses();

      let csv = "SKU,Product Name,Category,Warehouse Code,Warehouse Name,Bin Address,Stock On Hand (SOH),Reserved (RES),Available to Promise (ATP),Reorder Point (ROP),Cost Price,Asset Valuation,Batch Lot\n";

      stockRecords.forEach((r) => {
        const prod = products.find((p) => p.id === r.productId);
        const wh = warehouses.find((w) => w.id === r.warehouseId);
        const atp = Math.max(0, (r.onHand || 0) - (r.reserved || 0));
        const cost = prod ? prod.costPrice : 0;
        const val = (r.onHand || 0) * cost;

        csv += `"${prod?.sku || r.productId}","${prod?.name || ""}","${prod?.category || ""}","${wh?.code || r.warehouseId}","${wh?.name || ""}","${r.bin || "A-01-01"}",${r.onHand || 0},${r.reserved || 0},${atp},${prod?.reorderPoint || 10},${cost.toFixed(2)},${val.toFixed(2)},"${r.batch || ""}"\n`;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Stockora_Stock_Balances_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Stock balances exported to CSV!");
    });
  }
}
