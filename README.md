# Retail Inventory Management System (RIMS)
## Enterprise Agile Capstone Case Study & Technical Architecture
**Web-Based Omnichannel Retail Inventory Platform delivered via Scrum (8 Epics, 15 Sprints)**

---

### Project Overview
The **Retail Inventory Management System (RIMS)** is an enterprise-grade, distributed inventory control and omnichannel fulfillment platform designed for modern multi-channel retail operations. Delivered via a rigorous **Scrum/Agile delivery framework**, the project spans **8 Business Epics** and **15 Sprints (30 Weeks / 185 Story Points)**.

```
+--------------------------------------------------------------------------------------------------+
|                                    KEY CAPSTONE METRICS                                          |
+--------------------------------------------------------------------------------------------------+
|  Total Epics: 8                | Total Sprints: 15 (2-Week Cadence) | Story Points: 185 SP       |
|  Average Velocity: 12.33 SP/sprint | Completion Rate: 100%          | Target Availability: 99.95%|
+--------------------------------------------------------------------------------------------------+
```

---

## 1. Core Architectural Pillars

### 1.1 Architectural Pattern: Modular Event-Driven Hexagonal Monolith
- **Domain Boundaries**: Clean separation across 4 core bounded contexts (Product Information Management, Multi-Warehouse Inventory, Order Fulfillment, and Supplier Relationship Management).
- **Invariants Enforcement**: Strict non-negative Available to Promise ($ATP = SOH - RES \ge 0$), preventing overselling and phantom inventory.
- **Optimistic Concurrency Control (OCC)**: Version-checked database updates (`version = version + 1`) to eliminate race conditions under concurrent checkouts.
- **Event-Driven Integration**: Real-time domain events (`OrderPlaced`, `StockAllocated`, `LowStockThresholdCrossed`, `GoodsReceived`).

