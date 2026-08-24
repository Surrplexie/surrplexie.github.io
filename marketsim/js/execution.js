(function (global) {
  const { MIN_LOT, MIN_NOTIONAL } = global.MarketSimConfig;
  const { roundQty } = global.MarketSimClob;
  const { equity } = global.MarketSimPlayer;

  const Result = {
    OK: "OK",
    NO_CASH: "NO_CASH",
    NO_POSITION: "NO_POSITION",
    NOT_FOUND: "NOT_FOUND",
    BAD_SIZE: "BAD_SIZE",
    BAD_PRICE: "BAD_PRICE",
    NO_LIQUIDITY: "NO_LIQUIDITY",
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
      }[r] || r
    );
  }

  function takerFee(config, notional) {
    return (notional * (config.takerFeeBps || 0)) / 10000;
  }

  function secFee(config, notional) {
    return (notional * (config.secFeeSellBps || 0)) / 10000;
  }

  function marketBuy(session, ticker, sizeOrCash, byCash) {
    const { market, player, config } = session;
    const ins = market.byTicker[ticker.toUpperCase()];
    if (!ins) return Result.NOT_FOUND;

    let maxQty = Infinity;
    let maxCash = player.freeCash();
    if (byCash) {
      maxCash = Number(sizeOrCash);
      if (!Number.isFinite(maxCash) || maxCash < MIN_NOTIONAL) return Result.BAD_SIZE;
    } else {
      maxQty = roundQty(sizeOrCash);
      if (maxQty < MIN_LOT) return Result.BAD_SIZE;
    }

    const { fills } = ins.book.consume("buy", maxQty, byCash ? maxCash : null);
    if (!fills.length) return Result.NO_LIQUIDITY;

    let totalQty = 0;
    let totalCost = 0;
    for (const f of fills) {
      totalQty += f.size;
      totalCost += f.size * f.price;
    }
    const fee = takerFee(config, totalCost);
    if (player.freeCash() < totalCost + fee) return Result.NO_CASH;

    player.applyFill(ins.ticker, "buy", totalQty, totalCost / totalQty, fee);
    market.recordFill(ins.ticker, totalQty, totalCost / totalQty);
    player.log(`BUY ${totalQty} ${ins.ticker} ~$${totalCost.toFixed(2)}`);
    return Result.OK;
  }

  function marketSell(session, ticker, size) {
    const { market, player, config } = session;
    const ins = market.byTicker[ticker.toUpperCase()];
    if (!ins) return Result.NOT_FOUND;

    let qty = roundQty(size);
    if (qty < MIN_LOT) return Result.BAD_SIZE;

    const available = player.freeToSell(ins.ticker);
    if (config.shortingEnabled && qty > available) {
      const shortExtra = qty - available;
      if (shortExtra > 0) qty = available + shortExtra;
    } else {
      qty = Math.min(qty, available);
    }
    if (qty < MIN_LOT) return Result.NO_POSITION;

    const { fills } = ins.book.consume("sell", qty, null);
    if (!fills.length) return Result.NO_LIQUIDITY;

    let totalQty = 0;
    let proceeds = 0;
    for (const f of fills) {
      totalQty += f.size;
      proceeds += f.size * f.price;
    }
    const fee = takerFee(config, proceeds) + secFee(config, proceeds);
    player.applyFill(ins.ticker, "sell", totalQty, proceeds / totalQty, fee);
    market.recordFill(ins.ticker, totalQty, proceeds / totalQty);
    player.log(`SELL ${totalQty} ${ins.ticker} ~$${proceeds.toFixed(2)}`);
    return Result.OK;
  }

  function limitOrder(session, ticker, side, size, price) {
    const { market, player } = session;
    const ins = market.byTicker[ticker.toUpperCase()];
    if (!ins) return Result.NOT_FOUND;
    const px = Number(price);
    const sz = roundQty(size);
    if (sz < MIN_LOT || !Number.isFinite(px) || px <= 0) return Result.BAD_SIZE;

    if (side === "buy") {
      const need = sz * px;
      if (player.freeCash() < need) return Result.NO_CASH;
      player.lockedCash += need;
      ins.book.addBid(px, sz);
    } else {
      if (player.freeToSell(ins.ticker) < sz) return Result.NO_POSITION;
      player.lockedSell[ins.ticker] = (player.lockedSell[ins.ticker] || 0) + sz;
      ins.book.addAsk(px, sz);
    }
    player.log(`${side.toUpperCase()} LIMIT ${sz} ${ins.ticker} @ ${px}`);
    return Result.OK;
  }

  global.MarketSimExecution = {
    Result,
    resultMsg,
    marketBuy,
    marketSell,
    limitOrder,
    equity,
  };
})(typeof window !== "undefined" ? window : globalThis);
