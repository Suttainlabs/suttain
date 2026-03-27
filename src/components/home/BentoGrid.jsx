import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Brain, Leaf, BarChart3, Lock } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "Safety-first analysis", desc: "Every reaction checked against verified chemical databases.", color: "text-teal-600", bg: "bg-teal-50" },
  { icon: Zap, title: "Instant results", desc: "Full analysis generated in under one second.", color: "text-amber-600", bg: "bg-amber-50" },
  { icon: Brain, title: "Deep AI intelligence", desc: "Trained on millions of interactions and research papers.", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Leaf, title: "Sustainability scoring", desc: "Environmental impact score for every formula you create.", color: "text-green-600", bg: "bg-green-50" },
  { icon: BarChart3, title: "50+ region compliance", desc: "Auto-check formulas against FDA, EU, and global standards.", color: "text-violet-600", bg: "bg-violet-50" },
  { icon: Lock, title: "Private & secure", desc: "Your formulas are encrypted and never shared with anyone.", color: "text-slate-600", bg: "bg-slate-100" },
];

export default function BentoGrid() {
  return (
    <section className="py-20 sm:py-28 bg-slate-50/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-violet-600 mb-2 tracking-wide uppercase">Why Suttain</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Professional-grade. Zero complexity.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <h3 className="font-bold text-slate-900 mb-1.5">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}