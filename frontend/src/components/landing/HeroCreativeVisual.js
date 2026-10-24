/**
 * Modern Creative Visual Centerpiece for Stockora Homepage Hero
 * Replaces generic dashboard screenshots with an immersive, high-tech supply chain ecosystem:
 * - 3D Autonomous Multi-Warehouse & Real-Time Inventory Telemetry
 * - Interactive floating glassmorphic telemetry cards
 * - Live ACID concurrency and cryptographic audit state indicators
 */
export function renderHeroCreativeVisual() {
  return `
    <div class="creative-hero-visual-container" id="hero-creative-stage">
      
      <!-- Outer Ambient Glow Backdrop -->
      <div class="hero-glow-backdrop" aria-hidden="true"></div>

      <!-- Main Visual Showcase Frame -->
      <div class="creative-showcase-frame">
        
        <!-- Showcase Header Bar -->
        <div class="showcase-header-bar">
          <div class="showcase-status-badge">
            <span class="status-pulse-dot"></span>
            <span class="status-text">STOCKORA TELEMETRY ENGINE &bull; ACTIVE SUPPLY CHAIN MESH</span>
          </div>
          <div class="showcase-meta-tags">
            <span class="meta-tag"><i data-lucide="database"></i> PostgreSQL ACID Synced</span>
            <span class="meta-tag"><i data-lucide="shield-check"></i> SHA-256 Tamper-Evident</span>
          </div>
        </div>

        <!-- Central High-Impact 3D Ecosystem Artwork -->
        <div class="showcase-image-wrapper">
          <img 
            src="/stockora-hero-visual.jpg" 
            alt="Stockora Autonomous Supply Chain & Central Inventory Core Architecture" 
            class="creative-hero-image"
            loading="eager"
          />

          <!-- Floating Interactive Glassmorphic Telemetry Overlays -->
          
          <!-- Node 1: Spatial Multi-Warehouse Hub (Top Left) -->
          <div class="telemetry-glass-card node-warehouse" id="telemetry-node-wh">
            <div class="glass-card-header">
              <div class="card-icon-wrap icon-warehouse">
                <i data-lucide="warehouse"></i>
              </div>
              <div>
                <span class="glass-label">MULTI-WAREHOUSE SPATIAL MESH</span>
                <span class="glass-val">4 Regional Hubs &bull; Automated Bin Routing</span>
              </div>
            </div>
            <div class="glass-metric-row">
              <span class="pill-metric font-mono">MUM (78%)</span>
              <span class="pill-metric font-mono">DEL (64%)</span>
              <span class="pill-metric font-mono">BLR (82%)</span>
            </div>
          </div>

          <!-- Node 2: Predictive Procurement Radar (Top Right) -->
          <div class="telemetry-glass-card node-procurement" id="telemetry-node-po">
            <div class="glass-card-header">
              <div class="card-icon-wrap icon-procurement">
                <i data-lucide="truck"></i>
              </div>
              <div>
                <span class="glass-label">PREDICTIVE REPLENISHMENT RADAR</span>
                <span class="glass-val">Autonomous Purchase Orders &bull; Apex Electronics</span>
              </div>
            </div>
            <div class="glass-metric-row">
              <span class="badge badge-success text-xxs font-mono">50 Units Inbound</span>
              <span class="badge badge-subtle text-xxs font-mono">Zero Stockout Guard</span>
            </div>
          </div>

          <!-- Node 3: Omnichannel Fulfillment Stream (Bottom Left) -->
          <div class="telemetry-glass-card node-fulfillment" id="telemetry-node-orders">
            <div class="glass-card-header">
              <div class="card-icon-wrap icon-fulfillment">
                <i data-lucide="shopping-cart"></i>
              </div>
              <div>
                <span class="glass-label">OMNICHANNEL FULFILLMENT STREAM</span>
                <span class="glass-val">Order SO-0001 &bull; Sub-Second Stock Lock</span>
              </div>
            </div>
            <div class="glass-metric-row">
              <span class="badge badge-primary text-xxs font-mono">2.4ms ACID Settlement</span>
              <span class="badge badge-subtle text-xxs font-mono">Wave Pick Dispatched</span>
            </div>
          </div>

          <!-- Node 4: Cryptographic Audit Ledger (Bottom Right) -->
          <div class="telemetry-glass-card node-audit" id="telemetry-node-audit">
            <div class="glass-card-header">
              <div class="card-icon-wrap icon-audit">
                <i data-lucide="shield-check"></i>
              </div>
              <div>
                <span class="glass-label">IMMUTABLE CRYPTOGRAPHIC LEDGER</span>
                <span class="glass-val">Tamper-Evident SHA-256 &bull; Tx SEQ #10492</span>
              </div>
            </div>
            <div class="glass-metric-row">
              <span class="badge badge-success text-xxs font-mono">VERIFIED</span>
              <span class="badge badge-subtle text-xxs font-mono">Zero-Drift Accounting</span>
            </div>
          </div>

          <!-- Center Live Asset Ticker Badge -->
          <div class="telemetry-floating-pill center-asset-pill">
            <span class="asset-pulse"></span>
            <span class="asset-title">Live Inventory Valuation:</span>
            <span class="asset-number font-mono">$307,980.00</span>
            <span class="asset-tag font-mono">&bull; 36 Active SKUs</span>
          </div>

        </div>

        <!-- Showcase Footer Details Strip -->
        <div class="showcase-footer-strip">
          <div class="footer-feature-item">
            <i data-lucide="cpu" class="footer-feat-icon"></i>
            <span>Centralized State Machine</span>
          </div>
          <div class="footer-feature-item">
            <i data-lucide="boxes" class="footer-feat-icon"></i>
            <span>Real-Time Available vs. Reserved</span>
          </div>
          <div class="footer-feature-item">
            <i data-lucide="layers" class="footer-feat-icon"></i>
            <span>Spatial Bin-Level Tracking</span>
          </div>
          <div class="footer-feature-item">
            <i data-lucide="file-check-2" class="footer-feat-icon"></i>
            <span>Audited Chain of Custody</span>
          </div>
        </div>

      </div>

    </div>
  `;
}
