import React from 'react';
import { Beaker, Home, Briefcase, GraduationCap, HardHat, FlaskConical, Factory, Leaf, Pill, ShieldCheck, Microscope, Zap } from "lucide-react";
import { motion } from "framer-motion";

const personas = [
  {
    id: 'student',
    title: 'Student',
    icon: GraduationCap,
    description: 'School projects and lab experiments',
    tags: ['Beginner', 'Academic'],
    style: 'card-blue',
  },
  {
    id: 'household',
    title: 'Household User',
    icon: Home,
    description: 'Check safety of everyday cleaning and personal care products',
    tags: ['Family Safe', 'Easy Mode'],
    style: 'card-green',
  },
  {
    id: 'diy',
    title: 'DIY Maker',
    icon: HardHat,
    description: 'Hobbyists and makers working with paints, resins, and adhesives',
    tags: ['Hands-On', 'Materials'],
    style: 'card-orange',
  },
  {
    id: 'business',
    title: 'Small Business',
    icon: Briefcase,
    description: 'Formulation & compliance for skincare, cosmetics, and wellness brands',
    tags: ['Pro', 'Compliance'],
    style: 'card-violet',
  },
  {
    id: 'teacher',
    title: 'STEM Teacher',
    icon: Beaker,
    description: 'Demonstrate chemical principles safely in classrooms',
    tags: ['Educator', 'K-12 / HE'],
    style: 'card-teal',
  },
  {
    id: 'researcher',
    title: 'Researcher',
    icon: Microscope,
    description: 'Deep analysis and hazard profiling for scientific research',
    tags: ['Advanced', 'Scientific'],
    style: 'card-slate',
  },
  {
    id: 'pharma',
    title: 'Pharma / Biotech',
    icon: Pill,
    description: 'Drug interactions, excipient safety, and formulation stability',
    tags: ['Regulated', 'Clinical'],
    style: 'card-rose',
  },
  {
    id: 'manufacturer',
    title: 'Manufacturer',
    icon: Factory,
    description: 'Industrial chemical handling, safety data, and regulatory compliance',
    tags: ['Industrial', 'SDS / GHS'],
    style: 'card-amber',
  },
  {
    id: 'eco',
    title: 'Sustainability Lead',
    icon: Leaf,
    description: 'Eco-impact assessment, green chemistry, and biodegradability analysis',
    tags: ['Green', 'ESG'],
    style: 'card-emerald',
  },
  {
    id: 'safety',
    title: 'Safety Officer',
    icon: ShieldCheck,
    description: 'Workplace hazard identification, PPE guidance, and risk protocols',
    tags: ['EHS', 'Compliance'],
    style: 'card-red',
  },
  {
    id: 'cosmetic',
    title: 'Cosmetic Chemist',
    icon: FlaskConical,
    description: 'Advanced ingredient profiling for professional cosmetic formulation',
    tags: ['Expert', 'INCI'],
    style: 'card-pink',
  },
  {
    id: 'engineer',
    title: 'Process Engineer',
    icon: Zap,
    description: 'Chemical process optimization, reaction safety, and yield analysis',
    tags: ['Technical', 'R&D'],
    style: 'card-indigo',
  },
];

