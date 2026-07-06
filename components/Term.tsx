"use client";

import { useEffect, useRef, useState } from "react";
import { lookupTerm } from "@/lib/glossary";

const POPOVER_WIDTH = 288; // matches w-72
const VIEWPORT_PADDING = 12;

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
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const entry = lookupTerm(k);

  // Fixed positioning computed from the trigger's real screen position and
  // clamped to stay inside the viewport — a centered `absolute` popover
  // clips off-screen whenever the trigger sits near an edge (mobile, table
  // cells, or any ancestor with `overflow-hidden`).
  const reposition = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const desiredLeft = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
    const maxLeft = window.innerWidth - POPOVER_WIDTH - VIEWPORT_PADDING;
    const left = Math.min(Math.max(desiredLeft, VIEWPORT_PADDING), Math.max(VIEWPORT_PADDING, maxLeft));
    setPos({ top: rect.bottom + 8, left });
  };

  useEffect(() => {
    if (!open) return;
    reposition();

    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onResize = () => reposition();
    const onScroll = () => setOpen(false);

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
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
      {open && pos && (
        <span
          role="tooltip"
          style={{ position: "fixed", top: pos.top, left: pos.left, width: POPOVER_WIDTH }}
          className="z-40 block rounded-xl border border-line bg-surface-3 p-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
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
