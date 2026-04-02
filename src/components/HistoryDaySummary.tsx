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

  const pct = calorieGoal > 0 ? totals.calories / calorieGoal : 0;
  const statusLabel =
    meals.length === 0 ? null :
    totals.calories > calorieGoal ? `עברת ב-${Math.round(totals.calories - calorieGoal)} קק"ל` :
    pct >= 0.7 ? `נותרו ${Math.round(calorieGoal - totals.calories)} קק"ל` :
    `אכלת ${Math.round(totals.calories)} קק"ל`;

  const statusColor =
    totals.calories > calorieGoal ? "var(--color-danger)" :
    pct >= 0.7 ? "var(--color-success)" :
    "var(--color-text-muted)";

  return (
    <div
      className="mx-4 rounded-2xl px-4 py-4 animate-fade-in"
      style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-raised)" }}
    >
      <div className="flex items-center gap-4">
        {/* Compact ring */}
        <div className="shrink-0">
          <GoalProgressRing calories={totals.calories} goal={calorieGoal} compact />
        </div>

        {/* Macro bars */}
        <div className="flex-1 space-y-2">
          <MacroBar label="חלבון"    value={totals.protein_g} max={proteinTarget} color="var(--color-protein)" />
          <MacroBar label="פחמימות"  value={totals.carbs_g}   max={carbsTarget}   color="var(--color-carbs)"   />
          <MacroBar label="שומן"     value={totals.fat_g}     max={fatTarget}     color="var(--color-fat)"     />
        </div>
      </div>

      {/* Footer row */}
      {statusLabel && (
        <div
          className="flex items-center justify-between mt-3 pt-3"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {meals.length} ארוחות
          </span>
          <span className="text-xs font-semibold" style={{ color: statusColor }}>
            {statusLabel}
          </span>
        </div>
      )}
    </div>
  );
}
