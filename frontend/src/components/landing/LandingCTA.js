/**
 * "Login as a Feature" Call to Action Section
 * Prominently presents the Administrator Login entrypoint on the public landing page.
 */
export function renderLandingCTA() {
  return `
    <section class="landing-cta-section" id="admin-access">
      <div class="landing-container">
        
        <div class="cta-banner-card">
          <div class="cta-banner-content">
            <div class="cta-eyebrow">
              <i data-lucide="shield-check" class="cta-shield-icon"></i>
              <span>AUTHENTICATED ACCESS</span>
            </div>

            <h2 class="cta-headline">Ready to manage your inventory?</h2>
            
            <p class="cta-description">
              Access the Stockora administrator workspace and manage your inventory operations from a unified dashboard.
            </p>

            <div class="cta-actions-row">
              <button type="button" class="btn btn-primary btn-lg cta-login-btn" id="btn-cta-admin-login" aria-label="Open Stockora Administrator Console">
                <i data-lucide="log-in" aria-hidden="true"></i>
                <span>Open Admin Console</span>
              </button>
            </div>

            <!-- Demo Reviewer Helper Notice -->
            <div class="cta-reviewer-helper">
              <div class="helper-badge font-mono">Academic Reviewer Mode</div>
              <div class="helper-text">
                <span>Default Admin: <strong>adityamaurya@retailhub.in</strong> &bull; Password: <strong>Password123!</strong></span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  `;
}
