/** Financial Modeling Prep API (stable endpoints) — fundamentals + search + movers */

import { NseIndia } from "stock-nse-india";

const BASE = "https://financialmodelingprep.com/stable";
const KEY = () => process.env.FMP_API_KEY!;
const nseClient = new NseIndia();

async function fmpFetch<T>(path: string): Promise<T | null> {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${BASE}${path}${sep}apikey=${KEY()}`;
  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) {
      console.error(`FMP error ${res.status}: ${path}`);
      return null;
    }
    const json = await res.json();
    // FMP returns a plain-text "Premium Query Parameter" message (not an array)
    // for endpoints not covered by the free plan for a given symbol.
    if (!Array.isArray(json)) {
      console.error(`FMP not available for ${path}:`, json);
      return null;
    }
    return json as T;
  } catch (e) {
    console.error("FMP fetch failed:", e);
    return null;
  }
}

// ---- Types matching FMP stable response shapes ----

export interface FMPProfile {
  symbol: string;
  companyName: string;
  currency: string;
  price: number;
  change: number;
  changePercentage: number;
  marketCap: number;
  range: string;
  sector: string;
  industry: string;
  country: string;
  exchange: string;
  exchangeFullName: string;
  description: string;
  fullTimeEmployees: string;
  ipoDate: string;
  website: string;
  image: string;
}

export interface FMPRatios {
  priceToEarningsRatioTTM: number;
  priceToBookRatioTTM: number;
  debtToEquityRatioTTM: number;
  dividendYieldTTM: number;
}

export interface FMPKeyMetrics {
  returnOnEquityTTM: number;
}

export interface FMPIncomeGrowth {
  date: string;
  growthRevenue: number;
}

export interface FMPQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  volume: number;
  avgVolume: number;
  exchange: string;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  sector?: string;
}

export interface FMPSearchResult {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
}

// ---- API calls ----

export async function searchFMP(query: string): Promise<FMPSearchResult[]> {
  const [bySymbol, byName] = await Promise.all([
    fmpFetch<any[]>(`/search-symbol?query=${encodeURIComponent(query)}`),
    fmpFetch<any[]>(`/search-name?query=${encodeURIComponent(query)}`),
  ]);

  const merged = [...(bySymbol ?? []), ...(byName ?? [])];
  const seen = new Set<string>();
  const deduped = merged.filter((r) => {
    if (seen.has(r.symbol)) return false;
    seen.add(r.symbol);
    return true;
  });

  return deduped.slice(0, 10).map((r) => ({
    symbol: r.symbol,
    name: r.name,
    currency: r.currency,
    stockExchange: r.exchangeFullName ?? r.exchange,
    exchangeShortName: r.exchange,
  }));
}

export async function getProfile(symbol: string): Promise<FMPProfile | null> {
  const data = await fmpFetch<FMPProfile[]>(`/profile?symbol=${encodeURIComponent(symbol)}`);
  return data?.[0] ?? null;
}

/** Profile already carries live price + change%, so quote is profile-derived. */
export async function getQuote(symbol: string): Promise<FMPQuote | null> {
  const p = await getProfile(symbol);
  if (!p) return null;
  return {
    symbol: p.symbol,
    name: p.companyName,
    price: p.price,
    changesPercentage: p.changePercentage,
    change: p.change,
    dayLow: 0,
    dayHigh: 0,
    yearHigh: 0,
    yearLow: 0,
    marketCap: p.marketCap,
    volume: 0,
    avgVolume: 0,
    exchange: p.exchange,
    open: 0,
    previousClose: p.price - p.change,
    eps: 0,
    pe: 0,
    sector: p.sector,
  };
}

export async function getRatios(symbol: string): Promise<FMPRatios | null> {
  const data = await fmpFetch<FMPRatios[]>(`/ratios-ttm?symbol=${encodeURIComponent(symbol)}`);
  return data?.[0] ?? null;
}

export async function getKeyMetrics(symbol: string): Promise<FMPKeyMetrics | null> {
  const data = await fmpFetch<FMPKeyMetrics[]>(`/key-metrics-ttm?symbol=${encodeURIComponent(symbol)}`);
  return data?.[0] ?? null;
}

export async function getIncomeGrowth(symbol: string): Promise<FMPIncomeGrowth[]> {
  const data = await fmpFetch<FMPIncomeGrowth[]>(
    `/income-statement-growth?symbol=${encodeURIComponent(symbol)}&limit=1`
  );
  return data ?? [];
}

export async function getTopGainers(): Promise<FMPQuote[]> {
  const data = await fmpFetch<any[]>("/biggest-gainers");

  if (data && data.length > 0) {
    // Free-tier gainers lists include illiquid penny-stock noise; keep it sane.
    const clean = data.filter((d) => d.price > 2 && d.changesPercentage < 100);
    if (clean.length > 0) {
      return clean.slice(0, 8).map((d) => ({
        symbol: d.symbol,
        name: d.name,
        price: d.price,
        changesPercentage: d.changesPercentage,
        change: d.change,
        dayLow: 0,
        dayHigh: 0,
        yearHigh: 0,
        yearLow: 0,
        marketCap: 0,
        volume: 0,
        avgVolume: 0,
        exchange: d.exchange,
        open: 0,
        previousClose: d.price - d.change,
        eps: 0,
        pe: 0,
      }));
    }
  }

  // Fallback: real NSE pre-open market movers
  try {
    const preOpen = await nseClient.getPreOpenMarketData("equity");
    if (preOpen?.data && Array.isArray(preOpen.data)) {
      return preOpen.data.slice(0, 8).map((item: any) => {
        const meta = item.metadata || {};
        return {
          symbol: meta.symbol || "",
          name: meta.symbol || "",
          price: meta.lastPrice || 0,
          changesPercentage: meta.pChange || 0,
          change: meta.change || 0,
          dayLow: 0,
          dayHigh: 0,
          yearHigh: meta.yearHigh || 0,
          yearLow: meta.yearLow || 0,
          marketCap: 0,
          volume: meta.finalQuantity || 0,
          avgVolume: 0,
          exchange: "NSE",
          open: 0,
          previousClose: meta.previousClose || 0,
          eps: 0,
          pe: 0,
          sector: "Equity",
        };
      });
    }
  } catch (e) {
    console.error("NSE fallback error:", e);
  }

  return [];
}

export async function getSectorPE(sector: string): Promise<number> {
  // FMP doesn't have a free endpoint for sector average PE,
  // so we approximate with known values
  const defaults: Record<string, number> = {
    "Technology": 31.5,
    "Financial Services": 16.4,
    "Consumer Cyclical": 24.6,
    "Healthcare": 36.2,
    "Energy": 22.1,
    "Communication Services": 20.5,
    "Industrials": 23.8,
    "Basic Materials": 18.9,
  };
  return defaults[sector] ?? 22.0;
}
