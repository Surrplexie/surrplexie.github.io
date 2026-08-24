(function (global) {
  const { roundQty } = global.MarketSimClob;
  const { buildMegaUniverse } = global.MarketSimUniverse;

  const HEADLINES = [
    "Fed signals patience on rates; equities drift higher",
    "Mega-cap tech leads risk-on session",
    "Energy names slip on inventory build",
    "Crypto volatility spikes after ETF flows headline",
    "Defensive sectors outperform in choppy tape",
    "Retail traders pile into meme-adjacent names",
  ];

  class Market {
    constructor(config, rng) {
      this.config = config;
      this.rng = rng;
      this.tick = 0;
      this.instruments = buildMegaUniverse(rng, config);
      this.byTicker = Object.fromEntries(this.instruments.map((i) => [i.ticker, i]));
      this.news = [];
      this.volOverride = 1;
      this.trendOverride = 0;
      this.gdScheduled = config.greatDepression ? rng.int(500, 1000) : null;
      this.gdFired = false;
      this._initBooks();
    }

    _initBooks() {
      for (const ins of this.instruments) {
        ins.book.seedNpc(ins.mid, this.config.spreadBps, ins.mid * 50000, this.rng);
        this._syncQuote(ins);
      }
      this._syncFunds();
    }

    _simYearFraction() {
      const mins = this.config.simMinutesPerTick;
      return mins / (365 * 24 * 60);
    }

    _cryptoVolMult(ins) {
      const mcap = ins.mid * ins.unitsOutstanding;
      const ranked = this.instruments
        .filter((x) => x.assetClass === "crypto")
        .map((x) => x.mid * x.unitsOutstanding)
        .sort((a, b) => b - a);
      const idx = ranked.indexOf(mcap);
      const top = this.config.cryptoTopTier || 3;
      if (idx >= 0 && idx < top) return 0.72;
      const ref = 1e11;
      const mult = 1 + 0.22 * Math.pow(ref / Math.max(mcap, 1e6), 0.15);
      return Math.min(mult, 2.5);
    }

    _effectiveSigma(ins) {
      let s = ins.sigma * this.config.volMultiplier * this.volOverride;
      if (ins.assetClass === "crypto") s *= this._cryptoVolMult(ins);
      return s;
    }

    _effectiveMu(ins) {
      let m = ins.mu + this.trendOverride * 0.05;
      if (this.config.driftBias) m += this.config.driftBias;
      return m;
    }

    _syncQuote(ins) {
      const bb = ins.book.bestBid();
      const ba = ins.book.bestAsk();
      ins.bid = bb ?? ins.mid * 0.999;
      ins.ask = ba ?? ins.mid * 1.001;
    }

    _syncFunds() {
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
      const last = ins.history[ins.history.length - 1];
      const c = ins.mid;
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
      if (this.rng.next() > 0.04) return;
      const msg = HEADLINES[this.rng.int(0, HEADLINES.length - 1)];
      this.news.unshift({ tick: this.tick, text: msg });
      this.news = this.news.slice(0, 8);
      for (const ins of this.instruments) {
        if (this.rng.next() < 0.15) ins.sigma *= 1 + this.rng.uniform(0.05, 0.2);
      }
    }

    _maybeGreatDepression() {
      if (!this.gdScheduled || this.gdFired) return;
      if (this.tick < this.gdScheduled) return;
      this.gdFired = true;
      this.news.unshift({ tick: this.tick, text: "⚠ Great Depression shock — broad selloff" });
      for (const ins of this.instruments) {
        if (ins.assetClass === "fund") continue;
        if (this.rng.next() < 0.85) ins.mid *= this.rng.uniform(0.35, 0.55);
        else ins.mid *= this.rng.uniform(0.8, 0.95);
      }
    }

    _gbmStep(ins) {
      if (ins.assetClass === "fund") return;
      const dt = this._simYearFraction();
      const mu = this._effectiveMu(ins);
      const sigma = this._effectiveSigma(ins);
      const z = this.rng.normal();
      ins.mid *= Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * z);
      ins.mid = Math.max(ins.mid, 1e-6);
      if (ins.assetClass === "crypto" && ins.maxUnitsOutstanding) {
        ins.unitsOutstanding = Math.min(ins.unitsOutstanding, ins.maxUnitsOutstanding);
      }
    }

    _turnoverVolume(ins) {
      const move = Math.abs(ins.pct24h || 0) / 100;
      const base = ins.unitsOutstanding * 1e-6 * (ins.sigma || 0.2);
      return base * (1 + move * 10) * (0.5 + this.rng.next());
    }

    step() {
      this.tick += 1;
      this._maybeGreatDepression();
      for (const ins of this.instruments) {
        if (ins.assetClass !== "fund") this._gbmStep(ins);
      }
      this._syncFunds();
      for (const ins of this.instruments) {
        ins.volume += this._turnoverVolume(ins);
        ins.book.seedNpc(ins.mid, this.config.spreadBps, ins.mid * 40000, this.rng);
        this._syncQuote(ins);
        this._appendHistory(ins);
      }
      if (this.tick % 96 === 0) {
        for (const ins of this.instruments) ins.refMid = ins.mid;
      }
      this._maybeHeadline();
    }

    recordFill(ticker, size, price) {
      const ins = this.byTicker[ticker];
      if (!ins) return;
      ins.volume += Math.abs(size * price);
    }
  }

  global.MarketSimMarket = { Market };
})(typeof window !== "undefined" ? window : globalThis);
