import { store } from "../state/store.js";
import { modals } from "../components/modals/ModalManager.js";
import { toast } from "../components/toast/Toast.js";
import { simulateOrderAllocation } from "../algorithms/stockAllocation.js";
import { calculateSafetyStock, calculateROP, calculateEOQ, SERVICE_LEVEL_Z } from "../algorithms/reorderPoint.js";
import { ValuationEngine } from "../algorithms/valuation.js";

// Tab and View State
let activeArchTab = "c4"; // 'c4', 'algorithms', 'erd', 'ddd'
let activeC4Level = "context"; // 'context', 'container', 'component', 'events'
let activeErdCategory = "all"; // 'all', 'catalog', 'ledger', 'topology', 'fulfillment', 'procurement'
let erdSearchQuery = "";

// Simulator 1 State: Multi-Warehouse Allocation
let simDest = "New York, NY";
let simQty1 = 5;
let simQty2 = 2;

// Simulator 2 State: ROP & Safety Stock
let ropDemand = 15;
let ropLeadTime = 10;
let ropSigmaDemand = 3;
let ropSigmaLead = 2;
let ropServiceLevel = "95%";

// Simulator 3 State: Valuation FIFO vs AVCO
let valUnitsToDeplete = 65;

// Sample Cost Layers for Valuation Engine
const sampleCostLayers = [
  { batchId: "LOT-01 (Jan)", quantity: 30, unitCost: 65.0, receivedDate: "2026-01-10" },
  { batchId: "LOT-02 (Feb)", quantity: 40, unitCost: 75.0, receivedDate: "2026-02-15" },
  { batchId: "LOT-03 (Mar)", quantity: 50, unitCost: 85.0, receivedDate: "2026-03-20" }
];

// Relational Schema Definitions
const erdTables = [
  {
    name: "products",
    category: "catalog",
    badge: "Catalog Master",
    desc: "Product master records, selling prices, cost bases, SKU identifiers, and EAN-13 barcodes.",
    ddl: `CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    category_id INT NOT NULL REFERENCES categories(id),
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    cost_price NUMERIC(12, 2) NOT NULL CHECK (cost_price >= 0),
    reorder_level INT NOT NULL DEFAULT 10 CHECK (reorder_level >= 0),
    CONSTRAINT chk_margin CHECK (price >= cost_price)
);`,
    columns: [
      { name: "id", type: "SERIAL", key: "PK", constraint: "PRIMARY KEY" },
      { name: "sku", type: "VARCHAR(50)", key: "UNIQUE", constraint: "NOT NULL UNIQUE" },
      { name: "barcode", type: "VARCHAR(30)", key: "UNIQUE", constraint: "EAN-13 FORMAT" },
      { name: "name", type: "VARCHAR(200)", constraint: "NOT NULL" },
      { name: "category_id", type: "INT", key: "FK", target: "categories.id" },
      { name: "cost_price", type: "NUMERIC(12,2)", constraint: "CHECK >= 0" },
      { name: "price", type: "NUMERIC(12,2)", constraint: "CHECK >= cost_price" },
      { name: "reorder_level", type: "INT", constraint: "DEFAULT 10" }
    ]
  },
  {
    name: "inventory",
    category: "ledger",
    badge: "Ledger Core",
    desc: "Multi-warehouse atomic stock balances with Optimistic Concurrency Control (OCC) versioning.",
    ddl: `CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id INT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    version INT NOT NULL DEFAULT 1, -- OCC Lock
    CONSTRAINT uq_product_wh UNIQUE (product_id, warehouse_id),
    CONSTRAINT chk_atp CHECK (quantity >= reserved_quantity)
);`,
    columns: [
      { name: "id", type: "SERIAL", key: "PK", constraint: "PRIMARY KEY" },
      { name: "product_id", type: "INT", key: "FK", target: "products.id" },
      { name: "warehouse_id", type: "INT", key: "FK", target: "warehouses.id" },
      { name: "quantity", type: "INT", constraint: "CHECK >= 0 (SOH)" },
      { name: "reserved_quantity", type: "INT", constraint: "CHECK >= 0 (RES)" },
      { name: "version", type: "INT", key: "OCC", constraint: "OCC Version Counter" }
    ]
  },
  {
    name: "stock_movements",
    category: "ledger",
    badge: "Audit Ledger",
    desc: "Immutable append-only transaction ledger logging every physical unit stock mutation.",
    ddl: `CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id INT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    movement_type VARCHAR(30) NOT NULL CHECK (movement_type IN ('PURCHASE', 'SALE', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT', 'RETURN')),
    quantity INT NOT NULL CHECK (quantity > 0),
    reference_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`,
    columns: [
      { name: "id", type: "SERIAL", key: "PK", constraint: "PRIMARY KEY" },
      { name: "product_id", type: "INT", key: "FK", target: "products.id" },
      { name: "warehouse_id", type: "INT", key: "FK", target: "warehouses.id" },
      { name: "movement_type", type: "VARCHAR(30)", constraint: "PURCHASE/SALE/TRANSFER/ADJ" },
      { name: "quantity", type: "INT", constraint: "CHECK > 0" },
      { name: "reference_id", type: "VARCHAR(100)", constraint: "Order / PO / Transfer Ref" }
    ]
  },
  {
    name: "warehouses",
    category: "topology",
    badge: "Facility Master",
    desc: "Regional distribution centers, geographic GPS coordinates, and spatial dimension limits.",
    ddl: `CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL UNIQUE,
    location VARCHAR(200) NOT NULL,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    max_capacity_units INT NOT NULL DEFAULT 50000
);`,
    columns: [
      { name: "id", type: "SERIAL", key: "PK", constraint: "PRIMARY KEY" },
      { name: "code", type: "VARCHAR(20)", key: "UNIQUE", constraint: "NOT NULL UNIQUE" },
      { name: "name", type: "VARCHAR(150)", constraint: "NOT NULL" },
      { name: "location", type: "VARCHAR(200)", constraint: "City, State / Metro" },
      { name: "latitude", type: "NUMERIC(9,6)", constraint: "Haversine Lat" },
      { name: "longitude", type: "NUMERIC(9,6)", constraint: "Haversine Lon" }
    ]
  },
  {
    name: "orders",
    category: "fulfillment",
    badge: "Fulfillment",
    desc: "Omnichannel customer orders with stage-gate state machines and allocated distribution center.",
    ddl: `CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT NOT NULL REFERENCES customers(id),
    warehouse_id INT NOT NULL REFERENCES warehouses(id),
    status VARCHAR(30) NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'RESERVED', 'PICKED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0)
);`,
    columns: [
      { name: "id", type: "SERIAL", key: "PK", constraint: "PRIMARY KEY" },
      { name: "order_number", type: "VARCHAR(50)", key: "UNIQUE", constraint: "NOT NULL UNIQUE" },
      { name: "customer_id", type: "INT", key: "FK", target: "customers.id" },
      { name: "warehouse_id", type: "INT", key: "FK", target: "warehouses.id" },
      { name: "status", type: "VARCHAR(30)", constraint: "Stage-Gate FSM" },
      { name: "total_amount", type: "NUMERIC(12,2)", constraint: "CHECK >= 0" }
    ]
  },
  {
    name: "stock_transfers",
    category: "topology",
    badge: "Inter-Hub Logistics",
    desc: "Inter-warehouse replenishment shipments between distribution centers with carrier tracking.",
    ddl: `CREATE TABLE stock_transfers (
    id SERIAL PRIMARY KEY,
    transfer_number VARCHAR(50) NOT NULL UNIQUE,
    from_warehouse_id INT NOT NULL REFERENCES warehouses(id),
    to_warehouse_id INT NOT NULL REFERENCES warehouses(id),
    status VARCHAR(30) NOT NULL CHECK (status IN ('REQUESTED', 'APPROVED', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED')),
    carrier VARCHAR(100) NOT NULL
);`,
    columns: [
      { name: "id", type: "SERIAL", key: "PK", constraint: "PRIMARY KEY" },
      { name: "transfer_number", type: "VARCHAR(50)", key: "UNIQUE", constraint: "NOT NULL UNIQUE" },
      { name: "from_warehouse_id", type: "INT", key: "FK", target: "warehouses.id" },
      { name: "to_warehouse_id", type: "INT", key: "FK", target: "warehouses.id" },
      { name: "status", type: "VARCHAR(30)", constraint: "Logistics State" },
      { name: "carrier", type: "VARCHAR(100)", constraint: "Freight Operator" }
    ]
  },
  {
    name: "suppliers",
    category: "procurement",
    badge: "Vendor Directory",
    desc: "Supplier directory, delivery lead-time SLA reliability ratings, and commercial payment terms.",
    ddl: `CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    lead_time_days INT NOT NULL DEFAULT 7 CHECK (lead_time_days >= 1),
    reliability_rating NUMERIC(3, 1) DEFAULT 4.5 CHECK (reliability_rating BETWEEN 0 AND 5),
    payment_terms VARCHAR(50) DEFAULT 'Net 30'
);`,
    columns: [
      { name: "id", type: "SERIAL", key: "PK", constraint: "PRIMARY KEY" },
      { name: "name", type: "VARCHAR(150)", constraint: "NOT NULL" },
      { name: "email", type: "VARCHAR(150)", key: "UNIQUE", constraint: "NOT NULL UNIQUE" },
      { name: "lead_time_days", type: "INT", constraint: "DEFAULT 7 days" },
      { name: "reliability_rating", type: "NUMERIC(3,1)", constraint: "0.0 to 5.0" },
      { name: "payment_terms", type: "VARCHAR(50)", constraint: "Net 30 / Net 60" }
    ]
  },
  {
    name: "purchase_orders",
    category: "procurement",
    badge: "Procure-to-Pay",
    desc: "Inbound vendor purchase orders issued to replenish inventory when ATP falls below ROP.",
    ddl: `CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id INT NOT NULL REFERENCES suppliers(id),
    warehouse_id INT NOT NULL REFERENCES warehouses(id),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED')),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);`,
    columns: [
      { name: "id", type: "SERIAL", key: "PK", constraint: "PRIMARY KEY" },
      { name: "po_number", type: "VARCHAR(50)", key: "UNIQUE", constraint: "NOT NULL UNIQUE" },
      { name: "supplier_id", type: "INT", key: "FK", target: "suppliers.id" },
      { name: "warehouse_id", type: "INT", key: "FK", target: "warehouses.id" },
      { name: "status", type: "VARCHAR(30)", constraint: "PENDING/ORDERED/RECEIVED" },
      { name: "total_amount", type: "NUMERIC(12,2)", constraint: "CHECK >= 0" }
    ]
  }
];

