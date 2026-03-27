import React from "react";
import { motion } from "framer-motion";
import { TestTube, Atom, QrCode, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const tools = [
  {
    icon: TestTube,
    title: "Chemical Simulator",
    description: "Paste any two chemicals and get instant reaction analysis, risk scores, safety protocols, and peer-reviewed references.",
    tags: ["Reaction prediction", "Risk scoring", "Safety protocols"],
    link: "Simulator",
    color: "bg-teal-500",
    lightColor: "bg-teal-50 text-teal-700",
    borderHover: "hover:border-teal-300",
  },
  {
    icon: Atom,
    title: "Formula Generator",
    description: "Tell the AI what you want to make — skincare, soap, cleaner — and get a complete formula with percentages, instructions, and compliance.",
    tags: ["DIY & Business", "Step-by-step", "PDF export"],
    link: "generator",
    color: "bg-violet-500",
    lightColor: "bg-violet-50 text-violet-700",
    borderHover: "hover:border-violet-300",
  },
  {
    icon: QrCode,
    title: "Quick Scan",
    description: "Scan a barcode or upload a photo and get a full ingredient breakdown with safety ratings, allergen flags, and healthier alternatives.",
    tags: ["Barcode + image", "Allergen alerts", "Alternatives"],
    link: "BarcodeScanner",
    color: "bg-cyan-500",
    lightColor: "bg-cyan-50 text-cyan-700",
    borderHover: "hover:border-cyan-300",
  },
];

export default function ToolsShowcase() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-[#02988C] mb-2 tracking-wide uppercase">Platform</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Three tools. One workflow.
          </h2>
        </motion.div>

        <div className="grid gap-4">
          {tools.map((tool, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={createPageUrl(tool.link)} className="block group">
                <div className={`flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 bg-white border border-slate-200 ${tool.borderHover} rounded-2xl p-5 sm:p-7 transition-all duration-300 hover:shadow-lg`}>
                  <div className={`w-14 h-14 rounded-2xl ${tool.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <tool.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{tool.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-3 max-w-xl">{tool.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tool.tags.map((tag, j) => (
                        <span key={j} className={`${tool.lightColor} text-xs font-semibold px-2.5 py-1 rounded-md`}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="hidden sm:block w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}