### 1.2 Mathematical Specifications & Algorithmic Engines
1. **Distributed Multi-Warehouse Order Allocation Engine** ([src/algorithms/stockAllocation.js](file:///c:/Users/ASUS/OneDrive/Desktop/P_022/src/algorithms/stockAllocation.js)):
   - Minimizes customer shipping distance and applies high penalties ($P_{split} = 2000$) to prevent split-shipments across distribution centers.
2. **Dynamic Reorder Point ($ROP$) & Safety Stock Calculator** ([src/algorithms/reorderPoint.js](file:///c:/Users/ASUS/OneDrive/Desktop/P_022/src/algorithms/reorderPoint.js)):
   $$ROP = (d \times L) + Z \times \sqrt{L \cdot \sigma_d^2 + d^2 \cdot \sigma_L^2}$$
   - Automatically drafts replenishment POs when $ATP \le ROP$.
3. **Dual Inventory Valuation Engine (FIFO vs AVCO)** ([src/algorithms/valuation.js](file:///c:/Users/ASUS/OneDrive/Desktop/P_022/src/algorithms/valuation.js)):
   - Side-by-side First-In, First-Out (FIFO) chronological batch depletion and Moving Weighted Average (AVCO) compliance with GAAP/IFRS.

---

## 2. Agile Capstone Delivery: 8 Epics & 15 Sprints

| Epic ID | Epic Title | Sprints | Points | Scope & Core Deliverables |
|---|---|---|---|---|
| **`EP-01`** | Product Information Management (PIM) & Catalog | S1, S2 | 25 SP | Centralized product master, automated SKU generator, EAN-13 validation, dynamic margins. |
| **`EP-02`** | Multi-Warehouse Facility & Bin Topology | S3, S9 | 23 SP | Facility modeling, 4-coordinate bin addresses (`Zone-Aisle-Shelf-Bin`), volumetric utilization. |
| **`EP-03`** | Real-Time Stock Tracking & Cycle Count Audits | S4, S5 | 26 SP | Real-time ATP ledger, lot/batch expiration tracking, cycle count variance reconciliation. |
| **`EP-04`** | Supplier Relationship Management & Procure-to-Pay| S6–S8 | 27 SP | Vendor SLA ratings, automated ROP triggers, PO generation, and Inbound Goods Receipt (GRN). |
| **`EP-05`** | Omnichannel Ingestion & Intelligent Fulfillment | S10, S11 | 28 SP | Multi-channel orders, heuristic routing algorithm, atomic reservation locking. |
| **`EP-06`** | Warehouse Wave Picking, Packing & Dispatch | S12, S13 | 25 SP | Optimized bin route sequence, scan-to-pack validation, digital packing slips, carrier dispatch. |
| **`EP-07`** | Reverse Logistics: RMA & Quality Inspection | S14 | 16 SP | RMA return tracking, condition grading (Restock, Rework, Quarantine, Scrap), ledger re-ingestion. |
| **`EP-08`** | Executive Analytics & System Hardening | S15 | 15 SP | Valuation engine, inventory turnover radar, security hardening, and capstone polish. |

---

## 3. Directory Structure

```
c:\Users\ASUS\OneDrive\Desktop\P_022\
├── README.md                           # Master Project Overview (This file)
├── ARCHITECTURE.md                     # Comprehensive C4 diagrams, DDD, database & API specs
├── AGILE_CAPSTONE_CASE_STUDY.md        # 8 Epics & 15 Sprints breakdown, ceremonies & Gherkin criteria
├── database/
│   └── schema.sql                      # Production PostgreSQL/SQLite relational schema (13 tables)
├── tests/
│   └── algorithms.test.js              # Automated unit tests for Allocation, ROP, and Valuation
├── src/
│   ├── algorithms/
│   │   ├── stockAllocation.js          # Multi-warehouse order allocation engine
│   │   ├── reorderPoint.js             # ROP, Safety Stock & EOQ formulas
│   │   └── valuation.js                # FIFO vs AVCO stock valuation engine
│   ├── components/
│   │   ├── ArchitectureView.js         # Interactive C4 diagrams, ERD, and algorithm sandboxes
│   │   ├── AgileCapstoneView.js        # 15 Sprints deep dive, ceremonies, and burndown chart
│   │   ├── DashboardView.js            # Executive KPIs, Chart.js graphs, and audit ledger
│   │   ├── ProductsView.js             # Product catalog (PIM) with search and filters
│   │   ├── WarehouseView.js            # Multi-facility topology and bin visualization
│   │   ├── OrdersView.js               # Omnichannel order fulfillment pipeline
│   │   ├── SuppliersView.js            # Supplier directory and PO/GRN receiving
│   │   ├── Navbar.js                   # Top navigation with live status badges
│   │   ├── Modals.js                   # Interactive creation dialogs
│   │   └── Toast.js                    # System notifications
│   ├── data/
│   │   └── initialData.js              # Realistic seed data for products, stock, POs, and sprints
│   ├── state/
│   │   └── store.js                    # Reactive state store with localStorage persistence
│   ├── style.css                       # Modern design system (dark/light mode, glassmorphism)
│   └── main.js                         # Application router and lifecycle coordinator
├── package.json
└── index.html
```

---

## 4. Quick Start & Execution

### 4.1 Prerequisites
- **Node.js**: v18+ (tested on Node v24.18.0)
- **npm**: v9+

### 4.2 Installation
```bash
npm install
```

### 4.3 Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 4.4 Run Automated Algorithm Tests
```bash
npm test
```
Executes the native test suite verifying the Allocation Haversine formula, ROP Safety Stock math, and FIFO/AVCO depletion calculations.

### 4.5 Production Bundle Build
```bash
npm run build
```
Compiles and tree-shakes assets into the `dist/` directory.

---

## 5. Architectural Documentation Links
- [Detailed Technical Architecture Document (ARCHITECTURE.md)](file:///c:/Users/ASUS/OneDrive/Desktop/P_022/ARCHITECTURE.md)
- [Detailed Agile Scrum Dossier (AGILE_CAPSTONE_CASE_STUDY.md)](file:///c:/Users/ASUS/OneDrive/Desktop/P_022/AGILE_CAPSTONE_CASE_STUDY.md)
- [Relational Database Schema DDL (database/schema.sql)](file:///c:/Users/ASUS/OneDrive/Desktop/P_022/database/schema.sql)
