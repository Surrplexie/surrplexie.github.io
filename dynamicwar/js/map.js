(function (global) {
  "use strict";
  const DW = global.DynamicWar;

  function pointInRing(x, y, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[i], b = ring[j];
      if (((a[1] > y) !== (b[1] > y)) &&
          x < (b[0] - a[0]) * (y - a[1]) / ((b[1] - a[1]) || 1e-9) + a[0]) inside = !inside;
    }
    return inside;
  }

  class WorldMap {
    constructor(data, config) {
      this.data = data;
      this.config = config;
      this.features = data.features || [];
      this.landRings = this.features
        .filter(f => f.properties.kind === "land")
        .flatMap(f => f.geometry.type === "Polygon" ? [f.geometry.coordinates[0]] : f.geometry.coordinates.map(p => p[0]));
    }

    project(coord) {
      const [west, south, east, north] = this.config.bbox;
      return {
        x: (coord[0] - west) / (east - west) * this.config.worldWidth,
        y: (north - coord[1]) / (north - south) * this.config.worldHeight
      };
    }

    unproject(x, y) {
      const [west, south, east, north] = this.config.bbox;
      return [west + x / this.config.worldWidth * (east - west),
        north - y / this.config.worldHeight * (north - south)];
    }

    isLand(x, y) {
      const [lon, lat] = this.unproject(x, y);
      return this.landRings.some(ring => pointInRing(lon, lat, ring));
    }

    clampLand(x, y) {
      if (this.isLand(x, y)) return { x, y };
      return this.nearestLand(x, y);
    }

    nearestLand(x, y, rng) {
      if (this.isLand(x, y)) return { x, y };
      for (let radius = 12; radius < 360; radius += 12) {
        for (let i = 0; i < 20; i++) {
          const a = (i / 20) * Math.PI * 2 + (rng ? rng.next() * .15 : 0);
          const nx = x + Math.cos(a) * radius, ny = y + Math.sin(a) * radius;
          if (this.isLand(nx, ny)) return { x: nx, y: ny };
        }
      }
      return { x: this.config.worldWidth * .55, y: this.config.worldHeight * .65 };
    }
  }

  async function loadMap(url, config) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Map load failed (${response.status})`);
    return new WorldMap(await response.json(), config);
  }

  DW.WorldMap = WorldMap;
  DW.loadMap = loadMap;
})(window);
