import { store } from "../state/store.js";
import { modals } from "./Modals.js";
import { toast } from "./Toast.js";
import Chart from "chart.js/auto";

let selectedRelease = "all"; // 'all', 'r1', 'r2', 'r3'
let selectedEpicFilter = "all";
let expandedSprintId = null;
let velocityChartInstance = null;

export function renderAgileView() {
  const agile = store.getAgileCaseStudy();
  const allSprints = agile.sprints;
  const epics = agile.epics;

  // Filter sprints
  let filteredSprints = allSprints.filter((s) => {
    if (selectedRelease === "r1" && (s.sprintNumber < 1 || s.sprintNumber > 5)) return false;
    if (selectedRelease === "r2" && (s.sprintNumber < 6 || s.sprintNumber > 10)) return false;
    if (selectedRelease === "r3" && (s.sprintNumber < 11 || s.sprintNumber > 15)) return false;

    if (selectedEpicFilter !== "all" && s.epicId !== selectedEpicFilter) return false;

    return true;
  });

  const totalPoints = allSprints.reduce((acc, s) => acc + s.completedPoints, 0);

  return `
    <div class="view-container animate-fade-in">
      <!-- Header -->
      <div class="view-header">
        <div>
          <div class="inline-flex-gap mb-1">
            <span class="badge badge-accent"><i data-lucide="award"></i> Capstone Case Study</span>
            <span class="badge badge-success"><i data-lucide="check-circle"></i> 100% Delivered</span>
            <span class="badge badge-subtle">Scrum Framework (2-Wk Sprints)</span>
          </div>
          <h1 class="view-title">Agile Delivery Framework (8 Epics • 15 Sprints)</h1>
          <p class="view-subtitle">End-to-end Scrum execution blueprint detailing sprint goals, ceremonies, Gherkin acceptance criteria, and team velocity.</p>
        </div>
        <div class="header-actions">
          <button id="btn-toggle-velocity" class="btn btn-secondary btn-sm">
            <i data-lucide="trending-up"></i>
            <span>Velocity & Burndown</span>
          </button>
        </div>
      </div>

      <!-- Agile Metrics Bar -->
      <div class="kpi-grid">
        <div class="kpi-card glass-panel">
          <div class="kpi-header">
            <span class="kpi-title">Total Epics</span>
            <div class="kpi-icon"><i data-lucide="layers"></i></div>
          </div>
          <div class="kpi-value text-accent">${agile.totalEpics}</div>
          <div class="kpi-footer text-muted">Across 4 core domains</div>
        </div>

        <div class="kpi-card glass-panel">
          <div class="kpi-header">
            <span class="kpi-title">Total Sprints</span>
            <div class="kpi-icon"><i data-lucide="calendar"></i></div>
          </div>
          <div class="kpi-value text-accent">${agile.totalSprints}</div>
          <div class="kpi-footer text-muted">30 weeks total cadence</div>
        </div>

        <div class="kpi-card glass-panel">
          <div class="kpi-header">
            <span class="kpi-title">Story Points Delivered</span>
            <div class="kpi-icon"><i data-lucide="check-check"></i></div>
          </div>
          <div class="kpi-value text-success">${totalPoints} SP</div>
          <div class="kpi-footer text-success">100% scope completion</div>
        </div>

        <div class="kpi-card glass-panel">
          <div class="kpi-header">
            <span class="kpi-title">Average Velocity</span>
            <div class="kpi-icon"><i data-lucide="gauge"></i></div>
          </div>
          <div class="kpi-value text-accent">${agile.velocityAvg} SP</div>
          <div class="kpi-footer text-muted">Variance: ±14%</div>
        </div>
      </div>

      <!-- Velocity Chart Container (Collapsible) -->
      <div id="velocity-chart-wrapper" class="glass-panel p-4 mb-4" style="display: none;">
        <div class="flex-between mb-3">
          <div>
            <h3 class="font-semibold text-lg">Sprint Velocity & Capacity Burndown</h3>
            <p class="text-xs text-muted">Planned Story Points vs Completed Points across all 15 Sprints</p>
          </div>
          <span class="badge badge-accent">185 SP Total</span>
        </div>
        <div style="height: 240px; position: relative;">
          <canvas id="agileVelocityChart"></canvas>
        </div>
      </div>

      <!-- Release Filters & Controls -->
      <div class="filter-bar glass-panel">
        <div class="filter-group">
          <span class="text-xs text-muted font-mono uppercase">Release Phase:</span>
          <div class="btn-group">
            <button class="btn btn-xs ${selectedRelease === "all" ? "btn-accent" : "btn-subtle"}" data-release="all">All Sprints (1-15)</button>
            <button class="btn btn-xs ${selectedRelease === "r1" ? "btn-accent" : "btn-subtle"}" data-release="r1">Release 1 (S1-S5): Catalog & Topology</button>
            <button class="btn btn-xs ${selectedRelease === "r2" ? "btn-accent" : "btn-subtle"}" data-release="r2">Release 2 (S6-S10): Procure-to-Pay</button>
            <button class="btn btn-xs ${selectedRelease === "r3" ? "btn-accent" : "btn-subtle"}" data-release="r3">Release 3 (S11-S15): Routing & Intelligence</button>
          </div>
        </div>

        <div class="filter-group">
          <span class="text-xs text-muted font-mono uppercase">Filter by Epic:</span>
          <select id="select-epic-filter" class="form-input form-select text-xs">
            <option value="all">All 8 Epics</option>
            ${epics.map((e) => `<option value="${e.id}" ${selectedEpicFilter === e.id ? "selected" : ""}>${e.code}: ${e.title}</option>`).join("")}
          </select>
        </div>
      </div>

      <!-- Sprints Grid -->
      <div class="sprint-list">
        ${filteredSprints
          .map((sprint) => {
            const epic = epics.find((e) => e.id === sprint.epicId) || {};
            const isExpanded = expandedSprintId === sprint.sprintNumber;
            const completionPct = Math.round((sprint.completedPoints / sprint.plannedPoints) * 100);

            return `
            <div class="sprint-card glass-panel ${isExpanded ? "expanded" : ""}" data-sprint="${sprint.sprintNumber}">
              <div class="sprint-header">
                <div class="sprint-title-area">
                  <div class="inline-flex-gap mb-1">
                    <span class="badge badge-accent font-mono">SPRINT ${sprint.sprintNumber}</span>
                    <span class="badge badge-subtle font-mono">${sprint.epicId}</span>
                    <span class="text-xs text-muted">${sprint.dates}</span>
                  </div>
                  <h3 class="sprint-name">${sprint.name}</h3>
                  <div class="sprint-epic-sub text-xs text-muted">
                    <strong>Epic Alignment:</strong> ${epic.title || sprint.epicId}
                  </div>
                </div>

                <div class="sprint-meta-area">
                  <div class="sprint-pts-pill">
                    <span class="pts-number">${sprint.completedPoints}/${sprint.plannedPoints}</span>
                    <span class="pts-label">Story Points</span>
                  </div>
                  <span class="badge badge-success">${completionPct}% Done</span>
                  <button class="btn-icon btn-toggle-sprint" data-sprint="${sprint.sprintNumber}" title="Expand/Collapse Sprint Details">
                    <i data-lucide="${isExpanded ? "chevron-up" : "chevron-down"}"></i>
                  </button>
                </div>
              </div>

              <!-- Sprint Goal -->
              <div class="sprint-goal-box">
                <div class="goal-label"><i data-lucide="target"></i> Sprint Goal</div>
                <div class="goal-text">${sprint.goal}</div>
              </div>

              <!-- Collapsible Section: Ceremonies & User Stories -->
              <div class="sprint-details ${isExpanded ? "show" : "hidden"}">
                <!-- Scrum Ceremonies Panel -->
                <div class="ceremonies-panel mb-3">
                  <div class="section-tag mb-2"><i data-lucide="message-square"></i> Scrum Ceremonies & Governance</div>
                  <div class="ceremonies-grid">
                    <div class="ceremony-box">
                      <div class="ceremony-title text-accent">Sprint Planning</div>
                      <p class="ceremony-desc">${sprint.ceremonies?.planning || "Story points calibrated and backlog committed."}</p>
                    </div>
                    <div class="ceremony-box">
                      <div class="ceremony-title text-warning">Daily Standup Highlight</div>
                      <p class="ceremony-desc">${sprint.ceremonies?.dailyStandup || "Technical impediments cleared in daily scrums."}</p>
                    </div>
                    <div class="ceremony-box">
                      <div class="ceremony-title text-info">Sprint Review / Stakeholder Demo</div>
                      <p class="ceremony-desc">${sprint.ceremonies?.review || "Working increment demonstrated to Product Owner."}</p>
                    </div>
                    <div class="ceremony-box">
                      <div class="ceremony-title text-success">Retrospective Outcome</div>
                      <p class="ceremony-desc"><strong>Action Item:</strong> ${sprint.ceremonies?.retrospective?.actionItem || "Continuous CI/CD refactoring."}</p>
                    </div>
                  </div>
                </div>

                <!-- User Stories Table -->
                <div class="user-stories-section">
                  <div class="section-tag mb-2"><i data-lucide="check-square"></i> Committed User Stories & Acceptance Criteria</div>
                  <div class="stories-list">
                    ${(sprint.stories || [])
                      .map((story) => {
                        const statusBadge =
                          story.status === "Done"
                            ? "badge-success"
                            : story.status === "In Progress"
                            ? "badge-accent"
                            : "badge-subtle";

                        return `
                        <div class="story-item glass-panel">
                          <div class="story-header flex-between">
                            <div class="inline-flex-gap">
                              <span class="badge font-mono text-xs">${story.id}</span>
                              <span class="story-title font-semibold">${story.title}</span>
                            </div>
                            <div class="inline-flex-gap">
                              <span class="badge badge-subtle font-mono text-xs">${story.points} SP</span>
                              <span class="badge ${statusBadge} text-xs">${story.status}</span>
                            </div>
                          </div>

                          <div class="story-statement text-xs mt-2">
                            <span class="text-accent font-semibold">As a</span> ${story.asA}, 
                            <span class="text-accent font-semibold">I want</span> ${story.iWant}, 
                            <span class="text-accent font-semibold">so that</span> ${story.soThat}.
                          </div>

                          <!-- Gherkin Criteria -->
                          <div class="gherkin-box mt-2">
                            <div class="text-xs text-muted font-mono uppercase mb-1">Acceptance Criteria (Gherkin):</div>
                            <ul class="gherkin-list text-xs">
                              ${(story.acceptanceCriteria || [])
                                .map((crit) => `<li><i data-lucide="chevron-right" class="icon-subtle"></i> <span>${crit}</span></li>`)
                                .join("")}
                            </ul>
                          </div>

                          <!-- Story Status Toggle -->
                          <div class="story-actions mt-2 flex-between">
                            <span class="text-xs text-muted">Change Status:</span>
                            <div class="btn-group">
                              <button class="btn btn-xs ${story.status === "To Do" ? "btn-accent" : "btn-subtle"} btn-story-status" data-sprint="${sprint.sprintNumber}" data-story="${story.id}" data-status="To Do">To Do</button>
                              <button class="btn btn-xs ${story.status === "In Progress" ? "btn-accent" : "btn-subtle"} btn-story-status" data-sprint="${sprint.sprintNumber}" data-story="${story.id}" data-status="In Progress">In Progress</button>
                              <button class="btn btn-xs ${story.status === "Done" ? "btn-success" : "btn-subtle"} btn-story-status" data-sprint="${sprint.sprintNumber}" data-story="${story.id}" data-status="Done">Done</button>
                            </div>
                          </div>
                        </div>
                      `;
                      })
                      .join("")}
                  </div>
                </div>
              </div>
            </div>
          `;
          })
          .join("")}
      </div>

      <!-- Team Composition & Governance Footnote -->
      <div class="glass-panel p-4 mt-5">
        <div class="flex-between mb-3">
          <div>
            <h3 class="font-semibold text-lg">Scrum Governance & Team Composition</h3>
            <p class="text-xs text-muted">Cross-functional squad allocated 100% dedicated to RIMS architecture delivery</p>
          </div>
          <span class="badge badge-accent">6 Full-Time Roles</span>
        </div>
        <div class="team-grid">
          ${agile.teamComposition
            .map(
              (m) => `
            <div class="team-member-card">
              <div class="text-xs text-muted uppercase font-mono">${m.role}</div>
              <div class="font-semibold text-sm">${m.name || `${m.count} Engineers`}</div>
              <div class="text-xs text-accent mt-1">${m.allocation} Dedicated</div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

export function initAgileEvents(container, refreshView) {
  // Release filter buttons
  container.querySelectorAll("[data-release]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      selectedRelease = e.currentTarget.dataset.release;
      refreshView();
    });
  });

  // Epic filter dropdown
  const epicSelect = container.querySelector("#select-epic-filter");
  if (epicSelect) {
    epicSelect.addEventListener("change", (e) => {
      selectedEpicFilter = e.target.value;
      refreshView();
    });
  }

  // Toggle sprint details expand/collapse
  container.querySelectorAll(".btn-toggle-sprint, .sprint-header").forEach((el) => {
    el.addEventListener("click", (e) => {
      const card = e.currentTarget.closest(".sprint-card");
      if (!card) return;
      const sprintNum = parseInt(card.dataset.sprint);
      expandedSprintId = expandedSprintId === sprintNum ? null : sprintNum;
      refreshView();
    });
  });

  // Toggle Velocity Chart
  const toggleVelocityBtn = container.querySelector("#btn-toggle-velocity");
  const velocityWrapper = container.querySelector("#velocity-chart-wrapper");
  if (toggleVelocityBtn && velocityWrapper) {
    toggleVelocityBtn.addEventListener("click", () => {
      const isVisible = velocityWrapper.style.display !== "none";
      velocityWrapper.style.display = isVisible ? "none" : "block";
      if (!isVisible) {
        initVelocityChart();
      }
    });
  }

  // Story status toggle
  container.querySelectorAll(".btn-story-status").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const sprintNum = parseInt(e.currentTarget.dataset.sprint);
      const storyId = e.currentTarget.dataset.story;
      const newStatus = e.currentTarget.dataset.status;

      store.updateStoryStatus(sprintNum, storyId, newStatus);
      toast.success(`Story ${storyId} marked as '${newStatus}'`);
      refreshView();
    });
  });
}

function initVelocityChart() {
  const canvas = document.getElementById("agileVelocityChart");
  if (!canvas) return;

  if (velocityChartInstance) {
    velocityChartInstance.destroy();
  }

  const agile = store.getAgileCaseStudy();
  const labels = agile.sprints.map((s) => `S${s.sprintNumber}`);
  const plannedData = agile.sprints.map((s) => s.plannedPoints);
  const completedData = agile.sprints.map((s) => s.completedPoints);

  velocityChartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Planned Story Points",
          data: plannedData,
          backgroundColor: "rgba(148, 163, 184, 0.4)",
          borderColor: "rgba(148, 163, 184, 0.8)",
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: "Completed Story Points",
          data: completedData,
          backgroundColor: "rgba(59, 130, 246, 0.85)",
          borderColor: "#3b82f6",
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "#94a3b8", font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            footer: (items) => {
              const sprintIndex = items[0].dataIndex;
              const sprint = agile.sprints[sprintIndex];
              return `Goal: ${sprint.goal.substring(0, 60)}...`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#64748b", font: { size: 10 } },
          grid: { display: false }
        },
        y: {
          ticks: { color: "#64748b", font: { size: 10 }, stepSize: 2 },
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          beginAtZero: true
        }
      }
    }
  });
}
