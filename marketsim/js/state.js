(function (global) {
  const { equity } = global.MarketSimExecution;

  function fmtMoney(x) {
    if (!Number.isFinite(x)) return "—";
    const ax = Math.abs(x);
    if (ax >= 1e9) return `$${(x / 1e9).toFixed(2)}B`;
    if (ax >= 1e6) return `$${(x / 1e6).toFixed(2)}M`;
    if (ax >= 1e3) return `$${(x / 1e3).toFixed(2)}K`;
    return `$${Number(x).toFixed(2)}`;
  }

  function fmtQty(x) {
    const s = Number(x).toFixed(8).replace(/\.?0+$/, "");
    return s || "0";
  }

  function serializeState(session) {
    const { market, player, config } = session;
    const eq = equity(session);

    const instruments = market.instruments.map((ins) => ({
      ticker: ins.ticker,
      name: ins.name,
      asset_class: ins.assetClass,
      sector: ins.sector,
      mid: ins.mid,
      bid: ins.bid,
      ask: ins.ask,
      pct_24h: ins.pct24h,
      volume: ins.volume,
      mcap: ins.mid * ins.unitsOutstanding,
      units_outstanding: ins.unitsOutstanding,
      max_units_outstanding: ins.maxUnitsOutstanding,
      ask_size: ins.book.totalAskSize(),
      bid_size: ins.book.totalBidSize(),
      sigma: ins.lastSigma ?? ins.sigma,
      mu: ins.lastMu ?? ins.mu,
      base_sigma: ins.baseSigma,
      base_mu: ins.baseMu,
    }));

    const positions = Object.entries(player.positions)
      .filter(([, q]) => Math.abs(q) > 1e-8)
      .map(([ticker, qty]) => {
        const ins = market.byTicker[ticker];
        const mv = ins ? qty * ins.mid : 0;
        return { ticker, qty, mv, mid: ins?.mid ?? 0 };
      });

    const exp = player.grossExposure(market);

    return {
      mode: config.label,
      tick: market.tick,
      sim_minutes_per_tick: config.simMinutesPerTick,
      sim_minute_of_day: market.simMinuteOfDay,
      equity: eq,
      cash: player.cash,
      free_cash: player.freeCash(),
      starting_cash: config.startingCash,
      gross_long: exp.longG,
      gross_short: exp.shortG,
      gross_exposure: exp.gross,
      max_leverage: config.maxLeverage,
      maintenance_margin_rate: config.maintenanceMarginRate,
      margin_ok: player.maintenanceOk(market),
      short_borrow_accrued: player.shortBorrowAccrued,
      vol_override: market.gbmParams.listedEquitySigmaMult,
      trend_override: market.gbmParams.trendOverride,
      gbm: {
        global: {
          stock_fund_annual_return: market.gbmParams.stockFundAnnualReturn,
          drift_bias: market.gbmParams.driftBias,
          vol_multiplier: market.gbmParams.volMultiplier,
          listed_equity_sigma_mult: market.gbmParams.listedEquitySigmaMult,
          trend_override: market.gbmParams.trendOverride,
          sim_minutes_per_tick: config.simMinutesPerTick,
        },
        per_ticker: market.gbmParams.perTicker,
        formula: "S' = S × exp((μ − σ²/2)Δt + σ√Δt Z)",
      },
      great_depression: config.greatDepression,
      gd_fired: market.gdFired,
      shorting_enabled: config.shortingEnabled,
      taker_fee_bps: config.takerFeeBps,
      instruments,
      positions,
      open_orders: player.openOrders.length,
      order_log: player.orderLog,
      news: market.news,
    };
  }

  function chartSeries(session, ticker, bucket, maxBars) {
    const ins = session.market.byTicker[String(ticker).toUpperCase()];
    if (!ins) return { bars: [], ticker };
    const hist = ins.history;
    const b = Math.max(1, bucket || 4);
    const bars = [];
    for (let i = 0; i < hist.length; i += b) {
      const slice = hist.slice(i, i + b);
      if (!slice.length) continue;
      bars.push({
        time: slice[0].tick,
        open: slice[0].o ?? slice[0].mid,
        high: Math.max(...slice.map((x) => x.h ?? x.mid)),
        low: Math.min(...slice.map((x) => x.l ?? x.mid)),
        close: slice[slice.length - 1].c ?? slice[slice.length - 1].mid,
      });
    }
    if (maxBars > 0) return { bars: bars.slice(-maxBars), ticker: ins.ticker };
    return { bars, ticker: ins.ticker };
  }

  global.MarketSimState = { serializeState, chartSeries, fmtMoney, fmtQty };
})(typeof window !== "undefined" ? window : globalThis);
