import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Atom,
  TrendingDown,
  BookOpen,
  AlertTriangle,
  Cpu,
  Activity,
  Info,
} from "lucide-react";
import MolViewer from "@/components/simulation/MolViewer";

export default function QuantumResults({ results }) {
  if (!results) return null;

  if (results.error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="font-semibold">{results.error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const convergenceData = (results.convergence_history || []).map((energy, i) => ({
    iteration: i + 1,
    energy: energy,
  }));

  const confidenceColor = {
    high: "bg-green-100 text-green-700 border-green-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="space-y-5">
      {/* Ground State Energy */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Atom className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900">Ground State Energy</h3>
            <Badge
              variant="outline"
              className={`ml-auto text-xs ${confidenceColor[results.confidence] || confidenceColor.medium}`}
            >
              {results.confidence || "medium"} confidence
            </Badge>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-indigo-700 font-mono">
              {typeof results.ground_state_energy === "number"
                ? results.ground_state_energy.toFixed(6)
                : results.ground_state_energy}
            </span>
            <span className="text-lg text-slate-500">
              {results.energy_unit || "Hartree"}
            </span>
          </div>
          {typeof results.energy_ev === "number" && (
            <p className="text-sm text-slate-500 mt-1">
              &asymp; {results.energy_ev.toFixed(4)} eV
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs gap-1">
              <Cpu className="w-3 h-3" /> {results.method_label}
            </Badge>
            {results.ansatz && (
              <Badge variant="outline" className="text-xs">
                {results.ansatz} ansatz
              </Badge>
            )}
            {results.optimizer && (
              <Badge variant="outline" className="text-xs">
                {results.optimizer}
              </Badge>
            )}
            {results.n_qubits && (
              <Badge variant="outline" className="text-xs">
                {results.n_qubits} qubits
              </Badge>
            )}
            {results.basis_set && (
              <Badge variant="outline" className="text-xs">
                {results.basis_set}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Convergence Plot */}
      {convergenceData.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-indigo-600" /> VQE Convergence
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={convergenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="iteration"
                  stroke="#64748b"
                  fontSize={12}
                  label={{
                    value: "Iteration",
                    position: "bottom",
                    offset: 10,
                    style: { fontSize: "12px", fill: "#64748b" },
                  }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  domain={["auto", "auto"]}
                  label={{
                    value: "Energy (Hartree)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: "12px", fill: "#64748b" },
                  }}
                />
                <Tooltip
                  formatter={(v) => v.toFixed(6)}
                  labelFormatter={(l) => `Iteration ${l}`}
                  contentStyle={{
                    fontSize: "12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="#6B3FA0"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-500 mt-2">
              The VQE optimizer iteratively adjusts the quantum circuit parameters to
              minimize the measured energy, converging to the ground state.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Molecular Structure */}
      {results.molecular_structure && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Atom className="w-4 h-4 text-indigo-600" /> Molecular Structure
            </h3>
            <div className="flex flex-wrap gap-3 mb-4">
              {results.molecular_structure.formula && (
                <Badge className="bg-indigo-100 text-indigo-700 text-sm font-mono">
                  {results.molecular_structure.formula}
                </Badge>
              )}
              {results.molecular_structure.smiles && (
                <Badge variant="outline" className="text-xs font-mono">
                  SMILES: {results.molecular_structure.smiles}
                </Badge>
              )}
            </div>
            {results.molecular_structure.smiles && (
              <MolViewer
                simType="quantum_vqe"
                inputs={{ molecule: results.molecular_structure.smiles }}
              />
            )}
            {results.molecular_structure.atoms &&
              results.molecular_structure.atoms.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                          Atom
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                          X (&#8197;)
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                          Y (&#8197;)
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                          Z (&#8197;)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.molecular_structure.atoms.map((atom, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="px-4 py-2 font-mono font-bold text-slate-800">
                            {atom.element}
                          </td>
                          <td className="px-4 py-2 font-mono text-slate-600">
                            {typeof atom.x === "number" ? atom.x.toFixed(4) : atom.x}
                          </td>
                          <td className="px-4 py-2 font-mono text-slate-600">
                            {typeof atom.y === "number" ? atom.y.toFixed(4) : atom.y}
                          </td>
                          <td className="px-4 py-2 font-mono text-slate-600">
                            {typeof atom.z === "number" ? atom.z.toFixed(4) : atom.z}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Plain Language Explanation */}
      {results.plain_language_explanation && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" /> What This Means
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              {results.plain_language_explanation}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Limitations */}
      {results.limitations && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-5">
            <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Limitations
            </h3>
            <p className="text-amber-700 text-sm">{results.limitations}</p>
            {results.is_large_molecule && (
              <p className="text-amber-700 text-sm mt-2 font-medium">
                This molecule is too large for current quantum hardware. The simulator
                result uses approximate methods.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Source */}
      {results.source && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Activity className="w-3 h-3" />
          <span>Source: {results.source}</span>
        </div>
      )}

      {/* Hardware note */}
      {results.hardware_note && (
        <Card
          className={
            results.mode === "hardware"
              ? "border-blue-200 bg-blue-50"
              : "border-slate-200 bg-slate-50"
          }
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-700">{results.hardware_note}</p>
                {results.ibm_job_id && (
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    IBM Job ID: {results.ibm_job_id}
                  </p>
                )}
                {results.ibm_backend && (
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">
                    Backend: {results.ibm_backend}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}