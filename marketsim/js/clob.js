(function (global) {
  const { MIN_LOT, MIN_NOTIONAL } = global.MarketSimConfig;

  let _nextOrderId = 1;

  function roundQty(q) {
    const x = Number(q);
    if (!Number.isFinite(x) || x <= 0) return 0;
    return Math.floor(x / MIN_LOT) * MIN_LOT;
  }

  class OrderBook {
    constructor(ticker) {
      this.ticker = ticker;
      this.bids = [];
      this.asks = [];
      this.playerOrders = [];
    }

    bestBid() {
      return this.bids.length ? this.bids[0].price : null;
    }

    bestAsk() {
      return this.asks.length ? this.asks[0].price : null;
    }

    totalAskSize() {
      return this.asks.reduce((s, l) => s + l.size, 0);
    }

    totalBidSize() {
      return this.bids.reduce((s, l) => s + l.size, 0);
    }

    _sort(side) {
      if (side === "bid") this.bids.sort((a, b) => b.price - a.price);
      else this.asks.sort((a, b) => a.price - b.price);
    }

    _insert(levels, level, side) {
      const idx = levels.findIndex((l) => l.price === level.price && l.player === level.player);
      if (idx >= 0) levels[idx].size += level.size;
      else levels.push(level);
      this._sort(side);
    }

    addBid(price, size, meta) {
      const px = Number(price);
      const sz = roundQty(size);
      if (sz < MIN_LOT || !Number.isFinite(px) || px <= 0) return null;
      const level = Object.assign({ price: px, size: sz, side: "buy" }, meta || {});
      this._insert(this.bids, level, "bid");
      if (level.orderId) this.playerOrders.push(level);
      return level;
    }

    addAsk(price, size, meta) {
      const px = Number(price);
      const sz = roundQty(size);
      if (sz < MIN_LOT || !Number.isFinite(px) || px <= 0) return null;
      const level = Object.assign({ price: px, size: sz, side: "sell" }, meta || {});
      this._insert(this.asks, level, "ask");
      if (level.orderId) this.playerOrders.push(level);
      return level;
    }

    consume(side, maxQty, maxCash, slippageBps) {
      const fills = [];
      let qtyLeft = roundQty(maxQty);
      let cashLeft = maxCash == null ? Infinity : Number(maxCash);
      const levels = side === "buy" ? this.asks : this.bids;
      const slip = (Number(slippageBps) || 0) / 10000;

      while (levels.length && qtyLeft >= MIN_LOT && cashLeft > MIN_NOTIONAL) {
        const top = levels[0];
        let px = top.price;
        if (slip > 0) px *= side === "buy" ? 1 + slip : 1 - slip;
        let take = Math.min(top.size, qtyLeft);
        if (maxCash != null) {
          take = Math.min(take, roundQty(cashLeft / px));
        }
        if (take < MIN_LOT) break;
        fills.push({ price: px, size: take, player: top.player || false });
        top.size -= take;
        qtyLeft -= take;
        cashLeft -= px * take;
        if (top.size < MIN_LOT) {
          levels.shift();
          if (top.orderId) this._removePlayerOrder(top.orderId);
        }
      }
      return { fills, qtyLeft, cashLeft };
    }

    _removePlayerOrder(orderId) {
      this.playerOrders = this.playerOrders.filter((o) => o.orderId !== orderId);
    }

    cancelOrder(orderId) {
      for (const arr of [this.bids, this.asks]) {
        const idx = arr.findIndex((l) => l.orderId === orderId);
        if (idx >= 0) {
          const [lv] = arr.splice(idx, 1);
          this._removePlayerOrder(orderId);
          return lv;
        }
      }
      return null;
    }

    clearNpc() {
      this.bids = this.bids.filter((l) => !l.npc);
      this.asks = this.asks.filter((l) => !l.npc);
    }

    openingSpreadMult(simMinuteOfDay) {
      const open = 9 * 60 + 30;
      const close = 16 * 60;
      if (simMinuteOfDay < open || simMinuteOfDay > close) return 1.35;
      if (simMinuteOfDay < open + 45) return 1.55;
      if (simMinuteOfDay > close - 30) return 1.25;
      return 1;
    }

    seedNpc(mid, spreadBps, depthUsd, rng, simMinuteOfDay) {
      this.clearNpc();
      const openMult = this.openingSpreadMult(simMinuteOfDay ?? 12 * 60);
      const half = ((spreadBps * openMult) / 10000) * 0.5;
      const layers = 5;
      for (let i = 1; i <= layers; i++) {
        const askPx = mid * (1 + half * i);
        const bidPx = mid * (1 - half * i);
        const sz = roundQty((depthUsd / layers / mid) * (0.65 + rng.next() * 0.7));
        if (sz >= MIN_LOT) {
          this.bids.push({ price: bidPx, size: sz, npc: true });
          this.asks.push({ price: askPx, size: sz, npc: true });
        }
      }
      this._sort("bid");
      this._sort("ask");
    }

    nextOrderId() {
      return _nextOrderId++;
    }
  }

  global.MarketSimClob = { OrderBook, roundQty, MIN_LOT_REF: MIN_LOT };
})(typeof window !== "undefined" ? window : globalThis);
