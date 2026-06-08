import {
  DASHBOARD_DATA,
  getTotalFollowers,
  getNewFollowersDaily,
  formatDateLabel,
  formatMoney,
  formatNumber,
} from "./data.js";

const state = {
  range: 30,
  section: "overview",
  platforms: new Set(Object.keys(DASHBOARD_DATA.platforms)),
};

const charts = {};

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: {
      labels: { color: "#8b949e", boxWidth: 12, padding: 14 },
    },
    tooltip: {
      backgroundColor: "#1c2128",
      borderColor: "#30363d",
      borderWidth: 1,
      titleColor: "#e6edf3",
      bodyColor: "#e6edf3",
    },
  },
  scales: {
    x: {
      ticks: { color: "#8b949e", maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
      grid: { color: "rgba(48,54,61,0.5)" },
    },
    y: {
      ticks: { color: "#8b949e" },
      grid: { color: "rgba(48,54,61,0.5)" },
    },
  },
};

function sliceByRange(arr) {
  return arr.slice(-state.range);
}

function getSlicedDates() {
  return sliceByRange(DASHBOARD_DATA.dates).map(formatDateLabel);
}

function getSlicedTotals() {
  return sliceByRange(getTotalFollowers(DASHBOARD_DATA));
}

function destroyChart(id) {
  if (charts[id]) {
    charts[id].destroy();
    delete charts[id];
  }
}

function makeLineChart(canvasId, labels, datasets, extra = {}) {
  const el = document.getElementById(canvasId);
  if (!el) return;
  destroyChart(canvasId);
  charts[canvasId] = new Chart(el, {
    type: "line",
    data: { labels, datasets },
    options: {
      ...chartDefaults,
      ...extra,
      plugins: { ...chartDefaults.plugins, ...extra.plugins },
      scales: { ...chartDefaults.scales, ...extra.scales },
    },
  });
}

function makeBarChart(canvasId, labels, datasets, extra = {}) {
  const el = document.getElementById(canvasId);
  if (!el) return;
  destroyChart(canvasId);
  charts[canvasId] = new Chart(el, {
    type: "bar",
    data: { labels, datasets },
    options: {
      ...chartDefaults,
      ...extra,
      plugins: { ...chartDefaults.plugins, ...extra.plugins },
      scales: { ...chartDefaults.scales, ...extra.scales },
    },
  });
}

function makeDoughnutChart(canvasId, labels, data, colors) {
  const el = document.getElementById(canvasId);
  if (!el) return;
  destroyChart(canvasId);
  charts[canvasId] = new Chart(el, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderWidth: 0 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: {
          position: "right",
          labels: { color: "#8b949e", boxWidth: 12, padding: 10 },
        },
        tooltip: chartDefaults.plugins.tooltip,
      },
    },
  });
}

function getPlatformDatasets() {
  return Object.entries(DASHBOARD_DATA.platforms)
    .filter(([name]) => state.platforms.has(name))
    .map(([name, p]) => ({
      label: name,
      data: sliceByRange(p.followers),
      borderColor: p.color,
      backgroundColor: p.color + "22",
      tension: 0.3,
      pointRadius: 2,
      pointHoverRadius: 5,
    }));
}

function lineTotalConfig(labels, totals) {
  return [
    {
      label: "Total followers",
      data: totals,
      borderColor: "#58a6ff",
      backgroundColor: "rgba(88,166,255,0.15)",
      fill: true,
      tension: 0.3,
      pointRadius: 2,
      pointHoverRadius: 5,
    },
  ];
}

function updateKpis() {
  const totals = getTotalFollowers(DASHBOARD_DATA);
  const sliced = sliceByRange(totals);
  const latest = sliced[sliced.length - 1];
  const growth = sliced.length > 1 ? latest - sliced[0] : 0;
  const income = DASHBOARD_DATA.finance.income.at(-1);
  const savings = DASHBOARD_DATA.finance.savings.at(-1);

  document.getElementById("kpi-total").textContent = formatNumber(latest);
  document.getElementById("kpi-growth").textContent = `+${formatNumber(growth)}`;
  document.getElementById("kpi-revenue").textContent = formatMoney(income);
  document.getElementById("kpi-savings").textContent = formatMoney(savings);
  document.getElementById("kpi-hours").textContent = `${DASHBOARD_DATA.hoursStreamed30d}h`;
}

