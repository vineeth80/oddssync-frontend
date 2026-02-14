# Frontend–Backend Integration Summary

This document records alignment between the OddsSync frontend and backend so both stay in sync.

## API: GET /markets

| Frontend sends     | Backend accepts / behavior |
|--------------------|----------------------------|
| `sort`             | `roi` (default), `spread`, `volume`, `close_date`, `kalshi`, `poly` |
| `order`            | `asc`, `desc` (default: `desc`) |
| `limit`            | 1–200 (default 50; frontend uses 100) |
| `arbs_only`        | `true` to filter to markets with arb |
| `search`           | Substring match on market title |

## Response shape

- `markets`: array of `MatchedMarketOut`
- `meta`: `{ total, arb_count, last_refresh }`

Market fields used by the UI: `id`, `title`, `category`, `kalshi.yes_price`, `kalshi.no_price`, `kalshi.volume_24h`, `poly.yes_price`, `poly.no_price`, `spread`, `arb` (optional: `strategy`, `cost_per_contract`, `fee_per_contract`, `profit_per_contract`, `roi_pct`), `liquidity.min_depth`, `close_date`.

## Fee constants (must match)

- **Kalshi**: 2% (`0.02`) — backend `services/arb_calculator.py`, frontend `App.jsx`
- **Polymarket**: 1% (`0.01`) — same files

## Changes made in this pass

1. **Backend** (`routers/markets.py`): Default `sort` set to `roi`; added sort options `kalshi` and `poly` (by Kalshi YES price and Poly YES price).
2. **Frontend** (`App.jsx`): Safe access for `market.kalshi` / `market.poly` in `ArbDetail`; `API_BASE_URL` fix (was `API_BASE`) already applied earlier.
3. **Frontend**: `.env.example`, README dev/API section, `index.html` title set to “OddsSync”.

## Running

- **Backend**: From backend repo, `uvicorn main:app --reload` (or `python main.py`). Uses port 8000 and CORS `*`.
- **Frontend**: `VITE_API_URL` in `.env` if API is not at `http://localhost:8000`; then `npm run dev`.
