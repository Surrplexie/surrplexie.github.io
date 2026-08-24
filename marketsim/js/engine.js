(function (global) {
  const { SeededRandom } = global.MarketSimRNG;
  const { preset, clampStartingCash } = global.MarketSimConfig;
  const { Market } = global.MarketSimMarket;
  const { Player } = global.MarketSimPlayer;
  const { equity, marketBuy, marketSell, limitOrder } = global.MarketSimExecution;

  const UNITS = {
    minute: 1,
    hour: 60,
    day: 24 * 60,
    week: 7 * 24 * 60,
  };

  function parseAdvance(body) {
    if (body.ticks != null) {
      const n = Math.max(0, Math.floor(Number(body.ticks) || 0));
      return { ticks: n };
    }
    const unit = String(body.unit || "tick").toLowerCase();
    const n = Math.max(0, Number(body.n) || 0);
    if (unit === "tick" || unit === "ticks") return { ticks: Math.floor(n) };
    const mins = UNITS[unit];
    if (!mins) throw new Error(`unknown unit: ${unit}`);
    return { ticks: Math.ceil((n * mins) / (body.mpt || 15)) };
  }

  class Session {
    constructor(config) {
      this.config = Object.assign({}, config);
      const seed = this.config.seed == null ? Date.now() : this.config.seed;
      this.rng = new SeededRandom(seed);
      this.market = new Market(this.config, this.rng);
      this.player = new Player(this.config.startingCash);
    }

    get equity() {
      return equity(this.player, this.market);
    }

    step(n) {
      const k = Math.max(1, n || 1);
      for (let i = 0; i < k; i++) this.market.step();
    }

    advanceInterval(n, unit) {
      const mins = UNITS[String(unit).toLowerCase()] || 0;
      const simMins = n * mins;
      const mpt = this.config.simMinutesPerTick;
      const ticks = Math.ceil(simMins / mpt);
      this.step(ticks);
      return { ticks, simMinutes: ticks * mpt };
    }

    orderMarketBuyCash(ticker, cash) {
      return marketBuy(this, ticker, cash, true);
    }

    orderMarketBuy(ticker, size) {
      return marketBuy(this, ticker, size, false);
    }

    orderMarketSell(ticker, size) {
      return marketSell(this, ticker, size);
    }

    orderLimit(ticker, side, size, price) {
      return limitOrder(this, ticker, side, size, price);
    }

    setVolatilityOverride(v) {
      this.market.volOverride = Math.max(0.1, Math.min(3, Number(v) || 1));
    }

    setTrendOverride(v) {
      this.market.trendOverride = Math.max(-1, Math.min(1, Number(v) || 0));
    }
  }

  let _game = null;

  function newSession(config) {
    return new Session(config);
  }

  function getGame() {
    if (!_game) _game = newSession(preset("simple"));
    return _game;
  }

  function setGame(s) {
    _game = s;
  }

  function resetGame(body) {
    body = body || {};
    const cfg = preset(body.mode || "simple");
    if (body.great_depression || body.greatDepression) cfg.greatDepression = true;
    const raw = body.starting_cash ?? body.startingCash;
    if (raw != null && String(raw).trim() !== "") {
      cfg.startingCash = clampStartingCash(raw);
    }
    if (body.seed != null) cfg.seed = Number(body.seed);
    setGame(newSession(cfg));
    return getGame();
  }

  function setStartingCash(cash) {
    const s = getGame();
    if (s.market.tick !== 0) throw new Error("starting cash can only be changed at sim tick 0");
    const p = s.player;
    for (const q of Object.values(p.positions)) {
      if (Math.abs(q) > 1e-6) throw new Error("flat book required");
    }
    if (p.lockedCash > 1e-6) throw new Error("clear locked cash first");
    const v = clampStartingCash(cash);
    p.cash = v;
    s.config.startingCash = v;
    return s;
  }

  global.MarketSimEngine = {
    Session,
    newSession,
    getGame,
    setGame,
    resetGame,
    setStartingCash,
    parseAdvance,
    UNITS,
  };
})(typeof window !== "undefined" ? window : globalThis);
