/** Finnhub API — news + sentiment */

const BASE = "https://finnhub.io/api/v1";
const KEY = () => process.env.FINNHUB_KEY!;

export interface FinnhubNews {
  id: number;
  headline: string;
  source: string;
  datetime: number; // unix timestamp
  summary: string;
  url: string;
  related: string;  // ticker symbols
  image: string;
}

export async function getMarketNews(
  category = "general",
  count = 10
): Promise<FinnhubNews[]> {
  const url = `${BASE}/news?category=${category}&token=${KEY()}`;
  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) {
      console.error(`Finnhub news error ${res.status}`);
      return [];
    }
    const data: FinnhubNews[] = await res.json();
    return (data ?? []).slice(0, count);
  } catch (e) {
    console.error("Finnhub fetch failed:", e);
    return [];
  }
}

export async function getCompanyNews(
  symbol: string,
  daysBack = 7
): Promise<FinnhubNews[]> {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - daysBack * 86400000)
    .toISOString()
    .slice(0, 10);
  const url = `${BASE}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${KEY()}`;
  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return [];
    const data: FinnhubNews[] = await res.json();
    return (data ?? []).slice(0, 8);
  } catch {
    return [];
  }
}
