import "./style.css";
import { createIcons, icons } from "lucide";
import { store } from "./state/store.js";
import { renderSidebar, renderTopHeader, setupNavigationEvents } from "./components/Navigation.js";
import { renderDashboardView, setupDashboardEvents } from "./components/DashboardView.js";
import { renderProductsView, setupProductsEvents } from "./components/ProductsView.js";
import { renderWarehouseView, setupWarehouseEvents } from "./components/WarehouseView.js";
import { renderOrdersView, setupOrdersEvents } from "./components/OrdersView.js";
import { renderSuppliersView, setupSuppliersEvents } from "./components/SuppliersView.js";
import { renderTransfersView, setupTransfersEvents } from "./components/TransfersView.js";
import { renderAgileCapstoneView, setupAgileCapstoneEvents } from "./components/AgileCapstoneView.js";
import { renderArchitectureView, initArchitectureEvents } from "./components/ArchitectureView.js";

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

// Initialize Theme
const savedTheme = localStorage.getItem("rims_theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);

function renderApp() {
  const app = document.getElementById("app");
  if (!app) return;

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
