"use client";

import type { MealEntry } from "@/lib/types";
import GoalProgressRing from "./GoalProgressRing";
import MacroBar from "./MacroBar";

interface Props {
  meals: MealEntry[];
  calorieGoal: number;
}

export default function DailySummary({ meals, calorieGoal }: Props) {
  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.totals.calories,
      protein_g: acc.protein_g + m.totals.protein_g,
      carbs_g: acc.carbs_g + m.totals.carbs_g,
      fat_g: acc.fat_g + m.totals.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  // Rough macro targets based on calorie goal
  const proteinTarget = Math.round(calorieGoal * 0.25 / 4);
  const carbsTarget   = Math.round(calorieGoal * 0.50 / 4);
  const fatTarget     = Math.round(calorieGoal * 0.25 / 9);

  return (
    <div
      className="mx-4 rounded-3xl px-5 pt-6 pb-5"
      style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-raised)" }}
    >
      {/* Progress ring centered */}
      <div className="flex justify-center mb-5">
        <GoalProgressRing calories={totals.calories} goal={calorieGoal} />
      </div>

      {/* Macro bars */}
      <div className="space-y-3">
        <MacroBar
          label="חלבון"
          value={totals.protein_g}
          max={proteinTarget}
          color="var(--color-protein)"
        />
        <MacroBar
          label="פחמימות"
          value={totals.carbs_g}
          max={carbsTarget}
          color="var(--color-carbs)"
        />
        <MacroBar
          label="שומן"
          value={totals.fat_g}
          max={fatTarget}
          color="var(--color-fat)"
        />
      </div>
    </div>
  );
}
