"use client";

import { useState } from "react";
import type { MealEntry } from "@/lib/types";

interface Props {
  entry: MealEntry;
  onEdit: (entry: MealEntry) => void;
  onDelete: (id: string) => void;
}

// Meal type by hour
function getMealLabel(ts: number) {
  const h = new Date(ts).getHours();
  if (h < 11) return { label: "ארוחת בוקר", color: "#F59E0B" };
  if (h < 15) return { label: "ארוחת צהריים", color: "#3B82F6" };
  if (h < 18) return { label: "חטיף", color: "#8B5CF6" };
  return { label: "ארוחת ערב", color: "var(--color-primary)" };
}

export default function HistoryMealRow({ entry, onEdit, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);

  const time = new Date(entry.timestamp).toLocaleTimeString("he-IL", {
    hour: "2-digit", minute: "2-digit",
  });
  const names  = entry.items.map(i => i.name).join(" · ") || entry.input_text || "ארוחה";
  const meal   = getMealLabel(entry.timestamp);
  const cals   = Math.round(entry.totals.calories);

  return (
    <div
      className="relative rounded-2xl overflow-hidden animate-card-enter"
      style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">

        {/* Image or colored avatar */}
        {entry.image_base64 ? (
          <img
            src={entry.image_base64}
            alt={names}
            className="w-12 h-12 rounded-2xl object-cover shrink-0"
            style={{ border: "1px solid var(--color-border)" }}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center text-lg"
            style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
          >
            🍽️
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
              style={{
                background: meal.color + "18",
                color: meal.color,
              }}
            >
              {meal.label}
            </span>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{time}</span>
          </div>
          <p className="text-sm font-semibold leading-snug" style={{ color: "var(--color-text-primary)" }}>
            {names.length > 48 ? names.slice(0, 48) + "…" : names}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {[
              { val: Math.round(entry.totals.protein_g), label: "ח׳", color: "var(--color-protein)" },
              { val: Math.round(entry.totals.carbs_g),   label: "פ׳", color: "var(--color-carbs)"   },
              { val: Math.round(entry.totals.fat_g),     label: "ש׳", color: "var(--color-fat)"     },
            ].map(({ val, label, color }) => (
              <span key={label} className="text-xs tabular-nums" style={{ color: "var(--color-text-muted)" }}>
                <span style={{ color }}>{label}</span> {val}g
              </span>
            ))}
          </div>
        </div>

        {/* Calories + actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-center">
            <p className="text-xl font-black leading-none tabular-nums" style={{ color: "var(--color-text-primary)" }}>
              {cals}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>קק&quot;ל</p>
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onEdit(entry)}
              className="flex items-center justify-center w-8 h-8 rounded-xl transition-colors"
              style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}
              aria-label="ערוך"
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M9.5 2l2.5 2.5L4 12.5H1.5V10L9.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="flex items-center justify-center w-8 h-8 rounded-xl transition-colors"
              style={{ background: "var(--color-bg)", color: "var(--color-text-muted)" }}
              aria-label="מחק"
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 3.5h9M5 3.5V2.5h4v1M4 3.5v7.5h6V3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Confirm delete overlay */}
      {confirming && (
        <div
          className="absolute inset-0 flex items-center justify-center animate-fade-in"
          style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(4px)" }}
        >
          <div className="text-center px-5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: "#FEE2E2" }}
            >
              <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 3.5h9M5 3.5V2.5h4v1M4 3.5v7.5h6V3.5" stroke="var(--color-danger)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
              למחוק את הארוחה?
            </p>
            <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>לא ניתן לשחזר</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text-secondary)" }}
              >
                ביטול
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--color-danger)" }}
              >
                מחק
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
