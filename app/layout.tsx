import type { Metadata } from "next";
import Link from "next/link";
import TickerBar from "@/components/TickerBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZenInvest — Understand before you invest",
  description:
    "Search any company, see its analysis in plain language, and learn every finance term without leaving the page.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <TickerBar />
        <header className="sticky top-0 z-50 border-b border-line-soft bg-bg/85 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-8">
            <Link href="/" className="text-xl font-bold tracking-tight text-accent">
              ZenInvest
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/"
                className="rounded-lg px-3 py-2 text-ink-2 transition-colors hover:bg-surface-2 hover:text-accent"
              >
                Explore
              </Link>
              <Link
                href="/suggest"
                className="rounded-lg px-3 py-2 text-ink-2 transition-colors hover:bg-surface-2 hover:text-accent"
              >
                Suggestions
              </Link>
            </nav>
          </div>
        </header>



        <main className="mx-auto w-full max-w-6xl flex-grow px-4 py-10 md:px-8 md:py-14">
          {children}
        </main>

        <footer className="border-t border-line-soft">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
            <p className="text-xs leading-relaxed text-ink-3">
              ZenInvest is an educational and informational platform. Scores,
              meters, and suggestions are generated from past data and current
              market conditions — they are not personalized financial advice.
              Markets carry risk; always do your own research. Demo build with
              sample data.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
