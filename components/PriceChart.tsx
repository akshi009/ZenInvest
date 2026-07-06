"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  allPoints: Record<string, number[]>;
  positive: boolean;
  currency: string;
}

type Period = "1D" | "5D" | "1M" | "6M" | "1Y" | "5Y";

const PERIODS: Period[] = ["1D", "5D", "1M", "6M", "1Y", "5Y"];

const PERIOD_DAYS: Record<Period, number> = {
  "1D": 1,
  "5D": 5,
  "1M": 30,
  "6M": 180,
  "1Y": 365,
  "5Y": 1825,
};

const PERIOD_LABEL: Record<Period, string> = {
  "1D": "Today",
  "5D": "Past 5 days",
  "1M": "Past month",
  "6M": "Past 6 months",
  "1Y": "Past year",
  "5Y": "Past 5 years",
};

function genDates(count: number, period: Period): string[] {
  const dates: string[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);

    if (period === "1D") {
      // intraday: 9:15am to 3:30pm IST in 1-min slots
      const totalMins = 375;
      const minAgo = Math.round((i / (count - 1)) * totalMins);
      const close = new Date(now);
      close.setHours(15, 30, 0, 0);
      const t = new Date(close.getTime() - minAgo * 60000);
      dates.push(
        t.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      );
    } else {
      d.setDate(d.getDate() - i);
      if (period === "5Y") {
        dates.push(
          d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
        );
      } else if (period === "1Y") {
        dates.push(
          d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
        );
      } else {
        dates.push(
          d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
        );
      }
    }
  }
  return dates;
}

export default function PriceChart({ allPoints, positive, currency }: Props) {
  const [period, setPeriod] = useState<Period>("6M");
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<{ idx: number; x: number; y: number } | null>(null);

  const points = allPoints[period] ?? [];
  const isPositive =
    points.length > 1 ? points[points.length - 1] >= points[0] : positive;
  const stroke = isPositive ? "#82d6a9" : "#f0a49b";
  const gradTop = isPositive
    ? "rgba(130,214,169,0.22)"
    : "rgba(240,164,155,0.22)";

  const min = points.length ? Math.min(...points) : 0;
  const max = points.length ? Math.max(...points) : 1;
  const range = max - min || 1;
  const dates = genDates(points.length, period);

  const draw = useCallback(
    (canvas: HTMLCanvasElement) => {
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.offsetWidth * dpr;
      const H = canvas.offsetHeight * dpr;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx || points.length < 2) return;

      const PL = 4, PR = 4, PT = 14, PB = 10;
      const px = (i: number) =>
        PL + (i / (points.length - 1)) * (W - PL - PR);
      const py = (v: number) =>
        H - PB - ((v - min) / range) * (H - PT - PB);

      // area
      ctx.beginPath();
      ctx.moveTo(px(0), py(points[0]));
      for (let i = 1; i < points.length; i++) ctx.lineTo(px(i), py(points[i]));
      ctx.lineTo(px(points.length - 1), H - PB);
      ctx.lineTo(px(0), H - PB);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, PT, 0, H);
      grad.addColorStop(0, gradTop);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fill();

      // line
      ctx.beginPath();
      ctx.moveTo(px(0), py(points[0]));
      for (let i = 1; i < points.length; i++) ctx.lineTo(px(i), py(points[i]));
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2 * dpr;
      ctx.lineJoin = "round";
      ctx.stroke();

      // subtle grid
      for (let k = 1; k <= 3; k++) {
        const gY = PT + ((H - PT - PB) * k) / 4;
        ctx.beginPath();
        ctx.moveTo(PL, gY);
        ctx.lineTo(W - PR, gY);
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    },
    [points, min, range, stroke, gradTop]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    draw(canvas);
    const ro = new ResizeObserver(() => draw(canvas));
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw]);

  // reset hover when period changes
  useEffect(() => {
    setHover(null);
  }, [period]);

  const getIdx = (clientX: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return null;
    const rect = wrap.getBoundingClientRect();
    const pct = (clientX - rect.left) / rect.width;
    return Math.max(
      0,
      Math.min(points.length - 1, Math.round(pct * (points.length - 1)))
    );
  };

  const getY = (idx: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return 0;
    const H = wrap.clientHeight;
    const PB = 10, PT = 14;
    return H - PB - ((points[idx] - min) / range) * (H - PT - PB);
  };

  const handleMove = (clientX: number) => {
    const idx = getIdx(clientX);
    if (idx === null) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const pct = idx / (points.length - 1);
    const x = pct * wrap.clientWidth;
    const y = getY(idx);
    setHover({ idx, x, y });
  };

  if (points.length < 2) return null;

  const hPrice = hover !== null ? points[hover.idx] : null;
  const hDate = hover !== null ? dates[hover.idx] : null;
  const wrapW = wrapRef.current?.clientWidth ?? 600;

  let tooltipLeft = hover?.x ?? 0;
  if (tooltipLeft < 70) tooltipLeft = (hover?.x ?? 0) + 70;
  else if (tooltipLeft > wrapW - 70) tooltipLeft = (hover?.x ?? 0) - 70;

  // period change % vs first point
  const pctChange =
    points.length > 1
      ? ((points[points.length - 1] - points[0]) / points[0]) * 100
      : 0;

  return (
    <div className="select-none">
      {/* Period selector */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex rounded-lg border border-line bg-surface-2 p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`num rounded-md px-3 py-1 text-xs font-bold transition-all ${
                period === p
                  ? "bg-accent text-on-accent shadow"
                  : "text-ink-3 hover:text-ink"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="text-right">
          <span className="text-xs text-ink-3">{PERIOD_LABEL[period]}</span>
          <span
            className={`num ml-3 text-sm font-bold ${
              pctChange >= 0 ? "text-gain" : "text-loss"
            }`}
          >
            {pctChange >= 0 ? "▲ +" : "▼ "}
            {pctChange.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Canvas chart */}
      <div
        ref={wrapRef}
        className="relative cursor-crosshair"
        style={{ height: 210 }}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseLeave={() => setHover(null)}
        onTouchMove={(e) => {
          e.preventDefault();
          handleMove(e.touches[0].clientX);
        }}
        onTouchEnd={() => setHover(null)}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {hover && (
          <>
            <div
              className="pointer-events-none absolute bottom-0 top-0 w-px"
              style={{ left: hover.x, background: "rgba(143,208,236,0.45)" }}
            />
            <div
              className="pointer-events-none absolute left-0 right-0 h-px"
              style={{
                top: hover.y,
                background: "rgba(143,208,236,0.18)",
              }}
            />
            <div
              className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface"
              style={{ left: hover.x, top: hover.y, background: stroke }}
            />
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-accent-deep bg-surface-3 px-3 py-2"
              style={{
                left: tooltipLeft,
                top: Math.max(4, hover.y - 62),
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              }}
            >
              <div
                className="num text-sm font-bold"
                style={{ color: stroke }}
              >
                {currency}
                {hPrice?.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="num mt-0.5 text-xs text-ink-3">{hDate}</div>
            </div>
          </>
        )}
      </div>

      {/* Axis labels */}
      <div className="num mt-1 flex justify-between text-xs text-ink-3">
        <span>{dates[0]}</span>
        <span>
          low {currency}
          {Math.round(min).toLocaleString("en-IN")} · high {currency}
          {Math.round(max).toLocaleString("en-IN")}
        </span>
        <span>today</span>
      </div>
    </div>
  );
}
