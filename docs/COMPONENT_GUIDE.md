# Retail Inventory Management System (RIMS)
## Frontend Component & UI Architecture Guide

> **Module**: Single Page Application (SPA) UI Layer  
> **Framework**: Vanilla ES6+ Web Components with Vite Bundler  
> **Icons**: Lucide Icons (Universal SVG hydration)  
> **Visual Styling**: Modular Vanilla CSS with Design Tokens  

---

## 1. Component Hierarchy & Flow

```
index.html
└── #app (.app-container)
    └── .app-layout
        ├── <aside> Sidebar (.app-sidebar)        [src/components/layout/Navigation.js]
        │   ├── Brand & Logo
        │   ├── Navigation Menu Items + Counters
        │   ├── Quick Operational Actions
        │   └── System Status & DB Pulse
        │
        └── <div class="app-main-viewport">
            ├── <header> Top Header (.app-top-header) [src/components/layout/Navigation.js]
            │   ├── Mobile Hamburger Toggle
            │   ├── Global Search Bar
            │   ├── Active Tab Breadcrumb
            │   ├── User Auth Widget (Login / Logout / Role Badge)
            │   ├── Theme Toggler (Light / Dark)
            │   └── Quick Metrics Badge
            │
            └── <main id="main-content">
                └── Active View Container          [src/views/*.js]
                    ├── DashboardView.js
                    ├── ProductsView.js
                    ├── WarehouseView.js
                    ├── OrdersView.js
                    ├── SuppliersView.js
                    ├── TransfersView.js
                    ├── AgileCapstoneView.js
                    └── ArchitectureView.js

Universal Overlays:
├── <dialog id="app-dialog">                    [src/components/modals/ModalManager.js]
└── <div id="toast-container">                   [src/components/toast/Toast.js]
```

---

## 2. Layout Components (`src/components/layout/`)

### `Navigation.js`
- **`renderSidebar(currentTab, onTabChange)`**:
  - Computes active operational badges (e.g., number of pending orders, products below safety stock).
  - Renders the vertical brand navigation bar with distinct icons, active tab highlights, and counter pills.
  - Houses the Database connection pulse indicator (`Live Postgres Connected` vs `Local In-Memory Cache`).
- **`renderTopHeader(currentTab, onTabChange)`**:
  - Renders the global search input with instantaneous focus hotkey (`Ctrl + K` / `Cmd + K`).
  - Displays authenticated user profile badge, active role indicator (`ADMIN`, `OPERATOR`, `AUDITOR`), and authentication action buttons.
  - Houses the Theme Switcher (`light` / `dark`) utilizing `data-theme` attribute on the root `<html>` element.
- **`setupNavigationEvents(onTabChange)`**:
  - Attaches click listeners to sidebar navigation items.
  - Handles mobile drawer toggle and outside click auto-dismiss.
  - Handles theme toggle event and persists selection to `localStorage.getItem("rims_theme")`.

---

## 3. Modal Subsystem (`src/components/modals/`)

### `ModalManager.js`
Manages all modal dialogs using native HTML5 `<dialog>` elements for maximum accessibility, native backdrop handling, and keyboard escape trapping (`Escape` key closes dialog automatically).

#### Available Modal Handlers:
| Method | Description |
| :--- | :--- |
| `modals.openProductModal(productId?)` | Create or update product records (SKU, title, category, price, cost, ROP, safety stock). |
| `modals.openOrderModal()` | Create new sales orders with multi-line item selector and customer assignment. |
| `modals.openPOModal()` | Create purchase orders with supplier selection and automated cost calculations. |
| `modals.openTransferModal()` | Initiate inter-warehouse stock transfer between facilities. |
| `modals.openAdjustmentModal(productId, warehouseId)` | Perform manual stock adjustments (Cycle Count, Damaged, Received, Audit). |
| `modals.openBarcodeScannerModal()` | Interactive simulated barcode / QR code scanner with sound feedback. |
| `modals.openPackingSlipModal(orderId)` | Printable packing slip and shipping label generation preview. |
| `modals.openLoginModal(onSuccess)` | Authentication modal supporting role selection and demo credentials. |
| `modals.close()` | Closes active dialog and disposes form state. |

---

## 4. Toast Notification Subsystem (`src/components/toast/`)

### `Toast.js`
Lightweight notification manager providing slide-in notifications with automatic dismissal and Lucide icons.

