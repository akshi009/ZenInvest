import { NextRequest, NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/lib/cache";
import { getPriceHistory, type PricePoint } from "@/lib/api/yahoo";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.trim().toUpperCase();
  const period = req.nextUrl.searchParams.get("period") ?? "6M";

  if (!symbol) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }

  const cacheKey = `${symbol}:${period}`;
  const cacheKind = period === "1D" ? "price_1D" : "price_default";

  // Check cache
  const cached = await cacheGet<PricePoint[]>("price_cache", cacheKey, cacheKind);
  if (cached && cached.length > 0) {
    return NextResponse.json(cached);
  }

  // Fetch from Twelve Data
  const points = await getPriceHistory(symbol, period);

  if (points.length > 0) {
    await cacheSet("price_cache", cacheKey, points, {
      symbol,
      period,
    });
  }

  return NextResponse.json(points);
}
