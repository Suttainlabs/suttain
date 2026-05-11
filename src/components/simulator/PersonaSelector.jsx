import React from 'react';
import { Beaker, Home, Briefcase, GraduationCap, HardHat, FlaskConical, Factory, Leaf, Pill, ShieldCheck, Microscope, Zap, Droplets, Baby, ChefHat, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

const personas = [
  { id: 'student',      title: 'Student',           icon: GraduationCap, description: 'School projects and lab experiments',                          tags: ['Beginner', 'Academic'] },
  { id: 'household',    title: 'Household User',     icon: Home,          description: 'Check safety of everyday cleaning and personal care products', tags: ['Family Safe', 'Easy Mode'] },
  { id: 'diy',          title: 'DIY Maker',          icon: HardHat,       description: 'Hobbyists working with paints, resins, and adhesives',         tags: ['Hands-On', 'Materials'] },
  { id: 'business',     title: 'Small Business',     icon: Briefcase,     description: 'Formulation & compliance for skincare and cosmetics brands',   tags: ['Pro', 'Compliance'] },
  { id: 'teacher',      title: 'STEM Teacher',       icon: Beaker,        description: 'Demonstrate chemical principles safely in classrooms',         tags: ['Educator', 'K-12 / HE'] },
  { id: 'researcher',   title: 'Researcher',         icon: Microscope,    description: 'Deep analysis and hazard profiling for scientific research',   tags: ['Advanced', 'Scientific'] },
  { id: 'pharma',       title: 'Pharma / Biotech',   icon: Pill,          description: 'Drug interactions, excipient safety, and formulation stability', tags: ['Regulated', 'Clinical'] },
  { id: 'manufacturer', title: 'Manufacturer',       icon: Factory,       description: 'Industrial chemical handling and regulatory compliance',       tags: ['Industrial', 'SDS / GHS'] },
  { id: 'eco',          title: 'Sustainability Lead', icon: Leaf,          description: 'Eco-impact assessment, green chemistry, and biodegradability', tags: ['Green', 'ESG'] },
  { id: 'safety',       title: 'Safety Officer',     icon: ShieldCheck,   description: 'Workplace hazard identification and risk protocols',           tags: ['EHS', 'Compliance'] },
  { id: 'cosmetic',     title: 'Cosmetic Chemist',   icon: FlaskConical,  description: 'Advanced ingredient profiling for professional cosmetic formulation', tags: ['Expert', 'INCI'] },
  { id: 'engineer',     title: 'Process Engineer',   icon: Zap,           description: 'Chemical process optimization and reaction safety analysis',   tags: ['Technical', 'R&D'] },
  { id: 'nutrition',    title: 'Nutritionist',       icon: ChefHat,       description: 'Food additive safety, nutrient interactions, and labeling',    tags: ['Food', 'Health'] },
  { id: 'parent',       title: 'Parent / Caregiver', icon: Baby,          description: 'Safe product choices for children and sensitive households',   tags: ['Family', 'Safe Picks'] },
  { id: 'fitness',      title: 'Fitness / Wellness', icon: Dumbbell,      description: 'Supplement safety, ingredient stacking, and performance',     tags: ['Sports', 'Wellness'] },
  { id: 'water',        title: 'Water Treatment',    icon: Droplets,      description: 'Disinfectants, pH balance, and water chemistry analysis',     tags: ['Utilities', 'Environmental'] },
];

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {personas.map((persona, index) => (
          <motion.button
            key={persona.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectPersona(persona.id)}
            className="text-left bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 cursor-pointer hover:border-[#02988C] hover:shadow-lg hover:shadow-teal-100 transition-all duration-200 group"
          >
            {/* Icon */}
            <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-[#02988C] transition-colors duration-200">
              <persona.icon className="w-5 h-5 text-[#02988C] group-hover:text-white transition-colors duration-200" />
            </div>

            {/* Text */}
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-[#02988C] transition-colors">{persona.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{persona.description}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {persona.tags.map(tag => (
                <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-700 transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}