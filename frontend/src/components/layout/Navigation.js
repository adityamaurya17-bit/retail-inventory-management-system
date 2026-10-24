import { store } from "../../state/store.js";
import { modals } from "../modals/ModalManager.js";
import { toast } from "../toast/Toast.js";
import { commandPalette } from "../common/CommandPalette.js";
import { renderRimsLogoMark } from "../brand/RimsLogo.js";

/**
 * Enterprise Navigation Sidebar (Shopify / Stripe / Amazon Seller Central inspired)
 */
export function renderSidebar(currentTab, onTabChange) {
  const products = store.getProducts();
  const salesOrders = store.getSalesOrders();
  const pendingOrders = salesOrders.filter((o) => o.status !== "Delivered" && o.status !== "Dispatched").length;
  const dbStatus = store.getDbStatus ? store.getDbStatus() : { connected: false };
  const isCollapsed = localStorage.getItem("rims_sidebar_collapsed") === "true";

  let lowStockCount = 0;
  products.forEach((p) => {
    const summary = store.getProductStockSummary(p.id);
    if (summary.onHand <= p.reorderPoint) lowStockCount++;
  });

  const operationalNav = [
    {
      group: "INVENTORY & WAREHOUSES",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
        { id: "products", label: "Products", icon: "package" },
        { id: "inventory", label: "Inventory", icon: "boxes" },
        { id: "warehouses", label: "Warehouses", icon: "warehouse" },
        { id: "transfers", label: "Transfers", icon: "arrow-left-right" }
      ]
    },
    {
      group: "ORDERS & PROCUREMENT",
      items: [
        { id: "orders", label: "Orders", icon: "shopping-bag", badge: pendingOrders > 0 ? pendingOrders : null, badgeClass: "badge-accent" },
        { id: "suppliers", label: "Suppliers", icon: "truck" },
        { id: "purchase-orders", label: "Purchase Orders", icon: "file-check" }
      ]
    }
  ];

  return `
    <aside class="app-sidebar ${isCollapsed ? "collapsed" : ""}" id="app-sidebar">
      <!-- Organization / Brand Header (Matches Header Height: 56px) -->
      <div class="sidebar-brand" id="sidebar-brand-header">
        <div class="brand-badge-icon" title="Stockora">
          <img src="/stockora-icon.png" alt="Stockora" />
        </div>
        <span class="brand-company">Stockora</span>
      </div>

      <!-- Navigation Tree -->
      <nav class="sidebar-nav">
        ${operationalNav
          .map(
            (grp) => `
          <div class="nav-section">
            <div class="nav-section-title">${grp.group}</div>
            <div class="nav-items-list">
              ${grp.items
                .map((item) => {
                  const isActive = currentTab === item.id || 
                    (item.id === "inventory" && currentTab === "inventory") ||
                    (item.id === "stock-alerts" && currentTab === "stock-alerts") ||
                    (item.id === "analytics" && currentTab === "analytics");
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
  const isCollapsed = localStorage.getItem("rims_sidebar_collapsed") === "true";
  const currentUser = store.getCurrentUser ? store.getCurrentUser() : { role: "Warehouse & Inventory Management", name: "ADITYA MAURYA" };
  const products = store.getProducts();
  const salesOrders = store.getSalesOrders();
  const lowStockCount = products.filter((p) => {
    const summary = store.getProductStockSummary(p.id);
    return summary.onHand <= p.reorderPoint;
  }).length;
  const pendingOrders = salesOrders.filter((o) => o.status !== "Delivered" && o.status !== "Dispatched").length;

  return `
    <header class="app-top-header" id="app-top-header">
      <div class="header-left-section">
        <!-- Desktop Header Sidebar Toggle -->
        <button type="button" class="btn-icon header-sidebar-toggle desktop-only" id="btn-header-sidebar-toggle" title="${isCollapsed ? "Open Sidebar (Ctrl+B)" : "Close Sidebar (Ctrl+B)"}" aria-label="Toggle Navigation Sidebar">
          <i data-lucide="${isCollapsed ? "panel-left-open" : "panel-left-close"}"></i>
        </button>

        <!-- Mobile Sidebar Toggle -->
        <button type="button" class="btn-icon mobile-menu-toggle" id="btn-toggle-sidebar" title="Toggle Navigation Sidebar">
          <i data-lucide="menu"></i>
        </button>
      </div>

      <!-- Modern Search Bar -->
      <div class="header-center-section">
        <form class="top-nav-search-bar" id="top-nav-search-form" role="search" onsubmit="return false;">
          <i data-lucide="search" class="top-nav-search-icon"></i>
          <input 
            type="search" 
            id="top-nav-search-input" 
            class="top-nav-search-input" 
            placeholder="Search products, inventory, orders, suppliers..." 
            autocomplete="off" 
            spellcheck="false" 
            aria-label="Search"
          />
        </form>
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
            <div class="user-pill" title="Administrator: ${currentUser.name} (${currentUser.email || 'adityamaurya@retailhub.in'})">
              <span class="user-avatar-initials">${currentUser.name ? currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2) : "AM"}</span>
              <div class="user-meta desktop-only">
                <span class="user-display-name">${currentUser.name || "ADITYA MAURYA"}</span>
                <span class="user-role-label">Administrator</span>
              </div>
            </div>

            <!-- Sign Out Icon Button -->
            <button type="button" class="btn-icon header-logout-btn" id="btn-header-logout" title="Sign out of Stockora session">
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
      if (targetTab === "categories") {
        onTabChange("products");
      } else if (targetTab === "stock-alerts") {
        onTabChange("inventory");
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

  // Mobile sidebar toggle & backdrop
  const toggleBtn = document.getElementById("btn-toggle-sidebar");
  const mobileBackdrop = document.getElementById("sidebar-mobile-backdrop");
  const sidebar = document.getElementById("app-sidebar");

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      const isOpen = sidebar.classList.toggle("mobile-open");
      if (mobileBackdrop) mobileBackdrop.classList.toggle("active", isOpen);
    });
  }

  if (mobileBackdrop && sidebar) {
    mobileBackdrop.addEventListener("click", () => {
      sidebar.classList.remove("mobile-open");
      mobileBackdrop.classList.remove("active");
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
    loginHeaderBtn.addEventListener("click", () => onTabChange("login"));
  }

  const logoutBtn = document.getElementById("btn-header-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      modals.openSignOutConfirmModal(() => {
        store.logout();
        toast.info("Signed out of Administrator Console.");
        window.location.hash = "#home";
        onTabChange("home");
      });
    });
  }

  // Seamless Full Sidebar Open / Close Handler
  function toggleSidebar(forceState) {
    const sidebar = document.getElementById("app-sidebar");
    if (!sidebar) return;
    const isNowCollapsed = forceState !== undefined 
      ? forceState 
      : !sidebar.classList.contains("collapsed");
    
    if (isNowCollapsed) {
      sidebar.classList.add("collapsed");
    } else {
      sidebar.classList.remove("collapsed");
    }
    localStorage.setItem("rims_sidebar_collapsed", isNowCollapsed ? "true" : "false");

    // Update Header Sidebar Toggle Button
    const headerToggleBtn = document.getElementById("btn-header-sidebar-toggle");
    if (headerToggleBtn) {
      headerToggleBtn.title = isNowCollapsed ? "Open Sidebar (Ctrl+B)" : "Close Sidebar (Ctrl+B)";
      headerToggleBtn.innerHTML = `<i data-lucide="${isNowCollapsed ? "panel-left-open" : "panel-left-close"}"></i>`;
    }

    if (window.lucide && headerToggleBtn) {
      window.lucide.createIcons({ root: headerToggleBtn });
    }
  }


  // Header Desktop Sidebar Toggle
  const headerToggleBtn = document.getElementById("btn-header-sidebar-toggle");
  if (headerToggleBtn) {
    headerToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSidebar();
    });
  }

  // Global Ctrl+B / Cmd+B keyboard shortcut for sidebar toggle
  if (window._rimsSidebarKeyHandler) {
    window.removeEventListener("keydown", window._rimsSidebarKeyHandler);
  }
  window._rimsSidebarKeyHandler = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.isContentEditable);
      if (!isInput) {
        e.preventDefault();
        toggleSidebar();
      }
    }
  };
  window.addEventListener("keydown", window._rimsSidebarKeyHandler);

  // Global Top Search Input
  commandPalette.setTabChangeHandler(onTabChange);
  const searchInput = document.getElementById("top-nav-search-input");
  const searchForm = document.getElementById("top-nav-search-form");

  if (searchInput) {
    searchInput.addEventListener("click", (e) => {
      e.stopPropagation();
      commandPalette.open(searchInput.value || "");
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commandPalette.open(searchInput.value || "");
      }
    });
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (searchInput) commandPalette.open(searchInput.value || "");
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
        toast.info("Connecting to PostgreSQL API...");
        await store.syncWithBackend();
      }
    });
  }
}
