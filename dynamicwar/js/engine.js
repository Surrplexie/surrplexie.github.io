(function (global) {
  "use strict";
  const DW = global.DynamicWar;

  class Session {
    constructor(config, map, seed) {
      this.config = config;
      this.map = map;
      this.seed = Number(seed) || 1944;
      this.rng = new DW.RNG(this.seed);
      this.influence = new DW.InfluenceField(config, map);
      this.relations = new DW.Relations(config.factions, this.rng);
      this.units = DW.createArmy(config, map, this.rng);
      this.time = 0;
      this.winner = -1;
      this.holdFaction = -1;
      this.holdTime = 0;
      this.running = false;
    }

    step(dt) {
      if (this.winner >= 0) return;
      this.time += dt;
      this.relations.update(this, dt);
      for (const unit of this.units) {
        DW.updateBot(unit, this, dt);
        DW.updateMovement(unit, this.map, dt);
      }
      DW.separateUnits(this.units, this.config);
      for (const unit of this.units) {
        if (!unit.dead && !this.map.isLand(unit.x, unit.y)) {
          const safe = this.map.nearestLand(unit.x, unit.y);
          unit.x = safe.x; unit.y = safe.y;
        }
      }
      DW.resolveCombat(this.units, dt, this.rng, this.relations);
      this.influence.update(this.units, dt);
      this.checkVictory(dt);
    }

    checkVictory(dt) {
      let leader = 0;
      for (let f = 1; f < this.influence.shares.length; f++) {
        if (this.influence.shares[f] > this.influence.shares[leader]) leader = f;
      }
      const alive = this.config.factions.map(f => this.units.filter(u => !u.dead && u.faction === f.id).length);
      const survivors = alive.filter(n => n > 0).length;
      if (survivors === 1 && this.time > 10) {
        this.winner = alive.findIndex(n => n > 0);
        return;
      }
      if (this.time > 20 && this.influence.shares[leader] >= this.config.winShare) {
        if (this.holdFaction === leader) this.holdTime += dt;
        else { this.holdFaction = leader; this.holdTime = 0; }
        if (this.holdTime >= this.config.winHoldSeconds) this.winner = leader;
      } else {
        this.holdFaction = -1;
        this.holdTime = 0;
      }
    }

    factionStats() {
      return this.config.factions.map(f => {
        const army = this.units.filter(u => !u.dead && u.faction === f.id);
        return {
          id: f.id, name: f.name, color: f.color,
          control: this.influence.shares[f.id] || 0,
          units: army.length,
          stance: this.config.factions
            .filter(other => other.id !== f.id)
            .map(other => this.relations.label(f.id, other.id))
            .join("/"),
          strength: army.reduce((sum, u) => sum + u.health, 0) / 100
        };
      });
    }
  }

  DW.Session = Session;
})(window);
