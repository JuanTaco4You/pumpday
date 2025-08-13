# PumpDay — Realtime Pump.fun Scout & Research Dashboard

PumpDay is a lean, batteries-included **day‑trading research** tool for Pump.fun coins.  
It streams live events, tracks short‑horizon order flow, computes a **risk‑adjusted momentum score**, and serves a simple dashboard + JSON API you can script against.

> **Disclaimer:** This project is for **research and education**. It does not predict profits, and it cannot prevent losses. Crypto is volatile; rugs and soft-rugs happen. Use at your own risk.

---

## Features

- **Live stream** of Pump.fun new tokens, trades, and migrations via PumpPortal WebSocket.
- Rolling **60s / 300s** windows for buy/sell counts, SOL volume, unique buyers, and short-term price drift.
- A composite **score** that ranks tokens by risk‑adjusted momentum (self‑normalizing with z‑scores).
- Tiny **HTML dashboard** and **REST API** for automation.
- **Zero keys required** for bonding‑curve data; optional keys for enrichment after migration.

---

## Quick Start

Prereqs: **Node.js 20+** (includes npm).

```bash
git clone https://github.com/<you>/<repo>.git
cd <repo>
npm i
npm run dev
# open http://localhost:8787
```

Production-ish:
```bash
npm start
```

### Optional environment

Create `.env` (or copy from `.env.example`):

```
PUMPPORTAL_API_KEY=   # needed only for paid PumpSwap trade streams
BIRDEYE_API_KEY=      # optional: enrich migrated tokens with OHLCV later
PORT=8787
```

---

## How It Works

**Data source:** a single WebSocket to `wss://pumpportal.fun/api/data` (or `?api-key=...`).  
On connect, the server subscribes to:

- `newToken` — a Pump.fun launch on the bonding curve
- `trade` — live buys/sells (curve; PumpSwap if you use an API key)
- `migration` — token moves from bonding curve to AMM (PumpSwap)

The app maintains rolling metrics per token and rescors every second.

### Scoring (default)

Let:
- `buyImbalance` = (buy SOL − sell SOL) / (buy SOL + sell SOL) over **60s**
- `buysPerMin` = buys in the last **60s**
- `uniqueBuyers` = distinct buyer accounts in **60s**
- `momentum5m` = price drift over **300s** (from payload price or SOL/token estimate)
- `bonus_if_recently_migrated` = 0.05 if token migrated recently

Then:
```
score = 0.35·z(buyImbalance)
      + 0.30·z(buysPerMin)
      + 0.20·z(uniqueBuyers)
      + 0.10·z(momentum5m)
      + 0.05·bonus_if_recently_migrated
```
> All components are **z‑scored** across the current live universe so the score adapts as conditions change.

You can tweak the weights in `src/scorer.ts`.

---

## REST API

Base URL: `http://localhost:8787`

- `GET /tokens/top?limit=50` — ranked list (default 50, max 200)
- `GET /tokens` — full ranked list
- `GET /tokens/:mint` — details for a single token (rolling windows + recent trades)

**Example** (`/tokens/top?limit=2`):
```json
[
  {
    "mint": "F5...9q",
    "symbol": "MEME",
    "createdAt": 1723555900,
    "score": 2.41,
    "rolling60": {
      "buys": 28,
      "sells": 4,
      "volBuySol": 37.2,
      "volSellSol": 3.1,
      "uniqueBuyers": ["..."],
      "uniqueSellers": ["..."],
      "prices": [0.0000005, 0.00000062, ...]
    },
    "rolling300": { "...": "..." }
  },
  {
    "mint": "9J...3a",
    "symbol": "DOG",
    "score": 1.87,
    "...": "..."
  }
]
```

---

## Project Structure

```
/src
  index.ts         # Express server, routes, static dashboard
  pumpportal.ts    # WebSocket client, subscriptions & routing
  tokenbook.ts     # In-memory store, rolling windows, trade handling
  scorer.ts        # Feature extraction + composite scoring
/public
  index.html       # Minimal live dashboard
```

---

## Development

Run with hot‑reload:
```bash
npm run dev
```

Type-check only:
```bash
npm run typecheck
```

### Common Issues

- **Blank dashboard**: allow ~30–60s for first events; ensure outbound WebSockets aren’t blocked.
- **Port already in use**: set `PORT=8080` (PowerShell: `set PORT=8080; npm run dev`).
- **Module not found (tsx/typescript)**: run `npm i` in the project root.

### Keep It Running (optional)

**PM2 (Linux/macOS):**
```bash
npm i -g pm2
pm2 start "npm -- start" --name pumpday
pm2 save && pm2 startup
```

---

## Extending the Platform

- **DEX Screener / Birdeye enrichment** after migration (liquidity, FDV, price change, candles).
- **Paper trader** with a realistic fill model (fees + slippage) and PnL reporting.
- **Strategy modules** (plug‑in interface) with backtests over captured streams.
- **Execution (advanced)** via Jupiter Swap API from a separate, locked‑down process.
- **Risk filters**: creator heuristics, early whale concentration, time‑to‑N unique buyers, etc.

---

## Security & Risk Notes

- This repo **does not** custody keys by default. If you wire execution, isolate keys, rate‑limit orders, and bake in circuit breakers.
- Pump.fun ecosystems are high‑velocity and **risky**. Rugs and contract shenanigans occur. Never trade more than you can afford to lose.

---

## Contributing

Issues and PRs are welcome. Keep changes small and focused. Add tests (or at least reproducible steps).

---

## License

MIT — see `LICENSE` (or replace with your preferred license).
