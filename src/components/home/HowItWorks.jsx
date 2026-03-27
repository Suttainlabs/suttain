import React from "react";
import { motion } from "framer-motion";
import { UserPlus, Search, FileCheck, ArrowDown } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Sign Up Free",
    description: "Create your account in seconds and get full access to all tools for 14 days. No credit card needed.",
  },
  {
    icon: Search,
    number: "02",
    title: "Analyze & Create",
    description: "Simulate chemical reactions, generate formulas, or scan existing products with our AI-powered tools.",
  },
  {
    icon: FileCheck,
    number: "03",
    title: "Export & Launch",
    description: "Download professional reports, compliance documentation, and production-ready formulas.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 sm:py-32 bg-slate-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-teal-400 bg-teal-400/10 px-4 py-1.5 rounded-full mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            Up and Running in Minutes
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            No complex setup. No learning curve. Just sign up and start creating.
          </p>
        </motion.div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="flex items-start gap-6 sm:gap-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:bg-white/[0.08] transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                      <step.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-teal-400 mb-1 tracking-widest">
                      STEP {step.number}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </motion.div>
              {index < steps.length - 1 && (
                <div className="flex justify-center">
                  <ArrowDown className="w-5 h-5 text-slate-600" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}