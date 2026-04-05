import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { X, TrendingDown } from "lucide-react";

export default function OptimizationPlotOverlay({ steps, onStepSelect, selectedStep, onClose }) {
  const [activeMetric, setActiveMetric] = useState("energy");

  if (steps.length === 0) {
    return null;
  }

  const metrics = [
    { key: "energy", label: "Energy (Eh)", color: "#f59e0b" },
    { key: "rmsd", label: "RMSD (Ų)", color: "#06b6d4" },
    { key: "maxForce", label: "Max Force (Eh/a₀)", color: "#ef4444" },
  ];

  const activeConfig = metrics.find(m => m.key === activeMetric);

  const handlePointClick = (data) => {
    onStepSelect(data.step);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700 rounded-t-lg p-4 z-40">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Optimization Path</h3>
          <span className="text-xs text-slate-400">({steps.length} steps)</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-2 mb-3">
        {metrics.map(metric => (
          <button
            key={metric.key}
            onClick={() => setActiveMetric(metric.key)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              activeMetric === metric.key
                ? "bg-slate-700 text-white border border-slate-600"
                : "text-slate-400 hover:text-slate-300 border border-transparent"
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="h-48 bg-slate-900/50 rounded-lg border border-slate-700 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={steps} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="step"
              stroke="#94a3b8"
              style={{ fontSize: "11px" }}
              tick={{ fill: "#94a3b8" }}
            />
            <YAxis
              stroke="#94a3b8"
              style={{ fontSize: "11px" }}
              tick={{ fill: "#94a3b8" }}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
                padding: "8px",
              }}
              labelStyle={{ color: "#e2e8f0" }}
              itemStyle={{ color: activeConfig.color }}
              cursor={{ stroke: "#475569", strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey={activeMetric}
              stroke={activeConfig.color}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const isSelected = selectedStep === payload.step;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 5 : 3}
                    fill={isSelected ? "#ffffff" : activeConfig.color}
                    stroke={activeConfig.color}
                    strokeWidth={2}
                    style={{ cursor: "pointer" }}
                    onClick={() => handlePointClick(payload)}
                  />
                );
              }}
              isAnimationActive={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Selected Step Info */}
      {selectedStep !== null && (
        <div className="mt-2 p-2 bg-slate-700/50 rounded-lg border border-slate-600 text-xs text-slate-300">
          <span className="font-semibold">Step {selectedStep}:</span>
          {steps[selectedStep] && (
            <span className="ml-2">
              E: {steps[selectedStep].energy} | RMSD: {steps[selectedStep].rmsd} | F: {steps[selectedStep].maxForce}
            </span>
          )}
        </div>
      )}
    </div>
  );
}