"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface GradientOption {
  id: string;
  label: string;
  value: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

interface GradientSelectorProps {
  options?: GradientOption[];
  defaultSelected?: string;
  onSelectionChange?: (option: GradientOption, index: number) => void;
  className?: string;
}

const defaultOptions: GradientOption[] = [
  {
    id: "100k",
    label: "$100K",
    value: "100000",
    color: "#3b82f6",
    gradientFrom: "#3b82f6",
    gradientTo: "#6366f1",
  },
  {
    id: "1m",
    label: "$1M",
    value: "1000000",
    color: "#6366f1",
    gradientFrom: "#6366f1",
    gradientTo: "#8b5cf6",
  },
  {
    id: "5m",
    label: "$5M",
    value: "5000000",
    color: "#8b5cf6",
    gradientFrom: "#8b5cf6",
    gradientTo: "#a855f7",
  },
  {
    id: "10m",
    label: "$10M+",
    value: "10000000",
    color: "#a855f7",
    gradientFrom: "#a855f7",
    gradientTo: "#ec4899",
  },
];

export function GradientSelector({
  options = defaultOptions,
  defaultSelected,
  onSelectionChange,
  className,
}: GradientSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(
    defaultSelected ? options.findIndex((opt) => opt.id === defaultSelected) : -1
  );
  const [gradientPosition, setGradientPosition] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shouldReduceMotion = useReducedMotion();

  const validOptions = options.length >= 3 ? options : defaultOptions.slice(0, Math.max(3, options.length));

  useEffect(() => {
    if (selectedIndex >= 0 && circleRefs.current[selectedIndex] && containerRef.current) {
      const circleElement = circleRefs.current[selectedIndex]!;
      const containerElement = containerRef.current;
      const circleRect = circleElement.getBoundingClientRect();
      const containerRect = containerElement.getBoundingClientRect();
      setGradientPosition({
        x: circleRect.left + circleRect.width / 2 - containerRect.left,
        y: circleRect.top + circleRect.height / 2 - containerRect.top,
      });
    } else {
      setGradientPosition(null);
    }
  }, [selectedIndex]);

  const handleCircleClick = (option: GradientOption, index: number) => {
    setSelectedIndex(index);
    onSelectionChange?.(option, index);
  };

  const createOrbitalDots = (count: number, radius: number, color: string) => {
    const dots = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      dots.push(
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          initial={{ opacity: 0, scale: 0.3, rotate: shouldReduceMotion ? 0 : -90, x: x - 2, y: y - 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0, x: x - 2, y: y - 2 }}
          transition={{
            duration: shouldReduceMotion ? 0.2 : 0.6,
            delay: shouldReduceMotion ? 0 : i * 0.03,
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
          style={{ backgroundColor: color, left: "50%", top: "50%" }}
        />
      );
    }
    return dots;
  };

  const getCircleSize = (index: number) => {
    if (index === 0) return "w-3 h-3";
    if (index === 1) return "w-3.5 h-3.5";
    return "w-4 h-4";
  };

  const getLineStyle = (lineIndex: number) => {
    const isLitUp = selectedIndex > lineIndex;
    const currentOption = validOptions[lineIndex];
    const nextOption = validOptions[lineIndex + 1];
    if (isLitUp) {
      return { background: `linear-gradient(to right, ${currentOption.gradientFrom}, ${nextOption?.gradientTo || currentOption.gradientTo})` };
    }
    return { background: "#d1d5db" };
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative flex flex-col items-center gap-6 p-6 rounded-2xl overflow-hidden", className)}
      style={{ background: "var(--color-surface)" }}
    >
      {selectedIndex >= 0 && gradientPosition && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(circle at ${gradientPosition.x}px ${gradientPosition.y + 440}px, ${validOptions[selectedIndex].color}18 0%, ${validOptions[selectedIndex].color}10 30%, transparent 70%)`,
          }}
        />
      )}

      <div
        className="relative z-10 flex items-center gap-6 rounded-full px-8 py-5"
        style={{ border: "1px solid var(--color-border)", background: "var(--color-bg)" }}
      >
        {validOptions.map((option, index) => (
          <div key={option.id} className="flex items-center gap-6">
            <div
              ref={(el) => { circleRefs.current[index] = el; }}
              className={cn("relative cursor-pointer transition-all duration-200 hover:scale-110 rounded-full", getCircleSize(index))}
              onClick={() => handleCircleClick(option, index)}
              style={{
                backgroundColor: selectedIndex >= index ? option.color : "#d1d5db",
                boxShadow: selectedIndex >= index ? `0 0 20px ${option.color}40, 0 0 40px ${option.color}20` : "none",
              }}
            >
              {selectedIndex === index && createOrbitalDots(12, 16, option.color)}
            </div>
            {index < validOptions.length - 1 && (
              <div
                className="rounded-full transition-all duration-300"
                style={{ width: 80, height: index === 0 ? 6 : index === 1 ? 7 : 8, ...getLineStyle(index) }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="relative z-10 flex items-center gap-4">
        {validOptions.map((option, index) => (
          <div key={`label-${option.id}`} className="flex items-center gap-2">
            <span
              className="text-sm font-semibold transition-colors duration-200 cursor-pointer"
              onClick={() => handleCircleClick(option, index)}
              style={{ color: selectedIndex >= index ? option.color : "var(--color-text-muted)" }}
            >
              {option.label}
            </span>
            {index < validOptions.length - 1 && <div style={{ width: 80 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}
