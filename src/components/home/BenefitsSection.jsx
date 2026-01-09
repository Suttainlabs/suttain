import React from "react";
import { motion } from "framer-motion";

export default function BenefitsSection({ benefits }) {
  const iconGradients = [
    "bg-red-500",
    "bg-green-500", 
    "bg-yellow-500"
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 glass-card">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4 tracking-tight">
            Why Choose Suttain?
          </h2>
          <p className="text-xl text-slate-600 font-light">
            Making formulation safe, transparent, and accessible for everyone.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="text-center"
            >
              <div className={`w-16 h-16 ${iconGradients[index]} rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3 tracking-tight">
                {benefit.title}
              </h3>
              <p className="text-slate-600 font-light leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}