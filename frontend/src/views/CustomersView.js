import { store } from "../state/store.js";
import { toast } from "../components/toast/Toast.js";

let customerSearchText = "";
let channelFilter = "All";

/**
 * Enterprise Customers Module
 */
export function renderCustomersView() {
  const customers = store.getCustomers ? store.getCustomers() : [];
  const salesOrders = store.getSalesOrders ? store.getSalesOrders() : [];

  // Metrics
  const totalCustomers = customers.length;
  const totalOrders = salesOrders.length;
  const totalRevenue = salesOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Filter
  const filtered = customers.filter((c) => {
    if (channelFilter !== "All" && c.channel !== channelFilter) return false;
    if (customerSearchText.trim()) {
      const q = customerSearchText.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchEmail = c.email.toLowerCase().includes(q);
      const matchCity = (c.city || "").toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchCity) return false;
    }
    return true;
  });

  return `
    <div class="view-container animate-fade-in" id="customers-view-root">
      <!-- Semantic Header -->
      <header class="view-header flex-between flex-wrap gap-sm">
        <div>
          <h1 class="view-title">Customer Master Directory & Accounts</h1>
          <p class="view-subtitle">Customer accounts, order history, lifetime spend, and channel origins across retail touchpoints</p>
        </div>
      </header>

      <!-- Semantic KPI Summary -->
      <section class="stats-grid" aria-label="Customer Directory Performance Metrics">
        <article class="stat-card" role="region" aria-label="Total Registered Customers">
          <header class="stat-card-header flex-between">
            <h2 class="stat-label">Total Registered Customers</h2>
            <div class="stat-icon-wrap icon-primary" aria-hidden="true"><i data-lucide="users"></i></div>
          </header>
          <p class="stat-value font-mono">${totalCustomers}</p>
          <footer class="stat-trend text-muted text-xxs">Verified profiles in database</footer>
        </article>

        <article class="stat-card" role="region" aria-label="Total Omnichannel Orders">
          <header class="stat-card-header flex-between">
            <h2 class="stat-label">Total Omnichannel Orders</h2>
            <div class="stat-icon-wrap icon-warning" aria-hidden="true"><i data-lucide="shopping-bag"></i></div>
          </header>
          <p class="stat-value font-mono" style="color: var(--color-warning);">${totalOrders}</p>
          <footer class="stat-trend text-warning text-xxs font-semibold">Storefront & B2B orders</footer>
        </article>

        <article class="stat-card" role="region" aria-label="Average Order Value">
          <header class="stat-card-header flex-between">
            <h2 class="stat-label">Average Order Value (AOV)</h2>
            <div class="stat-icon-wrap icon-success" aria-hidden="true"><i data-lucide="trending-up"></i></div>
          </header>
          <p class="stat-value font-mono" style="color: var(--color-success);">$${aov.toFixed(2)}</p>
          <footer class="stat-trend text-success text-xxs font-semibold">Calculated from ledger</footer>
        </article>

        <article class="stat-card" role="region" aria-label="Gross Customer Spend">
          <header class="stat-card-header flex-between">
            <h2 class="stat-label">Gross Customer Spend</h2>
            <div class="stat-icon-wrap icon-accent" aria-hidden="true"><i data-lucide="dollar-sign"></i></div>
          </header>
          <p class="stat-value font-mono">$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <footer class="stat-trend text-muted text-xxs">Cumulative sales volume</footer>
        </article>
      </section>

      <!-- Semantic Controls Toolbar -->
      <nav class="toolbar-card flex-between flex-wrap gap-sm" aria-label="Customer Search and Channel Filters">
        <div class="search-input-wrapper" style="flex: 1; max-width: 380px;">
          <i data-lucide="search" class="search-icon" aria-hidden="true"></i>
          <label for="customer-search-input" class="sr-only">Search Customers</label>
          <input type="search" id="customer-search-input" placeholder="Search by customer name, email, or city..." value="${customerSearchText}" />
        </div>

        <fieldset class="filter-chips" role="group" aria-label="Filter by Sales Channel">
          ${["All", "Stockora Storefront Web", "B2B Wholesale", "Retail POS Storefront"]
            .map(
              (ch) => `
            <button type="button" class="chip-btn ${channelFilter === ch ? "active" : ""}" data-channel="${ch}" aria-pressed="${channelFilter === ch}">
              ${ch}
            </button>
          `
            )
            .join("")}
        </fieldset>
      </nav>

      <!-- Semantic Table Card -->
      <section class="content-card" aria-label="Customer Master Registry">
        <header class="card-header flex-between">
          <div class="flex-align-center gap-xs">
            <i data-lucide="user-check" class="text-primary" aria-hidden="true"></i>
            <h2 class="card-title">Customer Master Registry</h2>
          </div>
          <span class="badge badge-subtle font-mono">${filtered.length} Customers</span>
        </header>

        <div class="table-responsive">
          <table class="data-table" role="table">
            <thead>
              <tr>
                <th scope="col">Customer ID</th>
                <th scope="col">Name & Contact</th>
                <th scope="col">Phone & City</th>
                <th scope="col">Channel Origin</th>
                <th scope="col" class="text-center">Total Orders</th>
                <th scope="col" class="text-right">Lifetime Spend</th>
                <th scope="col">Last Order</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                filtered.length === 0
                  ? `
                <tr>
                  <td colspan="8" class="text-center" style="padding: 40px;">
                    <div class="empty-state-box">
                      <i data-lucide="user-x" style="width: 32px; height: 32px; color: var(--text-muted); margin-bottom: 8px;"></i>
                      <div class="font-semibold text-sm">No Customers Found</div>
                      <div class="text-xs text-muted">No accounts match the current search or channel filter.</div>
                    </div>
                  </td>
                </tr>
              `
                  : filtered
                      .map((cust) => {
                        const initials = cust.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2);

                        return `
                      <tr>
                        <td class="font-mono font-bold text-xs">${cust.id}</td>
                        <td>
                          <div class="flex-align-center gap-sm">
                            <span class="user-avatar-initials text-xxs" style="width: 28px; height: 28px; font-size: 0.7rem;">${initials}</span>
                            <div>
                              <div class="font-semibold text-xs text-main">${cust.name}</div>
                              <div class="text-xxs text-muted font-mono">${cust.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="text-xs">${cust.city}</div>
                          <div class="text-xxs text-muted font-mono">${cust.phone}</div>
                        </td>
                        <td>
                          <span class="badge badge-subtle text-xxs font-mono">${cust.channel}</span>
                        </td>
                        <td class="text-center font-mono font-bold text-xs">
                          ${cust.ordersCount}
                        </td>
                        <td class="text-right font-mono font-bold text-xs text-success">
                          $${cust.totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td class="text-xs text-muted font-mono">
                          ${cust.lastOrderDate}
                        </td>
                        <td>
                          <span class="badge badge-success text-xxs font-bold">${cust.status}</span>
                        </td>
                      </tr>
                    `;
                      })
                      .join("")
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

export function setupCustomersEvents(renderApp) {
  const root = document.getElementById("customers-view-root");
  if (!root) return;

  const searchInput = root.querySelector("#customer-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      customerSearchText = e.target.value;
      renderApp();
    });
  }

  root.querySelectorAll(".chip-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      channelFilter = btn.dataset.channel;
      renderApp();
    });
  });
}
