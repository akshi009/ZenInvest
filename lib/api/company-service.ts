/**
 * Company orchestration layer.
 * Pulls FMP (profile + fundamentals) + Yahoo Finance (technicals, computed
 * locally from real historical closes), computes the Zen Score, and returns
 * a unified shape.
 */

import { cacheGet, cacheSet, logSearch } from "@/lib/cache";
import {
  getProfile,
  getRatios,
  getKeyMetrics,
  getIncomeGrowth,
  getSectorPE,
} from "@/lib/api/fmp";
import { getTechnicals } from "@/lib/api/yahoo";

export interface CompanyData {
  symbol: string;
  name: string;
  market: string;
  sector: string;
  currency: string;
  price: number;
  changePct: number;
  cap: string;
  about: {
    summary: string;
    founded: string;
    hq: string;
    employees: string;
  };
  fundamentals: {
    pe: number;
    sectorPe: number;
    pb: number;
    roe: number;
    debtToEquity: number;
    revenueGrowth: number;
    dividendYield: number;
  };
  technicals: {
    rsi: number;
    trend: "above" | "below";
    volumeTrend: "rising" | "falling" | "flat";
  };
  score: number;
}

function capLabel(mktCap: number): string {
  if (mktCap > 20_000_000_000) return "Large Cap";
  if (mktCap > 5_000_000_000) return "Mid Cap";
  return "Small Cap";
}

function sectorMap(fmpSector: string): string {
  const m: Record<string, string> = {
    "Technology": "Tech",
    "Financial Services": "Banking",
    "Consumer Cyclical": "Auto",
    "Healthcare": "Healthcare",
    "Energy": "Energy",
    "Communication Services": "Tech",
    "Industrials": "Industrials",
    "Basic Materials": "Materials",
    "Consumer Defensive": "Consumer",
    "Utilities": "Utilities",
    "Real Estate": "Real Estate",
  };
  return m[fmpSector] ?? fmpSector ?? "—";
}

/** Composite Zen Score (0-10) from fundamentals + technicals */
function computeScore(
  f: CompanyData["fundamentals"],
  t: CompanyData["technicals"]
): number {
  let score = 5.0; // baseline

  // PE relative to sector (lower = better, max ±1.5 points)
  if (f.pe > 0 && f.sectorPe > 0) {
    const peRatio = f.pe / f.sectorPe;
    if (peRatio < 0.8) score += 1.5;
    else if (peRatio < 1.0) score += 0.8;
    else if (peRatio > 1.3) score -= 1.0;
    else if (peRatio > 1.1) score -= 0.3;
  }

  // ROE (higher = better, max ±1 point)
  if (f.roe > 20) score += 1.0;
  else if (f.roe > 15) score += 0.5;
  else if (f.roe > 0 && f.roe < 5) score -= 0.8;

  // Debt-to-Equity (lower = safer, max ±0.8 points)
  if (f.debtToEquity > 0) {
    if (f.debtToEquity < 0.3) score += 0.8;
    else if (f.debtToEquity < 0.7) score += 0.3;
    else if (f.debtToEquity > 1.5) score -= 0.8;
  }

  // Revenue growth (higher = better, max ±1 point)
  if (f.revenueGrowth > 20) score += 1.0;
  else if (f.revenueGrowth > 10) score += 0.5;
  else if (f.revenueGrowth < 0) score -= 0.8;

  // RSI momentum (middle is best, extremes are risky)
  if (t.rsi > 75) score -= 0.7;
  else if (t.rsi > 65) score -= 0.2;
  else if (t.rsi < 25) score -= 0.5;
  else if (t.rsi >= 40 && t.rsi <= 60) score += 0.3;

  // Trend (above 200 SMA = healthy)
  if (t.trend === "above") score += 0.5;
  else score -= 0.3;

  return Math.max(0, Math.min(10, Math.round(score * 10) / 10));
}

export async function fetchCompany(symbol: string): Promise<CompanyData | null> {
  // Check cache first
  const cached = await cacheGet<CompanyData>("company_cache", symbol, "company");
  if (cached) return cached;

  const [profile, ratios, keyMetrics, growth] = await Promise.all([
    getProfile(symbol),
    getRatios(symbol),
    getKeyMetrics(symbol),
    getIncomeGrowth(symbol),
  ]);

  if (!profile) return null;

  const sectorPe = await getSectorPE(profile.sector);

  const techCached = await cacheGet<CompanyData["technicals"] | null>(
    "technicals_cache",
    symbol,
    "technicals"
  );
  const technicals: CompanyData["technicals"] =
    techCached ?? (await getTechnicals(symbol));

  if (!techCached) {
    await cacheSet("technicals_cache", symbol, technicals);
  }

  // Fields not covered by the free FMP plan for some symbols (notably
  // Indian .NS/.BO tickers) come back null — surfaced as 0, which the UI
  // renders as "N/A" rather than a fabricated number.
  const fundamentals: CompanyData["fundamentals"] = {
    pe: ratios?.priceToEarningsRatioTTM ?? 0,
    sectorPe,
    pb: ratios?.priceToBookRatioTTM ?? 0,
    roe: (keyMetrics?.returnOnEquityTTM ?? 0) * 100,
    debtToEquity: ratios?.debtToEquityRatioTTM ?? 0,
    revenueGrowth: (growth[0]?.growthRevenue ?? 0) * 100,
    dividendYield: (ratios?.dividendYieldTTM ?? 0) * 100,
  };

  const company: CompanyData = {
    symbol: profile.symbol,
    name: profile.companyName,
    market: profile.exchange ?? profile.exchangeFullName,
    sector: sectorMap(profile.sector),
    currency: profile.currency === "INR" ? "₹" : "$",
    price: profile.price,
    changePct: profile.changePercentage,
    cap: capLabel(profile.marketCap),
    about: {
      summary: profile.description || "No description available.",
      founded: profile.ipoDate?.slice(0, 4) || "—",
      hq: profile.country || "—",
      employees: profile.fullTimeEmployees
        ? `~${parseInt(profile.fullTimeEmployees).toLocaleString("en-IN")}`
        : "—",
    },
    fundamentals,
    technicals,
    score: computeScore(fundamentals, technicals),
  };

  // Cache the result
  await cacheSet("company_cache", symbol, company, { market: company.market });
  await logSearch(symbol);

  return company;
}
