import { store } from "../state/store.js";
import { modals } from "../components/modals/ModalManager.js";
import { toast } from "../components/toast/Toast.js";

let selectedCategory = "All";
let selectedStockStatus = "All";
let searchQuery = "";
let sortBy = "name";
let productViewMode = localStorage.getItem("rims_products_view_mode") || "table";

export function renderProductsView() {
  const allProducts = store.getProducts();
  const warehouses = store.getWarehouses();

  // Extract unique categories
  const categories = ["All", ...new Set(allProducts.map((p) => p.category))];

  // Filtering
  let filtered = allProducts.filter((p) => {
    const summary = store.getProductStockSummary(p.id);

    if (selectedCategory !== "All" && p.category !== selectedCategory) return false;

    if (selectedStockStatus === "LowStock" && summary.onHand > p.reorderPoint) return false;
    if (selectedStockStatus === "OutOfStock" && summary.onHand > 0) return false;
    if (selectedStockStatus === "InStock" && summary.onHand <= p.reorderPoint) return false;
    if (selectedStockStatus === "Critical" && (summary.onHand === 0 || summary.onHand > Math.floor(p.reorderPoint * 0.35))) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchBarcode = p.barcode.includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchBarcode && !matchBrand) return false;
    }

    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    const sumA = store.getProductStockSummary(a.id);
    const sumB = store.getProductStockSummary(b.id);

    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "sku") return a.sku.localeCompare(b.sku);
    if (sortBy === "stock-asc") return sumA.onHand - sumB.onHand;
    if (sortBy === "stock-desc") return sumB.onHand - sumA.onHand;
    if (sortBy === "price-desc") return b.sellingPrice - a.sellingPrice;
    if (sortBy === "margin-desc") {
      const marginA = ((a.sellingPrice - a.costPrice) / a.sellingPrice) * 100;
      const marginB = ((b.sellingPrice - b.costPrice) / b.sellingPrice) * 100;
      return marginB - marginA;
    }
    return 0;
  });

  return `
    <div class="view-container animate-fade-in">
      <!-- Semantic View Header -->
      <header class="view-header flex-between flex-wrap gap-sm">
        <div>
          <h1 class="view-title">Product Information Management (PIM)</h1>
          <p class="view-subtitle">Unified catalog, multi-attribute specs, SKU generation & barcode master records</p>
        </div>
        <div class="header-actions">
          <button type="button" id="btn-export-csv" class="btn btn-secondary btn-sm" title="Export CSV spreadsheet">
            <i data-lucide="download" aria-hidden="true"></i>
            <span>Export CSV</span>
          </button>
          <button type="button" id="btn-add-product" class="btn btn-primary btn-sm">
            <i data-lucide="plus-circle" aria-hidden="true"></i>
            <span>Add New Product</span>
          </button>
        </div>
      </header>

      <!-- Semantic Filters & Search Toolbar Navigation -->
      <nav class="toolbar-card" aria-label="Product search and filter controls">
        <div class="search-input-wrapper">
          <i data-lucide="search" class="search-icon" aria-hidden="true"></i>
          <label for="product-search" class="sr-only">Search Products</label>
          <input type="search" id="product-search" placeholder="Search by SKU, Product Name, Barcode, Brand..." value="${searchQuery}" />
          ${searchQuery ? `<button type="button" id="btn-clear-search" class="btn-clear-text">&times;</button>` : ""}
        </div>

        <div class="toolbar-controls">
          <!-- View Mode Toggle: Table / Grid -->
          <div class="view-mode-toggle" id="product-view-mode-toggle" role="group" aria-label="Catalog layout mode">
            <button type="button" class="btn-icon ${productViewMode === "table" ? "active" : ""}" data-mode="table" title="Dense Table View" aria-pressed="${productViewMode === "table"}">
              <i data-lucide="list" aria-hidden="true"></i>
            </button>
            <button type="button" class="btn-icon ${productViewMode === "grid" ? "active" : ""}" data-mode="grid" title="Visual Grid Cards" aria-pressed="${productViewMode === "grid"}">
              <i data-lucide="layout-grid" aria-hidden="true"></i>
            </button>
          </div>

          <div class="select-wrapper">
            <label for="select-stock-filter" class="text-xs text-muted">Stock Status:</label>
            <select id="select-stock-filter">
              <option value="All" ${selectedStockStatus === "All" ? "selected" : ""}>All Stock Levels</option>
              <option value="InStock" ${selectedStockStatus === "InStock" ? "selected" : ""}>In Stock (Safe)</option>
              <option value="LowStock" ${selectedStockStatus === "LowStock" ? "selected" : ""}>Low Stock Alerts</option>
              <option value="Critical" ${selectedStockStatus === "Critical" ? "selected" : ""}>Critical Stock (&le; 35% Reorder)</option>
              <option value="OutOfStock" ${selectedStockStatus === "OutOfStock" ? "selected" : ""}>Out of Stock (Zero)</option>
            </select>
          </div>

          <div class="select-wrapper">
            <label for="select-product-sort" class="text-xs text-muted">Sort By:</label>
            <select id="select-product-sort">
              <option value="name" ${sortBy === "name" ? "selected" : ""}>Product Name (A-Z)</option>
              <option value="sku" ${sortBy === "sku" ? "selected" : ""}>SKU Code</option>
              <option value="stock-desc" ${sortBy === "stock-desc" ? "selected" : ""}>Stock Units (High to Low)</option>
              <option value="stock-asc" ${sortBy === "stock-asc" ? "selected" : ""}>Stock Units (Low to High)</option>
              <option value="price-desc" ${sortBy === "price-desc" ? "selected" : ""}>Selling Price (High to Low)</option>
              <option value="margin-desc" ${sortBy === "margin-desc" ? "selected" : ""}>Gross Margin %</option>
            </select>
          </div>
        </div>
      </nav>

      <!-- Category Filter Pills -->
      <fieldset class="category-pills-bar" role="group" aria-label="Filter by product category">
        ${categories
          .map(
            (cat) => `
          <button type="button" class="pill-btn ${selectedCategory === cat ? "active" : ""}" data-category="${cat}" aria-pressed="${selectedCategory === cat}">
            ${cat}
          </button>
        `
          )
          .join("")}
      </fieldset>

      <!-- Products Display: Dense Table or Grid -->
      ${
        filtered.length === 0
          ? `
          <section class="empty-state-card" aria-label="No matching products found">
            <i data-lucide="package-search" class="empty-icon" aria-hidden="true"></i>
            <h3>No Matching Products Found</h3>
            <p class="text-muted text-sm">No catalog items match your search criteria or category filter.</p>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-reset-filters" style="margin-top: 10px;">
              <i data-lucide="rotate-ccw" aria-hidden="true"></i>
              <span>Reset Filters</span>
            </button>
          </section>
        `
          : productViewMode === "table"
          ? `
          <section class="table-container" aria-label="Product Master Catalog">
            <table class="data-table" role="table">
              <thead>
                <tr>
                  <th scope="col">Product & SKU</th>
                  <th scope="col">Category</th>
                  <th scope="col" class="text-right">Cost Price</th>
                  <th scope="col" class="text-right">Retail Price</th>
                  <th scope="col" class="text-right">Margin %</th>
                  <th scope="col">Stock Health</th>
                  <th scope="col" class="text-right">Available / Total</th>
                  <th scope="col">Regional Stock</th>
                  <th scope="col" class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered
                  .map((p) => {
                    const summary = store.getProductStockSummary(p.id);
                    const marginPct = (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1);
                    const isOut = summary.onHand === 0;
                    const isCritical = summary.onHand > 0 && summary.onHand <= Math.floor(p.reorderPoint * 0.35);
                    const isLow = summary.onHand > Math.floor(p.reorderPoint * 0.35) && summary.onHand <= p.reorderPoint;

                    return `
                      <tr>
                        <td>
                          <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${p.imageUrl}" alt="${p.name}" style="width: 38px; height: 38px; border-radius: var(--radius-sm); object-fit: cover; border: 1px solid var(--border-subtle); flex-shrink: 0;" loading="lazy" />
                            <div>
                              <div class="font-semibold text-main">${p.name}</div>
                              <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                                <span class="code-badge" data-copy="${p.sku}" title="Click to copy SKU" style="cursor: pointer; font-size: 0.7rem; padding: 1px 4px;">
                                  <span class="font-mono">${p.sku}</span>
                                </span>
                                <span class="text-xs text-muted">&bull; ${p.brand}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="badge badge-subtle">${p.category}</span>
                        </td>
                        <td class="text-right font-mono font-medium">$${p.costPrice.toFixed(2)}</td>
                        <td class="text-right font-mono font-bold text-accent">$${p.sellingPrice.toFixed(2)}</td>
                        <td class="text-right font-mono font-semibold ${marginPct < 25 ? "text-danger" : "text-success"}">${marginPct}%</td>
                        <td>
                          ${
                            isOut
                              ? `<span class="badge badge-danger">Out of Stock</span>`
                              : isCritical
                              ? `<span class="badge badge-danger">Critical (${summary.onHand}/${p.reorderPoint})</span>`
                              : isLow
                              ? `<span class="badge badge-warning">Low Stock (${summary.onHand}/${p.reorderPoint})</span>`
                              : `<span class="badge badge-success">In Stock</span>`
                          }
                        </td>
                        <td class="text-right font-mono">
                          <span class="font-bold">${summary.available}</span>
                          <span class="text-muted">/ ${summary.onHand} ${p.unit}</span>
                        </td>
                        <td>
                          <div class="warehouse-presence-pills">
                            ${summary.records
                              .map((r) => {
                                const wh = warehouses.find((w) => w.id === r.warehouseId);
                                return `<span class="wh-pill" title="${wh?.name}: ${r.onHand} units in Bin ${r.bin}">${wh?.city || r.warehouseId}: <strong>${r.onHand}</strong></span>`;
                              })
                              .join("")}
                          </div>
                        </td>
                        <td class="text-right">
                          <div class="row-actions-group">
                            <button type="button" class="btn btn-secondary btn-xs btn-cycle-count" data-id="${p.id}" title="Cycle count & reconcile stock">
                              <i data-lucide="calculator"></i>
                              <span>Count</span>
                            </button>
                            <button type="button" class="btn btn-ghost btn-xs btn-edit-prod" data-id="${p.id}" title="Edit product specifications">
                              <i data-lucide="edit-3"></i>
                            </button>
                            <button type="button" class="btn btn-ghost btn-xs btn-delete-prod" data-id="${p.id}" title="Deactivate SKU">
                              <i data-lucide="trash-2"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  })
                  .join("")}
              </tbody>
            </table>
          </section>
        `
          : `
          <section class="products-grid" aria-label="Product Visual Grid">
            ${filtered
              .map((p) => {
                const summary = store.getProductStockSummary(p.id);
                const marginPct = (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1);
                const isOut = summary.onHand === 0;
                const isCritical = summary.onHand > 0 && summary.onHand <= Math.floor(p.reorderPoint * 0.35);
                const isLow = summary.onHand > Math.floor(p.reorderPoint * 0.35) && summary.onHand <= p.reorderPoint;

                return `
                  <article class="product-card ${isOut ? "border-danger" : isCritical || isLow ? "border-warning" : ""}" role="article" aria-label="${p.name}">
                    <div class="product-img-wrapper">
                      <img src="${p.imageUrl}" alt="${p.name}" loading="lazy" />
                      <div class="product-badge-overlay">
                        ${
                          isOut
                            ? `<span class="badge badge-danger">OUT OF STOCK</span>`
                            : isCritical
                            ? `<span class="badge badge-danger">CRITICAL (${summary.onHand}/${p.reorderPoint})</span>`
                            : isLow
                            ? `<span class="badge badge-warning">LOW STOCK (${summary.onHand}/${p.reorderPoint})</span>`
                            : `<span class="badge badge-success">IN STOCK</span>`
                        }
                      </div>
                    </div>

                    <div class="product-info">
                      <div class="product-meta-header">
                        <span class="badge badge-subtle">${p.category}</span>
                        <span class="text-xs text-muted">${p.brand}</span>
                      </div>

                      <h3 class="product-title" title="${p.name}">${p.name}</h3>

                      <div class="product-codes-row">
                        <div class="code-badge" title="Click to copy SKU" data-copy="${p.sku}">
                          <span class="code-label">SKU:</span>
                          <span class="font-mono">${p.sku}</span>
                        </div>
                        <div class="code-badge" title="EAN-13 Barcode">
                          <span class="code-label">BAR:</span>
                          <span class="font-mono">${p.barcode}</span>
                        </div>
                      </div>

                      <div class="pricing-matrix">
                        <div>
                          <span class="text-xs text-muted">Cost</span>
                          <div class="font-bold">$${p.costPrice.toFixed(2)}</div>
                        </div>
                        <div>
                          <span class="text-xs text-muted">Retail</span>
                          <div class="font-bold text-accent">$${p.sellingPrice.toFixed(2)}</div>
                        </div>
                        <div>
                          <span class="text-xs text-muted">Margin</span>
                          <div class="font-bold ${marginPct < 25 ? "text-danger" : "text-success"}">${marginPct}%</div>
                        </div>
                      </div>

                      <!-- Stock Bar -->
                      <div class="stock-meter-box">
                        <div class="flex-between text-xs" style="margin-bottom: 4px;">
                          <span>On Hand: <strong>${summary.onHand} ${p.unit}</strong></span>
                          <span class="text-muted">Available: <strong>${summary.available}</strong> (Rsv: ${summary.reserved})</span>
                        </div>
                        <div class="progress-bar-container">
                          <div class="progress-bar ${isOut || isCritical ? "bg-danger" : isLow ? "bg-warning" : "bg-success"}" 
                               style="width: ${Math.min(100, Math.round((summary.onHand / p.maxStock) * 100))}%"></div>
                        </div>
                      </div>

                      <!-- Warehouse Breakdown Pills -->
                      <div class="warehouse-presence-pills">
                        ${summary.records
                          .map((r) => {
                            const wh = warehouses.find((w) => w.id === r.warehouseId);
                            return `<span class="wh-pill" title="${wh?.name}: ${r.onHand} units in Bin ${r.bin}">${wh?.city || r.warehouseId}: <strong>${r.onHand}</strong></span>`;
                          })
                          .join("")}
                      </div>

                      <div class="product-actions">
                        <button class="btn btn-ghost btn-sm btn-edit-prod" data-id="${p.id}" title="Edit specs">
                          <i data-lucide="edit-3"></i>
                          <span>Edit</span>
                        </button>
                        <button class="btn btn-secondary btn-sm btn-cycle-count" data-id="${p.id}" title="Cycle count & reconcile stock">
                          <i data-lucide="calculator"></i>
                          <span>Count</span>
                        </button>
                        <button type="button" class="btn btn-ghost btn-sm btn-delete-prod" data-id="${p.id}" title="Delete SKU">
                          <i data-lucide="trash-2"></i>
                        </button>
                      </div>
                    </div>
                  </article>
                `;
              })
              .join("")}
          </section>
        `
      }
    </div>
  `;
}

export function setupProductsEvents(onRefresh) {
  // View Mode Toggle (Table / Grid)
  document.querySelectorAll("#product-view-mode-toggle button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      if (mode && mode !== productViewMode) {
        productViewMode = mode;
        localStorage.setItem("rims_products_view_mode", mode);
        onRefresh();
      }
    });
  });

  // Category Pills
  document.querySelectorAll(".pill-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedCategory = btn.dataset.category;
      onRefresh();
    });
  });

  // Search input
  const searchInput = document.getElementById("product-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      onRefresh();
    });
  }

  const clearSearchBtn = document.getElementById("btn-clear-search");
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      searchQuery = "";
      onRefresh();
    });
  }

  // Reset Filters button
  const resetBtn = document.getElementById("btn-reset-filters");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      selectedCategory = "All";
      selectedStockStatus = "All";
      searchQuery = "";
      onRefresh();
    });
  }

  // Filters
  const stockFilter = document.getElementById("select-stock-filter");
  if (stockFilter) {
    stockFilter.addEventListener("change", (e) => {
      selectedStockStatus = e.target.value;
      onRefresh();
    });
  }

  const sortSelect = document.getElementById("select-product-sort");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      sortBy = e.target.value;
      onRefresh();
    });
  }

  // Add Product Button
  const addBtn = document.getElementById("btn-add-product");
  if (addBtn) addBtn.addEventListener("click", () => modals.openProductModal());

  // Export CSV
  const exportBtn = document.getElementById("btn-export-csv");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const prods = store.getProducts();
      let csv = "ID,SKU,Barcode,Name,Category,Brand,CostPrice,SellingPrice,GrossMarginPercent,ReorderPoint,MaxStock,Unit\n";
      prods.forEach((p) => {
        const margin = (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1);
        csv += `"${p.id}","${p.sku}","${p.barcode}","${p.name.replace(/"/g, '""')}","${p.category}","${p.brand}",${p.costPrice},${p.sellingPrice},${margin}%,${p.reorderPoint},${p.maxStock},"${p.unit}"\n`;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Stockora_Product_Catalog_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Product catalog exported to CSV");
    });
  }

  // Edit buttons
  document.querySelectorAll(".btn-edit-prod").forEach((btn) => {
    btn.addEventListener("click", () => {
      const prod = store.getProduct(btn.dataset.id);
      if (prod) modals.openProductModal(prod);
    });
  });

  // Cycle count
  document.querySelectorAll(".btn-cycle-count").forEach((btn) => {
    btn.addEventListener("click", () => {
      const prod = store.getProduct(btn.dataset.id);
      if (prod) modals.openStockAdjustModal(prod.id, "WH-CHI");
    });
  });

  // Delete buttons
  document.querySelectorAll(".btn-delete-prod").forEach((btn) => {
    btn.addEventListener("click", () => {
      const prod = store.getProduct(btn.dataset.id);
      if (prod && confirm(`Are you sure you want to deactivate and remove SKU ${prod.sku}?`)) {
        store.deleteProduct(prod.id);
        toast.info(`Deleted SKU ${prod.sku}`);
      }
    });
  });

  // Click to copy SKU
  document.querySelectorAll("[data-copy]").forEach((el) => {
    el.addEventListener("click", () => {
      navigator.clipboard.writeText(el.dataset.copy);
      toast.info(`Copied SKU: ${el.dataset.copy}`);
    });
  });
}
