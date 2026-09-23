(function (global) {
  "use strict";

  global.DynamicWar = global.DynamicWar || {};
  global.DynamicWar.config = Object.freeze({
    worldWidth: 1400,
    worldHeight: 980,
    bbox: [-5.8, 48.4, 10.0, 54.3],
    mapUrl: "data/benelux.geojson",
    fixedStep: 1 / 30,
    gridWidth: 128,
    gridHeight: 90,
    unitCount: 18,
    unitSpeed: 20,
    unitVision: 92,
    unitAttackRange: 24,
    unitSpacing: 22,
    decisionInterval: 1.35,
    holdRange: 78,
    captureThreshold: 0.53,
    captureMargin: 0.12,
    captureDelay: 1.4,
    influenceDecay: 0.18,
    winShare: 0.66,
    winHoldSeconds: 24,
    factions: [
      { id: 0, name: "Atlantic Union", color: "#2869e8", spawn: [0.58, 0.34] },
      { id: 1, name: "Rhine Pact", color: "#ec3f35", spawn: [0.82, 0.48] },
      { id: 2, name: "Southern League", color: "#e0b31d", spawn: [0.55, 0.77] }
    ]
  });
})(window);
