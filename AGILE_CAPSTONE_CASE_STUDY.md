# Retail Inventory Management System (RIMS)
## Agile Capstone Case Study: Scrum Delivery Blueprint
**8 Epics | 15 Sprints | 30 Weeks | 185 Story Points**

---

### Executive Overview
This Agile Capstone Case Study details the delivery of the enterprise **Retail Inventory Management System (RIMS)**. The initiative was planned and executed using Scrum across **8 Business Epics** and **15 Two-Week Sprints** (organized into 3 distinct Release Milestones).

```
+--------------------------------------------------------------------------------------------------+
|                                AGILE RELEASE ROADMAP OVERVIEW                                    |
+--------------------------------------------------------------------------------------------------+
|  RELEASE 1 (Sprints 1 - 5)   | Foundation, Product Catalog (PIM), Multi-Warehouse Facilities,    |
|  "Core Inventory & Topology" | Real-Time Stock Ledgers, and Cycle Count Audits.                  |
+------------------------------+-------------------------------------------------------------------+
|  RELEASE 2 (Sprints 6 - 10)  | Supplier Relationship Management, Automated Reorder Points (ROP), |
|  "Procure-to-Pay & Intake"   | Inbound Goods Receipt Notes (GRN), and Omnichannel Order Intake.  |
+------------------------------+-------------------------------------------------------------------+
|  RELEASE 3 (Sprints 11 - 15) | Intelligent Multi-Node Fulfillment, Wave Picking & Packing Station|
|  "Fulfillment & Analytics"   | Reverse Logistics (RMA), Valuation Engine, and System Hardening.  |
+--------------------------------------------------------------------------------------------------+
```

---

## 1. Scrum Team Topology & Resource Allocation

| Role | Name / Title | Allocation | Primary Responsibility |
|---|---|---|---|
| **Product Owner** | David Sterling, CSPO | 100% | Epics definition, backlog prioritization, stakeholder demos, acceptance sign-off. |
| **Scrum Master** | Samantha Briggs, CSM | 100% | Agile ceremony facilitation, impediment removal, team velocity & burndown tracking. |
| **Tech Lead / Architect** | Kavita Sharma | 100% | System architecture, C4 design, database normalization, concurrency locking. |
| **Senior Full-Stack Dev 1** | Marcus Vance | 100% | Product Catalog (PIM), Supplier management, and RESTful API endpoints. |
| **Senior Full-Stack Dev 2** | Elena Rostova | 100% | Multi-warehouse bin topology, real-time stock ledger, and valuation engine. |
| **Senior Full-Stack Dev 3** | Tariq Al-Mansoor | 100% | Order allocation algorithm, pick-pack-ship stage-gate, and carrier integrations. |
| **QA Automation Lead** | Chloe Chen | 100% | Automated regression suites, end-to-end Cypress/Playwright tests, API contract testing. |
| **DevOps / SRE Specialist** | Liam O'Connor | 50% | CI/CD pipelines, Docker containerization, Kubernetes manifests, observability. |

---

## 2. The 8 Epics Breakdown

### EPIC-1: Product Information Management (PIM) & Unified Catalog
- **Epic ID**: `EP-01` | **Story Points**: 25 | **Sprints Involved**: Sprint 1, Sprint 2
- **Business Problem**: Retailers struggle with fragmented SKU data across channels, causing pricing mismatches and duplicate items.
- **Scope & Objectives**: Centralized product master, automated SKU generator, barcode (EAN-13/UPC) validator, dynamic gross margin calculations, multi-level category taxonomy, and physical dimension specifications.
- **Business Value Delivered**: 100% SKU consistency across eCommerce and POS, reducing new item onboarding time from 3 days to 15 minutes.