#### Usage:
```javascript
import { toast } from "../components/toast/Toast.js";

// Success alert
toast.success("Stock transfer WH-01 → WH-02 confirmed.");

// Warning alert
toast.warning("SKU-1002 stock level is below safety threshold.");

// Error alert
toast.error("Database connection timeout. Re-routing to cache.");

// Info alert
toast.info("Wave picking batch #4401 generated.");
```

---

## 5. Shared UI Primitives (`src/components/common/`)

### `index.js`
Standardized UI helper functions to ensure consistent styling across views:
- **`renderBadge(text, variant, extraClasses)`**: Returns formatted badge HTML (`badge-success`, `badge-warning`, `badge-danger`, `badge-info`, `badge-neutral`).
- **`renderStatusBadge(status)`**: Automatically resolves variant based on status string (e.g., "Delivered" → success, "Low Stock" → warning).
- **`formatCurrency(amount)`**: Formats numeric currency using `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`.
- **`formatDate(dateString)`**: Standardizes date formats across tables and ledgers.

---

## 6. Domain Page Views (`src/views/`)

Each view encapsulates its own rendering logic, event listeners, and interactive UI states:

### 1. `DashboardView.js`
- **Responsibilities**:
  - Supply Chain Executive Overview
  - Real-time KPI Metric Cards: Total Valuation, ATP Inventory, Active Orders, Stockout Risk.
  - Operational Action Queue: High-priority immediate tasks.
  - Sales & Revenue Analytics Chart: Integrated with Chart.js with dynamic time filter toggles (`7D`, `30D`, `90D`, `1Y`).
  - Multi-Warehouse Capacity Overview: Storage utilization progress bars.
  - Low-Stock Watchlist & Real-Time Transaction Ledger.
- **Event Lifecycle**:
  - `renderDashboardView()`: Produces raw semantic HTML.
  - `setupDashboardEvents(onTabChange)`: Initializes Chart.js instance (destroying previous instances to prevent canvas reuse errors).

### 2. `ProductsView.js`
- **Responsibilities**:
  - Product Catalog (PIM) with instant search, category pill filter, and stock level status filter.
  - Product inventory table with live stock metrics, reorder points, and action dropdowns.
  - Triggering `modals.openProductModal()` for creating/editing items.

### 3. `WarehouseView.js`
- **Responsibilities**:
  - Multi-warehouse facility switcher (Chicago Hub, Dallas Regional, New Jersey Port).
  - Facility metrics: Total Capacity, Utilized Bins, Active Stock Lines.
  - Visual 2D Bins & Zones Grid showing storage density and occupancy.
  - Stock adjustment triggers.

### 4. `OrdersView.js`
- **Responsibilities**:
  - Omnichannel sales order processing.
  - Interactive Kanban Pipeline: Pending → Processing → Dispatched → Delivered.
  - Order details modal, wave picking simulator, and packing slip generator with confetti celebration on fulfillment.

### 5. `SuppliersView.js`
- **Responsibilities**:
  - Supplier Relationship Management (SRM).
  - Purchase Orders table with status tracking and Procure-to-Pay workflow.
  - Supplier directory with contact details, lead times, and reliability ratings.

### 6. `TransfersView.js`
- **Responsibilities**:
  - Stock transfer routing between facilities.
  - In-transit tracking timeline with route metrics and transfer validation.

### 7. `AgileCapstoneView.js`
- **Responsibilities**:
  - Scrum project documentation showcase.
  - 8 Epics and 15 Sprint breakdown with acceptance criteria and user story mapping.
  - Sprint velocity burndown charts.

### 8. `ArchitectureView.js`
- **Responsibilities**:
  - Technical engineering blueprint presentation.
  - C4 Model visualizer (System Context, Container, Component, Event Stream).
  - PostgreSQL ERD Schema Explorer.
  - Live algorithm simulators for Haversine Allocation, Dynamic ROP, and FIFO Valuation.

---

## 7. State Management Lifecycle (`src/state/store.js`)

The application uses an in-memory reactive store with synchronous pub/sub listeners and optional REST API synchronization:
1. Components call `store.subscribe(listener)` to register render hooks.
2. User actions invoke store mutation methods (e.g., `store.createSalesOrder()`, `store.adjustStock()`).
3. Store updates internal state, emits a change notification to all subscribers, and asynchronously persists to PostgreSQL via `src/services/api.js`.
4. `src/main.js` re-renders the active view and hydrates Lucide icons.
