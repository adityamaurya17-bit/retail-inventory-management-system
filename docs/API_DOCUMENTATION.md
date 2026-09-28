# Retail Inventory Management System (RIMS) - REST API Documentation

## 1. Overview
The RIMS REST API is built on **Node.js + Express** and communicates with a **PostgreSQL 18** database. It provides an enterprise backend for inventory tracking, multi-warehouse transfers, sales order intake with atomic stock reservation, stage-gate order fulfillment, procurement (purchase orders & goods receipt), and real-time executive analytics.

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT Bearer Token in `Authorization` header (`Bearer <token>`)
- **Default Format**: `application/json`

---

## 2. Authentication & RBAC

### User Roles
| Role Name | Role ID | Description |
| :--- | :--- | :--- |
| **Admin** | `1` | Full administrative control across all domains and system settings |
| **Inventory Manager** | `2` | Manages catalog, inventory counts, adjustments, and multi-warehouse transfers |
| **Sales Manager** | `3` | Creates and monitors customer records and sales orders |
| **Supplier Manager** | `4` | Manages suppliers, vendor catalogs, and purchase orders |

### Pre-Configured Test Accounts (Password: `Password123!`)
- Admin: `admin@retailhub.in`
- Inventory Manager: `inventory@retailhub.in`
- Sales Manager: `sales@retailhub.in`
- Supplier Manager: `supplier@retailhub.in`

---

## 3. Endpoints Reference

### 3.1 Authentication (`/api/auth`)
* `POST /api/auth/register` - Register a new user (`name`, `email`, `password`, `role_id`).
* `POST /api/auth/login` - Authenticate with email and password; returns JWT token and user info.
* `GET /api/auth/me` - Retrieve authenticated user profile from token.

### 3.2 Product Information Management (`/api/products`)
* `GET /api/products` - List products with search, pagination (`page`, `limit`), sorting (`sortBy`, `sortOrder`), category filter (`category_id`), and low-stock filter (`low_stock=true`). Returns aggregated stock metrics: `total_stock`, `total_reserved`, and `available_stock`.
* `GET /api/products/:id` - Product details with per-warehouse inventory breakdown and supplier mapping.
* `POST /api/products` *(Admin, Inventory Manager)* - Create product with margin verification ($price \ge cost$) and optional initial inventory.
* `PUT /api/products/:id` *(Admin, Inventory Manager)* - Update product metadata.
* `DELETE /api/products/:id` *(Admin)* - Delete product (enforces safety checks: blocked if inventory > 0 or order history exists).

### 3.3 Product Categories (`/api/categories`)
* `GET /api/categories` - List categories with active product count.
* `POST /api/categories` *(Admin, Inventory Manager)* - Create category.
* `PUT /api/categories/:id` *(Admin, Inventory Manager)* - Update category.
* `DELETE /api/categories/:id` *(Admin)* - Delete category (blocked if products are currently assigned).

### 3.4 Warehouses & Facilities (`/api/warehouses`)
* `GET /api/warehouses` - List warehouses with aggregate stock totals (`total_products`, `total_items`, `total_reserved`, `total_valuation`).
* `GET /api/warehouses/:id` - Warehouse details with complete inventory line items.
* `POST /api/warehouses` *(Admin)* - Create new warehouse facility.
* `PUT /api/warehouses/:id` *(Admin)* - Update warehouse facility.
* `DELETE /api/warehouses/:id` *(Admin)* - Delete warehouse (blocked if holding active stock).

### 3.5 Inventory & Multi-Warehouse Operations (`/api/inventory`)
* `GET /api/inventory` - Search and filter inventory records across products and warehouses.
* `GET /api/inventory/low-stock` - Returns items where $quantity \le reorder\_level$, including intelligent reorder suggestions.
* `POST /api/inventory/adjust` *(Admin, Inventory Manager)* - Execute stock adjustment inside a PostgreSQL transaction with row-level locking (`FOR UPDATE`) and `stock_movements` ledger entry.
* `POST /api/inventory/transfer` *(Admin, Inventory Manager)* - Atomic multi-warehouse transfer between two facilities: validates available stock, locks source row, deducts origin balance, increments destination balance, and writes dual `TRANSFER_OUT` and `TRANSFER_IN` audit records.
* `GET /api/inventory/movements` - Query immutable stock movement audit ledger.

### 3.6 Customers (`/api/customers`)
* `GET /api/customers` - List customers with order count and lifetime value (LTV).
* `GET /api/customers/:id` - Customer profile with full order history.
* `POST /api/customers` *(Admin, Sales Manager)* - Create customer profile.
* `PUT /api/customers/:id` *(Admin, Sales Manager)* - Update customer details.

### 3.7 Sales Orders & Fulfillment Stage-Gate (`/api/orders`)
* `GET /api/orders` - List sales orders with status filtering (`status=RESERVED`, etc.) and warehouse assignment.
* `GET /api/orders/:id` - Order line items with unit price and subtotal.
* `POST /api/orders` *(Admin, Sales Manager)* - Place sales order with **atomic stock reservation**:
  - Checks Available-to-Promise ($ATP = quantity - reserved$).
  - Locks inventory rows.
  - Increments `reserved_quantity` to prevent overselling.
  - Creates order in `RESERVED` status.
* `PUT /api/orders/:id/status` *(Admin, Sales Manager, Inventory Manager)* - Advance order status through fulfillment stage-gates:
  - `RESERVED` $\rightarrow$ `PICKED` $\rightarrow$ `PACKED` $\rightarrow$ `SHIPPED` (physically deducts stock from `quantity`, releases `reserved_quantity`, and writes `SALE` movement) $\rightarrow$ `DELIVERED`.
  - Or `CANCELLED`: automatically releases reserved stock back into available inventory.

### 3.8 Suppliers & Procurement (`/api/suppliers`)
* `GET /api/suppliers` - List suppliers with product counts and active PO counts.
* `GET /api/suppliers/:id` - Supplier profile with catalog and purchase history.
* `POST /api/suppliers` *(Admin, Supplier Manager)* - Register new vendor.
* `POST /api/suppliers/:id/products` *(Admin, Supplier Manager)* - Map supplier product pricing and lead times.

### 3.9 Purchase Orders & Goods Receiving (`/api/purchase-orders`)
* `GET /api/purchase-orders` - List purchase orders by status (`PENDING`, `ORDERED`, `RECEIVED`).
* `GET /api/purchase-orders/:id` - PO details with itemized unit costs.
* `POST /api/purchase-orders` *(Admin, Supplier Manager)* - Issue purchase order.
* `PUT /api/purchase-orders/:id/receive` *(Admin, Inventory Manager, Supplier Manager)* - **Goods Receipt Note (GRN)**:
  - Updates PO status to `RECEIVED`.
  - Ingests physical stock into destination warehouse inside a transaction.
  - Records `PURCHASE` movement in `stock_movements`.

### 3.10 Analytics & Executive Reports (`/api/reports`)
* `GET /api/reports/dashboard` - Real-time executive KPIs: inventory cost valuation, retail valuation, gross margin potential, low-stock alerts, warehouse distributions, and recent audit movements.
* `GET /api/reports/inventory-valuation` - Detailed valuation report (FIFO / AVCO basis).

### 3.11 System Health & Monitoring (`/api/health`)
* `GET /api/health` - Server uptime, service name, and PostgreSQL connectivity ping.
