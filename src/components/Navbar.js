import { store } from "../state/store.js";
import { modals } from "./Modals.js";
import { toast } from "./Toast.js";

export function renderNavbar(currentTab, onTabChange) {
  const products = store.getProducts();
  const salesOrders = store.getSalesOrders();
  const pendingOrders = salesOrders.filter((o) => o.status !== "Delivered" && o.status !== "Dispatched").length;
  const dbStatus = store.getDbStatus ? store.getDbStatus() : { connected: false };
  const currentUser = store.getCurrentUser ? store.getCurrentUser() : { role: "Admin", name: "Aarav Sharma" };

  let lowStockCount = 0;
  products.forEach((p) => {
    const summary = store.getProductStockSummary(p.id);
    if (summary.onHand <= p.reorderPoint) lowStockCount++;
  });

  return `
    <header class="app-header">
      <div class="header-left">
        <div class="brand-logo" id="brand-home" title="Return to Dashboard">
          <div class="brand-icon">
            <i data-lucide="boxes"></i>
          </div>
          <div class="brand-text">
            <div class="brand-title">RIMS Enterprise</div>
            <div class="brand-subtitle">Retail Inventory & Agile Capstone</div>
          </div>
        </div>

        <nav class="nav-links">
          <button class="nav-item ${currentTab === "dashboard" ? "active" : ""}" data-tab="dashboard">
            <i data-lucide="layout-dashboard"></i>
            <span>Dashboard</span>
          </button>
          <button class="nav-item ${currentTab === "products" ? "active" : ""}" data-tab="products">
            <i data-lucide="box"></i>
            <span>Catalog (PIM)</span>
            ${lowStockCount > 0 ? `<span class="nav-badge badge-warning">${lowStockCount}</span>` : ""}
          </button>
          <button class="nav-item ${currentTab === "warehouses" ? "active" : ""}" data-tab="warehouses">
            <i data-lucide="warehouse"></i>
            <span>Warehouses & Bins</span>
          </button>
          <button class="nav-item ${currentTab === "orders" ? "active" : ""}" data-tab="orders">
            <i data-lucide="truck"></i>
            <span>Fulfillment</span>
            ${pendingOrders > 0 ? `<span class="nav-badge badge-accent">${pendingOrders}</span>` : ""}
          </button>
          <button class="nav-item ${currentTab === "suppliers" ? "active" : ""}" data-tab="suppliers">
            <i data-lucide="users"></i>
            <span>Suppliers & POs</span>
          </button>
          <button class="nav-item highlight-agile ${currentTab === "agile" ? "active" : ""}" data-tab="agile">
            <i data-lucide="git-merge"></i>
            <span>Agile Capstone (8 Epics / 15 Sprints)</span>
          </button>
          <button class="nav-item highlight-arch ${currentTab === "architecture" ? "active" : ""}" data-tab="architecture">
            <i data-lucide="cpu"></i>
            <span>System Architecture (C4 & Algorithms)</span>
          </button>
        </nav>
      </div>

      <div class="header-right">
        <!-- PostgreSQL Live Database Indicator -->
        <div class="db-status-pill ${dbStatus.connected ? "status-online" : "status-offline"}" id="btn-db-status" title="${dbStatus.connected ? "Connected to PostgreSQL 18.6: retail_inventory_db" : "PostgreSQL Disconnected"}">
          <span class="status-indicator-dot ${dbStatus.connected ? "pulse-green" : "pulse-red"}"></span>
          <span class="desktop-only">${dbStatus.connected ? "PostgreSQL 18" : "DB Offline"}</span>
        </div>

        <!-- User Authentication & Session Control -->
        ${currentUser ? `
          <div class="user-auth-widget" id="user-auth-box">
            <button class="btn btn-ghost btn-sm user-profile-pill" id="btn-open-login" title="Signed in as ${currentUser.name} (${currentUser.role}) - Click to switch account">
              <span class="user-avatar-circle">${currentUser.name ? currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2) : "AD"}</span>
              <div class="user-info-text desktop-only">
                <span class="user-name">${currentUser.name || "Aarav Sharma"}</span>
                <span class="user-role-badge">${currentUser.role || "Admin"}</span>
              </div>
            </button>
            <button class="btn btn-ghost btn-sm btn-icon btn-logout-action" id="btn-logout" title="Sign out of RIMS session">
              <i data-lucide="log-out"></i>
            </button>
          </div>
        ` : `
          <button class="btn btn-primary btn-sm btn-signin-header" id="btn-open-login" title="Sign in as Admin or Staff">
            <i data-lucide="log-in"></i>
            <span>Sign In</span>
          </button>
        `}

        <button id="btn-simulate-ops" class="btn btn-secondary btn-sm" title="Simulate Daily Retail Transactions & Orders">
          <i data-lucide="zap"></i>
          <span class="desktop-only">Simulate Ops</span>
        </button>

        <button id="btn-scan-barcode" class="btn btn-secondary btn-sm" title="Open Barcode Scanner Simulator">
          <i data-lucide="scan-barcode"></i>
          <span class="desktop-only">Barcode</span>
        </button>

        <button id="btn-reset-data" class="btn btn-ghost btn-sm" title="Reset Demo Data to Initial Seeds">
          <i data-lucide="rotate-ccw"></i>
          <span class="desktop-only">Reset</span>
        </button>

        <button id="btn-toggle-theme" class="btn btn-ghost btn-sm btn-icon" title="Toggle Dark/Light Mode">
          <i data-lucide="sun"></i>
        </button>
      </div>
    </header>
  `;
}

export function setupNavbarEvents(onTabChange) {
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      if (tab) onTabChange(tab);
    });
  });

  const brand = document.getElementById("brand-home");
  if (brand) {
    brand.addEventListener("click", () => onTabChange("dashboard"));
  }

  const scanBtn = document.getElementById("btn-scan-barcode");
  if (scanBtn) {
    scanBtn.addEventListener("click", () => {
      modals.openBarcodeScannerModal();
    });
  }

  const simOpsBtn = document.getElementById("btn-simulate-ops");
  if (simOpsBtn) {
    simOpsBtn.addEventListener("click", () => {
      store.simulateDailyOperations();
      toast.success("Simulated daily retail transactions! Inventory stock and orders updated.");
    });
  }

  const resetBtn = document.getElementById("btn-reset-data");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Reset all retail inventory state to initial capstone baseline?")) {
        store.resetToDefaults();
        toast.info("State reset to initial seed values.");
      }
    });
  }

  const themeBtn = document.getElementById("btn-toggle-theme");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") !== "light";
      document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
      themeBtn.innerHTML = `<i data-lucide="${isDark ? "moon" : "sun"}"></i>`;
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // PostgreSQL Database Status Click
  const dbBtn = document.getElementById("btn-db-status");
  if (dbBtn) {
    dbBtn.addEventListener("click", async () => {
      const status = store.getDbStatus ? store.getDbStatus() : { connected: false };
      if (status.connected) {
        toast.success(`PostgreSQL 18: Connected to '${status.details?.database || "retail_inventory_db"}' as '${status.details?.user || "postgres"}'!`);
      } else {
        toast.info("Connecting to PostgreSQL backend API at http://localhost:5000/api...");
        await store.syncWithBackend();
      }
    });
  }

  // Open Login Modal (Sign In / Switch Account)
  const loginBtn = document.getElementById("btn-open-login");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      modals.openLoginModal();
    });
  }

  // Logout Click
  const logoutBtn = document.getElementById("btn-logout");
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
}
