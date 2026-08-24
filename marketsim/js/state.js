(function (global) {
  const { equity } = global.MarketSimExecution;

  function fmtMoney(x) {
    if (Math.abs(x) >= 1e9) return `$${(x / 1e9).toFixed(2)}B`;
    if (Math.abs(x) >= 1e6) return `$${(x / 1e6).toFixed(2)}M`;
    if (Math.abs(x) >= 1e3) return `$${(x / 1e3).toFixed(2)}K`;
    return `$${Number(x).toFixed(2)}`;
  }

  function fmtQty(x) {
    const s = Number(x).toFixed(8).replace(/\.?0+$/, "");
    return s || "0";
  }

  function serializeState(session) {
    const { market, player, config } = session;
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
      ask_size: ins.book.totalAskSize(),
      bid_size: ins.book.totalBidSize(),
      sigma: ins.sigma,
    }));

    const positions = Object.entries(player.positions)
      .filter(([, q]) => Math.abs(q) > 1e-8)
      .map(([ticker, qty]) => {
        const ins = market.byTicker[ticker];
        const mv = ins ? qty * ins.mid : 0;
        return { ticker, qty, mv, mid: ins?.mid ?? 0 };
      });

    return {
      mode: config.label,
      tick: market.tick,
      sim_minutes_per_tick: config.simMinutesPerTick,
      equity: session.equity,
      cash: player.cash,
      free_cash: player.freeCash(),
      starting_cash: config.startingCash,
      vol_override: market.volOverride,
      trend_override: market.trendOverride,
      great_depression: config.greatDepression,
      shorting_enabled: config.shortingEnabled,
      max_leverage: config.maxLeverage,
      instruments,
      positions,
      order_log: player.orderLog,
      news: market.news,
    };
  }

  function chartSeries(session, ticker, bucket, maxBars) {
    const ins = session.market.byTicker[ticker.toUpperCase()];
    if (!ins) return { bars: [] };
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
    if (maxBars > 0) return { bars: bars.slice(-maxBars) };
    return { bars };
  }

  global.MarketSimState = { serializeState, chartSeries, fmtMoney, fmtQty };
})(typeof window !== "undefined" ? window : globalThis);
