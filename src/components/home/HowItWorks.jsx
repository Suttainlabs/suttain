import React from "react";
import { motion } from "framer-motion";
import { UserPlus, Search, FileCheck } from "lucide-react";

const steps = [
  { icon: UserPlus, num: "1", title: "Sign up free", desc: "Full access to all tools for 14 days. No credit card." },
  { icon: Search, num: "2", title: "Analyze & create", desc: "Simulate reactions, generate formulas, or scan products." },
  { icon: FileCheck, num: "3", title: "Export & launch", desc: "Download reports, compliance docs, and production-ready formulas." },
];

export default function HowItWorks() {
  return (
    <section className="py-20 sm:py-28 bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-teal-400 mb-2 tracking-wide uppercase">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Up and running in minutes
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-500/20">
                <step.icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs font-bold text-teal-400 tracking-widest mb-2 block">STEP {step.num}</span>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}