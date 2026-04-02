"use client";

import { useEffect, useRef } from "react";
import { formatDayPill } from "@/lib/dateUtils";

interface DayMeta {
  date: number;
  hasData: boolean;
}

interface Props {
  days: DayMeta[];
  selectedDate: number;
  todayStart: number;
  onSelect: (date: number) => void;
}

export default function DayNavStrip({ days, selectedDate, todayStart, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  // Scroll selected pill into view
  useEffect(() => {
    const el = pillRefs.current[selectedDate];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [selectedDate]);

  function handlePrev() {
    const idx = days.findIndex(d => d.date === selectedDate);
    if (idx > 0) onSelect(days[idx - 1].date);
  }

  function handleNext() {
    const idx = days.findIndex(d => d.date === selectedDate);
    if (idx < days.length - 1) onSelect(days[idx + 1].date);
  }

  const isFirst = days[0]?.date === selectedDate;
  const isLast  = days[days.length - 1]?.date === selectedDate;

  return (
    <div className="flex items-center gap-1 px-2 py-3">
      {/* Prev arrow (go back in time) */}
      <button
        onClick={handlePrev}
        disabled={isFirst}
        className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-opacity disabled:opacity-30"
        style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-card)" }}
        aria-label="יום קודם"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="var(--color-text-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Scrollable day pills */}
      <div
        ref={containerRef}
        className="flex-1 flex gap-1.5 overflow-x-auto"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {days.map(({ date, hasData }) => {
          const selected = date === selectedDate;
          const isToday  = date === todayStart;
          const { dow, day } = formatDayPill(date);

          return (
            <button
              key={date}
              ref={el => { pillRefs.current[date] = el; }}
              onClick={() => onSelect(date)}
              className="flex flex-col items-center justify-center shrink-0 rounded-2xl transition-all"
              style={{
                scrollSnapAlign: "center",
                width: 52,
                height: 64,
                background: selected
                  ? "var(--color-primary)"
                  : isToday
                  ? "var(--color-primary-light)"
                  : "var(--color-surface)",
                border: isToday && !selected
                  ? "1.5px solid var(--color-primary)"
                  : "1.5px solid transparent",
                boxShadow: selected ? "none" : "var(--shadow-card)",
              }}
            >
              <span
                className="text-xs font-medium"
                style={{ color: selected ? "rgba(255,255,255,0.8)" : "var(--color-text-muted)" }}
              >
                {dow}
              </span>
              <span
                className="text-base font-bold leading-tight"
                style={{ color: selected ? "white" : isToday ? "var(--color-primary)" : "var(--color-text-primary)" }}
              >
                {day}
              </span>
              {/* Data dot */}
              <div
                className="mt-0.5 w-1.5 h-1.5 rounded-full"
                style={{
                  background: hasData
                    ? selected ? "rgba(255,255,255,0.7)" : "var(--color-primary)"
                    : "transparent",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Next arrow (go forward in time) */}
      <button
        onClick={handleNext}
        disabled={isLast}
        className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-opacity disabled:opacity-30"
        style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-card)" }}
        aria-label="יום הבא"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="var(--color-text-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
