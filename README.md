# OddsSync Frontend

React + Vite dashboard for OddsSync: Kalshi/Polymarket arbitrage opportunities.

## Development

1. **Backend**: Run the OddsSync API (e.g. `uvicorn main:app --reload`) on port 8000.
2. **Env**: Copy `.env.example` to `.env` and set `VITE_API_URL` if the API is not at `http://localhost:8000`.
3. **Frontend**: `npm install` then `npm run dev`.

## API contract (backend)

- **GET /markets** — Query: `sort` (roi | spread | volume | close_date | kalshi | poly), `order` (asc | desc), `limit` (1–200), `arbs_only` (true), `search` (title).
- **Response**: `{ markets: MatchedMarket[], meta: { total, arb_count, last_refresh } }`.
- **Market**: `id`, `title`, `category`, `kalshi` (yes_price, no_price, volume_24h), `poly` (yes_price, no_price, volume_24h), `spread`, `arb?` (strategy, cost_per_contract, fee_per_contract, profit_per_contract, roi_pct), `liquidity` (min_depth), `close_date`.

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
