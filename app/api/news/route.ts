import { NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/lib/cache";
import { getMarketNews, type FinnhubNews } from "@/lib/api/finnhub";

export async function GET() {
  // Check cache
  const cached = await cacheGet<FinnhubNews[]>("news_cache", "global", "news");
  if (cached && cached.length > 0) {
    return NextResponse.json(cached);
  }

  const news = await getMarketNews("general", 10);

  if (news.length > 0) {
    await cacheSet("news_cache", "global", news);
  }

  return NextResponse.json(news);
}
