import { store } from "../state/store.js";
import { modals } from "./Modals.js";
import { Chart } from "chart.js/auto";

export function renderDashboardView() {
  const products = store.getProducts();
  const warehouses = store.getWarehouses();
  const salesOrders = store.getSalesOrders();
  const purchaseOrders = store.getPurchaseOrders();
  const auditLogs = store.getAuditLogs().slice(0, 6);

  let totalCostValuation = 0;
  let totalRetailValuation = 0;
  let totalOnHandUnits = 0;
  let lowStockProducts = [];

  products.forEach((p) => {
    const summary = store.getProductStockSummary(p.id);
    totalOnHandUnits += summary.onHand;
    totalCostValuation += summary.onHand * p.costPrice;
    totalRetailValuation += summary.onHand * p.sellingPrice;

    if (summary.onHand <= p.reorderPoint) {
      lowStockProducts.push({
        ...p,
        currentStock: summary.onHand,
        available: summary.available,
        deficit: p.reorderPoint - summary.onHand
      });
    }
  });

  const grossProfitMargin = totalRetailValuation > 0
    ? (((totalRetailValuation - totalCostValuation) / totalRetailValuation) * 100).toFixed(1)
    : 0;

  const pendingOrders = salesOrders.filter((o) => o.status !== "Delivered").length;
  const activePOs = purchaseOrders.filter((p) => p.status !== "Received").length;

  return `
    <div class="view-container animate-fade-in">
      <div class="view-header">
        <div>
          <h1 class="view-title">Executive Supply Chain Dashboard</h1>
          <p class="view-subtitle">Real-time nationwide inventory valuation, order fulfillment pipeline & warehouse telemetry</p>
        </div>
        <div class="header-actions">
          <button id="btn-quick-new-prod" class="btn btn-primary btn-sm">
            <i data-lucide="plus-circle"></i>
            <span>Add Product</span>
          </button>
          <button id="btn-quick-order" class="btn btn-secondary btn-sm">
            <i data-lucide="shopping-bag"></i>
            <span>Create Order</span>
          </button>
          <button id="btn-quick-po" class="btn btn-secondary btn-sm">
            <i data-lucide="file-plus"></i>
            <span>Issue PO</span>
          </button>
          <button id="btn-quick-transfer" class="btn btn-secondary btn-sm">
            <i data-lucide="truck"></i>
            <span>Transfer Stock</span>
          </button>
        </div>
      </div>

      <!-- KPI Metrics Grid -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Total Inventory Asset Value</span>
            <div class="kpi-icon icon-emerald"><i data-lucide="dollar-sign"></i></div>
          </div>
          <div class="kpi-value">$${totalCostValuation.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div class="kpi-footer text-success">
            <i data-lucide="trending-up"></i>
            <span>Retail Value: $${totalRetailValuation.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${grossProfitMargin}% margin)</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Total Stock On Hand</span>
            <div class="kpi-icon icon-blue"><i data-lucide="boxes"></i></div>
          </div>
          <div class="kpi-value">${totalOnHandUnits.toLocaleString()} <span class="text-sm font-normal text-muted">units</span></div>
          <div class="kpi-footer text-muted">
            <i data-lucide="layers"></i>
            <span>Across ${warehouses.length} Distribution Hubs (${products.length} active SKUs)</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Fulfillment Health</span>
            <div class="kpi-icon icon-purple"><i data-lucide="check-circle-2"></i></div>
          </div>
          <div class="kpi-value">99.4% <span class="text-sm font-normal text-success">On-Time</span></div>
          <div class="kpi-footer text-muted">
            <i data-lucide="package"></i>
            <span>${pendingOrders} Open Orders in Picking/Packing</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Procurement & Alerts</span>
            <div class="kpi-icon icon-amber"><i data-lucide="alert-triangle"></i></div>
          </div>
          <div class="kpi-value ${lowStockProducts.length > 0 ? "text-warning" : "text-success"}">
            ${lowStockProducts.length} <span class="text-sm font-normal text-muted">Threshold Breaches</span>
          </div>
          <div class="kpi-footer text-muted">
            <i data-lucide="truck"></i>
            <span>${activePOs} Active POs Inbound at Docks</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Warehouse Inventory Distribution</h3>
              <p class="chart-subtitle">Physical stock unit distribution across regional facilities</p>
            </div>
            <span class="badge badge-subtle">${warehouses.length} Active Hubs</span>
          </div>
          <div class="chart-wrapper">
            <canvas id="chart-warehouse-dist"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Category Valuation & Capital Allocation</h3>
              <p class="chart-subtitle">Current tied-up working capital by merchandise department</p>
            </div>
            <span class="badge badge-accent">Live FIFO Value</span>
          </div>
          <div class="chart-wrapper">
            <canvas id="chart-category-val"></canvas>
          </div>
        </div>
      </div>

      <!-- Lower Split: Low Stock Alerts & Live Audit Stream -->
      <div class="dashboard-split-grid">
        <div class="content-card">
          <div class="card-header flex-between">
            <div class="flex-center gap-sm">
              <i data-lucide="alert-circle" class="text-warning"></i>
              <h3 class="card-title">Low Stock Reorder Alerts</h3>
            </div>
            <span class="badge badge-warning">${lowStockProducts.length} Attention Required</span>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Product / SKU</th>
                  <th>On Hand</th>
                  <th>Reorder Pt</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${
                  lowStockProducts.length === 0
                    ? `<tr><td colspan="5" class="text-center text-muted py-lg">All inventory items are currently above safe reorder thresholds!</td></tr>`
                    : lowStockProducts
                        .map(
                          (p) => `
                    <tr>
                      <td>
                        <div class="font-bold">${p.name}</div>
                        <div class="text-xs font-mono text-muted">${p.sku}</div>
                      </td>
                      <td class="font-bold ${p.currentStock === 0 ? "text-danger" : "text-warning"}">${p.currentStock} Units</td>
                      <td>${p.reorderPoint} Units</td>
                      <td>
                        ${
                          p.currentStock === 0
                            ? `<span class="badge badge-danger">OUT OF STOCK</span>`
                            : `<span class="badge badge-warning">LOW STOCK (-${p.deficit})</span>`
                        }
                      </td>
                      <td>
                        <button class="btn btn-secondary btn-xs btn-reorder-item" data-supplier-id="${p.primarySupplierId}" data-prod-id="${p.id}">
                          <i data-lucide="shopping-cart"></i>
                          <span>Order PO</span>
                        </button>
                      </td>
                    </tr>
                  `
                        )
                        .join("")
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="content-card">
          <div class="card-header flex-between">
            <div class="flex-center gap-sm">
              <i data-lucide="activity" class="text-accent"></i>
              <h3 class="card-title">Real-Time System Audit Ledger</h3>
            </div>
            <span class="badge badge-subtle">Audit Trail</span>
          </div>

          <div class="audit-timeline">
            ${auditLogs
              .map(
                (log) => `
              <div class="audit-item">
                <div class="audit-bullet"></div>
                <div class="audit-content">
                  <div class="audit-header">
                    <span class="audit-action badge badge-subtle">${log.action}</span>
                    <span class="audit-time">${log.timestamp}</span>
                  </div>
                  <div class="audit-details">${log.details}</div>
                  <div class="audit-user text-xs text-muted">Initiated by: <strong>${log.user}</strong></div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setupDashboardEvents(onNavigateTab) {
  // Chart.js initialization
  const whDistCanvas = document.getElementById("chart-warehouse-dist");
  const catValCanvas = document.getElementById("chart-category-val");

  if (whDistCanvas) {
    const warehouses = store.getWarehouses();
    const labels = warehouses.map((w) => `${w.city} (${w.code})`);
    const data = warehouses.map((w) => {
      const util = store.getWarehouseUtilization(w.id);
      return util.usedUnits;
    });

    new Chart(whDistCanvas, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"],
            borderWidth: 2,
            borderColor: "rgba(15, 23, 42, 0.8)"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#94a3b8", boxWidth: 12, padding: 14 }
          }
        },
        cutout: "68%"
      }
    });
  }

  if (catValCanvas) {
    const products = store.getProducts();
    const catMap = {};
    products.forEach((p) => {
      const summary = store.getProductStockSummary(p.id);
      const val = summary.onHand * p.costPrice;
      catMap[p.category] = (catMap[p.category] || 0) + val;
    });

    const labels = Object.keys(catMap);
    const data = Object.values(catMap);

    new Chart(catValCanvas, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Asset Value ($)",
            data,
            backgroundColor: "rgba(99, 102, 241, 0.75)",
            hoverBackgroundColor: "rgba(99, 102, 241, 0.95)",
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            ticks: { color: "#94a3b8", font: { size: 11 } },
            grid: { display: false }
          },
          y: {
            ticks: {
              color: "#94a3b8",
              callback: (v) => `$${v.toLocaleString()}`
            },
            grid: { color: "rgba(148, 163, 184, 0.1)" }
          }
        }
      }
    });
  }

  // Quick Action Buttons
  const newProdBtn = document.getElementById("btn-quick-new-prod");
  if (newProdBtn) newProdBtn.addEventListener("click", () => modals.openProductModal());

  const quickOrderBtn = document.getElementById("btn-quick-order");
  if (quickOrderBtn) quickOrderBtn.addEventListener("click", () => modals.openCreateOrderModal());

  const quickPOBtn = document.getElementById("btn-quick-po");
  if (quickPOBtn) quickPOBtn.addEventListener("click", () => modals.openCreatePOModal());

  const quickTransferBtn = document.getElementById("btn-quick-transfer");
  if (quickTransferBtn) quickTransferBtn.addEventListener("click", () => modals.openCreateTransferModal());

  // Reorder buttons in table
  document.querySelectorAll(".btn-reorder-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const supId = btn.dataset.supplierId;
      modals.openCreatePOModal(supId);
    });
  });
}
