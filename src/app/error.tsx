"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "var(--color-bg)" }}>
      <p className="text-4xl mb-4">⚠️</p>
      <p className="text-base font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
        משהו השתבש
      </p>
      <p className="text-xs mb-1 font-mono px-4 py-2 rounded-xl mb-4" style={{ background: "var(--color-border)", color: "var(--color-text-secondary)" }}>
        {error.message}
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 rounded-2xl text-white text-sm font-semibold"
        style={{ background: "var(--color-primary)" }}
      >
        נסי שוב
      </button>
    </div>
  );
}
