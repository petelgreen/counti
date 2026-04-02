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
        {/* Image or placeholder */}
        <div
          className="shrink-0 w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center"
          style={{ background: "var(--color-primary-light)" }}
        >
          {meal.image_base64 ? (
            <img
              src={meal.image_base64}
              alt={meal.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z" stroke="var(--color-primary)" strokeWidth="1.5" />
              <circle cx="12" cy="10" r="3" stroke="var(--color-primary)" strokeWidth="1.5" />
            </svg>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
            {meal.name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            {Math.round(meal.totals.calories)} קק&quot;ל · ח׳ {Math.round(meal.totals.protein_g)}g · פ׳ {Math.round(meal.totals.carbs_g)}g · ש׳ {Math.round(meal.totals.fat_g)}g
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            {meal.items.length} פריטים
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={handleAdd}
            disabled={adding}
            className="flex items-center justify-center w-8 h-8 rounded-full text-white transition-opacity disabled:opacity-50"
            style={{ background: "var(--color-primary)" }}
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
          <button
            onClick={() => onEdit(meal)}
            className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
            style={{ background: "var(--color-bg)", color: "var(--color-text-muted)" }}
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

      {/* Confirm delete overlay */}
      {confirming && (
        <div
          className="absolute inset-0 flex items-center justify-center animate-fade-in"
          style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(4px)" }}
        >
          <div className="text-center px-4">
            <p className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
              למחוק את &quot;{meal.name}&quot;?
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
                onClick={() => onDelete(meal.id)}
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
