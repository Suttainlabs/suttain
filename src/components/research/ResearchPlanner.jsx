import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Atom, Microscope, FlaskConical, Target, Server, Lightbulb, ArrowRight, Check, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const QUESTIONS = [
  {
    id: "domain",
    question: "What are you studying?",
    options: [
      { value: "molecules", label: "Molecules", icon: Atom },
      { value: "proteins", label: "Proteins", icon: Microscope },
      { value: "materials", label: "Materials", icon: FlaskConical },
    ],
  },
  {
    id: "goal",
    question: "What is your goal?",
    options: [
      { value: "structure", label: "Structure prediction", icon: Target },
      { value: "property", label: "Property calculation", icon: Target },
      { value: "hazard", label: "Hazard assessment", icon: Target },
      { value: "formulation", label: "Formulation", icon: Target },
    ],
  },
  {
    id: "compute",
    question: "What compute resources do you have?",
    options: [
      { value: "browser", label: "Browser only", icon: Server },
      { value: "local", label: "Local machine", icon: Server },
      { value: "hpc", label: "HPC access", icon: Server },
    ],
  },
];

function getRecommendations(answers) {
  const tools = [];
  const workflow = [];

  if (answers.domain === "proteins") {
    tools.push({ tool: "Structural Biology", href: "StructuralBiology", reason: "AlphaFold-powered protein structure prediction and binding site analysis." });
    workflow.push("Look up protein structure via AlphaFold", "Analyze binding pockets and domains", "Run molecular docking simulation");
  } else if (answers.domain === "materials") {
    tools.push({ tool: "Computational Studio", href: "ComputationalStudio", reason: "Materials Project integration with DFT simulation and crystal structure analysis." });
    workflow.push("Search Materials Project database", "Run DFT geometry optimization", "Analyze electronic and mechanical properties");
  } else {
    if (answers.goal === "hazard") {
      tools.push({ tool: "Hazard Engine", href: "HazardEngine", reason: "Predict toxicity and GHS classifications from molecular structure." });
      workflow.push("Look up compound in PubChem", "Run hazard prediction model", "Cross-check GHS classification");
    } else if (answers.goal === "formulation") {
      tools.push({ tool: "Formula Generator", href: "generator", reason: "Create product formulas with built-in safety and compliance validation." });
      workflow.push("Analyze ingredient safety profiles", "Generate optimized formula", "Check regulatory compliance (FDA, EU, REACH)");
    } else if (answers.goal === "property") {
      tools.push({ tool: "Molecule Analysis", href: "MoleculeAnalysis", reason: "Query compounds for physical, toxicity, and environmental properties." });
      workflow.push("Look up compound in PubChem", "Run GFN2-xTB semi-empirical optimization", "Compare calculated vs. experimental properties");
    } else {
      tools.push({ tool: "Molecule Analysis", href: "MoleculeAnalysis", reason: "3D structure visualization and property lookup for any compound." });
      workflow.push("Look up compound in PubChem", "Visualize 3D molecular structure", "Export structural and property data");
    }
  }

  if (answers.compute === "hpc") {
    tools.push({ tool: "Research API", href: "APIPortal", reason: "Programmatic access for batch processing and HPC workflow integration." });
  }
  if (!tools.some((t) => t.tool === "Computational Studio")) {
    tools.push({ tool: "Computational Studio", href: "ComputationalStudio", reason: "Unified workspace for all computational chemistry tasks." });
  }

  return { tools, workflow };
}

export default function ResearchPlanner() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (qid, value) => {
    const next = { ...answers, [qid]: value };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) setTimeout(() => setStep(step + 1), 250);
    else setTimeout(() => setShowResults(true), 250);
  };

  const reset = () => { setStep(0); setAnswers({}); setShowResults(false); };
  const recs = showResults ? getRecommendations(answers) : null;
  const current = QUESTIONS[step];

  return (
    <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-5 h-5 text-[#02988C]" />
        <span className="text-xs font-semibold uppercase tracking-widest text-[#02988C]">Research Planner</span>
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-[#0A1F1D] mb-1" style={{ fontFamily: "var(--font-heading)" }}>Plan your research</h2>
      <p className="text-sm text-[#4B5563] mb-6">Answer three questions and we'll recommend the right tools and workflow.</p>

      {/* Progress dots */}
      {!showResults && (
        <div className="flex items-center gap-2 mb-6">
          {QUESTIONS.map((q, i) => (
            <div key={q.id} className={`h-2 rounded-full transition-all ${i === step ? "w-8 bg-[#02988C]" : i < step ? "w-2 bg-[#02988C]" : "w-2 bg-[#E5E7EB]"}`} />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {showResults ? (
          <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Workflow path */}
            <div className="bg-[#F0FDFA] border border-[#02988C]/15 rounded-xl p-5">
              <h3 className="text-sm font-bold text-[#0A1F1D] mb-3">Recommended workflow</h3>
              <div className="flex flex-wrap items-center gap-2">
                {recs.workflow.map((step, i) => (
                  <React.Fragment key={i}>
                    <span className="inline-flex items-center gap-1.5 bg-white border border-[#02988C]/20 rounded-lg px-3 py-1.5 text-sm font-medium text-[#0A1F1D]">
                      <span className="w-5 h-5 rounded-full bg-[#02988C] text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
                      {step}
                    </span>
                    {i < recs.workflow.length - 1 && <ArrowRight className="w-4 h-4 text-[#02988C]" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Tool recommendations */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#0A1F1D]">Recommended tools</h3>
              {recs.tools.map((rec, i) => (
                <Link key={i} to={createPageUrl(rec.href)}
                  className="flex items-start gap-3 bg-white border border-[#E5E7EB] rounded-xl p-4 hover:border-[#02988C] hover:shadow-sm transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-[#9531F5]/10 flex items-center justify-center flex-shrink-0">
                    <FlaskConical className="w-4 h-4 text-[#9531F5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-[#0A1F1D] text-sm">{rec.tool}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#02988C] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-[#4B5563] mt-0.5">{rec.reason}</p>
                  </div>
                </Link>
              ))}
            </div>

            <button onClick={reset} className="inline-flex items-center gap-1.5 text-[#02988C] text-sm font-semibold hover:underline">
              <RotateCcw className="w-3.5 h-3.5" /> Start over
            </button>
          </motion.div>
        ) : (
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-lg font-semibold text-[#0A1F1D] mb-4">{current.question}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.options.map((opt) => {
                const Icon = opt.icon;
                const selected = answers[current.id] === opt.value;
                return (
                  <button key={opt.value} onClick={() => handleSelect(current.id, opt.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${selected ? "border-[#02988C] bg-[#02988C]/5" : "border-[#E5E7EB] hover:border-[#02988C]/40 hover:bg-[#F0FDFA]"}`}>
                    <Icon className={`w-5 h-5 flex-shrink-0 ${selected ? "text-[#02988C]" : "text-[#4B5563]"}`} />
                    <span className={`text-sm font-medium ${selected ? "text-[#02988C]" : "text-[#0A1F1D]"}`}>{opt.label}</span>
                    {selected && <Check className="w-4 h-4 text-[#02988C] ml-auto" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}