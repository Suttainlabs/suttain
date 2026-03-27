import React from "react";
import { motion } from "framer-motion";
import { Home, Building2, GraduationCap, FlaskConical } from "lucide-react";

const audiences = [
  { icon: Home, title: "DIY Creators", desc: "Make safe skincare, soap, and cleaning products at home.", gradient: "from-teal-500 to-emerald-500" },
  { icon: Building2, title: "Businesses", desc: "Launch compliant product lines without a lab.", gradient: "from-cyan-500 to-blue-500" },
  { icon: GraduationCap, title: "Educators", desc: "Interactive simulations for safe classroom chemistry.", gradient: "from-violet-500 to-purple-500" },
  { icon: FlaskConical, title: "Researchers", desc: "Advanced modeling with experimental parameters.", gradient: "from-indigo-500 to-blue-600" },
];

export default function AudienceSection() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-cyan-600 mb-2 tracking-wide uppercase">Who it's for</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for every creator
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {audiences.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="text-center bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-4 shadow-sm`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">{item.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}