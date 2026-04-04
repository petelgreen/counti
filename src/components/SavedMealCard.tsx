"use client";

import { useState } from "react";
import type { SavedMeal } from "@/lib/types";

interface Props {
  meal: SavedMeal;
  onAddToLog: (meal: SavedMeal) => void;
  onEdit: (meal: SavedMeal) => void;
  onDelete: (id: string) => void;
}

export default function SavedMealCard({ meal, onAddToLog, onEdit, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    setAdding(true);
    await onAddToLog(meal);
    setAdding(false);
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden animate-card-enter"
      style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Image or icon */}
        <div
          className="shrink-0 w-13 h-13 rounded-2xl overflow-hidden flex items-center justify-center text-2xl"
          style={{
            width: 52, height: 52,
            background: meal.image_base64 ? "transparent" : "var(--color-primary-light)",
          }}
        >
          {meal.image_base64 ? (
            <img src={meal.image_base64} alt={meal.name} className="w-full h-full object-cover" />
          ) : (
            "🥘"
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate mb-0.5" style={{ color: "var(--color-text-primary)" }}>
            {meal.name}
          </p>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded-lg"
              style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}
            >
              {Math.round(meal.totals.calories)} קק&quot;ל
            </span>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              ח׳ {Math.round(meal.totals.protein_g)}g · {meal.items.length} פריטים
            </span>
          </div>
        </div>

        {/* Actions — horizontal row */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onEdit(meal)}
            className="flex items-center justify-center w-8 h-8 rounded-xl transition-colors"
            style={{ background: "var(--color-bg)", color: "var(--color-text-muted)" }}
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
          <button
            onClick={handleAdd}
            disabled={adding}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-white transition-opacity disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)" }}
            aria-label="הוסף ליומן"
          >
            {adding ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            )}
          </button>
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
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 3.5h9M5 3.5V2.5h4v1M4 3.5v7.5h6V3.5" stroke="var(--color-danger)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
              למחוק את &quot;{meal.name}&quot;?
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
                onClick={() => onDelete(meal.id)}
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