function renderAudienceCharts() {
  const labels = getSlicedDates();
  const totals = getSlicedTotals();
  const newDaily = getNewFollowersDaily(totals);
  const platformDatasets = getPlatformDatasets();
  const platformLegend = { plugins: { legend: { ...chartDefaults.plugins.legend, position: "bottom" } } };

  ["chart-total-followers", "chart-total-followers-audience"].forEach((id) => {
    makeLineChart(id, labels, lineTotalConfig(labels, totals));
  });

  makeBarChart("chart-new-followers", labels, [
    {
      label: "New followers",
      data: newDaily,
      backgroundColor: "rgba(63,185,80,0.75)",
      borderRadius: 4,
    },
  ]);

  ["chart-platforms", "chart-platforms-audience"].forEach((id) => {
    makeLineChart(id, labels, platformDatasets, platformLegend);
  });
}

function renderFinanceCharts() {
  const { months, income, expenses, savings, investments, incomeBySource } = DASHBOARD_DATA.finance;
  const moneyY = {
    scales: {
      ...chartDefaults.scales,
      y: {
        ...chartDefaults.scales.y,
        ticks: { color: "#8b949e", callback: (v) => "$" + v },
      },
    },
  };
  const incomeExpenseDatasets = [
    { label: "Income", data: income, backgroundColor: "rgba(63,185,80,0.8)", borderRadius: 4 },
    { label: "Expenses", data: expenses, backgroundColor: "rgba(248,81,73,0.8)", borderRadius: 4 },
  ];

  ["chart-income-expense", "chart-income-expense-finance"].forEach((id) => {
    makeBarChart(id, months, incomeExpenseDatasets, moneyY);
  });

  const sourceColors = ["#9146ff", "#ff4444", "#3fb950", "#00f2ea", "#8b949e"];
  makeDoughnutChart(
    "chart-income-source",
    incomeBySource.map((s) => s.label),
    incomeBySource.map((s) => s.value),
    sourceColors,
  );

  makeLineChart("chart-savings", months, [
    {
      label: "Savings balance",
      data: savings,
      borderColor: "#3fb950",
      backgroundColor: "rgba(63,185,80,0.15)",
      fill: true,
      tension: 0.3,
      pointRadius: 4,
    },
  ], moneyY);

  makeBarChart("chart-investments", months, [
    {
      label: "Invested",
      data: investments,
      backgroundColor: "rgba(210,153,34,0.85)",
      borderRadius: 4,
    },
  ], {
    indexAxis: "y",
    scales: {
      x: {
        ticks: { color: "#8b949e", callback: (v) => "$" + v },
        grid: { color: "rgba(48,54,61,0.5)" },
      },
      y: { ticks: { color: "#8b949e" }, grid: { display: false } },
    },
  });

  const netProfit = income.map((inc, i) => inc - expenses[i]);
  makeBarChart("chart-net-profit", months, [
    {
      label: "Net profit",
      data: netProfit,
      backgroundColor: netProfit.map((v) => (v >= 0 ? "rgba(63,185,80,0.8)" : "rgba(248,81,73,0.8)")),
      borderRadius: 4,
    },
  ], moneyY);
}

function renderGoals() {
  const { trip, vod } = DASHBOARD_DATA.goals;
  const tripPct = Math.round((trip.saved / trip.budget) * 100);
  const vodPct = Math.round((vod.spent / vod.budget) * 100);

  document.getElementById("trip-name").textContent = trip.name;
  document.getElementById("trip-saved-label").textContent = `${formatMoney(trip.saved)} saved`;
  document.getElementById("trip-target-label").textContent = `Target: ${formatMoney(trip.budget)}`;
  document.getElementById("trip-fill").style.width = `${tripPct}%`;
  document.getElementById("trip-pct").textContent = `${tripPct}% funded`;
  document.getElementById("trip-remaining").textContent = formatMoney(trip.budget - trip.saved);
  document.getElementById("trip-date").textContent = new Date(trip.targetDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });

  document.getElementById("vod-spent-label").textContent = `${formatMoney(vod.spent)} spent`;
  document.getElementById("vod-target-label").textContent = `Budget: ${formatMoney(vod.budget)}`;
  document.getElementById("vod-fill").style.width = `${vodPct}%`;
  document.getElementById("vod-published").textContent = vod.published;
  document.getElementById("vod-queue").textContent = vod.inQueue;
  document.getElementById("vod-left").textContent = formatMoney(vod.budget - vod.spent);
}

