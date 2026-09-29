import "./style.css";
import { createIcons, icons } from "lucide";
import { store } from "./state/store.js";
import { renderSidebar, renderTopHeader, setupNavigationEvents } from "./components/layout/Navigation.js";
import { renderDashboardView, setupDashboardEvents } from "./views/DashboardView.js";
import { renderProductsView, setupProductsEvents } from "./views/ProductsView.js";
import { renderWarehouseView, setupWarehouseEvents } from "./views/WarehouseView.js";
import { renderOrdersView, setupOrdersEvents } from "./views/OrdersView.js";
import { renderSuppliersView, setupSuppliersEvents } from "./views/SuppliersView.js";
import { renderTransfersView, setupTransfersEvents } from "./views/TransfersView.js";
import { renderAgileCapstoneView, setupAgileCapstoneEvents } from "./views/AgileCapstoneView.js";
import { renderArchitectureView, initArchitectureEvents } from "./views/ArchitectureView.js";


// Global icon hydration helper
window.lucide = {
  createIcons: (options = {}) => createIcons({ icons, ...options })
};

// Router State
let currentTab = "dashboard";

// Parse initial tab from URL hash if present
if (window.location.hash) {
  const hash = window.location.hash.replace("#", "");
  if (["dashboard", "products", "warehouses", "orders", "suppliers", "transfers", "agile", "architecture"].includes(hash)) {
    currentTab = hash;
  }
}

// Initialize Theme - Professional Light E-Commerce Foundation Default
const savedTheme = localStorage.getItem("rims_theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

function renderApp() {
  const app = document.getElementById("app");
  if (!app) return;

  try {
    let viewHtml = "";
    if (currentTab === "dashboard") {
      viewHtml = renderDashboardView();
    } else if (currentTab === "products") {
      viewHtml = renderProductsView();
    } else if (currentTab === "warehouses") {
      viewHtml = renderWarehouseView();
    } else if (currentTab === "orders") {
      viewHtml = renderOrdersView();
    } else if (currentTab === "suppliers") {
      viewHtml = renderSuppliersView();
    } else if (currentTab === "transfers") {
      viewHtml = renderTransfersView();
    } else if (currentTab === "agile") {
      viewHtml = renderAgileCapstoneView();
    } else if (currentTab === "architecture") {
      viewHtml = renderArchitectureView();
    }

    app.innerHTML = `
      <div class="app-layout">
        ${renderSidebar(currentTab, handleTabChange)}
        <div class="app-main-viewport">
          ${renderTopHeader(currentTab, handleTabChange)}
          <main id="main-content" class="app-content-body">
            ${viewHtml}
          </main>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("[RIMS App Error]:", err);
    app.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; background: #ffffff; color: #0f172a; max-width: 800px; margin: 40px auto; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h2 style="color: #dc2626; margin-bottom: 12px;">Retail Operations System Notice</h2>
        <p style="color: #64748b; margin-bottom: 16px;">An unexpected error occurred while rendering the active view. Please click below to reset to Dashboard.</p>
        <button onclick="window.location.hash=''; window.location.reload();" style="padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Reload Dashboard</button>
      </div>
    `;
  }

  // Hydrate Lucide Icons
  window.lucide.createIcons();

  // Attach event handlers
  setupNavigationEvents(handleTabChange);

  if (currentTab === "dashboard") {
    setupDashboardEvents(handleTabChange);
  } else if (currentTab === "products") {
    setupProductsEvents(renderApp);
  } else if (currentTab === "warehouses") {
    setupWarehouseEvents(renderApp);
  } else if (currentTab === "orders") {
    setupOrdersEvents(renderApp);
  } else if (currentTab === "suppliers") {
    setupSuppliersEvents(renderApp);
  } else if (currentTab === "transfers") {
    setupTransfersEvents(renderApp);
  } else if (currentTab === "agile") {
    setupAgileCapstoneEvents(renderApp);
  } else if (currentTab === "architecture") {
    initArchitectureEvents(app, renderApp);
  }

  // Re-run icon hydration after events setup
  window.lucide.createIcons();
}

function handleTabChange(newTab) {
  currentTab = newTab;
  window.location.hash = newTab;
  renderApp();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Handle browser Back/Forward navigation
window.addEventListener("hashchange", () => {
  const hash = window.location.hash.replace("#", "");
  if (hash && hash !== currentTab) {
    currentTab = hash;
    renderApp();
  }
});

// Subscribe to store mutations
store.subscribe(() => {
  renderApp();
});

// Initial Render
renderApp();
