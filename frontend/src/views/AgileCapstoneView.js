import { store } from "../state/store.js";
import { Chart } from "chart.js/auto";
import { toast } from "../components/toast/Toast.js";

let activeAgileTab = "sprints"; // "sprints" | "epics" | "metrics" | "architecture" | "charter"
let activeSprintNumber = 15; // default to sprint 15 (capstone finale) or current sprint
let activeTeamRoleFilter = "all"; // 'all', 'leadership', 'engineering', 'qa_sre'

// Support direct hash navigation to #charter
if (window.location.hash === "#charter") {
  activeAgileTab = "charter";
}

// ----------------------------------------------------------------------------
// PROJECT CHARTER & TEAM DATA
// ----------------------------------------------------------------------------
const teamRoster = [
  {
    id: "tm-1",
    name: "Samantha Briggs, CSM, PMP",
    role: "Scrum Master & Delivery Lead",
    category: "leadership",
    avatarClass: "team-avatar-sm",
    initials: "SB",
    allocation: "100% Dedicated",
    bio: "Certified Scrum Master with 8+ years leading enterprise retail logistics agile transformations. Champions sprint velocity, unblocks cross-functional bottlenecks, and shields development squads.",
    deliverables: [
      "Facilitated all 15 sprint ceremonies (Planning, Daily Standup, Review, Retro)",
      "Maintained burndown trajectory achieving 100% sprint commitment success",
      "Resolved 28 cross-track impediments across warehouse and API teams"
    ],
    skills: ["Scrum / Agile", "Jira & Confluence", "Servant Leadership", "CI/CD Governance"]
  },
  {
    id: "tm-2",
    name: "David Sterling, CSPO",
    role: "Product Owner & Commercial SME",
    category: "leadership",
    avatarClass: "team-avatar-po",
    initials: "DS",
    allocation: "100% Dedicated",
    bio: "Former VP of Omnichannel Retail Operations with 12+ years in inventory planning. Owns the 185-point product backlog, defines Gherkin acceptance criteria, and guarantees commercial ROI delivery.",
    deliverables: [
      "Authored 38 user stories with comprehensive Given/When/Then criteria",
      "Prioritized 8 core epics maximizing early business value delivery",
      "Conducted weekly stakeholder demos securing executive sponsor sign-offs"
    ],
    skills: ["Backlog Prioritization", "Stakeholder Alignment", "Domain-Driven Design", "ROI Modeling"]
  },
  {
    id: "tm-3",
    name: "Kavita Sharma",
    role: "Tech Lead & Solutions Architect",
    category: "leadership",
    avatarClass: "team-avatar-lead",
    initials: "KS",
    allocation: "100% Dedicated",
    bio: "Principal Software Architect specializing in high-throughput transactional ledgers. Governs C4 system blueprints, PostgreSQL 18 relational 3NF models, and clean hexagonal architecture.",
    deliverables: [
      "Engineered C4 Level 1–4 architectural diagrams and DDD bounded contexts",
      "Designed PostgreSQL 18 schema with OCC versioning and check constraints",
      "Standardized REST API contracts and code review quality gates"
    ],
    skills: ["C4 Model", "PostgreSQL 18", "System Architecture", "Security & Concurrency"]
  },
  {
    id: "tm-4",
    name: "Alex Mercer",
    role: "Senior Backend Engineer (Routing)",
    category: "engineering",
    avatarClass: "team-avatar-dev",
    initials: "AM",
    allocation: "100% Dedicated",
    bio: "Distributed algorithms engineer focused on combinatorial optimization. Implemented the multi-warehouse heuristic routing engine minimizing Haversine distance and split shipments.",
    deliverables: [
      "Implemented Haversine geodesic distance routing algorithm with 100% test coverage",
      "Engineered split-shipment penalty optimization model (P_split = 2,000)",
      "Built atomic order reservation services preventing overselling"
    ],
    skills: ["Node.js / Express", "Heuristic Algorithms", "Spatial Mathematics", "Unit Testing"]
  },
  {
    id: "tm-5",
    name: "Marcus Vance",
    role: "Senior Frontend Engineer & UI/UX Lead",
    category: "engineering",
    avatarClass: "team-avatar-dev",
    initials: "MV",
    allocation: "100% Dedicated",
    bio: "Frontend systems engineer and design system specialist. Crafted the modular Vanilla CSS design token system, Lucide iconography, Command Palette, and high-performance Chart.js telemetry.",
    deliverables: [
      "Designed responsive Vanilla CSS design system with Dark/Light theme parity",
      "Built interactive C4 diagrams, algorithm sandboxes, and Command Palette",
      "Ensured sub-50ms interaction latency and 60fps micro-animations"
    ],
    skills: ["Vanilla CSS", "ES6+ Modules", "Chart.js", "WCAG 2.1 AA Accessibility"]
  },
  {
    id: "tm-6",
    name: "Elena Rostova",
    role: "Full-Stack Inventory & Systems Engineer",
    category: "engineering",
    avatarClass: "team-avatar-dev",
    initials: "ER",
    allocation: "100% Dedicated",
    bio: "Specialist in supply chain ledger engineering and financial inventory valuation. Implemented dual GAAP (FIFO) and IFRS (AVCO) inventory cost depletion engines.",
    deliverables: [
      "Engineered chronological FIFO cost layer depletion algorithm and AVCO model",
      "Created spatial 3D bin coordinate address system (Zone-Aisle-Shelf-Bin)",
      "Implemented Goods Receipt Note (GRN) inbound dock receiving workflow"
    ],
    skills: ["Inventory Ledgers", "Cost Accounting (FIFO/AVCO)", "SQL 3NF", "REST APIs"]
  },
  {
    id: "tm-7",
    name: "Chloe Bennett, ISTQB",
    role: "QA Automation Engineer & SDET",
    category: "qa_sre",
    avatarClass: "team-avatar-qa",
    initials: "CB",
    allocation: "100% Dedicated",
    bio: "Test automation architect with 7+ years developing automated regression suites. Built the automated algorithm test harness and verified 100% of BDD acceptance criteria.",
    deliverables: [
      "Built automated test suite for all 4 core algorithms with 0 regressions",
      "Enforced Definition of Done (DoD) quality gates maintaining >=85% test coverage",
      "Conducted exploratory testing and automated load simulation runs"
    ],
    skills: ["Automated Testing", "TDD & BDD", "Playwright & Node Test", "Regression Suites"]
  },
  {
    id: "tm-8",
    name: "Liam O'Connor",
    role: "DevOps & Cloud SRE Specialist",
    category: "qa_sre",
    avatarClass: "team-avatar-sre",
    initials: "LO",
    allocation: "50% Dedicated",
    bio: "Site reliability and infrastructure automation engineer. Built the Vite CI/CD production pipelines, Docker container runtimes, and PostgreSQL connection pooling monitors.",
    deliverables: [
      "Configured multi-container runtime environment (SPA, Gateway, API, PostgreSQL)",
      "Tuned PostgreSQL connection pool settings for peak transaction throughput",
      "Implemented zero-downtime rolling build pipelines with automated health checks"
    ],
    skills: ["Docker", "PostgreSQL DBA", "Vite Rollup", "Linux & CI/CD Pipelines"]
  }
];

