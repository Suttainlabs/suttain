import React from "react";
import { Link } from "react-router-dom";
import { Atom, Cpu, Server, ShieldAlert, ArrowRight } from "lucide-react";

const CARDS = [
  { icon: Atom, label: "Molecules and materials", desc: "Query compounds, crystals, and properties from trusted databases.", to: "/ResearchMolecules" },
  { icon: Cpu, label: "Simulation and modeling", desc: "Run DFT, molecular dynamics, and semi-empirical calculations.", to: "/ResearchSimulation" },
  { icon: Server, label: "Compute and jobs", desc: "Queue, monitor, and export long-running computational jobs.", to: "/ResearchCompute" },
  { icon: ShieldAlert, label: "Safety data", desc: "Hazard prediction, GHS classification, and regulatory context.", to: "/ResearchSafety" },
];

export default function ResearchFeatureCards() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {CARDS.map(({ icon: Icon, label, desc, to }) => (
        <Link
          key={to}
          to={to}
          className="group block rounded-2xl border border-research-accent-light bg-white p-6 h-full transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="w-11 h-11 rounded-xl bg-research-accent-light flex items-center justify-center mb-4">
            <Icon className="w-5 h-5 text-research-accent" />
          </div>
          <h3 className="mb-2">{label}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-research-accent">
            Open
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      ))}
    </div>
  );
}