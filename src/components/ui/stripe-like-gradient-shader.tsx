"use client";

import { GradFlow } from "gradflow";

export function LoginGradient() {
  return (
    <div className="absolute inset-0 -z-10">
      <GradFlow
        config={{
          color1: { r: 255, g: 255, b: 255 },
          color2: { r: 255, g: 180, b: 210 },
          color3: { r: 255, g: 100, b: 160 },
          speed: 0.3,
          scale: 1.2,
          type: "stripe",
          noise: 0.06,
        }}
      />
    </div>
  );
}
