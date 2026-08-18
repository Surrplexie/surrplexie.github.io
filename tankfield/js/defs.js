(() => {
  "use strict";

  function gun(length, width, aspect, x, y, angle, delay, extra = {}) {
    return {
      pos: [length, width, aspect, x, y, angle, delay],
      type: extra.type || "bullet",
      spread: extra.spread || 0,
      recoil: extra.recoil,
      size: extra.size,
      stats: extra.stats || {},
    };
  }

  function cloneGuns(guns) {
    return (guns || []).map((g) => ({
      pos: g.pos.slice(),
      type: g.type,
      spread: g.spread || 0,
      recoil: g.recoil,
      size: g.size,
      stats: { ...(g.stats || {}) },
    }));
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
      mods: spec.mods || { damage: 1, reload: 1, speed: 1, size: 1, fov: 1, health: 1 },
    };
    return tanks[id];
  }

  const G = {
    basic: () => [gun(18, 8, 1, 0, 0, 0, 0)],
    twin: (y = 5.5) => [
      gun(20, 8, 1, 0, y, 0, 0),
      gun(20, 8, 1, 0, -y, 0, 0.5),
    ],
    sniper: (len = 24) => [gun(len, 8.5, 1, 0, 0, 0, 0)],
    machine: () => [gun(12, 10, 1.4, 8, 0, 0, 0, { spread: 0.22 })],
    flank: () => [
      gun(18, 8, 1, 0, 0, 0, 0),
      gun(16, 8, 1, 0, 0, 180, 0),
    ],
    pound: () => [gun(20, 12, 1, 0, 0, 0, 0, { recoil: 2.2 })],
    trap: (ang = 0) => [
      gun(15, 7, 1, 0, 0, ang, 0, { type: "deco" }),
      gun(3, 7, 1.7, 15, 0, ang, 0, { type: "trap" }),
    ],
    director: (ang = 0) => [gun(6, 12, 1.2, 8, 0, ang, 0, { type: "drone" })],
    swarm: (y, ang = 0, delay = 0) => [gun(7, 6.5, 0.6, 7, y, ang, delay, { type: "swarm" })],
    auto: () => [gun(16, 6, 1, 0, 0, 0, 0, { type: "auto" })],
  };

  def("basic", {
    name: "Basic Tank",
    desc: "A reliable all-rounder",
    guns: G.basic(),
    upgrades: ["twin", "sniper", "machinegun", "flank"],
    needLevel: 1,
  });

  def("twin", {
    name: "Twin",
    desc: "Two barrels, staggered fire",
    guns: G.twin(),
    reload: 0.92,
    upgrades: ["tripleshot", "quad", "twinflank"],
    needLevel: 15,
  });

  def("sniper", {
    name: "Sniper",
    desc: "Long range, hard hits",
    guns: G.sniper(),
    bulletSpeed: 1.55,
    reload: 1.5,
    bulletDamage: 1.25,
    fov: 1.22,
    upgrades: ["assassin", "overseer", "hunter", "trapper"],
    needLevel: 15,
  });

  def("machinegun", {
    name: "Machine Gun",
    desc: "Wide barrel, messy spray",
    guns: G.machine(),
    reload: 0.48,
    bulletDamage: 0.7,
    bulletSpeed: 0.92,
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
      gun(18, 8, 1, 0, 0, 0, 0),
      gun(16, 8, 1, 0, 0, 150, 0.33),
      gun(16, 8, 1, 0, 0, 210, 0.66),
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
    reload: 0.7,
    upgrades: ["overseer", "cruiser", "underseer"],
    needLevel: 15,
  });

  def("pounder", {
    name: "Pounder",
    desc: "Heavy shells, heavy recoil",
    guns: G.pound(),
    bulletDamage: 1.7,
    reload: 1.85,
    bulletSize: 1.35,
    bulletPen: 1.4,
    upgrades: ["destroyer", "builder", "artillery", "launcher"],
    needLevel: 15,
  });

  def("trapper", {
    name: "Trapper",
    desc: "Drops lingering traps",
    guns: G.trap(),
    reload: 1.55,
    bulletDamage: 1.05,
    upgrades: ["tritrapper", "megatrapper", "gunnertrapper", "overtrapper"],
    needLevel: 30,
  });

  def("auto3", {
    name: "Auto-3",
    desc: "Three independently aiming guns",
    auto: true,
    guns: [
      gun(16, 6, 1, 0, 0, 0, 0, { type: "auto" }),
      gun(16, 6, 1, 0, 0, 120, 0.33, { type: "auto" }),
      gun(16, 6, 1, 0, 0, 240, 0.66, { type: "auto" }),
    ],
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

  def("pelleter", {
    name: "Pelleter",
    desc: "Two small, fast barrels",
    guns: [
      gun(17, 6.5, 1, 0, 4.2, 0, 0),
      gun(17, 6.5, 1, 0, -4.2, 0, 0.5),
    ],
    reload: 0.55,
    bulletDamage: 0.55,
    bulletSize: 0.75,
    upgrades: ["gunner", "nailgun", "borer"],
    needLevel: 15,
  });

  def("triplet", {
    name: "Triplet",
    desc: "Three barrels of pressure",
    guns: [
      gun(16, 8, 1, 0, 5.5, 0, 0.5),
      gun(20, 8, 1, 0, 0, 0, 0),
      gun(16, 8, 1, 0, -5.5, 0, 0.5),
    ],
    reload: 0.82,
    upgrades: ["penta", "quintuplet"],
    needLevel: 30,
  });

  def("twinflank", {
    name: "Twin Flank",
    desc: "Twins on both ends",
    guns: [
      ...G.twin(5.2),
      gun(20, 8, 1, 0, 5.2, 180, 0),
      gun(20, 8, 1, 0, -5.2, 180, 0.5),
    ],
    upgrades: ["tripletwin", "octo"],
    needLevel: 30,
  });

  def("tripleshot", {
    name: "Triple Shot",
    desc: "A spreading fan of fire",
    guns: [
      gun(19, 8, 1, 0, 0, -27, 0),
      gun(19, 8, 1, 0, 0, 0, 0),
      gun(19, 8, 1, 0, 0, 27, 0),
    ],
    upgrades: ["penta", "spread", "triplet"],
    needLevel: 30,
  });

  def("dual", {
    name: "Dual",
    desc: "Twin sniper barrels",
    guns: [
      gun(22, 7, 1, 0, 4.8, 0, 0),
      gun(22, 7, 1, 0, -4.8, 0, 0.5),
    ],
    bulletSpeed: 1.35,
    fov: 1.12,
    reload: 1.15,
    upgrades: ["hewn", "assassin"],
    needLevel: 30,
  });

  def("assassin", {
    name: "Assassin",
    desc: "See farther, hit harder",
    guns: G.sniper(27),
    bulletSpeed: 1.85,
    reload: 1.85,
    bulletDamage: 1.45,
    fov: 1.42,
    upgrades: ["ranger", "stalker"],
    needLevel: 30,
  });

  def("hunter", {
    name: "Hunter",
    desc: "Staggered sniper shots",
    guns: [
      gun(24, 8, 1, 0, 0, 0, 0),
      gun(21, 12, 1, 0, 0, 0, 0.2),
    ],
    bulletSpeed: 1.4,
    reload: 1.4,
    fov: 1.25,
    upgrades: ["predator", "poacher"],
    needLevel: 30,
  });

  def("minigun", {
    name: "Minigun",
    desc: "A stream of small shots",
    guns: [
      gun(23, 8, 1, 0, 0, 0, 0),
      gun(20, 8, 1, 0, 0, 0, 0.33),
      gun(17, 8, 1, 0, 0, 0, 0.66),
    ],
    reload: 0.42,
    bulletDamage: 0.55,
    fov: 1.15,
    upgrades: ["streamliner", "sprayer"],
    needLevel: 30,
  });

  def("destroyer", {
    name: "Destroyer",
    desc: "Huge shells, huge recoil",
    guns: [gun(21, 14, 1, 0, 0, 0, 0, { recoil: 2.6 })],
    bulletDamage: 3.05,
    bulletPen: 2.1,
    reload: 2.5,
    bulletSpeed: 0.82,
    bulletSize: 1.55,
    upgrades: ["hybrid", "annihilator", "skimmer"],
    needLevel: 30,
  });

  def("gunner", {
    name: "Gunner",
    desc: "Four small, fast guns",
    guns: [
      gun(12, 4.5, 1, 0, 7.2, 0, 0.5),
      gun(12, 4.5, 1, 0, -7.2, 0, 0.75),
      gun(16, 4.5, 1, 0, 3.6, 0, 0),
      gun(16, 4.5, 1, 0, -3.6, 0, 0.25),
    ],
    reload: 0.5,
    bulletDamage: 0.42,
    bulletSize: 0.7,
    upgrades: ["streamliner", "gunnertrapper"],
    needLevel: 30,
  });

  def("sprayer", {
    name: "Sprayer",
    desc: "Machine gun with a secondary stream",
    guns: [
      gun(23, 8, 1, 0, 0, 0, 0),
      gun(12, 10, 1.4, 8, 0, 0, 0, { spread: 0.2 }),
    ],
    reload: 0.45,
    bulletDamage: 0.62,
    upgrades: ["atomizer", "focal"],
    needLevel: 30,
  });

  def("quad", {
    name: "Quad Tank",
    desc: "Fire in four directions",
    guns: [0, 90, 180, 270].map((a, i) => gun(18, 8, 1, 0, 0, a, i * 0.15)),
    upgrades: ["octo", "cyclone"],
    needLevel: 30,
  });

  def("booster", {
    name: "Booster",
    desc: "Rear thrusters for speed",
    guns: [
      gun(18, 8, 1, 0, 0, 0, 0),
      gun(14, 8, 1, 0, 0, 140, 0.33),
      gun(14, 8, 1, 0, 0, 220, 0.66),
      gun(16, 8, 1, 0, 0, 150, 0.15),
      gun(16, 8, 1, 0, 0, 210, 0.5),
    ],
    speed: 1.18,
    upgrades: ["fighter"],
    needLevel: 45,
  });

  def("overseer", {
    name: "Overseer",
    desc: "Two drone spawners",
    body: 4,
    guns: [...G.director(90), ...G.director(270)],
    maxDrones: 8,
    reload: 0.65,
    upgrades: ["overlord", "necromancer", "manager"],
    needLevel: 30,
  });

  def("cruiser", {
    name: "Cruiser",
    desc: "Swarm swarms",
    body: 4,
    guns: [...G.swarm(0, 90, 0), ...G.swarm(0, 270, 0.5)],
    maxDrones: 14,
    reload: 0.4,
    bulletDamage: 0.45,
    upgrades: ["carrier", "battleship"],
    needLevel: 30,
  });

  def("underseer", {
    name: "Underseer",
    desc: "Square drones from a square body",
    body: 4,
    guns: [...G.director(90), ...G.director(270)],
    maxDrones: 10,
    bulletSize: 1.15,
    reload: 0.7,
    upgrades: ["necromancer", "maleficitor"],
    needLevel: 30,
  });

  def("builder", {
    name: "Builder",
    desc: "Fires block traps",
    guns: [
      gun(18, 12, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(2, 12, 1.1, 18, 0, 0, 0, { type: "trap", size: 1.4 }),
    ],
    reload: 1.9,
    bulletDamage: 1.6,
    bulletSize: 1.5,
    upgrades: ["construct", "engineer", "architect"],
    needLevel: 30,
  });

  def("artillery", {
    name: "Artillery",
    desc: "Side guns plus a pounder",
    guns: [
      gun(17, 8, 1, 0, 0, -25, 0.5),
      gun(17, 8, 1, 0, 0, 25, 0.5),
      gun(19, 12, 1, 0, 0, 0, 0, { recoil: 1.6 }),
    ],
    reload: 1.4,
    bulletDamage: 1.2,
    upgrades: ["mortar", "skimmer"],
    needLevel: 30,
  });

  def("launcher", {
    name: "Launcher",
    desc: "Fires a slow, heavy missile",
    guns: [gun(16, 13, 1.15, 0, 0, 0, 0, { recoil: 1.8, type: "missile" })],
    reload: 2.1,
    bulletDamage: 1.8,
    bulletSize: 1.4,
    upgrades: ["skimmer", "rocketeer"],
    needLevel: 30,
  });

  def("tritrapper", {
    name: "Tri-Trapper",
    desc: "Traps in three directions",
    guns: [0, 120, 240].flatMap((a) => G.trap(a)),
    reload: 1.35,
    upgrades: ["fortress", "hexatrap"],
    needLevel: 30,
  });

  def("megatrapper", {
    name: "Mega Trapper",
    desc: "One enormous trap",
    guns: [
      gun(15, 12, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(4, 12, 1.6, 15, 0, 0, 0, { type: "trap", size: 1.8 }),
    ],
    reload: 2.2,
    bulletDamage: 2.2,
    upgrades: ["gigatrap", "construct"],
    needLevel: 30,
  });

  def("gunnertrapper", {
    name: "Gunner Trapper",
    desc: "Front gunners, rear traps",
    guns: [
      gun(19, 4.5, 1, 0, 3.2, 0, 0),
      gun(19, 4.5, 1, 0, -3.2, 0, 0.5),
      ...G.trap(180),
    ],
    reload: 0.85,
    upgrades: ["bushwhacker", "fortress"],
    needLevel: 30,
  });

  def("overtrapper", {
    name: "Overtrapper",
    desc: "Traps up front, drones on the sides",
    body: 4,
    guns: [...G.trap(0), ...G.director(120), ...G.director(240)],
    maxDrones: 4,
    reload: 1.1,
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
      gun(19, 5.5, 1, 0, 3.6, 0, 0),
      gun(19, 5.5, 1, 0, -3.6, 0, 0.5),
      gun(16, 5.5, 1, 0, 0, 0, 0.25),
    ],
    reload: 0.38,
    bulletDamage: 0.4,
    bulletSpeed: 1.2,
    upgrades: ["borer"],
    needLevel: 30,
  });

  def("borer", {
    name: "Borer",
    desc: "Armor-piercing pellets",
    guns: G.twin(4.4),
    reload: 0.5,
    bulletPen: 1.8,
    bulletSpeed: 1.35,
    bulletDamage: 0.7,
    upgrades: [],
    needLevel: 45,
  });

  def("penta", {
    name: "Penta Shot",
    desc: "Five-wide shotgun",
    guns: [-40, -20, 0, 20, 40].map((a, i) => gun(16 + (i === 2 ? 4 : 0), 8, 1, 0, 0, a, i % 2 ? 0.5 : 0)),
    upgrades: ["spread"],
    needLevel: 45,
  });

  def("quintuplet", {
    name: "Quintuplet",
    desc: "Five forward barrels",
    guns: [
      gun(14, 7, 1, 0, 8, 0, 0.6),
      gun(16, 7, 1, 0, 4.5, 0, 0.3),
      gun(20, 7, 1, 0, 0, 0, 0),
      gun(16, 7, 1, 0, -4.5, 0, 0.3),
      gun(14, 7, 1, 0, -8, 0, 0.6),
    ],
    reload: 0.78,
    upgrades: [],
    needLevel: 45,
  });

  def("tripletwin", {
    name: "Triple Twin",
    desc: "Twins at 0, 120, 240",
    guns: [0, 120, 240].flatMap((a) => [
      gun(20, 8, 1, 0, 5.2, a, 0),
      gun(20, 8, 1, 0, -5.2, a, 0.5),
    ]),
    upgrades: ["hexadual"],
    needLevel: 45,
  });

  def("octo", {
    name: "Octo Tank",
    desc: "Eight-way fire",
    guns: [0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => gun(18, 8, 1, 0, 0, a, (i % 2) * 0.5)),
    upgrades: [],
    needLevel: 45,
  });

  def("spread", {
    name: "Spread Shot",
    desc: "A huge fan of small guns",
    guns: [-75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75].map((a, i) =>
      gun(13 + (a === 0 ? 6 : 0), a === 0 ? 8 : 6, 1, 0, 0, a, Math.abs(i - 5) * 0.08)
    ),
    reload: 0.9,
    bulletDamage: 0.55,
    upgrades: [],
    needLevel: 45,
  });

  def("ranger", {
    name: "Ranger",
    desc: "The longest sightline",
    guns: [gun(30, 8, 1, 0, 0, 0, 0), gun(6, 12, -1.2, 8, 0, 0, 0, { type: "deco" })],
    bulletSpeed: 2,
    reload: 2.05,
    bulletDamage: 1.55,
    fov: 1.65,
    upgrades: [],
    needLevel: 45,
  });

  def("stalker", {
    name: "Stalker",
    desc: "Assassin that fades while still",
    guns: [gun(27, 8.5, -1.1, 0, 0, 0, 0)],
    bulletSpeed: 1.8,
    reload: 1.8,
    fov: 1.45,
    upgrades: [],
    needLevel: 45,
  });

  def("predator", {
    name: "Predator",
    desc: "Three stacked sniper barrels",
    guns: [
      gun(24, 8, 1, 0, 0, 0, 0),
      gun(21, 11, 1, 0, 0, 0, 0.15),
      gun(18, 14, 1, 0, 0, 0, 0.3),
    ],
    bulletSpeed: 1.45,
    reload: 1.55,
    fov: 1.35,
    upgrades: [],
    needLevel: 45,
  });

  def("poacher", {
    name: "Poacher",
    desc: "Hunter with a drone spawner",
    body: 4,
    guns: [
      gun(24, 8, 1, 0, 0, 0, 0),
      gun(21, 12, 1, 0, 0, 0, 0.2),
      ...G.director(180),
    ],
    maxDrones: 3,
    fov: 1.22,
    upgrades: [],
    needLevel: 45,
  });

  def("streamliner", {
    name: "Streamliner",
    desc: "Five-barrel bullet stream",
    guns: [24, 21, 18, 15, 12].map((l, i) => gun(l, 7, 1, 0, 0, 0, i * 0.2)),
    reload: 0.36,
    bulletDamage: 0.42,
    fov: 1.18,
    upgrades: [],
    needLevel: 45,
  });

  def("annihilator", {
    name: "Annihilator",
    desc: "The biggest gun",
    guns: [gun(21, 20, 1, 0, 0, 0, 0, { recoil: 3.2 })],
    bulletDamage: 4.1,
    bulletPen: 2.6,
    reload: 2.9,
    bulletSpeed: 0.78,
    bulletSize: 1.9,
    upgrades: [],
    needLevel: 45,
  });

  def("hybrid", {
    name: "Hybrid",
    desc: "Destroyer plus a drone spawner",
    body: 4,
    guns: [gun(21, 14, 1, 0, 0, 0, 0, { recoil: 2.4 }), ...G.director(180)],
    maxDrones: 3,
    bulletDamage: 2.7,
    reload: 2.3,
    bulletSize: 1.45,
    upgrades: [],
    needLevel: 45,
  });

  def("skimmer", {
    name: "Skimmer",
    desc: "A spinning missile launcher",
    guns: [
      gun(10, 14, -0.5, 9, 0, 0, 0, { type: "deco" }),
      gun(16, 13, 1, 0, 0, 0, 0, { type: "missile", recoil: 1.7 }),
    ],
    reload: 2,
    bulletDamage: 1.6,
    upgrades: [],
    needLevel: 45,
  });

  def("atomizer", {
    name: "Atomizer",
    desc: "Tiny, furious spray",
    guns: [
      gun(24, 7, 1, 0, 0, 0, 0),
      gun(12, 10, 1.4, 8, 0, 0, 0, { spread: 0.28 }),
    ],
    reload: 0.32,
    bulletDamage: 0.38,
    bulletSize: 0.6,
    upgrades: [],
    needLevel: 45,
  });

  def("focal", {
    name: "Focal",
    desc: "Sprayer with tighter aim",
    guns: [
      gun(24, 8, 1, 0, 0, 0, 0),
      gun(16, 9, 1.1, 4, 0, 0, 0, { spread: 0.08 }),
    ],
    reload: 0.5,
    bulletSpeed: 1.2,
    upgrades: [],
    needLevel: 45,
  });

  def("cyclone", {
    name: "Cyclone",
    desc: "Twelve small guns in a ring",
    guns: Array.from({ length: 12 }, (_, i) => gun(13, 4.5, 1, 0, 0, i * 30, (i % 3) * 0.2)),
    reload: 0.55,
    bulletDamage: 0.4,
    bulletSize: 0.65,
    upgrades: [],
    needLevel: 45,
  });

  def("fighter", {
    name: "Fighter",
    desc: "Booster with side guns",
    guns: [
      gun(18, 8, 1, 0, 0, 0, 0),
      gun(16, 8, 1, 0, 0, 90, 0.2),
      gun(16, 8, 1, 0, 0, 270, 0.2),
      gun(14, 8, 1, 0, 0, 150, 0.5),
      gun(14, 8, 1, 0, 0, 210, 0.5),
    ],
    speed: 1.12,
    upgrades: [],
    needLevel: 45,
  });

  def("surfer", {
    name: "Surfer",
    desc: "Booster that also launches swarms",
    guns: [
      gun(18, 8, 1, 0, 0, 0, 0),
      ...G.swarm(0, 150, 0.3),
      ...G.swarm(0, 210, 0.6),
      gun(14, 8, 1, 0, 0, 140, 0.2),
      gun(14, 8, 1, 0, 0, 220, 0.5),
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
    guns: [0, 90, 180, 270].flatMap((a) => G.director(a)),
    maxDrones: 8,
    reload: 0.6,
    upgrades: [],
    needLevel: 45,
  });

  def("manager", {
    name: "Manager",
    desc: "One strong spawner, fades while still",
    body: 4,
    guns: G.director(0),
    maxDrones: 8,
    reload: 0.55,
    bulletDamage: 1.25,
    upgrades: [],
    needLevel: 45,
  });

  def("battleship", {
    name: "Battleship",
    desc: "Four swarm spawners",
    body: 4,
    guns: [90, 270].flatMap((a) => [
      gun(7, 6.5, 0.6, 7, 4, a, 0, { type: "swarm" }),
      gun(7, 6.5, 0.6, 7, -4, a, 0.5, { type: "swarm" }),
    ]),
    maxDrones: 20,
    reload: 0.35,
    bulletDamage: 0.4,
    upgrades: [],
    needLevel: 45,
  });

  def("carrier", {
    name: "Carrier",
    desc: "Three swarm spawners in a fan",
    body: 4,
    guns: [-30, 0, 30].flatMap((a, i) => G.swarm(0, a, i * 0.2)),
    maxDrones: 16,
    reload: 0.38,
    upgrades: [],
    needLevel: 45,
  });

  def("necromancer", {
    name: "Necromancer",
    desc: "Four square-drone spawners",
    body: 4,
    guns: [0, 90, 180, 270].flatMap((a) => G.director(a)),
    maxDrones: 16,
    bulletSize: 1.05,
    reload: 0.7,
    upgrades: [],
    needLevel: 45,
  });

  def("maleficitor", {
    name: "Maleficitor",
    desc: "One underseer spawner, fades while still",
    body: 4,
    guns: G.director(0),
    maxDrones: 12,
    reload: 0.6,
    upgrades: [],
    needLevel: 45,
  });

  def("construct", {
    name: "Construct",
    desc: "Builder with a bigger block",
    guns: [
      gun(18, 16, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(2, 16, 1.1, 18, 0, 0, 0, { type: "trap", size: 1.8 }),
    ],
    reload: 2.1,
    bulletDamage: 2,
    upgrades: [],
    needLevel: 45,
  });

  def("engineer", {
    name: "Engineer",
    desc: "Traps that sprout auto guns",
    guns: [
      gun(18, 10, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(2, 10, 1.2, 18, 0, 0, 0, { type: "trap", size: 1.2 }),
    ],
    auto: true,
    reload: 1.7,
    upgrades: [],
    needLevel: 45,
  });

  def("architect", {
    name: "Architect",
    desc: "Blocks in three directions",
    guns: [0, 120, 240].flatMap((a) => [
      gun(18, 12, 1, 0, 0, a, 0, { type: "deco" }),
      gun(2, 12, 1.1, 18, 0, a, 0, { type: "trap", size: 1.35 }),
    ]),
    reload: 1.8,
    upgrades: [],
    needLevel: 45,
  });

  def("mortar", {
    name: "Mortar",
    desc: "Artillery with gunner sides",
    guns: [
      gun(12, 4.5, 1, 0, 8, -25, 0.5),
      gun(12, 4.5, 1, 0, -8, 25, 0.5),
      gun(19, 12, 1, 0, 0, 0, 0, { recoil: 1.7 }),
    ],
    reload: 1.35,
    upgrades: [],
    needLevel: 45,
  });

  def("rocketeer", {
    name: "Rocketeer",
    desc: "A faster missile with a tapered barrel",
    guns: [gun(16, 12, 0.7, 0, 0, 0, 0, { type: "missile", recoil: 1.9 })],
    reload: 1.85,
    bulletSpeed: 1.15,
    bulletDamage: 1.7,
    upgrades: [],
    needLevel: 45,
  });

  def("fortress", {
    name: "Fortress",
    desc: "Traps all around, gunners in front",
    guns: [
      gun(18, 4.5, 1, 0, 3.2, 0, 0),
      gun(18, 4.5, 1, 0, -3.2, 0, 0.5),
      ...[0, 120, 240].flatMap((a) => G.trap(a)),
    ],
    reload: 1.05,
    upgrades: [],
    needLevel: 45,
  });

  def("hexatrap", {
    name: "Hexa-Trapper",
    desc: "Six trap launchers",
    guns: [0, 60, 120, 180, 240, 300].flatMap((a) => G.trap(a)),
    reload: 1.2,
    upgrades: [],
    needLevel: 45,
  });

  def("gigatrap", {
    name: "Giga Trapper",
    desc: "An even bigger trap",
    guns: [
      gun(15, 16, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(4, 16, 1.5, 15, 0, 0, 0, { type: "trap", size: 2.1 }),
    ],
    reload: 2.6,
    bulletDamage: 2.8,
    upgrades: [],
    needLevel: 45,
  });

  def("bushwhacker", {
    name: "Bushwhacker",
    desc: "Sniper front, traps behind",
    guns: [...G.sniper(24), ...G.trap(180)],
    bulletSpeed: 1.4,
    fov: 1.2,
    reload: 1.25,
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
      gun(12, 4.5, 1, 0, 7.2, 0, 0.5),
      gun(12, 4.5, 1, 0, -7.2, 0, 0.75),
      gun(16, 4.5, 1, 0, 3.6, 0, 0),
      gun(16, 4.5, 1, 0, -3.6, 0, 0.25),
      ...G.auto(),
    ],
    reload: 0.5,
    bulletDamage: 0.42,
    bulletSize: 0.7,
    upgrades: [],
    needLevel: 45,
  });

  def("autosniper", {
    name: "Auto Assassin",
    desc: "Sniper turret on a spinning hull",
    auto: true,
    guns: [...G.sniper(24), ...G.auto()],
    bulletSpeed: 1.5,
    fov: 1.3,
    reload: 1.4,
    upgrades: [],
    needLevel: 45,
  });

  def("auto5", {
    name: "Auto-5",
    desc: "Five auto guns",
    auto: true,
    guns: [0, 72, 144, 216, 288].map((a, i) => gun(16, 6, 1, 0, 0, a, i * 0.15, { type: "auto" })),
    upgrades: [],
    needLevel: 45,
  });

  def("auto8", {
    name: "Auto-8",
    desc: "Eight auto guns",
    auto: true,
    guns: Array.from({ length: 8 }, (_, i) => gun(14, 5.5, 1, 0, 0, i * 45, i * 0.1, { type: "auto" })),
    reload: 0.85,
    upgrades: [],
    needLevel: 45,
  });

  def("hewn", {
    name: "Hewn Pelleter",
    desc: "Gunner with side barrels",
    guns: [
      gun(17, 6.5, 1, 0, 4.2, 0, 0),
      gun(17, 6.5, 1, 0, -4.2, 0, 0.5),
      gun(15, 6.5, 1, 0, 0, 28, 0.25),
      gun(15, 6.5, 1, 0, 0, -28, 0.75),
    ],
    reload: 0.52,
    bulletDamage: 0.5,
    upgrades: [],
    needLevel: 45,
  });

  def("hexadual", {
    name: "Hexa Dual",
    desc: "Duals in three directions",
    guns: [0, 120, 240].flatMap((a) => [
      gun(21, 7, 1, 0, 4.5, a, 0),
      gun(21, 7, 1, 0, -4.5, a, 0.5),
    ]),
    upgrades: [],
    needLevel: 45,
  });

  def("single", {
    name: "Single",
    desc: "One oversized basic gun",
    guns: [gun(20, 10, 1, 0, 0, 0, 0)],
    bulletDamage: 1.35,
    reload: 1.15,
    upgrades: ["pounder", "sniper"],
    needLevel: 15,
  });

  def("auto2", {
    name: "Auto-2",
    desc: "Two auto guns",
    auto: true,
    guns: [
      gun(16, 6, 1, 0, 0, 0, 0, { type: "auto" }),
      gun(16, 6, 1, 0, 0, 180, 0.5, { type: "auto" }),
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
      gun(19, 8, 1, 0, 0, -27, 0),
      gun(19, 8, 1, 0, 0, 0, 0),
      gun(19, 8, 1, 0, 0, 27, 0),
      ...G.director(180),
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
    health: 22,
    speed: 0.01,
    fov: 1.15,
    reload: 2.15,
    bulletSpeed: 1.05,
    bulletDamage: 3.1,
    bulletPen: 3.2,
    bulletSize: 1.85,
    bodyDamage: 4.2,
    upgrades: [],
    needLevel: 45,
  });

  def("dom_heal", {
    name: "Healer",
    desc: "Main spawn dominator that fires healing shells",
    guns: [0, 45, 90, 135, 180, 225, 270, 315].map((a) =>
      gun(14, 7.2, 1, 0, 0, a, a / 360, { type: "heal", recoil: 0, size: 0.95, stats: { speed: 0.52, life: 0.72 } })
    ),
    health: 30,
    speed: 0.01,
    fov: 1.1,
    reload: 0.82,
    bulletSpeed: 0.7,
    bulletDamage: 0.2,
    bulletPen: 1,
    bulletSize: 1.15,
    bodyDamage: 3.4,
    upgrades: [],
    needLevel: 45,
  });

  const skipAuto = new Set([
    "auto3", "auto5", "auto8", "auto2", "autosmasher", "autogunner", "autosniper", "engineer",
    "mothership", "arena_closer", "dom_gun", "dom_heal",
  ]);
  for (const id of Object.keys(tanks)) {
    const t = tanks[id];
    if (skipAuto.has(id) || t.auto || tanks["auto_" + id]) continue;
    if (!t.guns.some((g) => g.type === "bullet" || g.type === "trap" || g.type === "drone" || g.type === "swarm")) {
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
    count: () => Object.keys(tanks).length,
  };
})();
