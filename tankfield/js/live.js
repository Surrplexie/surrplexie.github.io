/* Tankfield Live — chat claims + gift drama (TikTok / Twitch / YouTube bridge). */
(function () {
  "use strict";

  const MAX_NICK = 25;
  const QUEUE_CAP = 200;
  const BLOCKLIST = [
    "nigger", "nigga", "faggot", "fag", "retard", "rape", "rapist", "pedo", "paedo",
    "hitler", "nazi", "kkk", "isis", "onlyfans", "pornhub", "xvideos", "child porn",
    "cp ", " fuck ", "shit", "bitch", "cunt", "whore", "slut", "kys", "kill yourself",
  ];
  const HOMoglyphS = {
    "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "у": "y", "х": "x", "і": "i",
    "ѕ": "s", "ⅰ": "i", "ⅼ": "l", "ο": "o", "ν": "v", "τ": "t", "０": "0", "１": "1",
    "２": "2", "３": "3", "４": "4", "５": "5", "６": "6", "７": "7", "８": "8", "９": "9",
  };

  const GIFT_IDS = {
    rose: { coins: 1, cd: 3, label: "Rose" },
    finger_heart: { coins: 5, cd: 2, label: "Finger Heart" },
    donut: { coins: 30, cd: 8, label: "Donut" },
    love_balloon: { coins: 99, cd: 15, label: "Love Balloon" },
    sunglasses: { coins: 199, cd: 20, label: "Sunglasses" },
    money_gun: { coins: 500, cd: 30, label: "Money Gun" },
    galaxy: { coins: 1000, cd: 60, label: "Galaxy" },
    planet: { coins: 15000, cd: 120, label: "Planet" },
    lion: { coins: 29999, cd: 180, label: "Lion" },
    tiktok_universe: { coins: 44999, cd: 300, label: "TikTok Universe" },
  };

  const ALIASES = {
    rose: "rose",
    fingerheart: "finger_heart",
    "finger heart": "finger_heart",
    "finger_heart": "finger_heart",
    donut: "donut",
    loveballoon: "love_balloon",
    "love balloon": "love_balloon",
    "love_balloon": "love_balloon",
    sunglasses: "sunglasses",
    moneygun: "money_gun",
    "money gun": "money_gun",
    "money_gun": "money_gun",
    galaxy: "galaxy",
    planet: "planet",
    lion: "lion",
    universe: "tiktok_universe",
    "tiktok universe": "tiktok_universe",
    tiktok_universe: "tiktok_universe",
  };

  const live = {
    active: false,
    giftsPaused: false,
    queue: [],
    byUser: new Map(),
    cooldownUntil: new Map(),
    pendingGifts: new Map(),
    lastClaim: null,
    lastGift: null,
    lastBlocked: null,
    forcedHunted: null,
    forcedHuntedUntil: 0,
    spotlightTank: null,
    spotlightUntil: 0,
    chapterTitle: null,
    chapterUntil: 0,
    shapeRushUntil: 0,
    pinTank: null,
    pinUntil: 0,
    config: {
      capacity: 100,
      mode: "manhunt",
      armsRace: false,
      growthVariant: false,
    },
  };

  function game() {
    return window.TankfieldGame || null;
  }

  function now() {
    const g = game();
    return (g && g.state && g.state.time) || 0;
  }

  function note(msg, ms) {
    const g = game();
    if (g && typeof g.note === "function") g.note(msg, ms);
  }

  function floater(x, y, text) {
    const g = game();
    if (g && typeof g.floater === "function") g.floater(x, y, text);
  }

  function foldHomoglyphs(s) {
    let out = "";
    for (const ch of s) out += HOMoglyphS[ch] || ch;
    return out;
  }

  function stripZalgo(s) {
    return s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  }

  function filterName(raw) {
    let s = stripZalgo(String(raw || ""));
    s = foldHomoglyphs(s.toLowerCase());
    s = s.replace(/https?:\/\/\S+/gi, "")
      .replace(/www\.\S+/gi, "")
      .replace(/@\w+/g, "")
      .replace(/[^\w\s.\-]/g, "")
      .replace(/_+/g, "_")
      .replace(/\s+/g, " ")
      .trim();
    if (!s || s.length < 2) return { ok: false, reason: "too short" };
    const compact = ` ${s.replace(/[_\s.\-]/g, "")} `;
    for (const bad of BLOCKLIST) {
      const b = bad.replace(/\s+/g, "");
      if (compact.includes(b) || s.includes(bad.trim())) {
        return { ok: false, reason: "blocked" };
      }
    }
    const display = String(raw || "")
      .normalize("NFKC")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s.\-]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_NICK);
    if (!display || display.length < 2) return { ok: false, reason: "too short" };
    return { ok: true, name: display };
  }

  function uniqueDisplay(prefer, exceptTank) {
    const g = game();
    if (g && typeof g.uniqueLiveName === "function") return g.uniqueLiveName(prefer, exceptTank);
    return String(prefer || "Viewer").slice(0, MAX_NICK);
  }

  function liveBots() {
    const g = game();
    if (!g || !g.state || !g.state.tanks) return [];
    return g.state.tanks.filter((t) =>
      t && t.ai && !t.closer && !t.mothership && !t.dominator && !t.boss && !t.fodder && !t.hostOnly
    );
  }

  function claimedBots() {
    return liveBots().filter((t) => t.liveOwnerId);
  }

  function unclaimedBots() {
    return liveBots().filter((t) => !t.liveOwnerId);
  }

  function findByOwner(userId) {
    if (!userId) return null;
    const id = String(userId);
    for (const t of liveBots()) {
      if (t.liveOwnerId === id) return t;
    }
    return null;
  }

  function bindTank(tank, owner) {
    if (!tank || !owner) return null;
    const name = uniqueDisplay(owner.displayName, tank);
    tank.name = name;
    tank.liveOwnerId = String(owner.userId);
    tank.livePlatform = owner.platform || "tiktok";
    tank.liveDisplay = name;
    tank.liveSeenAt = now();
    live.byUser.set(tank.liveOwnerId, tank.id);
    live.lastClaim = {
      name,
      userId: tank.liveOwnerId,
      platform: tank.livePlatform,
      at: Date.now(),
    };
    flushPending(tank);
    renderHud();
    return tank;
  }

  function unbindOwner(userId) {
    if (!userId) return;
    live.byUser.delete(String(userId));
  }

  function enqueue(owner) {
    const id = String(owner.userId);
    if (live.queue.some((q) => q.userId === id)) return { queued: true, pos: live.queue.findIndex((q) => q.userId === id) + 1 };
    if (live.queue.length >= QUEUE_CAP) return { ok: false, reason: "queue full" };
    live.queue.push({
      userId: id,
      displayName: owner.displayName,
      platform: owner.platform || "tiktok",
      at: Date.now(),
    });
    renderHud();
    return { queued: true, pos: live.queue.length };
  }

  function claimOrQueue(owner) {
    if (!live.active) return { ok: false, reason: "inactive" };
    const existing = findByOwner(owner.userId);
    if (existing) {
      existing.liveSeenAt = now();
      return { ok: true, tank: existing, refreshed: true };
    }
    const free = unclaimedBots().find((t) => t.alive);
    if (free) {
      bindTank(free, owner);
      note(`${owner.displayName} joined the field`, 3200);
      floater(free.x, free.y - free.r - 8, "JOINED");
      return { ok: true, tank: free, claimed: true };
    }
    return enqueue(owner);
  }

  function onBotDying(oldTank) {
    if (!live.active || !oldTank || !oldTank.ai) return null;
    const pendingClass = oldTank.livePendingClassId || null;
    oldTank.livePendingClassId = null;

    if (live.queue.length) {
      const unclaimedAlive = unclaimedBots().some((t) => t.alive && t !== oldTank);
      const takeSlot = !oldTank.liveOwnerId || !unclaimedAlive;
      if (takeSlot) {
        const next = live.queue.shift();
        if (oldTank.liveOwnerId) unbindOwner(oldTank.liveOwnerId);
        const name = uniqueDisplay(next.displayName, oldTank);
        renderHud();
        return {
          name,
          liveOwnerId: next.userId,
          livePlatform: next.platform || "tiktok",
          liveDisplay: name,
          livePendingClassId: null,
          rebind: true,
        };
      }
    }

    if (oldTank.liveOwnerId) {
      return {
        name: oldTank.liveDisplay || oldTank.name,
        liveOwnerId: oldTank.liveOwnerId,
        livePlatform: oldTank.livePlatform || "tiktok",
        liveDisplay: oldTank.liveDisplay || oldTank.name,
        livePendingClassId: pendingClass,
        rebind: false,
      };
    }
    return pendingClass ? { livePendingClassId: pendingClass } : null;
  }

  function onBotRespawned(bot, oldTank) {
    if (!live.active || !bot) return;
    if (bot.liveOwnerId) live.byUser.set(bot.liveOwnerId, bot.id);
    if (bot.livePendingClassId) {
      const g = game();
      if (g && typeof g.setLiveTankClass === "function") {
        g.setLiveTankClass(bot, bot.livePendingClassId);
      }
      bot.livePendingClassId = null;
      floater(bot.x, bot.y - bot.r - 8, "REROLL");
    }
    flushPending(bot);
    if (oldTank && live.forcedHunted === oldTank) live.forcedHunted = bot;
    if (oldTank && live.spotlightTank === oldTank) live.spotlightTank = bot;
    if (oldTank && live.pinTank === oldTank) live.pinTank = bot;
    renderHud();
  }

  function cdKey(userId, giftId) {
    return `${userId}::${giftId}`;
  }

  function onCooldown(userId, giftId) {
    const until = live.cooldownUntil.get(cdKey(userId, giftId)) || 0;
    return now() < until;
  }

  function setCooldown(userId, giftId, secs) {
    live.cooldownUntil.set(cdKey(userId, giftId), now() + secs);
  }

  function resolveGiftId(raw) {
    if (!raw) return null;
    const key = String(raw).trim().toLowerCase().replace(/[_-]+/g, " ");
    const compact = key.replace(/\s+/g, "");
    if (ALIASES[key]) return ALIASES[key];
    if (ALIASES[compact]) return ALIASES[compact];
    if (GIFT_IDS[raw]) return raw;
    if (GIFT_IDS[compact]) return compact;
    return null;
  }

  function queueGift(userId, giftId, payload) {
    const list = live.pendingGifts.get(userId) || [];
    list.push({ giftId, payload, at: Date.now() });
    live.pendingGifts.set(userId, list.slice(-8));
  }

  function flushPending(tank) {
    if (!tank || !tank.liveOwnerId) return;
    const list = live.pendingGifts.get(tank.liveOwnerId);
    if (!list || !list.length) return;
    live.pendingGifts.delete(tank.liveOwnerId);
    for (const item of list) applyGiftToTank(tank, item.giftId, item.payload || {});
  }

  function ensureOwnerTank(owner, giftId, payload) {
    let tank = findByOwner(owner.userId);
    if (tank) return tank;
    const result = claimOrQueue(owner);
    tank = result.tank || findByOwner(owner.userId);
    if (!tank) {
      queueGift(String(owner.userId), giftId, payload);
      return null;
    }
    return tank;
  }

  function applyGiftToTank(tank, giftId, payload) {
    const g = game();
    if (!g || !tank) return false;
    const t = now();
    switch (giftId) {
      case "rose": {
        if (!tank.alive) {
          tank.livePendingClassId = "random";
          floater(tank.x, tank.y - 10, "Reroll next life");
          break;
        }
        if (typeof g.rerollLiveTank === "function") g.rerollLiveTank(tank, { similar: true });
        floater(tank.x, tank.y - tank.r - 8, "REROLL");
        break;
      }
      case "finger_heart": {
        if (typeof g.recolorLiveTank === "function") g.recolorLiveTank(tank);
        floater(tank.x, tank.y - tank.r - 8, "STYLE");
        break;
      }
      case "donut": {
        if (tank.alive && typeof g.healLiveTank === "function") g.healLiveTank(tank, 0.25);
        floater(tank.x, tank.y - tank.r - 8, "+HP");
        break;
      }
      case "love_balloon": {
        if (typeof g.bumpLiveLevels === "function") g.bumpLiveLevels(tank, 1 + (Math.random() < 0.5 ? 1 : 0));
        floater(tank.x, tank.y - tank.r - 8, "LEVEL UP");
        break;
      }
      case "sunglasses": {
        tank.liveShieldUntil = Math.max(tank.liveShieldUntil || 0, t + 10);
        if (tank.alive && typeof g.healLiveTank === "function") g.healLiveTank(tank, 0.15);
        floater(tank.x, tank.y - tank.r - 8, "SHIELD");
        break;
      }
      case "money_gun": {
        tank.liveDamageUntil = Math.max(tank.liveDamageUntil || 0, t + 10);
        tank.liveSpotlightUntil = Math.max(tank.liveSpotlightUntil || 0, t + 10);
        live.spotlightTank = tank;
        live.spotlightUntil = t + 10;
        if (typeof g.liveSpotlight === "function") g.liveSpotlight(tank, 10);
        floater(tank.x, tank.y - tank.r - 8, "SPOTLIGHT");
        note(`${tank.name} is in the spotlight`, 3500);
        break;
      }
      case "galaxy": {
        const dur = 25;
        live.forcedHunted = tank;
        live.forcedHuntedUntil = t + dur;
        tank.liveForcedHuntedUntil = t + dur;
        if (typeof g.forceLiveHunted === "function") g.forceLiveHunted(tank, dur);
        floater(tank.x, tank.y - tank.r - 8, "HUNTED");
        note(`${tank.name} is the hunted mark`, 4000);
        break;
      }
      case "planet": {
        live.shapeRushUntil = t + 30;
        if (typeof g.liveShapeRush === "function") g.liveShapeRush(30);
        note("Planet gift · shape rush!", 5000);
        floater(tank.x, tank.y - tank.r - 8, "PLANET");
        break;
      }
      case "lion": {
        tank.liveOverdriveUntil = Math.max(tank.liveOverdriveUntil || 0, t + 25);
        tank.liveFatigueUntil = Math.max(tank.liveFatigueUntil || 0, t + 45);
        live.pinTank = tank;
        live.pinUntil = t + 25;
        live.spotlightTank = tank;
        live.spotlightUntil = t + 12;
        if (typeof g.liveSpotlight === "function") g.liveSpotlight(tank, 12);
        floater(tank.x, tank.y - tank.r - 8, "CHAMPION");
        note(`${tank.name} · Lion champion kit`, 4500);
        break;
      }
      case "tiktok_universe": {
        live.chapterTitle = payload.title || `${tank.name}'s Universe`;
        live.chapterUntil = t + 40;
        if (typeof g.liveUniverseChapter === "function") {
          g.liveUniverseChapter({
            title: live.chapterTitle,
            payer: tank,
            seconds: 40,
          });
        }
        note(live.chapterTitle, 6000);
        floater(tank.x, tank.y - tank.r - 8, "UNIVERSE");
        break;
      }
      default:
        return false;
    }
    live.lastGift = {
      giftId,
      label: (GIFT_IDS[giftId] && GIFT_IDS[giftId].label) || giftId,
      name: tank.name,
      at: Date.now(),
    };
    renderHud();
    return true;
  }

  function handleGift(evt) {
    if (!live.active) return { ok: false, reason: "inactive" };
    if (live.giftsPaused) return { ok: false, reason: "paused" };
    const giftId = resolveGiftId(evt.giftId || evt.gift || evt.name);
    if (!giftId || !GIFT_IDS[giftId]) return { ok: false, reason: "unknown gift" };
    const filtered = filterName(evt.displayName || evt.name || "Viewer");
    if (!filtered.ok) {
      live.lastBlocked = { reason: filtered.reason, at: Date.now() };
      renderHud();
      return { ok: false, reason: filtered.reason };
    }
    const owner = {
      userId: String(evt.userId || evt.uniqueId || filtered.name),
      displayName: filtered.name,
      platform: evt.platform || "tiktok",
    };
    if (onCooldown(owner.userId, giftId)) return { ok: false, reason: "cooldown" };
    setCooldown(owner.userId, giftId, GIFT_IDS[giftId].cd);
    const tank = ensureOwnerTank(owner, giftId, evt);
    if (!tank) return { ok: true, queued: true, giftId };
    applyGiftToTank(tank, giftId, evt);
    return { ok: true, giftId, tank };
  }

  function handleChat(evt) {
    if (!live.active) return { ok: false, reason: "inactive" };
    const filtered = filterName(evt.displayName || evt.name || evt.text || "");
    if (!filtered.ok) {
      live.lastBlocked = { reason: filtered.reason, raw: evt.displayName, at: Date.now() };
      renderHud();
      return { ok: false, reason: filtered.reason };
    }
    const owner = {
      userId: String(evt.userId || evt.uniqueId || filtered.name.toLowerCase()),
      displayName: filtered.name,
      platform: evt.platform || "tiktok",
    };
    return claimOrQueue(owner);
  }

  function handleLeave(evt) {
    const id = String((evt && (evt.userId || evt.uniqueId)) || "");
    if (!id) return;
    live.queue = live.queue.filter((q) => q.userId !== id);
    renderHud();
  }

  function ingest(evt) {
    if (!evt || typeof evt !== "object") return { ok: false, reason: "bad event" };
    const type = String(evt.type || "").toLowerCase();
    if (type === "chat" || type === "comment" || type === "message") return handleChat(evt);
    if (type === "gift" || type === "donate" || type === "cheer") return handleGift(evt);
    if (type === "leave" || type === "disconnect") return handleLeave(evt);
    return { ok: false, reason: "unknown type" };
  }

  function tick(dt) {
    if (!live.active) return;
    const t = now();
    if (live.forcedHuntedUntil && t >= live.forcedHuntedUntil) {
      live.forcedHunted = null;
      live.forcedHuntedUntil = 0;
      const g = game();
      if (g && typeof g.clearLiveForcedHunted === "function") g.clearLiveForcedHunted();
    }
    if (live.spotlightUntil && t >= live.spotlightUntil) {
      live.spotlightTank = null;
      live.spotlightUntil = 0;
    }
    if (live.pinUntil && t >= live.pinUntil) {
      live.pinTank = null;
      live.pinUntil = 0;
    }
    if (live.chapterUntil && t >= live.chapterUntil) {
      live.chapterTitle = null;
      live.chapterUntil = 0;
    }
    if (live.shapeRushUntil && t < live.shapeRushUntil) {
      const g = game();
      if (g && typeof g.liveShapeRushTick === "function") g.liveShapeRushTick(dt);
    }
    renderHud(false);
  }

  function activate(cfg) {
    Object.assign(live.config, cfg || {});
    live.active = true;
    live.queue = [];
    live.byUser.clear();
    live.pendingGifts.clear();
    live.cooldownUntil.clear();
    live.lastClaim = null;
    live.lastGift = null;
    live.forcedHunted = null;
    live.spotlightTank = null;
    live.pinTank = null;
    live.chapterTitle = null;
    live.giftsPaused = false;
    const panel = document.getElementById("live-hud");
    if (panel) panel.classList.remove("hidden");
    renderHud();
  }

  function deactivate() {
    live.active = false;
    const panel = document.getElementById("live-hud");
    if (panel) panel.classList.add("hidden");
  }

  function kickOwner(userId) {
    const id = String(userId || "");
    const tank = findByOwner(id);
    live.queue = live.queue.filter((q) => q.userId !== id);
    unbindOwner(id);
    if (tank) {
      tank.liveOwnerId = null;
      tank.liveDisplay = null;
      const g = game();
      if (g && typeof g.resetLiveBotName === "function") g.resetLiveBotName(tank);
    }
    renderHud();
  }

  function clearQueue() {
    live.queue = [];
    renderHud();
  }

  function setGiftsPaused(v) {
    live.giftsPaused = !!v;
    renderHud();
  }

  function snapshot() {
    return {
      active: live.active,
      giftsPaused: live.giftsPaused,
      queue: live.queue.length,
      claimed: claimedBots().length,
      capacity: liveBots().length,
      lastClaim: live.lastClaim,
      lastGift: live.lastGift,
      lastBlocked: live.lastBlocked,
      chapterTitle: live.chapterTitle,
      forcedHunted: live.forcedHunted && live.forcedHunted.name,
      spotlight: live.spotlightTank && live.spotlightTank.name,
    };
  }

  let hudPaintAt = 0;
  function renderHud(force) {
    const root = document.getElementById("live-hud");
    if (!root || !live.active) return;
    const t = Date.now();
    if (!force && t - hudPaintAt < 200) return;
    hudPaintAt = t;
    const snap = snapshot();
    const queueEl = root.querySelector("[data-live=queue]");
    const claimEl = root.querySelector("[data-live=claim]");
    const giftEl = root.querySelector("[data-live=gift]");
    const statusEl = root.querySelector("[data-live=status]");
    const chapterEl = root.querySelector("[data-live=chapter]");
    if (queueEl) queueEl.textContent = `Queue ${snap.queue} · Field ${snap.claimed}/${snap.capacity}`;
    if (claimEl) {
      claimEl.textContent = snap.lastClaim
        ? `Claim · ${snap.lastClaim.name}`
        : "Claim · —";
    }
    if (giftEl) {
      giftEl.textContent = snap.lastGift
        ? `Gift · ${snap.lastGift.label} · ${snap.lastGift.name}`
        : "Gift · —";
    }
    if (statusEl) {
      statusEl.textContent = snap.giftsPaused ? "Gifts paused" : "Live · chat joins free";
      statusEl.classList.toggle("paused", snap.giftsPaused);
    }
    if (chapterEl) {
      if (snap.chapterTitle) {
        chapterEl.textContent = snap.chapterTitle;
        chapterEl.classList.remove("hidden");
      } else {
        chapterEl.classList.add("hidden");
      }
    }
    const blockEl = root.querySelector("[data-live=blocked]");
    if (blockEl) {
      if (snap.lastBlocked && Date.now() - snap.lastBlocked.at < 8000) {
        blockEl.textContent = `Host · name blocked (${snap.lastBlocked.reason})`;
        blockEl.classList.remove("hidden");
      } else {
        blockEl.classList.add("hidden");
      }
    }
  }

  function bindHudControls() {
    const root = document.getElementById("live-hud");
    if (!root || root.dataset.bound) return;
    root.dataset.bound = "1";
    root.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-live-action]");
      if (!btn) return;
      const act = btn.getAttribute("data-live-action");
      if (act === "pause-gifts") setGiftsPaused(!live.giftsPaused);
      if (act === "clear-queue") clearQueue();
      if (act === "reset-round") {
        const g = game();
        if (g && typeof g.restartLiveRound === "function") g.restartLiveRound();
      }
    });
  }

  window.addEventListener("DOMContentLoaded", bindHudControls);
  if (document.readyState !== "loading") bindHudControls();

  window.TankfieldLive = {
    activate,
    deactivate,
    ingest,
    handleChat,
    handleGift,
    handleLeave,
    onBotDying,
    onBotRespawned,
    tick,
    kickOwner,
    clearQueue,
    setGiftsPaused,
    snapshot,
    filterName,
    resolveGiftId,
    giftDefs: GIFT_IDS,
    get forcedHunted() { return live.forcedHunted; },
    get forcedHuntedUntil() { return live.forcedHuntedUntil; },
    get spotlightTank() { return live.spotlightTank; },
    get spotlightUntil() { return live.spotlightUntil; },
    get pinTank() { return live.pinTank; },
    get pinUntil() { return live.pinUntil; },
    get active() { return live.active; },
    get config() { return live.config; },
  };
})();
