import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Beaker, Home, Briefcase, GraduationCap, HardHat, FlaskConical } from "lucide-react";
import { motion } from "framer-motion";

const personas = [
  { 
    id: 'student', 
    title: 'Student', 
    icon: GraduationCap, 
    description: 'For school projects and lab experiments', 
    gradient: 'from-blue-500 to-cyan-500',
    bgLight: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  { 
    id: 'household', 
    title: 'Household User', 
    icon: Home, 
    description: 'Checking safety of cleaning products', 
    gradient: 'from-green-500 to-emerald-500',
    bgLight: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  { 
    id: 'diy', 
    title: 'DIY User', 
    icon: HardHat, 
    description: 'For hobbyists working with materials', 
    gradient: 'from-orange-500 to-amber-500',
    bgLight: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600'
  },
  { 
    id: "business", 
    title: 'Small Business', 
    icon: Briefcase, 
    description: 'Professional formulation & compliance for skincare and cosmetics', 
    gradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600'
  },
  { 
    id: 'teacher', 
    title: 'STEM Teacher', 
    icon: Beaker, 
    description: 'Demonstrating chemical principles safely', 
    gradient: 'from-teal-500 to-cyan-500',
    bgLight: 'bg-teal-50',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600'
  },
  { 
    id: 'researcher', 
    title: 'Researcher', 
    icon: FlaskConical, 
    description: 'Detailed analysis for scientific research', 
    gradient: 'from-slate-500 to-gray-600',
    bgLight: 'bg-slate-50',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600'
  }
];

export default function PersonaSelector({ onSelectPersona }) {
  return (
    <div className="max-w-5xl mx-auto py-8">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((persona, index) => (
          <motion.div
            key={persona.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              onClick={() => onSelectPersona(persona.id)}
              className="cursor-pointer hover:shadow-2xl hover:border-slate-300 transition-all duration-300 bg-white/90 backdrop-blur-sm h-full border-2 border-slate-200"
            >
              <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
                <div className={`w-14 h-14 ${persona.iconBg} rounded-xl flex items-center justify-center`}>
                  <persona.icon className={`w-7 h-7 ${persona.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{persona.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{persona.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}