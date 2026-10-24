import { store } from "../../state/store.js";
import { modals } from "../modals/ModalManager.js";

/**
 * Enterprise Command Palette (Linear / Stripe / Shopify inspired)
 * Keyboard shortcuts: Ctrl+K / Cmd+K / "/" to open, Arrow keys to navigate, Enter to select, Escape to close.
 */
class CommandPaletteService {
  constructor() {
    this.dialog = null;
    this.isOpen = false;
    this.selectedIndex = 0;
    this.results = [];
    this.onTabChange = null;
    this.init();
  }

  init() {
    this.ensureDialog();
    this.attachGlobalShortcuts();
  }

  setTabChangeHandler(handler) {
    this.onTabChange = handler;
  }

  ensureDialog() {
    if (!this.dialog) {
      let d = document.getElementById("command-palette-dialog");
      if (!d) {
        d = document.createElement("dialog");
        d.id = "command-palette-dialog";
        d.className = "command-palette-dialog";
        document.body.appendChild(d);
      }
      this.dialog = d;

      // Close when clicking outside the dialog card container (.cp-container)
      this.dialog.addEventListener("click", (e) => {
        const container = this.dialog.querySelector(".cp-container");
        if (container) {
          const rect = container.getBoundingClientRect();
          const isInside =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;
          if (!isInside) {
            this.close();
          }
        } else if (e.target === this.dialog) {
          this.close();
        }
      });

      // Global capture-phase click listener to guarantee outside click dismisses popup
      document.addEventListener("click", (e) => {
        if (!this.isOpen || !this.dialog) return;
        const topInput = document.getElementById("top-nav-search-input");
        if (topInput && (e.target === topInput || topInput.contains(e.target))) {
          return;
        }
        const container = this.dialog.querySelector(".cp-container");
        if (container) {
          const rect = container.getBoundingClientRect();
          const isInside =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;
          if (!isInside) {
            this.close();
          }
        }
      }, true);

      this.dialog.addEventListener("cancel", (e) => {
        e.preventDefault();
        this.close();
      });
    }
  }

