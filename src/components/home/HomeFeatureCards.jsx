import React from "react";
import { Link } from "react-router-dom";
import { TestTube, Sparkles, QrCode, BarChart2, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";

const CARDS = [
  { icon: TestTube, label: "Chemical simulator", desc: "Test how your ingredients interact before you mix a batch.", href: "Simulator" },
  { icon: Sparkles, label: "Formula generator", desc: "Generate validated formulas with safety and compliance built in.", href: "generator" },
  { icon: QrCode, label: "Suttain scan", desc: "Scan any product for a full ingredient and toxicity breakdown.", href: "BarcodeScanner" },
  { icon: BarChart2, label: "Carbon impact simulator", desc: "Model carbon exposure and find greener alternatives with ROI.", href: "CarbonImpactSimulator" },
];

export default function HomeFeatureCards() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {CARDS.map(({ icon: Icon, label, desc, href }) => (
        <Link
          key={href}
          to={createPageUrl(href)}
          className="group block rounded-2xl border border-core-accent-light bg-white p-6 h-full transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="w-11 h-11 rounded-xl bg-core-accent-light flex items-center justify-center mb-4">
            <Icon className="w-5 h-5 text-core-accent" />
          </div>
          <h3 className="mb-2">{label}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-core-accent">
            Open
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      ))}
    </div>
  );
}