(function (global) {
  /**
   * Geometric Brownian Motion: S' = S * exp((μ - σ²/2)Δt + σ√Δt Z)
   * μ, σ are **annual** (sim-year) parameters; Δt is fraction of sim-year per tick.
   */
  function simYearFraction(simMinutesPerTick) {
    return simMinutesPerTick / (365 * 24 * 60);
  }

  function gbmStep(mid, mu, sigma, dt, z) {
    const s = Math.max(Number(mid), 1e-12);
    const m = Number(mu);
    const v = Math.max(Number(sigma), 0);
    const t = Math.max(Number(dt), 0);
    const drift = (m - 0.5 * v * v) * t;
    const diff = v * Math.sqrt(t) * z;
    return Math.max(s * Math.exp(drift + diff), 1e-9);
  }

  function defaultGbmParams(config) {
    return {
      stockFundAnnualReturn: config.stockFundAnnualReturn ?? 0.08,
      driftBias: config.driftBias ?? 0,
      volMultiplier: config.volMultiplier ?? 1,
      listedEquitySigmaMult: 1,
      trendOverride: 0,
      perTicker: {},
    };
  }

  function resolveMu(ins, market) {
    const g = market.gbmParams;
    const o = g.perTicker[ins.ticker];
    let mu = o?.mu != null ? o.mu : ins.mu;
    if (ins.assetClass === "stock" || ins.assetClass === "fund") {
      if (o?.mu == null && ins.assetClass === "stock") {
        mu = g.stockFundAnnualReturn + (ins.sectorDrift || 0) + g.driftBias;
      }
    }
    mu += g.trendOverride * 0.05;
    if (market.sectorShock?.[ins.sector]) mu += market.sectorShock[ins.sector];
    return mu;
  }

  function resolveSigma(ins, market) {
    const g = market.gbmParams;
    const o = g.perTicker[ins.ticker];
    let sigma = o?.sigma != null ? o.sigma : ins.sigma;
    sigma *= g.volMultiplier;
    if (ins.assetClass === "stock" || ins.assetClass === "fund") {
      sigma *= g.listedEquitySigmaMult;
    }
    if (ins.assetClass === "crypto") sigma *= market.cryptoVolMult(ins);
    if (ins.headlineSigmaMult && ins.headlineSigmaMult > 1) sigma *= ins.headlineSigmaMult;
    return Math.max(sigma, 1e-6);
  }

  function stepInstrument(ins, market, rng) {
    if (ins.assetClass === "fund") return ins.mid;
    const dt = simYearFraction(market.config.simMinutesPerTick);
    const mu = resolveMu(ins, market);
    const sigma = resolveSigma(ins, market);
    const z = rng.normal();
    ins.lastMu = mu;
    ins.lastSigma = sigma;
    ins.lastDt = dt;
    ins.lastZ = z;
    ins.mid = gbmStep(ins.mid, mu, sigma, dt, z);
    return ins.mid;
  }

  function setPerTicker(market, ticker, patch) {
    const t = ticker.toUpperCase();
    market.gbmParams.perTicker[t] = Object.assign(
      {},
      market.gbmParams.perTicker[t] || {},
      patch
    );
  }

  function setGlobalGbm(market, patch) {
    Object.assign(market.gbmParams, patch);
  }

  function applyScopeGbm(market, scope, patch) {
    const sc = String(scope || "selected").toLowerCase();
    if (sc === "all") {
      for (const ins of market.instruments) {
        if (ins.assetClass === "fund") continue;
        setPerTicker(market, ins.ticker, patch);
      }
      return;
    }
    const classes = {
      stocks: "stock",
      stock: "stock",
      funds: "fund",
      fund: "fund",
      crypto: "crypto",
      cryptos: "crypto",
    };
    const cls = classes[sc];
    if (cls) {
      for (const ins of market.instruments) {
        if (ins.assetClass === cls) setPerTicker(market, ins.ticker, patch);
      }
      return;
    }
    if (market.byTicker[sc.toUpperCase()]) setPerTicker(market, sc, patch);
  }

  global.MarketSimGbm = {
    simYearFraction,
    gbmStep,
    defaultGbmParams,
    resolveMu,
    resolveSigma,
    stepInstrument,
    setPerTicker,
    setGlobalGbm,
    applyScopeGbm,
  };
})(typeof window !== "undefined" ? window : globalThis);
