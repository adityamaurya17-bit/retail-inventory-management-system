import { store } from "../state/store.js";
import { modals } from "../components/modals/ModalManager.js";
import { toast } from "../components/toast/Toast.js";

let poStatusFilter = "All";
let poSearchText = "";

/**
 * Enterprise Purchase Orders Management Module
 */
export function renderPurchaseOrdersView() {
  const allPOs = store.getPurchaseOrders();
  const suppliers = store.getSuppliers();
  const warehouses = store.getWarehouses();
  const products = store.getProducts();

  // Metrics
  const totalPOs = allPOs.length;
  const approvedPOs = allPOs.filter((p) => p.status === "Approved" || p.status === "Sent to Vendor").length;
  const receivedPOs = allPOs.filter((p) => p.status === "Received").length;
  const totalSpend = allPOs.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  // Filter
  const filtered = allPOs.filter((po) => {
    if (poStatusFilter !== "All" && po.status !== poStatusFilter) return false;
    if (poSearchText.trim()) {
      const q = poSearchText.toLowerCase();
      const sup = suppliers.find((s) => s.id === po.supplierId);
      const wh = warehouses.find((w) => w.id === po.warehouseId);
      const matchNum = po.poNumber.toLowerCase().includes(q);
      const matchSup = sup?.name.toLowerCase().includes(q);
      const matchWh = wh?.name.toLowerCase().includes(q);
      if (!matchNum && !matchSup && !matchWh) return false;
    }
    return true;
  });

  return `
    <div class="view-container animate-fade-in" id="purchase-orders-root">
      <!-- Semantic View Header -->
      <header class="view-header flex-between flex-wrap gap-sm">
        <div>
          <h1 class="view-title">Purchase Orders & Inbound Procurement</h1>
          <p class="view-subtitle">Issue vendor replenishment orders, manage procure-to-pay pipelines, and verify inbound dock receipts (GRN)</p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn btn-primary btn-sm" id="btn-create-po-view">
            <i data-lucide="file-plus"></i>
            <span>Issue Purchase Order</span>
          </button>
        </div>
      </header>

      <!-- Semantic Procurement KPIs -->
      <section class="stats-grid" aria-label="Procurement Performance Metrics">
        <article class="stat-card" role="region" aria-label="Total Purchase Orders">
          <header class="stat-card-header flex-between">
            <h2 class="stat-label">Total Purchase Orders</h2>
            <div class="stat-icon-wrap icon-primary" aria-hidden="true"><i data-lucide="file-text"></i></div>
          </header>
          <p class="stat-value font-mono">${totalPOs}</p>
          <footer class="stat-trend text-muted text-xxs">Procure-to-pay ledger</footer>
        </article>

        <article class="stat-card" role="region" aria-label="In Transit or Approved Orders">
          <header class="stat-card-header flex-between">
            <h2 class="stat-label">In Transit / Approved</h2>
            <div class="stat-icon-wrap icon-warning" aria-hidden="true"><i data-lucide="truck"></i></div>
          </header>
          <p class="stat-value font-mono" style="color: var(--color-warning);">${approvedPOs}</p>
          <footer class="stat-trend text-warning text-xxs font-semibold">Replenishment en route</footer>
        </article>

        <article class="stat-card" role="region" aria-label="Received and Stocked Orders">
          <header class="stat-card-header flex-between">
            <h2 class="stat-label">Received & Stocked</h2>
            <div class="stat-icon-wrap icon-success" aria-hidden="true"><i data-lucide="check-circle-2"></i></div>
          </header>
          <p class="stat-value font-mono" style="color: var(--color-success);">${receivedPOs}</p>
          <footer class="stat-trend text-success text-xxs font-semibold">GRN completed</footer>
        </article>

        <article class="stat-card" role="region" aria-label="Total Procurement Value">
          <header class="stat-card-header flex-between">
            <h2 class="stat-label">Total Procurement Value</h2>
            <div class="stat-icon-wrap icon-accent" aria-hidden="true"><i data-lucide="dollar-sign"></i></div>
          </header>
          <p class="stat-value font-mono">$${totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <footer class="stat-trend text-muted text-xxs">Committed vendor spend</footer>
        </article>
      </section>

      <!-- Semantic Controls Toolbar -->
      <nav class="toolbar-card flex-between flex-wrap gap-sm" aria-label="Purchase Orders Search and Filters">
        <div class="search-input-wrapper" style="flex: 1; max-width: 380px;">
          <i data-lucide="search" class="search-icon" aria-hidden="true"></i>
          <label for="po-search-input" class="sr-only">Search Purchase Orders</label>
          <input type="search" id="po-search-input" placeholder="Search PO #, supplier, or warehouse..." value="${poSearchText}" />
        </div>

        <fieldset class="filter-chips" role="group" aria-label="Filter orders by status">
          ${["All", "Approved", "Sent to Vendor", "Received", "Draft"]
            .map(
              (st) => `
            <button type="button" class="chip-btn ${poStatusFilter === st ? "active" : ""}" data-status="${st}" aria-pressed="${poStatusFilter === st}">
              ${st}
            </button>
          `
            )
            .join("")}
        </fieldset>
      </nav>

      <!-- Purchase Orders Data Table Section -->
      <section class="content-card" aria-label="Purchase Order Master Register">
        <header class="card-header flex-between">
          <div class="flex-align-center gap-xs">
            <i data-lucide="file-check" class="text-primary" aria-hidden="true"></i>
            <h2 class="card-title">Purchase Order Master Register</h2>
          </div>
          <span class="badge badge-subtle font-mono">${filtered.length} Orders</span>
        </header>

        <div class="table-responsive">
          <table class="data-table" role="table">
            <thead>
              <tr>
                <th scope="col">PO Number</th>
                <th scope="col">Supplier / Vendor</th>
                <th scope="col">Receiving Warehouse</th>
                <th scope="col">Order Date</th>
                <th scope="col">Expected Delivery</th>
                <th scope="col">Line Items</th>
                <th scope="col" class="text-right">Total Amount</th>
                <th scope="col">Status</th>
                <th scope="col" class="text-right">Dock Actions</th>
              </tr>
            </thead>
            <tbody>
              ${
                filtered.length === 0
                  ? `
                <tr>
                  <td colspan="9" class="text-center" style="padding: 40px;">
                    <div class="empty-state-box">
                      <i data-lucide="file-x" style="width: 32px; height: 32px; color: var(--text-muted); margin-bottom: 8px;" aria-hidden="true"></i>
                      <div class="font-semibold text-sm">No Purchase Orders Found</div>
                      <div class="text-xs text-muted">No orders match the current filter or search criteria.</div>
                    </div>
                  </td>
                </tr>
              `
                  : filtered
                      .map((po) => {
                        const sup = suppliers.find((s) => s.id === po.supplierId);
                        const wh = warehouses.find((w) => w.id === po.warehouseId);
                        const itemsCount = (po.items || []).reduce((acc, it) => acc + (it.quantity || 0), 0);
                        const isReceived = po.status === "Received";

                        let statusBadge = "badge-subtle";
                        if (po.status === "Received") statusBadge = "badge-success";
                        else if (po.status === "Approved") statusBadge = "badge-primary";
                        else if (po.status === "Sent to Vendor") statusBadge = "badge-warning";

                        return `
                      <tr>
                        <td class="font-mono font-bold text-xs">${po.poNumber}</td>
                        <td>
                          <div class="font-semibold text-xs">${sup?.name || po.supplierId}</div>
                          <div class="text-xxs text-muted">${sup?.city || "Vendor"}</div>
                        </td>
                        <td>
                          <div class="text-xs">${wh?.name || po.warehouseId}</div>
                          <div class="text-xxs text-muted font-mono">${wh?.code || wh?.id}</div>
                        </td>
                        <td class="text-xs text-muted font-mono"><time datetime="${po.orderDate}">${po.orderDate}</time></td>
                        <td class="text-xs text-muted font-mono"><time datetime="${po.expectedDate}">${po.expectedDate}</time></td>
                        <td>
                          <span class="badge badge-subtle font-mono text-xxs">${itemsCount} units (${po.items?.length || 0} SKUs)</span>
                        </td>
                        <td class="text-right font-mono font-bold text-xs">
                          $${(po.totalAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td>
                          <span class="badge ${statusBadge} text-xxs font-bold">${po.status}</span>
                        </td>
                        <td class="text-right">
                          ${
                            !isReceived
                              ? `
                            <button type="button" class="btn btn-secondary btn-xs btn-receive-grn" data-po-id="${po.id}" title="Receive Goods at Dock">
                              <i data-lucide="package-check" class="text-success inline-icon"></i>
                              <span>Receive GRN</span>
                            </button>
                          `
                              : `
                            <span class="text-xxs text-success font-semibold flex-align-center gap-xs justify-end">
                              <i data-lucide="check" class="inline-icon"></i> Stocked
                            </span>
                          `
                          }
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

export function setupPurchaseOrdersEvents(renderApp) {
  const root = document.getElementById("purchase-orders-root");
  if (!root) return;

  // Search input
  const searchInput = root.querySelector("#po-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      poSearchText = e.target.value;
      renderApp();
    });
  }

  // Filter chips
  root.querySelectorAll(".chip-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      poStatusFilter = btn.dataset.status;
      renderApp();
    });
  });

  // Create PO Modal Trigger
  const createBtn = root.querySelector("#btn-create-po-view");
  if (createBtn) {
    createBtn.addEventListener("click", () => {
      modals.openCreatePOModal();
    });
  }

  // Receive GRN Buttons
  root.querySelectorAll(".btn-receive-grn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const poId = btn.dataset.poId;
      modals.openReceiveGRNModal(poId);
    });
  });
}
