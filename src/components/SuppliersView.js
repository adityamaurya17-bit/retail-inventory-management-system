import { store } from "../state/store.js";
import { modals } from "./Modals.js";
import { toast } from "./Toast.js";

let subTab = "pos"; // "pos" | "directory"

export function renderSuppliersView() {
  const suppliers = store.getSuppliers();
  const purchaseOrders = store.getPurchaseOrders();
  const warehouses = store.getWarehouses();
  const products = store.getProducts();

  return `
    <div class="view-container animate-fade-in">
      <div class="view-header">
        <div>
          <h1 class="view-title">Suppliers & Purchase Order Management</h1>
          <p class="view-subtitle">Procure-to-pay lifecycle, supplier SLA reliability scoring, and inbound dock receiving (GRN)</p>
        </div>
        <div class="header-actions">
          <button id="btn-create-po-view" class="btn btn-primary btn-sm">
            <i data-lucide="file-plus"></i>
            <span>Issue Purchase Order</span>
          </button>
        </div>
      </div>

      <!-- Tab Switcher -->
      <div class="subnav-tabs">
        <button class="subnav-btn ${subTab === "pos" ? "active" : ""}" data-subtab="pos">
          <i data-lucide="file-text"></i>
          <span>Purchase Orders (${purchaseOrders.length})</span>
        </button>
        <button class="subnav-btn ${subTab === "directory" ? "active" : ""}" data-subtab="directory">
          <i data-lucide="users"></i>
          <span>Supplier Directory & Scorecards (${suppliers.length})</span>
        </button>
      </div>

      ${
        subTab === "pos"
          ? `
        <!-- Purchase Orders Table -->
        <div class="content-card">
          <div class="card-header flex-between">
            <div class="flex-center gap-sm">
              <i data-lucide="file-check" class="text-accent"></i>
              <h3 class="card-title">Purchase Order Pipeline</h3>
            </div>
            <span class="badge badge-subtle">Procure-to-Pay</span>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Vendor / Supplier</th>
                  <th>Receiving Hub</th>
                  <th>Order Date</th>
                  <th>Expected ETA</th>
                  <th>Capital Total</th>
                  <th>Status</th>
                  <th>Inbound Dock Actions</th>
                </tr>
              </thead>
              <tbody>
                ${
                  purchaseOrders.length === 0
                    ? `<tr><td colspan="8" class="text-center text-muted py-lg">No Purchase Orders issued.</td></tr>`
                    : purchaseOrders
                        .map((po) => {
                          const sup = suppliers.find((s) => s.id === po.supplierId);
                          const wh = warehouses.find((w) => w.id === po.warehouseId);

                          let badgeClass = "badge-subtle";
                          if (po.status === "Approved") badgeClass = "badge-primary";
                          if (po.status === "Sent to Vendor") badgeClass = "badge-warning";
                          if (po.status === "Partially Received") badgeClass = "badge-accent";
                          if (po.status === "Received") badgeClass = "badge-success";

                          return `
                      <tr>
                        <td>
                          <div class="font-mono font-bold">${po.poNumber}</div>
                          <div class="text-xs text-muted">${po.paymentTerms}</div>
                        </td>
                        <td>
                          <div class="font-bold">${sup?.name || po.supplierId}</div>
                          <div class="text-xs text-muted font-mono">${sup?.code}</div>
                        </td>
                        <td><span class="badge badge-subtle">${wh?.name} (${wh?.city})</span></td>
                        <td>${po.orderDate}</td>
                        <td><span class="text-accent font-bold">${po.expectedDate}</span></td>
                        <td class="font-bold">$${po.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td><span class="badge ${badgeClass}">${po.status}</span></td>
                        <td>
                          <div class="flex-center gap-xs">
                            ${
                              po.status === "Draft"
                                ? `<button class="btn btn-secondary btn-xs btn-approve-po" data-id="${po.id}">Approve</button>`
                                : po.status === "Approved"
                                ? `<button class="btn btn-secondary btn-xs btn-send-po" data-id="${po.id}">Send Vendor</button>`
                                : po.status !== "Received"
                                ? `<button class="btn btn-success btn-xs btn-grn-receive" data-id="${po.id}">
                                     <i data-lucide="inbox"></i>
                                     <span>Receive Dock</span>
                                   </button>`
                                : `<span class="badge badge-success text-xs">Dock Complete</span>`
                            }
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
        </div>
      `
          : `
        <!-- Supplier Directory Cards Grid -->
        <div class="suppliers-grid">
          ${suppliers
            .map((s) => {
              return `
              <div class="supplier-card">
                <div class="supplier-card-header">
                  <div>
                    <span class="badge badge-accent font-mono">${s.code}</span>
                    <h3 class="supplier-name">${s.name}</h3>
                    <div class="text-xs text-muted">${s.category} &bull; ${s.city}</div>
                  </div>
                  <span class="badge ${s.status === "Preferred" ? "badge-success" : "badge-subtle"}">${s.status}</span>
                </div>

                <div class="scorecard-meter-box">
                  <div class="flex-between text-xs">
                    <span>On-Time SLA Delivery:</span>
                    <strong class="${s.reliabilityRating >= 96 ? "text-success" : "text-warning"}">${s.reliabilityRating}%</strong>
                  </div>
                  <div class="progress-bar-container">
                    <div class="progress-bar ${s.reliabilityRating >= 96 ? "bg-success" : "bg-warning"}" style="width: ${s.reliabilityRating}%"></div>
                  </div>
                </div>

                <div class="supplier-terms-grid">
                  <div>
                    <span class="text-xs text-muted">Lead Time</span>
                    <div class="font-bold">${s.leadTimeDays} Days</div>
                  </div>
                  <div>
                    <span class="text-xs text-muted">Payment Terms</span>
                    <div class="font-bold">${s.paymentTerms}</div>
                  </div>
                  <div>
                    <span class="text-xs text-muted">Active Master Contracts</span>
                    <div class="font-bold text-accent">${s.activeContracts}</div>
                  </div>
                </div>

                <div class="supplier-contact-box">
                  <div class="text-xs"><strong>Contact:</strong> ${s.contactName}</div>
                  <div class="text-xs text-muted">${s.email} | ${s.phone}</div>
                </div>

                <div class="supplier-card-footer">
                  <button class="btn btn-primary btn-sm btn-po-for-supplier" data-id="${s.id}">
                    <i data-lucide="plus-circle"></i>
                    <span>Issue PO to Vendor</span>
                  </button>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      `
      }
    </div>
  `;
}

export function setupSuppliersEvents(onRefresh) {
  // Tab toggling
  document.querySelectorAll(".subnav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      subTab = btn.dataset.subtab;
      onRefresh();
    });
  });

  // Create PO button
  const createBtn = document.getElementById("btn-create-po-view");
  if (createBtn) {
    createBtn.addEventListener("click", () => modals.openCreatePOModal());
  }

  // Issue PO to specific supplier button
  document.querySelectorAll(".btn-po-for-supplier").forEach((btn) => {
    btn.addEventListener("click", () => {
      modals.openCreatePOModal(btn.dataset.id);
    });
  });

  // Approve PO
  document.querySelectorAll(".btn-approve-po").forEach((btn) => {
    btn.addEventListener("click", () => {
      store.updatePurchaseOrderStatus(btn.dataset.id, "Approved");
      toast.success("Purchase Order approved");
      onRefresh();
    });
  });

  // Send to vendor
  document.querySelectorAll(".btn-send-po").forEach((btn) => {
    btn.addEventListener("click", () => {
      store.updatePurchaseOrderStatus(btn.dataset.id, "Sent to Vendor");
      toast.info("Purchase Order transmitted to vendor procurement portal");
      onRefresh();
    });
  });

  // Receive at dock (GRN)
  document.querySelectorAll(".btn-grn-receive").forEach((btn) => {
    btn.addEventListener("click", () => {
      modals.openReceiveGRNModal(btn.dataset.id);
    });
  });
}
