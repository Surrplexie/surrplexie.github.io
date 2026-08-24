# MarketSim (browser)

Play at **[surrplexie.github.io/marketsim/](https://surrplexie.github.io/marketsim/)** after you push this folder to GitHub Pages.

This is a **client-only** port of the Python [marketsim](https://github.com/Surrplexie/marketsim) toy market: no server, no install. The simulation runs in JavaScript in your tab (same idea as the local `python -m marketsim --web` UI, but without FastAPI).

## Quick start

1. Open **`/marketsim/`** on the site (or open `marketsim/index.html` locally).
2. Choose a **preset** and **starting cash** ($0.0001–$100M), then **New game**.
3. **Apply cash** only at **tick 0** with a flat book (no positions).
4. Advance with **+1 / +5 / +50 / +1 day** or enable **Auto step**.
5. Click a watchlist row for the **chart**; place **market** or **limit** orders from the left panel.

## Presets

| Mode | Notes |
|------|--------|
| **simple** | Lower vol, wider learning curve |
| **easy** | More starting cash, tighter spreads |
| **hard** | Shorting, leverage, fees, wider spreads |
| **complex** | Mild negative drift bias + margin features |
| **free / custom** | Same baseline config in this build |

Optional **Great Depression** schedules a one-time broad crash, then partial recovery.

## Universe

Default **mega** set: **32 stocks** (sectors), **4 index-style funds** (T16, T25, C3, S10 baskets), **8 cryptos** (tiered vol by market cap; first coin capped at **21M** units).

## Overrides

- **Volatility** — scales effective σ (stocks, funds, crypto).
- **Trend** — biases drift for all names.

Headlines may appear in the news strip and briefly lift volatility.

## Orders & liquidity

- **Market buys** walk the **ask** book (size or USD notional).
- **Market sells** walk the **bid** book; **hard/complex** allow shorting beyond your position when enabled in config.
- If the book is empty on your side, you get **not enough resting liquidity** (same idea as `NO_LIQUIDITY` in the Python sim).

## Local development

Static files only — any static server works:

```bash
cd marketsim
python -m http.server 8080
# open http://127.0.0.1:8080/
```

Or serve from the repo root and visit `/marketsim/`.

## Files

| Path | Role |
|------|------|
| `index.html` | Layout + script tags |
| `css/style.css` | Terminal-style theme |
| `js/engine.js` | Session, reset, step |
| `js/market.js` | GBM step, funds, news, GD |
| `js/clob.js` | Order book + NPC liquidity |
| `js/app.js` | UI wiring |

## Python version

For the full terminal UI, headless batches, and API-driven workflows, use the Python package:

```bash
pip install -e .
python -m marketsim --web
```

This web folder is meant for **GitHub Pages** hosting alongside [surrplexie.github.io](https://surrplexie.github.io).
