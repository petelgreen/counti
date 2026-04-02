"use client";

export default function DayEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div
        className="flex items-center justify-center w-16 h-16 rounded-full mb-4"
        style={{ background: "var(--color-border)" }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="12" stroke="var(--color-text-muted)" strokeWidth="1.8" />
          <path d="M14 9v5.5M14 17.5v.5" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-secondary)" }}>
        אין ארוחות ביום הזה
      </p>
      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        חזור לדף הבית כדי לרשום ארוחה
      </p>
    </div>
  );
}
