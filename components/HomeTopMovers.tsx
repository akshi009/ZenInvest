"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Mover {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  exchange?: string;
  sector?: string;
}

export default function HomeTopMovers() {
  const [movers, setMovers] = useState<Mover[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/top-movers")
      .then((r) => r.json())
      .then((d) => setMovers(d.slice(0, 6)))
      .catch(() => setMovers([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="min-w-[270px] animate-pulse rounded-card border border-line bg-surface p-5">
            <div className="h-4 w-24 rounded bg-surface-3" />
            <div className="mt-3 h-6 w-20 rounded bg-surface-3" />
            <div className="mt-2 h-4 w-16 rounded bg-surface-3" />
          </div>
        ))}
      </div>
    );
  }

  if (movers.length === 0) {
    return <p className="text-sm text-ink-3">Unable to load top movers right now.</p>;
  }

  return (
    <div className="hide-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
      {movers.map((m) => {
        const up = m.changesPercentage >= 0;
        return (
          <Link
            key={m.symbol}
            href={`/company/${m.symbol}`}
            className="group block min-w-[270px] rounded-card border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-deep md:min-w-[300px]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-3 font-bold text-accent">
                  {m.name?.[0] ?? m.symbol[0]}
                </div>
                <div>
                  <h3 className="font-bold leading-tight text-ink group-hover:text-accent">
                    {m.name?.length > 20 ? m.name.slice(0, 20) + "…" : m.name}
                  </h3>
                  <span className="num text-xs text-ink-3">{m.symbol}</span>
                </div>
              </div>
              {m.sector && (
                <span className="rounded bg-surface-3 px-2 py-1 text-[11px] font-semibold text-ink-2">
                  {m.sector}
                </span>
              )}
            </div>
            <div className="mt-4">
              <div className="num text-2xl font-bold text-ink">
                ${m.price?.toLocaleString("en-US", { maximumFractionDigits: 2 })}
              </div>
              <div className={`num mt-0.5 text-sm font-medium ${up ? "text-gain" : "text-loss"}`}>
                {up ? "▲" : "▼"} {up ? "+" : ""}
                {m.changesPercentage?.toFixed(2)}%
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
