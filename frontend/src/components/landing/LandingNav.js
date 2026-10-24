import { store } from "../../state/store.js";

/**
 * Public Landing Navigation Bar
 * Features brand identity, anchor links, and primary Admin Login CTA.
 */
export function renderLandingNav() {
  const isAuth = store.isAuthenticated();
  const currentUser = store.getCurrentUser();

  return `
    <header class="public-nav-header" id="public-nav-header">
      <div class="public-nav-container">
        
        <!-- Brand Identity (Left) -->
        <a href="#home" class="public-nav-brand" aria-label="Stockora Home">
          <div class="public-brand-icon-wrap">
            <img src="/stockora-icon.png" alt="Stockora" class="public-brand-icon" />
          </div>
          <div class="public-brand-text">
            <span class="public-brand-name">STOCK<span class="public-brand-accent">ORA</span></span>
          </div>
        </a>

        <!-- Desktop Navigation Links (Center) -->
        <nav class="public-nav-links" id="public-desktop-nav" aria-label="Main Navigation">
          <a href="#home" class="public-nav-link active" data-nav-section="home">Overview</a>
          <a href="#features" class="public-nav-link" data-nav-section="features">Features</a>
          <a href="#how-it-works" class="public-nav-link" data-nav-section="how-it-works">How It Works</a>
          <a href="#contact" class="public-nav-link" data-nav-section="contact">Contact</a>
        </nav>

        <!-- Primary Action CTA (Right) -->
        <div class="public-nav-actions">
          ${
            isAuth
              ? `
              <a href="#dashboard" class="btn btn-primary btn-sm public-cta-btn" id="btn-nav-dashboard" title="Open authenticated administrator dashboard">
                <span>Go to Dashboard</span>
                <i data-lucide="arrow-right" class="btn-icon-right"></i>
              </a>
            `
              : `
              <button type="button" class="btn btn-primary btn-sm public-cta-btn" id="btn-nav-admin-login" aria-label="Sign in to Administrator Workspace" title="Sign in with administrator credentials">
                <i data-lucide="shield-check" class="btn-icon-left" aria-hidden="true"></i>
                <span>Admin Login</span>
              </button>
            `
          }

          <!-- Mobile Menu Hamburger Button -->
          <button type="button" class="btn-icon public-mobile-menu-btn" id="btn-public-mobile-menu" aria-label="Toggle navigation menu" aria-expanded="false">
            <i data-lucide="menu" id="public-menu-icon"></i>
          </button>
        </div>

      </div>

      <!-- Mobile Navigation Drawer -->
      <div class="public-mobile-drawer" id="public-mobile-drawer">
        <nav class="public-mobile-links" aria-label="Mobile Navigation">
          <a href="#home" class="public-mobile-link" data-nav-section="home">
            <i data-lucide="home"></i>
            <span>Overview</span>
          </a>
          <a href="#features" class="public-mobile-link" data-nav-section="features">
            <i data-lucide="layers"></i>
            <span>Features</span>
          </a>
          <a href="#how-it-works" class="public-mobile-link" data-nav-section="how-it-works">
            <i data-lucide="workflow"></i>
            <span>How It Works</span>
          </a>
          <a href="#contact" class="public-mobile-link" data-nav-section="contact">
            <i data-lucide="mail"></i>
            <span>Contact</span>
          </a>
        </nav>
        
        <div class="public-mobile-drawer-footer">
          ${
            isAuth
              ? `
              <a href="#dashboard" class="btn btn-primary btn-block" id="btn-mobile-nav-dashboard">
                <span>Go to Dashboard</span>
                <i data-lucide="arrow-right"></i>
              </a>
            `
              : `
              <button type="button" class="btn btn-primary btn-block" id="btn-mobile-nav-login" aria-label="Sign in to Administrator Workspace">
                <i data-lucide="shield-check" aria-hidden="true"></i>
                <span>Admin Login</span>
              </button>
            `
          }
        </div>
      </div>
    </header>
  `;
}
