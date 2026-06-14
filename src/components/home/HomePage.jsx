import React, { useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, FlaskConical, Sparkles, ShieldCheck,
  Leaf, BarChart3, Zap, TestTube, QrCode, Cpu, Droplets, Database
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import AuthContext from "../auth/AuthContext";
import SEOHead, { pageSEO } from "../shared/SEOHead";

function useCountUp(target, duration = 1800, startOnView = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) { setStarted(true); return; }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started || target === null) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { count, ref };
}

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: "easeOut" },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: "easeOut" },
});

function useAbbreviatedCount(target, duration = 1800) {
  const { count, ref } = useCountUp(target, duration);
  let display;
  if (target >= 1000000) {
    const val = (count / 1000000).toFixed(count >= 1000000 ? 0 : 1);
    display = `${val}M+`;
  } else if (target >= 1000) {
    const val = (count / 1000).toFixed(count >= 1000 ? 0 : 1);
    display = `${val}k+`;
  } else {
    display = `${count}+`;
  }
  return { display, ref };
}

function AnimatedStat({ target, label, color, duration = 1800 }) {
  const { display, ref } = useAbbreviatedCount(target, duration);
  return (
    <div ref={ref} className="flex flex-col items-center px-5 py-4">
      <p className="text-2xl font-bold leading-none tabular-nums" style={{ color }}>{display}</p>
      <p className="text-xs text-slate-500 mt-1.5 font-medium">{label}</p>
    </div>
  );
}

function StaticStat({ value, label, color }) {
  return (
    <div className="flex flex-col items-center px-5 py-4">
      <p className="text-2xl font-bold leading-none" style={{ color }}>{value}</p>
      <p className="text-xs text-slate-500 mt-1.5 font-medium">{label}</p>
    </div>
  );
}

function StatStrip() {
  return (
    <div className="relative inline-flex flex-wrap justify-center rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden divide-x divide-slate-100">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #02988C60, #9531F560, transparent)" }} />
      <StaticStat value="130M+" label="Chemicals" color="#02988C" />
      <StaticStat value="&lt;1s" label="Analysis" color="#9531F5" />
      <StaticStat value="24/7" label="Available" color="#9531F5" />
      <StaticStat value="Free" label="To Start" color="#02988C" />
    </div>
  );
}