export function renderArchitectureView() {
  return `
    <div class="view-container animate-fade-in" id="arch-view-root">
      <!-- Header -->
      <div class="view-header">
        <div>
          <div class="flex-center gap-xs" style="margin-bottom: 8px;">
            <span class="badge badge-accent"><i data-lucide="cpu"></i> System Architecture</span>
            <span class="badge badge-subtle">C4 Model v2.1</span>
            <span class="badge badge-info">PostgreSQL 18.6 Schema</span>
            <span class="badge badge-success">Clean DDD</span>
          </div>
          <h1 class="view-title">Enterprise System Architecture & Engineering Blueprint</h1>
          <p class="view-subtitle">C4 abstraction diagrams, interactive algorithm sandboxes, 3NF relational data dictionary, and strategic DDD bounded contexts.</p>
        </div>
        <div class="header-actions">
          <button id="btn-view-schema-modal" class="btn btn-secondary btn-sm" title="View formatted SQL DDL in modal">
            <i data-lucide="code"></i>
            <span>View SQL DDL</span>
          </button>
          <button id="btn-export-ddl" class="btn btn-primary btn-sm" title="Download SQL DDL Schema">
            <i data-lucide="download"></i>
            <span>Export DDL</span>
          </button>
        </div>
      </div>

      <!-- Architecture Top-Level Tabs -->
      <div class="toolbar-card" style="margin-bottom: 24px;">
        <div class="btn-group" id="arch-top-tabs">
          <button class="btn btn-sm ${activeArchTab === "c4" ? "btn-primary" : "btn-secondary"}" data-arch-tab="c4">
            <i data-lucide="network"></i>
            <span>C4 Architecture Diagrams</span>
          </button>
          <button class="btn btn-sm ${activeArchTab === "algorithms" ? "btn-primary" : "btn-secondary"}" data-arch-tab="algorithms">
            <i data-lucide="calculator"></i>
            <span>Core Algorithm Sandboxes</span>
          </button>
          <button class="btn btn-sm ${activeArchTab === "erd" ? "btn-primary" : "btn-secondary"}" data-arch-tab="erd">
            <i data-lucide="database"></i>
            <span>Relational Database ERD</span>
          </button>
          <button class="btn btn-sm ${activeArchTab === "ddd" ? "btn-primary" : "btn-secondary"}" data-arch-tab="ddd">
            <i data-lucide="git-merge"></i>
            <span>Domain-Driven Design (DDD)</span>
          </button>
        </div>
      </div>

      <!-- Tab Content Mount Area -->
      <div id="arch-tab-content">
        ${renderActiveArchTabContent()}
      </div>
    </div>
  `;
}

function renderActiveArchTabContent() {
  if (activeArchTab === "c4") return renderC4Tab();
  if (activeArchTab === "algorithms") return renderAlgorithmsTab();
  if (activeArchTab === "erd") return renderErdTab();
  if (activeArchTab === "ddd") return renderDddTab();
  return "";
}

// ============================================================================
// TAB 1: C4 ARCHITECTURE DIAGRAMS
// ============================================================================
function renderC4Tab() {
  return `
    <div class="content-card animate-fade-in">
      <div class="card-header flex-between flex-wrap gap-sm" style="margin-bottom: 20px;">
        <div>
          <h2 class="card-title">C4 Architectural Abstraction Model</h2>
          <p class="card-subtitle text-xs text-muted">Progressive zoom levels from external business ecosystem down to internal component engines</p>
        </div>
        <div class="btn-group" id="c4-level-tabs">
          <button class="btn btn-xs ${activeC4Level === "context" ? "btn-primary" : "btn-secondary"}" data-c4-level="context">
            <span>Level 1: System Context</span>
          </button>
          <button class="btn btn-xs ${activeC4Level === "container" ? "btn-primary" : "btn-secondary"}" data-c4-level="container">
            <span>Level 2: Container Runtime</span>
          </button>
          <button class="btn btn-xs ${activeC4Level === "component" ? "btn-primary" : "btn-secondary"}" data-c4-level="component">
            <span>Level 3: Component Engine</span>
          </button>
          <button class="btn btn-xs ${activeC4Level === "events" ? "btn-primary" : "btn-secondary"}" data-c4-level="events">
            <span>Level 4: Event-Driven Flow</span>
          </button>
        </div>
      </div>

      <!-- C4 Diagram Viewport -->
      <div id="c4-diagram-viewport">
        ${renderC4DiagramContent()}
      </div>
    </div>
  `;
}

