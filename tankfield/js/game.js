(() => {
  "use strict";

  const WORLD = { w: 11500, h: 11500 };
  const WORLD_OPEN = 11500;
  const ASSAULT_ZONE = 320;
  const TAU = Math.PI * 2;
  const STAT_MAX = 9;
  const LEVEL_CAP = 45;
  const BASE_MOVE = 23.2;
  const SPEED_CAP = 110;
  const ARRAS_TICK = 30;
  const ARRAS_BASE = {
    ACCEL: 1.6,
    SPEED: 5.25,
    HEALTH: 20,
    DAMAGE: 3,
    RESIST: 1,
    PENETRATION: 1.05,
    SHIELD: 5.75,
    REGEN: 0.01,
    FOV: 1.02,
    DENSITY: 0.5,
  };
  const FADE_TANKS = new Set(["landmine", "stalker", "manager", "maleficitor"]);

  const COLORS = {
    bg: "#cdcdcd",
    grid: "#c3c3c3",
    player: "#00b2e1",
    enemy: "#f14e54",
    square: "#ffe869",
    triangle: "#fc7677",
    pentagon: "#768dfc",
    alpha: "#5a6fd8",
    crasher: "#f177dd",
    barrel: "#999999",
    outline: "#555555",
  };

  const TEAM_COLORS = [
    { name: "Magenta", hex: "#f048c6" },
    { name: "Light Grey", hex: "#c5c5ce" },
    { name: "Peach", hex: "#ff8a6b" },
    { name: "White", hex: "#f4f4f4" },
    { name: "Black", hex: "#2a2a2a" },
    { name: "Lime", hex: "#b6e335" },
    { name: "Red", hex: "#f14e54" },
    { name: "Teal", hex: "#7ddec8" },
    { name: "Yellow", hex: "#ffe45c" },
    { name: "Dark Grey", hex: "#5c5c5c" },
    { name: "Blue", hex: "#00b2e1" },
    { name: "Navy", hex: "#3d5afe" },
    { name: "Cyan", hex: "#4dd0e1" },
    { name: "Green", hex: "#4caf50" },
    { name: "Forest", hex: "#2e7d32" },
    { name: "Purple", hex: "#9b59d0" },
    { name: "Lavender", hex: "#b39ddb" },
    { name: "Orange", hex: "#ff9800" },
    { name: "Brown", hex: "#8d6e63" },
    { name: "Gold", hex: "#f5c542" },
    { name: "Crimson", hex: "#c62828" },
    { name: "Sky", hex: "#81d4fa" },
    { name: "Indigo", hex: "#5c6bc0" },
    { name: "Rose", hex: "#ec407a" },
  ];

  const TEAMS = {
    blue: { id: "blue", name: "Blue", color: "#00b2e1" },
    red: { id: "red", name: "Red", color: "#f14e54" },
    green: { id: "green", name: "Green", color: "#8abc3f" },
    purple: { id: "purple", name: "Purple", color: "#be7ff5" },
    boss: { id: "boss", name: "Boss", color: "#f177dd" },
  };
  const BASE_W = 560;
  const FFA_CLOSE_AT = 4 * 60 * 60;
  const SERVER_RESET_DELAY = 5;
  const ROYALE_PREP = 60;
  const ROYALE_SHRINK = 180;
  const ROYALE_END_R = 0;
  const ROYALE_BURN = 0.035;
  const DOM_HOLD = 8;
  const ASSAULT_WIN = 10 * 60;
  const TEAM4 = ["blue", "red", "green", "purple"];
  const HUNTED_TEAM = "red";
  const HUNTER_TEAM = "blue";

  const STATS = [
    { key: "regen", name: "Health Regen", color: "#e85d9c" },
    { key: "maxHealth", name: "Max Health", color: "#e56b6b" },
    { key: "bodyDamage", name: "Body Damage", color: "#f28482" },
    { key: "bulletSpeed", name: "Bullet Speed", color: "#f6bd60" },
    { key: "bulletPen", name: "Bullet Pen", color: "#f2e863" },
    { key: "bulletDamage", name: "Bullet Damage", color: "#84d46c" },
    { key: "reload", name: "Reload", color: "#6cd4c5" },
    { key: "moveSpeed", name: "Movement", color: "#6cb6d4" },
    { key: "shieldRegen", name: "Shield Regen", color: "#4ea4ff" },
    { key: "shieldCap", name: "Shield Capacity", color: "#7ec8e3" },
  ];

  const BOT_NAMES = [
    "Hexa", "Pulse", "Nim", "Vex", "Orbit", "Kite", "Bolt", "Mara",
    "Pento", "Drift", "Nova", "Rook", "Jolt", "Sable", "Pike", "Wisp",
    "Axon", "Quark", "Fenn", "Cinder", "Halo", "Rift", "Nox", "Vera",
    "Glyph", "Torch", "Lumen", "Brine", "Ash", "Bram", "Cove", "Dusk",
    "Echo", "Flint", "Glim", "Haze", "Ilex", "Jade", "Knell", "Lark",
    "Moss", "Nyx", "Oath", "Prowl", "Quill", "Rune", "Thorn", "Umbra",
    "Vale", "Wren", "Yarrow", "Zeal", "Aero", "Bane", "Crux", "Dax",
    "Ember", "Fable", "Grit", "Iris", "Jinx", "Keel", "Loom", "Moth",
    "Nadir", "Opal", "Prism", "Quinn", "Silt", "Talon", "Vesper", "Wynn",
    "Xen", "Yarn", "Zest", "Arden", "Beryl", "Calyx", "Dune", "Elk",
    "Frost", "Gale", "Husk", "Iota", "Jute", "Lynx", "Mica", "Noll",
    "Onyx", "Pax", "Rill", "Sol", "Tusk", "Vela", "Weld", "Yew",
    "Zane", "Bramble", "Crest", "Fawn",
  ];

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const mini = document.getElementById("minimap");
  const mctx = mini.getContext("2d");

  const els = {
    start: document.getElementById("start"),
    hud: document.getElementById("hud"),
    death: document.getElementById("death"),
    name: document.getElementById("name-input"),
    botRange: document.getElementById("bot-count"),
    botNum: document.getElementById("bot-count-num"),
    play: document.getElementById("play-btn"),
    workshopBtn: document.getElementById("workshop-btn"),
    again: document.getElementById("again-btn"),
    menu: document.getElementById("menu-btn"),
    stats: document.getElementById("stats-panel"),
    classes: document.getElementById("class-panel"),
    classChoices: document.getElementById("class-choices"),
    leaders: document.getElementById("leader-list"),
    xpFill: document.getElementById("xp-fill"),
    xpLabel: document.getElementById("xp-label"),
    playerName: document.getElementById("player-name"),
    scoreFill: document.getElementById("score-fill"),
    scoreText: document.getElementById("score-text"),
    killsFill: document.getElementById("kills-fill"),
    killsText: document.getElementById("kills-text"),
    skillPoints: document.getElementById("skill-points"),
    fps: document.getElementById("fps-label"),
    arenaMode: document.getElementById("arena-mode"),
    closeTimer: document.getElementById("close-timer"),
    serverTotal: document.getElementById("server-total"),
    skipUpgrade: document.getElementById("skip-upgrade"),
    showClasses: document.getElementById("show-classes"),
    deathWait: document.getElementById("death-wait"),
    deathMsg: document.getElementById("death-msg"),
    deathStats: document.getElementById("death-stats"),
    bestScore: document.getElementById("best-score"),
    editInGame: document.getElementById("edit-ingame"),
    pause: document.getElementById("pause"),
    resume: document.getElementById("resume-btn"),
    pauseMenu: document.getElementById("pause-menu-btn"),
    spectateBtn: document.getElementById("spectate-btn"),
    spectateBar: document.getElementById("spectate-bar"),
    spectateLabel: document.getElementById("spectate-label"),
    spectateNext: document.getElementById("spectate-next"),
    spectateFreeBtn: document.getElementById("spectate-free"),
    spectateAgain: document.getElementById("spectate-again"),
    spectateMenu: document.getElementById("spectate-menu"),
    notes: document.getElementById("notes"),
  };

  const keys = new Set();
  const mouse = { x: 0, y: 0, down: false, right: false };
  let dpr = 1;
  let width = 0;
  let height = 0;
  let pageZ = 1;
  let last = 0;
  let running = false;
  let shake = 0;
  let menuBotCount = 20;

  const state = {
    player: null,
    tanks: [],
    bullets: [],
    shapes: [],
    particles: [],
    floaters: [],
    camera: { x: 0, y: 0, zoom: 1 },
    autoFire: false,
    autoSpin: false,
    time: 0,
    spawnName: "Unnamed Tank",
    mode: "ffa",
    armsRace: false,
    botCount: 20,
    paused: false,
    playOpts: null,
    selectedColor: "#00b2e1",
    alphaRespawnAt: 0,
    pentagonAt: 30,
    triangleAt: 60,
    crasherAt: 60,
    classDismissed: false,
    classOptions: [],
    hunted: null,
    mothership: null,
    pilotTank: null,
    closing: false,
    closeAt: 0,
    closersSpawned: false,
    serverResetAt: 0,
    userPaused: false,
    spectating: false,
    spectateTarget: null,
    ghost: null,
    lastKiller: null,
    royaleRestartAt: 0,
    stormX: null,
    stormY: null,
    respawnAt: 0,
    walls: [],
    maze: null,
    doms: [],
    domHold: null,
    domHoldT: 0,
    fpsT: 0,
    frames: 0,
  };

  function rand(a, b) { return a + Math.random() * (b - a); }
  function irand(a, b) { return (Math.random() * (b - a + 1) + a) | 0; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function pickTeamColor(except) {
    const pool = TEAM_COLORS.filter((c) => c.hex !== except);
    const list = pool.length ? pool : TEAM_COLORS;
    return list[irand(0, list.length - 1)].hex;
  }
  function colorFor(opts = {}) {
    if (opts.team && TEAMS[opts.team]) return TEAMS[opts.team].color;
    if (state.mode === "sandbox") {
      if (opts.player) return state.selectedColor || COLORS.player;
      return pickTeamColor(state.selectedColor);
    }
    return opts.player ? COLORS.player : COLORS.enemy;
  }
  function dist2(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }
  function darken(hex, amt = 0.28) {
    const n = parseInt(String(hex).replace("#", ""), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    const f = 1 - amt;
    return `rgb(${(r * f) | 0},${(g * f) | 0},${(b * f) | 0})`;
  }

  function outlineFor(hex) {
    const n = parseInt(String(hex).replace("#", ""), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    const lum = r * 0.3 + g * 0.59 + b * 0.11;
    if (lum < 48) return "#8a8a8a";
    if (lum > 230) return "#6a6a6a";
    return darken(hex);
  }

  function zoneAt(x, y) {
    if (state.mode === "tdm") {
      if (x <= BASE_W) return "blue";
      if (x >= WORLD.w - BASE_W) return "red";
      return null;
    }
    if (state.mode !== "4tdm") return null;
    const left = x <= BASE_W;
    const right = x >= WORLD.w - BASE_W;
    const top = y <= BASE_W;
    const bot = y >= WORLD.h - BASE_W;
    if ((left || right) && (top || bot)) return null;
    if (left) return "blue";
    if (right) return "red";
    if (top) return "green";
    if (bot) return "purple";
    return null;
  }

  function spawnInBase(team) {
    const pad = 90;
    if (state.mode === "4tdm") {
      if (team === "green") return { x: rand(BASE_W + pad, WORLD.w - BASE_W - pad), y: rand(pad, BASE_W - pad) };
      if (team === "purple") return { x: rand(BASE_W + pad, WORLD.w - BASE_W - pad), y: rand(WORLD.h - BASE_W + pad, WORLD.h - pad) };
      if (team === "blue") return { x: rand(pad, BASE_W - pad), y: rand(BASE_W + pad, WORLD.h - BASE_W - pad) };
      if (team === "red") return { x: rand(WORLD.w - BASE_W + pad, WORLD.w - pad), y: rand(BASE_W + pad, WORLD.h - BASE_W - pad) };
    }
    const x0 = team === "blue" ? pad : WORLD.w - BASE_W + pad;
    const x1 = team === "blue" ? BASE_W - pad : WORLD.w - pad;
    return { x: rand(x0, x1), y: rand(pad, WORLD.h - pad) };
  }

  function baseCenter(team) {
    if (team === "green") return { x: WORLD.w * 0.5, y: BASE_W * 0.5 };
    if (team === "purple") return { x: WORLD.w * 0.5, y: WORLD.h - BASE_W * 0.5 };
    return {
      x: team === "blue" ? BASE_W * 0.5 : WORLD.w - BASE_W * 0.5,
      y: WORLD.h * 0.5,
    };
  }

  function sameTeam(a, b) {
    if (!a || !b) return false;
    if (a.closer && b.closer) return true;
    return !!(a.team && b.team && a.team === b.team);
  }

  function spawnProtected(ent) {
    return !!(ent && (ent.spawnProtect || 0) > 0 && !ent.closer && !ent.mothership && !ent.dominator && !ent.boss);
  }

  function isEnemyTank(self, other) {
    if (!other || other === self || !other.alive || other.type !== "tank") return false;
    if (spawnProtected(other) && !(self && self.closer)) return false;
    if (other.dominator && other.destroyed) return false;
    if (self.dominator && other.dominator && !self.sanctuary && !other.sanctuary) return false;
    if (self.sanctuary && other.sanctuary) return self.team !== other.team;
    if (self.closer || other.closer) return !(self.closer && other.closer);
    if (sameTeam(self, other)) return false;
    return true;
  }

  function getDef(tank) {
    if (tank && tank.customDef) return tank.customDef;
    return TankCatalog.get(tank && tank.classId);
  }

  function modsOf(def) {
    return def.mods || { damage: 1, reload: 1, speed: 1, size: 1, fov: 1, health: 1 };
  }

  const XP_AT = [0, 0];
  const SKILL_AT = [0, 0];
  const GROWTH_SKILL = [0, 0];

  function levelCap() {
    return state.mode === "growth" ? 1000 : LEVEL_CAP;
  }

  function statCap() {
    return STAT_MAX;
  }

  function xpForLevel(level) {
    const lv = Math.max(1, Math.floor(Number(level) || 1));
    while (XP_AT.length <= lv) {
      const i = XP_AT.length;
      XP_AT.push(XP_AT[i - 1] + Math.round(4 + (i - 1) * (i - 1) * 1.15));
    }
    return XP_AT[lv];
  }

  function isZeroFfa(mode) {
    const m = mode == null ? state.mode : mode;
    return m === "ffazero";
  }

  function startScore() {
    if (isZeroFfa()) return 0;
    return xpForLevel(LEVEL_CAP);
  }

  function carryScore(score) {
    const base = startScore();
    const n = Math.max(0, Math.floor(Number(score) || 0));
    if (n <= 0) return base;
    const kept = Math.floor(n * (irand(15, 20) / 100));
    return Math.max(base, kept);
  }

  function killPoolFromScore(score, hunted) {
    const n = Math.max(0, Math.floor(Number(score) || 0));
    if (hunted) return Math.max(30, Math.floor(n * 0.95));
    return Math.max(20, Math.floor(n * (irand(80, 90) / 100)));
  }

  function levelFromScore(score) {
    const cap = levelCap();
    let lo = 1;
    let hi = cap;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (score >= xpForLevel(mid)) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }

  function skillCurve(points) {
    const cap = Math.max(1, statCap());
    return Math.log(4 * (Math.max(0, points) / cap) + 1) / 1.6;
  }

  function applyFactor(f, x) {
    return x < 0 ? 1 / (1 - x * f) : f * x + 1;
  }

  function skillOf(tank) {
    const s = (tank && tank.stats) || {};
    const c = (key) => skillCurve(s[key] || 0);
    return {
      rld: Math.pow(0.5, c("reload")),
      pen: applyFactor(2.5, c("bulletPen")),
      str: applyFactor(2, c("bulletPen")),
      dam: applyFactor(3, c("bulletDamage")),
      spd: 0.5 + applyFactor(1.5, c("bulletSpeed")),
      shi: applyFactor(2, c("shieldCap")),
      atk: applyFactor(0.021, c("bodyDamage")),
      hlt: applyFactor(1, c("maxHealth")),
      rgn: applyFactor(25, c("regen")),
      shieldRgn: applyFactor(25, c("shieldRegen")),
      mob: applyFactor(0.8, c("moveSpeed")),
    };
  }

  function tankStats(tank) {
    if (tank && tank.closer) {
      return {
        maxHealth: 1000000,
        regen: 8000,
        bodyDamage: 25000,
        bulletSpeed: 9.4,
        bulletPen: 1000000,
        bulletDamage: 50000,
        reload: 2.4,
        moveSpeed: BASE_MOVE * 1.48,
        fov: 1.35,
        bulletSize: 3.4,
        maxDrones: 0,
        maxShield: 0,
        shieldRegen: 0,
      };
    }
    const def = getDef(tank);
    const m = modsOf(def);
    const sk = skillOf(tank);
    const lvl = Math.min(tank.level, state.mode === "growth" ? 120 : LEVEL_CAP);
    const withLevel = !(tank && (tank.closer));
    const bodyHealth = ARRAS_BASE.HEALTH * (def.health || 1) * (m.health || 1);
    const bodyDamage = ARRAS_BASE.DAMAGE * (def.bodyDamage || 1);
    const sizeRatio = Math.max(1, (tank.r || 22) / 22);
    const speedReduce = Math.min(state.mode === "growth" ? 4 : 2, sizeRatio);
    const out = {
      maxHealth: ((withLevel ? 2 * lvl : 0) + bodyHealth) * sk.hlt,
      regen: ((withLevel ? 0.006 * lvl : 0) + 1) * ARRAS_BASE.REGEN * 55 * sk.rgn,
      bodyDamage: bodyDamage * sk.atk * 2.4,
      bulletSpeed: sk.spd * 4,
      bulletPen: sk.pen,
      bulletDamage: 0.75 * sk.dam * 6,
      reload: 10.5 * sk.rld / ARRAS_TICK,
      moveSpeed: BASE_MOVE * (def.speed || 1) * (m.speed || 1) * sk.mob / speedReduce,
      fov: (def.fov || 1) * (m.fov || 1) * ARRAS_BASE.FOV,
      bulletSize: (def.bulletSize || 1) * (m.size || 1),
      maxDrones: def.maxDrones || 0,
      maxShield: 0,
      shieldRegen: 0,
    };
    if (!(tank && (tank.closer || tank.mothership || tank.dominator))) {
      out.maxShield = ((withLevel ? 0.6 * lvl : 0) + ARRAS_BASE.SHIELD) * sk.shi;
      out.shieldRegen = ((withLevel ? 0.006 * lvl : 0) + 1) * ARRAS_BASE.REGEN * 40 * sk.shieldRgn;
    }
    if (tank && tank.dominator && !tank.destroyed) {
      out.regen = Math.max(out.regen, 12);
      out.maxHealth = Math.max(out.maxHealth, tank.mainBase ? 7600 : 6400);
    }
    if (tank && tank.mothership) {
      out.maxHealth = Math.max(24000, out.maxHealth);
      out.regen = Math.max(48, out.regen);
      out.fov = Math.max(out.fov, 1.45);
      out.maxDrones = Math.max(out.maxDrones, 28);
    }
    if (isHuntMode() && tank && tank === state.hunted) {
      out.maxHealth *= 1.16;
      out.regen *= 1.12;
      out.bodyDamage *= 1.1;
      out.bulletDamage *= 1.1;
      out.bulletPen *= 1.08;
      out.moveSpeed *= 1.08;
      out.reload = Math.max(0.08, out.reload * 0.9);
      out.fov *= 1.05;
    }
    if (state.mode === "growth" && tank && !tank.closer && !tank.mothership && !tank.dominator && !tank.boss) {
      out.fov *= 1 + Math.min(0.85, Math.max(0, (tank.r || 22) - 28) / 140);
    }
    if (tank && tank.sanctuary && !tank.destroyed && tank.team === "blue") {
      const tier = tank.sancTier || 1;
      out.maxHealth = Math.max(out.maxHealth, 5200 + tier * 900);
    }
    if (state.mode === "onehp" && tank && !tank.closer && !tank.mothership && !tank.dominator) {
      out.maxHealth = 1;
      out.regen = 0;
      out.maxShield = 0;
      out.shieldRegen = 0;
    }
    return out;
  }

  function pointAtLevel(level, growth) {
    if (level < 2) return 0;
    if (level <= 40) return 1;
    if (level <= 45 && level % 2 === 1) return 1;
    if (growth) {
      if (level <= 51 && level % 2 === 1) return 1;
      if (level % 10 === 1) return 1;
    }
    return 0;
  }

  function skillPointsFor(level) {
    const lv = Math.max(1, Math.floor(Number(level) || 1));
    const growth = state.mode === "growth";
    const cache = growth ? GROWTH_SKILL : SKILL_AT;
    while (cache.length <= lv) {
      const L = cache.length;
      cache.push(cache[L - 1] + pointAtLevel(L, growth));
    }
    return cache[lv];
  }
  function spentPoints(tank) { return STATS.reduce((n, st) => n + tank.stats[st.key], 0); }

  function detectBrowserZoom() {
    const dprNow = window.devicePixelRatio || 1;
    const pinch = (window.visualViewport && window.visualViewport.scale) || 1;
    const natives = [1, 1.25, 1.5, 1.75, 2, 2.5, 3];
    const zooms = [0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];
    let dprZ = 1;
    let bestD = Infinity;
    for (const n of natives) {
      for (const zz of zooms) {
        const d = Math.abs(dprNow - n * zz);
        if (d < bestD) {
          bestD = d;
          dprZ = zz;
        }
      }
    }
    if (natives.some((n) => Math.abs(dprNow - n) < 0.03)) dprZ = 1;

    let z = 1;
    if (Math.abs(dprZ - 1) >= 0.06) z = dprZ;
    if (Math.abs(pinch - 1) > 0.02) z *= pinch;

    let best = z;
    let snapD = Infinity;
    for (const s of zooms) {
      const d = Math.abs(z - s);
      if (d < snapD) {
        snapD = d;
        best = s;
      }
    }
    if (snapD < 0.07) z = best;
    return clamp(z, 0.2, 5);
  }

  function clearZoomFix(el) {
    el.style.transform = "";
    el.style.transformOrigin = "";
    el.style.width = "";
    el.style.height = "";
  }

  function applyAntiZoom() {
    const root = document.documentElement;
    const body = document.body;
    if (!body) return;
    const menuUp = !running && els.start && !els.start.classList.contains("hidden");
    if (menuUp) {
      pageZ = 1;
      clearZoomFix(root);
      clearZoomFix(body);
      return;
    }
    pageZ = detectBrowserZoom();
    clearZoomFix(root);
    if (Math.abs(pageZ - 1) < 0.02) {
      pageZ = 1;
      clearZoomFix(body);
      return;
    }
    const inv = 1 / pageZ;
    body.style.transformOrigin = "0 0";
    body.style.transform = `scale(${inv})`;
    body.style.width = `${100 * pageZ}%`;
    body.style.height = `${100 * pageZ}%`;
  }

  function pointerToGame(e) {
    const rect = canvas.getBoundingClientRect();
    const rw = rect.width || 1;
    const rh = rect.height || 1;
    mouse.x = ((e.clientX - rect.left) / rw) * width;
    mouse.y = ((e.clientY - rect.top) / rh) * height;
  }

  function resize() {
    applyAntiZoom();
    const nativeDpr = (window.devicePixelRatio || 1) / pageZ;
    dpr = Math.min(Math.max(nativeDpr, 1), 2);
    width = window.innerWidth * pageZ;
    height = window.innerHeight * pageZ;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    document.documentElement.style.setProperty("--app-w", `${width}px`);
    document.documentElement.style.setProperty("--app-h", `${height}px`);
  }

  function randomInWorld(margin = 80) {
    for (let i = 0; i < 40; i++) {
      const p = { x: rand(margin, WORLD.w - margin), y: rand(margin, WORLD.h - margin) };
      if (zoneAt(p.x, p.y)) continue;
      if (hitsWall(p.x, p.y, margin * 0.45)) continue;
      return p;
    }
    return { x: WORLD.w / 2, y: WORLD.h / 2 };
  }

  function randomOpenNear(from, minD, maxD) {
    for (let i = 0; i < 28; i++) {
      const a = rand(0, TAU);
      const d = rand(minD, maxD);
      const p = { x: from.x + Math.cos(a) * d, y: from.y + Math.sin(a) * d };
      if (p.x < 80 || p.y < 80 || p.x > WORLD.w - 80 || p.y > WORLD.h - 80) continue;
      if (hitsWall(p.x, p.y, (from.r || 22) + 14)) continue;
      if (!canSee(from, p)) continue;
      return p;
    }
    return randomInWorld(180);
  }

  function eachNearbyWall(x, y, r, fn) {
    const m = state.maze;
    if (m) {
      const minC = Math.max(0, Math.floor((x - r - m.x0) / m.cube));
      const maxC = Math.min(m.cols - 1, Math.floor((x + r - m.x0) / m.cube));
      const minR = Math.max(0, Math.floor((y - r - m.y0) / m.cube));
      const maxR = Math.min(m.rows - 1, Math.floor((y + r - m.y0) / m.cube));
      for (let row = minR; row <= maxR; row++) {
        for (let col = minC; col <= maxC; col++) {
          if (!m.filled[row][col]) continue;
          fn({ x: m.x0 + col * m.cube, y: m.y0 + row * m.cube, w: m.cube, h: m.cube });
        }
      }
      return;
    }
    for (const w of state.walls) fn(w);
  }

  function awayFrom(x, y, minDist) {
    for (let i = 0; i < 24; i++) {
      const p = randomInWorld(120);
      if ((p.x - x) ** 2 + (p.y - y) ** 2 > minDist * minDist) return p;
    }
    return randomInWorld(120);
  }

  function hitsWall(x, y, r) {
    let hit = false;
    eachNearbyWall(x, y, r, (w) => {
      if (hit) return;
      const nx = clamp(x, w.x, w.x + w.w);
      const ny = clamp(y, w.y, w.y + w.h);
      const dx = x - nx;
      const dy = y - ny;
      if (dx * dx + dy * dy < r * r) hit = true;
    });
    return hit;
  }

  function segHitsAabb(x1, y1, x2, y2, minX, minY, maxX, maxY) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    let t0 = 0;
    let t1 = 1;
    const clip = (p, q) => {
      if (p === 0) return q >= 0;
      const r = q / p;
      if (p < 0) {
        if (r > t1) return false;
        if (r > t0) t0 = r;
      } else {
        if (r < t0) return false;
        if (r < t1) t1 = r;
      }
      return true;
    };
    return clip(-dx, x1 - minX) && clip(dx, maxX - x1) && clip(-dy, y1 - minY) && clip(dy, maxY - y1) && t0 < t1;
  }

  function canSee(a, b) {
    if (!a || !b) return false;
    if (!state.walls.length) return true;
    const x1 = a.x;
    const y1 = a.y;
    const x2 = b.x;
    const y2 = b.y;
    const m = state.maze;
    if (m) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.hypot(dx, dy);
      const n = Math.max(1, Math.ceil(dist / (m.cube * 0.28)));
      for (let i = 1; i < n; i++) {
        const t = i / n;
        const c = Math.floor((x1 + dx * t - m.x0) / m.cube);
        const r = Math.floor((y1 + dy * t - m.y0) / m.cube);
        if (r >= 0 && c >= 0 && r < m.rows && c < m.cols && m.filled[r][c]) return false;
      }
      return true;
    }
    for (const w of state.walls) {
      if (segHitsAabb(x1, y1, x2, y2, w.x - 1, w.y - 1, w.x + w.w + 1, w.y + w.h + 1)) return false;
    }
    return true;
  }

  function nearestSeen(from, list, maxDist, pred) {
    return nearest(from, list, maxDist, (o) => (!pred || pred(o)) && canSee(from, o));
  }

  function isRammer(tank) {
    const def = getDef(tank);
    if (def && def.smasher) return true;
    return !!(tank && tank.aiFocus === "ram");
  }

  function leadPoint(from, target, st) {
    if (!target) return from;
    const spd = Math.max(80, (st && st.bulletSpeed ? st.bulletSpeed : 4) * 70);
    const dist = Math.hypot(target.x - from.x, target.y - from.y) || 1;
    const t = Math.min(0.9, dist / spd);
    return { x: target.x + (target.vx || 0) * t, y: target.y + (target.vy || 0) * t };
  }

  function aimAt(tank, target, st) {
    if (!target) return tank.angle || 0;
    const p = leadPoint(tank, target, st);
    return Math.atan2(p.y - tank.y, p.x - tank.x);
  }

  function steerAround(tank, tx, ty) {
    if (!state.walls.length || canSee(tank, { x: tx, y: ty })) return { x: tx, y: ty };
    const dist = Math.hypot(tx - tank.x, ty - tank.y) || 1;
    const probe = Math.min(200, Math.max(90, dist * 0.45));
    const base = Math.atan2(ty - tank.y, tx - tank.x);
    const dir = tank.strafeDir || 1;
    for (let i = 1; i <= 8; i++) {
      const a = base + dir * i * 0.28;
      const px = tank.x + Math.cos(a) * probe;
      const py = tank.y + Math.sin(a) * probe;
      if (!hitsWall(px, py, tank.r + 8) && canSee(tank, { x: px, y: py })) return { x: px, y: py };
      const b = base - dir * i * 0.28;
      const qx = tank.x + Math.cos(b) * probe;
      const qy = tank.y + Math.sin(b) * probe;
      if (!hitsWall(qx, qy, tank.r + 8) && canSee(tank, { x: qx, y: qy })) return { x: qx, y: qy };
    }
    return { x: tank.x + Math.cos(base + dir * 1.4) * 140, y: tank.y + Math.sin(base + dir * 1.4) * 140 };
  }

  function edgePush(ent, margin) {
    const m = margin == null ? 240 : margin;
    let x = 0;
    let y = 0;
    if (ent.x < m) x += m - ent.x;
    if (ent.y < m) y += m - ent.y;
    if (ent.x > WORLD.w - m) x -= ent.x - (WORLD.w - m);
    if (ent.y > WORLD.h - m) y -= ent.y - (WORLD.h - m);
    return { x, y };
  }

  function clampArena(x, y, pad) {
    const p = pad == null ? 180 : pad;
    return { x: clamp(x, p, WORLD.w - p), y: clamp(y, p, WORLD.h - p) };
  }

  function nearMapEdge(ent, pad) {
    const p = pad == null ? 150 : pad;
    return ent.x < p || ent.y < p || ent.x > WORLD.w - p || ent.y > WORLD.h - p;
  }

  function aggroOn(target) {
    if (!target) return 0;
    return target.aggroN || 0;
  }

  function rollBotBrain(bot) {
    if (!bot || !bot.ai) return bot;
    bot.orbitR = 190 + Math.random() * 280;
    bot.aiLock = null;
    bot.aiLockUntil = 0;
    if (bot.aiFocus === "farm") bot.aiHuntPlayer = Math.random() < 0.08;
    else if (bot.aiFocus === "ram") bot.aiHuntPlayer = Math.random() < 0.36;
    else bot.aiHuntPlayer = Math.random() < 0.18;
    return bot;
  }

  const PLAYER_AGGRO_CAP = 4;

  function pickAiEnemy(tank, seeRange) {
    const now = state.time;
    const player = state.player;
    const hurt = tank.aiHurtBy;
    if (hurt && hurt.alive && now - (tank.aiHurtT || 0) < 9 && isEnemyTank(tank, hurt)) {
      if (dist2(tank, hurt) < (seeRange * 1.35) * (seeRange * 1.35)) return hurt;
    }
    if (tank.aiLock && tank.aiLock.alive && now < (tank.aiLockUntil || 0) && isEnemyTank(tank, tank.aiLock)) {
      if (dist2(tank, tank.aiLock) < (seeRange * 1.25) * (seeRange * 1.25)) return tank.aiLock;
    }
    let best = null;
    let bestS = -Infinity;
    const see2 = seeRange * seeRange;
    const onPlayer = player && player.alive ? aggroOn(player) : 99;
    for (const t of state.tanks) {
      if (!isEnemyTank(tank, t)) continue;
      const d2 = dist2(tank, t);
      if (d2 > see2) continue;
      const seen = canSee(tank, t);
      if (!seen && d2 > 480 * 480) continue;
      const d = Math.sqrt(d2) || 1;
      let s = 1200 / d;
      if (!seen) s *= 0.42;
      s /= 1 + aggroOn(t) * 0.6;
      if (t === player) {
        if (tank.aiFocus === "farm" && d > 340) s *= 0.07;
        else if (!tank.aiHuntPlayer && d > 300) s *= 0.16;
        else if (onPlayer >= PLAYER_AGGRO_CAP && hurt !== player) s *= 0.05;
        else s *= tank.aiHuntPlayer ? 1.04 : 0.62;
      } else {
        s *= 1.18;
      }
      if (s > bestS) {
        bestS = s;
        best = t;
      }
    }
    return best;
  }

  function shapeStandoff(tank, shape) {
    const extra = shape.kind === "alpha" ? 150 : shape.kind === "pentagon" ? 96 : shape.kind === "crasher" ? 80 : 58;
    return (tank.r || 22) + (shape.r || 12) + extra;
  }

  function peelOffShapes(tank, tx, ty) {
    if (!tank || isRammer(tank)) return { x: tx, y: ty };
    const necro = !!(getDef(tank) && getDef(tank).necro);
    let x = tx;
    let y = ty;
    for (const s of state.shapes) {
      if (!s.alive) continue;
      if (necro && s.kind === "square") continue;
      const minD = tank.r + s.r + (s.kind === "alpha" ? 40 : s.kind === "pentagon" ? 22 : 16);
      const dx = tank.x - s.x;
      const dy = tank.y - s.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist > minD + 90) continue;
      const toward = (x - tank.x) * (s.x - tank.x) + (y - tank.y) * (s.y - tank.y) > 0;
      if (dist < minD || (toward && dist < minD + 42)) {
        const push = Math.max(36, minD + 28 - dist);
        x += (dx / dist) * push;
        y += (dy / dist) * push;
      }
    }
    return { x, y };
  }

  function bestFarm(from, maxDist) {
    let best = null;
    let bestV = -1;
    const maxD2 = maxDist * maxDist;
    for (const s of state.shapes) {
      if (!s.alive) continue;
      if (s.kind === "alpha" && from.level < 20) continue;
      const d2 = dist2(from, s);
      if (d2 > maxD2) continue;
      if (!canSee(from, s)) continue;
      const d = Math.sqrt(d2) || 1;
      const worth = s.kind === "alpha" ? 3000 : s.kind === "pentagon" ? 130 : s.kind === "triangle" ? 25 : s.kind === "crasher" ? 15 : 10;
      const v = worth / d;
      if (v > bestV) {
        bestV = v;
        best = s;
      }
    }
    return best;
  }

  function pushOutWalls(ent) {
    if (!state.walls.length) return false;
    let hit = false;
    eachNearbyWall(ent.x, ent.y, ent.r + 2, (w) => {
      const nx = clamp(ent.x, w.x, w.x + w.w);
      const ny = clamp(ent.y, w.y, w.y + w.h);
      let dx = ent.x - nx;
      let dy = ent.y - ny;
      let d2 = dx * dx + dy * dy;
      if (d2 >= ent.r * ent.r) return;
      hit = true;
      if (d2 < 1e-6) {
        const left = ent.x - w.x;
        const right = w.x + w.w - ent.x;
        const top = ent.y - w.y;
        const bot = w.y + w.h - ent.y;
        const side = Math.min(left, right, top, bot);
        if (side === left) { ent.x = w.x - ent.r; ent.vx = Math.min(0, ent.vx); }
        else if (side === right) { ent.x = w.x + w.w + ent.r; ent.vx = Math.max(0, ent.vx); }
        else if (side === top) { ent.y = w.y - ent.r; ent.vy = Math.min(0, ent.vy); }
        else { ent.y = w.y + w.h + ent.r; ent.vy = Math.max(0, ent.vy); }
        return;
      }
      const d = Math.sqrt(d2);
      const overlap = ent.r - d + 0.5;
      dx /= d;
      dy /= d;
      ent.x += dx * overlap;
      ent.y += dy * overlap;
      const vn = ent.vx * dx + ent.vy * dy;
      if (vn < 0) {
        ent.vx -= vn * dx;
        ent.vy -= vn * dy;
      }
    });
    return hit;
  }

  function mazeGrid() {
    const tankD = 56;
    const cube = tankD * 3;
    const pad = cube;
    let cols = Math.max(13, Math.floor((WORLD.w - pad * 2) / cube));
    let rows = Math.max(13, Math.floor((WORLD.h - pad * 2) / cube));
    if (cols % 2 === 0) cols -= 1;
    if (rows % 2 === 0) rows -= 1;
    const x0 = (WORLD.w - cols * cube) / 2;
    const y0 = (WORLD.h - rows * cube) / 2;
    return { cube, cols, rows, x0, y0 };
  }

  function clearMazeBorder(filled, rows, cols) {
    for (let r = 0; r < rows; r++) {
      filled[r][0] = false;
      filled[r][cols - 1] = false;
    }
    for (let c = 0; c < cols; c++) {
      filled[0][c] = false;
      filled[rows - 1][c] = false;
    }
  }

  function buildOpenBlocks() {
    const { cube, cols, rows, x0, y0 } = mazeGrid();
    const filled = Array.from({ length: rows }, () => Array(cols).fill(false));
    const inside = (r, c) => r > 1 && r < rows - 2 && c > 1 && c < cols - 2;
    const key = (r, c) => r + "," + c;
    const shapes = [
      [[0, 0], [1, 0]],
      [[0, 0], [0, 1]],
      [[0, 0], [1, 1]],
      [[0, 0], [1, -1]],
      [[0, 0], [1, 0], [2, 0]],
      [[0, 0], [1, 0], [1, 1]],
      [[0, 0], [1, 0], [0, 1]],
      [[0, 0], [0, 1], [1, 1]],
      [[0, 0], [1, 0], [2, 1]],
      [[0, 0], [1, 0], [2, 0], [1, 1]],
      [[1, 0], [0, 1], [1, 1], [2, 1]],
      [[0, 0], [1, 0], [1, 1], [2, 1]],
      [[0, 0], [0, 1], [1, 1], [1, 2]],
      [[0, 0], [1, 0], [2, 0], [2, 1]],
      [[0, 0], [1, 0], [0, 1], [-1, 0]],
      [[0, 0], [1, 0], [2, 0], [0, 1]],
      [[0, 0], [1, 0], [-1, 1], [1, 1]],
    ];
    const rotShape = (cells, k, flip) => cells.map(([x, y]) => {
      let a = flip ? -x : x;
      let b = y;
      for (let i = 0; i < (k & 3); i++) {
        const t = a;
        a = -b;
        b = t;
      }
      return [a, b];
    });
    const nearFilled = (r, c, skip) => {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue;
          const rr = r + dr;
          const cc = c + dc;
          if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) continue;
          if (skip && skip.has(key(rr, cc))) continue;
          if (filled[rr][cc]) return true;
        }
      }
      return false;
    };
    const tryPlace = (cells0, tries) => {
      for (let t = 0; t < tries; t++) {
        const seedR = irand(2, rows - 3);
        const seedC = irand(2, cols - 3);
        const cells = cells0.map(([dc, dr]) => [seedR + dr, seedC + dc]);
        const skip = new Set(cells.map(([r, c]) => key(r, c)));
        let ok = true;
        for (const [r, c] of cells) {
          if (!inside(r, c) || filled[r][c] || nearFilled(r, c, skip)) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;
        for (const [r, c] of cells) filled[r][c] = true;
        return true;
      }
      return false;
    };
    const nClusters = Math.max(90, Math.floor((rows * cols) / 5));
    for (let n = 0; n < nClusters; n++) {
      const raw = shapes[irand(0, shapes.length - 1)];
      tryPlace(rotShape(raw, irand(0, 3), Math.random() < 0.5), 90);
    }
    const fillers = [[[0, 0], [1, 0]], [[0, 0], [1, 1]], [[0, 0], [1, 0], [1, 1]]];
    for (let n = 0; n < Math.floor(nClusters * 0.45); n++) {
      tryPlace(rotShape(fillers[irand(0, fillers.length - 1)], irand(0, 3), false), 40);
    }
    clearMazeBorder(filled, rows, cols);
    state.maze = { cube, x0, y0, cols, rows, filled };
    rebuildMazeWalls();
  }

  function buildMaze() {
    if (state.mode === "royalemaze") {
      buildOpenBlocks();
      return;
    }
    const { cube, cols, rows, x0, y0 } = mazeGrid();
    const filled = Array.from({ length: rows }, () => Array(cols).fill(true));
    const inside = (r, c) => r > 0 && r < rows - 1 && c > 0 && c < cols - 1;
    const sr = 1 + 2 * irand(0, Math.floor((rows - 3) / 2));
    const sc = 1 + 2 * irand(0, Math.floor((cols - 3) / 2));
    filled[sr][sc] = false;
    const stack = [[sr, sc]];
    while (stack.length) {
      const [r, c] = stack[stack.length - 1];
      const opts = [];
      for (const [dr, dc] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) {
        const nr = r + dr;
        const nc = c + dc;
        if (inside(nr, nc) && filled[nr][nc]) opts.push([nr, nc, r + dr / 2, c + dc / 2]);
      }
      if (!opts.length) {
        stack.pop();
        continue;
      }
      const [nr, nc, wr, wc] = opts[irand(0, opts.length - 1)];
      filled[nr][nc] = false;
      filled[wr][wc] = false;
      stack.push([nr, nc]);
    }
    const extra = irand(Math.floor(cols * rows * 0.04), Math.floor(cols * rows * 0.09));
    for (let i = 0; i < extra; i++) {
      const r = 1 + 2 * irand(0, Math.floor((rows - 3) / 2));
      const c = 1 + 2 * irand(0, Math.floor((cols - 3) / 2));
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]].filter(([dr, dc]) => inside(r + dr, c + dc));
      if (!dirs.length) continue;
      const [dr, dc] = dirs[irand(0, dirs.length - 1)];
      filled[r + dr][c + dc] = false;
    }
    const cr = (rows - 1) / 2;
    const cc = (cols - 1) / 2;
    const hole = Math.max(4, Math.floor(Math.min(rows, cols) * 0.13));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r - cr) * (r - cr) + (c - cc) * (c - cc) <= hole * hole) filled[r][c] = false;
      }
    }
    clearMazeBorder(filled, rows, cols);
    state.maze = { cube, x0, y0, cols, rows, filled };
    rebuildMazeWalls();
  }

  function rebuildMazeWalls() {
    const m = state.maze;
    if (!m) {
      state.walls = [];
      return;
    }
    const walls = [];
    for (let r = 0; r < m.rows; r++) {
      for (let c = 0; c < m.cols; c++) {
        if (!m.filled[r][c]) continue;
        walls.push({ x: m.x0 + c * m.cube, y: m.y0 + r * m.cube, w: m.cube, h: m.cube });
      }
    }
    state.walls = walls;
  }

  function punchMazeAt(x, y, radius) {
    const m = state.maze;
    if (!m) return;
    for (let r = 0; r < m.rows; r++) {
      for (let c = 0; c < m.cols; c++) {
        const cx = m.x0 + (c + 0.5) * m.cube;
        const cy = m.y0 + (r + 0.5) * m.cube;
        if ((cx - x) * (cx - x) + (cy - y) * (cy - y) <= radius * radius) m.filled[r][c] = false;
      }
    }
  }

  function openAround(x, y, minD, maxD, rad = 42) {
    for (let i = 0; i < 40; i++) {
      const a = rand(0, TAU);
      const d = rand(minD, maxD);
      const p = { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d };
      if (p.x < 140 || p.y < 140 || p.x > WORLD.w - 140 || p.y > WORLD.h - 140) continue;
      if (hitsWall(p.x, p.y, rad)) continue;
      return p;
    }
    return randomInWorld(160);
  }

  function assaultDoms() {
    return state.tanks.filter((t) => t.dominator);
  }

  function assaultLiveCount() {
    return assaultDoms().filter((t) => !t.destroyed && t.team === "green").length;
  }

  function assaultBlueCount() {
    return assaultDoms().filter((t) => !t.destroyed && t.team === "blue").length;
  }

  function assaultZoneR(d) {
    return d && d.mainBase ? 390 : 310;
  }

  function assaultNeed() {
    return Math.max(1, Math.ceil(assaultDoms().length * 0.75));
  }

  function healerDominator() {
    return state.tanks.find((t) => t.dominator && t.mainBase) || null;
  }

  function formatClock(sec) {
    const t = Math.max(0, Math.floor(sec));
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = String(t % 60).padStart(2, "0");
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${s}`;
    return `${m}:${s}`;
  }

  function formatStopwatch(sec) {
    const t = Math.max(0, Number(sec) || 0);
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    const d = Math.floor((t * 10) % 10);
    return `${m}:${String(s).padStart(2, "0")}.${d}`;
  }

  function assaultSpawn(team) {
    if (team === "green") {
      const h = healerDominator();
      if (h) return openAround(h.x, h.y, 150, 280, 36);
    }
    if (state.assaultBlue) return openAround(state.assaultBlue.x, state.assaultBlue.y, 40, 380, 36);
    return randomInWorld(200);
  }

  function welcomeSpawnNotes() {
    note("You have spawned! Welcome to the game.");
    note("You will be invulnerable until you move or shoot.");
  }

  function applyWorldSize(mode) {
    if (mode === "assault") {
      const s = irand(6750, 9000);
      WORLD.w = s;
      WORLD.h = s;
    } else if (mode === "siege") {
      const s = irand(8000, 9000);
      WORLD.w = s;
      WORLD.h = s;
    } else if (mode === "onehp" || isRoyale(mode)) {
      WORLD.w = 8200;
      WORLD.h = 8200;
    } else {
      WORLD.w = WORLD_OPEN;
      WORLD.h = WORLD_OPEN;
    }
  }

  function holdPoint(tank, goal, radius) {
    const seed = String(tank.id || tank.name || "x");
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) | 0;
    const a = (h * 0.17) + (tank.wanderA || 0) + state.time * 0.35 * (tank.strafeDir || 1);
    const r = radius + 24;
    const p = { x: goal.x + Math.cos(a) * r, y: goal.y + Math.sin(a) * r };
    if (hitsWall(p.x, p.y, (tank.r || 22) + 12)) return openAround(goal.x, goal.y, radius, radius + 90, (tank.r || 22) + 12);
    return p;
  }

  function spawnDomGuards(dom, n) {
    if (!dom) return;
    const count = n == null ? irand(2, 4) : n;
    for (let i = 0; i < count; i++) {
      const pos = openAround(dom.x, dom.y, 140, assaultZoneR(dom) * 0.72, 36);
      const g = createTank({
        name: uniqueBotName(),
        ai: true,
        classId: "assault_guard",
        team: "green",
        color: TEAMS.green.color,
        score: xpForLevel(LEVEL_CAP),
        pos,
      });
      g.guard = true;
      g.guardOf = dom;
      g.aiJob = "guard";
      g.aiFocus = "gun";
      g.spawnProtect = 2;
      applyLevel(g);
      g.health = g.maxHealth;
      state.tanks.push(g);
    }
  }

  function buildAssaultArena() {
    const inset = Math.round(WORLD.w * 0.2);
    buildMaze();
    const m = state.maze;
    if (Math.random() < 0.42 && m) {
      const extra = Math.floor(m.cols * m.rows * rand(0.12, 0.22));
      for (let i = 0; i < extra; i++) {
        const r = irand(2, m.rows - 3);
        const c = irand(2, m.cols - 3);
        m.filled[r][c] = false;
      }
    }
    const n = irand(4, 8);
    const corners = [
      { x: inset, y: WORLD.h - inset },
      { x: WORLD.w - inset, y: WORLD.h - inset },
      { x: inset, y: inset },
      { x: WORLD.w - inset, y: inset },
    ];
    const home = corners[irand(0, corners.length - 1)];
    state.assaultBlue = { x: WORLD.w - home.x, y: WORLD.h - home.y };
    punchMazeAt(home.x, home.y, 480);
    punchMazeAt(state.assaultBlue.x, state.assaultBlue.y, 420);
    const spots = [home];
    const minGap = WORLD.w * 0.14;
    for (let i = 1; i < n; i++) {
      const t = i / (n - 1 || 1);
      let placed = null;
      for (let k = 0; k < 36; k++) {
        const x = home.x + (state.assaultBlue.x - home.x) * (0.12 + t * 0.7) + rand(-WORLD.w * 0.08, WORLD.w * 0.08);
        const y = home.y + (state.assaultBlue.y - home.y) * (0.12 + t * 0.7) + rand(-WORLD.h * 0.08, WORLD.h * 0.08);
        const p = { x: clamp(x, 520, WORLD.w - 520), y: clamp(y, 520, WORLD.h - 520) };
        if (spots.some((s) => (s.x - p.x) ** 2 + (s.y - p.y) ** 2 < minGap * minGap)) continue;
        placed = p;
        break;
      }
      spots.push(placed || { x: WORLD.w * (0.25 + 0.5 * Math.random()), y: WORLD.h * (0.25 + 0.5 * Math.random()) });
    }
    for (const p of spots) punchMazeAt(p.x, p.y, 340);
    rebuildMazeWalls();
    let healer = null;
    for (let i = 0; i < spots.length; i++) {
      const main = i === 0;
      const d = createTank({
        name: main ? "Healer" : "Dominator",
        ai: true,
        classId: main ? "dom_heal" : "dom_gun",
        team: "green",
        color: TEAMS.green.color,
        score: xpForLevel(LEVEL_CAP),
        pos: spots[i],
      });
      d.dominator = true;
      d.mainBase = main;
      d.destroyed = false;
      d.repair = 0;
      d.repairTeam = null;
      d.homeX = spots[i].x;
      d.homeY = spots[i].y;
      d.x = spots[i].x;
      d.y = spots[i].y;
      d.spawnProtect = 0;
      d.ai = true;
      applyLevel(d);
      d.health = d.maxHealth;
      d.r = main ? 78 : 64;
      state.tanks.push(d);
      if (main) healer = d;
    }
    spawnDomGuards(healer, irand(4, 6));
    for (const d of assaultDoms()) {
      if (d.mainBase) continue;
      if (Math.random() < 0.48) spawnDomGuards(d, irand(2, 4));
    }
    state.assaultHold = true;
    state.assaultWinAt = ASSAULT_WIN;
  }

  function wreckDominator(d, src) {
    if (!d || d.destroyed) return;
    if (d.sanctuary) {
      convertSanctuary(d, src && src.owner ? src.owner : src);
      return;
    }
    const was = d.team;
    d.destroyed = true;
    d.health = 0;
    d.alive = true;
    d.repair = 0;
    d.repairTeam = null;
    d.color = "#8a8a8a";
    d.vx = 0;
    d.vy = 0;
    clearOwnedShots(d);
    burst(d.x, d.y, (was && TEAMS[was] ? TEAMS[was].color : TEAMS.green.color), 22, 240);
    floater(d.x, d.y - d.r - 8, "Destroyed");
    const label = was === "blue" ? "BLUE" : "GREEN";
    note(d.mainBase ? `The ${label} spawn dominator has been destroyed!` : `A ${label} dominator has been destroyed!`);
    if (src && src.alive && !src.dominator) giveScore(src, d.mainBase ? 2400 : 900, d.x, d.y);
    if (d.mainBase) assaultWin("blue", "Blue captured the main dominator.");
  }

  function applyDominatorClass(d) {
    if (!d || !d.dominator) return;
    const keepHp = d.maxHealth || 0;
    d.classId = d.team === "blue" ? "dom_idle" : (d.mainBase ? "dom_heal" : "dom_gun");
    applyLevel(d);
    if (keepHp > 0) d.maxHealth = keepHp;
    d.r = d.mainBase ? 78 : 64;
  }

  function claimDominator(d, team) {
    if (!d || !team || !TEAMS[team]) return;
    if (d.mainBase && team === "blue") {
      d.team = "blue";
      d.color = TEAMS.blue.color;
      d.destroyed = false;
      applyDominatorClass(d);
      d.health = d.maxHealth;
      assaultWin("blue", "Blue captured the main dominator.");
      return;
    }
    d.destroyed = false;
    d.repair = 0;
    d.repairTeam = null;
    d.team = team;
    d.color = TEAMS[team].color;
    applyDominatorClass(d);
    d.health = d.maxHealth;
    d.alive = true;
    burst(d.x, d.y, TEAMS[team].color, 16, 180);
    floater(d.x, d.y - d.r - 8, team === "blue" ? "Captured" : "Repaired");
    note(team === "blue" ? "A BLUE dominator has been captured!" : "A GREEN dominator has been repaired!");
    if (assaultDoms().every((x) => !x.destroyed && x.team === "blue")) {
      assaultWin("blue", "Blue captured every dominator.");
    }
  }

  function assaultWin(team, msg) {
    if (state.mode !== "assault" || state.closing) return;
    beginArenaClose(msg || (team === "blue" ? "Blue team wins! Fresh server shortly." : "Green team wins! Fresh server shortly."));
  }

  function updateAssault(dt) {
    if (state.mode !== "assault") return;
    for (const d of assaultDoms()) {
      d.x = d.homeX;
      d.y = d.homeY;
      d.vx = 0;
      d.vy = 0;
      if (!d.destroyed) continue;
      d.health = 0;
      d.alive = true;
      const reach = assaultZoneR(d) * assaultZoneR(d);
      let green = 0;
      let blue = 0;
      for (const t of state.tanks) {
        if (!t.alive || t.dominator || t.closer || !t.team) continue;
        if (dist2(t, d) > reach) continue;
        if (t.team === "green") green++;
        else if (t.team === "blue") blue++;
      }
      if (green && !blue) {
        if (d.repairTeam !== "green") { d.repair = 0; d.repairTeam = "green"; }
        d.repair = (d.repair || 0) + dt / 6.5;
      } else if (blue && !green) {
        if (d.repairTeam !== "blue") { d.repair = 0; d.repairTeam = "blue"; }
        d.repair = (d.repair || 0) + dt / 6.5;
      } else {
        d.repair = Math.max(0, (d.repair || 0) - dt * 0.4);
      }
      if (d.repair >= 1 && d.repairTeam) claimDominator(d, d.repairTeam);
    }
    if (state.closing) return;
    const live = assaultLiveCount();
    const need = assaultNeed();
    const held = live >= need;
    if (held) {
      if (!state.assaultHold) {
        state.assaultHold = true;
        state.assaultWinAt = state.time + ASSAULT_WIN;
        note("GREEN recaptured 3/4 of the dominators. Victory timer reset.");
      }
      if (state.time >= state.assaultWinAt) assaultWin("green", "Green held 3/4 of the dominators for 10 minutes.");
    } else {
      state.assaultHold = false;
    }
  }

  const SIEGE_ELITES = [
    "elite_destroyer", "elite_gunner", "elite_sprayer", "elite_battleship",
    "elite_spawner", "elite_trapguard", "elite_spinner", "elite_skimmer",
  ];
  const SIEGE_MYSTICALS = ["sorcerer", "summoner", "enchantress", "exorcistor", "shaman", "witch"];
  const SIEGE_NESTERS = ["nest_keeper", "nest_warden", "nest_guardian"];
  const SIEGE_ROGUES = ["rogue_palisade", "rogue_armada"];
  const SIEGE_SENTRIES = ["sentry_gun", "sentry_swarm", "sentry_trap"];
  const BOSS_KILL = {
    elite_destroyer: 4000,
    elite_gunner: 4000,
    elite_sprayer: 4000,
    elite_battleship: 5500,
    elite_spawner: 5000,
    elite_trapguard: 4500,
    elite_spinner: 4500,
    elite_skimmer: 5000,
    sorcerer: 4500,
    summoner: 6000,
    enchantress: 5500,
    exorcistor: 7000,
    shaman: 8000,
    witch: 5000,
    nest_keeper: 5000,
    nest_warden: 5500,
    nest_guardian: 6000,
    rogue_palisade: 8000,
    rogue_armada: 8000,
    terrestrial: 18000,
    celestial: 40000,
    eternal: 90000,
    sentry_gun: 220,
    sentry_swarm: 220,
    sentry_trap: 240,
  };

  function pickN(list, n) {
    const out = [];
    if (!list.length || n <= 0) return out;
    for (let i = 0; i < n; i++) out.push(list[irand(0, list.length - 1)]);
    return out;
  }

  function siegeWaveList() {
    return [
      pickN(SIEGE_ELITES, 1),
      pickN(SIEGE_ELITES, 2),
      pickN(SIEGE_ELITES, 3),
      pickN(SIEGE_ELITES, 4),
      pickN(SIEGE_ELITES, 3).concat(pickN(SIEGE_MYSTICALS, 1)),
      pickN(SIEGE_ELITES, 2).concat(pickN(SIEGE_MYSTICALS, 2)),
      pickN(SIEGE_ELITES, 1).concat(pickN(SIEGE_MYSTICALS, 2), pickN(SIEGE_NESTERS, 1)),
      pickN(SIEGE_MYSTICALS, 3).concat(pickN(SIEGE_NESTERS, 1)),
      pickN(SIEGE_ELITES, 1).concat(pickN(SIEGE_MYSTICALS, 3), pickN(SIEGE_NESTERS, 1)),
      pickN(SIEGE_ELITES, 2).concat(pickN(SIEGE_MYSTICALS, 2), pickN(SIEGE_NESTERS, 1), pickN(SIEGE_ROGUES, 1)),
      pickN(SIEGE_ELITES, 3).concat(pickN(SIEGE_MYSTICALS, 2), pickN(SIEGE_NESTERS, 2)),
      pickN(SIEGE_ELITES, 3).concat(pickN(SIEGE_MYSTICALS, 2), pickN(SIEGE_NESTERS, 1), pickN(SIEGE_ROGUES, 1)),
      ["terrestrial"],
      ["celestial"],
      ["celestial"],
      ["celestial"],
      ["celestial"],
      pickN(SIEGE_ELITES, 1).concat(pickN(SIEGE_MYSTICALS, 1), ["celestial"]),
      pickN(SIEGE_ELITES, 2).concat(pickN(SIEGE_NESTERS, 1), pickN(SIEGE_ROGUES, 1), ["celestial"]),
      pickN(SIEGE_ELITES, 3).concat(pickN(SIEGE_MYSTICALS, 2), pickN(SIEGE_NESTERS, 1), ["celestial"]),
      pickN(SIEGE_ELITES, 3).concat(pickN(SIEGE_MYSTICALS, 2), pickN(SIEGE_NESTERS, 1), pickN(SIEGE_ROGUES, 1), ["celestial"]),
      ["celestial", "celestial"],
      pickN(SIEGE_ELITES, 2).concat(pickN(SIEGE_MYSTICALS, 2), pickN(SIEGE_NESTERS, 1), pickN(SIEGE_ROGUES, 1), ["celestial", "celestial"]),
      ["eternal"],
    ];
  }

  function siegeSanctuaries() {
    return state.tanks.filter((t) => t.sanctuary);
  }

  function liveSanctuaries() {
    return siegeSanctuaries().filter((t) => t.alive && t.team === "blue" && !t.sancFallen);
  }

  function siegeSpawn() {
    const live = liveSanctuaries();
    if (live.length) {
      const s = live[irand(0, live.length - 1)];
      return openAround(s.x, s.y, 90, 260, 36);
    }
    return randomInWorld(200);
  }

  function bossEdgePos() {
    const pad = 220;
    const side = irand(0, 3);
    if (side === 0) return { x: pad, y: rand(pad, WORLD.h - pad) };
    if (side === 1) return { x: WORLD.w - pad, y: rand(pad, WORLD.h - pad) };
    if (side === 2) return { x: rand(pad, WORLD.w - pad), y: pad };
    return { x: rand(pad, WORLD.w - pad), y: WORLD.h - pad };
  }

  function resetSiege() {
    state.siegeWave = -1;
    state.siegeWaves = [];
    state.siegeRemaining = 0;
    state.siegeNextAt = 0;
    state.siegeTier = 1;
    state.siegeLoseAt = 0;
    state.siegeWon = false;
  }

  function applySanctuaryTier(sanc, tier) {
    if (!sanc || !sanc.sanctuary || sanc.sancFallen) return;
    sanc.sancTier = tier;
    sanc.classId = "sanctuary";
    applyLevel(sanc);
    sanc.health = sanc.maxHealth;
    sanc.r = 58 + tier * 3;
  }

  function spawnSanctuary(pos, team) {
    const d = createTank({
      name: team === "blue" ? "Blue Sanctuary" : "Boss Sanctuary",
      ai: true,
      classId: "sanctuary",
      team,
      color: TEAMS[team].color,
      score: xpForLevel(LEVEL_CAP),
      pos,
    });
    d.dominator = true;
    d.sanctuary = true;
    d.sancFallen = team !== "blue";
    d.sancTier = 1;
    d.destroyed = false;
    d.homeX = pos.x;
    d.homeY = pos.y;
    d.x = pos.x;
    d.y = pos.y;
    d.spawnProtect = 0;
    applySanctuaryTier(d, 1);
    state.tanks.push(d);
    return d;
  }

  function buildSiegeArena() {
    const inset = Math.round(WORLD.w * 0.18);
    buildMaze();
    const spots = [
      { x: inset, y: inset },
      { x: WORLD.w - inset, y: inset },
      { x: inset, y: WORLD.h - inset },
      { x: WORLD.w - inset, y: WORLD.h - inset },
      { x: WORLD.w * 0.5, y: WORLD.h * 0.5 },
    ];
    for (const p of spots) punchMazeAt(p.x, p.y, 420);
    punchMazeAt(WORLD.w * 0.5, 0, 520);
    punchMazeAt(WORLD.w * 0.5, WORLD.h, 520);
    punchMazeAt(0, WORLD.h * 0.5, 520);
    punchMazeAt(WORLD.w, WORLD.h * 0.5, 520);
    rebuildMazeWalls();
    for (const p of spots) spawnSanctuary(p, "blue");
    state.siegeWaves = siegeWaveList();
    state.siegeWave = -1;
    state.siegeRemaining = 0;
    state.siegeNextAt = 5;
    state.siegeTier = 1;
    state.siegeLoseAt = 0;
    state.siegeWon = false;
  }

  function spawnSiegeBoss(classId, fodder) {
    const def = TankCatalog.get(classId);
    const pos = openAround(bossEdgePos().x, bossEdgePos().y, 0, 80, 48);
    const tank = createTank({
      name: def && def.name ? def.name : "Boss",
      ai: true,
      classId,
      team: "boss",
      color: TEAMS.boss.color,
      score: xpForLevel(LEVEL_CAP),
      pos,
    });
    tank.boss = !fodder;
    tank.fodder = !!fodder;
    tank.killScore = BOSS_KILL[classId] || (fodder ? 220 : 4000);
    tank.spawnProtect = 0;
    tank.aiJob = "hunt";
    tank.aiFocus = "gun";
    applyLevel(tank);
    tank.health = tank.maxHealth;
    state.tanks.push(tank);
    state.siegeRemaining = (state.siegeRemaining || 0) + 1;
    return tank;
  }

  function spawnSiegeWave(waveId) {
    const wave = state.siegeWaves[waveId];
    if (!wave) return;
    note(`Wave ${waveId + 1} has started!`, 4000);
    for (const id of wave) spawnSiegeBoss(id, false);
    const sentries = Math.floor(waveId / 2);
    for (let i = 0; i < sentries; i++) spawnSiegeBoss(SIEGE_SENTRIES[i % SIEGE_SENTRIES.length], true);
    const tier = Math.min(6, Math.floor(waveId / 5) + 1);
    if (tier !== state.siegeTier) {
      state.siegeTier = tier;
      for (const s of liveSanctuaries()) applySanctuaryTier(s, tier);
      note(`The sanctuaries have been upgraded to Tier ${tier}`, 4000);
    }
  }

  function onSiegeEnemyKilled() {
    if (state.mode !== "siege" || state.closing || state.siegeWon) return;
    state.siegeRemaining = Math.max(0, (state.siegeRemaining || 0) - 1);
    if (state.siegeRemaining <= 0) {
      note(`Wave ${state.siegeWave + 1} has been defeated!`, 3500);
      note("The next wave will start shortly.");
      state.siegeNextAt = state.time + 5;
    }
  }

  function siegeWin() {
    if (state.mode !== "siege" || state.closing || state.siegeWon) return;
    state.siegeWon = true;
    beginArenaClose("Your team has won the game! Fresh server shortly.");
  }

  function siegeLose() {
    if (state.mode !== "siege" || state.closing || state.siegeWon) return;
    beginArenaClose("Team boss has won. Fresh server shortly.");
  }

  function convertSanctuary(d, src) {
    if (!d || !d.sanctuary) return;
    if (d.sancFallen) {
      d.sancFallen = false;
      d.team = "blue";
      d.color = TEAMS.blue.color;
      d.name = "Blue Sanctuary";
      d.classId = "sanctuary";
      d.destroyed = false;
      applySanctuaryTier(d, state.siegeTier || 1);
      d.health = d.maxHealth;
      burst(d.x, d.y, TEAMS.blue.color, 16, 180);
      floater(d.x, d.y - d.r - 8, "Restored");
      note("A sanctuary has been restored!", 4000);
      if (src && src.alive && !src.dominator) giveScore(src, 1200, d.x, d.y);
      if (state.siegeLoseAt) {
        state.siegeLoseAt = 0;
        note("You can now respawn.");
      }
      return;
    }
    d.sancFallen = true;
    d.team = "boss";
    d.color = "#ffe45c";
    d.name = "Destroyed Sanctuary";
    d.classId = "dom_gun";
    d.destroyed = false;
    applyLevel(d);
    d.health = d.maxHealth;
    d.r = 64;
    burst(d.x, d.y, TEAMS.blue.color, 22, 240);
    floater(d.x, d.y - d.r - 8, "Destroyed");
    note("A sanctuary has been destroyed!", 4000);
    if (src && src.alive && !src.dominator) giveScore(src, 900, d.x, d.y);
    if (!liveSanctuaries().length) {
      note("All of the sanctuaries are destroyed. You cannot respawn.", 5000);
      state.siegeLoseAt = state.time + 61;
    }
  }

  function updateSiege(dt) {
    if (state.mode !== "siege") return;
    for (const d of siegeSanctuaries()) {
      d.x = d.homeX;
      d.y = d.homeY;
      d.vx = 0;
      d.vy = 0;
    }
    if (state.closing || state.siegeWon) return;
    if (state.siegeLoseAt) {
      if (liveSanctuaries().length) {
        state.siegeLoseAt = 0;
      } else {
        const left = Math.ceil(state.siegeLoseAt - state.time);
        if (left <= 0) {
          siegeLose();
          return;
        }
        const prev = Math.ceil((state.siegeLoseAt - (state.time - dt)) );
        if (left !== prev && (left % 10 === 0 || left <= 5)) {
          note(`Your team will lose in ${left} second${left === 1 ? "" : "s"}.`);
        }
      }
    }
    if (state.siegeRemaining > 0) return;
    if (state.time < (state.siegeNextAt || 0)) return;
    state.siegeWave += 1;
    if (state.siegeWave >= state.siegeWaves.length) {
      siegeWin();
      return;
    }
    spawnSiegeWave(state.siegeWave);
  }

  function spawnDoms() {
    const inset = 2450;
    state.doms = [
      { x: inset, y: inset, r: 118, team: null, progress: 0 },
      { x: WORLD.w - inset, y: inset, r: 118, team: null, progress: 0 },
      { x: inset, y: WORLD.h - inset, r: 118, team: null, progress: 0 },
      { x: WORLD.w - inset, y: WORLD.h - inset, r: 118, team: null, progress: 0 },
    ];
  }

  function updateDoms(dt) {
    if (state.mode !== "domination") return;
    for (const d of state.doms) {
      const inside = [];
      for (const t of state.tanks) {
        if (!t.alive || t.closer || t.mothership || !t.team) continue;
        if (dist2(t, d) < d.r * d.r) inside.push(t);
      }
      const teams = new Set(inside.map((t) => t.team));
      if (teams.size === 1) {
        const team = inside[0].team;
        if (d.team === team) d.progress = 1;
        else {
          d.progress += dt / 4.2;
          if (d.progress >= 1) {
            d.team = team;
            d.progress = 1;
            floater(d.x, d.y - 24, `${TEAMS[team].name} captured`);
            note(`${TEAMS[team].name} captured a dominator.`);
          }
        }
      } else if (teams.size > 1) {
        d.progress = Math.max(0, d.progress - dt * 0.35);
      } else if (!d.team) {
        d.progress = Math.max(0, d.progress - dt * 0.2);
      } else {
        d.progress = 1;
      }
    }
    const counts = { blue: 0, red: 0 };
    for (const d of state.doms) if (d.team) counts[d.team] += 1;
    const lead = counts.blue >= 3 ? "blue" : counts.red >= 3 ? "red" : null;
    if (!lead) {
      state.domHold = null;
      state.domHoldT = 0;
      return;
    }
    if (state.domHold !== lead) {
      state.domHold = lead;
      state.domHoldT = state.time;
    }
    if (state.time - state.domHoldT >= DOM_HOLD) {
      beginArenaClose(`${TEAMS[lead].name} wins Domination! Fresh server shortly.`);
    }
  }

  const BOT_MIN = 1;
  const BOT_MAX = 100;
  const BOT_DEFAULT = 20;

  function clampBotCount(n) {
    const v = Math.round(Number(n));
    if (!Number.isFinite(v)) return BOT_DEFAULT;
    return Math.max(BOT_MIN, Math.min(BOT_MAX, v));
  }

  function botCountFor() {
    return menuBotCount;
  }

  function splitTwoTeams(n, mine, other) {
    const allies = Math.max(0, Math.min(n, Math.round(n * 9 / 20)));
    return Array(allies).fill(mine).concat(Array(n - allies).fill(other));
  }

  function splitFourTeams(n, mine) {
    const order = [mine, ...TEAM4.filter((t) => t !== mine)];
    const base = Math.floor(n / 4);
    let rem = n - base * 4;
    const out = [];
    for (const team of order) {
      const extra = rem > 0 ? 1 : 0;
      rem -= extra;
      for (let i = 0; i < base + extra; i++) out.push(team);
    }
    return out;
  }

  function botTeamsFor(mode, mine, n) {
    const count = clampBotCount(n != null ? n : botCountFor());
    if (mode === "tdm" && mine) return splitTwoTeams(count, mine, mine === "blue" ? "red" : "blue");
    if (mode === "4tdm" && mine) return splitFourTeams(count, mine);
    if (mode === "domination" && mine) return splitTwoTeams(count, mine, mine === "blue" ? "red" : "blue");
    if (mode === "assault" && mine) return splitTwoTeams(count, mine, mine === "blue" ? "green" : "blue");
    if (mode === "tag" && mine) return splitTwoTeams(count, mine, mine === "green" ? "red" : "green");
    if (mode === "protect") {
      const own = mine || "green";
      return splitTwoTeams(count, own, own === "red" ? "green" : "red");
    }
    if (mode === "siege") return Array(count).fill("blue");
    if (mode === "teamhunt") return Array(count).fill(HUNTER_TEAM);
    return [];
  }

  function parseArmsKey(key, armsFlag) {
    let mode = key || "ffa";
    let arms = !!armsFlag;
    if (mode === "armsrace") return { mode: "ffa", arms: true };
    if (mode.endsWith("-ar")) return { mode: mode.slice(0, -3), arms: true };
    return { mode, arms };
  }

  function modeLabel(mode, arms) {
    const m = mode == null ? state.mode : mode;
    const ar = arms == null ? !!state.armsRace : !!arms;
    const names = {
      ffa: "FFA",
      ffazero: "FFA Zero",
      tdm: "2 Teams",
      "4tdm": "4 Teams",
      manhunt: "Manhunt",
      teamhunt: "Team Manhunt",
      tag: "Tag",
      protect: "Protect",
      maze: "Maze",
      domination: "Domination",
      assault: "Assault",
      siege: "Siege",
      growth: "Growth",
      onehp: "1 HP",
      royale: "Battle Royale",
      royalemaze: "Royale Maze",
      sandbox: "Sandbox",
      armsrace: "Arms Race",
    };
    const base = names[m] || "FFA";
    if (!ar || m === "sandbox") return base;
    if (m === "ffa") return "Arms Race";
    if (m === "protect") return "Mothership AR";
    return base + " AR";
  }

  function isArmsMode() {
    return !!(state.armsRace || state.mode === "sandbox" || state.mode === "armsrace");
  }

  function armsWelcome() {
    if (!state.armsRace || state.mode === "sandbox") return;
    note("Arms Race: extra class tree, hybrids, and T4–T5 tanks at 45.");
  }

  function isHuntMode(mode) {
    const m = mode == null ? state.mode : mode;
    return m === "manhunt" || m === "teamhunt";
  }

  function isTeamHunt(mode) {
    const m = mode == null ? state.mode : mode;
    return m === "teamhunt";
  }

  function teamMode(mode) {
    const m = mode == null ? state.mode : mode;
    return m === "tdm" || m === "4tdm" || m === "tag" || m === "protect" || m === "domination" || m === "assault" || m === "siege" || m === "teamhunt";
  }

  function healerAllowed(tank) {
    if (teamMode()) return true;
    return !!(tank && getDef(tank).healer);
  }

  function isHealerId(id) {
    const child = TankCatalog.tanks[id];
    return !!(child && child.healer);
  }

  function classUpgrades(def, tank) {
    const extra = isArmsMode() && def.armsUpgrades ? def.armsUpgrades : [];
    const ids = [...(def.upgrades || []), ...extra];
    const seen = new Set();
    return ids.filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      const child = TankCatalog.tanks[id];
      if (!child || (tank && tank.level < (child.needLevel || 15))) return false;
      if (isHealerId(id) && !healerAllowed(tank)) return false;
      if (child.arms && !isArmsMode()) return false;
      return true;
    });
  }

  function pickStartTeam(mode) {
    if (mode === "siege") return "blue";
    if (mode === "teamhunt") return HUNTER_TEAM;
    if (mode === "tdm" || mode === "domination") return Math.random() < 0.5 ? "red" : "blue";
    if (mode === "assault") return Math.random() < 0.5 ? "blue" : "green";
    if (mode === "4tdm") return TEAM4[irand(0, TEAM4.length - 1)];
    if (mode === "tag" || mode === "protect") return Math.random() < 0.5 ? "red" : "green";
    return null;
  }

  function createTank(opts) {
    const pos = opts.pos || randomInWorld(200);
    const tank = {
      type: "tank",
      id: opts.id || Math.random().toString(36).slice(2),
      name: opts.name || "Tank",
      x: pos.x,
      y: pos.y,
      vx: 0,
      vy: 0,
      r: 22,
      angle: rand(0, TAU),
      color: opts.color || COLORS.enemy,
      classId: opts.classId || "basic",
      customDef: opts.customDef ? TankCatalog.cloneDef(opts.customDef) : null,
      stats: {
        regen: 0, maxHealth: 0, bodyDamage: 0, bulletSpeed: 0,
        bulletPen: 0, bulletDamage: 0, reload: 0, moveSpeed: 0,
        shieldRegen: 0, shieldCap: 0,
      },
      score: opts.score || 0,
      level: 1,
      health: 50,
      maxHealth: 50,
      gunCd: [],
      turretAim: [],
      bodyHitT: 0,
      fade: 1,
      alive: true,
      ai: opts.ai || false,
      aiState: "farm",
      aiT: rand(0, 3),
      wanderA: 0,
      killedBy: null,
      kills: 0,
      spawnProtect: 0,
      team: opts.team || null,
      closer: !!opts.closer,
      mothership: !!opts.mothership,
      tagLock: 0,
      dmgLog: [],
      strafeDir: Math.random() < 0.5 ? 1 : -1,
      aiFocus: "gun",
      aiTarget: null,
      aiJob: null,
      aiHunt: Math.random() < 0.58 ? "mid" : "roam",
      orbitR: 190 + Math.random() * 280,
      aiHuntPlayer: false,
      aiLock: null,
      aiLockUntil: 0,
      aiHurtBy: null,
      aiHurtT: 0,
      aggroN: 0,
    };
    applyLevel(tank);
    tank.health = tank.maxHealth;
    tank.shield = tank.maxShield || 0;
    tank.shield = tank.maxShield || 0;
    return tank;
  }

  function applyLevel(tank) {
    if ((state.mode === "growth" || state.armsRace) && tank && !tank.closer && !tank.mothership && !tank.dominator && !tank.boss && !tank.fodder) {
      tank.score = Math.max(Number(tank.score) || 0, xpForLevel(LEVEL_CAP));
    }
    const next = levelFromScore(tank.score);
    const gained = next > tank.level;
    tank.level = next;
    const m = modsOf(getDef(tank));
    const sizeLv = state.mode === "growth" ? tank.level : Math.min(tank.level, LEVEL_CAP);
    tank.r = (20 + Math.min(sizeLv, 45) * 0.18) * (m.size || 1);
    if (state.mode === "growth" && tank.level > 45) {
      tank.r += Math.max(0, tank.score - xpForLevel(45)) / 3e6 * 90;
      tank.r = Math.min(tank.r, 220);
    }
    if (tank.mothership) tank.r = 82;
    if (tank.closer) tank.r = 46;
    if (tank.dominator) tank.r = tank.sanctuary ? 58 + (tank.sancTier || 1) * 3 : (tank.mainBase ? 78 : 64);
    const st = tankStats(tank);
    const oldMax = tank.maxHealth || 0;
    const oldShield = tank.maxShield || 0;
    const oldHp = tank.health;
    tank.maxHealth = st.maxHealth;
    tank.maxShield = st.maxShield || 0;
    if (oldMax > 0 && oldHp != null) {
      tank.health = clamp(oldHp + Math.max(0, tank.maxHealth - oldMax), 0, tank.maxHealth);
    } else {
      tank.health = tank.maxHealth;
    }
    if (tank.shield == null) tank.shield = tank.maxShield;
    else {
      tank.shield += Math.max(0, tank.maxShield - oldShield);
      tank.shield = clamp(tank.shield, 0, tank.maxShield);
    }
    restatGrowthShots(tank);
    return gained;
  }

  function nestPos(spread = 640) {
    const c = isRoyale() ? stormCenter() : { x: WORLD.w / 2, y: WORLD.h / 2 };
    return {
      x: c.x + rand(-spread, spread),
      y: c.y + rand(-spread, spread),
    };
  }

  function createShape(kind, pos) {
    const table = {
      square: { sides: 4, r: 18, hp: 18, score: 10, color: COLORS.square, spin: 0.6 },
      triangle: { sides: 3, r: 20, hp: 32, score: 25, color: COLORS.triangle, spin: 0.75 },
      pentagon: { sides: 5, r: 26, hp: 90, score: 130, color: COLORS.pentagon, spin: 0.35 },
      alpha: { sides: 5, r: 78, hp: 2800, score: 3000, color: COLORS.alpha, spin: 0.12 },
      crasher: { sides: 3, r: 12, hp: 14, score: 15, color: COLORS.crasher, spin: 2.4 },
    };
    const t = table[kind];
    const p = pos || (kind === "alpha"
      ? { x: WORLD.w / 2, y: WORLD.h / 2 }
      : kind === "pentagon" || kind === "crasher"
        ? nestPos(kind === "crasher" ? 720 : 640)
        : randomInWorld(80));
    return {
      type: "shape", kind, sides: t.sides, x: p.x, y: p.y, vx: 0, vy: 0,
      r: t.r, health: t.hp, maxHealth: t.hp, score: t.score, color: t.color,
      rot: rand(0, TAU), spin: t.spin * (Math.random() < 0.5 ? 1 : -1), alive: true,
      wanderA: rand(0, TAU), dmgLog: [],
    };
  }

  function burst(x, y, color, n = 10, speed = 140) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU);
      const s = rand(speed * 0.3, speed);
      state.particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        r: rand(2, 5), life: rand(0.25, 0.55), max: 0.55, color,
      });
    }
  }

  function floater(x, y, text) {
    state.floaters.push({ x, y, text, life: 0.8 });
  }

  function note(text, ms) {
    const box = els.notes;
    if (!box || !text) return;
    const row = document.createElement("div");
    row.className = "note";
    row.textContent = text;
    box.appendChild(row);
    while (box.children.length > 6) box.firstElementChild.remove();
    const life = clamp(ms == null ? 4000 : ms, 2500, 5000);
    window.setTimeout(() => {
      row.classList.add("out");
      window.setTimeout(() => row.remove(), 420);
    }, life);
  }

  function clearNotes() {
    if (els.notes) els.notes.innerHTML = "";
  }

  function victimLabel(ent) {
    if (!ent) return "a tank";
    if (ent.type === "shape") {
      if (ent.kind === "alpha") return "an Alpha Pentagon";
      if (ent.kind === "pentagon") return "a Pentagon";
      if (ent.kind === "crasher") return "a Crasher";
      if (ent.kind === "triangle") return "a Triangle";
      return "a Square";
    }
    if (ent.mothership) {
      const team = ent.team && TEAMS[ent.team] ? TEAMS[ent.team].name : "";
      return team ? `the ${team} mothership` : "a mothership";
    }
    const cls = (getDef(ent) && getDef(ent).name) || "Tank";
    const raw = String(ent.name || "").trim();
    if (!raw || /^unnamed/i.test(raw)) return `an unnamed ${cls}`;
    return `${raw}'s ${cls}`;
  }

  function notePlayerKill(victim, payout) {
    if (state.spectating || !payout || payout.playerAmt <= 0) return;
    const killer = payout.killer;
    const me = state.player;
    if (!killer || !me) return;
    if (killer === me) note(`You killed ${victimLabel(victim)}${isHuntMode() && victim === state.hunted ? " · hunted 95%" : ""}.`);
    else note(`You assisted ${killer.name} in killing ${victimLabel(victim)}${isHuntMode() && victim === state.hunted ? " · hunted 95%" : ""}.`);
  }

  function populateWorld() {
    state.shapes = [];
    const smallOnly = isRoyale();
    const squares = smallOnly ? 160 : state.mode === "growth" ? 320 : 220;
    const pentas = smallOnly ? 0 : state.mode === "growth" ? 12 : 6;
    const tris = smallOnly ? irand(6, 10) : state.mode === "growth" ? irand(4, 8) : irand(1, 3);
    for (let i = 0; i < squares; i++) state.shapes.push(createShape("square"));
    for (let i = 0; i < tris; i++) state.shapes.push(createShape("triangle"));
    for (let i = 0; i < pentas; i++) state.shapes.push(createShape("pentagon", nestPos()));
    if (!smallOnly && state.mode !== "protect" && state.mode !== "maze" && state.mode !== "assault" && state.mode !== "siege") state.shapes.push(createShape("alpha"));
    if (!smallOnly) for (let i = 0; i < 2; i++) state.shapes.push(createShape("crasher"));
  }

  function takenNames() {
    const used = new Set();
    const add = (n) => {
      const s = String(n || "").trim().toLowerCase();
      if (s) used.add(s);
    };
    add(state.spawnName);
    if (state.player) add(state.player.name);
    for (const t of state.tanks) if (t) add(t.name);
    return used;
  }

  function uniqueBotName(prefer) {
    const used = takenNames();
    const want = String(prefer || "").trim();
    if (want && !used.has(want.toLowerCase())) return want;
    const pool = BOT_NAMES.filter((n) => !used.has(n.toLowerCase()));
    if (pool.length) return pool[irand(0, pool.length - 1)];
    let i = 2;
    while (used.has("bot " + i)) i++;
    return "Bot " + i;
  }

  function spawnBots() {
    const used = takenNames();
    const names = BOT_NAMES.filter((n) => !used.has(n.toLowerCase())).sort(() => Math.random() - 0.5);
    const mine = state.player && state.player.team;
    const teams = botTeamsFor(state.mode, mine, state.botCount);
    const nBots = clampBotCount(state.botCount);
    for (let i = 0; i < nBots; i++) {
      const team = teams[i] || null;
      const score = startScore();
      const aiJob = state.mode === "protect"
        ? (Math.random() < 0.48 ? "hunt" : Math.random() < 0.28 ? "defend" : "roam")
        : state.mode === "assault"
          ? (team === "green" ? (Math.random() < 0.55 ? "defend" : "roam") : (Math.random() < 0.38 ? "hunt" : "roam"))
          : state.mode === "siege"
            ? (Math.random() < 0.62 ? "defend" : "roam")
          : null;
      const home = state.mode === "protect" ? mothershipOf(team) : null;
      const bot = createTank({
        name: names[i] || uniqueBotName(),
        ai: true,
        score,
        classId: "basic",
        team,
        color: colorFor({ team }),
        pos: (state.mode === "tdm" || state.mode === "4tdm") && team
          ? spawnInBase(team)
          : state.mode === "assault" && team
            ? assaultSpawn(team)
            : state.mode === "siege"
              ? siegeSpawn()
            : isRoyale()
              ? randomInWorld(180)
            : home
            ? (aiJob === "hunt" ? awayFrom(home.x, home.y, 860) : around(home.x, home.y, 240))
            : state.mode === "domination"
              ? awayFrom(WORLD.w / 2, WORLD.h / 2, 400)
              : awayFrom(WORLD.w / 2, WORLD.h / 2, 500),
      });
      bot.aiFocus = ["gun", "gun", "farm", "ram"][irand(0, 3)];
      bot.aiJob = aiJob;
      rollBotBrain(bot);
      autoUpgradeBot(bot);
      bot.health = bot.maxHealth;
      bot.shield = bot.maxShield || 0;
      bot.spawnProtect = 4;
      state.tanks.push(bot);
    }
  }

  function autoUpgradeBot(bot) {
    applyLevel(bot);
    const rammerIds = new Set(["smasher", "landmine", "spike", "autosmasher", "bonker", "auto_bonker", "auto_smasher"]);
    const dead = state.mode === "onehp" ? ["maxHealth", "regen", "shieldCap", "shieldRegen"] : [];
    const focus = state.mode === "onehp"
      ? ["reload", "bulletDamage", "bulletSpeed", "bulletPen", "moveSpeed", "bodyDamage"]
      : bot.aiFocus === "ram"
      ? ["maxHealth", "bodyDamage", "moveSpeed", "regen", "bulletDamage"]
      : bot.aiFocus === "farm"
        ? ["reload", "bulletSpeed", "bulletPen", "bulletDamage", "moveSpeed"]
        : [
          ["bulletDamage", "reload", "bulletSpeed", "maxHealth", "moveSpeed"],
          ["reload", "bulletSpeed", "bulletPen", "bulletDamage", "moveSpeed"],
        ][irand(0, 1)];
    let left = skillPointsFor(bot.level) - spentPoints(bot);
    const cap = statCap();
    while (left > 0) {
      const open = focus.filter((k) => bot.stats[k] < cap);
      const pool = open.length
        ? open
        : STATS.filter((s) => bot.stats[s.key] < cap && !dead.includes(s.key)).map((s) => s.key);
      if (!pool.length) break;
      bot.stats[pool[irand(0, pool.length - 1)]]++;
      left--;
    }
    const seen = new Set();
    while (!seen.has(bot.classId)) {
      seen.add(bot.classId);
      const def = TankCatalog.get(bot.classId);
      let opts = classUpgrades(def, bot);
      if (!opts.length) break;
      if (bot.aiFocus === "ram") {
        const ram = opts.filter((id) => rammerIds.has(id));
        if (ram.length) opts = ram;
      } else {
        const guns = opts.filter((id) => !rammerIds.has(id));
        if (guns.length) opts = guns;
      }
      bot.classId = opts[irand(0, opts.length - 1)];
    }
    applyLevel(bot);
  }

  function around(x, y, dist) {
    const a = rand(0, TAU);
    return {
      x: clamp(x + Math.cos(a) * dist, 140, WORLD.w - 140),
      y: clamp(y + Math.sin(a) * dist, 140, WORLD.h - 140),
    };
  }

  function sidePos(side, pad = 720) {
    if (side === 0) return { x: pad, y: WORLD.h * 0.5 };
    if (side === 1) return { x: WORLD.w - pad, y: WORLD.h * 0.5 };
    if (side === 2) return { x: WORLD.w * 0.5, y: pad };
    return { x: WORLD.w * 0.5, y: WORLD.h - pad };
  }

  function mothershipOf(team) {
    return state.tanks.find((t) => t.mothership && t.alive && t.team === team) || null;
  }

  function maxOutTank(tank) {
    tank.score = Math.max(tank.score, xpForLevel(LEVEL_CAP));
    for (const st of STATS) tank.stats[st.key] = STAT_MAX;
    applyLevel(tank);
    tank.health = tank.maxHealth;
    tank.shield = tank.maxShield || 0;
    if (tank.mothership) tank.r = 82;
    if (tank.closer) tank.r = 46;
    if (tank.dominator) tank.r = tank.mainBase ? 78 : 64;
  }

  function skipToLevelCap(tank) {
    if (isZeroFfa()) return false;
    if (!tank || !tank.alive || tank.mothership || tank.closer || tank.dominator) return false;
    if (tank.level >= LEVEL_CAP) return false;
    tank.score = Math.max(tank.score, xpForLevel(LEVEL_CAP));
    applyLevel(tank);
    tank.health = tank.maxHealth;
    tank.shield = tank.maxShield || 0;
    state.classDismissed = false;
    try { renderStats(); } catch (err) {}
    try { renderClassPanel(); } catch (err) {}
    floater(tank.x, tank.y - tank.r - 8, "Level 45");
    if (tank === state.player || tank === menuTank()) note("You are now level 45.");
    return true;
  }

  function spawnMotherships() {
    const axis = Math.random() < 0.5 ? 0 : 2;
    const flip = Math.random() < 0.5 ? 0 : 1;
    const teams = ["green", "red"];
    for (let i = 0; i < 2; i++) {
      const team = teams[i];
      const side = axis + ((i + flip) % 2);
      const pos = sidePos(side);
      const m = createTank({
        name: "Mothership",
        ai: true,
        mothership: true,
        classId: "mothership",
        team,
        color: TEAMS[team].color,
        score: xpForLevel(LEVEL_CAP),
        pos: { x: pos.x, y: pos.y },
      });
      m.homeX = pos.x;
      m.homeY = pos.y;
      m.roamX = clamp(pos.x + rand(-1400, 1400), 520, WORLD.w - 520);
      m.roamY = clamp(pos.y + rand(-1400, 1400), 520, WORLD.h - 520);
      m.meetT = 0;
      m.aiT = rand(3, 7);
      maxOutTank(m);
      m.x = pos.x;
      m.y = pos.y;
      m.spawnProtect = 0;
      state.tanks.push(m);
    }
  }

  function spawnMothership() {
    spawnMotherships();
  }

  function menuTank() {
    if (state.player && state.player.mothership && state.pilotTank && state.pilotTank.alive) return state.pilotTank;
    return state.player;
  }

  function toggleMothershipControl() {
    if (state.mode !== "protect") return;
    const body = state.player && state.player.mothership ? state.pilotTank : state.player;
    const team = body && body.team;
    const m = mothershipOf(team);
    if (!m || !m.alive) return;
    if (state.player === m) {
      if (!body || !body.alive || body === m) {
        floater(m.x, m.y - m.r - 8, "No tank to return to");
        return;
      }
      m.ai = true;
      body.ai = false;
      state.player = body;
      floater(body.x, body.y - 18, "Left mothership");
      note("You left the mothership.");
      try { renderStats(); } catch (err) {}
      try { renderClassPanel(); } catch (err) {}
      return;
    }
    if (!body || !body.alive || body.mothership) return;
    body.ai = true;
    body.aiState = "defend";
    state.pilotTank = body;
    m.ai = false;
    state.player = m;
    floater(m.x, m.y - m.r - 8, "Mothership");
    note("You are now controlling the mothership.");
    try { renderStats(); } catch (err) {}
    try { renderClassPanel(); } catch (err) {}
  }

  function startGame(name, opts = {}) {
    try {
    state.spawnName = name || "Unnamed Tank";
    state.playOpts = opts;
    const parsed = parseArmsKey(opts.sandbox ? "sandbox" : (opts.mode || "ffa"), opts.armsRace);
    state.mode = opts.sandbox ? "sandbox" : parsed.mode;
    state.armsRace = opts.sandbox ? true : parsed.arms;
    state.botCount = clampBotCount(opts.botCount != null ? opts.botCount : menuBotCount);
    applyWorldSize(state.mode);
    state.tanks = [];
    state.bullets = [];
    state.particles = [];
    state.floaters = [];
    state.walls = [];
    state.maze = null;
    state.doms = [];
    state.domHold = null;
    state.domHoldT = 0;
    state.assaultBlue = null;
    state.assaultHold = false;
    state.assaultWinAt = 0;
    resetSiege();
    state.autoFire = false;
    state.autoSpin = false;
    state.time = 0;
    state.paused = false;
    state.userPaused = false;
    state.spectating = false;
    state.spectateTarget = null;
    state.ghost = null;
    state.camera.zoom = 1;
    state.lastKiller = null;
    state.royaleRestartAt = 0;
    state.stormX = WORLD.w / 2;
    state.stormY = WORLD.h / 2;
    if (isRoyale(state.mode)) pickStormCenter();
    state.respawnAt = 0;
    state.alphaRespawnAt = 0;
    state.pentagonAt = rand(6, 12);
    state.triangleAt = rand(60, 180);
    state.crasherAt = rand(60, 120);
    state.classDismissed = false;
    state.classOptions = [];
    state.hunted = null;
    state.mothership = null;
    state.pilotTank = null;
    state.closing = false;
    state.closeAt = 0;
    state.closersSpawned = false;
    state.serverResetAt = 0;
    if (state.mode === "maze" || state.mode === "royalemaze") buildMaze();
    if (state.mode === "assault") buildAssaultArena();
    if (state.mode === "siege") buildSiegeArena();
    if (state.mode === "domination") spawnDoms();
    populateWorld();
    const team = pickStartTeam(state.mode);
    if (state.mode === "protect") spawnMotherships();
    const home = team ? mothershipOf(team) : null;
    const player = createTank({
      name: state.spawnName,
      team,
      color: colorFor({ team, player: true }),
      classId: opts.classId || "basic",
      customDef: opts.customDef || null,
      score: startScore(),
      pos: (state.mode === "tdm" || state.mode === "4tdm") && team
        ? spawnInBase(team)
        : state.mode === "assault" && team
          ? assaultSpawn(team)
          : state.mode === "siege"
            ? siegeSpawn()
          : isRoyale()
            ? randomInWorld(180)
          : home
          ? around(home.x, home.y, 220)
          : awayFrom(WORLD.w / 2, WORLD.h / 2, 700),
    });
    player.ai = false;
    player.spawnProtect = 30;
    if (opts.maxStats) maxOutTank(player);
    player.health = player.maxHealth;
    player.shield = player.maxShield || 0;
    state.classDismissed = false;
    state.player = player;
    state.pilotTank = player;
    state.tanks.push(player);
    spawnBots();
    refreshHunted();
    state.camera.x = player.x;
    state.camera.y = player.y;
    running = true;
    state.paused = false;
    state.userPaused = false;
    last = performance.now();
    els.start.classList.add("hidden");
    els.death.classList.add("hidden");
    if (els.pause) els.pause.classList.add("hidden");
    if (els.spectateBar) els.spectateBar.classList.add("hidden");
    clearNotes();
    if (state.mode === "assault") welcomeSpawnNotes();
    if (state.mode === "siege") {
      welcomeSpawnNotes();
      note("Defend the blue sanctuaries. Boss waves spawn from the edges.");
      note("If every sanctuary falls, you cannot respawn. Destroy the yellow wrecks to restore them.");
    }
    if (isZeroFfa()) {
      welcomeSpawnNotes();
      note("Everyone starts at 0. Score can drop below 45.");
    }
    if (state.mode === "growth") {
      welcomeSpawnNotes();
      note("Everyone starts at 45. Grow past 45. Level cap is 1000. [N] skips to 45.");
    }
    if (state.mode === "onehp") {
      welcomeSpawnNotes();
      note("Everyone has 1 HP. Health and shield stats do nothing.");
    }
    if (isTeamHunt()) {
      welcomeSpawnNotes();
      note("One tank is hunted (red). Every other tank is on the hunter team (blue).");
      note("When the hunted dies, the new #1 joins the hunted team.");
      if (state.hunted === state.player) note("You are the hunted.", 5000);
    }
    if (isRoyale()) {
      welcomeSpawnNotes();
      note("You have 1 minute to farm and upgrade before the storm closes in.");
      note("After that, there are no respawns. Last tank standing wins.");
    }
    if (state.armsRace && state.mode !== "sandbox" && state.mode !== "growth" && state.mode !== "onehp" && !isRoyale() && state.mode !== "assault" && state.mode !== "siege" && !isTeamHunt()) {
      welcomeSpawnNotes();
    }
    armsWelcome();
    els.hud.classList.remove("hidden");
    const ws = document.getElementById("workshop");
    if (ws) ws.classList.add("hidden");
    const colorBox = document.getElementById("sandbox-colors");
    if (colorBox) colorBox.classList.toggle("hidden", state.mode !== "sandbox");
    if (els.arenaMode) els.arenaMode.textContent = modeLabel();
      try { renderStats(); } catch (err) { console.error(err); }
      try { renderClassPanel(); } catch (err) { console.error(err); }
      render();
    } catch (err) {
      console.error(err);
      running = false;
      if (els.hud) els.hud.classList.add("hidden");
      if (els.start) els.start.classList.remove("hidden");
    }
  }

  function clearOwnedShots(owner) {
    if (!owner) return;
    for (const b of state.bullets) {
      if (b.owner === owner) b.alive = false;
    }
  }

  function killTank(tank, killer, cause) {
    if (!tank || tank.deadHandled) return;
    if (tank.dominator) {
      wreckDominator(tank, killer && killer.owner ? killer.owner : killer);
      return;
    }
    tank.deadHandled = true;
    tank.alive = false;
    clearOwnedShots(tank);
    burst(tank.x, tank.y, tank.color, 18, 220);
    const deathScore = Math.max(0, Math.floor(tank.score || 0));
    const huntedKill = isHuntMode() && tank === state.hunted;
    const pool = tank.killScore
      ? tank.killScore
      : killPoolFromScore(deathScore, huntedKill);
    const payout = applyKillScore(tank, pool, killer, tank.x, tank.y);
    const credited = payout.killer;
    tank.killedBy = cause || (credited ? credited.name : killer ? killer.name : "a polygon");
    if (credited) {
      state.lastKiller = credited;
      credited.kills = (credited.kills || 0) + 1;
      if (huntedKill) floater(tank.x, tank.y - 24, "Hunted down · 95%");
    }
    notePlayerKill(tank, payout);
    if (isHuntMode()) refreshHunted();
    if (tank.boss || tank.fodder) onSiegeEnemyKilled();
    if (tank === state.player) {
      if (tank.mothership) {
        const body = state.pilotTank;
        checkProtectClose();
        if (body && body.alive && body !== tank) {
          body.ai = false;
          state.player = body;
          shake = 10;
          floater(body.x, body.y - 18, "Mothership down");
          note("Your mothership was destroyed.", 5000);
        } else {
          shake = 14;
          showDeath(tank);
        }
      } else {
        shake = 14;
        showDeath(tank);
      }
    } else if (tank.mothership) {
      if (state.player === tank && state.pilotTank && state.pilotTank.alive) {
        state.pilotTank.ai = false;
        state.player = state.pilotTank;
      }
      floater(tank.x, tank.y - tank.r - 8, `${TEAMS[tank.team] ? TEAMS[tank.team].name : ""} mothership down`);
      checkProtectClose();
    } else if (!tank.closer && !tank.boss && !tank.fodder && !state.closing && !royaleLocked()) {
      const team = isTeamHunt() ? HUNTER_TEAM : tank.team;
      const kept = carryScore(deathScore);
      const focus = tank.aiFocus;
      setTimeout(() => {
        if (!running || state.closing || royaleLocked()) return;
        const bot = createTank({
          name: tank.name,
          ai: true,
          score: kept,
          classId: "basic",
          team,
          color: colorFor({ team }),
          pos: (state.mode === "tdm" || state.mode === "4tdm") && team
            ? spawnInBase(team)
            : state.mode === "assault" && team
              ? assaultSpawn(team)
              : state.mode === "siege"
                ? siegeSpawn()
              : isRoyale()
                ? randomInWorld(180)
              : state.mode === "protect" && mothershipOf(team)
              ? around(mothershipOf(team).x, mothershipOf(team).y, 220)
              : awayFrom(WORLD.w / 2, WORLD.h / 2, 900),
        });
        bot.aiFocus = focus || ["gun", "gun", "farm", "ram"][irand(0, 3)];
        bot.aiHunt = Math.random() < 0.58 ? "mid" : "roam";
        rollBotBrain(bot);
        if (state.mode === "protect") {
          bot.aiJob = Math.random() < 0.48 ? "hunt" : Math.random() < 0.28 ? "defend" : "roam";
        } else if (state.mode === "assault") {
          bot.aiJob = tank.guard ? "guard" : (team === "green" ? (Math.random() < 0.55 ? "defend" : "roam") : (Math.random() < 0.38 ? "hunt" : "roam"));
          if (tank.guard) {
            bot.guard = true;
            bot.guardOf = healerDominator();
            bot.classId = "assault_guard";
          }
        } else if (state.mode === "siege") {
          bot.aiJob = Math.random() < 0.62 ? "defend" : "roam";
        }
        autoUpgradeBot(bot);
        if (bot.guard) {
          bot.classId = "assault_guard";
          applyLevel(bot);
        }
        bot.health = bot.maxHealth;
        bot.shield = bot.maxShield || 0;
        bot.spawnProtect = 8;
        state.tanks.push(bot);
        refreshHunted();
      }, 1800);
    }
  }

  function giveScore(tank, amount, x, y) {
    if (!tank || !tank.alive || amount <= 0) return;
    tank.score += amount;
    const leveled = applyLevel(tank);
    if (tank === state.player) {
      floater(x, y - 10, `+${Math.floor(amount)}`);
      renderStats();
      if (leveled) {
        state.classDismissed = false;
        renderClassPanel();
      }
    } else if (leveled) {
      autoUpgradeBot(tank);
    }
  }

  const ASSIST_WINDOW = 30;

  function dealerOf(src) {
    if (!src) return null;
    if (src.type === "tank") return src;
    if (src.owner && src.owner.type === "tank") return src.owner;
    return null;
  }

  function creditDamage(target, amount, src) {
    const dealer = dealerOf(src);
    if (!target || !dealer || dealer === target || amount <= 0) return;
    let log = target.dmgLog;
    if (!log) log = target.dmgLog = [];
    log.push({ tank: dealer, amount, t: state.time });
    if (target.ai && dealer.type === "tank") {
      target.aiHurtBy = dealer;
      target.aiHurtT = state.time;
    }
    const cut = state.time - ASSIST_WINDOW;
    if (log.length > 48 && log[0].t < cut) {
      let i = 0;
      while (i < log.length && log[i].t < cut) i++;
      if (i) target.dmgLog = log.slice(i);
    }
  }

  function damageShares(target) {
    const log = target.dmgLog || [];
    const cut = state.time - ASSIST_WINDOW;
    const totals = new Map();
    for (const e of log) {
      if (e.t < cut || !e.tank || e.amount <= 0) continue;
      totals.set(e.tank, (totals.get(e.tank) || 0) + e.amount);
    }
    const shares = [];
    let sum = 0;
    for (const [tank, amt] of totals) {
      if (!tank || tank.type !== "tank" || !tank.alive || tank.closer) continue;
      shares.push({ tank, amt });
      sum += amt;
    }
    return { shares, sum };
  }

  function applyKillScore(target, total, fallback, x, y) {
    total = Math.max(0, Math.floor(total));
    const claimable = (t) => t && t.alive && !t.closer && t.type === "tank";
    const fb = claimable(dealerOf(fallback) || fallback) ? (dealerOf(fallback) || fallback) : null;
    const me = state.player;
    if (total <= 0) return { killer: fb, playerAmt: 0 };
    const { shares, sum } = damageShares(target);
    if (sum <= 0 || !shares.length) {
      if (fb) giveScore(fb, total, x, y);
      return { killer: fb, playerAmt: fb === me ? total : 0 };
    }
    shares.sort((a, b) => b.amt - a.amt);
    const parts = shares.map((s) => ({ tank: s.tank, n: Math.floor(total * (s.amt / sum)) }));
    let used = 0;
    for (const p of parts) used += p.n;
    parts[0].n += total - used;
    let playerAmt = 0;
    for (const p of parts) {
      if (p.n > 0) {
        giveScore(p.tank, p.n, x, y);
        if (p.tank === me) playerAmt = p.n;
      }
    }
    return { killer: parts[0].tank, playerAmt };
  }

  function splitKillScore(target, total, fallback, x, y) {
    return applyKillScore(target, total, fallback, x, y).killer;
  }

  function arenaLocked() {
    return !!state.closersSpawned || !!state.serverResetAt;
  }

  function respawnWait() {
    return Math.max(0, (state.respawnAt || 0) - state.time);
  }

  function isRoyale(mode) {
    const m = mode == null ? state.mode : mode;
    return m === "royale" || m === "royalemaze";
  }

  function pickStormCenter() {
    const pad = Math.min(WORLD.w, WORLD.h) * 0.2;
    state.stormX = rand(pad, WORLD.w - pad);
    state.stormY = rand(pad, WORLD.h - pad);
  }

  function stormCenter() {
    return {
      x: state.stormX != null ? state.stormX : WORLD.w / 2,
      y: state.stormY != null ? state.stormY : WORLD.h / 2,
    };
  }

  function royaleMaxR() {
    const c = stormCenter();
    return Math.hypot(Math.max(c.x, WORLD.w - c.x), Math.max(c.y, WORLD.h - c.y));
  }

  function royaleRadius() {
    if (!isRoyale()) return royaleMaxR();
    if (state.time < ROYALE_PREP) return royaleMaxR();
    const t = clamp((state.time - ROYALE_PREP) / ROYALE_SHRINK, 0, 1);
    return lerp(royaleMaxR(), ROYALE_END_R, t);
  }

  function royaleLocked() {
    return isRoyale() && state.time >= ROYALE_PREP;
  }

  function royaleInside(ent, extra = 0) {
    if (!ent) return true;
    const c = stormCenter();
    const dx = ent.x - c.x;
    const dy = ent.y - c.y;
    return Math.hypot(dx, dy) <= royaleRadius() + extra;
  }

  function royaleBurnRate() {
    if (!royaleLocked()) return ROYALE_BURN;
    const elapsed = Math.max(0, state.time - ROYALE_PREP);
    const shrinkT = clamp(elapsed / ROYALE_SHRINK, 0, 1);
    const after = Math.max(0, elapsed - ROYALE_SHRINK);
    return ROYALE_BURN * (1 + shrinkT * 3.5 + after / 18);
  }

  function royaleContestants() {
    return state.tanks.filter((t) => t.alive && !t.closer && !t.dominator && !t.boss && !t.fodder && !t.mothership);
  }

  function checkRoyale() {
    if (!isRoyale() || state.closing || state.royaleRestartAt) return;
    const living = royaleContestants();
    if (state.time < 1.2 || living.length > 1) return;
    const winner = living[0];
    if (winner) {
      if (winner === state.player) note("You won. Fresh server shortly.", 5000);
      beginArenaClose(`${winner.name} wins the round! Fresh server shortly.`);
      floater(winner.x, winner.y - winner.r - 18, "Winner");
    } else {
      beginArenaClose("No tanks remain. Fresh server shortly.");
    }
  }

  function scatterRoyalePoint(placed) {
    let p = randomInWorld(240);
    for (let i = 0; i < 22; i++) {
      const tryP = randomInWorld(240);
      const far = placed.every((q) => (tryP.x - q.x) ** 2 + (tryP.y - q.y) ** 2 > 360 * 360);
      if (far) {
        p = tryP;
        break;
      }
    }
    placed.push(p);
    return p;
  }

  function reviveRoyaleBot(old) {
    const bot = createTank({
      name: old.name,
      ai: true,
      score: carryScore(old.score),
      classId: "basic",
      team: old.team,
      color: colorFor({ team: old.team }),
      pos: randomInWorld(240),
    });
    bot.aiFocus = old.aiFocus || ["gun", "gun", "farm", "ram"][irand(0, 3)];
    bot.aiHunt = Math.random() < 0.58 ? "mid" : "roam";
    rollBotBrain(bot);
    autoUpgradeBot(bot);
    bot.health = bot.maxHealth;
    bot.shield = bot.maxShield || 0;
    bot.spawnProtect = 5;
    state.tanks.push(bot);
    return bot;
  }

  function beginRoyaleStorm() {
    if (!(state.player && state.player.alive)) {
      state.respawnAt = 0;
      respawnPlayer(true);
    }
    const deadBots = state.tanks.filter((t) =>
      t.ai && !t.alive && !t.closer && !t.dominator && !t.boss && !t.fodder && !t.mothership
    );
    for (const dead of deadBots) reviveRoyaleBot(dead);
    const placed = [];
    for (const tank of royaleContestants()) {
      const p = scatterRoyalePoint(placed);
      tank.x = p.x;
      tank.y = p.y;
      tank.vx = 0;
      tank.vy = 0;
      tank.spawnProtect = Math.max(tank.spawnProtect || 0, 5);
    }
    if (state.player && state.player.alive) {
      state.spectating = false;
      state.spectateTarget = null;
      state.ghost = null;
      state.camera.x = state.player.x;
      state.camera.y = state.player.y;
      els.death.classList.add("hidden");
      if (els.spectateBar) els.spectateBar.classList.add("hidden");
    }
    note("The storm is closing. Everyone has been scattered. No respawns.", 5000);
    try { renderStats(); } catch (err) {}
    try { renderClassPanel(); } catch (err) {}
  }

  function canRespawn() {
    if (royaleLocked()) return false;
    if (state.mode === "siege" && !liveSanctuaries().length) return false;
    return running && !arenaLocked() && respawnWait() <= 0 && !(state.player && state.player.alive);
  }

  function updateRespawnUi() {
    const deathOpen = els.death && !els.death.classList.contains("hidden");
    if (!deathOpen && !state.spectating) return;
    const lock = arenaLocked() || state.closing;
    const wait = respawnWait();
    const ready = canRespawn();
    const secs = Math.ceil(wait);
    const label = lock ? "Fresh server" : royaleLocked() ? "Next round" : wait > 0 ? `Respawn (${secs})` : "Respawn";
    if (els.again) {
      els.again.disabled = !ready;
      els.again.textContent = label;
    }
    if (els.spectateAgain) {
      els.spectateAgain.disabled = !ready;
      els.spectateAgain.textContent = label;
    }
    if (els.deathWait) {
      if (lock) els.deathWait.textContent = "Fresh server starting shortly.";
      else if (royaleLocked()) els.deathWait.textContent = "No respawns after the storm starts. Next round begins when one tank remains.";
      else if (state.mode === "siege" && !liveSanctuaries().length) els.deathWait.textContent = "All sanctuaries are destroyed. You cannot respawn.";
      else if (wait > 0) els.deathWait.textContent = `(you may respawn in ${secs} second${secs === 1 ? "" : "s"})`;
      else els.deathWait.textContent = "(you may respawn)";
    }
  }

  function showDeath(tank) {
    state.autoFire = false;
    state.autoSpin = false;
    const best = Math.max(tank.score, Number(localStorage.getItem("tankfield-best") || 0));
    localStorage.setItem("tankfield-best", String(best));
    els.deathMsg.textContent = `Destroyed by ${tank.killedBy}.`;
    els.deathStats.textContent = `Score ${formatScore(tank.score)}  ·  Level ${tank.level}  ·  ${getDef(tank).name}`;
    els.bestScore.textContent = `Best score: ${formatScore(best)}`;
    state.respawnAt = state.time + 5;
    updateRespawnUi();
    els.death.classList.remove("hidden");
  }

  function respawnPlayer(force) {
    if (!force && !canRespawn()) return false;
    if (state.player && state.player.alive) return false;
    const opts = state.playOpts || {};
    const prev = state.player;
    const team = isTeamHunt() ? HUNTER_TEAM : (prev && prev.team ? prev.team : pickStartTeam(state.mode));
    const home = team ? mothershipOf(team) : null;
    const pos = (state.mode === "tdm" || state.mode === "4tdm") && team
      ? spawnInBase(team)
      : state.mode === "assault" && team
        ? assaultSpawn(team)
        : state.mode === "siege"
          ? siegeSpawn()
        : isRoyale()
          ? randomInWorld(180)
        : home
          ? around(home.x, home.y, 220)
          : awayFrom(WORLD.w / 2, WORLD.h / 2, 700);
    const player = createTank({
      name: state.spawnName,
      team,
      color: state.mode === "sandbox" ? (state.selectedColor || colorFor({ team, player: true })) : colorFor({ team, player: true }),
      classId: state.mode === "sandbox" ? (opts.classId || "basic") : "basic",
      customDef: state.mode === "sandbox" ? (opts.customDef || null) : null,
      score: carryScore(prev && prev.score),
      pos,
    });
    player.ai = false;
    player.spawnProtect = 8;
    if (opts.maxStats) maxOutTank(player);
    player.health = player.maxHealth;
    player.shield = player.maxShield || 0;
    state.spectating = false;
    state.spectateTarget = null;
    state.ghost = null;
    state.player = player;
    state.pilotTank = player;
    state.tanks.push(player);
    state.camera.x = player.x;
    state.camera.y = player.y;
    state.camera.zoom = 1;
    state.classDismissed = false;
    els.death.classList.add("hidden");
    if (els.spectateBar) els.spectateBar.classList.add("hidden");
    if (state.mode === "assault") welcomeSpawnNotes();
    if (state.mode === "siege" || state.mode === "growth") welcomeSpawnNotes();
    if (state.mode === "onehp") {
      welcomeSpawnNotes();
      note("Everyone has 1 HP. Health and shield stats do nothing.");
    }
    if (isRoyale() && !force) {
      welcomeSpawnNotes();
      note("Prep is still going. The storm has not started yet.");
    }
    if (state.armsRace && state.mode !== "sandbox" && state.mode !== "onehp" && state.mode !== "assault" && state.mode !== "siege" && state.mode !== "growth" && !(isRoyale() && !force)) {
      welcomeSpawnNotes();
    }
    armsWelcome();
    try { renderStats(); } catch (err) {}
    try { renderClassPanel(); } catch (err) {}
    refreshHunted();
    return true;
  }

  function spectateList() {
    return state.tanks.filter((t) => t.alive && !t.closer && !t.dominator);
  }

  function spectateFree() {
    return !!(state.spectating && state.ghost && !(state.spectateTarget && state.spectateTarget.alive));
  }

  function placeGhost(x, y) {
    const r = 16;
    state.ghost = {
      x: clamp(x, r, WORLD.w - r),
      y: clamp(y, r, WORLD.h - r),
      r,
      ghost: true,
      alive: true,
    };
  }

  function cameraFocus() {
    if (state.spectating) {
      if (state.spectateTarget && state.spectateTarget.alive) return state.spectateTarget;
      if (state.ghost) return state.ghost;
    }
    if (state.player && state.player.alive) return state.player;
    return spectateList()[0] || state.player;
  }

  function viewFov() {
    const p = cameraFocus();
    if (!p || p.ghost || !p.alive) return 1;
    return tankStats(p).fov || 1;
  }

  function beginSpectate() {
    if (!running) return;
    state.spectating = true;
    els.death.classList.add("hidden");
    if (els.pause) els.pause.classList.add("hidden");
    state.userPaused = false;
    const ws = document.getElementById("workshop");
    state.paused = !!(ws && !ws.classList.contains("hidden"));
    const src = state.player || state.camera;
    placeGhost(src.x, src.y);
    state.spectateTarget = null;
    if (els.spectateBar) els.spectateBar.classList.remove("hidden");
    updateSpectateLabel();
    try { renderClassPanel(); } catch (err) {}
  }

  function enterFreeCam(from) {
    if (!state.ghost) placeGhost(state.camera.x, state.camera.y);
    if (from) {
      state.ghost.x = from.x;
      state.ghost.y = from.y;
    }
    state.spectateTarget = null;
    updateSpectateLabel();
  }

  function cycleSpectate(dir) {
    const list = spectateList();
    const slots = [null, ...list];
    let i = state.spectateTarget && state.spectateTarget.alive ? slots.indexOf(state.spectateTarget) : 0;
    if (i < 0) i = 0;
    i = (i + dir + slots.length) % slots.length;
    state.spectateTarget = slots[i];
    if (state.spectateTarget && state.ghost) {
      state.ghost.x = state.spectateTarget.x;
      state.ghost.y = state.spectateTarget.y;
    }
    updateSpectateLabel();
  }

  function bumpSpectateZoom(dir) {
    if (!state.spectating) return;
    const step = dir > 0 ? 1.12 : 1 / 1.12;
    state.camera.zoom = clamp(state.camera.zoom * step, 0.28, 3.4);
  }

  function updateGhost(dt) {
    if (!state.spectating || !state.ghost) return;
    const moving = keys.has("w") || keys.has("arrowup") || keys.has("s") || keys.has("arrowdown")
      || keys.has("a") || keys.has("arrowleft") || keys.has("d") || keys.has("arrowright");
    if (state.spectateTarget && state.spectateTarget.alive) {
      if (moving) enterFreeCam(state.spectateTarget);
      else return;
    }
    let mx = 0;
    let my = 0;
    if (keys.has("w") || keys.has("arrowup")) my -= 1;
    if (keys.has("s") || keys.has("arrowdown")) my += 1;
    if (keys.has("a") || keys.has("arrowleft")) mx -= 1;
    if (keys.has("d") || keys.has("arrowright")) mx += 1;
    if (!mx && !my) return;
    const m = Math.hypot(mx, my) || 1;
    const speed = 560;
    const g = state.ghost;
    g.x = clamp(g.x + (mx / m) * speed * dt, g.r, WORLD.w - g.r);
    g.y = clamp(g.y + (my / m) * speed * dt, g.r, WORLD.h - g.r);
  }

  function updateSpectateLabel() {
    const t = state.spectateTarget;
    if (!els.spectateLabel) return;
    if (t && t.alive) els.spectateLabel.textContent = `Spectating ${t.name}  ·  WASD to fly`;
    else els.spectateLabel.textContent = "Free camera  ·  WASD · scroll zoom";
  }

  function setUserPaused(on) {
    state.userPaused = !!on;
    const ws = document.getElementById("workshop");
    const workshopOpen = ws && !ws.classList.contains("hidden");
    state.paused = state.userPaused || workshopOpen;
    if (els.pause) els.pause.classList.toggle("hidden", !state.userPaused);
    if (state.userPaused) keys.clear();
  }

  function goToMenu() {
    running = false;
    state.userPaused = false;
    state.paused = false;
    state.spectating = false;
    state.spectateTarget = null;
    state.ghost = null;
    state.camera.zoom = 1;
    if (els.pause) els.pause.classList.add("hidden");
    if (els.spectateBar) els.spectateBar.classList.add("hidden");
    clearNotes();
    els.death.classList.add("hidden");
    els.hud.classList.add("hidden");
    els.start.classList.remove("hidden");
    resize();
    const ws = document.getElementById("workshop");
    if (ws) ws.classList.add("hidden");
  }

  function handleEscape(e) {
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
      e.target.blur();
      return;
    }
    const ws = document.getElementById("workshop");
    if (ws && !ws.classList.contains("hidden")) {
      if (window.TankWorkshop) window.TankWorkshop.close();
      return;
    }
    if (!els.start.classList.contains("hidden")) return;
    if (running && !els.death.classList.contains("hidden")) {
      beginSpectate();
      return;
    }
    if (running) setUserPaused(!state.userPaused);
  }

  function sizeFactorOf(tank) {
    if (!tank || tank.closer || tank.dominator) return 1;
    const m = modsOf(getDef(tank));
    const core = (tank.mothership ? 82 : 20) * (m.size || 1);
    return Math.max(0.35, (tank.r || core) / core);
  }

  function stampGrowth(b, tank) {
    b.growSf = sizeFactorOf(tank);
    b.growR = tank.r || 20;
    b.growScore = (tank && tank.score) || 0;
    b.growLevel = (tank && tank.level) || 1;
  }

  function shotWeight(b) {
    if (!b) return 1;
    const owner = b.owner;
    const sf = Math.max(0.35, b.growSf || (owner && sizeFactorOf(owner)) || 1);
    const score = (b.growScore != null ? b.growScore : (owner && owner.score)) || 0;
    const scoreW = Math.pow(1 + Math.max(0, score) / Math.max(1, xpForLevel(LEVEL_CAP)), 0.4);
    return Math.max(0.5, sf * scoreW * Math.max(3, b.r || 4));
  }

  function restatGrowthShots(tank) {
    if (state.mode !== "growth" || !tank || !state.bullets) return;
    const sf = sizeFactorOf(tank);
    const r = tank.r || 20;
    for (const b of state.bullets) {
      if (!b.alive || b.owner !== tank || b.growSf == null) continue;
      const persist = b.kind === "drone" || b.kind === "swarm" || b.kind === "minion" || b.kind === "trap" || b.kind === "pillbox";
      if (!persist) continue;
      const ratio = sf / Math.max(0.35, b.growSf);
      b.growScore = tank.score || 0;
      b.growLevel = tank.level || 1;
      if (Math.abs(ratio - 1) < 0.015) continue;
      b.damage *= Math.sqrt(ratio);
      b.health *= ratio;
      b.r *= r / Math.max(1, b.growR || r);
      b.growSf = sf;
      b.growR = r;
    }
  }

  function unitOf(tank) { return tank.r / 12; }

  function shotRadius(tank, gun, sizeMul, kind) {
    const u = unitOf(tank);
    const W = (gun && gun.pos && gun.pos[1]) || 8;
    const A = (gun && gun.pos && gun.pos[2] != null) ? gun.pos[2] : 1;
    const muzzle = Math.max(1.6, W * Math.abs(A || 1) * u * 0.5);
    let br = muzzle * Math.max(0.78, sizeMul || 1) * 1.08;
    if (tank.mothership && kind !== "drone" && kind !== "swarm" && kind !== "minion") br = Math.max(br, 8.2 * (sizeMul || 1));
    if (tank.closer) br = 26;
    if (kind === "heal") br = Math.max(3.1, br * 0.36);
    if (kind === "minion") br = Math.max(10, tank.r * 0.55);
    if (kind === "pillbox") br = Math.max(8, muzzle * 1.05 * (sizeMul || 1));
    if (kind === "trap") br = Math.max(br, muzzle * 0.92);
    return br;
  }

  function countAutoGuns(def) {
    let n = 0;
    for (const g of (def && def.guns) || []) if (g && g.type === "auto") n++;
    return n;
  }

  function autoRingMount(tank, gun) {
    return gun && gun.type === "auto" && countAutoGuns(getDef(tank)) >= 2;
  }

  function autoPivot(tank, gun, index) {
    const u = unitOf(tank);
    const X = (gun.pos && gun.pos[3]) || 0;
    const Y = (gun.pos && gun.pos[4]) || 0;
    const rest = tank.angle + (((gun.pos && gun.pos[5]) || 0) * Math.PI) / 180;
    const ang = gunAngle(tank, gun, index);
    const ring = autoRingMount(tank, gun);
    const px = -Math.sin(ring ? rest : ang);
    const py = Math.cos(ring ? rest : ang);
    const along = ring ? tank.r * 0.5 + X * u : X * u;
    return {
      x: tank.x + Math.cos(ring ? rest : ang) * along + px * Y * u,
      y: tank.y + Math.sin(ring ? rest : ang) * along + py * Y * u,
      ang,
      rest,
      ring,
    };
  }

  function muzzleSpawn(tank, gun, ang, br, index) {
    const u = unitOf(tank);
    const [L, , , X, Y] = gun.pos;
    if (gun.type === "auto") {
      const pivot = autoPivot(tank, gun, index);
      const len = Math.max(2, (pivot.ring ? L * 0.62 : L) * u);
      return {
        x: pivot.x + Math.cos(ang) * len,
        y: pivot.y + Math.sin(ang) * len,
      };
    }
    const px = -Math.sin(ang);
    const py = Math.cos(ang);
    const tipAlong = (X + L) * u;
    const perp = Y * u;
    const hullAlong = Math.sqrt(Math.max(0, tank.r * tank.r - perp * perp));
    const along = Math.min(tipAlong, hullAlong) - Math.min(br * 0.18, tank.r * 0.06);
    return {
      x: tank.x + Math.cos(ang) * along + px * perp,
      y: tank.y + Math.sin(ang) * along + py * perp,
    };
  }

  function gunAngle(tank, gun, index) {
    if (gun.type === "auto") {
      const aim = tank.turretAim && tank.turretAim[index];
      if (aim != null) return aim;
      return tank.angle + (((gun.pos && gun.pos[5]) || 0) * Math.PI) / 180;
    }
    return tank.angle + (gun.pos[5] * Math.PI) / 180;
  }

  function applyRecoil(tank, gun, kind, shoot, width, ang) {
    if (!tank || tank.closer || tank.mothership || tank.dominator) return;
    if (gun.type === "deco") return;
    let rec = gun.recoil;
    if (rec == null) rec = shoot && shoot.recoil != null ? shoot.recoil : 1;
    const widthMul = Math.max(0.4, (width || 8) / 8);
    const sizeMul = (shoot && shoot.size) || 1;
    const mass = Math.max(0.5, (tank.r / 22) ** 2);
    const kick = rec * widthMul * sizeMul * 48 / mass;
    tank.vx -= Math.cos(ang) * kick;
    tank.vy -= Math.sin(ang) * kick;
  }

  function countOwned(kind, owner) {
    let n = 0;
    for (const b of state.bullets) if (b.alive && b.owner === owner && b.kind === kind) n++;
    return n;
  }

  function destroyOldest(kind, owner) {
    let oldest = null;
    for (const b of state.bullets) {
      if (!b.alive || b.owner !== owner || b.kind !== kind) continue;
      if (!oldest || b.age > oldest.age) oldest = b;
    }
    if (oldest) oldest.alive = false;
  }

  function flockKind(kind) {
    return kind === "drone" || kind === "swarm" || kind === "minion";
  }

  function capKind(type) {
    if (type === "minion" || type === "pillbox" || type === "drone" || type === "swarm") return type;
    return null;
  }

  function gunShootSettings(tank, gun) {
    const def = getDef(tank);
    const m = modsOf(def);
    const sk = skillOf(tank);
    const shoot = {
      reload: 1, recoil: 1, shudder: 1, size: 1, health: 1, damage: 1,
      pen: 1, speed: 1, maxSpeed: 1, range: 1, density: 1, spray: 1, resist: 1,
      ...(gun.shoot || {}),
    };
    if (!gun.hasStack) {
      shoot.reload *= def.reload || 1;
      shoot.damage *= def.bulletDamage || 1;
      shoot.speed *= def.bulletSpeed || 1;
      shoot.maxSpeed *= def.bulletSpeed || 1;
      shoot.pen *= def.bulletPen || 1;
      shoot.health *= def.bulletPen || 1;
      shoot.size *= def.bulletSize || 1;
    }
    shoot.reload /= m.reload || 1;
    shoot.damage *= m.damage || 1;
    shoot.size *= m.size || 1;
    const kind = gun.type === "auto" ? "bullet" : gun.type;
    const proj = (window.TankCatalog && TankCatalog.PROJECTILE && TankCatalog.PROJECTILE[kind]) || TankCatalog.PROJECTILE.bullet;
    const sizeFactor = sizeFactorOf(tank);
    const out = {
      SPEED: shoot.maxSpeed * sk.spd,
      HEALTH: shoot.health * sk.str,
      RESIST: shoot.resist,
      DAMAGE: shoot.damage * sk.dam,
      PENETRATION: Math.max(1, shoot.pen * sk.pen),
      RANGE: shoot.range / Math.sqrt(sk.spd),
      DENSITY: (shoot.density * sk.pen * sk.pen) / sizeFactor,
      reload: shoot.reload,
      recoil: shoot.recoil,
      shudder: shoot.shudder,
      size: shoot.size,
      spray: shoot.spray,
      speed: shoot.speed,
      launch: shoot.speed * sk.spd,
      rld: sk.rld,
    };
    const calc = gun.calculator || "default";
    if (calc === "swarm") {
      out.PENETRATION = Math.max(1, shoot.pen * (0.5 * (sk.pen - 1) + 1));
      out.HEALTH /= Math.max(0.2, shoot.pen * sk.pen);
    } else if (calc === "trap") {
      out.RANGE = shoot.range;
    } else if (calc === "drone") {
      out.PENETRATION = Math.max(1, shoot.pen * (0.5 * (sk.pen - 1) + 1));
      out.HEALTH = (shoot.health * sk.str + sizeFactor) / Math.pow(sk.pen, 0.8);
      out.DAMAGE = shoot.damage * sk.dam * Math.sqrt(sizeFactor) * Math.sqrt(shoot.pen * sk.pen);
    }
    if (proj) {
      out.HEALTH *= proj.HEALTH || 1;
      out.DAMAGE *= proj.DAMAGE || 1;
      out.RANGE *= (proj.RANGE || 90) / 90;
      out.SPEED *= proj.SPEED == null ? 1 : proj.SPEED;
      out.accel = (proj.ACCEL || 0) * 1.5 * ARRAS_TICK;
      out.damp = proj.DAMP || 0;
    }
    out.HEALTH *= 7.3;
    if (kind === "heal") out.DAMAGE = Math.abs(out.DAMAGE);
    if (state.mode === "growth") {
      out.HEALTH *= sizeFactor;
      if (calc !== "drone") out.DAMAGE *= Math.sqrt(sizeFactor);
    }
    return out;
  }

  function spawnShot(tank, gun, index, st) {
    const W = gun.pos[1];
    const shoot = gunShootSettings(tank, gun);
    const sprayRad = ((shoot.spray || 0) * (shoot.shudder || 1) * Math.PI) / 180;
    const jitter = sprayRad ? (Math.random() - 0.5) * 2 * sprayRad : 0;
    const ang = gunAngle(tank, gun, index) + jitter + rand(-(gun.spread || 0), gun.spread || 0);
    const kind = gun.type === "auto" ? "bullet" : gun.type;
    const gs = gun.stats || {};
    const sizeMul = gun.size || gs.size || shoot.size || 1;
    const br = shotRadius(tank, gun, sizeMul, kind);
    const spawn = muzzleSpawn(tank, gun, ang, br, index);
    if (tank.team) {
      const z = zoneAt(spawn.x, spawn.y);
      if (z && z !== tank.team) return;
    }
    const speed = Math.max(40, (shoot.launch || 4) * 70);
    applyRecoil(tank, gun, kind, shoot, W, ang);
    let lifeBase = Math.max(0.45, 1.55 * shoot.RANGE);
    if (kind === "drone" || kind === "minion") lifeBase = 999;
    else if (kind === "swarm") lifeBase = Math.max(2.4, (shoot.RANGE || 2.5) * 3.2);
    else if (kind === "trap" || kind === "pillbox") lifeBase = Math.max(6, (shoot.RANGE || 5) * 3);
    else if (kind === "missile") lifeBase = 2.4;
    let orbit = rand(0, TAU);
    if (flockKind(kind)) orbit = countOwned(kind, tank) * 2.39996;
    let motion = "coast";
    if (kind === "drone" || kind === "minion") motion = "chase";
    else if (kind === "swarm") motion = "swarm";
    else if (kind === "trap" || kind === "pillbox") motion = "glide";
    const sides = gun.shape || (kind === "swarm" ? 3 : kind === "drone" ? 3 : kind === "trap" || kind === "pillbox" ? 4 : 0);
    const topSpeed = (kind === "trap" || kind === "pillbox") ? 0 : Math.max(50, (shoot.SPEED || 1) * 70);
    state.bullets.push({
      x: spawn.x,
      y: spawn.y,
      vx: Math.cos(ang) * speed + tank.vx * 0.15,
      vy: Math.sin(ang) * speed + tank.vy * 0.15,
      r: br,
      health: Math.max(0.2, shoot.HEALTH),
      damage: Math.max(0.2, Math.abs(shoot.DAMAGE) * (gs.damage || 1)),
      pen: shoot.PENETRATION || 1,
      life: lifeBase * (gs.life || 1),
      color: kind === "heal" ? "#8abc3f" : tank.color,
      owner: tank,
      kind,
      angle: kind === "heal" ? rand(0, TAU) : ang,
      orbit,
      age: 0,
      alive: true,
      motion,
      topSpeed,
      accel: shoot.accel || 0,
      damp: shoot.damp || 0,
      sides,
      necro: !!(gun.necro || (getDef(tank) && getDef(tank).necro)),
      healer: kind === "heal",
      gunCd: kind === "minion" || kind === "pillbox" ? 0.4 : 0,
      turretAim: ang,
    });
    stampGrowth(state.bullets[state.bullets.length - 1], tank);
  }

  function tryNecro(owner, shape, template) {
    if (!owner || !owner.alive || !shape || !shape.alive || shape.kind !== "square") return false;
    if (!(template && template.necro) && !getDef(owner).necro) return false;
    const cap = Math.max(1, tankStats(owner).maxDrones || 0);
    if (countOwned("drone", owner) >= cap) return false;
    shape.alive = false;
    let stats = null;
    if (template) {
      stats = {
        health: template.health,
        damage: template.damage,
        pen: template.pen,
        r: Math.max(template.r, shape.r * 0.82),
        topSpeed: template.topSpeed,
        accel: template.accel,
      };
    } else {
      const gun = (getDef(owner).guns || []).find((g) => g.necro) || (getDef(owner).guns || []).find((g) => g.type === "drone");
      if (!gun) return false;
      const shoot = gunShootSettings(owner, gun);
      stats = {
        health: Math.max(0.2, shoot.HEALTH),
        damage: Math.max(0.2, Math.abs(shoot.DAMAGE)),
        pen: shoot.PENETRATION || 1,
        r: Math.max(shape.r * 0.82, 8),
        topSpeed: Math.max(50, (shoot.SPEED || 1) * 70),
        accel: shoot.accel || 3.825,
      };
    }
    state.bullets.push({
      x: shape.x,
      y: shape.y,
      vx: shape.vx,
      vy: shape.vy,
      r: stats.r,
      health: stats.health,
      damage: stats.damage,
      pen: stats.pen,
      life: 999,
      color: owner.color,
      owner,
      kind: "drone",
      angle: Math.atan2(shape.vy, shape.vx) || 0,
      orbit: countOwned("drone", owner) * 2.39996,
      age: 0,
      alive: true,
      motion: "chase",
      topSpeed: stats.topSpeed,
      accel: stats.accel,
      damp: 0,
      sides: 4,
      necro: true,
      healer: false,
      gunCd: 0,
      turretAim: 0,
    });
    stampGrowth(state.bullets[state.bullets.length - 1], owner);
    burst(shape.x, shape.y, owner.color, 7, 80);
    return true;
  }

  function fireFromMinion(b, dt) {
    if (!b.owner || (b.kind !== "minion" && b.kind !== "pillbox")) return;
    b.gunCd = (b.gunCd || 0) - dt;
    const owner = b.owner;
    const reach = b.kind === "pillbox" ? 420 : 380;
    const prey = nearestSeen(b, state.tanks.concat(state.shapes), reach, (o) => {
      if (!o.alive || o === owner) return false;
      if (o.type === "tank") return isEnemyTank(owner, o);
      return o.type === "shape";
    });
    if (prey) {
      const want = Math.atan2(prey.y - b.y, prey.x - b.x);
      let cur = b.turretAim == null ? b.angle : b.turretAim;
      let diff = want - cur;
      while (diff > Math.PI) diff -= TAU;
      while (diff < -Math.PI) diff += TAU;
      b.turretAim = cur + diff * Math.min(1, dt * 8);
    }
    if (b.gunCd > 0 || !prey) return;
    const g = TankCatalog.g;
    const layers = b.kind === "pillbox" ? [g.basic, g.minionGun, g.autoTurret] : [g.basic, g.minionGun];
    const fakeGun = {
      pos: [18, 8, 1, 0, 0, 0, 0],
      type: "bullet",
      shoot: TankCatalog.combineStats(layers),
      hasStack: true,
      calculator: "default",
      stats: {},
    };
    const shoot = gunShootSettings(owner, fakeGun);
    const ang = b.turretAim == null ? b.angle : b.turretAim;
    const speed = Math.max(40, (shoot.launch || 4) * 70);
    const sizeMul = shoot.size || 1;
    const br = Math.max(3.2, b.r * 0.42 * sizeMul);
    const along = Math.max(0, b.r - br * 0.2);
    b.gunCd = Math.max(0.12, (shoot.reload * (shoot.rld || 1) / ARRAS_TICK));
    state.bullets.push({
      x: b.x + Math.cos(ang) * along,
      y: b.y + Math.sin(ang) * along,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      r: br,
      health: Math.max(0.2, shoot.HEALTH),
      damage: Math.max(0.2, shoot.DAMAGE),
      pen: shoot.PENETRATION || 1,
      life: Math.max(0.45, 1.55 * shoot.RANGE),
      color: owner.color || b.color,
      owner,
      kind: "bullet",
      angle: ang,
      orbit: 0,
      age: 0,
      alive: true,
      motion: "coast",
      topSpeed: Math.max(50, (shoot.SPEED || 1) * 70),
      accel: 0,
      damp: 0,
      sides: 0,
      necro: false,
      healer: false,
      gunCd: 0,
      turretAim: ang,
    });
    stampGrowth(state.bullets[state.bullets.length - 1], owner);
  }

  function steerChase(b, dt) {
    const t = droneTarget(b);
    if (!t) return;
    const dx = t.x - b.x;
    const dy = t.y - b.y;
    const dist = Math.hypot(dx, dy) || 1;
    b.angle = Math.atan2(dy, dx);
    if (!t.repel && b.kind === "drone" && dist <= b.r * 2) return;
    const spd = b.topSpeed || 220;
    const tickK = Math.min(0.95, Math.max(0.02, (b.accel || 3.825) / ARRAS_TICK));
    const k = 1 - Math.pow(1 - tickK, ARRAS_TICK * dt);
    b.vx += ((dx / dist) * spd - b.vx) * k;
    b.vy += ((dy / dist) * spd - b.vy) * k;
  }

  function steerSwarm(b, dt) {
    const t = droneTarget(b);
    if (!t) return;
    const dx = t.x - b.x;
    const dy = t.y - b.y;
    const dist = Math.hypot(dx, dy) || 1;
    b.angle = Math.atan2(dy, dx);
    const spd = b.topSpeed || 280;
    const turning = Math.max(5, 8 / Math.max(0.15, b.accel || 3));
    const k = 1 - Math.pow(1 - 1 / turning, ARRAS_TICK * 1.5 * dt);
    b.vx += ((dx / dist) * spd - b.vx) * k;
    b.vy += ((dy / dist) * spd - b.vy) * k;
  }

  function steerGlide(b, dt) {
    const damp = b.damp || 0.05;
    const keep = Math.pow(1 / (1 + damp), ARRAS_TICK * dt);
    b.vx *= keep;
    b.vy *= keep;
    b.angle += dt * 0.4;
  }

  function wantsFire(tank) {
    if (tank.dominator) {
      if (tank.destroyed) return false;
      if (tank.sanctuary && tank.team === "blue") return true;
      if (state.mode === "assault" && tank.team === "blue") return false;
      return !!tank.aiTarget && canSee(tank, tank.aiTarget);
    }
    if (tank.mothership) return true;
    if (tank.spawnProtect > 0 && tank.ai) return false;
    if (tank.ai) {
      if (isRammer(tank)) return false;
      const combat = tank.aiState === "attack" || tank.aiState === "farm" || tank.aiState === "defend"
        || tank.aiState === "heal" || tank.aiState === "flee" || tank.aiState === "home"
        || tank.aiState === "storm" || tank.aiState === "seek";
      if (!combat) return false;
      const t = tank.aiTarget;
      return !t || canSee(tank, t);
    }
    const manual = mouse.down || keys.has(" ");
    if (tank.spawnProtect > 0) return manual;
    return manual || state.autoFire;
  }

  function breakSpawnProtect(tank) {
    if (tank && tank.spawnProtect > 0) tank.spawnProtect = 0;
  }

  function shoot(tank, dt) {
    const def = getDef(tank);
    const st = tankStats(tank);
    const guns = def.guns || [];
    if (!tank.gunCd) tank.gunCd = [];
    while (tank.gunCd.length < guns.length) tank.gunCd.push(0);
    const fire = wantsFire(tank);
    for (let i = 0; i < guns.length; i++) {
      const gun = guns[i];
      tank.gunCd[i] -= dt;
      if (gun.type === "deco") continue;
      const autoGun = gun.type === "auto";
      if (tank.spawnProtect > 0 && autoGun) continue;
      if (!autoGun && !fire) continue;
      if (autoGun && !nearestSeen(tank, [...state.tanks, ...state.shapes], 520, (o) => o !== tank && o.alive && (o.type !== "tank" || isEnemyTank(tank, o)))) continue;
      if (tank.gunCd[i] > 0) continue;
      const cap = capKind(gun.type);
      if (cap) {
        const limit = Math.max(1, st.maxDrones);
        if (countOwned(cap, tank) >= limit) {
          if (cap === "pillbox") destroyOldest(cap, tank);
          else continue;
        }
      }
      const fired = gunShootSettings(tank, gun);
      tank.gunCd[i] = Math.max(0.05, (fired.reload * (fired.rld || 1) / ARRAS_TICK) * (0.15 + (gun.pos[6] || 0) + 0.85));
      if (!autoGun) breakSpawnProtect(tank);
      spawnShot(tank, gun, i, st);
    }
  }

  function updateTurrets(tank, dt) {
    const guns = getDef(tank).guns || [];
    const target = nearestSeen(tank, state.tanks.concat(state.shapes), 640, (o) => o !== tank && o.alive && (o.type !== "tank" || isEnemyTank(tank, o)));
    if (!tank.turretAim) tank.turretAim = [];
    for (let i = 0; i < guns.length; i++) {
      const gun = guns[i];
      const base = tank.angle + (gun.pos[5] * Math.PI) / 180;
      if (gun.type !== "auto") {
        tank.turretAim[i] = base;
        continue;
      }
      let want = base;
      if (target) {
        const pivot = autoPivot(tank, gun, i);
        const lead = leadPoint(pivot, target, tankStats(tank));
        want = Math.atan2(lead.y - pivot.y, lead.x - pivot.x);
      }
      const cur = tank.turretAim[i] == null ? base : tank.turretAim[i];
      let diff = want - cur;
      while (diff > Math.PI) diff -= TAU;
      while (diff < -Math.PI) diff += TAU;
      tank.turretAim[i] = cur + diff * Math.min(1, dt * 8);
    }
  }

  function maintainShapes() {
    const counts = { square: 0, triangle: 0, pentagon: 0, alpha: 0, crasher: 0 };
    for (const s of state.shapes) if (s.alive) counts[s.kind]++;
    const want = isRoyale()
      ? { square: 160, triangle: 8 }
      : { square: state.mode === "growth" ? 320 : 220 };
    for (const kind of Object.keys(want)) {
      while (counts[kind] < want[kind]) {
        state.shapes.push(createShape(kind));
        counts[kind]++;
      }
    }
    if (!isRoyale() && state.time >= state.pentagonAt) {
      const n = irand(2, 5);
      const pCap = state.mode === "growth" ? 40 : 24;
      for (let i = 0; i < n && counts.pentagon < pCap; i++) {
        state.shapes.push(createShape("pentagon", nestPos()));
        counts.pentagon++;
      }
      state.pentagonAt = state.time + rand(7, 16);
    }
    if (!isRoyale() && state.time >= state.triangleAt) {
      const n = irand(1, 5);
      for (let i = 0; i < n && counts.triangle < 22; i++) {
        state.shapes.push(createShape("triangle"));
        counts.triangle++;
      }
      state.triangleAt = state.time + rand(60, 180);
    }
    if (!isRoyale() && state.time >= (state.crasherAt || 0)) {
      if (counts.crasher < 7) {
        state.shapes.push(createShape("crasher"));
        counts.crasher++;
      }
      state.crasherAt = state.time + rand(60, 120);
    }
    if (counts.alpha < 1 && state.mode !== "protect" && state.mode !== "maze" && state.mode !== "assault" && state.mode !== "siege" && !isRoyale() && state.alphaRespawnAt > 0 && state.time >= state.alphaRespawnAt) {
      state.shapes.push(createShape("alpha"));
      state.alphaRespawnAt = 0;
    }
  }

  function nearest(from, list, maxDist, pred) {
    let best = null;
    let bestD = maxDist * maxDist;
    for (const o of list) {
      if (!o.alive || o === from) continue;
      if (pred && !pred(o)) continue;
      const d = dist2(from, o);
      if (d < bestD) { bestD = d; best = o; }
    }
    return best;
  }

  function tagTank(target, by) {
    if (!target || !by || !target.alive || !by.alive || !by.team) return false;
    if (target.closer || by.closer || target.team === by.team) return false;
    if (target.tagLock > state.time) return false;
    const next = TEAMS[by.team];
    if (!next) return false;
    target.team = by.team;
    target.color = next.color;
    target.tagLock = state.time + 0.45;
    for (const b of state.bullets) {
      if (b.owner === target) b.color = next.color;
    }
    burst(target.x, target.y, next.color, 14, 200);
    floater(target.x, target.y - 18, next.name);
    if (target === state.player) note(`You were tagged. You are now ${next.name}.`);
    else if (by === state.player) note(`You tagged ${target.name}.`);
    if (by.alive) giveScore(by, 35, target.x, target.y);
    checkTagVictory();
    return true;
  }

  function restartServer() {
    const opts = state.playOpts || {
      mode: state.mode,
      armsRace: state.armsRace,
      botCount: state.botCount,
      sandbox: state.mode === "sandbox",
    };
    startGame(state.spawnName, opts);
  }

  function beginArenaClose(msg) {
    if (state.closing || state.serverResetAt) return;
    state.closing = true;
    state.serverResetAt = state.time + SERVER_RESET_DELAY;
    if (isRoyale()) state.royaleRestartAt = state.serverResetAt;
    const p = state.player;
    if (p && p.alive) floater(p.x, p.y - 28, "Fresh server");
    let text = msg || "Starting a fresh server.";
    if (!/fresh server/i.test(text)) text += " Fresh server shortly.";
    note(text, 5000);
  }

  function checkTagVictory() {
    if (state.mode !== "tag" || state.closing) return;
    const living = state.tanks.filter((t) => t.alive && !t.closer);
    const teams = new Set(living.map((t) => t.team).filter(Boolean));
    if (living.length < 1 || teams.size !== 1) return;
    const team = [...teams][0];
    const name = TEAMS[team] ? TEAMS[team].name : "A team";
    beginArenaClose(`${name} wins Tag! Fresh server shortly.`);
  }

  function checkProtectClose() {
    if (state.mode !== "protect" || state.closing) return;
    const alive = state.tanks.filter((t) => t.mothership && t.alive);
    if (alive.length >= 2) return;
    const win = alive[0];
    const name = win && win.team && TEAMS[win.team] ? TEAMS[win.team].name : "A team";
    beginArenaClose(alive.length === 1
      ? `${name} wins Protect! Fresh server shortly.`
      : "Both motherships fell. Fresh server shortly.");
  }

  function spawnArenaClosers() {
    if (state.closersSpawned) return;
    state.closersSpawned = true;
    const n = 7;
    for (let i = 0; i < n; i++) {
      const side = i % 4;
      const t = (Math.floor(i / 4) + 0.5) / Math.ceil(n / 4);
      let pos;
      if (side === 0) pos = { x: lerp(120, WORLD.w - 120, t), y: 90 };
      else if (side === 1) pos = { x: WORLD.w - 90, y: lerp(120, WORLD.h - 120, t) };
      else if (side === 2) pos = { x: lerp(120, WORLD.w - 120, 1 - t), y: WORLD.h - 90 };
      else pos = { x: 90, y: lerp(120, WORLD.h - 120, 1 - t) };
      const bot = createTank({
        name: "Arena Closer",
        ai: true,
        closer: true,
        classId: "arena_closer",
        color: COLORS.square,
        score: xpForLevel(LEVEL_CAP),
        pos,
      });
      for (const st of STATS) bot.stats[st.key] = STAT_MAX;
      applyLevel(bot);
      bot.health = bot.maxHealth;
      bot.spawnProtect = 0;
      bot.angle = Math.atan2(WORLD.h / 2 - bot.y, WORLD.w / 2 - bot.x);
      state.tanks.push(bot);
    }
    updateRespawnUi();
    note("Arena closers have spawned. This server is closing.", 5000);
  }

  function isDevNick() {
    const names = [
      state.player && state.player.name,
      state.spawnName,
      els.name && els.name.value,
    ];
    return names.some((n) => String(n || "").trim().toLowerCase() === "dev");
  }

  function becomeArenaCloser(tank) {
    if (!tank || !tank.alive || tank.closer || tank.mothership) return false;
    tank.closer = true;
    tank.classId = "arena_closer";
    tank.customDef = null;
    tank.team = null;
    tank.color = COLORS.square;
    tank.score = Math.max(tank.score, xpForLevel(LEVEL_CAP));
    for (const st of STATS) tank.stats[st.key] = STAT_MAX;
    applyLevel(tank);
    tank.health = tank.maxHealth;
    tank.shield = tank.maxShield || 0;
    tank.r = 46;
    tank.spawnProtect = 0;
    tank.ai = false;
    state.classDismissed = true;
    floater(tank.x, tank.y - tank.r - 8, "Arena Closer");
    if (tank === state.player) note("You are now an Arena Closer.", 5000);
    try { renderStats(); } catch (err) {}
    try { renderClassPanel(); } catch (err) {}
    return true;
  }

  function tryDevCloserEgg(e) {
    if (!running || state.paused || state.spectating) return false;
    if (!isDevNick() || !e.shiftKey) return false;
    const slashHeld = keys.has("?") || keys.has("/") || keys.has("slash");
    const bsHeld = keys.has("\\") || keys.has("backslash");
    if (!slashHeld || !bsHeld) return false;
    const p = state.player;
    if (!p || !p.alive || p.closer || p.mothership) return false;
    return becomeArenaCloser(p);
  }

  function tryTagHit(target, src) {
    if (state.mode !== "tag") return false;
    if (!target || target.type !== "tank" || !src || src.type !== "tank") return false;
    if (target.closer || src.closer) return false;
    if (isEnemyTank(src, target)) tagTank(target, src);
    return true;
  }

  function applyTeamHuntRoles() {
    if (!isTeamHunt()) return;
    for (const t of state.tanks) {
      if (!t.alive || t.closer || t.boss || t.fodder || t.mothership || t.dominator) continue;
      const team = t === state.hunted ? HUNTED_TEAM : HUNTER_TEAM;
      t.team = team;
      t.color = colorFor({ team, player: t === state.player });
    }
  }

  function refreshHunted() {
    if (!isHuntMode()) {
      state.hunted = null;
      return;
    }
    const alive = state.tanks.filter((t) => t.alive && !t.closer && !t.boss && !t.fodder && !t.mothership && !t.dominator);
    if (isTeamHunt() && state.hunted && state.hunted.alive && alive.includes(state.hunted)) {
      applyTeamHuntRoles();
      return;
    }
    if (!alive.length) {
      const prev = state.hunted;
      state.hunted = null;
      if (prev && prev.alive) applyLevel(prev);
      applyTeamHuntRoles();
      return;
    }
    alive.sort((a, b) => b.score - a.score);
    const lead = alive[0];
    if (!lead || lead.score <= 0) {
      const prev = state.hunted;
      state.hunted = null;
      if (prev && prev.alive) applyLevel(prev);
      applyTeamHuntRoles();
      return;
    }
    const tied = alive.filter((t) => t.score === lead.score);
    const prev = state.hunted;
    const next = (prev && prev.alive && tied.includes(prev)) ? prev : lead;
    if (next !== prev) {
      state.hunted = next;
      if (prev && prev.alive) applyLevel(prev);
      if (next) {
        applyLevel(next);
        floater(next.x, next.y - 18, "HUNTED");
        if (isTeamHunt()) {
          if (next === state.player) note("You are now the hunted. Hunters are all on the other team.", 5000);
          else if (prev === state.player) note("You joined the hunt.", 4000);
        } else if (next === state.player) note("You are now the hunted.", 5000);
      }
    }
    applyTeamHuntRoles();
  }

  function updateAI(tank, dt) {
    tank.aiT -= dt;
    if (tank.spawnProtect > 0 && !tank.closer && !tank.mothership && !tank.dominator) {
      tank.vx *= 0.15;
      tank.vy *= 0.15;
      tank.aiState = "spawn";
      tank.aiTarget = null;
      return;
    }
    if (tank.dominator) {
      tank.vx = 0;
      tank.vy = 0;
      if (tank.homeX != null) { tank.x = tank.homeX; tank.y = tank.homeY; }
      if (tank.destroyed) {
        tank.aiTarget = null;
        return;
      }
      if (tank.sanctuary && tank.team === "blue") {
        tank.angle += 0.42 * dt;
        const prey = nearestSeen(tank, state.tanks, 980, (t) => isEnemyTank(tank, t));
        tank.aiTarget = prey || tank;
        tank.aiState = "defend";
        updateTurrets(tank, dt);
        shoot(tank, dt);
        return;
      }
      if (state.mode === "assault" && tank.team === "blue") {
        tank.aiTarget = null;
        return;
      }
      const prey = nearestSeen(tank, state.tanks, 980, (t) => isEnemyTank(tank, t) && !t.dominator);
      const ally = tank.mainBase
        ? nearestSeen(tank, state.tanks, 460, (t) => t.alive && sameTeam(tank, t) && !t.dominator && t.health < t.maxHealth * 0.98)
        : null;
      tank.aiTarget = prey || ally;
      if (prey) tank.angle = aimAt(tank, prey, tankStats(tank));
      else if (ally) tank.angle = Math.atan2(ally.y - tank.y, ally.x - tank.x);
      tank.aiState = prey ? "attack" : "defend";
      if (tank.aiTarget) {
        updateTurrets(tank, dt);
        shoot(tank, dt);
      }
      return;
    }
    if (tank.guard) {
      const home = (tank.guardOf && tank.guardOf.alive ? tank.guardOf : healerDominator());
      const prey = nearestSeen(tank, state.tanks, 760, (t) => isEnemyTank(tank, t) && !t.dominator);
      tank.aiTarget = prey;
      tank.aiState = prey ? "attack" : "wander";
      let tx = tank.x;
      let ty = tank.y;
      if (prey) {
        const hold = holdPoint(tank, prey, Math.max(90, prey.r + 70));
        const steered = steerAround(tank, hold.x, hold.y);
        tx = steered.x;
        ty = steered.y;
        tank.angle = aimAt(tank, prey, tankStats(tank));
      } else if (home) {
        const hold = holdPoint(tank, home, Math.min(assaultZoneR(home) * 0.55, 210));
        const steered = steerAround(tank, hold.x, hold.y);
        tx = steered.x;
        ty = steered.y;
        tank.angle = Math.atan2(ty - tank.y, tx - tank.x);
      }
      if (home && dist2(tank, home) > assaultZoneR(home) * assaultZoneR(home) * 0.92) {
        const back = holdPoint(tank, home, 160);
        tx = back.x;
        ty = back.y;
      }
      const stg = tankStats(tank);
      const ang = Math.atan2(ty - tank.y, tx - tank.x);
      tank.vx += Math.cos(ang) * stg.moveSpeed * 62 * dt;
      tank.vy += Math.sin(ang) * stg.moveSpeed * 62 * dt;
      updateTurrets(tank, dt);
      shoot(tank, dt);
      return;
    }
    const player = state.player;
    if (tank.closer) {
      const prey = nearest(tank, state.tanks, 99999, (t) => t.alive && !t.closer);
      tank.aiState = prey ? "attack" : "wander";
      let tx = WORLD.w / 2;
      let ty = WORLD.h / 2;
      if (prey) {
        tx = prey.x;
        ty = prey.y;
        tank.angle = Math.atan2(prey.y - tank.y, prey.x - tank.x);
      }
      const st = tankStats(tank);
      const ang = Math.atan2(ty - tank.y, tx - tank.x);
      tank.vx += Math.cos(ang) * st.moveSpeed * 78 * dt;
      tank.vy += Math.sin(ang) * st.moveSpeed * 78 * dt;
      updateTurrets(tank, dt);
      shoot(tank, dt);
      return;
    }
    if (tank.boss || tank.fodder) {
      const prey = nearest(tank, state.tanks, 99999, (t) => isEnemyTank(tank, t) && !t.boss && !t.fodder);
      tank.aiState = prey ? "attack" : "wander";
      let tx = WORLD.w / 2;
      let ty = WORLD.h / 2;
      if (prey) {
        tx = prey.x;
        ty = prey.y;
        tank.aiTarget = prey;
        if (!getDef(tank).spin) tank.angle = aimAt(tank, prey, tankStats(tank));
      }
      if (getDef(tank).spin) tank.angle += 2.4 * dt;
      const st = tankStats(tank);
      const ang = Math.atan2(ty - tank.y, tx - tank.x);
      const push = tank.fodder ? 70 : 48;
      tank.vx += Math.cos(ang) * st.moveSpeed * push * dt;
      tank.vy += Math.sin(ang) * st.moveSpeed * push * dt;
      updateTurrets(tank, dt);
      shoot(tank, dt);
      return;
    }
    if (tank.mothership) {
      const st = tankStats(tank);
      const foe = state.tanks.find((t) => t.mothership && t.alive && t !== tank) || null;
      const prey = nearest(tank, state.tanks, 640, (t) => isEnemyTank(tank, t) && !t.mothership);
      tank.meetT = (tank.meetT || 0) - dt;
      if (tank.aiT <= 0 || tank.roamX == null) {
        tank.aiT = rand(5, 11);
        tank.roamX = rand(420, WORLD.w - 420);
        tank.roamY = rand(420, WORLD.h - 420);
        tank.wanderA = rand(0, TAU);
        if (Math.random() < 0.2) tank.meetT = rand(2.8, 6);
      }
      let tx = tank.roamX;
      let ty = tank.roamY;
      if (foe && tank.meetT <= 0) {
        const dx = tank.x - foe.x;
        const dy = tank.y - foe.y;
        const d = Math.hypot(dx, dy) || 1;
        const keep = 1080;
        if (d < keep) {
          const push = (keep - d) / keep;
          tx = tank.x + (dx / d) * (260 + push * 420) + Math.cos(tank.wanderA || 0) * 90;
          ty = tank.y + (dy / d) * (260 + push * 420) + Math.sin(tank.wanderA || 0) * 90;
        }
      }
      if ((tx - tank.x) ** 2 + (ty - tank.y) ** 2 < 160 * 160) tank.aiT = 0;
      const ang = Math.atan2(ty - tank.y, tx - tank.x);
      tank.vx += Math.cos(ang) * st.moveSpeed * 38 * dt;
      tank.vy += Math.sin(ang) * st.moveSpeed * 38 * dt;
      if (prey) tank.angle = aimAt(tank, prey, st);
      else if (foe && dist2(tank, foe) < 560 * 560) tank.angle = aimAt(tank, foe, st);
      else {
        let diff = ang - tank.angle;
        while (diff > Math.PI) diff -= TAU;
        while (diff < -Math.PI) diff += TAU;
        tank.angle += diff * Math.min(1, dt * 2.2);
      }
      tank.aiState = prey ? "attack" : "wander";
      tank.aiTarget = prey || (foe && dist2(tank, foe) < 560 * 560 ? foe : null);
      updateTurrets(tank, dt);
      shoot(tank, dt);
      return;
    }
    const mark = state.hunted;
    const hunting = isHuntMode() && mark && mark.alive && mark !== tank;
    const huntedSelf = isHuntMode() && mark === tank;
    const ownMoth = mothershipOf(tank.team);
    const foeMoth = state.tanks.find((t) => t.mothership && t.alive && t.team && t.team !== tank.team) || null;
    if (state.mode === "protect" && !tank.aiJob) {
      tank.aiJob = Math.random() < 0.48 ? "hunt" : Math.random() < 0.28 ? "defend" : "roam";
    }
    const defending = state.mode === "protect" && ownMoth && tank.aiJob === "defend";
    const huntingMoth = state.mode === "protect" && foeMoth && tank.aiJob === "hunt";
    const ram = isRammer(tank);
    const maze = state.mode === "maze" || state.mode === "assault" || state.mode === "royalemaze";
    const fightRange = maze
      ? (ram ? 520 : 640)
      : tank.aiFocus === "farm"
        ? 360
        : ram
          ? 820
          : tank.aiHuntPlayer
            ? 880
            : 640;
    const seeRange = maze ? 1100 : (state.mode === "tag" || state.mode === "protect" ? 2200 : 1400);
    let enemy = hunting
      ? pickAiEnemy(tank, maze ? 900 : (isTeamHunt() ? 3200 : 1600))
      : huntingMoth
        ? (pickAiEnemy(tank, 520) || foeMoth)
        : pickAiEnemy(tank, seeRange);
    const heard = maze || enemy ? null : nearest(tank, state.tanks, 3200, (t) => isEnemyTank(tank, t));
    if (isTeamHunt() && hunting && mark && mark.alive && !spawnProtected(mark)) {
      enemy = mark;
    } else if (hunting && mark && !spawnProtected(mark) && canSee(tank, mark) && (aggroOn(mark) < 5 || tank.aiHurtBy === mark)) {
      const melee = nearestSeen(tank, state.tanks, 420, (t) => isEnemyTank(tank, t) && t !== mark);
      if (!melee) enemy = mark;
    }
    const closerNear = nearest(tank, state.tanks, 980, (t) => t.closer);
    const stormOut = isRoyale() && royaleLocked() && !royaleInside(tank, -24);
    const shape = bestFarm(tank, maze ? 520 : (ram ? 640 : 1100));
    const healer = getDef(tank).healer;
    const healAlly = healer && tank.team
      ? nearestSeen(tank, state.tanks, 760, (t) => t.alive && t !== tank && sameTeam(tank, t) && !t.dominator && t.health < t.maxHealth * 0.92)
      : null;
    const pool = tank.maxHealth + (tank.maxShield || 0);
    const hpPct = pool > 0 ? (tank.health + (tank.shield || 0)) / pool : 1;
    const low = hpPct < (ram ? 0.16 : 0.22);
    const zone = zoneAt(tank.x, tank.y);
    const invading = !!(tank.team && zone && zone !== tank.team);
    const hunterNear = huntedSelf ? nearestSeen(tank, state.tanks, 640, (t) => isEnemyTank(tank, t)) : null;
    if (closerNear) tank.aiState = "flee";
    else if (stormOut) tank.aiState = "storm";
    else if (invading || ((state.mode === "tdm" || state.mode === "4tdm") && tank.team && low)) tank.aiState = "home";
    else if (huntedSelf && hunterNear && dist2(tank, hunterNear) < 480 * 480) tank.aiState = "flee";
    else if (low && enemy && state.mode !== "tag" && !huntingMoth) tank.aiState = "flee";
    else if ((hunting && mark && enemy === mark) || (state.mode === "tag" && enemy) || (huntingMoth && foeMoth)) tank.aiState = "attack";
    else if (defending && enemy && dist2(tank, enemy) < 720 * 720) tank.aiState = "attack";
    else if (defending) tank.aiState = "defend";
    else if (healAlly && (!enemy || dist2(tank, healAlly) < dist2(tank, enemy) || healAlly.health < healAlly.maxHealth * 0.55)) tank.aiState = "heal";
    else if (tank.aiFocus === "farm" && shape && (!enemy || dist2(tank, enemy) > 300 * 300) && dist2(tank, shape) < 560 * 560 && (!maze || canSee(tank, shape))) tank.aiState = "farm";
    else if (maze && enemy) tank.aiState = "attack";
    else if (enemy && dist2(tank, enemy) < fightRange * fightRange) tank.aiState = "attack";
    else if (heard && dist2(tank, heard) < 2600 * 2600) tank.aiState = "seek";
    else if (shape && dist2(tank, shape) < (maze ? 280 : 420) * (maze ? 280 : 420) && (!maze || canSee(tank, shape))) tank.aiState = "farm";
    else tank.aiState = "wander";

    if (state.mode === "domination" && tank.team && tank.aiState !== "flee" && tank.aiState !== "attack" && tank.aiState !== "home" && tank.aiState !== "heal") {
      let claim = null;
      let claimD = Infinity;
      for (const d of state.doms) {
        if (d.team === tank.team) continue;
        const dd = dist2(tank, d);
        if (dd < claimD) {
          claimD = dd;
          claim = d;
        }
      }
      if (claim) {
        tank.aiState = "wander";
        tank.roamX = claim.x;
        tank.roamY = claim.y;
        tank.aiT = 2;
      }
    }

    if (state.mode === "assault" && tank.team && tank.aiState !== "flee" && tank.aiState !== "attack" && tank.aiState !== "heal") {
      if (tank.team === "green") {
        const wreck = nearest(tank, state.tanks, 2800, (t) => t.dominator && t.destroyed);
        const keep = nearest(tank, state.tanks, 2800, (t) => t.dominator && !t.destroyed && t.team === "green");
        const stolen = nearest(tank, state.tanks, 2800, (t) => t.dominator && !t.destroyed && t.team === "blue");
        const goal = wreck || stolen || keep;
        if (goal) {
          const hold = holdPoint(tank, goal, goal.r + 88);
          tank.aiState = "wander";
          tank.roamX = hold.x;
          tank.roamY = hold.y;
          tank.aiT = 3;
        }
      } else {
        const main = healerDominator();
        const wreck = nearest(tank, state.tanks, 99999, (t) => t.dominator && t.destroyed);
        const any = nearest(tank, state.tanks, 99999, (t) => t.dominator && !t.destroyed && t.team === "green");
        const goal = (tank.aiJob === "hunt" && main && !main.destroyed) ? main : (wreck || any);
        if (goal) {
          const hold = holdPoint(tank, goal, goal.r + 88);
          tank.aiState = "wander";
          tank.roamX = hold.x;
          tank.roamY = hold.y;
          tank.aiT = 3;
        }
      }
    }

    if (state.mode === "siege" && tank.team === "blue" && tank.aiState !== "flee" && tank.aiState !== "attack" && tank.aiState !== "heal") {
      const foe = nearest(tank, state.tanks, 99999, (t) => t.alive && (t.boss || t.fodder || (t.sanctuary && t.sancFallen)));
      const home = nearest(tank, state.tanks, 99999, (t) => t.sanctuary && t.team === "blue" && !t.sancFallen);
      const goal = tank.aiJob === "defend"
        ? ((foe && dist2(tank, foe) < 820 * 820) ? foe : home)
        : (foe || home);
      if (goal) {
        const hold = holdPoint(tank, goal, goal.r + 88);
        tank.aiState = "wander";
        tank.roamX = hold.x;
        tank.roamY = hold.y;
        tank.aiT = 3;
      }
    }

    const st = tankStats(tank);
    const retreatLock = enemy || hunterNear || closerNear;
    tank.aiTarget = tank.aiState === "heal" ? healAlly
      : tank.aiState === "attack" ? enemy
      : tank.aiState === "farm" ? shape
      : tank.aiState === "defend" ? (enemy || ownMoth)
      : tank.aiState === "seek" ? heard
      : (tank.aiState === "flee" || tank.aiState === "home" || tank.aiState === "storm") ? (enemy || retreatLock)
      : null;
    if (enemy && (tank.aiState === "attack" || tank.aiState === "flee" || tank.aiState === "home" || tank.aiState === "storm")) {
      enemy.aggroN = (enemy.aggroN || 0) + 1;
      if (tank.aiLock !== enemy) {
        tank.aiLock = enemy;
        tank.aiLockUntil = state.time + rand(2.2, 5.8);
      } else tank.aiLockUntil = Math.max(tank.aiLockUntil || 0, state.time + 1.2);
    }

    let tx = tank.x;
    let ty = tank.y;
    if (tank.aiState === "home" && tank.team) {
      const home = baseCenter(tank.team);
      const steered = steerAround(tank, home.x, home.y);
      tx = steered.x;
      ty = steered.y;
      const lock = tank.aiTarget || enemy;
      if (lock && canSee(tank, lock)) tank.angle = aimAt(tank, lock, st);
    } else if (tank.aiState === "storm") {
      const safe = stormCenter();
      const steered = steerAround(tank, safe.x, safe.y);
      tx = steered.x;
      ty = steered.y;
      const lock = tank.aiTarget || enemy;
      if (lock && canSee(tank, lock)) tank.angle = aimAt(tank, lock, st);
      else tank.angle = Math.atan2(ty - tank.y, tx - tank.x);
    } else if (tank.aiState === "attack" && enemy) {
      const ez = zoneAt(enemy.x, enemy.y);
      if (ez && ez === enemy.team) {
        const edge = baseCenter(ez);
        tx = ez === "blue" ? BASE_W + 140 : ez === "red" ? WORLD.w - BASE_W - 140 : edge.x;
        ty = ez === "green" ? BASE_W + 140 : ez === "purple" ? WORLD.h - BASE_W - 140 : enemy.y;
      } else {
        const dist = Math.hypot(enemy.x - tank.x, enemy.y - tank.y) || 1;
        const nx = (enemy.x - tank.x) / dist;
        const ny = (enemy.y - tank.y) / dist;
        const sx = -ny * (tank.strafeDir || 1);
        const sy = nx * (tank.strafeDir || 1);
        const prefer = ram ? 42 : (enemy.mothership || enemy.dominator ? 150 : (tank.orbitR || 310));
        if (enemy.dominator) {
          const hold = holdPoint(tank, enemy, enemy.r + 78);
          tx = hold.x;
          ty = hold.y;
        } else if (ram) {
          tx = enemy.x;
          ty = enemy.y;
        } else {
          const hold = holdPoint(tank, enemy, prefer);
          if (dist > prefer + 70) {
            tx = hold.x;
            ty = hold.y;
          } else if (dist < prefer - 70 || hpPct < 0.5) {
            tx = tank.x - nx * 160 + sx * 150;
            ty = tank.y - ny * 160 + sy * 150;
          } else {
            tx = hold.x + sx * 40;
            ty = hold.y + sy * 40;
          }
        }
      }
      const push = edgePush(tank, 230);
      tx += push.x * 2.4;
      ty += push.y * 2.4;
      const parked = clampArena(tx, ty, 160);
      const steered = steerAround(tank, parked.x, parked.y);
      tx = steered.x;
      ty = steered.y;
      tank.angle = aimAt(tank, enemy, st);
    } else if (tank.aiState === "defend" && ownMoth) {
      const a = (tank.wanderA || 0) + state.time * 0.55;
      tx = ownMoth.x + Math.cos(a) * 250;
      ty = ownMoth.y + Math.sin(a) * 250;
      if (enemy) tank.angle = aimAt(tank, enemy, st);
      else tank.angle = Math.atan2(ty - tank.y, tx - tank.x);
    } else if (tank.aiState === "flee" && (closerNear || hunterNear || enemy)) {
      const from = closerNear || hunterNear || enemy;
      const steered = steerAround(tank, tank.x * 2 - from.x, tank.y * 2 - from.y);
      const push = edgePush(tank, 260);
      const parked = clampArena(steered.x + push.x * 2.2, steered.y + push.y * 2.2, 160);
      tx = parked.x;
      ty = parked.y;
      const lock = tank.aiTarget || enemy || from;
      if (lock && canSee(tank, lock)) tank.angle = aimAt(tank, lock, st);
      else tank.angle = Math.atan2(from.y - tank.y, from.x - tank.x);
    } else if (tank.aiState === "heal" && healAlly) {
      const hold = holdPoint(tank, healAlly, Math.max(70, healAlly.r + 48));
      const steered = steerAround(tank, hold.x, hold.y);
      tx = steered.x;
      ty = steered.y;
      tank.angle = Math.atan2(healAlly.y - tank.y, healAlly.x - tank.x);
    } else if (tank.aiState === "farm" && shape) {
      tank.angle = aimAt(tank, shape, st);
      if (ram) {
        const steered = steerAround(tank, shape.x, shape.y);
        tx = steered.x;
        ty = steered.y;
      } else {
        const want = shapeStandoff(tank, shape);
        const dist = Math.hypot(shape.x - tank.x, shape.y - tank.y) || 1;
        if (dist < want * 0.92) {
          tx = tank.x + ((tank.x - shape.x) / dist) * 150;
          ty = tank.y + ((tank.y - shape.y) / dist) * 150;
        } else {
          const hold = holdPoint(tank, shape, want);
          const steered = steerAround(tank, hold.x, hold.y);
          tx = steered.x;
          ty = steered.y;
        }
      }
    } else if (tank.aiState === "seek" && heard) {
      const steered = steerAround(tank, heard.x, heard.y);
      tx = steered.x;
      ty = steered.y;
      tank.angle = canSee(tank, heard) ? aimAt(tank, heard, st) : Math.atan2(heard.y - tank.y, heard.x - tank.x);
    } else if (tank.aiT <= 0) {
      tank.aiT = rand(2.2, 5.5);
      if (maze) {
        const p = randomOpenNear(tank, 220, 640);
        tank.roamX = p.x;
        tank.roamY = p.y;
      } else if (tank.aiHunt === "mid" || Math.random() < 0.42) {
        const mid = isRoyale() ? nestPos(Math.max(180, royaleRadius() * 0.55)) : nestPos(1100);
        tank.roamX = mid.x;
        tank.roamY = mid.y;
      } else {
        const p = isRoyale() ? nestPos(Math.max(220, royaleRadius() * 0.72)) : randomInWorld(180);
        tank.roamX = p.x;
        tank.roamY = p.y;
      }
    }
    if (tank.aiState === "wander") {
      if (tank.roamX == null || tank.roamY == null) {
        const mid = maze ? randomOpenNear(tank, 180, 520) : (isRoyale() ? nestPos(Math.max(180, royaleRadius() * 0.6)) : nestPos(900));
        tank.roamX = mid.x;
        tank.roamY = mid.y;
      }
      if ((tank.roamX - tank.x) ** 2 + (tank.roamY - tank.y) ** 2 < 180 * 180) tank.aiT = 0;
      const steered = steerAround(tank, tank.roamX, tank.roamY);
      tx = steered.x;
      ty = steered.y;
      if (!tank.aiTarget) tank.angle = Math.atan2(ty - tank.y, tx - tank.x);
    }
    if ((state.mode === "tdm" || state.mode === "4tdm") && tank.team && tank.aiState !== "home") {
      const destZone = zoneAt(tx, ty);
      if (destZone && destZone !== tank.team) {
        const home = baseCenter(tank.team);
        tx = home.x;
        ty = tank.y;
      }
    }
    const peeled = peelOffShapes(tank, tx, ty);
    tx = peeled.x;
    ty = peeled.y;
    const huntedBot = isHuntMode() && tank === state.hunted;
    const pace = huntedBot
      ? st.moveSpeed
      : (state.player && state.player.alive ? tankStats(state.player).moveSpeed : st.moveSpeed);
    const ang = Math.atan2(ty - tank.y, tx - tank.x);
    tank.vx += Math.cos(ang) * pace * 62 * dt;
    tank.vy += Math.sin(ang) * pace * 62 * dt;
    const slow = Math.hypot(tank.vx, tank.vy) < 20;
    if ((maze && slow) || (nearMapEdge(tank, 150) && slow && tank.aiState === "attack")) {
      tank.stuckT = (tank.stuckT || 0) + dt;
      if (tank.stuckT > 0.3) {
        tank.stuckT = 0;
        tank.aiT = rand(1.1, 2.2);
        tank.strafeDir = -(tank.strafeDir || 1);
        tank.aiLock = null;
        tank.aiLockUntil = 0;
        const inward = clampArena(
          tank.x + (WORLD.w * 0.5 - tank.x) * 0.48 + rand(-340, 340),
          tank.y + (WORLD.h * 0.5 - tank.y) * 0.48 + rand(-340, 340),
          280
        );
        if (maze) {
          const p = randomOpenNear(tank, 120, 420);
          tank.roamX = p.x;
          tank.roamY = p.y;
        } else {
          tank.roamX = inward.x;
          tank.roamY = inward.y;
        }
        tank.aiState = "wander";
        tank.aiTarget = null;
      }
    } else tank.stuckT = 0;
    updateTurrets(tank, dt);
    shoot(tank, dt);
  }

  function updatePlayer(dt) {
    const p = state.player;
    if (!p || !p.alive) return;
    const st = tankStats(p);
    let mx = 0;
    let my = 0;
    if (keys.has("w") || keys.has("arrowup")) my -= 1;
    if (keys.has("s") || keys.has("arrowdown")) my += 1;
    if (keys.has("a") || keys.has("arrowleft")) mx -= 1;
    if (keys.has("d") || keys.has("arrowright")) mx += 1;
    if (mx || my) {
      const m = Math.hypot(mx, my) || 1;
      p.vx += (mx / m) * st.moveSpeed * 62 * dt;
      p.vy += (my / m) * st.moveSpeed * 62 * dt;
      breakSpawnProtect(p);
    }
    const world = screenToWorld(mouse.x, mouse.y);
    if (state.autoSpin) p.angle += 1.8 * dt;
    else p.angle = Math.atan2(world.y - p.y, world.x - p.x);
    updateTurrets(p, dt);
    shoot(p, dt);
  }

  function screenToWorld(sx, sy) {
    const cam = state.camera;
    const zoom = cam.zoom / viewFov();
    return { x: cam.x + (sx - width / 2) / zoom, y: cam.y + (sy - height / 2) / zoom };
  }

  function massOf(ent) {
    if (ent.kind === "alpha") return 48000;
    if (ent.kind === "pentagon") return 1400;
    if (ent.kind === "triangle") return 90;
    if (ent.kind === "crasher") return 55;
    if (ent.kind === "square") return 70;
    if (ent.dominator) return 80000;
    return ent.r * ent.r;
  }

  function collideCircles(a, b, bounce = 0.6) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const d = Math.hypot(dx, dy) || 0.0001;
    const min = a.r + b.r;
    if (d >= min) return false;
    const overlap = min - d;
    const nx = dx / d;
    const ny = dy / d;
    const massA = massOf(a);
    const massB = massOf(b);
    const shareA = massB / (massA + massB);
    const shareB = massA / (massA + massB);
    a.x -= nx * overlap * shareA;
    a.y -= ny * overlap * shareA;
    b.x += nx * overlap * shareB;
    b.y += ny * overlap * shareB;
    const dvx = b.vx - a.vx;
    const dvy = b.vy - a.vy;
    const rel = dvx * nx + dvy * ny;
    if (rel < 0) {
      const impulse = rel * bounce;
      a.vx += impulse * nx * shareA * 2;
      a.vy += impulse * ny * shareA * 2;
      b.vx -= impulse * nx * shareB * 2;
      b.vy -= impulse * ny * shareB * 2;
    }
    return true;
  }

  function shotHits(bullet, ent) {
    if (ent && ent.type === "tank" && spawnProtected(ent) && !(bullet.owner && bullet.owner.closer)) return false;
    const r = bullet.r + ent.r;
    const nx = bullet.x - ent.x;
    const ny = bullet.y - ent.y;
    if (nx * nx + ny * ny < r * r) return true;
    const px = bullet.prevX == null ? bullet.x : bullet.prevX;
    const py = bullet.prevY == null ? bullet.y : bullet.prevY;
    const dx = bullet.x - px;
    const dy = bullet.y - py;
    const len2 = dx * dx + dy * dy;
    if (len2 < 0.0001) return false;
    let t = ((ent.x - px) * dx + (ent.y - py) * dy) / len2;
    if (t < 0) t = 0;
    else if (t > 1) t = 1;
    const cx = px + dx * t - ent.x;
    const cy = py + dy * t - ent.y;
    return cx * cx + cy * cy < r * r;
  }

  function persistShot(bullet) {
    return bullet.kind === "drone" || bullet.kind === "swarm" || bullet.kind === "minion" || bullet.kind === "trap" || bullet.kind === "pillbox";
  }

  function bounceShotOff(bullet, ent) {
    const dx = bullet.x - ent.x;
    const dy = bullet.y - ent.y;
    const d = Math.hypot(dx, dy) || 0.0001;
    const overlap = bullet.r + ent.r - d;
    if (overlap > 0) {
      bullet.x += (dx / d) * overlap;
      bullet.y += (dy / d) * overlap;
    }
    const vn = (bullet.vx * dx + bullet.vy * dy) / d;
    if (vn < 0) {
      bullet.vx -= (dx / d) * vn;
      bullet.vy -= (dy / d) * vn;
    }
  }

  function applyShotHit(bullet, target) {
    if (tryNecro(bullet.owner, target, bullet)) return;
    const kick = target.kind === "alpha" ? 0.00008 : target.kind === "pentagon" ? 0.0022 : target.type === "tank" ? 0.01 : 0.01;
    target.vx = (target.vx || 0) + bullet.vx * kick;
    target.vy = (target.vy || 0) + bullet.vy * kick;
    const lived = target.alive && target.health > 0;
    damage(target, bullet.damage, bullet.owner);
    if (bullet.owner && bullet.owner.closer) return;
    const killed = lived && !target.alive;
    if (persistShot(bullet)) {
      if (!killed) bounceShotOff(bullet, target);
      bullet.health -= (bullet.kind === "trap" || bullet.kind === "pillbox" || bullet.kind === "drone" || bullet.kind === "minion" ? 0.35 : 0.45) / Math.max(0.35, bullet.pen || 1);
      if (bullet.health <= 0) bullet.alive = false;
      return;
    }
    if (!killed) {
      bullet.alive = false;
      return;
    }
    bullet.health -= 1 / Math.max(0.35, bullet.pen || 1);
    if (bullet.health <= 0) bullet.alive = false;
  }

  function damage(target, amount, src) {
    if (!target.alive) return;
    if (target.dominator && target.destroyed) return;
    if (target.closer && src && (src.closer || (src.owner && src.owner.closer))) return;
    if (tryTagHit(target, src)) return;
    if (target.spawnProtect > 0 && !(src && src.closer)) return;
    if (src && src.spawnProtect > 0 && !src.closer) return;
    let left = amount;
    if (target.type === "tank" && (target.shield || 0) > 0) {
      const soak = Math.min(target.shield, left);
      target.shield -= soak;
      left -= soak;
      target.shieldDelay = 2.8;
    }
    const taken = (amount - left) + Math.min(left, Math.max(0, target.health));
    if (taken > 0) creditDamage(target, taken, src);
    if (left > 0) target.health -= left;
    if (target.type === "tank") target.bodyHitT = 0.08;
    if (target === state.player) shake = Math.max(shake, Math.min(10, amount * 0.25));
    if (target.health <= 0) {
      if (target.dominator) {
        wreckDominator(target, src && src.owner ? src.owner : src);
        return;
      }
      target.alive = false;
      burst(target.x, target.y, target.color, target.kind === "alpha" ? 36 : 12, 180);
      if (target.kind === "alpha") state.alphaRespawnAt = state.time + rand(60, 120);
      if (target.type === "shape") {
        const payout = applyKillScore(target, target.score, src, target.x, target.y);
        if (target.kind === "alpha") notePlayerKill(target, payout);
      } else if (target.type === "tank") killTank(target, src);
    }
  }

  function droneTarget(b) {
    const owner = b.owner;
    if (!owner || !owner.alive) return null;
    const spread = b.kind === "swarm" ? 7 : 10;
    const ox = Math.cos(b.orbit) * spread;
    const oy = Math.sin(b.orbit) * spread;
    if (!owner.ai) {
      const aim = screenToWorld(mouse.x, mouse.y);
      if (mouse.right) {
        const dx = b.x - aim.x;
        const dy = b.y - aim.y;
        const dist = Math.hypot(dx, dy) || 1;
        const far = 1100;
        return { x: b.x + (dx / dist) * far, y: b.y + (dy / dist) * far, repel: true };
      }
      const manual = mouse.down || keys.has(" ");
      if (manual || (state.autoFire && !(owner.spawnProtect > 0))) {
        return { x: aim.x + ox, y: aim.y + oy };
      }
      return {
        x: owner.x + Math.cos(state.time * 1.7 + b.orbit) * 52,
        y: owner.y + Math.sin(state.time * 1.7 + b.orbit) * 52,
      };
    }
    const prey = nearestSeen(owner, state.tanks.concat(state.shapes), 700, (o) => o !== owner && (o.type !== "tank" || isEnemyTank(owner, o)));
    if (prey) return { x: prey.x + ox, y: prey.y + oy };
    return {
      x: owner.x + Math.cos(state.time * 1.7 + b.orbit) * 52,
      y: owner.y + Math.sin(state.time * 1.7 + b.orbit) * 52,
    };
  }

  function separateFlocks() {
    const flock = [];
    for (const b of state.bullets) {
      if (b.alive && flockKind(b.kind)) flock.push(b);
    }
    for (let i = 0; i < flock.length; i++) {
      const a = flock[i];
      for (let j = i + 1; j < flock.length; j++) {
        const b = flock[j];
        if (a.owner !== b.owner && !sameTeam(a.owner, b.owner)) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const min = (a.r + b.r) * (a.kind === "swarm" || b.kind === "swarm" ? 0.82 : 0.9);
        const d2 = dx * dx + dy * dy;
        if (d2 >= min * min) continue;
        const d = Math.sqrt(d2) || 0.0001;
        const push = (min - d) * 0.58;
        const nx = dx / d;
        const ny = dy / d;
        a.x -= nx * push;
        a.y -= ny * push;
        b.x += nx * push;
        b.y += ny * push;
        a.vx -= nx * 70;
        a.vy -= ny * 70;
        b.vx += nx * 70;
        b.vy += ny * 70;
      }
    }
  }

  function update(dt) {
    if (state.serverResetAt && state.time >= state.serverResetAt) {
      restartServer();
      return;
    }
    if (isRoyale() && state.royaleRestartAt && state.time >= state.royaleRestartAt) {
      restartServer();
      return;
    }
    state.time += dt;
    shake = Math.max(0, shake - dt * 18);
    refreshHunted();
    if (state.mode === "tag") checkTagVictory();
    if (state.mode === "protect") checkProtectClose();
    if (isRoyale() && state.time >= ROYALE_PREP && state.time - dt < ROYALE_PREP) {
      beginRoyaleStorm();
    }
    if (isRoyale()) checkRoyale();
    if (!state.closing && state.time >= FFA_CLOSE_AT) beginArenaClose("4 hours up. Starting a fresh server.");
    updateDoms(dt);
    updateAssault(dt);
    updateSiege(dt);
    updateRespawnUi();
    if (!state.spectating) updatePlayer(dt);
    else updateGhost(dt);

    for (const t of state.tanks) t.aggroN = 0;
    for (const tank of state.tanks) {
      if (!tank.alive) continue;
      if (tank.ai) updateAI(tank, dt);
      tank.vx *= Math.pow(0.0008, dt);
      tank.vy *= Math.pow(0.0008, dt);
      const spd = Math.hypot(tank.vx, tank.vy);
      const st = tankStats(tank);
      let cap = st.moveSpeed * SPEED_CAP;
      if (tank.ai && !tank.closer && !tank.mothership && !tank.boss && !tank.fodder && !tank.dominator && state.player && state.player.alive && !state.player.mothership) {
        if (!(isHuntMode() && tank === state.hunted)) {
          cap = tankStats(state.player).moveSpeed * SPEED_CAP * 0.95;
        }
      }
      if (tank.closer) cap = tankStats(tank).moveSpeed * SPEED_CAP * 1.35;
      if (spd > cap) { tank.vx *= cap / spd; tank.vy *= cap / spd; }
      if (tank.dominator) {
        tank.vx = 0;
        tank.vy = 0;
        if (tank.homeX != null) { tank.x = tank.homeX; tank.y = tank.homeY; }
      }
      tank.x += tank.vx * dt;
      tank.y += tank.vy * dt;
      tank.x = clamp(tank.x, tank.r, WORLD.w - tank.r);
      tank.y = clamp(tank.y, tank.r, WORLD.h - tank.r);
      pushOutWalls(tank);
      tank.bodyHitT = Math.max(0, tank.bodyHitT - dt);
      if (tank.spawnProtect > 0) tank.spawnProtect = Math.max(0, tank.spawnProtect - dt);
      const invading = tank.team && zoneAt(tank.x, tank.y) && zoneAt(tank.x, tank.y) !== tank.team;
      const inStorm = isRoyale() && royaleLocked() && !royaleInside(tank);
      if (tank.dominator && tank.destroyed) {
        tank.health = 0;
      } else if (invading || inStorm) {
        let burn = (tank.maxHealth + (tank.maxShield || 0)) * (inStorm ? royaleBurnRate() : 0.32) * dt;
        if ((tank.shield || 0) > 0) {
          const soak = Math.min(tank.shield, burn);
          tank.shield -= soak;
          burn -= soak;
          tank.shieldDelay = 1.2;
        }
        if (burn > 0) tank.health -= burn;
        tank.bodyHitT = 0.08;
        if (tank === state.player) shake = Math.max(shake, inStorm ? 3 : 4);
        if (tank.health <= 0) killTank(tank, null, inStorm ? "the storm" : `the ${zoneAt(tank.x, tank.y)} base`);
      } else {
        tank.health = Math.min(tank.maxHealth, tank.health + st.regen * dt);
        tank.shieldDelay = Math.max(0, (tank.shieldDelay || 0) - dt);
        if ((tank.maxShield || 0) > 0 && tank.shieldDelay <= 0) {
          tank.shield = Math.min(tank.maxShield, (tank.shield || 0) + st.shieldRegen * dt);
        }
      }
      const fadeId = getDef(tank).id;
      if (FADE_TANKS.has(fadeId) && spd < 25) tank.fade = Math.max(0.08, tank.fade - dt * 0.7);
      else tank.fade = Math.min(1, tank.fade + dt * 2.5);
    }

    for (const s of state.shapes) {
      if (!s.alive) continue;
      s.rot += s.spin * dt;
      if (s.kind === "alpha") {
        const cx = WORLD.w / 2;
        const cy = WORLD.h / 2;
        s.vx += (cx - s.x) * 1.6 * dt;
        s.vy += (cy - s.y) * 1.6 * dt;
        s.vx *= Math.pow(0.0004, dt);
        s.vy *= Math.pow(0.0004, dt);
      } else if (s.kind === "crasher") {
        const prey = nearestSeen(s, state.tanks, 980, (t) => !spawnProtected(t) && !zoneAt(t.x, t.y));
        const tankCruise = BASE_MOVE * 62 / -Math.log(0.0008);
        const spd = tankCruise * 1.1;
        if (prey) {
          const a = Math.atan2(prey.y - s.y, prey.x - s.x);
          s.vx += Math.cos(a) * BASE_MOVE * 1.1 * 62 * dt;
          s.vy += Math.sin(a) * BASE_MOVE * 1.1 * 62 * dt;
          s.rot = a;
        }
        s.vx *= Math.pow(0.0008, dt);
        s.vy *= Math.pow(0.0008, dt);
        const mag = Math.hypot(s.vx, s.vy);
        if (mag > spd) { s.vx *= spd / mag; s.vy *= spd / mag; }
      } else {
        s.vx *= Math.pow(0.04, dt);
        s.vy *= Math.pow(0.04, dt);
      }
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.x = clamp(s.x, s.r, WORLD.w - s.r);
      s.y = clamp(s.y, s.r, WORLD.h - s.r);
      if (isRoyale() && royaleLocked() && !royaleInside(s)) {
        s.health -= s.maxHealth * 0.35 * dt;
        if (s.health <= 0) s.alive = false;
      }
      if (pushOutWalls(s) && s.kind === "crasher") {
        s.vx *= 0.4;
        s.vy *= 0.4;
      }
      if (s.kind === "crasher" && zoneAt(s.x, s.y)) {
        s.alive = false;
        burst(s.x, s.y, s.color, 8, 140);
      }
    }

    for (const b of state.bullets) {
      if (!b.alive) continue;
      b.age += dt;
      const persist = b.kind === "trap" || b.kind === "pillbox";
      if (b.owner && !b.owner.alive && !persist && (flockKind(b.kind) || b.kind === "drone" || b.kind === "missile")) {
        b.alive = false;
        continue;
      }
      if (b.motion === "chase" || b.kind === "drone" || b.kind === "minion") {
        if (!persist && (!b.owner || !b.owner.alive) && flockKind(b.kind)) { b.alive = false; continue; }
        steerChase(b, dt);
        if (b.kind === "drone" || b.kind === "minion") b.life = 10;
        fireFromMinion(b, dt);
      } else if (b.motion === "swarm" || b.kind === "swarm") {
        if (!b.owner || !b.owner.alive) { b.alive = false; continue; }
        steerSwarm(b, dt);
      } else if (b.motion === "glide" || b.kind === "trap" || b.kind === "pillbox") {
        steerGlide(b, dt);
        fireFromMinion(b, dt);
      } else if (b.kind === "heal") {
        b.angle += dt * 5.6;
      } else if (b.kind === "missile") {
        const spd = Math.hypot(b.vx, b.vy) + 40 * dt;
        const a = Math.atan2(b.vy, b.vx);
        b.vx = Math.cos(a) * spd;
        b.vy = Math.sin(a) * spd;
        b.angle = a;
      }
      b.life -= dt;
      b.prevX = b.x;
      b.prevY = b.y;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (persist) {
        b.x = clamp(b.x, b.r, WORLD.w - b.r);
        b.y = clamp(b.y, b.r, WORLD.h - b.r);
        if (b.life <= 0) b.alive = false;
        else if (hitsWall(b.x, b.y, b.r)) {
          b.alive = false;
          burst(b.x, b.y, b.color, 3, 60);
        } else if (b.owner && b.owner.team) {
          const z = zoneAt(b.x, b.y);
          if (z && z !== b.owner.team) b.alive = false;
        }
      } else if (b.life <= 0 || b.x < 0 || b.y < 0 || b.x > WORLD.w || b.y > WORLD.h) b.alive = false;
      else if (hitsWall(b.x, b.y, b.r)) {
        b.alive = false;
        burst(b.x, b.y, b.color, 3, 60);
      }
      else if (b.owner && b.owner.team) {
        const z = zoneAt(b.x, b.y);
        if (z && z !== b.owner.team) b.alive = false;
      }
    }
    separateFlocks();

    for (let i = 0; i < state.tanks.length; i++) {
      const a = state.tanks[i];
      if (!a.alive) continue;
      for (let j = i + 1; j < state.tanks.length; j++) {
        const b = state.tanks[j];
        if (!b.alive) continue;
        if (collideCircles(a, b, 0.7) && !sameTeam(a, b) && a.bodyHitT <= 0 && b.bodyHitT <= 0) {
          damage(b, tankStats(a).bodyDamage, a);
          damage(a, tankStats(b).bodyDamage, b);
          a.bodyHitT = 0.22;
          b.bodyHitT = 0.22;
        }
      }
      for (const s of state.shapes) {
        if (!s.alive) continue;
        if (collideCircles(a, s, 0.5) && a.bodyHitT <= 0) {
          if (tryNecro(a, s, null)) {
            a.bodyHitT = 0.12;
            continue;
          }
          damage(s, tankStats(a).bodyDamage * 0.85, a);
          damage(a, s.kind === "alpha" ? 18 : s.kind === "pentagon" ? 8 : 5, null);
          a.bodyHitT = 0.18;
        }
      }
    }

    for (let i = 0; i < state.shapes.length; i++) {
      const a = state.shapes[i];
      if (!a.alive) continue;
      for (let j = i + 1; j < state.shapes.length; j++) {
        const b = state.shapes[j];
        if (b.alive) collideCircles(a, b, 0.4);
      }
    }

    for (let i = 0; i < state.bullets.length; i++) {
      const a = state.bullets[i];
      if (!a.alive) continue;
      for (let j = i + 1; j < state.bullets.length; j++) {
        const b = state.bullets[j];
        if (!b.alive || a.owner === b.owner || sameTeam(a.owner, b.owner)) continue;
        if (a.kind === "heal" || b.kind === "heal") continue;
        const aClose = a.owner && a.owner.closer;
        const bClose = b.owner && b.owner.closer;
        if (aClose && bClose) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const rr = a.r + b.r;
        if (dx * dx + dy * dy >= rr * rr) continue;
        if (aClose) {
          b.alive = false;
          burst(b.x, b.y, b.color, 4, 80);
          continue;
        }
        if (bClose) {
          a.alive = false;
          burst(a.x, a.y, a.color, 4, 80);
          break;
        }
        const wa = shotWeight(a);
        const wb = shotWeight(b);
        let dmgToA = Math.max(0.15, b.damage || 0) * (wb / wa);
        let dmgToB = Math.max(0.15, a.damage || 0) * (wa / wb);
        if ((a.kind === "trap" || a.kind === "pillbox") && b.kind !== "trap" && b.kind !== "pillbox" && wb < wa * 1.25) dmgToA *= 0.42;
        if ((b.kind === "trap" || b.kind === "pillbox") && a.kind !== "trap" && a.kind !== "pillbox" && wa < wb * 1.25) dmgToB *= 0.42;
        a.health -= dmgToA;
        b.health -= dmgToB;
        if (a.health <= 0) {
          a.alive = false;
          burst(a.x, a.y, a.color, 4, 80);
        }
        if (b.health <= 0) {
          b.alive = false;
          burst(b.x, b.y, b.color, 4, 80);
        }
        if (!a.alive) break;
      }
    }

    for (const bullet of state.bullets) {
      if (!bullet.alive) continue;
      for (const s of state.shapes) {
        if (!s.alive || !bullet.alive || bullet.kind === "heal") continue;
        if (!shotHits(bullet, s)) continue;
        applyShotHit(bullet, s);
      }
      for (const tank of state.tanks) {
        if (!tank.alive || tank === bullet.owner) continue;
        if (tank.dominator && tank.destroyed) continue;
        if (!shotHits(bullet, tank)) continue;
        if (bullet.kind === "heal") {
          if (tank.dominator || !sameTeam(tank, bullet.owner)) continue;
          tank.health = Math.min(tank.maxHealth, tank.health + bullet.damage);
          bullet.alive = false;
          continue;
        }
        if (sameTeam(tank, bullet.owner)) continue;
        applyShotHit(bullet, tank);
      }
    }

    for (const p of state.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
    }
    for (const f of state.floaters) {
      f.life -= dt;
      f.y -= 28 * dt;
    }

    state.bullets = state.bullets.filter((b) => b.alive);
    state.shapes = state.shapes.filter((s) => s.alive);
    state.tanks = state.tanks.filter((t) => t.alive || t === state.player);
    state.particles = state.particles.filter((p) => p.life > 0);
    state.floaters = state.floaters.filter((f) => f.life > 0);
    refreshHunted();
    if (state.mode === "tag") checkTagVictory();
    if (isRoyale()) checkRoyale();
    maintainShapes();

    const p = cameraFocus();
    if (p) {
      if (p.ghost) {
        state.camera.x = p.x;
        state.camera.y = p.y;
      } else {
        state.camera.x = lerp(state.camera.x, p.x, 1 - Math.pow(0.0002, dt));
        state.camera.y = lerp(state.camera.y, p.y, 1 - Math.pow(0.0002, dt));
      }
      updateHud();
    }
  }

  function formatScore(n) {
    n = Math.max(0, Number(n) || 0);
    const units = ["", "K", "M", "B", "T", "Qa"];
    let u = 0;
    let v = n;
    while (v >= 1000 && u < units.length - 1) {
      v /= 1000;
      u += 1;
    }
    if (!u) return Math.floor(n).toLocaleString("en-US");
    let decimals = v >= 100 ? 1 : 2;
    let s = v.toFixed(decimals);
    if (Number(s) >= 1000 && u < units.length - 1) {
      v /= 1000;
      u += 1;
      s = v.toFixed(2);
    }
    const parts = s.split(".");
    const head = Number(parts[0]).toLocaleString("en-US");
    return (parts[1] ? `${head}.${parts[1]}` : head) + units[u];
  }

  function updateHud() {
    if (els.serverTotal) {
      let sum = 0;
      for (const t of state.tanks) {
        if (t.alive && !t.closer && !t.dominator && !t.boss && !t.fodder) sum += t.score || 0;
      }
      els.serverTotal.textContent = `Total ${formatScore(sum)}`;
    }
    const p = state.spectating && state.spectateTarget && state.spectateTarget.alive ? state.spectateTarget : state.player;
    if (!p) return;
    const next = Math.min(levelCap(), p.level + (p.level < levelCap() ? 1 : 0));
    const cur = xpForLevel(p.level);
    const nxt = xpForLevel(next);
    const pct = p.level >= levelCap() ? 100 : ((p.score - cur) / Math.max(1, nxt - cur)) * 100;
    const def = getDef(p);
    const ranked = state.tanks.filter((t) => t.alive && !t.closer && !t.mothership && !t.dominator && !t.boss && !t.fodder).sort((a, b) => b.score - a.score).slice(0, 10);
    const top = Math.max(1, ranked[0] ? ranked[0].score : 1);
    const free = skillPointsFor(p.level) - spentPoints(p);
    if (els.xpFill) els.xpFill.style.width = `${clamp(pct, 0, 100)}%`;
    if (els.xpLabel) {
      const cap = levelCap();
      els.xpLabel.textContent = spectateFree() ? "Free camera" : (state.mode === "growth" ? `Level ${p.level}/${cap} ${def.name}` : `Level ${p.level} ${def.name}`);
    }
    if (els.playerName) {
      if (spectateFree()) els.playerName.textContent = "Spectator";
      else if (state.spectating) els.playerName.textContent = (p.name || "Tank") + "  ·  spectate";
      else if (state.player && state.player.mothership) els.playerName.textContent = p.name + "  ·  Mothership";
      else els.playerName.textContent = state.hunted === p ? p.name + "  ·  HUNTED" : p.name;
    }
    if (els.scoreText) els.scoreText.textContent = `Score: ${formatScore(p.score)}`;
    if (els.scoreFill) els.scoreFill.style.width = `${clamp((p.score / top) * 100, 8, 100)}%`;
    if (els.killsText) els.killsText.textContent = `Kills: ${p.kills || 0}`;
    if (els.killsFill) els.killsFill.style.width = `${clamp((p.kills || 0) * 10, 8, 100)}%`;
    if (els.closeTimer) {
      const resetLeft = state.serverResetAt
        ? Math.max(0, state.serverResetAt - state.time)
        : Math.max(0, FFA_CLOSE_AT - state.time);
      const resetText = (state.closing || state.serverResetAt)
        ? `Fresh server ${Math.ceil(resetLeft)}s`
        : `Reset ${formatClock(resetLeft)}`;
      if (state.closing || state.serverResetAt) {
        els.closeTimer.textContent = resetText;
      } else if (state.mode === "domination" && state.domHold) {
        const left = Math.max(0, DOM_HOLD - (state.time - state.domHoldT));
        els.closeTimer.textContent = `${TEAMS[state.domHold].name} hold ${left.toFixed(0)}s · ${resetText}`;
      } else if (state.mode === "assault") {
        const live = assaultLiveCount();
        const total = assaultDoms().length;
        const need = assaultNeed();
        if (state.assaultHold) {
          els.closeTimer.textContent = `Green win ${formatClock(state.assaultWinAt - state.time)} · ${live}/${total} · ${resetText}`;
        } else {
          els.closeTimer.textContent = `Hold ${live}/${need} to win · ${resetText}`;
        }
      } else if (state.mode === "siege") {
        const wave = Math.max(0, (state.siegeWave || 0) + 1);
        const total = (state.siegeWaves && state.siegeWaves.length) || 24;
        const live = liveSanctuaries().length;
        const all = siegeSanctuaries().length;
        if (state.siegeLoseAt) {
          els.closeTimer.textContent = `Lose ${formatClock(state.siegeLoseAt - state.time)} · ${live}/${all} sancs · ${resetText}`;
        } else if (state.siegeRemaining > 0) {
          els.closeTimer.textContent = `Wave ${wave}/${total} · ${state.siegeRemaining} left · ${resetText}`;
        } else {
          const wait = Math.max(0, (state.siegeNextAt || 0) - state.time);
          els.closeTimer.textContent = `Next wave ${wait.toFixed(0)}s · ${live}/${all} sancs · ${resetText}`;
        }
      } else if (isRoyale()) {
        const alive = royaleContestants().length;
        const clock = formatStopwatch(state.time);
        if (state.royaleRestartAt) els.closeTimer.textContent = `${clock} · Fresh server ${Math.max(0, state.royaleRestartAt - state.time).toFixed(0)}s`;
        else if (!royaleLocked()) els.closeTimer.textContent = `${clock} · Storm in ${formatClock(ROYALE_PREP - state.time)} · ${alive} left`;
        else els.closeTimer.textContent = `${clock} · Storm · ${alive} left`;
      } else {
        els.closeTimer.textContent = resetText;
      }
    }
    if (els.arenaMode && isHuntMode()) {
      const mark = state.hunted;
      const title = modeLabel();
      els.arenaMode.textContent = !mark
        ? title
        : mark === state.player
          ? `${title} · you are hunted`
          : `${title} · hunt ${mark.name}`;
    }
    if (els.arenaMode && state.mode === "tag") {
      if (state.closing) els.arenaMode.textContent = "Fresh server";
      else {
        const green = state.tanks.filter((t) => t.alive && !t.closer && t.team === "green").length;
        const redn = state.tanks.filter((t) => t.alive && !t.closer && t.team === "red").length;
        els.arenaMode.textContent = `Tag · Green ${green} – ${redn} Red`;
      }
    }
    if (els.arenaMode && state.mode === "protect") {
      if (state.closing) els.arenaMode.textContent = "Fresh server";
      else {
        const g = mothershipOf("green");
        const r = mothershipOf("red");
        const gp = g ? Math.round((g.health / Math.max(1, g.maxHealth)) * 100) : 0;
        const rp = r ? Math.round((r.health / Math.max(1, r.maxHealth)) * 100) : 0;
        const piloting = state.player && state.player.mothership;
        els.arenaMode.textContent = `${modeLabel()} · G ${gp}%  R ${rp}%${piloting ? " · [H] leave" : " · [H] control"} · [N] lv45`;
      }
    }
    if (els.arenaMode && state.mode === "domination") {
      const b = state.doms.filter((d) => d.team === "blue").length;
      const r = state.doms.filter((d) => d.team === "red").length;
      els.arenaMode.textContent = state.closing ? "Fresh server" : `Domination · Blue ${b} – ${r} Red`;
    }
    if (els.arenaMode && state.mode === "assault") {
      const live = assaultLiveCount();
      const total = assaultDoms().length;
      const side = state.player && state.player.team ? TEAMS[state.player.team].name : "Assault";
      els.arenaMode.textContent = state.closing
        ? "Fresh server"
        : `${modeLabel()} · ${side} · Green ${live}/${total}`;
    }
    if (els.arenaMode && state.mode === "siege") {
      const wave = Math.max(1, (state.siegeWave || 0) + 1);
      const total = (state.siegeWaves && state.siegeWaves.length) || 24;
      const live = liveSanctuaries().length;
      const all = Math.max(1, siegeSanctuaries().length);
      els.arenaMode.textContent = state.closing
        ? "Fresh server"
        : `Siege · Wave ${Math.min(wave, total)}/${total} · ${live}/${all} sancs`;
    }
    if (els.arenaMode && state.mode === "growth") {
      els.arenaMode.textContent = state.closing
        ? "Fresh server"
        : (state.armsRace ? "Growth AR · cap 1000 · [N] lv45" : "Growth · cap 1000 · [N] lv45");
    }
    if (els.arenaMode && isRoyale()) {
      const alive = royaleContestants().length;
      const label = modeLabel(state.mode);
      els.arenaMode.textContent = state.royaleRestartAt
        ? `${label} · fresh server`
        : (!royaleLocked() ? `${label} · prep · ${alive} left` : `${label} · ${alive} left`);
    }
    if (els.skillPoints) els.skillPoints.textContent = state.spectating ? "" : (free > 0 ? `x${free}` : "");
    const teamRows = teamBoardRows();
    const playerRows = ranked.map((t) =>
      `<li class="${t === state.player ? "you" : ""} ${t === state.hunted ? "hunted" : ""}"><div class="lb-fill" style="width:${clamp((t.score / top) * 100, 8, 100)}%"></div><span><i class="lb-dot" style="background:${t.color}"></i>${escapeHtml(t.name)}${t === state.hunted ? " · hunted" : ""} — ${escapeHtml(getDef(t).name)} — ${formatScore(t.score)}</span></li>`
    ).join("");
    els.leaders.innerHTML = (teamRows
      ? teamRows.map((r) =>
        `<li class="team-tot" style="background:${r.color}"><span>${escapeHtml(r.label)}</span></li>`
      ).join("")
      : "") + playerRows;
  }

  function teamBoardRows() {
    const rows = [];
    if (state.mode === "tdm" || state.mode === "4tdm") {
      const ids = state.mode === "4tdm" ? TEAM4 : ["blue", "red"];
      for (const id of ids) {
        const sum = state.tanks.filter((t) => t.alive && t.team === id && !t.closer).reduce((n, t) => n + t.score, 0);
        rows.push({ color: TEAMS[id].color, label: `${TEAMS[id].name} — ${formatScore(sum)}`, sort: sum });
      }
    } else if (isTeamHunt()) {
      const hunted = state.hunted && state.hunted.alive ? state.hunted : null;
      const hunters = state.tanks.filter((t) => t.alive && !t.closer && t.team === HUNTER_TEAM).length;
      rows.push({ color: TEAMS[HUNTER_TEAM].color, label: `Hunters — ${hunters}`, sort: hunters });
      rows.push({
        color: TEAMS[HUNTED_TEAM].color,
        label: hunted ? `Hunted — ${hunted.name}` : "Hunted — —",
        sort: hunted ? hunted.score : -1,
      });
    } else if (state.mode === "tag") {
      for (const id of ["green", "red"]) {
        const n = state.tanks.filter((t) => t.alive && !t.closer && t.team === id).length;
        rows.push({ color: TEAMS[id].color, label: `${TEAMS[id].name} — ${n}`, sort: n });
      }
    } else if (state.mode === "protect") {
      for (const id of ["green", "red"]) {
        const m = mothershipOf(id);
        const hp = m && m.maxHealth ? m.health / m.maxHealth : 0;
        rows.push({ color: TEAMS[id].color, label: `${TEAMS[id].name} mothership — ${Math.round(hp * 100)}%`, sort: hp });
      }
    } else if (state.mode === "domination") {
      for (const id of ["blue", "red"]) {
        const pts = state.doms.filter((d) => d.team === id).length;
        const sum = state.tanks.filter((t) => t.alive && t.team === id && !t.closer).reduce((n, t) => n + t.score, 0);
        rows.push({ color: TEAMS[id].color, label: `${TEAMS[id].name} — ${pts} pts · ${formatScore(sum)}`, sort: pts * 1e12 + sum });
      }
    } else if (state.mode === "assault") {
      const live = assaultLiveCount();
      const taken = assaultBlueCount();
      const total = Math.max(1, assaultDoms().length);
      for (const id of ["green", "blue"]) {
        const sum = state.tanks.filter((t) => t.alive && t.team === id && !t.closer && !t.dominator).reduce((n, t) => n + t.score, 0);
        const extra = id === "green" ? `${live}/${total} doms` : `${taken} captured`;
        rows.push({ color: TEAMS[id].color, label: `${TEAMS[id].name} — ${extra} · ${formatScore(sum)}`, sort: id === "green" ? live * 1e12 + sum : taken * 1e12 + sum });
      }
    } else if (state.mode === "siege") {
      const live = liveSanctuaries().length;
      const all = Math.max(1, siegeSanctuaries().length);
      const remaining = state.siegeRemaining || 0;
      rows.push({ color: TEAMS.blue.color, label: `Blue — ${live}/${all} sancs`, sort: live });
      rows.push({ color: TEAMS.boss.color, label: `Bosses — ${remaining} left`, sort: remaining });
    } else {
      return null;
    }
    rows.sort((a, b) => b.sort - a.sort);
    return rows;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function renderStats() {
    const p = state.player;
    if (!p) return;
    const free = skillPointsFor(p.level) - spentPoints(p);
    if (els.skillPoints) els.skillPoints.textContent = free > 0 ? `x${free}` : "";
    const cap = statCap();
    els.stats.innerHTML = STATS.map((st, i) => {
      const v = p.stats[st.key];
      const maxed = v >= cap;
      return `<div class="stat-row ${maxed || free <= 0 ? "maxed" : ""}" data-stat="${st.key}" style="--pip:${st.color}">
        <div class="stat-dot"></div>
        <div class="stat-track">
          <div class="stat-fill" style="width:${(v / cap) * 100}%"></div>
          <div class="stat-name">${st.name}</div>
        </div>
        <div class="stat-key">[${i === 9 ? 0 : i + 1}]</div>
      </div>`;
    }).join("");
    els.stats.querySelectorAll(".stat-row").forEach((row) => {
      row.addEventListener("click", () => tryUpgrade(row.dataset.stat, keys.has("m")));
    });
  }

  const CLASS_KEYS = ["y", "u", "i", "h", "j", "k", "n", "b", "v", "g", "f", "x", "z", "q", "l", "p", "o"];
  const CLASS_TILES = ["#a8d8ea", "#c5e1a5", "#f8bbd0", "#ffe082", "#d1c4e9", "#ffccbc", "#b2dfdb", "#f0f4c3"];

  function renderClassPanel() {
    const show = document.getElementById("show-classes");
    if (state.spectating) {
      els.classes.classList.add("hidden");
      if (show) show.classList.add("hidden");
      return;
    }
    const p = menuTank();
    if (!p) return;
    const def = getDef(p);
    const options = classUpgrades(def, p);
    state.classOptions = options;
    if (!options.length && state.mode !== "sandbox") {
      els.classes.classList.add("hidden");
      if (show) show.classList.add("hidden");
      return;
    }
    if (state.classDismissed) {
      els.classes.classList.add("hidden");
      if (show) show.classList.remove("hidden");
      return;
    }
    if (show) show.classList.add("hidden");
    els.classes.classList.remove("hidden");
    const extra = state.mode === "sandbox"
      ? `<button class="class-btn sandbox-btn" id="open-catalog" type="button">All tanks / editor</button>`
      : "";
    els.classChoices.innerHTML = extra + options.map((id, i) => {
      const c = TankCatalog.get(id);
      const key = CLASS_KEYS[i] ? `[${CLASS_KEYS[i].toUpperCase()}]` : "";
      return `<button class="class-btn" data-class="${id}" style="--tile:${CLASS_TILES[i % CLASS_TILES.length]}">
        <canvas class="class-icon" data-id="${id}" width="72" height="52"></canvas>
        <span class="class-name">${c.name}</span>
        <span class="class-key">${key}</span>
      </button>`;
    }).join("");
    els.classChoices.querySelectorAll("[data-class]").forEach((btn) => {
      btn.addEventListener("click", () => pickClass(btn.dataset.class));
    });
    els.classChoices.querySelectorAll("canvas.class-icon").forEach((cv) => {
      drawPreview(cv, TankCatalog.get(cv.dataset.id), (state.player && state.player.color) || state.selectedColor || COLORS.player, -1, cv.parentElement.style.getPropertyValue("--tile") || "#cde");
    });
    const cat = document.getElementById("open-catalog");
    if (cat) cat.addEventListener("click", () => window.TankWorkshop.open());
  }

  function pickClass(id) {
    const p = menuTank();
    if (!p || !p.alive) return;
    if (isHealerId(id) && !healerAllowed(p)) return;
    p.classId = id;
    p.customDef = null;
    applyLevel(p);
    state.classDismissed = false;
    renderClassPanel();
    if (p === state.player || p === state.pilotTank) {
      const def = getDef(p);
      if (def && def.name) note(`You have upgraded to ${def.name}.`);
    }
  }

  function tryUpgrade(key, dump) {
    const p = state.player;
    if (!p || !p.alive || p.mothership || p.closer) return;
    let used = false;
    while (true) {
      const free = skillPointsFor(p.level) - spentPoints(p);
      if (free <= 0 || p.stats[key] >= statCap()) break;
      p.stats[key]++;
      used = true;
      if (!dump) break;
    }
    if (!used) return;
    applyLevel(p);
    renderStats();
  }

  function roundRect(c, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + rr, y);
    c.arcTo(x + w, y, x + w, y + h, rr);
    c.arcTo(x + w, y + h, x, y + h, rr);
    c.arcTo(x, y + h, x, y, rr);
    c.arcTo(x, y, x + w, y, rr);
    c.closePath();
  }

  function drawPoly(c, x, y, r, sides, rot, fill) {
    c.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = rot + (TAU * i) / sides - Math.PI / 2;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      if (i) c.lineTo(px, py);
      else c.moveTo(px, py);
    }
    c.closePath();
    c.fillStyle = fill;
    c.strokeStyle = darken(fill);
    c.lineWidth = 3;
    c.lineJoin = "round";
    c.fill();
    c.stroke();
  }

  function drawGun(c, tank, gun, index, highlight) {
    const u = unitOf(tank);
    const [L, W, A, X, Y] = gun.pos;
    const auto = gun.type === "auto";
    const pivot = auto ? autoPivot(tank, gun, index) : null;
    const ang = auto ? pivot.ang : tank.angle + (gun.pos[5] * Math.PI) / 180;
    const fill = highlight ? "#cde" : COLORS.barrel;
    c.save();
    if (auto) {
      c.translate(pivot.x, pivot.y);
      c.rotate(ang);
    } else {
      c.translate(tank.x, tank.y);
      c.rotate(ang);
      c.translate(X * u, Y * u);
    }
    const len = Math.max(2, (auto && pivot.ring ? L * 0.62 : L) * u);
    const w0 = Math.max(1.5, W * u * 0.5);
    const w1 = Math.max(1.5, W * Math.abs(A) * u * 0.5);
    c.beginPath();
    c.moveTo(0, -w0);
    c.lineTo(len, -w1);
    c.lineTo(len, w1);
    c.lineTo(0, w0);
    c.closePath();
    c.fillStyle = fill;
    c.strokeStyle = COLORS.outline;
    c.lineWidth = 3;
    c.lineJoin = "round";
    c.fill();
    c.stroke();
    if (gun.type === "trap" || gun.type === "pillbox") {
      c.beginPath();
      c.moveTo(len, -w1 * 1.15);
      c.lineTo(len + 6, -w1 * 1.45);
      c.lineTo(len + 6, w1 * 1.45);
      c.lineTo(len, w1 * 1.15);
      c.closePath();
      c.fill();
      c.stroke();
    }
    if (auto) {
      const domeR = Math.max(4.2, Math.min(tank.r * (pivot.ring ? 0.3 : 0.45), W * u * (pivot.ring ? 0.58 : 0.9)));
      c.beginPath();
      c.arc(0, 0, domeR, 0, TAU);
      c.fill();
      c.stroke();
    }
    c.restore();
  }

  function drawBar(c, x, y, w, h, pct, track, fill) {
    c.fillStyle = "#333";
    roundRect(c, x - 1, y - 1, w + 2, h + 2, 2);
    c.fill();
    c.fillStyle = track;
    roundRect(c, x, y, w, h, 2);
    c.fill();
    if (pct > 0.002) {
      c.fillStyle = fill;
      roundRect(c, x, y, w * clamp(pct, 0, 1), h, 2);
      c.fill();
    }
  }

  function drawHealth(c, ent, yOff) {
    const repairing = !!(ent.dominator && ent.destroyed && (ent.repair || 0) > 0);
    const maxSh = ent.maxShield || 0;
    const sh = Math.max(0, ent.shield || 0);
    const hpFull = !repairing && ent.maxHealth > 0 && ent.health >= ent.maxHealth * 0.995;
    const shFull = maxSh <= 0.5 || sh >= maxSh * 0.995;
    if (hpFull && shFull) return;
    const w = ent.r * 2.2;
    const h = 5;
    const x = ent.x - w / 2;
    const y = ent.y + (yOff || ent.r + 8);
    const hpPct = repairing ? clamp(ent.repair, 0, 1) : (ent.maxHealth > 0 ? clamp(ent.health / ent.maxHealth, 0, 1) : 1);
    if (maxSh > 0.5) {
      drawBar(c, x, y, w, h, sh / maxSh, "#1f4f7a", "#4ea4ff");
      drawBar(c, x, y + 7, w, h, hpPct, repairing ? "#6a5a18" : "#3a7a32", repairing ? "#f2e863" : "#9dff5a");
    } else {
      drawBar(c, x, y, w, h, hpPct, repairing ? "#6a5a18" : "#3a7a32", repairing ? "#f2e863" : (hpPct < 0.3 ? "#e85d5d" : "#9dff5a"));
    }
  }

  function drawGhost(c, g) {
    if (!g) return;
    c.save();
    c.beginPath();
    c.arc(g.x, g.y, g.r, 0, TAU);
    c.fillStyle = "rgba(255,255,255,0.18)";
    c.fill();
    c.strokeStyle = "rgba(255,255,255,0.7)";
    c.lineWidth = 2.4;
    c.setLineDash([5, 4]);
    c.stroke();
    c.restore();
  }

  function drawOutlinedText(c, text, x, y, font, fill, strokeW) {
    c.font = font;
    c.textAlign = "center";
    c.textBaseline = "bottom";
    c.lineJoin = "round";
    c.miterLimit = 2;
    c.lineWidth = strokeW;
    c.strokeStyle = "#111";
    c.fillStyle = fill;
    c.strokeText(text, x, y);
    c.fillText(text, x, y);
  }

  function drawTank(c, tank, opts = {}) {
    const def = tank.customDef || TankCatalog.get(tank.classId);
    const guns = def.guns || [];
    const skipGuns = tank.dominator && (tank.destroyed || (tank.team === "blue" && !tank.sanctuary));
    c.save();
    c.globalAlpha = tank.fade == null ? 1 : tank.fade;
    if (!skipGuns) {
      for (let i = 0; i < guns.length; i++) {
        if (guns[i].type === "auto") continue;
        drawGun(c, tank, guns[i], i, opts.highlightGun === i);
      }
    }
    const sides = def.body || 0;
    const fill = tank.bodyHitT > 0 ? "#fff" : tank.color;
    if (def.smasher) {
      drawPoly(c, tank.x, tank.y, tank.r * 1.28, 6, tank.angle / 4, darken(tank.color, 0.15));
    }
    if (sides >= 3) drawPoly(c, tank.x, tank.y, tank.r, sides, Math.PI / sides, fill);
    else {
      c.beginPath();
      c.arc(tank.x, tank.y, tank.r, 0, TAU);
      c.fillStyle = fill;
      c.strokeStyle = outlineFor(tank.color);
      c.lineWidth = 3.4;
      c.fill();
      c.stroke();
    }
    if (def.healer) {
      c.save();
      c.strokeStyle = "#8abc3f";
      c.lineWidth = Math.max(4, tank.r * 0.22);
      c.lineCap = "round";
      const s = tank.r * 0.34;
      c.beginPath();
      c.moveTo(tank.x - s, tank.y);
      c.lineTo(tank.x + s, tank.y);
      c.moveTo(tank.x, tank.y - s);
      c.lineTo(tank.x, tank.y + s);
      c.stroke();
      c.restore();
    }
    if (!skipGuns) {
      for (let i = 0; i < guns.length; i++) {
        if (guns[i].type !== "auto") continue;
        drawGun(c, tank, guns[i], i, opts.highlightGun === i);
      }
    }
    if (!opts.hideName) {
      if (tank.dominator) {
        const label = tank.destroyed ? (tank.mainBase ? "Healer wreck" : "Dominator wreck") : tank.name;
        drawOutlinedText(c, label, tank.x, tank.y - tank.r - 8, "bold 13px Ubuntu, Segoe UI, sans-serif", "#fff", 3.6);
      } else {
        const label = tank === state.hunted ? tank.name + "  HUNTED" : tank.name;
        const baseY = tank.y - tank.r - 5;
        drawOutlinedText(c, formatScore(tank.score || 0), tank.x, baseY, "bold 10px Ubuntu, Segoe UI, sans-serif", "#fff", 3.2);
        drawOutlinedText(c, label, tank.x, baseY - 12, "bold 13px Ubuntu, Segoe UI, sans-serif", "#fff", 3.6);
      }
    }
    if (tank.mainBase && !tank.destroyed) {
      c.save();
      c.strokeStyle = "#f14e54";
      c.lineWidth = 7;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(tank.x - tank.r * 0.34, tank.y);
      c.lineTo(tank.x + tank.r * 0.34, tank.y);
      c.moveTo(tank.x, tank.y - tank.r * 0.34);
      c.lineTo(tank.x, tank.y + tank.r * 0.34);
      c.stroke();
      c.restore();
    }
    if (tank === state.hunted) {
      c.beginPath();
      c.arc(tank.x, tank.y, tank.r + 10, 0, TAU);
      c.strokeStyle = `rgba(232, 176, 32,${0.55 + 0.35 * Math.abs(Math.sin(state.time * 5))})`;
      c.lineWidth = 3.5;
      c.stroke();
    }
    if (tank.spawnProtect > 0) {
      c.beginPath();
      c.arc(tank.x, tank.y, tank.r + 7, 0, TAU);
      c.strokeStyle = `rgba(255,255,255,${0.4 + 0.4 * Math.abs(Math.sin(state.time * 8))})`;
      c.lineWidth = 3;
      c.stroke();
    }
    c.restore();
    if (!opts.hideHealth) drawHealth(c, tank);
  }

  function drawPreview(target, def, color = COLORS.player, highlightGun = -1, bg = COLORS.bg) {
    const c = target.getContext("2d");
    const w = target.width;
    const h = target.height;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = bg || COLORS.bg;
    c.fillRect(0, 0, w, h);
    if (!bg || bg === COLORS.bg) {
      c.strokeStyle = COLORS.grid;
      for (let x = 0; x < w; x += 18) {
        c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke();
      }
      for (let y = 0; y < h; y += 18) {
        c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
      }
    }
    const guns = (def && def.guns) || [];
    const sizeMul = (def && def.mods && def.mods.size) || 1;
    let r = Math.min(w, h) * 0.155 * sizeMul;
    const reachOf = (radius) => {
      const u = radius / 12;
      let max = radius * ((def && def.smasher) ? 1.35 : 1.08);
      for (const gun of guns) {
        const [L, W, A, X, Y] = gun.pos || [18, 8, 1, 0, 0, 0, 0];
        const tip = Math.hypot((X + L) * u, Y * u) + Math.max(W, Math.abs(W * A)) * u * 0.55 + 6;
        if (tip > max) max = tip;
      }
      return max;
    };
    const room = Math.min(w, h) * (Math.min(w, h) < 120 ? 0.42 : 0.34);
    const reach = reachOf(r);
    if (reach > room && reach > 1) r *= room / reach;
    const mock = {
      x: w / 2, y: h / 2 + 2, r, angle: -Math.PI / 2, color, bodyHitT: 0, fade: 1,
      classId: def.id || "custom", customDef: def, name: def.name, turretAim: [],
      health: 1, maxHealth: 1,
    };
    drawTank(c, mock, { hideName: true, hideHealth: true, highlightGun });
  }

  function render() {
    const cam = state.camera;
    const zoom = cam.zoom / viewFov();
    const sx = (Math.random() - 0.5) * shake;
    const sy = (Math.random() - 0.5) * shake;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2 + sx, height / 2 + sy);
    ctx.scale(zoom, zoom);
    ctx.translate(-cam.x, -cam.y);

    const viewW = width / zoom;
    const viewH = height / zoom;
    const left = cam.x - viewW / 2;
    const top = cam.y - viewH / 2;
    const grid = 24;
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    const gx0 = Math.floor(left / grid) * grid;
    const gy0 = Math.floor(top / grid) * grid;
    for (let x = gx0; x < left + viewW + grid; x += grid) { ctx.moveTo(x, top); ctx.lineTo(x, top + viewH); }
    for (let y = gy0; y < top + viewH + grid; y += grid) { ctx.moveTo(left, y); ctx.lineTo(left + viewW, y); }
    ctx.stroke();
    ctx.strokeStyle = "#9a9a9a";
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, WORLD.w, WORLD.h);
    if (state.mode === "tdm" || state.mode === "4tdm") {
      const paint = (team, x, y, w, h) => {
        const c = TEAMS[team].color;
        ctx.fillStyle = c;
        ctx.globalAlpha = 0.16;
        ctx.fillRect(x, y, w, h);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = c;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 8;
        ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
        ctx.globalAlpha = 1;
      };
      if (state.mode === "4tdm") {
        paint("blue", 0, BASE_W, BASE_W, WORLD.h - BASE_W * 2);
        paint("red", WORLD.w - BASE_W, BASE_W, BASE_W, WORLD.h - BASE_W * 2);
        paint("green", BASE_W, 0, WORLD.w - BASE_W * 2, BASE_W);
        paint("purple", BASE_W, WORLD.h - BASE_W, WORLD.w - BASE_W * 2, BASE_W);
      } else {
        paint("blue", 0, 0, BASE_W, WORLD.h);
        paint("red", WORLD.w - BASE_W, 0, BASE_W, WORLD.h);
      }
    }
    if (state.mode === "assault") {
      for (const d of assaultDoms()) {
        const col = d.destroyed ? "#8a8a8a" : (TEAMS[d.team] ? TEAMS[d.team].color : "#8a8a8a");
        const zr = assaultZoneR(d);
        ctx.beginPath();
        ctx.arc(d.x, d.y, zr, 0, TAU);
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.16;
        ctx.fill();
        ctx.globalAlpha = 0.48;
        ctx.strokeStyle = col;
        ctx.lineWidth = 7;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    for (const w of state.walls) {
      ctx.fillStyle = "#8f8f8f";
      ctx.strokeStyle = "#6a6a6a";
      ctx.lineWidth = 3;
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeRect(w.x + 1.5, w.y + 1.5, Math.max(0, w.w - 3), Math.max(0, w.h - 3));
    }
    for (const d of state.doms) {
      const col = d.team && TEAMS[d.team] ? TEAMS[d.team].color : "#888888";
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, TAU);
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.22;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = col;
      ctx.lineWidth = 10;
      ctx.stroke();
      if (d.progress > 0 && d.progress < 1) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r - 18, -Math.PI / 2, -Math.PI / 2 + TAU * d.progress);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 6;
        ctx.stroke();
      }
    }
    if (isRoyale()) {
      const c = stormCenter();
      const cx = c.x;
      const cy = c.y;
      const rr = Math.max(0, royaleRadius());
      const stormOn = royaleLocked() && rr < royaleMaxR() - 2;
      if (stormOn) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, WORLD.w, WORLD.h);
        if (rr > 4) ctx.arc(cx, cy, rr, 0, TAU);
        ctx.fillStyle = "rgba(210, 64, 42, 0.2)";
        ctx.fill(rr > 4 ? "evenodd" : "nonzero");
        ctx.restore();
      }
      if (rr > 4) {
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, TAU);
        ctx.strokeStyle = stormOn ? "rgba(232, 72, 48, 0.85)" : "rgba(255, 140, 64, 0.4)";
        ctx.lineWidth = stormOn ? 10 : 6;
        ctx.stroke();
      }
    } else if (state.mode !== "protect" && state.mode !== "maze") {
      ctx.fillStyle = "rgba(118, 141, 252, 0.08)";
      ctx.beginPath();
      ctx.arc(WORLD.w / 2, WORLD.h / 2, 700, 0, TAU);
      ctx.fill();
    }

    for (const s of state.shapes) {
      if (s.x + s.r < left || s.x - s.r > left + viewW || s.y + s.r < top || s.y - s.r > top + viewH) continue;
      drawPoly(ctx, s.x, s.y, s.r, s.sides, s.rot, s.color);
      drawHealth(ctx, s, s.r + 10);
    }

    for (const b of state.bullets) {
      if (b.kind === "trap" || b.kind === "heal") {
        drawPoly(ctx, b.x, b.y, b.r, 4, b.angle, b.color);
      } else if (b.kind === "drone" || b.kind === "swarm") {
        const sides = b.sides || (b.kind === "swarm" ? 3 : 3);
        if (sides < 3) {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, TAU);
          ctx.fillStyle = b.color;
          ctx.strokeStyle = darken(b.color);
          ctx.lineWidth = 2.5;
          ctx.fill();
          ctx.stroke();
        } else {
          drawPoly(ctx, b.x, b.y, b.r, sides, b.angle, b.color);
        }
      } else if (b.kind === "minion") {
        const a = b.turretAim == null ? b.angle : b.turretAim;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.moveTo(0, -3.2);
        ctx.lineTo(b.r + 9, -2.4);
        ctx.lineTo(b.r + 9, 2.4);
        ctx.lineTo(0, 3.2);
        ctx.closePath();
        ctx.fillStyle = COLORS.barrel;
        ctx.strokeStyle = COLORS.outline;
        ctx.lineWidth = 2.2;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, TAU);
        ctx.fillStyle = b.color;
        ctx.strokeStyle = darken(b.color);
        ctx.lineWidth = 2.5;
        ctx.fill();
        ctx.stroke();
      } else if (b.kind === "pillbox") {
        drawPoly(ctx, b.x, b.y, b.r, 4, b.angle, b.color);
        const a = b.turretAim == null ? 0 : b.turretAim;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.moveTo(0, -2.6);
        ctx.lineTo(b.r + 7, -2);
        ctx.lineTo(b.r + 7, 2);
        ctx.lineTo(0, 2.6);
        ctx.closePath();
        ctx.fillStyle = COLORS.barrel;
        ctx.strokeStyle = COLORS.outline;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(3.4, b.r * 0.42), 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, TAU);
        ctx.fillStyle = b.color;
        ctx.strokeStyle = darken(b.color);
        ctx.lineWidth = 2.5;
        ctx.fill();
        ctx.stroke();
      }
    }

    for (const t of state.tanks) if (t.alive) drawTank(ctx, t);
    if (spectateFree()) drawGhost(ctx, state.ghost);

    for (const pt of state.particles) {
      ctx.globalAlpha = pt.life / pt.max;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r, 0, TAU);
      ctx.fillStyle = pt.color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = "#333";
    ctx.font = "bold 14px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    for (const f of state.floaters) {
      ctx.globalAlpha = clamp(f.life / 0.4, 0, 1);
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    drawMinimap();
  }

  function drawMinimap() {
    const s = mini.width;
    mctx.clearRect(0, 0, s, s);
    mctx.fillStyle = "rgba(210, 210, 210, 0.22)";
    mctx.fillRect(0, 0, s, s);
    const mapX = (x) => (x / WORLD.w) * s;
    const mapY = (y) => (y / WORLD.h) * s;
    mctx.fillStyle = "rgba(72, 72, 72, 0.48)";
    for (const w of state.walls) {
      mctx.fillRect(mapX(w.x), mapY(w.y), (w.w / WORLD.w) * s, (w.h / WORLD.h) * s);
    }
    const paintZone = (team, x, y, w, h) => {
      if (!TEAMS[team]) return;
      mctx.fillStyle = TEAMS[team].color;
      mctx.globalAlpha = 0.42;
      mctx.fillRect(mapX(x), mapY(y), (w / WORLD.w) * s, (h / WORLD.h) * s);
      mctx.globalAlpha = 1;
    };
    if (state.mode === "4tdm") {
      paintZone("blue", 0, BASE_W, BASE_W, WORLD.h - BASE_W * 2);
      paintZone("red", WORLD.w - BASE_W, BASE_W, BASE_W, WORLD.h - BASE_W * 2);
      paintZone("green", BASE_W, 0, WORLD.w - BASE_W * 2, BASE_W);
      paintZone("purple", BASE_W, WORLD.h - BASE_W, WORLD.w - BASE_W * 2, BASE_W);
    } else if (state.mode === "tdm") {
      paintZone("blue", 0, 0, BASE_W, WORLD.h);
      paintZone("red", WORLD.w - BASE_W, 0, BASE_W, WORLD.h);
    }
    for (const d of state.doms) {
      mctx.beginPath();
      mctx.arc(mapX(d.x), mapY(d.y), 7, 0, TAU);
      mctx.fillStyle = d.team && TEAMS[d.team] ? TEAMS[d.team].color : "#777";
      mctx.fill();
    }
    for (const t of assaultDoms()) {
      const col = t.destroyed ? "#777" : (TEAMS[t.team] ? TEAMS[t.team].color : "#777");
      const zr = assaultZoneR(t);
      const side = Math.max(10, (zr * 2 / WORLD.w) * s);
      mctx.fillStyle = col;
      mctx.globalAlpha = 0.28;
      mctx.fillRect(mapX(t.x) - side / 2, mapY(t.y) - side / 2, side, side);
      mctx.globalAlpha = 1;
      const sz = t.mainBase ? 9 : 6;
      mctx.fillStyle = col;
      mctx.fillRect(mapX(t.x) - sz / 2, mapY(t.y) - sz / 2, sz, sz);
    }
    if (state.mode === "assault" && state.assaultBlue) {
      mctx.fillStyle = TEAMS.blue.color;
      mctx.globalAlpha = 0.45;
      mctx.fillRect(mapX(state.assaultBlue.x) - 4, mapY(state.assaultBlue.y) - 4, 8, 8);
      mctx.globalAlpha = 1;
    }
    if (isRoyale()) {
      const c = stormCenter();
      const rr = (royaleRadius() / WORLD.w) * s;
      const stormOn = royaleLocked() && royaleRadius() < royaleMaxR() - 2;
      const mx = mapX(c.x);
      const my = mapY(c.y);
      if (stormOn) {
        mctx.beginPath();
        mctx.rect(0, 0, s, s);
        if (rr > 2) mctx.arc(mx, my, Math.max(2, rr), 0, TAU);
        mctx.fillStyle = "rgba(210, 64, 42, 0.32)";
        mctx.fill(rr > 2 ? "evenodd" : "nonzero");
      }
      if (rr > 2) {
        mctx.beginPath();
        mctx.arc(mx, my, Math.max(2, rr), 0, TAU);
        mctx.strokeStyle = "rgba(232, 72, 48, 0.9)";
        mctx.lineWidth = 2;
        mctx.stroke();
      }
    }
    const p = cameraFocus();
    const watching = state.spectating;
    const selfTank = state.player && state.player.alive ? state.player : null;
    for (const t of state.tanks) {
      if (!t.alive || t.closer || t.dominator) continue;
      const self = t === p || t === selfTank;
      if (self) continue;
      const ally = !!(p && t.team && p.team && t.team === p.team);
      const boss = !!t.mothership || !!t.boss || !!t.fodder;
      if (!watching && !ally && !boss && state.mode !== "assault" && state.mode !== "siege") continue;
      mctx.fillStyle = t.color;
      mctx.beginPath();
      mctx.arc(mapX(t.x), mapY(t.y), boss ? 6 : 3, 0, TAU);
      mctx.fill();
      if (boss) {
        mctx.strokeStyle = "#333";
        mctx.lineWidth = 1.2;
        mctx.stroke();
      }
    }
    if (selfTank) {
      mctx.beginPath();
      mctx.arc(mapX(selfTank.x), mapY(selfTank.y), 3.2, 0, TAU);
      mctx.fillStyle = "#111";
      mctx.fill();
    }
    if (spectateFree() && state.ghost) {
      mctx.beginPath();
      mctx.arc(mapX(state.ghost.x), mapY(state.ghost.y), 4, 0, TAU);
      mctx.strokeStyle = "#fff";
      mctx.lineWidth = 1.6;
      mctx.stroke();
    }
  }

  function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    try {
      if (running && !state.paused) update(dt);
      if (running) render();
      else {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = "#777b7e";
        ctx.fillRect(0, 0, width, height);
      }
    } catch (err) {
      console.error(err);
    }
    state.frames += 1;
    state.fpsT += Math.max(dt, 0.001);
    if (state.fpsT >= 0.4 && els.fps) {
      els.fps.textContent = `${(state.frames / state.fpsT).toFixed(0)} FPS`;
      state.frames = 0;
      state.fpsT = 0;
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", resize);
  }
  window.addEventListener("wheel", (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      return;
    }
    if (running && state.spectating) {
      e.preventDefault();
      bumpSpectateZoom(e.deltaY < 0 ? 1 : -1);
    }
  }, { passive: false });
  window.addEventListener("gesturestart", (e) => e.preventDefault());
  window.addEventListener("gesturechange", (e) => e.preventDefault());
  window.addEventListener("beforeunload", (e) => {
    if (!running) return;
    e.preventDefault();
    e.returnValue = "";
  });
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && (
      ["+", "-", "=", "_", "0"].includes(e.key)
      || ["Equal", "Minus", "Digit0", "NumpadAdd", "NumpadSubtract", "Numpad0"].includes(e.code)
    )) {
      e.preventDefault();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      handleEscape(e);
      return;
    }
    if (e.key === "Tab" && running && state.spectating) {
      e.preventDefault();
      cycleSpectate(e.shiftKey ? -1 : 1);
      return;
    }
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
    keys.add(k);
    if (e.code) keys.add(e.code.toLowerCase());
    if (running && state.spectating && (k === "+" || k === "=" || e.code === "NumpadAdd")) {
      e.preventDefault();
      bumpSpectateZoom(1);
      return;
    }
    if (running && state.spectating && (k === "-" || k === "_" || e.code === "NumpadSubtract")) {
      e.preventDefault();
      bumpSpectateZoom(-1);
      return;
    }
    if (tryDevCloserEgg(e)) {
      e.preventDefault();
      return;
    }
    if (k === "t" && !state.spectating) {
      openWorkshop();
      return;
    }
    if (state.paused || state.spectating) return;
    if (k === "e" && running) {
      state.autoFire = !state.autoFire;
      note(state.autoFire ? "Autofire enabled." : "Autofire disabled.");
    }
    if (k === "c" && running) {
      state.autoSpin = !state.autoSpin;
      note(state.autoSpin ? "Autospin enabled." : "Autospin disabled.");
    }
    const skippedLevel = k === "n" && running && !state.paused && (state.mode === "protect" || state.mode === "growth" || state.armsRace) && skipToLevelCap(menuTank());
    if (k === "h" && running && !state.paused && state.mode === "protect") {
      toggleMothershipControl();
    } else if (!skippedLevel) {
      const classIdx = CLASS_KEYS.indexOf(k);
      if (running && !state.paused && classIdx >= 0 && state.classOptions[classIdx] && !state.classDismissed) {
        pickClass(state.classOptions[classIdx]);
      } else if (k === "h" && running && !state.paused) {
        toggleMothershipControl();
      }
    }
    const n = parseInt(e.key, 10);
    if (running && !state.paused && n >= 1 && n <= 9) tryUpgrade(STATS[n - 1].key, keys.has("m"));
    if (running && !state.paused && e.key === "0") tryUpgrade(STATS[9].key, keys.has("m"));
  });
  window.addEventListener("keyup", (e) => {
    keys.delete(e.key.toLowerCase());
    if (e.code) keys.delete(e.code.toLowerCase());
  });
  window.addEventListener("blur", () => keys.clear());
  canvas.addEventListener("mousemove", pointerToGame);
  canvas.addEventListener("pointermove", pointerToGame);
  canvas.addEventListener("mousedown", (e) => {
    if (e.button === 0) mouse.down = true;
    if (e.button === 2) mouse.right = true;
  });
  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) mouse.down = false;
    if (e.button === 2) mouse.right = false;
  });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  let menuMode = "ffa";
  let menuTeam = "blue";
  const MODE_HINT = {
    ffa: "Everyone for themselves · start at 45 · kills pay 80–90% · respawn 15–20% · fresh server after 4 hours",
    ffazero: "Everyone for themselves · start at 0 · score can drop below 45 · kills pay 80–90% · respawn 15–20% · fresh server after 4 hours",
    tdm: "Red vs blue · random team · start at 45 · kills pay 80–90% · respawn 15–20% · fresh server after 4 hours",
    "4tdm": "Four bases · random team · start at 45 · fresh server after 4 hours",
    manhunt: "Everyone hunts #1 · hunted kill pays 95% · other kills 80–90% · respawn 15–20% · hunted gets a small boost · fresh server after 4 hours",
    teamhunt: "Hunted (red) vs every hunter (blue) · new #1 joins the hunted team · hunted kill pays 95% · other kills 80–90% · respawn 15–20% · fresh server after 4 hours",
    tag: "Shoot to convert · random team · start at 45 · win or 4 hours starts a fresh server",
    protect: "Two motherships roam · random team · start at 45 · [N] skip to 45 · [H] to take control · win or 4 hours starts a fresh server",
    maze: "FFA inside generated walls · start at 45 · fresh server after 4 hours",
    domination: "Capture 4 points · random team · start at 45 · win or 4 hours starts a fresh server",
    assault: "Blue attacks Green · smaller maze · capture zones · start at 45 · Green wins in 10:00 if they hold 3/4 · win or 4 hours starts a fresh server",
    siege: "Blue defends sanctuaries · waves of bosses · start at 45 · restore fallen sanctuaries by destroying them · win or 4 hours starts a fresh server",
    growth: "FFA · grow past 45 to 1000 · everyone starts at 45 · never below 45 · [N] skip to 45 · fresh server after 4 hours",
    onehp: "Everyone for themselves · 1 HP · no shields · health stats do nothing · medium map · start at 45 · fresh server after 4 hours",
    royale: "1 min prep · shrinking storm to a random point · closes fully · damage ramps · last tank wins · then a fresh server",
    royalemaze: "Same as Battle Royale · L / Y / zig clusters · open map · storm closes fully · then a fresh server",
    sandbox: "Level 45 · pick any tank · bots included · [T] swaps tanks without resetting · fresh server after 4 hours",
    armsrace: "FFA rules · expanded Arras class tree · hybrids, extra T4–T5 tanks at 45 · start at 45 · never below 45 · [N] skip to 45 · fresh server after 4 hours",
    "growth-ar": "Growth · Arms Race class tree · everyone starts at 45 · never below 45 · [N] skip to 45 · fresh server after 4 hours",
    "protect-ar": "Mothership Protect · Arms Race class tree · random team · start at 45 · [N] skip · [H] to take control · win or 4 hours starts a fresh server",
    "assault-ar": "Assault · Arms Race class tree · Blue attacks Green · capture zones · Green wins in 10:00 if they hold 3/4 · win or 4 hours starts a fresh server",
    "tdm-ar": "Red vs blue · Arms Race class tree · random team · start at 45 · kills pay 80–90% · respawn 15–20% · fresh server after 4 hours",
    "4tdm-ar": "Four bases · Arms Race class tree · random team · start at 45 · fresh server after 4 hours",
    "royalemaze-ar": "Royale Maze · Arms Race class tree · L / Y / zig clusters · storm closes fully · last tank wins · then a fresh server",
    "manhunt-ar": "Manhunt · Arms Race class tree · hunted kill pays 95% · other kills 80–90% · respawn 15–20% · fresh server after 4 hours",
    "teamhunt-ar": "Team Manhunt · Arms Race class tree · hunted vs hunter team · new #1 joins the hunted team · hunted kill pays 95% · other kills 80–90% · respawn 15–20% · fresh server after 4 hours",
  };

  function saveName(name) {
    try { localStorage.setItem("tankfield-name", String(name || "").slice(0, 16)); } catch (err) {}
  }

  function playSelected() {
    const name = (els.name && els.name.value.trim()) || "Unnamed Tank";
    saveName(name);
    const bots = menuBotCount;
    if (menuMode === "sandbox") {
      startGame(name, { sandbox: true, classId: "basic", botCount: bots });
      return;
    }
    const parsed = parseArmsKey(menuMode);
    startGame(name, { mode: parsed.mode, armsRace: parsed.arms, botCount: bots });
  }

  function openWorkshop() {
    if (window.TankWorkshop && typeof window.TankWorkshop.open === "function") window.TankWorkshop.open();
  }

  function setMenuMode(mode) {
    menuMode = mode;
    document.querySelectorAll(".server-row").forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
    const row = document.getElementById("team-row");
    if (row) row.classList.add("hidden");
    const hint = document.getElementById("mode-hint");
    if (hint) hint.textContent = MODE_HINT[menuMode] || "";
  }

  function setServerFilter(filter) {
    document.querySelectorAll(".server-filter").forEach((b) => b.classList.toggle("active", b.dataset.filter === filter));
    document.querySelectorAll(".server-row").forEach((row) => {
      const show = filter === "all" || row.dataset.group === filter;
      row.classList.toggle("hidden", !show);
    });
    const active = document.querySelector(".server-row.active");
    if (active && active.classList.contains("hidden")) {
      const first = document.querySelector(".server-row:not(.hidden)");
      if (first) setMenuMode(first.dataset.mode);
    }
  }

  if (els.start) {
    els.start.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      if (btn.id === "play-btn") playSelected();
      else if (btn.id === "workshop-btn") openWorkshop();
      else if (btn.id === "options-btn") {
        const panel = document.getElementById("options-panel");
        if (panel) panel.classList.toggle("hidden");
      } else if (btn.classList.contains("server-row")) {
        setMenuMode(btn.dataset.mode);
      } else if (btn.classList.contains("server-filter")) {
        setServerFilter(btn.dataset.filter);
      } else if (btn.classList.contains("team-chip")) {
        menuTeam = btn.dataset.team;
        document.querySelectorAll(".team-chip").forEach((b) => b.classList.toggle("selected", b === btn));
      }
    });
    els.start.addEventListener("dblclick", (e) => {
      const row = e.target.closest(".server-row");
      if (!row || row.classList.contains("hidden")) return;
      setMenuMode(row.dataset.mode);
      playSelected();
    });
  }

  if (els.name) {
    els.name.addEventListener("keydown", (e) => { if (e.key === "Enter") playSelected(); });
    els.name.addEventListener("change", () => saveName(els.name.value.trim()));
  }
  if (els.again) els.again.addEventListener("click", () => respawnPlayer());
  if (els.menu) els.menu.addEventListener("click", goToMenu);
  if (els.resume) els.resume.addEventListener("click", () => setUserPaused(false));
  if (els.pauseMenu) els.pauseMenu.addEventListener("click", goToMenu);
  if (els.spectateBtn) els.spectateBtn.addEventListener("click", beginSpectate);
  if (els.spectateNext) els.spectateNext.addEventListener("click", () => cycleSpectate(1));
  if (els.spectateFreeBtn) els.spectateFreeBtn.addEventListener("click", () => enterFreeCam(cameraFocus()));
  if (els.spectateAgain) els.spectateAgain.addEventListener("click", () => respawnPlayer());
  if (els.spectateMenu) els.spectateMenu.addEventListener("click", goToMenu);
  if (els.editInGame) els.editInGame.addEventListener("click", openWorkshop);
  if (els.skipUpgrade) {
    els.skipUpgrade.addEventListener("click", () => {
      state.classDismissed = true;
      renderClassPanel();
    });
  }
  if (els.showClasses) {
    els.showClasses.addEventListener("click", () => {
      state.classDismissed = false;
      renderClassPanel();
    });
  }

  window.TankfieldGame = {
    startGame,
    getDef,
    drawPreview,
    botCount: () => menuBotCount,
    applyToPlayer(def, opts = {}) {
      const p = state.player;
      if (!p || !p.alive || !def) return;
      const prevId = p.classId;
      const asCustom = !!(opts.custom || String(def.id || "").startsWith("custom"));
      if (asCustom) {
        p.customDef = TankCatalog.cloneDef(def);
        p.classId = def.id || "custom";
      } else {
        p.customDef = null;
        p.classId = def.id || "basic";
      }
      if (opts.maxStats) {
        for (const st of STATS) p.stats[st.key] = STAT_MAX;
      }
      applyLevel(p);
      if (p.classId !== prevId) clearOwnedShots(p);
      p.health = clamp(p.health, 0, p.maxHealth);
      p.shield = clamp(p.shield || 0, 0, p.maxShield || 0);
      try { renderStats(); } catch (err) {}
      try { renderClassPanel(); } catch (err) {}
      if (def.name && p.classId !== prevId) note(`You are now ${def.name}.`);
    },
    playing: () => running,
    applyLevel,
    COLORS,
    TEAM_COLORS,
    stats: STATS,
    state,
    catalogCount: () => TankCatalog.count(),
  };

  function initColorPicker() {
    const box = document.getElementById("color-picker");
    if (!box) return;
    const saved = localStorage.getItem("tankfield-color");
    if (saved && TEAM_COLORS.some((c) => c.hex === saved)) state.selectedColor = saved;
    box.innerHTML = TEAM_COLORS.map((c) =>
      `<button type="button" class="swatch${c.hex === state.selectedColor ? " selected" : ""}" data-hex="${c.hex}" title="${c.name}" style="background:${c.hex}"></button>`
    ).join("");
    box.addEventListener("click", (e) => {
      const btn = e.target.closest(".swatch");
      if (!btn) return;
      state.selectedColor = btn.dataset.hex;
      localStorage.setItem("tankfield-color", state.selectedColor);
      box.querySelectorAll(".swatch").forEach((el) => el.classList.toggle("selected", el === btn));
      if (state.mode === "sandbox" && state.player && state.player.alive) {
        state.player.color = state.selectedColor;
        renderClassPanel();
      }
    });
  }

  resize();
  initColorPicker();
  try {
    const savedName = localStorage.getItem("tankfield-name");
    if (savedName && els.name) els.name.value = savedName.slice(0, 16);
  } catch (err) {}
  function refreshBotCounts() {
    const n = menuBotCount;
    const label = n === 1 ? "1 bot" : `${n} bots`;
    document.querySelectorAll(".server-row").forEach((row) => {
      const count = row.querySelector(".srv-count");
      if (count) count.textContent = label;
    });
  }

  function setMenuBotCount(n) {
    menuBotCount = clampBotCount(n);
    if (els.botRange) els.botRange.value = String(menuBotCount);
    if (els.botNum) els.botNum.value = String(menuBotCount);
    refreshBotCounts();
    try { localStorage.setItem("tankfield-bots", String(menuBotCount)); } catch (err) {}
  }

  function bindBotCount() {
    if (els.botRange) {
      els.botRange.addEventListener("input", () => setMenuBotCount(els.botRange.value));
    }
    if (els.botNum) {
      els.botNum.addEventListener("input", () => {
        const raw = els.botNum.value;
        if (raw === "") return;
        setMenuBotCount(raw);
      });
      els.botNum.addEventListener("change", () => setMenuBotCount(els.botNum.value || BOT_DEFAULT));
      els.botNum.addEventListener("keydown", (e) => { if (e.key === "Enter") playSelected(); });
    }
  }
  bindBotCount();
  try {
    const savedBots = localStorage.getItem("tankfield-bots");
    if (savedBots != null) setMenuBotCount(savedBots);
    else refreshBotCounts();
  } catch (err) {
    refreshBotCounts();
  }
  state.camera.x = WORLD.w / 2;
  state.camera.y = WORLD.h / 2;
  last = performance.now();
  requestAnimationFrame(frame);
  els.name.focus();
})();
