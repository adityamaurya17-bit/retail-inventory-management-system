import { store } from "../state/store.js";
import { modals } from "./Modals.js";
import { toast } from "./Toast.js";

/**
 * Enterprise Navigation Sidebar (Shopify / Stripe / Amazon Seller Central inspired)
 */
export function renderSidebar(currentTab, onTabChange) {
  const products = store.getProducts();
  const salesOrders = store.getSalesOrders();
  const pendingOrders = salesOrders.filter((o) => o.status !== "Delivered" && o.status !== "Dispatched").length;
  const dbStatus = store.getDbStatus ? store.getDbStatus() : { connected: false };

  let lowStockCount = 0;
  products.forEach((p) => {
    const summary = store.getProductStockSummary(p.id);
    if (summary.onHand <= p.reorderPoint) lowStockCount++;
  });

  const navGroups = [
    {
      group: "OVERVIEW",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" }
      ]
    },
    {
      group: "CATALOG",
      items: [
        { id: "products", label: "Products (PIM)", icon: "package" },
        { id: "categories", label: "Categories", icon: "tags" }
      ]
    },
    {
      group: "INVENTORY",
      items: [
        { id: "inventory", label: "Stock Levels", icon: "boxes" },
        { id: "warehouses", label: "Warehouses & Bins", icon: "warehouse" },
        { id: "transfers", label: "Stock Transfers", icon: "arrow-left-right" },
        { id: "stock-alerts", label: "Stock Alerts", icon: "alert-triangle", badge: lowStockCount > 0 ? lowStockCount : null, badgeClass: "badge-danger" }
      ]
    },
    {
      group: "SALES",
      items: [
        { id: "orders", label: "Orders & Fulfillment", icon: "shopping-bag", badge: pendingOrders > 0 ? pendingOrders : null, badgeClass: "badge-accent" },
        { id: "customers", label: "Customers", icon: "users" }
      ]
    },
    {
      group: "PROCUREMENT",
      items: [
        { id: "suppliers", label: "Suppliers Directory", icon: "truck" },
        { id: "purchase-orders", label: "Purchase Orders", icon: "file-text" }
      ]
    },
    {
      group: "ANALYTICS",
      items: [
        { id: "analytics", label: "Reports & Valuation", icon: "bar-chart-3" }
      ]
    },
    {
      group: "PROJECT & SPECS",
      items: [
        { id: "agile", label: "Agile Capstone (8 Epics)", icon: "git-merge" },
        { id: "architecture", label: "C4 Architecture & Algos", icon: "cpu" }
      ]
    }
  ];

  return `
    <aside class="app-sidebar" id="app-sidebar">
      <!-- Organization / Brand Header -->
      <div class="sidebar-brand">
        <div class="brand-badge-icon">
          <i data-lucide="boxes"></i>
        </div>
        <div class="brand-details">
          <div class="brand-company">RIMS Platform</div>
          <div class="brand-instance">
            <span class="instance-dot"></span>
            <span>Retail Operations v1.0</span>
          </div>
        </div>
      </div>

      <!-- Navigation Tree -->
      <nav class="sidebar-nav">
        ${navGroups
          .map(
            (grp) => `
          <div class="nav-section">
            <div class="nav-section-title">${grp.group}</div>
            <div class="nav-items-list">
              ${grp.items
                .map((item) => {
                  const isActive = currentTab === item.id || 
                    (item.id === "categories" && currentTab === "categories") ||
                    (item.id === "inventory" && currentTab === "inventory");
                  return `
                    <button type="button" class="nav-btn ${isActive ? "active" : ""}" data-tab="${item.id}" title="${item.label}">
                      <i data-lucide="${item.icon}"></i>
                      <span class="nav-label">${item.label}</span>
                      ${
                        item.badge
                          ? `<span class="nav-counter ${item.badgeClass || ""}">${item.badge}</span>`
                          : ""
                      }
                    </button>
                  `;
                })
                .join("")}
            </div>
          </div>
        `
          )
          .join("")}
      </nav>

      <!-- Sidebar Footer Status -->
      <div class="sidebar-footer">
        <div class="db-connection-status ${dbStatus.connected ? "online" : "offline"}" id="sidebar-db-status" title="${dbStatus.connected ? "Connected to PostgreSQL 18.6" : "PostgreSQL Disconnected"}">
          <span class="status-indicator-dot ${dbStatus.connected ? "pulse-green" : "pulse-red"}"></span>
          <span class="db-status-label">${dbStatus.connected ? "PostgreSQL 18.6 Active" : "PostgreSQL Offline"}</span>
        </div>
      </div>
    </aside>
  `;
}

