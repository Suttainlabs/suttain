import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Zap, Brain, Leaf, BarChart3, Award,
  TrendingUp, Lock
} from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Safety-First Analysis",
    description: "Every reaction is checked against peer-reviewed chemical databases for hazard detection.",
    className: "md:col-span-2 md:row-span-1",
    gradient: "from-teal-500/10 to-emerald-500/10",
    iconColor: "text-teal-600",
    iconBg: "bg-teal-100",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "AI generates analyses in under a second. No waiting, no delays.",
    className: "md:col-span-1 md:row-span-1",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    icon: Brain,
    title: "Deep AI Intelligence",
    description: "Advanced models trained on millions of chemical interactions and research papers.",
    className: "md:col-span-1 md:row-span-1",
    gradient: "from-blue-500/10 to-indigo-500/10",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    icon: Leaf,
    title: "Sustainability Scoring",
    description: "Every formula gets an environmental impact score with actionable improvement suggestions.",
    className: "md:col-span-1 md:row-span-1",
    gradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
  },
  {
    icon: BarChart3,
    title: "Global Compliance",
    description: "Automatically check formulas against FDA, EU, and 50+ regional regulations.",
    className: "md:col-span-1 md:row-span-1",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-600",
    iconBg: "bg-violet-100",
  },
  {
    icon: TrendingUp,
    title: "Business-Ready Reports",
    description: "Export lab-quality PDF reports with full compliance documentation for your products.",
    className: "md:col-span-1 md:row-span-1",
    gradient: "from-cyan-500/10 to-sky-500/10",
    iconColor: "text-cyan-600",
    iconBg: "bg-cyan-100",
  },
  {
    icon: Lock,
    title: "Private & Secure",
    description: "Your formulas and data are encrypted and never shared. You own everything you create.",
    className: "md:col-span-1 md:row-span-1",
    gradient: "from-slate-500/10 to-gray-500/10",
    iconColor: "text-slate-600",
    iconBg: "bg-slate-100",
  },
  {
    icon: Award,
    title: "Rewards Program",
    description: "Earn points for every simulation, formula, and review. Redeem for premium features.",
    className: "md:col-span-1 md:row-span-1",
    gradient: "from-rose-500/10 to-pink-500/10",
    iconColor: "text-rose-600",
    iconBg: "bg-rose-100",
  },
];

export default function BentoGrid() {
  return (
    <section className="py-24 sm:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-violet-600 bg-violet-50 px-4 py-1.5 rounded-full mb-4">
            Why Suttain
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-4">
            Built for Modern Formulators
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Professional-grade capabilities without the complexity or cost
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`${item.className} group`}
            >
              <div className={`h-full bg-gradient-to-br ${item.gradient} rounded-2xl p-6 sm:p-7 border border-white hover:shadow-lg transition-all duration-300`}>
                <div className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center mb-4`}>
                  <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}