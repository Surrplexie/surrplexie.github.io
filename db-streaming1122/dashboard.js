// ===== Data =====

const DATES_30 = [
  'May 4','May 5','May 6','May 7','May 8','May 9','May 10',
  'May 11','May 12','May 13','May 14','May 15','May 16','May 17',
  'May 18','May 19','May 20','May 21','May 22','May 23','May 24',
  'May 25','May 26','May 27','May 28','May 29','May 30','May 31',
  'Jun 1','Jun 2',
];

const FOLLOWERS = {
  youtube:   [2100,2108,2115,2120,2128,2135,2140,2148,2155,2162,2170,2178,2185,2192,2200,2208,2215,2222,2230,2238,2245,2252,2260,2268,2275,2282,2290,2298,2305,2312],
  twitch:    [980,985,990,992,998,1002,1008,1012,1018,1022,1028,1032,1040,1045,1050,1055,1062,1068,1075,1080,1088,1092,1098,1105,1110,1118,1125,1130,1138,1145],
  tiktok:    [1240,1252,1255,1260,1264,1273,1277,1280,1292,1296,1307,1310,1323,1328,1330,1339,1348,1350,1363,1367,1377,1391,1392,1405,1415,1425,1435,1444,1462,1473],
  instagram: [820,822,825,828,830,833,835,838,840,842,845,848,850,852,855,858,860,862,865,868,870,872,875,878,880,882,885,888,890,893],
  snapchat:  [320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349],
};

const TOTAL_30 = DATES_30.map((_, i) =>
  FOLLOWERS.youtube[i] + FOLLOWERS.twitch[i] + FOLLOWERS.tiktok[i] +
  FOLLOWERS.instagram[i] + FOLLOWERS.snapchat[i]
);

const NEW_FOLLOWERS_30 = TOTAL_30.map((v, i) => i === 0 ? 0 : v - TOTAL_30[i - 1]);

const MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun'];
const INCOME   = [420, 580, 710, 890, 1240, 980];
const EXPENSES = [310, 450, 520, 640, 780,  620];
const SAVINGS  = [1200,1450,1680,1920,2340, 2700];

const PLATFORM_COLORS = {
  youtube:   '#ff4444',
  twitch:    '#9147ff',
  tiktok:    '#69c9d0',
  instagram: '#ff9800',
  snapchat:  '#ffd60a',
};

const C = {
  primary: '#00bcd4',
  success: '#4caf50',
  danger:  '#f44336',
  accent:  '#ff9800',
};

// ===== Helpers =====

function hexRgba(hex, a) {
  const n = parseInt(hex.replace('#',''), 16);
  return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
}

const GRID_COLOR = 'rgba(255,255,255,0.07)';
const TICK_STYLE = { color: '#666' };

// ===== Chart.js global defaults =====

Chart.defaults.color = '#888';
Chart.defaults.font.family = "'Roboto Mono', monospace";
Chart.defaults.font.size = 11;
Chart.defaults.plugins.legend.labels.boxWidth = 10;
Chart.defaults.plugins.legend.labels.padding = 12;
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(20,20,20,0.92)';
Chart.defaults.plugins.tooltip.titleColor = '#00bcd4';
Chart.defaults.plugins.tooltip.bodyColor = '#ccc';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.padding = 10;

// ===== State =====

const charts = {};
let currentRange = '30D';

function getSlice(arr) {
  return currentRange === '7D' ? arr.slice(-7) : arr.slice();
}

function getLabels() {
  return currentRange === '7D' ? DATES_30.slice(-7) : DATES_30.slice();
}

// ===== Chart init functions =====

function initFollowersTotal() {
  charts.followersTotal = new Chart(
    document.getElementById('chartFollowersTotal'), {
    type: 'line',
    data: {
      labels: getLabels(),
      datasets: [{
        label: 'Total Followers',
        data: getSlice(TOTAL_30),
        borderColor: C.primary,
        backgroundColor: hexRgba(C.primary, 0.08),
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: C.primary,
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: GRID_COLOR }, ticks: { ...TICK_STYLE, maxTicksLimit: 8 } },
        y: {
          grid: { color: GRID_COLOR },
          ticks: { ...TICK_STYLE, callback: v => v.toLocaleString() },
          beginAtZero: false,
        },
      },
      interaction: { mode: 'index', intersect: false },
    },
  });
}

function initDailyNew() {
  charts.dailyNew = new Chart(
    document.getElementById('chartDailyNew'), {
    type: 'bar',
    data: {
      labels: getLabels(),
      datasets: [{
        label: 'New Followers',
        data: getSlice(NEW_FOLLOWERS_30),
        backgroundColor: hexRgba(C.success, 0.65),
        borderColor: C.success,
        borderWidth: 1,
        borderRadius: 3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { ...TICK_STYLE, maxTicksLimit: 8 } },
        y: { grid: { color: GRID_COLOR }, ticks: TICK_STYLE, beginAtZero: true },
      },
      interaction: { mode: 'index', intersect: false },
    },
  });
}

