import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Layers, ChevronRight, Sparkles, Shield, Target, Zap } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Brand gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3a8c6e] via-[#02988C] to-[#09D2FF]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(149,49,245,0.15),transparent_60%)]" />
      
      <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
        >
          Safer, smarter product formulation for
          <br className="hidden sm:block" /> 
          <span className="text-suttain-blue">
            eco-conscious creators
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg md:text-xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          Designed for startups, indie brands, and small labs. Simulate chemical interactions, generate clean DIY recipes, and test ingredient compatibility without needing a full-scale lab.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <Link to={createPageUrl("generator")}>
            <Button className="bg-white text-suttain-teal hover:bg-white/90 px-8 py-3 text-base font-medium rounded-full transition-all duration-300 flex items-center group shadow-lg w-full sm:w-auto">
              Start Formula Generator
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to={createPageUrl("Simulator")}>
            <Button 
              variant="outline" 
              className="bg-transparent border-2 border-white/40 text-white hover:bg-white/10 px-8 py-3 text-base font-medium rounded-full transition-all duration-300 flex items-center group shadow-lg w-full sm:w-auto"
            >
              Simulate Chemical Mix
               <Layers className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-6 text-sm text-white/70"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-suttain-blue" />
            Minimize trial-and-error
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-suttain-blue" />
            Avoid risky combinations
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-suttain-blue" />
            Formulate clean, compliant products faster
          </div>
        </motion.div>
      </div>

      {/* Curved bottom edge */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60V0C240 40 480 60 720 60C960 60 1200 40 1440 0V60H0Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}