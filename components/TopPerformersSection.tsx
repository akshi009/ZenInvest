"use client";

import { useState } from "react";
import HomeTopMovers, { type MarketFilter } from "@/components/HomeTopMovers";

const TABS: { id: MarketFilter; label: string }[] = [
  { id: "global", label: "🌐 Global" },
  { id: "india", label: "🇮🇳 India" },
  { id: "us", label: "🇺🇸 US" },
];

export default function TopPerformersSection() {
  const [market, setMarket] = useState<MarketFilter>("global");

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Top performers today</h2>
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setMarket(t.id)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                market === t.id
                  ? "border-accent bg-accent text-on-accent"
                  : "border-line bg-surface text-ink-2 hover:border-accent-deep"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <HomeTopMovers market={market} />
    </div>
  );
}
