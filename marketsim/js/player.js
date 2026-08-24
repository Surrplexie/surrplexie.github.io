(function (global) {
  const { MIN_LOT } = global.MarketSimConfig;

  class Player {
    constructor(cash, config) {
      this.cash = Number(cash) || 0;
      this.config = config || {};
      this.positions = {};
      this.lockedCash = 0;
      this.lockedSell = {};
      this.openOrders = [];
      this.orderLog = [];
      this.shortBorrowAccrued = 0;
    }

    position(ticker) {
      return this.positions[ticker] || 0;
    }

    freeCash() {
      return this.cash - this.lockedCash;
    }

    freeToSell(ticker) {
      const pos = this.position(ticker);
      const locked = this.lockedSell[ticker] || 0;
      return Math.max(0, pos - locked);
    }

    grossExposure(market) {
      let longG = 0;
      let shortG = 0;
      for (const [t, q] of Object.entries(this.positions)) {
        const ins = market.byTicker[t];
        if (!ins) continue;
        const mv = q * ins.mid;
        if (mv >= 0) longG += mv;
        else shortG += -mv;
      }
      return { longG, shortG, gross: longG + shortG };
    }

    equity(market) {
      let eq = this.cash;
      for (const [t, q] of Object.entries(this.positions)) {
        const ins = market.byTicker[t];
        if (ins) eq += q * ins.mid;
      }
      return eq - this.shortBorrowAccrued;
    }

    maintenanceOk(market) {
      const eq = this.equity(market);
      if (eq <= 0) return false;
      const { gross } = this.grossExposure(market);
      const maxLev = this.config.maxLeverage || 1;
      const maint = this.config.maintenanceMarginRate || 0.25;
      if (gross > maxLev * eq) return false;
      if (gross > 0 && eq / gross < maint) return false;
      return true;
    }

    canSpend(amount) {
      return this.freeCash() >= amount - 1e-9;
    }

    applyFill(ticker, side, size, avgPrice, fee) {
      const sz = size;
      const notional = sz * avgPrice;
      if (side === "buy") {
        this.cash -= notional + fee;
        this.positions[ticker] = (this.positions[ticker] || 0) + sz;
      } else {
        this.cash += notional - fee;
        this.positions[ticker] = (this.positions[ticker] || 0) - sz;
        if (Math.abs(this.positions[ticker]) < MIN_LOT) delete this.positions[ticker];
      }
    }

    registerLimit(orderId, ticker, side, size, price) {
      const notional = size * price;
      if (side === "buy") {
        this.lockedCash += notional;
      } else {
        this.lockedSell[ticker] = (this.lockedSell[ticker] || 0) + size;
      }
      this.openOrders.push({ orderId, ticker, side, size, price, remaining: size });
    }

    releaseLimit(orderId) {
      const idx = this.openOrders.findIndex((o) => o.orderId === orderId);
      if (idx < 0) return null;
      const o = this.openOrders.splice(idx, 1)[0];
      const rem = o.remaining ?? o.size;
      if (o.side === "buy") this.lockedCash -= rem * o.price;
      else this.lockedSell[o.ticker] = (this.lockedSell[o.ticker] || 0) - rem;
      return o;
    }

    accrueBorrow(market) {
      if (!this.config.shortingEnabled) return;
      const bps = this.config.shortBorrowBpsPerSimDay || 0;
      if (bps <= 0) return;
      const mpt = market.config.simMinutesPerTick;
      const dayFrac = mpt / (24 * 60);
      for (const [t, q] of Object.entries(this.positions)) {
        if (q >= 0) continue;
        const ins = market.byTicker[t];
        if (!ins) continue;
        this.shortBorrowAccrued += (-q * ins.mid * bps * dayFrac) / 10000;
      }
    }

    log(msg) {
      this.orderLog.unshift({ tick: null, msg, ts: Date.now() });
      this.orderLog = this.orderLog.slice(0, 60);
    }
  }

  global.MarketSimPlayer = { Player };
})(typeof window !== "undefined" ? window : globalThis);
