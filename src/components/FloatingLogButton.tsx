"use client";

interface Props {
  onClick: () => void;
  isOpen?: boolean;
}

export default function FloatingLogButton({ onClick, isOpen = false }: Props) {
  return (
    <button
      onClick={onClick}
      aria-label="רשום ארוחה"
      className="fixed z-40 flex items-center justify-center rounded-full text-white transition-transform active:scale-95 hover:scale-105"
      style={{
        width: 56,
        height: 56,
        bottom: "calc(64px + 20px + env(safe-area-inset-bottom, 0px))",
        left: 20,
        background: "var(--color-primary)",
        boxShadow: "var(--shadow-fab)",
      }}
    >
      <svg
        width="24" height="24" viewBox="0 0 24 24" fill="none"
        style={{
          transition: "transform 300ms var(--ease-spring)",
          transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
        }}
      >
        <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}
