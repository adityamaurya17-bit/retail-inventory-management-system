import "./style.css";
import { createIcons, icons } from "lucide";
import { store, ROLES } from "./state/store.js";
import { renderSidebar, renderTopHeader, setupNavigationEvents } from "./components/layout/Navigation.js";

// Enterprise Warehouse & Inventory Management Views
import { renderDashboardView, setupDashboardEvents } from "./views/DashboardView.js";
import { renderProductsView, setupProductsEvents } from "./views/ProductsView.js";
import { renderInventoryView, setupInventoryEvents } from "./views/InventoryView.js";
import { renderWarehouseView, setupWarehouseEvents } from "./views/WarehouseView.js";
import { renderOrdersView, setupOrdersEvents } from "./views/OrdersView.js";
import { renderSuppliersView, setupSuppliersEvents } from "./views/SuppliersView.js";
import { renderTransfersView, setupTransfersEvents } from "./views/TransfersView.js";
import { renderPurchaseOrdersView, setupPurchaseOrdersEvents } from "./views/PurchaseOrdersView.js";
import { renderCustomersView, setupCustomersEvents } from "./views/CustomersView.js";
import { renderAgileCapstoneView, setupAgileCapstoneEvents } from "./views/AgileCapstoneView.js";
import { renderArchitectureView, initArchitectureEvents } from "./views/ArchitectureView.js";

// Dedicated Administrator Authentication View & Modal Manager
import { renderLoginView, setupLoginViewEvents } from "./views/LoginView.js";
import { modals } from "./components/modals/ModalManager.js";

// Public Administrator Homepage & Contact Views
import { renderHomeView, setupHomeViewEvents } from "./views/HomeView.js";
import { renderContactView, setupContactViewEvents } from "./views/ContactView.js";

// Global icon hydration helper
window.lucide = {
  createIcons: (options = {}) => createIcons({ icons, ...options })
};

// Public Unauthenticated Route Registry
const PUBLIC_TABS = new Set([
  "home",
  "overview",
  "features",
  "how-it-works",
  "about",
  "contact",
  "login"
]);

// Administrator Module Registry (Protected Routes)
const MANAGEMENT_TABS = new Set([
  "dashboard",
  "products",
  "inventory",
  "warehouses",
  "transfers",
  "orders",
  "suppliers",
  "purchase-orders",
  "customers",
  "analytics",
  "reports",
  "stock-alerts",
  "agile",
  "architecture"
]);

/**
 * Parse route, aliases, and query parameters from URL hash
 */
