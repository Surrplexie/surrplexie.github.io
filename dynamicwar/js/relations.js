(function (global) {
  "use strict";
  const DW = global.DynamicWar;

  const ALLY = -1, HOLD = 0, RIVAL = 1, WAR = 2;

  function emptyMatrix(n, fill) {
    return Array.from({ length: n }, () => new Float32Array(n).fill(fill));
  }

  class Relations {
    constructor(factions, rng) {
      this.count = factions.length;
      this.heat = emptyMatrix(this.count, 0);
      this.drift = emptyMatrix(this.count, 0);
      this.status = Array.from({ length: this.count }, () => new Int8Array(this.count).fill(HOLD));
      this.probeAt = emptyMatrix(this.count, 18 + rng.range(4, 14));
      this.shiftAt = emptyMatrix(this.count, rng.range(12, 28));
      for (let a = 0; a < this.count; a++) {
        for (let b = a + 1; b < this.count; b++) {
          const start = rng.range(0.18, 0.52);
          this.heat[a][b] = this.heat[b][a] = start;
          this.drift[a][b] = this.drift[b][a] = rng.range(-0.012, 0.018);
          this.refreshPair(a, b);
        }
      }
    }

    refreshPair(a, b) {
      const h = this.heat[a][b];
      let next = HOLD;
      if (h >= 0.78) next = WAR;
      else if (h >= 0.46) next = RIVAL;
      else if (h <= 0.16) next = ALLY;
      const prev = this.status[a][b];
      if (prev === WAR && h > 0.62) next = WAR;
      if (prev === ALLY && h < 0.28) next = ALLY;
      this.status[a][b] = this.status[b][a] = next;
    }

    stance(a, b) {
      if (a === b) return ALLY;
      return this.status[a][b];
    }

    atWar(a, b) {
      return this.stance(a, b) === WAR;
    }

    allied(a, b) {
      return a === b || this.stance(a, b) === ALLY;
    }

    hostile(a, b) {
      const s = this.stance(a, b);
      return s === RIVAL || s === WAR;
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
          if (dist < 120) {
            const add = (120 - dist) / 120;
            contact[a.faction][b.faction] += add;
            contact[b.faction][a.faction] += add;
          }
        }
      }

      for (let a = 0; a < n; a++) {
        for (let b = a + 1; b < n; b++) {
          const pressure = contact[a][b] + contact[b][a];
          this.shiftAt[a][b] -= dt;
          if (this.shiftAt[a][b] <= 0) {
            this.drift[a][b] = this.drift[b][a] = session.rng.range(-0.014, 0.02);
            this.shiftAt[a][b] = session.rng.range(16, 36);
          }
          this.heat[a][b] += this.drift[a][b] * dt;
          this.heat[a][b] += pressure * 0.01 * dt;
          if (this.stance(a, b) === WAR && pressure < 0.35) this.heat[a][b] -= 0.008 * dt;
          if (this.stance(a, b) === ALLY && pressure > 1.4) this.heat[a][b] += 0.01 * dt;
          this.heat[a][b] = Math.max(0, Math.min(1, this.heat[a][b]));
          this.heat[b][a] = this.heat[a][b];
          this.probeAt[a][b] -= dt;
          this.refreshPair(a, b);
        }
      }
    }

    shouldProbe(a, b) {
      return this.probeAt[a][b] <= 0 && this.stance(a, b) === RIVAL;
    }

    consumeProbe(a, b, rng) {
      this.probeAt[a][b] = this.probeAt[b][a] = rng.range(22, 48);
    }

    label(a, b) {
      const s = this.stance(a, b);
      return s === WAR ? "war" : s === RIVAL ? "rival" : s === ALLY ? "ally" : "hold";
    }
  }

  DW.Relations = Relations;
  DW.REL_ALLY = ALLY;
  DW.REL_HOLD = HOLD;
  DW.REL_RIVAL = RIVAL;
  DW.REL_TENSE = RIVAL;
  DW.REL_WAR = WAR;
})(window);
