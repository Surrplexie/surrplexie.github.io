(function (global) {
  const { SeededRandom } = global.MarketSimRNG;
  const { preset, buildCustom, clampStartingCash } = global.MarketSimConfig;
  const { parseAdvance, parseRunLine, UNITS } = global.MarketSimTime;
  const { Market } = global.MarketSimMarket;
  const { Player } = global.MarketSimPlayer;
  const { equity, marketBuy, marketSell, limitOrder, limitBuyCash, matchPlayerLimits } =
    global.MarketSimExecution;
  const { setGlobalGbm, setPerTicker, applyScopeGbm } = global.MarketSimGbm;

  class Session {
    constructor(config) {
      this.config = Object.assign({}, config);
      const seed = this.config.seed == null ? Date.now() : Number(this.config.seed);
      this.rng = new SeededRandom(seed);
      this.market = new Market(this.config, this.rng);
      this.player = new Player(this.config.startingCash, this.config);
    }

    get equity() {
      return equity(this);
    }

    step(n) {
      const k = Math.max(1, n || 1);
      for (let i = 0; i < k; i++) {
        this.market.step();
        matchPlayerLimits(this);
        this.player.accrueBorrow(this.market);
      }
    }

    advanceInterval(n, unit) {
      const ticks = parseAdvance({ unit, n }, this.config.simMinutesPerTick).ticks;
      this.step(ticks);
      return { ticks, simMinutes: ticks * this.config.simMinutesPerTick };
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

    orderLimitBuyCash(ticker, cash, price) {
      return limitBuyCash(this, ticker, cash, price);
    }

    setVolatilityOverride(v) {
      this.market.setVolatilityOverride(v);
    }

    setTrendOverride(v) {
      this.market.setTrendOverride(v);
    }

    setGbmGlobal(patch) {
      setGlobalGbm(this.market, patch);
      if (patch.stockFundAnnualReturn != null) {
        this.config.stockFundAnnualReturn = patch.stockFundAnnualReturn;
      }
      if (patch.driftBias != null) this.config.driftBias = patch.driftBias;
      if (patch.volMultiplier != null) this.config.volMultiplier = patch.volMultiplier;
      if (patch.simMinutesPerTick != null) this.config.simMinutesPerTick = patch.simMinutesPerTick;
    }

    setGbmTicker(ticker, patch) {
      setPerTicker(this.market, ticker, patch);
    }

    setGbmScope(scope, patch) {
      applyScopeGbm(this.market, scope, patch);
    }

    stockSplit(ticker, ratio) {
      const ok = this.market.applySplit(ticker, ratio);
      if (!ok) throw new Error("split failed");
      const r = Number(ratio);
      const q = this.player.position(ticker.toUpperCase());
      if (q) this.player.positions[ticker.toUpperCase()] = q * r;
      return ok;
    }

    stockDividend(ticker, cashPerShare) {
      const t = ticker.toUpperCase();
      const ok = this.market.applyDividend(t, cashPerShare);
      if (!ok) throw new Error("dividend failed");
      const q = this.player.position(t);
      if (q > 0) this.player.cash += q * Number(cashPerShare);
      return ok;
    }

    stockBuyback(ticker, fraction) {
      return this.market.applyBuyback(ticker, fraction);
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
    let cfg;
    if (body.custom || body.mode === "custom") {
      cfg = buildCustom(body.config || body);
    } else {
      cfg = preset(body.mode || "simple");
    }
    if (body.great_depression || body.greatDepression) cfg.greatDepression = true;
    const raw = body.starting_cash ?? body.startingCash;
    if (raw != null && String(raw).trim() !== "") cfg.startingCash = clampStartingCash(raw);
    if (body.seed != null) cfg.seed = Number(body.seed);
    if (body.sim_minutes_per_tick != null) cfg.simMinutesPerTick = Number(body.sim_minutes_per_tick);
    if (body.stock_fund_annual_return != null) {
      cfg.stockFundAnnualReturn = Number(body.stock_fund_annual_return);
    }
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
    for (const v of Object.values(p.lockedSell)) {
      if (Math.abs(v) > 1e-6) throw new Error("clear locked sells first");
    }
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
    parseRunLine,
    UNITS,
  };
})(typeof window !== "undefined" ? window : globalThis);
