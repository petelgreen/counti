"use client";

import { useState } from "react";
import type { AnalyzeResponse, MealItem } from "@/lib/types";
import ConfidenceBadge from "./ConfidenceBadge";

interface Props {
  result: AnalyzeResponse;
  inputText: string;
  onSave: (result: AnalyzeResponse, inputText: string) => void;
  onDiscard: () => void;
}

function MealItemCard({
  item,
  onUpdate,
  onRemove,
}: {
  item: MealItem;
  onUpdate: (field: keyof MealItem, val: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div
      className="rounded-2xl px-4 py-3"
      style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              value={item.name}
              onChange={(e) => onUpdate("name", e.target.value)}
              className="w-full text-sm font-semibold bg-transparent border-b focus:outline-none mb-1"
              style={{ borderColor: "var(--color-primary)", color: "var(--color-text-primary)" }}
              autoFocus
            />
          ) : (
            <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
              {item.name || "פריט ללא שם"}
            </p>
          )}
          <div className="flex gap-3 mt-1 flex-wrap">
            {(["calories", "protein_g", "carbs_g", "fat_g"] as (keyof MealItem)[]).map((field) => {
              const labels: Record<keyof MealItem, string> = {
                name: "", calories: "קק\"ל", protein_g: "חלב׳", carbs_g: "פחמ׳", fat_g: "שומן",
              };
              if (field === "name") return null;
              return editing ? (
                <label key={field} className="flex flex-col items-center gap-0.5">
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{labels[field]}</span>
                  <input
                    type="number"
                    value={item[field] as number}
                    onChange={(e) => onUpdate(field, e.target.value)}
                    className="w-14 text-xs text-center rounded-lg px-1 py-0.5 border focus:outline-none"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                    min={0}
                  />
                </label>
              ) : (
                <span key={field} className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {labels[field]} {Math.round(item[field] as number)}
                  {field !== "calories" ? "g" : ""}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <div className="text-left">
            <p className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
              {Math.round(item.calories)}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>קק&quot;ל</p>
          </div>
          <div className="flex flex-col gap-1 mr-1">
            <button
              onClick={() => setEditing(!editing)}
              className="text-xs px-2 py-0.5 rounded-lg transition-colors"
              style={{
                background: editing ? "var(--color-primary-light)" : "var(--color-bg)",
                color: editing ? "var(--color-primary)" : "var(--color-text-muted)",
                border: "1px solid var(--color-border)",
              }}
            >
              {editing ? "סיים" : "ערוך"}
            </button>
            <button
              onClick={onRemove}
              className="text-xs px-2 py-0.5 rounded-lg transition-colors"
              style={{ background: "var(--color-bg)", color: "var(--color-danger)", border: "1px solid var(--color-border)" }}
            >
              הסר
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MealResultEditor({ result, inputText, onSave, onDiscard }: Props) {
  const [items, setItems] = useState<MealItem[]>(result.items.map((i) => ({ ...i })));

  function updateItem(index: number, field: keyof MealItem, raw: string) {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === "name" ? raw : parseFloat(raw) || 0,
    };
    setItems(updated);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function addItem() {
    setItems([...items, { name: "", calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }]);
  }

  const totals = items.reduce(
    (acc, item) => ({
      calories:  acc.calories  + (item.calories  || 0),
      protein_g: acc.protein_g + (item.protein_g || 0),
      carbs_g:   acc.carbs_g   + (item.carbs_g   || 0),
      fat_g:     acc.fat_g     + (item.fat_g     || 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {result.assumptions}
        </p>
        <ConfidenceBadge confidence={result.confidence} />
      </div>

      {/* Item cards */}
      <div className="space-y-2">
        {items.map((item, i) => (
          <MealItemCard
            key={i}
            item={item}
            onUpdate={(f, v) => updateItem(i, f, v)}
            onRemove={() => removeItem(i)}
          />
        ))}
      </div>

      <button
        onClick={addItem}
        className="flex items-center gap-1.5 text-sm font-medium transition-colors"
        style={{ color: "var(--color-primary)" }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        הוסף פריט
      </button>

      {/* Totals summary */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-2xl"
        style={{ background: "var(--color-primary-light)", border: "1px solid #FFD6C0" }}
      >
        <span className="text-sm font-semibold" style={{ color: "var(--color-primary-dark)" }}>
          סה&quot;כ
        </span>
        <div className="flex gap-4 text-xs" style={{ color: "var(--color-primary-dark)" }}>
          <span>ח׳ {Math.round(totals.protein_g)}g</span>
          <span>פ׳ {Math.round(totals.carbs_g)}g</span>
          <span>ש׳ {Math.round(totals.fat_g)}g</span>
          <span className="font-bold text-sm">{Math.round(totals.calories)} קק&quot;ל</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onDiscard}
          className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-colors"
          style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text-secondary)" }}
        >
          ביטול
        </button>
        <button
          onClick={() => onSave({ ...result, items, totals }, inputText)}
          disabled={items.length === 0}
          className="flex-2 py-3 px-6 rounded-2xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: "var(--color-primary)", flex: 2 }}
        >
          שמור ארוחה
        </button>
      </div>
    </div>
  );
}
