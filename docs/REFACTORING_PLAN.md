# RIMS Refactoring & Restructuring Plan

> **System**: Retail Inventory Management System (RIMS)  
> **Type**: Agile Capstone Full-Stack Application  
> **Lead Engineer**: Senior Full-Stack Software Engineer & System Architect  
> **Status**: APPROVED FOR EXECUTION  

---

## 1. Executive Summary & Audit Overview

This plan defines the end-to-end restructuring, refactoring, and code organization of the Retail Inventory Management System (RIMS) repository. The application is an enterprise-grade 3-Tier retail management solution consisting of:
- **Frontend SPA**: Vanilla ES6+ modules with Vite bundler, Chart.js analytics, Lucide icons, Canvas Confetti.
- **Backend API**: Node.js + Express with JWT authentication, RBAC authorization, express-validator.
- **Database**: PostgreSQL 18.6 with ACID transactions, pessimistic locking (`FOR UPDATE`), and immutable audit logging.

### Absolute Invariant:
**No business logic, API behavior, database schemas, authorization rules, calculation engines, or user-facing workflows will be modified or degraded.** All restructuring is purely organizational, architectural, and quality-driven.

---

## 2. Current Project Structure & Audit Findings

```
P_022/
├── backend/                  # Node.js + Express REST API
│   ├── config/               # db.js (PostgreSQL pool)
│   ├── controllers/          # 12 domain controllers
│   ├── middleware/           # auth, errorHandler, validate
│   ├── models/               # (empty directory)
│   ├── routes/               # 12 domain routes
│   ├── scripts/              # init-db.js
│   ├── services/             # (empty directory)
│   ├── utils/                # (empty directory)
│   ├── package.json
│   └── server.js
├── database/                 # PostgreSQL DDL and DML
│   ├── schema.sql
│   └── seed.sql
├── docs/                     # Documentation suite
│   ├── API_DOCUMENTATION.md
│   ├── DEVELOPMENT_LOG.md
│   ├── ERD/
│   └── PROJECT_DOCUMENTATION.md
├── frontend/                 # Dead/empty scaffold directory tree
├── public/                   # Static assets (favicon, icons)
├── src/                      # Active Frontend Application
│   ├── algorithms/           # Core capstone algorithms (ROP, Allocation, Valuation)
│   ├── assets/               # hero.png, vite.svg, javascript.svg
│   ├── components/           # Flat directory with views, layout, modals, and toasts
│   ├── counter.js            # Default Vite template counter (dead code)
│   ├── data/                 # initialData.js (seed baseline)
│   ├── main.js               # Application bootstrap & router
│   ├── services/             # api.js (backend client)
│   ├── state/                # store.js (reactive state engine)
│   └── style.css             # Monolithic 4,200+ line stylesheet
├── tests/                    # algorithms.test.js (Node test runner)
├── index.html                # Single-page application root
├── package.json              # Orchestrated scripts & dependencies
└── vite.config.js            # Vite build configuration (base: './')
```

---

## 3. Discovered Issues & Improvement Opportunities

| Category | Problem Identified | Proposed Solution |
| :--- | :--- | :--- |
| **Dead Files** | `src/counter.js`, `src/assets/vite.svg`, `src/assets/javascript.svg`, `src/components/AgileView.js` | Safely remove orphaned and unreferenced template files. |
| **Empty Directories** | `frontend/` directory tree (empty subfolders from initial scaffold); `backend/models`, `backend/services`, `backend/utils` | Clean up empty root `frontend/` directory. Cleanly document backend structure. |
| **Component Hierarchy** | Page views (`DashboardView`, `ProductsView`, etc.) mixed directly with Layout (`Navigation.js`) and Services (`Modals.js`, `Toast.js`) in `src/components/` | Separate into `src/views/` for full views and `src/components/` for shared components (`layout/`, `modals/`, `toast/`, `common/`). Provide barrel re-exports to prevent broken imports. |
| **CSS Monolith** | Single `src/style.css` file exceeds 4,200 lines with multiple sections and legacy selectors (`.app-header { display: none; }`) | Modularize into clean CSS partials under `src/styles/` (`variables.css`, `base.css`, `layout.css`, `dashboard.css`, `views.css`, `modals.css`) and import them into `src/style.css`. |
| **Documentation Gaps** | Missing formal project structure, refactoring log, and component guide | Author `docs/PROJECT_STRUCTURE.md`, `docs/COMPONENT_GUIDE.md`, and `docs/REFACTORING_REPORT.md`. Move root `ARCHITECTURE.md` into `docs/ARCHITECTURE.md` with root symlink/reference. |
| **Duplicate Files** | `src/components/AgileView.js` (superseded by `AgileCapstoneView.js`); `src/components/Navbar.js` (alias re-export of `Navigation.js`) | Delete `AgileView.js`. Keep `Navbar.js` as clean re-export for backwards compatibility. |

