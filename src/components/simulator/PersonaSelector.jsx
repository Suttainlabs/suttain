import React, { useState, useMemo } from 'react';
import { Beaker, Home, Briefcase, GraduationCap, HardHat, FlaskConical, Factory, Leaf, Pill, ShieldCheck, Microscope, Zap, Droplets, Baby, ChefHat, Dumbbell, Building2, Stethoscope, Trees, Paintbrush, Truck, Globe, BookOpen, TestTube, Wind, Fish, Flame, Wrench, Crop, Sparkles, Atom, HeartPulse, Recycle, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ['All', 'Education', 'Industry', 'Health', 'Environment', 'Consumer', 'Professional'];

const personas = [
  // Education
  { id: 'student',        title: 'Student',              icon: GraduationCap, description: 'School projects and lab experiments',                           tags: ['Beginner', 'Academic'],      category: 'Education' },
  { id: 'teacher',        title: 'STEM Teacher',          icon: Beaker,        description: 'Demonstrate chemical principles safely in classrooms',          tags: ['Educator', 'K-12 / HE'],     category: 'Education' },
  { id: 'professor',      title: 'University Professor',  icon: BookOpen,      description: 'Advanced coursework, research supervision, lab safety',         tags: ['Academic', 'Research'],      category: 'Education' },
  { id: 'researcher',     title: 'Researcher',            icon: Microscope,    description: 'Deep analysis and hazard profiling for scientific research',    tags: ['Advanced', 'Scientific'],    category: 'Education' },
  // Industry
  { id: 'manufacturer',   title: 'Manufacturer',          icon: Factory,       description: 'Industrial chemical handling and regulatory compliance',        tags: ['Industrial', 'SDS / GHS'],   category: 'Industry' },
  { id: 'engineer',       title: 'Process Engineer',      icon: Zap,           description: 'Chemical process optimization and reaction safety analysis',    tags: ['Technical', 'R&D'],          category: 'Industry' },
  { id: 'petroleum',      title: 'Petroleum Engineer',    icon: Flame,         description: 'Refinery processes, hydrocarbon safety, and fuel chemistry',    tags: ['Oil & Gas', 'Industrial'],   category: 'Industry' },
  { id: 'textile',        title: 'Textile Chemist',       icon: Paintbrush,    description: 'Dye safety, fabric treatments, and finishing chemical checks',  tags: ['Materials', 'Fashion'],      category: 'Industry' },
  { id: 'automotive',     title: 'Automotive Engineer',   icon: Wrench,        description: 'Lubricants, coolants, coatings, and fluid compatibility',       tags: ['Automotive', 'Fluids'],      category: 'Industry' },
  { id: 'logistics',      title: 'Logistics / Transport', icon: Truck,         description: 'Hazmat classification, transport regulations, and safe shipping', tags: ['Hazmat', 'DOT / ADR'],     category: 'Industry' },
  { id: 'mining',         title: 'Mining Engineer',       icon: HardHat,       description: 'Explosives, leaching chemicals, and dust hazard analysis',      tags: ['Mining', 'Safety'],          category: 'Industry' },
  // Health
  { id: 'pharma',         title: 'Pharma / Biotech',      icon: Pill,          description: 'Drug interactions, excipient safety, and formulation stability', tags: ['Regulated', 'Clinical'],    category: 'Health' },
  { id: 'doctor',         title: 'Physician / Clinician', icon: Stethoscope,   description: 'Drug-chemical interactions and patient exposure assessment',    tags: ['Medical', 'Clinical'],       category: 'Health' },
  { id: 'nutrition',      title: 'Nutritionist',          icon: ChefHat,       description: 'Food additive safety, nutrient interactions, and labeling',     tags: ['Food', 'Health'],            category: 'Health' },
  { id: 'fitness',        title: 'Fitness / Wellness',    icon: Dumbbell,      description: 'Supplement safety, ingredient stacking, and performance',      tags: ['Sports', 'Wellness'],        category: 'Health' },
  { id: 'nurse',          title: 'Nurse / Pharmacist',    icon: HeartPulse,    description: 'Medication safety, dosing interactions, and hospital chemicals', tags: ['Clinical', 'Safety'],       category: 'Health' },
  { id: 'vet',            title: 'Veterinarian',          icon: Sparkles,      description: 'Animal drug safety, pest control chemicals, and feed additives', tags: ['Animal', 'Medical'],        category: 'Health' },
  // Environment
  { id: 'eco',            title: 'Sustainability Lead',   icon: Leaf,          description: 'Eco-impact assessment, green chemistry, and biodegradability',  tags: ['Green', 'ESG'],              category: 'Environment' },
  { id: 'water',          title: 'Water Treatment',       icon: Droplets,      description: 'Disinfectants, pH balance, and water chemistry analysis',       tags: ['Utilities', 'Environmental'], category: 'Environment' },
  { id: 'forestry',       title: 'Forestry / Agriculture', icon: Trees,        description: 'Pesticides, herbicides, soil chemistry, and crop safety',       tags: ['Agri', 'Land'],              category: 'Environment' },
  { id: 'marine',         title: 'Marine Biologist',      icon: Fish,          description: 'Aquatic toxicology, ocean pollutants, and marine chemical impact', tags: ['Marine', 'Research'],      category: 'Environment' },
  { id: 'air',            title: 'Air Quality Specialist', icon: Wind,         description: 'VOC emissions, air pollutants, and indoor chemical safety',     tags: ['AQI', 'Environmental'],      category: 'Environment' },
  { id: 'recycling',      title: 'Recycling Specialist',  icon: Recycle,       description: 'Material recovery, chemical separation, and waste processing',  tags: ['Circular', 'Waste'],         category: 'Environment' },
  // Consumer
  { id: 'household',      title: 'Household User',        icon: Home,          description: 'Check safety of everyday cleaning and personal care products',  tags: ['Family Safe', 'Easy Mode'],  category: 'Consumer' },
  { id: 'parent',         title: 'Parent / Caregiver',    icon: Baby,          description: 'Safe product choices for children and sensitive households',    tags: ['Family', 'Safe Picks'],      category: 'Consumer' },
  { id: 'diy',            title: 'DIY Maker',             icon: HardHat,       description: 'Hobbyists working with paints, resins, and adhesives',          tags: ['Hands-On', 'Materials'],     category: 'Consumer' },
  { id: 'chef',           title: 'Chef / Food Enthusiast', icon: ChefHat,      description: 'Food-safe chemical identification, additives, and flavor science', tags: ['Food', 'Culinary'],        category: 'Consumer' },
  { id: 'traveler',       title: 'International Traveler', icon: Globe,        description: 'Country-specific chemical restrictions and product compliance',  tags: ['Travel', 'Compliance'],      category: 'Consumer' },
  // Professional
  { id: 'business',       title: 'Small Business',        icon: Briefcase,     description: 'Formulation & compliance for skincare and cosmetics brands',    tags: ['Pro', 'Compliance'],         category: 'Professional' },
  { id: 'cosmetic',       title: 'Cosmetic Chemist',      icon: FlaskConical,  description: 'Advanced ingredient profiling for professional cosmetic formulation', tags: ['Expert', 'INCI'],       category: 'Professional' },
  { id: 'safety',         title: 'Safety Officer',        icon: ShieldCheck,   description: 'Workplace hazard identification and risk protocols',            tags: ['EHS', 'Compliance'],         category: 'Professional' },
  { id: 'regulatory',     title: 'Regulatory Affairs',    icon: Building2,     description: 'Global compliance, dossier preparation, and ingredient approvals', tags: ['RA', 'Regulatory'],        category: 'Professional' },
  { id: 'consultant',     title: 'Chemical Consultant',   icon: Atom,          description: 'Cross-industry chemical advisory, risk assessments, and SDS authoring', tags: ['Advisory', 'Expert'],  category: 'Professional' },
  { id: 'lab',            title: 'Lab Technician',        icon: TestTube,      description: 'Bench-level chemical testing, QC protocols, and equipment safety', tags: ['Lab', 'QC'],               category: 'Professional' },
].sort((a, b) => a.title.localeCompare(b.title));

export default function PersonaSelector({ onSelectPersona }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return personas.filter(p => {
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Who are you?</h1>
        <p className="text-base text-slate-500 max-w-xl mx-auto">
          Select a profile to tailor the simulator to your needs and expertise level
        </p>
      </motion.div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search profiles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#02988C] focus:ring-1 focus:ring-[#02988C] bg-white"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeCategory === cat
                  ? 'bg-[#02988C] text-white border-[#02988C] shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#02988C] hover:text-[#02988C]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-slate-400 mb-4">{filtered.length} profile{filtered.length !== 1 ? 's' : ''}</p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((persona, index) => (
            <motion.button
              key={persona.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, delay: index * 0.02 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectPersona(persona.id)}
              className="text-left bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 cursor-pointer hover:border-[#02988C] hover:shadow-lg hover:shadow-teal-100 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-[#02988C] transition-colors duration-200">
                  <persona.icon className="w-5 h-5 text-[#02988C] group-hover:text-white transition-colors duration-200" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400 group-hover:text-teal-600 transition-colors">{persona.category}</span>
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-[#02988C] transition-colors">{persona.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{persona.description}</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {persona.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-700 transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No profiles match your search.</p>
        </div>
      )}
    </div>
  );
}