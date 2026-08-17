(() => {
  "use strict";

  const workshop = document.getElementById("workshop");
  const listEl = document.getElementById("tank-list");
  const searchEl = document.getElementById("tank-search");
  const preview = document.getElementById("preview");
  const jsonEl = document.getElementById("tank-json");
  const gunList = document.getElementById("gun-list");
  const countEl = document.getElementById("tank-count");

  const fields = {
    name: document.getElementById("ed-name"),
    body: document.getElementById("ed-body"),
    type: document.getElementById("ed-type"),
    length: document.getElementById("ed-length"),
    width: document.getElementById("ed-width"),
    aspect: document.getElementById("ed-aspect"),
    x: document.getElementById("ed-x"),
    y: document.getElementById("ed-y"),
    angle: document.getElementById("ed-angle"),
    delay: document.getElementById("ed-delay"),
    spread: document.getElementById("ed-spread"),
    maxDrones: document.getElementById("ed-drones"),
    smasher: document.getElementById("ed-smasher"),
    dmg: document.getElementById("mod-damage"),
    reload: document.getElementById("mod-reload"),
    speed: document.getElementById("mod-speed"),
    size: document.getElementById("mod-size"),
    fov: document.getElementById("mod-fov"),
    health: document.getElementById("mod-health"),
  };

  let current = TankCatalog.blank();
  let gunIndex = 0;
  let selectedId = "custom";

  function customs() {
    try { return JSON.parse(localStorage.getItem("tankfield-customs") || "[]"); }
    catch { return []; }
  }

  function saveCustoms(list) {
    localStorage.setItem("tankfield-customs", JSON.stringify(list));
  }

  function allEntries() {
    const stock = TankCatalog.list().map((id) => ({ id, custom: false, def: TankCatalog.get(id) }));
    const mine = customs().map((def, i) => ({ id: def.id || `custom_${i}`, custom: true, def }));
    return mine.concat(stock);
  }

  function renderList() {
    const q = (searchEl.value || "").toLowerCase();
    const entries = allEntries().filter((e) =>
      e.def.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)
    );
    countEl.textContent = `${TankCatalog.count()} stock + ${customs().length} custom`;
    listEl.innerHTML = entries.map((e) => {
      const tier = e.def.needLevel || 1;
      const active = e.id === selectedId ? "active" : "";
      return `<button class="tank-item ${active}" data-id="${e.id}" data-custom="${e.custom}">
        <span>${e.def.name}</span>
        <small>${e.custom ? "custom" : "L" + tier}</small>
      </button>`;
    }).join("");
    listEl.querySelectorAll(".tank-item").forEach((btn) => {
      btn.addEventListener("click", () => loadEntry(btn.dataset.id, btn.dataset.custom === "true"));
    });
  }

  function loadEntry(id, isCustom) {
    selectedId = id;
    if (isCustom) {
      const found = customs().find((d) => d.id === id);
      current = TankCatalog.cloneDef(found || TankCatalog.blank());
    } else if (id === "custom") {
      current = TankCatalog.blank();
    } else {
      current = TankCatalog.cloneDef(TankCatalog.get(id));
    }
    if (!current.mods) current.mods = { damage: 1, reload: 1, speed: 1, size: 1, fov: 1, health: 1 };
    gunIndex = 0;
    syncFields();
    renderList();
  }

  function syncFields() {
    fields.name.value = current.name || "";
    fields.body.value = String(current.body || 0);
    fields.maxDrones.value = current.maxDrones || 0;
    fields.smasher.checked = !!current.smasher;
    const m = current.mods;
    fields.dmg.value = m.damage;
    fields.reload.value = m.reload;
    fields.speed.value = m.speed;
    fields.size.value = m.size;
    fields.fov.value = m.fov;
    fields.health.value = m.health;
    document.getElementById("mod-damage-v").textContent = Number(m.damage).toFixed(1);
    document.getElementById("mod-reload-v").textContent = Number(m.reload).toFixed(1);
    document.getElementById("mod-speed-v").textContent = Number(m.speed).toFixed(1);
    document.getElementById("mod-size-v").textContent = Number(m.size).toFixed(1);
    document.getElementById("mod-fov-v").textContent = Number(m.fov).toFixed(1);
    document.getElementById("mod-health-v").textContent = Number(m.health).toFixed(1);
    renderGuns();
    syncGunFields();
    jsonEl.value = JSON.stringify(current, null, 2);
    window.TankfieldGame.drawPreview(preview, current, window.TankfieldGame.COLORS.player, gunIndex);
    liveApply();
  }

  function renderGuns() {
    gunList.innerHTML = (current.guns || []).map((g, i) =>
      `<button class="gun-chip ${i === gunIndex ? "active" : ""}" data-i="${i}">${i + 1}. ${g.type}</button>`
    ).join("");
    gunList.querySelectorAll(".gun-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        gunIndex = Number(btn.dataset.i);
        syncFields();
      });
    });
  }

  function syncGunFields() {
    const g = current.guns[gunIndex];
    const disabled = !g;
    ["type", "length", "width", "aspect", "x", "y", "angle", "delay", "spread"].forEach((k) => {
      fields[k].disabled = disabled;
    });
    if (!g) return;
    fields.type.value = g.type || "bullet";
    const p = g.pos;
    fields.length.value = p[0];
    fields.width.value = p[1];
    fields.aspect.value = p[2];
    fields.x.value = p[3];
    fields.y.value = p[4];
    fields.angle.value = p[5];
    fields.delay.value = p[6];
    fields.spread.value = g.spread || 0;
    document.getElementById("ed-length-v").textContent = Number(p[0]).toFixed(1);
    document.getElementById("ed-width-v").textContent = Number(p[1]).toFixed(1);
    document.getElementById("ed-aspect-v").textContent = Number(p[2]).toFixed(2);
    document.getElementById("ed-x-v").textContent = Number(p[3]).toFixed(1);
    document.getElementById("ed-y-v").textContent = Number(p[4]).toFixed(1);
    document.getElementById("ed-angle-v").textContent = Math.round(p[5]) + "°";
    document.getElementById("ed-delay-v").textContent = Number(p[6]).toFixed(2);
    document.getElementById("ed-spread-v").textContent = Number(g.spread || 0).toFixed(2);
  }

  function readGun() {
    const g = current.guns[gunIndex];
    if (!g) return;
    g.type = fields.type.value;
    g.pos = [
      Number(fields.length.value),
      Number(fields.width.value),
      Number(fields.aspect.value),
      Number(fields.x.value),
      Number(fields.y.value),
      Number(fields.angle.value),
      Number(fields.delay.value),
    ];
    g.spread = Number(fields.spread.value);
    current.auto = current.guns.some((gun) => gun.type === "auto");
  }

  function liveApply() {
    const game = window.TankfieldGame;
    if (game.state.player && game.state.player.alive && !workshop.classList.contains("hidden")) {
      game.applyToPlayer(current);
    }
  }

  function bind() {
    fields.name.addEventListener("input", () => { current.name = fields.name.value; syncFields(); });
    fields.body.addEventListener("change", () => { current.body = Number(fields.body.value); syncFields(); });
    fields.maxDrones.addEventListener("input", () => { current.maxDrones = Number(fields.maxDrones.value); syncFields(); });
    fields.smasher.addEventListener("change", () => { current.smasher = fields.smasher.checked; syncFields(); });
    ["type", "length", "width", "aspect", "x", "y", "angle", "delay", "spread"].forEach((k) => {
      fields[k].addEventListener("input", () => { readGun(); syncFields(); });
    });
    ["dmg", "reload", "speed", "size", "fov", "health"].forEach((k) => {
      const map = { dmg: "damage", reload: "reload", speed: "speed", size: "size", fov: "fov", health: "health" };
      fields[k].addEventListener("input", () => {
        current.mods[map[k]] = Number(fields[k].value);
        syncFields();
      });
    });
    searchEl.addEventListener("input", renderList);
    jsonEl.addEventListener("change", () => {
      try {
        current = Object.assign(TankCatalog.blank(), JSON.parse(jsonEl.value));
        if (!current.mods) current.mods = { damage: 1, reload: 1, speed: 1, size: 1, fov: 1, health: 1 };
        gunIndex = 0;
        selectedId = current.id || "custom";
        syncFields();
      } catch {
        jsonEl.classList.add("bad");
        setTimeout(() => jsonEl.classList.remove("bad"), 800);
      }
    });
  }

  document.getElementById("add-gun").addEventListener("click", () => {
    current.guns.push(TankCatalog.gun(18, 8, 1, 0, 0, 0, 0));
    gunIndex = current.guns.length - 1;
    syncFields();
  });
  document.getElementById("del-gun").addEventListener("click", () => {
    if (!current.guns.length) return;
    current.guns.splice(gunIndex, 1);
    gunIndex = Math.max(0, gunIndex - 1);
    syncFields();
  });
  document.getElementById("dup-gun").addEventListener("click", () => {
    const g = current.guns[gunIndex];
    if (!g) return;
    current.guns.push({ pos: g.pos.slice(), type: g.type, spread: g.spread || 0, stats: { ...(g.stats || {}) } });
    gunIndex = current.guns.length - 1;
    syncFields();
  });
  document.getElementById("new-tank").addEventListener("click", () => {
    current = TankCatalog.blank();
    current.id = "custom_" + Date.now().toString(36);
    selectedId = current.id;
    gunIndex = 0;
    syncFields();
    renderList();
  });
  document.getElementById("save-tank").addEventListener("click", () => {
    current.id = current.id && current.id.startsWith("custom") ? current.id : "custom_" + Date.now().toString(36);
    selectedId = current.id;
    const list = customs().filter((d) => d.id !== current.id);
    list.unshift(TankCatalog.cloneDef(current));
    saveCustoms(list);
    renderList();
  });
  document.getElementById("play-tank").addEventListener("click", () => {
    const name = document.getElementById("name-input").value.trim() || "Unnamed Tank";
    window.TankfieldGame.startGame(name, { sandbox: true, customDef: current });
  });
  document.getElementById("play-maxed").addEventListener("click", () => {
    const name = document.getElementById("name-input").value.trim() || "Unnamed Tank";
    window.TankfieldGame.startGame(name, { sandbox: true, customDef: current, maxStats: true });
  });
  document.getElementById("close-workshop").addEventListener("click", close);
  document.getElementById("copy-json").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(JSON.stringify(current, null, 2)); }
    catch {
      jsonEl.select();
      document.execCommand("copy");
    }
  });

  function open() {
    workshop.classList.remove("hidden");
    window.TankfieldGame.state.paused = true;
    if (window.TankfieldGame.state.player && window.TankfieldGame.state.player.customDef) {
      current = TankCatalog.cloneDef(window.TankfieldGame.state.player.customDef);
      selectedId = current.id || "custom";
    } else if (window.TankfieldGame.state.player) {
      loadEntry(window.TankfieldGame.state.player.classId, false);
    }
    renderList();
    syncFields();
  }

  function close() {
    workshop.classList.add("hidden");
    window.TankfieldGame.state.paused = false;
  }

  bind();
  renderList();
  loadEntry("basic", false);

  window.TankWorkshop = { open, close, current: () => current };
})();
