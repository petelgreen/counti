"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import BottomNav from "@/components/BottomNav";
import type { FitnessGoal, AccuracyLevel } from "@/lib/types";

const FITNESS_OPTIONS: { value: FitnessGoal; label: string; icon: string; desc: string }[] = [
  { value: "lose_weight",  label: "ירידה במשקל",  icon: "📉", desc: "גירעון קלורי מבוקר" },
  { value: "tone",         label: "חיטוב",         icon: "💪", desc: "שריפת שומן + שמירת שריר" },
  { value: "gain_muscle",  label: "עלייה במסה",    icon: "🏋️", desc: "עודף קלורי + חלבון גבוה" },
  { value: "maintain",     label: "שמירה על משקל", icon: "⚖️", desc: "איזון קלורי יומי" },
  { value: "eat_healthy",  label: "אכילה בריאה",   icon: "🥗", desc: "איכות מעל הכל" },
];

const ACCURACY_OPTIONS: { value: AccuracyLevel; label: string; sub: string; icon: string }[] = [
  { value: "low",    label: "מהיר",  sub: "ללא שאלות",       icon: "⚡" },
  { value: "medium", label: "מאוזן", sub: "שאלות מינימליות", icon: "⚖️" },
  { value: "high",   label: "מדויק", sub: "שאלות מלאות",    icon: "🎯" },
];

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-base">{icon}</span>
        <h2 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</h2>
      </div>
      {subtitle && <p className="text-xs pr-6" style={{ color: "var(--color-text-muted)" }}>{subtitle}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  const [goal, setGoal]                           = useState(2000);
  const [fitnessGoal, setFitnessGoal]             = useState<FitnessGoal | null>(null);
  const [accuracyLevel, setAccuracyLevel]         = useState<AccuracyLevel>("medium");
  const [saved, setSaved]                         = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
        setGoal(s.calorie_goal ?? 2000);
        setFitnessGoal(s.fitness_goal ?? null);
        setAccuracyLevel(s.accuracy_level ?? "medium");
      });
  }, []);

  function scheduleSave(patch: { calorie_goal?: number; fitness_goal?: FitnessGoal | null; accuracy_level?: AccuracyLevel }) {
    setSaved(false);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 600);
  }

  function handleGoalChange(val: number) {
    setGoal(val);
    scheduleSave({ calorie_goal: val });
  }

  function handleFitnessChange(val: FitnessGoal) {
    setFitnessGoal(val);
    scheduleSave({ fitness_goal: val });
  }

  function handleAccuracyChange(val: AccuracyLevel) {
    setAccuracyLevel(val);
    scheduleSave({ accuracy_level: val });
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--color-bg)" }}>

      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-5 py-4"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <h1 className="text-lg font-black" style={{ color: "var(--color-text-primary)" }}>הגדרות</h1>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full animate-scale-in"
            style={{ background: "#DCFCE7", color: "var(--color-success)" }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l3.5 3.5L12 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            נשמר
          </span>
        )}
      </header>

      <div className="px-4 pt-5 space-y-3">

        {/* Profile card */}
        {session?.user && (
          <div
            className="rounded-3xl overflow-hidden"
            style={{ boxShadow: "var(--shadow-raised)" }}
          >
            {/* Gradient banner */}
            <div
              className="h-16"
              style={{
                background: "linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary-mid) 100%)",
              }}
            />
            <div
              className="px-5 pb-5 pt-0"
              style={{ background: "var(--color-surface)" }}
            >
              <div className="flex items-end justify-between -mt-8 mb-3">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-16 h-16 rounded-2xl object-cover"
                    style={{ border: "3px solid var(--color-surface)", boxShadow: "var(--shadow-raised)" }}
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                    style={{
                      background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
                      border: "3px solid var(--color-surface)",
                      boxShadow: "var(--shadow-raised)",
                    }}
                  >
                    {firstName.charAt(0)}
                  </div>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors mb-1"
                  style={{
                    border: "1.5px solid var(--color-border)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M9 2h2a1 1 0 011 1v8a1 1 0 01-1 1H9M6 10l3-3-3-3M9 7H2"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  התנתקי
                </button>
              </div>
              <p className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
                {session.user.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {session.user.email}
              </p>
            </div>
          </div>
        )}

        {/* Fitness goal */}
        <div
          className="rounded-3xl px-5 py-5"
          style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-card)" }}
        >
          <SectionHeader icon="🎯" title="המטרה שלי" subtitle="ה-AI יתאים המלצות בהתאם" />
          <div className="space-y-2">
            {FITNESS_OPTIONS.map((opt) => {
              const active = fitnessGoal === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleFitnessChange(opt.value)}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-right transition-all"
                  style={{
                    border: `1.5px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
                    background: active ? "var(--color-primary-light)" : "transparent",
                  }}
                >
                  <span className="text-lg shrink-0">{opt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: active ? "var(--color-primary)" : "var(--color-text-primary)" }}
                    >
                      {opt.label}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{opt.desc}</p>
                  </div>
                  {active && (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                      <circle cx="9" cy="9" r="9" fill="var(--color-primary)" />
                      <path d="M4.5 9l3 3L13.5 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accuracy level */}
        <div
          className="rounded-3xl px-5 py-5"
          style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-card)" }}
        >
          <SectionHeader icon="🤖" title="רמת דיוק ה-AI" subtitle="קובע כמה שאלות ה-AI ישאל לפני חישוב" />
          <div className="grid grid-cols-3 gap-2">
            {ACCURACY_OPTIONS.map((opt) => {
              const active = accuracyLevel === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleAccuracyChange(opt.value)}
                  className="flex flex-col items-center gap-1 py-3 px-2 rounded-2xl transition-all"
                  style={{
                    border: `1.5px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
                    background: active ? "var(--color-primary-light)" : "transparent",
                  }}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: active ? "var(--color-primary)" : "var(--color-text-primary)" }}
                  >
                    {opt.label}
                  </span>
                  <span className="text-xs text-center leading-tight" style={{ color: "var(--color-text-muted)" }}>
                    {opt.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Calorie goal */}
        <div
          className="rounded-3xl px-5 py-5"
          style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-card)" }}
        >
          <SectionHeader icon="🔥" title="יעד קלוריות יומי" subtitle="נשמר אוטומטית" />

          <div className="flex items-baseline justify-center gap-1.5 mb-5">
            <span className="text-6xl font-black tabular-nums" style={{ color: "var(--color-primary)" }}>
              {goal.toLocaleString()}
            </span>
            <span className="text-lg font-semibold" style={{ color: "var(--color-text-muted)" }}>קק&quot;ל</span>
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
          <div className="flex justify-between text-xs px-0.5" style={{ color: "var(--color-text-muted)" }}>
            <span>1,200</span>
            <span>2,600</span>
            <span>4,000</span>
          </div>

          {/* Visual context */}
          <div
            className="flex justify-center gap-4 mt-4 pt-4"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            {[
              { label: "ירידה קלה",   range: "1,400–1,800", match: goal >= 1400 && goal <= 1800 },
              { label: "שמירה",       range: "1,800–2,400", match: goal >= 1800 && goal <= 2400 },
              { label: "עלייה",       range: "2,400–3,500", match: goal >= 2400 && goal <= 3500 },
            ].map(({ label, range, match }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span
                  className="text-xs font-semibold"
                  style={{ color: match ? "var(--color-primary)" : "var(--color-text-muted)" }}
                >
                  {label}
                </span>
                <span className="text-xs" style={{ color: "var(--color-text-muted)", fontSize: 10 }}>{range}</span>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div
          className="rounded-3xl px-5 py-5"
          style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-card)" }}
        >
          <SectionHeader icon="ℹ️" title="אודות" />
          <div className="space-y-3">
            {[
              { label: "גרסה",    value: "1.0.4",  icon: "📦" },
              { label: "מנוע AI", value: "GPT-4o", icon: "🧠" },
              { label: "אחסון",   value: "ענן",    icon: "☁️" },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5 px-3 rounded-2xl"
                style={{ background: "var(--color-bg)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{icon}</span>
                  <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{label}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
