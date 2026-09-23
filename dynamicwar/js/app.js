(function (global) {
  "use strict";
  const DW = global.DynamicWar;
  const config = DW.config;
  const canvas = document.getElementById("game");
  const status = document.getElementById("status");
  const startButton = document.getElementById("start");
  const pauseButton = document.getElementById("pause");
  const resetButton = document.getElementById("reset");
  const speedSelect = document.getElementById("speed");
  const seedInput = document.getElementById("seed");
  const factionSelect = document.getElementById("faction");
  const placeButton = document.getElementById("place");
  const placeHint = document.getElementById("place-hint");
  const scoreboard = document.getElementById("scoreboard");
  const clock = document.getElementById("clock");
  const winner = document.getElementById("winner");
  const winnerText = document.getElementById("winner-text");
  let map, renderer, session;
  let accumulator = 0, lastTime = performance.now(), winnerShown = false;
  let dragging = false, dragged = false, lastPointer = null;

  function selectedSeed() {
    return Math.trunc(Number(seedInput.value)) || 1944;
  }

  function setQuerySeed(seed) {
    const url = new URL(global.location.href);
    url.searchParams.set("seed", seed);
    history.replaceState(null, "", url);
  }

  function makeSession(autoStart) {
    const seed = selectedSeed();
    setQuerySeed(seed);
    session = new DW.Session(config, map, seed);
    session.running = Boolean(autoStart);
    accumulator = 0;
    winnerShown = false;
    winner.classList.add("hidden");
    session.playerFaction = Number(factionSelect.value) || 0;
    session.placing = false;
    placeButton.textContent = "Place troops";
    canvas.classList.remove("placing");
    startButton.disabled = session.running;
    pauseButton.disabled = !session.running;
    pauseButton.textContent = "Pause";
    updateHud();
  }

  function updateHud() {
    if (!session) return;
    const stats = session.factionStats();
    scoreboard.innerHTML = stats.map(s => `
      <div class="faction-row">
        <i class="faction-swatch" style="background:${s.color};color:${s.color}"></i>
        <span class="faction-name">${s.you ? s.name + " (you)" : s.name}</span>
        <span class="faction-stat">${(s.control * 100).toFixed(0)}% · ${s.units}</span>
        <span class="control-bar"><i style="width:${s.control * 100}%;background:${s.color}"></i></span>
        <span class="faction-stance">${s.stance}</span>
      </div>`).join("");
    const hours = Math.floor(session.time);
    clock.textContent = `D+${Math.floor(hours / 24)} ${String(hours % 24).padStart(2, "0")}:${String(Math.floor(session.time * 60) % 60).padStart(2, "0")}`;
    if (session.winner >= 0 && !winnerShown) {
      winnerShown = true;
      session.running = false;
      const faction = config.factions[session.winner];
      winnerText.textContent = `${faction.name} controls the battlefield`;
      winnerText.style.color = faction.color;
      winner.classList.remove("hidden");
    }
  }

  function frame(now) {
    const elapsed = Math.min(.1, (now - lastTime) / 1000);
    lastTime = now;
    if (session && session.running) {
      accumulator += elapsed * Number(speedSelect.value);
      let steps = 0;
      while (accumulator >= config.fixedStep && steps++ < 12) {
        session.step(config.fixedStep);
        accumulator -= config.fixedStep;
      }
    }
    if (renderer && session) renderer.render(session);
    updateHud();
    requestAnimationFrame(frame);
  }

  function nearestUnitAt(clientX, clientY) {
    const world = renderer.screenToWorld(clientX, clientY);
    let best = null, bestD = 25 / (renderer.baseScale() * renderer.camera.zoom);
    for (const unit of session.units) {
      if (unit.dead) continue;
      const d = Math.hypot(unit.x - world.x, unit.y - world.y);
      if (d < bestD) { best = unit; bestD = d; }
    }
    return best;
  }

  startButton.addEventListener("click", () => {
    session.running = true;
    startButton.disabled = true;
    pauseButton.disabled = false;
  });
  pauseButton.addEventListener("click", () => {
    session.running = !session.running;
    pauseButton.textContent = session.running ? "Pause" : "Resume";
  });
  resetButton.addEventListener("click", () => makeSession(false));
  document.getElementById("winner-reset").addEventListener("click", () => makeSession(true));
  factionSelect.addEventListener("change", () => {
    if (session) session.playerFaction = Number(factionSelect.value) || 0;
  });
  placeButton.addEventListener("click", () => {
    if (!session) return;
    session.placing = !session.placing;
    placeButton.textContent = session.placing ? "Placing…" : "Place troops";
    canvas.classList.toggle("placing", session.placing);
    placeHint.textContent = session.placing
      ? "Click land to spawn your troops. Click an existing unit to select it, then click land to move."
      : "Click land to drop your units. Selected units move to the next click. Bots hold, rival, ally, or go to war.";
  });

  canvas.addEventListener("pointerdown", event => {
    dragging = true; dragged = false;
    lastPointer = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", event => {
    if (!dragging) return;
    const dx = event.clientX - lastPointer.x, dy = event.clientY - lastPointer.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) dragged = true;
    const scale = renderer.baseScale() * renderer.camera.zoom;
    renderer.camera.x -= dx / scale;
    renderer.camera.y -= dy / scale;
    renderer.followId = null;
    lastPointer = { x: event.clientX, y: event.clientY };
  });
  canvas.addEventListener("pointerup", event => {
    if (!dragged && session) {
      const world = renderer.screenToWorld(event.clientX, event.clientY);
      const unit = nearestUnitAt(event.clientX, event.clientY);
      if (session.placing) {
        if (unit && unit.player) session.playerSelected = unit.id;
        else if (session.playerSelected && session.units.some(u => u.id === session.playerSelected && u.player && !u.dead)) {
          session.orderSelected(world.x, world.y);
        } else {
          session.placePlayer(world.x, world.y);
        }
      } else {
        renderer.followId = unit ? unit.id : null;
        if (unit && unit.player) session.playerSelected = unit.id;
      }
    }
    dragging = false;
    canvas.classList.remove("dragging");
  });
  canvas.addEventListener("wheel", event => {
    event.preventDefault();
    renderer.camera.zoom = Math.max(.72, Math.min(4.5, renderer.camera.zoom * Math.exp(-event.deltaY * .001)));
  }, { passive: false });
  global.addEventListener("resize", () => renderer && renderer.resize());

  async function init() {
    const querySeed = new URLSearchParams(global.location.search).get("seed");
    if (querySeed != null && Number.isFinite(Number(querySeed))) seedInput.value = Math.trunc(Number(querySeed));
    try {
      map = await DW.loadMap(config.mapUrl, config);
      renderer = new DW.Renderer(canvas, map, config);
      makeSession(false);
      status.classList.add("hidden");
      requestAnimationFrame(frame);
    } catch (error) {
      status.textContent = `Could not load the offline map. Run this folder from a local web server. ${error.message}`;
      status.style.color = "#ffb2a8";
      console.error(error);
    }
  }

  init();
})(window);
