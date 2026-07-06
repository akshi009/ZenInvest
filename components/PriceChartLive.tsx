"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Period = "1D" | "5D" | "1M" | "6M" | "1Y" | "5Y";
const PERIODS: Period[] = ["1D", "5D", "1M", "6M", "1Y", "5Y"];
const PERIOD_LABEL: Record<Period, string> = {
  "1D": "Today", "5D": "Past 5 days", "1M": "Past month",
  "6M": "Past 6 months", "1Y": "Past year", "5Y": "Past 5 years",
};

interface PricePoint { date: string; close: number; }

export default function PriceChartLive({
  symbol, currency, positive,
}: {
  symbol: string; currency: string; positive: boolean;
}) {
  const [period, setPeriod] = useState<Period>("6M");
  const [points, setPoints] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState<{ idx: number; x: number; y: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setLoading(true);
    setHover(null);
    fetch(`/api/chart?symbol=${symbol}&period=${period}`)
      .then((r) => r.json())
      .then((d) => setPoints(d))
      .catch(() => setPoints([]))
      .finally(() => setLoading(false));
  }, [symbol, period]);

  const isUp = points.length > 1 ? points[points.length - 1].close >= points[0].close : positive;
  const stroke = isUp ? "#82d6a9" : "#f0a49b";
  const gradTop = isUp ? "rgba(130,214,169,0.22)" : "rgba(240,164,155,0.22)";
  const closes = points.map((p) => p.close);
  const min = closes.length ? Math.min(...closes) : 0;
  const max = closes.length ? Math.max(...closes) : 1;
  const range = max - min || 1;

  const draw = useCallback((canvas: HTMLCanvasElement) => {
    if (closes.length < 2) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth * dpr, H = canvas.offsetHeight * dpr;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const PL = 4, PR = 4, PT = 14, PB = 10;
    const px = (i: number) => PL + (i / (closes.length - 1)) * (W - PL - PR);
    const py = (v: number) => H - PB - ((v - min) / range) * (H - PT - PB);

    ctx.beginPath();
    ctx.moveTo(px(0), py(closes[0]));
    for (let i = 1; i < closes.length; i++) ctx.lineTo(px(i), py(closes[i]));
    ctx.lineTo(px(closes.length - 1), H - PB); ctx.lineTo(px(0), H - PB); ctx.closePath();
    const grad = ctx.createLinearGradient(0, PT, 0, H);
    grad.addColorStop(0, gradTop); grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad; ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px(0), py(closes[0]));
    for (let i = 1; i < closes.length; i++) ctx.lineTo(px(i), py(closes[i]));
    ctx.strokeStyle = stroke; ctx.lineWidth = 2 * dpr; ctx.lineJoin = "round"; ctx.stroke();

    for (let k = 1; k <= 3; k++) {
      const gY = PT + ((H - PT - PB) * k) / 4;
      ctx.beginPath(); ctx.moveTo(PL, gY); ctx.lineTo(W - PR, gY);
      ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 1; ctx.stroke();
    }
  }, [closes, min, range, stroke, gradTop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    draw(canvas);
    const ro = new ResizeObserver(() => draw(canvas));
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw]);

  const handleMove = (clientX: number) => {
    const wrap = wrapRef.current;
    if (!wrap || closes.length < 2) return;
    const rect = wrap.getBoundingClientRect();
    const pct = (clientX - rect.left) / rect.width;
    const idx = Math.max(0, Math.min(closes.length - 1, Math.round(pct * (closes.length - 1))));
    const H = wrap.clientHeight;
    const y = H - 10 - ((closes[idx] - min) / range) * (H - 24);
    setHover({ idx, x: pct * rect.width, y });
  };

  const pctChange = closes.length > 1
    ? ((closes[closes.length - 1] - closes[0]) / closes[0]) * 100 : 0;

  const wrapW = wrapRef.current?.clientWidth ?? 600;
  let tooltipLeft = hover?.x ?? 0;
  if (tooltipLeft < 70) tooltipLeft = (hover?.x ?? 0) + 70;
  else if (tooltipLeft > wrapW - 70) tooltipLeft = (hover?.x ?? 0) - 70;

  return (
    <div className="select-none">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex rounded-lg border border-line bg-surface-2 p-0.5">
          {PERIODS.map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`num rounded-md px-3 py-1 text-xs font-bold transition-all ${
                period === p ? "bg-accent text-on-accent shadow" : "text-ink-3 hover:text-ink"
              }`}>{p}</button>
          ))}
        </div>
        <div className="text-right">
          <span className="text-xs text-ink-3">{PERIOD_LABEL[period]}</span>
          {!loading && closes.length > 1 && (
            <span className={`num ml-3 text-sm font-bold ${pctChange >= 0 ? "text-gain" : "text-loss"}`}>
              {pctChange >= 0 ? "▲ +" : "▼ "}{pctChange.toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      <div ref={wrapRef} className="relative cursor-crosshair" style={{ height: 210 }}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseLeave={() => setHover(null)}
        onTouchMove={(e) => { e.preventDefault(); handleMove(e.touches[0].clientX); }}
        onTouchEnd={() => setHover(null)}>

        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : closes.length < 2 ? (
          <div className="flex h-full items-center justify-center text-sm text-ink-3">
            No price data available for this period.
          </div>
        ) : (
          <>
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
            {hover && (
              <>
                <div className="pointer-events-none absolute bottom-0 top-0 w-px" style={{ left: hover.x, background: "rgba(143,208,236,0.45)" }} />
                <div className="pointer-events-none absolute left-0 right-0 h-px" style={{ top: hover.y, background: "rgba(143,208,236,0.18)" }} />
                <div className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface"
                  style={{ left: hover.x, top: hover.y, background: stroke }} />
                <div className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-accent-deep bg-surface-3 px-3 py-2"
                  style={{ left: tooltipLeft, top: Math.max(4, hover.y - 62), boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                  <div className="num text-sm font-bold" style={{ color: stroke }}>
                    {currency}{closes[hover.idx]?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="num mt-0.5 text-xs text-ink-3">{points[hover.idx]?.date}</div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {!loading && closes.length > 1 && (
        <div className="num mt-1 flex justify-between text-xs text-ink-3">
          <span>{points[0]?.date}</span>
          <span>low {currency}{Math.round(min).toLocaleString("en-IN")} · high {currency}{Math.round(max).toLocaleString("en-IN")}</span>
          <span>{points[points.length - 1]?.date}</span>
        </div>
      )}
    </div>
  );
}
