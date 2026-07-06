"use client";

import { useEffect, useRef, useState } from "react";
import { lookupTerm } from "@/lib/glossary";

/**
 * Inline glossary term. Click (or tap) to open a definition popover —
 * hover-only tooltips don't work on phones, and this product's core promise
 * is "never leave the page to understand a word."
 */
export default function Term({
  k,
  children,
}: {
  k: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const entry = lookupTerm(k);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  if (!entry) return <>{children}</>;

  return (
    <span ref={ref} className="relative inline-block">
      <button
        type="button"
        className="term"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {children}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 z-40 mt-2 block w-72 -translate-x-1/2 rounded-xl border border-line bg-surface-3 p-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
        >
          <span className="mb-1 block text-sm font-bold text-accent">
            {entry.term}
          </span>
          <span className="block text-sm leading-relaxed text-ink">
            {entry.definition}
          </span>
          <span className="mt-2 block border-t border-line-soft pt-2 text-xs leading-relaxed text-ink-2">
            <span className="font-semibold text-ink-2">Example: </span>
            {entry.example}
          </span>
        </span>
      )}
    </span>
  );
}
