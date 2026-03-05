import React, { useContext } from "react";
import { motion } from "framer-motion";

// Sustainability images
const SUSTAINABILITY_IMAGES = {
  earthDay: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/e46816a88_earth-day-environment-concept-and-eco-concept-2026-01-09-07-31-34-utc.jpg",
  globeBicycle: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/9b1ee8422_globe-and-bicycle-save-the-planet-idea-internati-2026-01-08-02-40-42-utc.jpg",
  handsPlanting: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/c8f95960f_good-soil-makes-growth-easier-2026-01-09-09-55-54-utc.jpg"
};

// Product images
const PRODUCT_IMAGES = {
  cosmeticJars: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/2343edb55_a-fashionable-cosmetic-product-in-glass-matte-whit-2026-01-08-08-26-24-utc.jpg",
  sunscreenBeach: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/24e9e62d3_colorful-sunscreen-bottles-arranged-on-sandy-beach-2026-01-08-06-02-42-utc.jpg",
  serumTextures: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/b0c7eb1bf_demonstration-of-serum-textures-in-a-scientific-wa-2026-01-08-08-12-57-utc.jpg",
  hairDyeKit: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/70a29c76f_hair-dye-kit-samples-of-different-colors-on-neut-2026-01-11-09-10-47-utc.jpg",
  kidsSunscreen: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/ee1fe1c1c_kids-summer-accesories-and-sun-screen-bottle-for-s-2026-01-09-00-08-34-utc.jpg",
  labGlassware: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/025e8ec13_laboratory-glassware-and-molecular-structure-sitti-2026-01-09-09-41-04-utc.jpg",
  cosmeticsWooden: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/7e24c77e6_beautiful-composition-with-cosmetics-on-wooden-bac-2026-02-05-20-53-27-utc.jpg",
  blankContainers: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/ad03a94a9_blank-cosmetic-skincare-makeup-containers-2026-01-07-00-38-06-utc.jpg",
  serumBottles: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/71d10cfe3_bottles-with-serum-or-oil-2026-01-07-01-31-15-utc.jpg"
};
import { Zap, TestTube, Atom, ArrowRight, Brain,
  CheckCircle2, Home, Building2, Rocket, Leaf,
  QrCode, Play, ChevronRight, Clock,
  Beaker, ShieldCheck, BarChart3, Award
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AuthContext from "../auth/AuthContext";
import SEOHead, { pageSEO } from "../shared/SEOHead";

export default function HomePage() {
  const { user } = useContext(AuthContext);

  const features = [
    {
      id: 'simulator',
      icon: TestTube,
      title: 'Chemical Simulator',
      description: 'Test chemical interactions safely before mixing',
      gradient: 'from-[#02988C] to-[#09D2FF]',
      link: 'Simulator'
    },
    {
      id: 'generator',
      icon: Atom,
      title: 'Formula Generator',
      description: 'Custom recipes for skincare, cleaning & more',
      gradient: 'from-[#9531F5] to-[#09D2FF]',
      link: 'generator'
    },
    {
      id: 'scanner',
      icon: QrCode,
      title: 'Quick Scan',
      description: 'Scan any product to analyze ingredients instantly',
      gradient: 'from-[#09D2FF] to-[#02988C]',
      link: 'BarcodeScanner'
    }
  ];

  const benefits = [
    {
      icon: ShieldCheck,
      title: 'Safety First',
      description: 'Get instant alerts about dangerous chemical combinations',
      color: '#02988C'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'AI generates professional formulas in seconds',
      color: '#9531F5'
    },
    {
      icon: Brain,
      title: 'Smart Analysis',
      description: 'Deep insights into every ingredient interaction',
      color: '#09D2FF'
    },
    {
      icon: Leaf,
      title: 'Eco-Friendly',
      description: 'Sustainability scoring for greener products',
      color: '#02988C'
    },
    {
      icon: BarChart3,
      title: 'Compliance Ready',
      description: 'Meet global regulatory standards automatically',
      color: '#9531F5'
    },
    {
      icon: Award,
      title: 'Pro Results',
      description: 'Lab-quality analysis without lab costs',
      color: '#09D2FF'
    }
  ];

  const audiences = [
    {
      icon: Home,
      title: 'DIY Creators',
      description: 'Create safe skincare, soaps, and cleaning products at home',
      color: '#9531F5'
    },
    {
      icon: Building2,
      title: 'Small Businesses',
      description: 'Launch product lines without expensive lab testing',
      color: '#09D2FF'
    },
    {
      icon: Rocket,
      title: 'Startups',
      description: 'Validate and scale formulations with confidence',
      color: '#02988C'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead {...pageSEO.home} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#02988C]/5 to-[#9531F5]/10" />
        
        {/* Decorative product images */}
        <div className="absolute top-20 left-0 w-32 h-32 opacity-10 pointer-events-none hidden lg:block">
          <img src={PRODUCT_IMAGES.cosmeticsWooden} alt="" className="w-full h-full object-cover rounded-full" />
        </div>
        <div className="absolute bottom-10 right-0 w-40 h-40 opacity-10 pointer-events-none hidden lg:block">
          <img src={PRODUCT_IMAGES.serumBottles} alt="" className="w-full h-full object-cover rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-20 sm:pb-28">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              <span className="text-slate-900">Create </span>
              <span className="bg-gradient-to-r from-[#02988C] via-[#09D2FF] to-[#9531F5] bg-clip-text text-transparent">Safe Products</span>
              <br />
              <span className="text-slate-900">Without the Lab</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg sm:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              <span className="font-semibold text-slate-700">No chemistry degree needed.</span> Just tell us what results you want — moisturizing, anti-aging, acne-fighting — and we'll generate professional formulas for you.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to={createPageUrl("Simulator")}>
                <Button size="lg" className="w-full sm:w-auto bg-[#02988C] hover:bg-[#028a7f] text-white px-8 py-4 text-base rounded-full font-semibold shadow-md">
                  <TestTube className="w-5 h-5 mr-2" />
                  Start Free Analysis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl("generator")}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-8 py-4 text-base rounded-full font-semibold shadow-sm">
                  <Atom className="w-5 h-5 mr-2 text-slate-500" />
                  Create Formula
                </Button>
              </Link>
            </motion.div>

            {/* Stats indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12 max-w-3xl mx-auto"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Beaker className="w-4 h-4 text-[#02988C]" />
                  <span className="text-2xl sm:text-3xl font-bold text-slate-800">5,000+</span>
                </div>
                <p className="text-sm text-slate-500">Chemicals in Database</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-[#9531F5]" />
                  <span className="text-2xl sm:text-3xl font-bold text-slate-800">&lt;1s</span>
                </div>
                <p className="text-sm text-slate-500">Analysis Speed</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#09D2FF]" />
                  <span className="text-2xl sm:text-3xl font-bold text-slate-800">100%</span>
                </div>
                <p className="text-sm text-slate-500">Free to Start</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-[#02988C]" />
                  <span className="text-2xl sm:text-3xl font-bold text-slate-800">24/7</span>
                </div>
                <p className="text-sm text-slate-500">Available</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
        {/* Decorative watermark */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
          <img src={PRODUCT_IMAGES.labGlassware} alt="" className="w-full h-full object-cover" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Powerful Tools, Simple Interface
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
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
                  <Card className="group h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden">
                    <CardContent className="p-0">
                      <div className={`h-2 bg-gradient-to-r ${feature.gradient}`} />
                      <div className="p-8">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                          <feature.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                        <p className="text-slate-600 mb-4">{feature.description}</p>
                        <div className="flex items-center text-[#02988C] font-semibold group-hover:translate-x-2 transition-transform">
                          Try it free <ChevronRight className="w-5 h-5 ml-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability Showcase Section */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-green-50 via-white to-teal-50 relative overflow-hidden">
        {/* Decorative background image */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <img 
            src={SUSTAINABILITY_IMAGES.earthDay} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Leaf className="w-4 h-4" />
                Sustainability First
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Building a Greener Future, One Formula at a Time
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Every product you create with Suttain is analyzed for environmental impact. We help you choose biodegradable ingredients, reduce carbon footprint, and meet eco-certifications.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Eco Scoring</h4>
                    <p className="text-sm text-slate-500">Real-time sustainability metrics</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Green Alternatives</h4>
                    <p className="text-sm text-slate-500">Eco-friendly ingredient suggestions</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl overflow-hidden shadow-xl"
              >
                <img 
                  src={SUSTAINABILITY_IMAGES.globeBicycle} 
                  alt="Sustainable planet" 
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl overflow-hidden shadow-xl mt-8"
              >
                <img 
                  src={SUSTAINABILITY_IMAGES.handsPlanting} 
                  alt="Growing together" 
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Zero Experience Needed Section */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Brain className="w-4 h-4" />
              For Complete Beginners
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              "I Know Nothing About Formulation" — Perfect! 🎉
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Want to start a skincare brand but have no idea what ingredients to use? Just tell us what results you want, and our AI does the rest.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-2xl">
                1️⃣
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Tell Us Your Goal</h3>
              <p className="text-slate-600 text-sm">
                "I want an anti-aging serum" or "I need a moisturizer for oily skin" — just describe what you want to create.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-2xl">
                2️⃣
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Generates Your Formula</h3>
              <p className="text-slate-600 text-sm">
                We create a complete formula with exact percentages, ingredient list, and step-by-step manufacturing instructions.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-teal-100"
            >
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4 text-2xl">
                3️⃣
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Start Your Brand</h3>
              <p className="text-slate-600 text-sm">
                Get compliance checks, sustainability scores, and everything you need to launch your product line with confidence.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link to={createPageUrl("generator")}>
              <Button size="lg" className="bg-[#9531F5] hover:bg-[#8025e0] text-white px-8 py-4 text-base rounded-full font-semibold shadow-lg">
                <Atom className="w-5 h-5 mr-2" />
                Create My First Formula
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-slate-500 mt-4">No chemistry knowledge required • Takes 2 minutes</p>
          </motion.div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-20 sm:py-28 bg-slate-50">
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
            <p className="text-lg text-slate-600">
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
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  style={{ backgroundColor: audience.color }}
                >
                  <audience.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{audience.title}</h3>
                <p className="text-slate-600">{audience.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 sm:py-28 bg-white">
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
            <p className="text-lg text-slate-600">
              Professional-grade tools without the complexity
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${benefit.color}15` }}
                    >
                      <benefit.icon className="w-6 h-6" style={{ color: benefit.color }} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
                    <p className="text-slate-600 text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl"
          >
            {/* Gradient background matching screenshot */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#02988C]/10 via-white to-[#9531F5]/10" />

            <div className="relative p-10 sm:p-14 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                Ready to Create Safer Products?
              </h2>
              <p className="text-base text-slate-500 mb-8 max-w-lg mx-auto">
                Join thousands of creators who trust Suttain for chemical safety and formulation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={createPageUrl("Simulator")}>
                  <Button size="lg" className="w-full sm:w-auto bg-[#02988C] hover:bg-[#028a7f] text-white px-8 py-4 text-base rounded-full font-semibold shadow-md">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl("BookADemo")}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-8 py-4 text-base rounded-full font-semibold shadow-sm">
                    <Play className="w-4 h-4 mr-2 text-slate-500" />
                    Book a Demo
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-slate-600 mt-6 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#02988C]" />
                No credit card required • Free forever plan available
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}