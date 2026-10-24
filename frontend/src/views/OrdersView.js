import { store } from "../state/store.js";
import { modals } from "../components/modals/ModalManager.js";
import { toast } from "../components/toast/Toast.js";
import confetti from "canvas-confetti";

let selectedChannel = "All";
let searchOrderText = "";
let orderViewMode = localStorage.getItem("rims_orders_view_mode") || "kanban";

export function renderOrdersView() {
  const allOrders = store.getSalesOrders();
  const warehouses = store.getWarehouses();
  const products = store.getProducts();

  const channels = ["All", "E-Commerce Direct", "B2B Wholesale", "Retail POS Storefront", "Mobile App Store"];

  let filtered = allOrders.filter((ord) => {
    if (selectedChannel !== "All" && ord.customer.channel !== selectedChannel) return false;
    if (searchOrderText.trim()) {
      const q = searchOrderText.toLowerCase();
      const matchNum = ord.orderNumber.toLowerCase().includes(q);
      const matchCust = ord.customer.name.toLowerCase().includes(q);
      const matchCarrier = ord.carrier.toLowerCase().includes(q);
      if (!matchNum && !matchCust && !matchCarrier) return false;
    }
    return true;
  });

  const pipelineStages = [
    { id: "Pending Allocation", label: "Pending Allocation", color: "badge-subtle", next: "Wave Picking", btnText: "Start Wave Pick", icon: "clock" },
    { id: "Wave Picking", label: "Wave Picking", color: "badge-warning", next: "Packed", btnText: "Finish Pack", icon: "clipboard-list" },
    { id: "Packed", label: "Packed & Staged", color: "badge-primary", next: "Dispatched", btnText: "Dispatch Freight", icon: "package-check" },
    { id: "Dispatched", label: "In Transit / Dispatched", color: "badge-accent", next: "Delivered", btnText: "Confirm Delivery", icon: "truck" },
    { id: "Delivered", label: "Delivered to Customer", color: "badge-success", next: null, btnText: null, icon: "check-circle" }
  ];

  return `
    <div class="view-container animate-fade-in">
      <!-- Semantic View Header -->
      <header class="view-header flex-between flex-wrap gap-sm">
        <div>
          <h1 class="view-title">Omnichannel Order Fulfillment & Wave Dispatch</h1>
          <p class="view-subtitle">Intelligent warehouse routing, wave picking verification, and automated carrier dispatch</p>
        </div>
        <div class="header-actions">
          <button type="button" id="btn-create-order-view" class="btn btn-primary btn-sm">
            <i data-lucide="plus-circle" aria-hidden="true"></i>
            <span>Create Sales Order</span>
          </button>
        </div>
      </header>

      <!-- Semantic Toolbar & Channel Chips Navigation -->
      <nav class="toolbar-card" aria-label="Order search and filter controls">
        <div class="search-input-wrapper">
          <i data-lucide="search" class="search-icon" aria-hidden="true"></i>
          <label for="order-search-input" class="sr-only">Search Orders</label>
          <input type="search" id="order-search-input" placeholder="Search by Order #, Customer, or Carrier..." value="${searchOrderText}" />
        </div>

        <div class="toolbar-controls">
          <!-- View Mode Toggle: Kanban / Table -->
          <div class="view-mode-toggle" id="order-view-mode-toggle" role="group" aria-label="View format toggle">
            <button type="button" class="btn-icon ${orderViewMode === "kanban" ? "active" : ""}" data-mode="kanban" title="Kanban Pipeline" aria-pressed="${orderViewMode === "kanban"}">
              <i data-lucide="columns-3" aria-hidden="true"></i>
            </button>
            <button type="button" class="btn-icon ${orderViewMode === "table" ? "active" : ""}" data-mode="table" title="Dense Orders Table" aria-pressed="${orderViewMode === "table"}">
              <i data-lucide="list" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <fieldset class="channel-pills" role="group" aria-label="Filter by sales channel">
          ${channels
            .map(
              (ch) => `
            <button type="button" class="pill-btn ${selectedChannel === ch ? "active" : ""}" data-channel="${ch}" aria-pressed="${selectedChannel === ch}">
              ${ch}
            </button>
          `
            )
            .join("")}
        </fieldset>
      </nav>

      <!-- Content Display: Kanban Board or Table -->
      ${
        filtered.length === 0
          ? `
          <section class="empty-state-card" aria-label="No orders found">
            <i data-lucide="shopping-bag" class="empty-icon" aria-hidden="true"></i>
            <h3>No Orders Found</h3>
            <p class="text-muted text-sm">No sales orders match your active filter or search query.</p>
          </section>
        `
          : orderViewMode === "table"
          ? `
          <section class="table-container" aria-label="Sales Orders Registry">
            <table class="data-table" role="table">
              <thead>
                <tr>
                  <th scope="col">Order # & Customer</th>
                  <th scope="col">Channel</th>
                  <th scope="col">Warehouse Hub</th>
                  <th scope="col">Items Ordered</th>
                  <th scope="col" class="text-right">Order Total</th>
                  <th scope="col">Fulfillment Status</th>
                  <th scope="col">Carrier & Tracking</th>
                  <th scope="col" class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered
                  .map((ord) => {
                    const wh = warehouses.find((w) => w.id === ord.warehouseId);
                    const currentStage = pipelineStages.find((s) => s.id === ord.status) || pipelineStages[0];
                    const itemCount = ord.items.reduce((sum, it) => sum + (it.quantity || 1), 0);

                    return `
                      <tr>
                        <td>
                          <div>
                            <span class="font-mono font-bold text-main">${ord.orderNumber}</span>
                            <div class="text-xs text-muted" style="margin-top: 2px;">
                              <button type="button" class="btn-customer-inspect" data-email="${ord.customer.email}" data-name="${ord.customer.name}" title="Inspect Customer Profile & History" style="background: none; border: none; padding: 0; color: var(--color-primary, #2563eb); font-weight: 700; cursor: pointer; text-decoration: underline;">${ord.customer.name}</button> &bull; ${ord.customer.shippingAddress || "Regional Delivery"}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="badge badge-subtle">${ord.customer.channel}</span>
                        </td>
                        <td>
                          <span class="text-secondary font-medium">${wh?.name || ord.warehouseId}</span>
                        </td>
                        <td>
                          <span class="font-medium">${itemCount} units</span>
                          <span class="text-xs text-muted">(${ord.items.length} line items)</span>
                        </td>
                        <td class="text-right font-mono font-bold text-accent">
                          $${ord.totalAmount.toFixed(2)}
                        </td>
                        <td>
                          <span class="badge ${currentStage.color}">${ord.status}</span>
                        </td>
                        <td>
                          <div class="font-mono text-xs">
                            <span class="text-muted">${ord.carrier || "Standard Freight"}:</span>
                            <span class="font-semibold">${ord.trackingNumber || "Pending"}</span>
                          </div>
                        </td>
                        <td class="text-right">
                          <div class="row-actions-group">
                            <button type="button" class="btn btn-ghost btn-xs btn-view-slip" data-id="${ord.id}" title="View & Print Packing Slip">
                              <i data-lucide="file-text"></i>
                              <span>Slip</span>
                            </button>
                            ${
                              currentStage.next
                                ? `
                              <button type="button" class="btn btn-primary btn-xs btn-advance-order" data-id="${ord.id}" data-next="${currentStage.next}">
                                <span>${currentStage.btnText}</span>
                                <i data-lucide="chevron-right"></i>
                              </button>
                            `
                                : `<span class="badge badge-success text-xs">Delivered</span>`
                            }
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
          <!-- Fulfillment Pipeline Kanban Board -->
          <section class="kanban-pipeline-grid" aria-label="Fulfillment Pipeline Kanban Board">
            ${pipelineStages
              .map((stage) => {
                const stageOrders = filtered.filter((o) => o.status === stage.id);
                return `
                <article class="kanban-column" role="region" aria-label="${stage.label}">
                  <header class="kanban-column-header">
                    <div class="flex-center gap-xs">
                      <i data-lucide="${stage.icon}" class="text-accent" style="width: 16px; height: 16px;" aria-hidden="true"></i>
                      <h3 class="kanban-title">${stage.label}</h3>
                    </div>
                    <span class="badge ${stage.color}">${stageOrders.length}</span>
                  </header>

                  <div class="kanban-cards-stack">
                    ${
                      stageOrders.length === 0
                        ? `<div class="kanban-empty">No orders</div>`
                        : stageOrders
                            .map((ord) => {
                              const wh = warehouses.find((w) => w.id === ord.warehouseId);
                              return `
                          <article class="order-kanban-card" role="article" aria-label="Order ${ord.orderNumber}">
                            <header class="flex-between">
                              <span class="order-card-num font-mono font-bold">${ord.orderNumber}</span>
                              <span class="badge badge-subtle text-xs">${ord.customer.channel}</span>
                            </header>

                            <div class="order-customer-info">
                              <button type="button" class="btn-customer-inspect font-bold text-sm" data-email="${ord.customer.email}" data-name="${ord.customer.name}" title="Inspect Customer Profile & History" style="background: none; border: none; padding: 0; color: var(--color-primary, #2563eb); cursor: pointer; text-align: left; text-decoration: underline;">${ord.customer.name}</button>
                              <div class="text-xs text-muted truncate">${ord.customer.shippingAddress}</div>
                            </div>

                            <div class="order-items-snippet">
                              <div class="text-xs font-bold text-muted" style="margin-bottom: 2px;">ITEMS (${ord.items.length}):</div>
                              ${ord.items
                                .map((it) => {
                                  const p = products.find((prod) => prod.id === it.productId);
                                  return `<div class="text-xs truncate">&bull; ${it.quantity}x ${p?.name || it.productId}</div>`;
                                })
                                .join("")}
                            </div>

                            <div class="order-card-meta">
                              <div class="text-xs">
                                <span class="text-muted">Hub:</span> <strong>${wh?.city || ord.warehouseId}</strong>
                              </div>
                              <div class="text-xs">
                                <span class="text-muted">Total:</span> <strong class="text-accent">$${ord.totalAmount.toFixed(2)}</strong>
                              </div>
                            </div>

                            ${
                              ord.trackingNumber && ord.trackingNumber !== "Pending"
                                ? `<div class="order-tracking-badge text-xs font-mono">
                                    <i data-lucide="map-pin" style="width: 12px; height: 12px;" aria-hidden="true"></i>
                                    <span>${ord.trackingNumber}</span>
                                  </div>`
                                : ""
                            }

                            <footer class="order-card-actions">
                              <button type="button" class="btn btn-ghost btn-xs btn-view-slip" data-id="${ord.id}" title="View & Print Packing Slip">
                                <i data-lucide="file-text" aria-hidden="true"></i>
                                <span>Slip</span>
                              </button>

                              ${
                                stage.next
                                  ? `
                                <button type="button" class="btn btn-primary btn-xs btn-advance-order" data-id="${ord.id}" data-next="${stage.next}">
                                  <span>${stage.btnText}</span>
                                  <i data-lucide="chevron-right" aria-hidden="true"></i>
                                </button>
                              `
                                  : `<span class="badge badge-success text-xs">Complete</span>`
                              }
                            </footer>
                          </article>
                        `;
                            })
                            .join("")
                    }
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

export function setupOrdersEvents(onRefresh) {
  // View mode toggle
  document.querySelectorAll("#order-view-mode-toggle button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      if (mode && mode !== orderViewMode) {
        orderViewMode = mode;
        localStorage.setItem("rims_orders_view_mode", mode);
        onRefresh();
      }
    });
  });

  // Create order button
  const createBtn = document.getElementById("btn-create-order-view");
  if (createBtn) {
    createBtn.addEventListener("click", () => modals.openCreateOrderModal());
  }

  // Search input
  const searchInput = document.getElementById("order-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchOrderText = e.target.value;
      onRefresh();
    });
  }

  // Channel filter
  document.querySelectorAll(".channel-pills .pill-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedChannel = btn.dataset.channel;
      onRefresh();
    });
  });

  // Advance Order Pipeline
  document.querySelectorAll(".btn-advance-order").forEach((btn) => {
    btn.addEventListener("click", () => {
      const orderId = btn.dataset.id;
      const nextStatus = btn.dataset.next;
      store.advanceOrderStatus(orderId, nextStatus);

      if (nextStatus === "Dispatched") {
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
        toast.success(`Order marked Dispatched! Stock permanently relieved from warehouse.`);
      } else if (nextStatus === "Delivered") {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
        toast.success(`Order delivered successfully to customer!`);
      } else {
        toast.info(`Order updated to: ${nextStatus}`);
      }
      onRefresh();
    });
  });

  // View Packing Slip
  document.querySelectorAll(".btn-view-slip").forEach((btn) => {
    btn.addEventListener("click", () => {
      modals.openPackingSlipModal(btn.dataset.id);
    });
  });

  // Inspect Customer Profile & History
  document.querySelectorAll(".btn-customer-inspect").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      modals.openCustomerModal({
        name: btn.dataset.name,
        email: btn.dataset.email
      });
    });
  });
}
