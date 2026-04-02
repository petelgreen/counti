"use client";

import { useRef, useState } from "react";
import type { MealEntry } from "@/lib/types";

interface Props {
  entry: MealEntry;
  onDelete: (id: string) => void;
  onEdit: (entry: MealEntry) => void;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

export default function MealCard({ entry, onDelete, onEdit }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const [swipeDx, setSwipeDx] = useState(0);
  const SWIPE_THRESHOLD = 60;

  const itemNames = entry.items.map((i) => i.name).join(" · ");

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    // In RTL, swipe right (positive dx) = "swipe to reveal delete"
    if (dx > 0) setSwipeDx(Math.min(dx, SWIPE_THRESHOLD + 20));
  }

  function handleTouchEnd() {
    if (swipeDx >= SWIPE_THRESHOLD) {
      setConfirmDelete(true);
    }
    setSwipeDx(0);
    touchStartX.current = null;
  }

  function handleDelete() {
    onDelete(entry.id);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl animate-card-enter">
      {/* Delete background */}
      <div
        className="absolute inset-y-0 right-0 flex items-center px-5 rounded-2xl"
        style={{ background: "var(--color-danger)", minWidth: 80 }}
      >
        <span className="text-white text-xs font-semibold">מחק</span>
      </div>

      {/* Card content */}
      <div
        className="relative flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl"
        style={{
          background: "var(--color-surface)",
          boxShadow: "var(--shadow-card)",
          transform: `translateX(${swipeDx > 0 ? swipeDx : 0}px)`,
          transition: swipeDx === 0 ? "transform 300ms ease" : "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {formatTime(entry.timestamp)}
            </span>
          </div>
          <p
            className="text-sm font-medium truncate"
            style={{ color: "var(--color-text-primary)" }}
          >
            {itemNames || entry.input_text || "ארוחה"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            ח׳ {Math.round(entry.totals.protein_g)}g · פ׳ {Math.round(entry.totals.carbs_g)}g · ש׳ {Math.round(entry.totals.fat_g)}g
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
              {Math.round(entry.totals.calories)}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>קק&quot;ל</p>
          </div>
          {/* Edit + Delete buttons (desktop) */}
          <div className="hidden sm:flex gap-1">
            <button
              onClick={() => onEdit(entry)}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-orange-50"
              style={{ color: "var(--color-primary)" }}
              aria-label="ערוך ארוחה"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M10.5 2.5l2 2L5 12H3v-2L10.5 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-red-50"
              style={{ color: "var(--color-text-muted)" }}
              aria-label="מחק ארוחה"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 4h10M6 4V2.5h4V4M5 4v8.5h6V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          {/* Edit button (mobile — always visible) */}
          <button
            onClick={() => onEdit(entry)}
            className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full transition-colors"
            style={{ color: "var(--color-primary)" }}
            aria-label="ערוך ארוחה"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M10.5 2.5l2 2L5 12H3v-2L10.5 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-2xl animate-fade-in"
          style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(4px)" }}
        >
          <div className="text-center px-4">
            <p className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
              למחוק את הארוחה?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
              >
                ביטול
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
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
