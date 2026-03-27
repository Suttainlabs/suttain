import React, { useContext } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Play, TestTube, Atom, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import AuthContext from "../auth/AuthContext";

export default function HeroSection() {
  const { user, openAuthModal } = useContext(AuthContext);

  return (
    <section className="relative overflow-hidden">
      {/* Layered gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-teal-50/40" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-teal-100/60 via-cyan-50/40 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-100/40 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20 sm:pb-32">
        <div className="text-center max-w-3xl mx-auto">
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 bg-white border border-slate-200 shadow-sm rounded-full px-4 py-2 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-sm text-slate-600 font-medium">Try free for 14 days — no credit card</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-[2.5rem] leading-[1.15] sm:text-6xl sm:leading-[1.1] lg:text-[4.25rem] lg:leading-[1.08] font-extrabold tracking-tight text-slate-900 mb-5"
          >
            The AI platform for{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative bg-gradient-to-r from-[#02988C] to-[#09D2FF] bg-clip-text text-transparent">
                chemical safety
              </span>
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-lg sm:text-xl text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed font-normal"
          >
            Simulate reactions, generate formulas, and scan products — all from one place.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            {user ? (
              <Link to={createPageUrl("Simulator")}>
                <Button className="w-full sm:w-auto h-12 px-7 text-[15px] rounded-xl font-semibold bg-[#02988C] hover:bg-[#027d73] text-white shadow-md shadow-teal-600/15">
                  <Sparkles className="w-[18px] h-[18px] mr-2" />
                  Go to Simulator
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => openAuthModal("signup")}
                className="w-full sm:w-auto h-12 px-7 text-[15px] rounded-xl font-semibold bg-[#02988C] hover:bg-[#027d73] text-white shadow-md shadow-teal-600/15"
              >
                <Sparkles className="w-[18px] h-[18px] mr-2" />
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            <Link to={createPageUrl("BookADemo")}>
              <Button variant="outline" className="w-full sm:w-auto h-12 px-7 text-[15px] rounded-xl font-semibold border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
                <Play className="w-4 h-4 mr-2 text-slate-400" />
                Book a Demo
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Floating tool cards — visual "product preview" */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 sm:mt-20 max-w-4xl mx-auto"
        >
          <div className="relative bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-1.5">
            {/* Mock app bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-slate-50 rounded-lg px-6 py-1 text-xs text-slate-400 font-medium">suttain.com</div>
              </div>
            </div>
            {/* Tool cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-5">
              {[
                { icon: TestTube, label: "Chemical Simulator", desc: "Test 5,000+ chemical interactions", color: "from-teal-500 to-emerald-500", bg: "bg-teal-50", text: "text-teal-700" },
                { icon: Atom, label: "Formula Generator", desc: "AI-built recipes with safety checks", color: "from-violet-500 to-purple-500", bg: "bg-violet-50", text: "text-violet-700" },
                { icon: QrCode, label: "Quick Scan", desc: "Scan any product for ingredients", color: "from-cyan-500 to-blue-500", bg: "bg-cyan-50", text: "text-cyan-700" },
              ].map((tool, i) => (
                <div key={i} className={`${tool.bg} rounded-xl p-5 border border-white`}>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3`}>
                    <tool.icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className={`font-bold text-sm ${tool.text} mb-1`}>{tool.label}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{tool.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}