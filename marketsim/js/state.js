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

  function bucketTicksFromSpec(spec, simMinutesPerTick) {
    const mpt = Math.max(1, Number(simMinutesPerTick) || 15);
    const n = Math.max(1, Number(spec?.n) || 1);
    const unit = String(spec?.unit || "tick").toLowerCase();
    if (unit === "tick" || unit === "ticks") return n;
    const unitMins = { minute: 1, min: 1, hour: 60, hr: 60, day: 24 * 60, week: 7 * 24 * 60 }[unit];
    if (!unitMins) return n;
    return Math.max(1, Math.round((n * unitMins) / mpt));
  }

  function bucketLabel(spec, bucketTicks, simMinutesPerTick) {
    const unit = String(spec?.unit || "tick").toLowerCase();
    const n = spec?.n || 1;
    if (unit === "tick" || unit === "ticks") {
      return bucketTicks === 1 ? "1 tick / candle" : `${bucketTicks} ticks / candle`;
    }
    const mins = bucketTicks * simMinutesPerTick;
    if (mins >= 7 * 24 * 60) return `${n} sim week / candle (${bucketTicks} ticks)`;
    if (mins >= 24 * 60) return `${n} sim day / candle (${bucketTicks} ticks)`;
    if (mins >= 60) return `${n} sim hour / candle (${bucketTicks} ticks)`;
    return `${n} sim min / candle (${bucketTicks} ticks)`;
  }

  /** Epoch anchor so Lightweight Charts gets strictly increasing UTCTimestamp values. */
  const CHART_EPOCH = 1577836800;

  function chartSeries(session, ticker, opts, maxBars) {
    const ins = session.market.byTicker[String(ticker).toUpperCase()];
    if (!ins) return { bars: [], ticker, bucket_ticks: 1, bucket_label: "" };

    const mpt = session.config.simMinutesPerTick;
    let spec;
    if (typeof opts === "number") spec = { unit: "tick", n: opts };
    else if (typeof opts === "string" && opts.includes(":")) {
      const [unit, n] = opts.split(":");
      spec = { unit, n: parseInt(n, 10) || 1 };
    } else spec = opts || { unit: "day", n: 1 };

    const bucketTicks = bucketTicksFromSpec(spec, mpt);
    const hist = ins.history;
    const buckets = new Map();

    for (const pt of hist) {
      const t = Number(pt.tick) || 0;
      const bi = Math.floor(t / bucketTicks);
      if (!buckets.has(bi)) buckets.set(bi, []);
      buckets.get(bi).push(pt);
    }

    const bars = [];
    for (const bi of [...buckets.keys()].sort((a, b) => a - b)) {
      const slice = buckets.get(bi);
      if (!slice?.length) continue;
      const startTick = bi * bucketTicks;
      bars.push({
        time: CHART_EPOCH + startTick * mpt * 60,
        open: slice[0].o ?? slice[0].mid,
        high: Math.max(...slice.map((x) => x.h ?? x.mid)),
        low: Math.min(...slice.map((x) => x.l ?? x.mid)),
        close: slice[slice.length - 1].c ?? slice[slice.length - 1].mid,
        tick_start: startTick,
        tick_end: startTick + bucketTicks - 1,
      });
    }

    const cap = maxBars > 0 ? maxBars : 400;
    const out = bars.length > cap ? bars.slice(-cap) : bars;
    return {
      bars: out,
      ticker: ins.ticker,
      bucket_ticks: bucketTicks,
      bucket_label: bucketLabel(spec, bucketTicks, mpt),
      sim_minutes_per_tick: mpt,
    };
  }

  global.MarketSimState = {
    serializeState,
    chartSeries,
    fmtMoney,
    fmtQty,
    bucketTicksFromSpec,
    bucketLabel,
    CHART_EPOCH,
  };
})(typeof window !== "undefined" ? window : globalThis);