/**
 * Top App Header Bar
 */
export function renderTopHeader(currentTab, onTabChange) {
  const currentUser = store.getCurrentUser ? store.getCurrentUser() : { role: "Admin", name: "Aarav Sharma" };
  const products = store.getProducts();
  const salesOrders = store.getSalesOrders();
  const lowStockCount = products.filter((p) => {
    const summary = store.getProductStockSummary(p.id);
    return summary.onHand <= p.reorderPoint;
  }).length;
  const pendingOrders = salesOrders.filter((o) => o.status !== "Delivered" && o.status !== "Dispatched").length;

  const breadcrumbMap = {
    dashboard: "Overview / Executive Dashboard",
    products: "Catalog / Product Information Management (PIM)",
    categories: "Catalog / Taxonomy & Categories",
    inventory: "Inventory / Multi-Warehouse Balances",
    warehouses: "Inventory / Facilities & Storage Bins",
    transfers: "Inventory / Inter-Warehouse Transfers",
    "stock-alerts": "Inventory / Stockout Alerts & Radar",
    orders: "Sales / Omnichannel Order Fulfillment",
    customers: "Sales / Customer Master Directory",
    suppliers: "Procurement / Supplier Vendor Registry",
    "purchase-orders": "Procurement / Purchase Orders & GRN",
    analytics: "Analytics / Valuation & Financial Reports",
    agile: "Project / Agile Delivery (8 Epics / 15 Sprints)",
    architecture: "Project / C4 Architecture & Core Algorithms"
  };

  const breadcrumb = breadcrumbMap[currentTab] || "Retail Operations / Dashboard";

  return `
    <header class="app-top-header" id="app-top-header">
      <div class="header-left-section">
        <!-- Mobile Sidebar Toggle -->
        <button type="button" class="btn-icon mobile-menu-toggle" id="btn-toggle-sidebar" title="Toggle Navigation Sidebar">
          <i data-lucide="menu"></i>
        </button>

        <!-- Breadcrumb / Section Identity -->
        <div class="header-breadcrumb">
          <i data-lucide="compass" class="breadcrumb-icon"></i>
          <span>${breadcrumb}</span>
        </div>
      </div>

      <!-- Center Search -->
      <div class="header-center-section">
        <div class="global-search-bar" id="global-search-wrapper">
          <i data-lucide="search" class="search-input-icon"></i>
          <input 
            type="text" 
            id="global-search-input" 
            placeholder="Search products, SKU, orders, suppliers, or press / to focus..." 
            autocomplete="off"
          />
          <kbd class="search-shortcut-badge">/</kbd>

          <!-- Search Results Dropdown -->
          <div class="search-results-dropdown" id="search-results-dropdown" style="display: none;"></div>
        </div>
      </div>

      <!-- Right Actions & User Profile -->
      <div class="header-right-section">
        <!-- Quick Action Trigger Dropdown -->
        <div class="quick-action-dropdown-wrapper">
          <button type="button" class="btn btn-primary btn-sm btn-quick-create" id="btn-quick-create" title="Quickly create retail records">
            <i data-lucide="plus"></i>
            <span>Quick Create</span>
            <i data-lucide="chevron-down" class="dropdown-chevron"></i>
          </button>

          <div class="quick-action-menu" id="quick-action-menu" style="display: none;">
            <button type="button" class="quick-menu-item" id="qm-new-order">
              <i data-lucide="shopping-bag"></i>
              <div>
                <div class="item-title">New Sales Order</div>
                <div class="item-desc">Create customer order with stock reservation</div>
              </div>
            </button>
            <button type="button" class="quick-menu-item" id="qm-new-po">
              <i data-lucide="file-plus"></i>
              <div>
                <div class="item-title">Issue Purchase Order</div>
                <div class="item-desc">Order stock replenishment from vendor</div>
              </div>
            </button>
            <button type="button" class="quick-menu-item" id="qm-transfer">
              <i data-lucide="arrow-left-right"></i>
              <div>
                <div class="item-title">Stock Transfer</div>
                <div class="item-desc">Move inventory between warehouses</div>
              </div>
            </button>
            <button type="button" class="quick-menu-item" id="qm-add-product">
              <i data-lucide="package-plus"></i>
              <div>
                <div class="item-title">Add New Product</div>
                <div class="item-desc">Register new SKU in PIM catalog</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Barcode Scanner Modal Trigger -->
        <button type="button" class="btn btn-secondary btn-sm header-tool-btn" id="btn-header-barcode" title="Open Barcode Scanner Simulator">
          <i data-lucide="scan-barcode"></i>
          <span class="desktop-only">Barcode</span>
        </button>

        <!-- Operational Alerts Bell with Counter -->
        <div class="notifications-wrapper">
          <button type="button" class="btn-icon header-tool-btn notification-bell-btn" id="btn-notifications-toggle" title="View Operational Alerts">
            <i data-lucide="bell"></i>
            ${lowStockCount + pendingOrders > 0 ? `<span class="bell-badge">${lowStockCount + pendingOrders}</span>` : ""}
          </button>

          <!-- Notifications Popover Panel -->
          <div class="notifications-panel" id="notifications-panel" style="display: none;">
            <div class="notif-header">
              <span class="notif-title">Operational Alerts</span>
              <span class="notif-badge">${lowStockCount + pendingOrders} Active</span>
            </div>
            <div class="notif-list">
              ${lowStockCount > 0 ? `
                <div class="notif-item alert-critical" id="notif-low-stock">
                  <i data-lucide="alert-triangle"></i>
                  <div>
                    <div class="notif-item-title">${lowStockCount} Products Below Reorder Level</div>
                    <div class="notif-item-desc">Stockout risk detected across active regional hubs.</div>
                  </div>
                </div>
              ` : ""}
              ${pendingOrders > 0 ? `
                <div class="notif-item alert-warning" id="notif-pending-orders">
                  <i data-lucide="clock"></i>
                  <div>
                    <div class="notif-item-title">${pendingOrders} Orders Awaiting Fulfillment</div>
                    <div class="notif-item-desc">Pending wave picking and carrier packaging.</div>
                  </div>
                </div>
              ` : ""}
              <div class="notif-item alert-info">
                <i data-lucide="database"></i>
                <div>
                  <div class="notif-item-title">PostgreSQL 18 Connected</div>
                  <div class="notif-item-desc">ACID transaction ledger actively synchronized.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dark/Light Theme Toggle -->
        <button type="button" class="btn-icon header-tool-btn" id="btn-header-theme" title="Toggle Dark/Light Mode">
          <i data-lucide="${document.documentElement.getAttribute("data-theme") === "dark" ? "sun" : "moon"}"></i>
        </button>

        <!-- User Authentication & Profile Widget -->
        ${currentUser ? `
          <div class="header-user-widget">
            <div class="user-pill" id="btn-user-dropdown" title="Session: ${currentUser.name} (${currentUser.role})">
              <span class="user-avatar-initials">${currentUser.name ? currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2) : "AD"}</span>
              <div class="user-meta desktop-only">
                <span class="user-display-name">${currentUser.name || "Aarav Sharma"}</span>
                <span class="user-role-label">${currentUser.role || "Admin"}</span>
              </div>
            </div>

            <!-- Sign Out Icon Button -->
            <button type="button" class="btn-icon header-logout-btn" id="btn-header-logout" title="Sign out of RIMS session">
              <i data-lucide="log-out"></i>
            </button>
          </div>
        ` : `
          <button type="button" class="btn btn-primary btn-sm btn-header-login" id="btn-header-login">
            <i data-lucide="log-in"></i>
            <span>Sign In</span>
          </button>
        `}
      </div>
    </header>
  `;
}

