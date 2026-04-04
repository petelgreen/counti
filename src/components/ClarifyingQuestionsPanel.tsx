"use client";

import { useState, useCallback } from "react";
import type { ClarifyQuestion, ClarifyAnswer } from "@/lib/types";

interface Props {
  questions: ClarifyQuestion[];
  onDone: (answers: ClarifyAnswer[]) => void;
  inline?: boolean; // true = inside SavedMealEditor, false = inside BottomSheet
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function SkipLink({ onSkip }: { onSkip: () => void }) {
  return (
    <button
      onClick={onSkip}
      className="text-xs underline"
      style={{ color: "var(--color-text-muted)" }}
    >
      דלג על השאלה
    </button>
  );
}

// ─── YesNo question ───────────────────────────────────────────────────────────

interface YesNoProps {
  question: Extract<ClarifyQuestion, { type: "yesno" }>;
  onAnswer: (val: string) => void;
}

function YesNoQuestion({ question, onAnswer }: YesNoProps) {
  return (
    <div className="space-y-4">
      {/* Question card */}
      <div
        className="rounded-2xl px-4 py-4"
        style={{ background: "var(--color-primary-light)", border: "1px solid #FBCFE8" }}
      >
        <p className="text-sm font-semibold leading-relaxed" style={{ color: "var(--color-text-primary)" }}>
          {question.text}
        </p>
        {question.impact_kcal > 0 && (
          <span
            className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: "var(--color-primary-mid)",
              color: "var(--color-primary-dark)",
            }}
          >
            משפיע על ~{question.impact_kcal} קק&quot;ל
          </span>
        )}
      </div>

      {/* לא / כן buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onAnswer("no")}
          className="flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-95"
          style={{
            border: "1.5px solid var(--color-primary)",
            color: "var(--color-primary)",
            background: "white",
          }}
        >
          לא
        </button>
        <button
          onClick={() => onAnswer("yes")}
          className="flex-1 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95"
          style={{ background: "var(--color-primary)" }}
        >
          כן
        </button>
      </div>

      <SkipLink onSkip={() => onAnswer("skip")} />
    </div>
  );
}

// ─── Quantity question ────────────────────────────────────────────────────────

interface QuantityProps {
  question: Extract<ClarifyQuestion, { type: "quantity" }>;
  onAnswer: (val: string) => void;
}

function QuantityQuestion({ question, onAnswer }: QuantityProps) {
  const [amount, setAmount] = useState(question.default_amount);

  const calories = Math.round(amount * question.cal_per_unit);
  const isNone = amount === 0;

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
  }, []);

  const handleConfirm = useCallback(() => {
    onAnswer(String(amount));
  }, [amount, onAnswer]);

  // Format amount for display: show integer if whole number, else 1 decimal
  const formatAmount = (n: number) =>
    n === Math.floor(n) ? String(n) : n.toFixed(1);

  return (
    <div className="space-y-4">
      {/* Question text */}
      <div
        className="rounded-2xl px-4 py-4"
        style={{ background: "var(--color-primary-light)", border: "1px solid #FBCFE8" }}
      >
        <p className="text-sm font-semibold leading-relaxed" style={{ color: "var(--color-text-primary)" }}>
          {question.text}
        </p>
      </div>

      {/* Large amount display */}
      <div className="text-center space-y-1">
        <p
          className="text-4xl font-bold"
          style={{ color: isNone ? "var(--color-text-muted)" : "var(--color-text-primary)" }}
        >
          {isNone ? "ללא" : `${formatAmount(amount)} ${question.unit}`}
        </p>
        <p
          className="text-base font-semibold"
          style={{ color: isNone ? "var(--color-text-muted)" : "var(--color-primary)" }}
        >
          {isNone ? "0 קק\u05b4\u05dfl" : `≈\u00a0${calories} קק\u05b4\u05dfl`}
        </p>
      </div>

      {/* Slider */}
      <div className="space-y-1 px-1">
        <input
          type="range"
          min={question.min_amount}
          max={question.max_amount}
          step={question.step}
          value={amount}
          onChange={handleSlider}
          className="w-full"
          style={{
            accentColor: "var(--color-primary)",
            height: 6,
            cursor: "pointer",
          }}
        />
        {/* Slider labels */}
        <div className="flex justify-between text-xs" style={{ color: "var(--color-text-muted)" }}>
          <span>0 (ללא)</span>
          <span>{formatAmount(question.max_amount)} {question.unit}</span>
        </div>
      </div>

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95"
        style={{ background: isNone ? "var(--color-text-muted)" : "var(--color-primary)" }}
      >
        {isNone ? "ללא" : "אישור"}
      </button>

      <SkipLink onSkip={() => onAnswer("skip")} />
    </div>
  );
}

// ─── Choice question ──────────────────────────────────────────────────────────

interface ChoiceProps {
  question: Extract<ClarifyQuestion, { type: "choice" }>;
  onAnswer: (val: string) => void;
}

