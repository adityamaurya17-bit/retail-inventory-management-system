-- ============================================================================
-- Retail Inventory Management System (RIMS) - PostgreSQL Seed Dataset
-- Indian Retail Context: Consumer Electronics, Packaged Goods, Home & Fashion
-- Default password for all seed accounts: Password123!
-- ============================================================================

-- 1. Insert Roles
INSERT INTO roles (id, name) VALUES 
(1, 'Admin'),
(2, 'Inventory Manager'),
(3, 'Sales Manager'),
(4, 'Supplier Manager')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Reset sequence for roles
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

-- 2. Insert Users (Password: Password123!)
INSERT INTO users (id, name, email, password_hash, role_id) VALUES
(1, 'Aarav Sharma', 'admin@retailhub.in', '$2b$10$i8WXiDDh7y8rbDp8J7GheuL1UWjQ6.9s4xdkm2TaWF4B0TO4RzUD2', 1),
(2, 'Priya Patel', 'inventory@retailhub.in', '$2b$10$i8WXiDDh7y8rbDp8J7GheuL1UWjQ6.9s4xdkm2TaWF4B0TO4RzUD2', 2),
(3, 'Rohan Verma', 'sales@retailhub.in', '$2b$10$i8WXiDDh7y8rbDp8J7GheuL1UWjQ6.9s4xdkm2TaWF4B0TO4RzUD2', 3),
(4, 'Ananya Iyer', 'supplier@retailhub.in', '$2b$10$i8WXiDDh7y8rbDp8J7GheuL1UWjQ6.9s4xdkm2TaWF4B0TO4RzUD2', 4)
ON CONFLICT (email) DO UPDATE SET 
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  role_id = EXCLUDED.role_id;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 3. Insert Product Categories
INSERT INTO categories (id, name, description) VALUES
(1, 'Consumer Electronics', 'Smartphones, audio gear, computing accessories, and peripherals'),
(2, 'Home Appliances', 'Smart lighting, kitchen appliances, and climate control'),
(3, 'Packaged Foods & Groceries', 'Organic teas, packaged spices, pulses, and dry fruits'),
(4, 'Apparel & Fashion', 'Cotton shirts, denim wear, ethnic apparel, and sportswear'),
(5, 'Personal Care & Wellness', 'Herbal skincare, grooming electronics, and wellness supplements')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- 4. Insert Warehouses
INSERT INTO warehouses (id, name, location, manager) VALUES
(1, 'Bhiwandi Central DC', 'Building B4, Logistics Park, Bhiwandi, Thane, Maharashtra 421302', 'Vikram Malhotra'),
(2, 'Delhi NCR Northern Hub', 'Sector 18, Udyog Vihar, Gurugram, Haryana 122015', 'Sunita Rao'),
(3, 'Bengaluru South Fulfillment Center', 'Electronic City Phase 2, Hosur Road, Bengaluru, Karnataka 560100', 'Karthik Nambiar')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location, manager = EXCLUDED.manager;

SELECT setval('warehouses_id_seq', (SELECT MAX(id) FROM warehouses));

