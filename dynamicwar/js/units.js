(function (global) {
  "use strict";
  const DW = global.DynamicWar;

  function createArmy(config, map, rng) {
    const units = [];
    let id = 1;
    for (const faction of config.factions) {
      const base = map.nearestLand(faction.spawn[0] * config.worldWidth, faction.spawn[1] * config.worldHeight, rng);
      for (let i = 0; i < config.unitCount; i++) {
        const angle = rng.next() * Math.PI * 2;
        const radius = 22 + Math.sqrt(rng.next()) * 86;
        const p = map.nearestLand(base.x + Math.cos(angle) * radius, base.y + Math.sin(angle) * radius, rng);
        units.push({
          id: id++, faction: faction.id, x: p.x, y: p.y,
          vx: 0, vy: 0, targetX: p.x, targetY: p.y,
          health: 100, strength: rng.range(.82, 1.18),
          vision: config.unitVision * rng.range(.9, 1.12),
          speed: config.unitSpeed * rng.range(.88, 1.12),
          attackRange: config.unitAttackRange,
          job: i % 5 === 0 ? "defend" : "push",
          heading: angle,
          decisionIn: rng.range(0, config.decisionInterval),
          flash: 0, dead: false, kills: 0
        });
      }
    }
    return units;
  }

  let nextId = 1;
  function nextUnitId(units) {
    nextId = Math.max(nextId, ...units.map(u => u.id), 1) + 1;
    return nextId;
  }

  function makeUnit(faction, x, y, config, rng, player) {
    const angle = rng ? rng.next() * Math.PI * 2 : 0;
    return {
      id: 0, faction, x, y, vx: 0, vy: 0, targetX: x, targetY: y,
      health: 100, strength: rng ? rng.range(.82, 1.18) : 1,
      vision: config.unitVision * (rng ? rng.range(.9, 1.12) : 1),
      speed: config.unitSpeed * (rng ? rng.range(.88, 1.12) : 1),
      attackRange: config.unitAttackRange,
      job: player ? "player" : "push",
      heading: angle, decisionIn: rng ? rng.range(0, config.decisionInterval) : 0,
      flash: 0, dead: false, kills: 0, player: Boolean(player)
    };
  }

  function spawnPlayerUnit(session, x, y) {
    const p = session.map.nearestLand(x, y, session.rng);
    const unit = makeUnit(session.playerFaction, p.x, p.y, session.config, session.rng, true);
    unit.id = nextUnitId(session.units);
    session.units.push(unit);
    return unit;
  }

  function separateUnits(units, map, config) {
    const min = config.unitSpacing;
    for (let i = 0; i < units.length; i++) {
      const a = units[i];
      if (a.dead) continue;
      for (let j = i + 1; j < units.length; j++) {
        const b = units[j];
        if (b.dead) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const need = a.faction === b.faction ? min : min * 0.72;
        if (dist >= need) continue;
        const push = (need - dist) * 0.42 / dist;
        const ax = a.x - dx * push, ay = a.y - dy * push;
        const bx = b.x + dx * push, by = b.y + dy * push;
        if (map.isLand(ax, ay)) { a.x = ax; a.y = ay; }
        if (map.isLand(bx, by)) { b.x = bx; b.y = by; }
      }
    }
  }

  function updateMovement(unit, map, dt) {
    if (unit.dead) return;
    const dx = unit.targetX - unit.x, dy = unit.targetY - unit.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 4) {
      const desiredX = dx / dist * unit.speed, desiredY = dy / dist * unit.speed;
      unit.vx += (desiredX - unit.vx) * Math.min(1, dt * 2.6);
      unit.vy += (desiredY - unit.vy) * Math.min(1, dt * 2.6);
      const nx = unit.x + unit.vx * dt, ny = unit.y + unit.vy * dt;
      if (map.isLand(nx, ny)) { unit.x = nx; unit.y = ny; }
      else if (map.isLand(nx, unit.y)) { unit.x = nx; unit.vy *= 0.2; }
      else if (map.isLand(unit.x, ny)) { unit.y = ny; unit.vx *= 0.2; }
      else {
        unit.vx *= -.2; unit.vy *= -.2;
        const safe = map.nearestLand(unit.x, unit.y);
        unit.x = safe.x; unit.y = safe.y;
        unit.targetX = safe.x; unit.targetY = safe.y;
      }
    } else {
      unit.vx *= Math.max(0, 1 - dt * 5);
      unit.vy *= Math.max(0, 1 - dt * 5);
    }
    if (Math.hypot(unit.vx, unit.vy) > 2.5) unit.heading = Math.atan2(unit.vy, unit.vx);
    unit.flash = Math.max(0, unit.flash - dt * 4);
  }

  function resolveCombat(units, dt, rng, relations) {
    for (let i = 0; i < units.length; i++) {
      const a = units[i];
      if (a.dead) continue;
      for (let j = i + 1; j < units.length; j++) {
        const b = units[j];
        if (b.dead || a.faction === b.faction) continue;
        if (relations && !relations.atWar(a.faction, b.faction)) continue;
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist > Math.min(a.attackRange, b.attackRange)) continue;
        const coverA = .8 + rng.next() * .4, coverB = .8 + rng.next() * .4;
        a.health -= b.strength * coverB * 7.5 * dt;
        b.health -= a.strength * coverA * 7.5 * dt;
        a.flash = b.flash = .18;
        if (a.health <= 0) { a.dead = true; b.kills++; }
        if (b.health <= 0) { b.dead = true; a.kills++; }
      }
    }
  }

  DW.createArmy = createArmy;
  DW.spawnPlayerUnit = spawnPlayerUnit;
  DW.separateUnits = separateUnits;
  DW.updateMovement = updateMovement;
  DW.resolveCombat = resolveCombat;
})(window);
