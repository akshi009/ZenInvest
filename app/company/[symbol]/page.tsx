import Link from "next/link";
import { notFound } from "next/navigation";
import Meter from "@/components/Meter";
import PriceChartLive from "@/components/PriceChartLive";
import Term from "@/components/Term";
import { fetchCompany } from "@/lib/api/company-service";

// Dynamic — fetches live data for any symbol
export const dynamic = "force-dynamic";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const c = await fetchCompany(symbol.toUpperCase());
  if (!c) notFound();

  const up = c.changePct >= 0;
  const f = c.fundamentals;
  const t = c.technicals;

  function verdictReason(): string {
    const parts: string[] = [];
    if (f.pe < f.sectorPe) parts.push("priced below its sector average");
    else parts.push("priced above its sector average");
    if (f.revenueGrowth > 10) parts.push("revenue growing fast");
    if (t.trend === "above") parts.push("trading above its long-term trend");
    else parts.push("trading below its long-term trend");
    return parts.join(", ") + ".";
  }

  const rows: { label: React.ReactNode; value: string; note: string }[] = [
    {
      label: <Term k="p/e ratio">P/E ratio</Term>,
      value: f.pe > 0 ? f.pe.toFixed(1) : "N/A",
      note:
        f.pe <= 0
          ? "Not available for this stock under our current data plan"
          : f.pe < f.sectorPe
          ? `Below the sector average of ${f.sectorPe.toFixed(1)} — relatively cheaper than peers`
          : `Above the sector average of ${f.sectorPe.toFixed(1)} — priced richer than peers`,
    },
    {
      label: <Term k="p/b ratio">P/B ratio</Term>,
      value: f.pb > 0 ? f.pb.toFixed(1) : "N/A",
      note:
        f.pb > 0
          ? "How the price compares to the company's on-paper worth"
          : "Not available for this stock under our current data plan",
    },
    {
      label: <Term k="roe">ROE</Term>,
      value: f.roe > 0 ? `${f.roe.toFixed(1)}%` : "N/A",
      note:
        f.roe <= 0
          ? "Not available for this stock under our current data plan"
          : f.roe >= 15
          ? "Strong — the business uses shareholder money efficiently"
          : "Moderate — profits per rupee of shareholder money are average",
    },
    {
      label: <Term k="debt-to-equity">Debt-to-Equity</Term>,
      value: f.debtToEquity > 0 ? f.debtToEquity.toFixed(2) : "N/A",
      note:
        f.debtToEquity <= 0
          ? "Not available for this stock under our current data plan"
          : f.debtToEquity < 0.5
          ? "Low borrowing — less risky if profits dip"
          : "Meaningful borrowing — watch this in downturns",
    },
    {
      label: <Term k="revenue growth">Revenue growth</Term>,
      value: f.revenueGrowth !== 0 ? `${f.revenueGrowth.toFixed(1)}%` : "N/A",
      note:
        f.revenueGrowth === 0
          ? "Not available for this stock under our current data plan"
          : f.revenueGrowth > 10
          ? "Sales growing at a healthy pace year over year"
          : "Sales growing slowly — keep expectations modest",
    },
    {
      label: <Term k="dividend yield">Dividend yield</Term>,
      value: f.dividendYield > 0 ? `${f.dividendYield.toFixed(2)}%` : "N/A",
      note:
        f.dividendYield > 0
          ? "Cash paid back to shareholders each year"
          : "Not available for this stock under our current data plan",
    },
    {
      label: <Term k="rsi">RSI</Term>,
      value: t.rsi.toFixed(0),
      note: t.rsi >= 70
        ? "Momentum is running hot — recent buyers pushed it up fast"
        : t.rsi <= 30
        ? "Deeply sold off recently"
        : "Momentum in a normal range",
    },
    {
      label: <Term k="moving average">200-day trend</Term>,
      value: t.trend === "above" ? "Above" : "Below",
      note: t.trend === "above"
        ? "Trading above its long-term average — trend looks healthy"
        : "Trading below its long-term average — trend is weak",
    },
  ];

  return (
    <div className="flex flex-col gap-12">
      {/* Header */}
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Link href="/" className="text-sm text-ink-3 hover:text-accent">← Explore</Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{c.name}</h1>
          <p className="num mt-1 text-sm text-ink-3">
            {c.market}: {c.symbol} · {c.sector} · {c.cap}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-3">
            <span>IPO: {c.about.founded}</span>
            <span>HQ: {c.about.hq}</span>
            <span>Employees: {c.about.employees}</span>
          </div>
        </div>
        <div className="md:text-right">
          <div className="num text-3xl font-bold">{c.currency}{c.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
          <div className={`num mt-1 font-medium ${up ? "text-gain" : "text-loss"}`}>
            {up ? "▲" : "▼"} {up ? "+" : ""}{c.changePct.toFixed(2)}% today
          </div>
        </div>
      </section>

      {/* Chart + Meter */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="rounded-card border border-line bg-surface p-6">
          <h2 className="mb-1 text-lg font-bold">Price history</h2>
          <p className="mb-5 text-sm text-ink-2">Live data from Yahoo Finance</p>
          <PriceChartLive symbol={c.symbol} currency={c.currency} positive={up} />
        </div>
        <div className="flex flex-col items-center rounded-card border border-line bg-surface p-6 text-center">
          <h2 className="text-lg font-bold">Zen Score</h2>
          <p className="mb-4 mt-1 text-sm text-ink-2">
            Computed from fundamentals, trend, and momentum.
          </p>
          <Meter score={c.score} />
          <p className="mt-4 text-sm leading-relaxed text-ink-2">{verdictReason()}</p>
          <p className="mt-4 border-t border-line-soft pt-3 text-xs leading-relaxed text-ink-3">
            An informational rating, not a buy/sell instruction.
          </p>
        </div>
      </section>

      {/* About */}
      <section className="rounded-card border border-line bg-surface-2 p-6">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-accent">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2Z" stroke="currentColor" strokeWidth="2" />
            <path d="M10 21h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          About {c.name}
        </h2>
        <p className="max-w-4xl leading-7 text-ink-2">{c.about.summary}</p>
      </section>

      {/* Numbers */}
      <section>
        <h2 className="mb-1 text-xl font-bold">The numbers, explained</h2>
        <p className="mb-5 text-sm text-ink-2">Click any underlined term for its meaning.</p>
        <div className="overflow-hidden rounded-card border border-line">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 border-t border-line-soft bg-surface px-5 py-4 first:border-t-0 md:grid-cols-[180px_90px_1fr]">
              <div className="text-sm font-semibold text-ink">{r.label}</div>
              <div className="num text-right text-sm font-bold text-accent md:text-left">{r.value}</div>
              <div className="col-span-2 text-sm text-ink-2 md:col-span-1">{r.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Budget CTA */}
      <section className="flex flex-col items-start gap-4 rounded-card border border-line bg-surface p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold">Not sure where to start?</h2>
          <p className="mt-1 text-sm text-ink-2">Tell us your budget and we&rsquo;ll suggest a mix that fits.</p>
        </div>
        <Link href="/suggest" className="shrink-0 rounded-xl bg-accent px-5 py-3 font-semibold text-on-accent transition-colors hover:bg-accent-deep">
          Enter your budget
        </Link>
      </section>
    </div>
  );
}
