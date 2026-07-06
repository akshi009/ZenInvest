-- ============================================================
-- ZenInvest Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Cache for company fundamentals (FMP data)
-- TTL: 24 hours (fundamentals don't change intraday)
create table if not exists company_cache (
  symbol      text primary key,
  market      text not null default 'NSE',
  data        jsonb not null,
  fetched_at  timestamptz not null default now()
);

-- Cache for price/chart data (Twelve Data + Alpha Vantage)
-- TTL: 15 min for 1D, 1 hour for others
create table if not exists price_cache (
  id          text primary key, -- symbol:period e.g. "RELIANCE:6M"
  symbol      text not null,
  period      text not null,
  data        jsonb not null,
  fetched_at  timestamptz not null default now()
);

-- Cache for technical indicators (Alpha Vantage)
-- TTL: 1 hour
create table if not exists technicals_cache (
  symbol      text primary key,
  data        jsonb not null,
  fetched_at  timestamptz not null default now()
);

-- Cache for news articles (Finnhub)
-- TTL: 1 hour
create table if not exists news_cache (
  id          text primary key default 'global',
  data        jsonb not null,
  fetched_at  timestamptz not null default now()
);

-- Search log for trending/popular companies
create table if not exists search_log (
  id          bigint generated always as identity primary key,
  symbol      text not null,
  searched_at timestamptz not null default now()
);

-- Index for fast trending queries
create index if not exists idx_search_log_time on search_log (searched_at desc);
create index if not exists idx_search_log_symbol on search_log (symbol);

-- RLS: allow anonymous reads (the anon key can read caches)
alter table company_cache enable row level security;
alter table price_cache enable row level security;
alter table technicals_cache enable row level security;
alter table news_cache enable row level security;
alter table search_log enable row level security;

create policy "Allow public read on company_cache" on company_cache for select using (true);
create policy "Allow public read on price_cache" on price_cache for select using (true);
create policy "Allow public read on technicals_cache" on technicals_cache for select using (true);
create policy "Allow public read on news_cache" on news_cache for select using (true);
create policy "Allow public insert on search_log" on search_log for insert with check (true);
create policy "Allow public read on search_log" on search_log for select using (true);
