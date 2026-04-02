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

  return (
    <div className="flex items-center gap-3">
      <span
        className="text-xs font-medium w-16 text-right shrink-0"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full" style={{ background: "var(--color-border)" }}>
        <div
          className="h-2 rounded-full"
          style={{
            width: `${pct}%`,
            background: color,
            transition: "width 600ms ease",
          }}
        />
      </div>
      <span
        className="text-xs font-semibold w-12 text-left shrink-0"
        style={{ color: "var(--color-text-primary)" }}
      >
        {Math.round(value)}{unit}
      </span>
    </div>
  );
}
