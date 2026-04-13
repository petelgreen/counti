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
            <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {item.name || "פריט ללא שם"}
            </p>
          )}

          {/* Quantity badge */}
          {item.quantity && !editing && (
            <span
              className="inline-block text-xs font-medium px-2 py-0.5 rounded-lg mt-0.5 mb-1"
              style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}
            >
              {item.quantity}
            </span>
          )}
          {editing && (
            <input
              value={item.quantity ?? ""}
              onChange={(e) => onUpdate("quantity", e.target.value)}
              placeholder="כמות (כף, 100g...)"
              className="w-full text-xs bg-transparent border-b focus:outline-none mb-1.5"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
            />
          )}

          {/* Macros */}
          <div className="flex gap-3 flex-wrap">
            {(["calories", "protein_g", "carbs_g", "fat_g"] as (keyof MealItem)[]).map((field) => {
              const labels: Record<string, string> = {
                calories: "קק״ל", protein_g: "חלב׳", carbs_g: "פחמ׳", fat_g: "שומן",
              };
              if (field === "name" || field === "quantity") return null;
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
                <span key={field} className="text-xs tabular-nums" style={{ color: "var(--color-text-muted)" }}>
                  <span style={{ color: "var(--color-text-secondary)" }}>{labels[field]}</span>{" "}
                  {Math.round(item[field] as number)}{field !== "calories" ? "g" : ""}
                </span>
              );
            })}
          </div>
        </div>

        {/* Calories + actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="text-center min-w-[40px]">
            <p className="text-lg font-black tabular-nums leading-none" style={{ color: "var(--color-text-primary)" }}>
              {Math.round(item.calories)}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>קק&quot;ל</p>
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setEditing(!editing)}
              className="text-xs px-2 py-1 rounded-lg transition-colors"
              style={{
                background: editing ? "var(--color-primary-light)" : "var(--color-border)",
                color: editing ? "var(--color-primary)" : "var(--color-text-muted)",
              }}
            >
              {editing ? "סיום" : "עדכן"}
            </button>
            <button
              onClick={onRemove}
              className="text-xs px-2 py-1 rounded-lg"
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
  const [saving, setSaving] = useState(false);

  function updateItem(index: number, field: keyof MealItem, raw: string) {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: (field === "name" || field === "quantity") ? raw : parseFloat(raw) || 0,
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
        <p className="text-xs leading-relaxed flex-1 ml-3" style={{ color: "var(--color-text-muted)" }}>
          {result.assumptions}
        </p>
        <ConfidenceBadge confidence={result.confidence} />
      </div>

      {/* Items */}
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

      {/* Add item */}
      <button
        onClick={addItem}
        className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
        style={{ color: "var(--color-primary)" }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        הוסף פריט
      </button>

      {/* Totals */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-2xl"
        style={{ background: "var(--color-primary-light)", border: "1px solid var(--color-primary-mid)" }}
      >
        <span className="text-sm font-bold" style={{ color: "var(--color-primary-dark)" }}>סה&quot;כ</span>
        <div className="flex gap-4 text-xs" style={{ color: "var(--color-primary-dark)" }}>
          <span className="tabular-nums">ח׳ {Math.round(totals.protein_g)}g</span>
          <span className="tabular-nums">פ׳ {Math.round(totals.carbs_g)}g</span>
          <span className="tabular-nums">ש׳ {Math.round(totals.fat_g)}g</span>
          <span className="font-black text-base tabular-nums">{Math.round(totals.calories)} קק&quot;ל</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onDiscard}
          className="flex-1 py-3 rounded-2xl text-sm font-semibold"
          style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text-secondary)" }}
        >
          ביטול
        </button>
        <button
          onClick={async () => {
            if (saving) return;
            setSaving(true);
            await onSave({ ...result, items, totals }, inputText);
          }}
          disabled={items.length === 0 || saving}
          className="py-3 px-6 rounded-2xl text-sm font-bold text-white disabled:opacity-40"
          style={{
            flex: 2,
            background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
            boxShadow: items.length > 0 && !saving ? "0 4px 14px rgba(255,107,157,0.35)" : "none",
          }}
        >
          {saving ? "שומר..." : "שמור ארוחה"}
        </button>
      </div>
    </div>
  );
}
