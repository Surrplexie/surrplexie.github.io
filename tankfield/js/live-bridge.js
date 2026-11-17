/* Normalize platform chat/gift events into TankfieldLive.ingest payloads. */
(function () {
  "use strict";

  function normalize(raw, platformHint) {
    if (!raw || typeof raw !== "object") return null;
    if (raw.type && (raw.userId || raw.uniqueId || raw.displayName || raw.name)) {
      return {
        platform: raw.platform || platformHint || "tiktok",
        userId: String(raw.userId || raw.uniqueId || raw.id || ""),
        displayName: raw.displayName || raw.nickname || raw.name || raw.uniqueId || "Viewer",
        type: String(raw.type).toLowerCase(),
        giftId: raw.giftId || raw.gift || raw.giftName || raw.name,
        coins: raw.coins != null ? Number(raw.coins) : (raw.diamondCount != null ? Number(raw.diamondCount) : undefined),
        text: raw.text || raw.comment || raw.message || "",
        title: raw.title,
      };
    }

    // TikTok-live-connector style
    if (raw.giftId != null || raw.giftName || raw.repeatEnd != null) {
      return {
        platform: platformHint || "tiktok",
        userId: String((raw.userId || (raw.user && raw.user.userId) || raw.uniqueId || "")),
        displayName: (raw.nickname || (raw.user && raw.user.nickname) || raw.uniqueId || "Viewer"),
        type: "gift",
        giftId: raw.giftName || raw.giftId || raw.extendedGiftId,
        coins: raw.diamondCount != null ? Number(raw.diamondCount) : undefined,
      };
    }
    if (raw.comment != null || raw.msgId != null || (raw.user && raw.comment === undefined && raw.giftId == null && raw.text)) {
      return {
        platform: platformHint || "tiktok",
        userId: String(raw.userId || (raw.user && raw.user.userId) || raw.uniqueId || ""),
        displayName: raw.nickname || (raw.user && raw.user.nickname) || raw.uniqueId || "Viewer",
        type: "chat",
        text: raw.comment || raw.text || "",
      };
    }

    // Twitch IRC-ish
    if (raw.command === "PRIVMSG" || raw.platform === "twitch") {
      return {
        platform: "twitch",
        userId: String(raw.userId || raw.username || raw.tags && raw.tags["user-id"] || ""),
        displayName: raw.displayName || raw.username || "Viewer",
        type: raw.bits ? "gift" : "chat",
        giftId: raw.bits ? "rose" : undefined,
        coins: raw.bits != null ? Number(raw.bits) : undefined,
        text: raw.message || raw.text || "",
      };
    }

    // YouTube live chat
    if (raw.snippet || raw.authorDetails || raw.platform === "youtube") {
      const sn = raw.snippet || {};
      const author = raw.authorDetails || {};
      const isSuper = !!(sn.superChatDetails || sn.superStickerDetails || sn.type === "superChatEvent");
      return {
        platform: "youtube",
        userId: String(author.channelId || raw.userId || ""),
        displayName: author.displayName || raw.displayName || "Viewer",
        type: isSuper ? "gift" : "chat",
        giftId: isSuper ? "love_balloon" : undefined,
        coins: sn.superChatDetails && sn.superChatDetails.amountMicros
          ? Number(sn.superChatDetails.amountMicros) / 10000
          : undefined,
        text: sn.displayMessage || sn.textMessageDetails && sn.textMessageDetails.messageText || "",
      };
    }

    return null;
  }

  function push(raw, platformHint) {
    const live = window.TankfieldLive;
    if (!live || typeof live.ingest !== "function") return { ok: false, reason: "live missing" };
    const evt = normalize(raw, platformHint);
    if (!evt) return { ok: false, reason: "unrecognized" };
    if (!evt.userId) evt.userId = String(evt.displayName || "viewer").toLowerCase();
    return live.ingest(evt);
  }

  function onMessage(ev) {
    const data = ev && ev.data;
    if (!data || typeof data !== "object") return;
    if (data.source && data.source !== "tankfield-live" && data.channel !== "tankfield-live") return;
    if (data.source !== "tankfield-live" && data.channel !== "tankfield-live" && !data.type && !data.event) return;
    const payload = data.event || data.payload || data;
    push(payload, data.platform);
  }

  window.addEventListener("message", onMessage);

  // Optional local WebSocket bridge: ws://127.0.0.1:8787
  let socket = null;
  let socketUrl = "ws://127.0.0.1:8787";
  let reconnectTimer = null;

  function scheduleReconnect() {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connectWs(socketUrl);
    }, 1500);
  }

  function connectWs(url) {
    const target = url || socketUrl || "ws://127.0.0.1:8787";
    socketUrl = target;
    try {
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
        && socket.url === target) {
        return true;
      }
      if (socket) {
        try { socket.onclose = null; socket.close(); } catch (e) {}
      }
      socket = new WebSocket(target);
      socket.addEventListener("open", () => {
        console.log("[TankfieldLiveBridge] connected", target);
      });
      socket.addEventListener("message", (ev) => {
        try {
          const data = JSON.parse(ev.data);
          push(data, data.platform);
        } catch (err) {}
      });
      socket.addEventListener("close", () => scheduleReconnect());
      socket.addEventListener("error", () => {});
      return true;
    } catch (err) {
      scheduleReconnect();
      return false;
    }
  }

  /** Demo injector for local testing without TikTok. */
  function demoBurst() {
    const names = ["Lumen", "Grit", "Zane", "Rill", "Vera", "Brine", "Iota", "Elk", "Yarrow", "Beryl"];
    const gifts = ["rose", "finger_heart", "donut", "love_balloon", "sunglasses", "money_gun", "galaxy"];
    names.forEach((name, i) => {
      setTimeout(() => {
        push({ type: "chat", userId: `demo_${name}`, displayName: name, platform: "demo" });
      }, i * 120);
    });
    setTimeout(() => {
      const g = gifts[Math.floor(Math.random() * gifts.length)];
      const name = names[Math.floor(Math.random() * names.length)];
      push({ type: "gift", userId: `demo_${name}`, displayName: name, giftId: g, platform: "demo" });
    }, names.length * 120 + 400);
  }

  window.TankfieldLiveBridge = {
    normalize,
    push,
    connectWs,
    demoBurst,
  };
})();
