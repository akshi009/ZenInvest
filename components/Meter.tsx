import { verdictFor } from "@/lib/data";

/**
 * The Zen Score gauge — the product's signature element.
 * Pure SVG arc: score 0–10 sweeps the needle 180°.
 */
export default function Meter({ score, size = 200 }: { score: number; size?: number }) {
  const verdict = verdictFor(score);
  const pct = Math.max(0, Math.min(10, score)) / 10;
  const angle = -90 + pct * 180; // needle rotation
  const color =
    verdict === "Favorable"
      ? "var(--color-gain)"
      : verdict === "Neutral"
      ? "var(--color-warn)"
      : "var(--color-loss)";

  // Arc geometry: semicircle from (20,110) to (180,110), r=80
  const sweep = 251.3; // ≈ π * 80
  const dash = pct * sweep;

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg
        viewBox="0 0 200 120"
        width={size}
        height={size * 0.6}
        role="img"
        aria-label={`Zen Score ${score.toFixed(1)} out of 10 — ${verdict}`}
      >
        {/* Track */}
        <path
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke="var(--color-surface-3)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${sweep}`}
        />
        {/* Needle */}
        <g transform={`rotate(${angle} 100 110)`}>
          <line
            x1="100"
            y1="110"
            x2="100"
            y2="42"
            stroke="var(--color-ink)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
        <circle cx="100" cy="110" r="6" fill="var(--color-ink)" />
        {/* Scale labels */}
        <text x="20" y="119" fontSize="9" fill="var(--color-ink-3)" textAnchor="middle">
          0
        </text>
        <text x="180" y="119" fontSize="9" fill="var(--color-ink-3)" textAnchor="middle">
          10
        </text>
      </svg>
      <div className="num -mt-3 text-3xl font-bold" style={{ color }}>
        {score.toFixed(1)}
      </div>
      <div className="mt-1 text-sm font-semibold" style={{ color }}>
        {verdict}
      </div>
    </div>
  );
}
