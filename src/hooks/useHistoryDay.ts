"use client";

import { useCallback, useEffect, useReducer } from "react";
import type { AnalyzeResponse, MealEntry } from "@/lib/types";
import { dayStart, daysAgo } from "@/lib/dateUtils";

const DAYS_BACK = 30;

interface State {
  allMeals: MealEntry[];
  selectedDate: number;      // day-start timestamp
  calorieGoal: number;
  loading: boolean;
  editingEntry: MealEntry | null;
}

type Action =
  | { type: "LOADED"; meals: MealEntry[]; goal: number }
  | { type: "SELECT_DAY"; date: number }
  | { type: "OPEN_EDIT"; entry: MealEntry }
  | { type: "CLOSE_EDIT" }
  | { type: "UPDATE_MEAL"; updated: MealEntry }
  | { type: "DELETE_MEAL"; id: string }
  | { type: "ADD_MEAL"; meal: MealEntry };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOADED":
      return { ...state, allMeals: action.meals, calorieGoal: action.goal, loading: false };
    case "SELECT_DAY":
      return { ...state, selectedDate: action.date };
    case "OPEN_EDIT":
      return { ...state, editingEntry: action.entry };
    case "CLOSE_EDIT":
      return { ...state, editingEntry: null };
    case "UPDATE_MEAL":
      return { ...state, allMeals: state.allMeals.map(m => m.id === action.updated.id ? action.updated : m), editingEntry: null };
    case "DELETE_MEAL":
      return { ...state, allMeals: state.allMeals.filter(m => m.id !== action.id) };
    case "ADD_MEAL":
      return { ...state, allMeals: [...state.allMeals, action.meal] };
    default:
      return state;
  }
}

export function useHistoryDay() {
  const todayStart = dayStart(Date.now());
  const [state, dispatch] = useReducer(reducer, {
    allMeals: [],
    selectedDate: todayStart,
    calorieGoal: 2000,
    loading: true,
    editingEntry: null,
  });

  const load = useCallback(async () => {
    const from = daysAgo(DAYS_BACK);
    const to   = Date.now();
    const [mealsRes, settingsRes] = await Promise.all([
      fetch(`/api/meals?from=${from}&to=${to}`),
      fetch("/api/settings"),
    ]);
    const meals: MealEntry[]  = mealsRes.ok    ? await mealsRes.json()    : [];
    const settings            = settingsRes.ok ? await settingsRes.json() : { calorie_goal: 2000 };
    dispatch({ type: "LOADED", meals, goal: settings.calorie_goal ?? 2000 });
  }, []);

  useEffect(() => { load(); }, [load]);

  // Computed
  const mealsForDay = state.allMeals.filter(
    m => dayStart(m.timestamp) === state.selectedDate
  );

  // Build 30-day metadata for strip
  const daysMetadata = Array.from({ length: DAYS_BACK + 1 }, (_, i) => {
    const date = daysAgo(i);
    const meals = state.allMeals.filter(m => dayStart(m.timestamp) === date);
    return { date, hasData: meals.length > 0, totalCal: meals.reduce((s, m) => s + m.totals.calories, 0) };
  }).reverse(); // oldest first → today last

  async function saveEdit(result: AnalyzeResponse) {
    if (!state.editingEntry) return;
    const updated: MealEntry = {
      ...state.editingEntry,
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
    dispatch({ type: "UPDATE_MEAL", updated });
  }

  async function deleteEntry(id: string) {
    await fetch(`/api/meals/${id}`, { method: "DELETE" });
    dispatch({ type: "DELETE_MEAL", id });
  }

  return {
    ...state,
    mealsForDay,
    daysMetadata,
    todayStart,
    selectDay:  (date: number) => dispatch({ type: "SELECT_DAY", date }),
    openEdit:   (entry: MealEntry) => dispatch({ type: "OPEN_EDIT", entry }),
    closeEdit:  () => dispatch({ type: "CLOSE_EDIT" }),
    saveEdit,
    deleteEntry,
    goToToday:  () => dispatch({ type: "SELECT_DAY", date: todayStart }),
    addMeal:    (meal: MealEntry) => dispatch({ type: "ADD_MEAL", meal }),
    updateMeal: (updated: MealEntry) => dispatch({ type: "UPDATE_MEAL", updated }),
  };
}