export default function HomePage() {
  const { user } = useContext(AuthContext);

  const tools = [
    {
      icon: TestTube,
      label: "Chemical Simulator",
      desc: "Test chemical interactions, predict hazards, and analyze safety data sheets with AI-powered risk scoring.",
      href: "Simulator",
      color: "#02988C",
    },
    {
      icon: Sparkles,
      label: "Formula Generator",
      desc: "Build fully validated formulas with safety scoring, compliance flags, and sustainability ratings built in.",
      href: "generator",
      color: "#9531F5",
    },
    {
      icon: QrCode,
      label: "SuttainScan",
      desc: "Scan any product barcode for a full ingredient breakdown, toxicity profile, and eco-impact score.",
      href: "BarcodeScanner",
      color: "#02988C",
    },
    {
      icon: Droplets,
      label: "Hydration Intelligence",
      desc: "Track daily water intake with biological food-linked adjustments and personalized smart reminders.",
      href: "HydrationHome",
      color: "#9531F5",
    },
    {
      icon: Cpu,
      label: "Computational Simulations",
      desc: "Run DFT, molecular dynamics, drug discovery, protein modeling, and quantum chemistry scripts.",
      href: "ComputationalSimulation",
      color: "#02988C",
    },
    {
      icon: Leaf,
      label: "Carbon & Reporting",
      desc: "Simulate carbon tax scenarios, model decarbonization ROI, and export sustainability reports.",
      href: "CarbonTaxSimulator",
      color: "#9531F5",
    },
    {
      icon: Database,
      label: "Ingredient Database",
      desc: "Explore 250k+ chemicals by toxicity, INCI name, eco-impact, regulatory status, and origin.",
      href: "IngredientDatabase",
      color: "#02988C",
    },
    {
      icon: BarChart3,
      label: "Comparative Impact Report",
      desc: "Benchmark your formula's environmental score against industry averages with exportable reports.",
      href: "ComparativeImpactReport",
      color: "#9531F5",
    },
  ];

  const pillars = [
    { icon: ShieldCheck, label: "Safety Analysis" },
    { icon: Leaf, label: "Sustainability" },
    { icon: BarChart3, label: "Compliance" },
    { icon: Zap, label: "AI-Powered" },
  ];

  return (
    <div className="min-h-screen bg-white font-gilroy">
      <SEOHead {...pageSEO.home} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white pt-20 pb-28 sm:pt-28 sm:pb-36">
        {/* Soft background blobs — teal + purple only */}
        <div
          className="pointer-events-none absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #02988C 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #9531F5 0%, transparent 70%)" }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Label pill */}
          <motion.div {...fade(0)} className="inline-flex items-center gap-2 border border-[#02988C]/25 bg-[#02988C]/6 text-[#02988C] text-sm font-semibold px-4 py-1.5 rounded-full mb-8">
            <FlaskConical className="w-3.5 h-3.5" />
            Chemical Safety Platform
          </motion.div>

          <motion.h1
            {...fade(0.08)}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6"
            style={{ textWrap: "balance" }}
          >
            Safe Products,{" "}
            <span style={{ color: "#02988C" }}>No Lab</span>{" "}
            Required
          </motion.h1>

          <motion.p
            {...fade(0.16)}
            className="text-lg sm:text-xl text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Suttain gives formulators, brands, and researchers instant chemical safety analysis, compliance checks, and AI-powered formula generation — no lab required.
          </motion.p>

          <motion.div {...fade(0.22)} className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to={createPageUrl("Simulator")}>
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-base text-white shadow-lg shadow-[#02988C]/20 hover:shadow-xl hover:shadow-[#02988C]/30"
                style={{ background: "#02988C" }}
              >
                {user ? "Open Simulator" : "Analyze for Free"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("generator")}>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-base border-2"
                style={{ borderColor: "#9531F5", color: "#9531F5" }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Build a Formula
              </Button>
            </Link>
          </motion.div>

          {/* Stat strip */}
          <motion.div {...fade(0.32)} className="mt-16">
            <StatStrip />
          </motion.div>
        </div>
      </section>

      {/* ── Pillar strip ── */}
      <section className="bg-slate-50 border-y border-slate-100 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8">
            {pillars.map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
                <Icon className="w-4 h-4" style={{ color: i % 2 === 0 ? "#02988C" : "#9531F5" }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools Grid ── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn()} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Eight Tools, One Platform
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">From chemical safety and formula generation to hydration tracking and carbon reporting — everything in one place.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tools.map(({ icon: Icon, label, desc, href, color }, i) => (
              <motion.div key={i} {...fadeIn(i * 0.06)}>
                <Link to={createPageUrl(href)} className="group block h-full">
                  <div className="h-full border border-slate-200 rounded-2xl p-6 bg-white hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col" style={{ borderTopColor: color, borderTopWidth: 3 }}>
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 flex-shrink-0"
                      style={{ background: `${color}14` }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2 text-base">{label}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed flex-1">{desc}</p>
                    <div className="mt-4 flex items-center text-sm font-semibold" style={{ color }}>
                      Explore
                      <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 sm:py-32 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn()} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              From Idea to Safe Product in Three Steps
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">No chemistry degree needed. No expensive lab tests. Just results.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "01", title: "Describe Your Product", body: "Choose a category — skincare, cleaning, food-safe, or industrial — or describe it in plain language.", color: "#02988C" },
              { n: "02", title: "Get Instant Analysis", body: "Receive AI-generated formula options with safety scores, compliance flags, and hazard summaries.", color: "#9531F5" },
              { n: "03", title: "Refine and Export", body: "Adjust ingredient percentages, run edge-case simulations, and export production-ready documentation.", color: "#02988C" },
            ].map((step, i) => (
              <motion.div key={i} {...fadeIn(i * 0.12)}>
                <div className="bg-white rounded-2xl p-7 border border-slate-200 h-full relative overflow-hidden">
                  <div
                    className="absolute top-0 right-0 text-[96px] font-black leading-none opacity-[0.04] select-none"
                    style={{ color: step.color }}
                  >
                    {step.n}
                  </div>
                  <span
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-white text-sm font-bold mb-5"
                    style={{ background: step.color }}
                  >
                    {step.n}
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 sm:py-32 bg-white px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            {...fadeIn()}
            className="relative rounded-3xl overflow-hidden text-center px-8 py-16 sm:px-16 sm:py-20"
            style={{ background: "linear-gradient(135deg, #02988C 0%, #0cbcb0 50%, #9531F5 100%)" }}
          >
            {/* Subtle overlay texture */}
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ textWrap: "balance" }}>
                Stop Guessing. Start Knowing.
              </h2>
              <p className="text-white/70 text-base mb-10 max-w-md mx-auto">
                Join thousands of formulators who use Suttain to build safer products, faster. Free to start — no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to={createPageUrl("Simulator")}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-base bg-white hover:bg-white/90 transition-colors"
                    style={{ color: "#02988C" }}
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl("BookADemo")}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-base text-white border-2 border-white/40 bg-transparent hover:bg-white/10 transition-colors"
                  >
                    Book a Demo
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}