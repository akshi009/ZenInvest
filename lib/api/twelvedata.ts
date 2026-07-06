/** Twelve Data API — price/chart data for all time periods */

const BASE = "https://api.twelvedata.com";
const KEY = () => process.env.TWELVE_DATA_KEY!;

interface TDTimeSeries {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

interface TDResponse {
  meta?: { symbol: string; interval: string };
  values?: TDTimeSeries[];
  status?: string;
  message?: string;
}

const PERIOD_CONFIG: Record<
  string,
  { interval: string; outputsize: number }
> = {
  "1D": { interval: "5min", outputsize: 78 },      // 5-min bars, ~6.5 hrs
  "5D": { interval: "30min", outputsize: 65 },      // 30-min bars, 5 days
  "1M": { interval: "1day", outputsize: 22 },       // daily, ~1 month
  "6M": { interval: "1day", outputsize: 130 },      // daily, ~6 months
  "1Y": { interval: "1day", outputsize: 252 },      // daily, ~1 year
  "5Y": { interval: "1week", outputsize: 260 },     // weekly, ~5 years
};

export interface PricePoint {
  date: string;
  close: number;
}

export async function getPriceHistory(
  symbol: string,
  period: string
): Promise<PricePoint[]> {
  const config = PERIOD_CONFIG[period] ?? PERIOD_CONFIG["6M"];
  const url = `${BASE}/time_series?symbol=${encodeURIComponent(symbol)}&interval=${config.interval}&outputsize=${config.outputsize}&apikey=${KEY()}`;

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) {
      console.error(`TwelveData error ${res.status} for ${symbol}`);
      return [];
    }
    const data: TDResponse = await res.json();
    if (data.status === "error" || !data.values) {
      console.error(`TwelveData error: ${data.message}`);
      return [];
    }
    // TwelveData returns newest first, we want oldest first
    return data.values
      .map((v) => ({ date: v.datetime, close: parseFloat(v.close) }))
      .reverse();
  } catch (e) {
    console.error("TwelveData fetch failed:", e);
    return [];
  }
}

export async function getRealTimePrice(
  symbol: string
): Promise<{ price: number; change: number } | null> {
  const url = `${BASE}/price?symbol=${encodeURIComponent(symbol)}&apikey=${KEY()}`;
  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    const data = await res.json();
    return { price: parseFloat(data.price), change: 0 };
  } catch {
    return null;
  }
}
