(function (global) {
  const MEGA_N_STOCKS = 32;
  const MEGA_N_FUNDS = 4;
  const MEGA_N_CRYPTO = 8;
  const STARTING_CASH_MIN_USD = 1e-4;
  const STARTING_CASH_MAX_USD = 100_000_000;
  const MIN_LOT = 1e-8;
  const MIN_NOTIONAL = 1e-6;
  const SIM_MINUTES_PER_TICK_DEFAULT = 15;
  const TICKS_PER_SIM_DAY = (24 * 60) / SIM_MINUTES_PER_TICK_DEFAULT;

  const SECTORS = [
    "Tech",
    "Health",
    "Finance",
    "Energy",
    "Consumer",
    "Industrial",
    "Materials",
    "Utilities",
  ];

  const STOCK_NAMES = [
    "NORTH", "APEX", "LUMEN", "ORBIT", "VANTA", "HELIX", "PRISM", "CIPHER",
    "FORGE", "ATLAS", "NOVA", "PULSE", "VERTEX", "EMBER", "STRIDE", "CLOUD",
    "MATRIX", "HARBOR", "SUMMIT", "RIDGE", "FLUX", "SPHERE", "CANYON", "BLOOM",
    "TITAN", "GLIDE", "MERC", "SOLAR", "QUANT", "DELTA", "CREST", "ZENITH",
  ];

  const CRYPTO_NAMES = ["BTCX", "ETHX", "SOLX", "ADAX", "DOTX", "AVAX", "LINKX", "DOGX"];
  const FUND_NAMES = ["T16", "T25", "C3", "S10"];

  function baseMega(label, overrides) {
    return Object.assign(
      {
        label,
        wallSecondsPerTick: 0.3,
        simTimeScale: 1,
        volMultiplier: 1,
        driftBias: 0,
        startingCash: 25_000_000,
        nStocks: MEGA_N_STOCKS,
        nFunds: MEGA_N_FUNDS,
        nCrypto: MEGA_N_CRYPTO,
        spreadBps: 10,
        seed: null,
        simMinutesPerTick: SIM_MINUTES_PER_TICK_DEFAULT,
        stockFundAnnualReturn: 0.08,
        greatDepression: false,
        cryptoTopTier: 3,
        cryptoTierVolMult: 0.72,
        cryptoMcapVolPower: 0.22,
        cryptoMcapRefUsd: 1e11,
        cryptoVolMaxMult: 2.5,
        maxLeverage: 1,
        maintenanceMarginRate: 0.25,
        shortingEnabled: false,
        shortBorrowBpsPerSimDay: 0,
        secFeeSellBps: 0,
        overnightGapMaxBps: 0,
        takerFeeBps: 0,
        slippageBpsBase: 0,
        frontRunBps: 0,
        npcDepthUsd: 250_000,
        floatFlowBpsPerTick: 0.002,
        cryptoMintProb: 0.012,
        cryptoMintMaxPct: 0.0015,
      },
      overrides || {}
    );
  }

  const PRESETS = {
    simple: baseMega("simple", { volMultiplier: 0.5, spreadBps: 8, startingCash: 25_000_000 }),
    easy: baseMega("easy", {
      volMultiplier: 0.6,
      driftBias: 0.00005,
      spreadBps: 6,
      startingCash: 40_000_000,
      simTimeScale: 0.5,
    }),
    hard: baseMega("hard", {
      volMultiplier: 1.4,
      spreadBps: 18,
      startingCash: 8_000_000,
      simTimeScale: 2,
      maxLeverage: 1.5,
      maintenanceMarginRate: 0.22,
      shortingEnabled: true,
      shortBorrowBpsPerSimDay: 1.2,
      secFeeSellBps: 0.05,
      overnightGapMaxBps: 0.8,
      takerFeeBps: 2.2,
      slippageBpsBase: 1.6,
      frontRunBps: 0.6,
    }),
    complex: baseMega("complex", {
      volMultiplier: 1.1,
      driftBias: -0.00002,
      spreadBps: 12,
      startingCash: 18_000_000,
      maxLeverage: 1.25,
      maintenanceMarginRate: 0.2,
      shortingEnabled: true,
      shortBorrowBpsPerSimDay: 0.6,
      secFeeSellBps: 0.02,
      overnightGapMaxBps: 0.4,
    }),
    free: baseMega("free", { volMultiplier: 0.9 }),
    custom: baseMega("custom", { volMultiplier: 1 }),
  };

  function preset(mode) {
    return Object.assign({}, PRESETS[String(mode || "simple").toLowerCase()] || PRESETS.simple);
  }

  function buildCustom(opts) {
    return baseMega("custom", Object.assign({}, opts || {}));
  }

  function clampStartingCash(v) {
    const x = Number(v);
    if (!Number.isFinite(x)) throw new Error("cash must be a finite number");
    if (x < STARTING_CASH_MIN_USD || x > STARTING_CASH_MAX_USD) {
      throw new Error(`cash must be between ${STARTING_CASH_MIN_USD} and ${STARTING_CASH_MAX_USD} USD`);
    }
    return x;
  }

  global.MarketSimConfig = {
    MEGA_N_STOCKS,
    MEGA_N_FUNDS,
    MEGA_N_CRYPTO,
    STARTING_CASH_MIN_USD,
    STARTING_CASH_MAX_USD,
    MIN_LOT,
    MIN_NOTIONAL,
    SIM_MINUTES_PER_TICK_DEFAULT,
    TICKS_PER_SIM_DAY,
    SECTORS,
    STOCK_NAMES,
    CRYPTO_NAMES,
    FUND_NAMES,
    PRESETS,
    preset,
    buildCustom,
    clampStartingCash,
  };
})(typeof window !== "undefined" ? window : globalThis);
