(function (global) {
  const { TICKS_PER_SIM_DAY } = global.MarketSimConfig;
  const { defaultGbmParams, stepInstrument } = global.MarketSimGbm;
  const { makeUniverse } = global.MarketSimInstrument;

  const HEADLINES = [
    { text: "Fed signals patience on rates", sectors: ["Finance"], sigma: 1.15 },
    { text: "Mega-cap tech leads risk-on session", sectors: ["Tech"], sigma: 1.2, drift: 0.01 },
    { text: "Energy names slip on inventory build", sectors: ["Energy"], sigma: 1.25, drift: -0.015 },
    { text: "Crypto volatility spikes after ETF flows", asset: "crypto", sigma: 1.35 },
    { text: "Defensive sectors outperform", sectors: ["Health", "Utilities"], sigma: 0.95 },
    { text: "Retail traders pile into meme-adjacent names", sigma: 1.18 },
  ];

  class Market {
    constructor(config, rng) {
      this.config = config;
      this.rng = rng;
      this.tick = 0;
      this.simMinuteOfDay = 9 * 60 + 30;
      this.instruments = makeUniverse(rng, config);
      this.byTicker = Object.fromEntries(this.instruments.map((i) => [i.ticker, i]));
      this.news = [];
      this.gbmParams = defaultGbmParams(config);
      this.sectorShock = {};
      this.gdScheduled = config.greatDepression ? rng.int(500, 1000) : null;
      this.gdFired = false;
      this.gdRecoveryUntil = null;
      this._initBooks();
    }

    simMinuteOfDayNow() {
      const mpt = this.config.simMinutesPerTick;
      const dayMins = (this.tick * mpt) % (24 * 60);
      return dayMins;
    }

    ticksPerDay() {
      return Math.round((24 * 60) / this.config.simMinutesPerTick) || TICKS_PER_SIM_DAY;
    }

    cryptoVolMult(ins) {
      const cfg = this.config;
      const mcap = ins.mid * ins.unitsOutstanding;
      const ranked = this.instruments
        .filter((x) => x.assetClass === "crypto")
        .map((x) => ({ mcap: x.mid * x.unitsOutstanding, t: x.ticker }))
        .sort((a, b) => b.mcap - a.mcap);
      const idx = ranked.findIndex((r) => r.t === ins.ticker);
      if (idx >= 0 && idx < (cfg.cryptoTopTier || 3)) return cfg.cryptoTierVolMult || 0.72;
      const ref = cfg.cryptoMcapRefUsd || 1e11;
      const p = cfg.cryptoMcapVolPower || 0.22;
      const mult = 1 + p * Math.pow(ref / Math.max(mcap, 1e6), 0.15);
      return Math.min(mult, cfg.cryptoVolMaxMult || 2.5);
    }

    setVolatilityOverride(v) {
      this.gbmParams.listedEquitySigmaMult = Math.max(0.05, Math.min(4, Number(v) || 1));
      this.gbmParams.volMultiplier = this.gbmParams.listedEquitySigmaMult;
    }

    setTrendOverride(v) {
      this.gbmParams.trendOverride = Math.max(-1, Math.min(1, Number(v) || 0));
    }

    _initBooks() {
      for (const ins of this.instruments) {
        ins.book.seedNpc(
          ins.mid,
          this.config.spreadBps,
          this.config.npcDepthUsd || ins.mid * 50000,
          this.rng,
          this.simMinuteOfDayNow()
        );
        this._syncQuote(ins);
      }
      this._syncEwBasketFundMids();
    }

    _syncQuote(ins) {
      const bb = ins.book.bestBid();
      const ba = ins.book.bestAsk();
      ins.bid = bb ?? ins.mid * (1 - this.config.spreadBps / 20000);
      ins.ask = ba ?? ins.mid * (1 + this.config.spreadBps / 20000);
    }

    _syncEwBasketFundMids() {
      for (const ins of this.instruments) {
        if (ins.assetClass !== "fund" || !ins.basket?.length) continue;
        let sum = 0;
        let n = 0;
        for (const t of ins.basket) {
          const x = this.byTicker[t];
          if (x) {
            sum += x.mid;
            n++;
          }
        }
        if (n) ins.mid = sum / n;
        this._syncQuote(ins);
      }
    }

    _appendHistory(ins) {
      const c = ins.mid;
      const last = ins.history[ins.history.length - 1];
      if (!last || last.tick !== this.tick) {
        ins.history.push({ tick: this.tick, mid: c, o: c, h: c, l: c, c });
      } else {
        last.c = c;
        last.mid = c;
        last.h = Math.max(last.h, c);
        last.l = Math.min(last.l, c);
      }
      const ref = ins.refMid || c;
      ins.pct24h = ref ? ((c - ref) / ref) * 100 : 0;
    }

    _maybeHeadline() {
      if (this.rng.next() > 0.035) return;
      const h = HEADLINES[this.rng.int(0, HEADLINES.length - 1)];
      this.news.unshift({ tick: this.tick, text: h.text });
      this.news = this.news.slice(0, 12);
      this.sectorShock = {};
      if (h.sectors) {
        for (const s of h.sectors) this.sectorShock[s] = (h.drift || 0) * 0.5;
      }
      for (const ins of this.instruments) {
        let hit = false;
        if (h.asset === "crypto" && ins.assetClass === "crypto") hit = true;
        if (h.sectors && h.sectors.includes(ins.sector)) hit = true;
        if (!h.sectors && !h.asset && this.rng.next() < 0.12) hit = true;
        if (hit) {
          ins.headlineSigmaMult = Math.max(ins.headlineSigmaMult, h.sigma || 1.1);
        }
      }
    }

    _decayHeadlines() {
      for (const ins of this.instruments) {
        if (ins.headlineSigmaMult > 1) ins.headlineSigmaMult = 1 + (ins.headlineSigmaMult - 1) * 0.92;
        if (ins.headlineSigmaMult < 1.001) ins.headlineSigmaMult = 1;
      }
      for (const k of Object.keys(this.sectorShock)) {
        this.sectorShock[k] *= 0.9;
        if (Math.abs(this.sectorShock[k]) < 1e-5) delete this.sectorShock[k];
      }
    }

    _maybeGreatDepression() {
      if (!this.gdScheduled || this.gdFired) return;
      if (this.tick < this.gdScheduled) return;
      this.gdFired = true;
      this.gdRecoveryUntil = this.tick + 400;
      this.news.unshift({ tick: this.tick, text: "⚠ Great Depression shock — broad selloff" });
      for (const ins of this.instruments) {
        if (ins.assetClass === "fund") continue;
        const pre = ins.mid;
        if (this.rng.next() < 0.85) ins.mid *= this.rng.uniform(0.35, 0.55);
        else ins.mid *= this.rng.uniform(0.75, 0.92);
        ins.gdRecoveryTarget = pre * this.rng.uniform(0.96, 0.995);
      }
    }

    _gdRecovery() {
      if (!this.gdRecoveryUntil || this.tick > this.gdRecoveryUntil) return;
      for (const ins of this.instruments) {
        if (!ins.gdRecoveryTarget || ins.assetClass === "fund") continue;
        ins.mid += (ins.gdRecoveryTarget - ins.mid) * 0.015;
      }
    }

    _cryptoMint(ins) {
      if (ins.assetClass !== "crypto" || ins.maxUnitsOutstanding) return;
      if (this.rng.next() > (this.config.cryptoMintProb || 0.012)) return;
      const pct = this.rng.uniform(0, this.config.cryptoMintMaxPct || 0.0015);
      const oldU = ins.unitsOutstanding;
      const newU = oldU * (1 + pct);
      if (ins.maxUnitsOutstanding && newU > ins.maxUnitsOutstanding) return;
      ins.unitsOutstanding = newU;
      ins.mid *= oldU / newU;
      ins.volume += oldU * pct * ins.mid;
    }

    _floatFlow(ins) {
      if (ins.assetClass !== "stock" && ins.assetClass !== "fund") return;
      const bps = this.config.floatFlowBpsPerTick || 0.002;
      const flow = ins.unitsOutstanding * (bps / 10000) * (0.5 + this.rng.next());
      ins.unitsOutstanding += flow;
      if (ins.maxUnitsOutstanding) ins.unitsOutstanding = Math.min(ins.unitsOutstanding, ins.maxUnitsOutstanding);
    }

    _naturalTurnover(ins) {
      const move = Math.abs(ins.pct24h || 0) / 100;
      const sig = ins.lastSigma || ins.sigma || 0.2;
      const base = ins.unitsOutstanding * 1e-6 * sig;
      return base * (1 + move * 12 + ins.sessionVolume * 1e-12) * (0.4 + this.rng.next());
    }

    applyOvernightGaps() {
      const maxBps = this.config.overnightGapMaxBps || 0;
      if (maxBps <= 0) return;
      for (const ins of this.instruments) {
        if (ins.assetClass === "fund") continue;
        const gap = this.rng.uniform(-maxBps, maxBps) / 10000;
        ins.mid *= 1 + gap;
        ins.mid = Math.max(ins.mid, 1e-9);
      }
    }

    step() {
      this.tick += 1;
      this.simMinuteOfDay = this.simMinuteOfDayNow();
      const tpd = this.ticksPerDay();
      if (this.tick > 1 && this.tick % tpd === 0) this.applyOvernightGaps();

      this._maybeGreatDepression();
      this._gdRecovery();

      for (const ins of this.instruments) {
        if (ins.assetClass !== "fund") stepInstrument(ins, this, this.rng);
        this._cryptoMint(ins);
        this._floatFlow(ins);
      }
      this._syncEwBasketFundMids();

      for (const ins of this.instruments) {
        const turn = this._naturalTurnover(ins);
        ins.volume += turn;
        ins.sessionVolume = (ins.sessionVolume || 0) + turn;
        ins.book.seedNpc(
          ins.mid,
          this.config.spreadBps,
          this.config.npcDepthUsd || ins.mid * 40000,
          this.rng,
          this.simMinuteOfDay
        );
        this._syncQuote(ins);
        this._appendHistory(ins);
      }

      if (this.tick % tpd === 0) {
        for (const ins of this.instruments) ins.refMid = ins.mid;
      }
      this._maybeHeadline();
      this._decayHeadlines();
    }

    recordFill(ticker, size, price) {
      const ins = this.byTicker[ticker];
      if (!ins) return;
      const v = Math.abs(size * price);
      ins.volume += v;
      ins.sessionVolume = (ins.sessionVolume || 0) + v;
    }

    applySplit(ticker, ratio) {
      const ins = this.byTicker[ticker.toUpperCase()];
      if (!ins || ins.assetClass !== "stock") return false;
      const r = Number(ratio);
      if (!Number.isFinite(r) || r <= 1) return false;
      ins.mid /= r;
      ins.unitsOutstanding *= r;
      return true;
    }

    applyDividend(ticker, cashPerShare) {
      const ins = this.byTicker[ticker.toUpperCase()];
      if (!ins || ins.assetClass !== "stock") return false;
      const d = Number(cashPerShare);
      if (!Number.isFinite(d) || d <= 0) return false;
      ins.mid = Math.max(ins.mid - d, 0.01);
      return true;
    }

    applyBuyback(ticker, fraction) {
      const ins = this.byTicker[ticker.toUpperCase()];
      if (!ins || ins.assetClass !== "stock") return false;
      const f = Number(fraction);
      if (!Number.isFinite(f) || f <= 0 || f >= 1) return false;
      const old = ins.unitsOutstanding;
      ins.unitsOutstanding = old * (1 - f);
      ins.mid *= old / ins.unitsOutstanding;
      return true;
    }
  }

  global.MarketSimMarket = { Market };
})(typeof window !== "undefined" ? window : globalThis);
