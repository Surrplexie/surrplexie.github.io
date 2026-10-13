/* Lava Spire — base visual demo.
   Movement uses the plan rates times R so a webpage shows the chase.
   Event lengths that a person just triggered stay on screen long enough to read. */
(function () {
  const W = 1080;
  const H = 1920;
  const PLAY_TOP = 176;
  const PLAY_BOT = 1492;
  const ANCHOR_Y = PLAY_TOP + (PLAY_BOT - PLAY_TOP) * 0.44;
  const SHAFT_L = 390;
  const SHAFT_R = 690;
  const PX = 52;
  const R = 3;
  const SLOT_MAX = 18;
  const FONT = "Segoe UI, Trebuchet MS, sans-serif";

  const COLORS = ["#ff6b6b", "#ff9f43", "#ffd93d", "#6bcb77", "#4d96ff", "#b983ff", "#ff7eb3", "#f4f1de"];

  const BIOMES = [
    { name: "Forest", shaft: "#1c3a2a", wall: "#2f6b45", accent: "#d6f25a", sky: "#87c8e6", deep: "#0e2418", boss: "Thorn Stag" },
    { name: "Cavern", shaft: "#241838", wall: "#4a3568", accent: "#7ee0ff", sky: "#120818", deep: "#140c20", boss: "Crystal Crawler" },
    { name: "Volcanic", shaft: "#2a1614", wall: "#4a2824", accent: "#ffb020", sky: "#3a1410", deep: "#140806", boss: "Slag Jaw" },
    { name: "Ice", shaft: "#d7eef8", wall: "#f4fbff", accent: "#3d7ea6", sky: "#9fd4ea", deep: "#1c4d6e", boss: "Frost Jaw" },
    { name: "Neon", shaft: "#120818", wall: "#241028", accent: "#ff3df2", sky: "#07040f", deep: "#ffe14a", boss: "Sign Moth" },
    { name: "Storm Glass", shaft: "#1a242c", wall: "#8fb4c4", accent: "#e8fff8", sky: "#6a7c88", deep: "#0e1418", boss: "Shard Kite" },
  ];

  const BANDS = [
    { id: 1, coins: 1, key: "1", label: "bud", verb: "joined the climb", life: 45000 },
    { id: 2, coins: 10, key: "2", label: "spark", verb: "sped the swarm", life: 45000 },
    { id: 3, coins: 30, key: "3", label: "crate", verb: "held the lava", life: 45000 },
    { id: 4, coins: 100, key: "4", label: "crown", verb: "started a frenzy", life: 50000 },
    { id: 5, coins: 500, key: "5", label: "flag", verb: "called a side boss", life: 50000 },
    { id: 6, coins: 2000, key: "6", label: "comet", verb: "landed a landmark", life: 60000 },
  ];

  const NAMES = ["Alex", "Sam", "Kai", "Noor", "Jules", "Ren", "Moss", "Pip", "Quinn", "Lux", "Bea", "Otto", "Nia", "Sol", "Vee", "Ash", "Rio", "Gem", "Wynn", "Tad", "Ivo", "Nell"];

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const state = {
    floor: 86,
    lava: 78,
    checkpoint: 50,
    prestige: 0,
    scars: [50],
    viewers: new Map(),
    slots: [],
    shadow: 24,
    bricks: [],
    wall: [],
    held: null,
    reelUntil: 0,
    reelNext: 0,
    ticker: [],
    fx: [],
    bubbles: [],
    boss: null,
    side: null,
    hazard: null,
    nextHazard: 0,
    nextBossFloor: 100,
    nextBossAt: 0,
    buffUntil: 0,
    buffStrength: 0,
    frenzyUntil: 0,
    holdUntil: 0,
    introUntil: 0,
    introViewer: null,
    weatherUntil: 0,
    punch: 0,
    collapsing: null,
    safeUntil: 0,
    lastGiftAt: 0,
    nameCursor: 0,
    cycle: 0,
    heat: 0,
    started: 0,
  };

  function hashColor(id) {
    let h = 2166136261;
    for (let i = 0; i < id.length; i++) {
      h ^= id.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return COLORS[(h >>> 0) % COLORS.length];
  }

  function biomeAt(floor) {
    return BIOMES[Math.abs(Math.floor(floor / 100)) % BIOMES.length];
  }

  function roundRect(x, y, w, h, r) {
    const radius = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function screenY(worldFloor, view) {
    return ANCHOR_Y - (worldFloor - view) * PX + state.punch;
  }

  function visualGap(gap) {
    if (gap <= 6.5) return gap;
    return 6.5 + 1.2 * (1 - Math.exp(-(gap - 6.5) / 12));
  }

  function viewFloor(now) {
    const c = state.collapsing;
    if (!c) return state.floor;
    const t = Math.min(1, (now - c.start) / c.dur);
    const e = t * t * (3 - 2 * t);
    return c.from + (c.to - c.from) * e;
  }

  function viewLava(now) {
    const c = state.collapsing;
    if (!c) return state.lava;
    const t = Math.min(1, (now - c.start) / c.dur);
    const e = t * t * (3 - 2 * t);
    return c.lavaFrom + (c.lavaTo - c.lavaFrom) * e;
  }

  function gapNow(now) {
    return viewFloor(now) - viewLava(now);
  }

  function legendItems() {
    const items = [];
    for (let i = 0; i < BANDS.length; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      items.push({
        band: i,
        x: 44 + col * 506,
        y: 1632 + row * 54,
        w: 486,
        h: 48,
      });
    }
    return items;
  }

  function ensureViewer(name) {
    const id = name.toLowerCase();
    let viewer = state.viewers.get(id);
    if (!viewer) {
      viewer = {
        id: id,
        name: name,
        color: hashColor(id),
        coins: 0,
        gifts: 0,
        band: 0,
        until: 0,
        hop: 0,
        pop: 0,
        cape: false,
        followed: false,
      };
      state.viewers.set(id, viewer);
    }
    return viewer;
  }

  function placeInFront(viewer) {
    const idx = state.slots.indexOf(viewer);
    if (idx >= 0) state.slots.splice(idx, 1);
    if (viewer.coins > 0 || viewer.cape) state.slots.unshift(viewer);
    else state.slots.push(viewer);
    while (state.slots.length > SLOT_MAX) {
      let worst = state.slots.length - 1;
      for (let i = state.slots.length - 1; i >= 0; i--) {
        if (!state.slots[i].cape) {
          worst = i;
          break;
        }
      }
      const dropped = state.slots.splice(worst, 1)[0];
      if (dropped !== viewer) state.shadow += 1;
    }
  }

  function pushTicker(name, verb, micro) {
    state.ticker.unshift({ name: name, verb: verb, micro: micro, at: performance.now() });
    if (state.ticker.length > 8) state.ticker.length = 8;
  }

  function addBrick(viewer, band, floor) {
    for (let i = state.bricks.length - 1; i >= 0; i--) {
      if (state.bricks[i].name === viewer.name) state.bricks.splice(i, 1);
    }
    state.bricks.push({
      name: viewer.name,
      floor: floor,
      band: band.id,
      label: band.label,
      born: performance.now(),
    });
    if (state.bricks.length > 8) state.bricks.splice(0, state.bricks.length - 8);
  }

  function paintWall(viewer, band, floor) {
    state.wall.push({
      name: viewer.name,
      floor: floor,
      band: band.id,
      label: band.label,
      side: state.wall.length % 2,
    });
    if (state.wall.length > 40) state.wall.splice(0, state.wall.length - 40);
  }

  function holdName(name, now) {
    state.held = { name: name, until: now + 8000 };
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      if (state.fx.length >= 30) return;
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 110;
      state.fx.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        life: 0.55 + Math.random() * 0.35,
        max: 0.9,
        color: color,
        size: 4 + Math.random() * 5,
      });
    }
  }

  function nextName() {
    const name = NAMES[state.nameCursor % NAMES.length];
    state.nameCursor += 1;
    return name;
  }

  function applyBuff(now, coins) {
    const dur = Math.min(25000, (4 + 2 * Math.log2(1 + coins)) * 1000);
    const strength = Math.min(0.8, 0.22 + 0.12 * Math.log2(1 + coins));
    state.buffUntil = Math.min(now + 25000, Math.max(state.buffUntil, now + dur));
    state.buffStrength = Math.min(0.8, Math.max(state.buffStrength, strength));
  }

  function spawnBoss(now) {
    const biome = biomeAt(state.floor);
    const scale = 1 + 0.35 * Math.log2(1 + state.heat);
    const max = 100 * scale;
    state.boss = { name: biome.boss, hp: max, max: max, flash: 0, biome: biome.name };
    pushTicker("Boss", biome.boss + " blocks the shaft", false);
  }

  function spawnSide(now, biome) {
    state.side = { name: biome.boss, hp: 100, max: 100, flash: 0 };
  }

  function sendBand(index, now) {
    const band = BANDS[index];
    if (!band) return;
    const viewer = ensureViewer(nextName());
    viewer.coins += band.coins;
    viewer.gifts += 1;
    viewer.band = band.id;
    viewer.until = now + band.life;
    viewer.hop = 1;
    viewer.pop = 1;
    if (band.id >= 4) viewer.band = band.id;
    if (band.id === 6) viewer.cape = true;
    placeInFront(viewer);

    const hop = 0.35 * Math.log2(1 + band.coins);
    if (state.collapsing) state.collapsing.to += hop;
    else state.floor += hop;

    addBrick(viewer, band, viewFloor(now));
    paintWall(viewer, band, viewFloor(now));
    holdName(viewer.name, now);
    pushTicker(viewer.name, band.verb, band.id <= 2);
    state.heat += band.coins;
    state.lastGiftAt = now;

    if (band.id >= 2) applyBuff(now, band.coins);
    if (band.id === 3) state.holdUntil = now + 5000;
    if (band.id === 4) state.frenzyUntil = now + 12000;
    if (band.id === 5) spawnSide(now, biomeAt(viewFloor(now)));
    if (band.id === 6) {
      state.introUntil = now + 3500;
      state.introViewer = viewer;
      state.weatherUntil = now + 12000;
      state.checkpoint = Math.floor(viewFloor(now));
      if (!state.scars.includes(state.checkpoint)) state.scars.push(state.checkpoint);
    }
    if (band.id >= 4) state.punch = -36;

    const y = screenY(viewFloor(now), viewFloor(now));
    burst(540, y - 20, band.id >= 4 ? "#ffc857" : viewer.color, band.id >= 5 ? 14 : 8);
  }

  function addFollow(now, name) {
    const viewer = ensureViewer(name || nextName());
    if (viewer.followed) return false;
    viewer.followed = true;
    viewer.until = Math.max(viewer.until, now + 50000);
    if (!viewer.band) viewer.band = 0;
    viewer.pop = Math.max(viewer.pop, 0.7);
    viewer.hop = Math.max(viewer.hop, 0.85);
    placeInFront(viewer);
    if (state.collapsing) state.collapsing.to += 0.5;
    else state.floor += 0.5;
    const alreadyNamed = state.bricks.some(function (brick) { return brick.name === viewer.name; });
    if (!alreadyNamed) addBrick(viewer, { id: 0, label: "follow" }, viewFloor(now));
    holdName(viewer.name, now);
    pushTicker(viewer.name, "followed the climb", true);
    const y = screenY(viewFloor(now), viewFloor(now));
    burst(540, y - 20, viewer.color, 6);
    return true;
  }

  function addCrew(now) {
    const viewer = ensureViewer(nextName());
    if (viewer.followed || viewer.coins > 0) return;
    viewer.until = Math.max(viewer.until, now + 20000);
    if (!viewer.band) viewer.band = 0;
    viewer.pop = Math.max(viewer.pop, 0.4);
    placeInFront(viewer);
  }

  function startCollapse(now) {
    if (state.collapsing || now < state.safeUntil) return;
    const from = state.floor;
    const to = Math.max(state.checkpoint, from - 20);
    state.collapsing = {
      from: from,
      to: to,
      lavaFrom: state.lava,
      lavaTo: to - 8,
      start: now,
      dur: 5500,
    };
    state.boss = null;
    state.side = null;
    if (!state.scars.includes(Math.floor(from))) state.scars.push(Math.floor(from));
    pushTicker("Spire", "slipped to floor " + Math.floor(to), false);
  }

  function finishCollapse(now) {
    const c = state.collapsing;
    state.floor = c.to;
    state.lava = c.lavaTo;
    state.prestige = Math.min(20, state.prestige + 1);
    state.collapsing = null;
    state.safeUntil = now + 2500;
    state.nextBossFloor = Math.floor(state.floor) + 50;
    state.nextBossAt = now + 70000;
    state.hazard = null;
  }

  function winBoss(now) {
    const name = state.boss ? state.boss.name : "Boss";
    state.checkpoint = Math.floor(state.floor);
    if (!state.scars.includes(state.checkpoint)) state.scars.push(state.checkpoint);
    state.boss = null;
    state.nextBossFloor = Math.floor(state.floor) + 50;
    state.nextBossAt = now + 70000;
    pushTicker("Checkpoint", name + " fell", false);
    burst(540, 430, "#ffd56a", 16);
  }

  function update(now, dt) {
    if (!state.started) state.started = now;
    if (!state.nextHazard) state.nextHazard = now + 4000;
    if (!state.nextBossAt) state.nextBossAt = now + 240000;

    state.punch *= Math.exp(-dt * 6);
    state.heat *= Math.exp(-dt / 18);
    if (now > state.buffUntil) state.buffStrength = 0;

    for (const viewer of state.slots) {
      viewer.hop = Math.max(0, viewer.hop - dt / 0.42);
      viewer.pop = Math.max(0, viewer.pop - dt / 0.3);
    }

    const expired = [];
    state.slots = state.slots.filter(function (viewer) {
      if (viewer.until > now) return true;
      expired.push(viewer);
      return false;
    });
    state.shadow += expired.length;

    if (state.collapsing) {
      if (now - state.collapsing.start >= state.collapsing.dur) finishCollapse(now);
    } else {
      let climb = 0.1 * R * (1 + Math.min(0.4, state.prestige * 0.02));
      let boost = 1;
      if (now < state.buffUntil) boost = 1 + state.buffStrength;
      if (now < state.frenzyUntil) boost = Math.max(boost, 2);
      climb *= boost;
      state.floor += climb * dt;

      const gap = state.floor - state.lava;
      let lavaRate = now < state.holdUntil ? 0 : 0.07 * R;
      if (gap < 3) lavaRate *= 0.5;
      if (gap > 9 && now >= state.holdUntil) {
        lavaRate += Math.min(0.22, (gap - 9) * 0.018) * R;
      }

      if (now >= state.nextHazard) {
        const kinds = gap > 35 ? ["wind", "meteor"] : ["rock", "gust", "drip", "quake"];
        state.hazard = {
          type: kinds[Math.floor(Math.random() * kinds.length)],
          until: now + 6000 / R,
          power: gap < 3 ? 0.5 : 1,
          born: now,
        };
        state.nextHazard = now + 40000 / R;
      }
      if (state.hazard && now < state.hazard.until && now >= state.holdUntil) {
        lavaRate += 0.35 * R * state.hazard.power;
      } else if (state.hazard && now >= state.hazard.until) {
        state.hazard = null;
      }

      state.lava += lavaRate * dt;

      if (gap > 60 && !state.boss) state.nextBossAt = Math.min(state.nextBossAt, now + 4000);

      if (!state.boss && (state.floor >= state.nextBossFloor || now >= state.nextBossAt)) {
        spawnBoss(now);
      }

      if (state.boss) {
        state.boss.hp -= state.boss.max * (dt / 30);
        state.boss.flash = Math.max(0, state.boss.flash - dt);
        if (Math.floor(now / 700) !== Math.floor((now - dt * 1000) / 700)) state.boss.flash = 0.18;
        if (state.boss.hp <= 0) winBoss(now);
      }

      if (state.side) {
        state.side.hp -= state.side.max * (dt / 12);
        state.side.flash = Math.max(0, state.side.flash - dt);
        if (state.side.hp <= 0) {
          burst(880, 366, "#ffc857", 12);
          pushTicker("Side boss", "the swarm cracked it", false);
          state.side = null;
        }
      }

      if (now >= state.safeUntil && state.lava >= state.floor - 0.2) startCollapse(now);

      if (!state.reelNext) state.reelNext = now + 3600000;
      if (now >= state.reelNext) {
        state.reelUntil = now + 12000;
        state.reelNext = now + 3600000;
      }
    }

    state.crewTimer = (state.crewTimer || 0) - dt;
    if (state.slots.length < 8 && state.crewTimer <= 0) {
      addCrew(now);
      state.crewTimer = 2.4;
    }

    for (let i = state.fx.length - 1; i >= 0; i--) {
      const p = state.fx[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 80 * dt;
      if (p.life <= 0) state.fx.splice(i, 1);
    }

    state.cycle += dt;
  }

  function drawClimber(viewer, x, y, now, slip) {
    const band = viewer.band || 0;
    let scale = band >= 4 ? 1.48 : band >= 1 ? 1.12 : 1;
    if (viewer.cape && state.introViewer === viewer && now < state.introUntil) scale = 2.15;
    scale *= 1 + viewer.pop * 0.18;
    const step = Math.sin(now / (now < state.frenzyUntil ? 90 : 180) + x) * 5;
    const hopY = Math.sin(viewer.hop * Math.PI) * 34;

    ctx.save();
    ctx.translate(x, y - hopY);
    ctx.scale(scale, scale);
    if (slip) ctx.rotate(-0.4);

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(0, 30, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (viewer.cape) {
      ctx.fillStyle = "#ffc857";
      ctx.beginPath();
      ctx.moveTo(-6, -6);
      ctx.quadraticCurveTo(-26, 8, -16, 28);
      ctx.lineTo(4, 8);
      ctx.fill();
    }

    ctx.strokeStyle = "#1a1218";
    ctx.lineWidth = 3;
    ctx.fillStyle = viewer.color;
    roundRect(-9, 6, 8, 16 + step, 3);
    ctx.fill();
    roundRect(2, 6, 8, 16 - step, 3);
    ctx.fill();

    roundRect(-15, -14, 30, 26, 9);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -24, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#1a1218";
    const look = slip ? 2 : 0;
    ctx.fillRect(-7, -26 + look, 4, 5);
    ctx.fillRect(3, -26 + look, 4, 5);

    if (band >= 4) {
      ctx.fillStyle = "#ffc857";
      ctx.strokeStyle = "#1a1218";
      ctx.beginPath();
      ctx.moveTo(-12, -34);
      ctx.lineTo(-6, -46);
      ctx.lineTo(0, -36);
      ctx.lineTo(6, -48);
      ctx.lineTo(12, -34);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (band >= 2) {
      ctx.fillStyle = "#1a1218";
      roundRect(-12, -40, 24, 8, 3);
      ctx.fill();
      roundRect(-7, -46, 14, 8, 3);
      ctx.fill();
    }

    if (band >= 1) drawProp(band, viewer.color);
    if (band === 3 || (viewer.cape && now < state.weatherUntil)) {
      ctx.strokeStyle = band >= 6 ? "#ffc857" : "#7ee0ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 28 + Math.sin(now / 120) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawProp(band, color) {
    ctx.save();
    ctx.translate(16, 2);
    ctx.fillStyle = band >= 4 ? "#ffc857" : color;
    ctx.strokeStyle = "#1a1218";
    ctx.lineWidth = 2;
    if (band <= 1) {
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (band === 2) {
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(3, -1);
      ctx.lineTo(10, 0);
      ctx.lineTo(3, 1);
      ctx.lineTo(0, 8);
      ctx.lineTo(-3, 1);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-3, -1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (band === 3) {
      roundRect(-7, -6, 14, 12, 2);
      ctx.fill();
      ctx.stroke();
    } else if (band === 5) {
      ctx.fillRect(-2, -8, 3, 18);
      ctx.beginPath();
      ctx.moveTo(1, -8);
      ctx.lineTo(14, -2);
      ctx.lineTo(1, 4);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawShaftBoss(biome, boss) {
    const x = SHAFT_L + 16;
    const y = ANCHOR_Y - 355;
    const w = SHAFT_R - SHAFT_L - 32;
    const h = 188;
    ctx.fillStyle = boss.flash > 0 ? "#fff6e8" : "#120e14";
    ctx.strokeStyle = biome.accent;
    ctx.lineWidth = 8;
    roundRect(x, y, w, h, 24);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = biome.accent;
    if (biome.name === "Forest") {
      ctx.beginPath();
      ctx.moveTo(x + 30, y + 8);
      ctx.lineTo(x + 70, y - 48);
      ctx.lineTo(x + 110, y + 8);
      ctx.lineTo(x + 150, y - 58);
      ctx.lineTo(x + 190, y + 8);
      ctx.lineTo(x + 230, y - 44);
      ctx.lineTo(x + w - 24, y + 8);
      ctx.fill();
    } else if (biome.name === "Cavern" || biome.name === "Ice") {
      for (let i = 0; i < 4; i++) {
        const cx = x + 28 + i * 58;
        ctx.beginPath();
        ctx.moveTo(cx, y + 6);
        ctx.lineTo(cx + 18, y - 42);
        ctx.lineTo(cx + 36, y + 6);
        ctx.fill();
      }
    } else if (biome.name === "Neon") {
      ctx.fillRect(x + 18, y - 28, w - 36, 22);
    } else {
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + 4, 70, 28, 0, Math.PI, 0);
      ctx.fill();
    }
    ctx.fillStyle = "#fff6e8";
    ctx.beginPath();
    ctx.arc(x + w * 0.34, y + h * 0.58, 16, 0, Math.PI * 2);
    ctx.arc(x + w * 0.66, y + h * 0.58, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a1218";
    ctx.beginPath();
    ctx.arc(x + w * 0.34, y + h * 0.58, 7, 0, Math.PI * 2);
    ctx.arc(x + w * 0.66, y + h * 0.58, 7, 0, Math.PI * 2);
    ctx.fill();
    bar(x + 8, y - 26, w - 16, 16, boss.hp / boss.max, "#ff5a1f", "#1a1210");
    ctx.fillStyle = "#fff6e8";
    ctx.font = "700 24px " + FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(boss.name, x + w / 2, y - 36);
  }

  function drawBossBody(biomeName, flash) {
    ctx.fillStyle = flash > 0 ? "#fff6e8" : "#1a1218";
    ctx.strokeStyle = "#1a1218";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 8, 78, 46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    const accent = BIOMES.find(function (b) { return b.boss && b.name === biomeName; });
    ctx.fillStyle = flash > 0 ? "#fff6e8" : (accent ? accent.accent : "#ffb020");
    if (biomeName === "Forest") {
      ctx.beginPath();
      ctx.moveTo(-40, -10);
      ctx.lineTo(-70, -48);
      ctx.lineTo(-20, -16);
      ctx.lineTo(0, -52);
      ctx.lineTo(20, -16);
      ctx.lineTo(70, -48);
      ctx.lineTo(40, -10);
      ctx.fill();
    } else if (biomeName === "Cavern") {
      ctx.beginPath();
      ctx.moveTo(-50, 10);
      ctx.lineTo(-30, -40);
      ctx.lineTo(0, -10);
      ctx.lineTo(24, -46);
      ctx.lineTo(52, 8);
      ctx.fill();
    } else if (biomeName === "Ice") {
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 18 - 6, 8);
        ctx.lineTo(i * 18, -28);
        ctx.lineTo(i * 18 + 6, 8);
        ctx.fill();
      }
    } else if (biomeName === "Neon") {
      ctx.beginPath();
      ctx.ellipse(-52, -6, 36, 18, -0.4, 0, Math.PI * 2);
      ctx.ellipse(52, -6, 36, 18, 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (biomeName === "Storm Glass") {
      ctx.beginPath();
      ctx.moveTo(0, -50);
      ctx.lineTo(36, 0);
      ctx.lineTo(0, 42);
      ctx.lineTo(-36, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(0, 6, 34, 22, 0, 0, Math.PI);
      ctx.fill();
    }
    ctx.fillStyle = "#1a1218";
    ctx.beginPath();
    ctx.arc(-16, 0, 5, 0, Math.PI * 2);
    ctx.arc(16, 0, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function bar(x, y, w, h, pct, fill, back) {
    roundRect(x, y, w, h, 6);
    ctx.fillStyle = back;
    ctx.fill();
    roundRect(x, y, Math.max(8, w * Math.max(0, Math.min(1, pct))), h, 6);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function tickerLines() {
    const lines = state.ticker.slice(0, 3);
    const landmarkUp = state.introViewer && performance.now() < state.weatherUntil;
    if (landmarkUp && lines.every(function (line) { return !line.micro; })) {
      const micro = state.ticker.find(function (line) { return line.micro; });
      if (micro) lines[2] = micro;
    }
    return lines;
  }

  function drawAhead(biome, view, now) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(SHAFT_L + 12, PLAY_TOP + 16, SHAFT_R - SHAFT_L - 24, ANCHOR_Y - PLAY_TOP - 160);
    ctx.clip();
    ctx.strokeStyle = biome.accent;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.45;
    for (let i = 0; i < 6; i++) {
      const x = SHAFT_L + 36 + i * 42;
      const sway = Math.sin(now / 700 + i) * 10;
      ctx.beginPath();
      ctx.moveTo(x, PLAY_TOP + 18);
      ctx.quadraticCurveTo(x + sway, PLAY_TOP + 90, x - sway, PLAY_TOP + 170);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#fff6e8";
    ctx.font = "700 18px " + FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const gate = state.nextBossFloor;
    for (let f = Math.ceil(view); f < view + 16; f++) {
      const y = screenY(f, view);
      if (y < PLAY_TOP + 24 || y > ANCHOR_Y - 70) continue;
      if (f % 5 !== 0) continue;
      if (state.boss && y > 300 && y < 680) continue;
      ctx.fillStyle = f === gate ? "#ff5a1f" : "rgba(255,246,232,0.75)";
      ctx.fillText(f === gate ? f + " BOSS" : String(f), 540, y - 8);
    }
    ctx.restore();
  }

  function draw(now) {
    const view = viewFloor(now);
    const lava = viewLava(now);
    const gap = view - lava;
    const biome = biomeAt(view);
    const shake = state.hazard && state.hazard.type === "quake" ? Math.sin(now / 28) * 7 : 0;

    ctx.clearRect(0, 0, W, H);
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, biome.deep);
    sky.addColorStop(0.45, biome.sky);
    sky.addColorStop(1, "#120c14");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, PLAY_TOP, W, PLAY_BOT - PLAY_TOP);
    ctx.clip();
    ctx.translate(shake, 0);

    for (let side = 0; side < 2; side++) {
      const x = side === 0 ? 28 : 708;
      ctx.fillStyle = "rgba(10,8,12,0.62)";
      roundRect(x, PLAY_TOP + 8, 344, PLAY_BOT - PLAY_TOP - 16, 18);
      ctx.fill();
      ctx.fillStyle = biome.wall;
      ctx.globalAlpha = 0.28;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    const nameSlots = [];
    const seenNames = {};
    for (let i = state.bricks.length - 1; i >= 0 && nameSlots.length < 8; i--) {
      const brick = state.bricks[i];
      if (seenNames[brick.name]) continue;
      seenNames[brick.name] = true;
      nameSlots.push(brick);
    }
    const nameX = [44, 724];
    const nameY = [512, 600, 688, 776];
    nameSlots.forEach(function (brick, n) {
      const row = Math.floor(n / 2);
      const x = nameX[n % 2];
      const y = nameY[row];
      const wide = 312;
      const tall = 64;
      ctx.save();
      ctx.globalAlpha = [1, 0.78, 0.52, 0.32][row];
      roundRect(x, y, wide, tall, 10);
      ctx.clip();
      ctx.fillStyle = brick.band >= 6 ? "#ffc857" : "#1a1210";
      ctx.fillRect(x, y, wide, tall);
      ctx.strokeStyle = biome.accent;
      ctx.lineWidth = 2;
      roundRect(x + 1, y + 1, wide - 2, tall - 2, 10);
      ctx.stroke();
      ctx.fillStyle = brick.band >= 6 ? "#1a1218" : "#fff6e8";
      ctx.font = "700 22px " + FONT;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("@" + brick.name, x + 14, y + (brick.band >= 4 || brick.band === 0 ? 24 : 32));
      if (brick.band >= 4 || brick.band === 0) {
        ctx.font = "700 16px " + FONT;
        ctx.fillStyle = brick.band >= 6 ? "#6a4a12" : biome.accent;
        ctx.fillText(brick.label, x + 14, y + 46);
      }
      const owner = state.viewers.get(brick.name.toLowerCase());
      if (owner && owner.gifts >= 3) {
        ctx.fillStyle = "#ffc857";
        ctx.beginPath();
        ctx.arc(x + wide - 22, y + 20, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    ctx.fillStyle = biome.shaft;
    roundRect(SHAFT_L, PLAY_TOP + 8, SHAFT_R - SHAFT_L, PLAY_BOT - PLAY_TOP - 16, 28);
    ctx.fill();
    ctx.strokeStyle = "#0c1210";
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.strokeStyle = biome.accent;
    ctx.lineWidth = 3;
    ctx.stroke();
    drawAhead(biome, view, now);

    const topFloor = view + (ANCHOR_Y - PLAY_TOP) / PX + 2;
    const botFloor = view - (PLAY_BOT - ANCHOR_Y) / PX - 2;
    for (let f = Math.floor(botFloor); f <= Math.ceil(topFloor); f++) {
      const y = screenY(f, view);
      ctx.fillStyle = "rgba(255,246,232,0.16)";
      ctx.fillRect(SHAFT_L + 28, y, SHAFT_R - SHAFT_L - 56, 5);
      if (state.scars.indexOf(f) !== -1) {
        ctx.fillStyle = "rgba(255,246,232,0.55)";
        ctx.fillRect(SHAFT_L + 18, y - 2, SHAFT_R - SHAFT_L - 36, 8);
      }
    }

    drawWall(view, state.lava, false);

    const lavaY = screenY(view - visualGap(gap), view);
    const shownLava = lavaY;
    if (shownLava < PLAY_BOT) {
      const g = ctx.createLinearGradient(0, shownLava - 20, 0, PLAY_BOT);
      g.addColorStop(0, "rgba(255,213,106,0)");
      g.addColorStop(0.08, "#ffd56a");
      g.addColorStop(0.2, "#ff5a1f");
      g.addColorStop(1, "#9a1c12");
      ctx.save();
      roundRect(SHAFT_L + 10, PLAY_TOP + 16, SHAFT_R - SHAFT_L - 20, PLAY_BOT - PLAY_TOP - 32, 20);
      ctx.clip();
      ctx.fillStyle = g;
      ctx.fillRect(SHAFT_L, shownLava, SHAFT_R - SHAFT_L, PLAY_BOT - shownLava + 40);
      ctx.fillStyle = "rgba(255,213,106,0.85)";
      for (let i = 0; i < 7; i++) {
        const bx = SHAFT_L + 40 + ((i * 97 + now / 18) % 230);
        const by = shownLava + 16 + ((i * 53 + now / 12) % 80);
        ctx.beginPath();
        ctx.arc(bx, by, 5 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (now < state.holdUntil) {
      ctx.save();
      roundRect(SHAFT_L + 10, shownLava - 4, SHAFT_R - SHAFT_L - 20, PLAY_BOT - shownLava, 16);
      ctx.clip();
      ctx.fillStyle = "rgba(90, 210, 255, 0.72)";
      ctx.fillRect(SHAFT_L, shownLava, SHAFT_R - SHAFT_L, PLAY_BOT - shownLava);
      ctx.fillStyle = "#f7fdff";
      ctx.fillRect(SHAFT_L + 16, shownLava - 6, SHAFT_R - SHAFT_L - 32, 18);
      for (let i = 0; i < 6; i++) {
        const ix = SHAFT_L + 36 + i * 40;
        ctx.beginPath();
        ctx.moveTo(ix, shownLava);
        ctx.lineTo(ix + 8, shownLava - 22);
        ctx.lineTo(ix + 16, shownLava);
        ctx.fill();
      }
      ctx.restore();
    }

    drawWall(view, state.lava, true);

    if (now < state.frenzyUntil) {
      ctx.fillStyle = "rgba(255, 196, 64, 0.14)";
      ctx.fillRect(SHAFT_L + 12, PLAY_TOP + 16, SHAFT_R - SHAFT_L - 24, PLAY_BOT - PLAY_TOP - 32);
      ctx.strokeStyle = "rgba(255, 214, 120, 0.55)";
      ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) {
        const y = ANCHOR_Y - 80 + ((now / 4 + i * 36) % 160);
        ctx.beginPath();
        ctx.moveTo(SHAFT_L + 24, y);
        ctx.lineTo(SHAFT_R - 24, y - 18);
        ctx.stroke();
      }
    }

    if (state.hazard && state.hazard.type === "meteor") {
      const t = (now - state.hazard.born) / (state.hazard.until - state.hazard.born);
      ctx.fillStyle = "#ffb020";
      ctx.beginPath();
      ctx.arc(540, PLAY_TOP + t * (PLAY_BOT - PLAY_TOP), 28, 0, Math.PI * 2);
      ctx.fill();
    } else if (state.hazard && (state.hazard.type === "gust" || state.hazard.type === "wind")) {
      ctx.strokeStyle = "rgba(255,246,232,0.7)";
      ctx.lineWidth = state.hazard.type === "wind" ? 8 : 4;
      for (let i = 0; i < 4; i++) {
        const y = PLAY_TOP + 120 + i * 70 + (now / 8) % 40;
        ctx.beginPath();
        ctx.moveTo(SHAFT_L + 20, y);
        ctx.lineTo(SHAFT_R - 20, y - 16);
        ctx.stroke();
      }
    } else if (state.hazard && state.hazard.type === "rock") {
      const t = (now - state.hazard.born) / (state.hazard.until - state.hazard.born);
      ctx.fillStyle = "#6b4a2a";
      ctx.beginPath();
      ctx.arc(500, PLAY_TOP + 40 + t * 400, 22, 0, Math.PI * 2);
      ctx.fill();
    } else if (state.hazard && state.hazard.type === "drip") {
      ctx.fillStyle = "#ff5a1f";
      ctx.fillRect(528, PLAY_TOP + 30, 10, 40 + (now / 10) % 80);
    }

    if (state.boss) {
      drawShaftBoss(biome, state.boss);
    }

    ctx.fillStyle = "rgba(255,246,232,0.35)";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(SHAFT_L + 48 + i * 46, Math.min(PLAY_BOT - 36, screenY(lava, view) - 28), 7, 0, Math.PI * 2);
      ctx.fill();
    }

    const named = Math.min(2, state.slots.length);
    for (let i = state.slots.length - 1; i >= 0; i--) {
      const viewer = state.slots[i];
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = 540 + (col ? 82 : -82);
      const y = screenY(view - row * 1.28, view);
      const slip = gap < 5 && i === state.slots.length - 1;
      drawClimber(viewer, x, y, now, slip);
      if (i < named) {
        const lift = (viewer.band >= 4 ? 108 : 78) + (slip ? 8 : 0);
        drawPlate(viewer, x, y - lift);
      }
    }

    state.fx.forEach(function (p) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    if (now < state.weatherUntil) {
      ctx.fillStyle = biome.accent;
      for (let i = 0; i < 14; i++) {
        const x = SHAFT_L + 16 + ((i * 67 + now / 6) % (SHAFT_R - SHAFT_L - 32));
        const y = PLAY_TOP + 20 + ((i * 113 + now / 4) % (PLAY_BOT - PLAY_TOP - 40));
        ctx.fillRect(x, y, 3, 14);
      }
    }

    if (gap <= 5) {
      const named = state.held && now < state.held.until;
      const gy = state.boss ? ANCHOR_Y - 130 : PLAY_TOP + 270;
      ctx.fillStyle = "rgba(26,18,16,0.78)";
      roundRect(400, gy - 64, 280, named ? 168 : 112, 18);
      ctx.fill();
      ctx.fillStyle = "#ff3b3b";
      ctx.font = "700 72px " + FONT;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(Math.max(0, gap).toFixed(1), 540, gy);
      if (named) {
        ctx.fillStyle = "#fff6e8";
        ctx.font = "700 28px " + FONT;
        ctx.fillText("@" + state.held.name, 540, gy + 52);
        ctx.fillStyle = "#ffc857";
        ctx.font = "700 18px " + FONT;
        ctx.fillText("held it", 540, gy + 80);
      }
    }

    ctx.restore();

    drawPitch();

    if (state.side) {
      const sx = 880;
      const sy = 366;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.scale(1.2, 1.2);
      drawBossBody(biome.name, state.side.flash);
      ctx.restore();
      bar(sx - 80, sy - 90, 160, 14, state.side.hp / state.side.max, "#ffc857", "#1a1210");
    }

    drawHud(now, view, gap, biome);
    drawTicker();
    drawLegend(now);
    drawReel(now);

    if (state.introViewer && now < state.introUntil) {
      ctx.fillStyle = "rgba(7,6,10,0.82)";
      roundRect(SHAFT_L + 10, 188, SHAFT_R - SHAFT_L - 20, 84, 14);
      ctx.fill();
      ctx.fillStyle = "#ffc857";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.font = "700 40px " + FONT;
      ctx.fillText("@" + state.introViewer.name, 540, 238);
      ctx.fillStyle = "#fff6e8";
      ctx.font = "700 18px " + FONT;
      ctx.fillText("landmark on the spire", 540, 258);
    }
  }

  function drawWall(view, lava, sunkOnly) {
    state.wall.forEach(function (brick) {
      const sunk = brick.floor < lava - 0.15;
      if (sunk !== sunkOnly) return;
      const y = screenY(brick.floor, view);
      if (y < PLAY_TOP + 24 || y > PLAY_BOT - 16) return;
      const text = "@" + brick.name;
      ctx.save();
      ctx.font = "700 16px " + FONT;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const w = ctx.measureText(text).width + 14;
      const x = brick.side ? SHAFT_R - 18 - w : SHAFT_L + 18;
      ctx.globalAlpha = sunk ? 0.42 : 0.92;
      if (!sunk) {
        ctx.fillStyle = "rgba(12,8,14,0.62)";
        roundRect(x, y - 13, w, 26, 7);
        ctx.fill();
      }
      ctx.fillStyle = brick.band >= 6 ? "#ffc857" : "#fff6e8";
      ctx.fillText(text, x + 7, y);
      ctx.restore();
    });
  }

  function reelNames() {
    const marks = [];
    const seen = {};
    for (let i = state.wall.length - 1; i >= 0 && marks.length < 5; i--) {
      const brick = state.wall[i];
      if (brick.band < 6 || seen[brick.name]) continue;
      seen[brick.name] = true;
      marks.push(brick.name);
    }
    if (marks.length) return marks;
    const ranked = [];
    state.viewers.forEach(function (viewer) {
      if (viewer.gifts > 0) ranked.push(viewer);
    });
    ranked.sort(function (a, b) { return b.coins - a.coins; });
    return ranked.slice(0, 5).map(function (viewer) { return viewer.name; });
  }

  function drawReel(now) {
    if (!state.reelUntil || now >= state.reelUntil) return;
    const names = reelNames();
    if (!names.length) return;
    const t = Math.max(0, Math.min(1, (now - (state.reelUntil - 12000)) / 12000));
    ctx.save();
    ctx.fillStyle = "rgba(7,6,10,0.9)";
    roundRect(SHAFT_L, PLAY_TOP + 8, SHAFT_R - SHAFT_L, PLAY_BOT - PLAY_TOP - 16, 28);
    ctx.fill();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffc857";
    ctx.font = "700 22px " + FONT;
    ctx.fillText("THIS HOUR", 540, PLAY_TOP + 78);
    names.forEach(function (name, i) {
      const y = PLAY_TOP + 200 + i * 96 - t * 70;
      ctx.fillStyle = "#fff6e8";
      ctx.font = "700 40px " + FONT;
      ctx.fillText("@" + name, 540, y);
    });
    ctx.restore();
  }

  function drawPlate(viewer, x, y) {
    const text = "@" + viewer.name;
    ctx.font = "700 22px " + FONT;
    const w = ctx.measureText(text).width + (viewer.gifts >= 3 ? 28 : 18);
    ctx.fillStyle = "rgba(26,18,16,0.9)";
    roundRect(x - w / 2, y - 16, w, 28, 8);
    ctx.fill();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = viewer.gifts >= 3 ? "#ffc857" : "#fff6e8";
    ctx.fillText(text, x + (viewer.gifts >= 3 ? 6 : 0), y);
    if (viewer.gifts >= 3) {
      ctx.fillStyle = "#ffc857";
      ctx.beginPath();
      ctx.arc(x - w / 2 + 14, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPitch() {
    const lines = [
      "Follow once, name goes up",
      "$1 puts your name up",
      "Any gift shows on screen",
      "Big gifts steal the scene",
      "Climb before lava hits",
    ];
    const x = 40;
    const y = 196;
    const w = 328;
    const h = 292;
    ctx.fillStyle = "rgba(12, 8, 14, 0.92)";
    ctx.strokeStyle = "#ffc857";
    ctx.lineWidth = 3;
    roundRect(x, y, w, h, 16);
    ctx.fill();
    ctx.stroke();
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "700 22px " + FONT;
    lines.forEach(function (line, i) {
      const ly = y + 36 + i * 52;
      ctx.fillStyle = "#ffc857";
      ctx.beginPath();
      ctx.arc(x + 28, ly, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff6e8";
      ctx.fillText(line, x + 48, ly);
    });
  }

  function drawHud(now, view, gap, biome) {
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff6e8";
    ctx.font = "700 48px " + FONT;
    ctx.fillText("FLOOR " + Math.floor(view), 44, 78);
    ctx.font = "700 28px " + FONT;
    ctx.fillStyle = gap <= 5 ? "#ff3b3b" : "#b6f27a";
    if (gap > 5) ctx.fillText("GAP " + Math.max(0, gap).toFixed(1), 48, 122);
    ctx.fillStyle = "rgba(255,246,232,0.8)";
    ctx.font = "700 22px " + FONT;
    let crowd = "+" + state.shadow + " CLIMBING";
    if (state.slots.length > 6) {
      const shown = state.slots[6 + (Math.floor(state.cycle / 2) % (state.slots.length - 6))];
      crowd += "  ·  @" + shown.name;
    }
    ctx.fillText(crowd, 48, 158);

    ctx.textAlign = "right";
    ctx.fillStyle = biome.accent;
    ctx.font = "700 32px " + FONT;
    ctx.fillText(biome.name.toUpperCase(), 1036, 72);
    const mvp = topViewer();
    ctx.fillStyle = "#ffc857";
    ctx.font = "700 24px " + FONT;
    ctx.fillText(mvp ? "MVP @" + mvp.name + "  " + mvp.coins : "MVP —", 1036, 112);

    ctx.textAlign = "center";
    ctx.fillStyle = "#fff6e8";
    ctx.font = "700 26px " + FONT;
    if (state.boss) {
      ctx.fillText("BOSS HP " + Math.max(0, Math.ceil(state.boss.hp / state.boss.max * 100)) + "%", 540, 156);
    } else {
      const floorsLeft = Math.max(0, state.nextBossFloor - view);
      const secsLeft = Math.max(0, (state.nextBossAt - now) / 1000);
      const byFloor = floorsLeft / Math.max(0.15, 0.1 * R);
      const eta = Math.min(byFloor, secsLeft);
      const m = Math.floor(eta / 60);
      const s = Math.floor(eta % 60);
      ctx.fillText("BOSS IN " + m + ":" + String(s).padStart(2, "0"), 540, 156);
    }

    const chips = [];
    if (now < state.frenzyUntil) chips.push("FRENZY");
    else if (now < state.buffUntil) chips.push("SWARM +" + Math.round(state.buffStrength * 100) + "%");
    if (now < state.holdUntil) chips.push("LAVA HELD");
    if (state.prestige > 0) chips.push("PRESTIGE " + state.prestige);
    if (chips.length) {
      ctx.font = "700 20px " + FONT;
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffc857";
      ctx.fillText(chips.join("   "), 1036, 148);
    }
  }

  function topViewer() {
    let best = null;
    state.viewers.forEach(function (viewer) {
      if (viewer.coins > 0 && (!best || viewer.coins > best.coins)) best = viewer;
    });
    return best;
  }

  function drawTicker() {
    const lines = tickerLines();
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "700 26px " + FONT;
    for (let i = 0; i < 3; i++) {
      const y = 1516 + i * 36;
      ctx.fillStyle = "rgba(26,18,16,0.88)";
      roundRect(44, y - 18, 992, 36, 8);
      ctx.fill();
      const line = lines[i];
      if (!line) continue;
      ctx.fillStyle = line.micro ? "#fff6e8" : "#ffc857";
      ctx.fillText("@" + line.name, 60, y);
      ctx.fillStyle = "#fff6e8";
      ctx.fillText(line.verb, 280, y);
    }
  }

  function drawLegend(now) {
    const quiet = !state.lastGiftAt || now - state.lastGiftAt > 20000;
    ctx.globalAlpha = quiet ? 1 : 0.92;
    legendItems().forEach(function (item) {
      const band = BANDS[item.band];
      ctx.fillStyle = "#1a1210";
      ctx.strokeStyle = "#ffc857";
      ctx.lineWidth = 2;
      roundRect(item.x, item.y, item.w, item.h, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff6e8";
      ctx.font = "700 22px " + FONT;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(band.key + "   " + band.label + "   " + band.verb, item.x + 16, item.y + item.h / 2);
    });
    ctx.globalAlpha = 1;
  }

  function pointerBand(event) {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * W;
    const y = ((event.clientY - rect.top) / rect.height) * H;
    const hit = legendItems().find(function (item) {
      return x >= item.x && x <= item.x + item.w && y >= item.y && y <= item.y + item.h;
    });
    if (hit) sendBand(hit.band, performance.now());
  }

  function seed() {
    const cast = [
      ["Noor", 6, 2000],
      ["Sam", 5, 500],
      ["Kai", 4, 100],
      ["Alex", 3, 30],
      ["Jules", 2, 10],
      ["Ren", 1, 1],
      ["Moss", 0, 0],
      ["Pip", 0, 0],
    ];
    cast.forEach(function (row, index) {
      const viewer = ensureViewer(row[0]);
      viewer.band = row[1];
      viewer.coins = row[2];
      viewer.gifts = row[2] > 0 ? 1 : 0;
      viewer.cape = row[1] === 6;
      viewer.until = performance.now() + 120000 + index * 9000;
      state.slots.push(viewer);
      if (row[1] > 0) {
        state.bricks.push({
          name: row[0],
          floor: 84.5 - index * 0.85,
          band: row[1],
          label: BANDS[row[1] - 1].label,
          side: index % 2,
          born: 0,
        });
      }
    });
    const history = [["Lux", 1], ["Bea", 1], ["Otto", 2], ["Nia", 1], ["Sol", 4], ["Vee", 1], ["Ash", 3], ["Rio", 2], ["Gem", 1], ["Wynn", 5]];
    history.forEach(function (row, index) {
      state.bricks.push({
        name: row[0],
        floor: 78.5 - index * 0.7,
        band: row[1],
        label: BANDS[row[1] - 1].label,
        side: index % 2,
        born: 0,
      });
    });
    state.nameCursor = cast.length;
    state.bricks.forEach(function (brick) {
      if (brick.band > 0) {
        state.wall.push({
          name: brick.name,
          floor: brick.floor,
          band: brick.band,
          label: brick.label,
          side: state.wall.length % 2,
        });
      }
    });
    const regular = ensureViewer("Gem");
    regular.gifts = 3;
    regular.coins = 3;
    regular.band = 1;
    pushTicker("Spire", "the climb is on", false);
    pushTicker("Noor", "landed a landmark", false);
    pushTicker("Ren", "joined the climb", true);
  }

  function fit() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(now, dt);
    draw(now);
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", fit);
  canvas.addEventListener("pointerdown", function (event) {
    canvas.focus();
    pointerBand(event);
  });
  window.addEventListener("keydown", function (event) {
    if (event.repeat) return;
    const key = event.key;
    if (key === "0" || key === "f" || key === "F") {
      event.preventDefault();
      addFollow(performance.now());
      return;
    }
    const index = BANDS.findIndex(function (band) { return band.key === key; });
    if (index >= 0) {
      event.preventDefault();
      sendBand(index, performance.now());
    }
  });

  fit();
  seed();
  canvas.focus();
  window.__spire = state;
  window.__spireFollow = addFollow;
  requestAnimationFrame(frame);
})();
