"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Term from "@/components/Term";

type MarketId = "india" | "us";

const MARKETS: { id: MarketId; label: string; sub: string; symbol: string }[] = [
  { id: "india", label: "India", sub: "NSE stocks, priced in rupees", symbol: "₹" },
  { id: "us", label: "United States", sub: "US stocks, priced in dollars", symbol: "$" },
];

const PRESETS: Record<MarketId, number[]> = {
  india: [1000, 5000, 10000, 25000],
  us: [100, 500, 1000, 5000],
};

interface Opt { value: string; label: string; sub?: string; tone?: "low" | "mid" | "high" }

const HORIZON: Opt[] = [
  { value: "short", label: "Short-term", sub: "Under a year — you may need the money soon", tone: "low" },
  { value: "medium", label: "Medium-term", sub: "1–5 years", tone: "mid" },
  { value: "long", label: "Long-term", sub: "5+ years — time to ride out the swings", tone: "high" },
];

const GOAL: Opt[] = [
  { value: "learning", label: "Just learning", sub: "Getting a feel for how investing works" },
  { value: "wealth", label: "Building wealth", sub: "Letting money grow over the years" },
  { value: "goal", label: "A specific goal", sub: "House, education, a big purchase" },
];

const SECTOR: Opt[] = [
  { value: "tech", label: "Technology" },
  { value: "finance", label: "Banking / Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "energy", label: "Energy" },
  { value: "consumer", label: "Consumer brands" },
  { value: "any", label: "No preference — rank everything" },
];

const QUESTIONS: { key: string; title: string; note?: React.ReactNode; options: Opt[] }[] = [
  {
    key: "horizon",
    title: "How long will you stay invested?",
    note: (
      <>
        A longer horizon lets you ride out swings — that&rsquo;s your{" "}
        <Term k="risk tolerance">risk tolerance</Term> at work.
      </>
    ),
    options: HORIZON,
  },
  { key: "goal", title: "What's this money for?", options: GOAL },
  { key: "sector", title: "Any area you're drawn to?", options: SECTOR },
];

export default function SuggestPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<number>(0); // 0 = budget, 1..3 = questions
  const [market, setMarket] = useState<MarketId>("india");
  const [budget, setBudget] = useState<number | "">("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const cur = market === "india" ? "₹" : "$";
  const min = market === "india" ? 100 : 5;

  const finish = (sectorValue: string) => {
    const params = new URLSearchParams({
      budget: String(budget || PRESETS[market][1]),
      market,
      horizon: answers.horizon ?? "medium",
      goal: answers.goal ?? "learning",
      sector: sectorValue,
    });
    router.push(`/suggest/results?${params.toString()}`);
  };

  const pick = (key: string, value: string) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    if (phase === QUESTIONS.length) finish(value);
    else setPhase(phase + 1);
  };

  const totalSteps = 1 + QUESTIONS.length;

  return (
    <div className="mx-auto max-w-xl">
      {/* Progress */}
      <div className="mb-8 flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= phase ? "bg-accent" : "bg-surface-3"
            }`}
          />
        ))}
      </div>

      {/* Phase 0 — budget + market */}
      {phase === 0 && (
        <>
          <h1 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
            How much do you want to invest?
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-ink-2">
            Pick a market and a budget. Next we&rsquo;ll ask a couple of quick
            questions, then show the stocks that fit you best.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {MARKETS.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMarket(m.id);
                  setBudget("");
                }}
                className={`rounded-xl border p-4 text-left transition-all ${
                  market === m.id
                    ? "border-accent bg-surface-2"
                    : "border-line bg-surface hover:border-accent-deep"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="num text-lg font-bold text-accent">{m.symbol}</span>
                  <span className="font-semibold text-ink">{m.label}</span>
                </div>
                <p className="mt-1 text-xs text-ink-2">{m.sub}</p>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-5 py-4 focus-within:border-accent">
              <span className="text-xl font-bold text-ink-3">{cur}</span>
              <input
                type="number"
                min={min}
                value={budget}
                onChange={(e) =>
                  setBudget(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder={String(PRESETS[market][1])}
                className="num w-full bg-transparent text-2xl font-bold text-ink outline-none placeholder:text-ink-3"
                aria-label="Budget amount"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {PRESETS[market].map((v) => (
                <button
                  key={v}
                  onClick={() => setBudget(v)}
                  className={`num rounded-full border px-4 py-2 text-sm transition-colors ${
                    budget === v
                      ? "border-accent bg-accent text-on-accent"
                      : "border-line bg-surface text-ink-2 hover:border-accent-deep"
                  }`}
                >
                  {cur}
                  {v.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
            <button
              disabled={!budget || budget < min}
              onClick={() => setPhase(1)}
              className="mt-8 w-full rounded-xl bg-accent py-3.5 font-semibold text-on-accent transition-colors hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </>
      )}

      {/* Phases 1..3 — questions */}
      {phase > 0 && (
        <>
          <h1 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
            {QUESTIONS[phase - 1].title}
          </h1>
          {QUESTIONS[phase - 1].note && (
            <p className="mt-3 text-center text-sm leading-relaxed text-ink-2">
              {QUESTIONS[phase - 1].note}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3">
            {QUESTIONS[phase - 1].options.map((o) => (
              <button
                key={o.value}
                onClick={() => pick(QUESTIONS[phase - 1].key, o.value)}
                className="group rounded-xl border border-line bg-surface p-5 text-left transition-all hover:border-accent hover:bg-surface-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink group-hover:text-accent">
                    {o.label}
                  </span>
                  {o.tone && (
                    <span
                      className={`num rounded px-2 py-0.5 text-[11px] font-bold ${
                        o.tone === "low"
                          ? "bg-warn/15 text-warn"
                          : o.tone === "mid"
                          ? "bg-accent/15 text-accent"
                          : "bg-gain/15 text-gain"
                      }`}
                    >
                      {o.tone === "low"
                        ? "NEEDS CARE"
                        : o.tone === "mid"
                        ? "BALANCED"
                        : "CAN TAKE RISK"}
                    </span>
                  )}
                </div>
                {o.sub && <p className="mt-1 text-sm text-ink-2">{o.sub}</p>}
              </button>
            ))}
            <button
              onClick={() => setPhase(phase - 1)}
              className="mt-2 text-sm text-ink-3 hover:text-accent"
            >
              ← Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}
