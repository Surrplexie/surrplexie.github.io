(function () {
  "use strict";

  const C = window.Capsim;
  const $ = (id) => document.getElementById(id);
  let world = null;
  let running = false;
  let speed = 4;
  let acc = 0;
  let last = performance.now();
  let sortKey = "nw";
  let selected = null;
  let skipping = false;
  let renderedDay = -1;
  let aiBusy = false;

  function money(cents) { return C.formatShort(cents); }

  function clockText() {
    const dayIndex = Math.floor(world.totalHours / 24);
    const hour = world.totalHours % 24;
    const year = Math.floor(dayIndex / 365) + 1;
    const day = (dayIndex % 365) + 1;
    return "Y" + year + " D" + day + " " + String(hour).padStart(2, "0") + ":00";
  }

  function setStatus(text) { $("status").textContent = text || ""; }

  function readOptions() {
    const list = $("wealth-list").value.split(/\s+/).map(Number).filter((n) => isFinite(n) && n >= 0);
    const flat = $("flat-wealth").value;
    return {
      seed: Number($("seed").value) || 1,
      bots: Number($("bot-count").value) || 80,
      scenario: $("scenario").value,
      difficulty: $("difficulty").value,
      wealthList: list.length ? list : null,
      flatWealth: flat === "" ? null : Number(flat),
      observer: $("observer").checked,
      fog: $("fog").checked,
      intelligence: $("intelligence").value,
      endWhen: $("end-when").value || null,
      rate: Number($("custom-rate").value),
      regulation: Number($("custom-reg").value),
      inflation: Number($("custom-inflation").value),
      tax: Number($("custom-tax").value),
      unemployment: Number($("custom-unemployment").value)
    };
  }

  function newGame() {
    running = false;
    $("pause").textContent = "Run";
    world = C.createWorld(readOptions());
    world.aiSpent = 0;
    world.aiToday = 0;
    world.aiDay = 0;
    selected = world.order.length ? world.bots[world.order[0].i].id : world.bots[0].id;
    renderedDay = -1;
    fillAssets();
    renderAll();
    setStatus("New world, seed " + world.seed + ".");
  }

  function selectedBot() {
    return world && world.botMap[selected];
  }

  function fillAssets() {
    const sel = $("chart-asset");
    const newsTarget = $("news-target");
    sel.innerHTML = "";
    newsTarget.innerHTML = "";
    world.assets.forEach((asset) => {
      const opt = document.createElement("option");
      opt.value = asset.id;
      opt.textContent = asset.ticker + " " + asset.name;
      sel.appendChild(opt);
    });
    refreshNewsTargets();
  }

  function refreshNewsTargets() {
    const scope = $("news-scope").value;
    const sel = $("news-target");
    sel.innerHTML = "";
    const add = (value, label) => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = label;
      sel.appendChild(opt);
    };
    if (scope === "economy" || scope === "bot") {
      add("", scope === "bot" ? "Selected bot" : "Everyone");
      sel.disabled = true;
      return;
    }
    sel.disabled = false;
    if (scope === "industry") C.SECTORS.forEach((s) => add(s, s));
    if (scope === "asset") world.assets.forEach((a) => add(a.id, a.ticker));
    if (scope === "company") world.companies.forEach((c) => add(c.id, c.name));
  }

  function renderMeters() {
    const p = world.public;
    const ineq = world.inequality;
    const cells = [
      ["Mood", Math.round(p.mood)],
      ["Employment", Math.round(p.employment)],
      ["Wages", Math.round(p.wages)],
      ["Affordability", Math.round(p.affordability)],
      ["Availability", Math.round(p.availability)],
      ["Approval", Math.round(p.approval)],
      ["Living", Math.round(p.living)],
      ["Top 1%", Math.round(ineq.top1 * 100) + "%"]
    ];
    $("meters").innerHTML = cells.map((c) => "<div class='meter'><b>" + c[1] + "</b><span>" + c[0] + "</span></div>").join("");
  }

  function renderBoard() {
    const q = $("find-bot").value.trim().toLowerCase();
    let rows = C.leaderboard(world, sortKey);
    if (q) rows = rows.filter((r) => r.bot.name.toLowerCase().indexOf(q) >= 0 || r.bot.id === q);
    const shown = q ? rows.slice(0, 200) : rows.slice(0, 120);
    const body = shown.map((row, i) => {
      const b = row.bot;
      return "<tr data-id='" + b.id + "'" + (b.id === selected ? " class='selected'" : "") + ">" +
        "<td>" + (i + 1) + "</td><td>" + b.name + (b.broke ? " · ruined" : "") + "</td><td>" +
        C.personalityOf(b) + "</td><td class='num'>" + money(row.nw) + "</td><td class='num'>" +
        money(row.cash) + "</td><td class='num'>" + money(row.debt) + "</td><td class='num'>" +
        money(row.assets) + "</td><td class='num'>" + money(row.profit) + "</td></tr>";
    }).join("");
    $("board").innerHTML = body || "<tr><td colspan='8'>No match.</td></tr>";
  }

  function renderDossier() {
    const bot = selectedBot();
    if (!bot) { $("dossier").textContent = "Select a row."; return; }
    const fog = world.fog;
    const companies = bot.companyIds.map((id) => world.companyMap[id]).filter(Boolean).map((c) => c.name + (c.failed ? " (failed)" : "")).join(", ") || "None";
    const allies = bot.allies.map((id) => world.botMap[id] && world.botMap[id].name).filter(Boolean).join(", ") || "None";
    const rivals = Object.keys(bot.rivalry).slice(0, 6).map((id) => world.botMap[id] && world.botMap[id].name).filter(Boolean).join(", ") || "None";
    let holdings = "Hidden until discovered.";
    if (!fog || bot.known.holdings) {
      holdings = Object.keys(bot.holdings).map((id) => {
        const asset = world.assetMap[id];
        return asset ? asset.ticker + " " + money(bot.holdings[id] * asset.priceCents) : id;
      }).join(", ") || "Cash only";
    }
    const objective = !fog || bot.known.insider ? bot.objective + (bot.goalTarget && world.botMap[bot.goalTarget] ? " (" + world.botMap[bot.goalTarget].name + ")" : "") : "Hidden";
    const reasons = bot.log.slice(-6).reverse().map((line) => "<li>D" + line.day + " " + line.text + "</li>").join("");
    $("dossier").innerHTML =
      "<div><b>" + bot.name + "</b> · " + C.personalityOf(bot) + " · " + C.tierName(bot.tier) + "</div>" +
      "<div>Net worth " + money(bot.nw) + " · cash " + money(bot.cash) + " · debt " + money(bot.debt) + "</div>" +
      "<div>Lifetime profit " + money(C.lifetimeProfit(world, bot)) + " · peak " + money(bot.peak) + "</div>" +
      "<div>Goal: " + objective + " · risk " + ["conservative", "speculative", "extreme leverage"][bot.risk] + "</div>" +
      "<div>Trust " + Math.round(bot.trust) + " · credibility " + Math.round(bot.credibility) + " · business " + Math.round(bot.business) + " · influence " + Math.round(bot.influence) + "</div>" +
      "<div>Companies: " + companies + "</div>" +
      "<div>Holdings: " + holdings + "</div>" +
      "<div>Allies: " + (fog ? "Hidden" : allies) + "</div>" +
      "<div>Rivals: " + rivals + "</div>" +
      "<div>Last: " + bot.lastReason + "</div>" +
      "<ul class='log'>" + reasons + "</ul>";
    $("god-target").textContent = "Selected: " + bot.name + ".";
  }

  function renderNews() {
    $("news").innerHTML = world.news.slice(0, 18).map((n) =>
      "<li><span class='score'>" + n.score + "</span> D" + n.day + " " + n.text + "</li>"
    ).join("");
    const q = $("archive-q").value.trim().toLowerCase();
    const items = world.archive.filter((ev) => !q || (ev.text || "").toLowerCase().indexOf(q) >= 0).slice(-40).reverse();
    $("archive").innerHTML = items.map((ev) => "<li>D" + ev.day + " " + ev.text + (ev.afterGod ? " · after " + ev.afterGod : "") + "</li>").join("");
    $("god-log").innerHTML = world.godLog.slice(0, 12).map((g) =>
      "<li>D" + g.day + " " + g.text + " Mood " + Math.round(g.before.mood) + "→" + Math.round(g.after.mood) + ", richest " + money(g.before.richest) + "→" + money(g.after.richest) + ".</li>"
    ).join("") || "<li>No interventions yet.</li>";
  }

  function renderRecords() {
    const r = world.records;
    const bits = [];
    if (r.richest) bits.push("Richest ever " + r.richest.name + " " + money(r.richest.nw));
    if (r.bestDay) bits.push("Best day " + r.bestDay.name + " " + money(r.bestDay.delta));
    if (r.worstDay) bits.push("Worst day " + r.worstDay.name + " " + money(r.worstDay.delta));
    if (r.biggestDefault) bits.push("Largest bankruptcy " + r.biggestDefault.name + " from " + money(r.biggestDefault.peak));
    if (world.downsampled) bits.push("Older chart points are compressed.");
    if (world.ended) bits.push(world.ended);
    $("records").textContent = bits.join(" · ");
  }

  function renderLaw() {
    const box = $("law-box");
    if (!world.pendingLaw || world.observer) { box.classList.add("hidden"); return; }
    box.classList.remove("hidden");
    box.innerHTML = "A political shift would set regulation to " + Math.round(world.pendingLaw.regulation) +
      ". <button type='button' id='law-yes'>Accept</button> <button type='button' id='law-no'>Reject</button>";
    $("law-yes").onclick = () => actGod({ type: "law", accept: true });
    $("law-no").onclick = () => actGod({ type: "law", accept: false });
  }

  function renderChart() {
    const canvas = $("chart");
    const mode = $("chart-mode").value;
    const log = $("log-scale").checked && (mode === "nw" || mode === "asset");
    const lines = [];
    if (mode === "nw") {
      const rows = C.leaderboard(world, "nw").slice(0, 5);
      const colors = ["#00bcd4", "#ff9800", "#7dcea0", "#ef7b73", "#c3a6ff"];
      rows.forEach((row, i) => lines.push({ name: row.bot.name, color: colors[i], values: world.series.nw[row.bot.id] }));
      if (selected && !rows.some((r) => r.bot.id === selected)) {
        lines.push({ name: world.botMap[selected].name, color: "#ffffff", values: world.series.nw[selected] });
      }
    } else if (mode === "asset") {
      const id = $("chart-asset").value;
      const asset = world.assetMap[id];
      if (asset) lines.push({ name: asset.ticker, color: "#ff9800", values: world.series.price[id] });
    } else if (mode === "rate") {
      lines.push({ name: "Rate", color: "#00bcd4", values: world.series.rate.map((r) => r * 100) });
    } else if (mode === "mood") {
      lines.push({ name: "Mood", color: "#7dcea0", values: world.series.mood });
    } else {
      lines.push({ name: "Top 1%", color: "#ef7b73", values: world.series.top1.map((n) => n * 100) });
    }
    drawLines(canvas, lines, log);
  }

  function drawLines(canvas, lines, log) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 640;
    const h = 240;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#121418";
    ctx.fillRect(0, 0, w, h);
    const ready = lines.filter((line) => line.values && line.values.length);
    if (!ready.length) return;
    const len = Math.max.apply(null, ready.map((line) => line.values.length));
    const map = (v) => log ? Math.log10(Math.max(0.01, v)) : v;
    let min = Infinity;
    let max = -Infinity;
    ready.forEach((line) => line.values.forEach((v) => {
      const m = map(v);
      if (m < min) min = m;
      if (m > max) max = m;
    }));
    if (min === max) { min -= 1; max += 1; }
    const pad = 16;
    ready.forEach((line) => {
      ctx.beginPath();
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 1.6;
      line.values.forEach((v, i) => {
        const x = pad + (w - pad * 2) * (line.values.length === 1 ? 0 : i / (line.values.length - 1));
        const y = h - pad - ((map(v) - min) / (max - min)) * (h - pad * 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
    ctx.fillStyle = "#9aa3ad";
    ctx.font = "11px Roboto Mono, monospace";
    ctx.fillText(ready.map((line) => line.name).join("  ·  "), pad, 14);
    ctx.fillText(log ? "log scale" : "linear", w - 78, 14);
  }

  function renderAll() {
    $("clock").textContent = clockText();
    $("phase").textContent = world.phase + " · rate " + (world.rate * 100).toFixed(2) + "% · regulation " + Math.round(world.regulation) + " · " + world.scenarioName + " / " + world.difficultyName + (world.observer ? " · observer" : "");
    $("god-panel").querySelectorAll("button, input, select, textarea").forEach((el) => {
      if (el.id === "law-yes" || el.id === "law-no") return;
      el.disabled = !!world.observer;
    });
    if (!world.observer) refreshNewsTargets();
    if ($("chart-asset").options.length !== world.assets.length) fillAssets();
    renderMeters();
    renderBoard();
    renderDossier();
    renderNews();
    renderRecords();
    renderLaw();
    renderChart();
    renderedDay = world.absDay;
  }

  function renderTick() {
    $("clock").textContent = clockText();
    if (world.absDay !== renderedDay) renderAll();
    else renderChart();
  }

  function actGod(cmd) {
    const result = C.applyGod(world, cmd);
    setStatus(result.ok ? result.text : result.reason);
    if (result.ok) renderAll();
  }

  function godTargetNews() {
    const scope = $("news-scope").value;
    if (scope === "bot") return selected;
    if (scope === "economy") return null;
    return $("news-target").value || null;
  }

  function frame(now) {
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    if (running && world && !skipping && !world.ended) {
      acc += dt * speed;
      let steps = 0;
      let dayAdvanced = false;
      const before = world.absDay;
      while (acc >= 1 && steps < 8) {
        C.stepTick(world);
        acc -= 1;
        steps++;
      }
      if (world.absDay !== before) dayAdvanced = true;
      if (steps) {
        renderTick();
        if (dayAdvanced) maybeAskAi();
      }
      if (world.ended) {
        running = false;
        $("pause").textContent = "Run";
        setStatus(world.ended);
      }
    }
    requestAnimationFrame(frame);
  }

  function skipYears() {
    if (!world || skipping) return;
    const years = Math.max(1, Math.min(20, Number($("skip-years").value) || 1));
    let left = years * 365;
    skipping = true;
    running = false;
    $("pause").textContent = "Run";
    const total = left;
    function chunk() {
      const n = Math.min(12, left);
      for (let i = 0; i < n; i++) C.stepDay(world);
      left -= n;
      setStatus("Skipped " + (total - left) + " / " + total + " days.");
      renderAll();
      if (left > 0 && !world.ended) setTimeout(chunk, 0);
      else {
        skipping = false;
        maybeAskAi();
      }
    }
    chunk();
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("capsim", 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains("saves")) req.result.createObjectStore("saves", { keyPath: "id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function refreshSaves() {
    const db = await openDb();
    const rows = await new Promise((resolve, reject) => {
      const req = db.transaction("saves").objectStore("saves").getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    rows.sort((a, b) => b.savedAt - a.savedAt);
    $("save-list").innerHTML = rows.map((row) => "<option value='" + row.id + "'>" + row.name + " · D" + row.summary.day + "</option>").join("");
    db.close();
  }

  async function saveTimeline(branch) {
    const name = ($("save-name").value || "timeline") + (branch ? " branch" : "");
    const id = name.replace(/\s+/g, "-").toLowerCase() + "-" + Date.now();
    const payload = {
      id,
      name,
      savedAt: Date.now(),
      options: world.options,
      summary: C.metrics(world),
      godLog: world.godLog.slice(0, 80),
      records: world.records
    };
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const req = db.transaction("saves", "readwrite").objectStore("saves").put(payload);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    db.close();
    await refreshSaves();
    setStatus("Saved " + name + ".");
  }

  async function loadTimeline() {
    const id = $("save-list").value;
    if (!id) return;
    const db = await openDb();
    const row = await new Promise((resolve, reject) => {
      const req = db.transaction("saves").objectStore("saves").get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    db.close();
    if (!row) return;
    setStatus("Replaying " + row.name + "…");
    await new Promise((resolve) => setTimeout(resolve, 30));
    running = false;
    $("pause").textContent = "Run";
    world = C.replayWorld(row);
    world.aiSpent = 0;
    world.aiToday = 0;
    world.aiDay = world.absDay;
    selected = world.order.length ? world.bots[world.order[0].i].id : world.bots[0].id;
    fillAssets();
    renderAll();
    setStatus("Loaded " + row.name + " at day " + world.absDay + ".");
  }

  function aiSettings() {
    return {
      url: ($("api-url").value || "").replace(/\/$/, ""),
      model: $("api-model").value || "llama3.2",
      key: $("api-key").value || sessionStorage.getItem("capsim-key") || "",
      perDay: Number($("api-per-day").value) || 0,
      budget: Number($("api-budget").value) || 0
    };
  }

  async function maybeAskAi() {
    if (!world || world.intelligence !== "api" || aiBusy || world.observer) return;
    const settings = aiSettings();
    if (!settings.url || settings.perDay <= 0) return;
    if (world.aiDay !== world.absDay) { world.aiDay = world.absDay; world.aiToday = 0; }
    if (world.aiToday >= settings.perDay || world.aiSpent >= settings.budget) return;
    const bot = C.leaderboard(world, "nw").map((r) => r.bot).find((b) => !b.aiHint && !b.broke);
    if (!bot) return;
    aiBusy = true;
    world.aiToday++;
    const prompt = "Pick one action for a capitalist bot as JSON {\"action\":\"hold|buy|sell|short|borrow|invent\",\"asset\":\"" +
      (world.assets.find((a) => a.kind === "stock") || {}).id + "\",\"reason\":\"short\"}. Bot " + bot.name +
      " is " + C.personalityOf(bot) + " with net worth " + money(bot.nw) + ". Rate " + world.rate + ". Mood " + Math.round(world.public.mood) + ".";
    try {
      if (settings.key) sessionStorage.setItem("capsim-key", settings.key);
      const headers = { "Content-Type": "application/json" };
      if (settings.key) headers.Authorization = "Bearer " + settings.key;
      const res = await fetch(settings.url + "/chat/completions", {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: settings.model,
          max_tokens: 80,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || "";
      world.aiSpent += Math.ceil((prompt.length + text.length) / 4);
      const match = text.match(/\{[\s\S]*\}/);
      if (match) bot.aiHint = JSON.parse(match[0]);
      else bot.lastReason = "API reply was not usable. Rules will decide.";
    } catch (err) {
      bot.lastReason = "API failed. Rules will decide.";
    }
    aiBusy = false;
  }

  function wire() {
    $("scenario").onchange = () => $("custom-fields").classList.toggle("hidden", $("scenario").value !== "custom");
    $("intelligence").onchange = () => $("api-fields").classList.toggle("hidden", $("intelligence").value !== "api");
    $("news-score").oninput = () => { $("news-score-label").textContent = $("news-score").value; };
    $("news-scope").onchange = refreshNewsTargets;
    $("new-game").onclick = newGame;
    $("pause").onclick = () => {
      if (world && world.ended) return;
      running = !running;
      $("pause").textContent = running ? "Pause" : "Run";
    };
    document.querySelectorAll("[data-speed]").forEach((btn) => {
      btn.onclick = () => {
        speed = Number(btn.getAttribute("data-speed"));
        document.querySelectorAll("[data-speed]").forEach((b) => b.classList.toggle("active", b === btn));
      };
    });
    $("skip").onclick = skipYears;
    $("rewind").onclick = () => {
      if (!world || !world.snaps.length) return;
      const snap = world.snaps[Math.max(0, world.snaps.length - 2)];
      running = false;
      $("pause").textContent = "Run";
      C.restoreSnap(world, snap);
      renderAll();
      setStatus("Rewound to day " + world.absDay + ".");
    };
    $("send-news").onclick = () => actGod({
      type: "news",
      text: $("news-text").value,
      score: Number($("news-score").value),
      scope: $("news-scope").value,
      target: godTargetNews(),
      duration: $("news-duration").value
    });
    $("create-money").onclick = () => actGod({
      type: "money", mode: $("money-mode").value, target: selected, amount: Math.round(Number($("money-amount").value || 0) * 100)
    });
    $("destroy-money").onclick = () => actGod({
      type: "money", mode: $("money-mode").value, target: selected, amount: -Math.round(Number($("money-amount").value || 0) * 100)
    });
    $("set-rate").onclick = () => actGod({ type: "rate", rate: Number($("rate").value), days: Number($("rate-days").value) });
    $("set-reg").onclick = () => actGod({ type: "regulation", regulation: Number($("regulation").value) });
    $("reward").onclick = () => actGod({ type: "reward", target: selected, kind: $("punish-kind").value, amount: Math.round(Number($("punish-amount").value || 0) * 100) });
    $("punish").onclick = () => actGod({ type: "punish", target: selected, kind: $("punish-kind").value, amount: Math.round(Number($("punish-amount").value || 0) * 100) });
    $("board").onclick = (event) => {
      const tr = event.target.closest("tr");
      if (!tr || !tr.dataset.id) return;
      selected = tr.dataset.id;
      renderBoard();
      renderDossier();
    };
    document.querySelectorAll("[data-sort]").forEach((btn) => {
      btn.onclick = () => { sortKey = btn.getAttribute("data-sort"); renderBoard(); };
    });
    $("find-bot").oninput = renderBoard;
    $("archive-q").oninput = renderNews;
    $("chart-mode").onchange = renderChart;
    $("chart-asset").onchange = renderChart;
    $("log-scale").onchange = renderChart;
    $("save").onclick = () => saveTimeline(false).catch((err) => setStatus(String(err)));
    $("branch").onclick = () => saveTimeline(true).catch((err) => setStatus(String(err)));
    $("load").onclick = () => loadTimeline().catch((err) => setStatus(String(err)));
    document.addEventListener("keydown", (event) => {
      if (event.code === "Space" && event.target.tagName !== "INPUT" && event.target.tagName !== "TEXTAREA") {
        event.preventDefault();
        $("pause").click();
      }
    });
    window.addEventListener("resize", renderChart);
  }

  $("seed").value = String(Math.floor(Math.random() * 900000000) + 1);
  wire();
  newGame();
  refreshSaves().catch(() => {});
  requestAnimationFrame(frame);
})();