function initByPlatform() {
  const keys   = ['youtube','twitch','tiktok','instagram','snapchat'];
  const labels = ['YouTube','Twitch','TikTok','Instagram','Snapchat'];

  charts.byPlatform = new Chart(
    document.getElementById('chartByPlatform'), {
    type: 'line',
    data: {
      labels: getLabels(),
      datasets: keys.map((key, i) => ({
        label: labels[i],
        data: getSlice(FOLLOWERS[key]),
        borderColor: PLATFORM_COLORS[key],
        backgroundColor: hexRgba(PLATFORM_COLORS[key], 0.05),
        fill: false,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: PLATFORM_COLORS[key],
        borderWidth: 2,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { grid: { color: GRID_COLOR }, ticks: { ...TICK_STYLE, maxTicksLimit: 8 } },
        y: {
          grid: { color: GRID_COLOR },
          ticks: { ...TICK_STYLE, callback: v => v.toLocaleString() },
          beginAtZero: false,
        },
      },
      interaction: { mode: 'index', intersect: false },
    },
  });
}

function initIncomeVsExp() {
  charts.incomeVsExp = new Chart(
    document.getElementById('chartIncomeVsExp'), {
    type: 'bar',
    data: {
      labels: MONTHS,
      datasets: [
        {
          label: 'Income',
          data: INCOME,
          backgroundColor: hexRgba(C.success, 0.65),
          borderColor: C.success,
          borderWidth: 1,
          borderRadius: 3,
        },
        {
          label: 'Expenses',
          data: EXPENSES,
          backgroundColor: hexRgba(C.danger, 0.65),
          borderColor: C.danger,
          borderWidth: 1,
          borderRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { color: '#888' },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: TICK_STYLE },
        y: {
          grid: { color: GRID_COLOR },
          ticks: { ...TICK_STYLE, callback: v => '$' + v },
          beginAtZero: true,
        },
      },
      interaction: { mode: 'index', intersect: false },
    },
  });
}

function initIncomeSource() {
  const values = [340, 280, 220, 90, 50];
  const total  = values.reduce((a, b) => a + b, 0);

  charts.incomeSource = new Chart(
    document.getElementById('chartIncomeSource'), {
    type: 'doughnut',
    data: {
      labels: ['Twitch subs/bits','YouTube AdSense','Sponsorship','TikTok gifts','Donations'],
      datasets: [{
        data: values,
        backgroundColor: [
          hexRgba(PLATFORM_COLORS.twitch,    0.8),
          hexRgba(PLATFORM_COLORS.youtube,   0.8),
          hexRgba(C.success,                  0.8),
          hexRgba(PLATFORM_COLORS.tiktok,    0.8),
          hexRgba(C.primary,                  0.8),
        ],
        borderColor: 'rgba(25,25,25,0.6)',
        borderWidth: 2,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#888', font: { size: 10 }, padding: 10 },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` $${ctx.parsed} (${Math.round(ctx.parsed / total * 100)}%)`,
          },
        },
      },
    },
  });
}

function initSavings() {
  charts.savings = new Chart(
    document.getElementById('chartSavings'), {
    type: 'line',
    data: {
      labels: MONTHS,
      datasets: [
        {
          label: 'Balance',
          data: SAVINGS,
          borderColor: C.primary,
          backgroundColor: hexRgba(C.primary, 0.1),
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointBackgroundColor: C.primary,
          borderWidth: 2,
        },
        {
          label: 'Goal $3,000',
          data: Array(MONTHS.length).fill(3000),
          borderColor: hexRgba(C.accent, 0.55),
          borderWidth: 1.5,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
          tension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { color: '#888' },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: TICK_STYLE },
        y: {
          grid: { color: GRID_COLOR },
          ticks: { ...TICK_STYLE, callback: v => '$' + v.toLocaleString() },
          beginAtZero: true,
        },
      },
      interaction: { mode: 'index', intersect: false },
    },
  });
}

function initNetProfit() {
  const netData = INCOME.map((v, i) => v - EXPENSES[i]);

  charts.netProfit = new Chart(
    document.getElementById('chartNetProfit'), {
    type: 'bar',
    data: {
      labels: MONTHS,
      datasets: [{
        label: 'Net Profit',
        data: netData,
        backgroundColor: netData.map(v => hexRgba(v >= 0 ? C.success : C.danger, 0.65)),
        borderColor:      netData.map(v => v >= 0 ? C.success : C.danger),
        borderWidth: 1,
        borderRadius: 3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: TICK_STYLE },
        y: {
          grid: { color: GRID_COLOR },
          ticks: { ...TICK_STYLE, callback: v => '$' + v },
          beginAtZero: true,
        },
      },
      interaction: { mode: 'index', intersect: false },
    },
  });
}

// ===== Audience chart range update =====

function updateAudienceCharts() {
  const labels = getLabels();

  charts.followersTotal.data.labels = labels;
  charts.followersTotal.data.datasets[0].data = getSlice(TOTAL_30);
  charts.followersTotal.update('active');

  charts.dailyNew.data.labels = labels;
  charts.dailyNew.data.datasets[0].data = getSlice(NEW_FOLLOWERS_30);
  charts.dailyNew.update('active');

  charts.byPlatform.data.labels = labels;
  ['youtube','twitch','tiktok','instagram','snapchat'].forEach((key, i) => {
    charts.byPlatform.data.datasets[i].data = getSlice(FOLLOWERS[key]);
  });
  charts.byPlatform.update('active');
}

document.querySelectorAll('.range-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentRange = btn.dataset.range;
    updateAudienceCharts();
  });
});

// ===== Platform toggles =====

document.querySelectorAll('.toggle-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    const idx  = parseInt(pill.dataset.platform, 10);
    const meta = charts.byPlatform.getDatasetMeta(idx);
    meta.hidden = !meta.hidden;
    pill.classList.toggle('active');
    pill.setAttribute('aria-pressed', String(!meta.hidden));
    charts.byPlatform.update();
  });
});

// ===== Progress bar animation =====

function animateProgressBars() {
  document.querySelectorAll('.progress-fill[data-animate]').forEach(el => {
    el.style.width = el.style.getPropertyValue('--target-w');
  });
}

// ===== Boot =====

initFollowersTotal();
initDailyNew();
initByPlatform();
initIncomeVsExp();
initIncomeSource();
initSavings();
initNetProfit();

setTimeout(animateProgressBars, 120);
