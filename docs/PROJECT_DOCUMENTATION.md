# Retail Inventory Management System (RIMS) - Project Documentation
## Academic Capstone Case Study & Enterprise Full-Stack Reference Architecture

---

## 1. Executive Summary
The **Retail Inventory Management System (RIMS)** is a multi-tier, enterprise-grade web application delivered as an academic capstone project. Designed to simulate complex omni-channel retail operations, the system solves real-world supply chain challenges:
* Multi-warehouse inventory synchronization with race condition prevention
* Stage-gate sales order fulfillment (`RESERVED` $\rightarrow$ `PICKED` $\rightarrow$ `PACKED` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED`)
* Dynamic Reorder Point (ROP) calculation with lead time and safety stock
* Purchase order management and automated Goods Receipt (GRN) inventory ingestion
* Real-time executive dashboard analytics and inventory asset valuation

---

## 2. System Architecture

The application is structured into a clean **3-Tier Architecture**:

```
+-------------------------------------------------------------------------+
|                              PRESENTATION TIER                          |
|  React (Vite) / Vanilla ES Modules Single Page Application (SPA)        |
|  - Modern Dark/Light Glassmorphism Theme (style.css)                   |
|  - Lucide Vector Icons & Dynamic Micro-Animations                       |
|  - Centralized API Service Layer (services/api.js)                      |
|  - Live Database Connection Indicator & RBAC Role Switcher Pill          |
+------------------------------------+------------------------------------+
                                     |  HTTP REST (JSON) + JWT
                                     v
+------------------------------------+------------------------------------+
|                               APPLICATION TIER                          |
|  Node.js + Express REST API Server (Port 5000)                          |
|  - JWT Authentication & RBAC Middleware (auth.js)                       |
|  - Pessimistic Row-Level Locking (SELECT ... FOR UPDATE)                |
|  - PostgreSQL ACID Transactions (BEGIN ... COMMIT / ROLLBACK)           |
|  - Unified Error Handling & Error Code Mapping (23505, 23503, 23514)   |
+------------------------------------+------------------------------------+
                                     |  Connection Pool (pg.Pool)
                                     v
+------------------------------------+------------------------------------+
|                                DATABASE TIER                            |
|  PostgreSQL 18 Relational Database (Port 5432)                          |
|  - 15 Normalized Relational Tables (database/schema.sql)                 |
|  - Realistic Indian Retail Seed Dataset (database/seed.sql)             |
|  - Foreign Keys, Cascade Controls & Check Constraints                    |
|  - B-Tree Performance Indexes for Sub-Millisecond Search                |
+-------------------------------------------------------------------------+
```

---

## 3. Database Schema (15 Tables)

1. **`roles`**: RBAC permissions master (`Admin`, `Inventory Manager`, `Sales Manager`, `Supplier Manager`).
2. **`users`**: User profiles with bcrypt hashed passwords and foreign key to `roles`.
3. **`categories`**: Product hierarchy and classifications.
4. **`products`**: Master product catalog with SKU, barcodes, pricing, cost, and reorder levels.
5. **`warehouses`**: Physical distribution centers and fulfillment facilities.
6. **`inventory`**: Inventory balances per product per warehouse (`quantity`, `reserved_quantity`, `available = quantity - reserved`).
7. **`stock_movements`**: Immutable audit ledger recording all physical stock mutations (`PURCHASE`, `SALE`, `TRANSFER_IN`, `TRANSFER_OUT`, `ADJUSTMENT`).
8. **`customers`**: Customer directory with addresses and contact information.
9. **`orders`**: Sales orders header with fulfillment status and total valuation.
10. **`order_items`**: Order line items referencing products, quantities, and sold prices.
11. **`suppliers`**: Vendor registry and contact directory.
12. **`supplier_products`**: Vendor catalog with wholesale costs and supplier lead times in days.
13. **`purchase_orders`**: Procurement orders issued to suppliers.
14. **`purchase_order_items`**: PO line items with quantities and unit costs.
15. **`notifications`**: System-generated alerts for low-stock warnings, order placements, and GRN receipts.

---

## 4. Business Logic & Algorithms

### 4.1 Available-to-Promise (ATP)
To completely prevent stock overselling across distributed order channels:
$$\text{ATP} = \text{Total On-Hand Quantity} - \text{Reserved Quantity}$$
An order line item is only confirmed if $\text{ATP} \ge \text{Requested Quantity}$. During order creation, the required stock is moved to `reserved_quantity`.

### 4.2 Fulfillment Stage-Gate Transition
1. **`RESERVED`**: Order placed; stock reserved in the selected warehouse.
2. **`PICKED`**: Warehouse team picks items from storage bins.
3. **`PACKED`**: Order is packaged with packing slip and shipping label.
4. **`SHIPPED`**: Carrier picks up parcel. At this exact moment, an ACID transaction executes:
   - Physical deduction: `quantity = quantity - order_qty`
   - Release reservation: `reserved_quantity = reserved_quantity - order_qty`
   - Audit trail: Inserts `SALE` movement into `stock_movements`.
5. **`DELIVERED`**: Final delivery confirmation.
6. **`CANCELLED`**: If cancelled prior to dispatch, the reserved quantity is safely released back to available inventory.

### 4.3 Multi-Warehouse Atomic Transfer
Transfers between facilities (e.g. Bhiwandi Central DC $\rightarrow$ Bengaluru South) execute inside a single transaction:
1. Locks the origin inventory record with `SELECT ... FOR UPDATE`.
2. Validates available stock ($\text{ATP} \ge \text{Transfer Quantity}$).
3. Deducts from origin warehouse.
4. Increments or inserts into destination warehouse.
5. Records matching `TRANSFER_OUT` and `TRANSFER_IN` audit records with a unique tracking reference.

---

## 5. Local Setup & Execution Guide

### Prerequisites
* **Node.js**: v18+ (tested on v24.18.0)
* **PostgreSQL**: v14+ (tested on v18.6)
* **Git**: Installed

### Step 1: Database Setup
1. Configure credentials in `backend/.env`:
   ```ini
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=aditya123
   DB_NAME=retail_inventory_db
   JWT_SECRET=super_secret_jwt_key_rims_capstone_2026_secure
   ```
2. Initialize database, schema, and seed data:
   ```bash
   cd backend
   npm run init-db
   ```

### Step 2: Start Backend REST API
```bash
cd backend
npm start
# Runs at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### Step 3: Start Frontend SPA
```bash
npm run dev
# Runs at http://localhost:5174 or http://localhost:5173
```

---

## 6. Agile Scrum Delivery Framework (Summary)
The system was engineered across 8 Agile Epics and 15 Sprints:
1. **Epic 1**: Foundation & Product Information Management (PIM)
2. **Epic 2**: Multi-Facility Warehouse Topology & Bin Allocation
3. **Epic 3**: Inventory Balance & Atomic Multi-Warehouse Stock Transfers
4. **Epic 4**: Omni-Channel Sales Orders & Stage-Gate Fulfillment
5. **Epic 5**: Supplier Relations & Procurement (POs & GRN)
6. **Epic 6**: Intelligent Low-Stock Radar & Automated Replenishment
7. **Epic 7**: Executive Analytics, Inventory Valuation & Auditing
8. **Epic 8**: Role-Based Access Control (RBAC) & Enterprise Hardening
