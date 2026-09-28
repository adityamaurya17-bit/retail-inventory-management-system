-- ============================================================================
-- Retail Inventory Management System (RIMS) - Master Relational Schema
-- Compatible with PostgreSQL 14+ and SQLite 3.35+
-- ============================================================================

-- 1. Product Categories Hierarchy
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    parent_id VARCHAR(36) REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Brands Master
CREATE TABLE IF NOT EXISTS brands (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Suppliers Registry
CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    contact_name VARCHAR(100),
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'USA',
    lead_time_days INT NOT NULL DEFAULT 7,
    payment_terms VARCHAR(50) DEFAULT 'Net 30',
    reliability_rating DECIMAL(3, 2) DEFAULT 4.80, -- Rating between 1.00 and 5.00
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products Master (PIM)
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    barcode VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id VARCHAR(36) REFERENCES categories(id) ON DELETE RESTRICT,
    brand_id VARCHAR(36) REFERENCES brands(id) ON DELETE SET NULL,
    primary_supplier_id VARCHAR(36) REFERENCES suppliers(id) ON DELETE SET NULL,
    cost_price DECIMAL(10, 2) NOT NULL CHECK (cost_price >= 0),
    selling_price DECIMAL(10, 2) NOT NULL CHECK (selling_price >= cost_price),
    reorder_point INT NOT NULL DEFAULT 20 CHECK (reorder_point >= 0),
    max_stock INT NOT NULL DEFAULT 200 CHECK (max_stock >= reorder_point),
    unit VARCHAR(20) DEFAULT 'Units',
    weight_kg DECIMAL(8, 3) DEFAULT 0.500,
    dimensions_cm VARCHAR(50), -- e.g., '20x15x10'
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Discontinued', 'Draft')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Multi-Warehouse Facilities
CREATE TABLE IF NOT EXISTS warehouses (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) DEFAULT 'Distribution Center' CHECK (type IN ('Central DC', 'Regional Hub', 'Store Backroom', '3PL Partner')),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    total_sqft INT NOT NULL DEFAULT 50000,
    max_capacity_units INT NOT NULL DEFAULT 100000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Warehouse Zones & Bin Topology
CREATE TABLE IF NOT EXISTS warehouse_zones (
    id VARCHAR(36) PRIMARY KEY,
    warehouse_id VARCHAR(36) NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL, -- e.g., 'A', 'B', 'C'
    name VARCHAR(100) NOT NULL,
    zone_type VARCHAR(50) DEFAULT 'Standard Storage' CHECK (zone_type IN ('Fast-Pick', 'Bulk Pallet', 'Cold Storage', 'High-Security', 'Quarantine')),
    UNIQUE(warehouse_id, code)
);

CREATE TABLE IF NOT EXISTS warehouse_bins (
    id VARCHAR(36) PRIMARY KEY,
    warehouse_id VARCHAR(36) NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    zone_id VARCHAR(36) NOT NULL REFERENCES warehouse_zones(id) ON DELETE CASCADE,
    bin_code VARCHAR(30) NOT NULL, -- e.g., 'A-01-02-B' (Zone-Aisle-Shelf-Bin)
    aisle VARCHAR(10) NOT NULL,
    shelf VARCHAR(10) NOT NULL,
    bin_level VARCHAR(10) NOT NULL,
    max_weight_kg DECIMAL(8, 2) DEFAULT 250.0,
    is_occupied BOOLEAN DEFAULT FALSE,
    UNIQUE(warehouse_id, bin_code)
);

-- 7. Real-Time Inventory Stock Ledger
CREATE TABLE IF NOT EXISTS inventory_stock (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id VARCHAR(36) NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    bin_id VARCHAR(36) REFERENCES warehouse_bins(id) ON DELETE SET NULL,
    on_hand INT NOT NULL DEFAULT 0 CHECK (on_hand >= 0),
    reserved INT NOT NULL DEFAULT 0 CHECK (reserved >= 0),
    version INT NOT NULL DEFAULT 1, -- Optimistic concurrency lock counter
    last_counted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_atp_non_negative CHECK (on_hand >= reserved),
    UNIQUE(product_id, warehouse_id, bin_id)
);

-- 8. Stock Batches & Lot Expiration (FIFO Cost Layering)
CREATE TABLE IF NOT EXISTS stock_batches (
    id VARCHAR(36) PRIMARY KEY,
    stock_id VARCHAR(36) NOT NULL REFERENCES inventory_stock(id) ON DELETE CASCADE,
    lot_number VARCHAR(50) NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL,
    initial_qty INT NOT NULL CHECK (initial_qty > 0),
    remaining_qty INT NOT NULL CHECK (remaining_qty >= 0),
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE,
    UNIQUE(stock_id, lot_number)
);

-- 9. Purchase Orders (Procurement)
CREATE TABLE IF NOT EXISTS purchase_orders (
    id VARCHAR(36) PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    destination_warehouse_id VARCHAR(36) NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    status VARCHAR(30) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Partially Received', 'Completed', 'Cancelled')),
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    total_cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS po_line_items (
    id VARCHAR(36) PRIMARY KEY,
    purchase_order_id VARCHAR(36) NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity_ordered INT NOT NULL CHECK (quantity_ordered > 0),
    quantity_received INT NOT NULL DEFAULT 0 CHECK (quantity_received >= 0),
    unit_cost DECIMAL(10, 2) NOT NULL,
    UNIQUE(purchase_order_id, product_id)
);

-- 10. Goods Receipt Notes (GRN)
CREATE TABLE IF NOT EXISTS goods_receipt_notes (
    id VARCHAR(36) PRIMARY KEY,
    grn_number VARCHAR(50) NOT NULL UNIQUE,
    purchase_order_id VARCHAR(36) NOT NULL REFERENCES purchase_orders(id) ON DELETE RESTRICT,
    warehouse_id VARCHAR(36) NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    received_by_user VARCHAR(100) NOT NULL,
    carrier VARCHAR(100),
    tracking_reference VARCHAR(100),
    inspection_passed BOOLEAN DEFAULT TRUE,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Omnichannel Sales Orders
CREATE TABLE IF NOT EXISTS sales_orders (
    id VARCHAR(36) PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    channel VARCHAR(30) DEFAULT 'Web' CHECK (channel IN ('Web', 'POS', 'Mobile', 'Amazon', 'B2B Wholesale')),
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    shipping_street TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(50) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL,
    allocated_warehouse_id VARCHAR(36) REFERENCES warehouses(id) ON DELETE RESTRICT,
    status VARCHAR(30) DEFAULT 'Pending Allocation' CHECK (status IN ('Pending Allocation', 'Allocated', 'Picking', 'Packing', 'Dispatched', 'Delivered', 'Cancelled')),
    total_amount DECIMAL(12, 2) NOT NULL,
    carrier VARCHAR(50) DEFAULT 'FedEx Express',
    tracking_number VARCHAR(100),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_line_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    allocated_bin_id VARCHAR(36) REFERENCES warehouse_bins(id),
    is_picked BOOLEAN DEFAULT FALSE,
    is_packed BOOLEAN DEFAULT FALSE,
    UNIQUE(order_id, product_id)
);

-- 12. Inter-Warehouse Stock Transfers
CREATE TABLE IF NOT EXISTS stock_transfers (
    id VARCHAR(36) PRIMARY KEY,
    transfer_number VARCHAR(50) NOT NULL UNIQUE,
    from_warehouse_id VARCHAR(36) NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    to_warehouse_id VARCHAR(36) NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    status VARCHAR(30) DEFAULT 'Draft' CHECK (status IN ('Draft', 'In-Transit', 'Completed', 'Cancelled')),
    carrier VARCHAR(100),
    tracking_number VARCHAR(100),
    initiated_by VARCHAR(100) NOT NULL,
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- 13. System Audit Log (Immutable Event Ledger)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL,
    actor_name VARCHAR(100) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR ENTERPRISE QUERY PERFORMANCE
-- ============================================================================
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_stock_product_wh ON inventory_stock(product_id, warehouse_id);
CREATE INDEX idx_stock_atp ON inventory_stock((on_hand - reserved));
CREATE INDEX idx_orders_status ON sales_orders(status);
CREATE INDEX idx_orders_warehouse ON sales_orders(allocated_warehouse_id);
CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