function renderC4DiagramContent() {
  if (activeC4Level === "context") {
    return `
      <div class="c4-diagram-canvas animate-fade-in">
        <div class="c4-title-tag">
          <div class="flex-center gap-xs">
            <i data-lucide="layers"></i>
            <span>C4 Level 1: System Context Diagram (Actors, Boundary & Ecosystem)</span>
          </div>
          <div class="c4-meta-pills">
            <span class="badge badge-subtle font-mono text-xs">SLA: 99.95%</span>
            <span class="badge badge-success font-mono text-xs">Throughput: 1,500 req/s</span>
            <span class="badge badge-info font-mono text-xs">TLS 1.3 / AES-256</span>
          </div>
        </div>

        <div class="c4-context-layout">
          <!-- Left Column: Enterprise Actors -->
          <div class="c4-col">
            <div class="c4-card c4-card-actor">
              <span class="c4-box-badge c4-badge-actor"><i data-lucide="user"></i> Inventory Operations Manager</span>
              <div class="c4-box-title">Warehouse Operations & Logistics Lead</div>
              <div class="c4-box-desc">Monitors multi-warehouse stock health, configures spatial bin topologies, authorizes inter-hub stock transfers, and oversees cycle count variances.</div>
              <div class="c4-flow-indicator">
                <span>Manages via HTTPS SPA</span>
                <i data-lucide="arrow-right"></i>
              </div>
            </div>

            <div class="c4-card c4-card-actor">
              <span class="c4-box-badge c4-badge-actor"><i data-lucide="user-check"></i> Fulfillment Specialist</span>
              <div class="c4-box-title">Dock & Picking Station Operator</div>
              <div class="c4-box-desc">Executes wave picking lists, scans EAN-13 barcodes at pack stations, and receives inbound Goods Receipt Notes (GRN).</div>
              <div class="c4-flow-indicator">
                <span>Operates Handheld Terminals</span>
                <i data-lucide="arrow-right"></i>
              </div>
            </div>

            <div class="c4-card c4-card-actor">
              <span class="c4-box-badge c4-badge-actor"><i data-lucide="briefcase"></i> Procurement Officer</span>
              <div class="c4-box-title">Vendor & Supply Chain Manager</div>
              <div class="c4-box-desc">Analyzes supplier lead times, tracks SLA compliance, and drafts purchase orders when stock approaches dynamic ROP thresholds.</div>
              <div class="c4-flow-indicator">
                <span>Issues POs via Web Portal</span>
                <i data-lucide="arrow-right"></i>
              </div>
            </div>
          </div>

          <!-- Center Column: Core System Under Study Inside System Boundary -->
          <div class="c4-system-boundary">
            <span class="c4-boundary-label">System Boundary &bull; Enterprise VPC Trust Zone</span>

            <div class="c4-card-system">
              <span class="c4-box-badge c4-badge-core"><i data-lucide="shield-check"></i> Core System Under Study</span>
              <h3 class="c4-box-title" style="font-size: 1.25rem; margin-top: 6px;">Retail Inventory Management System (RIMS)</h3>
              <p class="c4-box-desc" style="margin-top: 10px; font-size: 0.85rem;">
                Unified enterprise supply chain SaaS platform orchestrating Product Catalog (PIM), Multi-Warehouse Bin Topologies,
                Real-Time Available to Promise (ATP) Stock Balances, Heuristic Order Allocation, and Procure-to-Pay Workflows.
              </p>
              <div class="flex-center gap-xs flex-wrap" style="margin-top: 14px; justify-content: center;">
                <span class="badge badge-subtle font-mono text-xs">HTTPS / WSS</span>
                <span class="badge badge-subtle font-mono text-xs">OpenAPI v3 REST</span>
                <span class="badge badge-subtle font-mono text-xs">PostgreSQL 18.6 ACID</span>
                <span class="badge badge-accent font-mono text-xs">OCC Concurrency</span>
              </div>
            </div>
          </div>

          <!-- Right Column: External Systems -->
          <div class="c4-col">
            <div class="c4-card c4-card-ext">
              <span class="c4-box-badge c4-badge-ext"><i data-lucide="shopping-cart"></i> External eCommerce Stores</span>
              <div class="c4-box-title">Shopify, Magento & Web Apps</div>
              <div class="c4-box-desc">Omnichannel online store checkouts placing customer sales orders and querying real-time Available to Promise (ATP) inventory levels.</div>
              <div class="c4-flow-indicator">
                <i data-lucide="arrow-left"></i>
                <span>REST Order Webhooks / JSON</span>
              </div>
            </div>

            <div class="c4-card c4-card-ext">
              <span class="c4-box-badge c4-badge-ext"><i data-lucide="monitor"></i> Point of Sale (POS) Registers</span>
              <div class="c4-box-title">Physical Storefront Checkout POS</div>
              <div class="c4-box-desc">High-throughput retail counters executing instant barcode depletions and handling store returns with sub-50ms latency.</div>
              <div class="c4-flow-indicator">
                <i data-lucide="arrow-left"></i>
                <span>HTTPS Barcode Sync</span>
              </div>
            </div>

            <div class="c4-card c4-card-ext">
              <span class="c4-box-badge c4-badge-ext"><i data-lucide="truck"></i> 3PL Logistics & Freight Carriers</span>
              <div class="c4-box-title">FedEx, UPS, DHL Logistics</div>
              <div class="c4-box-desc">Automated rate quoting, shipping label generation, dispatch tracking telemetry, and freight manifest EDI exchange.</div>
              <div class="c4-flow-indicator">
                <i data-lucide="arrow-left"></i>
                <span>Carrier Dispatch APIs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (activeC4Level === "container") {
    return `
      <div class="c4-diagram-canvas animate-fade-in">
        <div class="c4-title-tag">
          <div class="flex-center gap-xs">
            <i data-lucide="box"></i>
            <span>C4 Level 2: Container Runtime Architecture (Deployable Units)</span>
          </div>
          <span class="badge badge-success font-mono text-xs">Multi-Container Topology</span>
        </div>

        <div class="c4-containers-row">
          <!-- Container 1: Client SPA -->
          <div class="c4-container-card">
            <div>
              <span class="c4-box-badge c4-badge-core">Web Client SPA</span>
              <div class="c4-box-title">Operations Dashboard</div>
              <div class="c4-box-desc">Modular ES6+, Vanilla CSS design system, Lucide icons, Chart.js telemetry, Command Palette spotlight.</div>
              <span class="c4-container-port">Port :5174 (Dev) / :4173 (Prod)</span>
            </div>
            <div class="c4-connector-bar">
              <span>HTTPS / WSS</span>
              <i data-lucide="arrow-right"></i>
            </div>
          </div>

          <!-- Container 2: Gateway -->
          <div class="c4-container-card">
            <div>
              <span class="c4-box-badge c4-badge-actor">Reverse Proxy & Gateway</span>
              <div class="c4-box-title">API Edge Gateway</div>
              <div class="c4-box-desc">SSL Termination, JWT Authentication, Rate Limiting, Request Validation, and CORS header management.</div>
              <span class="c4-container-port">Port :5000 (Proxy)</span>
            </div>
            <div class="c4-connector-bar">
              <span>REST / JSON</span>
              <i data-lucide="arrow-right"></i>
            </div>
          </div>

          <!-- Container 3: Application Core -->
          <div class="c4-container-card">
            <div>
              <span class="c4-box-badge c4-badge-core">Application Core</span>
              <div class="c4-box-title">RIMS Application Backend</div>
              <div class="c4-box-desc">Express / Node.js clean architecture service hosting Allocation Engine, ROP calculator, and valuation models.</div>
              <span class="c4-container-port">Node.js 20 LTS Runtime</span>
            </div>
            <div class="c4-connector-bar">
              <span>pg Pool (TCP)</span>
              <i data-lucide="arrow-right"></i>
            </div>
          </div>

          <!-- Container 4: Persistence Datastore -->
          <div class="c4-container-card">
            <div>
              <span class="c4-box-badge c4-badge-db">Relational Database</span>
              <div class="c4-box-title">PostgreSQL 18.6</div>
              <div class="c4-box-desc">ACID transaction ledger, foreign key constraints, Optimistic Concurrency Control (OCC) version locks, 3NF schema.</div>
              <span class="c4-container-port">Port :5432 &bull; retail_inventory_db</span>
            </div>
            <div class="text-xs text-muted" style="margin-top: 14px; font-family: var(--font-mono); text-align: center;">
              Connection Pooling: 20 Max Clients
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (activeC4Level === "component") {
    return `
      <div class="c4-diagram-canvas animate-fade-in">
        <div class="c4-title-tag">
          <div class="flex-center gap-xs">
            <i data-lucide="cpu"></i>
            <span>C4 Level 3: Component Diagram (Core Application Engines)</span>
          </div>
          <span class="badge badge-accent font-mono text-xs">Modular Clean Architecture</span>
        </div>

        <div class="c4-components-grid">
          <div class="c4-component-card">
            <div>
              <div class="flex-between">
                <div class="font-bold text-main">1. Catalog & PIM Service</div>
                <span class="badge badge-subtle">Domain Service</span>
              </div>
              <p class="c4-box-desc">Automated SKU generator, EAN-13 barcode validator, margin & retail price matrix, multi-attribute specs.</p>
            </div>
            <div class="c4-component-meta">Entities: Product, Variant, Category, Brand</div>
          </div>

          <div class="c4-component-card">
            <div>
              <div class="flex-between">
                <div class="font-bold text-main">2. Multi-Warehouse Stock Ledger</div>
                <span class="badge badge-success">Ledger Core</span>
              </div>
              <p class="c4-box-desc">Real-time SOH, RES, and ATP calculations, spatial bin coordinates (Zone-Aisle-Shelf-Bin), inter-warehouse transfers.</p>
            </div>
            <div class="c4-component-meta">Invariant: Available to Promise (ATP &ge; 0)</div>
          </div>

          <div class="c4-component-card">
            <div>
              <div class="flex-between">
                <div class="font-bold text-main">3. Order Allocation Router</div>
                <span class="badge badge-accent">Heuristic Engine</span>
              </div>
              <p class="c4-box-desc">Evaluates candidate distribution centers, minimizes Haversine transit distance, and penalizes split shipments.</p>
            </div>
            <div class="c4-component-meta">Pipeline: Allocation &rarr; Picking &rarr; Packing &rarr; Dispatch</div>
          </div>

          <div class="c4-component-card">
            <div>
              <div class="flex-between">
                <div class="font-bold text-main">4. Procure-to-Pay (SRM) Engine</div>
                <span class="badge badge-warning">Procurement</span>
              </div>
              <p class="c4-box-desc">Vendor lead times, dynamic Safety Stock & ROP triggers, PO generation, and Inbound Goods Receipt Note (GRN) receiving.</p>
            </div>
            <div class="c4-component-meta">Trigger: Auto-PO drafted when ATP &le; ROP</div>
          </div>
        </div>
      </div>
    `;
  }

  // Level 4: Events
  return `
    <div class="c4-diagram-canvas animate-fade-in">
      <div class="c4-title-tag">
        <div class="flex-center gap-xs">
          <i data-lucide="git-commit"></i>
          <span>C4 Level 4: Event-Driven Flow & Domain Event Stream</span>
        </div>
        <span class="badge badge-info font-mono text-xs">Event Bus / In-Memory PubSub</span>
      </div>

      <div class="c4-event-stream">
        <div class="c4-event-item">
          <span class="c4-event-badge badge-accent">OrderPlaced</span>
          <div class="c4-event-desc">
            <div class="flex-between">
              <strong>Topic: rims.orders.v1</strong>
              <span class="badge badge-subtle font-mono text-xs">At-least-once</span>
            </div>
            <div style="margin-top: 4px;">
              <strong>Payload:</strong> <code>{ orderId: "ORD-9421", items: [{ sku: "PROD-1001", qty: 5 }], customerLocation: { lat: 40.71, lon: -74.00 } }</code><br>
              <em>Producer:</em> eCommerce Storefront / POS Checkout. <em>Consumer:</em> Heuristic Allocation Router atomically reserves stock.
            </div>
          </div>
        </div>

        <div class="c4-event-item">
          <span class="c4-event-badge badge-success">StockAllocated</span>
          <div class="c4-event-desc">
            <div class="flex-between">
              <strong>Topic: rims.fulfillment.v1</strong>
              <span class="badge badge-subtle font-mono text-xs">Idempotent</span>
            </div>
            <div style="margin-top: 4px;">
              <strong>Payload:</strong> <code>{ orderId: "ORD-9421", warehouseId: "WH-NJ", allocatedLines: 2, splitShipment: false }</code><br>
              <em>Producer:</em> Allocation Router. <em>Consumer:</em> WMS Pick List Generator & Multi-Warehouse Ledger.
            </div>
          </div>
        </div>

        <div class="c4-event-item">
          <span class="c4-event-badge badge-warning">LowStockThresholdCrossed</span>
          <div class="c4-event-desc">
            <div class="flex-between">
              <strong>Topic: rims.inventory.v1</strong>
              <span class="badge badge-subtle font-mono text-xs">High Priority</span>
            </div>
            <div style="margin-top: 4px;">
              <strong>Payload:</strong> <code>{ productId: "PROD-1001", warehouseId: "WH-CHI", currentAtp: 8, ropThreshold: 20, deficit: 12 }</code><br>
              <em>Producer:</em> Inventory Stock Ledger. <em>Consumer:</em> Procure-to-Pay Engine drafts replenishing Purchase Order.
            </div>
          </div>
        </div>

        <div class="c4-event-item">
          <span class="c4-event-badge badge-info">GoodsReceived (GRN)</span>
          <div class="c4-event-desc">
            <div class="flex-between">
              <strong>Topic: rims.procurement.v1</strong>
              <span class="badge badge-subtle font-mono text-xs">ACID Verified</span>
            </div>
            <div style="margin-top: 4px;">
              <strong>Payload:</strong> <code>{ poId: "PO-702", grnNumber: "GRN-2026-088", receivedLots: [{ batchId: "LOT-04", qty: 100, unitCost: 72.50 }] }</code><br>
              <em>Producer:</em> Inbound Receiving Dock. <em>Consumer:</em> FIFO Cost Layer Ingestion & Stock Balance Ledger.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// TAB 2: CORE ALGORITHM SANDBOXES
// ============================================================================
function renderAlgorithmsTab() {
  const warehouses = store.getWarehouses();
  const stock = store.getStock();

  const destCoords = getCoordsForCity(simDest);
  const allocationResult = simulateOrderAllocation(
    [
      { productId: "PROD-1001", quantity: parseInt(simQty1) || 1 },
      { productId: "PROD-1002", quantity: parseInt(simQty2) || 1 }
    ],
    destCoords,
    warehouses,
    stock
  );

  const ssCalculated = calculateSafetyStock(ropDemand, ropLeadTime, ropSigmaDemand, ropSigmaLead, ropServiceLevel);
  const ropCalculated = calculateROP(ropDemand, ropLeadTime, ssCalculated);
  const eoqCalculated = calculateEOQ(ropDemand * 365, 50, 45, 0.2);

  const fifoRes = ValuationEngine.computeFIFO(sampleCostLayers, valUnitsToDeplete);
  const avcoRes = ValuationEngine.computeAVCO(sampleCostLayers, valUnitsToDeplete);
  const deltaCogs = Math.abs(fifoRes.cogsTotal - avcoRes.cogsTotal);

  return `
    <div class="algorithms-grid animate-fade-in">
      <!-- ==================================================================
           SIMULATOR 1: MULTI-WAREHOUSE ORDER ALLOCATION
           ================================================================== -->
      <div class="algo-card" id="card-sim-allocation">
        <div class="algo-header">
          <div>
            <span class="badge badge-accent algo-badge">Algorithm 1 &bull; Heuristic Routing</span>
            <h3 class="algo-title">Multi-Warehouse Order Allocation & Split-Shipment Router</h3>
            <p class="algo-subtitle">Minimizes customer delivery transit distance using the Haversine spherical formula, penalizing split-shipments when a single node can satisfy the entire basket.</p>
          </div>
        </div>

        <div class="algo-formula-box">
          Objective Function: <strong>Cost = Distance(km) + (P_split &times; UnfulfilledLines)</strong> &bull; Split-Shipment Penalty <strong>P_split = 2,000</strong>
        </div>

        <!-- Preset Scenarios -->
        <div class="preset-chips-row">
          <span class="text-xs text-muted font-semibold">Test Presets:</span>
          <button type="button" class="btn-preset" data-preset-alloc="ny">🏙️ East Coast Demand (New York)</button>
          <button type="button" class="btn-preset" data-preset-alloc="la">🌴 West Coast Demand (Los Angeles)</button>
          <button type="button" class="btn-preset" data-preset-alloc="chicago">⚖️ Midwest Centroid (Chicago)</button>
        </div>

        <!-- Simulator 1 Controls -->
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; margin-bottom: 20px;">
          <div>
            <label class="text-xs text-muted font-semibold" style="display: block; margin-bottom: 6px;">Customer Delivery Destination:</label>
            <select id="sim-dest-select" style="width: 100%;">
              <option value="New York, NY" ${simDest === "New York, NY" ? "selected" : ""}>New York, NY (East Coast)</option>
              <option value="Chicago, IL" ${simDest === "Chicago, IL" ? "selected" : ""}>Chicago, IL (Midwest)</option>
              <option value="Los Angeles, CA" ${simDest === "Los Angeles, CA" ? "selected" : ""}>Los Angeles, CA (West Coast)</option>
              <option value="Dallas, TX" ${simDest === "Dallas, TX" ? "selected" : ""}>Dallas, TX (South Central)</option>
              <option value="Miami, FL" ${simDest === "Miami, FL" ? "selected" : ""}>Miami, FL (Southeast)</option>
            </select>
          </div>

          <div>
            <label class="text-xs text-muted font-semibold" style="display: block; margin-bottom: 6px;">PROD-1001 (Headphones) Qty:</label>
            <input type="number" id="sim-qty-1" min="1" max="150" value="${simQty1}" style="width: 100%; padding: 7px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); background: var(--bg-app); color: var(--text-main);" />
          </div>

          <div>
            <label class="text-xs text-muted font-semibold" style="display: block; margin-bottom: 6px;">PROD-1002 (Keyboard) Qty:</label>
            <input type="number" id="sim-qty-2" min="1" max="150" value="${simQty2}" style="width: 100%; padding: 7px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); background: var(--bg-app); color: var(--text-main);" />
          </div>
        </div>

        <!-- Simulation Result Decision Card -->
        <div id="alloc-decision-container" style="background: var(--bg-surface-subtle); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px; margin-bottom: 20px;">
          ${renderAllocationDecisionHtml(allocationResult)}
        </div>

        <!-- Candidate Warehouses Comparison Table -->
        <div class="table-container">
          <table class="data-table" id="alloc-candidates-table">
            <thead>
              <tr>
                <th>Candidate Warehouse</th>
                <th>Distance to Destination</th>
                <th>Line Coverage</th>
                <th>Stock Feasibility</th>
                <th class="text-right">Calculated Score</th>
              </tr>
            </thead>
            <tbody>
              ${renderCandidatesTableBody(allocationResult.allCandidates)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- ==================================================================
           SIMULATOR 2: DYNAMIC REORDER POINT (ROP) & SAFETY STOCK
           ================================================================== -->
      <div class="algo-card" id="card-sim-rop">
        <div class="algo-header">
          <div>
            <span class="badge badge-success algo-badge">Algorithm 2 &bull; Stochastic Inventory Policy</span>
            <h3 class="algo-title">Dynamic Reorder Point (ROP) & Safety Stock Visualizer</h3>
            <p class="algo-subtitle">Stochastic safety stock buffer calculation factoring both customer demand volatility and supplier delivery lead-time jitter.</p>
          </div>
        </div>

        <div class="algo-formula-box">
          Formula: <strong>ROP = (d &times; L) + Z &times; &radic;(L &times; &sigma;_d&sup2; + d&sup2; &times; &sigma;_L&sup2;)</strong> &bull; <strong>EOQ = &radic;((2 &times; D &times; S) / H)</strong>
        </div>

        <!-- Preset Scenarios -->
        <div class="preset-chips-row">
          <span class="text-xs text-muted font-semibold">Policy Presets:</span>
          <button type="button" class="btn-preset" data-preset-rop="holiday">⚡ Holiday Demand Spike (High Variance)</button>
          <button type="button" class="btn-preset" data-preset-rop="port">🚢 Port Congestion (Long Lead Time)</button>
          <button type="button" class="btn-preset" data-preset-rop="stable">📦 Stable Everyday FMCG (Low Jitter)</button>
        </div>

        <!-- Dynamic Stock Level Threshold Visualizer Bar -->
        <div class="rop-threshold-visualizer">
          <div class="flex-between text-xs">
            <span class="font-semibold text-main">Stock Level Threshold Visualizer:</span>
            <span class="font-mono text-muted">Total ROP Threshold = <strong id="disp-rop-total" class="text-primary">${ropCalculated} units</strong></span>
          </div>

          <div class="rop-meter-track">
            <div id="meter-cycle-bar" class="rop-bar-cycle" style="width: ${Math.round(((ropDemand * ropLeadTime) / (ropCalculated || 1)) * 100)}%;">
              Cycle Demand (${ropDemand * ropLeadTime}u)
            </div>
            <div id="meter-safety-bar" class="rop-bar-safety" style="width: ${Math.max(10, Math.round((ssCalculated / (ropCalculated || 1)) * 100))}%;">
              Safety Buffer (${ssCalculated}u)
            </div>
          </div>

          <div class="flex-between text-xs text-muted">
            <span>&bull; Lead Time Cycle Demand ($d \times L$): Expected sales during reorder turnaround</span>
            <span>&bull; Safety Stock ($SS$): Buffer against unpredictable order surges and dock delays</span>
          </div>
        </div>

        <!-- Sliders Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 18px; margin-bottom: 22px;">
          <div>
            <div class="flex-between" style="margin-bottom: 6px;">
              <label class="text-xs text-muted font-semibold">Daily Demand ($d$):</label>
              <span class="font-mono text-xs font-bold text-accent" id="lbl-demand">${ropDemand} units/day</span>
            </div>
            <input type="range" id="slider-demand" min="1" max="100" value="${ropDemand}" class="form-range" style="width: 100%; accent-color: var(--color-primary);" />
          </div>

          <div>
            <div class="flex-between" style="margin-bottom: 6px;">
              <label class="text-xs text-muted font-semibold">Lead Time ($L$):</label>
              <span class="font-mono text-xs font-bold text-accent" id="lbl-leadtime">${ropLeadTime} days</span>
            </div>
            <input type="range" id="slider-leadtime" min="1" max="60" value="${ropLeadTime}" class="form-range" style="width: 100%; accent-color: var(--color-primary);" />
          </div>

          <div>
            <div class="flex-between" style="margin-bottom: 6px;">
              <label class="text-xs text-muted font-semibold">Demand Variance (&sigma;_d):</label>
              <span class="font-mono text-xs font-bold text-accent" id="lbl-sigmad">${ropSigmaDemand}</span>
            </div>
            <input type="range" id="slider-sigmad" min="0" max="20" value="${ropSigmaDemand}" class="form-range" style="width: 100%; accent-color: var(--color-primary);" />
          </div>

          <div>
            <div class="flex-between" style="margin-bottom: 6px;">
              <label class="text-xs text-muted font-semibold">Service Level SLA ($Z$):</label>
              <span class="font-mono text-xs font-bold text-accent" id="lbl-sla">${ropServiceLevel}</span>
            </div>
            <select id="select-service-level" style="width: 100%; padding: 7px 10px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); background: var(--bg-app); color: var(--text-main);">
              <option value="90%" ${ropServiceLevel === "90%" ? "selected" : ""}>90% SLA (Z = 1.282)</option>
              <option value="95%" ${ropServiceLevel === "95%" ? "selected" : ""}>95% SLA (Z = 1.645 - Standard)</option>
              <option value="98%" ${ropServiceLevel === "98%" ? "selected" : ""}>98% SLA (Z = 2.054)</option>
              <option value="99%" ${ropServiceLevel === "99%" ? "selected" : ""}>99% SLA (Z = 2.326 - High Mission Critical)</option>
            </select>
          </div>
        </div>

        <!-- 4 KPI Stat Cards -->
        <div class="rop-results-grid">
          <div class="rop-stat-card">
            <span class="rop-stat-label">Cycle Demand</span>
            <div class="rop-stat-value text-accent" id="stat-cycle-demand">${ropDemand * ropLeadTime}</div>
            <span class="rop-stat-desc">d &times; L base units</span>
          </div>

          <div class="rop-stat-card">
            <span class="rop-stat-label">Safety Stock (SS)</span>
            <div class="rop-stat-value text-warning" id="stat-safety-stock">${ssCalculated}</div>
            <span class="rop-stat-desc">Variance buffer units</span>
          </div>

          <div class="rop-stat-card highlight">
            <span class="rop-stat-label" style="color: var(--color-primary);">Reorder Point (ROP)</span>
            <div class="rop-stat-value text-success" id="stat-rop">${ropCalculated}</div>
            <span class="rop-stat-desc" id="stat-rop-desc">Auto-PO drafted at &le; ${ropCalculated}u</span>
          </div>

          <div class="rop-stat-card">
            <span class="rop-stat-label">Economic Order Qty</span>
            <div class="rop-stat-value text-accent" id="stat-eoq">${eoqCalculated}</div>
            <span class="rop-stat-desc">Optimal order batch size</span>
          </div>
        </div>
      </div>

      <!-- ==================================================================
           SIMULATOR 3: DUAL INVENTORY VALUATION (FIFO VS AVCO)
           ================================================================== -->
      <div class="algo-card" id="card-sim-valuation">
        <div class="algo-header">
          <div>
            <span class="badge badge-info algo-badge">Algorithm 3 &bull; Financial Cost Accounting</span>
            <h3 class="algo-title">Inventory Valuation Engine: Dual FIFO vs Weighted Average (AVCO)</h3>
            <p class="algo-subtitle">Chronological cost layer depletion demonstrating GAAP (FIFO) and IFRS (AVCO) balance sheet valuation compliance.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span class="text-xs text-muted font-semibold">Units to Deplete:</span>
            <input type="number" id="input-val-units" min="0" max="120" value="${valUnitsToDeplete}" style="width: 84px; padding: 6px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); background: var(--bg-app); color: var(--text-main); font-family: var(--font-mono); font-weight: 700;" />
          </div>
        </div>

        <!-- Presets for Valuation -->
        <div class="preset-chips-row">
          <span class="text-xs text-muted font-semibold">Depletion Presets:</span>
          <button type="button" class="btn-preset" data-preset-val="25">Deplete 25u (Lot 1 Only)</button>
          <button type="button" class="btn-preset" data-preset-val="65">Deplete 65u (Lot 1 & 2)</button>
          <button type="button" class="btn-preset" data-preset-val="105">Deplete 105u (All 3 Lots)</button>
        </div>

        <div class="valuation-split-grid">
          <!-- Model A: FIFO -->
          <div class="val-model-card" id="val-fifo-container">
            ${renderFifoCardHtml(fifoRes)}
          </div>

          <!-- Model B: AVCO -->
          <div class="val-model-card" id="val-avco-container">
            ${renderAvcoCardHtml(avcoRes)}
          </div>
        </div>

        <!-- Accounting Variance Callout Banner -->
        <div class="val-delta-banner" id="val-delta-container">
          ${renderValuationDeltaHtml(deltaCogs)}
        </div>
      </div>
    </div>
  `;
}

// Helpers for Simulator 1 HTML
function renderAllocationDecisionHtml(result) {
  const winner = result.allocatedWarehouse;
  return `
    <div class="flex-between" style="margin-bottom: 10px;">
      <span class="text-xs font-mono font-bold text-accent uppercase">Heuristic Allocation Decision:</span>
      <span class="badge ${winner.canFulfillAll ? "badge-success" : "badge-warning"}">
        ${winner.canFulfillAll ? "Optimal Single-Node Allocation" : "Split-Shipment Penalty Applied"}
      </span>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px 18px;">
      <div>
        <span class="text-xs text-muted font-mono uppercase">Selected Fulfillment Center:</span>
        <div class="font-bold text-lg text-main" style="margin: 2px 0;">
          ${winner.warehouseName} (${winner.warehouseCode})
        </div>
        <div class="text-xs text-muted">
          Haversine Distance: <strong class="text-main">${winner.distanceKm} km</strong> &bull; Penalty Score: <strong class="text-accent">${winner.score}</strong>
        </div>
      </div>
      <div class="text-right">
        <span class="badge badge-accent font-mono" style="font-size: 0.78rem;">
          Fulfills ${winner.fulfilledItemsCount}/${winner.totalItems} Order Lines
        </span>
      </div>
    </div>
  `;
}

function renderCandidatesTableBody(candidates) {
  return candidates
    .map(
      (cand, idx) => `
      <tr class="${idx === 0 ? "highlight-row" : ""}">
        <td>
          <strong>${cand.warehouseCode}</strong> &bull; ${cand.warehouseName}
        </td>
        <td class="font-mono">${cand.distanceKm} km</td>
        <td>${cand.fulfilledItemsCount}/${cand.totalItems} SKUs</td>
        <td>
          <span class="badge ${cand.canFulfillAll ? "badge-success" : "badge-warning"}">
            ${cand.canFulfillAll ? "100% In Stock" : "Partial Stock"}
          </span>
        </td>
        <td class="text-right font-mono ${idx === 0 ? "font-bold text-accent" : ""}">
          ${cand.score} ${idx === 0 ? "★ WINNER" : ""}
        </td>
      </tr>
    `
    )
    .join("");
}

// Helpers for Simulator 3 HTML
function renderFifoCardHtml(fifoRes) {
  return `
    <div class="flex-between" style="margin-bottom: 12px;">
      <span class="font-bold text-main">Model A: First-In, First-Out (FIFO)</span>
      <span class="badge badge-accent font-mono">GAAP Standard</span>
    </div>

    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div class="flex-between text-xs" style="padding-bottom: 6px; border-bottom: 1px solid var(--border-subtle);">
        <span class="text-muted">Cost of Goods Sold (COGS):</span>
        <span class="font-mono font-bold text-success" style="font-size: 0.95rem;">$${fifoRes.cogsTotal.toFixed(2)}</span>
      </div>
      <div class="flex-between text-xs" style="padding-bottom: 6px; border-bottom: 1px solid var(--border-subtle);">
        <span class="text-muted">Effective Avg Unit Cost:</span>
        <span class="font-mono font-bold text-main">$${fifoRes.averageUnitCogs.toFixed(2)} / unit</span>
      </div>
      <div class="flex-between text-xs" style="padding-bottom: 6px; border-bottom: 1px solid var(--border-subtle);">
        <span class="text-muted">Ending Inventory Balance:</span>
        <span class="font-mono font-bold text-accent" style="font-size: 0.95rem;">$${fifoRes.remainingStockValue.toFixed(2)}</span>
      </div>
      <div class="flex-between text-xs">
        <span class="text-muted">Remaining Balance Units:</span>
        <span class="font-mono font-bold text-main">${fifoRes.remainingUnits} units</span>
      </div>
    </div>

    <!-- Ingested Lots Progress Breakdown -->
    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border-subtle);">
      <span class="text-xs font-mono font-bold text-muted uppercase">FIFO Lot Consumption:</span>
      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
        ${sampleCostLayers
          .map((lot) => {
            const consumed = fifoRes.consumedLayers.find((c) => c.batchId === lot.batchId);
            const consumedQty = consumed ? consumed.consumedQty : 0;
            const pct = Math.round((consumedQty / lot.quantity) * 100);
            return `
              <div>
                <div class="flex-between text-xs font-mono" style="margin-bottom: 2px;">
                  <span>${lot.batchId} (${lot.quantity}u @ $${lot.unitCost.toFixed(2)})</span>
                  <span>${consumedQty}u used (${pct}%)</span>
                </div>
                <div style="height: 6px; background: var(--bg-app); border-radius: var(--radius-full); overflow: hidden;">
                  <div style="height: 100%; width: ${pct}%; background: ${pct === 100 ? "var(--color-danger)" : pct > 0 ? "var(--color-warning)" : "var(--color-success)"};"></div>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderAvcoCardHtml(avcoRes) {
  return `
    <div class="flex-between" style="margin-bottom: 12px;">
      <span class="font-bold text-main">Model B: Moving Average (AVCO)</span>
      <span class="badge badge-info font-mono">IFRS Standard</span>
    </div>

    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div class="flex-between text-xs" style="padding-bottom: 6px; border-bottom: 1px solid var(--border-subtle);">
        <span class="text-muted">Cost of Goods Sold (COGS):</span>
        <span class="font-mono font-bold text-success" style="font-size: 0.95rem;">$${avcoRes.cogsTotal.toFixed(2)}</span>
      </div>
      <div class="flex-between text-xs" style="padding-bottom: 6px; border-bottom: 1px solid var(--border-subtle);">
        <span class="text-muted">Blended Unit Cost:</span>
        <span class="font-mono font-bold text-main">$${avcoRes.weightedAvgUnitCost.toFixed(2)} / unit</span>
      </div>
      <div class="flex-between text-xs" style="padding-bottom: 6px; border-bottom: 1px solid var(--border-subtle);">
        <span class="text-muted">Ending Inventory Balance:</span>
        <span class="font-mono font-bold text-info" style="font-size: 0.95rem;">$${avcoRes.remainingStockValue.toFixed(2)}</span>
      </div>
      <div class="flex-between text-xs">
        <span class="text-muted">Remaining Balance Units:</span>
        <span class="font-mono font-bold text-main">${avcoRes.remainingUnits} units</span>
      </div>
    </div>

    <!-- Blended Pool Formula Card -->
    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border-subtle);">
      <span class="text-xs font-mono font-bold text-muted uppercase">Blended Pool Formula:</span>
      <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px 12px; font-family: var(--font-mono); font-size: 0.75rem; margin-top: 8px; color: var(--text-main);">
        C_avg = &Sigma;(Q_i &times; C_i) / &Sigma;Q_i = $9,100 / 120 = $75.83
      </div>
    </div>
  `;
}

function renderValuationDeltaHtml(deltaCogs) {
  return `
    <div>
      <div class="font-semibold text-main text-sm">Financial Accounting Variance:</div>
      <div class="text-xs text-muted">FIFO vs AVCO variance in Cost of Goods Sold directly impacts reported gross margin and balance sheet valuation.</div>
    </div>
    <div class="font-mono font-bold text-main text-sm">
      COGS Delta: <span class="text-accent" id="disp-delta-cogs">$${deltaCogs.toFixed(2)}</span>
    </div>
  `;
}

function getCoordsForCity(city) {
  if (city === "New York, NY") return { lat: 40.7128, lon: -74.006 };
  if (city === "Chicago, IL") return { lat: 41.8781, lon: -87.6298 };
  if (city === "Los Angeles, CA") return { lat: 34.0522, lon: -118.2437 };
  if (city === "Dallas, TX") return { lat: 32.7767, lon: -96.797 };
  return { lat: 25.7617, lon: -80.1918 };
}

// ============================================================================
// TAB 3: RELATIONAL DATABASE ERD
// ============================================================================
function renderErdTab() {
  const filteredTables = getFilteredErdTables();

  return `
    <div class="content-card animate-fade-in">
      <div class="card-header flex-between flex-wrap gap-sm" style="margin-bottom: 20px;">
        <div>
          <h2 class="card-title">Relational Database Schema & Data Dictionary</h2>
          <p class="card-subtitle text-xs text-muted">Fully normalized 3NF relational data model supporting ACID transactions, OCC versioning, and foreign key integrity.</p>
        </div>
        <div class="flex-center gap-xs">
          <span class="badge badge-accent">PostgreSQL 18.6</span>
          <span class="badge badge-subtle">${erdTables.length} Production Tables</span>
        </div>
      </div>

      <!-- ERD Toolbar: Category Chips & Search Input -->
      <div class="erd-toolbar">
        <div class="filter-chips-row" id="erd-category-chips">
          <button class="filter-chip ${activeErdCategory === "all" ? "active" : ""}" data-erd-cat="all">All (${erdTables.length})</button>
          <button class="filter-chip ${activeErdCategory === "catalog" ? "active" : ""}" data-erd-cat="catalog">📦 Catalog</button>
          <button class="filter-chip ${activeErdCategory === "ledger" ? "active" : ""}" data-erd-cat="ledger">📊 Ledger</button>
          <button class="filter-chip ${activeErdCategory === "topology" ? "active" : ""}" data-erd-cat="topology">🏢 Topology</button>
          <button class="filter-chip ${activeErdCategory === "fulfillment" ? "active" : ""}" data-erd-cat="fulfillment">🛒 Fulfillment</button>
          <button class="filter-chip ${activeErdCategory === "procurement" ? "active" : ""}" data-erd-cat="procurement">🤝 Procurement</button>
        </div>

        <div class="erd-search-wrapper">
          <i data-lucide="search" class="erd-search-icon"></i>
          <input type="text" id="erd-search-input" placeholder="Search tables or columns..." value="${erdSearchQuery}" autocomplete="off" />
          ${erdSearchQuery ? `<button id="erd-search-clear" class="erd-clear-btn" title="Clear search"><i data-lucide="x"></i></button>` : ""}
        </div>
      </div>

      <!-- ERD Cards Grid -->
      <div class="erd-table-grid" id="erd-cards-grid">
        ${renderErdCardsHtml(filteredTables)}
      </div>
    </div>
  `;
}

function getFilteredErdTables() {
  return erdTables.filter((t) => {
    const matchesCategory = activeErdCategory === "all" || t.category === activeErdCategory;
    if (!matchesCategory) return false;

    if (!erdSearchQuery.trim()) return true;
    const q = erdSearchQuery.toLowerCase();
    const matchesName = t.name.toLowerCase().includes(q);
    const matchesDesc = t.desc.toLowerCase().includes(q);
    const matchesBadge = t.badge.toLowerCase().includes(q);
    const matchesCols = t.columns.some((c) => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q));

    return matchesName || matchesDesc || matchesBadge || matchesCols;
  });
}

function renderErdCardsHtml(tables) {
  if (tables.length === 0) {
    return `
      <div style="grid-column: 1 / -1; padding: 48px; text-align: center; background: var(--bg-surface-subtle); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
        <i data-lucide="search-x" style="width: 36px; height: 36px; color: var(--text-dim); margin-bottom: 12px;"></i>
        <h4 style="font-weight: 700; color: var(--text-main);">No matching tables or columns found</h4>
        <p class="text-xs text-muted" style="margin-top: 4px;">Try searching for another keyword like "sku", "version", or "quantity".</p>
      </div>
    `;
  }

  return tables
    .map(
      (t) => `
    <div class="erd-card" data-table-name="${t.name}">
      <div>
        <div class="erd-card-header">
          <div>
            <span class="font-mono font-bold text-accent" style="font-size: 0.95rem;">${t.name}</span>
            <div class="text-xs text-muted" style="margin-top: 3px;">${t.desc}</div>
          </div>
          <div class="flex-center gap-xs">
            <span class="badge badge-subtle text-xs">${t.badge}</span>
            <button type="button" class="btn-copy-card" data-copy-ddl="${t.name}" title="Copy SQL DDL for table ${t.name}">
              <i data-lucide="copy"></i>
              <span>SQL</span>
            </button>
          </div>
        </div>

        <div class="table-responsive" style="margin-top: 12px;">
          <table class="data-table text-xs">
            <thead>
              <tr>
                <th>Column</th>
                <th>Type</th>
                <th>Constraints / Relations</th>
              </tr>
            </thead>
            <tbody>
              ${t.columns
                .map(
                  (c) => `
                <tr>
                  <td class="font-mono font-semibold text-main">${c.name}</td>
                  <td class="font-mono text-muted">${c.type}</td>
                  <td>
                    <div class="flex-center gap-xs">
                      ${c.key ? `<span class="badge ${c.key === "PK" ? "badge-primary" : c.key === "FK" ? "badge-accent" : c.key === "OCC" ? "badge-warning" : "badge-subtle"} font-mono text-xs">${c.key}</span>` : ""}
                      <span class="text-xs text-muted font-mono">${c.target ? `&rarr; ${c.target}` : c.constraint || ""}</span>
                    </div>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

// ============================================================================
// TAB 4: DOMAIN-DRIVEN DESIGN (DDD)
// ============================================================================
function renderDddTab() {
  return `
    <div class="content-card animate-fade-in">
      <div class="card-header" style="margin-bottom: 20px;">
        <h2 class="card-title">Domain-Driven Design (DDD) & Strategic Context Mapping</h2>
        <p class="card-subtitle text-xs text-muted">Partitioning enterprise retail commerce into 4 cohesive bounded contexts with ubiquitous languages, integration topologies, and explicit aggregate roots.</p>
      </div>

      <!-- Strategic Context Map Visualizer -->
      <div class="ddd-context-map-canvas">
        <div class="ddd-context-map-title">
          <i data-lucide="git-branch"></i>
          <span>Strategic Context Map Topology (Upstream / Downstream & Integration Patterns)</span>
        </div>

        <div class="ddd-topology-flow">
          <div class="ddd-topo-node">
            <span class="badge badge-accent">Upstream (U)</span>
            <div class="font-bold text-main" style="margin: 6px 0 2px 0;">Catalog (PIM)</div>
            <div class="text-xs text-muted">Product Master Definition</div>
            <span class="ddd-topo-rel">Shared Kernel [SK] &bull; SKU / Barcode</span>
          </div>

          <div class="ddd-topo-node">
            <span class="badge badge-success">Core Domain</span>
            <div class="font-bold text-main" style="margin: 6px 0 2px 0;">Inventory Ledger</div>
            <div class="text-xs text-muted">Multi-Warehouse Bins & ATP</div>
            <span class="ddd-topo-rel">Open Host Service [OHS] &bull; REST/WSS</span>
          </div>

          <div class="ddd-topo-node">
            <span class="badge badge-warning">Downstream (D)</span>
            <div class="font-bold text-main" style="margin: 6px 0 2px 0;">Order Fulfillment</div>
            <div class="text-xs text-muted">Omnichannel Sales & Pick/Pack</div>
            <span class="ddd-topo-rel">Customer-Supplier [C-S] &bull; Reservation</span>
          </div>

          <div class="ddd-topo-node">
            <span class="badge badge-info">Supporting Domain</span>
            <div class="font-bold text-main" style="margin: 6px 0 2px 0;">Procurement (SRM)</div>
            <div class="text-xs text-muted">Purchase Orders & GRN</div>
            <span class="ddd-topo-rel">Anti-Corruption Layer [ACL] &bull; Vendor</span>
          </div>
        </div>
      </div>

      <!-- 4 Bounded Context Cards -->
      <div class="ddd-grid">
        <!-- Context 1: PIM -->
        <div class="ddd-context-card">
          <div class="flex-between">
            <span class="badge badge-accent">Context 1 &bull; Core Catalog</span>
            <span class="badge badge-subtle">Upstream</span>
          </div>
          <h3 class="font-bold text-base text-main">Product Information Management (PIM)</h3>
          <p class="text-xs text-muted">Maintains the single source of truth for items sold across all omnichannel sales channels.</p>

          <div>
            <div class="ddd-section-title">Aggregate Root:</div>
            <div class="font-mono text-xs font-bold text-accent">Product Master Record</div>

            <div class="ddd-section-title">Entities & Value Objects:</div>
            <div class="text-xs text-muted font-mono">ProductVariant, Category, Brand &bull; SKU, Barcode (EAN-13), Money (Cost, Price), Dimensions</div>

            <div class="ddd-section-title">Domain Events Emitted:</div>
            <div class="text-xs text-main font-mono">&bull; ProductCreated, ProductPriceAdjusted, ProductDeactivated</div>
          </div>
        </div>

        <!-- Context 2: Inventory -->
        <div class="ddd-context-card">
          <div class="flex-between">
            <span class="badge badge-success">Context 2 &bull; WMS Ledger</span>
            <span class="badge badge-subtle">Core Domain</span>
          </div>
          <h3 class="font-bold text-base text-main">Multi-Warehouse Inventory Ledger</h3>
          <p class="text-xs text-muted">Tracks physical unit locations, spatial bins, lot numbers, and atomic Available to Promise (ATP) balances.</p>

          <div>
            <div class="ddd-section-title">Aggregate Root:</div>
            <div class="font-mono text-xs font-bold text-success">Warehouse, StockLedgerRecord</div>

            <div class="ddd-section-title">Entities & Value Objects:</div>
            <div class="text-xs text-muted font-mono">WarehouseZone, WarehouseBin, StockBatch &bull; BinCoordinate, LotNumber, ATP</div>

            <div class="ddd-section-title">Domain Events Emitted:</div>
            <div class="text-xs text-main font-mono">&bull; StockReserved, StockDeducted, StockTransferred, VarianceReconciled</div>
          </div>
        </div>

        <!-- Context 3: Fulfillment -->
        <div class="ddd-context-card">
          <div class="flex-between">
            <span class="badge badge-warning">Context 3 &bull; Order Fulfillment</span>
            <span class="badge badge-subtle">Downstream</span>
          </div>
          <h3 class="font-bold text-base text-main">Omnichannel Order Fulfillment</h3>
          <p class="text-xs text-muted">Orchestrates multi-channel orders, allocation algorithms, and warehouse pick-pack-ship workflows.</p>

          <div>
            <div class="ddd-section-title">Aggregate Root:</div>
            <div class="font-mono text-xs font-bold text-warning">SalesOrder</div>

            <div class="ddd-section-title">Entities & Value Objects:</div>
            <div class="text-xs text-muted font-mono">OrderLineItem, PickList, PackingManifest &bull; ShippingAddress, TrackingNumber, FulfillmentSLA</div>

            <div class="ddd-section-title">Domain Events Emitted:</div>
            <div class="text-xs text-main font-mono">&bull; OrderPlaced, OrderAllocated, OrderDispatched, OrderDelivered</div>
          </div>
        </div>

        <!-- Context 4: Procurement -->
        <div class="ddd-context-card">
          <div class="flex-between">
            <span class="badge badge-info">Context 4 &bull; Procurement (SRM)</span>
            <span class="badge badge-subtle">Supporting Domain</span>
          </div>
          <h3 class="font-bold text-base text-main">Supplier & Procure-to-Pay (SRM)</h3>
          <p class="text-xs text-muted">Automates vendor replenishment, purchase requisitions, and Goods Receipt Notes (GRN).</p>

          <div>
            <div class="ddd-section-title">Aggregate Root:</div>
            <div class="font-mono text-xs font-bold text-info">Supplier, PurchaseOrder</div>

            <div class="ddd-section-title">Entities & Value Objects:</div>
            <div class="text-xs text-muted font-mono">POLineItem, GoodsReceiptNote (GRN), InspectionRecord &bull; LeadTimeDays, PaymentTerms, ReliabilityRating</div>

            <div class="ddd-section-title">Domain Events Emitted:</div>
            <div class="text-xs text-main font-mono">&bull; POIssued, GoodsReceived, SupplierRated</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// INTERACTIVE EVENT CONTROLLER WITH ZERO-FLICKER LOCAL DOM BINDINGS
// ============================================================================
export function initArchitectureEvents(container, refreshView) {
  // Bind Header Modals & Exports
  setupGlobalActions(container);

  // Bind Top-Level Tabs
  setupTopLevelTabs(container);

  // Bind Active Tab Events
  bindActiveTabEvents(container);
}

function setupGlobalActions(container) {
  // View SQL DDL Modal
  const viewSchemaModalBtn = container.querySelector("#btn-view-schema-modal");
  if (viewSchemaModalBtn) {
    viewSchemaModalBtn.addEventListener("click", () => {
      const fullSql = `-- PostgreSQL 18.6 Relational Schema for RIMS Platform
-- Normalized 3NF Schema with Foreign Keys, OCC Locks, and Check Constraints

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    cost_price NUMERIC(12, 2) NOT NULL CHECK (cost_price >= 0),
    reorder_level INT NOT NULL DEFAULT 10 CHECK (reorder_level >= 0),
    CONSTRAINT chk_margin CHECK (price >= cost_price)
);

CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL UNIQUE,
    location VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id INT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    version INT NOT NULL DEFAULT 1, -- Optimistic Concurrency Control (OCC)
    CONSTRAINT uq_product_wh UNIQUE (product_id, warehouse_id),
    CONSTRAINT chk_atp CHECK (quantity >= reserved_quantity)
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id INT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    movement_type VARCHAR(30) NOT NULL CHECK (movement_type IN ('PURCHASE', 'SALE', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT', 'RETURN')),
    quantity INT NOT NULL CHECK (quantity > 0),
    reference_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    lead_time_days INT NOT NULL DEFAULT 7 CHECK (lead_time_days >= 1),
    reliability_rating NUMERIC(3, 1) DEFAULT 4.5
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id INT NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    warehouse_id INT NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED')),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);`;

      modals.open(
        `
        <div class="modal-header">
          <h3>PostgreSQL 18 DDL Schema Definition</h3>
          <button type="button" class="btn-icon btn-modal-close"><i data-lucide="x"></i></button>
        </div>
        <div style="padding: 10px 0;">
          <p class="text-xs text-muted" style="margin-bottom: 12px;">Full relational table creation scripts with referential integrity, check constraints, and optimistic concurrency version locks.</p>
          <pre style="background: var(--bg-app); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px; font-family: var(--font-mono); font-size: 0.78rem; max-height: 400px; overflow-y: auto; color: var(--text-main); white-space: pre-wrap;">${fullSql}</pre>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-sql-modal">
            <i data-lucide="copy"></i>
            <span>Copy Full SQL DDL</span>
          </button>
          <button type="button" class="btn btn-primary btn-sm btn-modal-close">Close</button>
        </div>
        `,
        (dialog) => {
          const copyBtn = dialog.querySelector("#btn-copy-sql-modal");
          if (copyBtn) {
            copyBtn.addEventListener("click", () => {
              navigator.clipboard.writeText(fullSql);
              toast.success("PostgreSQL 18 DDL copied to clipboard!");
            });
          }
        }
      );
    });
  }

  // Export DDL File Action
  const exportBtn = container.querySelector("#btn-export-ddl");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      window.open("/database/schema.sql", "_blank") || toast.info("PostgreSQL Schema available in database/schema.sql");
    });
  }
}

function setupTopLevelTabs(container) {
  const topTabs = container.querySelectorAll("#arch-top-tabs button");
  topTabs.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const targetTab = e.currentTarget.dataset.archTab;
      if (activeArchTab === targetTab) return;

      activeArchTab = targetTab;
      topTabs.forEach((b) => {
        if (b.dataset.archTab === targetTab) {
          b.className = "btn btn-sm btn-primary";
        } else {
          b.className = "btn btn-sm btn-secondary";
        }
      });

      const contentMount = container.querySelector("#arch-tab-content");
      if (contentMount) {
        contentMount.innerHTML = renderActiveArchTabContent();
        window.lucide.createIcons();
        bindActiveTabEvents(container);
      }
    });
  });
}

