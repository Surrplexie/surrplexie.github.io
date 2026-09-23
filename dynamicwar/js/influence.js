(function (global) {
  "use strict";
  const DW = global.DynamicWar;

  class InfluenceField {
    constructor(config, map) {
      this.config = config;
      this.map = map;
      this.w = config.gridWidth;
      this.h = config.gridHeight;
      this.count = config.factions.length;
      this.values = Array.from({ length: this.count }, () => new Float32Array(this.w * this.h));
      this.owner = new Int8Array(this.w * this.h).fill(-1);
      this.pending = new Int8Array(this.w * this.h).fill(-1);
      this.pendingTime = new Float32Array(this.w * this.h);
      this.land = new Uint8Array(this.w * this.h);
      this.city = new Int16Array(this.w * this.h).fill(-1);
      this.shares = new Float32Array(this.count);
      this.cities = (map.cities || []).map(c => ({ name: c.name, x: c.x, y: c.y, owner: -1 }));
      const radius = config.cityHoldRadius || 52;
      for (let y = 0; y < this.h; y++) {
        for (let x = 0; x < this.w; x++) {
          const wx = (x + .5) / this.w * config.worldWidth;
          const wy = (y + .5) / this.h * config.worldHeight;
          const i = y * this.w + x;
          this.land[i] = map.isLand(wx, wy) ? 1 : 0;
          let best = -1, bestD = radius;
          this.cities.forEach((city, idx) => {
            const d = Math.hypot(city.x - wx, city.y - wy);
            if (d < bestD) { best = idx; bestD = d; }
          });
          this.city[i] = best;
        }
      }
    }

    reset() {
      this.values.forEach(v => v.fill(0));
      this.owner.fill(-1);
      this.pending.fill(-1);
      this.pendingTime.fill(0);
      this.shares.fill(0);
    }

    sampleBilinear(grid, wx, wy) {
      const gx = wx / this.config.worldWidth * this.w - 0.5;
      const gy = wy / this.config.worldHeight * this.h - 0.5;
      const x0 = Math.max(0, Math.min(this.w - 1, Math.floor(gx)));
      const y0 = Math.max(0, Math.min(this.h - 1, Math.floor(gy)));
      const x1 = Math.min(this.w - 1, x0 + 1);
      const y1 = Math.min(this.h - 1, y0 + 1);
      const tx = gx - x0, ty = gy - y0;
      const a = grid[y0 * this.w + x0], b = grid[y0 * this.w + x1];
      const c = grid[y1 * this.w + x0], d = grid[y1 * this.w + x1];
      return a * (1 - tx) * (1 - ty) + b * tx * (1 - ty) + c * (1 - tx) * ty + d * tx * ty;
    }

    sample(faction, wx, wy) {
      return this.sampleBilinear(this.values[faction], wx, wy);
    }

    ownerAt(wx, wy) {
      const i = this.cellIndex(wx, wy);
      return this.land[i] ? this.owner[i] : -1;
    }

    cellIndex(wx, wy) {
      const x = Math.max(0, Math.min(this.w - 1, Math.floor(wx / this.config.worldWidth * this.w)));
      const y = Math.max(0, Math.min(this.h - 1, Math.floor(wy / this.config.worldHeight * this.h)));
      return y * this.w + x;
    }

    update(units, dt, rng) {
      const fade = Math.exp(-this.config.influenceDecay * dt);
      const keep = this.config.occupyKeep;
      const occupied = new Uint8Array(this.cities.length);
      for (const unit of units) {
        if (unit.dead) continue;
        this.cities.forEach((city, idx) => {
          if (Math.hypot(city.x - unit.x, city.y - unit.y) < this.config.cityHoldRadius) occupied[idx] = 1;
        });
      }

      this.values.forEach((grid, faction) => {
        for (let i = 0; i < grid.length; i++) {
          if (!this.land[i]) { grid[i] = 0; continue; }
          const cityIdx = this.city[i];
          const cityHeld = cityIdx >= 0 && occupied[cityIdx] && this.owner[i] === faction;
          if (this.owner[i] === faction && (cityHeld || grid[i] >= keep * 0.5)) {
            grid[i] = Math.max(grid[i] * fade, keep);
          } else {
            grid[i] *= fade;
          }
        }
      });

      const cellW = this.config.worldWidth / this.w;
      const cellH = this.config.worldHeight / this.h;
      for (const unit of units) {
        if (unit.dead) continue;
        const cx = unit.x / cellW, cy = unit.y / cellH;
        const rx = unit.vision / cellW, ry = unit.vision / cellH;
        const minX = Math.max(0, Math.floor(cx - rx)), maxX = Math.min(this.w - 1, Math.ceil(cx + rx));
        const minY = Math.max(0, Math.floor(cy - ry)), maxY = Math.min(this.h - 1, Math.ceil(cy + ry));
        const grid = this.values[unit.faction];
        const stamp = this.config.occupyStamp * unit.strength * dt;
        for (let gy = minY; gy <= maxY; gy++) {
          for (let gx = minX; gx <= maxX; gx++) {
            const i = gy * this.w + gx;
            if (!this.land[i]) continue;
            const dx = (gx + .5 - cx) / rx, dy = (gy + .5 - cy) / ry;
            const d2 = dx * dx + dy * dy;
            if (d2 <= 1) grid[i] = Math.max(grid[i], (1 - d2) * stamp + keep);
          }
        }
      }

      this.resolveOwners(dt, rng, occupied);
    }

    resolveOwners(dt, rng, occupied) {
      this.shares.fill(0);
      let controlled = 0;
      for (let i = 0; i < this.owner.length; i++) {
        if (!this.land[i]) continue;
        let best = -1, bestValue = 0, second = 0, total = 0;
        for (let f = 0; f < this.count; f++) {
          const v = this.values[f][i];
          total += v;
          if (v > bestValue) { second = bestValue; bestValue = v; best = f; }
          else if (v > second) second = v;
        }

        const cityIdx = this.city[i];
        const cityHeld = cityIdx >= 0 && occupied[cityIdx];
        let candidate = this.owner[i];
        const captured = total > .08 && bestValue / total >= this.config.captureThreshold &&
          bestValue - second >= this.config.captureMargin;
        if (captured) candidate = best;

        const isolated = cityIdx < 0 && !captured && total < this.config.occupyKeep * 0.35;
        if (isolated && rng && rng.next() < this.config.revoltChance * dt) {
          candidate = -1;
          this.values.forEach(grid => { grid[i] *= 0.15; });
        }

        if (candidate !== this.owner[i]) {
          if (this.pending[i] !== candidate) {
            this.pending[i] = candidate;
            this.pendingTime[i] = 0;
          } else {
            this.pendingTime[i] += dt;
            const wait = cityHeld ? this.config.captureDelay * 1.8 : this.config.captureDelay;
            if (this.pendingTime[i] >= wait) {
              this.owner[i] = candidate;
              this.pendingTime[i] = 0;
            }
          }
        } else {
          this.pending[i] = candidate;
          this.pendingTime[i] = 0;
        }
        if (this.owner[i] >= 0) {
          this.shares[this.owner[i]]++;
          controlled++;
        }
      }
      this.cities.forEach(city => { city.owner = this.ownerAt(city.x, city.y); });
      if (controlled) for (let f = 0; f < this.count; f++) this.shares[f] /= controlled;
    }
  }

  DW.InfluenceField = InfluenceField;
})(window);
