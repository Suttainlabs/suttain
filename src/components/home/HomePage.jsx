import React, { useContext, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import {
  Layers, Sparkles, ArrowRight, Lightbulb,
  CheckCircle2, Home, Building2, Rocket, Leaf,
  ScanLine, ChevronRight, Zap,
  Database, ShieldCheck, BarChart3, Award, Clock, FlaskConical
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AuthContext from "../auth/AuthContext";
import FreeTrialBanner from "./FreeTrialBanner";
import SEOHead, { pageSEO } from "../shared/SEOHead";

export default function HomePage() {
  const { user } = useContext(AuthContext);
  const [showTrialBanner, setShowTrialBanner] = useState(true);

  const features = [
    {
      id: 'simulator',
      icon: Layers,
      title: 'Chemical Simulator',
      description: 'Test chemical interactions safely before mixing. Get instant hazard analysis and reaction predictions.',
      link: 'Simulator',
      color: 'bg-suttain-teal'
    },
    {
      id: 'generator',
      icon: Sparkles,
      title: 'Formula Generator',
      description: 'Custom recipes for skincare, cleaning products and more. Professional-grade formulas in seconds.',
      link: 'generator',
      color: 'bg-suttain-purple'
    },
    {
      id: 'scanner',
      icon: ScanLine,
      title: 'Quick Scan',
      description: 'Scan any product barcode to analyze ingredients instantly. Safety ratings and allergen alerts.',
      link: 'BarcodeScanner',
      color: 'bg-suttain-blue'
    }
  ];

  const benefits = [
    { icon: ShieldCheck, title: 'Safety First', description: 'Get instant alerts about dangerous chemical combinations' },
    { icon: Zap, title: 'Lightning Fast', description: 'Professional formulas generated in seconds' },
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
    <div className="min-h-screen font-gilroy">
      <SEOHead {...pageSEO.home} />

      {/* Free Trial Banner */}
      {!user && showTrialBanner && (
        <AnimatePresence>
          <FreeTrialBanner onDismiss={() => setShowTrialBanner(false)} />
        </AnimatePresence>
      )}
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-20 sm:pb-24">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-slate-900"
            >
              Create{" "}
              <span className="text-suttain-teal">Safe Products</span>
              <br />
              Without the Lab
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg sm:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Simulate chemical reactions, generate ready-to-make formulas, and ensure product safety. No lab required.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {!user && (
                <Link to={createPageUrl("Simulator")}>
                  <Button size="lg" className="w-full sm:w-auto relative overflow-hidden bg-gradient-to-r from-suttain-teal to-suttain-blue text-white px-10 py-5 text-base rounded-full font-bold shadow-lg shadow-suttain-teal/25 hover:shadow-xl hover:shadow-suttain-teal/30 hover:scale-105 transition-all duration-300">
                    <Zap className="w-5 h-5 mr-2" />
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              )}
              <Link to={createPageUrl("Simulator")}>
                <Button size="lg" variant={user ? "default" : "outline"} className={user
                  ? "w-full sm:w-auto bg-suttain-teal hover:bg-suttain-teal/90 text-white px-8 py-4 text-base rounded-full font-semibold shadow-md"
                  : "w-full sm:w-auto border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-base rounded-full font-semibold"
                }>
                  <Layers className="w-5 h-5 mr-2" />
                  {user ? 'Go to Simulator' : 'Try Simulator'}
                </Button>
              </Link>
              <Link to={createPageUrl("generator")}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-suttain-purple/30 text-suttain-purple hover:bg-suttain-purple/5 px-8 py-4 text-base rounded-full font-semibold">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Formula
                </Button>
              </Link>
            </motion.div>

            {!user && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-4 text-sm text-slate-400 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                No credit card required &middot; Free tier available
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12 max-w-3xl mx-auto"
            >
              {[
                { icon: Database, value: '10,000+', label: 'Chemicals' },
                { icon: Zap, value: '<1s', label: 'Analysis Speed' },
                { icon: Clock, value: '24/7', label: 'Available' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon className="w-4 h-4 text-suttain-teal" />
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
                  <Card className="group h-full border border-slate-200 hover:border-suttain-teal/30 hover:shadow-xl transition-all duration-300 cursor-pointer bg-white">
                   <CardContent className="p-8">
                     <div className={`w-14 h-14 rounded-2xl ${feature.color}/10 flex items-center justify-center mb-6 group-hover:${feature.color} transition-colors duration-300`}>
                       <feature.icon className={`w-7 h-7 ${feature.color === 'bg-suttain-teal' ? 'text-suttain-teal' : feature.color === 'bg-suttain-purple' ? 'text-suttain-purple' : 'text-suttain-blue'} group-hover:text-white transition-colors duration-300`} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                     <p className="text-slate-500 mb-4 leading-relaxed">{feature.description}</p>
                     <div className="flex items-center text-suttain-teal font-semibold text-sm group-hover:translate-x-1 transition-transform">
                       Explore <ChevronRight className="w-4 h-4 ml-1" />
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
            <span className="inline-flex items-center gap-2 bg-suttain-purple/10 text-suttain-purple px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              From Idea to Safe Product in Minutes
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Skip the guesswork. Our platform guides you through every step of product creation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Choose Your Product', description: 'Select from skincare, cleaning, hair care, and more or describe your own custom idea.', color: 'bg-suttain-teal' },
              { step: '02', title: 'Generate Formulas', description: 'Get multiple professional-grade formula options tailored to your needs in seconds.', color: 'bg-suttain-purple' },
              { step: '03', title: 'Test & Refine', description: 'Run safety simulations, check compliance, and fine-tune your formula before production.', color: 'bg-suttain-blue' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 border border-slate-200 h-full shadow-sm">
                  <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-6`}>
                    <span className="text-white font-bold text-lg">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{item.description}</p>
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
              From hobbyists to entrepreneurs
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
                <div className={`w-16 h-16 rounded-2xl ${index === 0 ? 'bg-suttain-teal/10' : index === 1 ? 'bg-suttain-purple/10' : 'bg-suttain-blue/10'} flex items-center justify-center mx-auto mb-6`}>
                  <audience.icon className={`w-8 h-8 ${index === 0 ? 'text-suttain-teal' : index === 1 ? 'text-suttain-purple' : 'text-suttain-blue'}`} />
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
                    <div className={`w-11 h-11 rounded-xl ${index % 3 === 0 ? 'bg-suttain-teal/10' : index % 3 === 1 ? 'bg-suttain-purple/10' : 'bg-suttain-blue/10'} flex items-center justify-center mb-4`}>
                      <benefit.icon className={`w-5 h-5 ${index % 3 === 0 ? 'text-suttain-teal' : index % 3 === 1 ? 'text-suttain-purple' : 'text-suttain-blue'}`} />
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

      {/* Final CTA — Brand Gradient */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#3a8c6e] via-[#02988C] to-[#09D2FF] rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden"
          >
            {/* Subtle purple glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-suttain-purple/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Ready to Create Safer Products?
              </h2>
              <p className="text-base text-white/70 mb-8 max-w-lg mx-auto">
                Join thousands of creators who trust Suttain for chemical safety and formulation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={createPageUrl("Simulator")}>
                  <Button size="lg" className="w-full sm:w-auto bg-white text-suttain-teal hover:bg-white/90 px-8 py-4 text-base rounded-full font-semibold">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl("BookADemo")}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-2 border-white/40 text-white hover:bg-white/10 px-8 py-4 text-base rounded-full font-semibold">
                    Book a Demo
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-white/50 mt-6 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-white/60" />
                No credit card required
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}