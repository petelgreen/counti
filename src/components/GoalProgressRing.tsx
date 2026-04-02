"use client";

interface Props {
  calories: number;
  goal: number;
  size?: number;
  compact?: boolean;
}

export default function GoalProgressRing({ calories, goal, size: sizeProp, compact = false }: Props) {
  const size   = sizeProp ?? (compact ? 100 : 180);
  const radius = compact ? 42 : 76;
  const stroke = compact ? 8 : 12;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = goal > 0 ? Math.min(calories / goal, 1) : 0;
  const offset = circumference * (1 - pct);

  const overGoal = calories > goal;
  const nearGoal = !overGoal && pct >= 0.8;
  const goalMet  = !overGoal && pct >= 1;

  const ringColor = goalMet
    ? "var(--color-success)"
    : nearGoal
    ? "var(--color-warning)"
    : overGoal
    ? "var(--color-danger)"
    : "var(--color-primary)";

  const remaining = goal - calories;
  const subLabel = overGoal
    ? `עברת ב-${Math.round(calories - goal)} קק"ל`
    : goalMet
    ? 'השגת את היעד! 🎉'
    : `נותרו ${Math.round(remaining)} קק"ל`;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={overGoal ? 0 : offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 700ms ease, stroke 500ms ease" }}
        />
        {/* Center text */}
        <text
          x={cx} y={cy - (compact ? 6 : 12)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={compact ? 22 : 38}
          fontWeight={700}
          fontFamily="var(--font-rubik), Rubik, Arial, sans-serif"
          fill="var(--color-text-primary)"
        >
          {Math.round(calories)}
        </text>
        <text
          x={cx} y={cy + (compact ? 10 : 16)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={compact ? 10 : 13}
          fontWeight={500}
          fontFamily="var(--font-rubik), Rubik, Arial, sans-serif"
          fill="var(--color-text-muted)"
        >
          קק&quot;ל
        </text>
        {!compact && (
          <text
            x={cx} y={cy + 34}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fontFamily="var(--font-rubik), Rubik, Arial, sans-serif"
            fill="var(--color-text-muted)"
          >
            מתוך {goal}
          </text>
        )}
      </svg>
      <p
        className="text-xs font-medium text-center"
        style={{
          color: goalMet
            ? "var(--color-success)"
            : nearGoal
            ? "var(--color-warning)"
            : overGoal
            ? "var(--color-danger)"
            : "var(--color-text-muted)",
        }}
      >
        {subLabel}
      </p>
    </div>
  );
}
