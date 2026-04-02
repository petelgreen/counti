"use client";

import { useHistoryDay } from "@/hooks/useHistoryDay";
import { formatRelativeDay } from "@/lib/dateUtils";
import BottomNav from "@/components/BottomNav";
import BottomSheet from "@/components/BottomSheet";
import MealResultEditor from "@/components/MealResultEditor";
import DayNavStrip from "@/components/DayNavStrip";
import HistoryDaySummary from "@/components/HistoryDaySummary";
import HistoryMealRow from "@/components/HistoryMealRow";
import DayEmptyState from "@/components/DayEmptyState";
import type { AnalyzeResponse } from "@/lib/types";

export default function HistoryPage() {
  const {
    loading,
    selectedDate,
    todayStart,
    mealsForDay,
    daysMetadata,
    calorieGoal,
    editingEntry,
    selectDay,
    openEdit,
    closeEdit,
    saveEdit,
    deleteEntry,
    goToToday,
  } = useHistoryDay();

  const isToday = selectedDate === todayStart;
  const dayLabel = formatRelativeDay(selectedDate);

  async function handleSaveEdit(result: AnalyzeResponse) {
    await saveEdit(result);
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--color-bg)" }}>

      {/* Sticky header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <h1 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
          היסטוריה
        </h1>
        <button
          onClick={goToToday}
          className="text-sm font-semibold transition-opacity"
          style={{
            color: "var(--color-primary)",
            opacity: isToday ? 0 : 1,
            pointerEvents: isToday ? "none" : "auto",
          }}
        >
          היום
        </button>
      </header>

      {/* Day navigation strip */}
      {loading ? (
        <div className="flex gap-2 px-4 py-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl animate-pulse shrink-0"
              style={{ width: 52, height: 64, background: "var(--color-border)" }}
            />
          ))}
        </div>
      ) : (
        <DayNavStrip
          days={daysMetadata}
          selectedDate={selectedDate}
          todayStart={todayStart}
          onSelect={selectDay}
        />
      )}

      {/* Selected day label */}
      <div className="px-4 mb-3">
        <p className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
          {dayLabel}
        </p>
      </div>

      {/* Day summary card */}
      {loading ? (
        <div
          className="mx-4 rounded-2xl animate-pulse mb-4"
          style={{ height: 130, background: "var(--color-border)" }}
        />
      ) : (
        <div className="mb-4">
          <HistoryDaySummary meals={mealsForDay} calorieGoal={calorieGoal} />
        </div>
      )}

      {/* Meal list */}
      <div className="px-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl animate-pulse"
                style={{ height: 76, background: "var(--color-border)" }}
              />
            ))}
          </div>
        ) : mealsForDay.length > 0 ? (
          <>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--color-text-muted)" }}
            >
              ארוחות · {mealsForDay.length}
            </p>
            <div className="space-y-2">
              {mealsForDay.map(m => (
                <HistoryMealRow
                  key={m.id}
                  entry={m}
                  onEdit={openEdit}
                  onDelete={deleteEntry}
                />
              ))}
            </div>
          </>
        ) : (
          <DayEmptyState />
        )}
      </div>

      <BottomNav />

      {/* Edit bottom sheet */}
      <BottomSheet
        open={!!editingEntry}
        onClose={closeEdit}
        title="עריכת ארוחה"
      >
        {editingEntry && (
          <MealResultEditor
            result={{
              items:       editingEntry.items,
              confidence:  editingEntry.confidence,
              assumptions: editingEntry.assumptions,
              totals:      editingEntry.totals,
            }}
            inputText={editingEntry.input_text}
            onSave={handleSaveEdit}
            onDiscard={closeEdit}
          />
        )}
      </BottomSheet>
    </div>
  );
}
