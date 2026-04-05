import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play, Loader2, Beaker, Zap, Activity, ChevronRight,
  Thermometer, FlaskConical, BarChart2, CheckCircle2
} from "lucide-react";

export default function ExperimentResults({ experiment, simTypes, running, onRun }) {
  const simCfg = simTypes.find(s => s.id === experiment.simulation_type) || simTypes[0];
  const results = experiment.results;
  const cond = experiment.conditions || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Experiment header card */}
      <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${simCfg.color}`}>{simCfg.label}</span>
                {experiment.status === "completed" && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Completed</span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">{experiment.name}</h2>
              {experiment.description && <p className="text-sm text-slate-600">{experiment.description}</p>}
            </div>
            <Button onClick={onRun} disabled={running}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white gap-2">
              {running ? <><Loader2 className="w-4 h-4 animate-spin" /> Running…</> : <><Play className="w-4 h-4" /> Re-run</>}
            </Button>
          </div>

          {/* Conditions strip */}
          <div className="flex flex-wrap gap-3 mt-4">
            {[
              { icon: Thermometer, label: `${cond.temperature || "298"} K` },
              { icon: BarChart2, label: `${cond.pressure || "1"} atm` },
              { icon: FlaskConical, label: cond.solvent || "Water" },
              { icon: Activity, label: `pH ${cond.ph || "7"}` },
              { icon: Zap, label: cond.time || "1 ns" },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-white/70 border border-slate-200 rounded-lg px-2.5 py-1">
                <Icon className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-xs font-medium text-slate-700">{label}</span>
              </div>
            ))}
          </div>

          {/* Molecules */}
          <div className="flex flex-wrap gap-2 mt-3">
            {(experiment.molecules || []).map((m, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium">
                <Beaker className="w-3 h-3 text-violet-500" />
                {m.name}
                {m.role && <span className="text-slate-400">({m.role})</span>}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Running spinner */}
      {running && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6 flex items-center gap-4">
            <Loader2 className="w-6 h-6 text-teal-600 animate-spin flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-800">Simulation in progress…</p>
              <p className="text-sm text-slate-500">AI is computing molecular interactions and energy profiles.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && !running && (
        <>
          {/* Summary */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-teal-600" /> Summary
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">{results.summary}</p>
            </CardContent>
          </Card>

          {/* Key findings table */}
          {results.key_findings?.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-violet-600" /> Key Findings
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {["Property", "Value", "Unit", "Significance"].map(h => (
                          <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-slate-600 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.key_findings.map((row, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-2 font-medium text-slate-800">{row.property}</td>
                          <td className="px-3 py-2 font-mono text-teal-700 font-bold">{row.value}</td>
                          <td className="px-3 py-2 text-slate-500">{row.unit}</td>
                          <td className="px-3 py-2 text-slate-600 text-xs">{row.significance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Energy profile + stability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {results.energy_profile && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" /> Energy Profile
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: "Initial Energy", value: `${results.energy_profile.initial_energy} ${results.energy_profile.unit}` },
                      { label: "Final Energy", value: `${results.energy_profile.final_energy} ${results.energy_profile.unit}` },
                      { label: "ΔE", value: `${results.energy_profile.energy_change} ${results.energy_profile.unit}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center py-1.5 border-b border-slate-100">
                        <span className="text-xs text-slate-600 font-medium">{label}</span>
                        <span className="text-xs font-mono font-bold text-slate-800">{value}</span>
                      </div>
                    ))}
                    {results.energy_profile.interpretation && (
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{results.energy_profile.interpretation}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {results.stability_assessment && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Stability & Reactivity
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm text-slate-700 leading-relaxed">{results.stability_assessment}</p>
                    {results.reaction_prediction && (
                      <>
                        <hr className="border-slate-100" />
                        <p className="text-sm text-slate-700 leading-relaxed">{results.reaction_prediction}</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recommendations */}
          {results.recommendations?.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-green-600" /> Follow-up Recommendations
                </h3>
                <ul className="space-y-2">
                  {results.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* No results yet */}
      {!results && !running && (
        <Card className="border-dashed border-slate-200">
          <CardContent className="p-10 text-center">
            <BarChart2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium mb-1">No simulation results yet</p>
            <p className="text-slate-400 text-sm mb-4">Click "Re-run" to start the simulation for this experiment.</p>
            <Button onClick={onRun} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
              <Play className="w-4 h-4" /> Run Simulation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}