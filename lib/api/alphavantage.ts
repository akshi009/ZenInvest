/** Alpha Vantage API — pre-computed technical indicators */

const BASE = "https://www.alphavantage.co/query";
const KEY = () => process.env.ALPHA_VANTAGE_KEY!;

interface AVIndicator {
  date: string;
  value: number;
}

async function avFetch(params: Record<string, string>): Promise<unknown> {
  const qs = new URLSearchParams({ ...params, apikey: KEY() }).toString();
  try {
    const res = await fetch(`${BASE}?${qs}`, { next: { revalidate: 0 } });
    if (!res.ok) {
      console.error(`AlphaVantage error ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error("AlphaVantage fetch failed:", e);
    return null;
  }
}

export interface Technicals {
  rsi: number;         // 14-day RSI
  sma200: number;      // 200-day SMA
  currentPrice: number;
  trend: "above" | "below"; // vs 200-day SMA
  volumeTrend: "rising" | "falling" | "flat";
}

/** Get RSI (14-day) for a symbol */
export async function getRSI(symbol: string): Promise<number | null> {
  const data = await avFetch({
    function: "RSI",
    symbol,
    interval: "daily",
    time_period: "14",
    series_type: "close",
  }) as Record<string, Record<string, Record<string, string>>> | null;

  if (!data) return null;
  const key = "Technical Analysis: RSI";
  const series = data[key];
  if (!series) return null;
  const latest = Object.values(series)[0];
  return latest ? parseFloat(latest.RSI) : null;
}

/** Get SMA (200-day) for a symbol */
export async function getSMA200(symbol: string): Promise<number | null> {
  const data = await avFetch({
    function: "SMA",
    symbol,
    interval: "daily",
    time_period: "200",
    series_type: "close",
  }) as Record<string, Record<string, Record<string, string>>> | null;

  if (!data) return null;
  const key = "Technical Analysis: SMA";
  const series = data[key];
  if (!series) return null;
  const latest = Object.values(series)[0];
  return latest ? parseFloat(latest.SMA) : null;
}

/** Combined technicals — RSI + SMA200 trend.
 *  Uses 2 AV calls so use sparingly (25/day free limit). */
export async function getTechnicals(
  symbol: string,
  currentPrice: number
): Promise<Technicals> {
  const [rsi, sma200] = await Promise.all([
    getRSI(symbol),
    getSMA200(symbol),
  ]);

  return {
    rsi: rsi ?? 50,
    sma200: sma200 ?? currentPrice,
    currentPrice,
    trend: sma200 && currentPrice > sma200 ? "above" : "below",
    volumeTrend: "flat", // AV free tier doesn't give volume trend easily
  };
}
