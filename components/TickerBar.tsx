"use client";

import { useEffect, useRef } from "react";
import { COMPANIES } from "@/lib/data";

export default function TickerBar() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let x = 0;
    let raf: number;
    const speed = 0.4;
    const half = track.scrollWidth / 2;
    const step = () => {
      x += speed;
      if (x >= half) x = 0;
      track.style.transform = `translateX(-${x}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const items = [...COMPANIES, ...COMPANIES];

  return (
    <div
      className="overflow-hidden border-b border-line-soft bg-surface"
      style={{ height: 36 }}
      aria-label="Live stock ticker"
      aria-hidden="true"
    >
      <div ref={trackRef} className="flex" style={{ willChange: "transform" }}>
        {items.map((c, i) => (
          <div
            key={`${c.symbol}-${i}`}
            className="flex shrink-0 items-center gap-2 border-r border-line-soft px-5"
            style={{ height: 36 }}
          >
            <span className="num text-xs font-bold tracking-wide text-ink">
              {c.symbol}
            </span>
            <span
              className={`num rounded px-1.5 py-0.5 text-[9px] font-bold tracking-widest ${
                c.market === "NSE"
                  ? "bg-gain/10 text-gain"
                  : "bg-accent/10 text-accent"
              }`}
            >
              {c.market}
            </span>
            <span className="num text-xs text-ink-2">
              {c.currency}
              {c.price.toLocaleString("en-IN")}
            </span>
            <span
              className={`num text-xs font-medium ${
                c.changePct >= 0 ? "text-gain" : "text-loss"
              }`}
            >
              {c.changePct >= 0 ? "+" : ""}
              {c.changePct.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
