"use client";

interface Props {
  label: string;
  value: number;
  max: number;
  color: string;
  unit?: string;
}

export default function MacroBar({ label, value, max, color, unit = "g" }: Props) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const over = value > max && max > 0;

  return (
    <div className="flex items-center gap-2.5">
      <span
        className="text-xs font-semibold shrink-0 text-right"
        style={{ color: "var(--color-text-secondary)", width: 44 }}
      >
        {label}
      </span>
      <div className="flex-1 relative">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
          <div
            className="h-1.5 rounded-full"
            style={{
              width: `${pct}%`,
              background: over ? "var(--color-danger)" : color,
              transition: "width 600ms var(--ease-smooth)",
            }}
          />
        </div>
      </div>
      <span
        className="text-xs font-bold shrink-0 text-left tabular-nums"
        style={{ color: over ? "var(--color-danger)" : "var(--color-text-primary)", width: 38 }}
      >
        {Math.round(value)}{unit}
      </span>
    </div>
  );
}
