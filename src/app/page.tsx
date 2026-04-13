"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { AnalyzeResponse, MealEntry, SavedMeal, DailySettings, FitnessGoal, AccuracyLevel } from "@/lib/types";
import { formatRelativeDay } from "@/lib/dateUtils";
import { useHistoryDay } from "@/hooks/useHistoryDay";
import BottomNav from "@/components/BottomNav";
import BottomSheet from "@/components/BottomSheet";
import MealInputForm from "@/components/MealInputForm";
import MealResultEditor from "@/components/MealResultEditor";
import FloatingLogButton from "@/components/FloatingLogButton";
import DayNavStrip from "@/components/DayNavStrip";
import HistoryDaySummary from "@/components/HistoryDaySummary";
import HistoryMealRow from "@/components/HistoryMealRow";
import DayEmptyState from "@/components/DayEmptyState";
import OnboardingScreen from "@/components/OnboardingScreen";
import Loader from "@/components/ui/loader";

type LogState =
  | { status: "idle" }
  | { status: "reviewing"; result: AnalyzeResponse; inputText: string; imageBase64?: string | null }
  | { status: "editing"; entry: MealEntry };

export default function Home() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [logState, setLogState] = useState<LogState>({ status: "idle" });
  const [logSheetOpen, setLogSheetOpen] = useState(false);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [motivationMsg, setMotivationMsg] = useState<string | null>(null);
  const [toastExiting, setToastExiting] = useState(false);
  const [fitnessGoal, setFitnessGoal] = useState<DailySettings["fitness_goal"]>(null);

  const name = firstName ? `${firstName}, ` : "";
  const MOTIVATION = [
    `${name}כל ארוחה מתועדת היא צעד קדימה 💪`,
    `${name}מעקב עקבי = תוצאות אמיתיות ✨`,
    `${name}את עושה עבודה מדהימה — המשיכי כך! 🌟`,
    `גאה בך${firstName ? ` ${firstName}` : ""} שאת עוקבת אחרי הבריאות שלך 🌿`,
    "הרגלים קטנים, שינויים גדולים. כל כך גאה בך! 🎯",
    "ביקוד ארוחות זה סופר כוח — כל הכבוד! 💚",
    "הגוף שלך אוהב אותך על ההתמדה הזאת 🫶",
    `${name}עוד ארוחה, עוד נתון, עוד צעד לגרסה הטובה ביותר שלך 🔥`,
    "מי שסופרת קלוריות — כבר ניצחה חצי מהדרך! 🏆",
    "אורח חיים בריא נבנה ממעשים קטנים בדיוק כמו זה 🌸",
  ];

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
    addMeal,
    updateMeal,
  } = useHistoryDay();

  const isToday = selectedDate === todayStart;
  const dayLabel = formatRelativeDay(selectedDate);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setOnboarded(data.onboarded === true);
          setFitnessGoal(data.fitness_goal ?? null);
        } else {
          setOnboarded(false);
        }
      })
      .catch(() => setOnboarded(false));
  }, []);

  const loadSavedMeals = useCallback(async () => {
    const res = await fetch("/api/saved-meals");
    if (res.ok) setSavedMeals(await res.json());
  }, []);

  useEffect(() => {
    if (onboarded) loadSavedMeals();
  }, [onboarded, loadSavedMeals]);

  function handleOnboardingComplete(goal: number, fitness?: FitnessGoal, _accuracy?: AccuracyLevel) {
    void goal;
    setFitnessGoal(fitness ?? null);
    setOnboarded(true);
    loadSavedMeals();
  }

  function handleResult(result: AnalyzeResponse, inputText: string, imageBase64?: string | null) {
    setLogState({ status: "reviewing", result, inputText, imageBase64 });
  }

  async function handleSave(result: AnalyzeResponse, inputText: string) {
    const imageBase64 = logState.status === "reviewing" ? logState.imageBase64 : null;
    const entry: MealEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      input_text: inputText,
      items: result.items,
      confidence: result.confidence,
      assumptions: result.assumptions,
      totals: result.totals,
      image_base64: imageBase64,
    };
    await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    addMeal(entry);
    setLogState({ status: "idle" });
    setLogSheetOpen(false);
    const msg = MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)];
    setToastExiting(false);
    setMotivationMsg(msg);
    setTimeout(() => setToastExiting(true), 3200);
    setTimeout(() => setMotivationMsg(null), 4000);
  }

  async function handleSaveEdit(result: AnalyzeResponse) {
    await saveEdit(result);
  }

  function handleCloseLog() {
    setLogSheetOpen(false);
    setLogState({ status: "idle" });
  }

  // Log a saved meal directly (skip analyze)
  async function handleLogSavedMeal(meal: SavedMeal) {
    const entry: MealEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      input_text: meal.name,
      items: meal.items,
      confidence: "high",
      assumptions: `ארוחה שמורה: ${meal.name}`,
      totals: meal.totals,
      image_base64: meal.image_base64,
    };
    await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    addMeal(entry);
    setLogSheetOpen(false);
    const msg = MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)];
    setToastExiting(false);
    setMotivationMsg(msg);
    setTimeout(() => setToastExiting(true), 3200);
    setTimeout(() => setMotivationMsg(null), 4000);
  }

  const logSheetTitle =
    logState.status === "reviewing" ? "בדוק וערוך" :
    logState.status === "editing"   ? "עריכת ארוחה" :
    "רשום ארוחה";

  const savedMealsPanel = (
    <div className="space-y-2">
      {savedMeals.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: "var(--color-text-muted)" }}>
          אין ארוחות שמורות עדיין
        </p>
      ) : (
        savedMeals.map(meal => (
          <button
            key={meal.id}
            onClick={() => handleLogSavedMeal(meal)}
            className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-right transition-colors"
            style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
          >
            {meal.image_base64 && (
              <img src={meal.image_base64} alt={meal.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{meal.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {Math.round(meal.totals.calories)} קק&quot;ל · ח׳ {Math.round(meal.totals.protein_g)}g
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--color-text-muted)", flexShrink: 0 }}>
              <path d="M10 8H6M8 6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
          </button>
        ))
      )}
    </div>
  );

  // Loading / onboarding
  if (onboarded === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <Loader />
      </div>
    );
  }

  if (!onboarded) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--color-bg)" }}>

      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-5 py-3.5"
        style={{
          background: "rgba(255,255,255,0.93)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div>
          <h1 className="text-base font-black" style={{ color: "var(--color-text-primary)" }}>
            {dayLabel}
          </h1>
          {isToday && (
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {new Date().toLocaleDateString("he-IL", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          )}
        </div>
        <button
          onClick={goToToday}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
          style={{
            background: isToday ? "transparent" : "var(--color-primary-light)",
            color: "var(--color-primary)",
            opacity: isToday ? 0 : 1,
            pointerEvents: isToday ? "none" : "auto",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          היום
        </button>
      </header>

      {/* Day navigation strip */}
      {loading ? (
        <div className="flex gap-2 px-4 py-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="skeleton rounded-2xl shrink-0"
              style={{ width: 52, height: 64 }} />
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

      {/* Day summary */}
      {loading ? (
        <div className="mx-4 rounded-3xl skeleton mb-4" style={{ height: 130 }} />
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
              <div key={i} className="rounded-2xl skeleton" style={{ height: 80 }} />
            ))}
          </div>
        ) : mealsForDay.length > 0 ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--color-text-muted)" }}>
              ארוחות · {mealsForDay.length}
            </p>
            <div className="space-y-2">
              {mealsForDay.map(m => (
                <HistoryMealRow key={m.id} entry={m} onEdit={openEdit} onDelete={deleteEntry} />
              ))}
            </div>
          </>
        ) : (
          <DayEmptyState />
        )}
      </div>

      {/* FAB — only show for today */}
      {isToday && (
        <FloatingLogButton onClick={() => setLogSheetOpen(true)} isOpen={logSheetOpen} />
      )}

      <BottomNav />

      {/* Log new meal sheet */}
      <BottomSheet open={logSheetOpen} onClose={handleCloseLog} title={logSheetTitle}>
        {logState.status === "idle" && (
          <MealInputForm onResult={handleResult} savedMealsTab={savedMealsPanel} />
        )}
        {logState.status === "reviewing" && (
          <MealResultEditor
            result={logState.result}
            inputText={logState.inputText}
            onSave={handleSave}
            onDiscard={handleCloseLog}
          />
        )}
      </BottomSheet>

      {/* Motivation toast */}
      {motivationMsg && (
        <div
          className={toastExiting ? "toast-exit" : ""}
          style={{
            position: "fixed",
            top: "calc(env(safe-area-inset-top, 0px) + 16px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 999,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 600,
            color: "white",
            whiteSpace: "nowrap",
            maxWidth: "calc(100vw - 48px)",
            background: "linear-gradient(135deg, #ff8fab 0%, #fb6f92 100%)",
            boxShadow: "0 4px 20px rgba(251,111,146,0.38)",
            animation: toastExiting ? undefined : "toastDropIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
          }}
        >
          <span>✨</span>
          <span dir="rtl">{motivationMsg}</span>
        </div>
      )}

      {/* Edit existing meal sheet */}
      <BottomSheet open={!!editingEntry} onClose={closeEdit} title="עריכת ארוחה">
        {editingEntry && (
          <MealResultEditor
            result={{
              items: editingEntry.items,
              confidence: editingEntry.confidence,
              assumptions: editingEntry.assumptions,
              totals: editingEntry.totals,
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
