(function (global) {
  const UNITS = {
    minute: 1,
    min: 1,
    hour: 60,
    hr: 60,
    day: 24 * 60,
    week: 7 * 24 * 60,
  };

  /** Parse `run day 2` or `run 2 day` style lines. */
  function parseRunLine(parts) {
    if (!parts || parts.length < 2) throw new Error("run needs UNIT and N");
    let n = NaN;
    let unit = "";
    const a = String(parts[0]).toLowerCase();
    const b = String(parts[1]).toLowerCase();
    if (UNITS[a] != null && !Number.isNaN(Number(b))) {
      unit = a;
      n = Number(b);
    } else if (UNITS[b] != null && !Number.isNaN(Number(a))) {
      unit = b;
      n = Number(a);
    } else {
      throw new Error(`bad run line: ${parts.join(" ")}`);
    }
    if (!Number.isFinite(n)) throw new Error("N must be numeric");
    return { n, unit };
  }

  function ticksForInterval(n, unit, simMinutesPerTick) {
    const mins = UNITS[String(unit).toLowerCase()];
    if (!mins) throw new Error(`unknown unit: ${unit}`);
    const mpt = simMinutesPerTick || 15;
    return Math.max(0, Math.ceil((n * mins) / mpt));
  }

  function parseAdvance(body, simMinutesPerTick) {
    body = body || {};
    if (body.ticks != null) {
      return { ticks: Math.max(0, Math.floor(Number(body.ticks) || 0)) };
    }
    const unit = String(body.unit || "tick").toLowerCase();
    const n = Math.max(0, Number(body.n) || 0);
    if (unit === "tick" || unit === "ticks") return { ticks: Math.floor(n) };
    return { ticks: ticksForInterval(n, unit, body.mpt ?? simMinutesPerTick) };
  }

  global.MarketSimTime = { UNITS, parseRunLine, parseAdvance, ticksForInterval };
})(typeof window !== "undefined" ? window : globalThis);
