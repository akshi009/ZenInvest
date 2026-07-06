import Link from "next/link";
import type { Company } from "@/lib/data";

export default function StockCard({ c }: { c: Company }) {
  const up = c.changePct >= 0;
  return (
    <Link
      href={`/company/${c.symbol}`}
      className="group block min-w-[270px] rounded-card border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-deep md:min-w-[300px]"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-3 font-bold text-accent">
            {c.name[0]}
          </div>
          <div>
            <h3 className="font-bold leading-tight text-ink group-hover:text-accent">
              {c.name}
            </h3>
            <span className="num text-xs text-ink-3">
              {c.market}: {c.symbol}
            </span>
          </div>
        </div>
        <span className="rounded bg-surface-3 px-2 py-1 text-[11px] font-semibold text-ink-2">
          {c.sector}
        </span>
      </div>
      <div className="mt-4">
        <div className="num text-2xl font-bold text-ink">
          {c.currency}
          {c.price.toLocaleString("en-IN")}
        </div>
        <div
          className={`num mt-0.5 text-sm font-medium ${up ? "text-gain" : "text-loss"}`}
        >
          {up ? "▲" : "▼"} {up ? "+" : ""}
          {c.changePct.toFixed(2)}%
        </div>
      </div>
      <div className="mt-4 border-t border-line-soft pt-3 text-sm text-ink-2">
        {c.blurb}
      </div>
    </Link>
  );
}
