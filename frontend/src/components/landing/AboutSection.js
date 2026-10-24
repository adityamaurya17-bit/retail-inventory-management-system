/**
 * About Section — Honest Academic Capstone Positioning
 * Accurately describes the Stockora project, architecture, and objectives.
 */
export function renderAboutSection() {
  return `
    <section class="landing-about-section" id="about">
      <div class="landing-container">
        
        <div class="about-card">
          <div class="about-grid">
            
            <!-- Left Narrative Column -->
            <div class="about-text-column">
              <div class="section-tag-pill">ACADEMIC CAPSTONE INITIATIVE</div>
              <h2 class="about-heading">Built for centralized retail administration.</h2>
              
              <p class="about-paragraph">
                Stockora is a web-based Retail Inventory Management System designed to centralize inventory and operational management for administrators. Developed as an academic capstone engineering project, it addresses the core operational challenges faced by multi-facility retailers.
              </p>

              <p class="about-paragraph">
                Rather than treating inventory as a simple numeric count, Stockora models real-world supply chain mechanics: spatial bin allocations, automated reorder thresholds, inter-facility transfer manifests, multi-stage order fulfillment pipelines, and immutable cryptographic ledger audits.
              </p>

              <div class="about-spec-badges">
                <div class="spec-badge">
                  <i data-lucide="server"></i>
                  <span>Node.js & Express API</span>
                </div>
                <div class="spec-badge">
                  <i data-lucide="database"></i>
                  <span>PostgreSQL 18.6 Storage</span>
                </div>
                <div class="spec-badge">
                  <i data-lucide="code"></i>
                  <span>Vanilla ES Modules SPA</span>
                </div>
                <div class="spec-badge">
                  <i data-lucide="cpu"></i>
                  <span>Real-Time In-Memory Cache</span>
                </div>
              </div>
            </div>

            <!-- Right Architectural Highlights Box -->
            <div class="about-highlights-column">
              <div class="highlights-panel">
                <h3 class="highlights-title">Engineering Highlights</h3>
                
                <div class="highlight-item">
                  <div class="highlight-icon"><i data-lucide="layers"></i></div>
                  <div class="highlight-body">
                    <span class="hl-name">Clean Hexagonal & C4 Architecture</span>
                    <span class="hl-desc">Strict separation between public landing entrypoints, authentication barriers, and protected enterprise domain services.</span>
                  </div>
                </div>

                <div class="highlight-item">
                  <div class="highlight-icon"><i data-lucide="calculator"></i></div>
                  <div class="highlight-body">
                    <span class="hl-name">Deterministic Inventory Math</span>
                    <span class="hl-desc">Deficit and reorder algorithms verify that allocated stock cannot exceed physically verified on-hand counts.</span>
                  </div>
                </div>

                <div class="highlight-item">
                  <div class="highlight-icon"><i data-lucide="shield-alert"></i></div>
                  <div class="highlight-body">
                    <span class="hl-name">Enterprise Audit Logging</span>
                    <span class="hl-desc">Every administrative adjustment, cycle count modification, and status change is logged into a queryable ledger.</span>
                  </div>
                </div>

                <div class="highlight-item">
                  <div class="highlight-icon"><i data-lucide="user-check"></i></div>
                  <div class="highlight-body">
                    <span class="hl-name">Role-Based Access Control</span>
                    <span class="hl-desc">Granular authorization boundaries ensuring sensitive warehouse configurations remain protected behind administrative credentials.</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  `;
}