function bindActiveTabEvents(container) {
  if (activeArchTab === "c4") {
    setupC4Events(container);
  } else if (activeArchTab === "algorithms") {
    setupAlgorithmEvents(container);
  } else if (activeArchTab === "erd") {
    setupErdEvents(container);
  }
}

// ----------------------------------------------------------------------------
// C4 DIAGRAM EVENTS
// ----------------------------------------------------------------------------
function setupC4Events(container) {
  const levelBtns = container.querySelectorAll("#c4-level-tabs button");
  levelBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const level = e.currentTarget.dataset.c4Level;
      if (activeC4Level === level) return;

      activeC4Level = level;
      levelBtns.forEach((b) => {
        if (b.dataset.c4Level === level) {
          b.className = "btn btn-xs btn-primary";
        } else {
          b.className = "btn btn-xs btn-secondary";
        }
      });

      const viewport = container.querySelector("#c4-diagram-viewport");
      if (viewport) {
        viewport.innerHTML = renderC4DiagramContent();
        window.lucide.createIcons();
      }
    });
  });
}

// ----------------------------------------------------------------------------
// ALGORITHM SIMULATORS EVENTS (ZERO FOCUS LOSS)
// ----------------------------------------------------------------------------
function setupAlgorithmEvents(container) {
  // Preset Buttons for Allocation
  container.querySelectorAll("[data-preset-alloc]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const preset = e.currentTarget.dataset.presetAlloc;
      const destSelect = container.querySelector("#sim-dest-select");
      if (preset === "ny") {
        simDest = "New York, NY";
        simQty1 = 8;
        simQty2 = 4;
      } else if (preset === "la") {
        simDest = "Los Angeles, CA";
        simQty1 = 15;
        simQty2 = 10;
      } else {
        simDest = "Chicago, IL";
        simQty1 = 5;
        simQty2 = 2;
      }
      if (destSelect) destSelect.value = simDest;
      const q1 = container.querySelector("#sim-qty-1");
      const q2 = container.querySelector("#sim-qty-2");
      if (q1) q1.value = simQty1;
      if (q2) q2.value = simQty2;
      updateAllocationSimulator(container);
    });
  });

  // Inputs for Allocation
  const destSelect = container.querySelector("#sim-dest-select");
  const qty1Input = container.querySelector("#sim-qty-1");
  const qty2Input = container.querySelector("#sim-qty-2");

  if (destSelect) {
    destSelect.addEventListener("change", (e) => {
      simDest = e.target.value;
      updateAllocationSimulator(container);
    });
  }
  if (qty1Input) {
    qty1Input.addEventListener("input", (e) => {
      simQty1 = parseInt(e.target.value) || 1;
      updateAllocationSimulator(container);
    });
  }
  if (qty2Input) {
    qty2Input.addEventListener("input", (e) => {
      simQty2 = parseInt(e.target.value) || 1;
      updateAllocationSimulator(container);
    });
  }

  // Presets for ROP
  container.querySelectorAll("[data-preset-rop]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const preset = e.currentTarget.dataset.presetRop;
      if (preset === "holiday") {
        ropDemand = 45;
        ropLeadTime = 12;
        ropSigmaDemand = 10;
        ropServiceLevel = "99%";
      } else if (preset === "port") {
        ropDemand = 20;
        ropLeadTime = 35;
        ropSigmaDemand = 4;
        ropServiceLevel = "98%";
      } else {
        ropDemand = 15;
        ropLeadTime = 7;
        ropSigmaDemand = 2;
        ropServiceLevel = "95%";
      }

      const sDemand = container.querySelector("#slider-demand");
      const sLead = container.querySelector("#slider-leadtime");
      const sSigma = container.querySelector("#slider-sigmad");
      const sSla = container.querySelector("#select-service-level");

      if (sDemand) sDemand.value = ropDemand;
      if (sLead) sLead.value = ropLeadTime;
      if (sSigma) sSigma.value = ropSigmaDemand;
      if (sSla) sSla.value = ropServiceLevel;

      updateRopSimulator(container);
    });
  });

  // Sliders for ROP
  const sliderDemand = container.querySelector("#slider-demand");
  const sliderLead = container.querySelector("#slider-leadtime");
  const sliderSigmaD = container.querySelector("#slider-sigmad");
  const selectSLA = container.querySelector("#select-service-level");

  if (sliderDemand) {
    sliderDemand.addEventListener("input", (e) => {
      ropDemand = parseInt(e.target.value);
      updateRopSimulator(container);
    });
  }
  if (sliderLead) {
    sliderLead.addEventListener("input", (e) => {
      ropLeadTime = parseInt(e.target.value);
      updateRopSimulator(container);
    });
  }
  if (sliderSigmaD) {
    sliderSigmaD.addEventListener("input", (e) => {
      ropSigmaDemand = parseInt(e.target.value);
      updateRopSimulator(container);
    });
  }
  if (selectSLA) {
    selectSLA.addEventListener("change", (e) => {
      ropServiceLevel = e.target.value;
      updateRopSimulator(container);
    });
  }

  // Presets for Valuation
  container.querySelectorAll("[data-preset-val]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const val = parseInt(e.currentTarget.dataset.presetVal);
      valUnitsToDeplete = val;
      const vInput = container.querySelector("#input-val-units");
      if (vInput) vInput.value = val;
      updateValuationSimulator(container);
    });
  });

  // Input for Valuation
  const valInput = container.querySelector("#input-val-units");
  if (valInput) {
    valInput.addEventListener("input", (e) => {
      valUnitsToDeplete = parseInt(e.target.value) || 0;
      updateValuationSimulator(container);
    });
  }
}

