import { store } from "../state/store.js";
import { toast } from "./Toast.js";
import { simulateOrderAllocation } from "../algorithms/stockAllocation.js";
import { calculateSafetyStock, calculateROP, calculateEOQ } from "../algorithms/reorderPoint.js";
import { ValuationEngine } from "../algorithms/valuation.js";

let activeArchTab = "c4"; // 'c4', 'erd', 'algorithms', 'ddd'
let activeC4Level = "context"; // 'context', 'container', 'component', 'events'

// Algorithm Simulator State
let simDest = "New York, NY";
let simQty1 = 5;
let simQty2 = 2;

let ropDemand = 15;
let ropLeadTime = 10;
let ropSigmaDemand = 3;
let ropSigmaLead = 2;
let ropServiceLevel = "95%";

let valUnitsToDeplete = 65;

export function renderArchitectureView() {
  return `
    <div class="view-container animate-fade-in">
      <!-- Header -->
      <div class="view-header">
        <div>
          <div class="inline-flex-gap mb-1">
            <span class="badge badge-accent"><i data-lucide="cpu"></i> System Architecture</span>
            <span class="badge badge-subtle">C4 Model & Clean DDD</span>
            <span class="badge badge-info">Modular Event-Driven</span>
          </div>
          <h1 class="view-title">Enterprise System Architecture & Engineering Blueprint</h1>
          <p class="view-subtitle">C4 diagrams, Domain-Driven Design bounded contexts, relational ERD schemas, and interactive algorithm sandboxes.</p>
        </div>
        <div class="header-actions">
          <button id="btn-export-ddl" class="btn btn-secondary btn-sm">
            <i data-lucide="download"></i>
            <span>Export SQL DDL Schema</span>
          </button>
        </div>
      </div>

      <!-- Architecture Top-Level Tabs -->
      <div class="filter-bar glass-panel mb-4">
        <div class="btn-group">
          <button class="btn btn-sm ${activeArchTab === "c4" ? "btn-accent" : "btn-subtle"}" data-arch-tab="c4">
            <i data-lucide="network"></i> C4 Architecture Diagrams
          </button>
          <button class="btn btn-sm ${activeArchTab === "algorithms" ? "btn-accent" : "btn-subtle"}" data-arch-tab="algorithms">
            <i data-lucide="calculator"></i> Algorithm Sandboxes
          </button>
          <button class="btn btn-sm ${activeArchTab === "erd" ? "btn-accent" : "btn-subtle"}" data-arch-tab="erd">
            <i data-lucide="database"></i> Relational Database ERD
          </button>
          <button class="btn btn-sm ${activeArchTab === "ddd" ? "btn-accent" : "btn-subtle"}" data-arch-tab="ddd">
            <i data-lucide="git-merge"></i> DDD Bounded Contexts
          </button>
        </div>
      </div>

      <!-- Tab Content Area -->
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

function renderC4Tab() {
  return `
    <div class="glass-panel p-4 animate-fade-in">
      <div class="flex-between mb-4">
        <div>
          <h2 class="font-semibold text-lg">C4 Architectural Abstraction Model</h2>
          <p class="text-xs text-muted">Iterative zoom levels from external business context down to internal micro-components</p>
        </div>
        <div class="btn-group">
          <button class="btn btn-xs ${activeC4Level === "context" ? "btn-accent" : "btn-subtle"}" data-c4-level="context">Level 1: System Context</button>
          <button class="btn btn-xs ${activeC4Level === "container" ? "btn-accent" : "btn-subtle"}" data-c4-level="container">Level 2: Container Diagram</button>
          <button class="btn btn-xs ${activeC4Level === "component" ? "btn-accent" : "btn-subtle"}" data-c4-level="component">Level 3: Component Diagram</button>
          <button class="btn btn-xs ${activeC4Level === "events" ? "btn-accent" : "btn-subtle"}" data-c4-level="events">Event-Driven Flow</button>
        </div>
      </div>

      ${
        activeC4Level === "context"
          ? `
        <div class="c4-diagram-canvas glass-panel p-4">
          <div class="c4-title-tag mb-3 font-mono text-xs uppercase text-accent">C4 Level 1: System Context Diagram</div>
          <div class="diagram-grid">
            <div class="diagram-col">
              <div class="diagram-box external-box">
                <div class="box-badge">External Actor</div>
                <div class="box-title">Inventory Manager</div>
                <div class="box-desc">Monitors stock health, configures warehouses, initiates stock transfers.</div>
              </div>
              <div class="diagram-box external-box">
                <div class="box-badge">External Actor</div>
                <div class="box-title">Warehouse Operator</div>
                <div class="box-desc">Scans bins, executes wave picking, verifies pack station items, logs GRN.</div>
              </div>
              <div class="diagram-box external-box">
                <div class="box-badge">External Actor</div>
                <div class="box-title">Purchasing Officer</div>
                <div class="box-desc">Issues Purchase Orders (POs) and monitors vendor SLA compliance.</div>
              </div>
            </div>

            <div class="diagram-col-center">
              <div class="diagram-box system-core-box">
                <div class="box-badge badge-accent">Core System Under Study</div>
                <div class="box-title text-xl font-bold">Retail Inventory Management System (RIMS)</div>
                <div class="box-desc mt-2">
                  Unified enterprise platform orchestrating Product Catalog, Multi-Warehouse Bin Topologies,
                  Real-time Available to Promise (ATP) Stock Ledgers, Omnichannel Order Routing, and Procure-to-Pay Workflows.
                </div>
                <div class="pill-group mt-3">
                  <span class="badge badge-subtle">HTTPS / TLS 1.3</span>
                  <span class="badge badge-subtle">REST OpenAPI v3</span>
                  <span class="badge badge-subtle">Event Bus</span>
                </div>
              </div>
            </div>

            <div class="diagram-col">
              <div class="diagram-box external-sys-box">
                <div class="box-badge">External System</div>
                <div class="box-title">eCommerce Channels</div>
                <div class="box-desc">Shopify, Magento, Marketplaces placing sales orders and querying ATP stock.</div>
              </div>
              <div class="diagram-box external-sys-box">
                <div class="box-badge">External System</div>
                <div class="box-title">Physical Store POS</div>
                <div class="box-desc">Brick-and-mortar checkout registers synchronizing real-time sales depletions.</div>
              </div>
              <div class="diagram-box external-sys-box">
                <div class="box-badge">External System</div>
                <div class="box-title">3PL Logistics Carriers</div>
                <div class="box-desc">FedEx, UPS, DHL for automated rate quotes, label generation, and dispatch tracking.</div>
              </div>
            </div>
          </div>
        </div>
      `
          : activeC4Level === "container"
          ? `
        <div class="c4-diagram-canvas glass-panel p-4">
          <div class="c4-title-tag mb-3 font-mono text-xs uppercase text-accent">C4 Level 2: Container Runtime Diagram</div>
          <div class="container-architecture-grid">
            <div class="container-node">
              <div class="box-badge badge-accent">Single Page App (SPA)</div>
              <div class="font-bold text-sm">Web Dashboard Client</div>
              <div class="text-xs text-muted mt-1">HTML5, Vanilla CSS, ES Modules, Chart.js, Lucide</div>
              <div class="text-xs text-accent mt-2">Delivers responsive desktop/mobile interfaces</div>
            </div>

            <div class="flow-arrow"><i data-lucide="arrow-right"></i><span class="text-xs">HTTPS</span></div>

            <div class="container-node">
              <div class="box-badge badge-subtle">API Gateway / Proxy</div>
              <div class="font-bold text-sm">NGINX / Envoy Gateway</div>
              <div class="text-xs text-muted mt-1">SSL Termination, JWT Auth, Rate-Limiting, CORS</div>
              <div class="text-xs text-accent mt-2">Zero-trust edge security</div>
            </div>

            <div class="flow-arrow"><i data-lucide="arrow-right"></i><span class="text-xs">HTTP/JSON</span></div>

            <div class="container-node">
              <div class="box-badge badge-success">Application Backend</div>
              <div class="font-bold text-sm">RIMS Core Engine</div>
              <div class="text-xs text-muted mt-1">Node.js / Express / Clean Architecture</div>
              <div class="text-xs text-accent mt-2">Hosts Allocation, ROP, Valuation & Ledgers</div>
            </div>

            <div class="flow-arrow"><i data-lucide="arrow-right"></i><span class="text-xs">ACID / RESP</span></div>

            <div class="container-node">
              <div class="box-badge badge-info">Datastores</div>
              <div class="font-bold text-sm">PostgreSQL 16 & Redis 7.2</div>
              <div class="text-xs text-muted mt-1">Relational DB (ACID) + Redis In-Memory Locks</div>
              <div class="text-xs text-accent mt-2">Optimistic Concurrency Control (OCC)</div>
            </div>
          </div>
        </div>
      `
          : activeC4Level === "component"
          ? `
        <div class="c4-diagram-canvas glass-panel p-4">
          <div class="c4-title-tag mb-3 font-mono text-xs uppercase text-accent">C4 Level 3: Component Diagram (Core Application Engine)</div>
          <div class="component-grid">
            <div class="component-card glass-panel">
              <div class="component-header">
                <i data-lucide="box" class="text-accent"></i>
                <span class="font-bold text-sm">Catalog & PIM Service</span>
              </div>
              <p class="text-xs text-muted mt-1">Automated SKU generator, EAN-13 barcode validator, margin & pricing formulas, category taxonomies.</p>
              <div class="component-meta mt-2 text-xs font-mono">Entities: Product, Variant, Category, Brand</div>
            </div>

            <div class="component-card glass-panel">
              <div class="component-header">
                <i data-lucide="warehouse" class="text-accent"></i>
                <span class="font-bold text-sm">Multi-Warehouse Inventory Ledger</span>
              </div>
              <p class="text-xs text-muted mt-1">Real-time SOH, RES, and ATP ledger calculations, spatial bin coordinates (Zone-Aisle-Shelf-Bin), inter-warehouse transfers.</p>
              <div class="component-meta mt-2 text-xs font-mono">Invariants: Non-negative ATP (ATP >= 0)</div>
            </div>

            <div class="component-card glass-panel">
              <div class="component-header">
                <i data-lucide="truck" class="text-accent"></i>
                <span class="font-bold text-sm">Order Allocation & Routing Router</span>
              </div>
              <p class="text-xs text-muted mt-1">Heuristic multi-criteria allocation engine minimizing transit distance, split-shipment penalties, and respecting FIFO batch expiration.</p>
              <div class="component-meta mt-2 text-xs font-mono">Stage-Gate: Pick -> Pack -> Dispatch</div>
            </div>

            <div class="component-card glass-panel">
              <div class="component-header">
                <i data-lucide="shopping-cart" class="text-accent"></i>
                <span class="font-bold text-sm">Supplier & Procure-to-Pay Service</span>
              </div>
              <p class="text-xs text-muted mt-1">Vendor directory, lead-time SLA tracking, automated Reorder Point (ROP) trigger, PO generation, and Inbound GRN receiving.</p>
              <div class="component-meta mt-2 text-xs font-mono">Auto-PO: Triggered when ATP <= ROP</div>
            </div>
          </div>
        </div>
      `
          : `
        <div class="c4-diagram-canvas glass-panel p-4">
          <div class="c4-title-tag mb-3 font-mono text-xs uppercase text-accent">Event-Driven Architecture (EDA) & Domain Events</div>
          <div class="event-stream-container">
            <div class="event-item">
              <span class="event-badge badge-accent font-mono">OrderPlaced</span>
              <div class="event-desc">
                <strong>Payload:</strong> { orderId, items, customerLocation }<br>
                <em>Triggered by:</em> eCommerce / POS. <em>Consumed by:</em> Allocation Engine to atomically reserve ATP stock.
              </div>
            </div>
            <div class="event-item">
              <span class="event-badge badge-success font-mono">StockAllocated</span>
              <div class="event-desc">
                <strong>Payload:</strong> { orderId, warehouseId, reservedItems }<br>
                <em>Triggered by:</em> Allocation Engine. <em>Consumed by:</em> WMS Pick List Generator & Inventory Ledger.
              </div>
            </div>
            <div class="event-item">
              <span class="event-badge badge-warning font-mono">LowStockThresholdCrossed</span>
              <div class="event-desc">
                <strong>Payload:</strong> { productId, warehouseId, currentAtp, rop }<br>
                <em>Triggered by:</em> Stock Ledger when ATP <= ROP. <em>Consumed by:</em> Automated PO Drafting Service.
              </div>
            </div>
            <div class="event-item">
              <span class="event-badge badge-info font-mono">GoodsReceived (GRN)</span>
              <div class="event-desc">
                <strong>Payload:</strong> { poId, grnNumber, receivedLots }<br>
                <em>Triggered by:</em> Warehouse Inbound Receiving. <em>Consumed by:</em> FIFO Cost Layering & Stock Ledger.
              </div>
            </div>
          </div>
        </div>
      `
      }
    </div>
  `;
}

function renderAlgorithmsTab() {
  const warehouses = store.getWarehouses();
  const stock = store.getStock();
  const products = store.getProducts();

  // Run Allocation Simulator
  const destCoords =
    simDest === "New York, NY"
      ? { lat: 40.7128, lon: -74.006 }
      : simDest === "Chicago, IL"
      ? { lat: 41.8781, lon: -87.6298 }
      : simDest === "Los Angeles, CA"
      ? { lat: 34.0522, lon: -118.2437 }
      : simDest === "Dallas, TX"
      ? { lat: 32.7767, lon: -96.797 }
      : { lat: 25.7617, lon: -80.1918 };

  const allocationResult = simulateOrderAllocation(
    [
      { productId: "PROD-1001", quantity: parseInt(simQty1) || 1 },
      { productId: "PROD-1002", quantity: parseInt(simQty2) || 1 }
    ],
    destCoords,
    warehouses,
    stock
  );

  // Run ROP Simulator
  const ssCalculated = calculateSafetyStock(ropDemand, ropLeadTime, ropSigmaDemand, ropSigmaLead, ropServiceLevel);
  const ropCalculated = calculateROP(ropDemand, ropLeadTime, ssCalculated);
  const eoqCalculated = calculateEOQ(ropDemand * 365, 50, 45, 0.2);

  // Run Valuation Simulator
  const sampleLayers = [
    { batchId: "LOT-01 (Jan)", quantity: 30, unitCost: 65.0, receivedDate: "2026-01-10" },
    { batchId: "LOT-02 (Feb)", quantity: 40, unitCost: 75.0, receivedDate: "2026-02-15" },
    { batchId: "LOT-03 (Mar)", quantity: 50, unitCost: 85.0, receivedDate: "2026-03-20" }
  ];
  const fifoRes = ValuationEngine.computeFIFO(sampleLayers, valUnitsToDeplete);
  const avcoRes = ValuationEngine.computeAVCO(sampleLayers, valUnitsToDeplete);

  return `
    <div class="algorithms-grid">
      <!-- Simulator 1: Distributed Order Allocation -->
      <div class="glass-panel p-4">
        <div class="flex-between mb-3">
          <div>
            <span class="badge badge-accent font-mono text-xs">Algorithm 1</span>
            <h3 class="font-bold text-base mt-1">Multi-Warehouse Order Allocation & Routing Engine</h3>
            <p class="text-xs text-muted">Evaluates geographic distance, ATP stock availability, and split-shipment penalty ($P_{split} = 2000$).</p>
          </div>
        </div>

        <div class="sim-controls-grid mb-3">
          <div class="form-group">
            <label class="form-label text-xs">Customer Delivery Destination:</label>
            <select id="sim-dest-select" class="form-input form-select text-xs">
              <option value="New York, NY" ${simDest === "New York, NY" ? "selected" : ""}>New York, NY (East Coast)</option>
              <option value="Chicago, IL" ${simDest === "Chicago, IL" ? "selected" : ""}>Chicago, IL (Midwest)</option>
              <option value="Los Angeles, CA" ${simDest === "Los Angeles, CA" ? "selected" : ""}>Los Angeles, CA (West Coast)</option>
              <option value="Dallas, TX" ${simDest === "Dallas, TX" ? "selected" : ""}>Dallas, TX (South Central)</option>
              <option value="Miami, FL" ${simDest === "Miami, FL" ? "selected" : ""}>Miami, FL (Southeast)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label text-xs">PROD-1001 (Headphones) Qty:</label>
            <input type="number" id="sim-qty-1" class="form-input text-xs" min="1" max="150" value="${simQty1}">
          </div>

          <div class="form-group">
            <label class="form-label text-xs">PROD-1002 (Keyboard) Qty:</label>
            <input type="number" id="sim-qty-2" class="form-input text-xs" min="1" max="150" value="${simQty2}">
          </div>
        </div>

        <!-- Simulation Result Card -->
        <div class="sim-result-box glass-panel p-3">
          <div class="flex-between mb-2">
            <span class="text-xs uppercase font-mono text-accent font-semibold">Allocation Engine Decision</span>
            <span class="badge ${allocationResult.allocatedWarehouse.canFulfillAll ? "badge-success" : "badge-warning"}">
              ${allocationResult.allocatedWarehouse.canFulfillAll ? "Optimal Single-Node Allocation" : "Split-Shipment Warning"}
            </span>
          </div>

          <div class="winning-wh-row p-2 rounded bg-surface-subtle flex-between">
            <div>
              <div class="text-xs text-muted font-mono">SELECTED FULFILLMENT CENTER:</div>
              <div class="font-bold text-base text-accent">${allocationResult.allocatedWarehouse.warehouseName} (${allocationResult.allocatedWarehouse.warehouseCode})</div>
              <div class="text-xs text-muted">Distance to Customer: <strong>${allocationResult.allocatedWarehouse.distanceKm} km</strong> | Final Penalty Score: <strong>${allocationResult.allocatedWarehouse.score}</strong></div>
            </div>
            <div class="text-right">
              <span class="badge badge-accent text-xs">Fulfills ${allocationResult.allocatedWarehouse.fulfilledItemsCount}/${allocationResult.allocatedWarehouse.totalItems} SKUs</span>
            </div>
          </div>

          <div class="candidate-rankings mt-3">
            <div class="text-xs text-muted font-mono uppercase mb-1">Evaluated Candidate Warehouses:</div>
            <table class="data-table text-xs">
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>Distance</th>
                  <th>Line Coverage</th>
                  <th>ATP Feasibility</th>
                  <th>Calculated Score</th>
                </tr>
              </thead>
              <tbody>
                ${allocationResult.allCandidates
                  .map(
                    (cand, idx) => `
                  <tr class="${idx === 0 ? "highlight-row" : ""}">
                    <td><strong>${cand.warehouseCode}</strong> (${cand.city})</td>
                    <td>${cand.distanceKm} km</td>
                    <td>${cand.fulfilledItemsCount}/${cand.totalItems} SKUs</td>
                    <td>
                      <span class="badge ${cand.canFulfillAll ? "badge-success" : "badge-warning"}">
                        ${cand.canFulfillAll ? "100% In Stock" : "Partial Stock"}
                      </span>
                    </td>
                    <td class="font-mono ${idx === 0 ? "text-accent font-bold" : ""}">${cand.score} ${idx === 0 ? "★ WINNER" : ""}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Simulator 2: Dynamic Reorder Point (ROP) & Safety Stock -->
      <div class="glass-panel p-4">
        <div class="flex-between mb-3">
          <div>
            <span class="badge badge-accent font-mono text-xs">Algorithm 2</span>
            <h3 class="font-bold text-base mt-1">Automated Reorder Point ($ROP$) & Safety Stock Calculator</h3>
            <p class="text-xs text-muted">Formula: $ROP = (d \times L) + Z \times \sqrt{L \cdot \sigma_d^2 + d^2 \cdot \sigma_L^2}$</p>
          </div>
        </div>

        <div class="rop-sliders-grid mb-3">
          <div class="form-group">
            <div class="flex-between">
              <label class="form-label text-xs">Average Daily Demand ($d$):</label>
              <span class="font-mono text-xs text-accent font-bold" id="val-demand">${ropDemand} units/day</span>
            </div>
            <input type="range" id="slider-demand" min="1" max="100" value="${ropDemand}" class="form-range">
          </div>

          <div class="form-group">
            <div class="flex-between">
              <label class="form-label text-xs">Supplier Lead Time ($L$):</label>
              <span class="font-mono text-xs text-accent font-bold" id="val-leadtime">${ropLeadTime} days</span>
            </div>
            <input type="range" id="slider-leadtime" min="1" max="60" value="${ropLeadTime}" class="form-range">
          </div>

          <div class="form-group">
            <div class="flex-between">
              <label class="form-label text-xs">Demand Std Dev ($\sigma_d$):</label>
              <span class="font-mono text-xs text-accent font-bold" id="val-sigmad">${ropSigmaDemand}</span>
            </div>
            <input type="range" id="slider-sigmad" min="0" max="20" value="${ropSigmaDemand}" class="form-range">
          </div>

          <div class="form-group">
            <div class="flex-between">
              <label class="form-label text-xs">Service Level Target ($Z$):</label>
              <span class="font-mono text-xs text-accent font-bold">${ropServiceLevel}</span>
            </div>
            <select id="select-service-level" class="form-input form-select text-xs">
              <option value="90%" ${ropServiceLevel === "90%" ? "selected" : ""}>90% (Z = 1.282)</option>
              <option value="95%" ${ropServiceLevel === "95%" ? "selected" : ""}>95% (Z = 1.645 - Standard)</option>
              <option value="98%" ${ropServiceLevel === "98%" ? "selected" : ""}>98% (Z = 2.054)</option>
              <option value="99%" ${ropServiceLevel === "99%" ? "selected" : ""}>99% (Z = 2.326 - High SLA)</option>
            </select>
          </div>
        </div>

        <div class="rop-results-grid">
          <div class="rop-result-card glass-panel">
            <div class="text-xs text-muted uppercase font-mono">Lead Time Demand:</div>
            <div class="font-mono text-lg font-bold text-accent">${ropDemand * ropLeadTime} units</div>
            <div class="text-xs text-muted mt-1">$d \times L$ base demand</div>
          </div>
          <div class="rop-result-card glass-panel">
            <div class="text-xs text-muted uppercase font-mono">Safety Stock ($SS$):</div>
            <div class="font-mono text-lg font-bold text-warning">${ssCalculated} units</div>
            <div class="text-xs text-muted mt-1">Variance buffer</div>
          </div>
          <div class="rop-result-card glass-panel highlight-border">
            <div class="text-xs text-muted uppercase font-mono">Reorder Point ($ROP$):</div>
            <div class="font-mono text-xl font-bold text-success">${ropCalculated} units</div>
            <div class="text-xs text-muted mt-1">PO trigger threshold</div>
          </div>
          <div class="rop-result-card glass-panel">
            <div class="text-xs text-muted uppercase font-mono">Economic Order Qty ($EOQ$):</div>
            <div class="font-mono text-lg font-bold text-accent">${eoqCalculated} units</div>
            <div class="text-xs text-muted mt-1">Optimal replenishment</div>
          </div>
        </div>
      </div>

      <!-- Simulator 3: Inventory Valuation (FIFO vs AVCO) -->
      <div class="glass-panel p-4 col-span-2">
        <div class="flex-between mb-3">
          <div>
            <span class="badge badge-accent font-mono text-xs">Algorithm 3</span>
            <h3 class="font-bold text-base mt-1">Inventory Valuation Engine: Dual FIFO vs Moving Average (AVCO)</h3>
            <p class="text-xs text-muted">Simulates order depletion across chronological cost layers to demonstrate GAAP / IFRS compliance.</p>
          </div>
          <div class="inline-flex-gap">
            <span class="text-xs text-muted">Units to Deplete:</span>
            <input type="number" id="input-val-units" min="0" max="120" value="${valUnitsToDeplete}" class="form-input text-xs" style="width: 80px;">
          </div>
        </div>

        <div class="valuation-split-grid">
          <!-- FIFO Model -->
          <div class="val-model-box glass-panel p-3">
            <div class="flex-between mb-2">
              <span class="font-bold text-sm text-accent">Model A: First-In, First-Out (FIFO)</span>
              <span class="badge badge-accent font-mono text-xs">Layered Batches</span>
            </div>
            <div class="val-metric-row flex-between py-1 border-b">
              <span class="text-xs text-muted">Cost of Goods Sold (COGS):</span>
              <span class="font-mono font-bold text-sm text-success">$${fifoRes.cogsTotal.toFixed(2)}</span>
            </div>
            <div class="val-metric-row flex-between py-1 border-b">
              <span class="text-xs text-muted">Avg Unit COGS:</span>
              <span class="font-mono font-bold text-xs">$${fifoRes.averageUnitCogs.toFixed(2)} / unit</span>
            </div>
            <div class="val-metric-row flex-between py-1 border-b">
              <span class="text-xs text-muted">Remaining Stock Value:</span>
              <span class="font-mono font-bold text-sm text-accent">$${fifoRes.remainingStockValue.toFixed(2)}</span>
            </div>
            <div class="val-metric-row flex-between py-1">
              <span class="text-xs text-muted">Remaining Units:</span>
              <span class="font-mono font-bold text-xs">${fifoRes.remainingUnits} units</span>
            </div>

            <div class="layers-breakdown mt-2">
              <div class="text-xs text-muted font-mono uppercase mb-1">FIFO Consumption Layers:</div>
              <ul class="text-xs font-mono space-y-1">
                ${fifoRes.consumedLayers
                  .map(
                    (cl) => `
                  <li class="flex-between text-muted">
                    <span>${cl.batchId}: ${cl.consumedQty} units @ $${cl.unitCost.toFixed(2)}</span>
                    <span class="font-bold text-white">$${cl.costTotal.toFixed(2)}</span>
                  </li>
                `
                  )
                  .join("")}
              </ul>
            </div>
          </div>

          <!-- AVCO Model -->
          <div class="val-model-box glass-panel p-3">
            <div class="flex-between mb-2">
              <span class="font-bold text-sm text-info">Model B: Moving Weighted Average (AVCO)</span>
              <span class="badge badge-info font-mono text-xs">Blended Unit Cost</span>
            </div>
            <div class="val-metric-row flex-between py-1 border-b">
              <span class="text-xs text-muted">Cost of Goods Sold (COGS):</span>
              <span class="font-mono font-bold text-sm text-success">$${avcoRes.cogsTotal.toFixed(2)}</span>
            </div>
            <div class="val-metric-row flex-between py-1 border-b">
              <span class="text-xs text-muted">Weighted Avg Unit Cost:</span>
              <span class="font-mono font-bold text-xs">$${avcoRes.weightedAvgUnitCost.toFixed(2)} / unit</span>
            </div>
            <div class="val-metric-row flex-between py-1 border-b">
              <span class="text-xs text-muted">Remaining Stock Value:</span>
              <span class="font-mono font-bold text-sm text-info">$${avcoRes.remainingStockValue.toFixed(2)}</span>
            </div>
            <div class="val-metric-row flex-between py-1">
              <span class="text-xs text-muted">Remaining Units:</span>
              <span class="font-mono font-bold text-xs">${avcoRes.remainingUnits} units</span>
            </div>

            <div class="layers-breakdown mt-2">
              <div class="text-xs text-muted font-mono uppercase mb-1">Blended Pool Formula:</div>
              <div class="text-xs text-muted font-mono">
                $$C_{avg} = \\frac{\\sum (Q_i \\times C_i)}{\\sum Q_i} = \\frac{\\$9,100}{120} = \\$76.67$$
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderErdTab() {
  const tables = [
    {
      name: "products",
      badge: "Catalog Master",
      columns: [
        { name: "id", type: "VARCHAR(36)", key: "PK" },
        { name: "sku", type: "VARCHAR(50)", key: "UNIQUE" },
        { name: "barcode", type: "VARCHAR(30)", key: "UNIQUE" },
        { name: "name", type: "VARCHAR(200)" },
        { name: "category_id", type: "VARCHAR(36)", key: "FK -> categories" },
        { name: "cost_price", type: "DECIMAL(10,2)" },
        { name: "selling_price", type: "DECIMAL(10,2)" },
        { name: "reorder_point", type: "INT" },
        { name: "max_stock", type: "INT" }
      ]
    },
    {
      name: "inventory_stock",
      badge: "Ledger Core",
      columns: [
        { name: "id", type: "VARCHAR(36)", key: "PK" },
        { name: "product_id", type: "VARCHAR(36)", key: "FK -> products" },
        { name: "warehouse_id", type: "VARCHAR(36)", key: "FK -> warehouses" },
        { name: "bin_id", type: "VARCHAR(36)", key: "FK -> bins" },
        { name: "on_hand", type: "INT", key: "CHECK >= 0" },
        { name: "reserved", type: "INT", key: "CHECK >= 0" },
        { name: "version", type: "INT", key: "OCC Lock" }
      ]
    },
    {
      name: "warehouses",
      badge: "Topology",
      columns: [
        { name: "id", type: "VARCHAR(36)", key: "PK" },
        { name: "code", type: "VARCHAR(20)", key: "UNIQUE" },
        { name: "name", type: "VARCHAR(150)" },
        { name: "type", type: "VARCHAR(50)" },
        { name: "total_sqft", type: "INT" },
        { name: "max_capacity_units", type: "INT" }
      ]
    },
    {
      name: "warehouse_bins",
      badge: "Topology",
      columns: [
        { name: "id", type: "VARCHAR(36)", key: "PK" },
        { name: "warehouse_id", type: "VARCHAR(36)", key: "FK -> warehouses" },
        { name: "bin_code", type: "VARCHAR(30)", key: "UNIQUE" },
        { name: "aisle", type: "VARCHAR(10)" },
        { name: "shelf", type: "VARCHAR(10)" },
        { name: "bin_level", type: "VARCHAR(10)" }
      ]
    },
    {
      name: "sales_orders",
      badge: "Fulfillment",
      columns: [
        { name: "id", type: "VARCHAR(36)", key: "PK" },
        { name: "order_number", type: "VARCHAR(50)", key: "UNIQUE" },
        { name: "channel", type: "VARCHAR(30)" },
        { name: "customer_name", type: "VARCHAR(150)" },
        { name: "allocated_warehouse_id", type: "VARCHAR(36)", key: "FK -> warehouses" },
        { name: "status", type: "VARCHAR(30)" },
        { name: "total_amount", type: "DECIMAL(12,2)" }
      ]
    },
    {
      name: "purchase_orders",
      badge: "Procure-to-Pay",
      columns: [
        { name: "id", type: "VARCHAR(36)", key: "PK" },
        { name: "po_number", type: "VARCHAR(50)", key: "UNIQUE" },
        { name: "supplier_id", type: "VARCHAR(36)", key: "FK -> suppliers" },
        { name: "destination_warehouse_id", type: "VARCHAR(36)", key: "FK -> warehouses" },
        { name: "status", type: "VARCHAR(30)" },
        { name: "total_cost", type: "DECIMAL(12,2)" }
      ]
    }
  ];

  return `
    <div class="glass-panel p-4">
      <div class="flex-between mb-4">
        <div>
          <h2 class="font-semibold text-lg">Relational Database Schema & Data Dictionary</h2>
          <p class="text-xs text-muted">Fully normalized 3NF relational data model supporting ACID transactions, OCC versioning, and foreign key integrity.</p>
        </div>
        <span class="badge badge-accent">13 Relational Tables</span>
      </div>

      <div class="erd-table-grid">
        ${tables
          .map(
            (t) => `
          <div class="erd-card glass-panel">
            <div class="erd-card-header flex-between">
              <span class="font-mono font-bold text-sm text-accent">${t.name}</span>
              <span class="badge badge-subtle text-xs">${t.badge}</span>
            </div>
            <table class="data-table text-xs mt-2">
              <tbody>
                ${t.columns
                  .map(
                    (c) => `
                  <tr>
                    <td class="font-mono font-semibold">${c.name}</td>
                    <td class="text-muted font-mono">${c.type}</td>
                    <td>
                      ${c.key ? `<span class="badge ${c.key === "PK" ? "badge-accent" : c.key === "UNIQUE" ? "badge-info" : "badge-subtle"} font-mono text-xs">${c.key}</span>` : ""}
                    </td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderDddTab() {
  return `
    <div class="glass-panel p-4">
      <div class="mb-4">
        <h2 class="font-semibold text-lg">Domain-Driven Design (DDD) & Strategic Context Mapping</h2>
        <p class="text-xs text-muted">Partitioning enterprise retail inventory into cohesive, independently deployable bounded contexts.</p>
      </div>

      <div class="ddd-grid">
        <div class="ddd-context-card glass-panel">
          <div class="ddd-badge badge-accent">Context 1: Product Information Management (PIM)</div>
          <h3 class="font-bold text-base mt-2">Product Catalog Bounded Context</h3>
          <p class="text-xs text-muted mt-1">Maintains the single source of truth for items sold across all channels.</p>
          <div class="ddd-details text-xs mt-2">
            <div><strong>Aggregate Root:</strong> Product</div>
            <div><strong>Entities:</strong> ProductVariant, Category, Brand</div>
            <div><strong>Value Objects:</strong> SKU, Barcode (EAN-13), Money (Cost, Price), Dimensions (LxWxH, Weight)</div>
            <div><strong>Domain Events:</strong> ProductCreated, ProductPriceAdjusted, ProductDeactivated</div>
          </div>
        </div>

        <div class="ddd-context-card glass-panel">
          <div class="ddd-badge badge-success">Context 2: Multi-Warehouse Inventory</div>
          <h3 class="font-bold text-base mt-2">Inventory Ledger & Bin Topology Context</h3>
          <p class="text-xs text-muted mt-1">Tracks physical unit locations, batch/lot tracking, and Available to Promise calculations.</p>
          <div class="ddd-details text-xs mt-2">
            <div><strong>Aggregate Root:</strong> Warehouse, StockLedgerRecord</div>
            <div><strong>Entities:</strong> WarehouseZone, WarehouseBin, StockBatch</div>
            <div><strong>Value Objects:</strong> BinCoordinate (Zone-Aisle-Shelf-Bin), LotNumber, ATP</div>
            <div><strong>Domain Events:</strong> StockReserved, StockDeducted, StockTransferred, VarianceReconciled</div>
          </div>
        </div>

        <div class="ddd-context-card glass-panel">
          <div class="ddd-badge badge-warning">Context 3: Order Fulfillment</div>
          <h3 class="font-bold text-base mt-2">Order Ingestion & Routing Context</h3>
          <p class="text-xs text-muted mt-1">Orchestrates multi-channel orders, allocation algorithms, and warehouse pick-pack-ship workflows.</p>
          <div class="ddd-details text-xs mt-2">
            <div><strong>Aggregate Root:</strong> SalesOrder</div>
            <div><strong>Entities:</strong> OrderLineItem, PickList, PackingManifest</div>
            <div><strong>Value Objects:</strong> ShippingAddress, TrackingNumber, FulfillmentSLA</div>
            <div><strong>Domain Events:</strong> OrderPlaced, OrderAllocated, OrderDispatched, OrderDelivered</div>
          </div>
        </div>

        <div class="ddd-context-card glass-panel">
          <div class="ddd-badge badge-info">Context 4: Supplier & Procurement</div>
          <h3 class="font-bold text-base mt-2">Procure-to-Pay (SRM) Context</h3>
          <p class="text-xs text-muted mt-1">Automates vendor replenishment, purchase requisitions, and Goods Receipt Notes (GRN).</p>
          <div class="ddd-details text-xs mt-2">
            <div><strong>Aggregate Root:</strong> Supplier, PurchaseOrder</div>
            <div><strong>Entities:</strong> POLineItem, GoodsReceiptNote (GRN), InspectionRecord</div>
            <div><strong>Value Objects:</strong> LeadTimeDays, PaymentTerms, ReliabilityRating</div>
            <div><strong>Domain Events:</strong> POIssued, GoodsReceived, SupplierRated</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initArchitectureEvents(container, refreshView) {
  // Top-level tab switching
  container.querySelectorAll("[data-arch-tab]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      activeArchTab = e.currentTarget.dataset.archTab;
      refreshView();
    });
  });

  // C4 zoom level switching
  container.querySelectorAll("[data-c4-level]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      activeC4Level = e.currentTarget.dataset.c4Level;
      refreshView();
    });
  });

  // Export SQL DDL
  const exportBtn = container.querySelector("#btn-export-ddl");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      window.open("/database/schema.sql", "_blank") || toast.info("SQL Schema available in database/schema.sql");
    });
  }

  // Simulator 1: Allocation events
  const destSelect = container.querySelector("#sim-dest-select");
  const qty1Input = container.querySelector("#sim-qty-1");
  const qty2Input = container.querySelector("#sim-qty-2");

  if (destSelect) {
    destSelect.addEventListener("change", (e) => {
      simDest = e.target.value;
      refreshView();
    });
  }
  if (qty1Input) {
    qty1Input.addEventListener("input", (e) => {
      simQty1 = parseInt(e.target.value) || 1;
      refreshView();
    });
  }
  if (qty2Input) {
    qty2Input.addEventListener("input", (e) => {
      simQty2 = parseInt(e.target.value) || 1;
      refreshView();
    });
  }

  // Simulator 2: ROP sliders
  const sliderDemand = container.querySelector("#slider-demand");
  const sliderLead = container.querySelector("#slider-leadtime");
  const sliderSigmaD = container.querySelector("#slider-sigmad");
  const selectSLA = container.querySelector("#select-service-level");

  if (sliderDemand) {
    sliderDemand.addEventListener("input", (e) => {
      ropDemand = parseInt(e.target.value);
      refreshView();
    });
  }
  if (sliderLead) {
    sliderLead.addEventListener("input", (e) => {
      ropLeadTime = parseInt(e.target.value);
      refreshView();
    });
  }
  if (sliderSigmaD) {
    sliderSigmaD.addEventListener("input", (e) => {
      ropSigmaDemand = parseInt(e.target.value);
      refreshView();
    });
  }
  if (selectSLA) {
    selectSLA.addEventListener("change", (e) => {
      ropServiceLevel = e.target.value;
      refreshView();
    });
  }

  // Simulator 3: Valuation input
  const valInput = container.querySelector("#input-val-units");
  if (valInput) {
    valInput.addEventListener("input", (e) => {
      valUnitsToDeplete = parseInt(e.target.value) || 0;
      refreshView();
    });
  }
}
