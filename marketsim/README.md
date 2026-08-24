# MarketSim (browser — full JS port)

Play at **[surrplexie.github.io/marketsim/](https://surrplexie.github.io/marketsim/)**.

Client-side port of the Python MarketSim stack: same module boundaries (`config`, `instrument`, `gbm`, `clob`, `market`, `player`, `execution`, `engine`, `api`, `state`) running entirely in the browser for GitHub Pages.

## Module map (Python → JS)

| Python | JavaScript |
|--------|------------|
| `modes.py` | `js/config.js` |
| `instrument.py` | `js/instrument.js` |
| `sim_time.py` | `js/sim_time.js` |
| GBM core | `js/gbm.js` |
| `clob.py` | `js/clob.js` |
| `market.py` | `js/market.js` |
| `player.py` | `js/player.js` |
| `execution.py` | `js/execution.js` |
| `engine.py` | `js/engine.js` |
| `api.py` | `js/api.js` |
| TUI N/A | `js/app.js` + `index.html` |

## Features

- **GBM pricing** with editable **μ**, **σ**, drift bias, vol multiplier, sim minutes/tick (global + per-scope/per-ticker)
- **Mega universe** (32+4+8) or classic generator for other counts
- **Order book** with NPC liquidity, opening spread calendar, market/limit orders, book liquidity caps
- **Margin / leverage / shorting** (hard & complex presets), borrow accrual, SEC & taker fees, slippage
- **Overnight gaps**, headline shocks, Great Depression + recovery path
- **Supply**: float flow, crypto mint/dilution, 21M-unit cap coin
- **Volume**: fills + synthetic turnover
- **Corp actions**: split, dividend, buyback
- **Fund NAV sync** from equal-weight baskets

## GBM controls

Formula: **S′ = S × exp((μ − σ²/2)Δt + σ√Δt Z)**

- **Apply global GBM** — stock/fund annual μ, drift bias, vol mult, minutes per tick
- **Apply scope GBM** — override μ/σ for selected ticker, all stocks, funds, crypto, or all
- **Regime sliders** — listed vol mult + trend bias (live)

## API (in-browser)

`MarketSimAPI` mirrors the Python FastAPI routes:

- `getState()`, `step(body)`, `order(body)`, `reset(body)`
- `startingCash(body)`, `volatilityOverride(body)`, `trendOverride(body)`
- `gbmParams(body)`, `stockSplit`, `stockDividend`, `stockBuyback`, `chart(ticker)`

## Local run

```bash
cd marketsim
python -m http.server 8080
```

Open `http://127.0.0.1:8080/`.

## Not included

- Python **TUI** (`python -m marketsim` without `--web`) — use the Python package locally if needed
- Server-side persistence (one tab = one session)
