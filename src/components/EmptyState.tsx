"use client";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      {/* Inline SVG illustration */}
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="mb-5 opacity-60">
        <circle cx="48" cy="48" r="44" fill="var(--color-primary-light)" />
        {/* Bowl */}
        <ellipse cx="48" cy="56" rx="22" ry="8" fill="white" stroke="var(--color-primary)" strokeWidth="2.5" />
        <path d="M26 56 Q26 72 48 72 Q70 72 70 56" fill="white" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Steam lines */}
        <path d="M38 44 Q40 40 38 36" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <path d="M48 42 Q50 38 48 34" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <path d="M58 44 Q60 40 58 36" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>

      <h3 className="text-base font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
        עדיין לא אכלת היום
      </h3>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
        לחץ על הכפתור הכתום למטה כדי לרשום את הארוחה הראשונה שלך
      </p>

      {/* Arrow pointing down toward FAB */}
      <div className="animate-arrow-bounce">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 3v11M10 14l-4-4M10 14l4-4" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
