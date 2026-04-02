"use client";

import { useState } from "react";

interface Props {
  confidence: "high" | "medium" | "low";
}

const config = {
  high:   { bg: "#F0FDF4", text: "#166534", label: "ביטחון גבוה",   tip: "הנתונים מהימנים — כמויות ברורות ומזון מוכר." },
  medium: { bg: "#FFFBEB", text: "#92400E", label: "ביטחון בינוני", tip: "חלק מהכמויות הוערכו. מומלץ לבדוק ולערוך." },
  low:    { bg: "#FEF2F2", text: "#991B1B", label: "ביטחון נמוך",   tip: "הכמויות או המזון לא ברורים — אנא ערוך את הפריטים." },
};

export default function ConfidenceBadge({ confidence }: Props) {
  const [showTip, setShowTip] = useState(false);
  const c = config[confidence];

  return (
    <div className="relative inline-flex items-center gap-1">
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{ background: c.bg, color: c.text }}
      >
        {c.label}
      </span>
      <button
        type="button"
        onClick={() => setShowTip(!showTip)}
        className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold transition-colors"
        style={{ background: c.bg, color: c.text }}
        aria-label="מידע נוסף"
      >
        ?
      </button>
      {showTip && (
        <div
          className="absolute left-0 top-8 z-10 px-3 py-2 rounded-xl text-xs shadow-lg w-52 animate-fade-in"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}
        >
          {c.tip}
        </div>
      )}
    </div>
  );
}
