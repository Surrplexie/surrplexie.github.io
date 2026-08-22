(() => {
  "use strict";

  const workshop = document.getElementById("workshop");
  const listEl = document.getElementById("tank-list");
  const searchEl = document.getElementById("tank-search");
  const preview = document.getElementById("preview");
  const jsonEl = document.getElementById("tank-json");
  const gunList = document.getElementById("gun-list");
  const countEl = document.getElementById("tank-count");
  const delBtn = document.getElementById("del-tank");

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

  const GUN_KEYS = ["length", "width", "aspect", "x", "y", "angle", "delay", "spread"];
  const MOD_MAP = { dmg: "damage", reload: "reload", speed: "speed", size: "size", fov: "fov", health: "health" };

  let current = TankCatalog.blank();
  let gunIndex = 0;
  let selectedId = "custom";
  let selectedCustom = false;
  let catalogFilter = "all";

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
    const entries = allEntries().filter((e) => {
      if (catalogFilter === "custom" && !e.custom) return false;
      if (catalogFilter === "15" && (e.custom || (e.def.needLevel || 1) > 15)) return false;
      if (catalogFilter === "30" && (e.custom || (e.def.needLevel || 1) !== 30)) return false;
      if (catalogFilter === "45" && (e.custom || (e.def.needLevel || 1) < 45)) return false;
      return e.def.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q);
    });
    countEl.textContent = `${TankCatalog.count()} stock + ${customs().length} custom`;
    listEl.innerHTML = entries.map((e) => {
      const tier = e.def.needLevel || 1;
      const active = e.id === selectedId ? "active" : "";
      return `<button class="tank-item ${active}" type="button" data-id="${e.id}" data-custom="${e.custom}">
        <span>${e.def.name}</span>
        <small>${e.custom ? "custom" : "L" + tier}</small>
      </button>`;
    }).join("");
    listEl.querySelectorAll(".tank-item").forEach((btn) => {
      btn.addEventListener("click", () => loadEntry(btn.dataset.id, btn.dataset.custom === "true"));
    });
    if (delBtn) delBtn.classList.toggle("hidden", !selectedCustom);
  }

  function loadEntry(id, isCustom) {
    selectedId = id;
    selectedCustom = !!isCustom;
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

  function pair(id, value) {
    const range = document.getElementById(id);
    const num = document.getElementById(id + "-n");
    if (range) range.value = value;
    if (num) num.value = value;
  }

  function syncFields() {
    fields.name.value = current.name || "";
    fields.body.value = String(current.body || 0);
    fields.maxDrones.value = current.maxDrones || 0;
    fields.smasher.checked = !!current.smasher;
    const m = current.mods;
    pair("mod-damage", Number(m.damage).toFixed(1));
    pair("mod-reload", Number(m.reload).toFixed(1));
    pair("mod-speed", Number(m.speed).toFixed(1));
    pair("mod-size", Number(m.size).toFixed(1));
    pair("mod-fov", Number(m.fov).toFixed(1));
    pair("mod-health", Number(m.health).toFixed(1));
    renderGuns();
    syncGunFields();
    const nameEl = document.getElementById("preview-name");
    const descEl = document.getElementById("preview-desc");
    if (nameEl) nameEl.textContent = current.name || "Tank";
    if (descEl) descEl.textContent = current.desc || (selectedCustom ? "Custom tank" : "");
    if (jsonEl && document.activeElement !== jsonEl) jsonEl.value = JSON.stringify(current, null, 2);
    drawNow();
    liveApply();
  }

  function drawNow() {
    window.TankfieldGame.drawPreview(
      preview,
      current,
      window.TankfieldGame.state.selectedColor || window.TankfieldGame.COLORS.player,
      gunIndex
    );
  }

  function renderGuns() {
    const guns = current.guns || [];
    const count = document.getElementById("gun-count");
    if (count) count.textContent = guns.length ? `(${gunIndex + 1}/${guns.length})` : "(none)";
    gunList.innerHTML = guns.map((g, i) =>
      `<button class="gun-chip ${i === gunIndex ? "active" : ""}" type="button" data-i="${i}">${i + 1}. ${g.type} ${Math.round(g.pos[5] || 0)}°</button>`
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
    ["type", ...GUN_KEYS].forEach((k) => {
      if (fields[k]) fields[k].disabled = disabled;
      if (k !== "type") {
        const n = document.getElementById("ed-" + k + "-n");
        if (n) n.disabled = disabled;
      }
    });
    if (!g) return;
    fields.type.value = g.type || "bullet";
    const p = g.pos;
    pair("ed-length", Number(p[0]).toFixed(1));
    pair("ed-width", Number(p[1]).toFixed(1));
    pair("ed-aspect", Number(p[2]).toFixed(2));
    pair("ed-x", Number(p[3]).toFixed(1));
    pair("ed-y", Number(p[4]).toFixed(1));
    pair("ed-angle", Math.round(p[5]));
    pair("ed-delay", Number(p[6]).toFixed(2));
    pair("ed-spread", Number(g.spread || 0).toFixed(2));
  }

  function readGun() {
    const g = current.guns[gunIndex];
    if (!g) return;
    const prevType = g.type;
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
    if (!g.shoot || prevType !== g.type) {
      const rebuilt = TankCatalog.gun(g.pos[0], g.pos[1], g.pos[2], g.pos[3], g.pos[4], g.pos[5], g.pos[6], {
        type: g.type,
        spread: g.spread,
        recoil: g.recoil,
        size: g.size,
        stats: g.stats,
      });
      g.shoot = rebuilt.shoot;
      g.hasStack = false;
      g.calculator = rebuilt.calculator;
    }
    current.auto = current.guns.some((gun) => gun.type === "auto");
  }

  function liveApply() {
    const game = window.TankfieldGame;
    if (game.state.player && game.state.player.alive && !workshop.classList.contains("hidden")) {
      game.applyToPlayer(current);
    }
  }

  function bindPair(rangeId, onChange) {
    const range = document.getElementById(rangeId);
    const num = document.getElementById(rangeId + "-n");
    if (!range) return;
    const apply = (from) => {
      const v = Number(from.value);
      if (from === range && num) num.value = range.value;
      if (from === num && num) range.value = num.value;
      onChange(v);
    };
    range.addEventListener("input", () => apply(range));
    if (num) {
      num.addEventListener("input", () => apply(num));
      num.addEventListener("change", () => apply(num));
    }
  }

  function bind() {
    fields.name.addEventListener("input", () => { current.name = fields.name.value; syncFields(); });
    fields.body.addEventListener("change", () => { current.body = Number(fields.body.value); syncFields(); });
    fields.maxDrones.addEventListener("input", () => { current.maxDrones = Number(fields.maxDrones.value); syncFields(); });
    fields.smasher.addEventListener("change", () => { current.smasher = fields.smasher.checked; syncFields(); });
    fields.type.addEventListener("input", () => { readGun(); syncFields(); });
    GUN_KEYS.forEach((k) => {
      bindPair("ed-" + k, () => { readGun(); syncFields(); });
    });
    Object.keys(MOD_MAP).forEach((k) => {
      const id = k === "dmg" ? "mod-damage" : "mod-" + MOD_MAP[k];
      bindPair(id, (v) => {
        current.mods[MOD_MAP[k]] = v;
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
        selectedCustom = true;
        syncFields();
      } catch {
        jsonEl.classList.add("bad");
        setTimeout(() => jsonEl.classList.remove("bad"), 800);
      }
    });
    document.getElementById("tank-filters").addEventListener("click", (e) => {
      const btn = e.target.closest(".ws-filter");
      if (!btn) return;
      catalogFilter = btn.dataset.filter;
      document.querySelectorAll(".ws-filter").forEach((b) => b.classList.toggle("active", b === btn));
      renderList();
    });
    preview.addEventListener("click", () => {
      if (!current.guns.length) return;
      gunIndex = (gunIndex + 1) % current.guns.length;
      syncFields();
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
    selectedCustom = true;
    gunIndex = 0;
    syncFields();
    renderList();
  });
  document.getElementById("save-tank").addEventListener("click", () => {
    current.id = current.id && String(current.id).startsWith("custom") ? current.id : "custom_" + Date.now().toString(36);
    selectedId = current.id;
    selectedCustom = true;
    const list = customs().filter((d) => d.id !== current.id);
    list.unshift(TankCatalog.cloneDef(current));
    saveCustoms(list);
    renderList();
  });
  document.getElementById("dup-tank").addEventListener("click", () => {
    const copy = TankCatalog.cloneDef(current);
    copy.id = "custom_" + Date.now().toString(36);
    copy.name = (copy.name || "Tank") + " copy";
    current = copy;
    selectedId = copy.id;
    selectedCustom = true;
    const list = customs();
    list.unshift(copy);
    saveCustoms(list);
    syncFields();
    renderList();
  });
  if (delBtn) {
    delBtn.addEventListener("click", () => {
      if (!selectedCustom) return;
      saveCustoms(customs().filter((d) => d.id !== selectedId));
      loadEntry("basic", false);
    });
  }
  document.getElementById("play-tank").addEventListener("click", () => {
    const name = document.getElementById("name-input").value.trim() || "Unnamed Tank";
    window.TankfieldGame.startGame(name, { sandbox: true, customDef: current, botCount: window.TankfieldGame.botCount() });
  });
  document.getElementById("play-maxed").addEventListener("click", () => {
    const name = document.getElementById("name-input").value.trim() || "Unnamed Tank";
    window.TankfieldGame.startGame(name, { sandbox: true, customDef: current, maxStats: true, botCount: window.TankfieldGame.botCount() });
  });
  document.getElementById("close-workshop").addEventListener("click", close);
  document.getElementById("copy-json").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(JSON.stringify(current, null, 2)); }
    catch {
      jsonEl.select();
      document.execCommand("copy");
    }
  });

  window.addEventListener("keydown", (e) => {
    if (workshop.classList.contains("hidden")) return;
    const tag = (e.target && e.target.tagName) || "";
    if (e.key === "Escape") {
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        e.target.blur();
        return;
      }
      close();
      return;
    }
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (e.key === "[" || e.key === "]") {
      if (!current.guns.length) return;
      gunIndex = e.key === "]"
        ? (gunIndex + 1) % current.guns.length
        : (gunIndex - 1 + current.guns.length) % current.guns.length;
      syncFields();
    }
  });

  function open() {
    workshop.classList.remove("hidden");
    window.TankfieldGame.state.paused = true;
    if (window.TankfieldGame.state.player && window.TankfieldGame.state.player.customDef) {
      current = TankCatalog.cloneDef(window.TankfieldGame.state.player.customDef);
      selectedId = current.id || "custom";
      selectedCustom = String(selectedId).startsWith("custom");
    } else if (window.TankfieldGame.state.player) {
      loadEntry(window.TankfieldGame.state.player.classId, false);
    }
    renderList();
    syncFields();
  }

  function close() {
    workshop.classList.add("hidden");
    const g = window.TankfieldGame;
    if (g && g.state) g.state.paused = !!g.state.userPaused;
  }

  bind();
  renderList();
  loadEntry("basic", false);

  window.TankWorkshop = { open, close, current: () => current };
})();
