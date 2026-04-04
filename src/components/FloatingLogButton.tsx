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
      className={`fixed z-40 flex items-center gap-2 text-white transition-all active:scale-95 ${!isOpen ? "animate-fab-pulse" : ""}`}
      style={{
        height: 52,
        paddingInline: isOpen ? "18px" : "20px",
        bottom: "calc(68px + 16px + env(safe-area-inset-bottom, 0px))",
        left: "50%",
        transform: "translateX(-50%)",
        borderRadius: 26,
        background: isOpen
          ? "var(--color-text-primary)"
          : "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
        boxShadow: isOpen
          ? "0 4px 16px rgba(0,0,0,0.25)"
          : "var(--shadow-fab)",
        transition: "background 300ms ease, box-shadow 300ms ease, padding 200ms ease",
      }}
    >
      <svg
        width="20" height="20" viewBox="0 0 24 24" fill="none"
        style={{
          transition: "transform 300ms var(--ease-spring)",
          transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
          flexShrink: 0,
        }}
      >
        <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="text-sm font-bold tracking-tight">
        {isOpen ? "סגור" : "רשום ארוחה"}
      </span>
    </button>
  );
}
