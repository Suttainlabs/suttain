import React, { useContext } from "react";
import { motion } from "framer-motion";
import {
  Layers, Sparkles, ArrowRight, Lightbulb,
  CheckCircle2, Home, Building2, Rocket, Leaf,
  ScanLine, Play, ChevronRight, Zap,
  Database, ShieldCheck, BarChart3, Award, Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AuthContext from "../auth/AuthContext";
import SEOHead, { pageSEO } from "../shared/SEOHead";

const SUSTAINABILITY_IMAGES = {
  globeBicycle: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/9b1ee8422_globe-and-bicycle-save-the-planet-idea-internati-2026-01-08-02-40-42-utc.jpg",
  handsPlanting: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/c8f95960f_good-soil-makes-growth-easier-2026-01-09-09-55-54-utc.jpg"
};

export default function HomePage() {
  const { user } = useContext(AuthContext);

  const features = [
    {
      id: 'simulator',
      icon: Layers,
      title: 'Chemical Simulator',
      description: 'Test chemical interactions safely before mixing',
      link: 'Simulator'
    },
    {
      id: 'generator',
      icon: Sparkles,
      title: 'Formula Generator',
      description: 'Custom recipes for skincare, cleaning & more',
      link: 'generator'
    },
    {
      id: 'scanner',
      icon: ScanLine,
      title: 'Quick Scan',
      description: 'Scan any product to analyze ingredients instantly',
      link: 'BarcodeScanner'
    }
  ];

  const benefits = [
    { icon: ShieldCheck, title: 'Safety First', description: 'Get instant alerts about dangerous chemical combinations' },
    { icon: Zap, title: 'Lightning Fast', description: 'AI generates professional formulas in seconds' },
    { icon: Lightbulb, title: 'Smart Analysis', description: 'Deep insights into every ingredient interaction' },
    { icon: Leaf, title: 'Eco-Friendly', description: 'Sustainability scoring for greener products' },
    { icon: BarChart3, title: 'Compliance Ready', description: 'Meet global regulatory standards automatically' },
    { icon: Award, title: 'Pro Results', description: 'Lab-quality analysis without lab costs' }
  ];

  const audiences = [
    { icon: Home, title: 'DIY Creators', description: 'Create safe skincare, soaps, and cleaning products at home' },
    { icon: Building2, title: 'Small Businesses', description: 'Launch product lines without expensive lab testing' },
    { icon: Rocket, title: 'Startups', description: 'Validate and scale formulations with confidence' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead {...pageSEO.home} />
      
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-20 sm:pb-28">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-slate-800"
            >
              Create <span className="text-[#02988C]">safer products</span>,
              <br />
              smarter and faster
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Simulate interactions, generate formulas, and scan products — all from your browser. No lab required.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to={createPageUrl("Simulator")}>
                <Button size="lg" className="w-full sm:w-auto bg-[#02988C] hover:bg-[#027d73] text-white px-8 py-4 text-base rounded-full font-semibold">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl("generator")}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-[#02988C]/20 text-[#02988C] hover:bg-[#02988C]/5 px-8 py-4 text-base rounded-full font-semibold">
                  Create a Formula
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-14 flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm text-slate-400"
            >
              <span>5,000+ ingredients</span>
              <span className="text-slate-200">·</span>
              <span>Instant analysis</span>
              <span className="text-slate-200">·</span>
              <span>14-day free trial</span>
              <span className="text-slate-200">·</span>
              <span>No credit card</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">
              Three tools. One platform.
            </h2>
            <p className="text-base text-slate-400 max-w-xl mx-auto">
              Everything you need to create, test, and launch safe products
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={createPageUrl(feature.link)}>
                  <div className="group h-full bg-white rounded-2xl border border-slate-100 p-7 hover:shadow-lg hover:border-[#02988C]/20 transition-all duration-300 cursor-pointer">
                    <div className="w-11 h-11 rounded-xl bg-[#02988C]/8 flex items-center justify-center mb-5">
                      <feature.icon className="w-5 h-5 text-[#02988C]" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">{feature.description}</p>
                    <span className="text-[#02988C] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Try it free <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 sm:py-28 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">
              Built for creators like you
            </h2>
            <p className="text-base text-slate-400">
              From hobbyists to entrepreneurs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {audiences.map((audience, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#02988C]/8 flex items-center justify-center mx-auto mb-5">
                  <audience.icon className="w-6 h-6 text-[#02988C]" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{audience.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{audience.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">
              Why Suttain
            </h2>
            <p className="text-base text-slate-400">
              Professional-grade tools, zero complexity
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-100"
              >
                <div className="w-10 h-10 rounded-xl bg-[#02988C]/8 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-5 h-5 text-[#02988C]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">{benefit.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#02988C] rounded-3xl p-10 sm:p-14 text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to get started?
            </h2>
            <p className="text-base text-white/70 mb-8 max-w-lg mx-auto">
              Join creators who trust Suttain for safer, sustainable formulation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Simulator")}>
                <Button size="lg" className="w-full sm:w-auto bg-white text-[#02988C] hover:bg-white/90 px-8 py-4 text-base rounded-full font-semibold">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl("BookADemo")}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-base rounded-full font-semibold">
                  Book a Demo
                </Button>
              </Link>
            </div>
            <p className="text-sm text-white/50 mt-6">
              No credit card required · 14-day free trial
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}