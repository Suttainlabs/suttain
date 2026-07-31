import React from "react";
import { Link } from "react-router-dom";
import { Key, Beaker, Microscope, Webhook, ArrowRight } from "lucide-react";

const CARDS = [
  { icon: Key, label: "Authentication", desc: "Bearer API keys with per-tier rate limits and usage tracking." },
  { icon: Beaker, label: "Formula endpoints", desc: "Generate formulas, score safety, and check ingredient interactions." },
  { icon: Microscope, label: "Research endpoints", desc: "Compound lookup, hazard scoring, and sustainability profiles." },
  { icon: Webhook, label: "Webhooks", desc: "Push job results and regulatory alerts straight into your stack." },
];

export default function ApiFeatureCards() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {CARDS.map(({ icon: Icon, label, desc }) => (
        <Link
          key={label}
          to="/APIPortal"
          className="group block rounded-2xl border border-api-accent-light bg-white p-6 h-full transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="w-11 h-11 rounded-xl bg-api-accent-light flex items-center justify-center mb-4">
            <Icon className="w-5 h-5 text-api-accent" />
          </div>
          <h3 className="mb-2">{label}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-api-accent">
            View docs
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      ))}
    </div>
  );
}