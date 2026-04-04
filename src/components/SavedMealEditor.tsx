"use client";

import { useRef, useState } from "react";
import type { MealItem, SavedMeal, ClarifyQuestion, ClarifyAnswer } from "@/lib/types";
import ClarifyingQuestionsPanel from "./ClarifyingQuestionsPanel";

interface Props {
  initial?: SavedMeal | null;
  onSave: (meal: Omit<SavedMeal, "id" | "created_at">) => void;
  onCancel: () => void;
}

const EMPTY_ITEM: MealItem = { name: "", calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };

async function estimateItem(name: string): Promise<MealItem | null> {
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: name }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const first = data.items?.[0];
    if (!first) return null;
    return { name, calories: first.calories, protein_g: first.protein_g, carbs_g: first.carbs_g, fat_g: first.fat_g };
  } catch {
    return null;
  }
}

export default function SavedMealEditor({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [imageBase64, setImageBase64] = useState<string | null>(initial?.image_base64 ?? null);
  const [items, setItems] = useState<MealItem[]>(
    initial?.items.length ? initial.items.map(i => ({ ...i })) : [{ ...EMPTY_ITEM }]
  );
  const [estimating, setEstimating] = useState<number | null>(null);
  const [clarifyingItem, setClarifyingItem] = useState<{ index: number; questions: ClarifyQuestion } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleEstimate(i: number) {
    const item = items[i];
    if (!item.name.trim()) return;
    setEstimating(i);
    setClarifyingItem(null);

    try {
      const res = await fetch("/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: item.name.trim() }),
      });
      const data = await res.json();

      if (data.phase === "questions" && data.questions?.length > 0) {
        // Show clarifying questions inline
        setEstimating(null);
        setClarifyingItem({ index: i, questions: data.questions });
      } else {
        // No questions — use initial estimate directly
        const est = data.initial_estimate ?? data.result;
        if (est?.items?.[0]) {
          const first = est.items[0];
          const updated = [...items];
          updated[i] = { name: item.name, calories: first.calories, protein_g: first.protein_g, carbs_g: first.carbs_g, fat_g: first.fat_g };
          setItems(updated);
        }
        setEstimating(null);
      }
    } catch {
      setEstimating(null);
    }
  }

  async function handleClarifyDone(answers: ClarifyAnswer[]) {
    if (!clarifyingItem) return;
    const { index } = clarifyingItem;
    const itemName = items[index].name;
    setClarifyingItem(null);
    setEstimating(index);

    try {
      const res = await fetch("/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: itemName, answers }),
      });
      const data = await res.json();
      const result = data.result ?? data.initial_estimate;
      if (result?.items?.[0]) {
        const first = result.items[0];
        const updated = [...items];
        updated[index] = { name: itemName, calories: first.calories, protein_g: first.protein_g, carbs_g: first.carbs_g, fat_g: first.fat_g };
        setItems(updated);
      }
    } catch {
      // silently ignore
    } finally {
      setEstimating(null);
    }
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImageBase64(ev.target?.result as string ?? null);
    reader.readAsDataURL(file);
  }

  function updateItem(i: number, field: keyof MealItem, val: string) {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: field === "name" ? val : parseFloat(val) || 0 };
    setItems(updated);
  }

  function removeItem(i: number) { setItems(items.filter((_, idx) => idx !== i)); }
  function addItem()              { setItems([...items, { ...EMPTY_ITEM }]); }

  const totals = items.reduce(
    (acc, it) => ({
      calories:  acc.calories  + (it.calories  || 0),
      protein_g: acc.protein_g + (it.protein_g || 0),
      carbs_g:   acc.carbs_g   + (it.carbs_g   || 0),
      fat_g:     acc.fat_g     + (it.fat_g     || 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  const canSave = name.trim().length > 0 && items.some(i => i.name.trim());

  function handleSave() {
    if (!canSave) return;
    onSave({ name: name.trim(), image_base64: imageBase64, items, totals });
  }

  return (
    <div className="space-y-4">
      {/* Name */}
      <div>
        <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
          שם הארוחה
        </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="למשל: אומלט בוקר"
          className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
          style={{
            border: "1.5px solid var(--color-border)",
            background: "var(--color-bg)",
            color: "var(--color-text-primary)",
          }}
          onFocus={e => (e.target.style.borderColor = "var(--color-primary)")}
          onBlur={e => (e.target.style.borderColor = "var(--color-border)")}
        />
      </div>

      {/* Image */}
      <div>
        <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
          תמונה (אופציונלי)
        </label>
        {imageBase64 ? (
          <div className="relative inline-block">
            <img src={imageBase64} alt="תצוגה" className="h-20 w-auto rounded-xl object-cover" style={{ border: "1px solid var(--color-border)" }} />
            <button
              onClick={() => { setImageBase64(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
              style={{ background: "var(--color-danger)" }}
            >×</button>
          </div>
        ) : (
          <label
            className="flex items-center gap-2 rounded-xl cursor-pointer px-3"
            style={{ border: "1.5px dashed var(--color-border)", height: 52, color: "var(--color-text-muted)" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="1.5" y="3" width="15" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="6.5" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M1.5 13l4-4 3 3 2.5-2.5 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm">העלה תמונה</span>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </label>
        )}
      </div>

      {/* Items */}
      <div>
        <label className="text-xs font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
          פריטי מזון
        </label>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-xl px-3 py-3 space-y-2"
              style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
            >
              <div className="flex items-center gap-2">
                <input
                  value={item.name}
                  onChange={e => updateItem(i, "name", e.target.value)}
                  placeholder="שם הפריט"
                  className="flex-1 text-sm bg-transparent focus:outline-none"
                  style={{ color: "var(--color-text-primary)" }}
                />
                <button
                  onClick={() => handleEstimate(i)}
                  disabled={!item.name.trim() || estimating === i}
                  className="text-xs px-2 py-0.5 rounded-lg font-medium transition-opacity disabled:opacity-40"
                  style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}
                >
                  {estimating === i ? "..." : "AI"}
                </button>
                <button onClick={() => removeItem(i)} style={{ color: "var(--color-danger)" }} className="text-base leading-none">×</button>
              </div>
              {/* Inline clarifying questions for this item */}
              {clarifyingItem?.index === i && (
                <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--color-border)" }}>
                  <ClarifyingQuestionsPanel
                    questions={clarifyingItem.questions as any}
                    onDone={handleClarifyDone}
                    inline
                  />
                </div>
              )}

              <div className="grid grid-cols-4 gap-1.5">
                {([["calories","קק\"ל"],["protein_g","חלב׳"],["carbs_g","פחמ׳"],["fat_g","שומן"]] as [keyof MealItem, string][]).map(([field, label]) => (
                  <div key={field} className="flex flex-col items-center gap-0.5">
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{label}</span>
                    <input
                      type="number"
                      value={item[field] as number}
                      onChange={e => updateItem(i, field, e.target.value)}
                      className="w-full text-center text-xs rounded-lg px-1 py-1 focus:outline-none"
                      style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
                      min={0}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addItem}
          className="flex items-center gap-1 text-sm font-medium mt-2"
          style={{ color: "var(--color-primary)" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          הוסף פריט
        </button>
      </div>

      {/* Totals */}
      <div
        className="flex justify-between items-center px-4 py-3 rounded-xl text-xs font-semibold"
        style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}
      >
        <span>סה&quot;כ</span>
        <div className="flex gap-4">
          <span>ח׳ {Math.round(totals.protein_g)}g</span>
          <span>פ׳ {Math.round(totals.carbs_g)}g</span>
          <span>ש׳ {Math.round(totals.fat_g)}g</span>
          <span className="font-bold text-sm">{Math.round(totals.calories)} קק&quot;ל</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-2xl text-sm font-semibold"
          style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text-secondary)" }}
        >
          ביטול
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: "var(--color-primary)", flex: 2 }}
        >
          {initial ? "שמור שינויים" : "שמור ארוחה"}
        </button>
      </div>
    </div>
  );
}