/**
 * Attach Event Handlers for Sidebar and Top Header
 */
export function setupNavigationEvents(onTabChange) {
  // Navigation tabs in sidebar
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;
      if (!targetTab) return;

      // Handle aliases
      if (targetTab === "categories" || targetTab === "inventory" || targetTab === "stock-alerts") {
        onTabChange("products");
      } else if (targetTab === "customers") {
        onTabChange("orders");
      } else if (targetTab === "purchase-orders") {
        onTabChange("suppliers");
      } else if (targetTab === "analytics") {
        onTabChange("architecture");
      } else {
        onTabChange(targetTab);
      }

      // Close mobile sidebar if open
      const sidebar = document.getElementById("app-sidebar");
      if (sidebar && sidebar.classList.contains("mobile-open")) {
        sidebar.classList.remove("mobile-open");
      }
    });
  });

  // Mobile sidebar toggle
  const toggleBtn = document.getElementById("btn-toggle-sidebar");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const sidebar = document.getElementById("app-sidebar");
      if (sidebar) sidebar.classList.toggle("mobile-open");
    });
  }

  // Quick Create Dropdown
  const qcBtn = document.getElementById("btn-quick-create");
  const qcMenu = document.getElementById("quick-action-menu");
  if (qcBtn && qcMenu) {
    qcBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = qcMenu.style.display === "block";
      qcMenu.style.display = isVisible ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (qcMenu && !qcMenu.contains(e.target)) {
        qcMenu.style.display = "none";
      }
    });

    const qmOrder = document.getElementById("qm-new-order");
    if (qmOrder) qmOrder.addEventListener("click", () => { qcMenu.style.display = "none"; modals.openCreateOrderModal(); });

    const qmPO = document.getElementById("qm-new-po");
    if (qmPO) qmPO.addEventListener("click", () => { qcMenu.style.display = "none"; modals.openCreatePOModal(); });

    const qmTransfer = document.getElementById("qm-transfer");
    if (qmTransfer) qmTransfer.addEventListener("click", () => { qcMenu.style.display = "none"; modals.openCreateTransferModal(); });

    const qmProd = document.getElementById("qm-add-product");
    if (qmProd) qmProd.addEventListener("click", () => { qcMenu.style.display = "none"; modals.openProductModal(); });
  }

  // Notifications Popover
  const notifBtn = document.getElementById("btn-notifications-toggle");
  const notifPanel = document.getElementById("notifications-panel");
  if (notifBtn && notifPanel) {
    notifBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = notifPanel.style.display === "block";
      notifPanel.style.display = isVisible ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (notifPanel && !notifPanel.contains(e.target)) {
        notifPanel.style.display = "none";
      }
    });

    const notifLowStock = document.getElementById("notif-low-stock");
    if (notifLowStock) notifLowStock.addEventListener("click", () => { notifPanel.style.display = "none"; onTabChange("products"); });

    const notifPending = document.getElementById("notif-pending-orders");
    if (notifPending) notifPending.addEventListener("click", () => { notifPanel.style.display = "none"; onTabChange("orders"); });
  }

  // Barcode Scanner button
  const barcodeBtn = document.getElementById("btn-header-barcode");
  if (barcodeBtn) {
    barcodeBtn.addEventListener("click", () => modals.openBarcodeScannerModal());
  }

  // Dark/Light Theme Switcher
  const themeBtn = document.getElementById("btn-header-theme");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("rims_theme", nextTheme);
      themeBtn.innerHTML = `<i data-lucide="${nextTheme === "dark" ? "sun" : "moon"}"></i>`;
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // User Profile Login / Logout
  const loginHeaderBtn = document.getElementById("btn-header-login");
  if (loginHeaderBtn) {
    loginHeaderBtn.addEventListener("click", () => modals.openLoginModal());
  }

  const userDropdownBtn = document.getElementById("btn-user-dropdown");
  if (userDropdownBtn) {
    userDropdownBtn.addEventListener("click", () => modals.openLoginModal());
  }

  const logoutBtn = document.getElementById("btn-header-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      const user = store.getCurrentUser ? store.getCurrentUser() : null;
      const userName = user ? user.name : "User";
      if (confirm(`Sign out ${userName} from RIMS session?`)) {
        store.logout();
        toast.info("You have signed out of your session.");
        modals.openLoginModal();
      }
    });
  }

  // Global Universal Search & "/" keyboard shortcut
  const searchInput = document.getElementById("global-search-input");
  const searchDropdown = document.getElementById("search-results-dropdown");

  if (searchInput && searchDropdown) {
    window.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== searchInput && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
        e.preventDefault();
        searchInput.focus();
      }
    });

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        searchDropdown.style.display = "none";
        searchDropdown.innerHTML = "";
        return;
      }

      const products = store.getProducts();
      const orders = store.getSalesOrders();
      const suppliers = store.getSuppliers();

      const matchedProducts = products.filter(p => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query)).slice(0, 4);
      const matchedOrders = orders.filter(o => o.orderNumber.toLowerCase().includes(query) || o.customer.name.toLowerCase().includes(query)).slice(0, 3);
      const matchedSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(query)).slice(0, 2);

      if (matchedProducts.length === 0 && matchedOrders.length === 0 && matchedSuppliers.length === 0) {
        searchDropdown.innerHTML = `<div class="search-empty-state">No matching records found for "${e.target.value}"</div>`;
      } else {
        searchDropdown.innerHTML = `
          ${matchedProducts.length > 0 ? `
            <div class="search-group-title">Products (${matchedProducts.length})</div>
            ${matchedProducts.map(p => `
              <div class="search-result-row search-prod-item" data-tab="products">
                <i data-lucide="package"></i>
                <div class="search-row-details">
                  <span class="search-row-title">${p.name}</span>
                  <span class="search-row-meta">${p.sku} &bull; ${p.category} &bull; $${p.sellingPrice.toFixed(2)}</span>
                </div>
              </div>
            `).join("")}
          ` : ""}

          ${matchedOrders.length > 0 ? `
            <div class="search-group-title">Orders (${matchedOrders.length})</div>
            ${matchedOrders.map(o => `
              <div class="search-result-row search-order-item" data-tab="orders">
                <i data-lucide="shopping-bag"></i>
                <div class="search-row-details">
                  <span class="search-row-title">${o.orderNumber} - ${o.customer.name}</span>
                  <span class="search-row-meta">$${o.totalAmount.toFixed(2)} &bull; Status: ${o.status}</span>
                </div>
              </div>
            `).join("")}
          ` : ""}

          ${matchedSuppliers.length > 0 ? `
            <div class="search-group-title">Suppliers (${matchedSuppliers.length})</div>
            ${matchedSuppliers.map(s => `
              <div class="search-result-row search-supp-item" data-tab="suppliers">
                <i data-lucide="truck"></i>
                <div class="search-row-details">
                  <span class="search-row-title">${s.name}</span>
                  <span class="search-row-meta">Lead Time: ${s.leadTimeDays}d &bull; Rating: ${s.rating}★</span>
                </div>
              </div>
            `).join("")}
          ` : ""}
        `;

        if (window.lucide) window.lucide.createIcons({ root: searchDropdown });

        searchDropdown.querySelectorAll(".search-result-row").forEach(row => {
          row.addEventListener("click", () => {
            searchDropdown.style.display = "none";
            searchInput.value = "";
            const tab = row.dataset.tab;
            if (tab) onTabChange(tab);
          });
        });
      }

      searchDropdown.style.display = "block";
    });

    document.addEventListener("click", (e) => {
      if (searchDropdown && !searchDropdown.contains(e.target) && e.target !== searchInput) {
        searchDropdown.style.display = "none";
      }
    });
  }

  // Sidebar DB Status Click
  const sbDbStatus = document.getElementById("sidebar-db-status");
  if (sbDbStatus) {
    sbDbStatus.addEventListener("click", async () => {
      const status = store.getDbStatus ? store.getDbStatus() : { connected: false };
      if (status.connected) {
        toast.success(`PostgreSQL 18: Active on localhost:5432 (retail_inventory_db)`);
      } else {
        toast.info("Connecting to PostgreSQL API at http://localhost:5000/api...");
        await store.syncWithBackend();
      }
    });
  }
}
