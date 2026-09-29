import { store } from "../state/store.js";
import { Chart } from "chart.js/auto";

let activeAgileTab = "sprints"; // "sprints" | "epics" | "metrics" | "architecture" | "charter"
let activeSprintNumber = 15; // default to sprint 15 (capstone finale) or current sprint

export function renderAgileCapstoneView() {
  const agile = store.getAgileCaseStudy();
  const currentSprint = store.getSprint(activeSprintNumber) || agile.sprints[0];
  const linkedEpic = agile.epics.find((e) => e.id === currentSprint.epicId);

  return `
    <div class="view-container animate-fade-in">
      <div class="view-header">
        <div>
          <div class="flex-center gap-xs" style="justify-content: flex-start; margin-bottom: 4px;">
            <span class="badge badge-accent">Agile Capstone Case Study</span>
            <span class="badge badge-subtle">Scrum Framework</span>
          </div>
          <h1 class="view-title">Scrum Delivery Dossier: 8 Epics & 15 Sprints</h1>
          <p class="view-subtitle">Comprehensive Agile software engineering case study, sprint ceremonies, burndown telemetry & architecture blueprints</p>
        </div>
        <div class="header-actions">
          <div class="agile-headline-badge">
            <span class="val font-bold text-accent">185</span>
            <span class="lbl text-xs text-muted">Story Points Delivered</span>
          </div>
          <div class="agile-headline-badge">
            <span class="val font-bold text-success">100%</span>
            <span class="lbl text-xs text-muted">Sprint Success Rate</span>
          </div>
        </div>
      </div>

      <!-- Agile Case Study Subnav -->
      <div class="subnav-tabs" style="margin-bottom: 20px;">
        <button class="subnav-btn ${activeAgileTab === "sprints" ? "active" : ""}" data-agile-tab="sprints">
          <i data-lucide="calendar"></i>
          <span>15 Sprints Deep Dive</span>
        </button>
        <button class="subnav-btn ${activeAgileTab === "epics" ? "active" : ""}" data-agile-tab="epics">
          <i data-lucide="layers"></i>
          <span>8 Epics Master Matrix</span>
        </button>
        <button class="subnav-btn ${activeAgileTab === "metrics" ? "active" : ""}" data-agile-tab="metrics">
          <i data-lucide="trending-down"></i>
          <span>Burndown & Velocity Charts</span>
        </button>
        <button class="subnav-btn ${activeAgileTab === "architecture" ? "active" : ""}" data-agile-tab="architecture">
          <i data-lucide="network"></i>
          <span>Architecture & ERD Blueprint</span>
        </button>
        <button class="subnav-btn ${activeAgileTab === "charter" ? "active" : ""}" data-agile-tab="charter">
          <i data-lucide="award"></i>
          <span>Project Charter & Team</span>
        </button>
      </div>

      ${
        activeAgileTab === "sprints"
          ? `
        <!-- 15 Sprints Selector Pills -->
        <div class="sprint-selector-container">
          <div class="sprint-release-label text-xs font-bold text-muted">RELEASE 1.0 (S1-S5): FOUNDATION</div>
          <div class="sprint-buttons-row">
            ${[1, 2, 3, 4, 5]
              .map((n) => `<button class="sprint-pill-btn ${activeSprintNumber === n ? "active" : ""}" data-sprint="${n}">Sprint ${n}</button>`)
              .join("")}
          </div>

          <div class="sprint-release-label text-xs font-bold text-muted" style="margin-top: 10px;">RELEASE 2.0 (S6-S10): SRM & INGESTION</div>
          <div class="sprint-buttons-row">
            ${[6, 7, 8, 9, 10]
              .map((n) => `<button class="sprint-pill-btn ${activeSprintNumber === n ? "active" : ""}" data-sprint="${n}">Sprint ${n}</button>`)
              .join("")}
          </div>

          <div class="sprint-release-label text-xs font-bold text-muted" style="margin-top: 10px;">RELEASE 3.0 (S11-S15): DISPATCH & HARDENING</div>
          <div class="sprint-buttons-row">
            ${[11, 12, 13, 14, 15]
              .map((n) => `<button class="sprint-pill-btn ${activeSprintNumber === n ? "active" : ""}" data-sprint="${n}">Sprint ${n}</button>`)
              .join("")}
          </div>
        </div>

        <!-- Selected Sprint Banner -->
        <div class="sprint-overview-banner">
          <div class="sprint-title-area">
            <div class="flex-center gap-xs" style="justify-content: flex-start;">
              <span class="badge badge-accent">Sprint ${currentSprint.sprintNumber} of 15</span>
              <span class="badge badge-subtle">${currentSprint.dates}</span>
              <span class="badge badge-success">Delivered: ${currentSprint.completedPoints} / ${currentSprint.plannedPoints} SP</span>
            </div>
            <h2 class="sprint-heading">${currentSprint.name}</h2>
            <p class="sprint-goal-text"><strong>Sprint Goal:</strong> ${currentSprint.goal}</p>
          </div>

          <div class="sprint-epic-tag">
            <span class="text-xs text-muted">LINKED MASTER EPIC:</span>
            <div class="font-bold">${linkedEpic ? `${linkedEpic.code}: ${linkedEpic.title}` : currentSprint.epicId}</div>
          </div>
        </div>

        <!-- Sprint User Stories Board -->
        <div class="content-card" style="margin-bottom: 24px;">
          <div class="card-header flex-between">
            <div class="flex-center gap-sm">
              <i data-lucide="check-square" class="text-accent"></i>
              <h3 class="card-title">Sprint Backlog User Stories & Acceptance Criteria</h3>
            </div>
            <span class="badge badge-subtle">${currentSprint.stories.length} User Stories (${currentSprint.completedPoints} Story Points)</span>
          </div>

          <div class="stories-grid">
            ${currentSprint.stories
              .map((story) => {
                return `
                <div class="story-card">
                  <div class="story-header flex-between">
                    <div>
                      <span class="font-mono font-bold text-accent">${story.id}</span>
                      <h4 class="story-title">${story.title}</h4>
                    </div>
                    <div class="text-right">
                      <span class="story-points-pill">${story.points} SP</span>
                      <div style="margin-top: 4px;">
                        <span class="badge ${story.status === "Done" ? "badge-success" : "badge-warning"}">${story.status}</span>
                      </div>
                    </div>
                  </div>

                  <div class="user-story-narrative">
                    <p><strong>As a</strong> ${story.asA}</p>
                    <p><strong>I want</strong> ${story.iWant}</p>
                    <p><strong>So that</strong> ${story.soThat}</p>
                  </div>

                  <div class="acceptance-criteria-box">
                    <div class="text-xs font-bold text-muted" style="margin-bottom: 4px;">ACCEPTANCE CRITERIA (GIVEN / WHEN / THEN):</div>
                    <ul class="criteria-list">
                      ${story.acceptanceCriteria.map((c) => `<li>${c}</li>`).join("")}
                    </ul>
                  </div>

                  <div class="story-footer flex-between">
                    <span class="text-xs text-muted">Definition of Done Verified</span>
                    <button class="btn btn-ghost btn-xs btn-toggle-story-status" data-sprint="${currentSprint.sprintNumber}" data-story-id="${story.id}" data-current="${story.status}">
                      ${story.status === "Done" ? "Mark In Progress" : "Mark Done ✔"}
                    </button>
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>

        <!-- Scrum Ceremonies Logs -->
        <div class="content-card">
          <div class="card-header flex-between">
            <div class="flex-center gap-sm">
              <i data-lucide="message-square" class="text-accent"></i>
              <h3 class="card-title">Sprint ${currentSprint.sprintNumber} Scrum Ceremonies Documentation</h3>
            </div>
            <span class="badge badge-subtle">Scrum Master Dossier</span>
          </div>

          <div class="ceremonies-grid">
            <div class="ceremony-card">
              <div class="ceremony-header">
                <i data-lucide="compass" class="text-primary"></i>
                <h4>Sprint Planning Session</h4>
              </div>
              <p class="ceremony-body">${currentSprint.ceremonies.planning}</p>
            </div>

            <div class="ceremony-card">
              <div class="ceremony-header">
                <i data-lucide="users" class="text-warning"></i>
                <h4>Daily Scrum & Impediments</h4>
              </div>
              <p class="ceremony-body">${currentSprint.ceremonies.dailyStandup}</p>
            </div>

            <div class="ceremony-card">
              <div class="ceremony-header">
                <i data-lucide="presentation" class="text-accent"></i>
                <h4>Sprint Review & Stakeholder Demo</h4>
              </div>
              <p class="ceremony-body">${currentSprint.ceremonies.review}</p>
            </div>

            <div class="ceremony-card highlight-retro">
              <div class="ceremony-header">
                <i data-lucide="sparkles" class="text-success"></i>
                <h4>Sprint Retrospective</h4>
              </div>
              <div class="retro-details">
                <div class="retro-item text-success">
                  <strong>Went Well:</strong> ${currentSprint.ceremonies.retrospective.wentWell}
                </div>
                <div class="retro-item text-warning">
                  <strong>Could Improve:</strong> ${currentSprint.ceremonies.retrospective.couldImprove}
                </div>
                <div class="retro-item text-accent">
                  <strong>Action Item:</strong> ${currentSprint.ceremonies.retrospective.actionItem}
                </div>
              </div>
            </div>
          </div>
        </div>
      `
          : activeAgileTab === "epics"
          ? `
        <!-- 8 Epics Breakdown Matrix -->
        <div class="content-card">
          <div class="card-header flex-between">
            <div>
              <h3 class="card-title">The 8 Master Epics</h3>
              <p class="card-subtitle text-sm text-muted">Complete breakdown of all enterprise capabilities across the 185 Story Point delivery</p>
            </div>
            <span class="badge badge-success">8 / 8 Epics Delivered (100%)</span>
          </div>

          <div class="epics-grid">
            ${agile.epics
              .map((epic) => {
                return `
                <div class="epic-card">
                  <div class="epic-header flex-between">
                    <div>
                      <span class="badge badge-accent font-mono">${epic.code}</span>
                      <h3 class="epic-title">${epic.title}</h3>
                    </div>
                    <span class="epic-points-badge">${epic.totalStoryPoints} SP</span>
                  </div>

                  <p class="epic-desc text-sm">${epic.description}</p>

                  <div class="epic-business-value-box">
                    <span class="label text-xs font-bold text-accent">BUSINESS VALUE & ROI:</span>
                    <p class="val text-xs">${epic.businessValue}</p>
                  </div>

                  <div class="epic-footer flex-between text-xs text-muted">
                    <div><strong>Sprints:</strong> ${epic.sprintsInvolved.map((s) => `Sprint ${s}`).join(", ")}</div>
                    <div><strong>Lead:</strong> ${epic.leadRole}</div>
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>
      `
          : activeAgileTab === "metrics"
          ? `
        <!-- Agile Burndown & Velocity Telemetry -->
        <div class="charts-grid" style="margin-bottom: 24px;">
          <div class="chart-card">
            <div class="chart-header">
              <div>
                <h3 class="chart-title">Release Burndown Trajectory (15 Sprints)</h3>
                <p class="chart-subtitle">Ideal story point burn vs actual delivered story points (185 SP total)</p>
              </div>
              <span class="badge badge-success">Completed On-Schedule</span>
            </div>
            <div class="chart-wrapper">
              <canvas id="chart-burndown"></canvas>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <div>
                <h3 class="chart-title">Sprint Velocity & Capacity (Planned vs Actual)</h3>
                <p class="chart-subtitle">Story points completed per 2-week sprint cycle (Avg: 12.33 SP)</p>
              </div>
              <span class="badge badge-accent">Consistent Velocity</span>
            </div>
            <div class="chart-wrapper">
              <canvas id="chart-velocity"></canvas>
            </div>
          </div>
        </div>

        <!-- Scrum Quality & Defect Metrics Table -->
        <div class="content-card">
          <div class="card-header flex-between">
            <h3 class="card-title">Scrum Delivery Telemetry Table</h3>
            <span class="badge badge-subtle">Aggregated S1-S15</span>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Sprint</th>
                  <th>Theme & Epic</th>
                  <th>Planned SP</th>
                  <th>Completed SP</th>
                  <th>Velocity Variance</th>
                  <th>Escaped Defects</th>
                  <th>Retrospective Action Completion</th>
                </tr>
              </thead>
              <tbody>
                ${agile.sprints
                  .map((s) => {
                    const diff = s.completedPoints - s.plannedPoints;
                    return `
                    <tr>
                      <td class="font-bold">Sprint ${s.sprintNumber}</td>
                      <td>${s.name.split(": ")[1]}</td>
                      <td>${s.plannedPoints} SP</td>
                      <td class="font-bold text-accent">${s.completedPoints} SP</td>
                      <td><span class="text-success font-bold">${diff >= 0 ? "+" : ""}${diff} SP (100%)</span></td>
                      <td><span class="badge badge-success">0 P1 / 0 P2</span></td>
                      <td><span class="badge badge-subtle">100% Implemented</span></td>
                    </tr>
                  `;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      `
          : activeAgileTab === "architecture"
          ? `
        <!-- System Architecture & ERD Blueprint Viewer -->
        <div class="content-card" style="margin-bottom: 24px;">
          <div class="card-header flex-between">
            <div>
              <h3 class="card-title">Enterprise System Architecture Blueprint</h3>
              <p class="card-subtitle text-sm text-muted">Decoupled 3-tier architecture with reactive state and multi-warehouse allocation engine</p>
            </div>
            <span class="badge badge-accent">High-Level Design</span>
          </div>

          <div class="architecture-diagram-container">
            <div class="arch-layer">
              <div class="arch-layer-title"><i data-lucide="monitor"></i> Presentation Layer (SPA Clients)</div>
              <div class="arch-nodes-row">
                <div class="arch-node">
                  <div class="font-bold">Merchandising Portal</div>
                  <div class="text-xs text-muted">PIM Catalog & Barcodes</div>
                </div>
                <div class="arch-node">
                  <div class="font-bold">Warehouse Floor Terminal</div>
                  <div class="text-xs text-muted">Wave Picking & Bins</div>
                </div>
                <div class="arch-node">
                  <div class="font-bold">Procurement Hub</div>
                  <div class="text-xs text-muted">PO Lifecycle & GRN Docks</div>
                </div>
                <div class="arch-node">
                  <div class="font-bold">Executive Analytics</div>
                  <div class="text-xs text-muted">Valuation & Burndown</div>
                </div>
              </div>
            </div>

            <div class="arch-arrow-row">▼ Event Bus & State Dispatchers ▼</div>

            <div class="arch-layer">
              <div class="arch-layer-title"><i data-lucide="cpu"></i> Application Logic & Domain Services</div>
              <div class="arch-nodes-row">
                <div class="arch-node highlight-node">
                  <div class="font-bold">ATP Inventory Ledger Engine</div>
                  <div class="text-xs text-muted">On-Hand vs Reserved Locking</div>
                </div>
                <div class="arch-node highlight-node">
                  <div class="font-bold">Smart Allocation Router</div>
                  <div class="text-xs text-muted">Proximity & Availability Cascade</div>
                </div>
                <div class="arch-node highlight-node">
                  <div class="font-bold">Procure-to-Pay Engine</div>
                  <div class="text-xs text-muted">PO Approval & GRN Ingestion</div>
                </div>
                <div class="arch-node highlight-node">
                  <div class="font-bold">Inter-Facility STO Dispatcher</div>
                  <div class="text-xs text-muted">In-Transit Virtual State</div>
                </div>
              </div>
            </div>

            <div class="arch-arrow-row">▼ Transactional Persistence Tier ▼</div>

            <div class="arch-layer">
              <div class="arch-layer-title"><i data-lucide="database"></i> Relational Data & Audit Persistence</div>
              <div class="arch-nodes-row">
                <div class="arch-node">
                  <div class="font-bold">Catalog Schema</div>
                  <div class="text-xs text-muted">SKU, Barcode, Margins</div>
                </div>
                <div class="arch-node">
                  <div class="font-bold">Spatial Topology</div>
                  <div class="text-xs text-muted">Warehouses, Zones, Bins</div>
                </div>
                <div class="arch-node">
                  <div class="font-bold">Transactions & Orders</div>
                  <div class="text-xs text-muted">SO, PO, STO, Invoices</div>
                </div>
                <div class="arch-node">
                  <div class="font-bold">Immutable Audit Feed</div>
                  <div class="text-xs text-muted">Append-only compliance log</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Relational Schema / ERD Data Contracts -->
        <div class="content-card">
          <div class="card-header flex-between">
            <div>
              <h3 class="card-title">Entity Relationship Diagram (ERD) Schema Matrix</h3>
              <p class="card-subtitle text-sm text-muted">Normalized schema supporting foreign key relationships and multi-facility inventory tracking</p>
            </div>
            <span class="badge badge-subtle">9 Core Entities</span>
          </div>

          <div class="erd-cards-grid">
            <div class="erd-entity-card">
              <div class="erd-entity-name"><i data-lucide="box"></i> Product (PIM)</div>
              <ul class="erd-fields-list">
                <li><span class="pk">PK</span> id: VARCHAR</li>
                <li><span class="idx">IDX</span> sku: VARCHAR (UNIQUE)</li>
                <li>barcode: VARCHAR (EAN-13)</li>
                <li>name, category, brand: VARCHAR</li>
                <li>costPrice, sellingPrice: DECIMAL</li>
                <li>reorderPoint, maxStock: INT</li>
                <li><span class="fk">FK</span> primarySupplierId: VARCHAR</li>
              </ul>
            </div>

            <div class="erd-entity-card">
              <div class="erd-entity-name"><i data-lucide="warehouse"></i> Warehouse Facility</div>
              <ul class="erd-fields-list">
                <li><span class="pk">PK</span> id: VARCHAR</li>
                <li>code: VARCHAR (e.g. ORD-HUB-01)</li>
                <li>name, city, state, address: TEXT</li>
                <li>capacity: INT (Max Units)</li>
                <li>manager, contactEmail: VARCHAR</li>
                <li>zones: JSON Array of Bins</li>
              </ul>
            </div>

            <div class="erd-entity-card">
              <div class="erd-entity-name"><i data-lucide="layers"></i> StockLevel Ledger</div>
              <ul class="erd-fields-list">
                <li><span class="pk">PK</span> id: VARCHAR</li>
                <li><span class="fk">FK</span> productId ➔ Product.id</li>
                <li><span class="fk">FK</span> warehouseId ➔ Warehouse.id</li>
                <li>bin: VARCHAR (Zone-Aisle-Shelf-Bin)</li>
                <li>onHand: INT</li>
                <li>reserved: INT (Pending orders)</li>
                <li>batchLot: VARCHAR</li>
              </ul>
            </div>

            <div class="erd-entity-card">
              <div class="erd-entity-name"><i data-lucide="shopping-bag"></i> SalesOrder</div>
              <ul class="erd-fields-list">
                <li><span class="pk">PK</span> id: VARCHAR</li>
                <li>orderNumber: VARCHAR</li>
                <li>customerName, email: VARCHAR</li>
                <li>channel: VARCHAR (ECom, B2B, POS)</li>
                <li><span class="fk">FK</span> warehouseId ➔ Warehouse.id</li>
                <li>carrier, trackingNumber: VARCHAR</li>
                <li>status: ENUM (Pending..Delivered)</li>
              </ul>
            </div>

            <div class="erd-entity-card">
              <div class="erd-entity-name"><i data-lucide="file-text"></i> PurchaseOrder</div>
              <ul class="erd-fields-list">
                <li><span class="pk">PK</span> id: VARCHAR</li>
                <li>poNumber: VARCHAR</li>
                <li><span class="fk">FK</span> supplierId ➔ Supplier.id</li>
                <li><span class="fk">FK</span> warehouseId ➔ Warehouse.id</li>
                <li>orderDate, expectedDate: DATE</li>
                <li>totalAmount: DECIMAL</li>
                <li>status: ENUM (Draft..Received)</li>
              </ul>
            </div>

            <div class="erd-entity-card">
              <div class="erd-entity-name"><i data-lucide="repeat"></i> StockTransferOrder</div>
              <ul class="erd-fields-list">
                <li><span class="pk">PK</span> id: VARCHAR</li>
                <li>transferNumber: VARCHAR</li>
                <li><span class="fk">FK</span> fromWarehouseId: VARCHAR</li>
                <li><span class="fk">FK</span> toWarehouseId: VARCHAR</li>
                <li>status: ENUM (In-Transit, Done)</li>
                <li>carrier, trackingNumber: VARCHAR</li>
                <li>items: JSON Array</li>
              </ul>
            </div>
          </div>
        </div>
      `
          : `
        <!-- Project Charter & Team Composition -->
        <div class="content-card" style="margin-bottom: 24px;">
          <div class="card-header flex-between">
            <h3 class="card-title">Agile Project Charter & Executive Mandate</h3>
            <span class="badge badge-accent">Capstone Defense</span>
          </div>

          <div class="charter-grid">
            <div class="charter-section">
              <h4 class="charter-heading"><i data-lucide="target" class="text-accent"></i> Project Scope & Vision</h4>
              <p class="text-sm">To architect, build, and deliver an enterprise-grade Retail Inventory Management System (RIMS) uniting decentralized distribution centers, e-commerce storefronts, and supplier networks into a singular real-time operational platform. Delivered through 15 structured two-week Scrum sprints spanning 8 capability epics.</p>
            </div>

            <div class="charter-section">
              <h4 class="charter-heading"><i data-lucide="briefcase" class="text-success"></i> Business Case & ROI Metrics</h4>
              <ul class="charter-list text-sm">
                <li><strong>99.4% Inventory Record Accuracy:</strong> Reduced cycle count discrepancy from 12% to under 0.6%.</li>
                <li><strong>48-Hour Order Fulfillment Cycle:</strong> Automated routing slashed cross-country freight days by 38%.</li>
                <li><strong>Shrinkage Reduction:</strong> Mandatory reason-code audit trails recovered $140k in annual inventory loss.</li>
              </ul>
            </div>

            <div class="charter-section">
              <h4 class="charter-heading"><i data-lucide="check-circle" class="text-primary"></i> Definition of Done (DoD) Standard</h4>
              <ul class="charter-list text-sm">
                <li>Feature matches all Given/When/Then acceptance criteria.</li>
                <li>Unit test code coverage >= 85% with zero P1/P2 defects.</li>
                <li>UI accessible, responsive, and adheres to dark/light design system.</li>
                <li>State updates persist and create immutable audit trail ledger entries.</li>
                <li>Peer code review passed and signed off by Product Owner.</li>
              </ul>
            </div>

            <div class="charter-section">
              <h4 class="charter-heading"><i data-lucide="users" class="text-warning"></i> Scrum Team Roles</h4>
              <div class="team-roles-list">
                ${agile.teamComposition
                  .map(
                    (m) => `
                  <div class="team-member-row">
                    <span class="font-bold">${m.role}:</span>
                    <span>${m.name || `${m.count} Engineers`}</span>
                    <span class="badge badge-subtle">${m.allocation}</span>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </div>
      `
      }
    </div>
  `;
}

export function setupAgileCapstoneEvents(onRefresh) {
  // Agile sub-tab navigation
  document.querySelectorAll(".subnav-btn[data-agile-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeAgileTab = btn.dataset.agileTab;
      onRefresh();
    });
  });

  // Sprint number pills
  document.querySelectorAll(".sprint-pill-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeSprintNumber = parseInt(btn.dataset.sprint);
      onRefresh();
    });
  });

  // Toggle story status button
  document.querySelectorAll(".btn-toggle-story-status").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sprintNum = parseInt(btn.dataset.sprint);
      const storyId = btn.dataset.storyId;
      const current = btn.dataset.current;
      const next = current === "Done" ? "In Progress" : "Done";
      store.updateStoryStatus(sprintNum, storyId, next);
      onRefresh();
    });
  });

  // Chart initialization for metrics tab
  if (activeAgileTab === "metrics") {
    const burndownCanvas = document.getElementById("chart-burndown");
    const velocityCanvas = document.getElementById("chart-velocity");

    if (burndownCanvas) {
      const agile = store.getAgileCaseStudy();
      const sprintLabels = ["Sprint 0 (Kickoff)", ...agile.sprints.map((s) => `S${s.sprintNumber}`)];
      const totalPoints = agile.totalStoryPoints; // 185

      // Ideal linear burn
      const idealBurn = [];
      const step = totalPoints / 15;
      for (let i = 0; i <= 15; i++) {
        idealBurn.push(Math.round(totalPoints - i * step));
      }

      // Actual burn trajectory
      const actualBurn = [185];
      let remaining = totalPoints;
      agile.sprints.forEach((s) => {
        remaining -= s.completedPoints;
        actualBurn.push(remaining);
      });

      new Chart(burndownCanvas, {
        type: "line",
        data: {
          labels: sprintLabels,
          datasets: [
            {
              label: "Ideal Burndown Guideline",
              data: idealBurn,
              borderColor: "rgba(148, 163, 184, 0.5)",
              borderDash: [6, 6],
              borderWidth: 2,
              pointRadius: 0,
              fill: false
            },
            {
              label: "Actual Team Story Point Burn",
              data: actualBurn,
              borderColor: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              borderWidth: 3,
              pointBackgroundColor: "#10b981",
              pointRadius: 4,
              fill: true,
              tension: 0.2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: { color: "#94a3b8", boxWidth: 12 }
            }
          },
          scales: {
            x: {
              ticks: { color: "#94a3b8" },
              grid: { color: "rgba(148, 163, 184, 0.08)" }
            },
            y: {
              ticks: {
                color: "#94a3b8",
                callback: (v) => `${v} SP`
              },
              grid: { color: "rgba(148, 163, 184, 0.08)" }
            }
          }
        }
      });
    }

    if (velocityCanvas) {
      const agile = store.getAgileCaseStudy();
      const labels = agile.sprints.map((s) => `S${s.sprintNumber}`);
      const planned = agile.sprints.map((s) => s.plannedPoints);
      const actual = agile.sprints.map((s) => s.completedPoints);

      new Chart(velocityCanvas, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Planned Velocity (SP)",
              data: planned,
              backgroundColor: "rgba(148, 163, 184, 0.4)",
              borderRadius: 4
            },
            {
              label: "Actual Delivered (SP)",
              data: actual,
              backgroundColor: "#6366f1",
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: { color: "#94a3b8", boxWidth: 12 }
            }
          },
          scales: {
            x: {
              ticks: { color: "#94a3b8" },
              grid: { display: false }
            },
            y: {
              ticks: {
                color: "#94a3b8",
                callback: (v) => `${v} SP`
              },
              grid: { color: "rgba(148, 163, 184, 0.08)" }
            }
          }
        }
      });
    }
  }
}
