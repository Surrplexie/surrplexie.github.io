(() => {
  "use strict";

  function combineStats(stats) {
    const data = {
      reload: 1, recoil: 1, shudder: 1, size: 1, health: 1, damage: 1,
      pen: 1, speed: 1, maxSpeed: 1, range: 1, density: 1, spray: 1, resist: 1,
    };
    for (const gStat of stats || []) {
      if (!gStat) continue;
      for (const key of Object.keys(data)) data[key] *= gStat[key] == null ? 1 : gStat[key];
    }
    return data;
  }

  const g = {
    basic: { reload: 10.5, recoil: 1.4, shudder: 0.1, damage: 0.75, speed: 4, spray: 15 },
    drone: { reload: 36, recoil: 0.25, shudder: 0.1, size: 0.6, speed: 1.5, spray: 0.1 },
    swarm: { reload: 23, recoil: 0.25, shudder: 0.05, size: 0.4, damage: 0.75, speed: 4, spray: 5 },
    trap: { reload: 23, shudder: 0.25, size: 0.7, damage: 0.75, speed: 3.25, resist: 3, spray: 0 },
    twin: { recoil: 0.5, shudder: 0.9, health: 0.9, damage: 0.7, spray: 1.2 },
    tripleShot: { reload: 1.1, shudder: 0.8, health: 0.9, pen: 0.8, density: 0.8, spray: 0.5 },
    triplet: { reload: 1.2, recoil: 2 / 3, shudder: 0.9, health: 0.85, damage: 0.85, pen: 0.9, spray: 0.9 },
    autoTurret: { reload: 0.9, recoil: 0.75, shudder: 0.5, size: 0.8, health: 0.9, damage: 0.6, pen: 1.2, speed: 1.1, range: 0.8 },
    sniper: { reload: 1.35, shudder: 0.25, damage: 0.8, pen: 1.1, speed: 1.5, maxSpeed: 1.5, density: 1.5, spray: 0.2, resist: 1.15 },
    assassin: { reload: 1.65, shudder: 0.25, health: 1.15, pen: 1.1, speed: 1.18, maxSpeed: 1.18, density: 3, resist: 1.3 },
    hunter: { reload: 1.5, recoil: 0.7, size: 0.95, damage: 0.9, speed: 1.1, maxSpeed: 0.8, density: 1.2, resist: 1.15 },
    hunterSecondary: { size: 0.9, health: 2, damage: 0.5, pen: 1.5 },
    machineGun: { reload: 0.5, recoil: 0.8, shudder: 1.7, health: 0.7, damage: 0.7, maxSpeed: 0.8, spray: 2.5 },
    minigun: { reload: 1.25, recoil: 0.6, size: 0.8, health: 0.55, damage: 0.45, pen: 1.25, speed: 1.33, spray: 0.5 },
    gunner: { recoil: 0.25, shudder: 1.5, size: 1.2, health: 1.35, damage: 0.25, pen: 1.25, speed: 0.8, maxSpeed: 0.65, spray: 1.5 },
    flankGuard: { recoil: 1.2, health: 1.02, damage: 0.81, pen: 0.9, maxSpeed: 0.85, density: 1.2 },
    triAngle: { recoil: 0.9, health: 0.9, speed: 0.8, maxSpeed: 0.8, range: 0.6 },
    triAngleFront: { recoil: 0.2, speed: 1.3, maxSpeed: 1.1, range: 1.5 },
    thruster: { recoil: 1.5, shudder: 2, health: 0.5, damage: 0.5, pen: 0.7, spray: 0.5, resist: 0.7 },
    overseer: { reload: 1.25, size: 0.85, health: 0.7, damage: 0.8, maxSpeed: 0.9, density: 2 },
    battleship: { health: 1.25, damage: 1.15, maxSpeed: 0.85, density: 1.1 },
    pounder: { reload: 2, recoil: 1.6, damage: 2, speed: 0.85, maxSpeed: 0.8, density: 1.5, resist: 1.15 },
    destroyer: { reload: 2, recoil: 1.8, shudder: 0.5, health: 2, damage: 0.9, pen: 1.2, speed: 0.5, maxSpeed: 0.6, density: 2, resist: 3 },
    annihilator: { reload: 1, recoil: 1.35, damage: 0.86 },
    artillery: { reload: 1.2, recoil: 0.7, health: 0.85, damage: 0.8, speed: 1.15, maxSpeed: 1.1, spray: 1.1 },
    launcher: { reload: 1.5, recoil: 1.5, shudder: 0.1, size: 0.72, health: 1.05, damage: 0.925, speed: 0.9, maxSpeed: 1.2, range: 1.1, resist: 1.5 },
    setTrap: { reload: 1.1, recoil: 2, shudder: 0.1, size: 1.5, health: 2, pen: 1.25, speed: 2.2, maxSpeed: 2.15, range: 1.25, resist: 1.25 },
    nestKeeper: { reload: 3, size: 0.75, health: 1.05, damage: 1.05 },
    summoner: { reload: 0.35, size: 0.9, health: 0.4, damage: 0.65 },
    single: { reload: 1.05, speed: 1.05 },
    doubleTwin: { damage: 1.1 },
    tripleTwin: { health: 1.1 },
    hewnDouble: { reload: 1.25, recoil: 1.5, health: 0.9, damage: 0.85, maxSpeed: 0.9 },
    spreadshotMain: { reload: 0.781, recoil: 0.25, shudder: 0.5, health: 0.5, speed: 1.923, maxSpeed: 2.436 },
    spreadshot: { reload: 1.5, shudder: 0.25, speed: 0.7, maxSpeed: 0.7, spray: 0.25 },
    quintuplet: { reload: 1.5, recoil: 2 / 3, shudder: 0.9, pen: 0.9, density: 1.1, spray: 0.9, resist: 0.95 },
    predator: { reload: 1.4, size: 0.8, health: 1.5, damage: 0.9, pen: 1.2, speed: 0.9, maxSpeed: 0.9 },
    dual: { reload: 2, shudder: 0.8, health: 1.5, speed: 1.3, maxSpeed: 1.1, resist: 1.25 },
    rifle: { reload: 0.8, recoil: 0.8, shudder: 1.5, health: 0.8, damage: 0.8, pen: 0.9, spray: 2 },
    healer: { damage: -1, speed: 0.5, maxSpeed: 0.5, recoil: 0.5 },
    moreReload: { reload: 1.16 },
    streamliner: { reload: 1.1, recoil: 0.6, damage: 0.65, speed: 1.24 },
    nailgun: { reload: 0.85, recoil: 2.5, size: 0.8, damage: 0.7, density: 2 },
    pelleter: { reload: 1.25, recoil: 0.25, shudder: 1.5, size: 1.1, damage: 0.35, pen: 1.35, speed: 0.9, maxSpeed: 0.8, density: 1.5, spray: 1.5, resist: 1.2 },
    cyclone: { health: 1.3, damage: 1.3, pen: 1.1, speed: 1.5, maxSpeed: 1.15 },
    atomizer: { reload: 0.3, recoil: 0.8, size: 0.5, damage: 0.75, speed: 1.2, maxSpeed: 0.8, spray: 2.25 },
    sunchip: { reload: 4, size: 1.4, health: 0.5, damage: 0.4, pen: 0.6, density: 0.8 },
    lowPower: { shudder: 2, health: 0.5, damage: 0.5, pen: 0.7, spray: 0.5, resist: 0.7 },
    weak: { reload: 2, health: 0.6, damage: 0.6, pen: 0.8, speed: 0.5, maxSpeed: 0.7, range: 0.25, density: 0.3 },
    spam: { reload: 1.1, size: 1.05, damage: 1.1, speed: 0.9, maxSpeed: 0.7, resist: 1.05 },
    minion: { reload: 48, shudder: 0.1, size: 0.7, damage: 0.75, speed: 3, spray: 0.1 },
    minionGun: { recoil: 0, shudder: 2, health: 0.4, damage: 0.4, pen: 1.2, range: 0.75, spray: 2 },
    spawner: { reload: 1.5, maxSpeed: 1.25 },
  };

  const PROJECTILE = {
    bullet: { HEALTH: 0.165, DAMAGE: 6, RANGE: 90, SPEED: 3.75 },
    trap: { HEALTH: 0.5, DAMAGE: 3, RANGE: 450, SPEED: 0, DAMP: 0.05 },
    pillbox: { HEALTH: 0.5, DAMAGE: 3, RANGE: 450, SPEED: 0, DAMP: 0.05 },
    drone: { HEALTH: 0.3, DAMAGE: 3.375, RANGE: 200, SPEED: 3.8, ACCEL: 0.085 },
    swarm: { HEALTH: 0.175, DAMAGE: 2.25, RANGE: 225, SPEED: 4.5, ACCEL: 3 },
    minion: { HEALTH: 5, DAMAGE: 1.2, RANGE: 200, SPEED: 1.8, ACCEL: 1 },
    missile: { HEALTH: 0.3, DAMAGE: 4.2, RANGE: 120, SPEED: 3.75 },
    heal: { HEALTH: 0.2, DAMAGE: 8, RANGE: 70, SPEED: 3.75 },
    auto: { HEALTH: 0.165, DAMAGE: 6, RANGE: 90, SPEED: 3.75 },
  };

  function layersForType(type) {
    if (type === "trap" || type === "pillbox") return [g.trap];
    if (type === "drone") return [g.drone];
    if (type === "swarm") return [g.swarm];
    if (type === "minion") return [g.minion];
    if (type === "heal") return [g.basic, g.healer];
    if (type === "auto") return [g.basic, g.autoTurret];
    if (type === "missile") return [g.basic, g.pounder, g.launcher];
    return [g.basic];
  }

  function calculatorFor(type) {
    if (type === "trap" || type === "pillbox") return "trap";
    if (type === "drone" || type === "minion") return "drone";
    if (type === "swarm") return "swarm";
    return "default";
  }

  function gun(length, width, aspect, x, y, angle, delay, extra = {}) {
    const type = extra.type || "bullet";
    const hasStack = !!(extra.layers || extra.shoot);
    const layers = extra.layers || extra.shoot || layersForType(type);
    const shoot = Array.isArray(layers) ? combineStats(layers) : { ...layers };
    return {
      pos: [length, width, aspect, x, y, angle, delay],
      type,
      spread: extra.spread || 0,
      recoil: extra.recoil,
      size: extra.size,
      stats: extra.stats || {},
      shoot,
      hasStack,
      calculator: extra.calculator || calculatorFor(type),
      shape: extra.shape,
      necro: !!extra.necro,
    };
  }

  function cloneGuns(guns) {
    return (guns || []).map((item) => {
      const type = item.type || "bullet";
      const shoot = item.shoot ? { ...item.shoot } : combineStats(layersForType(type));
      return {
        pos: item.pos.slice(),
        type,
        spread: item.spread || 0,
        recoil: item.recoil,
        size: item.size,
        stats: { ...(item.stats || {}) },
        shoot,
        hasStack: item.shoot ? !!item.hasStack : false,
        calculator: item.calculator || calculatorFor(type),
        shape: item.shape,
        necro: !!item.necro,
      };
    });
  }

  function cloneDef(def) {
    return {
      ...def,
      guns: cloneGuns(def.guns),
      upgrades: (def.upgrades || []).slice(),
      mods: { ...(def.mods || {}) },
    };
  }

  const tanks = {};

  function def(id, spec) {
    tanks[id] = {
      id,
      name: spec.name,
      desc: spec.desc || "",
      body: spec.body || 0,
      guns: spec.guns || [],
      upgrades: spec.upgrades || [],
      needLevel: spec.needLevel == null ? 1 : spec.needLevel,
      fov: spec.fov || 1,
      speed: spec.speed || 1,
      health: spec.health || 1,
      bodyDamage: spec.bodyDamage || 1,
      reload: spec.reload || 1,
      bulletSpeed: spec.bulletSpeed || 1,
      bulletDamage: spec.bulletDamage || 1,
      bulletPen: spec.bulletPen || 1,
      bulletSize: spec.bulletSize || 1,
      maxDrones: spec.maxDrones || 0,
      smasher: !!spec.smasher,
      auto: !!spec.auto,
      necro: spec.necro || 0,
      healer: !!spec.healer,
      spin: !!spec.spin,
      mods: spec.mods || { damage: 1, reload: 1, speed: 1, size: 1, fov: 1, health: 1 },
    };
    return tanks[id];
  }

  const G = {
    basic: () => [gun(18, 8, 1, 0, 0, 0, 0, { layers: [g.basic] })],
    twin: (y = 5.5) => [
      gun(20, 8, 1, 0, y, 0, 0, { layers: [g.basic, g.twin] }),
      gun(20, 8, 1, 0, -y, 0, 0.5, { layers: [g.basic, g.twin] }),
    ],
    sniper: (len = 24, more = []) => [gun(len, 8.5, 1, 0, 0, 0, 0, { layers: [g.basic, g.sniper, ...more] })],
    machine: () => [gun(12, 10, 1.4, 8, 0, 0, 0, { layers: [g.basic, g.machineGun], spread: 0.22 })],
    flank: () => [
      gun(18, 8, 1, 0, 0, 0, 0, { layers: [g.basic, g.flankGuard] }),
      gun(16, 8, 1, 0, 0, 180, 0, { layers: [g.basic, g.flankGuard] }),
    ],
    pound: (more = []) => [gun(20, 12, 1, 0, 0, 0, 0, { layers: [g.basic, g.pounder, ...more] })],
    trap: (ang = 0, more = []) => [
      gun(15, 7, 1, 0, 0, ang, 0, { type: "deco" }),
      gun(3, 7, 1.7, 15, 0, ang, 0, { type: "trap", layers: [g.trap, ...more], calculator: "trap" }),
    ],
    director: (ang = 0, more = [], extra = {}) => [gun(6, 12, 1.2, 8, 0, ang, 0, {
      type: "drone",
      layers: [g.drone, ...more],
      calculator: "drone",
      shape: extra.shape || 3,
      necro: !!extra.necro,
    })],
    swarm: (y, ang = 0, delay = 0, more = []) => [gun(7, 6.5, 0.6, 7, y, ang, delay, { type: "swarm", layers: [g.swarm, ...more], calculator: "swarm" })],
    auto: (ang = 0, delay = 0) => [gun(16, 6, 1, 0, 0, ang, delay, { type: "auto", layers: [g.basic, g.autoTurret] })],
    twinAt: (ang = 0, y = 5.5, more = []) => [
      gun(20, 8, 1, 0, y, ang, 0, { layers: [g.basic, g.twin, ...more] }),
      gun(20, 8, 1, 0, -y, ang, 0.5, { layers: [g.basic, g.twin, ...more] }),
    ],
  };

  const B = (...more) => ({ layers: [g.basic, ...more] });

  def("basic", {
    name: "Basic Tank",
    desc: "A reliable all-rounder",
    guns: G.basic(),
    upgrades: ["twin", "sniper", "machinegun", "flank", "director", "pounder", "trapper", "smasher", "healer"],
    needLevel: 1,
  });

  def("twin", {
    name: "Twin",
    desc: "Two barrels, staggered fire",
    guns: G.twin(),
    upgrades: ["tripleshot", "quad", "twinflank"],
    needLevel: 15,
  });

  def("sniper", {
    name: "Sniper",
    desc: "Long range, hard hits",
    guns: G.sniper(),
    fov: 1.22,
    upgrades: ["assassin", "hunter", "rifle", "trapper"],
    needLevel: 15,
  });

  def("machinegun", {
    name: "Machine Gun",
    desc: "Wide barrel, messy spray",
    guns: G.machine(),
    upgrades: ["destroyer", "gunner"],
    needLevel: 15,
  });

  def("flank", {
    name: "Flank Guard",
    desc: "Front and back coverage",
    guns: G.flank(),
    upgrades: ["triangle", "quad"],
    needLevel: 15,
  });

  def("triangle", {
    name: "Tri-Angle",
    desc: "Rear guns that shove you forward",
    guns: [
      gun(18, 8, 1, 0, 0, 0, 0, B(g.flankGuard, g.triAngle, g.triAngleFront)),
      gun(16, 8, 1, 0, 0, 150, 0.33, B(g.flankGuard, g.triAngle, g.thruster)),
      gun(16, 8, 1, 0, 0, 210, 0.66, B(g.flankGuard, g.triAngle, g.thruster)),
    ],
    speed: 1.12,
    upgrades: ["booster", "fighter"],
    needLevel: 30,
  });

  def("director", {
    name: "Director",
    desc: "Controls a small drone flock",
    body: 4,
    guns: G.director(),
    maxDrones: 6,
    upgrades: ["overseer", "cruiser", "underseer", "spawner"],
    needLevel: 15,
  });

  def("pounder", {
    name: "Pounder",
    desc: "Heavy shells, heavy recoil",
    guns: G.pound(),
    upgrades: ["destroyer", "builder", "artillery", "launcher"],
    needLevel: 15,
  });

  def("trapper", {
    name: "Trapper",
    desc: "Drops lingering traps",
    guns: G.trap(),
    upgrades: ["tritrapper", "megatrapper", "gunnertrapper", "overtrapper"],
    needLevel: 30,
  });

  def("auto3", {
    name: "Auto-3",
    desc: "Three independently aiming guns",
    auto: true,
    guns: [0, 120, 240].map((a, i) => gun(16, 6, 1, 0, 0, a, i * 0.33, { type: "auto", layers: [g.basic, g.autoTurret] })),
    upgrades: ["auto5", "auto8", "autosniper"],
    needLevel: 15,
  });

  def("smasher", {
    name: "Smasher",
    desc: "No guns. Ram everything.",
    guns: [],
    smasher: true,
    speed: 1.15,
    health: 1.35,
    bodyDamage: 2.2,
    upgrades: ["landmine", "spike", "autosmasher"],
    needLevel: 15,
  });

  def("healer", {
    name: "Healer",
    desc: "Healing shells for teammates",
    healer: true,
    guns: [
      gun(11, 9, -0.4, 9.5, 0, 0, 0, { type: "deco" }),
      gun(18, 10, 1, 0, 0, 0, 0, { type: "heal", layers: [g.basic, g.healer] }),
    ],
    upgrades: ["medic"],
    needLevel: 15,
  });

  def("medic", {
    name: "Medic",
    desc: "Longer-range healing shells",
    healer: true,
    guns: [
      gun(11, 9, -0.4, 14, 0, 0, 0, { type: "deco" }),
      gun(22, 10, 1, 0, 0, 0, 0, { type: "heal", layers: [g.basic, g.healer, g.sniper] }),
    ],
    fov: 1.2,
    upgrades: [],
    needLevel: 30,
  });

  def("pelleter", {
    name: "Pelleter",
    desc: "Two small, fast barrels",
    guns: [
      gun(17, 6.5, 1, 0, 4.2, 0, 0, B(g.pelleter)),
      gun(17, 6.5, 1, 0, -4.2, 0, 0.5, B(g.pelleter)),
    ],
    upgrades: ["gunner", "nailgun", "borer"],
    needLevel: 15,
  });

  def("triplet", {
    name: "Triplet",
    desc: "Three barrels of pressure",
    guns: [
      gun(16, 8, 1, 0, 5.5, 0, 0.5, B(g.twin, g.triplet)),
      gun(20, 8, 1, 0, 0, 0, 0, B(g.twin, g.triplet)),
      gun(16, 8, 1, 0, -5.5, 0, 0.5, B(g.twin, g.triplet)),
    ],
    upgrades: ["penta", "quintuplet"],
    needLevel: 30,
  });

  def("twinflank", {
    name: "Twin Flank",
    desc: "Twins on both ends",
    guns: [...G.twinAt(0, 5.2, [g.doubleTwin]), ...G.twinAt(180, 5.2, [g.doubleTwin])],
    upgrades: ["tripletwin", "octo"],
    needLevel: 30,
  });

  def("tripleshot", {
    name: "Triple Shot",
    desc: "A spreading fan of fire",
    guns: [
      gun(19, 8, 1, 0, 0, -27, 0, B(g.twin, g.tripleShot)),
      gun(19, 8, 1, 0, 0, 0, 0, B(g.twin, g.tripleShot)),
      gun(19, 8, 1, 0, 0, 27, 0, B(g.twin, g.tripleShot)),
    ],
    upgrades: ["penta", "spread", "triplet"],
    needLevel: 30,
  });

  def("dual", {
    name: "Dual",
    desc: "Twin sniper barrels",
    guns: [
      gun(22, 7, 1, 0, 4.8, 0, 0, B(g.twin, g.dual)),
      gun(22, 7, 1, 0, -4.8, 0, 0.5, B(g.twin, g.dual)),
    ],
    fov: 1.12,
    upgrades: ["hewn", "assassin"],
    needLevel: 30,
  });

  def("assassin", {
    name: "Assassin",
    desc: "See farther, hit harder",
    guns: G.sniper(27, [g.assassin]),
    fov: 1.42,
    upgrades: ["ranger", "stalker"],
    needLevel: 30,
  });

  def("rifle", {
    name: "Rifle",
    desc: "Fast sniper rounds with more spray",
    guns: [
      gun(20, 12, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(24, 7, 1, 0, 0, 0, 0, { layers: [g.basic, g.sniper, g.rifle] }),
    ],
    fov: 1.22,
    upgrades: ["musket"],
    needLevel: 30,
  });

  def("musket", {
    name: "Musket",
    desc: "Twin rifles",
    guns: [
      gun(15.5, 7, 1, 0, 6.15, 0, 0, { type: "deco" }),
      gun(18, 7, 1, 0, 4.15, 0, 0, { layers: [g.basic, g.sniper, g.rifle, g.twin] }),
      gun(15.5, 7, 1, 0, -6.15, 0, 0, { type: "deco" }),
      gun(18, 7, 1, 0, -4.15, 0, 0.5, { layers: [g.basic, g.sniper, g.rifle, g.twin] }),
    ],
    fov: 1.22,
    upgrades: [],
    needLevel: 45,
  });

  def("hunter", {
    name: "Hunter",
    desc: "Staggered sniper shots",
    guns: [
      gun(24, 8, 1, 0, 0, 0, 0, { layers: [g.basic, g.sniper, g.hunter] }),
      gun(21, 12, 1, 0, 0, 0, 0.2, { layers: [g.basic, g.sniper, g.hunter, g.hunterSecondary] }),
    ],
    fov: 1.25,
    upgrades: ["predator", "poacher"],
    needLevel: 30,
  });

  def("minigun", {
    name: "Minigun",
    desc: "A stream of small shots",
    guns: [
      gun(23, 8, 1, 0, 0, 0, 0, B(g.minigun)),
      gun(20, 8, 1, 0, 0, 0, 0.33, B(g.minigun)),
      gun(17, 8, 1, 0, 0, 0, 0.66, B(g.minigun)),
    ],
    fov: 1.15,
    upgrades: ["streamliner", "sprayer"],
    needLevel: 30,
  });

  def("destroyer", {
    name: "Destroyer",
    desc: "Huge shells, huge recoil",
    guns: [gun(21, 14, 1, 0, 0, 0, 0, { layers: [g.basic, g.pounder, g.destroyer] })],
    upgrades: ["hybrid", "annihilator", "skimmer"],
    needLevel: 30,
  });

  def("gunner", {
    name: "Gunner",
    desc: "Four small, fast guns",
    guns: [
      gun(12, 4.5, 1, 0, 7.2, 0, 0.5, { layers: [g.basic, g.twin, g.gunner] }),
      gun(12, 4.5, 1, 0, -7.2, 0, 0.75, { layers: [g.basic, g.twin, g.gunner] }),
      gun(16, 4.5, 1, 0, 3.6, 0, 0, { layers: [g.basic, g.twin, g.gunner] }),
      gun(16, 4.5, 1, 0, -3.6, 0, 0.25, { layers: [g.basic, g.twin, g.gunner] }),
    ],
    upgrades: ["streamliner", "gunnertrapper"],
    needLevel: 30,
  });

  def("sprayer", {
    name: "Sprayer",
    desc: "Machine gun with a secondary stream",
    guns: [
      gun(23, 8, 1, 0, 0, 0, 0, B(g.minigun)),
      gun(12, 10, 1.4, 8, 0, 0, 0, { layers: [g.basic, g.machineGun], spread: 0.2 }),
    ],
    upgrades: ["atomizer", "focal"],
    needLevel: 30,
  });

  def("quad", {
    name: "Quad Tank",
    desc: "Fire in four directions",
    guns: [0, 90, 180, 270].map((a, i) => gun(18, 8, 1, 0, 0, a, i * 0.15, B(g.flankGuard))),
    upgrades: ["octo", "cyclone"],
    needLevel: 30,
  });

  def("booster", {
    name: "Booster",
    desc: "Rear thrusters for speed",
    guns: [
      gun(18, 8, 1, 0, 0, 0, 0, B(g.flankGuard, g.triAngle, g.triAngleFront)),
      gun(14, 8, 1, 0, 0, 140, 0.33, B(g.flankGuard, g.triAngle, g.thruster)),
      gun(14, 8, 1, 0, 0, 220, 0.66, B(g.flankGuard, g.triAngle, g.thruster)),
      gun(16, 8, 1, 0, 0, 150, 0.15, B(g.flankGuard, g.triAngle, g.thruster)),
      gun(16, 8, 1, 0, 0, 210, 0.5, B(g.flankGuard, g.triAngle, g.thruster)),
    ],
    speed: 1.18,
    upgrades: ["fighter"],
    needLevel: 45,
  });

  def("overseer", {
    name: "Overseer",
    desc: "Two drone spawners",
    body: 4,
    guns: [...G.director(90, [g.overseer]), ...G.director(270, [g.overseer])],
    maxDrones: 8,
    upgrades: ["overlord", "necromancer", "manager"],
    needLevel: 30,
  });

  def("cruiser", {
    name: "Cruiser",
    desc: "Swarm swarms",
    body: 4,
    guns: [...G.swarm(0, 90, 0), ...G.swarm(0, 270, 0.5)],
    maxDrones: 14,
    upgrades: ["carrier", "battleship"],
    needLevel: 30,
  });

  def("underseer", {
    name: "Underseer",
    desc: "Square drones that steal squares",
    body: 4,
    guns: [...G.director(90, [g.sunchip], { shape: 4, necro: true }), ...G.director(270, [g.sunchip], { shape: 4, necro: true })],
    maxDrones: 15,
    necro: 4,
    upgrades: ["necromancer", "maleficitor"],
    needLevel: 30,
  });

  def("spawner", {
    name: "Spawner",
    desc: "Builds mini tanks that shoot for you",
    body: 4,
    guns: [
      gun(4.5, 10, 1, 10.5, 0, 0, 0, { type: "deco" }),
      gun(1, 12, 1, 15, 0, 0, 0, { type: "minion", layers: [g.minion, g.spawner], calculator: "drone" }),
      gun(11.5, 12, 1, 0, 0, 0, 0, { type: "deco" }),
    ],
    maxDrones: 4,
    fov: 1.1,
    upgrades: ["factory"],
    needLevel: 30,
  });

  def("factory", {
    name: "Factory",
    desc: "A bigger spawner with more minions",
    body: 4,
    guns: [
      gun(15.5, 11, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(2, 14, 1, 15.5, 0, 0, 0, { type: "minion", layers: [g.minion], calculator: "drone" }),
      gun(12, 14, 1, 0, 0, 0, 0, { type: "deco" }),
    ],
    maxDrones: 6,
    fov: 1.12,
    speed: 14 / 15,
    upgrades: [],
    needLevel: 45,
  });

  def("builder", {
    name: "Builder",
    desc: "Fires block traps",
    guns: [
      gun(18, 12, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(2, 12, 1.1, 18, 0, 0, 0, { type: "trap", layers: [g.trap, g.setTrap], calculator: "trap", size: 1.4 }),
    ],
    upgrades: ["construct", "engineer", "architect"],
    needLevel: 30,
  });

  def("artillery", {
    name: "Artillery",
    desc: "Side guns plus a pounder",
    guns: [
      gun(17, 8, 1, 0, 0, -25, 0.5, B(g.pelleter, g.artillery)),
      gun(17, 8, 1, 0, 0, 25, 0.5, B(g.pelleter, g.artillery)),
      gun(19, 12, 1, 0, 0, 0, 0, B(g.pounder, g.artillery)),
    ],
    upgrades: ["mortar", "skimmer"],
    needLevel: 30,
  });

  def("launcher", {
    name: "Launcher",
    desc: "Fires a slow, heavy missile",
    guns: [gun(16, 13, 1.15, 0, 0, 0, 0, { type: "missile", layers: [g.basic, g.pounder, g.launcher] })],
    upgrades: ["skimmer", "rocketeer"],
    needLevel: 30,
  });

  def("tritrapper", {
    name: "Tri-Trapper",
    desc: "Traps in three directions",
    guns: [0, 120, 240].flatMap((a) => G.trap(a, [g.flankGuard])),
    upgrades: ["fortress", "hexatrap"],
    needLevel: 30,
  });

  def("megatrapper", {
    name: "Mega Trapper",
    desc: "One enormous trap",
    guns: [
      gun(15, 12, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(4, 12, 1.6, 15, 0, 0, 0, { type: "trap", layers: [g.trap, { size: 1.4, health: 1.6, damage: 1.4, reload: 1.4 }], calculator: "trap", size: 1.8 }),
    ],
    upgrades: ["gigatrap", "construct"],
    needLevel: 30,
  });

  def("gunnertrapper", {
    name: "Gunner Trapper",
    desc: "Front gunners, rear traps",
    guns: [
      gun(19, 4.5, 1, 0, 3.2, 0, 0, B(g.twin, g.gunner)),
      gun(19, 4.5, 1, 0, -3.2, 0, 0.5, B(g.twin, g.gunner)),
      ...G.trap(180),
    ],
    upgrades: ["bushwhacker", "fortress"],
    needLevel: 30,
  });

  def("overtrapper", {
    name: "Overtrapper",
    desc: "Traps up front, drones on the sides",
    body: 4,
    guns: [...G.trap(0), ...G.director(120, [g.overseer]), ...G.director(240, [g.overseer])],
    maxDrones: 4,
    upgrades: ["fortress"],
    needLevel: 30,
  });

  def("landmine", {
    name: "Landmine",
    desc: "A smasher that fades while still",
    guns: [],
    smasher: true,
    speed: 1.2,
    health: 1.4,
    bodyDamage: 2.35,
    upgrades: ["megasmash"],
    needLevel: 30,
  });

  def("spike", {
    name: "Spike",
    desc: "More body damage, sharper hull",
    guns: [],
    smasher: true,
    body: 6,
    speed: 1.08,
    health: 1.45,
    bodyDamage: 2.8,
    upgrades: ["megasmash"],
    needLevel: 30,
  });

  def("autosmasher", {
    name: "Auto Smasher",
    desc: "Smasher with a turret",
    smasher: true,
    auto: true,
    guns: G.auto(),
    speed: 1.12,
    health: 1.3,
    bodyDamage: 2.05,
    upgrades: [],
    needLevel: 30,
  });

  def("nailgun", {
    name: "Nailgun",
    desc: "Dense pelleter fire",
    guns: [
      gun(19, 5.5, 1, 0, 3.6, 0, 0, B(g.pelleter, g.nailgun)),
      gun(19, 5.5, 1, 0, -3.6, 0, 0.5, B(g.pelleter, g.nailgun)),
      gun(16, 5.5, 1, 0, 0, 0, 0.25, B(g.pelleter, g.nailgun)),
    ],
    upgrades: ["borer"],
    needLevel: 30,
  });

  def("borer", {
    name: "Borer",
    desc: "Armor-piercing pellets",
    guns: [
      gun(20, 8, 1, 0, 4.4, 0, 0, B(g.twin, g.pelleter, { pen: 1.8, speed: 1.25 })),
      gun(20, 8, 1, 0, -4.4, 0, 0.5, B(g.twin, g.pelleter, { pen: 1.8, speed: 1.25 })),
    ],
    upgrades: [],
    needLevel: 45,
  });

  def("penta", {
    name: "Penta Shot",
    desc: "Five-wide shotgun",
    guns: [-40, -20, 0, 20, 40].map((a, i) => gun(16 + (i === 2 ? 4 : 0), 8, 1, 0, 0, a, i % 2 ? 0.5 : 0, B(g.twin, g.tripleShot))),
    upgrades: ["spread"],
    needLevel: 45,
  });

  def("quintuplet", {
    name: "Quintuplet",
    desc: "Five forward barrels",
    guns: [
      gun(14, 7, 1, 0, 8, 0, 0.6, B(g.twin, g.triplet, g.quintuplet)),
      gun(16, 7, 1, 0, 4.5, 0, 0.3, B(g.twin, g.triplet, g.quintuplet)),
      gun(20, 7, 1, 0, 0, 0, 0, B(g.twin, g.triplet, g.quintuplet)),
      gun(16, 7, 1, 0, -4.5, 0, 0.3, B(g.twin, g.triplet, g.quintuplet)),
      gun(14, 7, 1, 0, -8, 0, 0.6, B(g.twin, g.triplet, g.quintuplet)),
    ],
    upgrades: [],
    needLevel: 45,
  });

  def("tripletwin", {
    name: "Triple Twin",
    desc: "Twins at 0, 120, 240",
    guns: [0, 120, 240].flatMap((a) => G.twinAt(a, 5.2, [g.spam, g.doubleTwin, g.tripleTwin])),
    upgrades: ["hexadual"],
    needLevel: 45,
  });

  def("octo", {
    name: "Octo Tank",
    desc: "Eight-way fire",
    guns: [0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => gun(18, 8, 1, 0, 0, a, (i % 2) * 0.5, B(g.flankGuard, g.spam))),
    upgrades: [],
    needLevel: 45,
  });

  def("spread", {
    name: "Spread Shot",
    desc: "A huge fan of small guns",
    guns: [-75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75].map((a, i) =>
      gun(13 + (a === 0 ? 6 : 0), a === 0 ? 8 : 6, 1, 0, 0, a, Math.abs(i - 5) * 0.08, a === 0 ? B(g.pounder, g.spreadshotMain, g.spreadshot) : B(g.twin, g.spreadshot))
    ),
    upgrades: [],
    needLevel: 45,
  });

  def("ranger", {
    name: "Ranger",
    desc: "The longest sightline",
    guns: [gun(30, 8, 1, 0, 0, 0, 0, B(g.sniper, g.assassin)), gun(6, 12, -1.2, 8, 0, 0, 0, { type: "deco" })],
    fov: 1.65,
    upgrades: [],
    needLevel: 45,
  });

  def("stalker", {
    name: "Stalker",
    desc: "Assassin that fades while still",
    guns: [gun(27, 8.5, -1.1, 0, 0, 0, 0, B(g.sniper, g.assassin))],
    fov: 1.45,
    upgrades: [],
    needLevel: 45,
  });

  def("predator", {
    name: "Predator",
    desc: "Three stacked sniper barrels",
    guns: [
      gun(24, 8, 1, 0, 0, 0, 0, B(g.sniper, g.hunter, g.hunterSecondary, g.hunterSecondary, g.predator)),
      gun(21, 11, 1, 0, 0, 0, 0.15, B(g.sniper, g.hunter, g.hunterSecondary, g.predator)),
      gun(18, 14, 1, 0, 0, 0, 0.3, B(g.sniper, g.hunter, g.predator)),
    ],
    fov: 1.35,
    upgrades: [],
    needLevel: 45,
  });

  def("poacher", {
    name: "Poacher",
    desc: "Hunter with a drone spawner",
    body: 4,
    guns: [
      gun(24, 8, 1, 0, 0, 0, 0, { layers: [g.basic, g.sniper, g.hunter] }),
      gun(21, 12, 1, 0, 0, 0, 0.2, { layers: [g.basic, g.sniper, g.hunter, g.hunterSecondary] }),
      ...G.director(180, [g.overseer]),
    ],
    maxDrones: 3,
    fov: 1.22,
    upgrades: [],
    needLevel: 45,
  });

  def("streamliner", {
    name: "Streamliner",
    desc: "Five-barrel bullet stream",
    guns: [24, 21, 18, 15, 12].map((l, i) => gun(l, 7, 1, 0, 0, 0, i * 0.2, B(g.minigun, g.streamliner))),
    fov: 1.18,
    upgrades: [],
    needLevel: 45,
  });

  def("annihilator", {
    name: "Annihilator",
    desc: "The biggest gun",
    guns: [gun(21, 20, 1, 0, 0, 0, 0, { layers: [g.basic, g.pounder, g.destroyer, g.annihilator] })],
    upgrades: [],
    needLevel: 45,
  });

  def("hybrid", {
    name: "Hybrid",
    desc: "Destroyer plus a drone spawner",
    body: 4,
    guns: [gun(21, 14, 1, 0, 0, 0, 0, { layers: [g.basic, g.pounder, g.destroyer] }), ...G.director(180, [g.overseer])],
    maxDrones: 3,
    upgrades: [],
    needLevel: 45,
  });

  def("skimmer", {
    name: "Skimmer",
    desc: "A spinning missile launcher",
    guns: [
      gun(10, 14, -0.5, 9, 0, 0, 0, { type: "deco" }),
      gun(16, 13, 1, 0, 0, 0, 0, { type: "missile", layers: [g.basic, g.pounder, g.launcher] }),
    ],
    upgrades: [],
    needLevel: 45,
  });

  def("atomizer", {
    name: "Atomizer",
    desc: "Tiny, furious spray",
    guns: [
      gun(24, 7, 1, 0, 0, 0, 0, B(g.pelleter, g.lowPower, g.machineGun, g.atomizer)),
      gun(12, 10, 1.4, 8, 0, 0, 0, { layers: [g.basic, g.machineGun], spread: 0.28 }),
    ],
    upgrades: [],
    needLevel: 45,
  });

  def("focal", {
    name: "Focal",
    desc: "Sprayer with tighter aim",
    guns: [
      gun(24, 8, 1, 0, 0, 0, 0, B(g.minigun, { spray: 0.4, speed: 1.2 })),
      gun(16, 9, 1.1, 4, 0, 0, 0, { layers: [g.basic, g.machineGun, { spray: 0.45 }], spread: 0.08 }),
    ],
    upgrades: [],
    needLevel: 45,
  });

  def("cyclone", {
    name: "Cyclone",
    desc: "Twelve small guns in a ring",
    guns: Array.from({ length: 12 }, (_, i) => gun(13, 4.5, 1, 0, 0, i * 30, (i % 3) * 0.2, B(g.flankGuard, g.cyclone))),
    upgrades: [],
    needLevel: 45,
  });

  def("fighter", {
    name: "Fighter",
    desc: "Booster with side guns",
    guns: [
      gun(18, 8, 1, 0, 0, 0, 0, B(g.flankGuard, g.triAngle, g.triAngleFront)),
      gun(16, 8, 1, 0, 0, 90, 0.2, B(g.flankGuard, g.triAngle)),
      gun(16, 8, 1, 0, 0, 270, 0.2, B(g.flankGuard, g.triAngle)),
      gun(14, 8, 1, 0, 0, 150, 0.5, B(g.flankGuard, g.triAngle, g.thruster)),
      gun(14, 8, 1, 0, 0, 210, 0.5, B(g.flankGuard, g.triAngle, g.thruster)),
    ],
    speed: 1.12,
    upgrades: [],
    needLevel: 45,
  });

  def("surfer", {
    name: "Surfer",
    desc: "Booster that also launches swarms",
    guns: [
      gun(18, 8, 1, 0, 0, 0, 0, B(g.flankGuard, g.triAngle, g.triAngleFront)),
      ...G.swarm(0, 150, 0.3),
      ...G.swarm(0, 210, 0.6),
      gun(14, 8, 1, 0, 0, 140, 0.2, B(g.flankGuard, g.triAngle, g.thruster)),
      gun(14, 8, 1, 0, 0, 220, 0.5, B(g.flankGuard, g.triAngle, g.thruster)),
    ],
    maxDrones: 8,
    speed: 1.14,
    upgrades: [],
    needLevel: 45,
  });

  def("overlord", {
    name: "Overlord",
    desc: "Four drone spawners",
    body: 4,
    guns: [0, 90, 180, 270].flatMap((a) => G.director(a, [g.overseer])),
    maxDrones: 8,
    upgrades: [],
    needLevel: 45,
  });

  def("manager", {
    name: "Manager",
    desc: "One strong spawner, fades while still",
    body: 4,
    guns: G.director(0, [g.overseer, { reload: 0.7, damage: 1.25 }]),
    maxDrones: 8,
    upgrades: [],
    needLevel: 45,
  });

  def("battleship", {
    name: "Battleship",
    desc: "Four swarm spawners",
    body: 4,
    guns: [90, 270].flatMap((a) => [
      gun(7, 6.5, 0.6, 7, 4, a, 0, { type: "swarm", layers: [g.swarm, g.battleship], calculator: "swarm" }),
      gun(7, 6.5, 0.6, 7, -4, a, 0.5, { type: "swarm", layers: [g.swarm], calculator: "swarm" }),
    ]),
    maxDrones: 20,
    upgrades: [],
    needLevel: 45,
  });

  def("carrier", {
    name: "Carrier",
    desc: "Three swarm spawners in a fan",
    body: 4,
    guns: [-30, 0, 30].flatMap((a, i) => G.swarm(0, a, i * 0.2, [g.battleship])),
    maxDrones: 16,
    upgrades: [],
    needLevel: 45,
  });

  def("necromancer", {
    name: "Necromancer",
    desc: "Four spawners · drones convert squares",
    body: 4,
    guns: [0, 90, 180, 270].flatMap((a) => G.director(a, [g.sunchip], { shape: 4, necro: true })),
    maxDrones: 14,
    necro: 4,
    upgrades: [],
    needLevel: 45,
  });

  def("maleficitor", {
    name: "Maleficitor",
    desc: "One underseer spawner, fades while still · converts squares",
    body: 4,
    guns: G.director(0, [g.sunchip, { reload: 0.7 }], { shape: 4, necro: true }),
    maxDrones: 12,
    necro: 4,
    upgrades: [],
    needLevel: 45,
  });

  def("construct", {
    name: "Construct",
    desc: "Builder with a bigger block",
    guns: [
      gun(18, 16, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(2, 16, 1.1, 18, 0, 0, 0, { type: "trap", layers: [g.trap, g.setTrap, { size: 1.25, health: 1.2, damage: 1.15 }], calculator: "trap", size: 1.8 }),
    ],
    upgrades: [],
    needLevel: 45,
  });

  def("engineer", {
    name: "Engineer",
    desc: "Places pillboxes with auto guns",
    guns: [
      gun(18, 10, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(3, 14, 1.3, 15, 0, 0, 0, { type: "deco" }),
      gun(2, 14, 1.3, 18, 0, 0, 0, { type: "pillbox", layers: [g.trap, g.setTrap], calculator: "trap", size: 1.2 }),
    ],
    maxDrones: 6,
    upgrades: [],
    needLevel: 45,
  });

  def("architect", {
    name: "Architect",
    desc: "Blocks in three directions",
    guns: [0, 120, 240].flatMap((a) => [
      gun(18, 12, 1, 0, 0, a, 0, { type: "deco" }),
      gun(2, 12, 1.1, 18, 0, a, 0, { type: "trap", layers: [g.trap, g.setTrap, g.flankGuard], calculator: "trap", size: 1.35 }),
    ]),
    upgrades: [],
    needLevel: 45,
  });

  def("mortar", {
    name: "Mortar",
    desc: "Artillery with gunner sides",
    guns: [
      gun(12, 4.5, 1, 0, 8, -25, 0.5, B(g.twin, g.gunner, g.artillery)),
      gun(12, 4.5, 1, 0, -8, 25, 0.5, B(g.twin, g.gunner, g.artillery)),
      gun(19, 12, 1, 0, 0, 0, 0, B(g.pounder, g.artillery)),
    ],
    upgrades: [],
    needLevel: 45,
  });

  def("rocketeer", {
    name: "Rocketeer",
    desc: "A faster missile with a tapered barrel",
    guns: [gun(16, 12, 0.7, 0, 0, 0, 0, { type: "missile", layers: [g.basic, g.pounder, g.launcher, { speed: 1.15, reload: 0.9 }] })],
    upgrades: [],
    needLevel: 45,
  });

  def("fortress", {
    name: "Fortress",
    desc: "Traps all around, gunners in front",
    guns: [
      gun(18, 4.5, 1, 0, 3.2, 0, 0, B(g.twin, g.gunner)),
      gun(18, 4.5, 1, 0, -3.2, 0, 0.5, B(g.twin, g.gunner)),
      ...[0, 120, 240].flatMap((a) => G.trap(a, [g.flankGuard])),
    ],
    upgrades: [],
    needLevel: 45,
  });

  def("hexatrap", {
    name: "Hexa-Trapper",
    desc: "Six trap launchers",
    guns: [0, 60, 120, 180, 240, 300].flatMap((a) => G.trap(a, [g.flankGuard])),
    upgrades: [],
    needLevel: 45,
  });

  def("gigatrap", {
    name: "Giga Trapper",
    desc: "An even bigger trap",
    guns: [
      gun(15, 16, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(4, 16, 1.5, 15, 0, 0, 0, { type: "trap", layers: [g.trap, { size: 1.7, health: 2, damage: 1.7, reload: 1.7 }], calculator: "trap", size: 2.1 }),
    ],
    upgrades: [],
    needLevel: 45,
  });

  def("bushwhacker", {
    name: "Bushwhacker",
    desc: "Sniper front, traps behind",
    guns: [...G.sniper(24), ...G.trap(180)],
    fov: 1.2,
    upgrades: [],
    needLevel: 45,
  });

  def("megasmash", {
    name: "Mega Smasher",
    desc: "A thicker smashing ring",
    guns: [],
    smasher: true,
    health: 1.7,
    bodyDamage: 3,
    speed: 1.05,
    upgrades: [],
    needLevel: 45,
  });

  def("autogunner", {
    name: "Auto Gunner",
    desc: "Gunner with a turret",
    auto: true,
    guns: [
      gun(12, 4.5, 1, 0, 7.2, 0, 0.5, B(g.twin, g.gunner)),
      gun(12, 4.5, 1, 0, -7.2, 0, 0.75, B(g.twin, g.gunner)),
      gun(16, 4.5, 1, 0, 3.6, 0, 0, B(g.twin, g.gunner)),
      gun(16, 4.5, 1, 0, -3.6, 0, 0.25, B(g.twin, g.gunner)),
      ...G.auto(),
    ],
    upgrades: [],
    needLevel: 45,
  });

  def("autosniper", {
    name: "Auto Assassin",
    desc: "Sniper turret on a spinning hull",
    auto: true,
    guns: [...G.sniper(24, [g.assassin]), ...G.auto()],
    fov: 1.3,
    upgrades: [],
    needLevel: 45,
  });

  def("auto5", {
    name: "Auto-5",
    desc: "Five auto guns",
    auto: true,
    guns: [0, 72, 144, 216, 288].map((a, i) => gun(16, 6, 1, 0, 0, a, i * 0.15, { type: "auto", layers: [g.basic, g.autoTurret] })),
    upgrades: [],
    needLevel: 45,
  });

  def("auto8", {
    name: "Auto-8",
    desc: "Eight auto guns",
    auto: true,
    guns: Array.from({ length: 8 }, (_, i) => gun(14, 5.5, 1, 0, 0, i * 45, i * 0.1, { type: "auto", layers: [g.basic, g.autoTurret] })),
    upgrades: [],
    needLevel: 45,
  });

  def("hewn", {
    name: "Hewn Pelleter",
    desc: "Gunner with side barrels",
    guns: [
      gun(17, 6.5, 1, 0, 4.2, 0, 0, B(g.pelleter)),
      gun(17, 6.5, 1, 0, -4.2, 0, 0.5, B(g.pelleter)),
      gun(15, 6.5, 1, 0, 0, 28, 0.25, B(g.twin, g.hewnDouble)),
      gun(15, 6.5, 1, 0, 0, -28, 0.75, B(g.twin, g.hewnDouble)),
    ],
    upgrades: [],
    needLevel: 45,
  });

  def("hexadual", {
    name: "Hexa Dual",
    desc: "Duals in three directions",
    guns: [0, 120, 240].flatMap((a) => [
      gun(21, 7, 1, 0, 4.5, a, 0, B(g.twin, g.dual)),
      gun(21, 7, 1, 0, -4.5, a, 0.5, B(g.twin, g.dual)),
    ]),
    upgrades: [],
    needLevel: 45,
  });

  def("single", {
    name: "Single",
    desc: "One oversized basic gun",
    guns: [gun(20, 10, 1, 0, 0, 0, 0, B(g.single))],
    upgrades: ["pounder", "sniper"],
    needLevel: 15,
  });

  def("auto2", {
    name: "Auto-2",
    desc: "Two auto guns",
    auto: true,
    guns: [
      gun(16, 6, 1, 0, 0, 0, 0, { type: "auto", layers: [g.basic, g.autoTurret] }),
      gun(16, 6, 1, 0, 0, 180, 0.5, { type: "auto", layers: [g.basic, g.autoTurret] }),
    ],
    upgrades: ["auto3", "twinflank"],
    needLevel: 15,
  });

  def("flanktrap", {
    name: "Flank Trapper",
    desc: "Gun in front, trap in back",
    guns: [...G.basic(), ...G.trap(180)],
    upgrades: ["gunnertrapper", "bushwhacker"],
    needLevel: 30,
  });

  def("bent", {
    name: "Bent Hybrid",
    desc: "Triple shot plus a drone",
    body: 4,
    guns: [
      gun(19, 8, 1, 0, 0, -27, 0, B(g.twin, g.tripleShot)),
      gun(19, 8, 1, 0, 0, 0, 0, B(g.twin, g.tripleShot)),
      gun(19, 8, 1, 0, 0, 27, 0, B(g.twin, g.tripleShot)),
      ...G.director(180, [g.overseer]),
    ],
    maxDrones: 3,
    upgrades: [],
    needLevel: 45,
  });

  const mothershipGuns = [];
  for (let i = 0; i < 16; i++) {
    mothershipGuns.push(gun(11, 6.2, 1, 0, 0, i * 22.5, (i % 4) * 0.14, {
      recoil: 0,
      stats: { speed: 0.55, life: 0.42, damage: 1.55 },
    }));
  }
  for (let i = 0; i < 16; i++) {
    mothershipGuns.push(gun(8, 7, 1.55, 0, 0, i * 22.5 + 11.25, (i % 4) * 0.16, {
      type: "trap",
      recoil: 0,
      stats: { speed: 0.28, damage: 1.7 },
    }));
  }
  for (let i = 0; i < 6; i++) {
    mothershipGuns.push(gun(7, 10, 1.15, 6, 0, i * 60 + 30, 0.18, { type: "swarm", recoil: 0 }));
  }
  def("mothership", {
    name: "Mothership",
    desc: "Huge close-range fortress with 360° fire, traps, and swarms",
    guns: mothershipGuns,
    health: 16,
    speed: 0.52,
    fov: 1.45,
    reload: 1,
    bulletSpeed: 1,
    bulletDamage: 3.2,
    bulletPen: 1.4,
    bulletSize: 0.72,
    bodyDamage: 2.4,
    maxDrones: 28,
    upgrades: [],
    needLevel: 45,
  });

  def("arena_closer", {
    name: "Arena Closer",
    desc: "Classic yellow closer · huge shell, nearly instant kill",
    guns: [gun(24, 18, 1, 0, 0, 0, 0, { recoil: 0.85 })],
    health: 8,
    speed: 1.35,
    fov: 1.35,
    reload: 1.35,
    bulletSpeed: 1.15,
    bulletDamage: 8,
    bulletPen: 4,
    bulletSize: 2.6,
    bodyDamage: 6,
    upgrades: [],
    needLevel: 45,
  });

  def("dom_gun", {
    name: "Dominator",
    desc: "Stationary hexagonal gun that holds a point",
    body: 6,
    guns: [gun(22, 16, 1, 0, 0, 0, 0, { recoil: 0 })],
    health: 44,
    speed: 0.01,
    fov: 1.15,
    reload: 2.48,
    bulletSpeed: 1.08,
    bulletDamage: 5.2,
    bulletPen: 3.6,
    bulletSize: 1.9,
    bodyDamage: 5.4,
    upgrades: [],
    needLevel: 45,
  });

  def("dom_idle", {
    name: "Dominator",
    desc: "Captured dominator with no guns",
    body: 6,
    guns: [],
    health: 44,
    speed: 0.01,
    fov: 1,
    reload: 1,
    bulletDamage: 1,
    bodyDamage: 5.4,
    upgrades: [],
    needLevel: 45,
  });

  def("assault_guard", {
    name: "Trapper",
    desc: "Dominator-zone guard traps that block weak shots",
    guns: [0, 120, 240].flatMap((a) => G.trap(a)),
    health: 1.32,
    reload: 1.38,
    bulletDamage: 1.32,
    bulletPen: 1.7,
    bodyDamage: 1.15,
    upgrades: [],
    needLevel: 45,
  });

  def("dom_heal", {
    name: "Healer",
    desc: "Main spawn dominator that fires healing shells",
    guns: [0, 45, 90, 135, 180, 225, 270, 315].map((a) =>
      gun(12, 5.2, 1, 0, 0, a, a / 360, { type: "heal", recoil: 0, size: 0.42, stats: { speed: 0.48, life: 0.85 } })
    ),
    health: 52,
    speed: 0.01,
    fov: 1.1,
    reload: 0.98,
    bulletSpeed: 0.62,
    bulletDamage: 0.2,
    bulletPen: 1.35,
    bulletSize: 0.55,
    bodyDamage: 4.2,
    upgrades: [],
    needLevel: 45,
  });

  function mysticGuns(count, more = [], shape) {
    const step = 360 / count;
    const sides = shape == null ? (count < 3 ? 0 : count) : shape;
    return Array.from({ length: count }, (_, i) => gun(3.5, 8.65, 1.2, 8, 0, i * step, i / count, {
      type: "drone",
      layers: [g.drone, g.summoner, ...more],
      calculator: "drone",
      shape: sides,
    }));
  }

  const BOSS = {
    elite: { health: 160, speed: 0.18, fov: 1.22, bodyDamage: 3.4, mods: { size: 2.35, health: 1, damage: 1, reload: 1, speed: 1, fov: 1 } },
    mystic: { health: 180, speed: 0.12, fov: 1.15, bodyDamage: 2.8, mods: { size: 2.45, health: 1, damage: 1, reload: 1, speed: 1, fov: 1 } },
    nester: { health: 220, speed: 0.14, fov: 1.2, bodyDamage: 3.1, mods: { size: 2.55, health: 1, damage: 1, reload: 1, speed: 1, fov: 1 } },
    rogue: { health: 260, speed: 0.08, fov: 1.28, bodyDamage: 3.6, mods: { size: 2.7, health: 1, damage: 1, reload: 1, speed: 1, fov: 1 } },
  };

  def("elite_destroyer", {
    name: "Elite Destroyer",
    desc: "Pink crasher boss with three devastator guns",
    body: 3,
    guns: [0, 120, 240].map((a) => gun(8, 16, 1, 6, 0, a, 0, { layers: [g.basic, g.pounder, g.destroyer], recoil: 0.4 })),
    health: 160,
    bodyDamage: 3.6,
    upgrades: [],
    needLevel: 45,
    mods: { size: 2.35, health: 1, damage: 1, reload: 1, speed: 1, fov: 1 },
  });

  def("elite_gunner", {
    name: "Elite Gunner",
    desc: "Pink crasher boss with paired gunner barrels",
    body: 3,
    guns: [60, 300].flatMap((a) => [
      gun(16, 5.2, 1, 0, 4.2, a, 0, { layers: [g.basic, g.twin, g.gunner] }),
      gun(16, 5.2, 1, 0, -4.2, a, 0.5, { layers: [g.basic, g.twin, g.gunner] }),
    ]),
    health: 160,
    bodyDamage: 3.2,
    upgrades: [],
    needLevel: 45,
    mods: { size: 2.3, health: 1, damage: 1, reload: 1, speed: 1, fov: 1 },
  });

  def("elite_sprayer", {
    name: "Elite Sprayer",
    desc: "Pink crasher boss that sprays from three faces",
    body: 3,
    guns: [0, 120, 240].map((a) => gun(13, 10, 1.35, 4, 0, a, a / 360, { layers: [g.basic, g.machineGun], spread: 0.2 })),
    health: 160,
    speed: 0.2,
    fov: 1.18,
    bodyDamage: 3.3,
    upgrades: [],
    needLevel: 45,
    mods: { size: 2.32, health: 1, damage: 1, reload: 1, speed: 1, fov: 1 },
  });

  def("elite_battleship", {
    name: "Elite Battleship",
    desc: "Pink crasher boss that launches swarms",
    body: 3,
    guns: [0, 120, 240].flatMap((a) => [
      ...G.swarm(4.2, a, 0, [g.battleship]),
      ...G.swarm(-4.2, a, 0.5, [g.battleship]),
    ]),
    health: BOSS.elite.health,
    speed: 0.18,
    fov: 1.25,
    maxDrones: 18,
    bodyDamage: BOSS.elite.bodyDamage,
    upgrades: [],
    needLevel: 45,
    mods: BOSS.elite.mods,
  });

  def("elite_spawner", {
    name: "Elite Spawner",
    desc: "Pink crasher that builds sentry minions",
    body: 3,
    guns: [60, 180, 300].flatMap((a) => [
      gun(11, 16, 1, 0, 0, a, 0, { type: "deco" }),
      gun(2, 18, 1, 11, 0, a, 0, { type: "minion", layers: [g.minion, { reload: 2, size: 0.55, speed: 0.65 }], calculator: "drone" }),
    ]).concat(G.auto()),
    health: BOSS.elite.health,
    speed: 0.16,
    fov: 1.22,
    maxDrones: 9,
    bodyDamage: 3.3,
    upgrades: [],
    needLevel: 45,
    mods: BOSS.elite.mods,
  });

  def("elite_trapguard", {
    name: "Elite Trap Guard",
    desc: "Pink crasher with traps on every face",
    body: 3,
    guns: [0, 120, 240].flatMap((a) => G.trap(a, [{ speed: 1.1, reload: 1.5, damage: 1.6 }])).concat(G.auto()),
    health: BOSS.elite.health,
    speed: 0.17,
    fov: 1.2,
    bodyDamage: 3.3,
    upgrades: [],
    needLevel: 45,
    mods: BOSS.elite.mods,
  });

  def("elite_spinner", {
    name: "Elite Spinner",
    desc: "Pink crasher that spins gunner streams",
    body: 3,
    spin: true,
    guns: [0, 120, 240].flatMap((a) => [
      gun(9.5, 2, 1, 8.5, 1.5, a + 10, 0, { layers: [g.basic, g.twin, g.gunner] }),
      gun(9.5, 2, 1, 3.5, 6.5, a + 10, 1 / 3, { layers: [g.basic, g.twin, g.gunner] }),
      gun(9.5, 2, 1, -1.5, 11.5, a + 10, 2 / 3, { layers: [g.basic, g.twin, g.gunner] }),
      gun(2, 18, 0.75, 8, 0, a + 60, 0, { type: "deco" }),
    ]).concat(G.auto()),
    health: BOSS.elite.health,
    speed: 0.16,
    fov: 1.2,
    bodyDamage: 3.2,
    upgrades: [],
    needLevel: 45,
    mods: { ...BOSS.elite.mods, size: 2.38 },
  });

  def("elite_skimmer", {
    name: "Elite Skimmer",
    desc: "Pink crasher that launches missiles",
    body: 3,
    guns: [60, 180, 300].map((a) => gun(16, 13, 1.15, 0, 0, a, a / 360, { type: "missile", layers: [g.basic, g.pounder, g.launcher] })),
    health: BOSS.elite.health,
    speed: 0.17,
    fov: 1.24,
    bodyDamage: 3.5,
    upgrades: [],
    needLevel: 45,
    mods: BOSS.elite.mods,
  });

  def("sorcerer", {
    name: "Sorcerer",
    desc: "Egg mystical that floods tiny drones",
    body: 0,
    guns: mysticGuns(2, [{ size: 0.4, spray: 1.8, damage: 1.4 }], 0),
    health: 150,
    speed: 0.14,
    fov: 1.12,
    maxDrones: 50,
    bodyDamage: 2.2,
    upgrades: [],
    needLevel: 45,
    mods: { ...BOSS.mystic.mods, size: 2.2 },
  });

  def("summoner", {
    name: "Summoner",
    desc: "Square mystical that floods drones",
    body: 4,
    guns: mysticGuns(4, [{ size: 0.8 }], 4),
    health: BOSS.mystic.health,
    speed: 0.16,
    fov: 1.15,
    maxDrones: 28,
    bodyDamage: BOSS.mystic.bodyDamage,
    upgrades: [],
    needLevel: 45,
    mods: BOSS.mystic.mods,
  });

  def("enchantress", {
    name: "Enchantress",
    desc: "Triangle mystical with three drone spawners",
    body: 3,
    guns: mysticGuns(3, [{ size: 0.9, damage: 1.1 }], 3),
    health: 200,
    speed: 0.11,
    fov: 1.15,
    maxDrones: 28,
    bodyDamage: 3,
    upgrades: [],
    needLevel: 45,
    mods: BOSS.mystic.mods,
  });

  def("exorcistor", {
    name: "Exorcistor",
    desc: "Pentagon mystical with heavy drones",
    body: 5,
    guns: mysticGuns(5, [g.destroyer, { size: 1.15, reload: 2.4, damage: 2.2 }], 5),
    health: 240,
    speed: 0.1,
    fov: 1.16,
    maxDrones: 20,
    bodyDamage: 3.6,
    upgrades: [],
    needLevel: 45,
    mods: { ...BOSS.mystic.mods, size: 2.55 },
  });

  def("shaman", {
    name: "Shaman",
    desc: "Hex mystical with six drone spawners",
    body: 6,
    guns: mysticGuns(6, [g.destroyer, { size: 1.25, reload: 2.2, damage: 2 }], 6),
    health: 260,
    speed: 0.09,
    fov: 1.18,
    maxDrones: 20,
    bodyDamage: 4,
    upgrades: [],
    needLevel: 45,
    mods: { ...BOSS.mystic.mods, size: 2.6 },
  });

  def("witch", {
    name: "Witch",
    desc: "Triangle mystical with paired drone spawners",
    body: 3,
    guns: [0, 120, 240].flatMap((a) => [
      gun(3.5, 8.65, 1.2, 8, 5.5, a, 0, { type: "drone", layers: [g.drone, g.summoner, { size: 0.4 }], calculator: "drone", shape: 3 }),
      gun(3.5, 8.65, 1.2, 8, -5.5, a, 0.5, { type: "drone", layers: [g.drone, g.summoner, { size: 0.4 }], calculator: "drone", shape: 3 }),
    ]),
    health: 170,
    speed: 0.13,
    fov: 1.14,
    maxDrones: 40,
    bodyDamage: 2.5,
    upgrades: [],
    needLevel: 45,
    mods: BOSS.mystic.mods,
  });

  def("nest_keeper", {
    name: "Nest Keeper",
    desc: "Pentagon nester that spawns mega crashers",
    body: 5,
    guns: [36, 108, 180, 252, 324].flatMap((a) => G.director(a, [g.nestKeeper], { shape: 3 })).concat(G.auto()),
    health: BOSS.nester.health,
    speed: 0.14,
    fov: 1.2,
    maxDrones: 15,
    bodyDamage: BOSS.nester.bodyDamage,
    upgrades: [],
    needLevel: 45,
    mods: BOSS.nester.mods,
  });

  def("nest_warden", {
    name: "Nest Warden",
    desc: "Pentagon nester that drops block traps",
    body: 5,
    guns: [36, 108, 180, 252, 324].flatMap((a) => G.trap(a, [g.setTrap])).concat(G.auto()),
    health: BOSS.nester.health,
    speed: 0.13,
    fov: 1.22,
    bodyDamage: 3,
    upgrades: [],
    needLevel: 45,
    mods: BOSS.nester.mods,
  });

  def("nest_guardian", {
    name: "Nest Guardian",
    desc: "Pentagon nester with five devastators",
    body: 5,
    guns: [36, 108, 180, 252, 324].map((a) => gun(8, 16, 1, 6, 0, a, a / 360, { layers: [g.basic, g.pounder, g.destroyer], recoil: 0.35 })).concat(G.auto()),
    health: 240,
    speed: 0.13,
    fov: 1.22,
    bodyDamage: 3.4,
    upgrades: [],
    needLevel: 45,
    mods: BOSS.nester.mods,
  });

  def("rogue_palisade", {
    name: "Rogue Palisade",
    desc: "Grey hex that builds independent minions",
    body: 6,
    guns: [0, 60, 120, 180, 240, 300].flatMap((a) => [
      gun(4, 6, -1.6, 8, 0, a, a / 360, { type: "minion", layers: [g.minion, g.pounder, { reload: 2, damage: 0.7 }], calculator: "drone" }),
    ]).concat([30, 90, 150, 210, 270, 330].flatMap((a) => G.trap(a))),
    health: BOSS.rogue.health,
    speed: 0.06,
    fov: 1.3,
    maxDrones: 18,
    bodyDamage: BOSS.rogue.bodyDamage,
    upgrades: [],
    needLevel: 45,
    mods: BOSS.rogue.mods,
  });

  def("rogue_armada", {
    name: "Rogue Armada",
    desc: "Grey heptagon with shotgun faces",
    body: 7,
    guns: Array.from({ length: 7 }, (_, i) => {
      const a = (360 / 7) * i + 360 / 14;
      return gun(12, 10, 1.25, 4, 0, a, i / 7, { layers: [g.basic, g.machineGun, g.pounder], spread: 0.28 });
    }),
    health: BOSS.rogue.health,
    speed: 0.09,
    fov: 1.28,
    bodyDamage: 3.5,
    upgrades: [],
    needLevel: 45,
    mods: { ...BOSS.rogue.mods, size: 2.62 },
  });

  def("terrestrial", {
    name: "Terrestrial",
    desc: "Huge pentagon siege boss",
    body: 5,
    guns: [
      ...[0, 72, 144, 216, 288].map((a) => gun(20, 14, 1, 0, 0, a, a / 360, { recoil: 0.5 })),
      ...[36, 108, 180, 252, 324].flatMap((a) => G.trap(a)),
    ],
    health: 320,
    speed: 0.1,
    fov: 1.28,
    reload: 1.85,
    bulletDamage: 2.6,
    bulletPen: 2.2,
    bulletSize: 1.45,
    bodyDamage: 4.2,
    upgrades: [],
    needLevel: 45,
    mods: { size: 3.15, health: 1, damage: 1, reload: 1, speed: 1, fov: 1 },
  });

  def("celestial", {
    name: "Celestial",
    desc: "Hex siege boss with all-around fire",
    body: 6,
    guns: [0, 45, 90, 135, 180, 225, 270, 315].map((a) =>
      gun(18, 12, 1, 0, 0, a, a / 360, { recoil: 0.25 })
    ),
    health: 450,
    speed: 0.08,
    fov: 1.32,
    reload: 1.55,
    bulletDamage: 2.9,
    bulletPen: 2.4,
    bulletSize: 1.5,
    bodyDamage: 4.8,
    upgrades: [],
    needLevel: 45,
    mods: { size: 3.55, health: 1, damage: 1, reload: 1, speed: 1, fov: 1 },
  });

  def("eternal", {
    name: "Eternal",
    desc: "Final siege boss",
    body: 3,
    guns: [0, 120, 240].map((a) => gun(12, 18, 1, 4, 0, a, 0, { recoil: 0.7 })),
    health: 650,
    speed: 0.07,
    fov: 1.4,
    reload: 2.15,
    bulletDamage: 4.4,
    bulletPen: 3.2,
    bulletSize: 2.1,
    bodyDamage: 6.2,
    upgrades: [],
    needLevel: 45,
    mods: { size: 4.1, health: 1, damage: 1, reload: 1, speed: 1, fov: 1 },
  });

  def("sentry_gun", {
    name: "Sentry Gun",
    desc: "Small armed crasher",
    body: 3,
    guns: G.machine(),
    health: 2.4,
    speed: 0.95,
    fov: 1.1,
    reload: 0.55,
    bulletDamage: 0.7,
    bodyDamage: 1.4,
    upgrades: [],
    needLevel: 45,
    mods: { size: 0.85, health: 1, damage: 1, reload: 1, speed: 1, fov: 1 },
  });

  def("sentry_swarm", {
    name: "Sentry Swarm",
    desc: "Small crasher that launches swarms",
    body: 3,
    guns: [...G.swarm(0, 0, 0), ...G.swarm(0, 0, 0.5)],
    health: 2.4,
    speed: 0.95,
    fov: 1.12,
    maxDrones: 8,
    reload: 0.7,
    bodyDamage: 1.35,
    upgrades: [],
    needLevel: 45,
    mods: { size: 0.85, health: 1, damage: 1, reload: 1, speed: 1, fov: 1 },
  });

  def("sentry_trap", {
    name: "Sentry Trap",
    desc: "Small crasher that drops traps",
    body: 3,
    guns: G.trap(),
    health: 2.6,
    speed: 0.9,
    fov: 1.1,
    bodyDamage: 1.5,
    upgrades: [],
    needLevel: 45,
    mods: { size: 0.88, health: 1, damage: 1, reload: 1, speed: 1, fov: 1 },
  });

  def("sanctuary", {
    name: "Sanctuary",
    desc: "Blue trap sanctuary",
    body: 6,
    guns: [0, 45, 90, 135, 180, 225, 270, 315].flatMap((a) => G.trap(a)),
    health: 58,
    speed: 0.01,
    fov: 1.12,
    reload: 1.45,
    bulletDamage: 1.15,
    bulletPen: 1.6,
    bodyDamage: 4.4,
    upgrades: [],
    needLevel: 45,
  });

  const skipAuto = new Set([
    "auto3", "auto5", "auto8", "auto2", "autosmasher", "autogunner", "autosniper", "engineer",
    "healer", "medic", "spawner", "factory",
    "mothership", "arena_closer", "dom_gun", "dom_idle", "dom_heal", "assault_guard",
    "elite_destroyer", "elite_gunner", "elite_sprayer", "elite_battleship", "elite_spawner",
    "elite_trapguard", "elite_spinner", "elite_skimmer",
    "sorcerer", "summoner", "enchantress", "exorcistor", "shaman", "witch",
    "nest_keeper", "nest_warden", "nest_guardian", "rogue_palisade", "rogue_armada",
    "terrestrial", "celestial", "eternal", "sentry_gun", "sentry_swarm", "sentry_trap", "sanctuary",
  ]);
  for (const id of Object.keys(tanks)) {
    const t = tanks[id];
    if (skipAuto.has(id) || t.auto || tanks["auto_" + id]) continue;
    if (!t.guns.some((g) => g.type === "bullet" || g.type === "trap" || g.type === "drone" || g.type === "swarm" || g.type === "minion" || g.type === "pillbox" || g.type === "heal")) {
      if (!t.smasher) continue;
    }
    def("auto_" + id, {
      name: "Auto " + t.name,
      desc: t.name + " with an auto turret",
      body: t.body,
      guns: [...cloneGuns(t.guns), ...G.auto()],
      auto: true,
      smasher: t.smasher,
      fov: t.fov,
      speed: t.speed,
      health: t.health,
      bodyDamage: t.bodyDamage,
      reload: t.reload,
      bulletSpeed: t.bulletSpeed,
      bulletDamage: t.bulletDamage,
      bulletPen: t.bulletPen,
      bulletSize: t.bulletSize,
      maxDrones: t.maxDrones,
      necro: t.necro,
      healer: t.healer,
      upgrades: [],
      needLevel: Math.min(45, Math.max(15, t.needLevel)),
    });
  }

  function get(id) {
    return tanks[id] || tanks.basic;
  }

  function list() {
    return Object.keys(tanks).sort((a, b) => {
      const da = tanks[a];
      const db = tanks[b];
      return da.needLevel - db.needLevel || da.name.localeCompare(db.name);
    });
  }

  function blank() {
    return cloneDef({
      id: "custom",
      name: "Custom Tank",
      desc: "Built in the workshop",
      body: 0,
      guns: [gun(18, 8, 1, 0, 0, 0, 0)],
      upgrades: [],
      needLevel: 1,
      fov: 1,
      speed: 1,
      health: 1,
      bodyDamage: 1,
      reload: 1,
      bulletSpeed: 1,
      bulletDamage: 1,
      bulletPen: 1,
      bulletSize: 1,
      maxDrones: 0,
      smasher: false,
      auto: false,
      necro: 0,
      healer: false,
      mods: { damage: 1, reload: 1, speed: 1, size: 1, fov: 1, health: 1 },
    });
  }

  window.TankCatalog = {
    tanks,
    get,
    list,
    gun,
    cloneDef,
    cloneGuns,
    blank,
    combineStats,
    g,
    PROJECTILE,
    count: () => Object.keys(tanks).length,
  };
})();