### EPIC-2: Multi-Warehouse Facility Modeling & Dynamic Bin Topology
- **Epic ID**: `EP-02` | **Story Points**: 23 | **Sprints Involved**: Sprint 3, Sprint 9
- **Business Problem**: Lack of bin-level location tracking creates excessive travel time for warehouse pickers and inventory misplacement.
- **Scope & Objectives**: Hierarchical facility modeling (Distribution Centers, Regional Hubs, Retail Backrooms), spatial zone categorization (Fast-Pick, Bulk Pallet, Temperature Controlled, Hazardous), coordinate-based bin addressing (`Zone-Aisle-Shelf-Bin`), and real-time volumetric capacity utilization tracking.
- **Business Value Delivered**: Warehouse picker travel distance reduced by 34%; storage utilization increased by 28%.

### EPIC-3: Real-Time Stock Tracking, Lot Control & Cycle Count Audits
- **Epic ID**: `EP-03` | **Story Points**: 26 | **Sprints Involved**: Sprint 4, Sprint 5
- **Business Problem**: Phantom inventory and discrepancies between physical stock and software records cause high rates of stockouts.
- **Scope & Objectives**: Real-time multi-warehouse stock ledger, distinction between Stock On Hand ($SOH$), Reserved ($RES$), and Available to Promise ($ATP = SOH - RES$), lot/batch expiration tracking, and digital cycle count variance reconciliation with immutable audit logs.
- **Business Value Delivered**: Inventory record accuracy increased from 82.3% to 99.4%; inventory shrinkage reduced by 40%.

### EPIC-4: Supplier Relationship Management (SRM) & Procure-to-Pay
- **Epic ID**: `EP-04` | **Story Points**: 27 | **Sprints Involved**: Sprint 6, Sprint 7, Sprint 8
- **Business Problem**: Manual purchase ordering leads to delayed replenishments, stockouts during peak seasons, and untracked supplier SLA compliance.
- **Scope & Objectives**: Approved vendor directory with lead-time tracking and reliability scoring, automated Reorder Point ($ROP$) triggers, multi-line Purchase Order (PO) creation, vendor dispatch workflows, and Goods Receipt Notes (GRN) with automatic inventory staging.
- **Business Value Delivered**: Procurement cycle time decreased from 14 days to 48 hours; vendor on-time delivery compliance tracked in real time.

### EPIC-5: Omnichannel Order Ingestion & Intelligent Multi-Node Fulfillment
- **Epic ID**: `EP-05` | **Story Points**: 28 | **Sprints Involved**: Sprint 10, Sprint 11
- **Business Problem**: Orders routed to sub-optimal warehouses create high freight shipping costs and lengthy transit times.
- **Scope & Objectives**: Multi-channel order ingestion (Web, Store POS, Mobile, Marketplaces), automated heuristic routing algorithm evaluating distance, stock availability, and split-shipment minimization, and atomic stock reservation locking with optimistic concurrency control.
- **Business Value Delivered**: Average order transit time reduced by 1.8 days; split-shipment freight overhead reduced by 22%.

### EPIC-6: Warehouse Operations: Wave Picking, Packing Station & Dispatch
- **Epic ID**: `EP-06` | **Story Points**: 25 | **Sprints Involved**: Sprint 12, Sprint 13
- **Business Problem**: Manual paper pick sheets result in high pick error rates and order fulfillment bottlenecks.
- **Scope & Objectives**: Digital wave picking sheets with optimized bin navigation pathing, pack station barcode verification, digital packing slip generation, and carrier manifest integration with tracking number generation.
- **Business Value Delivered**: Picker throughput increased from 45 lines/hr to 110 lines/hr; pick error rate dropped below 0.1%.

### EPIC-7: Reverse Logistics: RMA Processing, Quality Inspection & Restocking
- **Epic ID**: `EP-07` | **Story Points**: 16 | **Sprints Involved**: Sprint 14
- **Business Problem**: Customer returns accumulate in warehouses without inspection, destroying salvage value and delaying customer refunds.
- **Scope & Objectives**: Return Merchandise Authorization (RMA) tracking, multi-grade condition inspection (Restock to Shelf, Minor Rework, Quarantine, Scrap), automated stock re-ingestion, and refund trigger notifications.
- **Business Value Delivered**: Returns processing time reduced from 9 days to 24 hours; salvage recovery value increased by 35%.

