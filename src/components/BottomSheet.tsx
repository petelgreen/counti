"use client";

import { useEffect, useRef } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function BottomSheet({ open, onClose, children, title }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end animate-fade-in"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={handleBackdropClick}
    >
      <div
        ref={sheetRef}
        className="w-full animate-slide-up"
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "var(--shadow-modal)",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="rounded-full"
            style={{ width: 36, height: 4, background: "var(--color-border)" }}
          />
        </div>

        {title && (
          <div
            className="flex items-center justify-between px-5 py-3 border-b"
            style={{ borderColor: "var(--color-border)" }}
          >
            <h2 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center rounded-full w-8 h-8 transition-colors hover:bg-gray-100"
              aria-label="סגור"
              style={{ color: "var(--color-text-muted)" }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
