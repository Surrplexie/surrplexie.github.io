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
    blank: { reload: 1, recoil: 1, shudder: 1, size: 1, health: 1, damage: 1, pen: 1, speed: 1, maxSpeed: 1, range: 1, density: 1, spray: 1, resist: 1 },
    basic: { reload: 10.5, recoil: 1.4, shudder: 0.1, damage: 0.75, speed: 5, spray: 15 },
    drone: { reload: 36, recoil: 0.25, shudder: 0.1, size: 0.6, speed: 1.5, spray: 0.1 },
    swarm: { reload: 23, recoil: 0.25, shudder: 0.05, size: 0.4, damage: 0.75, speed: 4, spray: 5 },
    minion: { reload: 48, shudder: 0.1, size: 0.7, damage: 0.75, speed: 3, spray: 0.1 },
    trap: { reload: 23, shudder: 0.25, size: 0.7, damage: 0.75, speed: 3.25, resist: 3, spray: 0 },
    single: { reload: 1.05, speed: 1.05 },
    desmos: { reload: 1.1, range: 1.2, shudder: 0, spray: 0, damage: 0.75, speed: 0.5 },
    twin: { recoil: 0.5, shudder: 0.9, health: 0.9, damage: 0.7, spray: 1.2 },
    doubleTwin: { damage: 1.1 },
    tripleTwin: { health: 1.1 },
    hewnDouble: { reload: 1.25, recoil: 1.5, health: 0.9, damage: 0.85, maxSpeed: 0.9 },
    tripleShot: { reload: 1.1, shudder: 0.8, health: 0.9, pen: 0.8, density: 0.8, spray: 0.5 },
    spreadshotMain: { reload: 0.781, recoil: 0.25, shudder: 0.5, health: 0.5, speed: 1.923, maxSpeed: 2.436 },
    spreadshot: { reload: 1.5, shudder: 0.25, speed: 0.7, maxSpeed: 0.7, spray: 0.25 },
    triplet: { reload: 1.2, recoil: 0.666667, shudder: 0.9, health: 0.85, damage: 0.85, pen: 0.9, density: 1.1, spray: 0.9, resist: 0.95 },
    turret: { reload: 2, health: 0.8, damage: 0.6, pen: 0.7, density: 0.1 },
    autoTurret: { reload: 0.9, recoil: 0.75, shudder: 0.5, size: 0.8, health: 0.9, damage: 0.6, pen: 1.2, speed: 1.1, range: 0.8, density: 1.3, resist: 1.25 },
    sniper: { reload: 1.35, shudder: 0.25, damage: 0.8, pen: 1.1, speed: 1.5, maxSpeed: 1.5, density: 1.5, spray: 0.2, resist: 1.15 },
    crossbow: { reload: 2, health: 0.6, damage: 0.6, pen: 0.8 },
    assassin: { reload: 1.65, shudder: 0.25, health: 1.15, pen: 1.1, speed: 1.18, maxSpeed: 1.18, density: 3, resist: 1.3 },
    hunter: { reload: 1.5, recoil: 0.7, size: 0.95, damage: 0.9, speed: 1.1, maxSpeed: 0.8, density: 1.2, resist: 1.15 },
    hunterSecondary: { size: 0.9, health: 2, damage: 0.5, pen: 1.5, density: 1.2, resist: 1.1 },
    predator: { reload: 1.4, size: 0.8, health: 1.5, damage: 0.9, pen: 1.2, speed: 0.9, maxSpeed: 0.9 },
    dual: { reload: 2, shudder: 0.8, health: 1.5, speed: 1.3, maxSpeed: 1.1, resist: 1.25 },
    rifle: { reload: 0.8, recoil: 0.8, shudder: 1.5, health: 0.8, damage: 0.8, pen: 0.9, spray: 2 },
    blunderbuss: { recoil: 0.1, shudder: 0.5, health: 0.4, damage: 0.2, pen: 0.4, spray: 0.5 },
    railgun: { reload: 4.2, damage: 0.81, health: 3.06, resist: 2.3, density: 0.7, speed: 1.375, maxSpeed: 1.375 },
    marksman: { pen: 2, damage: 0.12, health: 8.333333, reload: 1.75 },
    machineGun: { reload: 0.5, recoil: 0.8, shudder: 1.7, health: 0.7, damage: 0.7, maxSpeed: 0.8, spray: 2.5 },
    minigun: { reload: 1.25, recoil: 0.6, size: 0.8, health: 0.55, damage: 0.45, pen: 1.25, speed: 1.33, density: 1.25, spray: 0.5, resist: 1.1 },
    streamliner: { reload: 1.1, recoil: 0.6, damage: 0.65, speed: 1.24 },
    nailgun: { reload: 0.85, recoil: 2.5, size: 0.8, damage: 0.7, density: 2 },
    pelleter: { reload: 1.25, recoil: 0.25, shudder: 1.5, size: 1.1, damage: 0.35, pen: 1.35, speed: 0.9, maxSpeed: 0.8, density: 1.5, spray: 1.5, resist: 1.2 },
    gunner: { recoil: 0.25, shudder: 1.5, size: 1.2, health: 1.35, damage: 0.25, pen: 1.25, speed: 0.8, maxSpeed: 0.65, density: 1.5, spray: 1.5, resist: 1.2 },
    machineGunner: { reload: 0.666667, recoil: 0.8, shudder: 2, damage: 0.75, speed: 1.2, maxSpeed: 0.8, spray: 2.5 },
    blaster: { recoil: 1.2, shudder: 1.25, size: 1.1, health: 1.5, pen: 0.6, speed: 0.8, maxSpeed: 0.33, range: 0.6, density: 0.5, spray: 1.5, resist: 0.8 },
    flamethrower: { reload: 1.75, recoil: 1.333333, shudder: 2, size: 0.25, health: 10, damage: 0.2, pen: 4, speed: 2, maxSpeed: 0, range: 3, density: 0.25 },
    gatlingGun: { reload: 1.25, recoil: 1.333333, shudder: 0.8, health: 0.8, pen: 1.1, speed: 1.25, maxSpeed: 1.25, range: 1.1, density: 1.25, spray: 0.5, resist: 1.1 },
    atomizer: { reload: 0.3, recoil: 0.8, size: 0.5, damage: 0.75, speed: 1.2, maxSpeed: 0.8, spray: 2.25 },
    spam: { reload: 1.1, size: 1.05, damage: 1.1, speed: 0.9, maxSpeed: 0.7, resist: 1.05 },
    gunnerDominator: { reload: 1.1, recoil: 0, shudder: 1.1, size: 0.5, health: 0.5, damage: 0.5, speed: 1.1, density: 0.9, spray: 1.2, resist: 0.8 },
    flankGuard: { recoil: 1.2, health: 1.02, damage: 0.81, pen: 0.9, maxSpeed: 0.85, density: 1.2 },
    cyclone: { health: 1.3, damage: 1.3, pen: 1.1, speed: 1.5, maxSpeed: 1.15 },
    triAngle: { recoil: 0.9, health: 0.9, speed: 0.8, maxSpeed: 0.8, range: 0.6 },
    triAngleFront: { recoil: 0.2, speed: 1.3, maxSpeed: 1.1, range: 1.5 },
    thruster: { recoil: 1.5, shudder: 2, health: 0.5, damage: 0.5, pen: 0.7, spray: 0.5, resist: 0.7 },
    overseer: { reload: 1.25, size: 0.85, health: 0.7, damage: 0.8, maxSpeed: 0.9, density: 2 },
    overdrive: { reload: 2.5, health: 0.8, damage: 0.8, pen: 0.8, speed: 0.9, maxSpeed: 0.9, range: 0.9, spray: 1.2 },
    commander: { reload: 1.5, health: 0.4, damage: 0.7 },
    baseProtector: { reload: 0.7, size: 1.5, recoil: 0.000001, health: 100, speed: 2.3, maxSpeed: 1.1, range: 0.5, density: 5, resist: 10 },
    battleship: { health: 1.25, damage: 1.15, maxSpeed: 0.85, resist: 1.1 },
    carrier: { reload: 1.5, damage: 0.8, speed: 1.3, maxSpeed: 1.2, range: 1.2 },
    bee: { reload: 1.3, size: 1.4, damage: 1.5, pen: 0.5, speed: 1.5, maxSpeed: 1.5, density: 0.25 },
    sunchip: { reload: 4, size: 1.4, health: 0.5, damage: 0.4, pen: 0.6, density: 0.8 },
    maleficitor: { reload: 0.25, size: 1.05, health: 1.15, damage: 1.15, pen: 1.15, speed: 0.8, maxSpeed: 0.8, density: 1.15 },
    summoner: { reload: 0.3, size: 1.125, health: 0.5, damage: 0.345, pen: 0.4, density: 0.8 },
    minionGun: { recoil: 0, shudder: 2, health: 0.4, damage: 0.4, pen: 1.2, range: 0.75, spray: 2 },
    bigCheese: { reload: 1.5, size: 1.8, health: 2.5, speed: 1.25 },
    mothership: { reload: 1.25, pen: 1.1, speed: 0.775, maxSpeed: 0.8, range: 15, resist: 1.15 },
    satellite: { size: 0.8, reload: 3, damage: 1.875 },
    spawner: { reload: 1.5, maxSpeed: 1.25 },
    pounder: { reload: 2, recoil: 1.6, damage: 2, speed: 0.85, maxSpeed: 0.8, density: 1.5, resist: 1.15 },
    destroyer: { reload: 2, recoil: 1.8, shudder: 0.5, health: 2, damage: 0.9, pen: 1.2, speed: 0.5, maxSpeed: 0.6, density: 2, resist: 3 },
    annihilator: { reload: 1, recoil: 1.35, damage: 0.86 },
    hive: { reload: 1.5, recoil: 0.8, size: 0.8, health: 0.7, damage: 0.3, maxSpeed: 0.6 },
    artillery: { reload: 1.2, recoil: 0.7, size: 0.9, speed: 1.15, maxSpeed: 1.1, density: 1.5 },
    mortar: { reload: 1.2, health: 1.1, speed: 0.8, maxSpeed: 0.8 },
    shotgun: { reload: 8, recoil: 0.4, size: 1.5, damage: 0.4, pen: 0.8, speed: 1.8, maxSpeed: 0.6, density: 1.2, spray: 1.2 },
    destroyerDominator: { reload: 6.5, recoil: 0, size: 0.975, health: 5, damage: 5, pen: 5, speed: 0.575, maxSpeed: 0.475, spray: 0.5 },
    launcher: { reload: 1.5, recoil: 1.5, shudder: 0.1, size: 0.72, health: 1.05, damage: 0.925, speed: 0.9, maxSpeed: 1.2, range: 1.1, resist: 1.5 },
    skimmer: { recoil: 0.8, shudder: 0.8, size: 0.9, health: 1.35, damage: 0.8, pen: 2, speed: 0.85, maxSpeed: 0.85, resist: 1.1 },
    snake: { reload: 0.4, shudder: 4, health: 1.5, damage: 0.9, pen: 1.2, speed: 0.1, maxSpeed: 0.35, density: 3, spray: 6, resist: 0.5 },
    snakeskin: { reload: 0.6, shudder: 2, health: 0.5, damage: 0.5, speed: 2, maxSpeed: 0.2, range: 0.4, spray: 5 },
    sidewinder: { reload: 1.5, recoil: 2, health: 1.5, damage: 0.9, speed: 0.15, maxSpeed: 0.5 },
    rocketeer: { reload: 1.4, shudder: 0.9, size: 2, health: 1.5, damage: 1.4, pen: 1.4, speed: 0.3, range: 1.2, resist: 1.4 },
    missileTrail: { reload: 0.6, recoil: 0.25, shudder: 2, damage: 0.9, pen: 0.7, speed: 0.4, range: 0.5 },
    rocketeerMissileTrail: { reload: 0.5, recoil: 7, shudder: 1.5, size: 0.8, health: 0.8, damage: 0.7, speed: 0.9, maxSpeed: 0.8, spray: 5 },
    setTrap: { reload: 1.1, recoil: 2, shudder: 0.1, size: 1.5, health: 2, pen: 1.25, speed: 2.2, maxSpeed: 2.15, range: 1.25, resist: 1.25 },
    construct: { reload: 1.3, size: 0.9, maxSpeed: 1.1 },
    boomerang: { reload: 0.8, health: 0.5, damage: 0.5, speed: 0.75, maxSpeed: 0.75, range: 1.333333 },
    nestKeeper: { reload: 3, size: 0.75, health: 1.05, damage: 1.05, pen: 1.1, speed: 0.5, maxSpeed: 0.5, range: 0.5, density: 1.1 },
    hexaTrapper: { reload: 1.3, shudder: 1.25, speed: 0.8, range: 0.5 },
    trapperDominator: { reload: 1.46, recoil: 0, shudder: 0.25, health: 1.25, damage: 1.45, pen: 1.6, speed: 0.5, maxSpeed: 2, range: 1.1, spray: 0.5 },
    barricade: { reload: 0.75, damage: 0.79, range: 0.5 },
    weak: { reload: 2, health: 0.6, damage: 0.6, pen: 0.8, speed: 0.5, maxSpeed: 0.7, range: 0.25, density: 0.3 },
    power: { shudder: 0.6, size: 1.2, pen: 1.25, speed: 2, maxSpeed: 1.7, density: 2, spray: 0.5, resist: 1.5 },
    fake: { size: 0.00001, health: 0.0001, speed: 0, maxSpeed: 0, shudder: 0, spray: 0, recoil: 0, range: 0 },
    op: { reload: 0.5, recoil: 1.3, health: 4, damage: 4, pen: 4, speed: 3, maxSpeed: 2, density: 5, spray: 2 },
    healer: { damage: -1, speed: 0.5, maxSpeed: 0.5, recoil: 0.5 },
    arenaCloser: { reload: 0.8, recoil: 0.25, health: 1000, damage: 1000, pen: 1000, speed: 2.5, maxSpeed: 1.15, range: 1.8, density: 4, spray: 0.25 },
    halfrange: { range: 0.5 },
    lowPower: { shudder: 2, health: 0.5, damage: 0.5, pen: 0.7, spray: 0.5, resist: 0.7 },
    aura: { reload: 0.001, recoil: 0.001, shudder: 0.001, size: 6, speed: 0.001, maxSpeed: 0.001, spray: 0.001 },
    noSpread: { shudder: 0, spray: 0 },
    fast: { speed: 1.2 },
    bacteria: { reload: 2, recoil: 0.25, shudder: 0.1, size: 0.62, speed: 2 },
    productionist: { reload: 56, recoil: 0.25, shudder: 0.05, size: 0.7, damage: 0.75, speed: 4, range: 1.5, spray: 5 },
    worstTank: { reload: 15, damage: 0.01, health: 0.01, pen: 0.01 },
    bigBalls: { reload: 4, damage: 4, health: 2, speed: 0.85, maxSpeed: 0.85, size: 2.5 },
    machineShot: { reload: 0.3, recoil: 0.8, shudder: 0.4, health: 0.7, damage: 0.7, speed: 4.5, maxSpeed: 5.9, spray: 19 },
  };;

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
      armsUpgrades: (def.armsUpgrades || []).slice(),
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
      armsUpgrades: spec.armsUpgrades || [],
      arms: !!spec.arms,
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

  // --- Arras CE playable tree (converted) ---
  def("basic", {
    name: "Basic",
    desc: "",
    guns: [
      gun(18, 8, 1, 0, 0, 0, 0, { shoot: { reload: 10.5, recoil: 1.4, shudder: 0.1, size: 1, health: 1, damage: 0.75, pen: 1, speed: 5, maxSpeed: 1, range: 1, density: 1, spray: 15, resist: 1 } })
    ],
    upgrades: ["twin", "sniper", "machinegun", "flank", "director", "pounder", "trapper", "smasher", "healer"],
    needLevel: 1
  });

  def("director", {
    name: "Director",
    desc: "",
    guns: [
      gun(5, 11, 1.3, 8, 0, 0, 0, { type: "drone", calculator: "drone", shoot: { reload: 36, recoil: 0.25, shudder: 0.1, size: 0.6, health: 1, damage: 1, pen: 1, speed: 1.5, maxSpeed: 1, range: 1, density: 1, spray: 0.1, resist: 1 } })
    ],
    upgrades: ["overseer", "cruiser", "underseer", "spawner", "manager", "bigcheese"],
    needLevel: 15,
    fov: 1.1,
    maxDrones: 6
  });

  def("flank", {
    name: "Flank Guard",
    desc: "",
    guns: [
      gun(18, 8, 1, 0, 0, 0, 0, { shoot: { reload: 10.5, recoil: 1.68, shudder: 0.1, size: 1, health: 1.02, damage: 0.6075, pen: 0.9, speed: 5, maxSpeed: 0.85, range: 1, density: 1.2, spray: 15, resist: 1 } }),
      gun(18, 8, 1, 0, 0, 120, 0, { shoot: { reload: 10.5, recoil: 1.68, shudder: 0.1, size: 1, health: 1.02, damage: 0.6075, pen: 0.9, speed: 5, maxSpeed: 0.85, range: 1, density: 1.2, spray: 15, resist: 1 } }),
      gun(18, 8, 1, 0, 0, 240, 0, { shoot: { reload: 10.5, recoil: 1.68, shudder: 0.1, size: 1, health: 1.02, damage: 0.6075, pen: 0.9, speed: 5, maxSpeed: 0.85, range: 1, density: 1.2, spray: 15, resist: 1 } })
    ],
    upgrades: ["hexatank", "triangle", "auto3", "trapguard", "tritrapper", "tripletwin", "quadruplex"],
    needLevel: 15,
    speed: 1.1
  });

  def("machinegun", {
    name: "Machine Gun",
    desc: "",
    guns: [
      gun(12, 10, 1.4, 8, 0, 0, 0, { shoot: { reload: 5.25, recoil: 1.12, shudder: 0.17, size: 0.92, health: 0.7, damage: 0.525, pen: 1, speed: 5, maxSpeed: 0.8, range: 1, density: 1, spray: 37.5, resist: 1 } })
    ],
    upgrades: ["artillery", "minigun", "gunner", "sprayer"],
    needLevel: 15
  });

  def("pounder", {
    name: "Pounder",
    desc: "",
    guns: [
      gun(20.5, 12, 1, 0, 0, 0, 0, { shoot: { reload: 21, recoil: 2.24, shudder: 0.1, size: 1, health: 1, damage: 1.5, pen: 1, speed: 4.25, maxSpeed: 0.8, range: 1, density: 1.5, spray: 15, resist: 1.15 } })
    ],
    upgrades: ["destroyer", "builder", "artillery", "launcher", "shotgun", "eagle"],
    needLevel: 15
  });

  def("sniper", {
    name: "Sniper",
    desc: "",
    guns: [
      gun(24, 8, 1, 0, 0, 0, 0, { shoot: { reload: 14.175, recoil: 1.4, shudder: 0.025, size: 1, health: 1, damage: 0.6, pen: 1.1, speed: 7.5, maxSpeed: 1.5, range: 1, density: 1.5, spray: 3, resist: 1.15 } })
    ],
    upgrades: ["assassin", "hunter", "minigun", "rifle", "marksman", "bushwhacker"],
    needLevel: 15,
    fov: 1.2
  });

  def("trapper", {
    name: "Trapper",
    desc: "",
    guns: [
      gun(15, 7, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(3, 7, 1.7, 15, 0, 0, 0, { type: "trap", calculator: "trap", shoot: { reload: 23, recoil: 1, shudder: 0.25, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 3.25, maxSpeed: 1, range: 1, density: 1, spray: 0, resist: 3 } })
    ],
    upgrades: ["builder", "tritrapper", "trapguard", "barricade", "overtrapper"],
    needLevel: 15
  });

  def("twin", {
    name: "Twin",
    desc: "",
    guns: [
      gun(20, 8, 1, 0, 5.5, 0, 0, { shoot: { reload: 10.5, recoil: 0.7, shudder: 0.09, size: 1, health: 0.9, damage: 0.525, pen: 1, speed: 5, maxSpeed: 1, range: 1, density: 1, spray: 18, resist: 1 } }),
      gun(20, 8, 1, 0, -5.5, 0, 0.5, { shoot: { reload: 10.5, recoil: 0.7, shudder: 0.09, size: 1, health: 0.9, damage: 0.525, pen: 1, speed: 5, maxSpeed: 1, range: 1, density: 1, spray: 18, resist: 1 } })
    ],
    upgrades: ["doubletwin", "tripleshot", "gunner", "hexatank", "helix", "dual", "bulwark", "musket"],
    needLevel: 15
  });

  def("artillery", {
    name: "Artillery",
    desc: "",
    guns: [
      gun(17, 5, 1, 0, -5, -7, 0.25, { shoot: { reload: 15.75, recoil: 0.245, shudder: 0.15, size: 0.99, health: 1, damage: 0.2625, pen: 1.35, speed: 5.175, maxSpeed: 0.88, range: 1, density: 2.25, spray: 22.5, resist: 1.2 } }),
      gun(17, 5, 1, 0, 5, 7, 0.75, { shoot: { reload: 15.75, recoil: 0.245, shudder: 0.15, size: 0.99, health: 1, damage: 0.2625, pen: 1.35, speed: 5.175, maxSpeed: 0.88, range: 1, density: 2.25, spray: 22.5, resist: 1.2 } }),
      gun(19, 12, 1, 0, 0, 0, 0, { shoot: { reload: 25.2, recoil: 1.568, shudder: 0.1, size: 0.9, health: 1, damage: 1.5, pen: 1, speed: 4.8875, maxSpeed: 0.88, range: 1, density: 2.25, spray: 15, resist: 1.15 } })
    ],
    upgrades: ["mortar", "ordnance", "beekeeper", "fieldgun"],
    needLevel: 30
  });

  def("assassin", {
    name: "Assassin",
    desc: "",
    guns: [
      gun(27, 8, 1, 0, 0, 0, 0, { shoot: { reload: 23.38875, recoil: 1.4, shudder: 0.00625, size: 1, health: 1.15, damage: 0.6, pen: 1.21, speed: 8.85, maxSpeed: 1.77, range: 1, density: 4.5, spray: 3, resist: 1.495 } }),
      gun(13, 8, -2.2, 0, 0, 0, 0, { type: "deco" })
    ],
    upgrades: ["ranger", "falcon", "stalker", "autoassassin", "single", "deadeye"],
    needLevel: 30,
    fov: 1.4,
    speed: 0.85
  });

  def("auto3", {
    name: "Auto-3",
    desc: "",
    guns: [
      gun(22, 10, 1, 0, 0, 0, 0, { type: "auto", shoot: { reload: 9.45, recoil: 1.26, shudder: 0.05, size: 0.8, health: 0.918, damage: 0.3645, pen: 1.08, speed: 5.5, maxSpeed: 0.85, range: 0.8, density: 1.56, spray: 15, resist: 1.25 } }),
      gun(22, 10, 1, 0, 0, 120, 0, { type: "auto", shoot: { reload: 9.45, recoil: 1.26, shudder: 0.05, size: 0.8, health: 0.918, damage: 0.3645, pen: 1.08, speed: 5.5, maxSpeed: 0.85, range: 0.8, density: 1.56, spray: 15, resist: 1.25 } }),
      gun(22, 10, 1, 0, 0, 240, 0, { type: "auto", shoot: { reload: 9.45, recoil: 1.26, shudder: 0.05, size: 0.8, health: 0.918, damage: 0.3645, pen: 1.08, speed: 5.5, maxSpeed: 0.85, range: 0.8, density: 1.56, spray: 15, resist: 1.25 } })
    ],
    upgrades: ["auto5", "mega3", "auto4", "banshee"],
    needLevel: 30,
    auto: true
  });

  def("barricade", {
    name: "Barricade",
    desc: "",
    guns: [
      gun(24, 8, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(4, 8, 1.3, 22, 0, 0, 0, { type: "trap", calculator: "trap", shoot: { reload: 21.5625, recoil: 0.6, shudder: 0.25, size: 0.56, health: 0.55, damage: 0.266625, pen: 1.25, speed: 4.3225, maxSpeed: 1, range: 0.5, density: 1.25, spray: 0, resist: 3.3 } }),
      gun(4, 8, 1.3, 18, 0, 0, 0.3333, { type: "trap", calculator: "trap", shoot: { reload: 21.5625, recoil: 0.6, shudder: 0.25, size: 0.56, health: 0.55, damage: 0.266625, pen: 1.25, speed: 4.3225, maxSpeed: 1, range: 0.5, density: 1.25, spray: 0, resist: 3.3 } }),
      gun(4, 8, 1.3, 14, 0, 0, 0.6667, { type: "trap", calculator: "trap", shoot: { reload: 21.5625, recoil: 0.6, shudder: 0.25, size: 0.56, health: 0.55, damage: 0.266625, pen: 1.25, speed: 4.3225, maxSpeed: 1, range: 0.5, density: 1.25, spray: 0, resist: 3.3 } })
    ],
    upgrades: [],
    needLevel: 30,
    fov: 1.15
  });

  def("bigcheese", {
    name: "Big Cheese",
    desc: "",
    guns: [
      gun(14, 17, 1.3, 2, 0, 0, 0, { type: "drone", calculator: "drone", shoot: { reload: 54, recoil: 0.25, shudder: 0.1, size: 1.08, health: 2.5, damage: 1, pen: 1, speed: 1.875, maxSpeed: 1, range: 1, density: 1, spray: 0.1, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 30,
    fov: 1.1,
    maxDrones: 1
  });

  def("builder", {
    name: "Builder",
    desc: "",
    guns: [
      gun(18, 12, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(2, 12, 1.1, 18, 0, 0, 0, { type: "trap", calculator: "trap", shoot: { reload: 25.3, recoil: 2, shudder: 0.025, size: 1.05, health: 2, damage: 0.75, pen: 1.25, speed: 7.15, maxSpeed: 2.15, range: 1.25, density: 1, spray: 0, resist: 3.75 } })
    ],
    upgrades: ["construct", "autobuilder", "engineer", "boomer", "assembler", "architect", "conqueror"],
    needLevel: 30,
    fov: 1.15,
    speed: 0.8
  });

  def("bulwark", {
    name: "Bulwark",
    desc: "",
    guns: [
      gun(20, 8, 1, 0, 5.5, 0, 0, { shoot: { reload: 10.5, recoil: 1.008, shudder: 0.09, size: 1, health: 0.93636, damage: 0.344452, pen: 0.81, speed: 5, maxSpeed: 0.7225, range: 1, density: 1.44, spray: 18, resist: 1 } }),
      gun(20, 8, 1, 0, -5.5, 0, 0.5, { shoot: { reload: 10.5, recoil: 1.008, shudder: 0.09, size: 1, health: 0.93636, damage: 0.344452, pen: 0.81, speed: 5, maxSpeed: 0.7225, range: 1, density: 1.44, spray: 18, resist: 1 } }),
      gun(15, 8, 1, 0, 5.5, 185, 0, { type: "deco" }),
      gun(15, 8, 1, 0, -5.5, -185, 0.5, { type: "deco" }),
      gun(3.25, 8, 1.7, 14, 5.5, 185, 0, { type: "trap", calculator: "trap", shoot: { reload: 23, recoil: 0.5, shudder: 0.225, size: 0.7, health: 0.9, damage: 0.525, pen: 1, speed: 3.25, maxSpeed: 1, range: 1, density: 1, spray: 0, resist: 3 } }),
      gun(3.25, 8, 1.7, 14, -5.5, -185, 0.5, { type: "trap", calculator: "trap", shoot: { reload: 23, recoil: 0.5, shudder: 0.225, size: 0.7, health: 0.9, damage: 0.525, pen: 1, speed: 3.25, maxSpeed: 1, range: 1, density: 1, spray: 0, resist: 3 } })
    ],
    upgrades: [],
    needLevel: 30
  });

  def("bushwhacker", {
    name: "Bushwhacker",
    desc: "",
    guns: [
      gun(24, 8, 1, 0, 0, 0, 0, { shoot: { reload: 14.175, recoil: 2.016, shudder: 0.025, size: 1, health: 1.0404, damage: 0.39366, pen: 0.891, speed: 7.5, maxSpeed: 1.08375, range: 1, density: 2.16, spray: 3, resist: 1.15 } }),
      gun(13, 8, 1, 0, 0, 180, 0, { type: "deco" }),
      gun(4, 8, 1.7, 13, 0, 180, 0, { type: "trap", calculator: "trap", shoot: { reload: 23, recoil: 1, shudder: 0.25, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 3.25, maxSpeed: 1, range: 1, density: 1, spray: 0, resist: 3 } })
    ],
    upgrades: [],
    needLevel: 30,
    fov: 1.2
  });

  def("cruiser", {
    name: "Cruiser",
    desc: "",
    guns: [
      gun(9, 8.2, 0.6, 5, 4, 0, 0, { type: "swarm", calculator: "swarm", shoot: { reload: 23, recoil: 0.25, shudder: 0.05, size: 0.4, health: 1, damage: 0.75, pen: 1, speed: 4, maxSpeed: 1, range: 1, density: 1, spray: 5, resist: 1 } }),
      gun(9, 8.2, 0.6, 5, -4, 0, 0.5, { type: "swarm", calculator: "swarm", shoot: { reload: 23, recoil: 0.25, shudder: 0.05, size: 0.4, health: 1, damage: 0.75, pen: 1, speed: 4, maxSpeed: 1, range: 1, density: 1, spray: 5, resist: 1 } })
    ],
    upgrades: ["carrier", "battleship", "fortress", "autocruiser", "commander"],
    needLevel: 30,
    fov: 1.2
  });

  def("destroyer", {
    name: "Destroyer",
    desc: "",
    guns: [
      gun(20.5, 14, 1, 0, 0, 0, 0, { shoot: { reload: 42, recoil: 4.032, shudder: 0.05, size: 1, health: 2, damage: 1.35, pen: 1.2, speed: 2.125, maxSpeed: 0.48, range: 1, density: 3, spray: 15, resist: 3.45 } })
    ],
    upgrades: ["conqueror", "annihilator", "hybrid", "construct"],
    needLevel: 30
  });

  def("doubletwin", {
    name: "Double Twin",
    desc: "",
    guns: [
      gun(20, 8, 1, 0, 5.5, 0, 0, { shoot: { reload: 10.5, recoil: 0.7, shudder: 0.09, size: 1, health: 0.9, damage: 0.5775, pen: 1, speed: 5, maxSpeed: 1, range: 1, density: 1, spray: 18, resist: 1 } }),
      gun(20, 8, 1, 0, 5.5, 180, 0, { shoot: { reload: 10.5, recoil: 0.7, shudder: 0.09, size: 1, health: 0.9, damage: 0.5775, pen: 1, speed: 5, maxSpeed: 1, range: 1, density: 1, spray: 18, resist: 1 } }),
      gun(20, 8, 1, 0, -5.5, 0, 0.5, { shoot: { reload: 10.5, recoil: 0.7, shudder: 0.09, size: 1, health: 0.9, damage: 0.5775, pen: 1, speed: 5, maxSpeed: 1, range: 1, density: 1, spray: 18, resist: 1 } }),
      gun(20, 8, 1, 0, -5.5, 180, 0.5, { shoot: { reload: 10.5, recoil: 0.7, shudder: 0.09, size: 1, health: 0.9, damage: 0.5775, pen: 1, speed: 5, maxSpeed: 1, range: 1, density: 1, spray: 18, resist: 1 } })
    ],
    upgrades: ["tripletwin", "hewn", "autodouble", "bentdouble"],
    needLevel: 30
  });

  def("dual", {
    name: "Dual",
    desc: "",
    guns: [
      gun(18, 7, 1, 0, 5.5, 0, 0, { shoot: { reload: 21, recoil: 0.7, shudder: 0.144, size: 1, health: 0.675, damage: 0.2625, pen: 0.7, speed: 6.5, maxSpeed: 1.1, range: 1, density: 1, spray: 9, resist: 0.875 } }),
      gun(18, 7, 1, 0, -5.5, 0, 0.5, { shoot: { reload: 21, recoil: 0.7, shudder: 0.144, size: 1, health: 0.675, damage: 0.2625, pen: 0.7, speed: 6.5, maxSpeed: 1.1, range: 1, density: 1, spray: 9, resist: 0.875 } }),
      gun(16, 8.5, 1, 0, 5.5, 0, 0.25, { shoot: { reload: 21, recoil: 0.7, shudder: 0.072, size: 1, health: 1.35, damage: 0.525, pen: 1, speed: 6.5, maxSpeed: 1.1, range: 1, density: 1, spray: 18, resist: 1.25 } }),
      gun(16, 8.5, 1, 0, -5.5, 0, 0.75, { shoot: { reload: 21, recoil: 0.7, shudder: 0.072, size: 1, health: 1.35, damage: 0.525, pen: 1, speed: 6.5, maxSpeed: 1.1, range: 1, density: 1, spray: 18, resist: 1.25 } })
    ],
    upgrades: [],
    needLevel: 30,
    fov: 1.1
  });

  def("eagle", {
    name: "Eagle",
    desc: "",
    guns: [
      gun(20.5, 12, 1, 0, 0, 0, 0, { shoot: { reload: 21, recoil: 0.48384, shudder: 0.1, size: 1, health: 0.918, damage: 1.215, pen: 0.9, speed: 4.42, maxSpeed: 0.5984, range: 0.9, density: 1.8, spray: 15, resist: 1.15 } }),
      gun(16, 8, 1, 0, 0, 153, 0.1, { shoot: { reload: 10.5, recoil: 1.134, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } }),
      gun(16, 8, 1, 0, 0, -153, 0.1, { shoot: { reload: 10.5, recoil: 1.134, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } }),
      gun(18, 8, 1, 0, 0, 180, 0.6, { shoot: { reload: 10.5, recoil: 1.134, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } })
    ],
    upgrades: [],
    needLevel: 30
  });

  def("gunner", {
    name: "Gunner",
    desc: "",
    guns: [
      gun(12, 3.5, 1, 0, 7.25, 0, 0.5, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.215, damage: 0.13125, pen: 1.25, speed: 4.8, maxSpeed: 0.65, range: 1, density: 1.5, spray: 27, resist: 1.2 } }),
      gun(12, 3.5, 1, 0, -7.25, 0, 0.75, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.215, damage: 0.13125, pen: 1.25, speed: 4.8, maxSpeed: 0.65, range: 1, density: 1.5, spray: 27, resist: 1.2 } }),
      gun(16, 3.5, 1, 0, 3.75, 0, 0, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.215, damage: 0.13125, pen: 1.25, speed: 4.8, maxSpeed: 0.65, range: 1, density: 1.5, spray: 27, resist: 1.2 } }),
      gun(16, 3.5, 1, 0, -3.75, 0, 0.25, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.215, damage: 0.13125, pen: 1.25, speed: 4.8, maxSpeed: 0.65, range: 1, density: 1.5, spray: 27, resist: 1.2 } })
    ],
    upgrades: ["autogunner", "nailgun", "auto4", "machinegunner", "gunnertrapper", "cyclone", "overgunner"],
    needLevel: 30
  });

  def("healer", {
    name: "Healer",
    desc: "",
    guns: [
      gun(11, 9, -0.4, 9.5, 0, 0, 0, { type: "deco" }),
      gun(18, 10, 1, 0, 0, 0, 0, { type: "heal", shoot: { reload: 10.5, recoil: 0.7, shudder: 0.1, size: 1, health: 1, damage: -0.75, pen: 1, speed: 2.5, maxSpeed: 0.5, range: 1, density: 1, spray: 15, resist: 1 } })
    ],
    upgrades: ["medic", "ambulance", "surgeon", "paramedic"],
    needLevel: 15,
    healer: true
  });

  def("helix", {
    name: "Helix",
    desc: "",
    guns: [
      gun(20, 6, -1.5, 0, -5, 0, 0, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0, size: 1, health: 0.9, damage: 0.39375, pen: 1, speed: 2.5, maxSpeed: 1, range: 1.2, density: 1, spray: 0, resist: 1 } }),
      gun(20, 6, -1.5, 0, 5, 0, 0, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0, size: 1, health: 0.9, damage: 0.39375, pen: 1, speed: 2.5, maxSpeed: 1, range: 1.2, density: 1, spray: 0, resist: 1 } }),
      gun(16.5, 2, -9.25, 0, 0, 0, 0, { type: "deco" }),
      gun(4, 5, -4, -9.5, -7, 90, 0, { type: "deco" }),
      gun(4, 5, -4, -9.5, 7, -90, 0, { type: "deco" })
    ],
    upgrades: ["triplex", "quadruplex"],
    needLevel: 30
  });

  def("hexatank", {
    name: "Hexa Tank",
    desc: "",
    guns: [
      gun(18, 8, 1, 0, 0, 0, 0, { shoot: { reload: 10.5, recoil: 2.016, shudder: 0.1, size: 1, health: 1.0404, damage: 0.492075, pen: 0.81, speed: 5, maxSpeed: 0.7225, range: 1, density: 1.44, spray: 15, resist: 1 } }),
      gun(18, 8, 1, 0, 0, 60, 0.5, { shoot: { reload: 10.5, recoil: 2.016, shudder: 0.1, size: 1, health: 1.0404, damage: 0.492075, pen: 0.81, speed: 5, maxSpeed: 0.7225, range: 1, density: 1.44, spray: 15, resist: 1 } }),
      gun(18, 8, 1, 0, 0, 120, 0, { shoot: { reload: 10.5, recoil: 2.016, shudder: 0.1, size: 1, health: 1.0404, damage: 0.492075, pen: 0.81, speed: 5, maxSpeed: 0.7225, range: 1, density: 1.44, spray: 15, resist: 1 } }),
      gun(18, 8, 1, 0, 0, 180, 0.5, { shoot: { reload: 10.5, recoil: 2.016, shudder: 0.1, size: 1, health: 1.0404, damage: 0.492075, pen: 0.81, speed: 5, maxSpeed: 0.7225, range: 1, density: 1.44, spray: 15, resist: 1 } }),
      gun(18, 8, 1, 0, 0, 240, 0, { shoot: { reload: 10.5, recoil: 2.016, shudder: 0.1, size: 1, health: 1.0404, damage: 0.492075, pen: 0.81, speed: 5, maxSpeed: 0.7225, range: 1, density: 1.44, spray: 15, resist: 1 } }),
      gun(18, 8, 1, 0, 0, 300, 0.5, { shoot: { reload: 10.5, recoil: 2.016, shudder: 0.1, size: 1, health: 1.0404, damage: 0.492075, pen: 0.81, speed: 5, maxSpeed: 0.7225, range: 1, density: 1.44, spray: 15, resist: 1 } })
    ],
    upgrades: ["octo", "cyclone", "hexatrap"],
    needLevel: 30
  });

  def("hunter", {
    name: "Hunter",
    desc: "",
    guns: [
      gun(24, 8, 1, 0, 0, 0, 0, { shoot: { reload: 21.2625, recoil: 0.98, shudder: 0.025, size: 0.855, health: 2, damage: 0.27, pen: 1.65, speed: 8.25, maxSpeed: 1.2, range: 1, density: 2.16, spray: 3, resist: 1.45475 } }),
      gun(21, 11, 1, 0, 0, 0, 0.25, { shoot: { reload: 21.2625, recoil: 0.98, shudder: 0.025, size: 0.95, health: 1, damage: 0.54, pen: 1.1, speed: 8.25, maxSpeed: 1.2, range: 1, density: 1.8, spray: 3, resist: 1.3225 } })
    ],
    upgrades: ["predator", "xhunter", "poacher", "ordnance", "dual", "nimrod"],
    needLevel: 30,
    fov: 1.25,
    speed: 0.9
  });

  def("launcher", {
    name: "Launcher",
    desc: "",
    guns: [
      gun(19.2, 13, 0.7, 0, 0, 0, 0, { type: "deco" }),
      gun(17, 13, 1, 0, 0, 0, 0, { type: "missile", shoot: { reload: 31.5, recoil: 3.36, shudder: 0.01, size: 0.72, health: 1.05, damage: 1.3875, pen: 1, speed: 3.825, maxSpeed: 0.96, range: 1.1, density: 1.5, spray: 15, resist: 1.725 } })
    ],
    upgrades: ["skimmer", "twister", "swarmer", "sidewinder", "fieldgun"],
    needLevel: 30,
    fov: 1.1
  });

  def("manager", {
    name: "Manager",
    desc: "",
    guns: [
      gun(6, 12, 1.2, 8, 0, 0, 0, { type: "drone", calculator: "drone", shoot: { reload: 22.5, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 30,
    fov: 1.1,
    speed: 0.85,
    maxDrones: 8
  });

  def("marksman", {
    name: "Marksman",
    desc: "",
    guns: [
      gun(13, 5, 2.2, 10, 0, 0, 0, { type: "deco" }),
      gun(13, 5, 2.2, 5, 0, 0, 0, { type: "deco" }),
      gun(13, 5, 2.2, 0, 0, 0, 0, { type: "deco" }),
      gun(24, 8, 1, 0, 0, 0, 0, { shoot: { reload: 24.80625, recoil: 1.4, shudder: 0.025, size: 1, health: 8.333333, damage: 0.072, pen: 2.2, speed: 7.5, maxSpeed: 1.5, range: 1, density: 1.5, spray: 3, resist: 1.15 } })
    ],
    upgrades: ["deadeye", "nimrod", "revolver", "fork"],
    needLevel: 30,
    fov: 1.2
  });

  def("minigun", {
    name: "Minigun",
    desc: "",
    guns: [
      gun(21, 8, 1, 0, 0, 0, 0, { shoot: { reload: 13.125, recoil: 0.84, shudder: 0.1, size: 0.8, health: 0.55, damage: 0.3375, pen: 1.25, speed: 6.65, maxSpeed: 1, range: 1, density: 1.25, spray: 7.5, resist: 1.1 } }),
      gun(19, 8, 1, 0, 0, 0, 0.3333, { shoot: { reload: 13.125, recoil: 0.84, shudder: 0.1, size: 0.8, health: 0.55, damage: 0.3375, pen: 1.25, speed: 6.65, maxSpeed: 1, range: 1, density: 1.25, spray: 7.5, resist: 1.1 } }),
      gun(17, 8, 1, 0, 0, 0, 0.6667, { shoot: { reload: 13.125, recoil: 0.84, shudder: 0.1, size: 0.8, health: 0.55, damage: 0.3375, pen: 1.25, speed: 6.65, maxSpeed: 1, range: 1, density: 1.25, spray: 7.5, resist: 1.1 } })
    ],
    upgrades: ["streamliner", "nailgun", "cropduster", "barricade", "vulture"],
    needLevel: 30,
    fov: 1.2
  });

  def("musket", {
    name: "Musket",
    desc: "",
    guns: [
      gun(15.5, 7, 1, 0, 6.15, 0, 0, { type: "deco" }),
      gun(15.5, 7, 1, 0, -6.15, 0, 0.5, { type: "deco" }),
      gun(18, 7, 1, 0, 4.15, 0, 0, { shoot: { reload: 11.34, recoil: 0.56, shudder: 0.03375, size: 1, health: 0.72, damage: 0.336, pen: 0.99, speed: 7.5, maxSpeed: 1.5, range: 1, density: 1.5, spray: 7.2, resist: 1.15 } }),
      gun(18, 7, 1, 0, -4.15, 0, 0.5, { shoot: { reload: 11.34, recoil: 0.56, shudder: 0.03375, size: 1, health: 0.72, damage: 0.336, pen: 0.99, speed: 7.5, maxSpeed: 1.5, range: 1, density: 1.5, spray: 7.2, resist: 1.15 } })
    ],
    upgrades: [],
    needLevel: 30,
    fov: 1.225
  });

  def("overseer", {
    name: "Overseer",
    desc: "",
    guns: [
      gun(6, 12, 1.2, 8, 0, 90, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } }),
      gun(6, 12, 1.2, 8, 0, -90, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } })
    ],
    upgrades: ["overlord", "overtrapper", "overgunner", "banshee", "autooverseer", "overdrive", "commander"],
    needLevel: 30,
    fov: 1.1,
    speed: 0.9,
    maxDrones: 8
  });

  def("overtrapper", {
    name: "Overtrapper",
    desc: "",
    guns: [
      gun(14, 8, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(4, 8, 1.5, 14, 0, 0, 0, { type: "trap", calculator: "trap", shoot: { reload: 23, recoil: 1, shudder: 0.25, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 3.25, maxSpeed: 1, range: 1, density: 1, spray: 0, resist: 3 } }),
      gun(6, 11, 1.2, 8, 0, 125, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } }),
      gun(6, 11, 1.2, 8, 0, -125, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 30,
    fov: 1.2,
    speed: 0.8,
    maxDrones: 6
  });

  def("quadruplex", {
    name: "Quadruplex",
    desc: "",
    guns: [
      gun(20, 8, -1.5, 0, 0, 45, 0, { shoot: { reload: 23.1, recoil: 0.7, shudder: 0, size: 1, health: 0.9, damage: 0.39375, pen: 1, speed: 2.5, maxSpeed: 1, range: 1.2, density: 1, spray: 0, resist: 1 } }),
      gun(20, 8, -1.5, 0, 0, -135, 0, { shoot: { reload: 23.1, recoil: 0.7, shudder: 0, size: 1, health: 0.9, damage: 0.39375, pen: 1, speed: 2.5, maxSpeed: 1, range: 1.2, density: 1, spray: 0, resist: 1 } }),
      gun(20, 8, -1.5, 0, 0, -45, 0, { shoot: { reload: 23.1, recoil: 0.7, shudder: 0, size: 1, health: 0.9, damage: 0.39375, pen: 1, speed: 2.5, maxSpeed: 1, range: 1.2, density: 1, spray: 0, resist: 1 } }),
      gun(20, 8, -1.5, 0, 0, 135, 0, { shoot: { reload: 23.1, recoil: 0.7, shudder: 0, size: 1, health: 0.9, damage: 0.39375, pen: 1, speed: 2.5, maxSpeed: 1, range: 1.2, density: 1, spray: 0, resist: 1 } }),
      gun(5, 5, -4, -5.25, -7, 45, 0, { type: "deco" }),
      gun(5, 5, -4, -5.25, -7, 135, 0, { type: "deco" }),
      gun(5, 5, -4, -5.25, -7, 225, 0, { type: "deco" }),
      gun(5, 5, -4, -5.25, -7, 315, 0, { type: "deco" }),
      gun(5, 5, -4, -5.25, 7, -45, 0.5, { type: "deco" }),
      gun(5, 5, -4, -5.25, 7, 45, 0.5, { type: "deco" }),
      gun(5, 5, -4, -5.25, 7, 135, 0.5, { type: "deco" }),
      gun(5, 5, -4, -5.25, 7, 225, 0.5, { type: "deco" })
    ],
    upgrades: [],
    needLevel: 30
  });

  def("rifle", {
    name: "Rifle",
    desc: "",
    guns: [
      gun(20, 12, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(24, 7, 1, 0, 0, 0, 0, { shoot: { reload: 11.34, recoil: 1.12, shudder: 0.0375, size: 1, health: 0.8, damage: 0.48, pen: 0.99, speed: 7.5, maxSpeed: 1.5, range: 1, density: 1.5, spray: 6, resist: 1.15 } })
    ],
    upgrades: ["musket", "crossbow", "armsman", "revolver"],
    needLevel: 30,
    fov: 1.225
  });

  def("shotgun", {
    name: "Shotgun",
    desc: "",
    guns: [
      gun(4, 3, 1, 11, 3, 0, 0, { shoot: { reload: 42, recoil: 0.448, shudder: 0.17, size: 1.5, health: 0.7, damage: 0.21, pen: 0.8, speed: 9, maxSpeed: 0.48, range: 1, density: 1.2, spray: 45, resist: 1 } }),
      gun(4, 3, 1, 11, -3, 0, 0, { shoot: { reload: 42, recoil: 0.448, shudder: 0.17, size: 1.5, health: 0.7, damage: 0.21, pen: 0.8, speed: 9, maxSpeed: 0.48, range: 1, density: 1.2, spray: 45, resist: 1 } }),
      gun(1, 4, 1, 12, 1, 0, 0, { shoot: { reload: 42, recoil: 0.448, shudder: 0.17, size: 1.5, health: 0.7, damage: 0.21, pen: 0.8, speed: 9, maxSpeed: 0.48, range: 1, density: 1.2, spray: 45, resist: 1 } }),
      gun(1, 4, 1, 12, -1, 0, 0, { shoot: { reload: 42, recoil: 0.448, shudder: 0.17, size: 1.5, health: 0.7, damage: 0.21, pen: 0.8, speed: 9, maxSpeed: 0.48, range: 1, density: 1.2, spray: 45, resist: 1 } }),
      gun(1, 3, 1, 13, 1, 0, 0, { shoot: { reload: 42, recoil: 0.448, shudder: 0.17, size: 1.5, health: 0.7, damage: 0.21, pen: 0.8, speed: 9, maxSpeed: 0.48, range: 1, density: 1.2, spray: 45, resist: 1 } }),
      gun(1, 3, 1, 13, -1, 0, 0, { shoot: { reload: 42, recoil: 0.448, shudder: 0.17, size: 1.5, health: 0.7, damage: 0.21, pen: 0.8, speed: 9, maxSpeed: 0.48, range: 1, density: 1.2, spray: 45, resist: 1 } }),
      gun(1, 2, 1, 13, 2, 0, 0, { shoot: { reload: 42, recoil: 0.448, shudder: 0.17, size: 1.5, health: 0.7, damage: 0.21, pen: 0.8, speed: 9, maxSpeed: 0.48, range: 1, density: 1.2, spray: 45, resist: 1 } }),
      gun(1, 2, 1, 13, -2, 0, 0, { shoot: { reload: 42, recoil: 0.448, shudder: 0.17, size: 1.5, health: 0.7, damage: 0.21, pen: 0.8, speed: 9, maxSpeed: 0.48, range: 1, density: 1.2, spray: 45, resist: 1 } }),
      gun(4, 4, 1, 13, 0, 0, 0, { shoot: { reload: 42, recoil: 0.448, shudder: 0.17, size: 1.5, health: 0.7, damage: 0.21, pen: 0.8, speed: 9, maxSpeed: 0.48, range: 1, density: 1.2, spray: 45, resist: 1 } }),
      gun(15, 14, 1, 6, 0, 0, 0, { shoot: { reload: 42, recoil: 0, shudder: 0, size: 0.000015, health: 0.00007, damage: 0.21, pen: 0.8, speed: 0, maxSpeed: 0, range: 0, density: 1.2, spray: 0, resist: 1 } }),
      gun(8, 14, -1.3, 4, 0, 0, 0, { type: "deco" })
    ],
    upgrades: [],
    needLevel: 30
  });

  def("smasher", {
    name: "Smasher",
    desc: "",
    guns: [],
    upgrades: ["megasmash", "spike", "autosmasher", "landmine"],
    needLevel: 30,
    speed: 1.15,
    health: 1.35,
    bodyDamage: 2.2,
    smasher: true
  });

  def("spawner", {
    name: "Spawner",
    desc: "",
    guns: [
      gun(4.5, 10, 1, 10.5, 0, 0, 0, { type: "deco" }),
      gun(1, 12, 1, 15, 0, 0, 0, { type: "minion", calculator: "drone", shoot: { reload: 72, recoil: 1, shudder: 0.1, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 3, maxSpeed: 1.25, range: 1, density: 1, spray: 0.1, resist: 1 } }),
      gun(11.5, 12, 1, 0, 0, 0, 0, { type: "deco" })
    ],
    upgrades: ["factory", "autospawner"],
    needLevel: 30,
    fov: 1.1,
    speed: 0.8,
    maxDrones: 4
  });

  def("sprayer", {
    name: "Sprayer",
    desc: "",
    guns: [
      gun(23, 7, 1, 0, 0, 0, 0, { shoot: { reload: 6.5625, recoil: 0.322, shudder: 0.51, size: 1.1, health: 0.35, damage: 0.091875, pen: 0.945, speed: 4.5, maxSpeed: 0.64, range: 1, density: 1.5, spray: 28.125, resist: 0.84 } }),
      gun(12, 10, 1.4, 8, 0, 0, 0, { shoot: { reload: 5.25, recoil: 1.12, shudder: 0.17, size: 1, health: 0.7, damage: 0.525, pen: 1, speed: 5, maxSpeed: 0.8, range: 1, density: 1, spray: 37.5, resist: 1 } })
    ],
    upgrades: ["redistributor", "phoenix", "atomizer", "focal"],
    needLevel: 30
  });

  def("trapguard", {
    name: "Trap Guard",
    desc: "",
    guns: [
      gun(20, 8, 1, 0, 0, 0, 0, { shoot: { reload: 10.5, recoil: 2.016, shudder: 0.1, size: 1, health: 1.0404, damage: 0.492075, pen: 0.81, speed: 5, maxSpeed: 0.7225, range: 1, density: 1.44, spray: 15, resist: 1 } }),
      gun(13, 8, 1, 0, 0, 180, 0, { type: "deco" }),
      gun(4, 8, 1.7, 13, 0, 180, 0, { type: "trap", calculator: "trap", shoot: { reload: 23, recoil: 1, shudder: 0.25, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 3.25, maxSpeed: 1, range: 1, density: 1, spray: 0, resist: 3 } })
    ],
    upgrades: ["bushwhacker", "gunnertrapper", "bomber", "conqueror", "bulwark"],
    needLevel: 30
  });

  def("triangle", {
    name: "Tri-Angle",
    desc: "",
    guns: [
      gun(18, 8, 1, 0, 0, 0, 0, { shoot: { reload: 10.5, recoil: 1.2096, shudder: 0.1, size: 1, health: 0.918, damage: 0.6075, pen: 0.9, speed: 5.2, maxSpeed: 0.748, range: 0.9, density: 1.2, spray: 15, resist: 1 } }),
      gun(16, 8, 1, 0, 0, 150, 0.1, { shoot: { reload: 10.5, recoil: 2.268, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } }),
      gun(16, 8, 1, 0, 0, -150, 0.1, { shoot: { reload: 10.5, recoil: 2.268, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } })
    ],
    upgrades: ["fighter", "booster", "falcon", "bomber", "autotriangle", "surfer", "eagle", "phoenix", "vulture"],
    needLevel: 30,
    health: 0.8
  });

  def("tritrapper", {
    name: "Tri-Trapper",
    desc: "",
    guns: [
      gun(15, 7, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(15, 7, 1, 0, 0, 120, 0, { type: "deco" }),
      gun(15, 7, 1, 0, 0, 240, 0, { type: "deco" }),
      gun(3, 7, 1.7, 15, 0, 0, 0, { type: "trap", calculator: "trap", shoot: { reload: 23, recoil: 1.2, shudder: 0.25, size: 0.7, health: 1.02, damage: 0.6075, pen: 0.9, speed: 3.25, maxSpeed: 0.85, range: 1, density: 1.2, spray: 0, resist: 3 } }),
      gun(3, 7, 1.7, 15, 0, 120, 0, { type: "trap", calculator: "trap", shoot: { reload: 23, recoil: 1.2, shudder: 0.25, size: 0.7, health: 1.02, damage: 0.6075, pen: 0.9, speed: 3.25, maxSpeed: 0.85, range: 1, density: 1.2, spray: 0, resist: 3 } }),
      gun(3, 7, 1.7, 15, 0, 240, 0, { type: "trap", calculator: "trap", shoot: { reload: 23, recoil: 1.2, shudder: 0.25, size: 0.7, health: 1.02, damage: 0.6075, pen: 0.9, speed: 3.25, maxSpeed: 0.85, range: 1, density: 1.2, spray: 0, resist: 3 } })
    ],
    upgrades: ["fortress", "hexatrap", "septatrapper", "architect"],
    needLevel: 30
  });

  def("tripleshot", {
    name: "Triple Shot",
    desc: "",
    guns: [
      gun(19, 8, 1, 0, 2, 18, 0.5, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.072, size: 1, health: 0.81, damage: 0.525, pen: 0.8, speed: 5, maxSpeed: 1, range: 1, density: 0.8, spray: 9, resist: 1 } }),
      gun(19, 8, 1, 0, -2, -18, 0.5, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.072, size: 1, health: 0.81, damage: 0.525, pen: 0.8, speed: 5, maxSpeed: 1, range: 1, density: 0.8, spray: 9, resist: 1 } }),
      gun(22, 8, 1, 0, 0, 0, 0, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.072, size: 1, health: 0.81, damage: 0.525, pen: 0.8, speed: 5, maxSpeed: 1, range: 1, density: 0.8, spray: 9, resist: 1 } })
    ],
    upgrades: ["penta", "spread", "benthybrid", "bentdouble", "triplet", "triplex"],
    needLevel: 30,
    speed: 0.9
  });

  def("tripletwin", {
    name: "Triple Twin",
    desc: "",
    guns: [
      gun(20, 8, 1, 0, 5.5, 0, 0, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.09, size: 1.05, health: 0.99, damage: 0.63525, pen: 1, speed: 4.5, maxSpeed: 0.7, range: 1, density: 1, spray: 18, resist: 1.05 } }),
      gun(20, 8, 1, 0, 5.5, 120, 0, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.09, size: 1.05, health: 0.99, damage: 0.63525, pen: 1, speed: 4.5, maxSpeed: 0.7, range: 1, density: 1, spray: 18, resist: 1.05 } }),
      gun(20, 8, 1, 0, 5.5, 240, 0, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.09, size: 1.05, health: 0.99, damage: 0.63525, pen: 1, speed: 4.5, maxSpeed: 0.7, range: 1, density: 1, spray: 18, resist: 1.05 } }),
      gun(20, 8, 1, 0, -5.5, 0, 0.5, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.09, size: 1.05, health: 0.99, damage: 0.63525, pen: 1, speed: 4.5, maxSpeed: 0.7, range: 1, density: 1, spray: 18, resist: 1.05 } }),
      gun(20, 8, 1, 0, -5.5, 120, 0.5, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.09, size: 1.05, health: 0.99, damage: 0.63525, pen: 1, speed: 4.5, maxSpeed: 0.7, range: 1, density: 1, spray: 18, resist: 1.05 } }),
      gun(20, 8, 1, 0, -5.5, 240, 0.5, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.09, size: 1.05, health: 0.99, damage: 0.63525, pen: 1, speed: 4.5, maxSpeed: 0.7, range: 1, density: 1, spray: 18, resist: 1.05 } })
    ],
    upgrades: [],
    needLevel: 30
  });

  def("underseer", {
    name: "Underseer",
    desc: "",
    body: 4,
    guns: [
      gun(6, 12, 1.2, 7.4, 0, 90, 0, { type: "drone", calculator: "drone", shoot: { reload: 115.2, recoil: 0.25, shudder: 0.1, size: 0.84, health: 0.5, damage: 0.4, pen: 0.6, speed: 1.5, maxSpeed: 1, range: 1, density: 0.8, spray: 0.1, resist: 1 } }),
      gun(6, 12, 1.2, 7.4, 0, 270, 0, { type: "drone", calculator: "drone", shoot: { reload: 115.2, recoil: 0.25, shudder: 0.1, size: 0.84, health: 0.5, damage: 0.4, pen: 0.6, speed: 1.5, maxSpeed: 1, range: 1, density: 0.8, spray: 0.1, resist: 1 } })
    ],
    upgrades: ["necromancer", "maleficitor", "infestor"],
    needLevel: 30,
    fov: 1.1,
    speed: 0.9,
    maxDrones: 15
  });

  def("ambulance", {
    name: "Ambulance",
    desc: "",
    guns: [
      gun(11, 9, -0.4, 9.5, 0, 0, 0, { type: "deco" }),
      gun(18, 10, 1, 0, 0, 0, 0, { type: "heal", shoot: { reload: 10.5, recoil: 0.6048, shudder: 0.1, size: 1, health: 0.918, damage: -0.6075, pen: 0.9, speed: 2.6, maxSpeed: 0.374, range: 0.9, density: 1.2, spray: 15, resist: 1 } }),
      gun(16, 8, 1, 0, 0, 150, 0.1, { shoot: { reload: 10.5, recoil: 2.268, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } }),
      gun(16, 8, 1, 0, 0, -150, 0.1, { shoot: { reload: 10.5, recoil: 2.268, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } })
    ],
    upgrades: [],
    needLevel: 45,
    health: 0.8,
    healer: true
  });

  def("annihilator", {
    name: "Annihilator",
    desc: "",
    guns: [
      gun(20.5, 19.5, 1, 0, 0, 0, 0, { shoot: { reload: 42, recoil: 5.4432, shudder: 0.05, size: 1, health: 2, damage: 1.161, pen: 1.2, speed: 2.125, maxSpeed: 0.48, range: 1, density: 3, spray: 15, resist: 3.45 } })
    ],
    upgrades: [],
    needLevel: 45
  });

  def("architect", {
    name: "Architect",
    desc: "",
    guns: [
      gun(20, 16, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(2, 16, 1.1, 20, 0, 0, 0, { type: "trap", calculator: "trap", shoot: { reload: 22.77, recoil: 1.8, shudder: 0.0125, size: 0.84, health: 1.836, damage: 0.3645, pen: 1.35, speed: 7.865, maxSpeed: 1.8275, range: 1, density: 1.56, spray: 0, resist: 4.6875 } }),
      gun(20, 16, 1, 0, 0, 120, 0, { type: "deco" }),
      gun(2, 16, 1.1, 20, 0, 120, 0, { type: "trap", calculator: "trap", shoot: { reload: 22.77, recoil: 1.8, shudder: 0.0125, size: 0.84, health: 1.836, damage: 0.3645, pen: 1.35, speed: 7.865, maxSpeed: 1.8275, range: 1, density: 1.56, spray: 0, resist: 4.6875 } }),
      gun(20, 16, 1, 0, 0, 240, 0, { type: "deco" }),
      gun(2, 16, 1.1, 20, 0, 240, 0, { type: "trap", calculator: "trap", shoot: { reload: 22.77, recoil: 1.8, shudder: 0.0125, size: 0.84, health: 1.836, damage: 0.3645, pen: 1.35, speed: 7.865, maxSpeed: 1.8275, range: 1, density: 1.56, spray: 0, resist: 4.6875 } })
    ],
    upgrades: [],
    needLevel: 45,
    speed: 1.1,
    auto: true
  });

  def("armsman", {
    name: "Armsman",
    desc: "",
    guns: [
      gun(20, 12, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(24, 7, 1, 0, 0, 0, 0, { shoot: { reload: 11.34, recoil: 1.12, shudder: 0.0375, size: 1, health: 0.8, damage: 0.48, pen: 0.99, speed: 7.5, maxSpeed: 1.5, range: 1, density: 1.5, spray: 6, resist: 1.15 } }),
      gun(6, 11, 1.2, 8, 0, 180, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.225,
    maxDrones: 3
  });

  def("assembler", {
    name: "Assembler",
    desc: "",
    guns: [
      gun(18, 12, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(2, 12, 1.1, 18, 0, 0, 0, { shoot: { reload: 25.3, recoil: 2, shudder: 0.025, size: 1.05, health: 2, damage: 0.75, pen: 1.25, speed: 7.15, maxSpeed: 2.15, range: 1.25, density: 1, spray: 0, resist: 3.75 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.15,
    speed: 0.8,
    maxDrones: 8,
    auto: true
  });

  def("atomizer", {
    name: "Atomizer",
    desc: "",
    guns: [
      gun(6, 7, 1.4, 18, 0, 0, 0, { shoot: { reload: 1.96875, recoil: 0.2576, shudder: 0.51, size: 0.55, health: 0.35, damage: 0.068906, pen: 0.945, speed: 5.4, maxSpeed: 0.512, range: 1, density: 1.5, spray: 63.28125, resist: 0.84 } }),
      gun(12, 10, 1.4, 8, 0, 0, 0, { shoot: { reload: 5.25, recoil: 1.12, shudder: 0.17, size: 1, health: 0.7, damage: 0.525, pen: 1, speed: 5, maxSpeed: 0.8, range: 1, density: 1, spray: 37.5, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 45
  });

  def("auto4", {
    name: "Auto-4",
    desc: "",
    guns: [
      gun(16, 4, 1, 0, -3.5, 45, 0, { type: "auto", shoot: { reload: 11.8125, recoil: 0.13125, shudder: 0.0405, size: 1.056, health: 0.81, damage: 0.11025, pen: 2.025, speed: 6.93, maxSpeed: 0.952, range: 0.8, density: 3.9, spray: 13.5, resist: 2.25 } }),
      gun(16, 4, 1, 0, 3.5, 45, 0.5, { type: "auto", shoot: { reload: 11.8125, recoil: 0.13125, shudder: 0.0405, size: 1.056, health: 0.81, damage: 0.11025, pen: 2.025, speed: 6.93, maxSpeed: 0.952, range: 0.8, density: 3.9, spray: 13.5, resist: 2.25 } }),
      gun(16, 4, 1, 0, -3.5, 135, 0, { type: "auto", shoot: { reload: 11.8125, recoil: 0.13125, shudder: 0.0405, size: 1.056, health: 0.81, damage: 0.11025, pen: 2.025, speed: 6.93, maxSpeed: 0.952, range: 0.8, density: 3.9, spray: 13.5, resist: 2.25 } }),
      gun(16, 4, 1, 0, 3.5, 135, 0.5, { type: "auto", shoot: { reload: 11.8125, recoil: 0.13125, shudder: 0.0405, size: 1.056, health: 0.81, damage: 0.11025, pen: 2.025, speed: 6.93, maxSpeed: 0.952, range: 0.8, density: 3.9, spray: 13.5, resist: 2.25 } }),
      gun(16, 4, 1, 0, -3.5, 225, 0, { type: "auto", shoot: { reload: 11.8125, recoil: 0.13125, shudder: 0.0405, size: 1.056, health: 0.81, damage: 0.11025, pen: 2.025, speed: 6.93, maxSpeed: 0.952, range: 0.8, density: 3.9, spray: 13.5, resist: 2.25 } }),
      gun(16, 4, 1, 0, 3.5, 225, 0.5, { type: "auto", shoot: { reload: 11.8125, recoil: 0.13125, shudder: 0.0405, size: 1.056, health: 0.81, damage: 0.11025, pen: 2.025, speed: 6.93, maxSpeed: 0.952, range: 0.8, density: 3.9, spray: 13.5, resist: 2.25 } }),
      gun(16, 4, 1, 0, -3.5, 315, 0, { type: "auto", shoot: { reload: 11.8125, recoil: 0.13125, shudder: 0.0405, size: 1.056, health: 0.81, damage: 0.11025, pen: 2.025, speed: 6.93, maxSpeed: 0.952, range: 0.8, density: 3.9, spray: 13.5, resist: 2.25 } }),
      gun(16, 4, 1, 0, 3.5, 315, 0.5, { type: "auto", shoot: { reload: 11.8125, recoil: 0.13125, shudder: 0.0405, size: 1.056, health: 0.81, damage: 0.11025, pen: 2.025, speed: 6.93, maxSpeed: 0.952, range: 0.8, density: 3.9, spray: 13.5, resist: 2.25 } })
    ],
    upgrades: [],
    needLevel: 45,
    auto: true
  });

  def("auto5", {
    name: "Auto-5",
    desc: "",
    guns: [
      gun(22, 10, 1, 0, 0, 0, 0, { type: "auto", shoot: { reload: 9.45, recoil: 1.26, shudder: 0.05, size: 0.8, health: 0.918, damage: 0.3645, pen: 1.08, speed: 5.5, maxSpeed: 0.85, range: 0.8, density: 1.56, spray: 15, resist: 1.25 } }),
      gun(22, 10, 1, 0, 0, 72, 0, { type: "auto", shoot: { reload: 9.45, recoil: 1.26, shudder: 0.05, size: 0.8, health: 0.918, damage: 0.3645, pen: 1.08, speed: 5.5, maxSpeed: 0.85, range: 0.8, density: 1.56, spray: 15, resist: 1.25 } }),
      gun(22, 10, 1, 0, 0, 144, 0, { type: "auto", shoot: { reload: 9.45, recoil: 1.26, shudder: 0.05, size: 0.8, health: 0.918, damage: 0.3645, pen: 1.08, speed: 5.5, maxSpeed: 0.85, range: 0.8, density: 1.56, spray: 15, resist: 1.25 } }),
      gun(22, 10, 1, 0, 0, 216, 0, { type: "auto", shoot: { reload: 9.45, recoil: 1.26, shudder: 0.05, size: 0.8, health: 0.918, damage: 0.3645, pen: 1.08, speed: 5.5, maxSpeed: 0.85, range: 0.8, density: 1.56, spray: 15, resist: 1.25 } }),
      gun(22, 10, 1, 0, 0, 288, 0, { type: "auto", shoot: { reload: 9.45, recoil: 1.26, shudder: 0.05, size: 0.8, health: 0.918, damage: 0.3645, pen: 1.08, speed: 5.5, maxSpeed: 0.85, range: 0.8, density: 1.56, spray: 15, resist: 1.25 } })
    ],
    upgrades: [],
    needLevel: 45,
    auto: true
  });

  def("autoassassin", {
    name: "Auto-Assassin",
    desc: "",
    guns: [
      gun(27, 8, 1, 0, 0, 0, 0, { shoot: { reload: 23.38875, recoil: 1.4, shudder: 0.00625, size: 1, health: 1.15, damage: 0.6, pen: 1.21, speed: 8.85, maxSpeed: 1.77, range: 1, density: 4.5, spray: 3, resist: 1.495 } }),
      gun(13, 8, -2.2, 0, 0, 0, 0, { type: "deco" }),
      gun(22, 10, 1, 0, 0, 180, 0, { type: "auto", shoot: { reload: 26.25, recoil: 0.4025, shudder: 0.09, size: 1.32, health: 0.8, damage: 0.1575, pen: 1.18125, speed: 9, maxSpeed: 1.36, range: 1, density: 0.3, spray: 11.25, resist: 1.8 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.4,
    speed: 0.85,
    auto: true
  });

  def("autobuilder", {
    name: "Auto-Builder",
    desc: "",
    guns: [
      gun(18, 12, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(2, 12, 1.1, 18, 0, 0, 0, { type: "trap", calculator: "trap", shoot: { reload: 25.3, recoil: 2, shudder: 0.025, size: 1.05, health: 2, damage: 0.75, pen: 1.25, speed: 7.15, maxSpeed: 2.15, range: 1.25, density: 1, spray: 0, resist: 3.75 } }),
      gun(22, 10, 1, 0, 0, 180, 0, { type: "auto", shoot: { reload: 26.25, recoil: 0.4025, shudder: 0.09, size: 1.32, health: 0.8, damage: 0.1575, pen: 1.18125, speed: 9, maxSpeed: 1.36, range: 1, density: 0.3, spray: 11.25, resist: 1.8 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.15,
    speed: 0.8,
    auto: true
  });

  def("autocruiser", {
    name: "Auto-Cruiser",
    desc: "",
    guns: [
      gun(9, 8.2, 0.6, 5, 4, 0, 0, { type: "swarm", calculator: "swarm", shoot: { reload: 23, recoil: 0.25, shudder: 0.05, size: 0.4, health: 1, damage: 0.75, pen: 1, speed: 4, maxSpeed: 1, range: 1, density: 1, spray: 5, resist: 1 } }),
      gun(9, 8.2, 0.6, 5, -4, 0, 0.5, { type: "swarm", calculator: "swarm", shoot: { reload: 23, recoil: 0.25, shudder: 0.05, size: 0.4, health: 1, damage: 0.75, pen: 1, speed: 4, maxSpeed: 1, range: 1, density: 1, spray: 5, resist: 1 } }),
      gun(22, 10, 1, 0, 0, 180, 0, { type: "auto", shoot: { reload: 26.25, recoil: 0.4025, shudder: 0.09, size: 1.32, health: 0.8, damage: 0.1575, pen: 1.18125, speed: 9, maxSpeed: 1.36, range: 1, density: 0.3, spray: 11.25, resist: 1.8 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.2,
    auto: true
  });

  def("autodouble", {
    name: "Auto-Double",
    desc: "",
    guns: [
      gun(20, 8, 1, 0, 5.5, 0, 0, { shoot: { reload: 10.5, recoil: 0.7, shudder: 0.09, size: 1, health: 0.9, damage: 0.5775, pen: 1, speed: 5, maxSpeed: 1, range: 1, density: 1, spray: 18, resist: 1 } }),
      gun(20, 8, 1, 0, 5.5, 180, 0, { shoot: { reload: 10.5, recoil: 0.7, shudder: 0.09, size: 1, health: 0.9, damage: 0.5775, pen: 1, speed: 5, maxSpeed: 1, range: 1, density: 1, spray: 18, resist: 1 } }),
      gun(20, 8, 1, 0, -5.5, 0, 0.5, { shoot: { reload: 10.5, recoil: 0.7, shudder: 0.09, size: 1, health: 0.9, damage: 0.5775, pen: 1, speed: 5, maxSpeed: 1, range: 1, density: 1, spray: 18, resist: 1 } }),
      gun(20, 8, 1, 0, -5.5, 180, 0.5, { shoot: { reload: 10.5, recoil: 0.7, shudder: 0.09, size: 1, health: 0.9, damage: 0.5775, pen: 1, speed: 5, maxSpeed: 1, range: 1, density: 1, spray: 18, resist: 1 } }),
      gun(22, 10, 1, 0, 0, 180, 0, { type: "auto", shoot: { reload: 26.25, recoil: 0.4025, shudder: 0.09, size: 1.32, health: 0.8, damage: 0.1575, pen: 1.18125, speed: 9, maxSpeed: 1.36, range: 1, density: 0.3, spray: 11.25, resist: 1.8 } })
    ],
    upgrades: [],
    needLevel: 45,
    auto: true
  });

  def("autogunner", {
    name: "Auto-Gunner",
    desc: "",
    guns: [
      gun(12, 3.5, 1, 0, 7.25, 0, 0.5, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.215, damage: 0.13125, pen: 1.25, speed: 4.8, maxSpeed: 0.65, range: 1, density: 1.5, spray: 27, resist: 1.2 } }),
      gun(12, 3.5, 1, 0, -7.25, 0, 0.75, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.215, damage: 0.13125, pen: 1.25, speed: 4.8, maxSpeed: 0.65, range: 1, density: 1.5, spray: 27, resist: 1.2 } }),
      gun(16, 3.5, 1, 0, 3.75, 0, 0, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.215, damage: 0.13125, pen: 1.25, speed: 4.8, maxSpeed: 0.65, range: 1, density: 1.5, spray: 27, resist: 1.2 } }),
      gun(16, 3.5, 1, 0, -3.75, 0, 0.25, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.215, damage: 0.13125, pen: 1.25, speed: 4.8, maxSpeed: 0.65, range: 1, density: 1.5, spray: 27, resist: 1.2 } }),
      gun(22, 10, 1, 0, 0, 180, 0, { type: "auto", shoot: { reload: 26.25, recoil: 0.4025, shudder: 0.09, size: 1.32, health: 0.8, damage: 0.1575, pen: 1.18125, speed: 9, maxSpeed: 1.36, range: 1, density: 0.3, spray: 11.25, resist: 1.8 } })
    ],
    upgrades: [],
    needLevel: 45,
    auto: true
  });

  def("autooverseer", {
    name: "Auto-Overseer",
    desc: "",
    guns: [
      gun(6, 12, 1.2, 8, 0, 90, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } }),
      gun(6, 12, 1.2, 8, 0, -90, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } }),
      gun(22, 10, 1, 0, 0, 180, 0, { type: "auto", shoot: { reload: 26.25, recoil: 0.4025, shudder: 0.09, size: 1.32, health: 0.8, damage: 0.1575, pen: 1.18125, speed: 9, maxSpeed: 1.36, range: 1, density: 0.3, spray: 11.25, resist: 1.8 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.1,
    speed: 0.9,
    maxDrones: 8,
    auto: true
  });

  def("autosmasher", {
    name: "Auto-Smasher",
    desc: "",
    guns: [
      gun(16, 6, 1, 0, 0, 0, 0, { type: "auto", layers: [g.basic, g.autoTurret] })
    ],
    upgrades: [],
    needLevel: 45,
    speed: 1.12,
    health: 1.3,
    bodyDamage: 2.05,
    smasher: true,
    auto: true
  });

  def("autospawner", {
    name: "Auto-Spawner",
    desc: "",
    guns: [
      gun(4.5, 10, 1, 10.5, 0, 0, 0, { type: "deco" }),
      gun(1, 12, 1, 15, 0, 0, 0, { type: "minion", calculator: "drone", shoot: { reload: 72, recoil: 1, shudder: 0.1, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 3, maxSpeed: 1.25, range: 1, density: 1, spray: 0.1, resist: 1 } }),
      gun(11.5, 12, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(22, 10, 1, 0, 0, 180, 0, { type: "auto", shoot: { reload: 26.25, recoil: 0.4025, shudder: 0.09, size: 1.32, health: 0.8, damage: 0.1575, pen: 1.18125, speed: 9, maxSpeed: 1.36, range: 1, density: 0.3, spray: 11.25, resist: 1.8 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.1,
    speed: 0.8,
    maxDrones: 4,
    auto: true
  });

  def("autotriangle", {
    name: "Auto-Tri-Angle",
    desc: "",
    guns: [
      gun(18, 8, 1, 0, 0, 0, 0, { shoot: { reload: 10.5, recoil: 1.2096, shudder: 0.1, size: 1, health: 0.918, damage: 0.6075, pen: 0.9, speed: 5.2, maxSpeed: 0.748, range: 0.9, density: 1.2, spray: 15, resist: 1 } }),
      gun(16, 8, 1, 0, 0, 150, 0.1, { shoot: { reload: 10.5, recoil: 2.268, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } }),
      gun(16, 8, 1, 0, 0, -150, 0.1, { shoot: { reload: 10.5, recoil: 2.268, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } }),
      gun(22, 10, 1, 0, 0, 180, 0, { type: "auto", shoot: { reload: 26.25, recoil: 0.4025, shudder: 0.09, size: 1.32, health: 0.8, damage: 0.1575, pen: 1.18125, speed: 9, maxSpeed: 1.36, range: 1, density: 0.3, spray: 11.25, resist: 1.8 } })
    ],
    upgrades: [],
    needLevel: 45,
    health: 0.8,
    auto: true
  });

  def("banshee", {
    name: "Banshee",
    desc: "",
    guns: [
      gun(6, 11, 1.2, 8, 0, 180, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } }),
      gun(6, 11, 1.2, 8, 0, 300, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } }),
      gun(6, 11, 1.2, 8, 0, 420, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } }),
      gun(26, 10, 1, 0, 0, 0, 0, { type: "auto", shoot: { reload: 14.175, recoil: 1.26, shudder: 0.05, size: 0.8, health: 0.918, damage: 0.3645, pen: 1.08, speed: 5.5, maxSpeed: 0.85, range: 0.8, density: 1.56, spray: 15, resist: 1.25 } }),
      gun(26, 10, 1, 0, 0, 120, 0, { type: "auto", shoot: { reload: 14.175, recoil: 1.26, shudder: 0.05, size: 0.8, health: 0.918, damage: 0.3645, pen: 1.08, speed: 5.5, maxSpeed: 0.85, range: 0.8, density: 1.56, spray: 15, resist: 1.25 } }),
      gun(26, 10, 1, 0, 0, 240, 0, { type: "auto", shoot: { reload: 14.175, recoil: 1.26, shudder: 0.05, size: 0.8, health: 0.918, damage: 0.3645, pen: 1.08, speed: 5.5, maxSpeed: 0.85, range: 0.8, density: 1.56, spray: 15, resist: 1.25 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.1,
    speed: 0.8,
    maxDrones: 6,
    auto: true
  });

  def("battleship", {
    name: "Battleship",
    desc: "",
    guns: [
      gun(9, 8.2, 0.6, 5, 4, 90, 0, { type: "swarm", calculator: "swarm", shoot: { reload: 23, recoil: 0.25, shudder: 0.05, size: 0.4, health: 1.25, damage: 0.8625, pen: 1, speed: 4, maxSpeed: 0.85, range: 1, density: 1, spray: 5, resist: 1.1 } }),
      gun(9, 8.2, 0.6, 5, -4, -90, 0.5, { type: "swarm", calculator: "swarm", shoot: { reload: 23, recoil: 0.25, shudder: 0.05, size: 0.4, health: 1.25, damage: 0.8625, pen: 1, speed: 4, maxSpeed: 0.85, range: 1, density: 1, spray: 5, resist: 1.1 } }),
      gun(9, 8.2, 0.6, 5, 4, 270, 0, { type: "swarm", calculator: "swarm", shoot: { reload: 23, recoil: 0.25, shudder: 0.05, size: 0.4, health: 1, damage: 0.75, pen: 1, speed: 4, maxSpeed: 1, range: 1, density: 1, spray: 5, resist: 1 } }),
      gun(9, 8.2, 0.6, 5, -4, -270, 0.5, { type: "swarm", calculator: "swarm", shoot: { reload: 23, recoil: 0.25, shudder: 0.05, size: 0.4, health: 1, damage: 0.75, pen: 1, speed: 4, maxSpeed: 1, range: 1, density: 1, spray: 5, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.2
  });

  def("beekeeper", {
    name: "Beekeeper",
    desc: "",
    guns: [
      gun(14, 5, 1, 0, -5, -7, 0.25, { type: "swarm", calculator: "drone", shoot: { reload: 29.9, recoil: 0.25, shudder: 0.05, size: 0.56, health: 1, damage: 1.125, pen: 0.5, speed: 6, maxSpeed: 1.5, range: 1, density: 0.25, spray: 5, resist: 1 } }),
      gun(14, 5, 1, 0, 5, 7, 0.75, { type: "swarm", calculator: "drone", shoot: { reload: 29.9, recoil: 0.25, shudder: 0.05, size: 0.56, health: 1, damage: 1.125, pen: 0.5, speed: 6, maxSpeed: 1.5, range: 1, density: 0.25, spray: 5, resist: 1 } }),
      gun(19, 12, 1, 0, 0, 0, 0, { shoot: { reload: 25.2, recoil: 1.568, shudder: 0.1, size: 0.9, health: 1, damage: 1.5, pen: 1, speed: 4.8875, maxSpeed: 0.88, range: 1, density: 2.25, spray: 15, resist: 1.15 } })
    ],
    upgrades: [],
    needLevel: 45
  });

  def("bentdouble", {
    name: "Bent Double",
    desc: "",
    guns: [
      gun(19, 8, 1, 0, 2, 18, 0.5, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.072, size: 1, health: 0.81, damage: 0.5775, pen: 0.8, speed: 5, maxSpeed: 1, range: 1, density: 0.8, spray: 9, resist: 1 } }),
      gun(19, 8, 1, 0, 2, 198, 0.5, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.072, size: 1, health: 0.81, damage: 0.5775, pen: 0.8, speed: 5, maxSpeed: 1, range: 1, density: 0.8, spray: 9, resist: 1 } }),
      gun(19, 8, 1, 0, -2, -18, 0.5, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.072, size: 1, health: 0.81, damage: 0.5775, pen: 0.8, speed: 5, maxSpeed: 1, range: 1, density: 0.8, spray: 9, resist: 1 } }),
      gun(19, 8, 1, 0, -2, 162, 0.5, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.072, size: 1, health: 0.81, damage: 0.5775, pen: 0.8, speed: 5, maxSpeed: 1, range: 1, density: 0.8, spray: 9, resist: 1 } }),
      gun(22, 8, 1, 0, 0, 0, 0, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.072, size: 1, health: 0.81, damage: 0.5775, pen: 0.8, speed: 5, maxSpeed: 1, range: 1, density: 0.8, spray: 9, resist: 1 } }),
      gun(22, 8, 1, 0, 0, 180, 0, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.072, size: 1, health: 0.81, damage: 0.5775, pen: 0.8, speed: 5, maxSpeed: 1, range: 1, density: 0.8, spray: 9, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 45,
    speed: 0.9
  });

  def("benthybrid", {
    name: "Bent Hybrid",
    desc: "",
    guns: [
      gun(19, 8, 1, 0, 2, 18, 0.5, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.072, size: 1, health: 0.81, damage: 0.525, pen: 0.8, speed: 5, maxSpeed: 1, range: 1, density: 0.8, spray: 9, resist: 1 } }),
      gun(19, 8, 1, 0, -2, -18, 0.5, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.072, size: 1, health: 0.81, damage: 0.525, pen: 0.8, speed: 5, maxSpeed: 1, range: 1, density: 0.8, spray: 9, resist: 1 } }),
      gun(22, 8, 1, 0, 0, 0, 0, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.072, size: 1, health: 0.81, damage: 0.525, pen: 0.8, speed: 5, maxSpeed: 1, range: 1, density: 0.8, spray: 9, resist: 1 } }),
      gun(6, 11, 1.2, 8, 0, 180, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 45,
    speed: 0.9,
    maxDrones: 3
  });

  def("bomber", {
    name: "Bomber",
    desc: "",
    guns: [
      gun(20, 8, 1, 0, 0, 0, 0, { shoot: { reload: 10.5, recoil: 0.3024, shudder: 0.1, size: 1, health: 0.918, damage: 0.6075, pen: 0.9, speed: 5.2, maxSpeed: 0.748, range: 0.9, density: 1.2, spray: 15, resist: 1 } }),
      gun(18, 8, 1, 0, 0, 130, 0.1, { shoot: { reload: 10.5, recoil: 1.512, shudder: 0.1, size: 1, health: 0.918, damage: 0.6075, pen: 0.9, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 15, resist: 1 } }),
      gun(18, 8, 1, 0, 0, -130, 0.1, { shoot: { reload: 10.5, recoil: 1.512, shudder: 0.1, size: 1, health: 0.918, damage: 0.6075, pen: 0.9, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 15, resist: 1 } }),
      gun(13, 8, 1, 0, 0, 180, 0, { type: "deco" }),
      gun(4, 8, 1.7, 13, 0, 180, 0, { type: "trap", calculator: "trap", shoot: { reload: 23, recoil: 1, shudder: 0.25, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 3.25, maxSpeed: 1, range: 1, density: 1, spray: 0, resist: 3 } })
    ],
    upgrades: [],
    needLevel: 45
  });

  def("boomer", {
    name: "Boomer",
    desc: "",
    guns: [
      gun(18, 10, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(13, 10, -1.9, 0, 0, 0, 0, { type: "deco" }),
      gun(2, 10, 1.3, 18, 0, 0, 0, { shoot: { reload: 20.24, recoil: 2, shudder: 0.025, size: 1.05, health: 1, damage: 0.375, pen: 1.25, speed: 5.3625, maxSpeed: 1.6125, range: 1.666667, density: 1, spray: 0, resist: 3.75 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.15,
    speed: 0.8
  });

  def("booster", {
    name: "Booster",
    desc: "",
    guns: [
      gun(18, 8, 1, 0, 0, 0, 0, { shoot: { reload: 10.5, recoil: 1.2096, shudder: 0.1, size: 1, health: 0.918, damage: 0.6075, pen: 0.9, speed: 5.2, maxSpeed: 0.748, range: 0.9, density: 1.2, spray: 15, resist: 1 } }),
      gun(14, 8, 1, 0, 0, 135, 0.6, { shoot: { reload: 10.5, recoil: 2.268, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } }),
      gun(14, 8, 1, 0, 0, -135, 0.6, { shoot: { reload: 10.5, recoil: 2.268, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } }),
      gun(16, 8, 1, 0, 0, 150, 0.1, { shoot: { reload: 10.5, recoil: 2.268, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } }),
      gun(16, 8, 1, 0, 0, -150, 0.1, { shoot: { reload: 10.5, recoil: 2.268, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } })
    ],
    upgrades: [],
    needLevel: 45,
    health: 0.4
  });

  def("carrier", {
    name: "Carrier",
    desc: "",
    guns: [
      gun(9, 8.2, 0.6, 5, 2, 30, 0.5, { type: "swarm", calculator: "swarm", shoot: { reload: 34.5, recoil: 0.25, shudder: 0.05, size: 0.4, health: 1.25, damage: 0.69, pen: 1, speed: 5.2, maxSpeed: 1.02, range: 1.2, density: 1, spray: 5, resist: 1.1 } }),
      gun(9, 8.2, 0.6, 5, -2, -30, 0.5, { type: "swarm", calculator: "swarm", shoot: { reload: 34.5, recoil: 0.25, shudder: 0.05, size: 0.4, health: 1.25, damage: 0.69, pen: 1, speed: 5.2, maxSpeed: 1.02, range: 1.2, density: 1, spray: 5, resist: 1.1 } }),
      gun(9, 8.2, 0.6, 5, 0, 0, 0, { type: "swarm", calculator: "swarm", shoot: { reload: 34.5, recoil: 0.25, shudder: 0.05, size: 0.4, health: 1.25, damage: 0.69, pen: 1, speed: 5.2, maxSpeed: 1.02, range: 1.2, density: 1, spray: 5, resist: 1.1 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.2
  });

  def("commander", {
    name: "Commander",
    desc: "",
    guns: [
      gun(6, 12, 1.2, 8, 0, 0, 0, { type: "drone", calculator: "drone", shoot: { reload: 36, recoil: 0.25, shudder: 0.1, size: 0.6, health: 1, damage: 1, pen: 1, speed: 1.5, maxSpeed: 1, range: 1, density: 1, spray: 0.1, resist: 1 } }),
      gun(6, 12, 1.2, 8, 0, 120, 0, { type: "drone", calculator: "drone", shoot: { reload: 36, recoil: 0.25, shudder: 0.1, size: 0.6, health: 1, damage: 1, pen: 1, speed: 1.5, maxSpeed: 1, range: 1, density: 1, spray: 0.1, resist: 1 } }),
      gun(6, 12, 1.2, 8, 0, 240, 0, { type: "drone", calculator: "drone", shoot: { reload: 36, recoil: 0.25, shudder: 0.1, size: 0.6, health: 1, damage: 1, pen: 1, speed: 1.5, maxSpeed: 1, range: 1, density: 1, spray: 0.1, resist: 1 } }),
      gun(9, 8.2, 0.6, 5, 0, 180, 0, { type: "swarm", calculator: "swarm", shoot: { reload: 34.5, recoil: 0.25, shudder: 0.05, size: 0.4, health: 0.4, damage: 0.525, pen: 1, speed: 4, maxSpeed: 1, range: 1, density: 1, spray: 5, resist: 1 } }),
      gun(9, 8.2, 0.6, 5, 0, 300, 0.3333, { type: "swarm", calculator: "swarm", shoot: { reload: 34.5, recoil: 0.25, shudder: 0.05, size: 0.4, health: 0.4, damage: 0.525, pen: 1, speed: 4, maxSpeed: 1, range: 1, density: 1, spray: 5, resist: 1 } }),
      gun(9, 8.2, 0.6, 5, 0, 420, 0.6667, { type: "swarm", calculator: "swarm", shoot: { reload: 34.5, recoil: 0.25, shudder: 0.05, size: 0.4, health: 0.4, damage: 0.525, pen: 1, speed: 4, maxSpeed: 1, range: 1, density: 1, spray: 5, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.15,
    maxDrones: 6
  });

  def("conqueror", {
    name: "Conqueror",
    desc: "",
    guns: [
      gun(20.5, 14, 1, 0, 0, 180, 0, { shoot: { reload: 42, recoil: 4.032, shudder: 0.05, size: 1, health: 2, damage: 1.35, pen: 1.2, speed: 2.125, maxSpeed: 0.48, range: 1, density: 3, spray: 15, resist: 3.45 } }),
      gun(18, 12, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(2, 12, 1.1, 18, 0, 0, 0, { type: "trap", calculator: "trap", shoot: { reload: 25.3, recoil: 2, shudder: 0.025, size: 1.05, health: 2, damage: 0.75, pen: 1.25, speed: 7.15, maxSpeed: 2.15, range: 1.25, density: 1, spray: 0, resist: 3.75 } })
    ],
    upgrades: [],
    needLevel: 45,
    speed: 0.8
  });

  def("construct", {
    name: "Constructor",
    desc: "",
    guns: [
      gun(18, 18, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(2, 18, 1.2, 18, 0, 0, 0, { type: "trap", calculator: "trap", shoot: { reload: 32.89, recoil: 2, shudder: 0.025, size: 0.945, health: 2, damage: 0.75, pen: 1.25, speed: 7.15, maxSpeed: 2.365, range: 1.25, density: 1, spray: 0, resist: 3.75 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.15,
    speed: 0.7
  });

  def("cropduster", {
    name: "Crop Duster",
    desc: "",
    guns: [
      gun(21, 8, 1, 0, 0, 0, 0, { shoot: { reload: 13.125, recoil: 0.84, shudder: 0.1, size: 0.8, health: 0.55, damage: 0.3375, pen: 1.25, speed: 6.65, maxSpeed: 1, range: 1, density: 1.25, spray: 7.5, resist: 1.1 } }),
      gun(19, 8, 1, 0, 0, 0, 0.3333, { shoot: { reload: 13.125, recoil: 0.84, shudder: 0.1, size: 0.8, health: 0.55, damage: 0.3375, pen: 1.25, speed: 6.65, maxSpeed: 1, range: 1, density: 1.25, spray: 7.5, resist: 1.1 } }),
      gun(17, 8, 1, 0, 0, 0, 0.6667, { shoot: { reload: 13.125, recoil: 0.84, shudder: 0.1, size: 0.8, health: 0.55, damage: 0.3375, pen: 1.25, speed: 6.65, maxSpeed: 1, range: 1, density: 1.25, spray: 7.5, resist: 1.1 } }),
      gun(6, 11, 1.2, 8, 0, 180, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.2,
    maxDrones: 3
  });

  def("crossbow", {
    name: "Crossbow",
    desc: "",
    guns: [
      gun(13, 3, 1, 0, 2, 35, 1, { shoot: { reload: 22.68, recoil: 0.56, shudder: 0.0375, size: 1, health: 0.48, damage: 0.288, pen: 0.792, speed: 7.5, maxSpeed: 1.5, range: 1, density: 1.5, spray: 6, resist: 1.15 } }),
      gun(13, 3, 1, 0, -2, -35, 1.5, { shoot: { reload: 22.68, recoil: 0.56, shudder: 0.0375, size: 1, health: 0.48, damage: 0.288, pen: 0.792, speed: 7.5, maxSpeed: 1.5, range: 1, density: 1.5, spray: 6, resist: 1.15 } }),
      gun(15, 3, 1, 0, 3.5, 15, 0.6667, { shoot: { reload: 22.68, recoil: 0.56, shudder: 0.0375, size: 1, health: 0.48, damage: 0.288, pen: 0.792, speed: 7.5, maxSpeed: 1.5, range: 1, density: 1.5, spray: 6, resist: 1.15 } }),
      gun(15, 3, 1, 0, -3.5, -15, 1.1667, { shoot: { reload: 22.68, recoil: 0.56, shudder: 0.0375, size: 1, health: 0.48, damage: 0.288, pen: 0.792, speed: 7.5, maxSpeed: 1.5, range: 1, density: 1.5, spray: 6, resist: 1.15 } }),
      gun(20, 4, 1, 0, 4, 0, 0.3333, { shoot: { reload: 22.68, recoil: 0.56, shudder: 0.0375, size: 1, health: 0.48, damage: 0.288, pen: 0.792, speed: 5.25, maxSpeed: 1.05, range: 1, density: 1.5, spray: 6, resist: 1.15 } }),
      gun(20, 4, 1, 0, -4, 0, 0.8333, { shoot: { reload: 22.68, recoil: 0.56, shudder: 0.0375, size: 1, health: 0.48, damage: 0.288, pen: 0.792, speed: 5.25, maxSpeed: 1.05, range: 1, density: 1.5, spray: 6, resist: 1.15 } }),
      gun(24, 7, 1, 0, 0, 0, 0, { shoot: { reload: 22.68, recoil: 0.56, shudder: 0.0375, size: 1, health: 0.48, damage: 0.288, pen: 0.792, speed: 5.25, maxSpeed: 1.05, range: 1, density: 1.5, spray: 6, resist: 1.15 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.225
  });

  def("cyclone", {
    name: "Cyclone",
    desc: "",
    guns: [
      gun(15, 3.5, 1, 0, 0, 0, 0, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.5795, damage: 0.170625, pen: 1.375, speed: 6, maxSpeed: 0.7475, range: 1, density: 1.5, spray: 27, resist: 1.2 } }),
      gun(15, 3.5, 1, 0, 0, 120, 0, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.5795, damage: 0.170625, pen: 1.375, speed: 6, maxSpeed: 0.7475, range: 1, density: 1.5, spray: 27, resist: 1.2 } }),
      gun(15, 3.5, 1, 0, 0, 240, 0, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.5795, damage: 0.170625, pen: 1.375, speed: 6, maxSpeed: 0.7475, range: 1, density: 1.5, spray: 27, resist: 1.2 } }),
      gun(15, 3.5, 1, 0, 0, 30, 0.25, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.5795, damage: 0.170625, pen: 1.375, speed: 6, maxSpeed: 0.7475, range: 1, density: 1.5, spray: 27, resist: 1.2 } }),
      gun(15, 3.5, 1, 0, 0, 150, 0.25, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.5795, damage: 0.170625, pen: 1.375, speed: 6, maxSpeed: 0.7475, range: 1, density: 1.5, spray: 27, resist: 1.2 } }),
      gun(15, 3.5, 1, 0, 0, 270, 0.25, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.5795, damage: 0.170625, pen: 1.375, speed: 6, maxSpeed: 0.7475, range: 1, density: 1.5, spray: 27, resist: 1.2 } }),
      gun(15, 3.5, 1, 0, 0, 60, 0.5, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.5795, damage: 0.170625, pen: 1.375, speed: 6, maxSpeed: 0.7475, range: 1, density: 1.5, spray: 27, resist: 1.2 } }),
      gun(15, 3.5, 1, 0, 0, 180, 0.5, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.5795, damage: 0.170625, pen: 1.375, speed: 6, maxSpeed: 0.7475, range: 1, density: 1.5, spray: 27, resist: 1.2 } }),
      gun(15, 3.5, 1, 0, 0, 300, 0.5, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.5795, damage: 0.170625, pen: 1.375, speed: 6, maxSpeed: 0.7475, range: 1, density: 1.5, spray: 27, resist: 1.2 } }),
      gun(15, 3.5, 1, 0, 0, 90, 0.75, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.5795, damage: 0.170625, pen: 1.375, speed: 6, maxSpeed: 0.7475, range: 1, density: 1.5, spray: 27, resist: 1.2 } }),
      gun(15, 3.5, 1, 0, 0, 210, 0.75, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.5795, damage: 0.170625, pen: 1.375, speed: 6, maxSpeed: 0.7475, range: 1, density: 1.5, spray: 27, resist: 1.2 } }),
      gun(15, 3.5, 1, 0, 0, 330, 0.75, { shoot: { reload: 10.5, recoil: 0.175, shudder: 0.135, size: 1.2, health: 1.5795, damage: 0.170625, pen: 1.375, speed: 6, maxSpeed: 0.7475, range: 1, density: 1.5, spray: 27, resist: 1.2 } })
    ],
    upgrades: [],
    needLevel: 45
  });

  def("deadeye", {
    name: "Deadeye",
    desc: "",
    guns: [
      gun(13, 5, 2.2, 7, 0, 0, 0, { type: "deco" }),
      gun(13, 5, 2.2, 2, 0, 0, 0, { type: "deco" }),
      gun(24, 8, 1, 0, 0, 0, 0, { shoot: { reload: 40.930312, recoil: 1.4, shudder: 0.00625, size: 1, health: 9.583333, damage: 0.072, pen: 2.42, speed: 8.85, maxSpeed: 1.77, range: 1, density: 4.5, spray: 3, resist: 1.495 } }),
      gun(13, 8, -2.2, 0, 0, 0, 0, { type: "deco" })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.4,
    speed: 0.85
  });

  def("engineer", {
    name: "Engineer",
    desc: "",
    guns: [
      gun(5, 11, 1, 10.5, 0, 0, 0, { type: "deco" }),
      gun(3, 14, 1, 15.5, 0, 0, 0, { type: "deco" }),
      gun(2, 14, 1.3, 18, 0, 0, 0, { type: "pillbox", calculator: "trap", shoot: { reload: 25.3, recoil: 2, shudder: 0.025, size: 1.05, health: 2, damage: 0.75, pen: 1.25, speed: 7.15, maxSpeed: 2.15, range: 1.25, density: 1, spray: 0, resist: 3.75 } }),
      gun(12, 14, 1, 0, 0, 0, 0, { type: "deco" })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.15,
    speed: 0.75,
    maxDrones: 6
  });

  def("factory", {
    name: "Factory",
    desc: "",
    guns: [
      gun(15.5, 11, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(2, 14, 1, 15.5, 0, 0, 0, { type: "minion", calculator: "drone", shoot: { reload: 48, recoil: 1, shudder: 0.1, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 3, maxSpeed: 1, range: 1, density: 1, spray: 0.1, resist: 1 } }),
      gun(12, 14, 1, 0, 0, 0, 0, { type: "deco" })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.1,
    speed: 0.8,
    maxDrones: 6
  });

  def("falcon", {
    name: "Falcon",
    desc: "",
    guns: [
      gun(27, 8, 1, 0, 0, 0, 0, { shoot: { reload: 23.38875, recoil: 0.3024, shudder: 0.00625, size: 1, health: 1.0557, damage: 0.486, pen: 1.089, speed: 9.204, maxSpeed: 1.32396, range: 0.9, density: 5.4, spray: 3, resist: 1.495 } }),
      gun(13, 8, -2.2, 0, 0, 0, 0, { type: "deco" }),
      gun(16, 8, 1, 0, 0, 153, 0.1, { shoot: { reload: 10.5, recoil: 1.134, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } }),
      gun(16, 8, 1, 0, 0, -153, 0.1, { shoot: { reload: 10.5, recoil: 1.134, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } }),
      gun(18, 8, 1, 0, 0, 180, 0.6, { shoot: { reload: 10.5, recoil: 1.134, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.4,
    speed: 0.85
  });

  def("fieldgun", {
    name: "Field Gun",
    desc: "",
    guns: [
      gun(14.5, 3, 1, 0, -6, -7, 0.25, { shoot: { reload: 15.75, recoil: 0.245, shudder: 0.15, size: 0.99, health: 1, damage: 0.2625, pen: 1.35, speed: 5.175, maxSpeed: 0.88, range: 1, density: 2.25, spray: 22.5, resist: 1.2 } }),
      gun(14.5, 3, 1, 0, 6, 7, 0.75, { shoot: { reload: 15.75, recoil: 0.245, shudder: 0.15, size: 0.99, health: 1, damage: 0.2625, pen: 1.35, speed: 5.175, maxSpeed: 0.88, range: 1, density: 2.25, spray: 22.5, resist: 1.2 } }),
      gun(19.2, 13, 0.7, 0, 0, 0, 0, { type: "deco" }),
      gun(17, 13, 1, 0, 0, 0, 0, { type: "missile", shoot: { reload: 30.24, recoil: 1.0976, shudder: 0.1, size: 0.81, health: 1, damage: 1.5, pen: 1, speed: 5.620625, maxSpeed: 0.968, range: 1, density: 3.375, spray: 15, resist: 1.15 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.1
  });

  def("fighter", {
    name: "Fighter",
    desc: "",
    guns: [
      gun(18, 8, 1, 0, 0, 0, 0, { shoot: { reload: 10.5, recoil: 1.2096, shudder: 0.1, size: 1, health: 0.918, damage: 0.6075, pen: 0.9, speed: 5.2, maxSpeed: 0.748, range: 0.9, density: 1.2, spray: 15, resist: 1 } }),
      gun(16, 8, 1, 0, -1, 90, 0, { shoot: { reload: 10.5, recoil: 0.3024, shudder: 0.1, size: 1, health: 0.918, damage: 0.6075, pen: 0.9, speed: 5.2, maxSpeed: 0.748, range: 0.9, density: 1.2, spray: 15, resist: 1 } }),
      gun(16, 8, 1, 0, 1, -90, 0, { shoot: { reload: 10.5, recoil: 0.3024, shudder: 0.1, size: 1, health: 0.918, damage: 0.6075, pen: 0.9, speed: 5.2, maxSpeed: 0.748, range: 0.9, density: 1.2, spray: 15, resist: 1 } }),
      gun(16, 8, 1, 0, 0, 150, 0.1, { shoot: { reload: 10.5, recoil: 2.268, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } }),
      gun(16, 8, 1, 0, 0, -150, 0.1, { shoot: { reload: 10.5, recoil: 2.268, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } })
    ],
    upgrades: [],
    needLevel: 45
  });

  def("focal", {
    name: "Focal",
    desc: "",
    guns: [
      gun(25, 7, 1, 0, 0, 0, 0, { shoot: { reload: 6.5625, recoil: 0.322, shudder: 0.51, size: 1.1, health: 0.35, damage: 0.091875, pen: 0.945, speed: 4.5, maxSpeed: 0.64, range: 1, density: 1.5, spray: 28.125, resist: 0.84 } }),
      gun(14, 9.5, 1.25, 8, 0, 0, 0, { shoot: { reload: 6.5625, recoil: 1.493333, shudder: 0.136, size: 1, health: 0.56, damage: 0.525, pen: 1.1, speed: 6.25, maxSpeed: 1, range: 1.1, density: 1.25, spray: 18.75, resist: 1.1 } })
    ],
    upgrades: [],
    needLevel: 45
  });

  def("fork", {
    name: "Fork",
    desc: "",
    guns: [
      gun(13, 5, 2.2, 15, 0, 0, 0, { type: "deco" }),
      gun(13, 5, 2.2, 10, 0, 0, 0, { type: "deco" }),
      gun(13, 5, 2.2, 5, 0, 0, 0, { type: "deco" }),
      gun(13, 5, 2.2, 0, 0, 0, 0, { type: "deco" }),
      gun(29, 8, 1, 0, 0, 0, 0, { shoot: { reload: 24.80625, recoil: 1.4, shudder: 0.025, size: 1, health: 8.333333, damage: 0.072, pen: 2.2, speed: 7.5, maxSpeed: 1.5, range: 1, density: 1.5, spray: 3, resist: 1.15 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.2
  });

  def("fortress", {
    name: "Fortress",
    desc: "",
    guns: [
      gun(9, 8.2, 0.6, 5, 0, 180, 0, { type: "swarm", calculator: "swarm", shoot: { reload: 23, recoil: 0.25, shudder: 0.05, size: 0.4, health: 1, damage: 0.75, pen: 1, speed: 4, maxSpeed: 1, range: 1, density: 1, spray: 5, resist: 1 } }),
      gun(9, 8.2, 0.6, 5, 0, 300, 0.3333, { type: "swarm", calculator: "swarm", shoot: { reload: 23, recoil: 0.25, shudder: 0.05, size: 0.4, health: 1, damage: 0.75, pen: 1, speed: 4, maxSpeed: 1, range: 1, density: 1, spray: 5, resist: 1 } }),
      gun(9, 8.2, 0.6, 5, 0, 420, 0.6667, { type: "swarm", calculator: "swarm", shoot: { reload: 23, recoil: 0.25, shudder: 0.05, size: 0.4, health: 1, damage: 0.75, pen: 1, speed: 4, maxSpeed: 1, range: 1, density: 1, spray: 5, resist: 1 } }),
      gun(14, 9, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(14, 9, 1, 0, 0, 120, 0, { type: "deco" }),
      gun(14, 9, 1, 0, 0, 240, 0, { type: "deco" }),
      gun(4, 9, 1.5, 14, 0, 0, 0, { type: "trap", calculator: "trap", shoot: { reload: 23, recoil: 1, shudder: 0.25, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 2.275, maxSpeed: 0.7, range: 0.5, density: 1, spray: 0, resist: 3 } }),
      gun(4, 9, 1.5, 14, 0, 120, 0, { type: "trap", calculator: "trap", shoot: { reload: 23, recoil: 1, shudder: 0.25, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 2.275, maxSpeed: 0.7, range: 0.5, density: 1, spray: 0, resist: 3 } }),
      gun(4, 9, 1.5, 14, 0, 240, 0, { type: "trap", calculator: "trap", shoot: { reload: 23, recoil: 1, shudder: 0.25, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 2.275, maxSpeed: 0.7, range: 0.5, density: 1, spray: 0, resist: 3 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.2,
    speed: 0.8
  });

  def("gunnertrapper", {
    name: "Gunner Trapper",
    desc: "",
    guns: [
      gun(13, 11, 1, 0, 0, 180, 0, { type: "deco" }),
      gun(4, 11, 1.7, 13, 0, 180, 0, { type: "trap", calculator: "trap", shoot: { reload: 23, recoil: 0.5, shudder: 0.25, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 3.9, maxSpeed: 1, range: 1, density: 1, spray: 0, resist: 3 } }),
      gun(19, 2, 1, 0, -2.5, 0, 0, { shoot: { reload: 13.125, recoil: 1.26, shudder: 0.081, size: 1.32, health: 0.9, damage: 0.18375, pen: 1.6875, speed: 9, maxSpeed: 1.36, range: 1, density: 3, spray: 13.5, resist: 1.8 } }),
      gun(19, 2, 1, 0, 2.5, 0, 0.5, { shoot: { reload: 13.125, recoil: 1.26, shudder: 0.081, size: 1.32, health: 0.9, damage: 0.18375, pen: 1.6875, speed: 9, maxSpeed: 1.36, range: 1, density: 3, spray: 13.5, resist: 1.8 } }),
      gun(12, 11, 1, 0, 0, 0, 0, { type: "deco" })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.25
  });

  def("hewn", {
    name: "Hewn Double",
    desc: "",
    guns: [
      gun(19, 8, 1, 0, -5.5, 155, 0, { shoot: { reload: 13.125, recoil: 0.60375, shudder: 0.081, size: 1, health: 0.729, damage: 0.343612, pen: 1, speed: 5, maxSpeed: 0.9, range: 1, density: 1, spray: 21.6, resist: 1 } }),
      gun(19, 8, 1, 0, 5.5, -155, 0.5, { shoot: { reload: 13.125, recoil: 0.60375, shudder: 0.081, size: 1, health: 0.729, damage: 0.343612, pen: 1, speed: 5, maxSpeed: 0.9, range: 1, density: 1, spray: 21.6, resist: 1 } }),
      gun(20, 8, 1, 0, 5.5, 0, 0, { shoot: { reload: 13.125, recoil: 1.05, shudder: 0.09, size: 1, health: 0.81, damage: 0.490875, pen: 1, speed: 5, maxSpeed: 0.9, range: 1, density: 1, spray: 18, resist: 1 } }),
      gun(20, 8, 1, 0, 5.5, 180, 0, { shoot: { reload: 13.125, recoil: 1.05, shudder: 0.09, size: 1, health: 0.81, damage: 0.490875, pen: 1, speed: 5, maxSpeed: 0.9, range: 1, density: 1, spray: 18, resist: 1 } }),
      gun(20, 8, 1, 0, -5.5, 0, 0.5, { shoot: { reload: 13.125, recoil: 1.05, shudder: 0.09, size: 1, health: 0.81, damage: 0.490875, pen: 1, speed: 5, maxSpeed: 0.9, range: 1, density: 1, spray: 18, resist: 1 } }),
      gun(20, 8, 1, 0, -5.5, 180, 0.5, { shoot: { reload: 13.125, recoil: 1.05, shudder: 0.09, size: 1, health: 0.81, damage: 0.490875, pen: 1, speed: 5, maxSpeed: 0.9, range: 1, density: 1, spray: 18, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 45
  });

  def("hexatrap", {
    name: "Hexa-Trapper",
    desc: "",
    guns: [
      gun(15, 7, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(15, 7, 1, 0, 0, 60, 0.5, { type: "deco" }),
      gun(15, 7, 1, 0, 0, 120, 0, { type: "deco" }),
      gun(15, 7, 1, 0, 0, 180, 0.5, { type: "deco" }),
      gun(15, 7, 1, 0, 0, 240, 0, { type: "deco" }),
      gun(15, 7, 1, 0, 0, 300, 0.5, { type: "deco" }),
      gun(3, 7, 1.7, 15, 0, 0, 0, { type: "trap", calculator: "trap", shoot: { reload: 29.9, recoil: 1, shudder: 0.3125, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 2.6, maxSpeed: 1, range: 0.5, density: 1, spray: 0, resist: 3 } }),
      gun(3, 7, 1.7, 15, 0, 60, 0.5, { type: "trap", calculator: "trap", shoot: { reload: 29.9, recoil: 1, shudder: 0.3125, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 2.6, maxSpeed: 1, range: 0.5, density: 1, spray: 0, resist: 3 } }),
      gun(3, 7, 1.7, 15, 0, 120, 0, { type: "trap", calculator: "trap", shoot: { reload: 29.9, recoil: 1, shudder: 0.3125, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 2.6, maxSpeed: 1, range: 0.5, density: 1, spray: 0, resist: 3 } }),
      gun(3, 7, 1.7, 15, 0, 180, 0.5, { type: "trap", calculator: "trap", shoot: { reload: 29.9, recoil: 1, shudder: 0.3125, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 2.6, maxSpeed: 1, range: 0.5, density: 1, spray: 0, resist: 3 } }),
      gun(3, 7, 1.7, 15, 0, 240, 0, { type: "trap", calculator: "trap", shoot: { reload: 29.9, recoil: 1, shudder: 0.3125, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 2.6, maxSpeed: 1, range: 0.5, density: 1, spray: 0, resist: 3 } }),
      gun(3, 7, 1.7, 15, 0, 300, 0.5, { type: "trap", calculator: "trap", shoot: { reload: 29.9, recoil: 1, shudder: 0.3125, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 2.6, maxSpeed: 1, range: 0.5, density: 1, spray: 0, resist: 3 } }),
      gun(22, 10, 1, 0, 0, 180, 0, { type: "auto", shoot: { reload: 26.25, recoil: 0.4025, shudder: 0.09, size: 1.32, health: 0.8, damage: 0.1575, pen: 1.18125, speed: 9, maxSpeed: 1.36, range: 1, density: 0.3, spray: 11.25, resist: 1.8 } })
    ],
    upgrades: [],
    needLevel: 45,
    auto: true
  });

  def("hybrid", {
    name: "Hybrid",
    desc: "",
    guns: [
      gun(20.5, 14, 1, 0, 0, 0, 0, { shoot: { reload: 42, recoil: 4.032, shudder: 0.05, size: 1, health: 2, damage: 1.35, pen: 1.2, speed: 2.125, maxSpeed: 0.48, range: 1, density: 3, spray: 15, resist: 3.45 } }),
      gun(6, 11, 1.2, 8, 0, 180, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 45,
    maxDrones: 3
  });

  def("infestor", {
    name: "Infestor",
    desc: "",
    guns: [
      gun(10, 6, 1.2, 3, 5, 90, 0, { type: "drone", calculator: "drone", shoot: { reload: 72, recoil: 0.25, shudder: 0.1, size: 0.84, health: 0.5, damage: 0.4, pen: 0.6, speed: 1.5, maxSpeed: 1, range: 1, density: 0.8, spray: 0.1, resist: 1 } }),
      gun(10, 6, 1.2, 3, 5, 270, 0, { type: "drone", calculator: "drone", shoot: { reload: 72, recoil: 0.25, shudder: 0.1, size: 0.84, health: 0.5, damage: 0.4, pen: 0.6, speed: 1.5, maxSpeed: 1, range: 1, density: 0.8, spray: 0.1, resist: 1 } }),
      gun(10, 6, 1.2, 3, -5, -90, 0, { type: "drone", calculator: "drone", shoot: { reload: 72, recoil: 0.25, shudder: 0.1, size: 0.84, health: 0.5, damage: 0.4, pen: 0.6, speed: 1.5, maxSpeed: 1, range: 1, density: 0.8, spray: 0.1, resist: 1 } }),
      gun(10, 6, 1.2, 3, -5, 90, 0, { type: "drone", calculator: "drone", shoot: { reload: 72, recoil: 0.25, shudder: 0.1, size: 0.84, health: 0.5, damage: 0.4, pen: 0.6, speed: 1.5, maxSpeed: 1, range: 1, density: 0.8, spray: 0.1, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.1,
    speed: 0.9,
    maxDrones: 40
  });

  def("landmine", {
    name: "Landmine",
    desc: "",
    guns: [],
    upgrades: [],
    needLevel: 45,
    speed: 1.2,
    health: 1.4,
    bodyDamage: 2.35,
    smasher: true
  });

  def("machinegunner", {
    name: "Machine Gunner",
    desc: "",
    guns: [
      gun(14, 3, 4, -3, 5, 0, 0.6, { shoot: { reload: 7, recoil: 0.14, shudder: 0.27, size: 1.2, health: 1.215, damage: 0.098437, pen: 1.25, speed: 4.8, maxSpeed: 0.52, range: 1, density: 1.5, spray: 67.5, resist: 1.2 } }),
      gun(14, 3, 4, -3, -5, 0, 0.8, { shoot: { reload: 7, recoil: 0.14, shudder: 0.27, size: 1.2, health: 1.215, damage: 0.098437, pen: 1.25, speed: 4.8, maxSpeed: 0.52, range: 1, density: 1.5, spray: 67.5, resist: 1.2 } }),
      gun(14, 3, 4, 0, -2.5, 0, 0.2, { shoot: { reload: 7, recoil: 0.14, shudder: 0.27, size: 1.2, health: 1.215, damage: 0.098437, pen: 1.25, speed: 4.8, maxSpeed: 0.52, range: 1, density: 1.5, spray: 67.5, resist: 1.2 } }),
      gun(14, 3, 4, 0, 2.5, 0, 0.4, { shoot: { reload: 7, recoil: 0.14, shudder: 0.27, size: 1.2, health: 1.215, damage: 0.098437, pen: 1.25, speed: 4.8, maxSpeed: 0.52, range: 1, density: 1.5, spray: 67.5, resist: 1.2 } }),
      gun(14, 3, 4, 3, 0, 0, 0, { shoot: { reload: 7, recoil: 0.14, shudder: 0.27, size: 1.2, health: 1.215, damage: 0.098437, pen: 1.25, speed: 4.8, maxSpeed: 0.52, range: 1, density: 1.5, spray: 67.5, resist: 1.2 } })
    ],
    upgrades: [],
    needLevel: 45,
    speed: 0.9
  });

  def("maleficitor", {
    name: "Maleficitor",
    desc: "",
    body: 4,
    guns: [
      gun(6, 12, 1.2, 7.4, 0, 0, 0, { type: "drone", calculator: "drone", shoot: { reload: 36, recoil: 0.25, shudder: 0.1, size: 0.882, health: 0.575, damage: 0.46, pen: 0.69, speed: 1.2, maxSpeed: 0.8, range: 1, density: 0.92, spray: 0.1, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.1,
    speed: 0.85,
    maxDrones: 20
  });

  def("medic", {
    name: "Medic",
    desc: "",
    guns: [
      gun(11, 9, -0.4, 14, 0, 0, 0, { type: "deco" }),
      gun(22, 10, 1, 0, 0, 0, 0, { type: "heal", shoot: { reload: 14.175, recoil: 0.7, shudder: 0.025, size: 1, health: 1, damage: -0.6, pen: 1.1, speed: 3.75, maxSpeed: 0.75, range: 1, density: 1.5, spray: 3, resist: 1.15 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.2,
    healer: true
  });

  def("mega3", {
    name: "Mega-3",
    desc: "",
    guns: [
      gun(22, 14, 1, 0, 0, 0, 0, { type: "auto", shoot: { reload: 18.9, recoil: 1.68, shudder: 0.05, size: 0.8, health: 0.9, damage: 0.9, pen: 1.2, speed: 4.675, maxSpeed: 0.8, range: 0.8, density: 1.95, spray: 15, resist: 1.4375 } }),
      gun(22, 14, 1, 0, 0, 120, 0, { type: "auto", shoot: { reload: 18.9, recoil: 1.68, shudder: 0.05, size: 0.8, health: 0.9, damage: 0.9, pen: 1.2, speed: 4.675, maxSpeed: 0.8, range: 0.8, density: 1.95, spray: 15, resist: 1.4375 } }),
      gun(22, 14, 1, 0, 0, 240, 0, { type: "auto", shoot: { reload: 18.9, recoil: 1.68, shudder: 0.05, size: 0.8, health: 0.9, damage: 0.9, pen: 1.2, speed: 4.675, maxSpeed: 0.8, range: 0.8, density: 1.95, spray: 15, resist: 1.4375 } })
    ],
    upgrades: [],
    needLevel: 45,
    speed: 0.95,
    auto: true
  });

  def("megasmash", {
    name: "Mega-Smasher",
    desc: "",
    guns: [],
    upgrades: [],
    needLevel: 45,
    fov: 1.1,
    speed: 1.05,
    health: 1.5,
    bodyDamage: 2.6,
    smasher: true
  });

  def("mortar", {
    name: "Mortar",
    desc: "",
    guns: [
      gun(13, 3, 1, 0, -8, -3.5, 0.6, { shoot: { reload: 15.75, recoil: 0.1225, shudder: 0.135, size: 0.99, health: 0.9, damage: 0.18375, pen: 1.35, speed: 5.175, maxSpeed: 0.88, range: 1, density: 2.25, spray: 27, resist: 1.2 } }),
      gun(13, 3, 1, 0, 8, 3.5, 0.8, { shoot: { reload: 15.75, recoil: 0.1225, shudder: 0.135, size: 0.99, health: 0.9, damage: 0.18375, pen: 1.35, speed: 5.175, maxSpeed: 0.88, range: 1, density: 2.25, spray: 27, resist: 1.2 } }),
      gun(17, 5, 1, 0, -5, -3.5, 0.2, { shoot: { reload: 15.75, recoil: 0.1225, shudder: 0.135, size: 0.99, health: 0.9, damage: 0.18375, pen: 1.35, speed: 5.175, maxSpeed: 0.88, range: 1, density: 2.25, spray: 27, resist: 1.2 } }),
      gun(17, 5, 1, 0, 5, 3.5, 0.4, { shoot: { reload: 15.75, recoil: 0.1225, shudder: 0.135, size: 0.99, health: 0.9, damage: 0.18375, pen: 1.35, speed: 5.175, maxSpeed: 0.88, range: 1, density: 2.25, spray: 27, resist: 1.2 } }),
      gun(19, 12, 1, 0, 0, 0, 0, { shoot: { reload: 25.2, recoil: 1.568, shudder: 0.1, size: 0.9, health: 1, damage: 1.5, pen: 1, speed: 4.8875, maxSpeed: 0.88, range: 1, density: 2.25, spray: 15, resist: 1.15 } })
    ],
    upgrades: [],
    needLevel: 45
  });

  def("nailgun", {
    name: "Nailgun",
    desc: "",
    guns: [
      gun(19, 3, 1, 0, -2, 0, 0.25, { shoot: { reload: 11.15625, recoil: 0.4375, shudder: 0.081, size: 0.704, health: 0.9, damage: 0.128625, pen: 1.6875, speed: 9, maxSpeed: 1.36, range: 1, density: 6, spray: 13.5, resist: 1.8 } }),
      gun(19, 3, 1, 0, 2, 0, 0.75, { shoot: { reload: 11.15625, recoil: 0.4375, shudder: 0.081, size: 0.704, health: 0.9, damage: 0.128625, pen: 1.6875, speed: 9, maxSpeed: 1.36, range: 1, density: 6, spray: 13.5, resist: 1.8 } }),
      gun(20, 2, 1, 0, 0, 0, 0, { shoot: { reload: 11.15625, recoil: 0.4375, shudder: 0.081, size: 1.056, health: 0.9, damage: 0.128625, pen: 1.6875, speed: 9, maxSpeed: 1.36, range: 1, density: 6, spray: 13.5, resist: 1.8 } }),
      gun(5.5, 7, -1.8, 6.5, 0, 0, 0, { type: "deco" })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.1,
    speed: 0.9
  });

  def("necromancer", {
    name: "Necromancer",
    desc: "",
    body: 4,
    guns: [
      gun(6, 12, 1.2, 7.4, 0, 0, 0.25, { type: "drone", calculator: "drone", shoot: { reload: 144, recoil: 0.25, shudder: 0.1, size: 0.84, health: 0.5, damage: 0.4, pen: 0.6, speed: 1.5, maxSpeed: 1, range: 1, density: 0.8, spray: 0.1, resist: 1 } }),
      gun(6, 12, 1.2, 7.4, 0, 90, 0, { type: "drone", calculator: "drone", shoot: { reload: 144, recoil: 0.25, shudder: 0.1, size: 0.84, health: 0.5, damage: 0.4, pen: 0.6, speed: 1.5, maxSpeed: 1, range: 1, density: 0.8, spray: 0.1, resist: 1 } }),
      gun(6, 12, 1.2, 7.4, 0, 180, 0.75, { type: "drone", calculator: "drone", shoot: { reload: 144, recoil: 0.25, shudder: 0.1, size: 0.84, health: 0.5, damage: 0.4, pen: 0.6, speed: 1.5, maxSpeed: 1, range: 1, density: 0.8, spray: 0.1, resist: 1 } }),
      gun(6, 12, 1.2, 7.4, 0, 270, 0.5, { type: "drone", calculator: "drone", shoot: { reload: 144, recoil: 0.25, shudder: 0.1, size: 0.84, health: 0.5, damage: 0.4, pen: 0.6, speed: 1.5, maxSpeed: 1, range: 1, density: 0.8, spray: 0.1, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.1,
    speed: 0.8,
    maxDrones: 14
  });

  def("nimrod", {
    name: "Nimrod",
    desc: "",
    guns: [
      gun(13, 6.5, 2.2, 0, 0, 0, 0, { type: "deco" }),
      gun(13, 6.4, 2.2, 5, 0, 0, 0, { type: "deco" }),
      gun(24, 8, 1, 0, 0, 0, 0, { shoot: { reload: 37.209375, recoil: 0.98, shudder: 0.025, size: 0.855, health: 16.666667, damage: 0.0324, pen: 3.3, speed: 8.25, maxSpeed: 1.2, range: 1, density: 2.16, spray: 3, resist: 1.45475 } }),
      gun(21, 11, 1, 0, 0, 0, 0.25, { shoot: { reload: 37.209375, recoil: 0.98, shudder: 0.025, size: 0.95, health: 8.333333, damage: 0.0648, pen: 2.2, speed: 8.25, maxSpeed: 1.2, range: 1, density: 1.8, spray: 3, resist: 1.3225 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.3,
    speed: 0.9
  });

  def("octo", {
    name: "Octo Tank",
    desc: "",
    guns: [
      gun(18, 8, 1, 0, 0, 45, 0.5, { shoot: { reload: 11.55, recoil: 2.016, shudder: 0.1, size: 1.05, health: 1.0404, damage: 0.541283, pen: 0.81, speed: 4.5, maxSpeed: 0.50575, range: 1, density: 1.44, spray: 15, resist: 1.05 } }),
      gun(18, 8, 1, 0, 0, 135, 0.5, { shoot: { reload: 11.55, recoil: 2.016, shudder: 0.1, size: 1.05, health: 1.0404, damage: 0.541283, pen: 0.81, speed: 4.5, maxSpeed: 0.50575, range: 1, density: 1.44, spray: 15, resist: 1.05 } }),
      gun(18, 8, 1, 0, 0, 225, 0.5, { shoot: { reload: 11.55, recoil: 2.016, shudder: 0.1, size: 1.05, health: 1.0404, damage: 0.541283, pen: 0.81, speed: 4.5, maxSpeed: 0.50575, range: 1, density: 1.44, spray: 15, resist: 1.05 } }),
      gun(18, 8, 1, 0, 0, 315, 0.5, { shoot: { reload: 11.55, recoil: 2.016, shudder: 0.1, size: 1.05, health: 1.0404, damage: 0.541283, pen: 0.81, speed: 4.5, maxSpeed: 0.50575, range: 1, density: 1.44, spray: 15, resist: 1.05 } }),
      gun(18, 8, 1, 0, 0, 0, 0, { shoot: { reload: 11.55, recoil: 2.016, shudder: 0.1, size: 1.05, health: 1.0404, damage: 0.541283, pen: 0.81, speed: 4.5, maxSpeed: 0.50575, range: 1, density: 1.44, spray: 15, resist: 1.05 } }),
      gun(18, 8, 1, 0, 0, 90, 0, { shoot: { reload: 11.55, recoil: 2.016, shudder: 0.1, size: 1.05, health: 1.0404, damage: 0.541283, pen: 0.81, speed: 4.5, maxSpeed: 0.50575, range: 1, density: 1.44, spray: 15, resist: 1.05 } }),
      gun(18, 8, 1, 0, 0, 180, 0, { shoot: { reload: 11.55, recoil: 2.016, shudder: 0.1, size: 1.05, health: 1.0404, damage: 0.541283, pen: 0.81, speed: 4.5, maxSpeed: 0.50575, range: 1, density: 1.44, spray: 15, resist: 1.05 } }),
      gun(18, 8, 1, 0, 0, 270, 0, { shoot: { reload: 11.55, recoil: 2.016, shudder: 0.1, size: 1.05, health: 1.0404, damage: 0.541283, pen: 0.81, speed: 4.5, maxSpeed: 0.50575, range: 1, density: 1.44, spray: 15, resist: 1.05 } })
    ],
    upgrades: [],
    needLevel: 45
  });

  def("ordnance", {
    name: "Ordnance",
    desc: "",
    guns: [
      gun(17, 5, 1, 0, -4.45, -7, 0.25, { shoot: { reload: 15.75, recoil: 0.245, shudder: 0.15, size: 0.99, health: 1, damage: 0.2625, pen: 1.35, speed: 5.175, maxSpeed: 0.88, range: 1, density: 2.25, spray: 22.5, resist: 1.2 } }),
      gun(17, 5, 1, 0, 4.45, 7, 0.75, { shoot: { reload: 15.75, recoil: 0.245, shudder: 0.15, size: 0.99, health: 1, damage: 0.2625, pen: 1.35, speed: 5.175, maxSpeed: 0.88, range: 1, density: 2.25, spray: 22.5, resist: 1.2 } }),
      gun(24, 8, 1, 0, 0, 0, 0, { shoot: { reload: 21.2625, recoil: 0.98, shudder: 0.025, size: 0.855, health: 2, damage: 0.27, pen: 1.65, speed: 8.25, maxSpeed: 1.2, range: 1, density: 2.16, spray: 3, resist: 1.45475 } }),
      gun(21, 11, 1, 0, 0, 0, 0.25, { shoot: { reload: 21.2625, recoil: 0.98, shudder: 0.025, size: 0.95, health: 1, damage: 0.54, pen: 1.1, speed: 8.25, maxSpeed: 1.2, range: 1, density: 1.8, spray: 3, resist: 1.3225 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.25,
    speed: 0.9
  });

  def("overdrive", {
    name: "Overdrive",
    desc: "",
    guns: [
      gun(6, 12, 1.2, 8, 0, 90, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } }),
      gun(6, 12, 1.2, 8, 0, -90, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.1,
    speed: 0.9,
    maxDrones: 8,
    auto: true
  });

  def("overgunner", {
    name: "Overgunner",
    desc: "",
    guns: [
      gun(19, 2, 1, 0, -2.5, 0, 0, { shoot: { reload: 13.125, recoil: 0.378, shudder: 0.081, size: 1.32, health: 0.918, damage: 0.148837, pen: 1.51875, speed: 6.3, maxSpeed: 0.8092, range: 1, density: 3.6, spray: 13.5, resist: 1.8 } }),
      gun(19, 2, 1, 0, 2.5, 0, 0.5, { shoot: { reload: 13.125, recoil: 0.378, shudder: 0.081, size: 1.32, health: 0.918, damage: 0.148837, pen: 1.51875, speed: 6.3, maxSpeed: 0.8092, range: 1, density: 3.6, spray: 13.5, resist: 1.8 } }),
      gun(12, 11, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(6, 11, 1.2, 8, 0, 125, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } }),
      gun(6, 11, 1.2, 8, 0, -125, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 45,
    maxDrones: 6
  });

  def("overlord", {
    name: "Overlord",
    desc: "",
    guns: [
      gun(6, 12, 1.2, 8, 0, 0, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } }),
      gun(6, 12, 1.2, 8, 0, 90, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } }),
      gun(6, 12, 1.2, 8, 0, 180, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } }),
      gun(6, 12, 1.2, 8, 0, 270, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.1,
    speed: 0.8,
    maxDrones: 8
  });

  def("paramedic", {
    name: "Paramedic",
    desc: "",
    guns: [
      gun(11, 6, -0.4, 8, 2, 18, 0, { type: "deco" }),
      gun(11, 6, -0.4, 8, -2, -18, 0, { type: "deco" }),
      gun(17, 8, 1, 0, 2, 18, 0.5, { type: "heal", shoot: { reload: 11.55, recoil: 0.35, shudder: 0.072, size: 1, health: 0.81, damage: -0.525, pen: 0.8, speed: 2.5, maxSpeed: 0.5, range: 1, density: 0.8, spray: 9, resist: 1 } }),
      gun(17, 8, 1, 0, -2, -18, 0.5, { type: "heal", shoot: { reload: 11.55, recoil: 0.35, shudder: 0.072, size: 1, health: 0.81, damage: -0.525, pen: 0.8, speed: 2.5, maxSpeed: 0.5, range: 1, density: 0.8, spray: 9, resist: 1 } }),
      gun(11, 9, -0.4, 11, 0, 0, 0, { type: "deco" }),
      gun(20, 10, 1, 0, 0, 0, 0, { type: "heal", shoot: { reload: 11.55, recoil: 0.35, shudder: 0.072, size: 1, health: 0.81, damage: -0.525, pen: 0.8, speed: 2.5, maxSpeed: 0.5, range: 1, density: 0.8, spray: 9, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 45,
    speed: 0.9,
    healer: true
  });

  def("penta", {
    name: "Penta Shot",
    desc: "",
    guns: [
      gun(16, 8, 1, 0, 3, 30, 0.6667, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.072, size: 1, health: 0.81, damage: 0.525, pen: 0.8, speed: 5, maxSpeed: 1, range: 1, density: 0.8, spray: 9, resist: 1 } }),
      gun(16, 8, 1, 0, -3, -30, 0.6667, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.072, size: 1, health: 0.81, damage: 0.525, pen: 0.8, speed: 5, maxSpeed: 1, range: 1, density: 0.8, spray: 9, resist: 1 } }),
      gun(19, 8, 1, 0, 2, 15, 0.3333, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.072, size: 1, health: 0.81, damage: 0.525, pen: 0.8, speed: 5, maxSpeed: 1, range: 1, density: 0.8, spray: 9, resist: 1 } }),
      gun(19, 8, 1, 0, -2, -15, 0.3333, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.072, size: 1, health: 0.81, damage: 0.525, pen: 0.8, speed: 5, maxSpeed: 1, range: 1, density: 0.8, spray: 9, resist: 1 } }),
      gun(22, 8, 1, 0, 0, 0, 0, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.072, size: 1, health: 0.81, damage: 0.525, pen: 0.8, speed: 5, maxSpeed: 1, range: 1, density: 0.8, spray: 9, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 45,
    speed: 0.85
  });

  def("phoenix", {
    name: "Phoenix",
    desc: "",
    guns: [
      gun(23, 7, 1, 0, 0, 0, 0, { shoot: { reload: 6.5625, recoil: 0.069552, shudder: 0.51, size: 1.1, health: 0.3213, damage: 0.074419, pen: 0.8505, speed: 4.68, maxSpeed: 0.47872, range: 0.9, density: 1.8, spray: 28.125, resist: 0.84 } }),
      gun(12, 10, 1.4, 8, 0, 0, 0, { shoot: { reload: 5.25, recoil: 0.24192, shudder: 0.17, size: 1, health: 0.6426, damage: 0.42525, pen: 0.9, speed: 5.2, maxSpeed: 0.5984, range: 0.9, density: 1.2, spray: 37.5, resist: 1 } }),
      gun(16, 8, 1, 0, 0, 153, 0.1, { shoot: { reload: 10.5, recoil: 1.134, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } }),
      gun(16, 8, 1, 0, 0, -153, 0.1, { shoot: { reload: 10.5, recoil: 1.134, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } }),
      gun(18, 8, 1, 0, 0, 180, 0.6, { shoot: { reload: 10.5, recoil: 1.134, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } })
    ],
    upgrades: [],
    needLevel: 45
  });

  def("poacher", {
    name: "Poacher",
    desc: "",
    guns: [
      gun(24, 8, 1, 0, 0, 0, 0, { shoot: { reload: 21.2625, recoil: 0.98, shudder: 0.025, size: 0.855, health: 2, damage: 0.27, pen: 1.65, speed: 8.25, maxSpeed: 1.2, range: 1, density: 2.16, spray: 3, resist: 1.45475 } }),
      gun(21, 11, 1, 0, 0, 0, 0.25, { shoot: { reload: 21.2625, recoil: 0.98, shudder: 0.025, size: 0.95, health: 1, damage: 0.54, pen: 1.1, speed: 8.25, maxSpeed: 1.2, range: 1, density: 1.8, spray: 3, resist: 1.3225 } }),
      gun(6, 11, 1.2, 8, 0, 180, 0, { type: "drone", calculator: "drone", shoot: { reload: 45, recoil: 0.25, shudder: 0.1, size: 0.51, health: 0.7, damage: 0.8, pen: 1, speed: 1.5, maxSpeed: 0.9, range: 1, density: 2, spray: 0.1, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.25,
    speed: 0.9,
    maxDrones: 3
  });

  def("predator", {
    name: "Predator",
    desc: "",
    guns: [
      gun(24, 8, 1, 0, 0, 0, 0, { shoot: { reload: 29.7675, recoil: 0.98, shudder: 0.025, size: 0.6156, health: 6, damage: 0.1215, pen: 2.97, speed: 7.425, maxSpeed: 1.08, range: 1, density: 2.592, spray: 3, resist: 1.600225 } }),
      gun(21, 11, 1, 0, 0, 0, 0.15, { shoot: { reload: 29.7675, recoil: 0.98, shudder: 0.025, size: 0.684, health: 3, damage: 0.243, pen: 1.98, speed: 7.425, maxSpeed: 1.08, range: 1, density: 2.16, spray: 3, resist: 1.45475 } }),
      gun(18, 14, 1, 0, 0, 0, 0.3, { shoot: { reload: 29.7675, recoil: 0.98, shudder: 0.025, size: 0.76, health: 1.5, damage: 0.486, pen: 1.32, speed: 7.425, maxSpeed: 1.08, range: 1, density: 1.8, spray: 3, resist: 1.3225 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.25,
    speed: 0.9
  });

  def("ranger", {
    name: "Ranger",
    desc: "",
    guns: [
      gun(32, 8, 1, 0, 0, 0, 0, { shoot: { reload: 23.38875, recoil: 1.4, shudder: 0.00625, size: 1, health: 1.15, damage: 0.6, pen: 1.21, speed: 8.85, maxSpeed: 1.77, range: 1, density: 4.5, spray: 3, resist: 1.495 } }),
      gun(13, 8, -2.2, 0, 0, 0, 0, { type: "deco" })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.5,
    speed: 0.8
  });

  def("redistributor", {
    name: "Redistributor",
    desc: "",
    guns: [
      gun(26, 7, 1, 0, 0, 0, 0.6667, { shoot: { reload: 6.5625, recoil: 0.322, shudder: 0.51, size: 1.1, health: 0.35, damage: 0.091875, pen: 0.945, speed: 4.5, maxSpeed: 0.64, range: 1, density: 1.5, spray: 28.125, resist: 0.84 } }),
      gun(23, 10, 1, 0, 0, 0, 0.3333, { shoot: { reload: 6.5625, recoil: 0.322, shudder: 0.51, size: 1.1, health: 0.35, damage: 0.091875, pen: 0.945, speed: 4.5, maxSpeed: 0.64, range: 1, density: 1.5, spray: 28.125, resist: 0.84 } }),
      gun(12, 10, 1.4, 8, 0, 0, 0, { shoot: { reload: 5.25, recoil: 1.12, shudder: 0.17, size: 1, health: 0.7, damage: 0.525, pen: 1, speed: 5, maxSpeed: 0.8, range: 1, density: 1, spray: 37.5, resist: 1 } })
    ],
    upgrades: [],
    needLevel: 45
  });

  def("revolver", {
    name: "Revolver",
    desc: "",
    guns: [
      gun(13, 7, 2.2, 5, 0, 0, 0, { type: "deco" }),
      gun(13, 7, 2.2, 0, 0, 0, 0, { type: "deco" }),
      gun(20, 12, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(24, 7, 1, 0, 0, 0, 0, { shoot: { reload: 19.845, recoil: 1.12, shudder: 0.0375, size: 1, health: 6.666667, damage: 0.0576, pen: 1.98, speed: 7.5, maxSpeed: 1.5, range: 1, density: 1.5, spray: 6, resist: 1.15 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.225
  });

  def("septatrapper", {
    name: "Septa-Trapper",
    desc: "",
    guns: [
      gun(15, 7, 1, 0, 0, 0, 0, { type: "deco" }),
      gun(3, 7, 1.7, 15, 0, 0, 0, { type: "trap", calculator: "trap", shoot: { reload: 29.9, recoil: 1, shudder: 0.3125, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 2.6, maxSpeed: 1, range: 0.5, density: 1, spray: 0, resist: 3 } }),
      gun(15, 7, 1, 0, 0, 51.4286, 0.3333, { type: "deco" }),
      gun(15, 7, 1, 0, 0, -51.4286, 0.3333, { type: "deco" }),
      gun(3, 7, 1.7, 15, 0, 51.4286, 0.3333, { type: "trap", calculator: "trap", shoot: { reload: 29.9, recoil: 1, shudder: 0.3125, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 2.6, maxSpeed: 1, range: 0.5, density: 1, spray: 0, resist: 3 } }),
      gun(3, 7, 1.7, 15, 0, -51.4286, 0.3333, { type: "trap", calculator: "trap", shoot: { reload: 29.9, recoil: 1, shudder: 0.3125, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 2.6, maxSpeed: 1, range: 0.5, density: 1, spray: 0, resist: 3 } }),
      gun(15, 7, 1, 0, 0, 102.8571, 0.6667, { type: "deco" }),
      gun(15, 7, 1, 0, 0, -102.8571, 0.6667, { type: "deco" }),
      gun(3, 7, 1.7, 15, 0, 102.8571, 0.6667, { type: "trap", calculator: "trap", shoot: { reload: 29.9, recoil: 1, shudder: 0.3125, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 2.6, maxSpeed: 1, range: 0.5, density: 1, spray: 0, resist: 3 } }),
      gun(3, 7, 1.7, 15, 0, -102.8571, 0.6667, { type: "trap", calculator: "trap", shoot: { reload: 29.9, recoil: 1, shudder: 0.3125, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 2.6, maxSpeed: 1, range: 0.5, density: 1, spray: 0, resist: 3 } }),
      gun(15, 7, 1, 0, 0, 154.2857, 1, { type: "deco" }),
      gun(15, 7, 1, 0, 0, -154.2857, 1, { type: "deco" }),
      gun(3, 7, 1.7, 15, 0, 154.2857, 1, { type: "trap", calculator: "trap", shoot: { reload: 29.9, recoil: 1, shudder: 0.3125, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 2.6, maxSpeed: 1, range: 0.5, density: 1, spray: 0, resist: 3 } }),
      gun(3, 7, 1.7, 15, 0, -154.2857, 1, { type: "trap", calculator: "trap", shoot: { reload: 29.9, recoil: 1, shudder: 0.3125, size: 0.7, health: 1, damage: 0.75, pen: 1, speed: 2.6, maxSpeed: 1, range: 0.5, density: 1, spray: 0, resist: 3 } })
    ],
    upgrades: [],
    needLevel: 45,
    speed: 0.8
  });

  def("sidewinder", {
    name: "Sidewinder",
    desc: "",
    guns: [
      gun(10, 11, -0.5, 14, 0, 0, 0, { type: "deco" }),
      gun(21, 12, -1.1, 0, 0, 0, 0, { type: "missile", shoot: { reload: 31.89375, recoil: 1.96, shudder: 0.025, size: 0.95, health: 1.5, damage: 0.486, pen: 1.1, speed: 1.2375, maxSpeed: 0.6, range: 1, density: 1.8, spray: 3, resist: 1.3225 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.3,
    speed: 0.8
  });

  def("single", {
    name: "Single",
    desc: "",
    guns: [
      gun(19, 8, 1, 0, 0, 0, 0, { shoot: { reload: 11.025, recoil: 1.4, shudder: 0.1, size: 1, health: 1, damage: 0.75, pen: 1, speed: 5.25, maxSpeed: 1, range: 1, density: 1, spray: 15, resist: 1 } }),
      gun(5.5, 8, -1.8, 6.5, 0, 0, 0, { type: "deco" })
    ],
    upgrades: [],
    needLevel: 45
  });

  def("skimmer", {
    name: "Skimmer",
    desc: "",
    guns: [
      gun(10, 14, -0.5, 9, 0, 0, 0, { type: "deco" }),
      gun(17, 15, 1, 0, 0, 0, 0, { type: "missile", shoot: { reload: 30.24, recoil: 0.87808, shudder: 0.08, size: 0.729, health: 1.35, damage: 1.2, pen: 2, speed: 4.777531, maxSpeed: 0.8228, range: 1, density: 3.375, spray: 15, resist: 1.265 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.15
  });

  def("spike", {
    name: "Spike",
    desc: "",
    body: 6,
    guns: [],
    upgrades: [],
    needLevel: 45,
    speed: 1.08,
    health: 1.45,
    bodyDamage: 2.8,
    smasher: true
  });

  def("spread", {
    name: "Spreadshot",
    desc: "",
    guns: [
      gun(13, 4, 1, 0, 0.8, 71.5, 0.8333, { shoot: { reload: 23.625, recoil: 0.1225, shudder: 0.03375, size: 0.99, health: 0.9, damage: 0.18375, pen: 1.35, speed: 3.6225, maxSpeed: 0.616, range: 1, density: 2.25, spray: 6.75, resist: 1.2 } }),
      gun(13, 4, 1, 0, -0.8, -71.5, 0.8333, { shoot: { reload: 23.625, recoil: 0.1225, shudder: 0.03375, size: 0.99, health: 0.9, damage: 0.18375, pen: 1.35, speed: 3.6225, maxSpeed: 0.616, range: 1, density: 2.25, spray: 6.75, resist: 1.2 } }),
      gun(14.5, 4, 1, 0, 1, 56.5, 0.6667, { shoot: { reload: 23.625, recoil: 0.1225, shudder: 0.03375, size: 0.99, health: 0.9, damage: 0.18375, pen: 1.35, speed: 3.6225, maxSpeed: 0.616, range: 1, density: 2.25, spray: 6.75, resist: 1.2 } }),
      gun(14.5, 4, 1, 0, -1, -56.5, 0.6667, { shoot: { reload: 23.625, recoil: 0.1225, shudder: 0.03375, size: 0.99, health: 0.9, damage: 0.18375, pen: 1.35, speed: 3.6225, maxSpeed: 0.616, range: 1, density: 2.25, spray: 6.75, resist: 1.2 } }),
      gun(16, 4, 1, 0, 1.2, 41.5, 0.5, { shoot: { reload: 23.625, recoil: 0.1225, shudder: 0.03375, size: 0.99, health: 0.9, damage: 0.18375, pen: 1.35, speed: 3.6225, maxSpeed: 0.616, range: 1, density: 2.25, spray: 6.75, resist: 1.2 } }),
      gun(16, 4, 1, 0, -1.2, -41.5, 0.5, { shoot: { reload: 23.625, recoil: 0.1225, shudder: 0.03375, size: 0.99, health: 0.9, damage: 0.18375, pen: 1.35, speed: 3.6225, maxSpeed: 0.616, range: 1, density: 2.25, spray: 6.75, resist: 1.2 } }),
      gun(17.5, 4, 1, 0, 1.4, 26.5, 0.3333, { shoot: { reload: 23.625, recoil: 0.1225, shudder: 0.03375, size: 0.99, health: 0.9, damage: 0.18375, pen: 1.35, speed: 3.6225, maxSpeed: 0.616, range: 1, density: 2.25, spray: 6.75, resist: 1.2 } }),
      gun(17.5, 4, 1, 0, -1.4, -26.5, 0.3333, { shoot: { reload: 23.625, recoil: 0.1225, shudder: 0.03375, size: 0.99, health: 0.9, damage: 0.18375, pen: 1.35, speed: 3.6225, maxSpeed: 0.616, range: 1, density: 2.25, spray: 6.75, resist: 1.2 } }),
      gun(19, 4, 1, 0, 1, 15, 0.1667, { shoot: { reload: 23.625, recoil: 0.1225, shudder: 0.03375, size: 0.99, health: 0.9, damage: 0.18375, pen: 1.35, speed: 3.6225, maxSpeed: 0.616, range: 1, density: 2.25, spray: 6.75, resist: 1.2 } }),
      gun(19, 4, 1, 0, -1, -15, 0.1667, { shoot: { reload: 23.625, recoil: 0.1225, shudder: 0.03375, size: 0.99, health: 0.9, damage: 0.18375, pen: 1.35, speed: 3.6225, maxSpeed: 0.616, range: 1, density: 2.25, spray: 6.75, resist: 1.2 } }),
      gun(20, 8, 1, 0, 0, 0, 0, { shoot: { reload: 24.6015, recoil: 0.56, shudder: 0.0125, size: 1, health: 0.5, damage: 1.5, pen: 1, speed: 5.720925, maxSpeed: 1.36416, range: 1, density: 1.5, spray: 3.75, resist: 1.15 } })
    ],
    upgrades: [],
    needLevel: 45
  });

  def("stalker", {
    name: "Stalker",
    desc: "",
    guns: [
      gun(27, 8, -1.77, 0, 0, 0, 0, { shoot: { reload: 23.38875, recoil: 1.4, shudder: 0.00625, size: 1, health: 1.15, damage: 0.6, pen: 1.21, speed: 8.85, maxSpeed: 1.77, range: 1, density: 4.5, spray: 3, resist: 1.495 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.35,
    speed: 0.85
  });

  def("streamliner", {
    name: "Streamliner",
    desc: "",
    guns: [
      gun(25, 8, 1, 0, 0, 0, 0, { shoot: { reload: 14.4375, recoil: 0.504, shudder: 0.1, size: 0.8, health: 0.55, damage: 0.219375, pen: 1.25, speed: 8.246, maxSpeed: 1, range: 1, density: 1.25, spray: 7.5, resist: 1.1 } }),
      gun(23, 8, 1, 0, 0, 0, 0.2, { shoot: { reload: 14.4375, recoil: 0.504, shudder: 0.1, size: 0.8, health: 0.55, damage: 0.219375, pen: 1.25, speed: 8.246, maxSpeed: 1, range: 1, density: 1.25, spray: 7.5, resist: 1.1 } }),
      gun(21, 8, 1, 0, 0, 0, 0.4, { shoot: { reload: 14.4375, recoil: 0.504, shudder: 0.1, size: 0.8, health: 0.55, damage: 0.219375, pen: 1.25, speed: 8.246, maxSpeed: 1, range: 1, density: 1.25, spray: 7.5, resist: 1.1 } }),
      gun(19, 8, 1, 0, 0, 0, 0.6, { shoot: { reload: 14.4375, recoil: 0.504, shudder: 0.1, size: 0.8, health: 0.55, damage: 0.219375, pen: 1.25, speed: 8.246, maxSpeed: 1, range: 1, density: 1.25, spray: 7.5, resist: 1.1 } }),
      gun(17, 8, 1, 0, 0, 0, 0.8, { shoot: { reload: 14.4375, recoil: 0.504, shudder: 0.1, size: 0.8, health: 0.55, damage: 0.219375, pen: 1.25, speed: 8.246, maxSpeed: 1, range: 1, density: 1.25, spray: 7.5, resist: 1.1 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.3
  });

  def("surfer", {
    name: "Surfer",
    desc: "",
    guns: [
      gun(18, 8, 1, 0, 0, 0, 0, { shoot: { reload: 10.5, recoil: 0.3024, shudder: 0.1, size: 1, health: 0.918, damage: 0.6075, pen: 0.9, speed: 5.2, maxSpeed: 0.748, range: 0.9, density: 1.2, spray: 15, resist: 1 } }),
      gun(7, 7.5, 0.6, 7, 1, -90, 0, { type: "swarm", calculator: "swarm", shoot: { reload: 23, recoil: 0.25, shudder: 0.05, size: 0.4, health: 1, damage: 0.75, pen: 1, speed: 4, maxSpeed: 1, range: 1, density: 1, spray: 5, resist: 1 } }),
      gun(7, 7.5, 0.6, 7, -1, 90, 0, { type: "swarm", calculator: "swarm", shoot: { reload: 23, recoil: 0.25, shudder: 0.05, size: 0.4, health: 1, damage: 0.75, pen: 1, speed: 4, maxSpeed: 1, range: 1, density: 1, spray: 5, resist: 1 } }),
      gun(16, 8, 1, 0, 0, 150, 0.1, { shoot: { reload: 10.5, recoil: 2.268, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } }),
      gun(16, 8, 1, 0, 0, -150, 0.1, { shoot: { reload: 10.5, recoil: 2.268, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } })
    ],
    upgrades: [],
    needLevel: 45
  });

  def("surgeon", {
    name: "Surgeon",
    desc: "",
    guns: [
      gun(5, 10, 1, 9.5, 0, 0, 0, { type: "deco" }),
      gun(3, 13, 1, 14.5, 0, 0, 0, { type: "deco" }),
      gun(1.5, 13, 1.3, 17, 0, 0, 0, { shoot: { reload: 25.3, recoil: 2, shudder: 0.025, size: 1.05, health: 2, damage: 0.75, pen: 1.25, speed: 6.435, maxSpeed: 1.935, range: 1.25, density: 1, spray: 0, resist: 3.75 } }),
      gun(11, 13, 1, 0, 0, 0, 0, { type: "deco" })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.15,
    speed: 0.75,
    maxDrones: 2,
    healer: true
  });

  def("swarmer", {
    name: "Swarmer",
    desc: "",
    guns: [
      gun(15, 13, -1.2, 5, 0, 0, 0, { shoot: { reload: 63, recoil: 3.2256, shudder: 0.05, size: 0.8, health: 1.4, damage: 0.405, pen: 1.2, speed: 2.125, maxSpeed: 0.288, range: 1, density: 3, spray: 15, resist: 3.45 } }),
      gun(15, 12, 1, 5, 0, 0, 0, { type: "deco" })
    ],
    upgrades: [],
    needLevel: 45
  });

  def("triplet", {
    name: "Triplet",
    desc: "",
    guns: [
      gun(17.5, 8, 1, 0, 5.5, 0, 0.5, { shoot: { reload: 12.6, recoil: 0.466667, shudder: 0.081, size: 1, health: 0.765, damage: 0.44625, pen: 0.9, speed: 5, maxSpeed: 1, range: 1, density: 1.1, spray: 16.2, resist: 0.95 } }),
      gun(17.5, 8, 1, 0, -5.5, 0, 0.5, { shoot: { reload: 12.6, recoil: 0.466667, shudder: 0.081, size: 1, health: 0.765, damage: 0.44625, pen: 0.9, speed: 5, maxSpeed: 1, range: 1, density: 1.1, spray: 16.2, resist: 0.95 } }),
      gun(21, 8, 1, 0, 0, 0, 0, { shoot: { reload: 12.6, recoil: 0.466667, shudder: 0.081, size: 1, health: 0.765, damage: 0.44625, pen: 0.9, speed: 5, maxSpeed: 1, range: 1, density: 1.1, spray: 16.2, resist: 0.95 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.05
  });

  def("triplex", {
    name: "Triplex",
    desc: "",
    guns: [
      gun(18, 7, -1.5, 0, 0, 0, 0, { shoot: { reload: 11.55, recoil: 0.7, shudder: 0.072, size: 1, health: 0.81, damage: 0.525, pen: 0.8, speed: 6.25, maxSpeed: 1.25, range: 1, density: 0.8, spray: 9, resist: 1 } }),
      gun(18, 7, -1.5, 0, 0, 45, 0.5, { shoot: { reload: 12.705, recoil: 0.7, shudder: 0, size: 1, health: 0.81, damage: 0.39375, pen: 0.8, speed: 2.5, maxSpeed: 1, range: 1.2, density: 0.8, spray: 0, resist: 1 } }),
      gun(18, 7, -1.5, 0, 0, -45, 0.5, { shoot: { reload: 12.705, recoil: 0.7, shudder: 0, size: 1, health: 0.81, damage: 0.39375, pen: 0.8, speed: 2.5, maxSpeed: 1, range: 1.2, density: 0.8, spray: 0, resist: 1 } }),
      gun(5, 5, -4, -4.75, -5, 45, 0, { type: "deco" }),
      gun(5, 5, -4, -4.75, 5, -45, 0.5, { type: "deco" }),
      gun(15.5, 3, -4, 0, 0, 22.5, 0, { type: "deco" }),
      gun(15.5, 3, -4, 0, 0, -22.5, 0.5, { type: "deco" })
    ],
    upgrades: [],
    needLevel: 45
  });

  def("twister", {
    name: "Twister",
    desc: "",
    guns: [
      gun(10, 13, -0.5, 9, 0, 0, 0, { type: "deco" }),
      gun(17, 14, -1.4, 0, 0, 0, 0, { type: "missile", shoot: { reload: 40.32, recoil: 0.87808, shudder: 0.008, size: 0.729, health: 1.35, damage: 1.2, pen: 2, speed: 2.866519, maxSpeed: 0.8228, range: 1, density: 3.375, spray: 15, resist: 1.265 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.1
  });

  def("vulture", {
    name: "Vulture",
    desc: "",
    guns: [
      gun(22, 7, -1.5, 0, 0, 0, 0, { shoot: { reload: 13.125, recoil: 0.18144, shudder: 0.1, size: 0.8, health: 0.5049, damage: 0.273375, pen: 1.125, speed: 6.916, maxSpeed: 0.748, range: 0.9, density: 1.5, spray: 7.5, resist: 1.1 } }),
      gun(20, 7.5, -1.5, 0, 0, 0, 0.3333, { shoot: { reload: 13.125, recoil: 0.18144, shudder: 0.1, size: 0.746667, health: 0.5049, damage: 0.273375, pen: 1.125, speed: 6.916, maxSpeed: 0.748, range: 0.9, density: 1.5, spray: 7.5, resist: 1.1 } }),
      gun(18, 8, -1.5, 0, 0, 0, 0.6667, { shoot: { reload: 13.125, recoil: 0.18144, shudder: 0.1, size: 0.7, health: 0.5049, damage: 0.273375, pen: 1.125, speed: 6.916, maxSpeed: 0.748, range: 0.9, density: 1.5, spray: 7.5, resist: 1.1 } }),
      gun(16, 8, 1, 0, 0, 153, 0.1, { shoot: { reload: 10.5, recoil: 1.134, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } }),
      gun(16, 8, 1, 0, 0, -153, 0.1, { shoot: { reload: 10.5, recoil: 1.134, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } }),
      gun(18, 8, 1, 0, 0, 180, 0.6, { shoot: { reload: 10.5, recoil: 1.134, shudder: 0.2, size: 1, health: 0.459, damage: 0.30375, pen: 0.63, speed: 4, maxSpeed: 0.68, range: 0.6, density: 1.2, spray: 7.5, resist: 0.7 } })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.2
  });

  def("xhunter", {
    name: "X-Hunter",
    desc: "",
    guns: [
      gun(24, 8, 1, 0, 0, 0, 0, { shoot: { reload: 21.2625, recoil: 0.98, shudder: 0.025, size: 0.855, health: 2, damage: 0.27, pen: 1.65, speed: 8.25, maxSpeed: 1.2, range: 1, density: 2.16, spray: 3, resist: 1.45475 } }),
      gun(21, 11, 1, 0, 0, 0, 0.25, { shoot: { reload: 21.2625, recoil: 0.98, shudder: 0.025, size: 0.95, health: 1, damage: 0.54, pen: 1.1, speed: 8.25, maxSpeed: 1.2, range: 1, density: 1.8, spray: 3, resist: 1.3225 } }),
      gun(12.5, 11, -1.65, 0, 0, 0, 0, { type: "deco" })
    ],
    upgrades: [],
    needLevel: 45,
    fov: 1.25,
    speed: 0.9
  });

  // Compatibility aliases for older Tankfield IDs
  if (tanks.doubletwin && !tanks.twinflank) {
    def("twinflank", { ...cloneDef(tanks.doubletwin), id: "twinflank", name: "Twin Flank", upgrades: tanks.doubletwin.upgrades.slice() });
  }
  if (tanks.hexatank && !tanks.quad) {
    // Keep classic Quad Tank (4-way) alongside Hexa Tank
    def("quad", {
      name: "Quad Tank",
      desc: "Fire in four directions",
      guns: [0, 90, 180, 270].map((a, i) => gun(18, 8, 1, 0, 0, a, i * 0.15, { layers: [g.basic, g.flankGuard] })),
      upgrades: ["octo", "cyclone"],
      needLevel: 30,
    });
  }
  if (!tanks.pelleter) {
    def("pelleter", {
      name: "Pelleter",
      desc: "Two small, fast barrels",
      guns: [
        gun(17, 6.5, 1, 0, 4.2, 0, 0, { layers: [g.basic, g.pelleter] }),
        gun(17, 6.5, 1, 0, -4.2, 0, 0.5, { layers: [g.basic, g.pelleter] }),
      ],
      upgrades: ["gunner", "nailgun", "borer"],
      needLevel: 15,
    });
  }

  // --- Mode bosses / specials retained from Tankfield ---

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

  def("rocketeer", {
    name: "Rocketeer",
    desc: "A faster missile with a tapered barrel",
    guns: [gun(16, 12, 0.7, 0, 0, 0, 0, { type: "missile", layers: [g.basic, g.pounder, g.launcher, { speed: 1.15, reload: 0.9 }] })],
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

  def("autosniper", {
    name: "Auto Assassin",
    desc: "Sniper turret on a spinning hull",
    auto: true,
    guns: [...G.sniper(24, [g.assassin]), ...G.auto()],
    fov: 1.3,
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


  const skipAuto = new Set(["ambulance", "architect", "arena_closer", "assault_guard", "auto2", "auto3", "auto4", "auto5", "auto8", "autoassassin", "autobuilder", "autocruiser", "autodouble", "autogunner", "autooverseer", "autosmasher", "autosniper", "autospawner", "autotriangle", "banshee", "celestial", "dom_gun", "dom_heal", "dom_idle", "elite_battleship", "elite_destroyer", "elite_gunner", "elite_skimmer", "elite_spawner", "elite_spinner", "elite_sprayer", "elite_trapguard", "enchantress", "engineer", "eternal", "exorcistor", "factory", "healer", "medic", "mega3", "mothership", "nest_guardian", "nest_keeper", "nest_warden", "paramedic", "rogue_armada", "rogue_palisade", "sanctuary", "sentry_gun", "sentry_swarm", "sentry_trap", "shaman", "sorcerer", "spawner", "summoner", "surgeon", "terrestrial", "witch"]);
  for (const id of Object.keys(tanks)) {
    const t = tanks[id];
    if (skipAuto.has(id) || t.auto || tanks["auto_" + id]) continue;
    if (!t.guns.some((g) => g.type === "bullet" || g.type === "trap" || g.type === "drone" || g.type === "swarm" || g.type === "minion" || g.type === "pillbox" || g.type === "heal" || g.type === "missile" || g.type === "auto")) {
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

  function copyBody(t) {
    return {
      body: t.body,
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
      smasher: t.smasher,
      necro: t.necro,
      healer: t.healer,
      spin: t.spin,
      mods: { ...(t.mods || {}) },
    };
  }

  function addArms(id, extra) {
    const t = tanks[id];
    if (!t) return;
    if (!t.armsUpgrades) t.armsUpgrades = [];
    for (const u of extra) {
      if (u && tanks[u] && u !== id && !t.upgrades.includes(u) && !t.armsUpgrades.includes(u)) t.armsUpgrades.push(u);
    }
  }

  function inherit(baseId, spec) {
    const t = tanks[baseId];
    if (!t) return null;
    const body = copyBody(t);
    return def(spec.id, {
      name: spec.name || t.name,
      desc: spec.desc != null ? spec.desc : "",
      body: spec.body != null ? spec.body : body.body,
      guns: spec.guns || cloneGuns(t.guns),
      upgrades: spec.upgrades || [],
      armsUpgrades: spec.armsUpgrades || [],
      needLevel: spec.needLevel != null ? spec.needLevel : Math.min(45, Math.max(30, t.needLevel || 15)),
      fov: spec.fov != null ? spec.fov : body.fov,
      speed: spec.speed != null ? spec.speed : body.speed,
      health: spec.health != null ? spec.health : body.health,
      bodyDamage: spec.bodyDamage != null ? spec.bodyDamage : body.bodyDamage,
      reload: spec.reload != null ? spec.reload : body.reload,
      bulletSpeed: spec.bulletSpeed != null ? spec.bulletSpeed : body.bulletSpeed,
      bulletDamage: spec.bulletDamage != null ? spec.bulletDamage : body.bulletDamage,
      bulletPen: spec.bulletPen != null ? spec.bulletPen : body.bulletPen,
      bulletSize: spec.bulletSize != null ? spec.bulletSize : body.bulletSize,
      maxDrones: spec.maxDrones != null ? spec.maxDrones : body.maxDrones,
      smasher: spec.smasher != null ? spec.smasher : body.smasher,
      auto: !!spec.auto,
      necro: spec.necro != null ? spec.necro : body.necro,
      healer: spec.healer != null ? spec.healer : body.healer,
      spin: spec.spin != null ? spec.spin : body.spin,
      mods: spec.mods || { ...body.mods },
      arms: true,
    });
  }

  function gunTypes(t) {
    return new Set((t.guns || []).map((item) => item.type));
  }

  function gunAngle(item) {
    return ((((item.pos && item.pos[5]) || 0) % 360) + 360) % 360;
  }

  function hasRear(t) {
    return (t.guns || []).some((item) => {
      if (item.type === "deco") return false;
      const a = gunAngle(item);
      return Math.min(Math.abs(a - 180), 360 - Math.abs(a - 180)) < 25;
    });
  }

  function offsetGuns(guns, dAng) {
    return cloneGuns(guns).map((item) => {
      const p = item.pos.slice();
      p[5] = (p[5] || 0) + dAng;
      item.pos = p;
      return item;
    });
  }

  function frontGuns(t) {
    return (t.guns || []).filter((item) => {
      const a = gunAngle(item);
      return Math.min(a, 360 - a) < 22;
    });
  }

  function trapAt(ang, y, delay, more) {
    return [
      gun(15, 8, 1, 0, y, ang, delay, { type: "deco" }),
      gun(3.25, 8, 1.7, 14, y, ang, delay, { type: "trap", layers: [g.trap, ...(more || [])], calculator: "trap" }),
    ];
  }

  function rearPellets() {
    return [
      gun(19, 2, 1, 0, -2.5, 180, 0, { layers: [g.basic, g.pelleter, g.power, g.twin] }),
      gun(19, 2, 1, 0, 2.5, 180, 0.5, { layers: [g.basic, g.pelleter, g.power, g.twin] }),
      gun(12, 11, 1, 0, 0, 180, 0, { type: "deco" }),
    ];
  }

  function gunnerAt(ang, extra) {
    const more = extra || [];
    return [
      gun(12, 3.5, 1, 0, 7.25, ang, 0.5, { layers: [g.basic, g.twin, g.gunner, ...more] }),
      gun(12, 3.5, 1, 0, -7.25, ang, 0.75, { layers: [g.basic, g.twin, g.gunner, ...more] }),
      gun(16, 3.5, 1, 0, 3.75, ang, 0, { layers: [g.basic, g.twin, g.gunner, ...more] }),
      gun(16, 3.5, 1, 0, -3.75, ang, 0.25, { layers: [g.basic, g.twin, g.gunner, ...more] }),
    ];
  }

  function makeAutoOf(id) {
    const t = tanks[id];
    if (!t || t.auto || tanks["auto_" + id]) return null;
    if (!(t.guns || []).some((item) => item.type !== "deco") && !t.smasher) return null;
    def("auto_" + id, {
      name: "Auto-" + t.name,
      desc: t.name + " with an auto turret",
      ...copyBody(t),
      guns: [...cloneGuns(t.guns), ...G.auto()],
      auto: true,
      upgrades: [],
      needLevel: Math.min(45, Math.max(15, t.needLevel)),
      arms: true,
    });
    addArms(id, ["auto_" + id]);
    return tanks["auto_" + id];
  }

  inherit("twin", {
    id: "wark",
    name: "Wark",
    desc: "Twin trap launchers",
    guns: [...trapAt(5, 5.5, 0), ...trapAt(-5, -5.5, 0.5)],
    needLevel: 30,
  });
  inherit("machinegun", {
    id: "diesel",
    name: "Diesel",
    desc: "Wider, heavier machine gun",
    guns: [gun(14, 12, 1.6, 8, 0, 0, 0, { layers: [g.basic, g.machineGun], spread: 0.3 })],
    reload: 0.85,
    needLevel: 30,
  });
  inherit("trapper", {
    id: "machinetrapper",
    name: "Machine Trapper",
    desc: "Fast, spread trap stream",
    guns: [
      gun(15, 9, 1.4, 0, 0, 0, 0, { type: "deco" }),
      gun(3, 13, 1.3, 15, 0, 0, 0, { type: "trap", layers: [g.trap, g.machineGun], calculator: "trap", spread: 0.18 }),
    ],
    needLevel: 30,
  });
  inherit("gunner", {
    id: "equalizer",
    name: "Equalizer",
    desc: "Gunner barrels that fire traps",
    guns: [
      gun(12, 3.5, 1, 0, 7.25, 0, 0.5, { type: "deco" }),
      gun(2, 3.5, 1.77, 12, 7.25, 0, 0.5, { type: "trap", layers: [g.trap, g.gunner], calculator: "trap" }),
      gun(12, 3.5, 1, 0, -7.25, 0, 0.75, { type: "deco" }),
      gun(2, 3.5, 1.77, 12, -7.25, 0, 0.75, { type: "trap", layers: [g.trap, g.gunner], calculator: "trap" }),
      gun(16, 3.5, 1, 0, 3.75, 0, 0, { type: "deco" }),
      gun(2, 3.5, 1.77, 16, 3.75, 0, 0, { type: "trap", layers: [g.trap, g.gunner], calculator: "trap" }),
      gun(16, 3.5, 1, 0, -3.75, 0, 0.25, { type: "deco" }),
      gun(2, 3.5, 1.77, 16, -3.75, 0, 0.25, { type: "trap", layers: [g.trap, g.gunner], calculator: "trap" }),
    ],
    needLevel: 45,
  });
  inherit("gunner", {
    id: "battery",
    name: "Battery",
    desc: "Five gunner barrels",
    guns: [
      ...gunnerAt(0),
      gun(20, 3.5, 1, 0, 0, 0, 0.1, { layers: [g.basic, g.twin, g.gunner, g.fast] }),
    ],
    needLevel: 45,
  });
  inherit("gunner", {
    id: "volley",
    name: "Volley",
    desc: "Fat gunner barrels",
    guns: [
      gun(12, 5, 1, 0, 7.25, 0, 0.5, { layers: [g.basic, g.twin, g.gunner] }),
      gun(12, 5, 1, 0, -7.25, 0, 0.75, { layers: [g.basic, g.twin, g.gunner] }),
      gun(16, 5, 1, 0, 3.75, 0, 0, { layers: [g.basic, g.twin, g.gunner] }),
      gun(16, 5, 1, 0, -3.75, 0, 0.25, { layers: [g.basic, g.twin, g.gunner] }),
    ],
    needLevel: 45,
  });
  inherit("gunner", {
    id: "rimfire",
    name: "Rimfire",
    desc: "Twin gunner with outer barrels",
    guns: [
      gun(18, 2, 1, 2, -2.5, 0, 0, { layers: [g.basic, g.twin, g.gunner] }),
      gun(18, 2, 1, 2, 2.5, 0, 0.5, { layers: [g.basic, g.twin, g.gunner] }),
      gun(12, 7, 1, 0, 5, 0, 0.25, { layers: [g.basic, g.twin] }),
      gun(12, 7, 1, 0, -5, 0, 0.75, { layers: [g.basic, g.twin] }),
      gun(12, 10, 1, 2, 0, 0, 0, { type: "deco" }),
    ],
    needLevel: 45,
  });
  inherit("assassin", {
    id: "buttbuttin",
    name: "Buttbuttin",
    desc: "Assassin with rear gunners",
    guns: [
      ...cloneGuns(tanks.assassin.guns),
      ...rearPellets(),
    ],
    needLevel: 45,
  });
  inherit("destroyer", {
    id: "blower",
    name: "Blower",
    desc: "Destroyer with rear gunners",
    guns: [
      ...cloneGuns(tanks.destroyer.guns),
      ...rearPellets(),
    ],
    needLevel: 45,
  });
  inherit("hexatank", {
    id: "deathstar",
    name: "Death Star",
    desc: "Six pounder guns",
    guns: [0, 60, 120, 180, 240, 300].map((a, i) => gun(20.5, 12, 1, 0, 0, a, i % 2 ? 0.5 : 0, { layers: [g.basic, g.pounder, g.flankGuard] })),
    needLevel: 45,
  });
  inherit("minigun", {
    id: "subverter",
    name: "Subverter",
    desc: "Pounder minigun stack",
    guns: [21, 19, 17].map((len, i) => gun(len, 14, 1, 0, 0, 0, i / 3, { layers: [g.basic, g.pounder, g.minigun] })),
    needLevel: 45,
  });
  inherit("smasher", {
    id: "bonker",
    name: "Bonker",
    desc: "Small, fast smasher",
    guns: [],
    smasher: true,
    speed: 1.32,
    health: 1.15,
    bodyDamage: 2,
    fov: 1.15,
    mods: { size: 0.72, speed: 1, health: 1, damage: 1, reload: 1, fov: 1 },
    needLevel: 45,
  });
  inherit("assassin", {
    id: "hitman",
    name: "Hitman",
    desc: "Assassin with a rear drone spawner",
    guns: [...cloneGuns(tanks.assassin.guns), ...G.director(180, [g.overseer])],
    maxDrones: Math.max(tanks.assassin.maxDrones || 0, 3),
    needLevel: 45,
  });
  inherit("sniper", {
    id: "sniper3",
    name: "Sniper-3",
    desc: "Three sniper barrels",
    guns: [-16, 0, 16].map((a, i) => gun(24, 8, 1, 0, 0, a, i * 0.2, { layers: [g.basic, g.sniper] })),
    needLevel: 30,
    fov: 1.25,
  });
  inherit("assassin", {
    id: "duo",
    name: "Duo",
    desc: "Twin assassin barrels",
    guns: [
      gun(27, 8, 1, 0, 4.4, 0, 0, { layers: [g.basic, g.sniper, g.assassin, g.twin] }),
      gun(27, 8, 1, 0, -4.4, 0, 0.5, { layers: [g.basic, g.sniper, g.assassin, g.twin] }),
      gun(13, 8, -2.2, 0, 0, 0, 0, { type: "deco" }),
    ],
    needLevel: 45,
  });
  inherit("wark", {
    id: "warkwark",
    name: "Warkwark",
    desc: "Wark front and back",
    guns: [...trapAt(5, 5.5, 0), ...trapAt(-5, -5.5, 0.5), ...trapAt(185, 5.5, 0), ...trapAt(-185, -5.5, 0.5)],
    needLevel: 45,
  });
  inherit("wark", {
    id: "megawark",
    name: "Mega Wark",
    desc: "Heavier twin traps",
    guns: [
      gun(16, 10, 1, 0, 5.8, 5, 0, { type: "deco" }),
      gun(4, 10, 1.7, 15, 5.8, 5, 0, { type: "trap", layers: [g.trap, g.setTrap], calculator: "trap" }),
      gun(16, 10, 1, 0, -5.8, -5, 0.5, { type: "deco" }),
      gun(4, 10, 1.7, 15, -5.8, -5, 0.5, { type: "trap", layers: [g.trap, g.setTrap], calculator: "trap" }),
    ],
    needLevel: 45,
  });
  inherit("diesel", {
    id: "dieseltrapper",
    name: "Diesel Trapper",
    desc: "Diesel gun with a trap launcher",
    guns: [
      gun(14, 12, 1.6, 8, 0, 0, 0, { layers: [g.basic, g.machineGun], spread: 0.28 }),
      ...G.trap(180),
    ],
    needLevel: 45,
  });
  inherit("wark", {
    id: "warklet",
    name: "Warklet",
    desc: "Triplet-style trap spread",
    guns: [...trapAt(0, 0, 0), ...trapAt(18, 6.2, 0.33), ...trapAt(-18, -6.2, 0.66)],
    needLevel: 45,
  });

  addArms("twin", ["wark"]);
  addArms("trapper", ["wark", "machinetrapper"]);
  addArms("machinegun", ["diesel", "machinetrapper"]);
  addArms("gunner", ["battery", "buttbuttin", "blower", "equalizer", "volley", "rimfire"]);
  addArms("assassin", ["buttbuttin", "hitman", "duo"]);
  addArms("destroyer", ["blower"]);
  addArms("hexatank", ["deathstar"]);
  addArms("pounder", ["subverter", "deathstar"]);
  addArms("minigun", ["subverter"]);
  addArms("smasher", ["bonker"]);
  addArms("sniper", ["sniper3"]);
  addArms("wark", ["warkwark", "megawark", "warklet"]);
  addArms("diesel", ["dieseltrapper"]);
  addArms("machinetrapper", ["equalizer", "dieseltrapper"]);
  addArms("battery", ["rimfire", "volley"]);

  const arSkip = new Set(skipAuto);
  ["mothership", "arena_closer", "sanctuary", "assault_guard", "basic"].forEach((id) => arSkip.add(id));
  const arParents = Object.keys(tanks).filter((id) => {
    const t = tanks[id];
    if (!t || t.arms || t.healer || t.smasher || t.auto) return false;
    if (arSkip.has(id) || id.startsWith("auto_") || id.startsWith("ar_")) return false;
    if ((t.needLevel || 1) < 15 || (t.needLevel || 1) > 45) return false;
    if (!(t.guns || []).some((item) => item.type !== "deco")) return false;
    return true;
  });

  for (const id of arParents) {
    const t = tanks[id];
    const types = gunTypes(t);
    const next = t.needLevel <= 15 ? 30 : 45;
    if (!types.has("trap") && !hasRear(t)) {
      const gid = "ar_guard_" + id;
      inherit(id, {
        id: gid,
        name: t.name + " Guard",
        desc: t.name + " with a rear trap launcher",
        guns: [...cloneGuns(t.guns), ...G.trap(180)],
        needLevel: next,
      });
      addArms(id, [gid]);
    }
    if (!types.has("drone") && !types.has("minion")) {
      const oid = "ar_over_" + id;
      inherit(id, {
        id: oid,
        name: "Over" + t.name.toLowerCase(),
        desc: t.name + " with side drone spawners",
        guns: [...cloneGuns(t.guns), ...G.director(125, [g.overseer]), ...G.director(-125, [g.overseer])],
        maxDrones: Math.max(t.maxDrones || 0, 6),
        needLevel: next,
      });
      addArms(id, [oid]);
    }
    if (!hasRear(t) && (t.guns || []).length <= 10) {
      const front = frontGuns(t);
      if (front.length) {
        const fid = "ar_flank_" + id;
        inherit(id, {
          id: fid,
          name: "Flank " + t.name,
          desc: t.name + " with a rear copy of its front guns",
          guns: [...cloneGuns(t.guns), ...offsetGuns(front, 180)],
          needLevel: next,
        });
        addArms(id, [fid]);
      }
    }
  }

  for (const id of Object.keys(tanks)) {
    const t = tanks[id];
    if (!t || arSkip.has(id)) continue;
    if (id.startsWith("auto_")) continue;
    const autoId = "auto_" + id;
    if (tanks[autoId]) {
      if (t.arms) tanks[autoId].arms = true;
      addArms(id, [autoId]);
    } else if (t.arms) {
      makeAutoOf(id);
    }
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
