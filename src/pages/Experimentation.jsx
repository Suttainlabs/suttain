import React, { useState, useContext } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AuthGate from "../components/auth/AuthGate";
import AuthContext from "../components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, Plus, Trash2, Play, Loader2, Save,
  ChevronRight, CheckCircle2, Tag, Thermometer, Clock, Beaker, X
} from "lucide-react";
import ExperimentEditor from "../components/experimentation/ExperimentEditor";
import ExperimentResults from "../components/experimentation/ExperimentResults";
import ToolFeedbackToast from "../components/shared/ToolFeedbackToast";

const SIM_TYPES = [
  { id: "interaction", label: "Molecular Interaction", color: "bg-violet-100 text-violet-700" },
  { id: "stability", label: "Stability Analysis", color: "bg-teal-100 text-teal-700" },
  { id: "reactivity", label: "Reactivity", color: "bg-amber-100 text-amber-700" },
  { id: "thermodynamics", label: "Thermodynamics", color: "bg-rose-100 text-rose-700" },
  { id: "spectroscopy", label: "Spectroscopy", color: "bg-blue-100 text-blue-700" },
];

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-600" },
  running: { label: "Running", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
};

export default function Experimentation() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [view, setView] = useState("list"); // list | new | detail
  const [activeExperiment, setActiveExperiment] = useState(null);
  const [running, setRunning] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const { data: experiments = [], isLoading } = useQuery({
    queryKey: ["experiments"],
    queryFn: () => base44.entities.Experiment.list("-created_date"),
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      data.id
        ? base44.entities.Experiment.update(data.id, data)
        : base44.entities.Experiment.create(data),
    onSuccess: () => queryClient.invalidateQueries(["experiments"]),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Experiment.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["experiments"]),
  });

  const handleRunSimulation = async (experiment) => {
    setRunning(true);
    const moleculeList = experiment.molecules.map(m => `${m.name}${m.amount ? ` (${m.amount})` : ""}${m.role ? ` [${m.role}]` : ""}`).join(", ");
    const cond = experiment.conditions || {};

    const prompt = `You are a computational chemistry expert. Simulate the following molecular system:

Experiment: ${experiment.name}
Molecules: ${moleculeList}
Simulation Type: ${experiment.simulation_type || "interaction"}
Conditions: Temperature=${cond.temperature || "298 K"}, Pressure=${cond.pressure || "1 atm"}, Solvent=${cond.solvent || "water"}, pH=${cond.ph || "7"}, Time=${cond.time || "1 ns"}
Description: ${experiment.description || "N/A"}

Provide a realistic simulation result as JSON with:
- summary: 2-3 sentence overview of what happens in this system
- key_findings: array of 4-6 objects with {property, value, unit, significance}
- energy_profile: object with {initial_energy, final_energy, unit, energy_change, interpretation}
- stability_assessment: string (stable/unstable/metastable with brief explanation)
- reaction_prediction: string (what reactions or interactions are likely)
- recommendations: array of 3 strings for follow-up experiments`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_findings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  property: { type: "string" },
                  value: { type: "string" },
                  unit: { type: "string" },
                  significance: { type: "string" }
                }
              }
            },
            energy_profile: {
              type: "object",
              properties: {
                initial_energy: { type: "string" },
                final_energy: { type: "string" },
                unit: { type: "string" },
                energy_change: { type: "string" },
                interpretation: { type: "string" }
              }
            },
            stability_assessment: { type: "string" },
            reaction_prediction: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      const updated = {
        ...experiment,
        results: response,
        status: "completed",
      };
      const saved = await saveMutation.mutateAsync(updated);
      setActiveExperiment(saved || updated);
      queryClient.invalidateQueries(["experiments"]);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 12000);
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  const handleSaveDraft = async (formData) => {
    const saved = await saveMutation.mutateAsync({ ...formData, status: "draft" });
    setView("list");
    return saved;
  };

  const handleSaveAndRun = async (formData) => {
    const saved = await saveMutation.mutateAsync({ ...formData, status: "draft" });
    const exp = saved || formData;
    setActiveExperiment(exp);
    setView("detail");
    await handleRunSimulation(exp);
  };

  const openDetail = (exp) => {
    setActiveExperiment(exp);
    setView("detail");
  };

  const simTypeConfig = (id) => SIM_TYPES.find(s => s.id === id) || SIM_TYPES[0];

  return (
    <AuthGate featureName="Experimentation" featureDescription="Define, run, and save custom molecular experiments.">
      <ToolFeedbackToast
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
          feature="experimentation"
          featureLabel="Experimentation Lab"
          user={user}
          pointsToAward={0}
        />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold mb-3">
              <FlaskConical className="w-4 h-4" /> Experimentation Lab
            </div>
            <h1 className="text-3xl font-bold text-slate-900">My Experiments</h1>
            <p className="text-slate-500 text-sm mt-1">Design molecular systems, run simulations, and save results for future reference.</p>
          </div>
          {view === "list" && (
            <Button onClick={() => { setActiveExperiment(null); setView("new"); }}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white gap-2">
              <Plus className="w-4 h-4" /> New Experiment
            </Button>
          )}
          {view !== "list" && (
            <Button variant="outline" onClick={() => setView("list")} className="gap-2">
              <X className="w-4 h-4" /> Back to List
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* ── List view ── */}
          {view === "list" && (
            <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-7 h-7 text-teal-500 animate-spin" />
                </div>
              ) : experiments.length === 0 ? (
                <div className="text-center py-20">
                  <FlaskConical className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-slate-500 font-semibold mb-2">No experiments yet</h3>
                  <p className="text-slate-400 text-sm mb-6">Click "New Experiment" to design your first molecular system.</p>
                  <Button onClick={() => setView("new")} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                    <Plus className="w-4 h-4" /> Create First Experiment
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {experiments.map(exp => {
                    const stCfg = STATUS_CONFIG[exp.status] || STATUS_CONFIG.draft;
                    const simCfg = simTypeConfig(exp.simulation_type);
                    return (
                      <motion.div key={exp.id} whileHover={{ scale: 1.01 }}>
                        <Card className="h-full border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => openDetail(exp)}>
                          <CardContent className="p-5 flex flex-col h-full">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <h3 className="font-bold text-slate-900 text-sm leading-tight">{exp.name}</h3>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${stCfg.color}`}>
                                {stCfg.label}
                              </span>
                            </div>
                            {exp.description && (
                              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{exp.description}</p>
                            )}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {(exp.molecules || []).slice(0, 4).map((m, i) => (
                                <span key={i} className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                                  <Beaker className="w-2.5 h-2.5" />{m.name}
                                </span>
                              ))}
                              {(exp.molecules || []).length > 4 && (
                                <span className="text-[10px] text-slate-400">+{exp.molecules.length - 4} more</span>
                              )}
                            </div>
                            <div className="mt-auto flex items-center justify-between">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${simCfg.color}`}>
                                {simCfg.label}
                              </span>
                              <div className="flex items-center gap-2">
                                <button onClick={e => { e.stopPropagation(); deleteMutation.mutate(exp.id); }}
                                  className="text-slate-300 hover:text-red-400 transition-colors p-1">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <ChevronRight className="w-4 h-4 text-slate-300" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── New experiment form ── */}
          {view === "new" && (
            <motion.div key="new" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ExperimentEditor
                initialData={null}
                simTypes={SIM_TYPES}
                onSaveDraft={handleSaveDraft}
                onSaveAndRun={handleSaveAndRun}
                saving={saveMutation.isPending}
                running={running}
              />
            </motion.div>
          )}

          {/* ── Detail / results view ── */}
          {view === "detail" && activeExperiment && (
            <motion.div key="detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ExperimentResults
                experiment={activeExperiment}
                simTypes={SIM_TYPES}
                running={running}
                onRun={() => handleRunSimulation(activeExperiment)}
                onEdit={() => setView("new")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthGate>
  );
}