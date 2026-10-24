/**
 * Admin-Centric Operational Workflow Section
 * Explains how an administrator uses Stockora daily: setup to fulfillment and insights.
 */
export function renderAdminWorkflow() {
  const steps = [
    {
      num: "01",
      title: "Set up product catalog",
      icon: "package-plus",
      description: "Define SKUs, category taxonomies, unit cost price, selling price, and baseline reorder points."
    },
    {
      num: "02",
      title: "Organize warehouse facilities",
      icon: "map-pin",
      description: "Assign stock across regional distribution centers and designate zones, aisles, and spatial bin locations."
    },
    {
      num: "03",
      title: "Monitor inventory balances",
      icon: "activity",
      description: "Track available vs. reserved units in real time with automated alerts whenever stock dips below safety thresholds."
    },
    {
      num: "04",
      title: "Process order fulfillment",
      icon: "check-square",
      description: "Progress customer orders through verification, warehouse picking, packing, and carrier dispatch."
    },
    {
      num: "05",
      title: "Procure supplier replenishment",
      icon: "truck",
      description: "Issue vendor Purchase Orders when items trigger deficits and log inbound Goods Received Notes (GRN)."
    },
    {
      num: "06",
      title: "Analyze operations & audit trail",
      icon: "line-chart",
      description: "Review FIFO/WAC valuation summaries, warehouse utilization, and verify immutable operator ledger logs."
    }
  ];

  return `
    <section class="landing-workflow-section" id="how-it-works">
      <div class="landing-container">
        
        <!-- Section Header -->
        <div class="section-heading-center">
          <div class="section-tag-pill">OPERATIONAL CADENCE</div>
          <h2 class="section-title">From inventory setup to daily operations</h2>
          <p class="section-description">
            Stockora connects every phase of retail inventory management into a single, cohesive workflow for administrators.
          </p>
        </div>

        <!-- Workflow Steps Pipeline -->
        <div class="workflow-steps-grid">
          ${steps
            .map(
              (step, idx) => `
            <div class="workflow-step-card">
              <div class="step-card-top">
                <span class="step-badge-number">${step.num}</span>
                <div class="step-icon-wrap">
                  <i data-lucide="${step.icon}"></i>
                </div>
              </div>
              <h3 class="step-title">${step.title}</h3>
              <p class="step-description">${step.description}</p>
              ${
                idx < steps.length - 1
                  ? `<div class="step-connector-arrow" aria-hidden="true"><i data-lucide="arrow-right"></i></div>`
                  : ""
              }
            </div>
          `
            )
            .join("")}
        </div>

      </div>
    </section>
  `;
}
