import React, { useState, useMemo, useEffect } from "react";

const CATEGORIES = ["All", "Politics", "Crypto", "Economics", "Sports", "Culture", "Climate"];
const KALSHI_FEE = 0.02;
const POLY_FEE = 0.01;

// Production Railway domains (must match deployment)
const PRODUCTION_FRONTEND_HOST = "oddssync-frontend-production.up.railway.app";
const PRODUCTION_BACKEND_URL = "https://oddssync-backend-production.up.railway.app";

/** Resolve API base URL: env at build time, or production backend when on Railway frontend, else localhost. No trailing slash. */
function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).trim().replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location?.hostname === PRODUCTION_FRONTEND_HOST) {
    return PRODUCTION_BACKEND_URL;
  }
  return "http://localhost:8000";
}

function ArbDetail({ market }) {
  const [capital, setCapital] = useState(1000);
  const arb = market.arb;
  
  if (!arb) {
    return (
      <div style={{ background: "#0c1220", padding: 20, borderTop: "1px solid #1e293b" }}>
        <div style={{ color: "#64748b", fontSize: 13, textAlign: "center" }}>
          No arbitrage opportunity — combined cost exceeds $1 payout after fees.
        </div>
      </div>
    );
  }

  const contracts = Math.floor(capital / arb.cost_per_contract);
  const totalProfit = contracts * arb.profit_per_contract;
  const totalFees = contracts * arb.fee_per_contract;
  
  // Calculate days to close
  const daysToClose = market.close_date 
    ? Math.max(1, Math.ceil((new Date(market.close_date) - new Date()) / (1000 * 60 * 60 * 24)))
    : 30;
  
  // Annualized ROI
  const annualizedRoi = ((arb.roi_pct / 100) * (365 / daysToClose) * 100).toFixed(1);

  const isKalshiYes = arb.strategy === "YES_KALSHI_NO_POLY";
  const leg1 = isKalshiYes
    ? { platform: "Kalshi", side: "YES", price: market.kalshi?.yes_price ?? 0 }
    : { platform: "Polymarket", side: "YES", price: market.poly?.yes_price ?? 0 };
  const leg2 = isKalshiYes
    ? { platform: "Polymarket", side: "NO", price: market.poly?.no_price ?? 0 }
    : { platform: "Kalshi", side: "NO", price: market.kalshi?.no_price ?? 0 };

  const minDepth = market.liquidity?.min_depth || 0;

  return (
    <div style={{ background: "#0c1220", padding: 20, borderTop: "1px solid #1e293b" }}>
      {/* Capital Simulator */}
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>Deploy Capital:</span>
        {[100, 500, 1000, 5000, 10000].map(amt => (
          <button
            key={amt}
            onClick={() => setCapital(amt)}
            style={{
              padding: "4px 10px", borderRadius: 4, border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 600,
              background: capital === amt ? "#3b82f6" : "#1e293b",
              color: capital === amt ? "#fff" : "#94a3b8"
            }}
          >
            ${amt >= 1000 ? `${amt/1000}K` : amt}
          </button>
        ))}
        <input
          type="number"
          value={capital}
          onChange={e => setCapital(Math.max(0, Number(e.target.value)))}
          style={{
            width: 80, padding: "4px 8px", borderRadius: 4, border: "1px solid #334155",
            background: "#0f172a", color: "#e2e8f0", fontSize: 12, textAlign: "right"
          }}
        />
      </div>

      {/* Trade Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
        <div style={{ background: "#111827", borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 10, color: "#64748b", marginBottom: 6, textTransform: "uppercase" }}>Leg 1</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#22c55e" }}>
            Buy {leg1.side} on {leg1.platform}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>@ {leg1.price}¢</div>
        </div>
        <div style={{ background: "#111827", borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 10, color: "#64748b", marginBottom: 6, textTransform: "uppercase" }}>Leg 2</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b" }}>
            Buy {leg2.side} on {leg2.platform}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>@ {leg2.price}¢</div>
        </div>
        <div style={{ background: "#111827", borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 10, color: "#64748b", marginBottom: 6, textTransform: "uppercase" }}>Per Contract</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            Cost: ${arb.cost_per_contract.toFixed(4)} | Fees: ${arb.fee_per_contract.toFixed(4)}
          </div>
          <div style={{ fontSize: 12, color: "#22c55e", marginTop: 2 }}>
            Profit: ${arb.profit_per_contract.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Returns Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}>
        <div style={{ background: "#111827", borderRadius: 6, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>CONTRACTS</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0" }}>{contracts.toLocaleString()}</div>
        </div>
        <div style={{ background: "#111827", borderRadius: 6, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>TOTAL FEES</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f59e0b" }}>${totalFees.toFixed(2)}</div>
        </div>
        <div style={{ background: "#111827", borderRadius: 6, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>DAYS TO CLOSE</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#94a3b8" }}>{daysToClose}</div>
        </div>
        <div style={{ background: "#111827", borderRadius: 6, padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>ANNUALIZED ROI</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: parseFloat(annualizedRoi) > 50 ? "#22c55e" : "#3b82f6" }}>
            {annualizedRoi}%
          </div>
        </div>
      </div>

      {/* Profit Box */}
      <div style={{
        background: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
        borderRadius: 8, padding: 16, textAlign: "center", border: "1px solid #10b981"
      }}>
        <div style={{ fontSize: 11, color: "#6ee7b7", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Guaranteed Profit
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#ecfdf5" }}>
          ${totalProfit.toFixed(2)}
        </div>
        <div style={{ fontSize: 11, color: "#6ee7b7", marginTop: 4 }}>
          {arb.roi_pct.toFixed(2)}% ROI on ${capital.toLocaleString()} deployed
        </div>
        {minDepth > 0 && (
          <div style={{ fontSize: 10, color: "#a7f3d0", marginTop: 8 }}>
            Max fillable: ~${minDepth.toLocaleString()} based on order book depth
          </div>
        )}
      </div>
    </div>
  );
}

export default function OddsSyncDashboard() {
  const [markets, setMarkets] = useState([]);
  const [meta, setMeta] = useState({ total: 0, arb_count: 0, last_refresh: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("All");
  const [arbsOnly, setArbsOnly] = useState(false);
  const [sortBy, setSortBy] = useState("roi");
  const [sortDir, setSortDir] = useState("desc");
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data from backend (guards against backend returning HTML → "Unexpected token '<'").
  const fetchMarkets = async () => {
    const apiBase = getApiBaseUrl();
    const url = `${apiBase}/markets`;
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sort: sortBy,
        order: sortDir,
        limit: "100"
      });
      if (arbsOnly) params.append("arbs_only", "true");
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`${url}?${params}`);
      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await res.text();
        const isHtml = text.trim().toLowerCase().startsWith("<!");
        if (isHtml) {
          throw new Error(
            "Backend returned HTML instead of JSON. The API URL may point to the wrong service (e.g. frontend or error page). Check that the backend is running and reachable."
          );
        }
        throw new Error(`API returned unexpected content (${res.status}). Expected JSON.`);
      }

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setMarkets(data.markets || []);
      setMeta(data.meta || { total: 0, arb_count: 0 });
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, [sortBy, sortDir, arbsOnly, searchQuery]);

  // Filter by category client-side
  const filtered = useMemo(() => {
    if (category === "All") return markets;
    return markets.filter(m => (m.category || "").toLowerCase().includes(category.toLowerCase()));
  }, [markets, category]);

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(d => d === "desc" ? "asc" : "desc");
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  // Stats
  const arbCount = filtered.filter(m => m.arb).length;
  const avgSpread = filtered.length > 0 
    ? (filtered.reduce((s, m) => s + (m.spread || 0), 0) / filtered.length).toFixed(1) 
    : 0;
  const bestRoi = Math.max(0, ...filtered.map(m => m.arb?.roi_pct || 0));

  const hs = {
    padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700,
    color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em",
    cursor: "pointer", userSelect: "none", borderBottom: "1px solid #1e293b", whiteSpace: "nowrap"
  };
  const cs = { padding: "10px 12px", borderBottom: "1px solid #111827", verticalAlign: "middle" };

  const SortLabel = ({ col, children }) => (
    <th style={{ ...hs, textAlign: "center" }} onClick={() => handleSort(col)}>
      {children} {sortBy === col && <span style={{ fontSize: 9 }}>{sortDir === "desc" ? "▼" : "▲"}</span>}
    </th>
  );

  const getLiquidityLabel = (depth) => {
    if (depth >= 50000) return { text: "Deep", color: "#22c55e" };
    if (depth >= 20000) return { text: "Good", color: "#3b82f6" };
    if (depth >= 5000) return { text: "Fair", color: "#f59e0b" };
    return { text: "Thin", color: "#ef4444" };
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080c14", color: "#e2e8f0", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1a1145 100%)", borderBottom: "1px solid #1e293b", padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 17, color: "#fff" }}>O</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>OddsSync</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>
                {loading ? "Refreshing..." : error ? "Connection error" : "Live data"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[
              { value: meta.total || filtered.length, label: "Markets", color: "#6366f1" },
              { value: meta.arb_count || arbCount, label: "Live Arbs", color: "#22c55e" },
              { value: `${avgSpread}%`, label: "Avg Spread", color: "#f59e0b" },
              { value: `${bestRoi.toFixed(1)}%`, label: "Best ROI", color: "#22c55e" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", minWidth: 50 }}>
                <div style={{ fontSize: 19, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
                <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: "10px 20px", borderBottom: "1px solid #1e293b", background: "#0a0f1a", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{
            padding: "4px 12px", borderRadius: 5, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
            background: category === c ? "linear-gradient(135deg, #6366f1, #3b82f6)" : "#1e293b",
            color: category === c ? "#fff" : "#94a3b8"
          }}>
            {c}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <input
          type="text"
          placeholder="Search markets..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            padding: "5px 12px", borderRadius: 5, border: "1px solid #334155",
            background: "#0f172a", color: "#e2e8f0", fontSize: 11, width: 180
          }}
        />
        <button
          onClick={() => setArbsOnly(!arbsOnly)}
          style={{
            padding: "4px 12px", borderRadius: 5, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
            background: arbsOnly ? "#22c55e" : "#1e293b",
            color: arbsOnly ? "#fff" : "#94a3b8"
          }}
        >
          Arbs Only
        </button>
        <button
          onClick={fetchMarkets}
          disabled={loading}
          style={{
            padding: "4px 12px", borderRadius: 5, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
            background: "#3b82f6", color: "#fff", opacity: loading ? 0.5 : 1
          }}
        >
          {loading ? "..." : "⟳"}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ padding: "10px 20px", background: "#7f1d1d", color: "#fecaca", fontSize: 12 }}>
          ⚠️ {error} — Backend: <code style={{ fontSize: 11 }}>{getApiBaseUrl()}</code>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#0a0f1a" }}>
              <th style={{ ...hs, textAlign: "left", minWidth: 200 }}>Market</th>
              <SortLabel col="kalshi">Kalshi</SortLabel>
              <SortLabel col="poly">Poly</SortLabel>
              <SortLabel col="spread">Spread</SortLabel>
              <SortLabel col="roi">ROI</SortLabel>
              <SortLabel col="volume">Volume</SortLabel>
              <th style={{ ...hs, textAlign: "center" }}>Liquidity</th>
              <SortLabel col="close_date">Closes</SortLabel>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const isExpanded = expandedId === m.id;
              const arb = m.arb;
              const liq = getLiquidityLabel(m.liquidity?.min_depth || 0);
              const daysToClose = m.close_date 
                ? Math.max(0, Math.ceil((new Date(m.close_date) - new Date()) / (1000 * 60 * 60 * 24)))
                : null;

              return (
                <React.Fragment key={m.id}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : m.id)}
                    style={{
                      cursor: "pointer", background: isExpanded ? "#111827" : "transparent",
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#111827"}
                    onMouseLeave={e => e.currentTarget.style.background = isExpanded ? "#111827" : "transparent"}
                  >
                    <td style={{ ...cs, fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {arb && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />}
                        <span>{m.title}</span>
                        {daysToClose !== null && daysToClose <= 3 && (
                          <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: "#7c3aed", color: "#fff" }}>
                            CLOSING SOON
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{m.category}</div>
                    </td>
                    <td style={{ ...cs, textAlign: "center" }}>
                      <span style={{ fontWeight: 700, color: "#e2e8f0" }}>{m.kalshi?.yes_price || 0}¢</span>
                    </td>
                    <td style={{ ...cs, textAlign: "center" }}>
                      <span style={{ fontWeight: 700, color: "#e2e8f0" }}>{m.poly?.yes_price || 0}¢</span>
                    </td>
                    <td style={{ ...cs, textAlign: "center" }}>
                      <span style={{ fontWeight: 700, color: m.spread > 5 ? "#f59e0b" : "#94a3b8" }}>
                        {(m.spread || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ ...cs, textAlign: "center" }}>
                      {arb ? (
                        <span style={{ fontWeight: 800, color: "#22c55e" }}>{arb.roi_pct.toFixed(2)}%</span>
                      ) : (
                        <span style={{ color: "#4b5563" }}>—</span>
                      )}
                    </td>
                    <td style={{ ...cs, textAlign: "center", fontSize: 11, color: "#94a3b8" }}>
                      ${((m.kalshi?.volume_24h || 0) / 1000000).toFixed(1)}M
                    </td>
                    <td style={{ ...cs, textAlign: "center" }}>
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: liq.color + "22", color: liq.color }}>
                        {liq.text}
                      </span>
                    </td>
                    <td style={{ ...cs, textAlign: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: daysToClose !== null && daysToClose <= 7 ? "#f59e0b" : "#94a3b8" }}>
                        {daysToClose !== null ? `${daysToClose}d` : "—"}
                      </span>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr><td colSpan={8} style={{ padding: 0 }}><ArbDetail market={m} /></td></tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 32, color: "#4b5563", fontSize: 13 }}>
            {error ? "Cannot connect to backend" : "No markets match your filters."}
          </div>
        )}
        {loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 32, color: "#64748b", fontSize: 13 }}>
            Loading markets...
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 20px", borderTop: "1px solid #1e293b", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#374151" }}>
        <span>Kalshi fee: {KALSHI_FEE * 100}% | Poly fee: {POLY_FEE * 100}% | Last refresh: {meta.last_refresh || "—"}</span>
        <span>{filtered.length} markets | {arbCount} arb opportunities</span>
      </div>
    </div>
  );
}