-- 5. Insert 24 Realistic Products
INSERT INTO products (id, sku, name, description, category_id, price, cost_price, reorder_level) VALUES
(1, 'ELEC-ANC-001', 'AuraSound Neo ANC Wireless Headphones', 'Hybrid Active Noise Cancellation with 40mm drivers and 38-hour battery.', 1, 8999.00, 5200.00, 25),
(2, 'ELEC-KB-002', 'VortexPro RGB Mechanical Gaming Keyboard', 'Hot-swappable tactile brown switches with aircraft-grade aluminum chassis.', 1, 4499.00, 2400.00, 20),
(3, 'ELEC-MST-003', 'OptiTrack Wireless Laser Ergonomic Mouse', '4000 DPI multi-device bluetooth mouse with silent switches.', 1, 1999.00, 950.00, 30),
(4, 'ELEC-HUB-004', 'OmniPort 8-in-1 USB-C Hub', 'Dual 4K HDMI, 100W PD passthrough, Gigabit Ethernet, SD card reader.', 1, 3299.00, 1650.00, 15),
(5, 'ELEC-PWR-005', 'Voltaic 20000mAh 65W Fast Power Bank', 'GaN high-speed laptop and mobile charging power bank.', 1, 2799.00, 1400.00, 25),
(6, 'ELEC-MIC-006', 'StudioStream Cardioid USB Condenser Mic', 'High-definition 192kHz/24bit microphone with built-in pop filter.', 1, 4999.00, 2600.00, 12),
(7, 'HOME-AIR-001', 'PureBreeze Smart HEPA Air Purifier', 'True HEPA H13 filter with PM2.5 real-time laser monitor and WiFi control.', 2, 9999.00, 6100.00, 15),
(8, 'HOME-KTL-002', 'ThermaBoil 1.7L Digital Electric Kettle', 'Double-wall stainless steel kettle with 5 temperature presets.', 2, 2499.00, 1250.00, 20),
(9, 'HOME-ROB-003', 'SweepPro 2-in-1 Robot Vacuum & Mop', 'LiDAR mapping with 3000Pa suction power and carpet auto-boost.', 2, 21999.00, 14200.00, 8),
(10, 'HOME-BLD-004', 'NutriPulse 1000W High-Torque Blender', 'Commercial-grade extractor with 6 titanium blades and 3 blending jars.', 2, 3899.00, 2100.00, 15),
(11, 'FOOD-CHAI-001', 'Darjeeling First Flush Royal Tea (250g)', 'Single-estate certified organic aromatic black tea.', 3, 799.00, 380.00, 50),
(12, 'FOOD-SPC-002', 'Malabar Organic Black Pepper (500g)', 'Sun-dried Tellicherry grade bold whole black peppercorns.', 3, 599.00, 290.00, 40),
(13, 'FOOD-HON-003', 'Himalayan Raw Wild Forest Honey (500g)', 'Unprocessed, unfiltered natural forest honey with pollen richness.', 3, 649.00, 310.00, 35),
(14, 'FOOD-ALM-004', 'Kashmiri Mamra Almonds (500g)', 'Nutrient-rich cold-pressed high-oil edible Kashmiri almonds.', 3, 1199.00, 720.00, 30),
(15, 'FOOD-BAS-005', 'Royal Heritage Aged Basmati Rice (5kg)', '2-year aged long-grain fragrant Himalayan foothill basmati rice.', 3, 899.00, 510.00, 40),
(16, 'APP-SHRT-001', 'EcoThread Linen Regular Fit Shirt', '100% breathable organic European flax linen casual shirt.', 4, 2199.00, 950.00, 25),
(17, 'APP-DNM-002', 'UrbanFlex Stretch Indigo Selvedge Jeans', '12.5oz Japanese stretch denim with reinforced bar-tack stitching.', 4, 2999.00, 1350.00, 20),
(18, 'APP-TEE-003', 'Classic Supima Heavyweight T-Shirt', '220 GSM combed organic Supima cotton everyday luxury crewneck.', 4, 999.00, 420.00, 60),
(19, 'APP-JKT-004', 'AeroShield All-Weather Travel Jacket', 'Waterproof breathable shell jacket with packable stowaway hood.', 4, 3999.00, 1900.00, 15),
(20, 'WELL-TRM-001', 'PrecisionBlade Pro Beard & Hair Trimmer', 'Self-sharpening titanium coated blades with 40 length adjustments.', 5, 1899.00, 890.00, 30),
(21, 'WELL-DRY-002', 'IonicSilkWear 2000W Salon Hair Dryer', 'Negative-ion brushless motor for frizz-free drying.', 5, 2799.00, 1350.00, 20),
(22, 'WELL-OIL-003', 'Kumkumadi Radiance Face Oil (30ml)', 'Traditional 24-herb saffron infused brightening Ayurvedic elixir.', 5, 1499.00, 580.00, 35),
(23, 'WELL-SUN-004', 'MatteFinish Mineral Sunscreen SPF 50', 'Broad-spectrum non-comedogenic zinc oxide physical sunscreen.', 5, 699.00, 280.00, 50),
(24, 'WELL-SER-005', 'Hyaluronic Hydrating Face Serum (50ml)', 'Triple-molecular multi-depth hydration barrier repair serum.', 5, 899.00, 340.00, 40)
ON CONFLICT (sku) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  cost_price = EXCLUDED.cost_price,
  reorder_level = EXCLUDED.reorder_level;

SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- 6. Insert Inventory (Distributed across the 3 Warehouses)
INSERT INTO inventory (product_id, warehouse_id, quantity, reserved_quantity) VALUES
-- Warehouse 1: Bhiwandi Central DC
(1, 1, 85, 10),
(2, 1, 60, 5),
(3, 1, 120, 15),
(4, 1, 45, 0),
(5, 1, 90, 8),
(6, 1, 30, 2),
(7, 1, 28, 4),
(8, 1, 55, 0),
(9, 1, 14, 2),
(10, 1, 40, 5),
(11, 1, 140, 20),
(12, 1, 95, 10),
(13, 1, 80, 5),
(14, 1, 65, 0),
(15, 1, 110, 15),
(16, 1, 70, 10),
(17, 1, 50, 5),
(18, 1, 160, 25),
(19, 1, 35, 0),
(20, 1, 75, 10),
(21, 1, 45, 5),
(22, 1, 90, 12),
(23, 1, 130, 20),
(24, 1, 85, 10),

