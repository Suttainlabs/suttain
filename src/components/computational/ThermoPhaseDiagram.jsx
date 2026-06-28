import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Legend, ReferenceLine, ReferenceArea
} from "recharts";
import {
  Thermometer, TrendingDown, GitBranch, Activity, Info
} from "lucide-react";

const PHASE_COLORS = {
  solid: "#6B3FA0",
  liquid: "#00A8C8",
  gas: "#00B478",
  supercritical: "#D4900A",
};

export default function ThermoPhaseDiagram({ result }) {
  const [activeChart, setActiveChart] = useState("phase_diagram");

  if (!result) return null;

  const thermo = result.thermodynamic_properties || {};
  const cpCurve = result.heat_capacity_curve || [];
  const gibbsCurve = result.gibbs_energy_curve || [];
  const phaseData = result.phase_diagram_data || {};
  const ptPoints = phaseData.pt_points || [];
  const transitions = result.phase_transitions || [];

  const formatNum = (v) => {
    if (v == null || isNaN(v)) return "—";
    if (Math.abs(v) >= 1000) return v.toFixed(0);
    if (Math.abs(v) >= 1) return v.toFixed(2);
    return v.toFixed(4);
  };

  const thermoProperties = [
    { label: "Heat Capacity (Cp)", key: "heat_capacity_cp", unit: "J/(mol·K)", icon: Activity },
    { label: "Entropy (S°298)", key: "entropy_s298", unit: "J/(mol·K)", icon: TrendingDown },
    { label: "Enthalpy of Formation", key: "enthalpy_formation", unit: "kJ/mol", icon: Thermometer },
    { label: "Gibbs Formation", key: "gibbs_formation", unit: "kJ/mol", icon: TrendingDown },
    { label: "Melting Point", key: "melting_point", unit: "K", icon: Thermometer },
    { label: "Boiling Point", key: "boiling_point", unit: "K", icon: Thermometer },
    { label: "Critical Temperature", key: "critical_temperature", unit: "K", icon: Thermometer },
    { label: "Critical Pressure", key: "critical_pressure", unit: "bar", icon: Activity },
    { label: "Thermal Expansion", key: "thermal_expansion", unit: "1/K", icon: Activity },
    { label: "Compressibility", key: "compressibility", unit: "1/bar", icon: Activity },
  ];

  return (
    <div className="space-y-5">
      {/* Compound header */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
              <Thermometer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                Thermodynamic & Phase Diagram Analysis
              </h3>
              <p className="text-sm text-slate-500">
                {result.compound} — {result.analysis_type?.replace(/_/g, ' ')}
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              <Badge className="bg-amber-100 text-amber-700 text-xs">
                T: {result.temperature_range?.min}–{result.temperature_range?.max} K
              </Badge>
              <Badge className="bg-cyan-100 text-cyan-700 text-xs">
                P: {result.pressure_range?.min}–{result.pressure_range?.max} bar
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thermodynamic Properties Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            Thermodynamic Properties
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {thermoProperties.map(({ label, key, unit, icon: Icon }) => (
              <div key={key} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
                </div>
                <p className="text-lg font-bold text-slate-800 font-mono">{formatNum(thermo[key])}</p>
                <p className="text-[10px] text-slate-400">{unit}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart selector */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
        {[
          { id: "phase_diagram", label: "Phase Diagram (P-T)", icon: GitBranch },
          { id: "heat_capacity", label: "Heat Capacity", icon: Activity },
          { id: "gibbs_energy", label: "Gibbs Energy", icon: TrendingDown },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveChart(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeChart === tab.id ? "bg-amber-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Phase Diagram P-T Scatter */}
      {activeChart === "phase_diagram" && ptPoints.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-violet-600" />
              Pressure-Temperature Phase Diagram
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  dataKey="temperature"
                  name="Temperature"
                  unit=" K"
                  domain={['dataMin', 'dataMax']}
                  tick={{ fontSize: 11 }}
                  label={{ value: "Temperature (K)", position: "insideBottom", offset: -10, fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="pressure"
                  name="Pressure"
                  unit=" bar"
                  domain={['dataMin', 'dataMax']}
                  tick={{ fontSize: 11 }}
                  label={{ value: "Pressure (bar)", angle: -90, position: "insideLeft", fontSize: 12 }}
                />
                <ZAxis range={[60, 60]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-md text-xs">
                        <p><span className="font-semibold">T:</span> {p.temperature?.toFixed(1)} K</p>
                        <p><span className="font-semibold">P:</span> {p.pressure?.toFixed(2)} bar</p>
                        <p><span className="font-semibold">Phase:</span> <span style={{ color: PHASE_COLORS[p.phase] || '#666' }}>{p.phase}</span></p>
                      </div>
                    );
                  }}
                />
                {["solid", "liquid", "gas", "supercritical"].map(phase => (
                  <Scatter
                    key={phase}
                    name={phase}
                    data={ptPoints.filter(p => p.phase === phase)}
                    fill={PHASE_COLORS[phase] || "#999"}
                  />
                ))}
                <Legend />
              </ScatterChart>
            </ResponsiveContainer>

            {/* Triple & Critical points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {phaseData.triple_point && (
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-1">Triple Point</p>
                  <p className="text-sm text-slate-700">
                    T = {formatNum(phaseData.triple_point.temperature)} K, P = {formatNum(phaseData.triple_point.pressure)} bar
                  </p>
                </div>
              )}
              {phaseData.critical_point && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Critical Point</p>
                  <p className="text-sm text-slate-700">
                    T = {formatNum(phaseData.critical_point.temperature)} K, P = {formatNum(phaseData.critical_point.pressure)} bar
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Heat Capacity Curve */}
      {activeChart === "heat_capacity" && cpCurve.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Heat Capacity vs Temperature
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={cpCurve} margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="temperature"
                  name="Temperature"
                  unit=" K"
                  tick={{ fontSize: 11 }}
                  label={{ value: "Temperature (K)", position: "insideBottom", offset: -10, fontSize: 12 }}
                />
                <YAxis
                  name="Cp"
                  unit=" J/(mol·K)"
                  tick={{ fontSize: 11 }}
                  label={{ value: "Cp (J/(mol·K))", angle: -90, position: "insideLeft", fontSize: 12 }}
                />
                <Tooltip
                  content={({ payload }) => payload?.length ? (
                    <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-md text-xs">
                      <p><span className="font-semibold">T:</span> {payload[0].payload.temperature?.toFixed(1)} K</p>
                      <p><span className="font-semibold">Cp:</span> {payload[0].payload.cp?.toFixed(2)} J/(mol·K)</p>
                    </div>
                  ) : null}
                />
                <Line
                  type="monotone"
                  dataKey="cp"
                  stroke="#00A8C8"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#00A8C8" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gibbs Energy Curve */}
      {activeChart === "gibbs_energy" && gibbsCurve.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-violet-600" />
              Gibbs Free Energy vs Temperature
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={gibbsCurve} margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="temperature"
                  name="Temperature"
                  unit=" K"
                  tick={{ fontSize: 11 }}
                  label={{ value: "Temperature (K)", position: "insideBottom", offset: -10, fontSize: 12 }}
                />
                <YAxis
                  name="G"
                  unit=" kJ/mol"
                  tick={{ fontSize: 11 }}
                  label={{ value: "G (kJ/mol)", angle: -90, position: "insideLeft", fontSize: 12 }}
                />
                <Tooltip
                  content={({ payload }) => payload?.length ? (
                    <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-md text-xs">
                      <p><span className="font-semibold">T:</span> {payload[0].payload.temperature?.toFixed(1)} K</p>
                      <p><span className="font-semibold">G:</span> {payload[0].payload.gibbs_energy?.toFixed(2)} kJ/mol</p>
                      <p><span className="font-semibold">Phase:</span> {payload[0].payload.phase}</p>
                    </div>
                  ) : null}
                />
                <Line
                  type="monotone"
                  dataKey="gibbs_energy"
                  stroke="#6B3FA0"
                  strokeWidth={2}
                  dot={({ cx, cy, payload }) => (
                    <circle
                      key={`dot-${cx}-${cy}`}
                      cx={cx}
                      cy={cy}
                      r={3}
                      fill={PHASE_COLORS[payload.phase] || "#6B3FA0"}
                    />
                  )}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Phase Transitions Table */}
      {transitions.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-violet-600" />
              Phase Transitions
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    {["Transition", "Temperature (K)", "Enthalpy (kJ/mol)", "Entropy (J/(mol·K))"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transitions.map((t, i) => (
                    <tr key={i} className="border-t border-slate-100 hover:bg-violet-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 capitalize">{t.transition}</td>
                      <td className="px-4 py-3 font-mono text-violet-700 font-bold">{formatNum(t.temperature)}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{formatNum(t.enthalpy)}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{formatNum(t.entropy)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interpretation */}
      {result.interpretation && (
        <Card className="border-0 shadow-sm bg-amber-50 border-amber-200">
          <CardContent className="p-5">
            <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Interpretation
            </h3>
            <p className="text-amber-700 text-sm leading-relaxed">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      {result.method_note && (
        <p className="text-xs text-slate-400 italic px-1">{result.method_note}</p>
      )}
    </div>
  );
}