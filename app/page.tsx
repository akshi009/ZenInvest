import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import Term from "@/components/Term";
import TopPerformersSection from "@/components/TopPerformersSection";
import HomeNews from "@/components/HomeNews";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      {/* Hero */}
      <section>
        <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          Understand a company{" "}
          <span className="text-accent">before</span> you invest in it.
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-2">
          Search any stock for a plain-language analysis, or start from your
          budget and let the data suggest a fit. Every finance term is
          explained right where you read it — no second tab needed.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr]">
          <SearchBar />
          <Link
            href="/suggest"
            className="flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-semibold text-on-accent transition-colors hover:bg-accent-deep"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M16 13h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" />
            </svg>
            Enter your budget
          </Link>
        </div>
      </section>

      {/* Top performers — client component fetches live, market-filtered */}
      <section>
        <TopPerformersSection />
      </section>

      {/* Weekly news — client component fetches live */}
      <section className="max-w-3xl">
        <h2 className="mb-2 text-xl font-bold">Latest market news</h2>
        <p className="mb-4 text-sm text-ink-2">
          Financial terms like{" "}
          <Term k="repo rate">repo rate</Term> are clickable — try it.
        </p>
        <HomeNews />
      </section>
    </div>
  );
}