### EPIC-8: Executive Inventory Analytics, Demand Forecasting & System Hardening
- **Epic ID**: `EP-08` | **Story Points**: 15 | **Sprints Involved**: Sprint 15
- **Business Problem**: Executives lack consolidated visibility into inventory capital tie-up, stock turns, and valuation under GAAP/IFRS standards.
- **Scope & Objectives**: Executive dashboard featuring Total Inventory Valuation (dual FIFO and Moving Average AVCO models), stock turnover ratios, low-stock risk radar, high-margin SKU analysis, and full end-to-end system hardening and penetration testing.
- **Business Value Delivered**: Real-time capital allocation insights; compliance with GAAP inventory reporting standards.

---

## 3. Sprint-by-Sprint Implementation Blueprint (15 Sprints)

### RELEASE 1: FOUNDATION, CATALOG & WAREHOUSE TOPOLOGY (Sprints 1 - 5)

#### Sprint 1: Core Catalog Architecture & PIM Schema
- **Dates**: Days 1–10 | **Epic**: `EP-01` | **Planned**: 12 SP | **Completed**: 12 SP
- **Sprint Goal**: Establish normalized relational schemas for products, implement automated SKU generation, and validate EAN-13/UPC barcodes.
- **Ceremonies**:
  - *Planning*: Defined team Definition of Done (DoD) and established Trunk-based Git branching.
  - *Daily Standup*: Addressed database normalization for variable product attributes; resolved via hybrid indexed columns and JSONB attributes.
  - *Review*: Demoed working SKU generator and barcode validator to retail merchandising stakeholders with 100% acceptance.
  - *Retrospective*: Went Well: fast schema consensus; Could Improve: unit test coverage lagged; Action Item: adopt TDD in Sprint 2.
- **User Stories**:
  - `US-101`: Automated SKU & Barcode Engine (5 SP) — Gherkin: *Given category and brand, when a product is registered, then auto-generate unique SKU; enforce EAN-13 checksum.*
  - `US-102`: Cost, Price & Margin Computation (4 SP) — Gherkin: *Given Cost Price and Selling Price, then calculate gross margin %; flag margins < 25%.*
  - `US-103`: UOM & Physical Dimensions (3 SP) — Gherkin: *Given product specs, store weight in kg and dimensions in cm for spatial packing calculations.*

#### Sprint 2: Category Hierarchy, Search & Filtering
- **Dates**: Days 11–20 | **Epic**: `EP-01` | **Planned**: 13 SP | **Completed**: 13 SP
- **Sprint Goal**: Implement multi-tier category taxonomy, brand filtering, fast search indexing, and CSV catalog bulk export.
- **Ceremonies**:
  - *Planning*: Prioritized search latency SLA (< 50ms) across 10,000 SKUs.
  - *Daily Standup*: Explored client-side search vs server-side index; implemented debounced multi-field substring search.
  - *Review*: Merchandisers successfully searched and exported 500+ mock SKUs in under 2 seconds.
  - *Retrospective*: Went Well: TDD reduced bug count to zero; Could Improve: export memory footprint; Action Item: stream large CSVs.
- **User Stories**:
  - `US-201`: Multi-Tier Category Taxonomy (5 SP) — Gherkin: *Given root and child categories, allow hierarchical classification with breadcrumb navigation.*
  - `US-202`: Instant Substring Multi-Field Search (5 SP) — Gherkin: *When typing into search input, filter catalog by name, SKU, barcode, and brand within 50ms.*
  - `US-203`: CSV Catalog Export (3 SP) — Gherkin: *When clicking 'Export CSV', generate formatted CSV file containing filtered catalog view.*

