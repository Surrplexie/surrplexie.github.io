(function (global) {
  const { MIN_LOT, MIN_NOTIONAL } = global.MarketSimConfig;
  const { roundQty } = global.MarketSimClob;

  class Player {
    constructor(cash) {
      this.cash = Number(cash) || 0;
      this.positions = {};
      this.lockedCash = 0;
      this.lockedSell = {};
      this.orderLog = [];
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

    applyFill(ticker, side, size, price, fee) {
      const sz = roundQty(size);
      const px = Number(price);
      const notional = sz * px;
      if (side === "buy") {
        this.cash -= notional + fee;
        this.positions[ticker] = (this.positions[ticker] || 0) + sz;
      } else {
        this.cash += notional - fee;
        this.positions[ticker] = (this.positions[ticker] || 0) - sz;
        if (Math.abs(this.positions[ticker]) < MIN_LOT) delete this.positions[ticker];
      }
    }

    log(msg) {
      this.orderLog.unshift({ ts: Date.now(), msg });
      this.orderLog = this.orderLog.slice(0, 40);
    }
  }

  function equity(player, market) {
    let eq = player.cash;
    for (const [t, q] of Object.entries(player.positions)) {
      const ins = market.byTicker[t];
      if (ins) eq += q * ins.mid;
    }
    return eq;
  }

  global.MarketSimPlayer = { Player, equity, MIN_LOT, MIN_NOTIONAL };
})(typeof window !== "undefined" ? window : globalThis);
