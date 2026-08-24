/** Seeded PRNG (mulberry32) + Box–Muller normals for GBM steps. */
(function (global) {
  function SeededRandom(seed) {
    this.state = (seed == null ? Date.now() : Number(seed)) >>> 0;
  }

  SeededRandom.prototype.next = function () {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  SeededRandom.prototype.normal = function () {
    let u = 0;
    let v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  SeededRandom.prototype.uniform = function (lo, hi) {
    return lo + (hi - lo) * this.next();
  };

  SeededRandom.prototype.int = function (lo, hi) {
    return lo + Math.floor(this.next() * (hi - lo + 1));
  };

  global.MarketSimRNG = { SeededRandom };
})(typeof window !== "undefined" ? window : globalThis);
