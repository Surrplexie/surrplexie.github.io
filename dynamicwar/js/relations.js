(function (global) {
  "use strict";
  const DW = global.DynamicWar;

  const RELAX = 0, TENSE = 1, WAR = 2;

  function emptyMatrix(n, fill) {
    return Array.from({ length: n }, () => new Float32Array(n).fill(fill));
  }

  class Relations {
    constructor(factions, rng) {
      this.count = factions.length;
      this.heat = emptyMatrix(this.count, 0);
      this.status = Array.from({ length: this.count }, () => new Int8Array(this.count).fill(RELAX));
      this.probeAt = emptyMatrix(this.count, 18 + rng.range(4, 14));
      for (let a = 0; a < this.count; a++) {
        for (let b = a + 1; b < this.count; b++) {
          const bias = rng.range(0.08, 0.28);
          this.heat[a][b] = this.heat[b][a] = bias;
          this.refreshPair(a, b);
        }
      }
    }

    refreshPair(a, b) {
      const h = this.heat[a][b];
      const next = h >= 0.78 ? WAR : h >= 0.42 ? TENSE : RELAX;
      this.status[a][b] = this.status[b][a] = next;
    }

    stance(a, b) {
      if (a === b) return RELAX;
      return this.status[a][b];
    }

    atWar(a, b) {
      return this.stance(a, b) === WAR;
    }

    update(session, dt) {
      const n = this.count;
      const contact = emptyMatrix(n, 0);
      const units = session.units;
      for (let i = 0; i < units.length; i++) {
        const a = units[i];
        if (a.dead) continue;
        for (let j = i + 1; j < units.length; j++) {
          const b = units[j];
          if (b.dead || a.faction === b.faction) continue;
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 110) contact[a.faction][b.faction] += (110 - dist) / 110;
          if (dist < 110) contact[b.faction][a.faction] += (110 - dist) / 110;
        }
      }

      for (let a = 0; a < n; a++) {
        for (let b = a + 1; b < n; b++) {
          const pressure = contact[a][b] + contact[b][a];
          this.heat[a][b] += pressure * 0.012 * dt;
          this.heat[a][b] -= 0.016 * dt;
          if (this.stance(a, b) === WAR && pressure < 0.4) this.heat[a][b] -= 0.01 * dt;
          this.heat[a][b] = Math.max(0, Math.min(1, this.heat[a][b]));
          this.heat[b][a] = this.heat[a][b];
          this.probeAt[a][b] -= dt;
          this.refreshPair(a, b);
        }
      }
    }

    shouldProbe(a, b) {
      return this.probeAt[a][b] <= 0 && this.stance(a, b) === TENSE;
    }

    consumeProbe(a, b, rng) {
      this.probeAt[a][b] = this.probeAt[b][a] = rng.range(22, 48);
    }

    label(a, b) {
      const s = this.stance(a, b);
      return s === WAR ? "war" : s === TENSE ? "tense" : "hold";
    }
  }

  DW.Relations = Relations;
  DW.REL_HOLD = RELAX;
  DW.REL_TENSE = TENSE;
  DW.REL_WAR = WAR;
})(window);
