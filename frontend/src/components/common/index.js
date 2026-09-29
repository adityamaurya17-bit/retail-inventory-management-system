/**
 * Shared UI Primitives and Formatting Helpers
 */

export function renderBadge(text, variant = "info", extraClasses = "") {
  return `<span class="badge badge-${variant} ${extraClasses}">${text}</span>`;
}

export function renderStatusBadge(status) {
  const s = (status || "").toLowerCase();
  let variant = "neutral";
  if (["active", "delivered", "in stock", "connected", "verified", "passed"].includes(s)) {
    variant = "success";
  } else if (["pending", "processing", "low stock", "in-transit", "warning"].includes(s)) {
    variant = "warning";
  } else if (["out of stock", "cancelled", "failed", "critical", "danger"].includes(s)) {
    variant = "danger";
  } else if (["dispatched", "shipped", "info"].includes(s)) {
    variant = "info";
  }
  return `<span class="badge badge-${variant}">${status}</span>`;
}

export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
}

export function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return String(dateString);
  }
}
