import { getServiceClient } from "@/lib/supabase";

const TTL: Record<string, number> = {
  company: 24 * 60 * 60 * 1000,      // 24 hours
  price_1D: 15 * 60 * 1000,           // 15 minutes
  price_default: 60 * 60 * 1000,      // 1 hour
  technicals: 60 * 60 * 1000,         // 1 hour
  news: 60 * 60 * 1000,               // 1 hour
};

function isStale(fetchedAt: string, kind: string): boolean {
  const ttl = TTL[kind] ?? TTL.price_default;
  return Date.now() - new Date(fetchedAt).getTime() > ttl;
}

/** Generic cache read from a Supabase table */
export async function cacheGet<T>(
  table: string,
  key: string,
  kind: string
): Promise<T | null> {
  try {
    const sb = getServiceClient();
    const { data } = await sb
      .from(table)
      .select("data, fetched_at")
      .eq(table === "price_cache" ? "id" : "symbol", key)
      .single();

    if (!data) return null;
    if (isStale(data.fetched_at, kind)) return null;
    return data.data as T;
  } catch {
    return null;
  }
}

/** Generic cache write to a Supabase table */
export async function cacheSet(
  table: string,
  key: string,
  value: unknown,
  extra?: Record<string, unknown>
): Promise<void> {
  try {
    const sb = getServiceClient();
    const row: Record<string, unknown> = {
      data: value,
      fetched_at: new Date().toISOString(),
      ...extra,
    };

    if (table === "price_cache") {
      row.id = key;
    } else if (table === "news_cache") {
      row.id = key;
    } else {
      row.symbol = key;
    }

    await sb.from(table).upsert(row);
  } catch (e) {
    console.error(`Cache write failed for ${table}:${key}`, e);
  }
}

/** Log a search for trending analytics */
export async function logSearch(symbol: string): Promise<void> {
  try {
    const sb = getServiceClient();
    await sb.from("search_log").insert({ symbol });
  } catch {
    // non-critical, ignore
  }
}