function parseRoute(rawHash) {
  const clean = (rawHash !== undefined ? rawHash : window.location.hash || "").replace(/^#/, "");
  const isAuth = store.isAuthenticated();

  if (!clean) {
    return {
      tab: isAuth ? "dashboard" : "home",
      queryString: "",
      params: new URLSearchParams()
    };
  }

  const [tabPart, queryPart] = clean.split("?");
  let tab = tabPart || (isAuth ? "dashboard" : "home");

  // Route aliases
  if (tab === "overview") tab = "home";
  if (tab === "admin-login" || tab === "admin") tab = "login";
  if (tab === "charter") tab = "agile";
  if (tab === "reports") tab = "analytics";
  if (tab === "alerts") tab = "stock-alerts";
  if (tab === "categories") tab = "products";
  if (tab === "about") tab = "home";

  // Redirect any legacy storefront hashes
  if (
    tab === "shop" ||
    tab === "store" ||
    tab === "shop-catalog" ||
    tab === "catalog" ||
    tab === "product-detail" ||
    tab === "cart" ||
    tab === "checkout" ||
    tab === "my-orders" ||
    tab === "wishlist" ||
    tab === "account" ||
    tab === "profile" ||
    tab === "track-order"
  ) {
    tab = isAuth ? "dashboard" : "home";
  }

  // Security Guard: Protected administrative routes require active session
  if (!isAuth && MANAGEMENT_TABS.has(tab)) {
    tab = "login";
  }

  // If already authenticated and visits login page, direct to dashboard
  if (isAuth && tab === "login") {
    tab = "dashboard";
  }

  return {
    tab,
    queryString: queryPart || "",
    params: new URLSearchParams(queryPart || "")
  };
}

// Initialize Theme
const savedTheme = localStorage.getItem("rims_theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

/**
 * Main Application Rendering Lifecycle
 * Public Landing Experience vs. Protected Administrator Enterprise Experience
 */
function renderApp() {
  const app = document.getElementById("app");
  if (!app) return;

  try {
    const routeInfo = parseRoute();
    let currentTab = routeInfo.tab;

    // -------------------------------------------------------------
    // SCENARIO 1: Public Administrator Homepage & Sections (#home, #features, etc.)
    // -------------------------------------------------------------
    if (currentTab === "home" || currentTab === "features" || currentTab === "how-it-works" || currentTab === "about") {
      app.innerHTML = renderHomeView();
      window.lucide.createIcons();
      setupHomeViewEvents(handleTabChange, () => modals.openLoginModal(handleTabChange));
      return;
    }

    // -------------------------------------------------------------
    // SCENARIO 2: Dedicated Public Contact View (#contact)
    // -------------------------------------------------------------
    if (currentTab === "contact") {
      app.innerHTML = renderContactView();
      window.lucide.createIcons();
      setupContactViewEvents(handleTabChange, () => modals.openLoginModal(handleTabChange));
      return;
    }

    // -------------------------------------------------------------
    // SCENARIO 3: Dedicated Standalone Administrator Login View (#login)
    // -------------------------------------------------------------
    if (currentTab === "login") {
      app.innerHTML = renderLoginView();
      window.lucide.createIcons();
      setupLoginViewEvents(handleTabChange);
      return;
    }

    // -------------------------------------------------------------
    // SCENARIO 4: Security Boundary Enforcement for Protected Modules
    // -------------------------------------------------------------
    if (!store.isAuthenticated()) {
      window.location.hash = "#login";
      app.innerHTML = renderLoginView();
      window.lucide.createIcons();
      setupLoginViewEvents(handleTabChange);
      return;
    }

    // -------------------------------------------------------------
    // SCENARIO 5: Protected Administrator Enterprise Experience (Dashboard & Modules)
    // -------------------------------------------------------------
    let viewHtml = "";

    if (currentTab === "dashboard") {
      viewHtml = renderDashboardView();
    } else if (currentTab === "products") {
      viewHtml = renderProductsView();
    } else if (currentTab === "inventory" || currentTab === "stock-alerts") {
      viewHtml = renderInventoryView();
    } else if (currentTab === "warehouses") {
      viewHtml = renderWarehouseView();
    } else if (currentTab === "transfers") {
      viewHtml = renderTransfersView();
    } else if (currentTab === "orders") {
      viewHtml = renderOrdersView();
    } else if (currentTab === "suppliers") {
      viewHtml = renderSuppliersView();
    } else if (currentTab === "purchase-orders") {
      viewHtml = renderPurchaseOrdersView();
    } else if (currentTab === "customers") {
      viewHtml = renderCustomersView();
    } else if (currentTab === "agile") {
      viewHtml = renderAgileCapstoneView();
    } else if (currentTab === "architecture" || currentTab === "analytics") {
      viewHtml = renderArchitectureView();
    } else {
      currentTab = "dashboard";
      viewHtml = renderDashboardView();
    }

    app.innerHTML = `
      <div class="app-layout">
        ${renderSidebar(currentTab, handleTabChange)}
        <div class="sidebar-mobile-backdrop" id="sidebar-mobile-backdrop"></div>
        <div class="app-main-viewport">
          ${renderTopHeader(currentTab, handleTabChange)}
          <main id="main-content" class="app-content-body">
            ${viewHtml}
          </main>
        </div>
      </div>
    `;

    // Hydrate Lucide Icons
    window.lucide.createIcons();

    // Admin Navigation Event Listeners
    setupNavigationEvents(handleTabChange);

    // View-specific Event Bindings
    if (currentTab === "dashboard") {
      setupDashboardEvents(handleTabChange);
    } else if (currentTab === "products") {
      setupProductsEvents(renderApp);
    } else if (currentTab === "inventory" || currentTab === "stock-alerts") {
      setupInventoryEvents(renderApp);
    } else if (currentTab === "warehouses") {
      setupWarehouseEvents(renderApp);
    } else if (currentTab === "transfers") {
      setupTransfersEvents(renderApp);
    } else if (currentTab === "orders") {
      setupOrdersEvents(renderApp);
    } else if (currentTab === "suppliers") {
      setupSuppliersEvents(renderApp);
    } else if (currentTab === "purchase-orders") {
      setupPurchaseOrdersEvents(renderApp);
    } else if (currentTab === "customers") {
      setupCustomersEvents(renderApp);
    } else if (currentTab === "agile") {
      setupAgileCapstoneEvents(renderApp);
    } else if (currentTab === "architecture" || currentTab === "analytics") {
      initArchitectureEvents(app, renderApp);
    }

    // Secondary Icon Hydration for dynamic DOM nodes
    window.lucide.createIcons();

  } catch (err) {
    console.error("[Stockora App Error]:", err);
    app.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; background: #ffffff; color: #0f172a; max-width: 800px; margin: 40px auto; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h2 style="color: #dc2626; margin-bottom: 12px;">Stockora Platform Notice</h2>
        <p style="color: #64748b; margin-bottom: 8px;">An unexpected error occurred. Please click below to reload the admin dashboard.</p>
        ${err ? `<p style="font-family: monospace; font-size: 0.8rem; color: #ef4444; background: #fef2f2; padding: 8px 12px; border-radius: 6px; margin-bottom: 16px;">${err.message}</p>` : ""}
        <button onclick="window.location.hash='#dashboard'; window.location.reload();" style="padding: 8px 16px; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Go to Admin Dashboard</button>
      </div>
    `;
  }
}

/**
 * Handle Tab & Hash Changes
 */
function handleTabChange(newTarget) {
  const targetHash = newTarget.startsWith("#") ? newTarget : `#${newTarget}`;
  window.location.hash = targetHash;
  renderApp();
  window.scrollTo({ top: 0, behavior: "smooth" });
  const contentBody = document.querySelector("#main-content") || document.querySelector(".app-content-body");
  if (contentBody) {
    contentBody.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// Handle Browser Back / Forward History Navigation
window.addEventListener("hashchange", () => {
  renderApp();
});

// Subscribe to State Store mutations
store.subscribe(() => {
  renderApp();
});

// Initial Application Render
renderApp();
