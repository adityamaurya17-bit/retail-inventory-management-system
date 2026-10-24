import { renderHeroCreativeVisual } from "./HeroCreativeVisual.js";

/**
 * Public Landing Hero Section
 * Communicates centralized administrator inventory control with product visual preview.
 */
export function renderLandingHero() {
  return `
    <section class="landing-hero-section" id="hero">
      <div class="landing-container">
        
        <!-- Hero Text & Value Proposition -->
        <div class="hero-content-wrapper">
          
          <!-- Eyebrow Pill -->
          <div class="hero-eyebrow-badge">
            <span class="eyebrow-dot"></span>
            <span class="eyebrow-text">ADMINISTRATIVE INVENTORY CONTROL</span>
          </div>

          <!-- Main Value Headline -->
          <h1 class="hero-headline">
            Run your inventory operations from one place.
          </h1>

          <!-- Descriptive Subtitle -->
          <p class="hero-subtitle">
            Stockora helps administrators manage products, warehouses, stock, orders, suppliers and purchasing through a unified inventory management system.
          </p>

          <!-- Action CTAs -->
          <div class="hero-cta-group">
            <button type="button" class="btn btn-primary btn-lg hero-btn-login" id="btn-hero-admin-login" aria-label="Enter Stockora Administrator Workspace">
              <i data-lucide="shield-check" aria-hidden="true"></i>
              <span>Enter Workspace</span>
            </button>
            <a href="#features" class="btn btn-secondary btn-lg hero-btn-explore" id="btn-hero-explore">
              <i data-lucide="layers"></i>
              <span>Explore Features</span>
            </a>
          </div>

          <!-- Trust Badges & System Architecture Highlights -->
          <div class="hero-meta-indicators">
            <div class="meta-indicator-item">
              <i data-lucide="check-circle" class="meta-icon"></i>
              <span>Multi-Warehouse Tracking</span>
            </div>
            <div class="meta-indicator-item">
              <i data-lucide="check-circle" class="meta-icon"></i>
              <span>FIFO / WAC Stock Valuation</span>
            </div>
            <div class="meta-indicator-item">
              <i data-lucide="check-circle" class="meta-icon"></i>
              <span>Automated Reorder Alerts</span>
            </div>
            <div class="meta-indicator-item">
              <i data-lucide="check-circle" class="meta-icon"></i>
              <span>Audit Trail Integrity</span>
            </div>
          </div>

        </div>

        <!-- Hero Visual Product Frame -->
        <div class="hero-visual-wrapper">
          ${renderHeroCreativeVisual()}
        </div>

      </div>
    </section>
  `;
}