-- Warehouse 2: Delhi NCR Northern Hub (Some low stock items)
(1, 2, 15, 0), -- Low stock (< 25)
(2, 2, 8, 2),  -- Low stock (< 20)
(3, 2, 45, 5),
(5, 2, 12, 0), -- Low stock (< 25)
(7, 2, 10, 2), -- Low stock (< 15)
(9, 2, 5, 0),  -- Low stock (< 8)
(11, 2, 60, 10),
(14, 2, 20, 5),
(16, 2, 18, 0),
(18, 2, 80, 15),
(20, 2, 22, 0),
(22, 2, 25, 5),

-- Warehouse 3: Bengaluru South Hub
(1, 3, 40, 5),
(2, 3, 35, 4),
(3, 3, 50, 8),
(4, 3, 25, 0),
(6, 3, 18, 2),
(8, 3, 30, 0),
(10, 3, 20, 0),
(12, 3, 45, 5),
(13, 3, 35, 2),
(15, 3, 60, 10),
(17, 3, 28, 4),
(19, 3, 12, 0), -- Low stock (< 15)
(21, 3, 20, 0),
(23, 3, 55, 5),
(24, 3, 40, 4)
ON CONFLICT (product_id, warehouse_id) DO UPDATE SET 
  quantity = EXCLUDED.quantity,
  reserved_quantity = EXCLUDED.reserved_quantity;

-- 7. Insert Customers
INSERT INTO customers (id, name, email, phone, address) VALUES
(1, 'Rajesh Kannan', 'rajesh.kannan@gmail.com', '+91 98401 23456', 'Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103'),
(2, 'Meera Deshmukh', 'meera.deshmukh@yahoo.co.in', '+91 98200 87654', 'B-12, Sagar Darshan Towers, Worli Sea Face, Mumbai, Maharashtra 400018'),
(3, 'Amitabh Sengupta', 'amitabh.s@outlook.com', '+91 98310 54321', '88/2, Southern Avenue, Lake Market, Kolkata, West Bengal 700029'),
(4, 'Deepika Sharma', 'deepika.sharma@gmail.com', '+91 98112 34567', 'House 54, Golf Links, New Delhi 110003'),
(5, 'Suresh Reddy', 'suresh.reddy@techmail.in', '+91 98490 11223', 'Plot 105, Jubilee Hills Road No. 36, Hyderabad, Telangana 500033'),
(6, 'Pooja Agarwal', 'pooja.agarwal@gmail.com', '+91 97245 67890', '401, Shivalik High Street, Vastrapur, Ahmedabad, Gujarat 380015')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, address = EXCLUDED.address;

SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers));

-- 8. Insert Suppliers
INSERT INTO suppliers (id, name, email, phone, address) VALUES
(1, 'Apex Electronics Hardware Ltd', 'procurement@apexelectronics.in', '+91 120 4567890', 'Plot 45, Phase II, Noida Special Economic Zone, Uttar Pradesh 201305'),
(2, 'ThermaHome Appliances Corp', 'sales@thermahome.com', '+91 22 28549900', 'Gala 10, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093'),
(3, 'Nilgiri & Malabar Organic Plantations', 'orders@nilgiriorganics.in', '+91 423 2445566', 'Tea Estate Rd, Coonoor, Nilgiris, Tamil Nadu 643101'),
(4, 'Vardhman Textiles & Garments Ltd', 'b2b@vardhmantextiles.com', '+91 161 2228943', 'Chandigarh Road, Ludhiana, Punjab 141010'),
(5, 'AyuVeda Bio-Wellness Labs', 'supply@ayuveda.co.in', '+91 484 2623344', 'Kinfra Bio-Tech Park, Kalamassery, Kochi, Kerala 683503')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, address = EXCLUDED.address;

SELECT setval('suppliers_id_seq', (SELECT MAX(id) FROM suppliers));