---

## 4. Components Analysis: Combination vs. Separation

### Components to Combine / Consolidate:
1. **Modal Subsystems**: `src/components/Modals.js` already functions as a single unified `ModalManager`. It will be moved to `src/components/modals/ModalManager.js`, with `src/components/Modals.js` maintaining full re-export compatibility.
2. **Navigation System**: Sidebar and Top Header live cohesively in `src/components/layout/Navigation.js`, with `Navbar.js` retaining legacy alias re-exports.

### Components that MUST Remain Separate:
1. **Page Views (`src/views/`)**:
   - `DashboardView.js` — Supply Chain Executive Dashboard & KPI radar
   - `ProductsView.js` — PIM Catalog & SKU Management
   - `WarehouseView.js` — Multi-Facility Balances, Zones & Bin Grid
   - `OrdersView.js` — Sales Orders, Kanban Pipeline & Dispatch
   - `SuppliersView.js` — Supplier Directory & PO Management
   - `TransfersView.js` — Inter-Warehouse Stock Transfers
   - `AgileCapstoneView.js` — 8 Epics, 15 Sprints, User Stories & Scrum Framework
   - `ArchitectureView.js` — C4 System Architecture, ERD Models & Algorithms
   *Each represents an independent business domain with unique data subscriptions, event lifecycles, and filter states.*

2. **Core Algorithms (`src/algorithms/`)**:
   - `reorderPoint.js` — Dynamic Safety Stock & EOQ
   - `stockAllocation.js` — Haversine Distance & Split-Shipment Allocation
   - `valuation.js` — FIFO vs. AVCO Inventory Valuation
   *Must remain completely independent modules for deterministic unit testing.*

---

## 5. Proposed Target Directory Structure

