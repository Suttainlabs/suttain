import React from "react";
import { Atom, Cpu, ShieldCheck, Leaf, Radio, KeyRound } from "lucide-react";

const CAPABILITIES = [
  {
    icon: Atom,
    title: "Chemical Intelligence API",
    description: "Query 130M+ compounds with property, toxicity, and regulatory data via a single REST endpoint.",
    endpoints: ["GET /v1/chemicals/{cid}", "POST /v1/chemicals/search", "GET /v1/chemicals/batch"],
  },
  {
    icon: Cpu,
    title: "Simulation Engine API",
    description: "Submit computational jobs (DFT, MD, QM/MM) programmatically and retrieve results asynchronously.",
    endpoints: ["POST /v1/simulations/run", "GET /v1/simulations/{id}", "GET /v1/simulations/queue"],
  },
  {
    icon: ShieldCheck,
    title: "Safety & Compliance API",
    description: "Automated SDS parsing, GHS classification, and regulatory cross-referencing across REACH, EPA, and FDA.",
    endpoints: ["POST /v1/sds/analyze", "GET /v1/compliance/{formula_id}", "GET /v1/alerts/regulatory"],
  },
  {
    icon: Leaf,
    title: "Sustainability API",
    description: "Carbon footprint calculation, LCA scoring, and sustainability benchmarking for chemical formulations.",
    endpoints: ["POST /v1/sustainability/score", "GET /v1/sustainability/benchmark", "GET /v1/carbon/calculate"],
  },
  {
    icon: Radio,
    title: "Webhooks & Events",
    description: "Real-time event streaming for simulation completion, regulatory changes, and safety alert triggers.",
    endpoints: ["POST /v1/webhooks/register", "GET /v1/webhooks/events", "DELETE /v1/webhooks/{id}"],
  },
  {
    icon: KeyRound,
    title: "Auth & Rate Limiting",
    description: "API key authentication, role-based access control, and intelligent rate limiting with burst allowances.",
    endpoints: ["POST /v1/auth/token", "GET /v1/auth/limits", "POST /v1/auth/rotate-key"],
  },
];

function CapabilityCard({ icon: Icon, title, description, endpoints }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md hover:border-violet-200 transition-all duration-300">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-teal-500 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-4">{description}</p>
      <div className="space-y-1.5">
        {endpoints.map((ep) => {
          const method = ep.split(" ")[0];
          const path = ep.split(" ").slice(1).join(" ");
          const methodColor =
            method === "GET"
              ? "bg-teal-100 text-teal-700"
              : method === "POST"
              ? "bg-violet-100 text-violet-700"
              : "bg-red-100 text-red-700";
          return (
            <div key={ep} className="flex items-center gap-2 text-xs">
              <span className={`px-1.5 py-0.5 rounded font-mono font-bold ${methodColor}`}>
                {method}
              </span>
              <code className="font-mono text-slate-600">{path}</code>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function EnterpriseCapabilities() {
  return (
    <section className="py-16 bg-[#EDF7F2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-widest text-violet-500 uppercase mb-2">
            API Capabilities
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
            Everything You Need, Programmatically
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            RESTful endpoints with JSON responses, comprehensive error handling, and
            interactive API reference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CAPABILITIES.map((cap) => (
            <CapabilityCard key={cap.title} {...cap} />
          ))}
        </div>
      </div>
    </section>
  );
}