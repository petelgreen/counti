"use client";

import { useRef, useState } from "react";
import type { AnalyzeResponse } from "@/lib/types";
import LoadingState from "./LoadingState";

interface Props {
  onResult: (result: AnalyzeResponse, inputText: string) => void;
}

export default function MealInputForm({ onResult }: Props) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("text", text.trim());
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error("הניתוח נכשל. נסה שנית.");

      onResult(data, text.trim());
      setText("");
      clearImage();
    } catch {
      setError("לא הצלחנו לנתח את הארוחה. בדוק את החיבור ונסה שוב.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Text input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="מה אכלת? לדוגמה: פסטה בולונז בגודל בינוני, סלט ירקות"
        rows={4}
        className="w-full rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2"
        style={{
          background: "var(--color-bg)",
          border: "1.5px solid var(--color-border)",
          color: "var(--color-text-primary)",
          lineHeight: 1.6,
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
      />

      {/* Image upload */}
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
            className="absolute -top-2 -left-2 flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold shadow"
            style={{ background: "var(--color-danger)" }}
          >
            ×
          </button>
        </div>
      ) : (
        <label
          className="flex items-center justify-center gap-2 rounded-2xl cursor-pointer transition-colors"
          style={{
            border: "1.5px dashed var(--color-border)",
            height: 72,
            color: "var(--color-text-muted)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="7.5" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 14l4-4 3 3 3-3 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-medium">צלם או העלה תמונה (אופציונלי)</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
      )}

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm"
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
        className="w-full py-3.5 rounded-2xl text-white text-sm font-semibold transition-opacity disabled:opacity-40"
        style={{ background: "var(--color-primary)" }}
      >
        נתח את הארוחה
      </button>
    </form>
  );
}
