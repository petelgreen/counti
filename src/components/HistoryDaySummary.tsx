"use client";

import type { MealEntry } from "@/lib/types";
import GoalProgressRing from "./GoalProgressRing";
import MacroBar from "./MacroBar";

interface Props {
  meals: MealEntry[];
  calorieGoal: number;
}

export default function HistoryDaySummary({ meals, calorieGoal }: Props) {
  const totals = meals.reduce(
    (acc, m) => ({
      calories:  acc.calories  + m.totals.calories,
      protein_g: acc.protein_g + m.totals.protein_g,
      carbs_g:   acc.carbs_g   + m.totals.carbs_g,
      fat_g:     acc.fat_g     + m.totals.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  const proteinTarget = Math.round(calorieGoal * 0.25 / 4);
  const carbsTarget   = Math.round(calorieGoal * 0.50 / 4);
  const fatTarget     = Math.round(calorieGoal * 0.25 / 9);

  const pct       = calorieGoal > 0 ? totals.calories / calorieGoal : 0;
  const overGoal  = totals.calories > calorieGoal;

  const statusLabel =
    meals.length === 0         ? null :
    overGoal                   ? `עברת ב־${Math.round(totals.calories - calorieGoal)} קק"ל` :
    pct >= 0.7                 ? `נותרו ${Math.round(calorieGoal - totals.calories)} קק"ל` :
    `אכלת ${Math.round(totals.calories)} קק"ל`;

  const statusColor =
    overGoal  ? "var(--color-danger)"  :
    pct >= 0.7 ? "var(--color-success)" :
    "var(--color-text-muted)";

  return (
    <div
      className="mx-4 rounded-3xl overflow-hidden animate-fade-in"
      style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-raised)" }}
    >
      {/* Top section */}
      <div className="flex items-center gap-4 px-4 pt-4 pb-3">
        <div className="shrink-0">
          <GoalProgressRing calories={totals.calories} goal={calorieGoal} compact />
        </div>
        <div className="flex-1 space-y-2.5 pt-1">
          <MacroBar label="חלבון"   value={totals.protein_g} max={proteinTarget} color="var(--color-protein)" />
          <MacroBar label="פחמימות" value={totals.carbs_g}   max={carbsTarget}   color="var(--color-carbs)"   />
          <MacroBar label="שומן"    value={totals.fat_g}     max={fatTarget}     color="var(--color-fat)"     />
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "var(--color-bg)", borderTop: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="text-xs font-bold tabular-nums"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {meals.length}
          </span>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {meals.length === 1 ? "ארוחה" : "ארוחות"}
          </span>
        </div>
        {statusLabel && (
          <span className="text-xs font-semibold" style={{ color: statusColor }}>
            {statusLabel}
          </span>
        )}
      </div>
    </div>
  );
}
