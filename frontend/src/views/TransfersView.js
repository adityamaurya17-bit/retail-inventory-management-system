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
      <!-- Semantic View Header -->
      <header class="view-header flex-between flex-wrap gap-sm">
        <div>
          <h1 class="view-title">Inter-Warehouse Stock Transfers (STO)</h1>
          <p class="view-subtitle">Relocate inventory between regional fulfillment nodes, manage in-transit pipeline & reconcile arrivals</p>
        </div>
        <div class="header-actions">
          <button type="button" id="btn-create-transfer-view" class="btn btn-primary btn-sm">
            <i data-lucide="plus-circle" aria-hidden="true"></i>
            <span>Create Transfer Order</span>
          </button>
        </div>
      </header>

      <!-- Semantic Quick Metrics Grid -->
      <section class="stats-grid" style="grid-template-columns: repeat(3, 1fr);" aria-label="Transfer Key Metrics">
        <article class="stat-card" role="region" aria-label="Active In-Transit Transfers">
          <header class="stat-card-header flex-between">
            <h2 class="stat-label">Active In-Transit Transfers</h2>
            <div class="stat-icon-wrap icon-primary" aria-hidden="true"><i data-lucide="truck"></i></div>
          </header>
          <p class="stat-value font-mono text-accent">${transfers.filter((t) => t.status === "In-Transit").length} <span class="text-sm font-normal text-muted">Shipments</span></p>
          <footer class="stat-trend text-muted text-xxs">Currently moving via dedicated freight</footer>
        </article>

        <article class="stat-card" role="region" aria-label="Completed Reallocations">
          <header class="stat-card-header flex-between">
            <h2 class="stat-label">Completed Reallocations</h2>
            <div class="stat-icon-wrap icon-success" aria-hidden="true"><i data-lucide="check-circle-2"></i></div>
          </header>
          <p class="stat-value font-mono text-success">${transfers.filter((t) => t.status === "Completed").length} <span class="text-sm font-normal text-muted">Orders</span></p>
          <footer class="stat-trend text-success text-xxs font-semibold">Successfully ingested at destination</footer>
        </article>

        <article class="stat-card" role="region" aria-label="Scheduled Drafts">
          <header class="stat-card-header flex-between">
            <h2 class="stat-label">Scheduled Drafts</h2>
            <div class="stat-icon-wrap icon-accent" aria-hidden="true"><i data-lucide="calendar"></i></div>
          </header>
          <p class="stat-value font-mono">${transfers.filter((t) => t.status === "Draft").length} <span class="text-sm font-normal text-muted">Awaiting Dispatch</span></p>
          <footer class="stat-trend text-muted text-xxs">Planned seasonal rebalancing</footer>
        </article>
      </section>

      <!-- Semantic Transfer Orders Table Section -->
      <section class="content-card" aria-label="Transfer Orders Ledger">
        <header class="card-header flex-between">
          <div class="flex-align-center gap-sm">
            <i data-lucide="repeat" class="text-accent" aria-hidden="true"></i>
            <h2 class="card-title">Transfer Orders Ledger</h2>
          </div>
          <span class="badge badge-subtle font-mono">Regional Rebalancing</span>
        </header>

        <div class="table-responsive">
          <table class="data-table" role="table">
            <thead>
              <tr>
                <th scope="col">Transfer Order #</th>
                <th scope="col">Origin Facility</th>
                <th scope="col">Route Direction</th>
                <th scope="col">Destination Facility</th>
                <th scope="col">Items & Quantities</th>
                <th scope="col">Carrier & Tracking</th>
                <th scope="col">Status</th>
                <th scope="col">Reconciliation Action</th>
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
                        <div class="text-xs text-muted"><time>Date: ${trf.date}</time></div>
                      </td>
                      <td>
                        <div class="font-bold">${originWh?.city || trf.fromWarehouseId}</div>
                        <div class="text-xs text-muted font-mono">${originWh?.code}</div>
                      </td>
                      <td>
                        <div class="transfer-arrow-route text-accent" aria-hidden="true">➔</div>
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
                            ? `<button type="button" class="btn btn-success btn-xs btn-complete-transfer" data-id="${trf.id}">
                                <i data-lucide="check-check" aria-hidden="true"></i>
                                <span>Receive at Hub</span>
                              </button>`
                            : trf.status === "Draft"
                            ? `<button type="button" class="btn btn-primary btn-xs btn-dispatch-draft" data-id="${trf.id}">Dispatch</button>`
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
      </section>
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
