import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  { quote: "Suttain caught a dangerous interaction in my DIY soap recipe that I never would have known about. Lifesaver.", name: "Sarah M.", role: "DIY Creator", rating: 5 },
  { quote: "We replaced a $5k/month lab software subscription. The formula generator is incredibly accurate.", name: "James P.", role: "Cosmetics Startup", rating: 5 },
  { quote: "My students love the interactive simulations — hands-on chemistry without real-world risk.", name: "Dr. Linda K.", role: "Chemistry Professor", rating: 5 },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-28 bg-slate-50/70">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-rose-600 mb-2 tracking-wide uppercase">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Loved by creators worldwide
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-5">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-white font-bold text-xs">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-400">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}