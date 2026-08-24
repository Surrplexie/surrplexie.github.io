(function () {
  const API = globalThis.MarketSimAPI;
  const { Result, resultMsg } = globalThis.MarketSimExecution;
  const { fmtMoney, fmtQty } = globalThis.MarketSimState;
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

  function loadGbmFields(st) {
    const g = st.gbm.global;
    $("gbm-mu-global").value = g.stock_fund_annual_return;
    $("gbm-drift").value = g.drift_bias;
    $("gbm-vol").value = g.vol_multiplier;
    $("gbm-mpt").value = g.sim_minutes_per_tick;
    $("vol-slider").value = st.vol_override;
    $("vol-val").textContent = Number(st.vol_override).toFixed(2);
    $("trend-slider").value = st.trend_override;
    $("trend-val").textContent = Number(st.trend_override).toFixed(2);
    syncTickerGbm(st);
  }

  function syncTickerGbm(st) {
    const t = selectedTicker || ($("order-ticker").value || "").trim().toUpperCase();
    $("gbm-scope").value = t ? "selected" : "stocks";
    if (!t) {
      $("gbm-mu-ticker").value = "";
      $("gbm-sigma-ticker").value = "";
      return;
    }
    const row = st.instruments.find((x) => x.ticker === t);
    const ov = st.gbm.per_ticker[t] || {};
    $("gbm-ticker-label").textContent = t;
    $("gbm-mu-ticker").value = ov.mu != null ? ov.mu : row?.mu ?? "";
    $("gbm-sigma-ticker").value = ov.sigma != null ? ov.sigma : row?.base_sigma ?? row?.sigma ?? "";
  }

  function renderState() {
    const st = API.getState();

    $("hdr-mode").textContent = st.mode;
    $("hdr-tick").textContent = st.tick;
    $("hdr-equity").textContent = fmtMoney(st.equity);
    $("hdr-cash").textContent = fmtMoney(st.cash);
    $("hdr-margin").textContent = st.margin_ok ? "OK" : "STRESS";
    $("hdr-margin").className = st.margin_ok ? "ok" : "bad";

    $("news-line").textContent = st.news.length ? st.news[0].text : "—";

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
        <td class="num" title="μ=${(row.mu ?? 0).toFixed(3)} σ=${(row.sigma ?? 0).toFixed(3)}">${fmtQty(row.volume)}</td>
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
          <td><button type="button" class="link-btn">${p.ticker}</button></td>
          <td class="num">${fmtQty(p.qty)}</td>
          <td class="num">${fmtMoney(p.mid)}</td>
          <td class="num">${fmtMoney(p.mv)}</td>
        `;
        tr.querySelector("button").addEventListener("click", () => selectTicker(p.ticker));
        posBody.appendChild(tr);
      }
    }

    $("json-out").textContent = JSON.stringify(st, null, 2);
    loadGbmFields(st);
    if (selectedTicker) refreshChart();
  }

  function selectTicker(ticker) {
    selectedTicker = ticker;
    $("order-ticker").value = ticker;
    renderState();
  }

  function refreshChart() {
    if (!selectedTicker || !candleSeries) return;
    const { bars } = API.chart(selectedTicker, 1, 500);
    $("chart-title").textContent = selectedTicker;
    candleSeries.setData(
      bars.map((b) => ({
        time: b.time,
        open: b.open,
        high: b.high,
        low: b.low,
        close: b.close,
      }))
    );
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

  function bind() {
    $("btn-step1").addEventListener("click", () => {
      API.step({ ticks: 1 });
      renderState();
    });
    $("btn-step5").addEventListener("click", () => {
      API.step({ ticks: 5 });
      renderState();
    });
    $("btn-step50").addEventListener("click", () => {
      API.step({ ticks: 50 });
      renderState();
    });
    $("btn-run-day").addEventListener("click", () => {
      API.step({ unit: "day", n: 1 });
      renderState();
    });

    $("btn-order").addEventListener("click", () => {
      try {
        const side = $("order-side").value;
        const typ = $("order-type").value;
        const body = {
          ticker: $("order-ticker").value,
          side,
          type: typ,
        };
        if (typ === "limit") {
          body.price = parseFloat($("order-price").value);
          if ($("order-cash").value.trim() && side === "buy") body.cash = parseFloat($("order-cash").value);
          else body.size = parseFloat($("order-size").value);
        } else if (side === "buy" && $("order-cash").value.trim()) {
          body.cash = parseFloat($("order-cash").value);
        } else {
          body.size = parseFloat($("order-size").value);
        }
        API.order(body);
        showToast("order accepted", true);
        renderState();
      } catch (e) {
        showToast(e.message, false);
      }
    });

    $("btn-new-game").addEventListener("click", () => {
      try {
        API.reset({
          mode: $("sel-mode").value,
          great_depression: $("chk-gd").checked,
          starting_cash: parseFloat($("start-cash").value),
          seed: $("seed").value.trim() ? parseInt($("seed").value, 10) : null,
          stock_fund_annual_return: parseFloat($("gbm-mu-global").value),
          sim_minutes_per_tick: parseFloat($("gbm-mpt").value),
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
        API.startingCash({ cash: parseFloat($("start-cash").value) });
        showToast("cash updated", true);
        renderState();
      } catch (e) {
        showToast(e.message, false);
      }
    });

    $("vol-slider").addEventListener("input", (e) => {
      const v = parseFloat(e.target.value);
      $("vol-val").textContent = v.toFixed(2);
      API.volatilityOverride({ value: v });
      renderState();
    });

    $("trend-slider").addEventListener("input", (e) => {
      const v = parseFloat(e.target.value);
      $("trend-val").textContent = v.toFixed(2);
      API.trendOverride({ value: v });
      renderState();
    });

    $("btn-gbm-global").addEventListener("click", () => {
      try {
        API.gbmParams({
          global: {
            stockFundAnnualReturn: parseFloat($("gbm-mu-global").value),
            driftBias: parseFloat($("gbm-drift").value),
            volMultiplier: parseFloat($("gbm-vol").value),
            simMinutesPerTick: parseFloat($("gbm-mpt").value),
          },
        });
        showToast("GBM globals applied", true);
        renderState();
      } catch (e) {
        showToast(e.message, false);
      }
    });

    $("btn-gbm-scope").addEventListener("click", () => {
      try {
        const scope = $("gbm-scope").value;
        const params = {};
        const mu = $("gbm-mu-ticker").value.trim();
        const sigma = $("gbm-sigma-ticker").value.trim();
        if (mu !== "") params.mu = parseFloat(mu);
        if (sigma !== "") params.sigma = parseFloat(sigma);
        if (scope === "selected") {
          const t = selectedTicker || $("order-ticker").value.trim();
          if (!t) throw new Error("pick a ticker");
          API.gbmParams({ ticker: t.toUpperCase(), params });
        } else {
          API.gbmParams({ scope, params });
        }
        showToast("GBM scope applied", true);
        renderState();
      } catch (e) {
        showToast(e.message, false);
      }
    });

    $("btn-split").addEventListener("click", () => {
      try {
        API.stockSplit({ ticker: $("corp-ticker").value, ratio: parseFloat($("corp-ratio").value) });
        showToast("split applied", true);
        renderState();
      } catch (e) {
        showToast(e.message, false);
      }
    });

    $("btn-div").addEventListener("click", () => {
      try {
        API.stockDividend({ ticker: $("corp-ticker").value, cash_per_share: parseFloat($("corp-amt").value) });
        showToast("dividend applied", true);
        renderState();
      } catch (e) {
        showToast(e.message, false);
      }
    });

    $("btn-buyback").addEventListener("click", () => {
      try {
        API.stockBuyback({ ticker: $("corp-ticker").value, fraction: parseFloat($("corp-amt").value) });
        showToast("buyback applied", true);
        renderState();
      } catch (e) {
        showToast(e.message, false);
      }
    });

    $("chk-auto").addEventListener("change", (e) => {
      clearInterval(autoTimer);
      autoTimer = null;
      if (e.target.checked) {
        const ms = parseInt($("auto-rate").value, 10) || 400;
        autoTimer = setInterval(() => {
          API.step({ ticks: 1 });
          renderState();
        }, ms);
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
