import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Suttain saved me from a potentially dangerous mix in my DIY soap recipe. The simulator caught an interaction I never would have known about.",
    name: "Sarah M.",
    role: "DIY Skincare Creator",
    rating: 5,
  },
  {
    quote: "We replaced an entire $5,000/month lab software subscription with Suttain. The formula generator is incredibly accurate and fast.",
    name: "James P.",
    role: "Cosmetics Startup Founder",
    rating: 5,
  },
  {
    quote: "My students love the interactive simulations. It's made teaching chemical safety engaging and hands-on without any real-world risk.",
    name: "Dr. Linda K.",
    role: "Chemistry Professor",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-rose-600 bg-rose-50 px-4 py-1.5 rounded-full mb-4">
            Loved by Creators
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-4">
            What Our Users Say
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="h-full bg-white rounded-2xl p-7 border border-slate-200 hover:shadow-lg transition-shadow flex flex-col">
                <Quote className="w-8 h-8 text-slate-200 mb-4" />
                <p className="text-slate-600 leading-relaxed flex-1 mb-6">
                  "{item.quote}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.role}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}