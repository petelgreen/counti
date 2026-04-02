"use client";

import type { MealEntry } from "@/lib/types";

interface Props {
  entry: MealEntry;
  onDelete: (id: string) => void;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

export default function MealLogItem({ entry, onDelete }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400">{formatTime(entry.timestamp)}</span>
            {entry.input_text && (
              <span className="text-xs text-gray-500 truncate">{entry.input_text}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {entry.items.map((item, i) => (
              <span key={i} className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-100">
                {item.name}
              </span>
            ))}
          </div>
        </div>
        <div className="text-left shrink-0">
          <p className="text-base font-bold text-gray-900">{Math.round(entry.totals.calories)} קק&quot;ל</p>
          <p className="text-xs text-gray-400">
            ח׳ {Math.round(entry.totals.protein_g)}g · פ׳ {Math.round(entry.totals.carbs_g)}g · ש׳ {Math.round(entry.totals.fat_g)}g
          </p>
        </div>
      </div>
      <div className="mt-2 flex justify-start opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDelete(entry.id)}
          className="text-xs text-gray-300 hover:text-red-400 transition-colors"
        >
          מחק
        </button>
      </div>
    </div>
  );
}
