export const DASHBOARD_DATA = {
  updated: "2026-06-02",
  dates: [
    "2026-05-04", "2026-05-05", "2026-05-06", "2026-05-07", "2026-05-08", "2026-05-09", "2026-05-10",
    "2026-05-11", "2026-05-12", "2026-05-13", "2026-05-14", "2026-05-15", "2026-05-16", "2026-05-17",
    "2026-05-18", "2026-05-19", "2026-05-20", "2026-05-21", "2026-05-22", "2026-05-23", "2026-05-24",
    "2026-05-25", "2026-05-26", "2026-05-27", "2026-05-28", "2026-05-29", "2026-05-30", "2026-05-31",
    "2026-06-01", "2026-06-02",
  ],
  platforms: {
    YouTube: {
      color: "#ff4444",
      followers: [
        2100, 2108, 2115, 2120, 2128, 2135, 2140, 2148, 2155, 2162,
        2170, 2178, 2185, 2192, 2200, 2208, 2215, 2222, 2230, 2238,
        2245, 2252, 2260, 2268, 2275, 2282, 2290, 2298, 2305, 2312,
      ],
    },
    Twitch: {
      color: "#9146ff",
      followers: [
        980, 985, 990, 992, 998, 1002, 1008, 1012, 1018, 1022,
        1028, 1032, 1040, 1045, 1050, 1055, 1062, 1068, 1075, 1080,
        1088, 1092, 1098, 1105, 1110, 1118, 1125, 1130, 1138, 1145,
      ],
    },
    TikTok: {
      color: "#00f2ea",
      followers: [
        1240, 1252, 1255, 1260, 1264, 1273, 1277, 1280, 1292, 1296,
        1307, 1310, 1323, 1328, 1330, 1339, 1348, 1350, 1363, 1367,
        1377, 1391, 1392, 1405, 1415, 1425, 1435, 1444, 1462, 1473,
      ],
    },
    Instagram: {
      color: "#e1306c",
      followers: [
        820, 822, 825, 828, 830, 833, 835, 838, 840, 842,
        845, 848, 850, 852, 855, 858, 860, 862, 865, 868,
        870, 872, 875, 878, 880, 882, 885, 888, 890, 893,
      ],
    },
    Snapchat: {
      color: "#fffc00",
      followers: [
        320, 321, 322, 323, 324, 325, 326, 327, 328, 329,
        330, 331, 332, 333, 334, 335, 336, 337, 338, 339,
        340, 341, 342, 343, 344, 345, 346, 347, 348, 349,
      ],
    },
  },
  finance: {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    income: [420, 580, 710, 890, 1240, 980],
    expenses: [310, 450, 520, 640, 780, 620],
    savings: [1200, 1450, 1680, 1920, 2340, 2700],
    investments: [450, 200, 680, 120, 350, 90],
    incomeBySource: [
      { label: "Twitch subs/bits", value: 340 },
      { label: "YouTube AdSense", value: 280 },
      { label: "Sponsorship", value: 220 },
      { label: "TikTok / gifts", value: 90 },
      { label: "Donations", value: 50 },
    ],
  },
  goals: {
    trip: {
      name: "TwitchCon 2026",
      destination: "San Diego, CA",
      targetDate: "2026-10-15",
      budget: 2500,
      saved: 1700,
    },
    vod: {
      name: "Editor budget",
      budget: 600,
      spent: 240,
      published: 8,
      inQueue: 4,
    },
  },
  upcoming: [
    { date: "2026-06-04", platform: "YouTube", title: "Best of May highlights", status: "Editing", notes: "8 min compilation" },
    { date: "2026-06-05", platform: "TikTok", title: "Clip pack x3", status: "Scheduled", notes: "From Jun 3 stream" },
    { date: "2026-06-06", platform: "Twitch", title: "Variety Saturday", status: "Planned", notes: "4h goal" },
    { date: "2026-06-08", platform: "Instagram", title: "Reel - setup tour", status: "Planned", notes: "Film after stream" },
    { date: "2026-06-10", platform: "YouTube", title: "Full VOD - Jun 6", status: "Planned", notes: "Chapters + thumb" },
  ],
  hoursStreamed30d: 42,
};

export function getTotalFollowers(data, endIndex) {
  const slice = endIndex ?? data.dates.length;
  return data.dates.slice(0, slice).map((_, i) =>
    Object.values(data.platforms).reduce((sum, p) => sum + p.followers[i], 0)
  );
}

export function getNewFollowersDaily(totals) {
  return totals.map((v, i) => (i === 0 ? 0 : v - totals[i - 1]));
}

export function formatDateLabel(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatMoney(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function formatNumber(n) {
  return new Intl.NumberFormat("en-US").format(n);
}