const raciMatrix = [
  {
    workstream: "Product Catalog (PIM) Architecture",
    po: "A",
    sm: "I",
    lead: "R",
    dev: "R",
    qa: "C",
    sre: "I"
  },
  {
    workstream: "Multi-Warehouse Bin Topology & Stock Ledger",
    po: "C",
    sm: "I",
    lead: "A",
    dev: "R",
    qa: "C",
    sre: "I"
  },
  {
    workstream: "Order Allocation Heuristics & Split-Shipment Router",
    po: "A",
    sm: "I",
    lead: "C",
    dev: "R",
    qa: "C",
    sre: "I"
  },
  {
    workstream: "Dynamic Reorder Point (ROP) & Safety Stock Policy",
    po: "A",
    sm: "I",
    lead: "C",
    dev: "R",
    qa: "C",
    sre: "I"
  },
  {
    workstream: "Dual Inventory Valuation Engine (FIFO vs AVCO)",
    po: "A",
    sm: "I",
    lead: "C",
    dev: "R",
    qa: "C",
    sre: "I"
  },
  {
    workstream: "Wave Picking, Packing Station & Carrier Dispatch",
    po: "C",
    sm: "I",
    lead: "C",
    dev: "R",
    qa: "C",
    sre: "I"
  },
  {
    workstream: "Automated QA Test Harness & Code Quality DoD",
    po: "I",
    sm: "C",
    lead: "A",
    dev: "C",
    qa: "R",
    sre: "C"
  },
  {
    workstream: "Production Deployment & SRE Telemetry",
    po: "I",
    sm: "I",
    lead: "C",
    dev: "C",
    qa: "C",
    sre: "R/A"
  },
  {
    workstream: "Sprint Ceremonies, Cadence & DoD Governance",
    po: "C",
    sm: "R/A",
    lead: "C",
    dev: "C",
    qa: "C",
    sre: "C"
  }
];

const riskRegister = [
  {
    id: "RSK-01",
    risk: "Inventory Concurrency Collisions during simultaneous checkout surges",
    impact: "HIGH",
    probability: "HIGH",
    mitigation: "Engineered Optimistic Concurrency Control (OCC) with version lock counter columns in PostgreSQL 18 and atomic reservations.",
    status: "Mitigated & Tested"
  },
  {
    id: "RSK-02",
    risk: "Supplier Lead-Time Jitter triggering critical distribution center stockouts",
    impact: "HIGH",
    probability: "MEDIUM",
    mitigation: "Stochastic Dynamic Safety Stock algorithm dynamically computing buffers based on historical standard deviation of supplier lead time.",
    status: "Mitigated & Tested"
  },
  {
    id: "RSK-03",
    risk: "Split-Shipment Freight Surcharge Explosion inflating per-order delivery cost",
    impact: "MEDIUM",
    probability: "HIGH",
    mitigation: "Haversine Heuristic Router applying a 2,000 penalty score against multiple-node fulfillments, favoring consolidated single-hub delivery.",
    status: "Mitigated & Tested"
  },
  {
    id: "RSK-04",
    risk: "Database Connection Pool Starvation under high-concurrency picking waves",
    impact: "MEDIUM",
    probability: "MEDIUM",
    mitigation: "Node.js pg Pool configured with 20 persistent clients, automatic idle timeout reaping, and read-heavy query optimization.",
    status: "Mitigated & Tested"
  }
];

