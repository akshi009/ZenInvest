/**
 * Yahoo Finance chart API — free, unauthenticated, covers global + Indian
 * (.NS/.BO) symbols alike. Used for price history and for computing real
 * technicals (RSI, 200-day SMA trend, volume trend) locally, since
 * Alpha Vantage is rate-limited to 25 req/day and Twelve Data blocks
 * Indian symbols on the free plan.
 */

const BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

interface YahooChartResult {
  meta: { regularMarketPrice: number };
  timestamp: number[];
  indicators: {
    quote: [{ close: (number | null)[]; volume: (number | null)[] }];
  };
}

async function fetchChart(
  symbol: string,
  range: string,
  interval: string
): Promise<YahooChartResult | null> {
  const url = `${BASE}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      console.error(`Yahoo chart error ${res.status} for ${symbol}`);
      return null;
    }
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) {
      console.error(`Yahoo chart: no data for ${symbol}`, json?.chart?.error);
      return null;
    }
    return result as YahooChartResult;
  } catch (e) {
    console.error("Yahoo chart fetch failed:", e);
    return null;
  }
}

export interface PricePoint {
  date: string;
  close: number;
}

const PERIOD_CONFIG: Record<string, { range: string; interval: string }> = {
  "1D": { range: "1d", interval: "5m" },
  "5D": { range: "5d", interval: "15m" },
  "1M": { range: "1mo", interval: "1d" },
  "6M": { range: "6mo", interval: "1d" },
  "1Y": { range: "1y", interval: "1d" },
  "5Y": { range: "5y", interval: "1wk" },
};

const INTRADAY_PERIODS = new Set(["1D", "5D"]);

/** Short, human-readable date/time — matches the old Twelve Data format
 *  the chart component was built to display (e.g. "2024-01-15" or
 *  "2024-01-15 09:30:00"), rather than a raw ISO string. */
function formatPoint(ts: number, intraday: boolean): string {
  const d = new Date(ts * 1000);
  const date = d.toISOString().slice(0, 10);
  if (!intraday) return date;
  const time = d.toTimeString().slice(0, 8);
  return `${date} ${time}`;
}

export async function getPriceHistory(
  symbol: string,
  period: string
): Promise<PricePoint[]> {
  const config = PERIOD_CONFIG[period] ?? PERIOD_CONFIG["6M"];
  const result = await fetchChart(symbol, config.range, config.interval);
  if (!result) return [];

  const intraday = INTRADAY_PERIODS.has(period);
  const closes = result.indicators.quote[0].close;
  return result.timestamp
    .map((ts, i) => ({
      date: formatPoint(ts, intraday),
      close: closes[i],
    }))
    .filter((p): p is PricePoint => p.close !== null && p.close !== undefined);
}

export interface Technicals {
  rsi: number;
  trend: "above" | "below";
  volumeTrend: "rising" | "falling" | "flat";
}

function computeRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function computeSMA(closes: number[], period: number): number | null {
  if (closes.length < period) return null;
  const slice = closes.slice(closes.length - period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/** Real technicals computed from actual daily closes (1y of history). */
export async function getTechnicals(symbol: string): Promise<Technicals> {
  const result = await fetchChart(symbol, "1y", "1d");

  if (!result) {
    return { rsi: 50, trend: "above", volumeTrend: "flat" };
  }

  const closes = result.indicators.quote[0].close.filter(
    (c): c is number => c !== null && c !== undefined
  );
  const volumes = result.indicators.quote[0].volume.filter(
    (v): v is number => v !== null && v !== undefined
  );

  const currentPrice = result.meta.regularMarketPrice;
  const sma200 = computeSMA(closes, 200) ?? computeSMA(closes, closes.length) ?? currentPrice;
  const rsi = computeRSI(closes);

  let volumeTrend: Technicals["volumeTrend"] = "flat";
  if (volumes.length >= 20) {
    const recent = volumes.slice(-10).reduce((a, b) => a + b, 0) / 10;
    const prior = volumes.slice(-20, -10).reduce((a, b) => a + b, 0) / 10;
    if (recent > prior * 1.15) volumeTrend = "rising";
    else if (recent < prior * 0.85) volumeTrend = "falling";
  }

  return {
    rsi: Math.round(rsi),
    trend: currentPrice >= sma200 ? "above" : "below",
    volumeTrend,
  };
}
