/**
 * Market pool — a curated universe of real, well-known companies per market,
 * enriched with LIVE prices from the FMP stable profile endpoint. Used by the
 * budget picker so the user browses affordable stocks ranked best-to-worst.
 *
 * Symbols are chosen for a wide price spread so budget filtering is meaningful
 * (a ₹5,000 budget should rule some names in and others out).
 */

import { getProfile } from "@/lib/api/fmp";

export type MarketId = "india" | "us";

export interface PoolStock {
  symbol: string;        // exchange-suffixed symbol used for /company/[symbol]
  name: string;
  sector: string;        // granular industry, shown in the UI
  group: string;         // broad sector (Technology, Financial Services…) for matching
  currency: "₹" | "$";
  price: number;
  changePct: number;     // real daily move — the "market trend" signal
  marketCap: number;
  /** 0–10 momentum/trend score derived from live data (see scoreOf) */
  score: number;
}

const UNIVERSE: Record<MarketId, string[]> = {
  india: [
    "TATASTEEL.NS", "ITC.NS", "WIPRO.NS", "SBIN.NS", "TATAMOTORS.NS",
    "TATACHEM.NS", "RELIANCE.NS", "INFY.NS", "HDFCBANK.NS", "SUNPHARMA.NS",
    "TCS.NS", "ASIANPAINT.NS", "ICICIBANK.NS", "LT.NS", "HINDUNILVR.NS",
  ],
  us: [
    "F", "T", "INTC", "PFE", "KO", "CSCO",
    "NKE", "BAC", "DIS", "MU", "PYPL", "AAPL",
    "XOM", "WMT", "MSFT",
  ],
};

const CURRENCY: Record<MarketId, "₹" | "$"> = { india: "₹", us: "$" };

/** Lightweight 0–10 score from live data: daily momentum + position within
 *  the 52-week range (near highs = stronger uptrend). Fully derived from the
 *  real profile response — no fabricated fundamentals. */
function scoreOf(price: number, changePct: number, range?: string): number {
  let score = 5;
  score += Math.max(-2.5, Math.min(2.5, changePct * 0.35));

  if (range && range.includes("-")) {
    const [low, high] = range.split("-").map((n) => parseFloat(n));
    if (isFinite(low) && isFinite(high) && high > low) {
      const pos = (price - low) / (high - low); // 0 at 52w low, 1 at 52w high
      score += (pos - 0.5) * 4;
    }
  }
  return Math.max(0, Math.min(10, Math.round(score * 10) / 10));
}

export async function getMarketPool(market: MarketId): Promise<PoolStock[]> {
  const symbols = UNIVERSE[market] ?? [];
  const currency = CURRENCY[market];

  const profiles = await Promise.all(symbols.map((s) => getProfile(s)));

  const stocks: PoolStock[] = [];
  for (const p of profiles) {
    if (!p || !p.price) continue;
    stocks.push({
      symbol: p.symbol,
      name: p.companyName,
      sector: p.industry || p.sector || "—",
      group: p.sector || "Other",
      currency,
      price: p.price,
      changePct: p.changePercentage ?? 0,
      marketCap: p.marketCap ?? 0,
      score: scoreOf(p.price, p.changePercentage ?? 0, p.range),
    });
  }

  // Best → worst by score, then by daily momentum as a tiebreak.
  stocks.sort((a, b) => b.score - a.score || b.changePct - a.changePct);
  return stocks;
}