function ChoiceQuestion({ question, onAnswer }: ChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleChip = useCallback(
    (label: string) => {
      setSelected(label);
      // Small delay so the selected state visually registers before the panel closes
      setTimeout(() => onAnswer(label), 120);
    },
    [onAnswer]
  );

  const formatDelta = (delta: number) => {
    if (delta === 0) return "ללא השפעה";
    return `${delta > 0 ? "+" : ""}${delta} קק\u05b4\u05dfl`;
  };

  return (
    <div className="space-y-4">
      {/* Question text */}
      <div
        className="rounded-2xl px-4 py-4"
        style={{ background: "var(--color-primary-light)", border: "1px solid #FBCFE8" }}
      >
        <p className="text-sm font-semibold leading-relaxed" style={{ color: "var(--color-text-primary)" }}>
          {question.text}
        </p>
      </div>

      {/* Option chips grid */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
      >
        {question.options.map((opt, i) => {
          const isFirst = i === 0;
          const isActive = selected === opt.label;

          // First option (לא הוספתי) gets gray, others get pink tint when selected
          const chipBg = isActive
            ? isFirst
              ? "#e5e5e5"
              : "var(--color-primary)"
            : isFirst
            ? "var(--color-bg)"
            : "var(--color-primary-light)";

          const chipBorder = isActive
            ? isFirst
              ? "#999"
              : "var(--color-primary-dark)"
            : isFirst
            ? "var(--color-border)"
            : "#FBCFE8";

          const chipTextColor = isActive && !isFirst ? "white" : "var(--color-text-primary)";
          const chipSubColor = isActive && !isFirst ? "rgba(255,255,255,0.85)" : "var(--color-text-muted)";

          return (
            <button
              key={opt.label}
              onClick={() => handleChip(opt.label)}
              className="rounded-2xl px-3 py-3 text-right transition-all active:scale-95 flex flex-col gap-0.5"
              style={{
                background: chipBg,
                border: `1.5px solid ${chipBorder}`,
                textAlign: "right",
              }}
            >
              <span className="text-sm font-semibold leading-snug" style={{ color: chipTextColor }}>
                {opt.label}
              </span>
              <span className="text-xs" style={{ color: chipSubColor }}>
                {formatDelta(opt.cal_delta)}
              </span>
            </button>
          );
        })}
      </div>

      <SkipLink onSkip={() => onAnswer("skip")} />
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function ClarifyingQuestionsPanel({ questions, onDone, inline = false }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ClarifyAnswer[]>([]);
  const [confirmSkipAll, setConfirmSkipAll] = useState(false);
  // Animate key increments each time we advance, triggering the CSS animation
  const [animKey, setAnimKey] = useState(0);

  const total = questions.length;
  const current = questions[currentIndex];
  const progressPct = ((currentIndex) / total) * 100;

  function advance(val: string) {
    const newAnswers: ClarifyAnswer[] = [
      ...answers,
      { question_id: current.id, question_text: current.text, answer: val },
    ];
    setAnswers(newAnswers);

    if (currentIndex + 1 >= total) {
      onDone(newAnswers);
    } else {
      setCurrentIndex(currentIndex + 1);
      setAnimKey(k => k + 1);
    }
  }

  function skipAll() {
    const remaining = questions.slice(currentIndex).map(q => ({
      question_id: q.id,
      question_text: q.text,
      answer: "skip" as const,
    }));
    onDone([...answers, ...remaining]);
  }

  // Render the question body based on type
  function renderQuestion() {
    if (current.type === "yesno") {
      return <YesNoQuestion question={current} onAnswer={advance} />;
    }
    if (current.type === "quantity") {
      return <QuantityQuestion key={current.id} question={current} onAnswer={advance} />;
    }
    if (current.type === "choice") {
      return <ChoiceQuestion key={current.id} question={current} onAnswer={advance} />;
    }
    return null;
  }

  return (
    <div className={`space-y-4 ${inline ? "" : ""}`}>
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
            שאלה {currentIndex + 1} מתוך {total}
          </span>
        </div>
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: 4, background: "var(--color-border)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPct}%`,
              background: "var(--color-primary)",
              // Ensure bar has some minimum visible fill even at 0%
              minWidth: progressPct > 0 ? undefined : 0,
            }}
          />
        </div>
      </div>

      {/* Animated question area */}
      <div
        key={animKey}
        className="animate-fade-in"
      >
        {renderQuestion()}
      </div>

      {/* Skip all */}
      {total > 1 && !confirmSkipAll && (
        <div className="flex justify-end">
          <button
            onClick={() => setConfirmSkipAll(true)}
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            דלג על הכל ✕
          </button>
        </div>
      )}

      {/* Confirm skip all */}
      {confirmSkipAll && (
        <div
          className="rounded-xl px-4 py-3 flex items-center justify-between gap-3 animate-fade-in"
          style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
        >
          <p className="text-xs flex-1" style={{ color: "var(--color-text-muted)" }}>
            דלג על כל השאלות ונתח עם הנתונים הקיימים?
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setConfirmSkipAll(false)}
              className="text-xs px-2 py-1 rounded-lg"
              style={{ color: "var(--color-text-muted)" }}
            >
              בטל
            </button>
            <button
              onClick={skipAll}
              className="text-xs px-3 py-1 rounded-lg text-white font-medium"
              style={{ background: "var(--color-primary)" }}
            >
              דלג
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
