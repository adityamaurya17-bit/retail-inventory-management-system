import { store } from "../state/store.js";
import { modals } from "./Modals.js";
import { toast } from "./Toast.js";

let selectedWarehouseId = "WH-CHI";

export function renderWarehouseView() {
  const warehouses = store.getWarehouses();
  const currentWh = warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0];
  const allStock = store.getStock();
  const products = store.getProducts();

  const whStock = allStock.filter((s) => s.warehouseId === currentWh.id);
  const utilization = store.getWarehouseUtilization(currentWh.id);

  return `
    <div class="view-container animate-fade-in">
      <div class="view-header">
        <div>
          <h1 class="view-title">Multi-Warehouse Inventory & Bin Topology</h1>
          <p class="view-subtitle">Dynamic facility modeling, spatial zone bin coordinates, and real-time ATP stock balances</p>
        </div>
        <div class="header-actions">
          <button id="btn-wh-transfer" class="btn btn-secondary btn-sm">
            <i data-lucide="arrow-left-right"></i>
            <span>Inter-Warehouse Transfer</span>
          </button>
        </div>
      </div>

      <!-- Facility Selector Tabs -->
      <div class="warehouse-selector-grid">
        ${warehouses
          .map((wh) => {
            const util = store.getWarehouseUtilization(wh.id);
            const isSelected = wh.id === currentWh.id;
            return `
            <div class="facility-card ${isSelected ? "selected" : ""}" data-wh-id="${wh.id}">
              <div class="flex-between">
                <span class="badge ${isSelected ? "badge-accent" : "badge-subtle"}">${wh.code}</span>
                <span class="text-xs text-muted">${wh.city}, ${wh.state}</span>
              </div>
              <h3 class="facility-name">${wh.name}</h3>
              <div class="facility-type text-xs text-muted">${wh.type}</div>
              
              <div class="facility-meter-box">
                <div class="flex-between text-xs">
                  <span>Capacity: <strong>${util.usedUnits.toLocaleString()} / ${util.totalCapacity.toLocaleString()}</strong></span>
                  <span class="font-bold ${util.percent > 85 ? "text-warning" : "text-success"}">${util.percent}%</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar ${util.percent > 85 ? "bg-warning" : "bg-primary"}" style="width: ${util.percent}%"></div>
                </div>
              </div>
            </div>
          `;
          })
          .join("")}
      </div>

      <!-- Facility Details & Zone Map Split -->
      <div class="facility-details-banner">
        <div class="facility-info-pane">
          <h3>${currentWh.name} <span class="badge badge-accent">${currentWh.code}</span></h3>
          <p class="text-muted text-sm">${currentWh.address}</p>
          <div class="contact-line text-xs">
            <span><strong>Facility Manager:</strong> ${currentWh.manager}</span>
            <span>&bull;</span>
            <span><strong>Contact:</strong> ${currentWh.contactEmail}</span>
          </div>
        </div>

        <div class="facility-stats-pane">
          <div class="stat-bubble">
            <span class="label">Total Bins</span>
            <span class="val">${currentWh.zones.reduce((sum, z) => sum + z.bins.length, 0)} Bins</span>
          </div>
          <div class="stat-bubble">
            <span class="label">SKUs Present</span>
            <span class="val">${whStock.length} SKUs</span>
          </div>
          <div class="stat-bubble">
            <span class="label">Physical Units</span>
            <span class="val text-accent">${utilization.usedUnits.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <!-- Interactive Spatial Bin Map -->
      <div class="content-card" style="margin-bottom: 24px;">
        <div class="card-header flex-between">
          <div class="flex-center gap-sm">
            <i data-lucide="grid" class="text-accent"></i>
            <div>
              <h3 class="card-title">Spatial Warehouse Bin Topology</h3>
              <p class="card-subtitle text-xs text-muted">Click any bin coordinate to perform a rapid spot cycle count</p>
            </div>
          </div>
          <span class="badge badge-subtle">Zone Coordinate Addressing</span>
        </div>

        <div class="zones-container">
          ${currentWh.zones
            .map((zone) => {
              return `
              <div class="zone-block">
                <div class="zone-header">
                  <i data-lucide="map-pin" class="text-accent" style="width: 14px; height: 14px;"></i>
                  <span>${zone.name}</span>
                </div>
                <div class="bins-grid">
                  ${zone.bins
                    .map((binCode) => {
                      const itemInBin = whStock.find((s) => s.bin === binCode);
                      const prod = itemInBin ? products.find((p) => p.id === itemInBin.productId) : null;
                      const hasStock = itemInBin && itemInBin.onHand > 0;

                      return `
                      <div class="bin-cell ${hasStock ? "occupied" : "empty"}" 
                           data-bin="${binCode}" 
                           data-prod-id="${prod ? prod.id : ""}"
                           data-wh-id="${currentWh.id}"
                           title="${binCode}: ${prod ? `${prod.name} (${itemInBin.onHand} units)` : "Available Slot"}">
                        <div class="bin-code font-mono">${binCode}</div>
                        ${
                          prod
                            ? `
                            <div class="bin-item-info">
                              <span class="bin-sku">${prod.sku}</span>
                              <span class="bin-qty badge ${itemInBin.onHand <= prod.reorderPoint ? "badge-warning" : "badge-success"}">${itemInBin.onHand}u</span>
                            </div>
                          `
                            : `<div class="bin-empty-label">Empty Slot</div>`
                        }
                      </div>
                    `;
                    })
                    .join("")}
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>

      <!-- Warehouse Inventory Table -->
      <div class="content-card">
        <div class="card-header flex-between">
          <div class="flex-center gap-sm">
            <i data-lucide="table" class="text-accent"></i>
            <h3 class="card-title">Facility On-Hand Stock Ledger</h3>
          </div>
          <span class="badge badge-subtle">${whStock.length} Product Records</span>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Product / SKU</th>
                <th>Bin Coordinate</th>
                <th>Batch / Lot #</th>
                <th>Stock on Hand</th>
                <th>Reserved</th>
                <th>Available to Promise</th>
                <th>Status</th>
                <th>Reconcile</th>
              </tr>
            </thead>
            <tbody>
              ${
                whStock.length === 0
                  ? `<tr><td colspan="8" class="text-center text-muted py-lg">No stock currently stored at this facility.</td></tr>`
                  : whStock
                      .map((stk) => {
                        const prod = products.find((p) => p.id === stk.productId);
                        const available = Math.max(0, stk.onHand - (stk.reserved || 0));
                        const isLow = prod && stk.onHand <= prod.reorderPoint;

                        return `
                  <tr>
                    <td>
                      <div class="font-bold">${prod?.name || stk.productId}</div>
                      <div class="text-xs font-mono text-muted">${prod?.sku}</div>
                    </td>
                    <td><span class="badge badge-accent font-mono">${stk.bin}</span></td>
                    <td><span class="text-xs font-mono text-muted">${stk.batch || "LOT-2026-STD"}</span></td>
                    <td class="font-bold text-accent">${stk.onHand} Units</td>
                    <td><span class="text-muted">${stk.reserved || 0}</span></td>
                    <td class="font-bold ${available === 0 ? "text-danger" : "text-success"}">${available} Units</td>
                    <td>
                      ${
                        stk.onHand === 0
                          ? `<span class="badge badge-danger">OUT</span>`
                          : isLow
                          ? `<span class="badge badge-warning">LOW</span>`
                          : `<span class="badge badge-success">OPTIMAL</span>`
                      }
                    </td>
                    <td>
                      <button class="btn btn-secondary btn-xs btn-spot-count" data-prod-id="${stk.productId}" data-wh-id="${currentWh.id}" data-bin="${stk.bin}">
                        <i data-lucide="clipboard-check"></i>
                        <span>Audit Count</span>
                      </button>
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

export function setupWarehouseEvents(onRefresh) {
  // Facility card click
  document.querySelectorAll(".facility-card").forEach((card) => {
    card.addEventListener("click", () => {
      selectedWarehouseId = card.dataset.whId;
      onRefresh();
    });
  });

  // Transfer stock button
  const transferBtn = document.getElementById("btn-wh-transfer");
  if (transferBtn) {
    transferBtn.addEventListener("click", () => modals.openCreateTransferModal());
  }

  // Spot cycle count from table
  document.querySelectorAll(".btn-spot-count").forEach((btn) => {
    btn.addEventListener("click", () => {
      modals.openStockAdjustModal(btn.dataset.prodId, btn.dataset.whId, btn.dataset.bin);
    });
  });

  // Spot cycle count from bin map click
  document.querySelectorAll(".bin-cell.occupied").forEach((cell) => {
    cell.addEventListener("click", () => {
      const prodId = cell.dataset.prodId;
      const whId = cell.dataset.whId;
      const bin = cell.dataset.bin;
      if (prodId) modals.openStockAdjustModal(prodId, whId, bin);
    });
  });
}
