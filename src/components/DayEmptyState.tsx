"use client";

export default function DayEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-6">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 animate-pop-in"
        style={{ background: "var(--color-primary-light)" }}
      >
        <span className="text-4xl" style={{ lineHeight: 1 }}>🍽️</span>
      </div>
      <p className="text-base font-bold mb-1.5" style={{ color: "var(--color-text-primary)" }}>
        אין ארוחות עדיין
      </p>
      <p className="text-sm max-w-[220px] leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        תעדי את הארוחה הראשונה שלך היום
      </p>

      {/* Animated arrow */}
      <div className="mt-6 flex items-center justify-center animate-arrow-bounce">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 3v12M4 10l6 6 6-6" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
