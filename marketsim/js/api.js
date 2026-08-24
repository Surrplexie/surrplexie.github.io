(function (global) {
  const {
    getGame,
    setGame,
    resetGame,
    setStartingCash,
    newSession,
    parseAdvance,
  } = global.MarketSimEngine;
  const { serializeState, chartSeries } = global.MarketSimState;
  const { Result, resultMsg } = global.MarketSimExecution;
  const { clampStartingCash } = global.MarketSimConfig;

  const API = {
    getState() {
      return serializeState(getGame());
    },

    step(body) {
      const s = getGame();
      const adv = parseAdvance(body || {}, s.config.simMinutesPerTick);
      s.step(adv.ticks);
      return this.getState();
    },

    order(body) {
      body = body || {};
      const s = getGame();
      const t = String(body.ticker || "").toUpperCase();
      const side = String(body.side || "buy").toLowerCase();
      const typ = String(body.type || body.order_type || "market").toLowerCase();
      let r;
      if (typ === "limit") {
        if (body.cash != null && side === "buy") {
          r = s.orderLimitBuyCash(t, Number(body.cash), Number(body.price));
        } else {
          r = s.orderLimit(t, side, Number(body.size || body.qty), Number(body.price));
        }
      } else if (side === "buy") {
        if (body.cash != null) r = s.orderMarketBuyCash(t, Number(body.cash));
        else r = s.orderMarketBuy(t, Number(body.size || body.qty));
      } else {
        r = s.orderMarketSell(t, Number(body.size || body.qty));
      }
      if (r !== Result.OK) throw new Error(resultMsg(r));
      return this.getState();
    },

    reset(body) {
      resetGame(body || {});
      return this.getState();
    },

    startingCash(body) {
      setStartingCash(body.cash ?? body.starting_cash ?? body.startingCash);
      return this.getState();
    },

    volatilityOverride(body) {
      getGame().setVolatilityOverride(body.value ?? body.vol ?? 1);
      return this.getState();
    },

    trendOverride(body) {
      getGame().setTrendOverride(body.value ?? body.trend ?? 0);
      return this.getState();
    },

    gbmParams(body) {
      const s = getGame();
      body = body || {};
      if (body.global) s.setGbmGlobal(body.global);
      if (body.ticker) s.setGbmTicker(body.ticker, body.params || body);
      if (body.scope) s.setGbmScope(body.scope, body.params || body);
      return this.getState();
    },

    stockSplit(body) {
      getGame().stockSplit(body.ticker, body.ratio || body.split);
      return this.getState();
    },

    stockDividend(body) {
      getGame().stockDividend(body.ticker, body.cash_per_share ?? body.amount);
      return this.getState();
    },

    stockBuyback(body) {
      getGame().stockBuyback(body.ticker, body.fraction ?? body.pct);
      return this.getState();
    },

    chart(ticker, opts, maxBars) {
      return chartSeries(getGame(), ticker, opts, maxBars ?? 400);
    },
  };

  global.MarketSimAPI = API;
})(typeof window !== "undefined" ? window : globalThis);
