(function (global) {
  const { MIN_LOT } = global.MarketSimConfig;

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

    _insert(levels, price, size, side) {
      const px = Number(price);
      const sz = roundQty(size);
      if (sz < MIN_LOT || !Number.isFinite(px) || px <= 0) return;
      const idx = levels.findIndex((l) => l.price === px);
      if (idx >= 0) levels[idx].size += sz;
      else {
        levels.push({ price: px, size: sz });
        if (side === "bid") levels.sort((a, b) => b.price - a.price);
        else levels.sort((a, b) => a.price - b.price);
      }
    }

    addBid(price, size) {
      this._insert(this.bids, price, size, "bid");
    }

    addAsk(price, size) {
      this._insert(this.asks, price, size, "ask");
    }

    consume(side, maxQty, maxCash) {
      const fills = [];
      let qtyLeft = roundQty(maxQty);
      let cashLeft = maxCash == null ? Infinity : Number(maxCash);
      const levels = side === "buy" ? this.asks : this.bids;
      while (levels.length && qtyLeft >= MIN_LOT && cashLeft > MIN_LOT) {
        const top = levels[0];
        const px = top.price;
        let take = Math.min(top.size, qtyLeft);
        if (maxCash != null) {
          const affordable = roundQty(cashLeft / px);
          take = Math.min(take, affordable);
        }
        if (take < MIN_LOT) break;
        fills.push({ price: px, size: take });
        top.size -= take;
        qtyLeft -= take;
        cashLeft -= px * take;
        if (top.size < MIN_LOT) levels.shift();
      }
      return { fills, qtyLeft, cashLeft };
    }

    clearNpc() {
      this.bids = this.bids.filter((l) => l.npc !== true);
      this.asks = this.asks.filter((l) => l.npc !== true);
    }

    seedNpc(mid, spreadBps, depthUsd, rng) {
      this.clearNpc();
      const half = (spreadBps / 10000) * 0.5;
      const layers = 4;
      for (let i = 1; i <= layers; i++) {
        const mult = 1 + half * i;
        const invMult = 1 - half * i;
        const askPx = mid * mult;
        const bidPx = mid * invMult;
        const sz = roundQty((depthUsd / layers / mid) * (0.7 + rng.next() * 0.6));
        if (sz >= MIN_LOT) {
          this.bids.push({ price: bidPx, size: sz, npc: true });
          this.asks.push({ price: askPx, size: sz, npc: true });
        }
      }
      this.bids.sort((a, b) => b.price - a.price);
      this.asks.sort((a, b) => a.price - b.price);
    }
  }

  global.MarketSimClob = { OrderBook, roundQty };
})(typeof window !== "undefined" ? window : globalThis);
