import { NextRequest, NextResponse } from "next/server";
import { searchFMP } from "@/lib/api/fmp";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 1) {
    return NextResponse.json([]);
  }

  const results = await searchFMP(q);
  const mapped = results.map((r) => ({
    symbol: r.symbol,
    name: r.name,
    market: r.exchangeShortName,
    currency: r.currency,
  }));

  return NextResponse.json(mapped);
}
