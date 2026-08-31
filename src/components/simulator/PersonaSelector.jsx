import React from 'react';
import { motion } from 'framer-motion';
import { Home, Microscope, Briefcase } from 'lucide-react';

const PURPOSES = [
  {
    id: 'household',
    title: 'Everyday safety',
    icon: Home,
    description: 'Check how household, cleaning, and personal care products interact at home.',
    accent: 'teal',
  },
  {
    id: 'researcher',
    title: 'Research & science',
    icon: Microscope,
    description: 'Advanced analysis with experimental controls, hazard profiling, and documentation.',
    accent: 'violet',
  },
  {
    id: 'business',
    title: 'Formulation & business',
    icon: Briefcase,
    description: 'Build and validate cosmetic, skincare, and product formulas with compliance.',
    accent: 'slate',
  },
];

const ACCENT_STYLES = {
  teal: {
    iconWrap: 'bg-teal-50 group-hover:bg-[#02988C]',
    icon: 'text-[#02988C] group-hover:text-white',
    ring: 'hover:border-[#02988C] hover:shadow-teal-100',
  },
  violet: {
    iconWrap: 'bg-violet-50 group-hover:bg-violet-600',
    icon: 'text-violet-600 group-hover:text-white',
    ring: 'hover:border-violet-500 hover:shadow-violet-100',
  },
  slate: {
    iconWrap: 'bg-slate-100 group-hover:bg-slate-800',
    icon: 'text-slate-700 group-hover:text-white',
    ring: 'hover:border-slate-700 hover:shadow-slate-200',
  },
};

export default function PersonaSelector({ onSelectPersona }) {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">What are you doing?</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Pick one to tailor the simulator to your needs. You can switch anytime.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PURPOSES.map((p, index) => {
          const styles = ACCENT_STYLES[p.accent];
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectPersona(p.id)}
              className={`text-left bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 cursor-pointer shadow-sm transition-all duration-200 group ${styles.ring}`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 ${styles.iconWrap}`}
              >
                <p.icon className={`w-6 h-6 transition-colors duration-200 ${styles.icon}`} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{p.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{p.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}