function renderUpcomingTable() {
  const tbody = document.getElementById("upcoming-body");
  tbody.innerHTML = DASHBOARD_DATA.upcoming
    .map((row) => {
      const statusClass = row.status.toLowerCase();
      return `<tr>
        <td>${formatDateLabel(row.date)}</td>
        <td>${row.platform}</td>
        <td>${row.title}</td>
        <td><span class="status-badge ${statusClass}">${row.status}</span></td>
        <td>${row.notes}</td>
      </tr>`;
    })
    .join("");
}

function bindPlatformFilters(containerId) {
  const container = document.getElementById(containerId);
  if (!container || container.dataset.bound) return;
  container.dataset.bound = "1";

  container.innerHTML = Object.entries(DASHBOARD_DATA.platforms)
    .map(([name, p]) => {
      const checked = state.platforms.has(name) ? "checked" : "";
      const off = state.platforms.has(name) ? "" : "off";
      return `<label class="platform-chip ${off}" data-platform="${name}">
        <input type="checkbox" ${checked} />
        <span style="color:${p.color}">&#9679;</span> ${name}
      </label>`;
    })
    .join("");

  container.querySelectorAll(".platform-chip").forEach((chip) => {
    chip.addEventListener("click", (e) => {
      if (e.target.tagName === "INPUT") return;
      const input = chip.querySelector("input");
      input.checked = !input.checked;
      input.dispatchEvent(new Event("change"));
    });
    chip.querySelector("input").addEventListener("change", (e) => {
      const name = chip.dataset.platform;
      if (e.target.checked) state.platforms.add(name);
      else state.platforms.delete(name);
      syncPlatformChips();
      renderAudienceCharts();
    });
  });
}

function syncPlatformChips() {
  document.querySelectorAll(".platform-chip").forEach((chip) => {
    const name = chip.dataset.platform;
    const on = state.platforms.has(name);
    chip.classList.toggle("off", !on);
    const input = chip.querySelector("input");
    if (input) input.checked = on;
  });
}

function resizeVisibleCharts() {
  Object.values(charts).forEach((chart) => {
    if (chart.canvas.offsetParent !== null) chart.resize();
  });
}

function renderAll() {
  updateKpis();
  renderAudienceCharts();
  renderFinanceCharts();
  renderGoals();
  renderUpcomingTable();
  requestAnimationFrame(resizeVisibleCharts);
}

function setSection(section) {
  state.section = section;
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.section === section);
  });
  document.querySelectorAll(".section").forEach((el) => {
    el.classList.toggle("active", el.id === `section-${section}`);
  });
  requestAnimationFrame(resizeVisibleCharts);
}

function setRange(days) {
  state.range = days;
  document.querySelectorAll("[data-range]").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.range) === days);
  });
  document.getElementById("updated-pill").textContent =
    `Last ${days} days · updated ${formatDateLabel(DASHBOARD_DATA.updated)}`;
  renderAll();
}

function initControls() {
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => setSection(tab.dataset.section));
  });
  document.querySelectorAll("[data-range]").forEach((btn) => {
    btn.addEventListener("click", () => setRange(Number(btn.dataset.range)));
  });
}

function init() {
  bindPlatformFilters("platform-filters");
  bindPlatformFilters("platform-filters-audience");
  initControls();
  document.getElementById("updated-pill").textContent =
    `Last ${state.range} days · updated ${formatDateLabel(DASHBOARD_DATA.updated)}`;
  renderAll();
  setSection("overview");
}

init();
