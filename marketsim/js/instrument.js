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

  const AssetClass = { STOCK: "stock", FUND: "fund", CRYPTO: "crypto" };

  function makeInstrument(ticker, assetClass, opts) {
    const mid = opts.mid ?? 100;
    return {
      ticker,
      name: opts.name || ticker,
      assetClass,
      sector: opts.sector || null,
      sectorDrift: opts.sectorDrift || 0,
      mid,
      bid: mid * 0.999,
      ask: mid * 1.001,
      sigma: opts.sigma ?? 0.2,
      mu: opts.mu ?? 0.08,
      baseSigma: opts.sigma ?? 0.2,
      baseMu: opts.mu ?? 0.08,
      volume: 0,
      sessionVolume: 0,
      unitsOutstanding: opts.unitsOutstanding ?? 1e9,
      maxUnitsOutstanding: opts.maxUnitsOutstanding ?? null,
      basket: opts.basket || null,
      history: [{ tick: 0, mid, o: mid, h: mid, l: mid, c: mid }],
      book: new OrderBook(ticker),
      pct24h: 0,
      refMid: mid,
      headlineSigmaMult: 1,
      gdRecoveryTarget: null,
      lastMu: null,
      lastSigma: null,
    };
  }

  function buildClassicUniverse(rng, config) {
    const instruments = [];
    for (let i = 0; i < config.nStocks; i++) {
      const t = `S${i + 1}`;
      instruments.push(
        makeInstrument(t, AssetClass.STOCK, {
          sector: SECTORS[i % SECTORS.length],
          mid: rng.uniform(20, 300),
          sigma: rng.uniform(0.12, 0.4) * config.volMultiplier,
          mu: config.stockFundAnnualReturn + config.driftBias,
          unitsOutstanding: rng.uniform(1e8, 1e9),
        })
      );
    }
    for (let i = 0; i < config.nCrypto; i++) {
      instruments.push(
        makeInstrument(`C${i + 1}`, AssetClass.CRYPTO, {
          mid: rng.uniform(1, 5000),
          sigma: rng.uniform(0.5, 1.5) * config.volMultiplier,
          mu: rng.uniform(-0.05, 0.12),
          unitsOutstanding: rng.uniform(1e7, 1e9),
        })
      );
    }
    for (let i = 0; i < config.nFunds; i++) {
      instruments.push(
        makeInstrument(`F${i + 1}`, AssetClass.FUND, {
          mid: 100,
          sigma: 0.1 * config.volMultiplier,
          mu: config.stockFundAnnualReturn,
          basket: instruments.filter((x) => x.assetClass === AssetClass.STOCK).slice(0, 5 + i).map((x) => x.ticker),
          unitsOutstanding: 5e8,
        })
      );
    }
    return instruments;
  }

  function buildMegaUniverse(rng, config) {
    if (
      config.nStocks !== MEGA_N_STOCKS ||
      config.nFunds !== MEGA_N_FUNDS ||
      config.nCrypto !== MEGA_N_CRYPTO
    ) {
      return buildClassicUniverse(rng, config);
    }

    const instruments = [];
    const stocks = [];
    const sectorDrifts = {};
    for (const s of SECTORS) sectorDrifts[s] = rng.uniform(-0.015, 0.025);

    for (let i = 0; i < MEGA_N_STOCKS; i++) {
      const sector = SECTORS[i % SECTORS.length];
      const mid = rng.uniform(40, 400);
      const ins = makeInstrument(STOCK_NAMES[i], AssetClass.STOCK, {
        sector,
        sectorDrift: sectorDrifts[sector],
        mid,
        sigma: rng.uniform(0.15, 0.35) * config.volMultiplier,
        mu: config.stockFundAnnualReturn + sectorDrifts[sector] + config.driftBias,
        unitsOutstanding: rng.uniform(5e8, 2e9),
        maxUnitsOutstanding: rng.uniform(8e8, 3e9),
      });
      instruments.push(ins);
      stocks.push(ins);
    }

    stocks.sort((a, b) => b.mid * b.unitsOutstanding - a.mid * a.unitsOutstanding);
    const top16 = stocks.slice(0, 16).map((s) => s.ticker);
    const top25 = stocks.slice(0, 25).map((s) => s.ticker);

    const cryptos = [];
    for (let i = 0; i < MEGA_N_CRYPTO; i++) {
      const mid = i === 0 ? rng.uniform(20000, 60000) : rng.uniform(0.5, 8000);
      const units = i === 0 ? 21_000_000 : rng.uniform(1e8, 5e9);
      const ins = makeInstrument(CRYPTO_NAMES[i], AssetClass.CRYPTO, {
        mid,
        sigma: rng.uniform(0.4, 1.2) * config.volMultiplier,
        mu: rng.uniform(-0.05, 0.15),
        unitsOutstanding: units,
        maxUnitsOutstanding: i === 0 ? 21_000_000 : null,
      });
      instruments.push(ins);
      cryptos.push(ins);
    }
    cryptos.sort((a, b) => b.mid * b.unitsOutstanding - a.mid * b.unitsOutstanding);
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
      instruments.push(
        makeInstrument(fd.ticker, AssetClass.FUND, {
          mid: 100,
          sigma: 0.12 * config.volMultiplier,
          mu: config.stockFundAnnualReturn,
          basket: fd.basket,
          unitsOutstanding: 5e8,
        })
      );
    }
    return instruments;
  }

  function makeUniverse(rng, config) {
    return buildMegaUniverse(rng, config);
  }

  global.MarketSimInstrument = { AssetClass, makeInstrument, makeUniverse, buildMegaUniverse, buildClassicUniverse };
  global.MarketSimUniverse = { buildMegaUniverse, makeInstrument, makeUniverse };
})(typeof window !== "undefined" ? window : globalThis);
