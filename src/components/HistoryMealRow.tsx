"use client";

import { useState } from "react";
import type { MealEntry } from "@/lib/types";

interface Props {
  entry: MealEntry;
  onEdit: (entry: MealEntry) => void;
  onDelete: (id: string) => void;
}

export default function HistoryMealRow({ entry, onEdit, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);

  const time = new Date(entry.timestamp).toLocaleTimeString("he-IL", {
    hour: "2-digit", minute: "2-digit",
  });
  const names = entry.items.map(i => i.name).join(" · ") || entry.input_text || "ארוחה";

  return (
    <div
      className="relative rounded-2xl overflow-hidden animate-card-enter"
      style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-start justify-between gap-3 px-4 py-3.5">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs mb-0.5" style={{ color: "var(--color-text-muted)" }}>{time}</p>
          <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
            {names}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            ח׳ {Math.round(entry.totals.protein_g)}g · פ׳ {Math.round(entry.totals.carbs_g)}g · ש׳ {Math.round(entry.totals.fat_g)}g
          </p>
        </div>

        {/* Calories + actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-left">
            <p className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
              {Math.round(entry.totals.calories)}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>קק&quot;ל</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => onEdit(entry)}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
              style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}
              aria-label="ערוך"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9.5 2l2.5 2.5L4 12.5H1.5V10L9.5 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-red-50"
              style={{ color: "var(--color-text-muted)" }}
              aria-label="מחק"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 3.5h9M5 3.5V2.5h4v1M4 3.5v7.5h6V3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Confirm delete overlay */}
      {confirming && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-2xl animate-fade-in"
          style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(4px)" }}
        >
          <div className="text-center px-4">
            <p className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
              למחוק את הארוחה?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 py-2 rounded-xl text-sm font-medium border"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
              >
                ביטול
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-white"
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
