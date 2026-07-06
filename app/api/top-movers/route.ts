import { NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/lib/cache";
import { getTopGainers, type FMPQuote } from "@/lib/api/fmp";

export async function GET() {
  const cached = await cacheGet<FMPQuote[]>("news_cache", "top-movers", "news");
  if (cached && cached.length > 0) {
    return NextResponse.json(cached);
  }

  const gainers = await getTopGainers();

  if (gainers.length > 0) {
    await cacheSet("news_cache", "top-movers", gainers);
  }

  return NextResponse.json(gainers);
}
