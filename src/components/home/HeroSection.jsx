import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { TestTube, ChevronRight, Sparkles, Beaker, Shield, Target, Zap } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-cyan-50 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-violet-200/25 rounded-full blur-3xl opacity-50"></div>
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] opacity-20"></div>
      
        <div className="max-w-4xl mx-auto text-center relative z-10">
            {/* Floating chemistry icons */}
            <motion.div 
              className="absolute -top-10 left-10 w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Beaker className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.div 
              className="absolute top-20 right-10 w-14 h-14 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            >
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Chemistry Platform
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight"
            >
              Safer, smarter product formulation for
              <br className="hidden sm:block" /> 
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-violet-600 bg-clip-text text-transparent">
                eco-conscious creators
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Designed for startups, indie brands, and small labs. Simulate chemical interactions, generate clean DIY recipes, and test ingredient compatibility — without needing a full-scale lab.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            >
              <Link to={createPageUrl("Generator")}>
                <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8 py-3 text-base font-medium rounded-full transition-all duration-300 flex items-center group shadow-xl hover:shadow-2xl transform hover:-translate-y-1 w-full sm:w-auto">
                  Start Formula Generator
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to={createPageUrl("Simulator")}>
                <Button 
                  variant="outline" 
                  className="bg-white/90 border-2 border-violet-300 text-violet-600 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-400 px-8 py-3 text-base font-medium rounded-full transition-all duration-300 flex items-center group shadow-xl hover:shadow-2xl transform hover:-translate-y-1 w-full sm:w-auto"
                >
                  Simulate Chemical Mix
                  <TestTube className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6 text-sm text-slate-500"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                Minimize trial-and-error
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                Avoid risky combinations
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-500" />
                Formulate clean, compliant products — faster
              </div>
            </motion.div>
      </div>
    </section>
  );
}