function updateAllocationSimulator(container) {
  const warehouses = store.getWarehouses();
  const stock = store.getStock();
  const destCoords = getCoordsForCity(simDest);

  const allocationResult = simulateOrderAllocation(
    [
      { productId: "PROD-1001", quantity: parseInt(simQty1) || 1 },
      { productId: "PROD-1002", quantity: parseInt(simQty2) || 1 }
    ],
    destCoords,
    warehouses,
    stock
  );

  const decisionBox = container.querySelector("#alloc-decision-container");
  if (decisionBox) {
    decisionBox.innerHTML = renderAllocationDecisionHtml(allocationResult);
  }

  const tableBody = container.querySelector("#alloc-candidates-table tbody");
  if (tableBody) {
    tableBody.innerHTML = renderCandidatesTableBody(allocationResult.allCandidates);
  }
}

function updateRopSimulator(container) {
  // Update badge labels
  const lblDemand = container.querySelector("#lbl-demand");
  const lblLead = container.querySelector("#lbl-leadtime");
  const lblSigma = container.querySelector("#lbl-sigmad");
  const lblSla = container.querySelector("#lbl-sla");

  if (lblDemand) lblDemand.textContent = `${ropDemand} units/day`;
  if (lblLead) lblLead.textContent = `${ropLeadTime} days`;
  if (lblSigma) lblSigma.textContent = `${ropSigmaDemand}`;
  if (lblSla) lblSla.textContent = `${ropServiceLevel}`;

  // Recompute
  const ssCalculated = calculateSafetyStock(ropDemand, ropLeadTime, ropSigmaDemand, ropSigmaLead, ropServiceLevel);
  const ropCalculated = calculateROP(ropDemand, ropLeadTime, ssCalculated);
  const eoqCalculated = calculateEOQ(ropDemand * 365, 50, 45, 0.2);

  // Update Visual Meter Bar
  const meterCycle = container.querySelector("#meter-cycle-bar");
  const meterSafety = container.querySelector("#meter-safety-bar");
  const dispTotal = container.querySelector("#disp-rop-total");

  const cycleDemand = ropDemand * ropLeadTime;
  const cycleWidthPct = Math.round((cycleDemand / (ropCalculated || 1)) * 100);
  const safetyWidthPct = Math.max(10, Math.round((ssCalculated / (ropCalculated || 1)) * 100));

  if (dispTotal) dispTotal.textContent = `${ropCalculated} units`;
  if (meterCycle) {
    meterCycle.style.width = `${cycleWidthPct}%`;
    meterCycle.textContent = `Cycle Demand (${cycleDemand}u)`;
  }
  if (meterSafety) {
    meterSafety.style.width = `${safetyWidthPct}%`;
    meterSafety.textContent = `Safety Buffer (${ssCalculated}u)`;
  }

  // Update Stat Cards
  const statCycle = container.querySelector("#stat-cycle-demand");
  const statSs = container.querySelector("#stat-safety-stock");
  const statRop = container.querySelector("#stat-rop");
  const statRopDesc = container.querySelector("#stat-rop-desc");
  const statEoq = container.querySelector("#stat-eoq");

  if (statCycle) statCycle.textContent = cycleDemand;
  if (statSs) statSs.textContent = ssCalculated;
  if (statRop) statRop.textContent = ropCalculated;
  if (statRopDesc) statRopDesc.textContent = `Auto-PO drafted at <= ${ropCalculated}u`;
  if (statEoq) statEoq.textContent = eoqCalculated;
}

