"use client";

import { useEffect, useState, useCallback } from "react";
import type { AnalyzeResponse, MealEntry, DailySettings } from "@/lib/types";
import DashboardHeader from "@/components/DashboardHeader";
import DailySummary from "@/components/DailySummary";
import MealCard from "@/components/MealCard";
import EmptyState from "@/components/EmptyState";
import FloatingLogButton from "@/components/FloatingLogButton";
import BottomSheet from "@/components/BottomSheet";
import BottomNav from "@/components/BottomNav";
import MealInputForm from "@/components/MealInputForm";
import MealResultEditor from "@/components/MealResultEditor";
import OnboardingScreen from "@/components/OnboardingScreen";

type LogState =
  | { status: "idle" }
  | { status: "reviewing"; result: AnalyzeResponse; inputText: string }
  | { status: "editing"; entry: MealEntry };

export default function Home() {
  const [logState, setLogState] = useState<LogState>({ status: "idle" });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [onboarded, setOnboarded] = useState<boolean | null>(null); // null = loading

  const loadMeals = useCallback(async () => {
    const res = await fetch(`/api/meals?date=${Date.now()}`);
    if (res.ok) setMeals(await res.json());
  }, []);

  const loadSettings = useCallback(async () => {
    const res = await fetch("/api/settings");
    if (res.ok) {
      const s: DailySettings = await res.json();
      setCalorieGoal(s.calorie_goal);
    }
  }, []);

  useEffect(() => {
    const done = localStorage.getItem("onboarding_complete") === "true";
    setOnboarded(done);
    if (done) {
      loadMeals();
      loadSettings();
    }
  }, [loadMeals, loadSettings]);

  function handleOnboardingComplete(goal: number) {
    setCalorieGoal(goal);
    setOnboarded(true);
    loadMeals();
  }

  function handleResult(result: AnalyzeResponse, inputText: string) {
    setLogState({ status: "reviewing", result, inputText });
  }

  async function handleSave(result: AnalyzeResponse, inputText: string) {
    const entry: MealEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      input_text: inputText,
      items: result.items,
      confidence: result.confidence,
      assumptions: result.assumptions,
      totals: result.totals,
    };

    await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });

    setMeals((prev) => [...prev, entry]);
    setLogState({ status: "idle" });
    setSheetOpen(false);
  }

  function handleEditOpen(entry: MealEntry) {
    setLogState({ status: "editing", entry });
    setSheetOpen(true);
  }

  async function handleEditSave(result: AnalyzeResponse, _inputText: string) {
    if (logState.status !== "editing") return;
    const updated: MealEntry = {
      ...logState.entry,
      items: result.items,
      confidence: result.confidence,
      assumptions: result.assumptions,
      totals: result.totals,
    };

    await fetch(`/api/meals/${updated.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    setMeals((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setLogState({ status: "idle" });
    setSheetOpen(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/meals/${id}`, { method: "DELETE" });
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }

  function handleCloseSheet() {
    setSheetOpen(false);
    setLogState({ status: "idle" });
  }

  // Loading state
  if (onboarded === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-2 h-2 rounded-full"
              style={{
                background: "var(--color-primary)",
                animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Onboarding
  if (!onboarded) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  const sheetTitle =
    logState.status === "reviewing" ? "בדוק ועדוך" :
    logState.status === "editing"   ? "עריכת ארוחה" :
    "רשום ארוחה";

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--color-bg)" }}>
      <DashboardHeader />

      {/* Summary card */}
      <div className="mt-3 mb-5">
        <DailySummary meals={meals} calorieGoal={calorieGoal} />
      </div>

      {/* Meals list */}
      <div className="px-4">
        {meals.length > 0 ? (
          <>
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-3 px-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              ארוחות היום
            </h3>
            <div className="space-y-2">
              {meals.map((m) => (
                <MealCard key={m.id} entry={m} onDelete={handleDelete} onEdit={handleEditOpen} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* FAB */}
      <FloatingLogButton
        onClick={() => setSheetOpen(true)}
        isOpen={sheetOpen}
      />

      {/* Bottom nav */}
      <BottomNav />

      {/* Meal logging bottom sheet */}
      <BottomSheet open={sheetOpen} onClose={handleCloseSheet} title={sheetTitle}>
        {logState.status === "idle" && (
          <MealInputForm onResult={handleResult} />
        )}
        {logState.status === "reviewing" && (
          <MealResultEditor
            result={logState.result}
            inputText={logState.inputText}
            onSave={handleSave}
            onDiscard={handleCloseSheet}
          />
        )}
        {logState.status === "editing" && (
          <MealResultEditor
            result={{
              items: logState.entry.items,
              confidence: logState.entry.confidence,
              assumptions: logState.entry.assumptions,
              totals: logState.entry.totals,
            }}
            inputText={logState.entry.input_text}
            onSave={handleEditSave}
            onDiscard={handleCloseSheet}
          />
        )}
      </BottomSheet>
    </div>
  );
}
