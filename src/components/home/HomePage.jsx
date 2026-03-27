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
    { icon: ShieldCheck, title: 'Safety First', description: 'Get instant alerts about dangerous chemical combinations', iconBg: 'bg-teal-50', iconColor: 'text-[#02988C]' },
    { icon: Zap, title: 'Lightning Fast', description: 'AI generates professional formulas in seconds', iconBg: 'bg-cyan-50', iconColor: 'text-[#09D2FF]' },
    { icon: Lightbulb, title: 'Smart Analysis', description: 'Deep insights into every ingredient interaction', iconBg: 'bg-violet-50', iconColor: 'text-[#9531F5]' },
    { icon: Leaf, title: 'Eco-Friendly', description: 'Sustainability scoring for greener products', iconBg: 'bg-teal-50', iconColor: 'text-[#02988C]' },
    { icon: BarChart3, title: 'Compliance Ready', description: 'Meet global regulatory standards automatically', iconBg: 'bg-cyan-50', iconColor: 'text-[#09D2FF]' },
    { icon: Award, title: 'Pro Results', description: 'Lab-quality analysis without lab costs', iconBg: 'bg-violet-50', iconColor: 'text-[#9531F5]' }
  ];

  const audiences = [
    { icon: Home, title: 'DIY Creators', description: 'Create safe skincare, soaps, and cleaning products at home', iconBg: 'bg-teal-50', iconColor: 'text-[#02988C]' },
    { icon: Building2, title: 'Small Businesses', description: 'Launch product lines without expensive lab testing', iconBg: 'bg-cyan-50', iconColor: 'text-[#09D2FF]' },
    { icon: Rocket, title: 'Startups', description: 'Validate and scale formulations with confidence', iconBg: 'bg-violet-50', iconColor: 'text-[#9531F5]' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead {...pageSEO.home} />
      
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-50">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-20 sm:pb-28">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-slate-900"
            >
              Create <span className="text-[#02988C]">Safe Products</span>
              <br />
              Without the Lab
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg sm:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Test chemical safety, generate professional formulas, and build sustainable products — all from your browser.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to={createPageUrl("Simulator")}>
                <Button size="lg" className="w-full sm:w-auto bg-[#02988C] hover:bg-[#027d73] text-white px-8 py-4 text-base rounded-full font-semibold shadow-md">
                  <Zap className="w-5 h-5 mr-2" />
                  Start 14-Day Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl("generator")}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 px-8 py-4 text-base rounded-full font-semibold">
                  <Sparkles className="w-5 h-5 mr-2 text-slate-500" />
                  Create Formula
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12 max-w-3xl mx-auto"
            >
              {[
                { icon: Database, value: '5,000+', label: 'Chemicals in Database' },
                { icon: Zap, value: '<1s', label: 'Analysis Speed' },
                { icon: CheckCircle2, value: '14 Days', label: 'Free Trial' },
                { icon: Clock, value: '24/7', label: 'Available' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon className="w-4 h-4 text-[#02988C]" />
                    <span className="text-2xl sm:text-3xl font-bold text-slate-800">{stat.value}</span>
                  </div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Powerful Tools, Simple Interface
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Everything you need to create, test, and launch safe products
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={createPageUrl(feature.link)}>
                  <Card className="group h-full border border-slate-200 hover:border-[#02988C]/30 hover:shadow-xl transition-all duration-300 cursor-pointer">
                   <CardContent className="p-8">
                     <div className="w-14 h-14 rounded-2xl bg-[#02988C]/10 flex items-center justify-center mb-6 group-hover:bg-[#02988C] transition-colors duration-300">
                       <feature.icon className="w-7 h-7 text-[#02988C] group-hover:text-white transition-colors duration-300" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                     <p className="text-slate-500 mb-4">{feature.description}</p>
                     <div className="flex items-center text-[#02988C] font-semibold text-sm group-hover:translate-x-1 transition-transform">
                       Start free trial <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 bg-[#9531F5]/10 text-[#9531F5] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              From Idea to Safe Product in Minutes
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Skip the guesswork. Our AI-powered platform guides you through every step of product creation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Choose Your Product', description: 'Select from skincare, cleaning, hair care, and more — or describe your own custom idea.', color: 'bg-[#02988C]' },
              { step: '02', title: 'AI Generates Formulas', description: 'Get multiple professional-grade formula options tailored to your needs in seconds.', color: 'bg-[#09D2FF]' },
              { step: '03', title: 'Test & Refine', description: 'Run safety simulations, check compliance, and fine-tune your formula before production.', color: 'bg-[#9531F5]' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 border border-slate-200 h-full">
                  <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-6`}>
                    <span className="text-white font-bold text-lg">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-500">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-slate-300"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Built for Creators Like You
            </h2>
            <p className="text-lg text-slate-500">
              From hobbyists to entrepreneurs, we've got you covered
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {audiences.map((audience, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`w-16 h-16 rounded-2xl ${audience.iconBg} flex items-center justify-center mx-auto mb-6`}>
                  <audience.icon className={`w-8 h-8 ${audience.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{audience.title}</h3>
                <p className="text-slate-500">{audience.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Why Choose Suttain
            </h2>
            <p className="text-lg text-slate-500">
              Professional-grade tools without the complexity
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full border border-slate-200 hover:shadow-md transition-all bg-white">
                  <CardContent className="p-6">
                    <div className={`w-11 h-11 rounded-xl ${benefit.iconBg} flex items-center justify-center mb-4`}>
                      <benefit.icon className={`w-5 h-5 ${benefit.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
                    <p className="text-slate-500 text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900 rounded-3xl p-10 sm:p-14 text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to Create Safer Products?
            </h2>
            <p className="text-base text-slate-400 mb-8 max-w-lg mx-auto">
              Join thousands of creators who trust Suttain for chemical safety and formulation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Simulator")}>
                <Button size="lg" className="w-full sm:w-auto bg-[#02988C] hover:bg-[#027d73] text-white px-8 py-4 text-base rounded-full font-semibold">
                  Start 14-Day Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl("BookADemo")}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border border-slate-600 text-white hover:bg-slate-800 px-8 py-4 text-base rounded-full font-semibold">
                  <Play className="w-4 h-4 mr-2" />
                  Book a Demo
                </Button>
              </Link>
            </div>
            <p className="text-sm text-slate-400 mt-6 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#02988C]" />
              No credit card required • 14-day free trial included
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}