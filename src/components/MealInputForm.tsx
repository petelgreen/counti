"use client";

import { useRef, useState } from "react";
import type { AnalyzeResponse, ClarifyQuestion, ClarifyAnswer } from "@/lib/types";
import LoadingState from "./LoadingState";
import ClarifyingQuestionsPanel from "./ClarifyingQuestionsPanel";

type FlowState =
  | { step: "input" }
  | { step: "loading_initial" }
  | { step: "clarifying"; questions: ClarifyQuestion[]; imageBase64: string | null }
  | { step: "loading_final"; imageBase64: string | null };

interface Props {
  onResult: (result: AnalyzeResponse, inputText: string, imageBase64?: string | null) => void;
  savedMealsTab?: React.ReactNode;
}

export default function MealInputForm({ onResult, savedMealsTab }: Props) {
  const [tab, setTab]               = useState<"new" | "saved">("new");
  const [text, setText]             = useState("");
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [flow, setFlow]             = useState<FlowState>({ step: "input" });
  const [focused, setFocused]       = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const answersRef = useRef<ClarifyAnswer[]>([]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;
    answersRef.current = [];
    setError(null);
    setFlow({ step: "loading_initial" });

    try {
      const res = await fetch("/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), image_base64: imagePreview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();

      if (data.phase === "questions" && data.questions?.length > 0) {
        setFlow({ step: "clarifying", questions: data.questions, imageBase64: imagePreview });
      } else {
        await finishWithResult(data.initial_estimate ?? data.result, imagePreview);
      }
    } catch {
      setError("לא הצלחנו לנתח את הארוחה. בדוק את החיבור ונסה שוב.");
      setFlow({ step: "input" });
    }
  }

  async function handleAnswersDone(answers: ClarifyAnswer[]) {
    if (flow.step !== "clarifying") return;
    const { imageBase64 } = flow;
    setFlow({ step: "loading_final", imageBase64 });

    try {
      const res = await fetch("/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), image_base64: imageBase64, answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      await finishWithResult(data.result, imageBase64);
    } catch {
      setError("לא הצלחנו לעבד את התשובות. נסה שנית.");
      setFlow({ step: "input" });
    }
  }

  function finishWithResult(result: AnalyzeResponse, imageBase64: string | null) {
    const inputText = text.trim();
    setText("");
    clearImage();
    setFlow({ step: "input" });
    onResult(result, inputText, imageBase64);
  }

  if (flow.step === "loading_initial") return <LoadingState message="מנתח את הארוחה..." />;
  if (flow.step === "loading_final")   return <LoadingState message="מעבד תשובות..." />;

  if (flow.step === "clarifying") {
    return (
      <div className="space-y-3">
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm"
          style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>כמה שאלות לדיוק עבור: <strong>{text}</strong></span>
        </div>
        <ClarifyingQuestionsPanel questions={flow.questions} onDone={handleAnswersDone} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      {savedMealsTab !== undefined && (
        <div
          className="flex rounded-2xl p-1"
          style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
        >
          {(["new", "saved"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: tab === t ? "var(--color-surface)" : "transparent",
                color: tab === t ? "var(--color-primary)" : "var(--color-text-muted)",
                boxShadow: tab === t ? "var(--shadow-card)" : "none",
              }}
            >
              {t === "new" ? "✍️  ארוחה חדשה" : "📌  מהשמורות"}
            </button>
          ))}
        </div>
      )}

      {tab === "saved" && savedMealsTab}

      {tab === "new" && (
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Textarea with animated border */}
          <div
            className="relative rounded-2xl overflow-hidden transition-all duration-200"
            style={{
              border: `1.5px solid ${focused ? "var(--color-primary)" : "var(--color-border)"}`,
              background: "var(--color-bg)",
              boxShadow: focused ? "0 0 0 3px var(--color-primary-light)" : "none",
            }}
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="מה אכלת? למשל: קציצות עוף עם אורז, סלט ירקות"
              rows={4}
              className="w-full px-4 pt-3 pb-2 text-sm resize-none focus:outline-none bg-transparent"
              style={{
                color: "var(--color-text-primary)",
                lineHeight: 1.65,
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            {text.length > 0 && (
              <div className="flex justify-end px-4 pb-2">
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{text.length}</span>
              </div>
            )}
          </div>

          {/* Image area */}
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="תצוגה מקדימה"
                className="h-28 w-auto object-cover rounded-2xl"
                style={{ border: "1.5px solid var(--color-border)" }}
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-2 -left-2 flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold shadow-md"
                style={{ background: "var(--color-danger)" }}
              >
                ×
              </button>
            </div>
          ) : (
            <label
              className="flex items-center justify-center gap-2.5 rounded-2xl cursor-pointer transition-colors"
              style={{
                border: "1.5px dashed var(--color-border)",
                height: 60,
                color: "var(--color-text-muted)",
                background: "var(--color-bg)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="7.5" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 14l4-4 3 3 3-3 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-medium">הוסף תמונה (אופציונלי)</span>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          )}

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm animate-scale-in"
              style={{ background: "#FEF2F2", color: "var(--color-danger)", border: "1px solid #FECACA" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!text.trim() && !imageFile}
            className="w-full py-3.5 rounded-2xl text-white text-sm font-bold transition-all active:scale-98 disabled:opacity-40"
            style={{
              background: (!text.trim() && !imageFile)
                ? "var(--color-border)"
                : "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
              boxShadow: (!text.trim() && !imageFile) ? "none" : "0 4px 14px rgba(255,107,157,0.35)",
            }}
          >
            נתח את הארוחה ✨
          </button>
        </form>
      )}
    </div>
  );
}
