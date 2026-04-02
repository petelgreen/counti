"use client";

import { useEffect, useState } from "react";
import type { SavedMeal, MealEntry } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import BottomSheet from "@/components/BottomSheet";
import SavedMealCard from "@/components/SavedMealCard";
import SavedMealEditor from "@/components/SavedMealEditor";

export default function SavedMealsPage() {
  const [meals, setMeals] = useState<SavedMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<SavedMeal | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  useEffect(() => {
    fetch("/api/saved-meals")
      .then(r => r.json())
      .then(data => { setMeals(data); setLoading(false); });
  }, []);

  async function handleSave(data: Omit<SavedMeal, "id" | "created_at">) {
    if (editing) {
      const updated: SavedMeal = { ...editing, ...data };
      await fetch(`/api/saved-meals/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setMeals(prev => prev.map(m => m.id === editing.id ? updated : m));
      showToast("הארוחה עודכנה");
    } else {
      const newMeal: SavedMeal = { ...data, id: crypto.randomUUID(), created_at: Date.now() };
      await fetch("/api/saved-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMeal),
      });
      setMeals(prev => [newMeal, ...prev]);
      showToast("הארוחה נשמרה");
    }
    setSheetOpen(false);
    setEditing(null);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/saved-meals/${id}`, { method: "DELETE" });
    setMeals(prev => prev.filter(m => m.id !== id));
    showToast("הארוחה נמחקה");
  }

  async function handleAddToLog(meal: SavedMeal) {
    const entry: MealEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      input_text: meal.name,
      items: meal.items,
      confidence: "high",
      assumptions: "ארוחה שמורה",
      totals: meal.totals,
    };
    await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    showToast(`"${meal.name}" נוספה ליומן`);
  }

  function openCreate() { setEditing(null); setSheetOpen(true); }
  function openEdit(m: SavedMeal) { setEditing(m); setSheetOpen(true); }
  function closeSheet() { setSheetOpen(false); setEditing(null); }

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 pt-6 pb-4"
        style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}
      >
        <h1 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
          ארוחות שמורות
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "var(--color-primary)" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          חדשה
        </button>
      </header>

      <div className="px-4 py-5 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ height: 80, background: "var(--color-border)" }} />
          ))
        ) : meals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="flex items-center justify-center w-20 h-20 rounded-full mb-5"
              style={{ background: "var(--color-primary-light)" }}
            >
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M18 6C12 6 7 11 7 17c0 7 11 17 11 17s11-10 11-17c0-6-5-11-11-11z" stroke="var(--color-primary)" strokeWidth="2" />
                <circle cx="18" cy="17" r="4" stroke="var(--color-primary)" strokeWidth="2" />
              </svg>
            </div>
            <p className="text-base font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
              אין ארוחות שמורות עדיין
            </p>
            <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
              שמור ארוחות שאתה אוכל לעיתים קרובות כדי להוסיף אותן במהירות
            </p>
            <button
              onClick={openCreate}
              className="px-6 py-3 rounded-2xl text-sm font-semibold text-white"
              style={{ background: "var(--color-primary)" }}
            >
              צור ארוחה שמורה
            </button>
          </div>
        ) : (
          meals.map(m => (
            <SavedMealCard
              key={m.id}
              meal={m}
              onAddToLog={handleAddToLog}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <BottomNav />

      {/* Create / Edit sheet */}
      <BottomSheet
        open={sheetOpen}
        onClose={closeSheet}
        title={editing ? "עריכת ארוחה שמורה" : "ארוחה שמורה חדשה"}
      >
        <SavedMealEditor
          initial={editing}
          onSave={handleSave}
          onCancel={closeSheet}
        />
      </BottomSheet>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-2xl text-sm font-medium text-white shadow-lg animate-fade-in z-50"
          style={{ background: "var(--color-text-primary)" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
