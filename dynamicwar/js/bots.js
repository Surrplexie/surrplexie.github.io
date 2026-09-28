(function (global) {
  "use strict";
  const DW = global.DynamicWar;

  function nearestEnemy(unit, units, maxRange) {
    let best = null, bestD2 = maxRange * maxRange;
    for (const other of units) {
      if (other.dead || other.faction === unit.faction) continue;
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

  function slotAlongFront(unit, session) {
    const front = session.influence.fronts && session.influence.fronts[unit.faction];
    if (!front || !front.length) return null;
    const friends = session.units.filter(u => !u.dead && u.faction === unit.faction && !u.player);
    const idx = Math.max(0, friends.findIndex(u => u.id === unit.id));
    const slot = front[idx % front.length];
    const spread = (idx % 5) - 2;
    const along = 7 * spread;
    return session.map.nearestLand(slot.x + along, slot.y + along * 0.15, session.rng);
  }

  function chooseHoldPoint(unit, session) {
    const lined = slotAlongFront(unit, session);
    if (lined) return lined;
    const { map, influence, rng, relations } = session;
    let best = null, bestScore = -Infinity;
    for (let i = 0; i < 24; i++) {
      const angle = rng.next() * Math.PI * 2;
      const distance = rng.range(30, 240);
      const x = unit.x + Math.cos(angle) * distance;
      const y = unit.y + Math.sin(angle) * distance;
      if (!map.isLand(x, y)) continue;
      const owner = influence.ownerAt(x, y);
      const nearest = influence.nearestFront(unit.faction, x, y);
      let score = nearest ? 1.8 - nearest.dist / 400 : 0;
      if (owner === unit.faction) score += 0.35;
      if (owner >= 0 && owner !== unit.faction) {
        const stance = relations.stance(unit.faction, owner);
        score += stance === DW.REL_WAR ? 1.1 : stance === DW.REL_RIVAL ? 0.25 : -1.2;
      }
      score += rng.next() * 0.08;
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
    unit.decisionIn = session.config.decisionInterval * session.rng.range(0.8, 1.2);

    const relations = session.relations;
    const nearby = nearestEnemy(unit, session.units, unit.vision * 1.2);
    const friends = localCount(unit, session.units, unit.faction, 70);
    const foes = nearby ? localCount(nearby, session.units, nearby.faction, 70) : 0;

    if (nearby) {
      const stance = relations.stance(unit.faction, nearby.faction);
      const dist = Math.hypot(unit.x - nearby.x, unit.y - nearby.y);

      if (stance === DW.REL_ALLY) {
        const line = slotAlongFront(unit, session) || { x: unit.x, y: unit.y };
        unit.targetX = line.x; unit.targetY = line.y;
        return;
      }

      if (unit.health < 28 && stance === DW.REL_WAR) {
        const retreat = standoffFrom(unit, nearby, session, 40);
        unit.targetX = retreat.x; unit.targetY = retreat.y;
        return;
      }

      if (stance === DW.REL_HOLD || (stance === DW.REL_RIVAL && !relations.shouldProbe(unit.faction, nearby.faction))) {
        const hold = standoffFrom(unit, nearby, session, stance === DW.REL_HOLD ? 8 : 2);
        const line = slotAlongFront(unit, session);
        unit.targetX = line ? line.x * 0.65 + hold.x * 0.35 : hold.x;
        unit.targetY = line ? line.y * 0.65 + hold.y * 0.35 : hold.y;
        return;
      }

      if (stance === DW.REL_RIVAL && relations.shouldProbe(unit.faction, nearby.faction)) {
        relations.consumeProbe(unit.faction, nearby.faction, session.rng);
        unit.targetX = nearby.x;
        unit.targetY = nearby.y;
        return;
      }

      if (stance === DW.REL_WAR) {
        if (friends + 1 >= foes && dist > unit.attackRange * 0.9) {
          unit.targetX = nearby.x;
          unit.targetY = nearby.y;
        } else {
          const hold = standoffFrom(unit, nearby, session, 2);
          unit.targetX = hold.x; unit.targetY = hold.y;
        }
        return;
      }
    }

    const frontier = chooseHoldPoint(unit, session);
    if (frontier) {
      unit.targetX = frontier.x;
      unit.targetY = frontier.y;
    } else {
      const home = session.config.factions[unit.faction].spawn;
      const p = session.map.nearestLand(home[0] * session.config.worldWidth, home[1] * session.config.worldHeight, session.rng);
      unit.targetX = p.x; unit.targetY = p.y;
    }
  }

  DW.updateBot = updateBot;
})(window);
