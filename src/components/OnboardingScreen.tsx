"use client";

import { useState } from "react";
import type { FitnessGoal, AccuracyLevel } from "@/lib/types";
import { GradientSelector, type GradientOption } from "@/components/ui/gradient-selector-card";
import {
  Stepper,
  StepperNav,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
} from "@/components/ui/stepper";

interface Props {
  onComplete: (goal: number, fitness?: FitnessGoal, accuracy?: AccuracyLevel) => void;
}

const FITNESS_OPTIONS: { value: FitnessGoal; label: string; icon: string; desc: string }[] = [
  { value: "lose_weight",  label: "ירידה במשקל",   icon: "📉", desc: "גירעון קלורי מבוקר" },
  { value: "tone",         label: "חיטוב",          icon: "💪", desc: "שריפת שומן + שמירת שריר" },
  { value: "gain_muscle",  label: "עלייה במסה",     icon: "🏋️", desc: "עודף קלורי + חלבון גבוה" },
  { value: "maintain",     label: "שמירה על משקל",  icon: "⚖️", desc: "איזון קלורי יומי" },
  { value: "eat_healthy",  label: "אכילה בריאה",    icon: "🥗", desc: "איכות מעל הכל" },
];

const ACCURACY_OPTIONS: { value: AccuracyLevel; label: string; desc: string; sub: string }[] = [
  { value: "low",    label: "מהיר",    desc: "ללא שאלות",         sub: "AI מעריך בעצמו — מהיר ופשוט" },
  { value: "medium", label: "מאוזן",   desc: "שאלות מינימליות",   sub: "רק על מרכיבים עתירי קלוריות" },
  { value: "high",   label: "מדויק",   desc: "שאלות מלאות",       sub: "שאלות על תוספות, כמויות ורטבים" },
];

