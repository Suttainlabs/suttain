import React from "react";
import { motion } from "framer-motion";
import { Home, Building2, GraduationCap, FlaskConical, Rocket, Users } from "lucide-react";

const audiences = [
  {
    icon: Home,
    title: "DIY Creators",
    description: "Make soap, skincare, and cleaning products safely at home with guided formulas.",
    gradient: "from-teal-500 to-emerald-500",
  },
  {
    icon: Building2,
    title: "Small Businesses",
    description: "Launch compliant product lines with lab-grade analysis — no lab required.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: GraduationCap,
    title: "Students & Teachers",
    description: "Explore chemistry safely with interactive simulations and educational reports.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: FlaskConical,
    title: "Researchers",
    description: "Advanced reaction modeling with experimental parameters and peer-reviewed data.",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    icon: Rocket,
    title: "Startups",
    description: "Validate formulations fast and iterate with confidence before going to market.",
    gradient: "from-orange-500 to-rose-500",
  },
  {
    icon: Users,
    title: "Teams",
    description: "Collaborate on formulas, share simulations, and manage libraries together.",
    gradient: "from-pink-500 to-violet-500",
  },
];

export default function AudienceSection() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-cyan-600 bg-cyan-50 px-4 py-1.5 rounded-full mb-4">
            Who It's For
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-4">
            Built for Every Creator
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Whether you're mixing at home or scaling a product line, Suttain adapts to you
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiences.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07 }}
              className="group"
            >
              <div className="relative h-full bg-white border border-slate-200 rounded-2xl p-7 hover:border-slate-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Gradient accent line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}