  attachGlobalShortcuts() {
    window.addEventListener("keydown", (e) => {
      // Ctrl+K, Cmd+K, or "/" when not focused on an input
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if ((isCmdOrCtrl && e.key.toLowerCase() === "k") || (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName))) {
        e.preventDefault();
        this.open();
      } else if (this.isOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          this.close();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          this.moveSelection(1);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          this.moveSelection(-1);
        } else if (e.key === "Enter") {
          e.preventDefault();
          this.executeSelected();
        }
      }
    });
  }

  open(initialQuery = "") {
    this.ensureDialog();
    this.isOpen = true;
    this.selectedIndex = 0;
    this.render();
    try {
      this.dialog.showModal();
    } catch {
      this.dialog.setAttribute("open", "");
    }
    const input = this.dialog.querySelector("#cp-search-input");
    if (input) {
      input.value = initialQuery;
      if (initialQuery) {
        this.handleSearch(initialQuery);
      }
      input.focus();
    }
  }

  close() {
    if (!this.dialog) return;
    this.isOpen = false;
    try {
      this.dialog.close();
    } catch {
      this.dialog.removeAttribute("open");
    }
    const topInput = document.getElementById("top-nav-search-input");
    if (topInput && document.activeElement === topInput) {
      topInput.blur();
    }
  }

  moveSelection(direction) {
    if (this.results.length === 0) return;
    this.selectedIndex = (this.selectedIndex + direction + this.results.length) % this.results.length;
    this.updateActiveItem();
  }

  updateActiveItem() {
    const items = this.dialog.querySelectorAll(".cp-item");
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add("active");
        item.scrollIntoView({ block: "nearest" });
      } else {
        item.classList.remove("active");
      }
    });
  }

  executeSelected() {
    if (this.results.length === 0 || this.selectedIndex < 0) return;
    const selected = this.results[this.selectedIndex];
    if (selected && typeof selected.action === "function") {
      this.close();
      selected.action();
    }
  }

  render() {
    this.dialog.innerHTML = `
      <div class="cp-container">
        <div class="cp-header">
          <i data-lucide="search" class="cp-search-icon"></i>
          <input 
            type="text" 
            id="cp-search-input" 
            class="cp-search-input" 
            placeholder="Type a command, search products, SKUs, orders, or suppliers..." 
            autocomplete="off"
            spellcheck="false"
          />
          <kbd class="cp-kbd">ESC</kbd>
        </div>

        <div class="cp-body" id="cp-results-container">
          ${this.renderInitialState()}
        </div>

        <div class="cp-footer">
          <div class="cp-footer-hints">
            <span><kbd>&uarr;</kbd> <kbd>&darr;</kbd> Navigate</span>
            <span><kbd>&crarr;</kbd> Select</span>
            <span><kbd>ESC</kbd> Close</span>
          </div>
          <div class="cp-footer-context">
            <span>Stockora Quick Command</span>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons({ root: this.dialog });

    const input = this.dialog.querySelector("#cp-search-input");
    input.addEventListener("input", (e) => {
      this.handleSearch(e.target.value);
    });

    this.attachItemEvents();
  }

  renderInitialState() {
    const quickActions = [
      {
        id: "qa-order",
        title: "Create New Sales Order",
        subtitle: "Omnichannel checkout with atomic inventory reservation",
        icon: "shopping-bag",
        category: "QUICK ACTIONS",
        action: () => modals.openCreateOrderModal()
      },
      {
        id: "qa-po",
        title: "Issue Purchase Order",
        subtitle: "Procurement order to replenish vendor inventory",
        icon: "file-plus",
        category: "QUICK ACTIONS",
        action: () => modals.openCreatePOModal()
      },
      {
        id: "qa-transfer",
        title: "Initiate Stock Transfer",
        subtitle: "Inter-warehouse transit between distribution hubs",
        icon: "arrow-left-right",
        category: "QUICK ACTIONS",
        action: () => modals.openCreateTransferModal()
      },
      {
        id: "qa-product",
        title: "Register New Product (SKU)",
        subtitle: "Add product master record with cost and pricing",
        icon: "package-plus",
        category: "QUICK ACTIONS",
        action: () => modals.openProductModal()
      },
      {
        id: "qa-barcode",
        title: "Launch Barcode Scanner Simulator",
        subtitle: "Scan EAN-13 barcodes to verify physical bin stock",
        icon: "scan-barcode",
        category: "QUICK ACTIONS",
        action: () => modals.openBarcodeScannerModal()
      }
    ];

    const navigationJumps = [
      {
        id: "nav-dash",
        title: "Go to Executive Dashboard",
        subtitle: "KPI overview, revenue analytics, and operational alerts",
        icon: "layout-dashboard",
        category: "NAVIGATION",
        action: () => this.onTabChange && this.onTabChange("dashboard")
      },
      {
        id: "nav-prod",
        title: "Go to Products (PIM Catalog)",
        subtitle: "SKU catalog, margins, and stock levels",
        icon: "package",
        category: "NAVIGATION",
        action: () => this.onTabChange && this.onTabChange("products")
      },
      {
        id: "nav-inv",
        title: "Go to Stock Balances & Inventory Ledger",
        subtitle: "Multi-warehouse unit balances, ATP, bin addresses, and cycle counts",
        icon: "boxes",
        category: "NAVIGATION",
        action: () => this.onTabChange && this.onTabChange("inventory")
      },
      {
        id: "nav-wh",
        title: "Go to Warehouses & Bins",
        subtitle: "Facility storage capacities and 2D bin topology",
        icon: "warehouse",
        category: "NAVIGATION",
        action: () => this.onTabChange && this.onTabChange("warehouses")
      },
      {
        id: "nav-orders",
        title: "Go to Orders Kanban Pipeline",
        subtitle: "Stage-gate fulfillment and wave picking",
        icon: "shopping-bag",
        category: "NAVIGATION",
        action: () => this.onTabChange && this.onTabChange("orders")
      },
      {
        id: "nav-supp",
        title: "Go to Suppliers & Procure-to-Pay",
        subtitle: "Vendor directory, lead times, and PO receiving",
        icon: "truck",
        category: "NAVIGATION",
        action: () => this.onTabChange && this.onTabChange("suppliers")
      },
      {
        id: "nav-charter",
        title: "Go to Project Charter & Team",
        subtitle: "Executive mandate, triple constraints, and Scrum team roster",
        icon: "award",
        category: "NAVIGATION",
        action: () => {
          window.location.hash = "charter";
          this.onTabChange && this.onTabChange("agile");
        }
      },
      {
        id: "nav-arch",
        title: "Go to C4 Architecture & Core Algorithms",
        subtitle: "C4 model diagrams, reactive simulators, ERD, and DDD",
        icon: "cpu",
        category: "NAVIGATION",
        action: () => this.onTabChange && this.onTabChange("architecture")
      }
    ];

    this.results = [...quickActions, ...navigationJumps];
    return this.renderGroupedResults(this.results);
  }

  handleSearch(rawQuery) {
    const query = (rawQuery || "").toLowerCase().trim();
    const container = this.dialog.querySelector("#cp-results-container");
    if (!container) return;

    if (!query) {
      container.innerHTML = this.renderInitialState();
      if (window.lucide) window.lucide.createIcons({ root: container });
      this.attachItemEvents();
      return;
    }

    const products = store.getProducts();
    const orders = store.getSalesOrders();
    const suppliers = store.getSuppliers();
    const warehouses = store.getWarehouses();
    const transfers = store.getStockTransfers ? store.getStockTransfers() : [];
    const purchaseOrders = store.getPurchaseOrders ? store.getPurchaseOrders() : [];

    const matchedProducts = products
      .filter((p) => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query) || (p.category && p.category.toLowerCase().includes(query)))
      .slice(0, 5)
      .map((p) => ({
        id: `p-${p.id}`,
        title: p.name,
        subtitle: `${p.sku} • ${p.category} • Cost: $${p.costPrice.toFixed(2)} | Price: $${p.sellingPrice.toFixed(2)}`,
        icon: "package",
        category: "PRODUCTS (CATALOG)",
        action: () => {
          if (this.onTabChange) this.onTabChange("products");
        }
      }));

    const matchedOrders = orders
      .filter((o) => o.orderNumber.toLowerCase().includes(query) || (o.customer && o.customer.name.toLowerCase().includes(query)))
      .slice(0, 4)
      .map((o) => ({
        id: `o-${o.id}`,
        title: `${o.orderNumber} - ${o.customer?.name || "Retail Order"}`,
        subtitle: `$${o.totalAmount.toFixed(2)} • Status: ${o.status} • Channel: ${o.channel || "Web Store"}`,
        icon: "shopping-bag",
        category: "SALES ORDERS",
        action: () => {
          if (this.onTabChange) this.onTabChange("orders");
        }
      }));

    const matchedSuppliers = suppliers
      .filter((s) => s.name.toLowerCase().includes(query) || (s.code && s.code.toLowerCase().includes(query)))
      .slice(0, 3)
      .map((s) => ({
        id: `s-${s.id}`,
        title: s.name,
        subtitle: `Vendor Code: ${s.code || "VND"} • Lead Time: ${s.leadTimeDays}d • Rating: ${s.rating}★`,
        icon: "truck",
        category: "SUPPLIERS",
        action: () => {
          if (this.onTabChange) this.onTabChange("suppliers");
        }
      }));

    const matchedWarehouses = warehouses
      .filter((w) => w.name.toLowerCase().includes(query) || w.code.toLowerCase().includes(query) || w.city.toLowerCase().includes(query))
      .slice(0, 3)
      .map((w) => ({
        id: `w-${w.id}`,
        title: `${w.name} (${w.code})`,
        subtitle: `${w.city}, ${w.state} • Capacity: ${w.capacity.toLocaleString()} units`,
        icon: "warehouse",
        category: "WAREHOUSES",
        action: () => {
          if (this.onTabChange) this.onTabChange("warehouses");
        }
      }));

    const matchedTransfers = transfers
      .filter((t) => t.transferNumber?.toLowerCase().includes(query) || t.fromWarehouseId?.toLowerCase().includes(query) || t.toWarehouseId?.toLowerCase().includes(query))
      .slice(0, 3)
      .map((t) => ({
        id: `t-${t.id}`,
        title: `Transfer ${t.transferNumber || t.id}`,
        subtitle: `${t.fromWarehouseId} → ${t.toWarehouseId} • Status: ${t.status}`,
        icon: "arrow-left-right",
        category: "STOCK TRANSFERS",
        action: () => {
          if (this.onTabChange) this.onTabChange("transfers");
        }
      }));

    const matchedCommands = [];
    if ("sign out".includes(query) || "logout".includes(query) || "log out".includes(query) || query === "exit") {
      matchedCommands.push({
        id: "cmd-signout",
        title: "Sign Out of Stockora",
        subtitle: "Terminate active session and lock administrative console",
        icon: "log-out",
        category: "SYSTEM COMMANDS",
        action: () => {
          modals.openSignOutConfirmModal(() => {
            store.logout();
            toast.info("Signed out of Administrator Console.");
            window.location.hash = "#login";
            if (this.onTabChange) this.onTabChange("login");
          });
        }
      });
    }

    this.results = [...matchedCommands, ...matchedProducts, ...matchedOrders, ...matchedWarehouses, ...matchedSuppliers, ...matchedTransfers];
    this.selectedIndex = 0;

    if (this.results.length === 0) {
      container.innerHTML = `
        <div class="cp-empty-state">
          <i data-lucide="search-x" class="cp-empty-icon"></i>
          <div class="cp-empty-title">No matching records</div>
          <div class="cp-empty-desc">No products, orders, suppliers, or warehouses match "<strong>${escapeHtml(rawQuery)}</strong>".</div>
        </div>
      `;
    } else {
      container.innerHTML = this.renderGroupedResults(this.results);
    }

    if (window.lucide) window.lucide.createIcons({ root: container });
    this.attachItemEvents();
  }

  renderGroupedResults(items) {
    const groups = {};
    items.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });

    let overallIndex = 0;
    let html = "";

    for (const [catName, catItems] of Object.entries(groups)) {
      html += `<div class="cp-group-header">${catName}</div>`;
      html += `<div class="cp-group-items">`;
      for (const item of catItems) {
        const isSelected = overallIndex === this.selectedIndex;
        html += `
          <button type="button" class="cp-item ${isSelected ? "active" : ""}" data-index="${overallIndex}" data-id="${item.id}">
            <div class="cp-item-icon">
              <i data-lucide="${item.icon}"></i>
            </div>
            <div class="cp-item-content">
              <span class="cp-item-title">${item.title}</span>
              <span class="cp-item-subtitle">${item.subtitle}</span>
            </div>
            <span class="cp-item-action-hint"><kbd>&crarr;</kbd></span>
          </button>
        `;
        overallIndex++;
      }
      html += `</div>`;
    }

    return html;
  }

  attachItemEvents() {
    const items = this.dialog.querySelectorAll(".cp-item");
    items.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        const idx = parseInt(el.dataset.index, 10);
        if (!isNaN(idx)) {
          this.selectedIndex = idx;
          this.updateActiveItem();
        }
      });

      el.addEventListener("click", () => {
        const idx = parseInt(el.dataset.index, 10);
        if (!isNaN(idx)) {
          this.selectedIndex = idx;
          this.executeSelected();
        }
      });
    });
  }
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const commandPalette = new CommandPaletteService();