#### Sprint 3: Multi-Warehouse Facility Modeling & Capacity Topology
- **Dates**: Days 21–30 | **Epic**: `EP-02` | **Planned**: 12 SP | **Completed**: 12 SP
- **Sprint Goal**: Model multiple physical distribution centers with location metadata, operational types, and capacity tracking.
- **Ceremonies**:
  - *Planning*: Established facility hierarchy: Central DC, Regional Fulfillment, and Retail Store Backrooms.
  - *Daily Standup*: Addressed geographic coordinate storage for distance calculation in fulfillment.
  - *Review*: Operations team inspected multi-warehouse facility cards with real-time capacity meters.
  - *Retrospective*: Went Well: clean domain modeling; Action Item: prepare bin-level coordinate addressing for Sprint 9.
- **User Stories**:
  - `US-301`: Facility Entity & Metadata Registry (5 SP) — Gherkin: *Given warehouse address and square footage, store operational parameters and facility type.*
  - `US-302`: Real-Time Facility Capacity Metering (4 SP) — Gherkin: *When stock is added, calculate volumetric and bin utilization % against facility capacity limits.*
  - `US-303`: Multi-Warehouse Facility Switching (3 SP) — Gherkin: *Allow operators to seamlessly toggle between distribution center views.*

#### Sprint 4: Real-Time Stock Ledger & Available to Promise (ATP) Engine
- **Dates**: Days 31–40 | **Epic**: `EP-03` | **Planned**: 14 SP | **Completed**: 14 SP
- **Sprint Goal**: Build the core atomic inventory ledger distinguishing On Hand, Reserved, and Available to Promise ($ATP$).
- **Ceremonies**:
  - *Planning*: Designed strict transactional invariants to guarantee $ATP \ge 0$ at all times.
  - *Daily Standup*: Discussed optimistic concurrency control vs pessimistic row locks; chose version column with OCC.
  - *Review*: Demonstrated concurrent simulated checkouts with zero double-allocation errors.
  - *Retrospective*: Went Well: concurrency benchmarks passed; Action Item: integrate lot tracking in Sprint 5.
- **User Stories**:
  - `US-401`: Real-Time ATP Calculation Engine (6 SP) — Gherkin: *Given $SOH$ and $RES$, compute $ATP = SOH - RES$; reject reservations exceeding ATP.*
  - `US-402`: Optimistic Concurrency Control (5 SP) — Gherkin: *When two transactions update stock simultaneously, increment version number and retry on conflict.*
  - `US-403`: Immutable Stock Movement Audit Log (3 SP) — Gherkin: *Log every stock debit, credit, or transfer with timestamp, actor, and before/after delta.*

#### Sprint 5: Lot / Batch Control & Cycle Counting Reconciliation
- **Dates**: Days 41–50 | **Epic**: `EP-03` | **Planned**: 12 SP | **Completed**: 12 SP
- **Sprint Goal**: Implement lot/batch numbers with expiration dates, and cycle count variance adjustment workflows.
- **Ceremonies**:
  - *Planning*: Defined cycle counting frequency (A-items weekly, B-items monthly, C-items quarterly).
  - *Daily Standup*: Handled damaged goods quarantine bin logic during reconciliation.
  - *Review*: Finance and warehouse managers reviewed cycle count audit reports.
  - *Retrospective*: Release 1 completed on time with 100% velocity!
- **User Stories**:
  - `US-501`: Lot & Expiration Tracking (5 SP) — Gherkin: *Record inbound lot number, expiry date, and supplier batch ID for every stock ingestion.*
  - `US-502`: Cycle Count Variance Adjustment (4 SP) — Gherkin: *Given physical count vs system count delta, record discrepancy reason and adjust ledger.*
  - `US-503`: Low-Stock Alert Generation (3 SP) — Gherkin: *When $ATP \le ROP$, trigger real-time warning badges in UI.*

---

### RELEASE 2: PROCURE-TO-PAY, INBOUND & ORDER INTAKE (Sprints 6 - 10)

