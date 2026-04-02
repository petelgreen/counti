"use client";

export default function LoadingState() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          מנתח את הארוחה
        </p>
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-1.5 h-1.5 rounded-full"
              style={{
                background: "var(--color-primary)",
                animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </span>
      </div>

      {[80, 60, 70].map((w, i) => (
        <div
          key={i}
          className="rounded-2xl p-4 animate-pulse"
          style={{ background: "var(--color-border)" }}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div
                className="rounded-full"
                style={{ height: 14, width: `${w}%`, background: "#D1D1CE" }}
              />
              <div
                className="rounded-full"
                style={{ height: 11, width: "40%", background: "#D1D1CE" }}
              />
            </div>
            <div
              className="rounded-full mr-3"
              style={{ height: 28, width: 52, background: "#D1D1CE" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
