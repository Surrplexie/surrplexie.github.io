(function (global) {
  "use strict";

  const PERSONALITIES = ["ruthless", "cautious", "innovative", "manipulative", "opportunistic", "cooperative", "paranoid"];
  const SECTORS = ["technology", "energy", "retail", "banking", "healthcare", "manufacturing", "entertainment"];
  const OBJECTIVES = ["richest", "dominate", "bankrupt", "survive"];
  const PHASES = ["expansion", "boom", "bubble", "recession", "stagflation", "recovery"];

  const SCENARIOS = {
    boom: { wealth: [10000, 20000000], debtChance: 0.08, debtLoad: 0.25, mood: 72, rate: 0.03, regulation: 18, tax: 0.12, phase: "boom", unemployment: 0.04, inflation: 0.02, money: 1, bankHealth: 1 },
    crisis: { wealth: [1, 5000000], debtChance: 0.62, debtLoad: 0.8, mood: 28, rate: 0.09, regulation: 42, tax: 0.18, phase: "recession", unemployment: 0.14, inflation: 0.01, money: 0.7, bankHealth: 0.45 },
    inequality: { wealth: [1, 8000000], debtChance: 0.2, debtLoad: 0.35, mood: 38, rate: 0.045, regulation: 22, tax: 0.15, phase: "expansion", unemployment: 0.08, inflation: 0.025, money: 1, bankHealth: 0.9, power: true },
    tech: { wealth: [5000, 12000000], debtChance: 0.15, debtLoad: 0.4, mood: 76, rate: 0.035, regulation: 16, tax: 0.1, phase: "boom", unemployment: 0.05, inflation: 0.03, money: 1.1, bankHealth: 1, hot: "technology", innovative: true },
    custom: { wealth: [1000, 5000000], debtChance: 0.2, debtLoad: 0.3, mood: 50, rate: 0.04, regulation: 30, tax: 0.15, phase: "expansion", unemployment: 0.06, inflation: 0.02, money: 1, bankHealth: 0.85 }
  };

  const DIFFICULTY = {
    stable: { shock: 0.45, scandal: 0.45, swan: 0.35, vol: 0.55, aggression: 0.8 },
    volatile: { shock: 1, scandal: 1, swan: 1, vol: 1, aggression: 1 },
    ruthless: { shock: 1.15, scandal: 1.45, swan: 1.05, vol: 1.25, aggression: 1.45 },
    chaos: { shock: 1.8, scandal: 2.1, swan: 2.3, vol: 1.85, aggression: 1.7 }
  };

  function mulberry32(seed) {
    let s = seed >>> 0;
    return {
      next() {
        s = (s + 0x6D2B79F5) >>> 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      },
      get state() { return s; },
      set state(v) { s = v >>> 0; }
    };
  }

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function cents(dollars) { return Math.round(Number(dollars) * 100); }
  function dollars(c) { return c / 100; }

  function makeName(rng, used) {
    const a = ["Var", "Kel", "Mor", "Sa", "Jin", "Oak", "Bri", "Nel", "Tor", "Qua", "Hel", "Rin", "Cas", "Dro", "Ul", "Pen", "Mar", "Ves", "Ix", "Tal", "Bro", "Len", "Pax", "Cor"];
    const b = ["en", "a", "o", "is", "us", "er", "on", "ia", "el", "ix", "an"];
    const c = ["ford", "man", "stein", "worth", "bridge", "field", "son", "dale", "well", "gate", "croft", "bank"];
    let name = a[Math.floor(rng.next() * a.length)] + b[Math.floor(rng.next() * b.length)] + " " + c[Math.floor(rng.next() * c.length)];
    name = name.charAt(0).toUpperCase() + name.slice(1);
    let n = name;
    let k = 2;
    while (used[n]) n = name + " " + (k++);
    used[n] = true;
    return n;
  }

  function logWealth(rng, min, max) {
    const lo = Math.log(Math.max(1, min));
    const hi = Math.log(Math.max(min + 1, max));
    return Math.exp(lo + rng.next() * (hi - lo));
  }

  function powerWealth(i, n, min, max) {
    const w = 1 / Math.pow(i + 1, 1.15);
    return w;
  }

  function maxLeverage(world) {
    return 1 + 7 * (1 - world.regulation / 100);
  }

  function maxDebt(nw, world) {
    return Math.max(0, nw * (maxLeverage(world) - 1));
  }

  function tierOf(nwCents) {
    const d = nwCents / 100;
    if (d >= 1e11) return 3;
    if (d >= 1e9) return 2;
    if (d >= 1e6) return 1;
    return 0;
  }

  function tierName(t) {
    return ["scraping by", "established", "titan", "locked titan"][t] || "scraping by";
  }

  function dominantIndex(weights) {
    let bi = 0;
    for (let i = 1; i < weights.length; i++) if (weights[i] > weights[bi]) bi = i;
    return bi;
  }

  function personalityOf(bot) {
    return PERSONALITIES[bot.personality];
  }

  function assetById(world, id) {
    return world.assetMap[id];
  }

  function companyById(world, id) {
    return world.companyMap[id];
  }

  function botById(world, id) {
    return world.botMap[id];
  }

  function netWorth(world, bot) {
    if (!bot) return 0;
    let v = bot.cash + bot.savings;
    const lots = bot.cdLots;
    for (let i = 0; i < lots.length; i++) v += lots[i].principal;
    const holdings = bot.holdings;
    for (const id in holdings) {
      const asset = world.assetMap[id];
      if (!asset) continue;
      v += holdings[id] * asset.priceCents;
    }
    for (let i = 0; i < bot.loans.length; i++) v -= bot.loans[i].principal;
    if (!isFinite(v)) v = bot.cash;
    return Math.round(v);
  }

  function debtOf(bot) {
    let d = 0;
    for (let i = 0; i < bot.loans.length; i++) d += bot.loans[i].principal;
    return d;
  }

  function assetsOf(world, bot) {
    return netWorth(world, bot) - bot.cash + debtOf(bot);
  }

  function lifetimeProfit(world, bot) {
    return netWorth(world, bot) - bot.startNw - bot.godNet;
  }

  function exposure(world, bot, sector) {
    const nw = Math.max(1, bot.nw || netWorth(world, bot));
    let v = 0;
    for (const id in bot.holdings) {
      const asset = world.assetMap[id];
      if (!asset || asset.sector !== sector) continue;
      v += Math.abs(bot.holdings[id] * asset.priceCents);
    }
    return v / nw;
  }

  function shockScale(world, bot, exposed) {
    const tier = bot.tier;
    const lev = bot.nw > 0 ? debtOf(bot) / bot.nw : 99;
    const cap = maxLeverage(world) - 1;
    if (lev > cap * 0.85 && cap > 0) return 1;
    if (bot.falloff >= 60) return 1;
    if (tier >= 3 && !exposed) return 0.12;
    if (tier >= 2 && !exposed) return 0.32;
    if (tier >= 2 && exposed) return 0.9;
    return 1;
  }

  function pushArchive(world, ev) {
    ev.day = world.absDay;
    if (world.butterflyUntil >= world.absDay && world.butterflyId) ev.afterGod = world.butterflyId;
    world.archive.push(ev);
    if (world.archive.length > 2500) world.archive.splice(0, world.archive.length - 2500);
  }

  function pushNews(world, item) {
    item.id = "n" + (world.newsSeq++);
    item.day = world.absDay;
    item.dead = false;
    world.news.unshift(item);
    if (world.news.length > 300) world.news.pop();
    applyNewsImpulse(world, item);
    pushArchive(world, { type: "news", text: item.text, score: item.score, scope: item.scope });
    return item;
  }

  function newsMatchesAsset(world, news, asset) {
    if (news.scope === "economy") return asset.kind !== "cd";
    if (news.scope === "industry") return asset.sector === news.target;
    if (news.scope === "asset") return asset.id === news.target;
    if (news.scope === "company") {
      const co = world.companyMap[news.target];
      return co && asset.id === co.stockId;
    }
    if (news.scope === "bot") {
      const bot = world.botMap[news.target];
      if (!bot) return false;
      const co = bot.companyIds;
      for (let i = 0; i < co.length; i++) {
        const c = world.companyMap[co[i]];
        if (c && c.stockId === asset.id) return true;
      }
      return false;
    }
    return false;
  }

  function applyNewsImpulse(world, news) {
    const tilt = (news.score - 50) / 50;
    const mag = 0.045 * tilt * (news.duration === "persistent" ? 1.35 : 1);
    if (news.scope === "economy" || news.scope === "industry") {
      world.public.mood = clamp(world.public.mood + tilt * 7, 0, 100);
    }
    if (news.scope === "bot") {
      const bot = world.botMap[news.target];
      if (bot) {
        bot.trust = clamp(bot.trust + tilt * 12, 0, 100);
        bot.business = clamp(bot.business + tilt * 8, 0, 100);
        bot.known.public = true;
      }
    }
    if (news.scope === "company") {
      const co = world.companyMap[news.target];
      if (co) co.approval = clamp(co.approval + tilt * 14, 0, 100);
    }
    for (let i = 0; i < world.assets.length; i++) {
      const asset = world.assets[i];
      if (asset.kind === "cd") continue;
      if (!newsMatchesAsset(world, news, asset)) continue;
      asset.priceCents = Math.max(1, asset.priceCents * (1 + mag));
    }
  }

  function lingeringBias(world, asset) {
    let b = 0;
    for (let i = 0; i < world.news.length; i++) {
      const n = world.news[i];
      if (n.dead) continue;
      if (!newsMatchesAsset(world, n, asset)) continue;
      const age = world.absDay - n.day;
      let w = 1;
      if (n.duration === "impulse") w = Math.max(0, 1 - age / (n.days || 12));
      else if (n.duration === "fade") w = Math.pow(0.5, age / (n.halfLife || 20));
      if (w <= 0.01 && n.duration !== "persistent") n.dead = true;
      b += ((n.score - 50) / 50) * 0.012 * w;
    }
    return clamp(b, -0.25, 0.25);
  }

  function fairStock(world, asset) {
    const co = world.companyMap[asset.companyId];
    if (!co || co.failed) return 1;
    const annual = Math.max(0, co.smoothEarn * 365);
    const mood = (world.public.mood - 50) / 50;
    const multiple = clamp(8 + mood * 6 + (co.approval - 50) / 12, 4, 28);
    const equity = annual * multiple;
    return Math.max(1, equity / co.shares);
  }

  function markPrices(world) {
    let stockSum = 0;
    let stockN = 0;
    const vol = world.difficulty.vol;
    for (let i = 0; i < world.assets.length; i++) {
      const asset = world.assets[i];
      if (asset.kind === "stock") {
        const fair = fairStock(world, asset);
        const bias = lingeringBias(world, asset);
        const flow = clamp(world.flow[asset.id] || 0, -1, 1);
        const noise = (world.rng.next() - 0.5) * 0.03 * vol;
        const target = fair * (1 + bias) * (1 + flow * 0.04);
        const prev = asset.priceCents;
        let next = prev * 0.8 + target * 0.2 + prev * noise;
        const band = clamp(0.045 + 0.04 * vol, 0.04, 0.12) + (world.priceShock[asset.id] || 0);
        world.priceShock[asset.id] = 0;
        next = clamp(next, prev * (1 - band), prev * (1 + band));
        const owner = world.botMap[world.companyMap[asset.companyId].ownerId];
        if (owner && owner.tier >= 2 && owner.falloff < 45) {
          const lev = owner.nw > 0 ? debtOf(owner) / owner.nw : 0;
          if (lev < 0.6) {
            const floor = owner.tier >= 3 ? 0.012 : 0.028;
            if (next < prev * (1 - floor)) next = prev * (1 - floor);
          }
        }
        asset.priceCents = Math.max(1, next);
        stockSum += asset.priceCents / asset.basePrice;
        stockN++;
      } else if (asset.kind === "bond") {
        const coupon = 0.04;
        const price = 10000 * (1 + (coupon - world.rate) * 4);
        const noise = (world.rng.next() - 0.5) * 0.01 * vol;
        asset.priceCents = clamp(price * (1 + noise + lingeringBias(world, asset)), 2500, 18000);
      }
    }
    const indexLevel = stockN ? (stockSum / stockN) * 10000 : 10000;
    for (let i = 0; i < world.assets.length; i++) {
      const asset = world.assets[i];
      if (asset.kind === "index" || asset.kind === "etf" || asset.kind === "mutual") {
        let acc = 0;
        let n = 0;
        for (let j = 0; j < asset.basket.length; j++) {
          const s = world.assetMap[asset.basket[j]];
          if (s) { acc += s.priceCents / s.basePrice; n++; }
        }
        const nav = n ? (acc / n) * asset.basePrice : asset.basePrice;
        const drag = asset.kind === "mutual" ? 0.00003 : asset.kind === "etf" ? 0.00001 : 0;
        asset.priceCents = Math.max(1, nav * (1 - drag));
      }
    }
    world.indexLevel = indexLevel;
    world.flow = {};
  }

  function intradayDrift(world) {
    const vol = world.difficulty.vol * 0.15;
    for (let i = 0; i < world.assets.length; i++) {
      const asset = world.assets[i];
      if (asset.kind === "cd") continue;
      const noise = (world.rng.next() - 0.5) * 0.004 * vol;
      asset.priceCents = Math.max(1, asset.priceCents * (1 + noise));
    }
  }

  function cacheNw(world) {
    let total = 0;
    for (let i = 0; i < world.bots.length; i++) {
      const bot = world.bots[i];
      bot.nw = netWorth(world, bot);
      bot.tier = tierOf(bot.nw);
      bot.debt = debtOf(bot);
      total += bot.nw;
    }
    world.totalNw = total;
  }

  function refreshLists(world) {
    const bots = world.bots;
    const arr = bots.map((b, i) => ({ i, nw: b.nw }));
    arr.sort((a, b) => b.nw - a.nw || a.i - b.i);
    world.order = arr;
    const mid = arr[Math.floor(arr.length / 2)].nw;
    world.richIds = [];
    world.poorIds = [];
    for (let i = 0; i < arr.length; i++) {
      const b = bots[arr[i].i];
      if (b.tier >= 1) world.richIds.push(b.id);
      if (b.nw < mid) world.poorIds.push(b.id);
    }
    const n = arr.length;
    const top1n = Math.max(1, Math.ceil(n * 0.01));
    const top10n = Math.max(1, Math.ceil(n * 0.1));
    const bot50 = Math.floor(n / 2);
    let t1 = 0, t10 = 0, b50 = 0;
    for (let i = 0; i < n; i++) {
      const nw = arr[i].nw;
      if (i < top1n) t1 += nw;
      if (i < top10n) t10 += nw;
      if (i >= n - bot50) b50 += nw;
    }
    const tot = Math.max(1, world.totalNw);
    world.inequality = {
      top1: t1 / tot,
      top10: t10 / tot,
      bottom50: b50 / tot
    };
  }

  function recordSeries(world) {
    const s = world.series;
    s.day.push(world.absDay);
    s.rate.push(world.rate);
    s.mood.push(world.public.mood);
    s.employment.push(world.public.employment);
    s.top1.push(world.inequality.top1);
    s.index.push(world.indexLevel);
    for (let i = 0; i < world.assets.length; i++) {
      const a = world.assets[i];
      s.price[a.id].push(a.priceCents);
      s.volume[a.id].push(world.volume[a.id] || 0);
    }
    for (let i = 0; i < world.bots.length; i++) {
      const b = world.bots[i];
      s.nw[b.id].push(b.nw);
    }
    if (s.day.length > 9000) compactSeries(world);
  }

  function compactSeries(world) {
    const s = world.series;
    const keep = (arr) => {
      if (arr.length < 9000) return arr;
      const next = [arr[0]];
      for (let i = 1; i < arr.length; i += 2) next.push(arr[i]);
      return next;
    };
    world.downsampled = true;
    s.day = keep(s.day);
    s.rate = keep(s.rate);
    s.mood = keep(s.mood);
    s.employment = keep(s.employment);
    s.top1 = keep(s.top1);
    s.index = keep(s.index);
    for (const id in s.price) {
      s.price[id] = keep(s.price[id]);
      s.volume[id] = keep(s.volume[id]);
    }
    for (const id in s.nw) s.nw[id] = keep(s.nw[id]);
  }

  function updateRecords(world, bot, prev) {
    const rec = world.records;
    if (!rec.richest || bot.nw > rec.richest.nw) {
      rec.richest = { id: bot.id, name: bot.name, nw: bot.nw, day: world.absDay };
    }
    const delta = bot.nw - prev;
    if (!rec.bestDay || delta > rec.bestDay.delta) {
      rec.bestDay = { id: bot.id, name: bot.name, delta, day: world.absDay };
    }
    if (!rec.worstDay || delta < rec.worstDay.delta) {
      rec.worstDay = { id: bot.id, name: bot.name, delta, day: world.absDay };
    }
    if (bot.peak < bot.nw) bot.peak = bot.nw;
    if (bot.startNw < 100000 && bot.nw >= cents(1e9) && !bot.tags.rags) {
      bot.tags.rags = world.absDay;
      pushArchive(world, { type: "story", text: bot.name + " crossed $1 billion from a poor start.", botId: bot.id });
    }
    if (bot.peak >= cents(1e6) && bot.nw < bot.peak * 0.02 && bot.nw < cents(10000) && !bot.tags.collapse) {
      bot.tags.collapse = world.absDay;
      pushArchive(world, { type: "story", text: bot.name + " lost nearly all of a large fortune.", botId: bot.id });
    }
  }

  function logReason(bot, world, text) {
    bot.lastReason = text;
    bot.log.push({ day: world.absDay, text });
    if (bot.log.length > 40) bot.log.shift();
  }

  function trade(world, bot, asset, qty, reason) {
    if (!asset || !qty || asset.kind === "cd") return false;
    if (asset.companyId) {
      const co = world.companyMap[asset.companyId];
      if (co && co.failed) return false;
    }
    const px = Math.max(1, asset.priceCents);
    const notionalCap = Math.max(100, Math.abs(bot.nw) * 0.08);
    const maxQty = notionalCap / px;
    qty = clamp(qty, -maxQty, maxQty);
    if (asset.companyId) {
      const co = world.companyMap[asset.companyId];
      if (co && co.shares > 0) qty = clamp(qty, -co.shares * 0.04, co.shares * 0.04);
    }
    if (Math.abs(qty) < 1e-6) return false;
    const cost = Math.round(qty * px);
    if (qty > 0 && bot.cash < cost) qty = bot.cash / px;
    if (qty <= 0 && cost > 0) return false;
    const have = bot.holdings[asset.id] || 0;
    if (qty < 0 && have + qty < -1e12) return false;
    const finalCost = Math.round(qty * px);
    if (qty > 0 && finalCost > bot.cash) return false;
    bot.cash -= finalCost;
    const next = have + qty;
    if (Math.abs(next) < 1e-8) delete bot.holdings[asset.id];
    else bot.holdings[asset.id] = next;
    if (qty > 0) {
      const prev = bot.cost[asset.id] || px;
      const owned = Math.max(0, next);
      bot.cost[asset.id] = owned > 0 ? (prev * Math.max(0, have) + px * qty) / owned : px;
    }
    world.flow[asset.id] = (world.flow[asset.id] || 0) + qty / 100000;
    world.volume[asset.id] = (world.volume[asset.id] || 0) + Math.abs(qty);
    if (reason) logReason(bot, world, reason);
    return true;
  }

  function serviceDebt(world, bot) {
    for (let i = bot.loans.length - 1; i >= 0; i--) {
      const loan = bot.loans[i];
      const interest = Math.max(1, Math.round(loan.principal * loan.rate / 365));
      if (bot.cash >= interest) {
        bot.cash -= interest;
        const lender = world.companyMap[loan.lender] || world.botMap[loan.lender];
        if (lender && lender.capital != null) lender.capital += interest;
        else if (lender && lender.cash != null) lender.cash += interest;
      } else {
        loan.principal += interest;
      }
      if (loan.dueDay && world.absDay >= loan.dueDay && bot.cash >= loan.principal) {
        bot.cash -= Math.round(loan.principal);
        payLenderPrincipal(world, loan, loan.principal);
        bot.loans.splice(i, 1);
      }
    }
    const nw = Math.max(1, netWorth(world, bot));
    if (debtOf(bot) > maxDebt(nw, world) * 1.08) {
      forcedSell(world, bot, "Sold holdings to cover a debt spiral.");
    }
  }

  function payLenderPrincipal(world, loan, amount) {
    const bank = world.companyMap[loan.lender];
    if (bank && bank.bank) {
      bank.liquidity += amount;
      bank.loansOut = Math.max(0, bank.loansOut - amount);
      return;
    }
    const lender = world.botMap[loan.lender];
    if (lender) lender.cash += Math.round(amount);
  }

  function forcedSell(world, bot, reason) {
    const ids = Object.keys(bot.holdings);
    ids.sort();
    for (let i = 0; i < ids.length; i++) {
      const qty = bot.holdings[ids[i]];
      if (qty > 0) {
        trade(world, bot, world.assetMap[ids[i]], -qty * 0.45, null);
      }
    }
    for (let i = 0; i < bot.cdLots.length; i++) {
      const lot = bot.cdLots[i];
      bot.cash += Math.round(lot.principal * 0.98);
      lot.principal = 0;
    }
    bot.cdLots = bot.cdLots.filter((lot) => lot.principal > 0);
    if (reason) logReason(bot, world, reason);
  }

  function defaultBot(world, bot, why) {
    if (bot.broke) return;
    const peak = bot.peak;
    forcedSell(world, bot, null);
    const unpaid = debtOf(bot);
    for (let i = 0; i < bot.loans.length; i++) {
      const loan = bot.loans[i];
      const bank = world.companyMap[loan.lender];
      if (bank && bank.bank) {
        bank.capital -= loan.principal;
        bank.loansOut = Math.max(0, bank.loansOut - loan.principal);
        bank.lossStreak = (bank.lossStreak || 0) + 1;
      } else {
        const lender = world.botMap[loan.lender];
        if (lender && lender.id !== bot.id) {
          lender.cash = Math.max(0, lender.cash - Math.round(loan.principal * 0.5));
          lender.rivalry[bot.id] = (lender.rivalry[bot.id] || 0) + 30;
        }
      }
    }
    bot.loans = [];
    bot.holdings = {};
    bot.cdLots = [];
    bot.savings = 0;
    bot.cash = 1;
    bot.broke = true;
    bot.falloff = 0;
    bot.objective = "survive";
    if (!world.records.biggestDefault || peak > world.records.biggestDefault.peak) {
      world.records.biggestDefault = { id: bot.id, name: bot.name, peak, day: world.absDay };
    }
    if (peak >= cents(1e6)) {
      bot.tags.collapse = world.absDay;
    }
    pushArchive(world, { type: "default", text: bot.name + " defaulted (" + why + ").", botId: bot.id });
    world.contagion = (world.contagion || 0) + 1;
  }

  function accrueSavingsAndCds(world, bot) {
    const bank = world.companyMap[bot.bankId];
    if (bank && !bank.failed && bot.savings > 0) {
      const dep = Math.max(0, world.rate - 0.012);
      const gain = Math.round(bot.savings * dep / 365);
      bot.savings += gain;
      bank.capital -= gain;
    }
    for (let i = bot.cdLots.length - 1; i >= 0; i--) {
      const lot = bot.cdLots[i];
      lot.principal += Math.round(lot.principal * lot.rate / 365);
      if (world.absDay >= lot.mature) {
        bot.cash += Math.round(lot.principal);
        bot.cdLots.splice(i, 1);
        logReason(bot, world, "A CD matured and returned to cash.");
      }
    }
  }

  function runCompanies(world) {
    const counts = {};
    for (let i = 0; i < world.companies.length; i++) {
      const co = world.companies[i];
      if (co.failed || co.bank) continue;
      counts[co.sector] = (counts[co.sector] || 0) + 1;
    }
    for (let i = 0; i < world.companies.length; i++) {
      const co = world.companies[i];
      if (co.failed || co.bank) continue;
      const competition = Math.max(1, counts[co.sector] || 1);
      const hot = world.sectorHot[co.sector] || 1;
      const newsTilt = 1 + lingeringCompany(world, co);
      const demand = world.demand * (co.approval / 100) * hot * newsTilt * (0.75 + world.public.mood / 200);
      const utilTarget = clamp(demand / Math.sqrt(competition), 0.08, 1.2);
      const units = co.capacity * utilTarget;
      co.utilization = co.capacity > 0 ? units / co.capacity : 0;
      if (co.utilization > 0.92 && co.approval > 45) co.productPrice = Math.round(co.productPrice * 1.004);
      if (co.approval < 35) co.productPrice = Math.round(co.productPrice * 0.992);
      const revenue = units * co.productPrice;
      const cost = co.capacity * co.unitCost * (0.65 + 0.35 * co.utilization);
      const tax = Math.max(0, revenue * world.tax);
      let earn = revenue - cost - tax;
      if (co.approval < 28) {
        earn *= 0.4;
        if (!co.boycott) {
          co.boycott = true;
          pushNews(world, {
            text: "Customers are backing away from " + co.name + ".",
            score: clamp(co.approval, 5, 35),
            scope: "company",
            target: co.id,
            duration: "fade",
            halfLife: 18,
            source: "public"
          });
        }
      } else co.boycott = false;
      const owner = world.botMap[co.ownerId];
      const scale = owner ? shockScale(world, owner, true) : 1;
      if (scale < 1 && earn < co.smoothEarn) {
        earn = co.smoothEarn * (1 - scale) + earn * scale;
      }
      co.smoothEarn = co.smoothEarn * 0.97 + earn * 0.03;
      co.failing = co.smoothEarn < 0 && co.approval < 40;
      if ((owner && (owner.holdings[co.stockId] || 0) < co.shares * 0.02) || !owner) {
        let best = null;
        let bestQ = 0;
        for (let b = 0; b < world.bots.length; b++) {
          const q = world.bots[b].holdings[co.stockId] || 0;
          if (q > bestQ) { bestQ = q; best = world.bots[b].id; }
        }
        if (best) co.ownerId = best;
      }
    }
  }

  function lingeringCompany(world, co) {
    let b = 0;
    for (let i = 0; i < world.news.length; i++) {
      const n = world.news[i];
      if (n.dead) continue;
      const hit = n.scope === "economy" || (n.scope === "industry" && n.target === co.sector) || (n.scope === "company" && n.target === co.id);
      if (!hit) continue;
      const age = world.absDay - n.day;
      let w = n.duration === "persistent" ? 1 : n.duration === "fade" ? Math.pow(0.5, age / (n.halfLife || 20)) : Math.max(0, 1 - age / (n.days || 12));
      b += ((n.score - 50) / 50) * 0.15 * w;
    }
    return clamp(b, -0.6, 0.6);
  }

  function runBanks(world) {
    for (let i = 0; i < world.companies.length; i++) {
      const bank = world.companies[i];
      if (!bank.bank || bank.failed) continue;
      const earn = bank.loansOut * (world.rate + 0.035) / 365 - bank.deposits * Math.max(0, world.rate - 0.01) / 365;
      bank.capital += earn;
      bank.smoothEarn = bank.smoothEarn * 0.95 + earn * 0.05;
      if (bank.capital < 0 || (bank.liquidity < bank.deposits * 0.02 && bank.lossStreak > 2)) {
        failBank(world, bank);
      }
    }
  }

  function failBank(world, bank) {
    if (bank.failed) return;
    bank.failed = true;
    bank.failing = true;
    world.bankFailures++;
    const stock = world.assetMap[bank.stockId];
    if (stock) stock.priceCents = 1;
    const recovery = clamp(bank.liquidity / Math.max(1, bank.deposits), 0.05, 0.7);
    for (let i = 0; i < world.bots.length; i++) {
      const bot = world.bots[i];
      if (bot.bankId !== bank.id) continue;
      const kept = Math.round(bot.savings * recovery);
      bot.savings = kept;
      bot.trust = clamp(bot.trust - 8, 0, 100);
    }
    pushNews(world, {
      text: bank.name + " has failed. Depositors are taking losses.",
      score: 8,
      scope: "company",
      target: bank.id,
      duration: "fade",
      halfLife: 30,
      source: "market"
    });
    pushArchive(world, { type: "bank", text: bank.name + " failed.", companyId: bank.id });
  }

  function reactNewsScore(bot, score) {
    const p = personalityOf(bot);
    const tilt = (score - 50) / 50;
    if (p === "paranoid") return tilt < 0 ? tilt * 1.6 : tilt * 0.35;
    if (p === "cautious") return tilt < 0 ? tilt * 1.3 : tilt * 0.6;
    if (p === "ruthless") return tilt;
    if (p === "opportunistic") return tilt * 1.25;
    if (p === "cooperative") return tilt * 0.8;
    return tilt;
  }

  function latestNewsTilt(world, bot) {
    let tilt = 0;
    const item = world.news[0];
    if (!item || world.absDay - item.day > 3) return 0;
    const cares = item.scope === "economy" || item.scope === "bot" && item.target === bot.id || item.scope === "industry";
    if (!cares) return 0;
    tilt = reactNewsScore(bot, item.score);
    return tilt;
  }

  function rebalance(world, bot) {
    const p = personalityOf(bot);
    const nw = Math.max(1, bot.nw);
    let stocks = 0.45, bonds = 0.2, cd = 0.15, cash = 0.2;
    if (p === "cautious" || bot.risk === 0) { stocks = 0.18; bonds = 0.34; cd = 0.28; cash = 0.2; }
    else if (p === "ruthless" || bot.risk === 2) { stocks = 0.72; bonds = 0.05; cd = 0.03; cash = 0.2; }
    else if (p === "paranoid") { stocks = 0.12; bonds = 0.2; cd = 0.18; cash = 0.5; }
    else if (p === "innovative" || p === "opportunistic") { stocks = 0.62; bonds = 0.1; cd = 0.08; cash = 0.2; }
    else if (p === "manipulative") { stocks = 0.55; bonds = 0.1; cd = 0.05; cash = 0.3; }
    if (bot.objective === "survive" || bot.tier === 0 && bot.debt > bot.cash) {
      stocks *= 0.4; cash += 0.2;
    }
    const tilt = latestNewsTilt(world, bot);
    if (tilt < -0.25 && (p === "cautious" || p === "paranoid")) { stocks *= 0.5; cash += 0.15; }
    if (tilt > 0.25 && (p === "opportunistic" || p === "ruthless")) stocks += 0.1;

    let stockValue = 0;
    let bondValue = 0;
    const ids = Object.keys(bot.holdings);
    for (let i = 0; i < ids.length; i++) {
      const asset = world.assetMap[ids[i]];
      if (!asset) continue;
      const val = bot.holdings[ids[i]] * asset.priceCents;
      if (asset.kind === "bond") bondValue += val;
      else if (val > 0) stockValue += val;
    }
    let cdValue = 0;
    for (let i = 0; i < bot.cdLots.length; i++) cdValue += bot.cdLots[i].principal;
    const riskyTarget = nw * stocks;
    const bondTarget = nw * bonds;
    const cdTarget = nw * cd;

    if (stockValue > riskyTarget * 1.25) {
      sellSomeRisk(world, bot, (stockValue - riskyTarget) / Math.max(1, stockValue));
      return "Trimmed risk. The book was heavier than this temperament allows.";
    }
    if (stockValue < riskyTarget * 0.75 && bot.cash > nw * 0.08) {
      const asset = pickStock(world, bot, tilt);
      if (asset && !refusesAsset(world, bot, asset)) {
        const spend = Math.min(bot.cash * 0.35, riskyTarget - stockValue);
        const qty = spend / asset.priceCents;
        if (qty > 0.01) {
          trade(world, bot, asset, qty, null);
          return "Bought " + asset.ticker + ". It fit the current bias.";
        }
      }
    }
    if (bondValue < bondTarget * 0.7 && bot.cash > 10000) {
      const bond = world.assets.find((a) => a.kind === "bond");
      const spend = Math.min(bot.cash * 0.25, bondTarget - bondValue);
      trade(world, bot, bond, spend / bond.priceCents, null);
      return "Added bonds while the rate looked worth locking in.";
    }
    if (cdValue < cdTarget * 0.7 && bot.cash > 20000 && (p === "cautious" || p === "paranoid" || bot.risk === 0)) {
      const amt = Math.min(bot.cash * 0.3, cdTarget - cdValue);
      bot.cash -= Math.round(amt);
      bot.cdLots.push({ principal: Math.round(amt), rate: world.cdRate, mature: world.absDay + 365 });
      return "Locked cash in a CD at " + (world.cdRate * 100).toFixed(1) + "%.";
    }
    return null;
  }

  function sellSomeRisk(world, bot, frac) {
    const ids = Object.keys(bot.holdings);
    ids.sort();
    for (let i = 0; i < ids.length; i++) {
      const asset = world.assetMap[ids[i]];
      if (!asset || asset.kind === "bond") continue;
      const qty = bot.holdings[ids[i]];
      if (qty > 0) trade(world, bot, asset, -qty * clamp(frac, 0.05, 0.5), null);
    }
  }

  function pickStock(world, bot, tilt) {
    const stocks = world.assets.filter((a) => a.kind === "stock" && !world.companyMap[a.companyId].failed);
    if (!stocks.length) return null;
    if (bot.objective === "dominate") {
      const sectorPick = stocks.filter((a) => a.sector === bot.goalSector);
      if (sectorPick.length) return sectorPick[Math.floor(world.rng.next() * sectorPick.length)];
    }
    if (tilt > 0) {
      stocks.sort((a, b) => (world.flow[b.id] || 0) - (world.flow[a.id] || 0));
      return stocks[0];
    }
    return stocks[Math.floor(world.rng.next() * stocks.length)];
  }

  function refusesAsset(world, bot, asset) {
    if (!asset.companyId) return false;
    const co = world.companyMap[asset.companyId];
    if (!co) return false;
    const owner = world.botMap[co.ownerId];
    if (!owner) return false;
    return !!(owner.blocked && owner.blocked[bot.id]);
  }

  function maybeShort(world, bot) {
    const p = personalityOf(bot);
    if (p !== "ruthless" && p !== "opportunistic" && p !== "manipulative") return null;
    if (world.regulation > 80 && world.rng.next() > 0.2) return null;
    let target = null;
    let best = 10;
    for (const id in bot.rivalry) {
      if (bot.rivalry[id] > best) {
        best = bot.rivalry[id];
        target = id;
      }
    }
    if (!target) return null;
    const rival = world.botMap[target];
    if (!rival || !rival.companyIds.length) return null;
    const co = world.companyMap[rival.companyIds[0]];
    if (!co || co.failed) return null;
    const asset = world.assetMap[co.stockId];
    const qty = -(Math.max(1, bot.nw) * 0.08) / asset.priceCents;
    const have = bot.holdings[asset.id] || 0;
    if (have < 0) return null;
    trade(world, bot, asset, qty, null);
    bot.cost[asset.id] = asset.priceCents;
    rival.rivalry[bot.id] = (rival.rivalry[bot.id] || 0) + 12;
    return "Shorted " + asset.ticker + " against " + rival.name + ".";
  }

  function coverIfSqueezed(world, bot) {
    const ids = Object.keys(bot.holdings);
    for (let i = 0; i < ids.length; i++) {
      const qty = bot.holdings[ids[i]];
      if (qty >= 0) continue;
      const asset = world.assetMap[ids[i]];
      const entry = bot.cost[ids[i]] || asset.priceCents;
      if (asset.priceCents > entry * 1.22) {
        trade(world, bot, asset, -qty, null);
        return "Covered a short in " + asset.ticker + " after the price ran up.";
      }
    }
    return null;
  }

  function tryBorrow(world, bot, want) {
    const nw = Math.max(1, bot.nw);
    const room = maxDebt(nw, world) - debtOf(bot);
    if (room < 50000 || want < 10000) return false;
    const amt = Math.min(want, room);
    let bank = null;
    for (let i = 0; i < world.companies.length; i++) {
      const b = world.companies[i];
      if (b.bank && !b.failed && b.liquidity > amt) { bank = b; break; }
    }
    if (!bank) return false;
    if (bot.credibility < 25 && world.regulation > 40) return false;
    if (bot.blocked && bank.ownerId && world.botMap[bank.ownerId] && world.botMap[bank.ownerId].blocked[bot.id]) return false;
    const spread = 0.02 + (100 - bot.credibility) / 800 + bot.risk * 0.01;
    bot.loans.push({
      principal: Math.round(amt),
      rate: world.rate + spread,
      lender: bank.id,
      dueDay: world.absDay + 365 * 3
    });
    bot.cash += Math.round(amt);
    bank.liquidity -= amt;
    bank.loansOut += amt;
    bank.deposits = bank.deposits;
    return true;
  }

  function maybeLeverage(world, bot) {
    if (bot.risk === 0 || personalityOf(bot) === "cautious" || personalityOf(bot) === "paranoid") return null;
    if (bot.objective === "survive") return null;
    const tilt = latestNewsTilt(world, bot);
    if (tilt < 0 && personalityOf(bot) !== "ruthless") return null;
    const want = bot.nw * (0.15 + bot.risk * 0.2) * world.difficulty.aggression;
    if (!tryBorrow(world, bot, want)) return null;
    return "Borrowed " + formatShort(want) + " to press a position.";
  }

  function formatShort(centsVal) {
    const sign = centsVal < 0 ? "-" : "";
    const v = Math.abs(centsVal) / 100;
    if (v >= 1e12) return sign + "$" + (v / 1e12).toFixed(2) + "T";
    if (v >= 1e9) return sign + "$" + (v / 1e9).toFixed(2) + "B";
    if (v >= 1e6) return sign + "$" + (v / 1e6).toFixed(2) + "M";
    if (v >= 1e4) return sign + "$" + (v / 1e3).toFixed(1) + "K";
    if (v >= 100) return sign + "$" + v.toFixed(0);
    return sign + "$" + v.toFixed(2);
  }

  function maybeFound(world, bot) {
    if (bot.tier < 1 || bot.companyIds.length >= 4) return null;
    if (personalityOf(bot) !== "innovative" && personalityOf(bot) !== "opportunistic" && world.rng.next() > 0.02) return null;
    if (bot.cash < cents(250000)) return null;
    if (world.companies.length >= 48) return null;
    const cost = Math.round(bot.cash * 0.22);
    const sector = bot.goalSector || SECTORS[Math.floor(world.rng.next() * SECTORS.length)];
    const co = createCompany(world, bot, sector, cost);
    bot.cash -= cost;
    pushArchive(world, { type: "found", text: bot.name + " founded " + co.name + ".", botId: bot.id, companyId: co.id });
    return "Founded " + co.name + " in " + sector + ".";
  }

  function createCompany(world, bot, sector, capitalCents) {
    const id = "c" + (world.companySeq++);
    const stockId = "s" + id;
    const bank = sector === "banking" && world.companies.filter((c) => c.bank && !c.failed).length < 6 && world.rng.next() < 0.5;
    const name = bot.name.split(" ")[0] + " " + (bank ? "Bank" : sectorWord(sector)) + " " + (world.companySeq);
    const shares = 1000000;
    const approval = clamp(40 + world.rng.next() * 40, 5, 95);
    const productPrice = 1500 + Math.floor(world.rng.next() * 4000);
    const capacity = Math.max(25, capitalCents / productPrice / 90);
    const founderStake = 0.72;
    const equity = Math.max(capitalCents / founderStake, cents(400000));
    const desiredDaily = Math.max(200, equity / 12 / 365);
    const units = capacity * 0.72;
    const revenue = units * productPrice;
    const opex = capacity * 0.9;
    const unitCost = Math.max(1, Math.round((revenue - revenue * (world.tax || 0.15) - desiredDaily) / opex));
    const co = {
      id, name, sector, ownerId: bot.id, shares, stockId, bank, approval,
      productPrice, unitCost, capacity, utilization: 0.72, smoothEarn: desiredDaily,
      failing: false, failed: false, boycott: false,
      deposits: 0, loansOut: 0, liquidity: bank ? capitalCents * 0.8 : 0,
      capital: bank ? capitalCents * 0.4 : 0, lossStreak: 0,
      product: productName(sector, world.rng)
    };
    const price = Math.max(50, equity / shares);
    const asset = {
      id: stockId, kind: "stock", ticker: ticker(name, stockId), name: name,
      companyId: id, sector, priceCents: price, basePrice: price, basket: null
    };
    world.companies.push(co);
    world.companyMap[id] = co;
    world.assets.push(asset);
    world.assetMap[stockId] = asset;
    world.series.price[stockId] = padSeries(world, price);
    world.series.volume[stockId] = padSeries(world, 0);
    bot.holdings[stockId] = shares * founderStake;
    bot.companyIds.push(id);
    return co;
  }

  function padSeries(world, value) {
    const n = world.series.day.length;
    const arr = [];
    for (let i = 0; i < n; i++) arr.push(i === n - 1 ? value : value);
    return arr;
  }

  function sectorWord(sector) {
    return { technology: "Systems", energy: "Power", retail: "Retail", banking: "Bank", healthcare: "Health", manufacturing: "Works", entertainment: "Media" }[sector] || "Co";
  }

  function productName(sector, rng) {
    const list = {
      technology: ["pocket mesh", "ledger node", "signal glass"],
      energy: ["grid cell", "heat well", "night turbine"],
      retail: ["home crate", "corner brand", "bulk club"],
      banking: ["day account", "merchant float", "credit line"],
      healthcare: ["clinic pass", "generic vial", "home monitor"],
      manufacturing: ["standard part", "freight frame", "tool line"],
      entertainment: ["serial stream", "arena night", "game pass"]
    };
    const arr = list[sector] || ["service"];
    return arr[Math.floor(rng.next() * arr.length)];
  }

  function ticker(name, id) {
    const letters = name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "CAP";
    return letters + id.replace(/\D/g, "").slice(-2);
  }

  function maybeInnovate(world, bot) {
    if (!bot.companyIds.length) return null;
    const p = personalityOf(bot);
    const chance = p === "innovative" ? 0.08 : 0.015;
    if (world.rng.next() > chance) return null;
    const co = world.companyMap[bot.companyIds[0]];
    if (!co || co.failed || co.bank) return null;
    const success = world.rng.next() < (p === "innovative" ? 0.62 : 0.4);
    co.product = productName(co.sector, world.rng);
    co.approval = success ? 55 + world.rng.next() * 45 : world.rng.next() * 40;
    if (success) co.smoothEarn *= 1.08;
    else co.smoothEarn *= 0.92;
    const score = Math.round(co.approval);
    pushNews(world, {
      text: co.name + " launched " + co.product + ".",
      score,
      scope: "company",
      target: co.id,
      duration: "fade",
      halfLife: 24,
      source: "company"
    });
    return "Launched " + co.product + " at " + co.name + " (public " + score + "/100).";
  }

  function maybeTakeover(world, bot) {
    if (bot.tier < 2) return null;
    if (world.rng.next() > 0.03 * world.difficulty.aggression) return null;
    const candidates = world.companies.filter((c) => !c.failed && c.ownerId !== bot.id && !c.bank);
    if (!candidates.length) return null;
    const co = candidates[Math.floor(world.rng.next() * candidates.length)];
    if (world.regulation > 75 && !co.failing) {
      return "Antitrust blocked a bid for " + co.name + ".";
    }
    const asset = world.assetMap[co.stockId];
    const bid = asset.priceCents * (co.failing ? 1.02 : 1.16);
    let need = 0;
    const payees = [];
    for (let i = 0; i < world.bots.length; i++) {
      const other = world.bots[i];
      const q = other.holdings[co.stockId] || 0;
      if (other.id === bot.id || q <= 0) continue;
      need += q * bid;
      payees.push(other);
    }
    const floatShares = co.shares * 0.28;
    need += floatShares * bid;
    if (bot.cash < need * 0.35) {
      tryBorrow(world, bot, need - bot.cash);
    }
    if (bot.cash < need) return null;
    for (let i = 0; i < payees.length; i++) {
      const other = payees[i];
      const q = other.holdings[co.stockId];
      other.cash += Math.round(q * bid);
      delete other.holdings[co.stockId];
      other.rivalry[bot.id] = (other.rivalry[bot.id] || 0) + 25;
      bot.rivalry[other.id] = (bot.rivalry[other.id] || 0) + 8;
    }
    bot.cash -= Math.round(need);
    bot.holdings[co.stockId] = (bot.holdings[co.stockId] || 0) + floatShares;
    for (let i = 0; i < payees.length; i++) {
      bot.holdings[co.stockId] += 0;
    }
    const owned = bot.holdings[co.stockId];
    bot.holdings[co.stockId] = Math.max(owned, co.shares * 0.7);
    co.ownerId = bot.id;
    if (bot.companyIds.indexOf(co.id) < 0) bot.companyIds.push(co.id);
    const old = world.botMap[co.ownerId];
    pushArchive(world, { type: "takeover", text: bot.name + " took over " + co.name + ".", botId: bot.id, companyId: co.id });
    return "Took over " + co.name + ".";
  }

  function social(world, bot) {
    const rng = world.rng;
    for (const id in bot.blocked) {
      const other = world.botMap[id];
      const mark = bot.blocked[id];
      if (!other) { delete bot.blocked[id]; continue; }
      if (other.nw > mark.nw * 4 || other.credibility > 68) {
        delete bot.blocked[id];
        pushArchive(world, { type: "unblock", text: bot.name + " will deal with " + other.name + " again.", botId: bot.id });
      }
    }
    if (bot.tier >= 2 && world.poorIds.length && rng.next() < 0.04) {
      const pid = world.poorIds[Math.floor(rng.next() * world.poorIds.length)];
      const poor = world.botMap[pid];
      if (poor && poor.id !== bot.id && poor.credibility < 55 && !bot.blocked[poor.id]) {
        bot.blocked[poor.id] = { day: world.absDay, nw: poor.nw };
        return "Refused " + poor.name + " as a counterparty.";
      }
    }
    if (bot.tier >= 1 && (personalityOf(bot) === "cooperative" || bot.tier >= 2) && rng.next() < 0.03) {
      const pool = world.richIds.length ? world.richIds : null;
      if (pool) {
        const oid = pool[Math.floor(rng.next() * pool.length)];
        const other = world.botMap[oid];
        if (other && other.id !== bot.id && !bot.rivalry[other.id] && bot.allies.indexOf(other.id) < 0 && !other.blocked[bot.id]) {
          bot.allies.push(other.id);
          other.allies.push(bot.id);
          world.alliances.push({ ids: [bot.id, other.id], day: world.absDay });
          pushArchive(world, { type: "alliance", text: bot.name + " allied with " + other.name + ".", botId: bot.id });
          return "Allied with " + other.name + ".";
        }
      }
    }
    if (personalityOf(bot) === "manipulative" && rng.next() < 0.045) {
      const score = rng.next() < 0.5 ? 20 + rng.next() * 20 : 65 + rng.next() * 30;
      const asset = world.assets[Math.floor(rng.next() * world.assets.length)];
      if (asset && asset.kind === "stock") {
        pushNews(world, {
          text: "Unverified rumor around " + asset.ticker + ".",
          score: Math.round(score),
          scope: "asset",
          target: asset.id,
          duration: "impulse",
          days: 6,
          source: "rumor"
        });
        return "Planted a rumor about " + asset.ticker + ".";
      }
    }
    if (bot.tier >= 2 && world.pendingLaw && rng.next() < 0.2) {
      const spend = Math.min(bot.cash * 0.02, cents(5e6));
      if (spend > 100000) {
        bot.cash -= Math.round(spend);
        bot.influence = clamp(bot.influence + 3, 0, 100);
        const wantLow = personalityOf(bot) !== "cooperative";
        world.lobbyBias += wantLow ? -spend / cents(1e6) : spend / cents(2e6);
        return "Spent on influence ahead of a rule change.";
      }
    }
    return null;
  }

  function maybeInsider(world, bot) {
    if (bot.insider && world.absDay <= bot.insider.expire) {
      const asset = world.assetMap[bot.insider.asset];
      if (asset) {
        const qty = (bot.nw * 0.06) / asset.priceCents * bot.insider.sign;
        trade(world, bot, asset, qty, null);
        const fineChance = world.regulation / 140;
        if (world.rng.next() < fineChance) {
          const fine = Math.round(Math.abs(qty * asset.priceCents) * 0.25);
          bot.cash = Math.max(1, bot.cash - fine);
          bot.trust = clamp(bot.trust - 15, 0, 100);
          bot.known.holdings = true;
          bot.known.insider = true;
          pushNews(world, {
            text: "Regulators fined " + bot.name + " over a suspiciously timed trade.",
            score: 18,
            scope: "bot",
            target: bot.id,
            duration: "fade",
            halfLife: 20,
            source: "regulator"
          });
          bot.insider = null;
          return "Traded on a private tip and paid a fine.";
        }
        if (bot.allies.length && world.rng.next() < 0.5) {
          const ally = world.botMap[bot.allies[0]];
          if (ally && !ally.insider) ally.insider = { asset: asset.id, sign: bot.insider.sign, expire: bot.insider.expire };
        }
        bot.known.insider = false;
        bot.insider = null;
        return "Traded ahead of the tape in " + asset.ticker + ".";
      }
    }
    if (bot.tier >= 1 && world.rng.next() < 0.02 + (personalityOf(bot) === "manipulative" ? 0.03 : 0)) {
      const stocks = world.assets.filter((a) => a.kind === "stock");
      if (!stocks.length) return null;
      const asset = stocks[Math.floor(world.rng.next() * stocks.length)];
      const co = world.companyMap[asset.companyId];
      const sign = co.smoothEarn >= 0 ? 1 : -1;
      bot.insider = { asset: asset.id, sign, expire: world.absDay + 2 };
      return "Learned something private about " + asset.ticker + ".";
    }
    return null;
  }

  function driftPersonality(world, bot, prevNw) {
    if (bot.nw >= prevNw) bot.streak = bot.streak >= 0 ? bot.streak + 1 : 1;
    else bot.streak = bot.streak <= 0 ? bot.streak - 1 : -1;
    if (Math.abs(bot.streak) < 28) return;
    const p = personalityOf(bot);
    const idx = bot.personality;
    if (bot.streak > 0 && p === "cautious") bot.weights[PERSONALITIES.indexOf("opportunistic")] += 0.04;
    if (bot.streak < 0 && (p === "ruthless" || p === "opportunistic")) bot.weights[PERSONALITIES.indexOf("cautious")] += 0.05;
    if (bot.streak < 0 && p === "cooperative") bot.weights[PERSONALITIES.indexOf("paranoid")] += 0.04;
    bot.weights[idx] += 0.01;
    const sum = bot.weights.reduce((a, b) => a + b, 0) || 1;
    for (let i = 0; i < bot.weights.length; i++) bot.weights[i] /= sum;
    const next = dominantIndex(bot.weights);
    if (next !== bot.personality) {
      bot.personality = next;
      bot.streak = 0;
      pushArchive(world, { type: "personality", text: bot.name + " now reads as " + PERSONALITIES[next] + ".", botId: bot.id });
    }
  }

  function act(world, bot) {
    if (bot.broke && bot.cash <= 1 && bot.companyIds.length === 0) {
      if (world.rng.next() < 0.01) logReason(bot, world, "Stayed ruined. Nobody would trade.");
      return;
    }
    const prev = bot.nw;
    const reasons = [];
    if (bot.broke) return;
    const squeeze = coverIfSqueezed(world, bot);
    if (squeeze) reasons.push(squeeze);
    if (bot.aiHint) {
      const used = applyHint(world, bot, bot.aiHint);
      bot.aiHint = null;
      if (used) return;
    }
    if (world.intelligence === "advanced") {
      const picked = actAdvanced(world, bot);
      if (picked) reasons.push(picked);
    } else {
      const inn = maybeInsider(world, bot);
      if (inn) reasons.push(inn);
      const inv = maybeInnovate(world, bot);
      if (inv) reasons.push(inv);
      const found = maybeFound(world, bot);
      if (found) reasons.push(found);
      const take = maybeTakeover(world, bot);
      if (take) reasons.push(take);
      const shorted = maybeShort(world, bot);
      if (shorted) reasons.push(shorted);
      const reb = rebalance(world, bot);
      if (reb) reasons.push(reb);
      const lev = maybeLeverage(world, bot);
      if (lev) reasons.push(lev);
      const soc = social(world, bot);
      if (soc) reasons.push(soc);
    }
    bot.nw = netWorth(world, bot);
    bot.tier = tierOf(bot.nw);
    if (bot.nw < cents(5000) && debtOf(bot) > bot.cash * 2) bot.objective = "survive";
    else if (bot.objective === "survive" && bot.nw > cents(200000) && debtOf(bot) < bot.nw * 0.4) {
      bot.objective = "richest";
    }
    driftPersonality(world, bot, prev);
    const line = reasons[0] || "Held. Nothing beat staying put.";
    if (bot.lastReason !== line) logReason(bot, world, line);
    if (reasons.length > 1) {
      pushArchive(world, { type: "act", text: bot.name + ": " + reasons[0], botId: bot.id });
    }
  }

  function actAdvanced(world, bot) {
    const options = [];
    const inn = maybeInsider(world, bot);
    if (inn) options.push(inn);
    const inv = maybeInnovate(world, bot);
    if (inv) options.push(inv);
    const reb = rebalance(world, bot);
    if (reb) options.push(reb);
    if (bot.risk > 0) {
      const lev = maybeLeverage(world, bot);
      if (lev) options.push(lev);
    }
    const soc = social(world, bot);
    if (soc) options.push(soc);
    if (!options.length) return null;
    return options[options.length - 1];
  }

  function applyHint(world, bot, hint) {
    const action = String(hint.action || "hold");
    const asset = hint.asset ? world.assetMap[hint.asset] : pickStock(world, bot, 0);
    const reason = hint.reason ? String(hint.reason).slice(0, 180) : "Followed an outside read.";
    if (action === "hold") { logReason(bot, world, reason); return true; }
    if (action === "buy" && asset) { trade(world, bot, asset, (bot.nw * 0.05) / asset.priceCents, reason); return true; }
    if (action === "sell" && asset && bot.holdings[asset.id] > 0) { trade(world, bot, asset, -bot.holdings[asset.id] * 0.4, reason); return true; }
    if (action === "short" && asset) { trade(world, bot, asset, -(bot.nw * 0.05) / asset.priceCents, reason); return true; }
    if (action === "borrow") { if (tryBorrow(world, bot, bot.nw * 0.2)) logReason(bot, world, reason); return true; }
    if (action === "invent") { const r = maybeInnovate(world, bot); logReason(bot, world, r || reason); return true; }
    logReason(bot, world, "Outside read fell back to the rule book. " + reason);
    return false;
  }

  function updatePublic(world) {
    let util = 0;
    let n = 0;
    let approval = 0;
    for (let i = 0; i < world.companies.length; i++) {
      const co = world.companies[i];
      if (co.failed || co.bank) continue;
      util += co.utilization;
      approval += co.approval;
      n++;
    }
    util = n ? util / n : 0.5;
    approval = n ? approval / n : 50;
    const pub = world.public;
    const unemployment = world.baseUnemployment + (1 - util) * 0.35;
    pub.employment = clamp(100 - unemployment * 100, 0, 100);
    pub.wages = clamp(pub.wages * 0.99 + (40 + util * 40 + (world.demand - 1) * 10) * 0.01, 0, 100);
    pub.affordability = clamp(100 - world.priceLevel * 18 - (50 - pub.wages) * 0.3, 0, 100);
    pub.availability = clamp(util > 0.95 ? 45 : 70 + (1 - util) * 20, 0, 100);
    pub.approval = clamp(approval, 0, 100);
    const ineqDrag = world.inequality.top1 * 40;
    pub.mood = clamp(pub.mood * 0.98 + (pub.employment * 0.25 + pub.affordability * 0.25 + pub.approval * 0.2 + 30 - ineqDrag) * 0.02, 0, 100);
    pub.living = clamp((pub.employment + pub.affordability + pub.mood + pub.availability + pub.approval) / 5, 0, 100);
    world.priceLevel = clamp(world.priceLevel * 0.995 + (1 + world.inflation / 365) * 0.005 * world.moneyIndex, 0.4, 3);
  }

  function updateMacro(world) {
    world.cycleDay++;
    if (world.cycleDay >= world.cycleLen) {
      world.cycleDay = 0;
      const i = (PHASES.indexOf(world.phase) + 1) % PHASES.length;
      world.phase = PHASES[i];
      world.cycleLen = 280 + Math.floor(world.rng.next() * 500);
      pushArchive(world, { type: "cycle", text: "The economy turned toward " + world.phase + "." });
    }
    const phaseDemand = { expansion: 1.05, boom: 1.18, bubble: 1.28, recession: 0.72, stagflation: 0.8, recovery: 0.95 }[world.phase] || 1;
    world.demand = phaseDemand * (0.9 + world.public.mood / 500);
    if (!world.rateLock || world.rateLock.days <= 0) {
      const phaseRate = { expansion: 0.035, boom: 0.04, bubble: 0.055, recession: 0.015, stagflation: 0.08, recovery: 0.03 }[world.phase] || 0.04;
      world.rate = clamp(world.rate * 0.99 + phaseRate * 0.01 + (world.rng.next() - 0.5) * 0.0008 * world.difficulty.vol, 0.001, 0.18);
    } else {
      world.rate = world.rateLock.rate;
      world.rateLock.days--;
    }
    world.cdRate = Math.max(0.005, world.rate - 0.005);
    world.tax = clamp(0.05 + world.regulation / 180, 0.02, 0.55);
    for (let i = 0; i < SECTORS.length; i++) {
      const s = SECTORS[i];
      const base = world.scenarioHot === s ? 1.25 : 1;
      world.sectorHot[s] = base * (0.85 + world.rng.next() * 0.3 * world.difficulty.shock);
    }
    if (world.absDay > 0 && world.absDay % (365 * 4) === 0) proposeElection(world);
    if (world.pendingLaw && world.observer) resolveLaw(world, true);
  }

  function proposeElection(world) {
    const mood = world.public.mood;
    let delta = mood < 40 ? 12 : mood > 65 ? -8 : 0;
    delta += world.lobbyBias;
    world.lobbyBias *= 0.4;
    const next = clamp(world.regulation + delta, 0, 100);
    world.pendingLaw = { regulation: next, day: world.absDay };
    pushNews(world, {
      text: "An election is pushing regulation toward " + Math.round(next) + "/100.",
      score: next < world.regulation ? 62 : 40,
      scope: "economy",
      target: null,
      duration: "fade",
      halfLife: 20,
      source: "government"
    });
  }

  function resolveLaw(world, accept) {
    if (!world.pendingLaw) return;
    if (accept) world.regulation = world.pendingLaw.regulation;
    pushArchive(world, { type: "law", text: accept ? "The new political priority took effect." : "The proposed shift was rejected." });
    world.pendingLaw = null;
  }

  function maybeShocks(world) {
    const rng = world.rng;
    const d = world.difficulty;
    if (rng.next() < 0.01 * d.swan) {
      const sector = SECTORS[Math.floor(rng.next() * SECTORS.length)];
      world.sectorHot[sector] *= 0.55;
      for (let i = 0; i < world.assets.length; i++) {
        const asset = world.assets[i];
        if (asset.sector === sector && asset.kind === "stock") {
          world.priceShock[asset.id] = 0.22;
          asset.priceCents = Math.max(1, asset.priceCents * (0.78 + rng.next() * 0.08));
        }
      }
      pushNews(world, {
        text: "A shock hit " + sector + ". Prices in that sector gapped down.",
        score: 12,
        scope: "industry",
        target: sector,
        duration: "fade",
        halfLife: 28,
        source: "shock"
      });
    }
    if (rng.next() < 0.02 * d.scandal) {
      const weighted = world.bots.filter((b) => !b.broke && (personalityOf(b) === "ruthless" || personalityOf(b) === "manipulative" || b.tier >= 2));
      const pool = weighted.length ? weighted : world.bots;
      const bot = pool[Math.floor(rng.next() * pool.length)];
      const exposed = bot.companyIds.length > 0;
      const scale = shockScale(world, bot, exposed);
      const fine = Math.round(Math.max(bot.nw, 0) * 0.04 * scale + cents(1000));
      bot.cash = Math.max(1, bot.cash - fine);
      bot.trust = clamp(bot.trust - 18 * scale, 0, 100);
      bot.business = clamp(bot.business - 12 * scale, 0, 100);
      bot.known.public = true;
      if (scale > 0.8) bot.known.holdings = true;
      pushNews(world, {
        text: "A scandal touched " + bot.name + ".",
        score: clamp(22 - scale * 10, 5, 40),
        scope: "bot",
        target: bot.id,
        duration: "fade",
        halfLife: 16,
        source: "scandal"
      });
    }
    if (rng.next() < 0.008 * d.shock && world.phase === "bubble") {
      pushNews(world, {
        text: "A speculative bubble is showing strain.",
        score: 30,
        scope: "economy",
        target: null,
        duration: "impulse",
        days: 20,
        source: "market"
      });
    }
  }

  function decayRivalry(world) {
    for (let i = 0; i < world.bots.length; i++) {
      const bot = world.bots[i];
      const keys = Object.keys(bot.rivalry);
      const fade = personalityOf(bot) === "ruthless" || personalityOf(bot) === "paranoid" ? 0.998 : 0.992;
      for (let k = 0; k < keys.length; k++) {
        bot.rivalry[keys[k]] *= fade;
        if (bot.rivalry[keys[k]] < 0.8) delete bot.rivalry[keys[k]];
      }
    }
  }

  function stepDayBody(world) {
    world.absDay = Math.floor(world.totalHours / 24);
    if (world.lastSimDay === world.absDay) return;
    world.lastSimDay = world.absDay;
    world.volume = {};
    updateMacro(world);
    for (let i = 0; i < world.bots.length; i++) {
      accrueSavingsAndCds(world, world.bots[i]);
      serviceDebt(world, world.bots[i]);
    }
    runCompanies(world);
    runBanks(world);
    markPrices(world);
    cacheNw(world);
    refreshLists(world);
    const order = world.bots.slice().sort((a, b) => a.id < b.id ? -1 : 1);
    for (let i = 0; i < order.length; i++) act(world, order[i]);
    markPrices(world);
    cacheNw(world);
    for (let i = 0; i < world.bots.length; i++) {
      const bot = world.bots[i];
      const prev = world.series.nw[bot.id][world.series.nw[bot.id].length - 1] || bot.startNw;
      if (!bot.broke && bot.nw < cents(1) && bot.debt > bot.cash) defaultBot(world, bot, "the books no longer covered the debt");
      bot.nw = netWorth(world, bot);
      bot.tier = tierOf(bot.nw);
      updateRecords(world, bot, prev);
      if (bot.tier >= 2 && bot.nw < prev * 0.97) bot.falloff += 1;
      else bot.falloff = Math.max(0, bot.falloff - 1);
    }
    refreshLists(world);
    updatePublic(world);
    maybeShocks(world);
    decayRivalry(world);
    cacheNw(world);
    refreshLists(world);
    recordSeries(world);
    if (world.absDay % 1 === 0) takeSnap(world, "day");
    checkEnd(world);
    world.publicHeadline();
  }

  function checkEnd(world) {
    if (world.endWhen === "wealth" && world.records.richest && world.records.richest.nw >= world.wealthGoal) {
      world.ended = "A bot reached the wealth goal.";
    }
    if (world.endWhen === "collapse" && world.public.mood < 10 && world.public.employment < 18 && world.bankFailures >= 1) {
      world.ended = "The economy collapsed.";
    }
  }

  function takeSnap(world, label) {
    if (label === "day" && world.snaps.length && world.snaps[world.snaps.length - 1].day === world.absDay && world.snaps[world.snaps.length - 1].label === "day") return;
    const state = cloneState(world);
    const snap = { label, day: world.absDay, hours: world.totalHours, seriesLen: world.series.day.length, state };
    world.snaps.push(snap);
    const limit = world.bots.length > 400 ? 24 : 70;
    while (world.snaps.length > limit) {
      const idx = world.snaps.findIndex((s) => s.label === "day");
      if (idx < 0) break;
      world.snaps.splice(idx, 1);
    }
  }

  function cloneState(world) {
    return {
      totalHours: world.totalHours,
      absDay: world.absDay,
      lastSimDay: world.lastSimDay,
      rng: world.rng.state,
      rate: world.rate,
      cdRate: world.cdRate,
      regulation: world.regulation,
      tax: world.tax,
      inflation: world.inflation,
      priceLevel: world.priceLevel,
      moneyIndex: world.moneyIndex,
      demand: world.demand,
      phase: world.phase,
      cycleDay: world.cycleDay,
      cycleLen: world.cycleLen,
      rateLock: world.rateLock ? { rate: world.rateLock.rate, days: world.rateLock.days } : null,
      pendingLaw: world.pendingLaw ? { regulation: world.pendingLaw.regulation, day: world.pendingLaw.day } : null,
      lobbyBias: world.lobbyBias,
      bankFailures: world.bankFailures,
      contagion: world.contagion,
      butterflyUntil: world.butterflyUntil,
      butterflyId: world.butterflyId,
      godSeq: world.godSeq,
      ended: world.ended,
      public: Object.assign({}, world.public),
      inequality: Object.assign({}, world.inequality),
      sectorHot: Object.assign({}, world.sectorHot),
      records: JSON.parse(JSON.stringify(world.records)),
      prices: world.assets.map((a) => ({ id: a.id, priceCents: a.priceCents })),
      companies: world.companies.map((c) => ({
        id: c.id, smoothEarn: c.smoothEarn, approval: c.approval, productPrice: c.productPrice,
        failing: c.failing, failed: c.failed, ownerId: c.ownerId, capital: c.capital,
        liquidity: c.liquidity, loansOut: c.loansOut, deposits: c.deposits, boycott: c.boycott,
        product: c.product, lossStreak: c.lossStreak
      })),
      bots: world.bots.map((b) => ({
        id: b.id, cash: b.cash, savings: b.savings, holdings: Object.assign({}, b.holdings),
        cost: Object.assign({}, b.cost), loans: b.loans.map((l) => Object.assign({}, l)),
        cdLots: b.cdLots.map((l) => Object.assign({}, l)),
        weights: b.weights.slice(), personality: b.personality, risk: b.risk,
        objective: b.objective, goalSector: b.goalSector, goalTarget: b.goalTarget,
        rivalry: Object.assign({}, b.rivalry), allies: b.allies.slice(),
        blocked: JSON.parse(JSON.stringify(b.blocked)),
        companyIds: b.companyIds.slice(), credibility: b.credibility, trust: b.trust,
        business: b.business, influence: b.influence, streak: b.streak, falloff: b.falloff,
        broke: b.broke, peak: b.peak, godNet: b.godNet, known: Object.assign({}, b.known),
        insider: b.insider ? Object.assign({}, b.insider) : null,
        bankId: b.bankId, tags: Object.assign({}, b.tags), lastReason: b.lastReason
      }))
    };
  }

  function restoreSnap(world, snap) {
    const s = snap.state;
    world.totalHours = s.totalHours;
    world.absDay = s.absDay;
    world.lastSimDay = s.lastSimDay;
    world.rng.state = s.rng;
    world.rate = s.rate;
    world.cdRate = s.cdRate;
    world.regulation = s.regulation;
    world.tax = s.tax;
    world.inflation = s.inflation;
    world.priceLevel = s.priceLevel;
    world.moneyIndex = s.moneyIndex;
    world.demand = s.demand;
    world.phase = s.phase;
    world.cycleDay = s.cycleDay;
    world.cycleLen = s.cycleLen;
    world.rateLock = s.rateLock;
    world.pendingLaw = s.pendingLaw;
    world.lobbyBias = s.lobbyBias;
    world.bankFailures = s.bankFailures;
    world.contagion = s.contagion;
    world.butterflyUntil = s.butterflyUntil;
    world.butterflyId = s.butterflyId;
    world.godSeq = s.godSeq;
    world.ended = s.ended;
    world.public = s.public;
    world.inequality = s.inequality;
    world.sectorHot = s.sectorHot;
    world.records = s.records;
    for (let i = 0; i < s.prices.length; i++) {
      const asset = world.assetMap[s.prices[i].id];
      if (asset) asset.priceCents = s.prices[i].priceCents;
    }
    for (let i = 0; i < s.companies.length; i++) {
      const src = s.companies[i];
      const co = world.companyMap[src.id];
      if (!co) continue;
      Object.assign(co, src);
    }
    for (let i = 0; i < s.bots.length; i++) {
      const src = s.bots[i];
      const bot = world.botMap[src.id];
      if (!bot) continue;
      bot.cash = src.cash;
      bot.savings = src.savings;
      bot.holdings = src.holdings;
      bot.cost = src.cost;
      bot.loans = src.loans;
      bot.cdLots = src.cdLots;
      bot.weights = src.weights;
      bot.personality = src.personality;
      bot.risk = src.risk;
      bot.objective = src.objective;
      bot.goalSector = src.goalSector;
      bot.goalTarget = src.goalTarget;
      bot.rivalry = src.rivalry;
      bot.allies = src.allies;
      bot.blocked = src.blocked;
      bot.companyIds = src.companyIds;
      bot.credibility = src.credibility;
      bot.trust = src.trust;
      bot.business = src.business;
      bot.influence = src.influence;
      bot.streak = src.streak;
      bot.falloff = src.falloff;
      bot.broke = src.broke;
      bot.peak = src.peak;
      bot.godNet = src.godNet;
      bot.known = src.known;
      bot.insider = src.insider;
      bot.bankId = src.bankId;
      bot.tags = src.tags;
      bot.lastReason = src.lastReason;
    }
    trimSeries(world, snap.seriesLen);
    cacheNw(world);
    refreshLists(world);
    world.snaps = world.snaps.filter((sn) => sn.hours < snap.hours || (sn.hours === snap.hours && sn === snap));
  }

  function trimSeries(world, len) {
    const s = world.series;
    const cut = (arr) => { if (arr.length > len) arr.length = len; };
    cut(s.day); cut(s.rate); cut(s.mood); cut(s.employment); cut(s.top1); cut(s.index);
    for (const id in s.price) { cut(s.price[id]); cut(s.volume[id]); }
    for (const id in s.nw) cut(s.nw[id]);
  }

  function stepTick(world) {
    if (world.ended && world.endWhen) return;
    world.totalHours += 2;
    intradayDrift(world);
    if (world.totalHours % 24 === 12) titanPulse(world);
    if (world.totalHours % 24 === 0) stepDayBody(world);
  }

  function stepDay(world) {
    if (world.ended && world.endWhen) return;
    if (world.totalHours % 24 === 0) world.totalHours += 24;
    else world.totalHours += 24 - (world.totalHours % 24);
    stepDayBody(world);
  }

  function titanPulse(world) {
    for (let i = 0; i < world.bots.length; i++) {
      const bot = world.bots[i];
      if (bot.tier >= 2 && !bot.broke) {
        const reb = rebalance(world, bot);
        if (reb) logReason(bot, world, "Mid-day: " + reb);
      }
    }
  }

  function publicHeadline(world) {
    if (world.absDay > 0 && world.absDay % 30 === 0) {
      const score = Math.round(world.public.mood);
      pushNews(world, {
        text: "Public mood is " + score + "/100. Employment " + Math.round(world.public.employment) + ", living standard " + Math.round(world.public.living) + ".",
        score,
        scope: "economy",
        target: null,
        duration: "impulse",
        days: 8,
        source: "public"
      });
    }
  }

  function blankBot(world, i, name) {
    const weights = PERSONALITIES.map(() => 0.2 + world.rng.next());
    if (world.scenarioName === "tech" && world.rng.next() < 0.35) weights[PERSONALITIES.indexOf("innovative")] += 1.4;
    const sum = weights.reduce((a, b) => a + b, 0);
    for (let k = 0; k < weights.length; k++) weights[k] /= sum;
    const personality = dominantIndex(weights);
    const p = PERSONALITIES[personality];
    let risk = p === "cautious" || p === "paranoid" ? 0 : p === "ruthless" || p === "opportunistic" ? 2 : 1;
    if (world.rng.next() < 0.1) risk = (risk + 1) % 3;
    const objective = OBJECTIVES[Math.floor(world.rng.next() * 3)];
    return {
      id: "p" + i,
      name,
      cash: 0,
      savings: 0,
      holdings: {},
      cost: {},
      loans: [],
      cdLots: [],
      weights,
      personality,
      risk,
      objective,
      goalSector: SECTORS[Math.floor(world.rng.next() * SECTORS.length)],
      goalTarget: null,
      rivalry: {},
      allies: [],
      blocked: {},
      companyIds: [],
      credibility: 40 + world.rng.next() * 40,
      trust: 40 + world.rng.next() * 40,
      business: 40 + world.rng.next() * 35,
      influence: world.rng.next() * 20,
      streak: 0,
      falloff: 0,
      broke: false,
      peak: 0,
      startNw: 0,
      godNet: 0,
      known: { public: false, holdings: false, insider: false },
      insider: null,
      bankId: null,
      tags: {},
      lastReason: "Waiting on the open.",
      log: [],
      nw: 0,
      debt: 0,
      tier: 0,
      aiHint: null
    };
  }

  function createWorld(options) {
    const opts = options || {};
    const seed = (opts.seed >>> 0) || 1;
    const rng = mulberry32(seed);
    const scenarioName = SCENARIOS[opts.scenario] ? opts.scenario : "boom";
    const scenario = Object.assign({}, SCENARIOS[scenarioName]);
    const difficulty = DIFFICULTY[opts.difficulty] ? opts.difficulty : "volatile";
    if (scenarioName === "custom") {
      if (opts.rate != null) scenario.rate = Number(opts.rate);
      if (opts.regulation != null) scenario.regulation = Number(opts.regulation);
      if (opts.inflation != null) scenario.inflation = Number(opts.inflation);
      if (opts.tax != null) scenario.tax = Number(opts.tax);
      if (opts.unemployment != null) scenario.unemployment = Number(opts.unemployment);
      if (opts.money != null) scenario.money = Number(opts.money);
    }
    const n = clamp(Math.round(opts.bots || 80), 1, 1000);
    const world = {
      seed,
      rng,
      scenarioName,
      difficultyName: difficulty,
      difficulty: DIFFICULTY[difficulty],
      scenarioHot: scenario.hot || null,
      observer: !!opts.observer,
      intelligence: opts.intelligence || "rules",
      fog: !!opts.fog,
      endWhen: opts.endWhen || null,
      wealthGoal: opts.wealthGoal || cents(1e11),
      totalHours: 0,
      absDay: 0,
      lastSimDay: -1,
      rate: scenario.rate,
      cdRate: Math.max(0.005, scenario.rate - 0.005),
      regulation: scenario.regulation,
      tax: scenario.tax,
      inflation: scenario.inflation,
      priceLevel: 1,
      moneyIndex: scenario.money,
      baseUnemployment: scenario.unemployment,
      demand: 1,
      phase: scenario.phase,
      cycleDay: 0,
      cycleLen: 400,
      rateLock: null,
      pendingLaw: null,
      lobbyBias: 0,
      bankFailures: 0,
      contagion: 0,
      butterflyUntil: -1,
      butterflyId: null,
      godSeq: 1,
      newsSeq: 1,
      companySeq: 1,
      ended: null,
      downsampled: false,
      public: { mood: scenario.mood, employment: 70, affordability: 60, wages: 55, availability: 70, approval: 60, living: 62 },
      inequality: { top1: 0, top10: 0, bottom50: 0 },
      sectorHot: {},
      records: { richest: null, bestDay: null, worstDay: null, biggestDefault: null },
      news: [],
      archive: [],
      godLog: [],
      alliances: [],
      snaps: [],
      assets: [],
      assetMap: {},
      companies: [],
      companyMap: {},
      bots: [],
      botMap: {},
      flow: {},
      volume: {},
      priceShock: {},
      series: { day: [], rate: [], mood: [], employment: [], top1: [], index: [], price: {}, volume: {}, nw: {} },
      indexLevel: 10000,
      totalNw: 0,
      order: [],
      richIds: [],
      poorIds: []
    };
    for (let i = 0; i < SECTORS.length; i++) world.sectorHot[SECTORS[i]] = scenario.hot === SECTORS[i] ? 1.3 : 1;

    const used = {};
    const wealthDollars = [];
    if (scenario.power) {
      const raw = [];
      for (let i = 0; i < n; i++) raw.push(powerWealth(i, n));
      const hi = raw[0];
      const lo = raw[raw.length - 1];
      for (let i = 0; i < n; i++) {
        const t = (raw[i] - lo) / (hi - lo || 1);
        wealthDollars.push(scenario.wealth[0] + t * (scenario.wealth[1] - scenario.wealth[0]));
      }
    } else {
      for (let i = 0; i < n; i++) wealthDollars.push(logWealth(rng, scenario.wealth[0], scenario.wealth[1]));
    }
    if (Array.isArray(opts.wealthList) && opts.wealthList.length) {
      for (let i = 0; i < opts.wealthList.length && i < n; i++) {
        const w = Number(opts.wealthList[i]);
        if (isFinite(w) && w >= 0) wealthDollars[i] = w;
      }
    }
    if (opts.flatWealth != null && opts.flatWealth !== "" && isFinite(Number(opts.flatWealth))) {
      const flat = Number(opts.flatWealth);
      for (let i = 0; i < n; i++) wealthDollars[i] = flat;
    }

    for (let i = 0; i < n; i++) {
      const bot = blankBot(world, i, makeName(rng, used));
      bot.cash = cents(wealthDollars[i]);
      if (rng.next() < scenario.debtChance) {
        const principal = Math.round(bot.cash * scenario.debtLoad * (0.35 + rng.next() * 0.7));
        if (principal > 1000) {
          bot.loans.push({ principal, rate: scenario.rate + 0.04, lender: null, dueDay: 365 * 5 });
          bot.cash += principal;
        }
      }
      world.bots.push(bot);
      world.botMap[bot.id] = bot;
      world.series.nw[bot.id] = [];
    }
    for (let i = 0; i < n; i++) {
      const bot = world.bots[i];
      if (bot.objective === "bankrupt") {
        const other = world.bots[(i + 1 + Math.floor(rng.next() * (n - 1))) % n];
        bot.goalTarget = other.id;
        bot.rivalry[other.id] = 15;
      }
    }

    const bond = { id: "bond", kind: "bond", ticker: "GOVT", name: "Benchmark bond", companyId: null, sector: null, priceCents: 10000, basePrice: 10000, basket: null };
    const index = { id: "index", kind: "index", ticker: "WIDE", name: "Broad index", companyId: null, sector: null, priceCents: 10000, basePrice: 10000, basket: [] };
    const mutual = { id: "mutual", kind: "mutual", ticker: "POOL", name: "Mutual pool", companyId: null, sector: null, priceCents: 10000, basePrice: 10000, basket: [] };
    world.assets.push(bond, index, mutual);
    world.series.price.bond = [];
    world.series.price.index = [];
    world.series.price.mutual = [];
    world.series.volume.bond = [];
    world.series.volume.index = [];
    world.series.volume.mutual = [];

    const ranked = world.bots.slice().sort((a, b) => b.cash - a.cash);
    const companyTarget = clamp(Math.round(n / 10), 7, 36);
    for (let i = 0; i < companyTarget; i++) {
      const owner = ranked[i % ranked.length];
      const sector = SECTORS[i % SECTORS.length];
      const capital = Math.max(cents(200000), Math.round(owner.cash * 0.18));
      if (owner.cash > capital) owner.cash -= capital;
      else continue;
      createCompany(world, owner, sector, capital);
    }
    const banks = world.companies.filter((c) => c.bank);
    if (!banks.length && world.companies.length) {
      world.companies[0].bank = true;
      world.companies[0].liquidity = cents(5e6) * scenario.bankHealth;
      world.companies[0].capital = cents(2e6) * scenario.bankHealth;
      banks.push(world.companies[0]);
    }
    for (let i = 0; i < banks.length; i++) {
      banks[i].liquidity *= scenario.bankHealth;
      banks[i].capital *= scenario.bankHealth;
    }
    for (let i = 0; i < world.bots.length; i++) {
      const bot = world.bots[i];
      const bank = banks[i % Math.max(1, banks.length)];
      if (!bank) continue;
      bot.bankId = bank.id;
      if (bot.loans.length && !bot.loans[0].lender) bot.loans[0].lender = bank.id;
      const save = Math.round(bot.cash * (bot.risk === 0 ? 0.45 : 0.15));
      if (save > 0) {
        bot.cash -= save;
        bot.savings = save;
        bank.deposits += save;
        bank.liquidity += save;
      }
    }
    const stockIds = world.assets.filter((a) => a.kind === "stock").map((a) => a.id);
    index.basket = stockIds.slice();
    mutual.basket = stockIds.slice();
    for (let s = 0; s < SECTORS.length; s++) {
      const basket = world.assets.filter((a) => a.kind === "stock" && a.sector === SECTORS[s]).map((a) => a.id);
      if (!basket.length) continue;
      const id = "etf" + s;
      const etf = { id, kind: "etf", ticker: SECTORS[s].slice(0, 3).toUpperCase() + "F", name: SECTORS[s] + " ETF", companyId: null, sector: SECTORS[s], priceCents: 10000, basePrice: 10000, basket };
      world.assets.push(etf);
      world.series.price[id] = [];
      world.series.volume[id] = [];
    }
    const cd = { id: "cd", kind: "cd", ticker: "CD", name: "Certificate of deposit", companyId: null, sector: null, priceCents: Math.round(world.cdRate * 10000), basePrice: 10000, basket: null };
    world.assets.push(cd);
    world.series.price.cd = [];
    world.series.volume.cd = [];
    for (let i = 0; i < world.assets.length; i++) world.assetMap[world.assets[i].id] = world.assets[i];

    markPrices(world);
    for (let i = 0; i < world.assets.length; i++) {
      if (world.assets[i].kind === "cd") world.assets[i].priceCents = Math.round(world.cdRate * 100000);
    }
    cacheNw(world);
    for (let i = 0; i < world.bots.length; i++) {
      const bot = world.bots[i];
      bot.startNw = bot.nw;
      bot.peak = bot.nw;
    }
    refreshLists(world);
    if (world.records) {
      const top = world.bots[world.order[0].i];
      world.records.richest = { id: top.id, name: top.name, nw: top.nw, day: 0 };
    }
    recordSeries(world);
    pushNews(world, {
      text: "The market opened. " + n + " bots, seed " + seed + ", " + scenarioName + " / " + difficulty + ".",
      score: Math.round(scenario.mood),
      scope: "economy",
      target: null,
      duration: "impulse",
      days: 5,
      source: "system"
    });
    world.publicHeadline = function () { publicHeadline(world); };
    world.options = {
      seed,
      bots: n,
      scenario: scenarioName,
      difficulty,
      wealthList: opts.wealthList || null,
      flatWealth: opts.flatWealth != null && opts.flatWealth !== "" ? opts.flatWealth : null,
      observer: !!opts.observer,
      intelligence: world.intelligence,
      fog: !!opts.fog,
      endWhen: world.endWhen,
      wealthGoal: world.wealthGoal,
      rate: scenarioName === "custom" ? scenario.rate : null,
      regulation: scenarioName === "custom" ? scenario.regulation : null,
      inflation: scenarioName === "custom" ? scenario.inflation : null,
      tax: scenarioName === "custom" ? scenario.tax : null,
      unemployment: scenarioName === "custom" ? scenario.unemployment : null,
      money: scenarioName === "custom" ? scenario.money : null
    };
    return world;
  }

  function metrics(world) {
    return {
      day: world.absDay,
      hours: world.totalHours,
      totalNw: world.totalNw,
      mood: world.public.mood,
      rate: world.rate,
      regulation: world.regulation,
      richest: world.records.richest ? world.records.richest.nw : 0
    };
  }

  function applyGod(world, cmd) {
    if (world.observer && !cmd.replay) return { ok: false, reason: "Observer mode is on." };
    const before = metrics(world);
    const type = cmd.type;
    let text = "";
    if (type === "news") {
      pushNews(world, {
        text: String(cmd.text || "Untitled dispatch").slice(0, 240),
        score: clamp(Number(cmd.score) || 50, 0, 100),
        scope: cmd.scope || "economy",
        target: cmd.target || null,
        duration: cmd.duration || "fade",
        days: Number(cmd.days) || 12,
        halfLife: Number(cmd.halfLife) || 18,
        source: "god"
      });
      text = "Injected news (" + (cmd.score || 50) + "/100).";
    } else if (type === "money") {
      const amount = Math.round(Number(cmd.amount) || 0);
      if (!amount) return { ok: false, reason: "Amount is zero." };
      if (cmd.mode === "broad") {
        const mag = clamp(amount / Math.max(1, world.totalNw), -0.5, 0.5);
        world.moneyIndex = clamp(world.moneyIndex * (1 + mag), 0.2, 5);
        world.inflation += mag * 0.2;
        for (let i = 0; i < world.assets.length; i++) {
          if (world.assets[i].kind !== "cd") world.assets[i].priceCents = Math.max(1, world.assets[i].priceCents * (1 + mag));
        }
        world.priceLevel = clamp(world.priceLevel * (1 + mag), 0.3, 4);
        text = (amount > 0 ? "Expanded" : "Contracted") + " the money supply.";
      } else {
        const bot = world.botMap[cmd.target];
        if (!bot) return { ok: false, reason: "Pick a bot." };
        if (amount > 0) bot.cash += amount;
        else bot.cash = Math.max(0, bot.cash + amount);
        bot.godNet += amount;
        bot.broke = false;
        text = (amount > 0 ? "Created " : "Destroyed ") + formatShort(amount) + " at " + bot.name + ".";
      }
    } else if (type === "rate") {
      const rate = clamp(Number(cmd.rate) || 0, 0, 0.25);
      const days = Math.max(1, Math.round(Number(cmd.days) || 30));
      world.rateLock = { rate, days };
      world.rate = rate;
      text = "Set the benchmark rate to " + (rate * 100).toFixed(2) + "% for " + days + " days.";
    } else if (type === "regulation") {
      world.regulation = clamp(Number(cmd.regulation) || 0, 0, 100);
      world.tax = clamp(0.05 + world.regulation / 180, 0.02, 0.55);
      text = "Set regulation to " + Math.round(world.regulation) + "/100.";
    } else if (type === "reward" || type === "punish") {
      const bot = world.botMap[cmd.target];
      if (!bot) return { ok: false, reason: "Pick a bot." };
      const kind = cmd.kind || (type === "reward" ? "cash" : "fine");
      const amount = Math.round(Math.abs(Number(cmd.amount) || 0));
      if (kind === "cash") {
        const signed = type === "reward" ? amount : -amount;
        bot.cash = Math.max(0, bot.cash + signed);
        bot.godNet += signed;
      } else if (kind === "forgive") {
        bot.loans = [];
      } else if (kind === "fine") {
        bot.cash = Math.max(0, bot.cash - amount);
        bot.godNet -= amount;
      } else if (kind === "seize") {
        bot.holdings = {};
        bot.savings = 0;
        bot.cdLots = [];
      } else if (kind === "reputation") {
        const delta = type === "reward" ? 15 : -20;
        bot.trust = clamp(bot.trust + delta, 0, 100);
        bot.business = clamp(bot.business + delta, 0, 100);
        bot.credibility = clamp(bot.credibility + delta, 0, 100);
      } else if (kind === "bankrupt") {
        defaultBot(world, bot, "a direct punishment");
      }
      bot.broke = kind === "bankrupt" ? true : bot.cash > 1 ? false : bot.broke;
      text = (type === "reward" ? "Rewarded " : "Punished ") + bot.name + " (" + kind + ").";
    } else if (type === "law") {
      resolveLaw(world, !!cmd.accept);
      text = cmd.accept ? "Accepted the political shift." : "Rejected the political shift.";
    } else {
      return { ok: false, reason: "Unknown action." };
    }
    cacheNw(world);
    const id = "g" + (world.godSeq++);
    world.butterflyId = id;
    world.butterflyUntil = world.absDay + 15;
    const after = metrics(world);
    if (!cmd.replay) world.godLog.unshift({ id, day: world.absDay, text, before, after, cmd: Object.assign({}, cmd) });
    if (world.godLog.length > 200) world.godLog.pop();
    pushArchive(world, { type: "god", text, godId: id });
    if (!cmd.replay) takeSnap(world, "god");
    return { ok: true, text };
  }

  function replayWorld(save) {
    const world = createWorld(save.options || {});
    const cmds = (save.godLog || []).slice().reverse();
    const target = save.summary && save.summary.day ? save.summary.day : 0;
    let i = 0;
    while (world.absDay < target) {
      while (i < cmds.length && cmds[i].day === world.absDay && cmds[i].cmd) {
        applyGod(world, Object.assign({}, cmds[i].cmd, { replay: true }));
        i++;
      }
      stepDay(world);
    }
    while (i < cmds.length && cmds[i].day === world.absDay && cmds[i].cmd) {
      applyGod(world, Object.assign({}, cmds[i].cmd, { replay: true }));
      i++;
    }
    world.observer = !!(save.options && save.options.observer);
    world.fog = !!(save.options && save.options.fog);
    if (save.options && save.options.intelligence) world.intelligence = save.options.intelligence;
    return world;
  }

  function leaderboard(world, key) {
    const rows = world.bots.map((bot) => ({
      bot,
      nw: bot.nw,
      cash: bot.cash,
      debt: bot.debt,
      assets: bot.nw - bot.cash + bot.debt,
      profit: lifetimeProfit(world, bot)
    }));
    const k = key || "nw";
    rows.sort((a, b) => (b[k] - a[k]) || (a.bot.id < b.bot.id ? -1 : 1));
    return rows;
  }

  function exportSave(world) {
    const slimSeries = {
      day: world.series.day.slice(),
      rate: world.series.rate.slice(),
      mood: world.series.mood.slice(),
      employment: world.series.employment.slice(),
      top1: world.series.top1.slice(),
      index: world.series.index.slice(),
      price: {},
      volume: {},
      nw: {}
    };
    for (const id in world.series.price) {
      slimSeries.price[id] = downsample(world.series.price[id], 700);
      slimSeries.volume[id] = downsample(world.series.volume[id], 700);
    }
    slimSeries.dayMarks = downsample(world.series.day, 700);
    for (const id in world.series.nw) slimSeries.nw[id] = downsample(world.series.nw[id], world.bots.length > 250 ? 400 : 800);
    return {
      version: 1,
      created: Date.now(),
      seed: world.seed,
      scenario: world.scenarioName,
      difficulty: world.difficultyName,
      bots: world.bots.length,
      summary: metrics(world),
      records: world.records,
      state: cloneState(world),
      names: world.bots.map((b) => ({ id: b.id, name: b.name, startNw: b.startNw })),
      companyNames: world.companies.map((c) => ({ id: c.id, name: c.name, sector: c.sector, stockId: c.stockId, bank: c.bank, shares: c.shares })),
      assetMeta: world.assets.map((a) => ({ id: a.id, kind: a.kind, ticker: a.ticker, name: a.name, sector: a.sector, companyId: a.companyId, basket: a.basket, basePrice: a.basePrice })),
      series: slimSeries,
      archive: world.archive.slice(-400),
      news: world.news.slice(0, 40),
      godLog: world.godLog.slice(0, 40)
    };
  }

  function downsample(arr, max) {
    if (!arr || arr.length <= max) return arr ? arr.slice() : [];
    const out = [];
    const step = (arr.length - 1) / (max - 1);
    for (let i = 0; i < max; i++) out.push(arr[Math.round(i * step)]);
    return out;
  }

  global.Capsim = {
    PERSONALITIES,
    SECTORS,
    SCENARIOS,
    DIFFICULTY,
    createWorld,
    stepTick,
    stepDay,
    applyGod,
    leaderboard,
    netWorth,
    lifetimeProfit,
    maxLeverage,
    tierOf,
    tierName,
    personalityOf,
    exportSave,
    replayWorld,
    restoreSnap,
    metrics,
    cents,
    dollars,
    formatShort,
    shockScale
  };
})(typeof window !== "undefined" ? window : globalThis);
