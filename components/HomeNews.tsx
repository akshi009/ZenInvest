"use client";

import { useEffect, useState } from "react";

interface NewsItem {
  id: number;
  headline: string;
  source: string;
  datetime: number;
  url: string;
  related: string;
}

export default function HomeNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((d) => setNews(d.slice(0, 6)))
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-0">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse border-t border-line-soft py-4 first:border-t-0">
            <div className="h-4 w-3/4 rounded bg-surface-3" />
            <div className="mt-2 h-3 w-32 rounded bg-surface-3" />
          </div>
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return <p className="text-sm text-ink-3">Unable to load news right now.</p>;
  }

  return (
    <div>
      {news.map((n) => {
        const ago = Math.round((Date.now() / 1000 - n.datetime) / 86400);
        const timeLabel = ago <= 0 ? "today" : ago === 1 ? "1 day ago" : `${ago} days ago`;
        return (
          <article
            key={n.id}
            className="border-t border-line-soft py-4 transition-colors first:border-t-0 hover:bg-surface/50"
          >
            <a
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium leading-snug text-ink hover:text-accent"
            >
              {n.headline}
            </a>
            <p className="num mt-1 text-xs text-ink-3">
              {n.source} · {timeLabel}
              {n.related && (
                <span className="ml-2 rounded bg-surface-3 px-1.5 py-0.5 text-[10px] font-bold">
                  {n.related.split(",")[0]}
                </span>
              )}
            </p>
          </article>
        );
      })}
    </div>
  );
}
