(() => {
  "use strict";

  const WORLD = { w: 4600, h: 4600 };
  const TAU = Math.PI * 2;
  const STAT_MAX = 7;
  const LEVEL_CAP = 45;
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
    sandbox: document.getElementById("sandbox-btn"),
    workshopBtn: document.getElementById("workshop-btn"),
    again: document.getElementById("again-btn"),
    menu: document.getElementById("menu-btn"),
    stats: document.getElementById("stats-panel"),
    classes: document.getElementById("class-panel"),
    classChoices: document.getElementById("class-choices"),
    leaders: document.getElementById("leader-list"),
    xpFill: document.getElementById("xp-fill"),
    xpLabel: document.getElementById("xp-label"),
    deathMsg: document.getElementById("death-msg"),
    deathStats: document.getElementById("death-stats"),
    bestScore: document.getElementById("best-score"),
    editInGame: document.getElementById("edit-ingame"),
  };

  const keys = new Set();
  const mouse = { x: 0, y: 0, down: false, right: false };
  let dpr = 1;
  let width = 0;
  let height = 0;
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
    mode: "normal",
    paused: false,
    playOpts: null,
    alphaRespawnAt: 0,
  };

  function rand(a, b) { return a + Math.random() * (b - a); }
  function irand(a, b) { return (Math.random() * (b - a + 1) + a) | 0; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function dist2(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }
  function darken(hex, amt = 0.28) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    const f = 1 - amt;
    return `rgb(${(r * f) | 0},${(g * f) | 0},${(b * f) | 0})`;
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
    const s = tank.stats;
    const def = getDef(tank);
    const m = modsOf(def);
    const lvl = tank.level;
    return {
      maxHealth: (48 + s.maxHealth * 22 + lvl * 2.2) * (def.health || 1) * (m.health || 1),
      regen: 0.9 + s.regen * 1.35 + lvl * 0.02,
      bodyDamage: (7 + s.bodyDamage * 4.2) * (def.bodyDamage || 1),
      bulletSpeed: (7.2 + s.bulletSpeed * 1.15) * (def.bulletSpeed || 1),
      bulletPen: (1 + s.bulletPen * 0.55) * (def.bulletPen || 1),
      bulletDamage: (7 + s.bulletDamage * 3.1) * (def.bulletDamage || 1) * (m.damage || 1),
      reload: Math.max(0.08, (0.42 - s.reload * 0.038) * (def.reload || 1) / (m.reload || 1)),
      moveSpeed: (11.2 + s.moveSpeed * 0.32 - Math.min(lvl, 30) * 0.008) * (def.speed || 1) * (m.speed || 1),
      fov: (def.fov || 1) * (m.fov || 1),
      bulletSize: (def.bulletSize || 1) * (m.size || 1),
      maxDrones: def.maxDrones || 0,
    };
  }

  function skillPointsFor(level) { return Math.min(level - 1, 33); }
  function spentPoints(tank) { return STATS.reduce((n, st) => n + tank.stats[st.key], 0); }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function randomInWorld(margin = 80) {
    return { x: rand(margin, WORLD.w - margin), y: rand(margin, WORLD.h - margin) };
  }

  function awayFrom(x, y, minDist) {
    for (let i = 0; i < 24; i++) {
      const p = randomInWorld(120);
      if ((p.x - x) ** 2 + (p.y - y) ** 2 > minDist * minDist) return p;
    }
    return randomInWorld(120);
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
      wanderA: rand(0, TAU),
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
    for (let i = 0; i < 28; i++) state.shapes.push(createShape("triangle"));
    for (let i = 0; i < 12; i++) state.shapes.push(createShape("pentagon"));
    state.shapes.push(createShape("alpha"));
    for (let i = 0; i < 10; i++) state.shapes.push(createShape("crasher"));
  }

  function spawnBots() {
    const names = BOT_NAMES.slice().sort(() => Math.random() - 0.5);
    for (let i = 0; i < 11; i++) {
      const score = irand(0, 1800);
      const bot = createTank({
        name: names[i % names.length],
        ai: true,
        score,
        classId: "basic",
        pos: awayFrom(WORLD.w / 2, WORLD.h / 2, 500),
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
      const opts = (def.upgrades || []).filter((id) => bot.level >= (TankCatalog.get(id).needLevel || 15));
      if (!opts.length) break;
      bot.classId = opts[irand(0, opts.length - 1)];
    }
    applyLevel(bot);
  }

  function startGame(name, opts = {}) {
    state.spawnName = name || "Unnamed Tank";
    state.playOpts = opts;
    state.mode = opts.sandbox ? "sandbox" : "normal";
    state.tanks = [];
    state.bullets = [];
    state.particles = [];
    state.floaters = [];
    state.autoFire = false;
    state.autoSpin = false;
    state.time = 0;
    state.paused = false;
    state.alphaRespawnAt = 0;
    populateWorld();
    const player = createTank({
      name: state.spawnName,
      color: COLORS.player,
      classId: opts.classId || "basic",
      customDef: opts.customDef || null,
      score: opts.sandbox ? xpForLevel(LEVEL_CAP) : 0,
      pos: awayFrom(WORLD.w / 2, WORLD.h / 2, 700),
    });
    player.ai = false;
    if (opts.maxStats) {
      for (const st of STATS) player.stats[st.key] = STAT_MAX;
      applyLevel(player);
      player.health = player.maxHealth;
    }
    state.player = player;
    state.tanks.push(player);
    spawnBots();
    state.camera.x = player.x;
    state.camera.y = player.y;
    els.start.classList.add("hidden");
    els.death.classList.add("hidden");
    els.hud.classList.remove("hidden");
    document.getElementById("workshop").classList.add("hidden");
    renderStats();
    renderClassPanel();
    running = true;
    last = performance.now();
  }

  function killTank(tank, killer) {
    if (!tank.alive) return;
    tank.alive = false;
    tank.killedBy = killer ? killer.name : "a polygon";
    burst(tank.x, tank.y, tank.color, 18, 220);
    if (killer && killer.alive) {
      const gain = Math.max(20, Math.floor(tank.score * 0.45) + 20);
      giveScore(killer, gain, tank.x, tank.y);
    }
    if (tank === state.player) {
      shake = 14;
      showDeath(tank);
    } else {
      setTimeout(() => {
        if (!running || !state.player || !state.player.alive) return;
        const score = irand(0, 400);
        const bot = createTank({
          name: tank.name,
          ai: true,
          score,
          classId: "basic",
          pos: awayFrom(state.player.x, state.player.y, 900),
        });
        autoUpgradeBot(bot);
        bot.health = bot.maxHealth;
        state.tanks.push(bot);
      }, 1800);
    }
  }

  function giveScore(tank, amount, x, y) {
    tank.score += amount;
    const leveled = applyLevel(tank);
    if (tank === state.player) {
      floater(x, y - 10, `+${amount}`);
      renderStats();
      if (leveled) renderClassPanel();
    } else if (leveled) {
      autoUpgradeBot(tank);
    }
  }

  function showDeath(tank) {
    const best = Math.max(tank.score, Number(localStorage.getItem("tankfield-best") || 0));
    localStorage.setItem("tankfield-best", String(best));
    els.deathMsg.textContent = `Destroyed by ${tank.killedBy}.`;
    els.deathStats.textContent = `Score ${Math.floor(tank.score)}  ·  Level ${tank.level}  ·  ${getDef(tank).name}`;
    els.bestScore.textContent = `Best score: ${Math.floor(best)}`;
    els.death.classList.remove("hidden");
  }

  function unitOf(tank) { return tank.r / 12; }

  function gunAngle(tank, gun, index) {
    if (gun.type === "auto") return tank.turretAim[index] || tank.angle;
    return tank.angle + (gun.pos[5] * Math.PI) / 180;
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
    const kind = gun.type === "auto" ? "bullet" : gun.type;
    const gs = gun.stats || {};
    const speedMul = gs.speed || (kind === "trap" ? 0.45 : kind === "drone" || kind === "swarm" ? 0.7 : kind === "missile" ? 0.55 : 1);
    const speed = st.bulletSpeed * 58 * speedMul;
    const recoil = gun.recoil != null ? gun.recoil : kind === "trap" ? 0.2 : 0.55;
    tank.vx -= Math.cos(ang) * recoil * (st.bulletDamage / 10);
    tank.vy -= Math.sin(ang) * recoil * (st.bulletDamage / 10);
    const sizeMul = gun.size || gs.size || (kind === "swarm" ? 0.55 : kind === "trap" ? 1.15 : 1);
    state.bullets.push({
      x: tank.x + ox,
      y: tank.y + oy,
      vx: Math.cos(ang) * speed + tank.vx * 0.15,
      vy: Math.sin(ang) * speed + tank.vy * 0.15,
      r: (7.2 * st.bulletSize * sizeMul) * (0.85 + tank.r / 40),
      health: st.bulletPen * (kind === "trap" ? 3.2 : kind === "drone" ? 2.2 : 1),
      damage: st.bulletDamage * (gs.damage || (kind === "swarm" ? 0.55 : 1)),
      life: kind === "trap" ? 9 : kind === "drone" || kind === "swarm" ? 999 : kind === "missile" ? 2.4 : 1.55 + st.fov * 0.15,
      color: tank.color,
      owner: tank,
      kind,
      angle: ang,
      orbit: rand(0, TAU),
      age: 0,
      alive: true,
    });
  }

  function wantsFire(tank) {
    if (tank.ai) return tank.aiState === "attack" || tank.aiState === "farm" || tank.aiState === "defend";
    return mouse.down || state.autoFire || keys.has(" ");
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
      if (autoGun && !nearest(tank, [...state.tanks, ...state.shapes], 520, (o) => o !== tank && o.alive)) continue;
      if (tank.gunCd[i] > 0) continue;
      if ((gun.type === "drone" || gun.type === "swarm") && countOwned(gun.type, tank) >= Math.max(1, st.maxDrones)) continue;
      tank.gunCd[i] = st.reload * (0.65 + (gun.pos[6] || 0));
      spawnShot(tank, gun, i, st);
    }
  }

  function updateTurrets(tank, dt) {
    const guns = getDef(tank).guns || [];
    const target = nearest(tank, tank.ai ? state.tanks.concat(state.shapes) : state.tanks.concat(state.shapes), 640, (o) => o !== tank && o.alive && o.type !== undefined);
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
    const want = { square: 90, triangle: 28, pentagon: 12, crasher: 10 };
    for (const kind of Object.keys(want)) {
      while (counts[kind] < want[kind]) {
        state.shapes.push(createShape(kind));
        counts[kind]++;
      }
    }
    if (counts.alpha < 1 && state.alphaRespawnAt > 0 && state.time >= state.alphaRespawnAt) {
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

  function updateAI(tank, dt) {
    tank.aiT -= dt;
    const player = state.player;
    const enemy = nearest(tank, state.tanks, 720, (t) => t.alive);
    const shape = nearest(tank, state.shapes, 900, (s) => s.kind !== "alpha" || tank.level >= 20);
    const low = tank.health < tank.maxHealth * 0.34;
    if (low && enemy) tank.aiState = "flee";
    else if (enemy && dist2(tank, enemy) < 380 * 380) tank.aiState = "attack";
    else if (shape) tank.aiState = "farm";
    else tank.aiState = "wander";

    let tx = tank.x;
    let ty = tank.y;
    if (tank.aiState === "attack" && enemy) {
      tx = enemy.x; ty = enemy.y;
      tank.angle = Math.atan2(ty - tank.y, tx - tank.x);
    } else if (tank.aiState === "flee" && enemy) {
      tx = tank.x * 2 - enemy.x; ty = tank.y * 2 - enemy.y;
      tank.angle = Math.atan2(enemy.y - tank.y, enemy.x - tank.x);
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
    if (player && player.alive && dist2(tank, player) < 520 * 520 && Math.random() < 0.4) {
      tank.aiState = "attack";
      tank.angle = Math.atan2(player.y - tank.y, player.x - tank.x);
      tx = player.x; ty = player.y;
    }
    const st = tankStats(tank);
    const pace = (state.player && state.player.alive ? tankStats(state.player).moveSpeed : st.moveSpeed);
    const ang = Math.atan2(ty - tank.y, tx - tank.x);
    tank.vx += Math.cos(ang) * pace * 40 * dt;
    tank.vy += Math.sin(ang) * pace * 40 * dt;
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
      p.vx += (mx / m) * st.moveSpeed * 40 * dt;
      p.vy += (my / m) * st.moveSpeed * 40 * dt;
    }
    const world = screenToWorld(mouse.x, mouse.y);
    if (state.autoSpin) p.angle += 1.8 * dt;
    else p.angle = Math.atan2(world.y - p.y, world.x - p.x);
    updateTurrets(p, dt);
    shoot(p, dt);
  }

  function screenToWorld(sx, sy) {
    const cam = state.camera;
    const p = state.player;
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
    target.health -= amount;
    if (target.type === "tank") target.bodyHitT = 0.08;
    if (target === state.player) shake = Math.max(shake, Math.min(10, amount * 0.25));
    if (target.health <= 0) {
      target.alive = false;
      burst(target.x, target.y, target.color, target.kind === "alpha" ? 36 : 12, 180);
      if (target.kind === "alpha") state.alphaRespawnAt = state.time + rand(60, 120);
      if (target.type === "shape" && src) giveScore(src, target.score, target.x, target.y);
      else if (target.type === "tank") killTank(target, src);
    }
  }

  function droneTarget(b) {
    const owner = b.owner;
    if (!owner || !owner.alive) return null;
    if (!owner.ai) {
      if (mouse.down || mouse.right || state.autoFire) return screenToWorld(mouse.x, mouse.y);
      return {
        x: owner.x + Math.cos(state.time * 1.7 + b.orbit) * 80,
        y: owner.y + Math.sin(state.time * 1.7 + b.orbit) * 80,
      };
    }
    const prey = nearest(owner, state.tanks.concat(state.shapes), 700, (o) => o !== owner);
    if (prey) return prey;
    return {
      x: owner.x + Math.cos(state.time * 1.7 + b.orbit) * 80,
      y: owner.y + Math.sin(state.time * 1.7 + b.orbit) * 80,
    };
  }

  function update(dt) {
    state.time += dt;
    shake = Math.max(0, shake - dt * 18);
    updatePlayer(dt);

    for (const tank of state.tanks) {
      if (!tank.alive) continue;
      if (tank.ai) updateAI(tank, dt);
      tank.vx *= Math.pow(0.0008, dt);
      tank.vy *= Math.pow(0.0008, dt);
      const spd = Math.hypot(tank.vx, tank.vy);
      const st = tankStats(tank);
      let cap = st.moveSpeed * 86;
      if (tank.ai && state.player && state.player.alive) {
        cap = tankStats(state.player).moveSpeed * 86 * 0.9;
      }
      if (spd > cap) { tank.vx *= cap / spd; tank.vy *= cap / spd; }
      tank.x += tank.vx * dt;
      tank.y += tank.vy * dt;
      tank.x = clamp(tank.x, tank.r, WORLD.w - tank.r);
      tank.y = clamp(tank.y, tank.r, WORLD.h - tank.r);
      tank.bodyHitT = Math.max(0, tank.bodyHitT - dt);
      tank.health = Math.min(tank.maxHealth, tank.health + st.regen * dt);
      const fadeId = getDef(tank).id;
      if (FADE_TANKS.has(fadeId) && spd < 25) tank.fade = Math.max(0.08, tank.fade - dt * 0.7);
      else tank.fade = Math.min(1, tank.fade + dt * 2.5);
    }

    for (const s of state.shapes) {
      if (!s.alive) continue;
      s.rot += s.spin * dt;
      const cruise = 11.2 * 86;
      if (s.kind === "alpha") {
        const cx = WORLD.w / 2;
        const cy = WORLD.h / 2;
        s.vx += (cx - s.x) * 1.6 * dt;
        s.vy += (cy - s.y) * 1.6 * dt;
        s.vx *= Math.pow(0.0004, dt);
        s.vy *= Math.pow(0.0004, dt);
      } else if (s.kind === "crasher") {
        const prey = nearest(s, state.tanks, 980);
        if (prey) {
          const a = Math.atan2(prey.y - s.y, prey.x - s.x);
          const spd = cruise * 0.9;
          s.vx = lerp(s.vx, Math.cos(a) * spd, 1 - Math.pow(0.012, dt));
          s.vy = lerp(s.vy, Math.sin(a) * spd, 1 - Math.pow(0.012, dt));
          s.rot = a;
        } else {
          s.vx *= Math.pow(0.08, dt);
          s.vy *= Math.pow(0.08, dt);
        }
      } else if (s.kind === "triangle") {
        if (Math.random() < dt * 0.45) s.wanderA += rand(-1.1, 1.1);
        const spd = cruise * 0.88;
        s.vx = lerp(s.vx, Math.cos(s.wanderA) * spd, 1 - Math.pow(0.04, dt));
        s.vy = lerp(s.vy, Math.sin(s.wanderA) * spd, 1 - Math.pow(0.04, dt));
      } else {
        s.vx *= Math.pow(0.04, dt);
        s.vy *= Math.pow(0.04, dt);
      }
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.x = clamp(s.x, s.r, WORLD.w - s.r);
      s.y = clamp(s.y, s.r, WORLD.h - s.r);
      if (s.kind === "triangle" && (s.x <= s.r + 2 || s.x >= WORLD.w - s.r - 2)) s.wanderA = Math.PI - s.wanderA;
      if (s.kind === "triangle" && (s.y <= s.r + 2 || s.y >= WORLD.h - s.r - 2)) s.wanderA = -s.wanderA;
    }

    for (const b of state.bullets) {
      if (!b.alive) continue;
      b.age += dt;
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
    }

    for (let i = 0; i < state.tanks.length; i++) {
      const a = state.tanks[i];
      if (!a.alive) continue;
      for (let j = i + 1; j < state.tanks.length; j++) {
        const b = state.tanks[j];
        if (!b.alive) continue;
        if (collideCircles(a, b, 0.7) && a.bodyHitT <= 0 && b.bodyHitT <= 0) {
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
          bullet.health -= bullet.kind === "trap" || bullet.kind === "drone" ? 0.35 : 1;
          if (bullet.health <= 0) bullet.alive = false;
        }
      }
      for (const tank of state.tanks) {
        if (!tank.alive || tank === bullet.owner) continue;
        const dx = tank.x - bullet.x;
        const dy = tank.y - bullet.y;
        if (dx * dx + dy * dy < (tank.r + bullet.r) ** 2) {
          tank.vx += bullet.vx * 0.01;
          tank.vy += bullet.vy * 0.01;
          damage(tank, bullet.damage, bullet.owner);
          bullet.health -= bullet.kind === "trap" || bullet.kind === "drone" ? 0.45 : 1.2;
          if (bullet.health <= 0) bullet.alive = false;
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
    maintainShapes();

    const p = state.player;
    if (p) {
      state.camera.x = lerp(state.camera.x, p.x, 1 - Math.pow(0.0002, dt));
      state.camera.y = lerp(state.camera.y, p.y, 1 - Math.pow(0.0002, dt));
      updateHud();
    }
  }

  function updateHud() {
    const p = state.player;
    if (!p) return;
    const next = Math.min(LEVEL_CAP, p.level + (p.level < LEVEL_CAP ? 1 : 0));
    const cur = xpForLevel(p.level);
    const nxt = xpForLevel(next);
    const pct = p.level >= LEVEL_CAP ? 100 : ((p.score - cur) / Math.max(1, nxt - cur)) * 100;
    els.xpFill.style.width = `${clamp(pct, 0, 100)}%`;
    const def = getDef(p);
    els.xpLabel.textContent = p.level >= LEVEL_CAP
      ? `${def.name}  ·  Lvl ${p.level}  ·  ${Math.floor(p.score)}`
      : `${def.name}  ·  Lvl ${p.level}  ·  ${Math.floor(p.score)} / ${nxt}`;
    const ranked = state.tanks.filter((t) => t.alive).sort((a, b) => b.score - a.score).slice(0, 8);
    els.leaders.innerHTML = ranked.map((t) =>
      `<li class="${t === p ? "you" : ""}"><span>${escapeHtml(t.name)}</span><span>${Math.floor(t.score)}</span></li>`
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
    els.stats.innerHTML = STATS.map((st, i) => {
      const v = p.stats[st.key];
      const maxed = v >= STAT_MAX;
      const pips = Array.from({ length: STAT_MAX }, (_, n) =>
        `<span class="${n < v ? "on" : ""}"></span>`
      ).join("");
      return `<div class="stat-row ${maxed || free <= 0 ? "maxed" : ""}" data-stat="${st.key}" style="--pip:${st.color}">
        <div class="stat-key">${i + 1}</div>
        <div class="stat-pips">${pips}</div>
        <div class="stat-name">${st.name}</div>
      </div>`;
    }).join("");
    els.stats.querySelectorAll(".stat-row").forEach((row) => {
      row.addEventListener("click", () => tryUpgrade(row.dataset.stat));
    });
  }

  function renderClassPanel() {
    const p = state.player;
    if (!p) return;
    const def = getDef(p);
    const options = (def.upgrades || []).filter((id) => {
      const child = TankCatalog.get(id);
      return p.level >= (child.needLevel || 15);
    });
    if (!options.length && state.mode !== "sandbox") {
      els.classes.classList.add("hidden");
      return;
    }
    els.classes.classList.remove("hidden");
    const extra = state.mode === "sandbox"
      ? `<button class="class-btn" id="open-catalog">All tanks / editor<small>Sandbox picker</small></button>`
      : "";
    els.classChoices.innerHTML = extra + options.map((id) => {
      const c = TankCatalog.get(id);
      return `<button class="class-btn" data-class="${id}">${c.name}<small>${c.desc}</small></button>`;
    }).join("");
    els.classChoices.querySelectorAll("[data-class]").forEach((btn) => {
      btn.addEventListener("click", () => {
        p.classId = btn.dataset.class;
        p.customDef = null;
        applyLevel(p);
        renderClassPanel();
      });
    });
    const cat = document.getElementById("open-catalog");
    if (cat) cat.addEventListener("click", () => window.TankWorkshop.open());
  }

  function tryUpgrade(key) {
    const p = state.player;
    if (!p || !p.alive) return;
    const free = skillPointsFor(p.level) - spentPoints(p);
    if (free <= 0 || p.stats[key] >= STAT_MAX) return;
    p.stats[key]++;
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
      c.strokeStyle = darken(tank.color);
      c.lineWidth = 3.4;
      c.fill();
      c.stroke();
    }
    if (!opts.hideName) {
      c.fillStyle = "#3a3a3a";
      c.font = "bold 13px Segoe UI, sans-serif";
      c.textAlign = "center";
      c.textBaseline = "bottom";
      c.fillText(tank.name, tank.x, tank.y - tank.r - 6);
    }
    c.restore();
    if (!opts.hideHealth) drawHealth(c, tank);
  }

  function drawPreview(target, def, color = COLORS.player, highlightGun = -1) {
    const c = target.getContext("2d");
    const w = target.width;
    const h = target.height;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = COLORS.bg;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = COLORS.grid;
    for (let x = 0; x < w; x += 18) {
      c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke();
    }
    for (let y = 0; y < h; y += 18) {
      c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
    }
    const mock = {
      x: w / 2, y: h / 2, r: 28, angle: -Math.PI / 2, color, bodyHitT: 0, fade: 1,
      classId: def.id || "custom", customDef: def, name: def.name, turretAim: [],
      health: 1, maxHealth: 1,
    };
    drawTank(c, mock, { hideName: true, hideHealth: true, highlightGun });
  }

  function render() {
    const cam = state.camera;
    const p = state.player;
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
    ctx.fillStyle = "rgba(118, 141, 252, 0.08)";
    ctx.beginPath();
    ctx.arc(WORLD.w / 2, WORLD.h / 2, 520, 0, TAU);
    ctx.fill();

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
    if (running) drawMinimap();
  }

  function drawMinimap() {
    const s = mini.width;
    mctx.fillStyle = "#cfcfcf";
    mctx.fillRect(0, 0, s, s);
    mctx.fillStyle = "rgba(90, 111, 216, 0.25)";
    mctx.beginPath();
    mctx.arc(s / 2, s / 2, (520 / WORLD.w) * s, 0, TAU);
    mctx.fill();
    const mapX = (x) => (x / WORLD.w) * s;
    const mapY = (y) => (y / WORLD.h) * s;
    for (const sh of state.shapes) {
      if (!sh.alive || sh.kind === "square") continue;
      mctx.fillStyle = sh.color;
      mctx.fillRect(mapX(sh.x) - 1.5, mapY(sh.y) - 1.5, 3, 3);
    }
    for (const t of state.tanks) {
      if (!t.alive) continue;
      mctx.fillStyle = t === state.player ? COLORS.player : COLORS.enemy;
      mctx.beginPath();
      mctx.arc(mapX(t.x), mapY(t.y), t === state.player ? 4 : 3, 0, TAU);
      mctx.fill();
    }
    if (state.player) {
      const fov = tankStats(state.player).fov;
      const zoom = state.camera.zoom / fov;
      const vw = (width / zoom / WORLD.w) * s;
      const vh = (height / zoom / WORLD.h) * s;
      mctx.strokeStyle = "#333";
      mctx.strokeRect(mapX(state.camera.x) - vw / 2, mapY(state.camera.y) - vh / 2, vw, vh);
    }
  }

  function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    if (running && !state.paused) update(dt);
    render();
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("keydown", (e) => {
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
    keys.add(k);
    if (k === "e" && running) state.autoFire = !state.autoFire;
    if (k === "c" && running) state.autoSpin = !state.autoSpin;
    if (k === "t" && running) window.TankWorkshop.open();
    const n = parseInt(e.key, 10);
    if (running && !state.paused && n >= 1 && n <= 8) tryUpgrade(STATS[n - 1].key);
  });
  window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener("blur", () => keys.clear());
  canvas.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  canvas.addEventListener("mousedown", (e) => {
    if (e.button === 0) mouse.down = true;
    if (e.button === 2) mouse.right = true;
  });
  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) mouse.down = false;
    if (e.button === 2) mouse.right = false;
  });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  els.play.addEventListener("click", () => startGame(els.name.value.trim() || "Unnamed Tank"));
  els.sandbox.addEventListener("click", () => {
    startGame(els.name.value.trim() || "Unnamed Tank", { sandbox: true, classId: "basic" });
  });
  els.workshopBtn.addEventListener("click", () => window.TankWorkshop.open());
  els.name.addEventListener("keydown", (e) => { if (e.key === "Enter") els.play.click(); });
  els.again.addEventListener("click", () => startGame(state.spawnName, state.playOpts || {}));
  els.menu.addEventListener("click", () => {
    running = false;
    els.death.classList.add("hidden");
    els.hud.classList.add("hidden");
    els.start.classList.remove("hidden");
  });
  if (els.editInGame) els.editInGame.addEventListener("click", () => window.TankWorkshop.open());

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
    stats: STATS,
    state,
    catalogCount: () => TankCatalog.count(),
  };

  resize();
  populateWorld();
  state.camera.x = WORLD.w / 2;
  state.camera.y = WORLD.h / 2;
  last = performance.now();
  requestAnimationFrame(frame);
  els.name.focus();
})();
