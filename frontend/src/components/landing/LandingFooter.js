/**
 * Public Landing Footer Component
 * Professional, minimal, and transparent academic footer.
 */
export function renderLandingFooter() {
  return `
    <footer class="public-landing-footer">
      <div class="landing-container">
        
        <div class="footer-grid-layout">
          
          <!-- Brand & Project Description Column -->
          <div class="footer-brand-column">
            <div class="footer-brand-title">
              <img src="/stockora-icon.png" alt="Stockora" class="footer-brand-icon" />
              <span class="footer-brand-name">STOCK<span class="brand-accent">ORA</span></span>
            </div>
            <p class="footer-tagline">
              Retail Inventory Management System &bull; Unified Administrative Platform
            </p>
            <p class="footer-academic-context">
              Unified retail inventory management platform engineering multi-warehouse tracking, deterministic reorder calculations, and immutable audit ledgers.
            </p>
          </div>

          <!-- Quick Navigation Links Column -->
          <div class="footer-nav-column">
            <h4 class="footer-column-title">Platform Navigation</h4>
            <ul class="footer-links-list">
              <li><a href="#home" class="footer-link">System Overview</a></li>
              <li><a href="#features" class="footer-link">Administrative Capabilities</a></li>
              <li><a href="#how-it-works" class="footer-link">Operational Workflow</a></li>
              <li><a href="#contact" class="footer-link">Contact</a></li>
            </ul>
          </div>

          <!-- Administrative Operations Column -->
          <div class="footer-nav-column">
            <h4 class="footer-column-title">Administrative Access</h4>
            <ul class="footer-links-list">
              <li>
                <a href="#login" class="footer-link footer-link-admin" id="footer-link-login" aria-label="Sign in to Administrator Portal">
                  <i data-lucide="shield-check" class="footer-icon" aria-hidden="true"></i>
                  <span>Admin Portal Sign In</span>
                </a>
              </li>
              <li>
                <span class="footer-spec-text">Standard Session: PBKDF2 / SHA-256 Auth</span>
              </li>
              <li>
                <span class="footer-spec-text">Persistent Session: Remember Me Support</span>
              </li>
              <li>
                <span class="footer-spec-text">Database: PostgreSQL 18.6 Verified</span>
              </li>
            </ul>
          </div>

        </div>

        <!-- Bottom Copyright Row -->
        <div class="footer-bottom-bar">
          <div class="footer-copy-text">
            &copy; 2026 Stockora &bull; Developed by Aditya Maurya. All rights reserved.
          </div>
          <div class="footer-arch-badges">
            <span class="footer-badge">Node.js Express</span>
            <span class="footer-badge">PostgreSQL</span>
            <span class="footer-badge">Vite SPA</span>
          </div>
        </div>

      </div>
    </footer>
  `;
}
