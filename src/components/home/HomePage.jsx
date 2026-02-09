import React, { useContext } from "react";
import { motion } from "framer-motion";
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
              Test chemical safety, generate professional formulas, and build sustainable products — all from your browser.
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