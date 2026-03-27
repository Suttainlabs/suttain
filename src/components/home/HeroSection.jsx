import React, { useContext } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import AuthContext from "../auth/AuthContext";

const FloatingOrb = ({ className, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
    animate={{
      y: [0, -20, 0],
      scale: [1, 1.05, 1],
    }}
    transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

export default function HeroSection() {
  const { user, openAuthModal } = useContext(AuthContext);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-h-[90vh] flex items-center">
      {/* Animated background */}
      <FloatingOrb className="w-[500px] h-[500px] bg-teal-500 -top-40 -left-40" delay={0} />
      <FloatingOrb className="w-[400px] h-[400px] bg-violet-600 top-20 right-0" delay={2} />
      <FloatingOrb className="w-[300px] h-[300px] bg-cyan-400 bottom-0 left-1/3" delay={4} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 w-full">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2 mb-8"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400" />
            </span>
            <span className="text-sm text-slate-300 font-medium">Start your 14-day free trial today</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6"
          >
            <span className="text-white">Chemical Safety</span>
            <br />
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Made Intelligent
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Simulate reactions, generate professional formulas, and scan products instantly — 
            powered by AI, trusted by formulators worldwide.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {user ? (
              <Link to={createPageUrl("Simulator")}>
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-6 text-base rounded-xl font-semibold shadow-lg shadow-teal-500/25 border-0">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Go to Simulator
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                onClick={() => openAuthModal("signup")}
                className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-6 text-base rounded-xl font-semibold shadow-lg shadow-teal-500/25 border-0"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
            <Link to={createPageUrl("BookADemo")}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/5 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 px-8 py-6 text-base rounded-xl font-semibold">
                <Play className="w-4 h-4 mr-2" />
                Book a Demo
              </Button>
            </Link>
          </motion.div>

          {/* Trust bar */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 text-sm text-slate-500"
          >
            No credit card required · Cancel anytime · Full access for 14 days
          </motion.p>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "5,000+", label: "Chemicals", sub: "in database" },
              { value: "<1s", label: "Analysis", sub: "response time" },
              { value: "50+", label: "Regions", sub: "compliance" },
              { value: "24/7", label: "AI-Powered", sub: "availability" },
            ].map((stat, i) => (
              <div key={i} className="relative group">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition-colors">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                  <div className="text-xs text-slate-500">{stat.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}