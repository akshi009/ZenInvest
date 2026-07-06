# ZenInvest

Beginner-friendly investment research & education platform.
Dark theme, Next.js 15 (App Router), Tailwind CSS v4, TypeScript, Supabase.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
Copy `.env.example` to `.env.local` and fill in your API keys:
```bash
cp .env.example .env.local
```

### 3. Create Supabase tables
Go to your Supabase Dashboard → SQL Editor → New Query.
Paste the contents of `supabase-migration.sql` and click **Run**.

### 4. Start dev server
```bash
npm run dev
```
Open http://localhost:3000

## Architecture

### Data flow
```
User searches → /api/search → FMP search API → results
User picks company → /api/company → Cache check →
  HIT → return cached
  MISS → FMP (fundamentals) + Alpha Vantage (technicals) → compute Zen Score → cache in Supabase → return
Chart loads → /api/chart → Cache check →
  HIT → return
  MISS → Twelve Data → cache → return
News loads → /api/news → Cache check →
  HIT → return
  MISS → Finnhub → cache → return
```

### API stack (all free tier)
| API | Role | Free limit |
|-----|------|-----------|
| FMP | Fundamentals, search, top movers | 250/day |
| Alpha Vantage | RSI, SMA200 technicals | 25/day |
| Twelve Data | Price history (all periods) | 800/day |
| Finnhub | Market news | 60/min |

### Caching (Supabase)
- Company fundamentals: 24-hour TTL
- Technicals: 1-hour TTL
- Price data: 15 min (1D) / 1 hour (others)
- News: 1-hour TTL

### Pages
- `/` — Home: live search, top movers, market news
- `/company/[symbol]` — Live analysis with Zen Score
- `/suggest` — Budget wizard (4 questions, all option-based)
- `/suggest/results` — Rule-based portfolio with share quantities
