"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface PoolStock {
  symbol: string;
  name: string;
  sector: string;
  group: string;
  currency: "₹" | "$";
  price: number;
  changePct: number;
  marketCap: number;
  score: number;
}

type MarketId = "india" | "us";

const SEG = [
  "var(--color-accent)",
  "var(--color-gain)",
  "var(--color-warn)",
  "var(--color-loss)",
  "var(--color-accent-deep)",
  "var(--color-ink-3)",
];

function fmt(cur: string, n: number, dp = 2) {
  return `${cur}${n.toLocaleString("en-IN", { maximumFractionDigits: dp })}`;
}

// 0 = play it safe, 1 = full growth-seeking — derived from the questionnaire.
function riskAppetite(horizon: string, goal: string): number {
  let r = horizon === "long" ? 0.85 : horizon === "short" ? 0.25 : 0.5;
  if (goal === "wealth") r += 0.1;
  else if (goal === "goal") r -= 0.15;
  else if (goal === "learning") r -= 0.05;
  return Math.max(0, Math.min(1, r));
}

function matchesSector(group: string, pref: string): boolean {
  const g = group.toLowerCase();
  switch (pref) {
    case "tech": return g.includes("technolog") || g.includes("communication");
    case "finance": return g.includes("financial");
    case "healthcare": return g.includes("health");
    case "energy": return g.includes("energy") || g.includes("utilit");
    case "consumer": return g.includes("consumer");
    default: return false;
  }
}

const GROWTH_GROUPS = ["technolog", "communication", "consumer cyclical"];

/** Personalized 0-ish..∞ ranking score: real Zen score + real trend, tuned by
 *  the user's risk appetite and sector interest. Higher = better fit. */
function personalScore(
  s: PoolStock,
  risk: number,
  medianCap: number
): number {
  let score = s.score; // real Zen/trend composite

  // Growth-seekers value recent momentum more; cautious users less.
  score += s.changePct * (0.15 + risk * 0.35);

  if (risk < 0.45) {
    // Cautious: lean on bigger, steadier names and dislike wild swings.
    if (s.marketCap >= medianCap) score += 0.8;
    score -= Math.abs(s.changePct) * 0.15;
  } else if (risk > 0.6) {
    // Growth: nudge toward growth-oriented sectors.
    if (GROWTH_GROUPS.some((g) => s.group.toLowerCase().includes(g))) score += 0.6;
  }

  return score;
}

function profileLine(horizon: string, goal: string, sectorPref: string, risk: number): string {
  const stance =
    risk >= 0.65 ? "growth-seeking" : risk <= 0.4 ? "play-it-safe" : "balanced";
  const sectorName: Record<string, string> = {
    tech: "Technology", finance: "Banking / Finance", healthcare: "Healthcare",
    energy: "Energy", consumer: "Consumer brands",
  };
  const tilt = sectorPref !== "any" && sectorName[sectorPref]
    ? ` with a ${sectorName[sectorPref]} tilt`
    : "";
  const lean =
    risk >= 0.65
      ? "favoring momentum and growth names"
      : risk <= 0.4
      ? "favoring steadier, larger companies"
      : "balancing steadiness and momentum";
  return `Ranked for your ${stance} profile${tilt} — ${lean}.`;
}