export default function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal | null>(null);
  const [accuracyLevel, setAccuracyLevel] = useState<AccuracyLevel>("medium");
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [saving, setSaving] = useState(false);

  async function handleFinish() {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calorie_goal: calorieGoal,
          fitness_goal: fitnessGoal ?? undefined,
          accuracy_level: accuracyLevel,
        }),
      });
      onComplete(calorieGoal, fitnessGoal ?? undefined, accuracyLevel);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>
      {/* Top gradient */}
      <div
        className="flex flex-col items-center pt-12 pb-6 px-6"
        style={{ background: "linear-gradient(180deg, var(--color-primary-light) 0%, var(--color-bg) 100%)" }}
      >
        <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--color-primary)" }}>קאונטי</h1>
        <p className="text-sm mb-2 font-medium" style={{ color: "var(--color-text-secondary)" }}>
          האפליקציה היחידה שמתאימה את רמת הדיוק לך
        </p>
        <p className="text-xs text-center mb-6 px-4" style={{ color: "var(--color-text-muted)" }}>
          בחרי כמה שאלות ה-AI ישאל — מאפס ועד פירוט מלא של כל תוספת ורוטב
        </p>

        {/* Step indicator */}
        <Stepper value={step} className="w-full max-w-xs">
          <StepperNav>
            {[1, 2, 3].map((s) => (
              <StepperItem key={s} step={s}>
                <StepperTrigger asChild>
                  <StepperIndicator />
                </StepperTrigger>
                {s < 3 && <StepperSeparator />}
              </StepperItem>
            ))}
          </StepperNav>
        </Stepper>
      </div>

      {/* Content */}
      <div
        className="flex-1 px-5 pt-6 pb-8"
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
          boxShadow: "var(--shadow-modal)",
        }}
      >
        {/* Step 1: Fitness goal */}
        {step === 1 && (
          <>
            <h2 className="text-lg font-bold text-center mb-1" style={{ color: "var(--color-text-primary)" }}>
              מה המטרה שלך?
            </h2>
            <p className="text-xs text-center mb-5" style={{ color: "var(--color-text-muted)" }}>
              ה-AI יתאים את ההמלצות בהתאם
            </p>
            <div className="space-y-2">
              {FITNESS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFitnessGoal(opt.value)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-right transition-all"
                  style={{
                    border: `2px solid ${fitnessGoal === opt.value ? "var(--color-primary)" : "var(--color-border)"}`,
                    background: fitnessGoal === opt.value ? "var(--color-primary-light)" : "var(--color-bg)",
                  }}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{opt.label}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{opt.desc}</p>
                  </div>
                  {fitnessGoal === opt.value && (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="9" fill="var(--color-primary)" />
                      <path d="M5 9l2.5 2.5L13 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!fitnessGoal}
              className="w-full py-4 rounded-2xl text-white font-semibold text-base mt-5 transition-opacity disabled:opacity-40"
              style={{ background: "var(--color-primary)" }}
            >
              המשך
            </button>
          </>
        )}

        {/* Step 2: Accuracy level */}
        {step === 2 && (
          <>
            <h2 className="text-lg font-bold text-center mb-1" style={{ color: "var(--color-text-primary)" }}>
              כמה דיוק תרצי?
            </h2>
            <p className="text-xs text-center mb-5" style={{ color: "var(--color-text-muted)" }}>
              קובע כמה שאלות ה-AI ישאל לפני שיחשב
            </p>

            <GradientSelector
              options={[
                { id: "low",    label: "מהיר",   value: "low",    color: "#ffb8d0", gradientFrom: "#ffe4ef", gradientTo: "#ffb8d0" },
                { id: "medium", label: "מאוזן",  value: "medium", color: "#ff99bb", gradientFrom: "#ffb8d0", gradientTo: "#ff99bb" },
                { id: "high",   label: "מדויק",  value: "high",   color: "#e0607e", gradientFrom: "#ff99bb", gradientTo: "#e0607e" },
              ]}
              defaultSelected={accuracyLevel}
              onSelectionChange={(opt: GradientOption) => setAccuracyLevel(opt.value as AccuracyLevel)}
              className="mb-4 w-full"
            />

            {/* Description */}
            {ACCURACY_OPTIONS.map((opt) =>
              opt.value === accuracyLevel ? (
                <div
                  key={opt.value}
                  className="rounded-2xl px-4 py-4 mb-6"
                  style={{ background: "var(--color-primary-light)", border: "1px solid var(--color-primary)" }}
                >
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-primary)" }}>{opt.desc}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{opt.sub}</p>
                </div>
              ) : null
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 rounded-2xl font-semibold text-sm transition-colors"
                style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text-muted)", background: "transparent" }}
              >
                חזרה
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-4 rounded-2xl text-white font-semibold text-sm"
                style={{ background: "var(--color-primary)" }}
              >
                המשך
              </button>
            </div>
          </>
        )}

        {/* Step 3: Calorie goal */}
        {step === 3 && (
          <>
            <h2 className="text-lg font-bold text-center mb-1" style={{ color: "var(--color-text-primary)" }}>
              מהו יעד הקלוריות היומי שלך?
            </h2>
            <p className="text-xs text-center mb-6" style={{ color: "var(--color-text-muted)" }}>
              הממוצע הבריאותי הוא 1800–2500. תוכלי לשנות בכל עת.
            </p>

            <div className="flex items-baseline justify-center gap-1 mb-4">
              <span className="text-5xl font-bold" style={{ color: "var(--color-primary)" }}>
                {calorieGoal.toLocaleString()}
              </span>
              <span className="text-base font-medium" style={{ color: "var(--color-text-muted)" }}>
                קק&quot;ל
              </span>
            </div>

            <input
              type="range"
              min={1200}
              max={4000}
              step={50}
              value={calorieGoal}
              onChange={(e) => setCalorieGoal(parseInt(e.target.value))}
              className="w-full mb-2 cursor-pointer"
              style={{ accentColor: "var(--color-primary)" }}
            />
            <div className="flex justify-between text-xs mb-6" style={{ color: "var(--color-text-muted)" }}>
              <span>1200</span>
              <span>2600</span>
              <span>4000</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-4 rounded-2xl font-semibold text-sm"
                style={{ border: "1.5px solid var(--color-border)", color: "var(--color-text-muted)", background: "transparent" }}
              >
                חזרה
              </button>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex-1 py-4 rounded-2xl text-white font-semibold text-sm disabled:opacity-60"
                style={{ background: "var(--color-primary)" }}
              >
                {saving ? "שומר..." : "בוא נתחיל!"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
