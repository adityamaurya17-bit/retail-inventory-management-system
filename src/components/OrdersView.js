import { store } from "../state/store.js";
import { modals } from "./Modals.js";
import { toast } from "./Toast.js";
import confetti from "canvas-confetti";

let selectedChannel = "All";
let searchOrderText = "";

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
      <div class="view-header">
        <div>
          <h1 class="view-title">Omnichannel Order Fulfillment & Wave Dispatch</h1>
          <p class="view-subtitle">Intelligent warehouse routing, wave picking verification, and automated carrier dispatch</p>
        </div>
        <div class="header-actions">
          <button id="btn-create-order-view" class="btn btn-primary btn-sm">
            <i data-lucide="plus-circle"></i>
            <span>Create Sales Order</span>
          </button>
        </div>
      </div>

      <!-- Toolbar & Channel Chips -->
      <div class="toolbar-card">
        <div class="search-input-wrapper">
          <i data-lucide="search" class="search-icon"></i>
          <input type="text" id="order-search-input" placeholder="Search by Order #, Customer, or Carrier..." value="${searchOrderText}" />
        </div>

        <div class="channel-pills">
          ${channels
            .map(
              (ch) => `
            <button class="pill-btn ${selectedChannel === ch ? "active" : ""}" data-channel="${ch}">
              ${ch}
            </button>
          `
            )
            .join("")}
        </div>
      </div>

      <!-- Fulfillment Pipeline Kanban Board -->
      <div class="kanban-pipeline-grid">
        ${pipelineStages
          .map((stage) => {
            const stageOrders = filtered.filter((o) => o.status === stage.id);
            return `
            <div class="kanban-column">
              <div class="kanban-column-header">
                <div class="flex-center gap-xs">
                  <i data-lucide="${stage.icon}" class="text-accent" style="width: 16px; height: 16px;"></i>
                  <span class="kanban-title">${stage.label}</span>
                </div>
                <span class="badge ${stage.color}">${stageOrders.length}</span>
              </div>

              <div class="kanban-cards-stack">
                ${
                  stageOrders.length === 0
                    ? `<div class="kanban-empty">No orders</div>`
                    : stageOrders
                        .map((ord) => {
                          const wh = warehouses.find((w) => w.id === ord.warehouseId);
                          return `
                      <div class="order-kanban-card">
                        <div class="flex-between">
                          <span class="order-card-num font-mono font-bold">${ord.orderNumber}</span>
                          <span class="badge badge-subtle text-xs">${ord.customer.channel}</span>
                        </div>

                        <div class="order-customer-info">
                          <div class="font-bold text-sm">${ord.customer.name}</div>
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
                                <i data-lucide="map-pin" style="width: 12px; height: 12px;"></i>
                                <span>${ord.trackingNumber}</span>
                              </div>`
                            : ""
                        }

                        <div class="order-card-actions">
                          <button class="btn btn-ghost btn-xs btn-view-slip" data-id="${ord.id}" title="View & Print Packing Slip">
                            <i data-lucide="file-text"></i>
                            <span>Slip</span>
                          </button>

                          ${
                            stage.next
                              ? `
                            <button class="btn btn-primary btn-xs btn-advance-order" data-id="${ord.id}" data-next="${stage.next}">
                              <span>${stage.btnText}</span>
                              <i data-lucide="chevron-right"></i>
                            </button>
                          `
                              : `<span class="badge badge-success text-xs">Complete</span>`
                          }
                        </div>
                      </div>
                    `;
                        })
                        .join("")
                }
              </div>
            </div>
          `;
          })
          .join("")}
      </div>
    </div>
  `;
}

export function setupOrdersEvents(onRefresh) {
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
}
