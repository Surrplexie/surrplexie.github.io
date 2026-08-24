(function (global) {
  const { MIN_LOT, MIN_NOTIONAL } = global.MarketSimConfig;
  const { roundQty } = global.MarketSimClob;

  const Result = {
    OK: "OK",
    NO_CASH: "NO_CASH",
    NO_POSITION: "NO_POSITION",
    NOT_FOUND: "NOT_FOUND",
    BAD_SIZE: "BAD_SIZE",
    BAD_PRICE: "BAD_PRICE",
    NO_LIQUIDITY: "NO_LIQUIDITY",
    MARGIN: "MARGIN",
  };

  function resultMsg(r) {
    return (
      {
        OK: "ok",
        NO_CASH: "insufficient cash",
        NO_POSITION: "not enough position",
        NOT_FOUND: "unknown ticker",
        BAD_SIZE: "size / notional invalid",
        BAD_PRICE: "bad price",
        NO_LIQUIDITY: "not enough resting liquidity on the book",
        MARGIN: "margin / leverage limit",
      }[r] || r
    );
  }

  function equity(session) {
    return session.player.equity(session.market);
  }

  function takerFee(config, notional) {
    return (notional * (config.takerFeeBps || 0)) / 10000;
  }

  function secFee(config, notional) {
    return (notional * (config.secFeeSellBps || 0)) / 10000;
  }

  function slippageBps(config) {
    return (config.slippageBpsBase || 0) + (config.frontRunBps || 0);
  }

  function maxMarketBuyQty(ins, player, config) {
    return ins.book.totalAskSize();
  }

  function maxMarketSellQty(ins, player, config) {
    const avail = player.freeToSell(ins.ticker);
    const book = ins.book.totalBidSize();
    if (config.shortingEnabled) return Math.max(book, roundQty(player.position(ins.ticker) + book));
    return Math.min(avail, book);
  }

  function applyFills(session, ins, side, fills) {
    const { player, market, config } = session;
    if (!fills.length) return Result.NO_LIQUIDITY;
    let totalQty = 0;
    let totalNotional = 0;
    for (const f of fills) {
      totalQty += f.size;
      totalNotional += f.size * f.price;
    }
    const avg = totalNotional / totalQty;
    const fee =
      side === "buy"
        ? takerFee(config, totalNotional)
        : takerFee(config, totalNotional) + secFee(config, totalNotional);
    if (side === "buy" && !player.canSpend(totalNotional + fee)) return Result.NO_CASH;
    player.applyFill(ins.ticker, side, totalQty, avg, fee);
    market.recordFill(ins.ticker, totalQty, avg);
    player.log(`${side.toUpperCase()} ${totalQty} ${ins.ticker} @ ~${avg.toFixed(4)}`);
    if (!player.maintenanceOk(market)) player.log("⚠ margin stress");
    return Result.OK;
  }

  function marketBuy(session, ticker, sizeOrCash, byCash) {
    const { market, player, config } = session;
    const ins = market.byTicker[String(ticker).toUpperCase()];
    if (!ins) return Result.NOT_FOUND;

    let maxQty = maxMarketBuyQty(ins, player, config);
    let maxCash = null;
    if (byCash) {
      maxCash = Number(sizeOrCash);
      if (!Number.isFinite(maxCash) || maxCash < MIN_NOTIONAL) return Result.BAD_SIZE;
    } else {
      maxQty = Math.min(maxQty, roundQty(sizeOrCash));
      if (maxQty < MIN_LOT) return Result.BAD_SIZE;
    }

    const { fills } = ins.book.consume("buy", maxQty, maxCash, slippageBps(config));
    if (!fills.length) return Result.NO_LIQUIDITY;
    return applyFills(session, ins, "buy", fills);
  }

  function marketSell(session, ticker, size) {
    const { market, player, config } = session;
    const ins = market.byTicker[String(ticker).toUpperCase()];
    if (!ins) return Result.NOT_FOUND;

    let qty = roundQty(size);
    if (qty < MIN_LOT) return Result.BAD_SIZE;

    const cap = maxMarketSellQty(ins, player, config);
    if (!config.shortingEnabled) qty = Math.min(qty, cap);
    else qty = Math.min(qty, roundQty(cap));
    if (qty < MIN_LOT) return Result.NO_POSITION;

    const bookCap = ins.book.totalBidSize();
    qty = Math.min(qty, bookCap);
    if (qty < MIN_LOT) return Result.NO_LIQUIDITY;

    const { fills } = ins.book.consume("sell", qty, null, slippageBps(config));
    return applyFills(session, ins, "sell", fills);
  }

  function limitOrder(session, ticker, side, size, price) {
    const { market, player } = session;
    const ins = market.byTicker[String(ticker).toUpperCase()];
    if (!ins) return Result.NOT_FOUND;
    const px = Number(price);
    const sz = roundQty(size);
    if (sz < MIN_LOT || !Number.isFinite(px) || px <= 0) return Result.BAD_SIZE;

    const orderId = ins.book.nextOrderId();
    if (side === "buy") {
      const need = sz * px;
      if (!player.canSpend(need)) return Result.NO_CASH;
      ins.book.addBid(px, sz, { player: true, orderId });
      player.registerLimit(orderId, ins.ticker, "buy", sz, px);
    } else {
      if (!session.config.shortingEnabled && player.freeToSell(ins.ticker) < sz) return Result.NO_POSITION;
      if (player.freeToSell(ins.ticker) < sz && !session.config.shortingEnabled) return Result.NO_POSITION;
      if (player.position(ins.ticker) - (player.lockedSell[ins.ticker] || 0) < sz && !session.config.shortingEnabled) {
        return Result.NO_POSITION;
      }
      ins.book.addAsk(px, sz, { player: true, orderId });
      player.registerLimit(orderId, ins.ticker, "sell", sz, px);
    }
    player.log(`LIMIT ${side.toUpperCase()} ${sz} ${ins.ticker} @ ${px}`);
    return Result.OK;
  }

  function limitBuyCash(session, ticker, cash, price) {
    const px = Number(price);
    const c = Number(cash);
    if (!Number.isFinite(px) || px <= 0 || !Number.isFinite(c)) return Result.BAD_SIZE;
    return limitOrder(session, ticker, "buy", roundQty(c / px), px);
  }

  /** Match player limits against NPC when price crosses. */
  function matchPlayerLimits(session) {
    const { market, player } = session;
    for (const ins of market.instruments) {
      const mid = ins.mid;
      for (const po of [...ins.book.playerOrders]) {
        if (po.side === "buy" && mid <= po.price) {
          const sz = Math.min(po.size, roundQty(po.size));
          ins.book.cancelOrder(po.orderId);
          player.releaseLimit(po.orderId);
          const fake = [{ price: Math.min(mid, po.price), size: sz }];
          applyFills(session, ins, "buy", fake);
        } else if (po.side === "sell" && mid >= po.price) {
          const sz = Math.min(po.size, roundQty(po.size));
          ins.book.cancelOrder(po.orderId);
          player.releaseLimit(po.orderId);
          const fake = [{ price: Math.max(mid, po.price), size: sz }];
          applyFills(session, ins, "sell", fake);
        }
      }
    }
  }

  global.MarketSimExecution = {
    Result,
    resultMsg,
    equity,
    marketBuy,
    marketSell,
    limitOrder,
    limitBuyCash,
    matchPlayerLimits,
  };
})(typeof window !== "undefined" ? window : globalThis);
