(function (global) {
  const {
    MEGA_N_STOCKS,
    MEGA_N_FUNDS,
    MEGA_N_CRYPTO,
    SECTORS,
    STOCK_NAMES,
    CRYPTO_NAMES,
    FUND_NAMES,
  } = global.MarketSimConfig;
  const { OrderBook } = global.MarketSimClob;

  function makeInstrument(ticker, assetClass, opts) {
    const mid = opts.mid ?? 100;
    return {
      ticker,
      name: opts.name || ticker,
      assetClass,
      sector: opts.sector || null,
      mid,
      bid: mid * 0.999,
      ask: mid * 1.001,
      sigma: opts.sigma ?? 0.2,
      mu: opts.mu ?? 0.08,
      volume: 0,
      unitsOutstanding: opts.unitsOutstanding ?? 1e9,
      maxUnitsOutstanding: opts.maxUnitsOutstanding ?? null,
      basket: opts.basket || null,
      history: [{ tick: 0, mid, o: mid, h: mid, l: mid, c: mid }],
      book: new OrderBook(ticker),
      pct24h: 0,
      refMid: mid,
    };
  }

  function buildMegaUniverse(rng, config) {
    const instruments = [];
    const stocks = [];
    for (let i = 0; i < MEGA_N_STOCKS; i++) {
      const sector = SECTORS[i % SECTORS.length];
      const mid = rng.uniform(40, 400);
      const ins = makeInstrument(STOCK_NAMES[i], "stock", {
        name: STOCK_NAMES[i],
        sector,
        mid,
        sigma: rng.uniform(0.15, 0.35) * config.volMultiplier,
        mu: config.stockFundAnnualReturn + rng.uniform(-0.02, 0.04) + config.driftBias,
        unitsOutstanding: rng.uniform(5e8, 2e9),
      });
      instruments.push(ins);
      stocks.push(ins);
    }

    stocks.sort((a, b) => b.mid * b.unitsOutstanding - a.mid * a.unitsOutstanding);
    const top16 = stocks.slice(0, 16).map((s) => s.ticker);
    const top25 = stocks.slice(0, 25).map((s) => s.ticker);

    const cryptos = [];
    for (let i = 0; i < MEGA_N_CRYPTO; i++) {
      const mid = rng.uniform(0.5, 50000);
      const units =
        i === 0 ? 21_000_000 : rng.uniform(1e8, 5e9);
      const ins = makeInstrument(CRYPTO_NAMES[i], "crypto", {
        name: CRYPTO_NAMES[i],
        mid,
        sigma: rng.uniform(0.4, 1.2) * config.volMultiplier,
        mu: rng.uniform(-0.05, 0.15),
        unitsOutstanding: units,
        maxUnitsOutstanding: i === 0 ? 21_000_000 : null,
      });
      instruments.push(ins);
      cryptos.push(ins);
    }
    cryptos.sort((a, b) => b.mid * b.unitsOutstanding - a.mid * a.unitsOutstanding);
    const top3Crypto = cryptos.slice(0, 3).map((c) => c.ticker);

    const sectorTickers = {};
    for (const s of SECTORS) {
      sectorTickers[s] = stocks.filter((x) => x.sector === s).map((x) => x.ticker);
    }
    const biggestSector = SECTORS.reduce((a, b) =>
      (sectorTickers[a]?.length || 0) >= (sectorTickers[b]?.length || 0) ? a : b
    );

    const fundDefs = [
      { ticker: FUND_NAMES[0], basket: top16 },
      { ticker: FUND_NAMES[1], basket: top25 },
      { ticker: FUND_NAMES[2], basket: top3Crypto },
      { ticker: FUND_NAMES[3], basket: sectorTickers[biggestSector] || top16.slice(0, 10) },
    ];

    for (const fd of fundDefs) {
      const nav = 100;
      instruments.push(
        makeInstrument(fd.ticker, "fund", {
          name: fd.ticker,
          mid: nav,
          sigma: 0.12 * config.volMultiplier,
          mu: config.stockFundAnnualReturn,
          basket: fd.basket,
          unitsOutstanding: 5e8,
        })
      );
    }

    return instruments;
  }

  global.MarketSimUniverse = { buildMegaUniverse, makeInstrument };
})(typeof window !== "undefined" ? window : globalThis);
