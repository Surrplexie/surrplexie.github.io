(function () {
  const API = globalThis.MarketSimAPI;
  const { fmtMoney, fmtQty, fmtMcap, fmtPrice, CHART_EPOCH } = globalThis.MarketSimState;
  const { STARTING_CASH_MIN_USD, STARTING_CASH_MAX_USD } = globalThis.MarketSimConfig;

  let selectedTicker = null;
  let chart = null;
  let candleSeries = null;
  let autoTimer = null;

  const watchSort = { col: "ticker", dir: "asc" };
  let sectorOptionsBuilt = false;
  let lastChartBars = [];

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

  function isAutoOn() {
    return $("chk-auto")?.checked === true;
  }

  function classFilterSet() {
    const set = new Set();
    if ($("flt-stock")?.checked) set.add("stock");
    if ($("flt-fund")?.checked) set.add("fund");
    if ($("flt-crypto")?.checked) set.add("crypto");
    return set;
  }

  function classLabel(cls) {
    if (cls === "fund") return "ETF";
    if (cls === "crypto") return "Crypto";
    return "Stock";
  }

  function compareRows(a, b, col, dir) {
    const mul = dir === "desc" ? -1 : 1;
    let va;
    let vb;
    switch (col) {
      case "ticker":
        va = a.ticker;
        vb = b.ticker;
        return mul * String(va).localeCompare(String(vb));
      case "asset_class":
        va = a.asset_class;
        vb = b.asset_class;
        return mul * String(va).localeCompare(String(vb));
      case "sector":
        va = a.sector || "";
        vb = b.sector || "";
        return mul * String(va).localeCompare(String(vb));
      case "mid":
      case "mcap":
      case "pct_24h":
      case "volume":
      case "ask_size":
        va = Number(a[col]) || 0;
        vb = Number(b[col]) || 0;
        return mul * (va - vb);
      default:
        return 0;
    }
  }

  function filterAndSortInstruments(instruments) {
    const classes = classFilterSet();
    const q = ($("watch-search")?.value || "").trim().toUpperCase();
    const sector = ($("watch-sector")?.value || "").trim();

    let rows = instruments.filter((row) => {
      if (!classes.has(row.asset_class)) return false;
      if (sector && (row.sector || "") !== sector) return false;
      if (q && !row.ticker.toUpperCase().includes(q) && !(row.name || "").toUpperCase().includes(q)) {
        return false;
      }
      return true;
    });

    rows = rows.slice().sort((a, b) => compareRows(a, b, watchSort.col, watchSort.dir));
    return rows;
  }

  function updateSortHeaders() {
    document.querySelectorAll("#watch-table th.sortable").forEach((th) => {
      const col = th.dataset.sort;
      const active = col === watchSort.col;
      th.classList.toggle("active", active);
      const ind = th.querySelector(".sort-ind");
      if (ind) ind.textContent = active ? (watchSort.dir === "asc" ? "▲" : "▼") : "↕";
    });
  }

  function rebuildSectorOptions(instruments) {
    if (sectorOptionsBuilt) return;
    const sel = $("watch-sector");
    if (!sel) return;
    const sectors = [...new Set(instruments.map((x) => x.sector).filter(Boolean))].sort();
    for (const s of sectors) {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      sel.appendChild(opt);
    }
    sectorOptionsBuilt = true;
  }

  function renderWatchlist(st) {
    rebuildSectorOptions(st.instruments);
    const rows = filterAndSortInstruments(st.instruments);
    $("watch-count").textContent = `${rows.length} / ${st.instruments.length} shown`;

    const tbody = $("watch-body");
    tbody.innerHTML = "";
    const auto = isAutoOn();

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="muted">No rows match filters</td></tr>';
      updateSortHeaders();
      return;
    }

    for (const row of rows) {
      const tr = document.createElement("tr");
      tr.dataset.ticker = row.ticker;
      if (row.ticker === selectedTicker) {
        tr.classList.add("sel");
        if (auto) tr.classList.add("auto-follow");
      }
      const ch = row.pct_24h;
      tr.innerHTML = `
        <td class="tck">${row.ticker}</td>
        <td><span class="class-tag ${row.asset_class}">${classLabel(row.asset_class)}</span></td>
        <td class="sec">${row.sector || "—"}</td>
        <td class="num">${fmtMoney(row.mid)}</td>
        <td class="num" title="mid × units out">${fmtMcap(row.mcap)}</td>
        <td class="num ch ${ch >= 0 ? "up" : "dn"}">${ch >= 0 ? "+" : ""}${ch.toFixed(2)}%</td>
        <td class="num" title="μ=${(row.mu ?? 0).toFixed(3)} σ=${(row.sigma ?? 0).toFixed(3)}">${fmtQty(row.volume)}</td>
        <td class="num">${fmtQty(row.ask_size)}</td>
      `;
      tr.addEventListener("click", () => selectTicker(row.ticker));
      tbody.appendChild(tr);
    }
    updateSortHeaders();
  }

  function updateAutoHint() {
    const hint = $("auto-follow-hint");
    if (!hint) return;
    if (isAutoOn()) {
      hint.hidden = false;
      hint.textContent = selectedTicker
        ? `Auto stepping · chart following ${selectedTicker}`
        : "Auto stepping · click a row to follow on chart";
    } else {
      hint.hidden = true;
    }
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

  function renderState(opts) {
    opts = opts || {};
    const full = opts.full !== false;
    const st = API.getState();

    $("hdr-mode").textContent = st.mode;
    $("hdr-tick").textContent = st.tick;
    $("hdr-equity").textContent = fmtMoney(st.equity);
    $("hdr-cash").textContent = fmtMoney(st.cash);
    $("hdr-margin").textContent = st.margin_ok ? "OK" : "STRESS";
    $("hdr-margin").className = st.margin_ok ? "ok" : "bad";

    $("news-line").textContent = st.news.length ? st.news[0].text : "—";

    renderWatchlist(st);
    updateAutoHint();

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

    if (full) {
      $("json-out").textContent = JSON.stringify(st, null, 2);
      loadGbmFields(st);
    }

    if (selectedTicker) refreshChart();
  }

  function selectTicker(ticker) {
    selectedTicker = ticker;
    $("order-ticker").value = ticker;
    $("corp-ticker").value = ticker;
    renderState({ full: !isAutoOn() });
  }

  function chartIntervalSpec() {
    return $("chart-interval").value || "day:1";
  }

  function updateOhlcDisplay(candle) {
    if (!candle || candle.open == null) {
      clearOhlcDisplay();
      return;
    }
    const o = Number(candle.open);
    const h = Number(candle.high);
    const l = Number(candle.low);
    const c = Number(candle.close);
    const chg = c - o;
    const pct = o ? (chg / o) * 100 : 0;
    const cls = chg >= 0 ? "up" : "dn";

    $("ohlc-o").textContent = fmtPrice(o);
    $("ohlc-h").textContent = fmtPrice(h);
    $("ohlc-l").textContent = fmtPrice(l);
    $("ohlc-c").textContent = fmtPrice(c);

    ["ohlc-o", "ohlc-h", "ohlc-l", "ohlc-c"].forEach((id) => {
      $(id).className = `ohlc-v ${cls}`;
    });

    const sign = chg >= 0 ? "+" : "";
    $("ohlc-chg").textContent = `${sign}${fmtPrice(chg)} (${sign}${pct.toFixed(2)}%)`;
    $("ohlc-chg").className = `ohlc-chg ${cls}`;
  }

  function clearOhlcDisplay() {
    ["ohlc-o", "ohlc-h", "ohlc-l", "ohlc-c"].forEach((id) => {
      $(id).textContent = "—";
      $(id).className = "ohlc-v";
    });
    $("ohlc-chg").textContent = "—";
    $("ohlc-chg").className = "ohlc-chg";
  }

  function showLatestOhlc() {
    if (lastChartBars.length) updateOhlcDisplay(lastChartBars[lastChartBars.length - 1]);
    else clearOhlcDisplay();
  }

  function refreshChart() {
    if (!selectedTicker || !candleSeries) return;
    const spec = chartIntervalSpec();
    const { bars, bucket_label } = API.chart(selectedTicker, spec, 400);
    $("chart-title").textContent = selectedTicker;
    $("chart-interval-hint").textContent = bucket_label || "";
    if (!bars.length) {
      lastChartBars = [];
      candleSeries.setData([]);
      clearOhlcDisplay();
      return;
    }
    lastChartBars = bars;
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
    showLatestOhlc();
  }

  function simTickFromChartTime(time, mpt) {
    return Math.round((time - CHART_EPOCH) / (mpt * 60));
  }

  function initChart() {
    const el = $("chart");
    if (!globalThis.LightweightCharts) return;
    const mpt = () => API.getState().sim_minutes_per_tick || 15;
    chart = globalThis.LightweightCharts.createChart(el, {
      width: el.clientWidth,
      height: 280,
      layout: { background: { color: "#0d1117" }, textColor: "#9db0c4" },
      grid: { vertLines: { color: "#1c2430" }, horzLines: { color: "#1c2430" } },
      timeScale: {
        borderColor: "#2a3544",
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time) => {
          const tick = simTickFromChartTime(time, mpt());
          const tpd = Math.round((24 * 60) / mpt());
          if (tpd > 0 && tick >= tpd) {
            const day = Math.floor(tick / tpd);
            const rem = tick % tpd;
            return rem === 0 ? `D${day}` : `D${day}+${rem}`;
          }
          return `T${tick}`;
        },
      },
      localization: {
        timeFormatter: (time) => {
          const tick = simTickFromChartTime(time, mpt());
          const tpd = Math.round((24 * 60) / mpt());
          const day = tpd > 0 ? Math.floor(tick / tpd) : 0;
          const rem = tpd > 0 ? tick % tpd : tick;
          return tpd > 0 ? `sim D${day} tick ${rem} (#${tick})` : `sim tick ${tick}`;
        },
      },
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

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData || !candleSeries) {
        showLatestOhlc();
        return;
      }
      const d = param.seriesData.get(candleSeries);
      if (d && d.open != null) updateOhlcDisplay(d);
      else showLatestOhlc();
    });
  }

  function initSortHeaders() {
    document.querySelectorAll("#watch-table th.sortable").forEach((th) => {
      if (!th.querySelector(".sort-ind")) {
        const span = document.createElement("span");
        span.className = "sort-ind";
        span.textContent = "↕";
        th.appendChild(span);
      }
      th.addEventListener("click", () => {
        const col = th.dataset.sort;
        if (watchSort.col === col) {
          watchSort.dir = watchSort.dir === "asc" ? "desc" : "asc";
        } else {
          watchSort.col = col;
          watchSort.dir =
            col === "ticker" || col === "sector" || col === "asset_class" ? "asc" : "desc";
        }
        renderState({ full: false });
      });
    });
    updateSortHeaders();
  }

  function bindWatchFilters() {
    const rerender = () => renderState({ full: false });
    $("flt-stock").addEventListener("change", rerender);
    $("flt-fund").addEventListener("change", rerender);
    $("flt-crypto").addEventListener("change", rerender);
    $("watch-search").addEventListener("input", rerender);
    $("watch-sector").addEventListener("change", rerender);
  }

  function bind() {
    $("btn-step1").addEventListener("click", () => {
      API.step({ ticks: 1 });
      renderState({ full: false });
    });
    $("btn-step5").addEventListener("click", () => {
      API.step({ ticks: 5 });
      renderState({ full: false });
    });
    $("btn-step50").addEventListener("click", () => {
      API.step({ ticks: 50 });
      renderState({ full: false });
    });
    $("btn-run-day").addEventListener("click", () => {
      API.step({ unit: "day", n: 1 });
      renderState({ full: false });
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
        sectorOptionsBuilt = false;
        const sel = $("watch-sector");
        while (sel.options.length > 1) sel.remove(1);
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
      renderState({ full: false });
    });

    $("trend-slider").addEventListener("input", (e) => {
      const v = parseFloat(e.target.value);
      $("trend-val").textContent = v.toFixed(2);
      API.trendOverride({ value: v });
      renderState({ full: false });
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
      updateAutoHint();
      if (e.target.checked) {
        const ms = parseInt($("auto-rate").value, 10) || 400;
        autoTimer = setInterval(() => {
          API.step({ ticks: 1 });
          renderState({ full: false });
        }, ms);
      } else {
        renderState({ full: false });
      }
    });

    $("auto-rate").addEventListener("change", () => {
      if ($("chk-auto").checked) {
        $("chk-auto").dispatchEvent(new Event("change"));
      }
    });

    $("start-cash").min = STARTING_CASH_MIN_USD;
    $("start-cash").max = STARTING_CASH_MAX_USD;

    $("chart-interval").addEventListener("change", () => {
      if (selectedTicker) refreshChart();
    });

    bindWatchFilters();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initChart();
    initSortHeaders();
    bind();
    renderState();
  });
})();
