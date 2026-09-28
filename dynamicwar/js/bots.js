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

  function stickFront(unit, session) {
    const found = session.influence.nearestFront(unit.faction, unit.x, unit.y);
    if (!found) return null;
    const p = found.point;
    if (unit.frontX == null || found.dist < 90 ||
        Math.hypot(unit.frontX - p.x, unit.frontY - p.y) > 70) {
      unit.frontX = p.x;
      unit.frontY = p.y;
    }
    return session.map.nearestLand(unit.frontX, unit.frontY, session.rng);
  }

  function chooseHoldPoint(unit, session) {
    const lined = stickFront(unit, session);
    if (lined) return lined;
    const { map, influence, rng } = session;
    let best = null, bestScore = -Infinity;
    for (let i = 0; i < 16; i++) {
      const angle = rng.next() * Math.PI * 2;
      const distance = rng.range(40, 180);
      const x = unit.x + Math.cos(angle) * distance;
      const y = unit.y + Math.sin(angle) * distance;
      if (!map.isLand(x, y)) continue;
      const nearest = influence.nearestFront(unit.faction, x, y);
      const score = (nearest ? 1.6 - nearest.dist / 500 : 0) + rng.next() * 0.04;
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

  function setTarget(unit, x, y) {
    const d = Math.hypot(x - unit.targetX, y - unit.targetY);
    if (d < 18) return;
    unit.targetX = x;
    unit.targetY = y;
  }

  function updateBot(unit, session, dt) {
    unit.decisionIn -= dt;
    if (unit.dead || unit.player || unit.decisionIn > 0) return;
    unit.decisionIn = session.config.decisionInterval * session.rng.range(0.9, 1.15);

    const relations = session.relations;
    const nearby = nearestEnemy(unit, session.units, unit.vision * 1.15);
    const line = stickFront(unit, session);

    if (nearby) {
      const stance = relations.stance(unit.faction, nearby.faction);
      const dist = Math.hypot(unit.x - nearby.x, unit.y - nearby.y);

      if (stance === DW.REL_ALLY) {
        if (line) setTarget(unit, line.x, line.y);
        return;
      }

      if (unit.health < 28 && stance === DW.REL_WAR) {
        const retreat = standoffFrom(unit, nearby, session, 48);
        setTarget(unit, retreat.x, retreat.y);
        return;
      }

      if (stance === DW.REL_HOLD || (stance === DW.REL_RIVAL && !relations.shouldProbe(unit.faction, nearby.faction))) {
        const hold = standoffFrom(unit, nearby, session, stance === DW.REL_HOLD ? 10 : 4);
        if (line) setTarget(unit, line.x * 0.7 + hold.x * 0.3, line.y * 0.7 + hold.y * 0.3);
        else setTarget(unit, hold.x, hold.y);
        return;
      }

      if (stance === DW.REL_RIVAL && relations.shouldProbe(unit.faction, nearby.faction)) {
        relations.consumeProbe(unit.faction, nearby.faction, session.rng);
        setTarget(unit, nearby.x, nearby.y);
        return;
      }

      if (stance === DW.REL_WAR) {
        if (dist > unit.attackRange * 1.15) setTarget(unit, nearby.x, nearby.y);
        else {
          const hold = standoffFrom(unit, nearby, session, 4);
          setTarget(unit, hold.x, hold.y);
        }
        return;
      }
    }

    const frontier = chooseHoldPoint(unit, session);
    if (frontier) setTarget(unit, frontier.x, frontier.y);
    else {
      const home = session.config.factions[unit.faction].spawn;
      const p = session.map.nearestLand(home[0] * session.config.worldWidth, home[1] * session.config.worldHeight, session.rng);
      setTarget(unit, p.x, p.y);
    }
  }

  DW.updateBot = updateBot;
})(window);