#### Sprint 6: Supplier Directory & SLA Performance Tracking
- **Dates**: Days 51–60 | **Epic**: `EP-04` | **Planned**: 10 SP | **Completed**: 10 SP
- **Sprint Goal**: Build vendor directory with lead times, payment terms, and vendor on-time delivery scorecards.
- **User Stories**:
  - `US-601`: Vendor Registry & Contact Profiles (4 SP)
  - `US-602`: Supplier Lead Time & Reliability Rating (4 SP)
  - `US-603`: Preferred Supplier per SKU Mapping (2 SP)

#### Sprint 7: Purchase Order (PO) Lifecycle Engine
- **Dates**: Days 61–70 | **Epic**: `EP-04` | **Planned**: 10 SP | **Completed**: 10 SP
- **Sprint Goal**: Implement multi-line PO generation, status transitions, and PDF purchase requisition formatting.
- **User Stories**:
  - `US-701`: Multi-Item PO Drafting & Tax Computation (5 SP)
  - `US-702`: PO Approval & Vendor Dispatch Workflow (3 SP)
  - `US-703`: Expected Delivery Scheduling (2 SP)

#### Sprint 8: Inbound Goods Receiving (GRN) & Automated Staging
- **Dates**: Days 71–80 | **Epic**: `EP-04` | **Planned**: 7 SP | **Completed**: 7 SP
- **Sprint Goal**: Inbound receiving interface with short-shipment handling and instant stock ledger credit.
- **User Stories**:
  - `US-801`: Inbound Goods Receipt Note (GRN) Ingestion (4 SP)
  - `US-802`: Partial Receiving & Backorder Tracking (3 SP)

#### Sprint 9: Spatial Bin Topology & Coordinate Addressing
- **Dates**: Days 81–90 | **Epic**: `EP-02` | **Planned**: 11 SP | **Completed**: 11 SP
- **Sprint Goal**: Granular bin coordinates (`Zone-Aisle-Shelf-Bin`) and visual warehouse occupancy mapping.
- **User Stories**:
  - `US-901`: 4-Coordinate Bin Addressing Engine (5 SP)
  - `US-902`: Dedicated Fast-Pick vs Bulk Storage Zoning (3 SP)
  - `US-903`: Visual Bin Occupancy Heatmap (3 SP)

#### Sprint 10: Omnichannel Sales Order Ingestion & Reservation
- **Dates**: Days 91–100 | **Epic**: `EP-05` | **Planned**: 14 SP | **Completed**: 14 SP
- **Sprint Goal**: Omnichannel order intake pipeline with immediate atomic stock reservation locking.
- **User Stories**:
  - `US-1001`: Multi-Channel Order Ingestion Endpoint (5 SP)
  - `US-1002`: Atomic Inventory Reservation on Checkout (5 SP)
  - `US-1003`: Order Fulfillment SLA Tracker (4 SP)

---

### RELEASE 3: INTELLIGENT FULFILLMENT, REVERSE LOGISTICS & HARDENING (Sprints 11 - 15)

#### Sprint 11: Intelligent Multi-Node Allocation & Routing Engine
- **Dates**: Days 101–110 | **Epic**: `EP-05` | **Planned**: 14 SP | **Completed**: 14 SP
- **Sprint Goal**: Multi-warehouse routing algorithm optimizing for geographic proximity and zero split shipments.
- **User Stories**:
  - `US-1101`: Proximity & Distance Calculation Matrix (5 SP)
  - `US-1102`: Split-Shipment Penalty Minimization Algorithm (5 SP)
  - `US-1103`: Manual Allocation Override by Operations Lead (4 SP)

#### Sprint 12: Wave Picking & Bin Path Optimization
- **Dates**: Days 111–120 | **Epic**: `EP-06` | **Planned**: 13 SP | **Completed**: 13 SP
- **Sprint Goal**: Digital pick lists ordered by bin location coordinates to minimize warehouse travel distance.
- **User Stories**:
  - `US-1201`: Wave Picking Batch Generation (5 SP)
  - `US-1202`: Optimized Bin Route Traversal Sequence (5 SP)
  - `US-1203`: Mobile Barcode Pick Confirmation (3 SP)

