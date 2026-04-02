"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

export default function SettingsPage() {
  const [goal, setGoal] = useState(2000);
  const [saved, setSaved] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => setGoal(s.calorie_goal ?? 2000));
  }, []);

  function handleGoalChange(val: number) {
    setGoal(val);
    setSaved(false);
    if (saveTimeout) clearTimeout(saveTimeout);
    const t = setTimeout(async () => {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calorie_goal: val }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
    setSaveTimeout(t);
  }

  function handleReset() {
    localStorage.removeItem("onboarding_complete");
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 pt-6 pb-4"
        style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}
      >
        <Link
          href="/"
          className="flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-gray-100"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>הגדרות</h1>
      </header>

      <div className="px-4 py-6 space-y-4">
        {/* Calorie goal card */}
        <div
          className="rounded-3xl px-5 py-6"
          style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              יעד קלוריות יומי
            </h2>
            {saved && (
              <span className="flex items-center gap-1 text-xs font-medium animate-fade-in" style={{ color: "var(--color-success)" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l3.5 3.5L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                נשמר
              </span>
            )}
          </div>
          <p className="text-xs mb-5" style={{ color: "var(--color-text-muted)" }}>
            נשמר אוטומטית לאחר שינוי
          </p>

          <div className="flex items-baseline justify-center gap-1 mb-5">
            <span className="text-5xl font-bold" style={{ color: "var(--color-primary)" }}>
              {goal.toLocaleString()}
            </span>
            <span className="text-base" style={{ color: "var(--color-text-muted)" }}>קק&quot;ל</span>
          </div>

          <input
            type="range"
            min={1200}
            max={4000}
            step={50}
            value={goal}
            onChange={(e) => handleGoalChange(parseInt(e.target.value))}
            className="w-full cursor-pointer mb-2"
            style={{ accentColor: "var(--color-primary)" }}
          />
          <div className="flex justify-between text-xs" style={{ color: "var(--color-text-muted)" }}>
            <span>1200</span>
            <span>2600</span>
            <span>4000</span>
          </div>
        </div>

        {/* About card */}
        <div
          className="rounded-3xl px-5 py-5"
          style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-card)" }}
        >
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
            אודות
          </h2>
          <div className="space-y-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            <div className="flex justify-between">
              <span>גרסה</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>מנוע AI</span>
              <span className="font-medium">GPT-4o</span>
            </div>
            <div className="flex justify-between">
              <span>אחסון</span>
              <span className="font-medium">מקומי</span>
            </div>
          </div>
        </div>

        {/* Reset onboarding */}
        <button
          onClick={handleReset}
          className="w-full py-3 rounded-2xl text-sm font-medium transition-colors"
          style={{
            border: "1.5px solid var(--color-border)",
            color: "var(--color-text-muted)",
            background: "transparent",
          }}
        >
          הצג מחדש את מסך הפתיחה
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
