(function () {
  const {
    getGame,
    resetGame,
    setStartingCash,
    parseAdvance,
  } = globalThis.MarketSimEngine;
  const { Result, resultMsg } = globalThis.MarketSimExecution;
  const { serializeState, chartSeries, fmtMoney, fmtQty } = globalThis.MarketSimState;
  const { STARTING_CASH_MIN_USD, STARTING_CASH_MAX_USD } = globalThis.MarketSimConfig;

  let selectedTicker = null;
  let chart = null;
  let candleSeries = null;
  let autoTimer = null;

  const $ = (id) => document.getElementById(id);

  function showToast(msg, ok) {
    const el = $("toast");
    el.textContent = msg;
    el.className = ok ? "toast ok" : "toast err";
    el.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      el.hidden = true;
    }, 3200);
  }

  function renderState() {
    const s = getGame();
    const st = serializeState(s);

    $("hdr-mode").textContent = st.mode;
    $("hdr-tick").textContent = st.tick;
    $("hdr-equity").textContent = fmtMoney(st.equity);
    $("hdr-cash").textContent = fmtMoney(st.cash);

    const newsEl = $("news-line");
    newsEl.textContent = st.news.length ? st.news[0].text : "—";

    const tbody = $("watch-body");
    tbody.innerHTML = "";
    for (const row of st.instruments) {
      const tr = document.createElement("tr");
      tr.dataset.ticker = row.ticker;
      if (row.ticker === selectedTicker) tr.classList.add("sel");
      const ch = row.pct_24h;
      tr.innerHTML = `
        <td class="tck">${row.ticker}</td>
        <td class="cls">${row.asset_class}</td>
        <td class="sec">${row.sector || "—"}</td>
        <td class="num">${fmtMoney(row.mid)}</td>
        <td class="num ch ${ch >= 0 ? "up" : "dn"}">${ch >= 0 ? "+" : ""}${ch.toFixed(2)}%</td>
        <td class="num">${fmtQty(row.volume)}</td>
        <td class="num">${fmtQty(row.ask_size)}</td>
      `;
      tr.addEventListener("click", () => selectTicker(row.ticker));
      tbody.appendChild(tr);
    }

    const posBody = $("pos-body");
    posBody.innerHTML = "";
    if (!st.positions.length) {
      posBody.innerHTML = '<tr><td colspan="4" class="muted">No positions</td></tr>';
    } else {
      for (const p of st.positions) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><button type="button" class="link-btn" data-t="${p.ticker}">${p.ticker}</button></td>
          <td class="num">${fmtQty(p.qty)}</td>
          <td class="num">${fmtMoney(p.mid)}</td>
          <td class="num">${fmtMoney(p.mv)}</td>
        `;
        tr.querySelector("button").addEventListener("click", () => selectTicker(p.ticker));
        posBody.appendChild(tr);
      }
    }

    $("json-out").textContent = JSON.stringify(st, null, 2);

    if (selectedTicker) refreshChart();
  }

  function selectTicker(ticker) {
    selectedTicker = ticker;
    $("order-ticker").value = ticker;
    renderState();
  }

  function refreshChart() {
    if (!selectedTicker || !candleSeries) return;
    const s = getGame();
    const { bars } = chartSeries(s, selectedTicker, 1, 400);
    $("chart-title").textContent = selectedTicker;
    const data = bars.map((b) => ({
      time: b.time,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
    }));
    candleSeries.setData(data);
    chart.timeScale().fitContent();
  }

  function initChart() {
    const el = $("chart");
    if (!globalThis.LightweightCharts) return;
    chart = globalThis.LightweightCharts.createChart(el, {
      width: el.clientWidth,
      height: 280,
      layout: { background: { color: "#0d1117" }, textColor: "#9db0c4" },
      grid: { vertLines: { color: "#1c2430" }, horzLines: { color: "#1c2430" } },
      timeScale: { borderColor: "#2a3544" },
      rightPriceScale: { borderColor: "#2a3544" },
    });
    candleSeries = chart.addCandlestickSeries({
      upColor: "#3fb950",
      downColor: "#f85149",
      borderVisible: false,
      wickUpColor: "#3fb950",
      wickDownColor: "#f85149",
    });
    window.addEventListener("resize", () => {
      if (chart) chart.applyOptions({ width: el.clientWidth });
    });
  }

  function doStep(body) {
    const s = getGame();
    try {
      body = Object.assign({ mpt: s.config.simMinutesPerTick }, body || {});
      const adv = parseAdvance(body);
      s.step(adv.ticks);
      renderState();
    } catch (e) {
      showToast(e.message, false);
    }
  }

  function doOrder() {
    const s = getGame();
    const ticker = ($("order-ticker").value || "").trim().toUpperCase();
    const side = $("order-side").value;
    const typ = $("order-type").value;
    const sizeRaw = $("order-size").value;
    const cashRaw = $("order-cash").value;
    const priceRaw = $("order-price").value;

    let r;
    if (typ === "market") {
      if (side === "buy") {
        if (cashRaw.trim()) r = s.orderMarketBuyCash(ticker, parseFloat(cashRaw));
        else r = s.orderMarketBuy(ticker, parseFloat(sizeRaw));
      } else {
        r = s.orderMarketSell(ticker, parseFloat(sizeRaw));
      }
    } else {
      r = s.orderLimit(ticker, side, parseFloat(sizeRaw), parseFloat(priceRaw));
    }
    if (r !== Result.OK) showToast(resultMsg(r), false);
    else showToast("order accepted", true);
    renderState();
  }

  function bind() {
    $("btn-step1").addEventListener("click", () => doStep({ ticks: 1 }));
    $("btn-step5").addEventListener("click", () => doStep({ ticks: 5 }));
    $("btn-step50").addEventListener("click", () => doStep({ ticks: 50 }));
    $("btn-run-day").addEventListener("click", () => doStep({ unit: "day", n: 1 }));
    $("btn-order").addEventListener("click", doOrder);

    $("btn-new-game").addEventListener("click", () => {
      try {
        resetGame({
          mode: $("sel-mode").value,
          great_depression: $("chk-gd").checked,
          starting_cash: parseFloat($("start-cash").value),
        });
        selectedTicker = null;
        showToast("new game", true);
        renderState();
      } catch (e) {
        showToast(e.message, false);
      }
    });

    $("btn-apply-cash").addEventListener("click", () => {
      try {
        setStartingCash(parseFloat($("start-cash").value));
        showToast("cash updated", true);
        renderState();
      } catch (e) {
        showToast(e.message, false);
      }
    });

    $("vol-slider").addEventListener("input", (e) => {
      const v = parseFloat(e.target.value);
      $("vol-val").textContent = v.toFixed(2);
      getGame().setVolatilityOverride(v);
      renderState();
    });

    $("trend-slider").addEventListener("input", (e) => {
      const v = parseFloat(e.target.value);
      $("trend-val").textContent = v.toFixed(2);
      getGame().setTrendOverride(v);
      renderState();
    });

    $("chk-auto").addEventListener("change", (e) => {
      clearInterval(autoTimer);
      autoTimer = null;
      if (e.target.checked) {
        const ms = parseInt($("auto-rate").value, 10) || 400;
        autoTimer = setInterval(() => doStep({ ticks: 1 }), ms);
      }
    });

    $("auto-rate").addEventListener("change", () => {
      if ($("chk-auto").checked) {
        $("chk-auto").dispatchEvent(new Event("change"));
      }
    });

    $("start-cash").min = STARTING_CASH_MIN_USD;
    $("start-cash").max = STARTING_CASH_MAX_USD;
  }

  document.addEventListener("DOMContentLoaded", () => {
    initChart();
    bind();
    renderState();
  });
})();
