(function (global) {
  "use strict";
  const DW = global.DynamicWar;

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [n >> 16, (n >> 8) & 255, n & 255];
  }

  class Renderer {
    constructor(canvas, map, config) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.map = map;
      this.config = config;
      this.camera = { x: config.worldWidth / 2, y: config.worldHeight / 2, zoom: 1 };
      this.followId = null;
      this.dpr = 1;
      this.width = 1;
      this.height = 1;
      this.staticLayer = document.createElement("canvas");
      this.staticLayer.width = config.worldWidth;
      this.staticLayer.height = config.worldHeight;
      this.fieldScale = 3;
      this.field = document.createElement("canvas");
      this.field.width = config.gridWidth * this.fieldScale;
      this.field.height = config.gridHeight * this.fieldScale;
      this.fieldCtx = this.field.getContext("2d");
      this.fieldImage = this.fieldCtx.createImageData(this.field.width, this.field.height);
      this.fieldLand = new Uint8Array(this.field.width * this.field.height);
      for (let py = 0; py < this.field.height; py++) {
        for (let px = 0; px < this.field.width; px++) {
          const wx = (px + .5) / this.field.width * config.worldWidth;
          const wy = (py + .5) / this.field.height * config.worldHeight;
          this.fieldLand[py * this.field.width + px] = map.isLand(wx, wy) ? 1 : 0;
        }
      }
      this.fieldDirty = true;
      this.fieldAge = 0;
      this.drawStaticMap();
      this.resize();
    }

    resize() {
      this.dpr = Math.min(2, global.devicePixelRatio || 1);
      this.width = global.innerWidth;
      this.height = global.innerHeight;
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
    }

    baseScale() {
      return Math.min(this.width / this.config.worldWidth, this.height / this.config.worldHeight) * .96;
    }

    screenToWorld(sx, sy) {
      const scale = this.baseScale() * this.camera.zoom;
      return {
        x: (sx - this.width / 2) / scale + this.camera.x,
        y: (sy - this.height / 2) / scale + this.camera.y
      };
    }

    drawPath(ctx, geom, close) {
      const rings = geom.type === "Polygon" ? geom.coordinates : [geom.coordinates];
      ctx.beginPath();
      for (const coords of rings) {
        coords.forEach((coord, i) => {
          const p = this.map.project(coord);
          if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        });
        if (close) ctx.closePath();
      }
    }

    drawStaticMap() {
      const ctx = this.staticLayer.getContext("2d");
      const sea = ctx.createLinearGradient(0, 0, 0, this.config.worldHeight);
      sea.addColorStop(0, "#6b8798");
      sea.addColorStop(1, "#587486");
      ctx.fillStyle = sea;
      ctx.fillRect(0, 0, this.config.worldWidth, this.config.worldHeight);

      const land = this.map.features.filter(f => f.properties.kind === "land");
      for (const feature of land) {
        this.drawPath(ctx, feature.geometry, true);
        ctx.fillStyle = "#8fb25a";
        ctx.fill();
      }
      ctx.save();
      ctx.globalAlpha = 0.18;
      for (const feature of land) {
        this.drawPath(ctx, feature.geometry, true);
        ctx.fillStyle = "#c5d98a";
        ctx.fill();
      }
      ctx.restore();
      for (const feature of land) {
        this.drawPath(ctx, feature.geometry, true);
        ctx.strokeStyle = "#dce7aa";
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }

      for (const feature of this.map.features) {
        const kind = feature.properties.kind;
        if (kind === "city" || kind === "land") continue;
        this.drawPath(ctx, feature.geometry, false);
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        if (kind === "border") {
          ctx.setLineDash([6, 5]);
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = "rgba(72, 82, 62, .55)";
        } else if (kind === "river") {
          ctx.setLineDash([]);
          ctx.lineWidth = 2.4;
          ctx.strokeStyle = "#6b9bb4";
        } else {
          ctx.setLineDash([]);
          ctx.lineWidth = 1.8;
          ctx.strokeStyle = "#cbb57a";
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.font = "600 12px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (const feature of this.map.features.filter(f => f.properties.kind === "city")) {
        const p = this.map.project(feature.geometry.coordinates);
        ctx.fillStyle = "#1f2a1d";
        ctx.beginPath(); ctx.arc(p.x, p.y, 3.4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#e8edd4";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "rgba(24,32,22,.88)";
        ctx.fillText(feature.properties.name, p.x, p.y + 5);
      }
    }

    updateField(field, force) {
      if (!force && this.fieldAge < 0.12) return;
      this.fieldAge = 0;
      const data = this.fieldImage.data;
      const colors = this.config.factions.map(f => hexToRgb(f.color));
      const fw = this.field.width, fh = this.field.height;
      for (let py = 0; py < fh; py++) {
        for (let px = 0; px < fw; px++) {
          const at = (py * fw + px) * 4;
          const wx = (px + .5) / fw * this.config.worldWidth;
          const wy = (py + .5) / fh * this.config.worldHeight;
          if (!this.fieldLand[py * fw + px]) {
            data[at + 3] = 0;
            continue;
          }
          let best = -1, bestValue = 0, second = 0, total = 0;
          for (let f = 0; f < colors.length; f++) {
            const v = field.sample(f, wx, wy);
            total += v;
            if (v > bestValue) { second = bestValue; bestValue = v; best = f; }
            else if (v > second) second = v;
          }
          const owner = field.ownerAt(wx, wy);
          const shown = owner >= 0 ? owner : (total > 0.12 ? best : -1);
          if (shown < 0) { data[at + 3] = 0; continue; }
          const rgb = colors[shown];
          const contrast = total > 0.001 ? (bestValue - second) / total : 1;
          const edge = contrast < 0.22;
          data[at] = rgb[0]; data[at + 1] = rgb[1]; data[at + 2] = rgb[2];
          data[at + 3] = edge ? 150 : 86;
        }
      }
      this.fieldCtx.putImageData(this.fieldImage, 0, 0);
    }

    render(session) {
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.fillStyle = "#18231b";
      ctx.fillRect(0, 0, this.width, this.height);

      if (this.followId != null) {
        const followed = session.units.find(u => u.id === this.followId && !u.dead);
        if (followed) {
          this.camera.x += (followed.x - this.camera.x) * .08;
          this.camera.y += (followed.y - this.camera.y) * .08;
        } else this.followId = null;
      }

      this.fieldAge += 1 / 60;
      this.updateField(session.influence);
      const scale = this.baseScale() * this.camera.zoom;
      ctx.save();
      ctx.translate(this.width / 2, this.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-this.camera.x, -this.camera.y);
      ctx.drawImage(this.staticLayer, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(this.field, 0, 0, this.config.worldWidth, this.config.worldHeight);
      this.drawUnits(ctx, session.units, scale);
      ctx.restore();
      this.drawMinimap(ctx, session);
    }

    drawUnits(ctx, units, scale) {
      for (const unit of units) {
        if (unit.dead) continue;
        const faction = this.config.factions[unit.faction];
        const r = Math.max(5, 7 / Math.sqrt(scale));
        ctx.save();
        ctx.translate(unit.x, unit.y);
        ctx.rotate(unit.heading || 0);
        const flash = Math.min(1, unit.flash * 4);
        ctx.fillStyle = faction.color;
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 1.6 / scale;
        ctx.beginPath();
        ctx.moveTo(r * 1.3, 0);
        ctx.lineTo(-r, r * .78);
        ctx.lineTo(-r, -r * .78);
        ctx.closePath();
        ctx.fill();
        if (flash > 0) {
          ctx.fillStyle = `rgba(255,255,255,${0.45 * flash})`;
          ctx.fill();
        }
        ctx.stroke();
        ctx.fillStyle = "#1c231b";
        ctx.fillRect(-r, r + 2 / scale, r * 2, 2.2 / scale);
        ctx.fillStyle = unit.health > 45 ? "#b7e663" : "#ff725e";
        ctx.fillRect(-r, r + 2 / scale, r * 2 * Math.max(0, unit.health) / 100, 2.2 / scale);
        ctx.restore();
      }
    }

    drawMinimap(ctx, session) {
      const w = Math.min(190, this.width * .28), h = w * this.config.worldHeight / this.config.worldWidth;
      const x = this.width - w - 16, y = this.height - h - 30;
      ctx.save();
      ctx.globalAlpha = .92;
      ctx.fillStyle = "#111811";
      ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
      ctx.drawImage(this.staticLayer, x, y, w, h);
      ctx.drawImage(this.field, x, y, w, h);
      for (const unit of session.units) {
        if (unit.dead) continue;
        ctx.fillStyle = this.config.factions[unit.faction].color;
        ctx.fillRect(x + unit.x / this.config.worldWidth * w - 1, y + unit.y / this.config.worldHeight * h - 1, 3, 3);
      }
      ctx.strokeStyle = "#e9ebda";
      ctx.lineWidth = 1;
      const viewW = this.width / (this.baseScale() * this.camera.zoom);
      const viewH = this.height / (this.baseScale() * this.camera.zoom);
      ctx.strokeRect(x + (this.camera.x - viewW / 2) / this.config.worldWidth * w,
        y + (this.camera.y - viewH / 2) / this.config.worldHeight * h,
        viewW / this.config.worldWidth * w, viewH / this.config.worldHeight * h);
      ctx.restore();
    }
  }

  DW.Renderer = Renderer;
})(window);
