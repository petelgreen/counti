"use client";

import React from "react";

interface LoaderProps {
  size?: number;
}

export default function Loader({ size = 48 }: LoaderProps) {
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div
        className="absolute w-full h-full rounded-md animate-box-jump"
        style={{ background: "var(--color-primary)" }}
      />
      <style>{`
        @keyframes box-jump {
          15% { border-bottom-right-radius: 3px; }
          25% { transform: translateY(9px) rotate(22.5deg); }
          50% { transform: translateY(18px) scale(1, 0.9) rotate(45deg); border-bottom-right-radius: 40px; }
          75% { transform: translateY(9px) rotate(67.5deg); }
          100% { transform: translateY(0) rotate(90deg); }
        }
        .animate-box-jump { animation: box-jump 0.5s linear infinite; }
      `}</style>
    </div>
  );
}
