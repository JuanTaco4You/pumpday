# PumpDay — Pump.fun day-trading research dashboard (MVP)

**What it is:** a tiny Node/TypeScript server that listens to the PumpPortal WebSocket,
tracks brand-new Pump.fun coins and live trades, scores them with a simple *risk‑adjusted momentum* metric,
and serves a barebones HTML dashboard plus JSON endpoints.

> ⚠️ This is **researchware**, not financial advice. No keys required. No auto-trading by default.

---

## Quick start

```bash
# 1) prerequisites: Node 20+
# 2) install
npm i
# 3) run (dev mode with tsx)
npm run dev
# open the local dashboard
# -> http://localhost:8787
```

Environment variables (optional):

- `PUMPPORTAL_API_KEY` — only needed if you want paid PumpSwap trade streams (not required for bonding-curve data).
- `BIRDEYE_API_KEY` — optional; enrich migrated tokens with OHLCV from Birdeye.
- `PORT` — default 8787.

## What it does

- One **WebSocket** to `wss://pumpportal.fun/api/data` (or `?api-key=...` if provided)
- Subscribes to **new token** + **migration** events; auto-subscribes to **trades** for watched tokens
- Maintains rolling 60s/300s windows of:
  - buy/sell counts & SOL volume
  - unique buyers
  - price deltas (if present in payload) else estimates from trade price/amount
- **Scores** tokens every second with a composite metric:
  ```
  score = z(buyImbalance) * 0.35
        + z(buysPerMin)   * 0.30
        + z(uniqueBuyers) * 0.20
        + z(momentum5m)   * 0.10
        + bonus_if_migratingsoon (0.05)
  ```
- Exposes:
  - `GET /tokens` — full list, sorted by score
  - `GET /tokens/top?limit=20` — top N
  - `GET /tokens/:mint` — details + recent trades
  - Dashboard at `/`

## Extend it

- Plug **Dexscreener** or **Birdeye** to enrich *migrated* tokens with liquidity/FDV.
- Add a **paper trader** that simulates fills with simple slippage/fee model.
- Add strategy modules and backtests.
- For execution (at your own risk), wire **Jupiter Swap API** to place orders from a hot wallet running *off this box*.

---

## Legal & risk

This code is for **education/research**. It does **not** guarantee profits, it **will** miss rugs, and it can break
if upstream APIs change. You are responsible for any losses. Trade small, breathe often.
