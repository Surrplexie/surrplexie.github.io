const fs = require("fs");
const path = require("path");
const vm = require("vm");

const context = {
  console,
  performance,
  Math,
  Date,
  Object,
  Array,
  Number,
  String,
  JSON,
  Error,
  isFinite
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, "model.js"), "utf8"), context, { filename: "model.js" });
const C = context.Capsim;

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function finiteWorld(world) {
  for (let i = 0; i < world.bots.length; i++) {
    const n = world.bots[i].nw;
    if (!isFinite(n)) return false;
  }
  for (let i = 0; i < world.assets.length; i++) {
    if (!isFinite(world.assets[i].priceCents) || world.assets[i].priceCents <= 0) return false;
  }
  return true;
}

function runDays(world, n) {
  for (let i = 0; i < n; i++) C.stepDay(world);
}

const a = C.createWorld({ seed: 42, bots: 40, scenario: "boom", difficulty: "volatile" });
const b = C.createWorld({ seed: 42, bots: 40, scenario: "boom", difficulty: "volatile" });
runDays(a, 40);
runDays(b, 40);
assert(a.bots[0].nw === b.bots[0].nw, "same seed diverged on bot 0");
assert(a.records.richest.nw === b.records.richest.nw, "same seed diverged on richest");
assert(finiteWorld(a), "boom run produced a bad number");

const chaos = C.createWorld({ seed: 7, bots: 60, scenario: "crisis", difficulty: "chaos" });
runDays(chaos, 80);
assert(finiteWorld(chaos), "chaos run produced a bad number");

const titan = C.createWorld({
  seed: 99,
  bots: 25,
  scenario: "boom",
  difficulty: "stable",
  wealthList: [1e11]
});
const titanBot = titan.bots[0];
const startT = titanBot.nw;
runDays(titan, 40);
assert(C.tierOf(titanBot.nw) >= 2 && titanBot.nw > startT * 0.55, "quiet titan was mean-reverted, start " + startT + " now " + titanBot.nw);

assert(C.maxLeverage({ regulation: 100 }) < C.maxLeverage({ regulation: 0 }), "regulation did not cap leverage");

const rich = C.createWorld({ seed: 3, bots: 15, scenario: "boom", difficulty: "stable" });
const beforeCash = rich.bots[2].cash;
const granted = C.applyGod(rich, { type: "money", mode: "target", target: rich.bots[2].id, amount: 250000000 });
assert(granted.ok, granted.reason || "grant failed");
assert(rich.bots[2].cash === beforeCash + 250000000, "targeted money did not land");

const moodA = C.createWorld({ seed: 11, bots: 20, scenario: "boom", difficulty: "stable" });
const moodB = C.createWorld({ seed: 11, bots: 20, scenario: "boom", difficulty: "stable" });
C.applyGod(moodA, { type: "news", text: "Markets seize.", score: 0, scope: "economy", duration: "persistent" });
C.applyGod(moodB, { type: "news", text: "Markets soar.", score: 100, scope: "economy", duration: "persistent" });
assert(moodA.public.mood < moodB.public.mood, "bad news did not leave mood worse than good news");

const victimWorld = C.createWorld({ seed: 5, bots: 12, scenario: "inequality", difficulty: "ruthless" });
const victim = victimWorld.bots[0];
const punished = C.applyGod(victimWorld, { type: "punish", target: victim.id, kind: "bankrupt" });
assert(punished.ok, "punish failed");
assert(victim.broke && victim.cash === 1, "bankrupt punish did not leave one cent");

const snapWorld = C.createWorld({ seed: 8, bots: 18, scenario: "tech", difficulty: "volatile" });
runDays(snapWorld, 12);
const snap = snapWorld.snaps[0];
const mid = snapWorld.bots[3].nw;
runDays(snapWorld, 10);
C.restoreSnap(snapWorld, snap);
assert(snapWorld.bots[3].nw === snap.state.bots[3].cash || snapWorld.absDay === snap.day, "rewind did not return to the snapshot day");
assert(snapWorld.absDay === snap.day, "rewind day mismatch");

const big = C.createWorld({ seed: 1, bots: 1000, scenario: "boom", difficulty: "stable" });
const t0 = Date.now();
runDays(big, 3);
assert(finiteWorld(big), "1000-bot run produced a bad number");
const elapsed = Date.now() - t0;
console.log("selfcheck ok", "1000x3 days ms", elapsed, "titan", C.formatShort(titanBot.nw), "richest40", C.formatShort(a.records.richest.nw));
