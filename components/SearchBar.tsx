"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface SearchResult {
  symbol: string;
  name: string;
  market: string;
  currency: string;
}

export default function SearchBar() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    const trimmed = q.trim();
    if (trimmed.length < 1) { setResults([]); return; }

    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data: SearchResult[] = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);

    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 transition-colors focus-within:border-accent">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-ink-3" aria-hidden>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search any company (e.g. RELIANCE, AAPL, TCS)"
          className="w-full bg-transparent text-ink outline-none placeholder:text-ink-3"
          aria-label="Search any company"
        />
        {loading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        )}
      </div>

      {open && q && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-line bg-surface-2 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
          {results.length === 0 && !loading && (
            <div className="p-4 text-sm text-ink-2">
              No results found. Try a different name or symbol.
            </div>
          )}
          {results.map((r) => (
            <button
              key={r.symbol}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-surface-3"
              onClick={() => {
                router.push(`/company/${r.symbol}`);
                setOpen(false);
                setQ("");
              }}
            >
              <span>
                <span className="font-semibold text-ink">{r.name}</span>{" "}
                <span className="num text-xs text-ink-3">
                  {r.market}: {r.symbol}
                </span>
              </span>
              <span className="text-xs text-ink-3">{r.currency}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
