/**
 * Admin Capabilities & Feature Highlights Section
 * Focuses strictly on implemented Stockora administrative modules.
 */
export function renderAdminFeatures() {
  const capabilities = [
    {
      id: "products",
      icon: "package",
      title: "Product Management",
      badge: "PIM Catalog",
      description: "Centralized Product Information Management. Maintain unified SKU records, category classifications, cost prices, retail prices, and barcode identifiers.",
      bulletPoints: [
        "Structured SKU & barcode indexing",
        "Dynamic cost vs. retail pricing models",
        "Category taxonomies & supplier linkage"
      ]
    },
    {
      id: "inventory",
      icon: "boxes",
      title: "Inventory Control",
      badge: "Stock Balances",
      description: "Real-time stock accounting across all distribution nodes. Distinguish between on-hand inventory, customer reservations, and net available stock.",
      bulletPoints: [
        "Real-time available vs. reserved math",
        "Audited cycle count reconciliation",
        "Automated deficit calculations"
      ]
    },
    {
      id: "warehouses",
      icon: "warehouse",
      title: "Warehouse Management",
      badge: "Multi-Facility",
      description: "Full visibility across regional warehouses. Organize spatial bin locations (zones, aisles, shelves) and orchestrate inter-facility stock transfers.",
      bulletPoints: [
        "Multi-hub capacity utilization metrics",
        "Zone, aisle, and bin spatial coordinates",
        "Cross-warehouse stock transfer tracking"
      ]
    },
    {
      id: "orders",
      icon: "shopping-cart",
      title: "Order Management",
      badge: "Fulfillment Pipeline",
      description: "Track customer order progression through an interactive fulfillment pipeline. Manage orders from pending verification to picking, packing, and dispatch.",
      bulletPoints: [
        "5-stage order status workflow",
        "Stock allocation verification",
        "Printable packing slip generation"
      ]
    },
    {
      id: "suppliers",
      icon: "building-2",
      title: "Supplier Management",
      badge: "Vendor Directory",
      description: "Maintain primary and secondary supplier directories. Track supplier lead times, minimum order quantities (MOQ), and contact representatives.",
      bulletPoints: [
        "Vendor profiles & contact directories",
        "Expected supply replenishment lead times",
        "Primary SKU sourcing relationships"
      ]
    },
    {
      id: "purchasing",
      icon: "truck",
      title: "Purchase & Restocking",
      badge: "Procurement & GRN",
      description: "Prevent stockouts with automated replenishment workflows. Generate supplier Purchase Orders (PO) and log Goods Received Notes (GRN) upon receipt.",
      bulletPoints: [
        "Automated reorder point triggers",
        "Purchase Order lifecycle management",
        "Warehouse receiving & stock incrementation"
      ]
    },
    {
      id: "analytics",
      icon: "bar-chart-3",
      title: "Analytics & Reporting",
      badge: "Decision Intelligence",
      description: "Monitor inventory valuation across FIFO, LIFO, and Weighted Average Cost (WAC) models. Analyze order volume patterns and stock turnover velocity.",
      bulletPoints: [
        "Inventory cost vs. retail valuation",
        "Sales revenue trajectories & order volume",
        "Stock velocity & turnover health"
      ]
    },
    {
      id: "alerts",
      icon: "bell-ring",
      title: "Automated Alerts & Audit",
      badge: "Security & Ops",
      description: "Identify operational anomalies immediately. Receive proactive low-stock alerts, warehouse capacity thresholds, and an immutable cryptographic audit ledger.",
      bulletPoints: [
        "Immediate low-stock & stockout triggers",
        "Facility capacity warning notifications",
        "Complete user operation audit trail"
      ]
    }
  ];

  return `
    <section class="landing-features-section" id="features">
      <div class="landing-container">
        
        <!-- Section Header -->
        <div class="section-heading-center">
          <div class="section-tag-pill">ADMINISTRATIVE CAPABILITIES</div>
          <h2 class="section-title">Everything your inventory team needs to stay in control.</h2>
          <p class="section-description">
            A comprehensive operational toolkit built specifically for inventory controllers, warehouse supervisors, and retail supply chain administrators.
          </p>
        </div>

        <!-- Capability Cards Grid -->
        <div class="features-grid">
          ${capabilities
            .map(
              (cap) => `
            <div class="feature-card" id="feature-card-${cap.id}">
              <div class="feature-card-header">
                <div class="feature-icon-box">
                  <i data-lucide="${cap.icon}"></i>
                </div>
                <span class="feature-badge">${cap.badge}</span>
              </div>

              <h3 class="feature-title">${cap.title}</h3>
              <p class="feature-description">${cap.description}</p>

              <ul class="feature-bullets-list">
                ${cap.bulletPoints
                  .map(
                    (bp) => `
                  <li>
                    <i data-lucide="check" class="bullet-check"></i>
                    <span>${bp}</span>
                  </li>
                `
                  )
                  .join("")}
              </ul>
            </div>
          `
            )
            .join("")}
        </div>

      </div>
    </section>
  `;
}
