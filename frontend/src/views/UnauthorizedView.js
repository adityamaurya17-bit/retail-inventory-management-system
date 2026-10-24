import { store, ROLES } from "../state/store.js";
import { renderRimsLogoMark } from "../components/brand/RimsLogo.js";

/**
 * Access Restricted / Unauthorized View
 * Displayed when User / Customer attempts to access enterprise operations modules.
 */
export function renderUnauthorizedView(attemptedRoute = "dashboard") {
  const currentUser = store.getCurrentUser ? store.getCurrentUser() : null;

  return `
    <div class="unauthorized-page-root animate-fade-in" style="min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 40px 20px;">
      <div class="unauthorized-card" style="max-width: 620px; width: 100%; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); padding: 40px; text-align: center;">
        
        <div style="margin-bottom: 20px;">
          ${renderRimsLogoMark(44)}
        </div>

        <div class="alert-shield-box" style="width: 64px; height: 64px; margin: 0 auto 20px; background: rgba(239, 68, 68, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #dc2626;">
          <i data-lucide="shield-alert" style="width: 32px; height: 32px;"></i>
        </div>

        <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">
          Enterprise Authorization Required
        </h2>

        <p class="text-sm text-muted" style="line-height: 1.6; margin-bottom: 24px;">
          You are currently signed in as <strong>${currentUser?.name || "Shopper"}</strong> with the <strong>${currentUser?.role || ROLES.USER}</strong> role.
          The requested management module (<code>#${attemptedRoute}</code>) is restricted to <strong>${ROLES.WAREHOUSE_INVENTORY}</strong> personnel.
        </p>

        <div style="background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 16px; margin-bottom: 28px; text-align: left;">
          <div class="font-semibold text-xs text-main" style="margin-bottom: 6px;">
            <i data-lucide="info" class="inline-icon text-accent"></i> Role & Module Separation Notice:
          </div>
          <p class="text-xs text-muted" style="margin: 0;">
            Stockora strictly enforces separation of concerns:
            <br>&bull; <strong>User / Customer:</strong> Access to product browsing, cart, checkout, orders, and wishlist.
            <br>&bull; <strong>Warehouse & Inventory Management:</strong> Access to stock balances, fulfillment, warehouses, and suppliers.
          </p>
        </div>

        <div class="flex-center gap-sm flex-wrap">
          <a href="#shop" class="btn btn-primary btn-md">
            <i data-lucide="shopping-bag"></i>
            <span>Return to Customer Marketplace</span>
          </a>
          <a href="#login?role=warehouse" class="btn btn-secondary btn-md" id="btn-unauth-switch">
            <i data-lucide="key"></i>
            <span>Sign In with Warehouse & Inventory Role</span>
          </a>
        </div>
      </div>
    </div>
  `;
}

export function setupUnauthorizedViewEvents(onNavigate) {
  const switchBtn = document.getElementById("btn-unauth-switch");
  if (switchBtn) {
    switchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      onNavigate("login?role=warehouse");
    });
  }
}
