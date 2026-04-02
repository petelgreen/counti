"use client";

import { useState } from "react";

interface Props {
  onComplete: (goal: number) => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [goal, setGoal] = useState(2000);
  const [saving, setSaving] = useState(false);

  async function handleStart() {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calorie_goal: goal }),
      });
      localStorage.setItem("onboarding_complete", "true");
      onComplete(goal);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Top illustration area */}
      <div
        className="flex flex-col items-center justify-center flex-1 px-8 pt-16 pb-8"
        style={{
          background: "linear-gradient(180deg, var(--color-primary-light) 0%, var(--color-bg) 100%)",
        }}
      >
        {/* Logo */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-center" style={{ color: "var(--color-primary)" }}>
            קאונטי
          </h1>
          <p className="text-sm text-center mt-1" style={{ color: "var(--color-text-muted)" }}>
            מעקב קלוריות חכם
          </p>
        </div>

        {/* Illustration */}
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none" className="mb-8">
          <circle cx="80" cy="80" r="72" fill="white" opacity="0.7" />
          {/* Plate */}
          <circle cx="80" cy="85" r="42" fill="white" stroke="var(--color-primary)" strokeWidth="3" />
          <circle cx="80" cy="85" r="32" fill="var(--color-primary-light)" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="4 3" />
          {/* Fork */}
          <path d="M52 55v20M52 55c0 0-3 0-3 5v5h6v-5c0-5-3-5-3-5z" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Knife */}
          <path d="M108 55v20M108 55c2-1 5 2 5 8v2h-5" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Food dots on plate */}
          <circle cx="72" cy="80" r="5" fill="var(--color-primary)" opacity="0.4" />
          <circle cx="86" cy="76" r="7" fill="var(--color-warning)" opacity="0.5" />
          <circle cx="80" cy="91" r="6" fill="var(--color-carbs)" opacity="0.4" />
          {/* Sparkles */}
          <path d="M128 30l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="var(--color-warning)" opacity="0.7" />
          <path d="M30 40l1.5 4.5 4.5 1.5-4.5 1.5L30 52l-1.5-4.5L24 46l4.5-1.5z" fill="var(--color-primary)" opacity="0.5" />
        </svg>

        <h2 className="text-xl font-bold text-center mb-2" style={{ color: "var(--color-text-primary)" }}>
          ברוך הבא לקאונטי!
        </h2>
        <p className="text-sm text-center leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          רשום מה אכלת בטקסט או תמונה, ובינה מלאכותית תחשב את הקלוריות בשבילך.
        </p>
      </div>

      {/* Goal setting card */}
      <div
        className="px-5 pt-6 pb-8"
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
          boxShadow: "var(--shadow-modal)",
        }}
      >
        <h3 className="text-base font-semibold mb-1 text-center" style={{ color: "var(--color-text-primary)" }}>
          מהו יעד הקלוריות היומי שלך?
        </h3>
        <p className="text-xs text-center mb-6" style={{ color: "var(--color-text-muted)" }}>
          הממוצע הבריאותי הוא 1800–2500. תוכל לשנות בכל עת.
        </p>

        {/* Goal display */}
        <div className="flex items-baseline justify-center gap-1 mb-4">
          <span className="text-5xl font-bold" style={{ color: "var(--color-primary)" }}>
            {goal.toLocaleString()}
          </span>
          <span className="text-base font-medium" style={{ color: "var(--color-text-muted)" }}>
            קק&quot;ל
          </span>
        </div>

        {/* Slider */}
        <input
          type="range"
          min={1200}
          max={4000}
          step={50}
          value={goal}
          onChange={(e) => setGoal(parseInt(e.target.value))}
          className="w-full mb-6 cursor-pointer"
          style={{ accentColor: "var(--color-primary)" }}
        />

        <div className="flex justify-between text-xs mb-6" style={{ color: "var(--color-text-muted)" }}>
          <span>1200</span>
          <span>2600</span>
          <span>4000</span>
        </div>

        <button
          onClick={handleStart}
          disabled={saving}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-opacity disabled:opacity-60"
          style={{ background: "var(--color-primary)" }}
        >
          {saving ? "שומר..." : "בוא נתחיל"}
        </button>
      </div>
    </div>
  );
}