// Each style defines a completely different visual treatment
const styleMap = {
  'card-blue': {
    wrapper: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-400',
    iconWrapper: 'bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-200',
    title: 'text-blue-900',
    desc: 'text-blue-700/80',
    tag: 'bg-blue-200 text-blue-800',
    accent: 'bg-blue-500',
  },
  'card-green': {
    wrapper: 'bg-white border-2 border-green-300 hover:border-green-500 hover:shadow-green-100',
    iconWrapper: 'bg-green-100 text-green-600 rounded-full border-2 border-green-300',
    title: 'text-slate-900',
    desc: 'text-slate-600',
    tag: 'bg-green-100 text-green-700 border border-green-300',
    accent: 'bg-green-400',
  },
  'card-orange': {
    wrapper: 'bg-gradient-to-tr from-orange-400 to-amber-400 border-transparent hover:from-orange-500 hover:to-amber-500',
    iconWrapper: 'bg-white/30 text-white rounded-xl backdrop-blur-sm',
    title: 'text-white',
    desc: 'text-white/85',
    tag: 'bg-white/20 text-white border border-white/30',
    accent: 'bg-white/40',
  },
  'card-violet': {
    wrapper: 'bg-slate-900 border-slate-700 hover:border-violet-500',
    iconWrapper: 'bg-violet-600 text-white rounded-xl shadow-lg shadow-violet-900',
    title: 'text-white',
    desc: 'text-slate-400',
    tag: 'bg-violet-900 text-violet-300 border border-violet-700',
    accent: 'bg-violet-600',
  },
  'card-teal': {
    wrapper: 'bg-white border border-slate-200 hover:border-teal-400 hover:shadow-teal-100',
    iconWrapper: 'bg-gradient-to-br from-teal-400 to-cyan-500 text-white rounded-2xl shadow-md',
    title: 'text-slate-900',
    desc: 'text-slate-500',
    tag: 'bg-teal-50 text-teal-700 border border-teal-200',
    accent: 'bg-teal-400',
  },
  'card-slate': {
    wrapper: 'bg-slate-100 border border-slate-300 hover:border-slate-500 hover:bg-slate-200',
    iconWrapper: 'bg-slate-700 text-slate-100 rounded-lg',
    title: 'text-slate-900',
    desc: 'text-slate-600',
    tag: 'bg-slate-300 text-slate-700',
    accent: 'bg-slate-600',
  },
  'card-rose': {
    wrapper: 'bg-gradient-to-b from-rose-50 to-pink-100 border border-rose-200 hover:border-rose-400',
    iconWrapper: 'bg-rose-500 text-white rounded-full shadow-lg shadow-rose-200',
    title: 'text-rose-900',
    desc: 'text-rose-700/80',
    tag: 'bg-rose-200 text-rose-800',
    accent: 'bg-rose-400',
  },
  'card-amber': {
    wrapper: 'bg-amber-50 border-2 border-amber-300 hover:border-amber-500',
    iconWrapper: 'bg-amber-400 text-white rounded-xl',
    title: 'text-amber-900',
    desc: 'text-amber-800/75',
    tag: 'bg-amber-200 text-amber-900',
    accent: 'bg-amber-500',
  },
  'card-emerald': {
    wrapper: 'bg-gradient-to-br from-emerald-600 to-teal-700 border-transparent hover:from-emerald-700 hover:to-teal-800',
    iconWrapper: 'bg-white/20 text-white rounded-2xl backdrop-blur-sm border border-white/30',
    title: 'text-white',
    desc: 'text-emerald-100',
    tag: 'bg-white/15 text-white border border-white/25',
    accent: 'bg-white/30',
  },
  'card-red': {
    wrapper: 'bg-white border-l-4 border-red-500 hover:shadow-red-100 border-t border-r border-b border-t-slate-200 border-r-slate-200 border-b-slate-200',
    iconWrapper: 'bg-red-100 text-red-600 rounded-lg border border-red-200',
    title: 'text-slate-900',
    desc: 'text-slate-600',
    tag: 'bg-red-50 text-red-700 border border-red-200',
    accent: 'bg-red-500',
  },
  'card-pink': {
    wrapper: 'bg-gradient-to-tr from-pink-100 via-fuchsia-50 to-purple-100 border border-purple-200 hover:border-fuchsia-400',
    iconWrapper: 'bg-gradient-to-br from-pink-400 to-fuchsia-500 text-white rounded-2xl shadow-md',
    title: 'text-purple-900',
    desc: 'text-purple-700/80',
    tag: 'bg-purple-100 text-purple-700 border border-purple-200',
    accent: 'bg-fuchsia-400',
  },
  'card-indigo': {
    wrapper: 'bg-indigo-950 border border-indigo-800 hover:border-indigo-500',
    iconWrapper: 'bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-900',
    title: 'text-indigo-100',
    desc: 'text-indigo-300/80',
    tag: 'bg-indigo-800 text-indigo-300 border border-indigo-700',
    accent: 'bg-indigo-500',
  },
};

export default function PersonaSelector({ onSelectPersona }) {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Who are you?</h1>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
          Select a profile to tailor the simulator to your needs and expertise level
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {personas.map((persona, index) => {
          const s = styleMap[persona.style];
          return (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectPersona(persona.id)}
              className={`cursor-pointer rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-300 shadow-sm hover:shadow-lg ${s.wrapper}`}
            >
              <div className={`w-12 h-12 flex items-center justify-center flex-shrink-0 ${s.iconWrapper}`}>
                <persona.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className={`text-base font-bold mb-1 ${s.title}`}>{persona.title}</h3>
                <p className={`text-xs leading-relaxed ${s.desc}`}>{persona.description}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {persona.tags.map(tag => (
                  <span key={tag} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.tag}`}>{tag}</span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}