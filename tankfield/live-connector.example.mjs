/**
 * Example TikTok → Tankfield Live bridge.
 *
 * Requires a separate TikTok Live chat library (e.g. tiktok-live-connector)
 * and a local WebSocket server. Open Tankfield with:
 *   tankfield/?live=1&ws=1
 *
 * Then run: node live-connector.example.mjs <tiktokUniqueId>
 *
 * This file is a stub — install deps yourself; it does not ship credentials.
 */
import { WebSocketServer } from "ws";
// import { WebcastPushConnection } from "tiktok-live-connector";

const PORT = 8787;
const uniqueId = process.argv[2];
if (!uniqueId) {
  console.error("Usage: node live-connector.example.mjs <tiktokUniqueId>");
  process.exit(1);
}

const wss = new WebSocketServer({ port: PORT });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
});

function broadcast(event) {
  const raw = JSON.stringify(event);
  for (const ws of clients) {
    if (ws.readyState === 1) ws.send(raw);
  }
}

console.log(`Tankfield Live bridge on ws://127.0.0.1:${PORT}`);
console.log(`Wire TikTok chat for @${uniqueId}, then open tankfield/?live=1&ws=1`);

// Pseudo-wire (replace with real connector):
// const tiktok = new WebcastPushConnection(uniqueId);
// tiktok.on("chat", (data) => {
//   broadcast({
//     platform: "tiktok",
//     type: "chat",
//     userId: String(data.userId || data.uniqueId),
//     displayName: data.nickname || data.uniqueId,
//     text: data.comment,
//   });
// });
// tiktok.on("gift", (data) => {
//   if (data.giftType === 1 && !data.repeatEnd) return;
//   broadcast({
//     platform: "tiktok",
//     type: "gift",
//     userId: String(data.userId || data.uniqueId),
//     displayName: data.nickname || data.uniqueId,
//     giftId: data.giftName || data.extendedGiftId,
//     coins: data.diamondCount,
//   });
// });
// await tiktok.connect();

// Local smoke test without TikTok:
setInterval(() => {
  const name = `Viewer${Math.floor(Math.random() * 90 + 10)}`;
  broadcast({
    platform: "demo",
    type: Math.random() < 0.85 ? "chat" : "gift",
    userId: name.toLowerCase(),
    displayName: name,
    giftId: "rose",
  });
}, 4000);
