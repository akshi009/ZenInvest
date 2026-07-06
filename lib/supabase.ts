import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Server-side client with service role (for cache writes) */
export function getServiceClient(): SupabaseClient {
  return createClient(url, serviceKey);
}

/** Public client (for reads from browser or server components) */
export function getPublicClient(): SupabaseClient {
  return createClient(url, anonKey);
}
