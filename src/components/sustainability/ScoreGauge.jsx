import React from "react";

const getScoreColor = (score) => {
  if (score >= 70) return { text: "text-green-600", bg: "bg-green-500", ring: "ring-green-200", label: "Low Impact", labelBg: "bg-green-100 text-green-700" };
  if (score >= 40) return { text: "text-amber-600", bg: "bg-amber-500", ring: "ring-amber-200", label: "Moderate Impact", labelBg: "bg-amber-100 text-amber-700" };
  return { text: "text-red-600", bg: "bg-red-500", ring: "ring-red-200", label: "High Impact", labelBg: "bg-red-100 text-red-700" };
};

export { getScoreColor };

export default function ScoreGauge({ score, size = "lg" }) {
  const colors = getScoreColor(score);
  const dims = size === "lg" ? "w-36 h-36" : size === "md" ? "w-24 h-24" : "w-16 h-16";
  const textSize = size === "lg" ? "text-4xl" : size === "md" ? "text-2xl" : "text-lg";
  const circumference = size === "lg" ? 380 : size === "md" ? 260 : 170;
  const radius = size === "lg" ? 60 : size === "md" ? 42 : 27;
  const svgSize = size === "lg" ? 140 : size === "md" ? 96 : 64;
  const strokeWidth = size === "lg" ? 8 : 6;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${dims} relative`}>
        <svg width={svgSize} height={svgSize} className="transform -rotate-90 w-full h-full">
          <circle cx={svgSize / 2} cy={svgSize / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
          <circle
            cx={svgSize / 2} cy={svgSize / 2} r={radius} fill="none"
            stroke={score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444"}
            strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${textSize} font-bold ${colors.text}`}>{score}</span>
        </div>
      </div>
      {size !== "sm" && (
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${colors.labelBg}`}>{colors.label}</span>
      )}
    </div>
  );
}