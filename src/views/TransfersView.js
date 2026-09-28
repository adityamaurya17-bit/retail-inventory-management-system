import { store } from "../state/store.js";
import { modals } from "../components/modals/ModalManager.js";
import { toast } from "../components/toast/Toast.js";
import confetti from "canvas-confetti";


export function renderTransfersView() {
  const transfers = store.getStockTransfers();
  const warehouses = store.getWarehouses();
  const products = store.getProducts();

  return `
    <div class="view-container animate-fade-in">
      <div class="view-header">
        <div>
          <h1 class="view-title">Inter-Warehouse Stock Transfers (STO)</h1>
          <p class="view-subtitle">Relocate inventory between regional fulfillment nodes, manage in-transit pipeline & reconcile arrivals</p>
        </div>
        <div class="header-actions">
          <button id="btn-create-transfer-view" class="btn btn-primary btn-sm">
            <i data-lucide="plus-circle"></i>
            <span>Create Transfer Order</span>
          </button>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="kpi-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 24px;">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Active In-Transit Transfers</span>
            <div class="kpi-icon icon-blue"><i data-lucide="truck"></i></div>
          </div>
          <div class="kpi-value text-accent">${transfers.filter((t) => t.status === "In-Transit").length} <span class="text-sm font-normal text-muted">Shipments</span></div>
          <div class="kpi-footer text-muted">Currently moving via dedicated freight</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Completed Reallocations</span>
            <div class="kpi-icon icon-emerald"><i data-lucide="check-circle-2"></i></div>
          </div>
          <div class="kpi-value text-success">${transfers.filter((t) => t.status === "Completed").length} <span class="text-sm font-normal text-muted">Orders</span></div>
          <div class="kpi-footer text-muted">Successfully ingested at destination</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Scheduled Drafts</span>
            <div class="kpi-icon icon-purple"><i data-lucide="calendar"></i></div>
          </div>
          <div class="kpi-value">${transfers.filter((t) => t.status === "Draft").length} <span class="text-sm font-normal text-muted">Awaiting Dispatch</span></div>
          <div class="kpi-footer text-muted">Planned seasonal rebalancing</div>
        </div>
      </div>

      <!-- Transfer Orders Table -->
      <div class="content-card">
        <div class="card-header flex-between">
          <div class="flex-center gap-sm">
            <i data-lucide="repeat" class="text-accent"></i>
            <h3 class="card-title">Transfer Orders Ledger</h3>
          </div>
          <span class="badge badge-subtle">Regional Rebalancing</span>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Transfer Order #</th>
                <th>Origin Facility</th>
                <th>Route Direction</th>
                <th>Destination Facility</th>
                <th>Items & Quantities</th>
                <th>Carrier & Tracking</th>
                <th>Status</th>
                <th>Reconciliation Action</th>
              </tr>
            </thead>
            <tbody>
              ${
                transfers.length === 0
                  ? `<tr><td colspan="8" class="text-center text-muted py-lg">No stock transfers recorded.</td></tr>`
                  : transfers
                      .map((trf) => {
                        const originWh = warehouses.find((w) => w.id === trf.fromWarehouseId);
                        const destWh = warehouses.find((w) => w.id === trf.toWarehouseId);

                        let badgeColor = "badge-subtle";
                        if (trf.status === "In-Transit") badgeColor = "badge-warning";
                        if (trf.status === "Completed") badgeColor = "badge-success";

                        return `
                    <tr>
                      <td>
                        <div class="font-mono font-bold">${trf.transferNumber}</div>
                        <div class="text-xs text-muted">Date: ${trf.date}</div>
                      </td>
                      <td>
                        <div class="font-bold">${originWh?.city || trf.fromWarehouseId}</div>
                        <div class="text-xs text-muted font-mono">${originWh?.code}</div>
                      </td>
                      <td>
                        <div class="transfer-arrow-route text-accent">➔</div>
                      </td>
                      <td>
                        <div class="font-bold">${destWh?.city || trf.toWarehouseId}</div>
                        <div class="text-xs text-muted font-mono">${destWh?.code}</div>
                      </td>
                      <td>
                        <div class="transfer-items-list">
                          ${trf.items
                            .map((it) => {
                              const p = products.find((prod) => prod.id === it.productId);
                              return `<div class="text-xs"><strong>${it.quantity}x</strong> ${p?.sku || it.productId}</div>`;
                            })
                            .join("")}
                        </div>
                      </td>
                      <td>
                        <div class="text-xs font-bold">${trf.carrier}</div>
                        <div class="text-xs font-mono text-muted">${trf.trackingNumber}</div>
                        <div class="text-xs text-accent">ETA: ${trf.eta}</div>
                      </td>
                      <td><span class="badge ${badgeColor}">${trf.status}</span></td>
                      <td>
                        ${
                          trf.status === "In-Transit"
                            ? `<button class="btn btn-success btn-xs btn-complete-transfer" data-id="${trf.id}">
                                <i data-lucide="check-check"></i>
                                <span>Receive at Hub</span>
                              </button>`
                            : trf.status === "Draft"
                            ? `<button class="btn btn-primary btn-xs btn-dispatch-draft" data-id="${trf.id}">Dispatch</button>`
                            : `<span class="badge badge-success text-xs">Reconciled</span>`
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
      </div>
    </div>
  `;
}

export function setupTransfersEvents(onRefresh) {
  const createBtn = document.getElementById("btn-create-transfer-view");
  if (createBtn) {
    createBtn.addEventListener("click", () => modals.openCreateTransferModal());
  }

  document.querySelectorAll(".btn-complete-transfer").forEach((btn) => {
    btn.addEventListener("click", () => {
      store.completeStockTransfer(btn.dataset.id);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      toast.success("Transfer received and verified at destination facility!");
      onRefresh();
    });
  });

  document.querySelectorAll(".btn-dispatch-draft").forEach((btn) => {
    btn.addEventListener("click", () => {
      const trf = store.getStockTransfers().find((t) => t.id === btn.dataset.id);
      if (trf) {
        trf.status = "In-Transit";
        store.saveState();
        toast.info(`Transfer ${trf.transferNumber} marked In-Transit`);
        onRefresh();
      }
    });
  });
}