function updateValuationSimulator(container) {
  const fifoRes = ValuationEngine.computeFIFO(sampleCostLayers, valUnitsToDeplete);
  const avcoRes = ValuationEngine.computeAVCO(sampleCostLayers, valUnitsToDeplete);
  const deltaCogs = Math.abs(fifoRes.cogsTotal - avcoRes.cogsTotal);

  const fifoBox = container.querySelector("#val-fifo-container");
  const avcoBox = container.querySelector("#val-avco-container");
  const deltaBox = container.querySelector("#val-delta-container");

  if (fifoBox) fifoBox.innerHTML = renderFifoCardHtml(fifoRes);
  if (avcoBox) avcoBox.innerHTML = renderAvcoCardHtml(avcoRes);
  if (deltaBox) deltaBox.innerHTML = renderValuationDeltaHtml(deltaCogs);
}

// ----------------------------------------------------------------------------
// ERD EVENTS (ZERO FOCUS LOSS SEARCH & COPY)
// ----------------------------------------------------------------------------
function setupErdEvents(container) {
  // Category Chips Filter
  const chips = container.querySelectorAll("#erd-category-chips button");
  chips.forEach((chip) => {
    chip.addEventListener("click", (e) => {
      const cat = e.currentTarget.dataset.erdCat;
      if (activeErdCategory === cat) return;

      activeErdCategory = cat;
      chips.forEach((c) => {
        if (c.dataset.erdCat === cat) {
          c.classList.add("active");
        } else {
          c.classList.remove("active");
        }
      });
      refreshErdGrid(container);
    });
  });

  // Live Search Input (Focus Preserved!)
  const searchInput = container.querySelector("#erd-search-input");
  const clearBtn = container.querySelector("#erd-search-clear");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      erdSearchQuery = e.target.value;
      refreshErdGrid(container);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      erdSearchQuery = "";
      if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
      }
      refreshErdGrid(container);
    });
  }

  // Bind Individual Copy DDL Buttons
  bindCopyDdlButtons(container);
}

function refreshErdGrid(container) {
  const filtered = getFilteredErdTables();
  const grid = container.querySelector("#erd-cards-grid");
  if (grid) {
    grid.innerHTML = renderErdCardsHtml(filtered);
    window.lucide.createIcons();
    bindCopyDdlButtons(container);
  }
}

function bindCopyDdlButtons(container) {
  container.querySelectorAll("[data-copy-ddl]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const tableName = e.currentTarget.dataset.copyDdl;
      const tableObj = erdTables.find((t) => t.name === tableName);
      if (tableObj && tableObj.ddl) {
        navigator.clipboard.writeText(tableObj.ddl);
        toast.success(`Table "${tableName}" DDL copied to clipboard!`);
      }
    });
  });
}
