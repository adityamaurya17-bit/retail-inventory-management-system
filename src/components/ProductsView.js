import { store } from "../state/store.js";
import { modals } from "./Modals.js";
import { toast } from "./Toast.js";

let selectedCategory = "All";
let selectedStockStatus = "All";
let searchQuery = "";
let sortBy = "name";

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
      <div class="view-header">
        <div>
          <h1 class="view-title">Product Information Management (PIM)</h1>
          <p class="view-subtitle">Unified catalog, multi-attribute specs, SKU generation & barcode master records</p>
        </div>
        <div class="header-actions">
          <button id="btn-export-csv" class="btn btn-secondary btn-sm" title="Export CSV spreadsheet">
            <i data-lucide="download"></i>
            <span>Export CSV</span>
          </button>
          <button id="btn-add-product" class="btn btn-primary btn-sm">
            <i data-lucide="plus-circle"></i>
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="toolbar-card">
        <div class="search-input-wrapper">
          <i data-lucide="search" class="search-icon"></i>
          <input type="text" id="product-search" placeholder="Search by SKU, Product Name, Barcode, Brand..." value="${searchQuery}" />
          ${searchQuery ? `<button id="btn-clear-search" class="btn-clear-text">&times;</button>` : ""}
        </div>

        <div class="toolbar-controls">
          <div class="select-wrapper">
            <label class="text-xs text-muted">Stock Status:</label>
            <select id="select-stock-filter">
              <option value="All" ${selectedStockStatus === "All" ? "selected" : ""}>All Stock Levels</option>
              <option value="InStock" ${selectedStockStatus === "InStock" ? "selected" : ""}>Healthy (Above Reorder)</option>
              <option value="LowStock" ${selectedStockStatus === "LowStock" ? "selected" : ""}>Low Stock Alerts</option>
              <option value="OutOfStock" ${selectedStockStatus === "OutOfStock" ? "selected" : ""}>Out of Stock (Zero)</option>
            </select>
          </div>

          <div class="select-wrapper">
            <label class="text-xs text-muted">Sort By:</label>
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
      </div>

      <!-- Category Filter Pills -->
      <div class="category-pills-bar">
        ${categories
          .map(
            (cat) => `
          <button class="pill-btn ${selectedCategory === cat ? "active" : ""}" data-category="${cat}">
            ${cat}
          </button>
        `
          )
          .join("")}
      </div>

      <!-- Products Grid -->
      <div class="products-grid">
        ${
          filtered.length === 0
            ? `<div class="empty-state-card col-span-full">
                <i data-lucide="package-search" class="empty-icon"></i>
                <h3>No Matching Products Found</h3>
                <p class="text-muted text-sm">Try broadening your search term or selecting a different category filter.</p>
              </div>`
            : filtered
                .map((p) => {
                  const summary = store.getProductStockSummary(p.id);
                  const marginPct = (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1);
                  const isLow = summary.onHand <= p.reorderPoint && summary.onHand > 0;
                  const isOut = summary.onHand === 0;

                  return `
            <div class="product-card ${isOut ? "border-danger" : isLow ? "border-warning" : ""}">
              <div class="product-img-wrapper">
                <img src="${p.imageUrl}" alt="${p.name}" loading="lazy" />
                <div class="product-badge-overlay">
                  ${
                    isOut
                      ? `<span class="badge badge-danger">OUT OF STOCK</span>`
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
                    <div class="progress-bar ${isOut ? "bg-danger" : isLow ? "bg-warning" : "bg-success"}" 
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
                  <button class="btn btn-ghost btn-sm btn-delete-prod" data-id="${p.id}" title="Delete SKU">
                    <i data-lucide="trash-2"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
                })
                .join("")
        }
      </div>
    </div>
  `;
}

export function setupProductsEvents(onRefresh) {
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
      link.setAttribute("download", `RIMS_Product_Catalog_${new Date().toISOString().split("T")[0]}.csv`);
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
