type Props = {
  value: number; // 0..1
  size?: number;
  stroke?: number;
};

export function ProgressRing({ value, size = 80, stroke = 8 }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * Math.max(0, Math.min(1, value));
  const pct = Math.round(value * 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--line)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: 'stroke-dasharray 300ms ease-out' }}
        />
      </svg>
      <span className="absolute font-display text-lg font-semibold tabular-nums">
        {pct}%
      </span>
    </div>
  );
}
