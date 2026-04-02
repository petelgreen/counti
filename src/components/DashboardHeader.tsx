"use client";

export default function DashboardHeader() {
  const today = new Date().toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className="flex items-center justify-between px-4 pt-6 pb-2">
      <h1 className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>
        קאונטי
      </h1>
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        {today}
      </p>
    </header>
  );
}