-- 9. Insert Supplier Products (Pricing & Lead Times)
INSERT INTO supplier_products (supplier_id, product_id, supplier_price, lead_time_days) VALUES
(1, 1, 5000.00, 7),
(1, 2, 2300.00, 5),
(1, 3, 900.00, 4),
(1, 4, 1550.00, 6),
(1, 5, 1300.00, 5),
(1, 6, 2450.00, 8),
(2, 7, 5800.00, 10),
(2, 8, 1200.00, 5),
(2, 9, 13800.00, 14),
(2, 10, 1950.00, 7),
(3, 11, 350.00, 5),
(3, 12, 270.00, 4),
(3, 13, 290.00, 6),
(3, 14, 690.00, 8),
(3, 15, 480.00, 5),
(4, 16, 900.00, 10),
(4, 17, 1280.00, 12),
(4, 18, 390.00, 7),
(4, 19, 1800.00, 14),
(5, 20, 840.00, 6),
(5, 21, 1280.00, 7),
(5, 22, 540.00, 5),
(5, 23, 260.00, 4),
(5, 24, 320.00, 5)
ON CONFLICT (supplier_id, product_id) DO UPDATE SET supplier_price = EXCLUDED.supplier_price, lead_time_days = EXCLUDED.lead_time_days;

-- 10. Insert Sample Sales Orders & Items
INSERT INTO orders (id, customer_id, warehouse_id, status, total_amount, created_by) VALUES
(1, 1, 3, 'DELIVERED', 13498.00, 3),
(2, 2, 1, 'SHIPPED', 7298.00, 3),
(3, 3, 1, 'PACKED', 9999.00, 3),
(4, 4, 2, 'RESERVED', 6498.00, 3),
(5, 5, 3, 'CREATED', 4198.00, 3)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, total_amount = EXCLUDED.total_amount;

SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));

INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
(1, 1, 1, 8999.00, 8999.00),
(1, 2, 1, 4499.00, 4499.00),
(2, 2, 1, 4499.00, 4499.00),
(2, 5, 1, 2799.00, 2799.00),
(3, 7, 1, 9999.00, 9999.00),
(4, 2, 1, 4499.00, 4499.00),
(4, 3, 1, 1999.00, 1999.00),
(5, 16, 1, 2199.00, 2199.00),
(5, 3, 1, 1999.00, 1999.00)
ON CONFLICT (order_id, product_id) DO NOTHING;

-- 11. Insert Sample Purchase Orders & Items
INSERT INTO purchase_orders (id, supplier_id, warehouse_id, status, total_amount, expected_date, created_by) VALUES
(1, 1, 1, 'RECEIVED', 260000.00, '2026-09-20', 4),
(2, 2, 2, 'ORDERED', 116000.00, '2026-10-05', 4),
(3, 3, 1, 'PENDING', 35000.00, '2026-10-02', 4)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, total_amount = EXCLUDED.total_amount;

SELECT setval('purchase_orders_id_seq', (SELECT MAX(id) FROM purchase_orders));

INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_cost, subtotal) VALUES
(1, 1, 50, 5200.00, 260000.00),
(2, 7, 20, 5800.00, 116000.00),
(3, 11, 100, 350.00, 35000.00)
ON CONFLICT (purchase_order_id, product_id) DO NOTHING;

-- 12. Insert Sample Stock Movement Audit Logs
INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, reference_id, notes, performed_by) VALUES
(1, 1, 'PURCHASE', 50, 'PO-0001', 'Received inbound batch from Apex Electronics', 2),
(1, 3, 'SALE', 1, 'ORD-0001', 'Dispatched to customer Rajesh Kannan', 3),
(2, 1, 'TRANSFER_OUT', 10, 'TRF-1001', 'Transferred to Delhi NCR Northern Hub for regional rebalance', 2),
(2, 2, 'TRANSFER_IN', 10, 'TRF-1001', 'Ingested transfer stock at Delhi Hub', 2),
(7, 1, 'ADJUSTMENT', 2, 'ADJ-001', 'Cycle count reconciliation: found 2 surplus units in Row C', 2);

-- 13. Insert Notifications
INSERT INTO notifications (user_id, type, title, message, is_read) VALUES
(2, 'LOW_STOCK', 'Low Stock Alert: VortexPro Keyboard', 'Delhi NCR Northern Hub has only 8 units remaining (reorder level: 20).', FALSE),
(2, 'LOW_STOCK', 'Low Stock Alert: PureBreeze Air Purifier', 'Delhi NCR Northern Hub has only 10 units remaining (reorder level: 15).', FALSE),
(3, 'ORDER_CREATED', 'New Order Received #ORD-0005', 'Customer Suresh Reddy placed an order totaling Rs 4,198.00.', FALSE),
(4, 'PO_RECEIVED', 'Purchase Order Fulfilled #PO-0001', 'Bhiwandi Central DC received 50 units of AuraSound Neo ANC Headphones.', TRUE);