function Picker() {
  const router = useRouter();
  const sp = useSearchParams();
  const budget = Math.max(1, Number(sp.get("budget")) || 5000);
  const market = (sp.get("market") ?? "india") as MarketId;
  const horizon = sp.get("horizon") ?? "medium";
  const goal = sp.get("goal") ?? "learning";
  const sectorPref = sp.get("sector") ?? "any";
  const risk = riskAppetite(horizon, goal);

  const [pool, setPool] = useState<PoolStock[] | null>(null);
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [sector, setSector] = useState<string>("all");

  useEffect(() => {
    let alive = true;
    setPool(null);
    setQtys({});
    setSector("all");
    fetch(`/api/pool?market=${market}`)
      .then((r) => r.json())
      .then((data) => {
        if (alive) setPool(Array.isArray(data) ? data : []);
      })
      .catch(() => alive && setPool([]));
    return () => {
      alive = false;
    };
  }, [market]);

  const cur = market === "india" ? "₹" : "$";

  const affordable = useMemo(
    () => (pool ?? []).filter((s) => s.price <= budget),
    [pool, budget]
  );

  // Personalized ranking: if they picked a sector, those stocks lead
  // (best-in-sector first), then everyone else — each tier sorted by the
  // blended fit score (Zen + trend, tuned by risk appetite).
  const ranked = useMemo(() => {
    if (affordable.length === 0) return [];
    const caps = affordable.map((s) => s.marketCap).sort((a, b) => a - b);
    const medianCap = caps[Math.floor(caps.length / 2)] || 0;
    return [...affordable]
      .map((s) => ({ s, p: personalScore(s, risk, medianCap) }))
      .sort((a, b) => {
        if (sectorPref !== "any") {
          const am = matchesSector(a.s.group, sectorPref) ? 1 : 0;
          const bm = matchesSector(b.s.group, sectorPref) ? 1 : 0;
          if (am !== bm) return bm - am; // preferred sector first
        }
        return b.p - a.p;
      })
      .map((x) => x.s);
  }, [affordable, risk, sectorPref]);

  // Top 3 personalized picks get a "Best for you" badge.
  const bestForYou = useMemo(
    () => new Set(ranked.slice(0, 3).map((s) => s.symbol)),
    [ranked]
  );

  const groups = useMemo(() => {
    const set = new Set(ranked.map((s) => s.group));
    return ["all", ...Array.from(set)];
  }, [ranked]);

  const visible = useMemo(
    () => (sector === "all" ? ranked : ranked.filter((s) => s.group === sector)),
    [ranked, sector]
  );

  const selected = useMemo(
    () =>
      Object.entries(qtys)
        .filter(([, q]) => q > 0)
        .map(([sym, q]) => ({ stock: (pool ?? []).find((s) => s.symbol === sym)!, qty: q }))
        .filter((x) => x.stock),
    [qtys, pool]
  );

  const spent = selected.reduce((s, x) => s + x.stock.price * x.qty, 0);
  const remaining = budget - spent;
  const spentPct = Math.min(100, (spent / budget) * 100);

  const setQty = (sym: string, q: number) =>
    setQtys((prev) => {
      const next = { ...prev };
      if (q <= 0) delete next[sym];
      else next[sym] = q;
      return next;
    });

  const switchMarket = (m: MarketId) =>
    router.push(
      `/suggest/results?budget=${budget}&market=${m}&horizon=${horizon}&goal=${goal}&sector=${sectorPref}`
    );

  return (
    <div className="mx-auto max-w-3xl pb-40">
      <Link href="/suggest" className="text-sm text-ink-3 hover:text-accent">
        ← Change my answers
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        Best picks for your {fmt(cur, budget, 0)}
      </h1>
      <p className="mt-2 leading-relaxed text-ink-2">
        {profileLine(horizon, goal, sectorPref, risk)} Everything below trades at
        or under your budget. Tick the ones you like, set how many shares, and
        keep the total within {fmt(cur, budget, 0)}.
      </p>

      {/* Country + sector filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">Market</span>
        {(["india", "us"] as MarketId[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMarket(m)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              market === m
                ? "border-accent bg-accent text-on-accent"
                : "border-line bg-surface text-ink-2 hover:border-accent-deep"
            }`}
          >
            {m === "india" ? "🇮🇳 India (₹)" : "🇺🇸 US ($)"}
          </button>
        ))}
      </div>

      {groups.length > 2 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">Sector</span>
          {groups.map((g) => (
            <button
              key={g}
              onClick={() => setSector(g)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                sector === g
                  ? "border-accent bg-surface-2 text-accent"
                  : "border-line bg-surface text-ink-2 hover:border-accent-deep"
              }`}
            >
              {g === "all" ? "All sectors" : g}
            </button>
          ))}
        </div>
      )}

      {pool === null && (
        <p className="mt-10 text-center text-sm text-ink-3">Loading live prices…</p>
      )}
      {pool !== null && affordable.length === 0 && (
        <div className="mt-8 rounded-card border border-warn/30 bg-warn/5 p-5 text-sm leading-relaxed text-ink-2">
          <span className="font-semibold text-warn">Nothing fits yet. </span>
          Your {fmt(cur, budget, 0)} budget is below the cheapest single share in
          this market
          {pool.length > 0 && (
            <> (cheapest is {fmt(cur, Math.min(...pool.map((s) => s.price)))}). Try a larger budget or switch markets.</>
          )}
          .
        </div>
      )}

      {visible.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          {visible.map((s, i) => {
            const qty = qtys[s.symbol] ?? 0;
            const checked = qty > 0;
            const subtotal = qty * s.price;
            const canAddOne = s.price <= remaining;
            const up = s.changePct >= 0;
            const best = bestForYou.has(s.symbol);
            return (
              <div
                key={s.symbol}
                className={`rounded-card border bg-surface p-4 transition-colors ${
                  checked ? "border-accent" : best ? "border-accent/40" : "border-line"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => setQty(s.symbol, checked ? 0 : 1)}
                    disabled={!checked && !canAddOne}
                    aria-label={checked ? `Remove ${s.name}` : `Add ${s.name}`}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      checked
                        ? "border-accent bg-accent text-on-accent"
                        : canAddOne
                        ? "border-line-soft hover:border-accent"
                        : "cursor-not-allowed border-line-soft opacity-40"
                    }`}
                  >
                    {checked && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      {best ? (
                        <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                          ★ BEST FOR YOU
                        </span>
                      ) : (
                        <span className="num rounded bg-surface-3 px-1.5 py-0.5 text-[10px] font-bold text-ink-3">
                          #{i + 1}
                        </span>
                      )}
                      <Link href={`/company/${s.symbol}`} className="font-semibold text-ink hover:text-accent">
                        {s.name}
                      </Link>
                    </div>
                    <p className="num mt-0.5 text-xs text-ink-3">{s.symbol} · {s.sector}</p>
                  </div>

                  <div className="text-right">
                    <div className="num font-bold text-ink">{fmt(cur, s.price)}</div>
                    <div className={`num text-xs font-medium ${up ? "text-gain" : "text-loss"}`}>
                      {up ? "▲" : "▼"} {up ? "+" : ""}{s.changePct.toFixed(2)}%
                    </div>
                    <div className="num mt-0.5 text-[11px] text-ink-3">Zen {s.score.toFixed(1)}</div>
                  </div>
                </div>

                {checked && (
                  <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-ink-2">Shares</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQty(s.symbol, qty - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-line-soft text-ink hover:border-accent"
                          aria-label="One fewer share"
                        >
                          −
                        </button>
                        <span className="num w-8 text-center font-bold text-ink">{qty}</span>
                        <button
                          onClick={() => setQty(s.symbol, qty + 1)}
                          disabled={!canAddOne}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-line-soft text-ink hover:border-accent disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="One more share"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="num text-sm">
                      {qty} × {fmt(cur, s.price)} ={" "}
                      <span className="font-bold text-gain">{fmt(cur, subtotal)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <div className="mt-8 rounded-card border border-line bg-surface-2 p-5">
          <h2 className="text-lg font-bold">Your basket</h2>

          <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-surface-3">
            {selected.map((x, idx) => (
              <div
                key={x.stock.symbol}
                title={`${x.stock.name}: ${fmt(cur, x.stock.price * x.qty)}`}
                style={{
                  width: `${(x.stock.price * x.qty / budget) * 100}%`,
                  background: SEG[idx % SEG.length],
                }}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {selected.map((x, idx) => (
              <div key={x.stock.symbol} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: SEG[idx % SEG.length] }} />
                  <span className="text-ink">{x.stock.name}</span>
                  <span className="num text-xs text-ink-3">× {x.qty}</span>
                </div>
                <span className="num font-medium text-ink">{fmt(cur, x.stock.price * x.qty)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-3">
            <span className="font-semibold text-ink">Total spent</span>
            <span className="num text-lg font-bold text-gain">{fmt(cur, spent)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-ink-2">Left uninvested</span>
            <span className="num font-medium text-warn">{fmt(cur, remaining)}</span>
          </div>
        </div>
      )}

      <p className="mt-8 rounded-card border border-line bg-surface-2 p-5 text-xs leading-relaxed text-ink-3">
        Rankings blend live price trend with our Zen score and your answers.
        Prices move constantly, so share counts are indicative. This is an
        educational tool — not personalized financial advice. Always do your own
        research.
      </p>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-5 py-3">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-ink-2">
              <span className="num font-bold text-gain">{fmt(cur, spent)}</span> of{" "}
              <span className="num font-bold text-ink">{fmt(cur, budget, 0)}</span>
            </span>
            <span className="num text-ink-3">
              {selected.length} {selected.length === 1 ? "stock" : "stocks"} ·{" "}
              <span className="text-warn">{fmt(cur, remaining)} left</span>
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-3">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${spentPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<p className="text-center text-sm text-ink-3">Loading…</p>}>
      <Picker />
    </Suspense>
  );
}
