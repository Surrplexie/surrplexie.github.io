(function (global) {
  "use strict";
  const DW = global.DynamicWar;

  function nearestEnemy(unit, units, maxRange, predicate) {
    let best = null, bestD2 = maxRange * maxRange;
    for (const other of units) {
      if (other.dead || other.faction === unit.faction) continue;
      if (predicate && !predicate(other)) continue;
      const dx = other.x - unit.x, dy = other.y - unit.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD2) { best = other; bestD2 = d2; }
    }
    return best;
  }

  function localCount(unit, units, faction, radius) {
    let n = 0;
    for (const other of units) {
      if (other.dead || other === unit) continue;
      if (faction != null && other.faction !== faction) continue;
      if (Math.hypot(other.x - unit.x, other.y - unit.y) < radius) n++;
    }
    return n;
  }

  function friendlyCenter(unit, units) {
    let x = 0, y = 0, n = 0;
    for (const other of units) {
      if (!other.dead && other.faction === unit.faction && Math.hypot(other.x - unit.x, other.y - unit.y) < 180) {
        x += other.x; y += other.y; n++;
      }
    }
    return n ? { x: x / n, y: y / n } : { x: unit.x, y: unit.y };
  }

  function enemyGradient(session, unit, x, y) {
    let enemy = 0;
    for (let f = 0; f < session.config.factions.length; f++) {
      if (f === unit.faction) continue;
      enemy = Math.max(enemy, session.influence.sample(f, x, y));
    }
    return enemy;
  }

  function chooseHoldPoint(unit, session) {
    const { config, map, influence, rng, relations } = session;
    let best = null, bestScore = -Infinity;
    const samples = unit.job === "defend" ? 22 : 30;
    for (let i = 0; i < samples; i++) {
      const angle = rng.next() * Math.PI * 2;
      const distance = rng.range(40, unit.job === "defend" ? 210 : 290);
      const x = unit.x + Math.cos(angle) * distance;
      const y = unit.y + Math.sin(angle) * distance;
      if (!map.isLand(x, y)) continue;
      const owner = influence.ownerAt(x, y);
      const mine = influence.sample(unit.faction, x, y);
      const enemy = enemyGradient(session, unit, x, y);
      const ownerScore = owner === unit.faction ? 0.55 : owner < 0 ? 0.9 : -0.35;
      let relationBias = 0;
      if (owner >= 0 && owner !== unit.faction) {
        const stance = relations.stance(unit.faction, owner);
        relationBias = stance === DW.REL_WAR ? 1.15 : stance === DW.REL_RIVAL ? 0.2 : stance === DW.REL_ALLY ? -1.8 : -0.9;
      }
      const holdLine = Math.abs(mine - enemy) < 0.35 ? 0.85 : 0;
      const score = ownerScore + relationBias + holdLine + enemy * 0.22 - distance / 1100 + rng.next() * 0.12;
      if (score > bestScore) { bestScore = score; best = { x, y }; }
    }
    return best;
  }

  function standoffFrom(unit, enemy, session, extra) {
    const dx = unit.x - enemy.x, dy = unit.y - enemy.y;
    const d = Math.hypot(dx, dy) || 1;
    const range = session.config.holdRange + extra;
    return session.map.nearestLand(
      enemy.x + (dx / d) * range,
      enemy.y + (dy / d) * range,
      session.rng
    );
  }

  function updateBot(unit, session, dt) {
    unit.decisionIn -= dt;
    if (unit.dead || unit.player || unit.decisionIn > 0) return;
    unit.decisionIn = session.config.decisionInterval * session.rng.range(0.75, 1.25);

    const relations = session.relations;
    const mine = session.influence.sample(unit.faction, unit.x, unit.y);
    let enemyPressure = 0;
    for (let f = 0; f < session.config.factions.length; f++) {
      if (f !== unit.faction) enemyPressure = Math.max(enemyPressure, session.influence.sample(f, unit.x, unit.y));
    }

    const nearby = nearestEnemy(unit, session.units, unit.vision * 1.35);
    const group = friendlyCenter(unit, session.units);
    const friends = localCount(unit, session.units, unit.faction, 90);
    const foes = nearby ? localCount(nearby, session.units, nearby.faction, 90) : 0;

    if (nearby) {
      const stance = relations.stance(unit.faction, nearby.faction);
      const dist = Math.hypot(unit.x - nearby.x, unit.y - nearby.y);

      if (stance === DW.REL_ALLY) {
        unit.targetX = unit.x + (group.x - unit.x) * 0.2;
        unit.targetY = unit.y + (group.y - unit.y) * 0.2;
        return;
      }

      if (unit.health < 32 || (stance === DW.REL_WAR && foes > friends + 2 && enemyPressure > mine)) {
        const retreat = standoffFrom(unit, nearby, session, 70);
        unit.targetX = retreat.x; unit.targetY = retreat.y;
        return;
      }

      if ((stance === DW.REL_HOLD || stance === DW.REL_RIVAL) && !relations.shouldProbe(unit.faction, nearby.faction)) {
        const hold = standoffFrom(unit, nearby, session, stance === DW.REL_HOLD ? 18 : 4);
        unit.targetX = hold.x + (group.x - unit.x) * 0.08;
        unit.targetY = hold.y + (group.y - unit.y) * 0.08;
        return;
      }

      if (stance === DW.REL_RIVAL && relations.shouldProbe(unit.faction, nearby.faction)) {
        relations.consumeProbe(unit.faction, nearby.faction, session.rng);
        unit.targetX = nearby.x + (group.x - unit.x) * 0.1;
        unit.targetY = nearby.y + (group.y - unit.y) * 0.1;
        return;
      }

      if (stance === DW.REL_WAR && unit.health > 42 && friends >= foes - 1) {
        if (dist > unit.attackRange * 0.85) {
          unit.targetX = nearby.x + (group.x - unit.x) * 0.14;
          unit.targetY = nearby.y + (group.y - unit.y) * 0.14;
        } else {
          const hold = standoffFrom(unit, nearby, session, -6);
          unit.targetX = hold.x; unit.targetY = hold.y;
        }
        return;
      }
    }

    const frontier = chooseHoldPoint(unit, session);
    if (frontier) {
      unit.targetX = frontier.x + (group.x - unit.x) * 0.12;
      unit.targetY = frontier.y + (group.y - unit.y) * 0.12;
    } else {
      const home = session.config.factions[unit.faction].spawn;
      const p = session.map.nearestLand(home[0] * session.config.worldWidth, home[1] * session.config.worldHeight, session.rng);
      unit.targetX = p.x; unit.targetY = p.y;
    }
  }

  DW.updateBot = updateBot;
})(window);
