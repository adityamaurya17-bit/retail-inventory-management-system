/**
 * Stylized Product-Oriented Visual Preview of Stockora Admin Console
 * Showcases the latest production-grade UI progress:
 * - Centralized Stockora fixed header with search & administrator profile
 * - Real enterprise inventory valuation, SKU counts, and order throughput
 * - Tabular System Audit & Operations Ledger with live ACID integrity verification
 * - Automated reorder radar and multi-facility warehouse capacity tracks
 */
export function renderDashboardPreview() {
  return `
    <div class="preview-window-frame" aria-hidden="true">
      <!-- Window Titlebar -->
      <div class="preview-titlebar">
        <div class="window-controls">
          <span class="control-dot dot-close"></span>
          <span class="control-dot dot-minimize"></span>
          <span class="control-dot dot-expand"></span>
        </div>
        <div class="preview-window-title">
          <i data-lucide="shield" class="preview-title-icon"></i>
          <span>Stockora Console &bull; Centralized Operations</span>
        </div>
        <div class="preview-window-status">
          <span class="status-indicator-live"></span>
          <span>Simulation Preview</span>
        </div>
      </div>

      <!-- App Interface Representation -->
      <div class="preview-interface-layout">
        
        <!-- Mock Mini Sidebar -->
        <aside class="preview-mini-sidebar">
          <div class="mini-brand-mark">
            <img src="/stockora-icon.png" alt="" class="mini-logo-icon" />
          </div>
          <div class="mini-nav-icons">
            <div class="mini-icon active" title="Dashboard"><i data-lucide="layout-dashboard"></i></div>
            <div class="mini-icon" title="Products"><i data-lucide="package"></i></div>
            <div class="mini-icon" title="Inventory"><i data-lucide="boxes"></i></div>
            <div class="mini-icon" title="Warehouses"><i data-lucide="warehouse"></i></div>
            <div class="mini-icon" title="Orders"><i data-lucide="shopping-cart"></i></div>
            <div class="mini-icon" title="Suppliers"><i data-lucide="truck"></i></div>
            <div class="mini-icon" title="Transfers"><i data-lucide="arrow-left-right"></i></div>
          </div>
        </aside>

        <!-- Mock Central Viewport -->
        <main class="preview-main-canvas">
          
          <!-- Mock Top Navigation Header -->
          <div class="preview-mock-header">
            <div class="preview-breadcrumbs">
              <span class="crumb-root">Operations Hub</span>
              <span class="crumb-separator">/</span>
              <span class="crumb-current">Enterprise Executive Overview</span>
            </div>

            <!-- Mini Global Search Preview -->
            <div class="preview-mini-search">
              <i data-lucide="search" class="preview-mini-search-icon"></i>
              <span>Search products, orders, bins...</span>
            </div>

            <!-- Cluster Status & Admin User Widget -->
            <div class="preview-header-meta">
              <div class="preview-badge-status">
                <span class="pulse-indicator"></span>
                <span>PostgreSQL Cluster Synced</span>
              </div>
              <div class="preview-user-widget">
                <span class="preview-user-avatar">AM</span>
                <span class="preview-user-name">ADITYA MAURYA</span>
              </div>
            </div>
          </div>

          <!-- Real-World KPI Summary Row -->
          <div class="preview-kpi-grid">
            <div class="preview-kpi-card">
              <span class="kpi-label">Asset Valuation</span>
              <span class="kpi-value font-mono">$307,980</span>
              <span class="kpi-trend trend-up">
                <i data-lucide="trending-up"></i> +14.2% FIFO Valued
              </span>
            </div>
            <div class="preview-kpi-card">
              <span class="kpi-label">Active SKUs</span>
              <span class="kpi-value font-mono">36</span>
              <span class="kpi-sub">4 Product Categories</span>
            </div>
            <div class="preview-kpi-card">
              <span class="kpi-label">Fulfillment Queue</span>
              <span class="kpi-value font-mono">3 Orders</span>
              <span class="kpi-trend trend-warning">
                <i data-lucide="clock"></i> 1 Awaiting Dispatch
              </span>
            </div>
            <div class="preview-kpi-card">
              <span class="kpi-label">Inventory Health</span>
              <span class="kpi-value font-mono text-success">94.2%</span>
              <span class="kpi-sub">Zero stockouts</span>
            </div>
          </div>

          <!-- Latest UI Progress: Split Grid with Tabular Audit Ledger & Reorder Radar -->
          <div class="preview-split-grid">
            
            <!-- Left Card: Tabular System Audit & Operations Ledger -->
            <div class="preview-content-card preview-audit-card">
              <div class="preview-card-header">
                <div class="preview-card-title-group">
                  <span class="preview-card-title">System Audit &amp; Operations Ledger</span>
                  <span class="badge badge-success text-xxs">LIVE ACID LEDGER</span>
                </div>
                <span class="badge badge-subtle text-xxs font-mono">SHA-256 Verified</span>
              </div>
              
              <!-- Tabular Stream Table -->
              <div class="preview-table-wrap">
                <table class="preview-data-table">
                  <thead>
                    <tr>
                      <th style="width: 80px;">Tx Seq</th>
                      <th style="width: 85px;">Time</th>
                      <th style="width: 130px;">Action Event</th>
                      <th>Mutation Details &amp; Entity References</th>
                      <th style="width: 70px; text-align: center;">Integrity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="font-mono"><span class="audit-tx-chip">#TX-10492</span></td>
                      <td class="font-mono text-muted text-xs">14:22:08</td>
                      <td><span class="badge badge-primary text-xxs"><i data-lucide="shopping-cart"></i> Order Booked</span></td>
                      <td><span class="audit-entity-pill font-mono">SO-0001</span> allocated <span class="audit-entity-pill font-mono">2 units</span> of <span class="audit-entity-pill font-mono">ELEC-NK-ANC</span></td>
                      <td class="text-center"><span class="badge badge-success text-xxs font-mono">OK</span></td>
                    </tr>
                    <tr>
                      <td class="font-mono"><span class="audit-tx-chip">#TX-10491</span></td>
                      <td class="font-mono text-muted text-xs">14:15:30</td>
                      <td><span class="badge badge-success text-xxs"><i data-lucide="check-circle-2"></i> Dock GRN</span></td>
                      <td><span class="audit-entity-pill font-mono">GRN-0002</span> received <span class="audit-entity-pill font-mono">50 units</span> at <span class="audit-entity-pill font-mono">WH-MUM</span></td>
                      <td class="text-center"><span class="badge badge-success text-xxs font-mono">OK</span></td>
                    </tr>
                    <tr>
                      <td class="font-mono"><span class="audit-tx-chip">#TX-10490</span></td>
                      <td class="font-mono text-muted text-xs">13:58:12</td>
                      <td><span class="badge badge-warning text-xxs"><i data-lucide="sliders"></i> Stock Adj</span></td>
                      <td>Cycle count reconciled variance <span class="audit-entity-pill font-mono">+5 units</span> at <span class="audit-entity-pill font-mono">WH-BLR</span></td>
                      <td class="text-center"><span class="badge badge-success text-xxs font-mono">OK</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Right Card: Automated Reorder Monitor & Distribution Facilities -->
            <div class="preview-content-card">
              <div class="preview-card-header">
                <span class="preview-card-title">Automated Reorder Monitor</span>
                <span class="badge badge-warning text-xs">2 Action Items</span>
              </div>

              <div class="preview-alerts-feed">
                <div class="preview-alert-item">
                  <div class="alert-icon-box alert-icon-warning">
                    <i data-lucide="alert-triangle"></i>
                  </div>
                  <div class="alert-info">
                    <span class="alert-name">Sony WH-1000XM5 ANC</span>
                    <span class="alert-sku font-mono">SKU: ELEC-NK-ANC &bull; 8 units left</span>
                  </div>
                  <span class="badge badge-warning text-xxs font-mono">Reorder (Min 15)</span>
                </div>

                <div class="preview-alert-item">
                  <div class="alert-icon-box alert-icon-info">
                    <i data-lucide="truck"></i>
                  </div>
                  <div class="alert-info">
                    <span class="alert-name">Inbound GRN Shipment #PO-0002</span>
                    <span class="alert-sku font-mono">Supplier: Apex Electronics &bull; 50 units</span>
                  </div>
                  <span class="badge badge-info text-xxs font-mono">En Route</span>
                </div>
              </div>

              <!-- Real Regional Warehouses Mini Breakdown -->
              <div class="preview-facilities-list">
                <div class="facility-row">
                  <span class="f-code font-mono">WH-MUM (Mumbai Central DC)</span>
                  <div class="f-track"><div class="f-bar" style="width: 78%;"></div></div>
                  <span class="f-pct font-mono">78%</span>
                </div>
                <div class="facility-row">
                  <span class="f-code font-mono">WH-DEL (Delhi Northern Hub)</span>
                  <div class="f-track"><div class="f-bar" style="width: 64%;"></div></div>
                  <span class="f-pct font-mono">64%</span>
                </div>
                <div class="facility-row">
                  <span class="f-code font-mono">WH-BLR (Bangalore Tech Facility)</span>
                  <div class="f-track"><div class="f-bar" style="width: 82%;"></div></div>
                  <span class="f-pct font-mono">82%</span>
                </div>
              </div>

              <!-- Cryptographic Audit Verified Tag -->
              <div class="preview-audit-footer">
                <i data-lucide="shield-check" class="audit-check-icon"></i>
                <span class="audit-summary-text">Cryptographic Audit Ledger: Tx SEQ #10492 Verified</span>
              </div>
            </div>

          </div>

        </main>

      </div>
    </div>
  `;
}
