import { NextRequest, NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/lib/cache";
import { getMarketPool, type MarketId, type PoolStock } from "@/lib/api/pool";

export async function GET(req: NextRequest) {
  const market = (req.nextUrl.searchParams.get("market") ?? "india") as MarketId;
  if (market !== "india" && market !== "us") {
    return NextResponse.json({ error: "Invalid market" }, { status: 400 });
  }

  const cacheKey = `pool:${market}`;
  const cached = await cacheGet<PoolStock[]>("price_cache", cacheKey, "price_default");
  if (cached && cached.length > 0) {
    return NextResponse.json(cached);
  }

  const pool = await getMarketPool(market);
  if (pool.length > 0) {
    await cacheSet("price_cache", cacheKey, pool, { symbol: market, period: "pool" });
  }

  return NextResponse.json(pool);
}