#### Sprint 13: Packing Station Verification & Carrier Dispatch
- **Dates**: Days 121–130 | **Epic**: `EP-06` | **Planned**: 12 SP | **Completed**: 12 SP
- **Sprint Goal**: Barcode scan pack verification, digital packing slip generation, and carrier tracking dispatch.
- **User Stories**:
  - `US-1301`: Scan-to-Pack Item Verification (4 SP)
  - `US-1302`: Packing Slip & Shipping Label Generation (4 SP)
  - `US-1303`: Carrier Tracking & Final Stock SOH Debit (4 SP)

#### Sprint 14: Reverse Logistics: RMA & Quality Inspection
- **Dates**: Days 131–140 | **Epic**: `EP-07` | **Planned**: 16 SP | **Completed**: 16 SP
- **Sprint Goal**: Return Merchandise Authorization (RMA) processing, item grading, and restock to inventory.
- **User Stories**:
  - `US-1401`: RMA Initiation & Return Tracking (5 SP)
  - `US-1402`: Quality Inspection & Grading (Restock/Quarantine/Scrap) (6 SP)
  - `US-1403`: Restock Ledger Integration & Refund Triggers (5 SP)

#### Sprint 15: Executive Analytics, Inventory Valuation & System Hardening
- **Dates**: Days 141–150 | **Epic**: `EP-08` | **Planned**: 15 SP | **Completed**: 15 SP
- **Sprint Goal**: Executive KPI dashboard, dual FIFO vs Moving Average valuation models, and final capstone polish.
- **User Stories**:
  - `US-1501`: Dual FIFO vs AVCO Valuation Engine (6 SP)
  - `US-1502`: Executive KPI Intelligence & Stock Turnover Dashboard (5 SP)
  - `US-1503`: System Hardening, Penetration Testing & Capstone Wrap-up (4 SP)

---

## 4. Scrum Ceremonies & Agile Governance

### 4.1 Definition of Ready (DoR)
A user story is Ready for sprint planning only if:
1. Business value and user role (`As a... I want... So that...`) are clearly stated.
2. Formal Gherkin acceptance criteria (`Given-When-Then`) are documented and approved by the Product Owner.
3. Dependencies (API contracts, schema changes, UX designs) are identified.
4. Estimated by the engineering team in Fibonacci story points ($1, 2, 3, 5, 8, 13$).
5. Small enough to be completed within a single sprint ($< 13\text{ SP}$).

### 4.2 Definition of Done (DoD)
A user story is Done only if:
1. Code written satisfies all acceptance criteria.
2. Unit tests achieve $> 85\%$ line coverage; critical allocation and ledger functions achieve $100\%$.
3. Integration and regression tests pass in CI/CD pipeline.
4. Code passes peer review with at least 1 Senior Engineer approval.
5. No critical or high severity static analysis security warnings.
6. Deployed and verified in the staging environment.
7. Acceptance demo signed off by Product Owner.

---

## 5. Team Velocity & Burndown Analysis

- **Total Story Points Delivered**: 185 SP
- **Total Sprints**: 15 Sprints
- **Average Velocity**: $12.33\text{ SP/sprint}$
- **Sprint Velocity Distribution**:
  - Sprint 1: 12 SP
  - Sprint 2: 13 SP
  - Sprint 3: 12 SP
  - Sprint 4: 14 SP
  - Sprint 5: 12 SP
  - Sprint 6: 10 SP
  - Sprint 7: 10 SP
  - Sprint 8: 7 SP
  - Sprint 9: 11 SP
  - Sprint 10: 14 SP
  - Sprint 11: 14 SP
  - Sprint 12: 13 SP
  - Sprint 13: 12 SP
  - Sprint 14: 16 SP
  - Sprint 15: 15 SP
- **Velocity Stability**: Velocity variation maintained within $\pm 15\%$ after Sprint 3, demonstrating mature Agile estimation and predictable delivery cadences.