```
P_022/
├── backend/                      # Production REST API
│   ├── config/                   # db.js
│   ├── controllers/              # Domain controllers
│   ├── middleware/               # auth.js, errorHandler.js, validate.js
│   ├── routes/                   # Domain express routers
│   ├── scripts/                  # init-db.js
│   ├── package.json
│   └── server.js
├── database/                     # PostgreSQL schema and seed data
│   ├── schema.sql
│   └── seed.sql
├── docs/                         # Comprehensive Engineering Documentation
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md           # Moved from root for consistency
│   ├── COMPONENT_GUIDE.md        # Component directory & responsibility guide
│   ├── DEVELOPMENT_LOG.md
│   ├── ERD/
│   ├── PROJECT_DOCUMENTATION.md
│   ├── PROJECT_STRUCTURE.md      # Full architecture tree documentation
│   ├── REFACTORING_PLAN.md       # This document
│   └── REFACTORING_REPORT.md     # Post-execution audit report
├── public/                       # Favicons and SVG vector assets
├── src/                          # Modular Frontend Application
│   ├── algorithms/               # Algorithmic calculation engines
│   │   ├── reorderPoint.js
│   │   ├── stockAllocation.js
│   │   └── valuation.js
│   ├── assets/                   # Static media (hero.png)
│   ├── components/               # Reusable UI Components & Barrel Re-exports
│   │   ├── common/               # UI Primitives & status badges
│   │   ├── layout/               # Navigation.js (Sidebar + TopHeader)
│   │   ├── modals/               # ModalManager.js
│   │   ├── toast/                # Toast.js
│   │   ├── Modals.js             # Backward-compatible barrel re-export
│   │   ├── Navbar.js             # Backward-compatible barrel re-export
│   │   ├── Navigation.js         # Backward-compatible barrel re-export
│   │   └── Toast.js              # Backward-compatible barrel re-export
│   ├── data/                     # initialData.js
│   ├── services/                 # api.js
│   ├── state/                # store.js
│   ├── styles/                   # Modular CSS Architecture
│   │   ├── base.css              # Resets, typography, scrollbars, buttons, badges
│   │   ├── dashboard.css         # KPI grid, operational radar, analytics, tables
│   │   ├── layout.css            # App shell, sidebar, top header, global search
│   │   ├── modals.css            # Dialogs, forms, barcode scanner, packing slip
│   │   ├── variables.css         # Design tokens, Light (default) & Dark themes
│   │   └── views.css             # Domain views (PIM, Warehouse, Kanban, Agile, C4)
│   ├── views/                    # Domain Page Views
│   │   ├── AgileCapstoneView.js
│   │   ├── ArchitectureView.js
│   │   ├── DashboardView.js
│   │   ├── OrdersView.js
│   │   ├── ProductsView.js
│   │   ├── SuppliersView.js
│   │   ├── TransfersView.js
│   │   └── WarehouseView.js
│   ├── main.js                   # Application entrypoint & routing dispatcher
│   └── style.css                 # Master stylesheet importing modular partials
├── tests/                        # algorithms.test.js
├── index.html                    # Root HTML5 template
├── package.json                  # Root npm configuration
├── README.md                     # Project overview and run guide
└── vite.config.js                # Vite bundler configuration
```

---

## 6. Execution Steps & Phased Roadmap

### Phase 1: Dead Code Removal & Workspace Cleanliness
1. Remove `src/counter.js` (unreferenced Vite starter).
2. Remove unreferenced template assets (`src/assets/vite.svg`, `src/assets/javascript.svg`).
3. Remove obsolete `src/components/AgileView.js` (fully superseded by `AgileCapstoneView.js`).
4. Remove empty root `frontend/` directory.

### Phase 2: Page Views & Component Reorganization
1. Create `src/views/` directory.
2. Move domain views into `src/views/` with updated relative imports.
3. Create `src/components/layout/`, `src/components/modals/`, and `src/components/toast/`.
4. Move `Navigation.js` to `src/components/layout/`, `Modals.js` to `src/components/modals/`, and `Toast.js` to `src/components/toast/`.
5. Create backward-compatible barrel re-exports in `src/components/` for every moved file to ensure zero broken references.
6. Update `src/main.js` imports to point cleanly to the new modular structure.

### Phase 3: CSS Modularization & Style Cleanup
1. Create `src/styles/` directory with 6 dedicated modules:
   - `variables.css`
   - `base.css`
   - `layout.css`
   - `dashboard.css`
   - `views.css`
   - `modals.css`
2. Update `src/style.css` to import all 6 modules via standard CSS `@import`.
3. Eliminate duplicate legacy rules (`.app-header { display: none; }`, duplicate scrollbars).

### Phase 4: Documentation Suite Completion
1. Create `docs/PROJECT_STRUCTURE.md`.
2. Create `docs/COMPONENT_GUIDE.md`.
3. Move `ARCHITECTURE.md` into `docs/ARCHITECTURE.md` and update `README.md`.
4. Create `docs/REFACTORING_REPORT.md` documenting all changes.

### Phase 5: Verification & Testing
1. Run `npm run build` — Verify 0 build errors and clean bundle sizes.
2. Run `npm run preview` — Verify HTTP 200 OK on local preview server.
3. Run `npm run dev` (port 5174) — Verify live development server.
4. Run `node --test tests/algorithms.test.js` — Verify 100% algorithm pass rate.
5. Create Git commit checkpoint and sync with remote repository.
