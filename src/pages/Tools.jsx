import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { TestTube, Atom, QrCode, BarChart2, ArrowRight } from "lucide-react";
import SEOHead from "../components/shared/SEOHead";

const TOOLS = [
  { icon: TestTube, label: "Chemical simulator", desc: "Test chemical combinations before you mix them, with hazard and reaction analysis.", to: createPageUrl("Simulator") },
  { icon: Atom, label: "Formula generator", desc: "Create skincare, soap and cleaning formulas with safety and compliance scoring.", to: createPageUrl("generator") },
  { icon: QrCode, label: "Suttain scan", desc: "Scan any product barcode to break down its ingredients and safety profile.", to: createPageUrl("BarcodeScanner") },
  { icon: BarChart2, label: "Carbon impact simulator", desc: "Model carbon tax exposure and find greener alternatives with ROI estimates.", to: createPageUrl("CarbonTaxSimulator") },
];

export default function Tools() {
  return (
    <div className="min-h-screen">
      <SEOHead
        title="Suttain tools — simulate, generate, scan and measure impact"
        description="Suttain's core tools: chemical simulator, formula generator, product scanning and carbon impact modelling."
      />

      <section className="page-wrapper content-container">
        <h1>Tools</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Everything you need to test, build and check a formula, from a first idea through to a
          product on the shelf.
        </p>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TOOLS.map(({ icon: Icon, label, desc, to }) => (
            <Link
              key={to}
              to={to}
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
      </section>
    </div>
  );
}