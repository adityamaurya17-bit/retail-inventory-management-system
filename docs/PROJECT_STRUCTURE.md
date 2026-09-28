# Retail Inventory Management System (RIMS)
## Complete Project Structure & Codebase Map

> **Version**: 2.0.0 (Modular Refactored Architecture)  
> **Status**: Production & Academic Capstone Standard  
> **Repository**: [retail-inventory-management-system](https://github.com/adityamaurya17-bit/retail-inventory-management-system.git)

---

## 1. High-Level Architectural Directory Tree

```
P_022/
├── backend/                      # Production REST API (Node.js + Express)
│   ├── config/                   # Infrastructure configuration
│   │   └── db.js                 # PostgreSQL connection pool with connection retry
│   ├── controllers/              # 12 Domain Controllers (Pure Business Logic)
│   │   ├── authController.js     # User registration, JWT login & verification
│   │   ├── categoryController.js # Product taxonomy & hierarchy
│   │   ├── customerController.js # Customer profiles & address records
│   │   ├── inventoryController.js# Balances, adjustments, locks & audit log
│   │   ├── notificationController.js# Low stock, critical system alerts
│   │   ├── orderController.js    # Sales orders, wave picking & fulfillment
│   │   ├── productController.js  # PIM catalog, SKU management & variants
│   │   ├── purchaseOrderController.js# Procure-to-pay & supplier deliveries
│   │   ├── reportController.js   # Analytics, inventory valuation & turnover
│   │   ├── supplierController.js # Vendor directory & performance scorecards
│   │   ├── userController.js     # User administration & role management
│   │   └── warehouseController.js# Multi-facility topology, zones & bins
│   ├── middleware/               # HTTP Request Pipeline Middleware
│   │   ├── auth.js               # JWT bearer token verification & RBAC guards
│   │   ├── errorHandler.js       # Centralized JSON error formatters
│   │   └── validate.js           # express-validator schema sanitizers
│   ├── models/                   # Reserved for future ORM/ActiveRecord models
│   ├── routes/                   # 12 Modular Express Router Handlers
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   ├── purchaseOrderRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── supplierRoutes.js
│   │   ├── userRoutes.js
│   │   └── warehouseRoutes.js
│   ├── scripts/                  # Administrative & Setup Scripts
│   │   └── init-db.js            # Automated DDL execution and schema verification
│   ├── services/                 # Reserved for external microservice integration
│   ├── utils/                    # Shared backend helper utilities
│   ├── .env                      # Local environment configuration
│   ├── .env.example              # Template environment configuration
│   ├── package.json              # Backend service dependencies
│   └── server.js                 # Express application bootstrap & route mounting
│
├── database/                     # PostgreSQL Database DDL and DML
│   ├── schema.sql                # 15 normalized tables, foreign keys, triggers, constraints
│   └── seed.sql                  # Comprehensive retail demo seed dataset
│
├── docs/                         # Formal Engineering Documentation Suite
│   ├── API_DOCUMENTATION.md      # OpenAPI/Swagger compliant REST endpoint spec
│   ├── ARCHITECTURE.md           # C4 architecture blueprint, hexagonal patterns, DDD
│   ├── COMPONENT_GUIDE.md        # Frontend component responsibility & props guide
│   ├── DEVELOPMENT_LOG.md        # Chronological engineering decision log
│   ├── ERD/                      # Visual schema diagrams
│   ├── PROJECT_DOCUMENTATION.md  # Capstone charter, scope, and objectives
│   ├── PROJECT_STRUCTURE.md      # This codebase map
│   ├── REFACTORING_PLAN.md       # Pre-execution audit and refactoring strategy
│   └── REFACTORING_REPORT.md     # Post-execution verification and audit report
│
├── public/                       # Static Assets & Web App Manifest
│   └── favicon.svg               # Application icon
│
├── src/                          # Modular Frontend Single-Page Application (SPA)
│   ├── algorithms/               # Verified Scientific Calculation Engines
│   │   ├── reorderPoint.js       # Dynamic Safety Stock, ROP & Economic Order Quantity
│   │   ├── stockAllocation.js    # Haversine Distance & Split-Shipment Routing
│   │   └── valuation.js          # Dual Inventory Valuation (FIFO vs. AVCO)
│   │
│   ├── assets/                   # Static Visual Media
│   │   └── hero.png              # High-resolution architectural preview
│   │
│   ├── components/               # Modular UI Components & Compatibility Re-exports
│   │   ├── common/               # Shared UI primitives & status badges
│   │   │   └── index.js          # renderBadge, renderStatusBadge, formatters
│   │   ├── layout/               # Application Shell Layout
│   │   │   ├── Navigation.js     # Enterprise Sidebar & Top Navigation Bar
│   │   │   └── Navbar.js         # Alias export for backward compatibility
│   │   ├── modals/               # Modal Dialogs Subsystem
│   │   │   └── ModalManager.js   # Native HTML5 <dialog> modal controller
│   │   ├── toast/                # Notification Subsystem
│   │   │   └── Toast.js          # Interactive dismissible toast alerts
│   │   ├── AgileCapstoneView.js  # Backward-compatible barrel re-export
│   │   ├── ArchitectureView.js   # Backward-compatible barrel re-export
│   │   ├── DashboardView.js      # Backward-compatible barrel re-export
│   │   ├── Modals.js             # Backward-compatible barrel re-export
│   │   ├── Navbar.js             # Backward-compatible barrel re-export
│   │   ├── Navigation.js         # Backward-compatible barrel re-export
│   │   ├── OrdersView.js         # Backward-compatible barrel re-export
│   │   ├── ProductsView.js       # Backward-compatible barrel re-export
│   │   ├── SuppliersView.js      # Backward-compatible barrel re-export
│   │   ├── Toast.js              # Backward-compatible barrel re-export
│   │   ├── TransfersView.js      # Backward-compatible barrel re-export
│   │   └── WarehouseView.js      # Backward-compatible barrel re-export
│   │
│   ├── data/                     # Offline Baseline & Seeding Datasets
│   │   └── initialData.js        # Fallback offline state (products, orders, warehouses)
│   │
│   ├── services/                 # HTTP Client & External Integrations
│   │   └── api.js                # REST API client with automatic token attachment
│   │
│   ├── state/                    # Reactive Client State Management
│   │   └── store.js              # Central reactive store with pub/sub subscriptions
│   │
│   ├── styles/                   # Modular CSS Architecture
│   │   ├── base.css              # Resets, typography, scrollbars, buttons, badges
│   │   ├── dashboard.css         # Business KPIs, operational queue, Chart.js split
│   │   ├── layout.css            # App shell, sidebar, top header, mobile drawer
│   │   ├── modals.css            # Dialogs, forms, barcode scanner, packing slip
│   │   ├── variables.css         # Design tokens, Light (default) & Dark themes
│   │   └── views.css             # Domain views (PIM, Warehouse, Kanban, SRM, Agile)
│   │
│   ├── views/                    # Dedicated Business Domain Views
│   │   ├── AgileCapstoneView.js  # 8 Epics, 15 Sprints, User Stories & Scrum Framework
│   │   ├── ArchitectureView.js   # C4 System Architecture, ERD Models & Algorithms
│   │   ├── DashboardView.js      # Supply Chain Executive Dashboard & KPI Radar
│   │   ├── OrdersView.js         # Sales Orders, Kanban Pipeline & Dispatch
│   │   ├── ProductsView.js       # PIM Catalog & SKU Management
│   │   ├── SuppliersView.js      # Supplier Directory & PO Management
│   │   ├── TransfersView.js      # Inter-Warehouse Stock Transfers
│   │   └── WarehouseView.js      # Multi-Facility Balances, Zones & Bin Grid
│   │
│   ├── main.js                   # Application Entrypoint, Event Routing & Dispatcher
│   └── style.css                 # Master Stylesheet Importing Modular Partials
│
├── tests/                        # Automated Test Suites
│   └── algorithms.test.js        # Node.js native test runner verifying core algorithms
│
├── index.html                    # Single-Page Application Root Template
├── package.json                  # Root npm configuration, scripts & dependencies
├── README.md                     # Project Overview, Setup & Developer Guide
└── vite.config.js                # Vite Bundler Configuration with './' asset relative paths
```

---

## 2. Component Responsibility Mapping

| Path | Primary Responsibility | Data Source |
| :--- | :--- | :--- |
| `src/views/DashboardView.js` | Top-level executive oversight, KPIs, operational action queue, Chart.js revenue analytics, warehouse cards, low stock alerts, and audit ledger. | `store.getProducts()`, `store.getWarehouses()`, `store.getSalesOrders()`, `store.getStock()` |
| `src/views/ProductsView.js` | Product Information Management (PIM), SKU search, category filter pills, stock level badges, price management, new product creation. | `store.getProducts()`, `store.getCategories()` |
| `src/views/WarehouseView.js` | Multi-facility topology (Chicago, Dallas, New Jersey), warehouse capacity meters, zone & bin visualization, quick stock adjustments. | `store.getWarehouses()`, `store.getStock()` |
| `src/views/OrdersView.js` | Omnichannel sales order processing, kanban status board (Pending, Processing, Dispatched, Delivered), wave picking simulation. | `store.getSalesOrders()`, `store.getProducts()` |
| `src/views/SuppliersView.js` | Supplier Directory (SRM), vendor lead-time tracking, purchase order status, procure-to-pay workflow, goods receiving. | `store.getSuppliers()`, `store.getPurchaseOrders()` |
| `src/views/TransfersView.js` | Inter-warehouse inventory transfers, origin/destination tracking, in-transit status pipeline, transfer creation. | `store.getStockTransfers()`, `store.getWarehouses()` |
| `src/views/AgileCapstoneView.js`| Agile project methodology showcase: 8 Epics, 15 Sprints, user stories, acceptance criteria, velocity charts, scrum ceremonies. | `store.getAgileCaseStudy()` |
| `src/views/ArchitectureView.js` | Interactive technical showcase: C4 Context/Container/Component diagrams, PostgreSQL ERD inspector, DDD bounded contexts, live algorithm simulators. | `algorithms/*`, `store.getDbStatus()` |

---

## 3. Separation of Concerns & Clean Imports

- **Zero Breaking Changes**: To preserve full compatibility with any external tests or dynamic references, barrel re-exports are provided in `src/components/*.js`.
- **Pure CSS Modularity**: All styles are segmented by feature under `src/styles/` while preserving the central `@import` entrypoint in `src/style.css`.
- **Stateless Views & Reactive State**: Views read from `store.js` and notify the reactive store upon user interaction.
- **Backend Decoupling**: Express routers in `backend/routes/` cleanly delegate business logic to `backend/controllers/` without mixing routing concerns.
