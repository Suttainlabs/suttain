import React from "react";
import { motion } from "framer-motion";
import { TestTube, Atom, QrCode, ArrowRight, FlaskConical, Scan, Beaker } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const tools = [
  {
    id: "simulator",
    icon: TestTube,
    accentIcon: FlaskConical,
    title: "Chemical Simulator",
    description: "Test any chemical combination in seconds. Get instant hazard analysis, reaction predictions, and safety recommendations before you ever mix.",
    features: ["Reaction prediction", "Risk scoring", "Safety protocols", "Peer-reviewed sources"],
    link: "Simulator",
    gradient: "from-teal-500 to-emerald-500",
    lightBg: "bg-teal-50",
    accent: "text-teal-600",
    border: "border-teal-200",
    glow: "shadow-teal-500/10",
  },
  {
    id: "generator",
    icon: Atom,
    accentIcon: Beaker,
    title: "Formula Generator",
    description: "Create professional-grade formulas for skincare, cleaning products, and more. AI builds complete recipes with safety validation built in.",
    features: ["DIY & Business modes", "Step-by-step instructions", "Sustainability scoring", "PDF export"],
    link: "generator",
    gradient: "from-violet-500 to-purple-500",
    lightBg: "bg-violet-50",
    accent: "text-violet-600",
    border: "border-violet-200",
    glow: "shadow-violet-500/10",
  },
  {
    id: "scanner",
    icon: QrCode,
    accentIcon: Scan,
    title: "Quick Scan",
    description: "Scan any product barcode or upload a photo to get a full ingredient breakdown. Know exactly what's in your products and find safer alternatives.",
    features: ["Barcode & image scan", "Ingredient analysis", "Allergen detection", "Safer alternatives"],
    link: "BarcodeScanner",
    gradient: "from-cyan-500 to-blue-500",
    lightBg: "bg-cyan-50",
    accent: "text-cyan-600",
    border: "border-cyan-200",
    glow: "shadow-cyan-500/10",
  },
];

export default function ToolsShowcase() {
  return (
    <section className="py-24 sm:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-teal-600 bg-teal-50 px-4 py-1.5 rounded-full mb-4">
            Platform
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-4">
            Three Tools, One Platform
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Everything you need to create, test, and validate safe chemical products
          </p>
        </motion.div>

        <div className="space-y-6">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={createPageUrl(tool.link)} className="block group">
                <div className={`relative rounded-3xl border ${tool.border} bg-white p-6 sm:p-10 hover:shadow-2xl ${tool.glow} transition-all duration-500 overflow-hidden`}>
                  {/* Subtle gradient glow on hover */}
                  <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl ${tool.gradient} opacity-0 group-hover:opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 transition-opacity duration-500`} />

                  <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12">
                    {/* Icon */}
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <tool.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 group-hover:text-slate-800">
                        {tool.title}
                      </h3>
                      <p className="text-slate-500 text-base mb-4 max-w-2xl">
                        {tool.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tool.features.map((feat, i) => (
                          <span key={i} className={`${tool.lightBg} ${tool.accent} text-xs font-semibold px-3 py-1 rounded-full`}>
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className={`hidden lg:flex w-12 h-12 rounded-full ${tool.lightBg} items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <ArrowRight className={`w-5 h-5 ${tool.accent} group-hover:translate-x-0.5 transition-transform`} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}