export function renderAgileCapstoneView() {
  const agile = store.getAgileCaseStudy();
  const currentSprint = store.getSprint(activeSprintNumber) || agile.sprints[0];
  const linkedEpic = agile.epics.find((e) => e.id === currentSprint.epicId);

  return `
    <div class="view-container animate-fade-in" id="agile-view-root">
      <div class="view-header">
        <div>
          <div class="flex-center gap-xs" style="justify-content: flex-start; margin-bottom: 6px;">
            <span class="badge badge-accent">Agile Capstone Case Study</span>
            <span class="badge badge-subtle">Scrum Framework</span>
            <span class="badge badge-success">Capstone Defense Ready</span>
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
      <div class="subnav-tabs" style="margin-bottom: 24px;">
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

        <!-- Ceremonies Grid -->
        <div class="ceremonies-grid" style="margin-bottom: 24px;">
          <div class="ceremony-card">
            <div class="ceremony-title"><i data-lucide="target" class="text-accent"></i> Sprint Planning</div>
            <p class="text-xs text-muted">${currentSprint.ceremonies.planning}</p>
          </div>
          <div class="ceremony-card">
            <div class="ceremony-title"><i data-lucide="users" class="text-success"></i> Daily Scrum Standup</div>
            <p class="text-xs text-muted">${currentSprint.ceremonies.dailyStandup}</p>
          </div>
          <div class="ceremony-card">
            <div class="ceremony-title"><i data-lucide="eye" class="text-primary"></i> Sprint Review & Demo</div>
            <p class="text-xs text-muted">${currentSprint.ceremonies.review}</p>
          </div>
          <div class="ceremony-card">
            <div class="ceremony-title"><i data-lucide="rotate-ccw" class="text-warning"></i> Sprint Retrospective</div>
            <div class="retro-details text-xs">
              <div><strong class="text-success">&bull; Went Well:</strong> ${currentSprint.ceremonies.retrospective.wentWell}</div>
              <div><strong class="text-warning">&bull; Could Improve:</strong> ${currentSprint.ceremonies.retrospective.couldImprove}</div>
              <div><strong class="text-accent">&bull; Action Item:</strong> ${currentSprint.ceremonies.retrospective.actionItem}</div>
            </div>
          </div>
        </div>

        <!-- Sprint User Stories Table -->
        <div class="content-card">
          <div class="card-header flex-between">
            <div>
              <h3 class="card-title">Committed User Stories & Gherkin Acceptance Criteria</h3>
              <p class="card-subtitle text-xs text-muted">Interactive story point tracking with Definition of Done (DoD) verification</p>
            </div>
            <span class="badge badge-subtle">${currentSprint.stories.length} User Stories</span>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Story ID & Title</th>
                  <th>Points</th>
                  <th>Status</th>
                  <th>User Story Narrative (Role / Want / Benefit)</th>
                  <th>Acceptance Criteria (Gherkin Scenarios)</th>
                  <th class="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                ${currentSprint.stories
                  .map(
                    (s) => `
                  <tr>
                    <td>
                      <div class="font-mono font-bold text-accent">${s.id}</div>
                      <div class="font-semibold text-sm">${s.title}</div>
                    </td>
                    <td class="font-mono text-center">
                      <span class="badge badge-subtle font-bold">${s.points} SP</span>
                    </td>
                    <td>
                      <span class="badge ${s.status === "Done" ? "badge-success" : "badge-warning"}">
                        ${s.status}
                      </span>
                    </td>
                    <td style="max-width: 320px;">
                      <div class="text-xs">
                        <strong>As a</strong> ${s.asA},<br/>
                        <strong>I want</strong> ${s.iWant},<br/>
                        <strong>So that</strong> ${s.soThat}.
                      </div>
                    </td>
                    <td style="max-width: 360px;">
                      <ul class="text-xs text-muted" style="padding-left: 14px; margin: 0; line-height: 1.4;">
                        ${s.acceptanceCriteria.map((c) => `<li>${c}</li>`).join("")}
                      </ul>
                    </td>
                    <td class="text-right">
                      <button class="btn btn-secondary btn-xs btn-toggle-story-status" data-sprint="${currentSprint.sprintNumber}" data-story-id="${s.id}" data-current="${s.status}">
                        Toggle
                      </button>
                    </td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      `
          : activeAgileTab === "epics"
          ? `
        <!-- 8 Epics Master Matrix -->
        <div class="content-card">
          <div class="card-header flex-between">
            <div>
              <h3 class="card-title">8 Strategic Capability Epics Master Matrix</h3>
              <p class="card-subtitle text-xs text-muted">Complete breakdown of business value, story point distribution, and engineering leadership</p>
            </div>
            <span class="badge badge-accent">185 SP Backlog</span>
          </div>

          <div class="epics-grid">
            ${agile.epics
              .map(
                (e) => `
              <div class="epic-card">
                <div class="epic-card-header flex-between">
                  <span class="font-mono font-bold text-accent">${e.code}</span>
                  <span class="badge badge-success">${e.status}</span>
                </div>
                <h4 class="epic-title">${e.title}</h4>
                <p class="epic-desc text-xs text-muted">${e.description}</p>

                <div class="epic-value-box text-xs">
                  <strong class="text-success"><i data-lucide="trending-up"></i> Business ROI:</strong>
                  <span>${e.businessValue}</span>
                </div>

                <div class="epic-footer flex-between text-xs font-mono">
                  <span>Sprints: [${e.sprintsInvolved.join(", ")}]</span>
                  <span class="badge badge-subtle font-bold">${e.totalStoryPoints} Story Points</span>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `
          : activeAgileTab === "metrics"
          ? `
        <!-- Burndown & Velocity Telemetry -->
        <div class="metrics-charts-grid">
          <div class="content-card">
            <div class="card-header flex-between">
              <div>
                <h3 class="card-title">Capstone 185 SP Burndown Trajectory</h3>
                <p class="card-subtitle text-xs text-muted">Ideal sprint burn vs actual velocity across 15 iterations</p>
              </div>
              <span class="badge badge-success">Completed: 185 / 185 SP</span>
            </div>
            <div style="height: 320px; width: 100%;">
              <canvas id="chart-burndown"></canvas>
            </div>
          </div>

          <div class="content-card">
            <div class="card-header flex-between">
              <div>
                <h3 class="card-title">Sprint Velocity Distribution (SP)</h3>
                <p class="card-subtitle text-xs text-muted">Planned capacity vs realized velocity per sprint iteration</p>
              </div>
              <span class="badge badge-subtle font-mono">Avg: 12.33 SP/Sprint</span>
            </div>
            <div style="height: 320px; width: 100%;">
              <canvas id="chart-velocity"></canvas>
            </div>
          </div>
        </div>
      `
          : activeAgileTab === "architecture"
          ? `
        <!-- Architecture & ERD Blueprint View -->
        <div class="content-card" style="margin-bottom: 24px;">
          <div class="card-header flex-between">
            <div>
              <h3 class="card-title">C4 Container Architecture Blueprint</h3>
              <p class="card-subtitle text-xs text-muted">High-level software container runtime topology and component interactions</p>
            </div>
            <span class="badge badge-accent">C4 Level 2 Container</span>
          </div>

          <div class="c4-container-diagram">
            <div class="c4-box client-box">
              <div class="c4-title">Single Page Application (SPA)</div>
              <div class="c4-tech">[JavaScript ES6+ / Vanilla CSS]</div>
              <div class="c4-desc">Responsive web client hosting warehouse operator, catalog manager, and executive analytics views.</div>
            </div>

            <div class="c4-arrow"><i data-lucide="arrow-right"></i> HTTPS / JSON</div>

            <div class="c4-box api-box">
              <div class="c4-title">RIMS Application Backend</div>
              <div class="c4-tech">[Node.js / Express]</div>
              <div class="c4-desc">REST API services handling order allocation heuristics, inventory valuation, and procurement workflows.</div>
            </div>

            <div class="c4-arrow"><i data-lucide="arrow-right"></i> TCP / SQL</div>

            <div class="c4-box db-box">
              <div class="c4-title">Relational Datastore</div>
              <div class="c4-tech">[PostgreSQL 18.6 ACID]</div>
              <div class="c4-desc">Normalized 3NF schema, Optimistic Concurrency Control (OCC) version locks, check constraints, and audit trails.</div>
            </div>
          </div>
        </div>

        <!-- 3NF ERD Entity Cards -->
        <div class="content-card">
          <div class="card-header flex-between">
            <div>
              <h3 class="card-title">3NF Relational Data Dictionary</h3>
              <p class="card-subtitle text-xs text-muted">Core normalized data entities supporting ACID transactions and OCC locks</p>
            </div>
            <span class="badge badge-subtle">Normalized 3NF Entities</span>
          </div>

          <div class="erd-entities-grid">
            <div class="erd-entity-card">
              <div class="erd-entity-name"><i data-lucide="package"></i> Product (PIM)</div>
              <ul class="erd-fields-list">
                <li><span class="pk">PK</span> id: VARCHAR</li>
                <li>sku: VARCHAR (Unique)</li>
                <li>barcode: VARCHAR (EAN-13)</li>
                <li>name, description: VARCHAR</li>
                <li>costPrice, sellingPrice: DECIMAL</li>
                <li>reorderPoint: INT</li>
              </ul>
            </div>

            <div class="erd-entity-card">
              <div class="erd-entity-name"><i data-lucide="warehouse"></i> Warehouse Facility</div>
              <ul class="erd-fields-list">
                <li><span class="pk">PK</span> id: VARCHAR</li>
                <li>code: VARCHAR (Unique)</li>
                <li>name, city, state: VARCHAR</li>
                <li>type: ENUM (DC, Hub, Retail)</li>
                <li>capacityUnits: INT</li>
                <li>latitude, longitude: DECIMAL</li>
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
          : renderProjectCharterTab(agile)
      }
    </div>
  `;
}

// ============================================================================
// ELEVATED PROJECT CHARTER & TEAM VIEW IMPLEMENTATION
// ============================================================================
function renderProjectCharterTab(agile) {
  return `
    <!-- Executive Hero Banner -->
    <div class="charter-hero-banner animate-fade-in">
      <div class="flex-between flex-wrap gap-sm" style="margin-bottom: 16px;">
        <div class="flex-center gap-xs flex-wrap">
          <span class="badge badge-accent"><i data-lucide="award"></i> Executive Mandate</span>
          <span class="badge badge-success"><i data-lucide="shield-check"></i> Project Delivered & Operational</span>
          <span class="badge badge-subtle">15 Sprints Completed</span>
          <span class="badge badge-info">185 Story Points</span>
        </div>
        <div class="flex-center gap-xs">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-charter" title="Copy Executive Charter Summary">
            <i data-lucide="copy"></i>
            <span>Copy Summary</span>
          </button>
          <button type="button" class="btn btn-primary btn-sm" id="btn-export-charter" title="Export Project Charter (JSON)">
            <i data-lucide="download"></i>
            <span>Export Charter</span>
          </button>
        </div>
      </div>

      <h2 style="font-size: 1.45rem; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">
        Retail Inventory Management System (RIMS) &bull; Project Charter & Team Command
      </h2>
      <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; max-width: 960px;">
        Formal executive engineering charter authorizing the RIMS retail supply chain platform.
        Defines strategic business mandates, triple constraints (scope, schedule, budget), RACI governance topology,
        and the 8-member cross-functional Scrum engineering roster.
      </p>

      <div class="flex-center gap-md flex-wrap" style="margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--border-subtle); justify-content: flex-start; font-size: 0.78rem;">
        <div><span class="text-muted">Executive Sponsor:</span> <strong class="text-main">VP of Global Supply Chain Operations</strong></div>
        <div>&bull;</div>
        <div><span class="text-muted">Lead Delivery Entity:</span> <strong class="text-main">Core Platform Engineering Guild</strong></div>
        <div>&bull;</div>
        <div><span class="text-muted">Governance Standard:</span> <strong class="text-accent">Agile / Scrum (2-Week Iterations)</strong></div>
        <div>&bull;</div>
        <div><span class="text-muted">Delivery Velocity:</span> <strong class="text-success">12.33 SP / Sprint Average</strong></div>
      </div>
    </div>

    <!-- Executive Business Mandate & ROI Realization (4 KPI Cards) -->
    <div class="charter-kpis-grid animate-fade-in">
      <div class="charter-kpi-card">
        <div class="charter-kpi-label">
          <i data-lucide="target" class="text-accent"></i>
          <span>Inventory Record Accuracy (IRA)</span>
        </div>
        <div class="charter-kpi-val text-success">99.4%</div>
        <div class="charter-kpi-delta">
          <strong class="text-success">+11.4%</strong> vs 88.0% benchmark across 3 nationwide hubs (Variance &lt; 0.6%)
        </div>
      </div>

      <div class="charter-kpi-card">
        <div class="charter-kpi-label">
          <i data-lucide="clock" class="text-primary"></i>
          <span>Order Turnaround Fulfillment</span>
        </div>
        <div class="charter-kpi-val text-accent">48 Hours</div>
        <div class="charter-kpi-delta">
          <strong class="text-success">-60%</strong> transit reduction via heuristic proximity allocation router
        </div>
      </div>

      <div class="charter-kpi-card">
        <div class="charter-kpi-label">
          <i data-lucide="dollar-sign" class="text-warning"></i>
          <span>Annual Shrinkage Recovery</span>
        </div>
        <div class="charter-kpi-val text-warning">$140,000</div>
        <div class="charter-kpi-delta">
          Recovered capital via mandatory reason-code audit trails & OCC version locks
        </div>
      </div>

      <div class="charter-kpi-card">
        <div class="charter-kpi-label">
          <i data-lucide="check-circle" class="text-success"></i>
          <span>On-Time In-Full (OTIF) Delivery</span>
        </div>
        <div class="charter-kpi-val text-primary">98.8%</div>
        <div class="charter-kpi-delta">
          SLA compliance across omnichannel web stores, POS registers, and B2B wholesale
        </div>
      </div>
    </div>

    <!-- Triple Constraints: Scope, Schedule, Budget -->
    <div class="triple-constraints-grid animate-fade-in">
      <!-- Constraint 1: Scope -->
      <div class="constraint-card">
        <div>
          <div class="constraint-header">
            <div class="constraint-icon-wrap" style="background: rgba(79, 70, 229, 0.1); color: var(--color-primary);">
              <i data-lucide="layers"></i>
            </div>
            <div>
              <h4 class="font-bold text-base text-main">Scope Baseline</h4>
              <span class="text-xs text-muted font-mono">8 Epics &bull; 185 SP &bull; 38 Stories</span>
            </div>
          </div>
          <p class="text-xs text-muted" style="line-height: 1.5; margin-bottom: 12px;">
            Delivered enterprise supply chain platform unifying catalog PIM, multi-warehouse bin topologies, real-time ATP stock ledgers, and procure-to-pay workflows.
          </p>
          <ul class="text-xs text-main" style="padding-left: 16px; line-height: 1.6;">
            <li><strong>4 Core Algorithms:</strong> Haversine routing, ROP/SS, FIFO & AVCO valuation.</li>
            <li><strong>PostgreSQL 18.6 Schema:</strong> 15 normalized 3NF tables with OCC locks.</li>
            <li><strong>Strategic DDD:</strong> 4 Bounded Contexts with context integration map.</li>
          </ul>
        </div>
        <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--border-subtle);">
          <span class="badge badge-accent font-mono text-xs">Scope Variance: 0% (Fully Delivered)</span>
        </div>
      </div>

      <!-- Constraint 2: Schedule & Milestones -->
      <div class="constraint-card">
        <div>
          <div class="constraint-header">
            <div class="constraint-icon-wrap" style="background: rgba(16, 185, 129, 0.1); color: var(--color-success);">
              <i data-lucide="calendar"></i>
            </div>
            <div>
              <h4 class="font-bold text-base text-main">Schedule & Milestones</h4>
              <span class="text-xs text-muted font-mono">15 Sprints &bull; 30 Weeks Duration</span>
            </div>
          </div>
          <p class="text-xs text-muted" style="line-height: 1.5; margin-bottom: 12px;">
            Executed across 3 phased release gates with zero milestone slippage.
          </p>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="background: var(--bg-surface-subtle); padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 0.75rem;">
              <strong class="text-main">Release 1.0 (S1-S5):</strong> Foundation, PIM Catalog & Multi-Warehouse Bin Modeling.
            </div>
            <div style="background: var(--bg-surface-subtle); padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 0.75rem;">
              <strong class="text-main">Release 2.0 (S6-S10):</strong> SRM Procurement, Purchase Orders & Omnichannel Intake.
            </div>
            <div style="background: var(--bg-surface-subtle); padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 0.75rem;">
              <strong class="text-main">Release 3.0 (S11-S15):</strong> Wave Picking, Reverse Logistics RMA & Capstone Hardening.
            </div>
          </div>
        </div>
        <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--border-subtle);">
          <span class="badge badge-success font-mono text-xs">Milestone Adherence: 100% On-Time</span>
        </div>
      </div>

      <!-- Constraint 3: Budget & Resources -->
      <div class="constraint-card">
        <div>
          <div class="constraint-header">
            <div class="constraint-icon-wrap" style="background: rgba(2, 132, 199, 0.1); color: var(--color-info);">
              <i data-lucide="briefcase"></i>
            </div>
            <div>
              <h4 class="font-bold text-base text-main">Budget & Governance</h4>
              <span class="text-xs text-muted font-mono">7.5 FTE Dedicated Engineering</span>
            </div>
          </div>
          <p class="text-xs text-muted" style="line-height: 1.5; margin-bottom: 12px;">
            Zero commercial license overhead achieved through modern open-source foundations (PostgreSQL 18, Node.js 20 LTS, Vite).
          </p>
          <ul class="text-xs text-main" style="padding-left: 16px; line-height: 1.6;">
            <li><strong>Dedicated Squad:</strong> 1 PO, 1 SM, 1 Tech Lead, 3 Devs, 1 SDET, 0.5 SRE.</li>
            <li><strong>Burn Rate:</strong> 12.33 Story Points per two-week sprint iteration.</li>
            <li><strong>Quality Investment:</strong> 22% of sprint capacity dedicated to test automation.</li>
          </ul>
        </div>
        <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--border-subtle);">
          <span class="badge badge-info font-mono text-xs">Budget Variance: 0% (On Budget)</span>
        </div>
      </div>
    </div>

    <!-- Scope Boundaries: In-Scope vs Out-of-Scope -->
    <div class="scope-boundary-grid animate-fade-in">
      <div class="scope-boundary-card">
        <div class="flex-between" style="margin-bottom: 14px;">
          <h3 class="font-bold text-main flex-center gap-xs">
            <i data-lucide="check-circle" class="text-success"></i>
            <span>In-Scope (RIMS v1.0 Delivered Baseline)</span>
          </h3>
          <span class="badge badge-success">Production Ready</span>
        </div>
        <div>
          <div class="scope-list-item">
            <i data-lucide="check" class="text-success" style="width: 16px; height: 16px; flex-shrink: 0;"></i>
            <span><strong>Multi-Warehouse Real-time Available to Promise (ATP):</strong> Atomic inventory reservation locking with OCC version counters preventing overselling.</span>
          </div>
          <div class="scope-list-item">
            <i data-lucide="check" class="text-success" style="width: 16px; height: 16px; flex-shrink: 0;"></i>
            <span><strong>Spatial 3D Bin Coordinate Addressing:</strong> Granular Zone-Aisle-Shelf-Bin indexing across national distribution centers.</span>
          </div>
          <div class="scope-list-item">
            <i data-lucide="check" class="text-success" style="width: 16px; height: 16px; flex-shrink: 0;"></i>
            <span><strong>Heuristic Proximity Routing Engine:</strong> Haversine geodesic calculation with split-shipment penalty ($P_{split} = 2,000$).</span>
          </div>
          <div class="scope-list-item">
            <i data-lucide="check" class="text-success" style="width: 16px; height: 16px; flex-shrink: 0;"></i>
            <span><strong>Dynamic Stochastic Safety Stock & ROP:</strong> Automatic buffer calculations factoring customer demand variance and lead-time jitter.</span>
          </div>
          <div class="scope-list-item">
            <i data-lucide="check" class="text-success" style="width: 16px; height: 16px; flex-shrink: 0;"></i>
            <span><strong>Dual Inventory Valuation Models:</strong> Chronological FIFO cost layer consumption (GAAP) and Moving Weighted Average (IFRS).</span>
          </div>
        </div>
      </div>

      <div class="scope-boundary-card">
        <div class="flex-between" style="margin-bottom: 14px;">
          <h3 class="font-bold text-main flex-center gap-xs">
            <i data-lucide="slash" class="text-warning"></i>
            <span>Out-of-Scope (Deferred to v2.0 Roadmap)</span>
          </h3>
          <span class="badge badge-subtle">Future Roadmap</span>
        </div>
        <div>
          <div class="scope-list-item">
            <i data-lucide="arrow-right" class="text-muted" style="width: 16px; height: 16px; flex-shrink: 0;"></i>
            <span><strong>Autonomous Drone Indoor Shelf Scanning:</strong> Optical barcode scanning drones scheduled for v2.2 warehouse pilot.</span>
          </div>
          <div class="scope-list-item">
            <i data-lucide="arrow-right" class="text-muted" style="width: 16px; height: 16px; flex-shrink: 0;"></i>
            <span><strong>Automated Guided Vehicles (AGV) Robotic Routing:</strong> Kiva-style autonomous mobile robot hardware integration deferred to v2.5.</span>
          </div>
          <div class="scope-list-item">
            <i data-lucide="arrow-right" class="text-muted" style="width: 16px; height: 16px; flex-shrink: 0;"></i>
            <span><strong>Multi-Currency Forex Hedging:</strong> Cross-border customs valuation and real-time currency hedging deferred to international rollout.</span>
          </div>
          <div class="scope-list-item">
            <i data-lucide="arrow-right" class="text-muted" style="width: 16px; height: 16px; flex-shrink: 0;"></i>
            <span><strong>Physical RFID Gate Antenna Integration:</strong> Passive RFID dock portal antennas scheduled for hardware evaluation phase.</span>
          </div>
          <div class="scope-list-item">
            <i data-lucide="arrow-right" class="text-muted" style="width: 16px; height: 16px; flex-shrink: 0;"></i>
            <span><strong>Machine Learning Vision Inspection on Returns:</strong> AI visual defect grading for reverse logistics RMA deferred to v2.1.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Cross-Functional Agile Team Roster -->
    <div class="content-card animate-fade-in" style="margin-bottom: 24px;">
      <div class="card-header flex-between flex-wrap gap-sm" style="margin-bottom: 18px;">
        <div>
          <h3 class="card-title">Cross-Functional Agile Engineering Squad (7.5 FTE)</h3>
          <p class="card-subtitle text-xs text-muted">Dedicated engineering unit responsible for full-lifecycle architecture, implementation, and defense</p>
        </div>
        <div class="filter-chips-row" id="team-filter-chips">
          <button class="filter-chip ${activeTeamRoleFilter === "all" ? "active" : ""}" data-role-filter="all">All Roles (8)</button>
          <button class="filter-chip ${activeTeamRoleFilter === "leadership" ? "active" : ""}" data-role-filter="leadership">👑 Leadership (3)</button>
          <button class="filter-chip ${activeTeamRoleFilter === "engineering" ? "active" : ""}" data-role-filter="engineering">💻 Engineering (3)</button>
          <button class="filter-chip ${activeTeamRoleFilter === "qa_sre" ? "active" : ""}" data-role-filter="qa_sre">🛡️ QA & SRE (2)</button>
        </div>
      </div>

      <div class="team-roster-grid" id="team-roster-mount">
        ${renderTeamCardsHtml()}
      </div>
    </div>

    <!-- RACI Governance Responsibility Matrix -->
    <div class="content-card animate-fade-in" style="margin-bottom: 24px;">
      <div class="card-header flex-between flex-wrap gap-sm" style="margin-bottom: 16px;">
        <div>
          <h3 class="card-title">RACI Governance & Responsibility Matrix</h3>
          <p class="card-subtitle text-xs text-muted">Accountability mapping across core engineering deliverables and operational workstreams</p>
        </div>
        <div class="flex-center gap-xs">
          <span class="raci-badge raci-r" title="Responsible: Executes the work">R</span>
          <span class="text-xs text-muted">Responsible &bull;</span>
          <span class="raci-badge raci-a" title="Accountable: Ultimate decision owner">A</span>
          <span class="text-xs text-muted">Accountable &bull;</span>
          <span class="raci-badge raci-c" title="Consulted: Two-way input">C</span>
          <span class="text-xs text-muted">Consulted &bull;</span>
          <span class="raci-badge raci-i" title="Informed: Kept updated">I</span>
          <span class="text-xs text-muted">Informed</span>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Workstream Deliverable</th>
              <th class="text-center" style="width: 90px;">Product Owner</th>
              <th class="text-center" style="width: 90px;">Scrum Master</th>
              <th class="text-center" style="width: 90px;">Tech Lead</th>
              <th class="text-center" style="width: 90px;">Senior Devs</th>
              <th class="text-center" style="width: 90px;">QA SDET</th>
              <th class="text-center" style="width: 90px;">DevOps SRE</th>
            </tr>
          </thead>
          <tbody>
            ${raciMatrix
              .map(
                (row) => `
              <tr>
                <td class="font-semibold text-main">${row.workstream}</td>
                <td class="text-center"><span class="raci-badge ${getRaciClass(row.po)}">${row.po}</span></td>
                <td class="text-center"><span class="raci-badge ${getRaciClass(row.sm)}">${row.sm}</span></td>
                <td class="text-center"><span class="raci-badge ${getRaciClass(row.lead)}">${row.lead}</span></td>
                <td class="text-center"><span class="raci-badge ${getRaciClass(row.dev)}">${row.dev}</span></td>
                <td class="text-center"><span class="raci-badge ${getRaciClass(row.qa)}">${row.qa}</span></td>
                <td class="text-center"><span class="raci-badge ${getRaciClass(row.sre)}">${row.sre}</span></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Definition of Done (DoD) & Risk Register -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
      <!-- DoD Checklist -->
      <div class="content-card">
        <div class="card-header flex-between">
          <h3 class="card-title flex-center gap-xs">
            <i data-lucide="check-square" class="text-primary"></i>
            <span>Definition of Done (DoD) Quality Gates</span>
          </h3>
          <span class="badge badge-accent">6 Mandatory Gates</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 6px;">
          <div class="scope-list-item">
            <i data-lucide="check-circle" class="text-success" style="width: 18px; height: 18px; flex-shrink: 0;"></i>
            <div>
              <strong>1. BDD Acceptance Criteria Verified:</strong>
              <div class="text-xs text-muted">100% of Given/When/Then Gherkin scenarios passing and demonstrated during Sprint Review.</div>
            </div>
          </div>
          <div class="scope-list-item">
            <i data-lucide="check-circle" class="text-success" style="width: 18px; height: 18px; flex-shrink: 0;"></i>
            <div>
              <strong>2. Automated Test Coverage &ge; 85%:</strong>
              <div class="text-xs text-muted">Unit & integration tests passing with 0 critical P1/P2 regression defects via Node test runner.</div>
            </div>
          </div>
          <div class="scope-list-item">
            <i data-lucide="check-circle" class="text-success" style="width: 18px; height: 18px; flex-shrink: 0;"></i>
            <div>
              <strong>3. Design System & Theme Consistency:</strong>
              <div class="text-xs text-muted">Full dark/light theme parity, zero hardcoded color codes, WCAG 2.1 AA accessibility compliant.</div>
            </div>
          </div>
          <div class="scope-list-item">
            <i data-lucide="check-circle" class="text-success" style="width: 18px; height: 18px; flex-shrink: 0;"></i>
            <div>
              <strong>4. Immutable Audit Ledger Invariant:</strong>
              <div class="text-xs text-muted">Every inventory mutation produces an audit log record with timestamp, operator ID, and OCC version.</div>
            </div>
          </div>
          <div class="scope-list-item">
            <i data-lucide="check-circle" class="text-success" style="width: 18px; height: 18px; flex-shrink: 0;"></i>
            <div>
              <strong>5. Peer Code Review Sign-off:</strong>
              <div class="text-xs text-muted">Approved by at least 2 senior engineers with zero lint warnings prior to merging into trunk.</div>
            </div>
          </div>
          <div class="scope-list-item">
            <i data-lucide="check-circle" class="text-success" style="width: 18px; height: 18px; flex-shrink: 0;"></i>
            <div>
              <strong>6. C4 Architecture & ERD Synchronized:</strong>
              <div class="text-xs text-muted">System documentation and relational data dictionaries updated to reflect active code schemas.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- RAID Risk Register -->
      <div class="content-card">
        <div class="card-header flex-between">
          <h3 class="card-title flex-center gap-xs">
            <i data-lucide="alert-octagon" class="text-warning"></i>
            <span>RAID Risk Register & Mitigations</span>
          </h3>
          <span class="badge badge-success">All Mitigated</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 6px;">
          ${riskRegister
            .map(
              (r) => `
            <div style="background: var(--bg-surface-subtle); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px;">
              <div class="flex-between" style="margin-bottom: 4px;">
                <span class="font-mono font-bold text-accent text-xs">${r.id}</span>
                <span class="badge badge-success text-xs font-mono">${r.status}</span>
              </div>
              <div class="font-semibold text-xs text-main" style="margin-bottom: 4px;">${r.risk}</div>
              <div class="text-xs text-muted" style="line-height: 1.45;"><strong>Mitigation:</strong> ${r.mitigation}</div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    </div>

    <!-- Scrum Ceremony Cadence & Working Agreements -->
    <div class="content-card animate-fade-in" style="margin-bottom: 24px;">
      <div class="card-header flex-between" style="margin-bottom: 16px;">
        <h3 class="card-title flex-center gap-xs">
          <i data-lucide="clock" class="text-accent"></i>
          <span>Agile Ceremonies Cadence & Team Working Agreement</span>
        </h3>
        <span class="badge badge-subtle">2-Week Sprint Cycle</span>
      </div>

      <div class="cadence-grid">
        <div class="cadence-card">
          <div class="flex-between" style="margin-bottom: 6px;">
            <span class="font-bold text-main">Sprint Planning</span>
            <span class="badge badge-accent font-mono text-xs">Day 1</span>
          </div>
          <div class="text-xs text-muted" style="margin-bottom: 6px;">Alternate Mondays @ 9:00 AM (3 hrs)</div>
          <p class="text-xs text-main">Review prioritized backlog, estimate story points via Planning Poker, and commit to Sprint Goal.</p>
        </div>

        <div class="cadence-card">
          <div class="flex-between" style="margin-bottom: 6px;">
            <span class="font-bold text-main">Daily Standup</span>
            <span class="badge badge-success font-mono text-xs">Daily</span>
          </div>
          <div class="text-xs text-muted" style="margin-bottom: 6px;">Mon–Fri @ 9:30 AM (15 mins)</div>
          <p class="text-xs text-main">Sync on yesterday's progress, today's focus, and raise immediate impediments to Scrum Master.</p>
        </div>

        <div class="cadence-card">
          <div class="flex-between" style="margin-bottom: 6px;">
            <span class="font-bold text-main">Sprint Review & Demo</span>
            <span class="badge badge-info font-mono text-xs">Day 10</span>
          </div>
          <div class="text-xs text-muted" style="margin-bottom: 6px;">Alternate Fridays @ 2:00 PM (1.5 hrs)</div>
          <p class="text-xs text-main">Live working software demonstration to executive stakeholders with DoD acceptance sign-off.</p>
        </div>

        <div class="cadence-card">
          <div class="flex-between" style="margin-bottom: 6px;">
            <span class="font-bold text-main">Sprint Retrospective</span>
            <span class="badge badge-warning font-mono text-xs">Day 10</span>
          </div>
          <div class="text-xs text-muted" style="margin-bottom: 6px;">Alternate Fridays @ 4:00 PM (1 hr)</div>
          <p class="text-xs text-main">Inspect and adapt: Went well, areas for improvement, and commit to 1 concrete action item.</p>
        </div>
      </div>
    </div>
  `;
}

function renderTeamCardsHtml() {
  const filtered = teamRoster.filter((m) => activeTeamRoleFilter === "all" || m.category === activeTeamRoleFilter);

  return filtered
    .map(
      (m) => `
    <div class="team-profile-card">
      <div>
        <div class="flex-between" style="margin-bottom: 12px;">
          <div class="flex-center gap-sm">
            <div class="team-avatar ${m.avatarClass}">${m.initials}</div>
            <div>
              <h4 class="font-bold text-main" style="font-size: 0.95rem; margin-bottom: 2px;">${m.name}</h4>
              <div class="text-xs text-muted font-medium">${m.role}</div>
            </div>
          </div>
          <span class="badge badge-subtle font-mono text-xs">${m.allocation}</span>
        </div>

        <p class="text-xs text-muted" style="line-height: 1.5; margin-bottom: 14px;">
          ${m.bio}
        </p>

        <div>
          <span class="text-xs font-mono font-bold text-accent uppercase">Core Sprint Deliverables:</span>
          <ul class="text-xs text-main" style="padding-left: 14px; margin-top: 6px; line-height: 1.5;">
            ${m.deliverables.map((d) => `<li>${d}</li>`).join("")}
          </ul>
        </div>
      </div>

      <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border-subtle);">
        <div class="flex-center gap-xs flex-wrap">
          ${m.skills.map((s) => `<span class="badge badge-subtle font-mono text-xs">${s}</span>`).join("")}
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

function getRaciClass(code) {
  if (code.includes("R")) return "raci-r";
  if (code.includes("A")) return "raci-a";
  if (code.includes("C")) return "raci-c";
  return "raci-i";
}

// ============================================================================
// EVENT HANDLERS & CHART INITIALIZATIONS
// ============================================================================
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

  // Charter tab events
  if (activeAgileTab === "charter") {
    // Role filter chips
    document.querySelectorAll("#team-filter-chips button").forEach((chip) => {
      chip.addEventListener("click", (e) => {
        activeTeamRoleFilter = e.currentTarget.dataset.roleFilter;
        document.querySelectorAll("#team-filter-chips button").forEach((c) => {
          if (c.dataset.roleFilter === activeTeamRoleFilter) {
            c.classList.add("active");
          } else {
            c.classList.remove("active");
          }
        });
        const rosterGrid = document.getElementById("team-roster-mount");
        if (rosterGrid) {
          rosterGrid.innerHTML = renderTeamCardsHtml();
          window.lucide.createIcons();
        }
      });
    });

    // Copy charter summary button
    const copyBtn = document.getElementById("btn-copy-charter");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const summary = `Retail Inventory Management System (RIMS) - Project Charter
Executive Sponsor: VP of Global Supply Chain Operations
Governance: Scrum 2-Week Sprints (15 Sprints, 8 Epics, 185 Story Points)
Key ROI: 99.4% Inventory Accuracy, 48h Order Fulfillment, $140k/yr Shrinkage Recovery
Core Team: 8 Cross-Functional Engineering Roles (100% On-Time Delivery)`;
        navigator.clipboard.writeText(summary);
        toast.success("Executive Project Charter summary copied to clipboard!");
      });
    }

    // Export charter JSON button
    const exportBtn = document.getElementById("btn-export-charter");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const agile = store.getAgileCaseStudy();
        const exportObj = {
          title: agile.projectTitle,
          framework: agile.framework,
          sprintsCompleted: agile.totalSprints,
          storyPointsDelivered: agile.totalStoryPoints,
          teamComposition: teamRoster,
          roiMetrics: {
            inventoryAccuracy: "99.4%",
            fulfillmentCycle: "48 Hours",
            shrinkageRecovery: "$140,000 / yr",
            otifDelivery: "98.8%"
          },
          tripleConstraints: {
            scope: "8 Epics, 38 Stories, 4 Core Algorithms, 15 Relational 3NF Tables",
            schedule: "15 Sprints (30 Weeks, 3 Major Releases)",
            budget: "7.5 FTE Engineering Allocation"
          }
        };
        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "RIMS_Project_Charter.json";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Project Charter exported as JSON!");
      });
    }
  }

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
