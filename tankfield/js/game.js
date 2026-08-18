(() => {
  "use strict";

  const WORLD = { w: 4600, h: 4600 };
  const TAU = Math.PI * 2;
  const STAT_MAX = 7;
  const LEVEL_CAP = 45;
  const BASE_MOVE = 23.2;
  const SPEED_CAP = 110;
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
  };
  const BASE_W = 560;
  const FFA_CLOSE_AT = 300;
  const DOM_HOLD = 8;
  const TEAM4 = ["blue", "red", "green", "purple"];

  const STATS = [
    { key: "regen", name: "Health Regen", color: "#e85d9c" },
    { key: "maxHealth", name: "Max Health", color: "#e56b6b" },
    { key: "bodyDamage", name: "Body Damage", color: "#f28482" },
    { key: "bulletSpeed", name: "Bullet Speed", color: "#f6bd60" },
    { key: "bulletPen", name: "Bullet Pen", color: "#f2e863" },
    { key: "bulletDamage", name: "Bullet Damage", color: "#84d46c" },
    { key: "reload", name: "Reload", color: "#6cd4c5" },
    { key: "moveSpeed", name: "Movement", color: "#6cb6d4" },
  ];

  const BOT_NAMES = [
    "Hexa", "Pulse", "Nim", "Vex", "Orbit", "Kite", "Bolt", "Mara",
    "Pento", "Drift", "Nova", "Rook", "Jolt", "Sable", "Pike", "Wisp",
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
    skipUpgrade: document.getElementById("skip-upgrade"),
    showClasses: document.getElementById("show-classes"),
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
    spectateAgain: document.getElementById("spectate-again"),
    spectateMenu: document.getElementById("spectate-menu"),
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
    userPaused: false,
    spectating: false,
    spectateTarget: null,
    lastKiller: null,
    walls: [],
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

  function isEnemyTank(self, other) {
    if (!other || other === self || !other.alive || other.type !== "tank") return false;
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

  function xpForLevel(level) {
    let total = 0;
    for (let i = 1; i < level; i++) total += Math.round(4 + i * i * 1.15);
    return total;
  }

  function levelFromScore(score) {
    let level = 1;
    while (level < LEVEL_CAP && score >= xpForLevel(level + 1)) level++;
    return level;
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
      };
    }
    const s = tank.stats;
    const def = getDef(tank);
    const m = modsOf(def);
    const lvl = tank.level;
    const out = {
      maxHealth: (48 + s.maxHealth * 22 + lvl * 2.2) * (def.health || 1) * (m.health || 1),
      regen: 0.9 + s.regen * 1.35 + lvl * 0.02,
      bodyDamage: (7 + s.bodyDamage * 4.2) * (def.bodyDamage || 1),
      bulletSpeed: (7.2 + s.bulletSpeed * 1.15) * (def.bulletSpeed || 1),
      bulletPen: (1 + s.bulletPen * 0.55) * (def.bulletPen || 1),
      bulletDamage: (7 + s.bulletDamage * 3.1) * (def.bulletDamage || 1) * (m.damage || 1),
      reload: Math.max(0.08, (0.42 - s.reload * 0.038) * (def.reload || 1) / (m.reload || 1)),
      moveSpeed: (BASE_MOVE + s.moveSpeed * 0.4 - Math.min(lvl, 30) * 0.008) * (def.speed || 1) * (m.speed || 1),
      fov: (def.fov || 1) * (m.fov || 1),
      bulletSize: (def.bulletSize || 1) * (m.size || 1),
      maxDrones: def.maxDrones || 0,
    };
    if (tank && tank.mothership) {
      out.maxHealth = Math.max(14000, out.maxHealth);
      out.regen = Math.max(28, out.regen);
      out.fov = Math.max(out.fov, 1.45);
      out.maxDrones = Math.max(out.maxDrones, 28);
    }
    return out;
  }

  function skillPointsFor(level) { return Math.min(level - 1, 33); }
  function spentPoints(tank) { return STATS.reduce((n, st) => n + tank.stats[st.key], 0); }

  function detectBrowserZoom() {
    const inner = Math.max(1, window.innerWidth);
    const outer = window.outerWidth || inner;
    let sizeZ = outer / inner;
    if (!isFinite(sizeZ) || sizeZ < 0.25 || sizeZ > 5) sizeZ = 1;

    const dprNow = window.devicePixelRatio || 1;
    const pinch = (window.visualViewport && window.visualViewport.scale) || 1;
    const sizeSaysZoom = Math.abs(sizeZ - 1) >= 0.07;
    const looksNativeDpr = [1, 1.5, 2, 2.5, 3].some((n) => Math.abs(dprNow - n) < 0.04);
    const dprAgrees = Math.abs(dprNow - sizeZ) < 0.15
      || Math.abs(dprNow / 2 - sizeZ) < 0.15
      || Math.abs(dprNow * 2 - sizeZ) < 0.15;

    let z = 1;
    if (sizeSaysZoom && (dprAgrees || !looksNativeDpr)) z = sizeZ;
    if (Math.abs(pinch - 1) > 0.02) z *= pinch;
    const steps = [0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];
    let best = z;
    let bestD = Infinity;
    for (const s of steps) {
      const d = Math.abs(z - s);
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    if (bestD < 0.06) z = best;
    return clamp(z, 0.25, 5);
  }

  function applyAntiZoom() {
    pageZ = detectBrowserZoom();
    const root = document.documentElement;
    if (Math.abs(pageZ - 1) < 0.02) {
      pageZ = 1;
      root.style.transform = "";
      root.style.transformOrigin = "";
      root.style.width = "";
      root.style.height = "";
      return;
    }
    const inv = 1 / pageZ;
    root.style.transformOrigin = "0 0";
    root.style.transform = `scale(${inv})`;
    root.style.width = `${100 / inv}%`;
    root.style.height = `${100 / inv}%`;
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

  function awayFrom(x, y, minDist) {
    for (let i = 0; i < 24; i++) {
      const p = randomInWorld(120);
      if ((p.x - x) ** 2 + (p.y - y) ** 2 > minDist * minDist) return p;
    }
    return randomInWorld(120);
  }

  function hitsWall(x, y, r) {
    for (const w of state.walls) {
      const nx = clamp(x, w.x, w.x + w.w);
      const ny = clamp(y, w.y, w.y + w.h);
      const dx = x - nx;
      const dy = y - ny;
      if (dx * dx + dy * dy < r * r) return true;
    }
    return false;
  }

  function pushOutWalls(ent) {
    if (!state.walls.length) return false;
    let hit = false;
    for (const w of state.walls) {
      const nx = clamp(ent.x, w.x, w.x + w.w);
      const ny = clamp(ent.y, w.y, w.y + w.h);
      let dx = ent.x - nx;
      let dy = ent.y - ny;
      let d2 = dx * dx + dy * dy;
      if (d2 >= ent.r * ent.r) continue;
      hit = true;
      if (d2 < 1e-6) {
        const left = ent.x - w.x;
        const right = w.x + w.w - ent.x;
        const top = ent.y - w.y;
        const bot = w.y + w.h - ent.y;
        const m = Math.min(left, right, top, bot);
        if (m === left) { ent.x = w.x - ent.r; ent.vx = Math.min(0, ent.vx); }
        else if (m === right) { ent.x = w.x + w.w + ent.r; ent.vx = Math.max(0, ent.vx); }
        else if (m === top) { ent.y = w.y - ent.r; ent.vy = Math.min(0, ent.vy); }
        else { ent.y = w.y + w.h + ent.r; ent.vy = Math.max(0, ent.vy); }
        continue;
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
    }
    return hit;
  }

  function buildMaze() {
    const cols = 10;
    const rows = 10;
    const thick = 54;
    const pad = 70;
    const cellW = (WORLD.w - pad * 2) / cols;
    const cellH = (WORLD.h - pad * 2) / rows;
    const east = Array.from({ length: rows }, () => Array(cols).fill(true));
    const south = Array.from({ length: rows }, () => Array(cols).fill(true));
    const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
    const stack = [[0, 0]];
    seen[0][0] = true;
    while (stack.length) {
      const [r, c] = stack[stack.length - 1];
      const opts = [];
      if (r > 0 && !seen[r - 1][c]) opts.push([r - 1, c, "N"]);
      if (r < rows - 1 && !seen[r + 1][c]) opts.push([r + 1, c, "S"]);
      if (c > 0 && !seen[r][c - 1]) opts.push([r, c - 1, "W"]);
      if (c < cols - 1 && !seen[r][c + 1]) opts.push([r, c + 1, "E"]);
      if (!opts.length) {
        stack.pop();
        continue;
      }
      const [nr, nc, dir] = opts[irand(0, opts.length - 1)];
      if (dir === "E") east[r][c] = false;
      else if (dir === "W") east[r][nc] = false;
      else if (dir === "S") south[r][c] = false;
      else south[nr][c] = false;
      seen[nr][nc] = true;
      stack.push([nr, nc]);
    }
    for (let i = 0; i < 22; i++) {
      if (Math.random() < 0.5) east[irand(0, rows - 1)][irand(0, cols - 2)] = false;
      else south[irand(0, rows - 2)][irand(0, cols - 1)] = false;
    }
    const walls = [];
    const x0 = pad;
    const y0 = pad;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = x0 + c * cellW;
        const y = y0 + r * cellH;
        if (c < cols - 1 && east[r][c]) {
          walls.push({ x: x + cellW - thick / 2, y: y + 8, w: thick, h: cellH - 16 });
        }
        if (r < rows - 1 && south[r][c]) {
          walls.push({ x: x + 8, y: y + cellH - thick / 2, w: cellW - 16, h: thick });
        }
      }
    }
    state.walls = walls;
  }

  function spawnDoms() {
    const inset = 980;
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
    if (state.time - state.domHoldT >= DOM_HOLD) beginArenaClose();
  }

  function botCountFor(mode) {
    if (mode === "sandbox") return 0;
    if (mode === "maze") return 8;
    return 11;
  }

  function modeLabel(mode) {
    return ({
      ffa: "FFA",
      tdm: "2 Teams",
      "4tdm": "4 Teams",
      manhunt: "Manhunt",
      tag: "Tag",
      protect: "Protect",
      maze: "Maze",
      domination: "Domination",
      sandbox: "Sandbox",
    })[mode] || "FFA";
  }

  function pickStartTeam(mode, opts) {
    const t = opts.team;
    if (mode === "tdm" || mode === "domination") return t === "red" ? "red" : "blue";
    if (mode === "4tdm") return TEAM4.includes(t) ? t : "blue";
    if (mode === "tag" || mode === "protect") return t === "red" ? "red" : "green";
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
    };
    applyLevel(tank);
    tank.health = tank.maxHealth;
    return tank;
  }

  function applyLevel(tank) {
    const next = levelFromScore(tank.score);
    const gained = next > tank.level;
    tank.level = next;
    const m = modsOf(getDef(tank));
    tank.r = (20 + Math.min(tank.level, 45) * 0.18) * (m.size || 1);
    if (tank.mothership) tank.r = 82;
    if (tank.closer) tank.r = 46;
    const st = tankStats(tank);
    const ratio = tank.maxHealth > 0 ? tank.health / tank.maxHealth : 1;
    tank.maxHealth = st.maxHealth;
    if (gained) tank.health = tank.maxHealth;
    else tank.health = clamp(ratio * tank.maxHealth, 0, tank.maxHealth);
    return gained;
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
        ? { x: WORLD.w / 2 + rand(-420, 420), y: WORLD.h / 2 + rand(-420, 420) }
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

  function populateWorld() {
    state.shapes = [];
    for (let i = 0; i < 90; i++) state.shapes.push(createShape("square"));
    const starterTris = irand(1, 3);
    for (let i = 0; i < starterTris; i++) state.shapes.push(createShape("triangle"));
    state.shapes.push(createShape("pentagon"));
    if (state.mode !== "protect" && state.mode !== "maze") state.shapes.push(createShape("alpha"));
    for (let i = 0; i < 2; i++) state.shapes.push(createShape("crasher"));
  }

  function spawnBots() {
    const names = BOT_NAMES.slice().sort(() => Math.random() - 0.5);
    const teams = [];
    const mine = state.player && state.player.team;
    if (state.mode === "tdm" && mine) {
      const other = mine === "blue" ? "red" : "blue";
      for (let i = 0; i < 5; i++) teams.push(mine);
      for (let i = 0; i < 6; i++) teams.push(other);
    } else if (state.mode === "4tdm" && mine) {
      for (let i = 0; i < 2; i++) teams.push(mine);
      for (const team of TEAM4) {
        if (team === mine) continue;
        for (let i = 0; i < 3; i++) teams.push(team);
      }
    } else if (state.mode === "domination" && mine) {
      const other = mine === "blue" ? "red" : "blue";
      for (let i = 0; i < 5; i++) teams.push(mine);
      for (let i = 0; i < 6; i++) teams.push(other);
    } else if (state.mode === "tag" && mine) {
      const other = mine === "green" ? "red" : "green";
      for (let i = 0; i < 5; i++) teams.push(mine);
      for (let i = 0; i < 6; i++) teams.push(other);
    } else if (state.mode === "protect") {
      const own = mine || "green";
      const other = own === "red" ? "green" : "red";
      for (let i = 0; i < 5; i++) teams.push(own);
      for (let i = 0; i < 6; i++) teams.push(other);
    }
    const nBots = teams.length || botCountFor(state.mode);
    for (let i = 0; i < nBots; i++) {
      const team = teams[i] || null;
      const score = irand(0, 1800);
      const bot = createTank({
        name: names[i % names.length],
        ai: true,
        score,
        classId: "basic",
        team,
        color: colorFor({ team }),
        pos: (state.mode === "tdm" || state.mode === "4tdm") && team
          ? spawnInBase(team)
          : state.mode === "protect" && mothershipOf(team)
            ? around(mothershipOf(team).x, mothershipOf(team).y, 220)
            : state.mode === "domination"
              ? awayFrom(WORLD.w / 2, WORLD.h / 2, 400)
              : awayFrom(WORLD.w / 2, WORLD.h / 2, 500),
      });
      autoUpgradeBot(bot);
      bot.health = bot.maxHealth;
      state.tanks.push(bot);
    }
  }

  function autoUpgradeBot(bot) {
    applyLevel(bot);
    const available = skillPointsFor(bot.level) - spentPoints(bot);
    const focus = [
      ["bulletDamage", "reload", "bulletSpeed", "maxHealth", "moveSpeed"],
      ["maxHealth", "regen", "bodyDamage", "moveSpeed", "bulletDamage"],
      ["reload", "bulletSpeed", "bulletPen", "bulletDamage", "moveSpeed"],
    ][irand(0, 2)];
    let left = available;
    while (left > 0) {
      const key = focus[irand(0, focus.length - 1)];
      if (bot.stats[key] < STAT_MAX) {
        bot.stats[key]++;
        left--;
      } else if (!focus.some((k) => bot.stats[k] < STAT_MAX)) {
        const any = STATS.find((s) => bot.stats[s.key] < STAT_MAX);
        if (!any) break;
        bot.stats[any.key]++;
        left--;
      }
    }
    const seen = new Set();
    while (!seen.has(bot.classId)) {
      seen.add(bot.classId);
      const def = TankCatalog.get(bot.classId);
      const opts = (def.upgrades || []).filter((id) => {
        const child = TankCatalog.tanks[id];
        return child && bot.level >= (child.needLevel || 15);
      });
      if (!opts.length) break;
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

  function sidePos(side, pad = 360) {
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
    if (tank.mothership) tank.r = 82;
    if (tank.closer) tank.r = 46;
  }

  function skipToLevelCap(tank) {
    if (!tank || !tank.alive || tank.mothership || tank.closer) return false;
    if (tank.level >= LEVEL_CAP) return false;
    tank.score = Math.max(tank.score, xpForLevel(LEVEL_CAP));
    applyLevel(tank);
    tank.health = tank.maxHealth;
    state.classDismissed = false;
    try { renderStats(); } catch (err) {}
    try { renderClassPanel(); } catch (err) {}
    floater(tank.x, tank.y - tank.r - 8, "Level 45");
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
    try { renderStats(); } catch (err) {}
    try { renderClassPanel(); } catch (err) {}
  }

  function startGame(name, opts = {}) {
    try {
    state.spawnName = name || "Unnamed Tank";
    state.playOpts = opts;
    state.mode = opts.sandbox ? "sandbox" : (opts.mode || "ffa");
    state.tanks = [];
    state.bullets = [];
    state.particles = [];
    state.floaters = [];
    state.walls = [];
    state.doms = [];
    state.domHold = null;
    state.domHoldT = 0;
    state.autoFire = false;
    state.autoSpin = false;
    state.time = 0;
    state.paused = false;
    state.userPaused = false;
    state.spectating = false;
    state.spectateTarget = null;
    state.lastKiller = null;
    state.alphaRespawnAt = 0;
    state.pentagonAt = rand(30, 60);
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
    if (state.mode === "maze") buildMaze();
    if (state.mode === "domination") spawnDoms();
    populateWorld();
    const team = pickStartTeam(state.mode, opts);
    if (state.mode === "protect") spawnMotherships();
    const home = team ? mothershipOf(team) : null;
    const player = createTank({
      name: state.spawnName,
      team,
      color: colorFor({ team, player: true }),
      classId: opts.classId || "basic",
      customDef: opts.customDef || null,
      score: opts.sandbox ? xpForLevel(LEVEL_CAP) : 0,
      pos: (state.mode === "tdm" || state.mode === "4tdm") && team
        ? spawnInBase(team)
        : home
          ? around(home.x, home.y, 220)
          : awayFrom(WORLD.w / 2, WORLD.h / 2, 700),
    });
    player.ai = false;
    player.spawnProtect = 30;
    if (opts.maxStats && state.mode !== "protect") maxOutTank(player);
    if (state.mode === "protect") {
      player.score = 0;
      for (const st of STATS) player.stats[st.key] = 0;
      applyLevel(player);
      player.health = player.maxHealth;
    }
    state.player = player;
    state.pilotTank = player;
    state.tanks.push(player);
    spawnBots();
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
    els.hud.classList.remove("hidden");
    const ws = document.getElementById("workshop");
    if (ws) ws.classList.add("hidden");
    const colorBox = document.getElementById("sandbox-colors");
    if (colorBox) colorBox.classList.toggle("hidden", state.mode !== "sandbox");
    if (els.arenaMode) els.arenaMode.textContent = modeLabel(state.mode);
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
    tank.deadHandled = true;
    tank.alive = false;
    clearOwnedShots(tank);
    burst(tank.x, tank.y, tank.color, 18, 220);
    const huntedBonus = state.mode === "manhunt" && tank === state.hunted ? Math.max(80, Math.floor(tank.score * 0.2)) : 0;
    const pool = Math.max(20, Math.floor(tank.score * 0.45) + 20) + huntedBonus;
    const credited = splitKillScore(tank, pool, killer, tank.x, tank.y);
    tank.killedBy = cause || (credited ? credited.name : killer ? killer.name : "a polygon");
    if (credited) {
      state.lastKiller = credited;
      credited.kills = (credited.kills || 0) + 1;
      if (huntedBonus) floater(tank.x, tank.y - 24, "Hunted down");
    }
    if (tank === state.player) {
      if (tank.mothership) {
        const body = state.pilotTank;
        checkProtectClose();
        if (body && body.alive && body !== tank) {
          body.ai = false;
          state.player = body;
          shake = 10;
          floater(body.x, body.y - 18, "Mothership down");
        } else {
          shake = 14;
          showDeath(tank);
        }
      } else if (state.mode === "protect" && mothershipOf(tank.team) && !state.closing) {
        shake = 10;
        const team = tank.team;
        setTimeout(() => {
          if (!running || state.closing || !mothershipOf(team)) return;
          const home = mothershipOf(team);
          const p = createTank({
            name: state.spawnName,
            ai: false,
            classId: "basic",
            team,
            color: TEAMS[team].color,
            score: 0,
            pos: around(home.x, home.y, 220),
          });
          p.spawnProtect = 8;
          state.player = p;
          state.pilotTank = p;
          state.tanks.push(p);
          try { renderStats(); } catch (err) {}
          try { renderClassPanel(); } catch (err) {}
        }, 1400);
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
    } else if (!tank.closer && !state.closing) {
      const team = tank.team;
      setTimeout(() => {
        if (!running || state.closing) return;
        const score = irand(0, 400);
        const bot = createTank({
          name: tank.name,
          ai: true,
          score,
          classId: "basic",
          team,
          color: colorFor({ team }),
          pos: (state.mode === "tdm" || state.mode === "4tdm") && team
            ? spawnInBase(team)
            : state.mode === "protect" && mothershipOf(team)
              ? around(mothershipOf(team).x, mothershipOf(team).y, 220)
              : awayFrom(WORLD.w / 2, WORLD.h / 2, 900),
        });
        autoUpgradeBot(bot);
        bot.health = bot.maxHealth;
        bot.spawnProtect = 8;
        state.tanks.push(bot);
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
      if (!tank.alive || tank.closer) continue;
      shares.push({ tank, amt });
      sum += amt;
    }
    return { shares, sum };
  }

  function splitKillScore(target, total, fallback, x, y) {
    total = Math.max(0, Math.floor(total));
    const claimable = (t) => t && t.alive && !t.closer;
    if (total <= 0) return claimable(fallback) ? fallback : null;
    const { shares, sum } = damageShares(target);
    if (sum <= 0 || !shares.length) {
      const fb = claimable(fallback) ? fallback : null;
      if (fb) giveScore(fb, total, x, y);
      return fb;
    }
    shares.sort((a, b) => b.amt - a.amt);
    const parts = shares.map((s) => ({ tank: s.tank, n: Math.floor(total * (s.amt / sum)) }));
    let used = 0;
    for (const p of parts) used += p.n;
    parts[0].n += total - used;
    for (const p of parts) {
      if (p.n > 0) giveScore(p.tank, p.n, x, y);
    }
    return parts[0].tank;
  }

  function showDeath(tank) {
    const best = Math.max(tank.score, Number(localStorage.getItem("tankfield-best") || 0));
    localStorage.setItem("tankfield-best", String(best));
    els.deathMsg.textContent = `Destroyed by ${tank.killedBy}.`;
    els.deathStats.textContent = `Score ${Math.floor(tank.score)}  ·  Level ${tank.level}  ·  ${getDef(tank).name}`;
    els.bestScore.textContent = `Best score: ${Math.floor(best)}`;
    els.death.classList.remove("hidden");
  }

  function spectateList() {
    return state.tanks.filter((t) => t.alive && !t.closer);
  }

  function cameraFocus() {
    if (state.spectating && state.spectateTarget && state.spectateTarget.alive) return state.spectateTarget;
    if (state.player && state.player.alive) return state.player;
    return spectateList()[0] || state.player;
  }

  function beginSpectate() {
    if (!running) return;
    state.spectating = true;
    els.death.classList.add("hidden");
    if (els.pause) els.pause.classList.add("hidden");
    state.userPaused = false;
    const ws = document.getElementById("workshop");
    state.paused = !!(ws && !ws.classList.contains("hidden"));
    const list = spectateList();
    const killer = state.lastKiller && state.lastKiller.alive ? state.lastKiller : null;
    state.spectateTarget = killer || list[0] || null;
    if (els.spectateBar) els.spectateBar.classList.remove("hidden");
    updateSpectateLabel();
    try { renderClassPanel(); } catch (err) {}
  }

  function cycleSpectate(dir) {
    const list = spectateList();
    if (!list.length) return;
    let i = list.indexOf(state.spectateTarget);
    if (i < 0) i = 0;
    i = (i + dir + list.length) % list.length;
    state.spectateTarget = list[i];
    updateSpectateLabel();
  }

  function updateSpectateLabel() {
    const t = state.spectateTarget;
    if (els.spectateLabel) els.spectateLabel.textContent = t && t.alive ? `Spectating ${t.name}` : "Spectating";
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
    if (els.pause) els.pause.classList.add("hidden");
    if (els.spectateBar) els.spectateBar.classList.add("hidden");
    els.death.classList.add("hidden");
    els.hud.classList.add("hidden");
    els.start.classList.remove("hidden");
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

  function unitOf(tank) { return tank.r / 12; }

  function gunAngle(tank, gun, index) {
    if (gun.type === "auto") return tank.turretAim[index] || tank.angle;
    return tank.angle + (gun.pos[5] * Math.PI) / 180;
  }

  function applyRecoil(tank, gun, kind, st, width, ang) {
    if (!tank || tank.closer || tank.mothership) return;
    if (gun.type === "deco") return;
    let rec = gun.recoil;
    if (rec == null) {
      if (gun.type === "auto") rec = 0.2;
      else if (kind === "drone" || kind === "swarm") rec = 0.12;
      else if (kind === "trap") rec = 0.45;
      else rec = 1;
    }
    const widthMul = Math.max(0.4, (width || 8) / 8);
    const sizeMul = st.bulletSize || 1;
    const mass = Math.max(0.5, (tank.r / 22) ** 2);
    const kick = rec * widthMul * sizeMul * 64 / mass;
    tank.vx -= Math.cos(ang) * kick;
    tank.vy -= Math.sin(ang) * kick;
  }

  function countOwned(kind, owner) {
    let n = 0;
    for (const b of state.bullets) if (b.alive && b.owner === owner && b.kind === kind) n++;
    return n;
  }

  function spawnShot(tank, gun, index, st) {
    const u = unitOf(tank);
    const [L, W, A, X, Y] = gun.pos;
    const ang = gunAngle(tank, gun, index) + rand(-(gun.spread || 0), gun.spread || 0);
    const px = -Math.sin(ang);
    const py = Math.cos(ang);
    const ox = Math.cos(ang) * (X + L) * u + px * Y * u;
    const oy = Math.sin(ang) * (X + L) * u + py * Y * u;
    if (tank.team) {
      const z = zoneAt(tank.x + ox, tank.y + oy);
      if (z && z !== tank.team) return;
    }
    const kind = gun.type === "auto" ? "bullet" : gun.type;
    const gs = gun.stats || {};
    const speedMul = gs.speed || (kind === "trap" ? 0.45 : kind === "drone" || kind === "swarm" ? 0.7 : kind === "missile" ? 0.55 : 1);
    const speed = st.bulletSpeed * 58 * speedMul;
    applyRecoil(tank, gun, kind, st, W, ang);
    const sizeMul = gun.size || gs.size || (kind === "swarm" ? 0.55 : kind === "trap" ? 1.15 : 1);
    const lifeBase = kind === "trap" ? 9 : kind === "drone" || kind === "swarm" ? 999 : kind === "missile" ? 2.4 : 1.55 + st.fov * 0.15;
    let br = (7.2 * st.bulletSize * sizeMul) * (0.85 + tank.r / 40);
    if (tank.mothership && kind !== "drone" && kind !== "swarm") br = 8.2 * st.bulletSize * sizeMul;
    if (tank.closer) br = 26;
    let orbit = rand(0, TAU);
    if (kind === "drone" || kind === "swarm") orbit = countOwned(kind, tank) * 2.39996;
    state.bullets.push({
      x: tank.x + ox,
      y: tank.y + oy,
      vx: Math.cos(ang) * speed + tank.vx * 0.15,
      vy: Math.sin(ang) * speed + tank.vy * 0.15,
      r: br,
      health: st.bulletPen * (kind === "trap" ? 3.2 : kind === "drone" ? 2.2 : 1),
      damage: st.bulletDamage * (gs.damage || (kind === "swarm" ? 0.55 : 1)),
      life: lifeBase * (gs.life || 1),
      color: tank.color,
      owner: tank,
      kind,
      angle: ang,
      orbit,
      age: 0,
      alive: true,
    });
  }

  function wantsFire(tank) {
    if (tank.mothership) return true;
    if (tank.ai) return tank.aiState === "attack" || tank.aiState === "farm" || tank.aiState === "defend";
    return mouse.down || state.autoFire || keys.has(" ");
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
      if (!autoGun && !fire) continue;
      if (autoGun && !nearest(tank, [...state.tanks, ...state.shapes], 520, (o) => o !== tank && o.alive && (o.type !== "tank" || isEnemyTank(tank, o)))) continue;
      if (tank.gunCd[i] > 0) continue;
      if ((gun.type === "drone" || gun.type === "swarm") && countOwned(gun.type, tank) >= Math.max(1, st.maxDrones)) continue;
      tank.gunCd[i] = st.reload * (0.65 + (gun.pos[6] || 0));
      if (!autoGun) breakSpawnProtect(tank);
      spawnShot(tank, gun, i, st);
    }
  }

  function updateTurrets(tank, dt) {
    const guns = getDef(tank).guns || [];
    const target = nearest(tank, state.tanks.concat(state.shapes), 640, (o) => o !== tank && o.alive && (o.type !== "tank" || isEnemyTank(tank, o)));
    if (!tank.turretAim) tank.turretAim = [];
    for (let i = 0; i < guns.length; i++) {
      const gun = guns[i];
      const base = tank.angle + (gun.pos[5] * Math.PI) / 180;
      if (gun.type !== "auto") {
        tank.turretAim[i] = base;
        continue;
      }
      let want = base;
      if (target) want = Math.atan2(target.y - tank.y, target.x - tank.x);
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
    const want = { square: 90 };
    for (const kind of Object.keys(want)) {
      while (counts[kind] < want[kind]) {
        state.shapes.push(createShape(kind));
        counts[kind]++;
      }
    }
    if (state.time >= state.pentagonAt) {
      if (counts.pentagon < 6) {
        state.shapes.push(createShape("pentagon"));
        counts.pentagon++;
      }
      state.pentagonAt = state.time + rand(30, 60);
    }
    if (state.time >= state.triangleAt) {
      const n = irand(1, 5);
      for (let i = 0; i < n && counts.triangle < 12; i++) {
        state.shapes.push(createShape("triangle"));
        counts.triangle++;
      }
      state.triangleAt = state.time + rand(60, 180);
    }
    if (state.time >= (state.crasherAt || 0)) {
      if (counts.crasher < 4) {
        state.shapes.push(createShape("crasher"));
        counts.crasher++;
      }
      state.crasherAt = state.time + rand(60, 120);
    }
    if (counts.alpha < 1 && state.mode !== "protect" && state.mode !== "maze" && state.alphaRespawnAt > 0 && state.time >= state.alphaRespawnAt) {
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
    if (by.alive) giveScore(by, 35, target.x, target.y);
    checkTagVictory();
    return true;
  }

  function beginArenaClose() {
    if (state.closing) return;
    state.closing = true;
    state.closeAt = state.time + 2.2;
    const p = state.player;
    if (p && p.alive) floater(p.x, p.y - 28, "Arena closing");
  }

  function checkTagVictory() {
    if (state.mode !== "tag" || state.closing) return;
    const living = state.tanks.filter((t) => t.alive && !t.closer);
    const teams = new Set(living.map((t) => t.team).filter(Boolean));
    if (living.length < 1 || teams.size !== 1) return;
    beginArenaClose();
  }

  function checkProtectClose() {
    if (state.mode !== "protect" || state.closing) return;
    const alive = state.tanks.filter((t) => t.mothership && t.alive);
    if (alive.length >= 2) return;
    beginArenaClose();
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
  }

  function tryTagHit(target, src) {
    if (state.mode !== "tag") return false;
    if (!target || target.type !== "tank" || !src || src.type !== "tank") return false;
    if (target.closer || src.closer) return false;
    if (isEnemyTank(src, target)) tagTank(target, src);
    return true;
  }

  function refreshHunted() {
    if (state.mode !== "manhunt") {
      state.hunted = null;
      return;
    }
    const alive = state.tanks.filter((t) => t.alive);
    if (!alive.length) {
      state.hunted = null;
      return;
    }
    alive.sort((a, b) => b.score - a.score);
    const lead = alive[0];
    if (!lead || lead.score <= 0) {
      state.hunted = null;
      return;
    }
    const tied = alive.filter((t) => t.score === lead.score);
    const next = (state.hunted && state.hunted.alive && tied.includes(state.hunted)) ? state.hunted : lead;
    if (next !== state.hunted) {
      state.hunted = next;
      if (next) floater(next.x, next.y - 18, "HUNTED");
    }
  }

  function updateAI(tank, dt) {
    tank.aiT -= dt;
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
    if (tank.mothership) {
      const prey = nearest(tank, state.tanks, 2800, (t) => isEnemyTank(tank, t));
      tank.aiState = "attack";
      if (prey) {
        tank.angle = Math.atan2(prey.y - tank.y, prey.x - tank.x);
        const st = tankStats(tank);
        tank.vx += Math.cos(tank.angle) * st.moveSpeed * 62 * dt;
        tank.vy += Math.sin(tank.angle) * st.moveSpeed * 62 * dt;
      } else {
        tank.angle += 0.42 * dt;
      }
      updateTurrets(tank, dt);
      shoot(tank, dt);
      return;
    }
    const mark = state.hunted;
    const hunting = state.mode === "manhunt" && mark && mark.alive && mark !== tank;
    const huntedSelf = state.mode === "manhunt" && mark === tank;
    const ownMoth = mothershipOf(tank.team);
    const foeMoth = state.tanks.find((t) => t.mothership && t.alive && t.team && t.team !== tank.team) || null;
    const defending = state.mode === "protect" && ownMoth;
    const assaulting = state.mode === "protect" && foeMoth;
    let enemy = hunting
      ? mark
      : assaulting
        ? (nearest(tank, state.tanks, 380, (t) => isEnemyTank(tank, t) && !t.mothership) || foeMoth)
        : nearest(tank, state.tanks, state.mode === "tag" || state.mode === "protect" ? 1400 : 720, (t) => isEnemyTank(tank, t));
    const closerNear = nearest(tank, state.tanks, 980, (t) => t.closer);
    const shape = nearest(tank, state.shapes, 900, (s) => s.kind !== "alpha" || tank.level >= 20);
    const low = tank.health < tank.maxHealth * 0.34;
    const zone = zoneAt(tank.x, tank.y);
    const invading = !!(tank.team && zone && zone !== tank.team);
    const hunterNear = huntedSelf ? nearest(tank, state.tanks, 640, (t) => t !== tank) : null;
    if (closerNear) tank.aiState = "flee";
    else if (invading || ((state.mode === "tdm" || state.mode === "4tdm") && tank.team && low)) tank.aiState = "home";
    else if (huntedSelf && hunterNear && dist2(tank, hunterNear) < 480 * 480) tank.aiState = "flee";
    else if (low && enemy && state.mode !== "tag" && !assaulting) tank.aiState = "flee";
    else if (hunting || (state.mode === "tag" && enemy) || assaulting) tank.aiState = "attack";
    else if (defending && enemy && dist2(tank, enemy) < 520 * 520) tank.aiState = "attack";
    else if (defending) tank.aiState = "defend";
    else if (enemy && dist2(tank, enemy) < 380 * 380) tank.aiState = "attack";
    else if (shape) tank.aiState = "farm";
    else tank.aiState = "wander";

    let tx = tank.x;
    let ty = tank.y;
    if (tank.aiState === "home" && tank.team) {
      const home = baseCenter(tank.team);
      tx = home.x;
      ty = home.y;
      if (enemy) tank.angle = Math.atan2(enemy.y - tank.y, enemy.x - tank.x);
    } else if (tank.aiState === "attack" && enemy) {
      const ez = zoneAt(enemy.x, enemy.y);
      if (ez && ez === enemy.team) {
        const edge = baseCenter(ez);
        tx = ez === "blue" ? BASE_W + 140 : ez === "red" ? WORLD.w - BASE_W - 140 : edge.x;
        ty = ez === "green" ? BASE_W + 140 : ez === "purple" ? WORLD.h - BASE_W - 140 : enemy.y;
      } else {
        tx = enemy.x;
        ty = enemy.y;
      }
      tank.angle = Math.atan2(enemy.y - tank.y, enemy.x - tank.x);
    } else if (tank.aiState === "defend" && ownMoth) {
      const a = (tank.wanderA || 0) + state.time * 0.55;
      tx = ownMoth.x + Math.cos(a) * 250;
      ty = ownMoth.y + Math.sin(a) * 250;
      if (enemy) tank.angle = Math.atan2(enemy.y - tank.y, enemy.x - tank.x);
      else tank.angle = Math.atan2(ty - tank.y, tx - tank.x);
    } else if (tank.aiState === "flee" && (closerNear || hunterNear || enemy)) {
      const from = closerNear || hunterNear || enemy;
      tx = tank.x * 2 - from.x; ty = tank.y * 2 - from.y;
      tank.angle = Math.atan2(from.y - tank.y, from.x - tank.x);
    } else if (tank.aiState === "farm" && shape) {
      tx = shape.x; ty = shape.y;
      tank.angle = Math.atan2(ty - tank.y, tx - tank.x);
    } else if (tank.aiT <= 0) {
      tank.aiT = rand(1.2, 3);
      tank.wanderA = rand(0, TAU);
    }
    if (tank.aiState === "wander") {
      tx = tank.x + Math.cos(tank.wanderA || 0) * 200;
      ty = tank.y + Math.sin(tank.wanderA || 0) * 200;
      tank.angle = tank.wanderA || tank.angle;
    }
    if (!hunting && !huntedSelf && !assaulting && tank.aiState !== "flee" && player && player.alive && isEnemyTank(tank, player) && dist2(tank, player) < 520 * 520 && Math.random() < 0.4 && tank.aiState !== "home") {
      tank.aiState = "attack";
      tank.angle = Math.atan2(player.y - tank.y, player.x - tank.x);
      tx = player.x; ty = player.y;
    }
    if ((state.mode === "tdm" || state.mode === "4tdm") && tank.team && tank.aiState !== "home") {
      const destZone = zoneAt(tx, ty);
      if (destZone && destZone !== tank.team) {
        const home = baseCenter(tank.team);
        tx = home.x;
        ty = tank.y;
      }
    }
    const st = tankStats(tank);
    const pace = (state.player && state.player.alive ? tankStats(state.player).moveSpeed : st.moveSpeed);
    const ang = Math.atan2(ty - tank.y, tx - tank.x);
    tank.vx += Math.cos(ang) * pace * 62 * dt;
    tank.vy += Math.sin(ang) * pace * 62 * dt;
    breakSpawnProtect(tank);
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
    const p = cameraFocus();
    const fov = p ? tankStats(p).fov : 1;
    const zoom = cam.zoom / fov;
    return { x: cam.x + (sx - width / 2) / zoom, y: cam.y + (sy - height / 2) / zoom };
  }

  function massOf(ent) {
    if (ent.kind === "alpha") return 48000;
    if (ent.kind === "pentagon") return 1400;
    if (ent.kind === "triangle") return 90;
    if (ent.kind === "crasher") return 55;
    if (ent.kind === "square") return 70;
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

  function damage(target, amount, src) {
    if (!target.alive) return;
    if (target.closer && src && (src.closer || (src.owner && src.owner.closer))) return;
    if (tryTagHit(target, src)) return;
    if (target.spawnProtect > 0 && !(src && src.closer)) return;
    if (src && src.spawnProtect > 0 && !src.closer) return;
    const taken = Math.min(amount, Math.max(0, target.health));
    if (taken > 0) creditDamage(target, taken, src);
    target.health -= amount;
    if (target.type === "tank") target.bodyHitT = 0.08;
    if (target === state.player) shake = Math.max(shake, Math.min(10, amount * 0.25));
    if (target.health <= 0) {
      target.alive = false;
      burst(target.x, target.y, target.color, target.kind === "alpha" ? 36 : 12, 180);
      if (target.kind === "alpha") state.alphaRespawnAt = state.time + rand(60, 120);
      if (target.type === "shape") splitKillScore(target, target.score, src, target.x, target.y);
      else if (target.type === "tank") killTank(target, src);
    }
  }

  function droneTarget(b) {
    const owner = b.owner;
    if (!owner || !owner.alive) return null;
    const spread = b.kind === "swarm" ? 24 : 34;
    const ox = Math.cos(b.orbit) * spread;
    const oy = Math.sin(b.orbit) * spread;
    if (!owner.ai) {
      if (mouse.down || mouse.right || state.autoFire) {
        const aim = screenToWorld(mouse.x, mouse.y);
        return { x: aim.x + ox, y: aim.y + oy };
      }
      return {
        x: owner.x + Math.cos(state.time * 1.7 + b.orbit) * 80,
        y: owner.y + Math.sin(state.time * 1.7 + b.orbit) * 80,
      };
    }
    const prey = nearest(owner, state.tanks.concat(state.shapes), 700, (o) => o !== owner && (o.type !== "tank" || isEnemyTank(owner, o)));
    if (prey) return { x: prey.x + ox, y: prey.y + oy };
    return {
      x: owner.x + Math.cos(state.time * 1.7 + b.orbit) * 80,
      y: owner.y + Math.sin(state.time * 1.7 + b.orbit) * 80,
    };
  }

  function separateFlocks() {
    const flock = [];
    for (const b of state.bullets) {
      if (b.alive && (b.kind === "drone" || b.kind === "swarm")) flock.push(b);
    }
    for (let i = 0; i < flock.length; i++) {
      const a = flock[i];
      for (let j = i + 1; j < flock.length; j++) {
        const b = flock[j];
        if (a.owner !== b.owner && !sameTeam(a.owner, b.owner)) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const min = a.r + b.r + 8;
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
    state.time += dt;
    shake = Math.max(0, shake - dt * 18);
    refreshHunted();
    if (state.mode === "tag") checkTagVictory();
    if (state.mode === "protect") checkProtectClose();
    if (state.mode === "ffa" && !state.closing && state.time >= FFA_CLOSE_AT) beginArenaClose();
    updateDoms(dt);
    if (state.closing && !state.closersSpawned && state.time >= state.closeAt) spawnArenaClosers();
    if (!state.spectating) updatePlayer(dt);

    for (const tank of state.tanks) {
      if (!tank.alive) continue;
      if (tank.ai) updateAI(tank, dt);
      tank.vx *= Math.pow(0.0008, dt);
      tank.vy *= Math.pow(0.0008, dt);
      const spd = Math.hypot(tank.vx, tank.vy);
      const st = tankStats(tank);
      let cap = st.moveSpeed * SPEED_CAP;
      if (tank.ai && !tank.closer && !tank.mothership && state.player && state.player.alive && !state.player.mothership) {
        cap = tankStats(state.player).moveSpeed * SPEED_CAP * 0.95;
      }
      if (tank.closer) cap = tankStats(tank).moveSpeed * SPEED_CAP * 1.35;
      if (spd > cap) { tank.vx *= cap / spd; tank.vy *= cap / spd; }
      tank.x += tank.vx * dt;
      tank.y += tank.vy * dt;
      tank.x = clamp(tank.x, tank.r, WORLD.w - tank.r);
      tank.y = clamp(tank.y, tank.r, WORLD.h - tank.r);
      pushOutWalls(tank);
      tank.bodyHitT = Math.max(0, tank.bodyHitT - dt);
      if (tank.spawnProtect > 0) tank.spawnProtect = Math.max(0, tank.spawnProtect - dt);
      const invading = tank.team && zoneAt(tank.x, tank.y) && zoneAt(tank.x, tank.y) !== tank.team;
      if (invading) {
        tank.health -= tank.maxHealth * 0.32 * dt;
        tank.bodyHitT = 0.08;
        if (tank === state.player) shake = Math.max(shake, 4);
        if (tank.health <= 0) killTank(tank, null, `the ${zoneAt(tank.x, tank.y)} base`);
      } else {
        tank.health = Math.min(tank.maxHealth, tank.health + st.regen * dt);
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
        const prey = nearest(s, state.tanks, 980, (t) => !t.spawnProtect && !zoneAt(t.x, t.y));
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
      if (b.owner && !b.owner.alive && (b.kind === "trap" || b.kind === "drone" || b.kind === "swarm" || b.kind === "missile")) {
        b.alive = false;
        continue;
      }
      if (b.kind === "drone" || b.kind === "swarm") {
        if (!b.owner || !b.owner.alive) { b.alive = false; continue; }
        const t = droneTarget(b);
        if (t) {
          const a = Math.atan2(t.y - b.y, t.x - b.x);
          const spd = b.kind === "swarm" ? 280 : 220;
          b.vx = lerp(b.vx, Math.cos(a) * spd, 0.14);
          b.vy = lerp(b.vy, Math.sin(a) * spd, 0.14);
          b.angle = a;
        }
        b.life = 10;
      } else if (b.kind === "trap") {
        if (b.age > 0.35) {
          b.vx *= Math.pow(0.0001, dt);
          b.vy *= Math.pow(0.0001, dt);
        }
        b.angle += dt * 0.4;
      } else if (b.kind === "missile") {
        const spd = Math.hypot(b.vx, b.vy) + 40 * dt;
        const a = Math.atan2(b.vy, b.vx);
        b.vx = Math.cos(a) * spd;
        b.vy = Math.sin(a) * spd;
        b.angle = a;
      }
      b.life -= dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.life <= 0 || b.x < 0 || b.y < 0 || b.x > WORLD.w || b.y > WORLD.h) b.alive = false;
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
        const ha = a.health;
        const hb = b.health;
        a.health -= hb;
        b.health -= ha;
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
        if (!s.alive || !bullet.alive) continue;
        const dx = s.x - bullet.x;
        const dy = s.y - bullet.y;
        if (dx * dx + dy * dy < (s.r + bullet.r) ** 2) {
          const kick = s.kind === "alpha" ? 0.00008 : s.kind === "pentagon" ? 0.0022 : 0.01;
          s.vx += bullet.vx * kick;
          s.vy += bullet.vy * kick;
          damage(s, bullet.damage, bullet.owner);
          if (!(bullet.owner && bullet.owner.closer)) {
            bullet.health -= bullet.kind === "trap" || bullet.kind === "drone" ? 0.35 : 1;
            if (bullet.health <= 0) bullet.alive = false;
          }
        }
      }
      for (const tank of state.tanks) {
        if (!tank.alive || tank === bullet.owner || sameTeam(tank, bullet.owner)) continue;
        const dx = tank.x - bullet.x;
        const dy = tank.y - bullet.y;
        if (dx * dx + dy * dy < (tank.r + bullet.r) ** 2) {
          tank.vx += bullet.vx * 0.01;
          tank.vy += bullet.vy * 0.01;
          damage(tank, bullet.damage, bullet.owner);
          if (!(bullet.owner && bullet.owner.closer)) {
            bullet.health -= bullet.kind === "trap" || bullet.kind === "drone" ? 0.45 : 1.2;
            if (bullet.health <= 0) bullet.alive = false;
          }
        }
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
    maintainShapes();

    const p = cameraFocus();
    if (p) {
      state.camera.x = lerp(state.camera.x, p.x, 1 - Math.pow(0.0002, dt));
      state.camera.y = lerp(state.camera.y, p.y, 1 - Math.pow(0.0002, dt));
      updateHud();
    }
  }

  function formatScore(n) {
    n = Math.floor(n);
    if (n >= 1000000) return (n / 1000000).toFixed(2) + "m";
    if (n >= 1000) return (n / 1000).toFixed(2) + "k";
    return String(n);
  }

  function updateHud() {
    const p = state.spectating && state.spectateTarget && state.spectateTarget.alive ? state.spectateTarget : state.player;
    if (!p) return;
    const next = Math.min(LEVEL_CAP, p.level + (p.level < LEVEL_CAP ? 1 : 0));
    const cur = xpForLevel(p.level);
    const nxt = xpForLevel(next);
    const pct = p.level >= LEVEL_CAP ? 100 : ((p.score - cur) / Math.max(1, nxt - cur)) * 100;
    const def = getDef(p);
    const ranked = state.tanks.filter((t) => t.alive && !t.closer && !t.mothership).sort((a, b) => b.score - a.score).slice(0, 10);
    const top = Math.max(1, ranked[0] ? ranked[0].score : 1);
    const free = skillPointsFor(p.level) - spentPoints(p);
    if (els.xpFill) els.xpFill.style.width = `${clamp(pct, 0, 100)}%`;
    if (els.xpLabel) els.xpLabel.textContent = `Level ${p.level} ${def.name}`;
    if (els.playerName) {
      if (state.spectating) els.playerName.textContent = (p.name || "Tank") + "  ·  spectate";
      else if (state.player && state.player.mothership) els.playerName.textContent = p.name + "  ·  Mothership";
      else els.playerName.textContent = state.hunted === p ? p.name + "  ·  HUNTED" : p.name;
    }
    if (els.scoreText) els.scoreText.textContent = `Score: ${Math.floor(p.score).toLocaleString()}`;
    if (els.scoreFill) els.scoreFill.style.width = `${clamp((p.score / top) * 100, 8, 100)}%`;
    if (els.killsText) els.killsText.textContent = `Kills: ${p.kills || 0}`;
    if (els.killsFill) els.killsFill.style.width = `${clamp((p.kills || 0) * 10, 8, 100)}%`;
    if (els.closeTimer) {
      if (state.closing) els.closeTimer.textContent = "Arena closing";
      else if (state.mode === "ffa") {
        const left = Math.max(0, FFA_CLOSE_AT - state.time);
        const m = Math.floor(left / 60);
        const s = String(Math.floor(left % 60)).padStart(2, "0");
        els.closeTimer.textContent = `Closer ${m}:${s}`;
      } else if (state.mode === "domination" && state.domHold) {
        const left = Math.max(0, DOM_HOLD - (state.time - state.domHoldT));
        els.closeTimer.textContent = `${TEAMS[state.domHold].name} hold ${left.toFixed(0)}s`;
      } else els.closeTimer.textContent = "";
    }
    if (els.arenaMode && state.mode === "manhunt") {
      const mark = state.hunted;
      els.arenaMode.textContent = !mark
        ? "Manhunt"
        : mark === state.player
          ? "Manhunt · you are hunted"
          : `Manhunt · hunt ${mark.name}`;
    }
    if (els.arenaMode && state.mode === "tag") {
      if (state.closing) els.arenaMode.textContent = "Arena closing";
      else {
        const green = state.tanks.filter((t) => t.alive && !t.closer && t.team === "green").length;
        const redn = state.tanks.filter((t) => t.alive && !t.closer && t.team === "red").length;
        els.arenaMode.textContent = `Tag · Green ${green} – ${redn} Red`;
      }
    }
    if (els.arenaMode && state.mode === "protect") {
      if (state.closing) els.arenaMode.textContent = "Arena closing";
      else {
        const g = mothershipOf("green");
        const r = mothershipOf("red");
        const gp = g ? Math.round((g.health / Math.max(1, g.maxHealth)) * 100) : 0;
        const rp = r ? Math.round((r.health / Math.max(1, r.maxHealth)) * 100) : 0;
        const piloting = state.player && state.player.mothership;
        els.arenaMode.textContent = `Protect · G ${gp}%  R ${rp}%${piloting ? " · [H] leave" : " · [H] control"} · [N] lv45`;
      }
    }
    if (els.arenaMode && state.mode === "domination") {
      const b = state.doms.filter((d) => d.team === "blue").length;
      const r = state.doms.filter((d) => d.team === "red").length;
      els.arenaMode.textContent = state.closing ? "Arena closing" : `Domination · Blue ${b} – ${r} Red`;
    }
    if (els.skillPoints) els.skillPoints.textContent = state.spectating ? "" : (free > 0 ? `x${free}` : "");
    let html = "";
    if (state.mode === "tdm" || state.mode === "4tdm") {
      const ids = state.mode === "4tdm" ? TEAM4 : ["blue", "red"];
      for (const id of ids) {
        const sum = state.tanks.filter((t) => t.alive && t.team === id).reduce((n, t) => n + t.score, 0);
        html += `<li class="team-tot"><span><i class="lb-dot" style="background:${TEAMS[id].color}"></i>${TEAMS[id].name} — ${formatScore(sum)}</span></li>`;
      }
    }
    if (state.mode === "tag") {
      const green = state.tanks.filter((t) => t.alive && !t.closer && t.team === "green").length;
      const redn = state.tanks.filter((t) => t.alive && !t.closer && t.team === "red").length;
      html += `<li class="team-tot"><span><i class="lb-dot" style="background:${TEAMS.green.color}"></i>Green — ${green}</span></li>`;
      html += `<li class="team-tot"><span><i class="lb-dot" style="background:${TEAMS.red.color}"></i>Red — ${redn}</span></li>`;
    }
    if (state.mode === "protect") {
      const g = mothershipOf("green");
      const r = mothershipOf("red");
      html += `<li class="team-tot"><span><i class="lb-dot" style="background:${TEAMS.green.color}"></i>Green mothership — ${g ? Math.round((g.health / g.maxHealth) * 100) : 0}%</span></li>`;
      html += `<li class="team-tot"><span><i class="lb-dot" style="background:${TEAMS.red.color}"></i>Red mothership — ${r ? Math.round((r.health / r.maxHealth) * 100) : 0}%</span></li>`;
    }
    if (state.mode === "domination") {
      html += `<li class="team-tot"><span><i class="lb-dot" style="background:${TEAMS.blue.color}"></i>Blue points — ${state.doms.filter((d) => d.team === "blue").length}</span></li>`;
      html += `<li class="team-tot"><span><i class="lb-dot" style="background:${TEAMS.red.color}"></i>Red points — ${state.doms.filter((d) => d.team === "red").length}</span></li>`;
    }
    els.leaders.innerHTML = html + ranked.map((t) =>
      `<li class="${t === state.player ? "you" : ""} ${t === state.hunted ? "hunted" : ""}"><div class="lb-fill" style="width:${clamp((t.score / top) * 100, 8, 100)}%"></div><span><i class="lb-dot" style="background:${t.color}"></i>${escapeHtml(t.name)}${t === state.hunted ? " · hunted" : ""} — ${escapeHtml(getDef(t).name)} — ${formatScore(t.score)}</span></li>`
    ).join("");
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
    els.stats.innerHTML = STATS.map((st, i) => {
      const v = p.stats[st.key];
      const maxed = v >= STAT_MAX;
      return `<div class="stat-row ${maxed || free <= 0 ? "maxed" : ""}" data-stat="${st.key}" style="--pip:${st.color}">
        <div class="stat-dot"></div>
        <div class="stat-track">
          <div class="stat-fill" style="width:${(v / STAT_MAX) * 100}%"></div>
          <div class="stat-name">${st.name}</div>
        </div>
        <div class="stat-key">[${i + 1}]</div>
      </div>`;
    }).join("");
    els.stats.querySelectorAll(".stat-row").forEach((row) => {
      row.addEventListener("click", () => tryUpgrade(row.dataset.stat, keys.has("m")));
    });
  }

  const CLASS_KEYS = ["y", "u", "i", "h", "j", "k", "n", "m"];
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
    const options = (def.upgrades || []).filter((id) => {
      const child = TankCatalog.tanks[id];
      return child && p.level >= (child.needLevel || 15);
    });
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
    p.classId = id;
    p.customDef = null;
    applyLevel(p);
    state.classDismissed = false;
    renderClassPanel();
  }

  function tryUpgrade(key, dump) {
    const p = state.player;
    if (!p || !p.alive || p.mothership || p.closer) return;
    let used = false;
    while (true) {
      const free = skillPointsFor(p.level) - spentPoints(p);
      if (free <= 0 || p.stats[key] >= STAT_MAX) break;
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
    const ang = gun.type === "auto" ? (tank.turretAim[index] || tank.angle) : tank.angle + (gun.pos[5] * Math.PI) / 180;
    c.save();
    c.translate(tank.x, tank.y);
    c.rotate(ang);
    c.translate(X * u, Y * u);
    const len = Math.max(2, L * u);
    const w0 = Math.max(1.5, W * u * 0.5);
    const w1 = Math.max(1.5, W * Math.abs(A) * u * 0.5);
    c.beginPath();
    c.moveTo(0, -w0);
    c.lineTo(len, -w1);
    c.lineTo(len, w1);
    c.lineTo(0, w0);
    c.closePath();
    c.fillStyle = highlight ? "#cde" : COLORS.barrel;
    c.strokeStyle = COLORS.outline;
    c.lineWidth = 3;
    c.lineJoin = "round";
    c.fill();
    c.stroke();
    if (gun.type === "trap") {
      c.beginPath();
      c.moveTo(len, -w1 * 1.15);
      c.lineTo(len + 6, -w1 * 1.45);
      c.lineTo(len + 6, w1 * 1.45);
      c.lineTo(len, w1 * 1.15);
      c.closePath();
      c.fill();
      c.stroke();
    }
    c.restore();
  }

  function drawHealth(c, ent, yOff) {
    if (ent.health >= ent.maxHealth * 0.995) return;
    const w = ent.r * 2.2;
    const h = 5;
    const x = ent.x - w / 2;
    const y = ent.y + (yOff || ent.r + 8);
    c.fillStyle = "#333";
    roundRect(c, x - 1, y - 1, w + 2, h + 2, 2);
    c.fill();
    const pct = clamp(ent.health / ent.maxHealth, 0, 1);
    c.fillStyle = pct < 0.3 ? "#e85d5d" : "#8dff6e";
    roundRect(c, x, y, w * pct, h, 2);
    c.fill();
  }

  function drawTank(c, tank, opts = {}) {
    const def = tank.customDef || TankCatalog.get(tank.classId);
    const guns = def.guns || [];
    c.save();
    c.globalAlpha = tank.fade == null ? 1 : tank.fade;
    for (let i = 0; i < guns.length; i++) {
      drawGun(c, tank, guns[i], i, opts.highlightGun === i);
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
    if (!opts.hideName) {
      c.fillStyle = tank === state.hunted ? "#c9a227" : "#3a3a3a";
      c.font = "bold 13px Segoe UI, sans-serif";
      c.textAlign = "center";
      c.textBaseline = "bottom";
      c.fillText(tank === state.hunted ? tank.name + "  HUNTED" : tank.name, tank.x, tank.y - tank.r - 6);
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
    const p = cameraFocus();
    const fov = p && p.alive ? tankStats(p).fov : 1;
    const zoom = cam.zoom / fov;
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
    for (const w of state.walls) {
      ctx.fillStyle = "#9a9a9a";
      ctx.strokeStyle = "#6e6e6e";
      ctx.lineWidth = 4;
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeRect(w.x, w.y, w.w, w.h);
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
    if (state.mode !== "protect" && state.mode !== "maze") {
      ctx.fillStyle = "rgba(118, 141, 252, 0.08)";
      ctx.beginPath();
      ctx.arc(WORLD.w / 2, WORLD.h / 2, 520, 0, TAU);
      ctx.fill();
    }

    for (const s of state.shapes) {
      if (s.x + s.r < left || s.x - s.r > left + viewW || s.y + s.r < top || s.y - s.r > top + viewH) continue;
      drawPoly(ctx, s.x, s.y, s.r, s.sides, s.rot, s.color);
      drawHealth(ctx, s, s.r + 10);
    }

    for (const b of state.bullets) {
      if (b.kind === "trap") {
        drawPoly(ctx, b.x, b.y, b.r, 4, b.angle, b.color);
      } else if (b.kind === "drone") {
        drawPoly(ctx, b.x, b.y, b.r, 4, b.angle, b.color);
      } else if (b.kind === "swarm") {
        drawPoly(ctx, b.x, b.y, b.r, 3, b.angle, b.color);
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
    mctx.fillStyle = "#cfcfcf";
    mctx.fillRect(0, 0, s, s);
    const mapX = (x) => (x / WORLD.w) * s;
    const mapY = (y) => (y / WORLD.h) * s;
    mctx.fillStyle = "#8e8e8e";
    for (const w of state.walls) {
      mctx.fillRect(mapX(w.x), mapY(w.y), (w.w / WORLD.w) * s, (w.h / WORLD.h) * s);
    }
    for (const d of state.doms) {
      mctx.beginPath();
      mctx.arc(mapX(d.x), mapY(d.y), 7, 0, TAU);
      mctx.fillStyle = d.team && TEAMS[d.team] ? TEAMS[d.team].color : "#777";
      mctx.fill();
    }
    const p = cameraFocus();
    for (const t of state.tanks) {
      if (!t.alive || t.closer) continue;
      const self = t === p;
      const ally = !!(p && t.team && p.team && t.team === p.team);
      const boss = !!t.mothership;
      if (!self && !ally && !boss) continue;
      mctx.fillStyle = t.color;
      mctx.beginPath();
      mctx.arc(mapX(t.x), mapY(t.y), boss ? 6 : self ? 4 : 3, 0, TAU);
      mctx.fill();
      if (boss) {
        mctx.strokeStyle = "#333";
        mctx.lineWidth = 1.2;
        mctx.stroke();
      }
    }
  }

  function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    try {
      if (running && !state.paused) update(dt);
      render();
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
    window.visualViewport.addEventListener("scroll", resize);
  }
  window.addEventListener("wheel", (e) => {
    if (e.ctrlKey || e.metaKey) e.preventDefault();
  }, { passive: false });
  window.addEventListener("gesturestart", (e) => e.preventDefault());
  window.addEventListener("gesturechange", (e) => e.preventDefault());
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
    if (state.paused || state.spectating) {
      if (k === "t" && running && !state.spectating) openWorkshop();
      return;
    }
    keys.add(k);
    if (k === "e" && running) state.autoFire = !state.autoFire;
    if (k === "c" && running) state.autoSpin = !state.autoSpin;
    if (k === "t" && running && window.TankWorkshop) window.TankWorkshop.open();
    const skippedLevel = k === "n" && running && !state.paused && state.mode === "protect" && skipToLevelCap(menuTank());
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
    if (running && !state.paused && n >= 1 && n <= 8) tryUpgrade(STATS[n - 1].key, keys.has("m"));
  });
  window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
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
    ffa: "Everyone for themselves · arena closers after 5 minutes",
    tdm: "Red vs blue · bases protect your team",
    "4tdm": "Four bases · blue, red, green, purple",
    manhunt: "Everyone hunts whoever is #1",
    tag: "Shoot to convert · last team standing closes the arena",
    protect: "Two motherships · defend yours · start at lv1 · [N] skip to 45 · [H] to take control",
    maze: "FFA inside generated walls",
    domination: "Capture 4 points · hold 3 to close the arena",
    sandbox: "Level 45 · pick any tank",
  };

  function saveName(name) {
    try { localStorage.setItem("tankfield-name", String(name || "").slice(0, 16)); } catch (err) {}
  }

  function playSelected() {
    const name = (els.name && els.name.value.trim()) || "Unnamed Tank";
    saveName(name);
    if (menuMode === "sandbox") startGame(name, { sandbox: true, classId: "basic" });
    else if (menuMode === "tdm") startGame(name, { mode: "tdm", team: menuTeam === "red" ? "red" : "blue" });
    else if (menuMode === "4tdm") startGame(name, { mode: "4tdm", team: TEAM4.includes(menuTeam) ? menuTeam : "blue" });
    else if (menuMode === "manhunt") startGame(name, { mode: "manhunt" });
    else if (menuMode === "tag") startGame(name, { mode: "tag", team: menuTeam === "red" ? "red" : "green" });
    else if (menuMode === "protect") startGame(name, { mode: "protect", team: menuTeam === "red" ? "red" : "green" });
    else if (menuMode === "maze") startGame(name, { mode: "maze" });
    else if (menuMode === "domination") startGame(name, { mode: "domination", team: menuTeam === "red" ? "red" : "blue" });
    else startGame(name, { mode: "ffa" });
  }

  function openWorkshop() {
    if (window.TankWorkshop && typeof window.TankWorkshop.open === "function") window.TankWorkshop.open();
  }

  function setMenuMode(mode) {
    menuMode = mode;
    document.querySelectorAll(".server-row").forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
    const row = document.getElementById("team-row");
    const pickTeam = menuMode === "tdm" || menuMode === "4tdm" || menuMode === "tag" || menuMode === "protect" || menuMode === "domination";
    if (row) {
      row.classList.toggle("hidden", !pickTeam);
      row.classList.toggle("teams-4", menuMode === "4tdm");
    }
    const blue = document.getElementById("chip-blue");
    const green = document.getElementById("chip-green");
    const red = document.getElementById("chip-red");
    const purple = document.getElementById("chip-purple");
    const four = menuMode === "4tdm";
    const gp = menuMode === "tag" || menuMode === "protect";
    if (blue) blue.classList.toggle("hidden", gp);
    if (green) green.classList.toggle("hidden", !gp && !four);
    if (red) red.classList.toggle("hidden", false);
    if (purple) purple.classList.toggle("hidden", !four);
    if (gp && menuTeam !== "red") menuTeam = "green";
    if ((menuMode === "tdm" || menuMode === "domination") && menuTeam !== "red") menuTeam = "blue";
    if (four && !TEAM4.includes(menuTeam)) menuTeam = "blue";
    document.querySelectorAll(".team-chip").forEach((b) => {
      b.classList.toggle("selected", b.dataset.team === menuTeam && !b.classList.contains("hidden"));
    });
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
  if (els.again) els.again.addEventListener("click", () => startGame(state.spawnName, state.playOpts || {}));
  if (els.menu) els.menu.addEventListener("click", goToMenu);
  if (els.resume) els.resume.addEventListener("click", () => setUserPaused(false));
  if (els.pauseMenu) els.pauseMenu.addEventListener("click", goToMenu);
  if (els.spectateBtn) els.spectateBtn.addEventListener("click", beginSpectate);
  if (els.spectateNext) els.spectateNext.addEventListener("click", () => cycleSpectate(1));
  if (els.spectateAgain) els.spectateAgain.addEventListener("click", () => startGame(state.spawnName, state.playOpts || {}));
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
    applyToPlayer(def) {
      if (!state.player) return;
      state.player.customDef = TankCatalog.cloneDef(def);
      state.player.classId = def.id || "custom";
      applyLevel(state.player);
      renderClassPanel();
    },
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
  populateWorld();
  initColorPicker();
  try {
    const savedName = localStorage.getItem("tankfield-name");
    if (savedName && els.name) els.name.value = savedName.slice(0, 16);
  } catch (err) {}
  document.querySelectorAll(".server-row").forEach((row) => {
    const count = row.querySelector(".srv-count");
    if (!count) return;
    const n = botCountFor(row.dataset.mode);
    count.textContent = n ? `${n} bots` : "solo";
  });
  state.camera.x = WORLD.w / 2;
  state.camera.y = WORLD.h / 2;
  last = performance.now();
  requestAnimationFrame(frame);
  els.name.focus();
})();
