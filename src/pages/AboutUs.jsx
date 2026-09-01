import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Eye, ArrowRight, Users, Zap, Cpu, Building2, Beaker, Sparkles, Smartphone, Microscope, CheckCircle, Rocket, Home, Droplets, Leaf, Database } from 'lucide-react';
import SEOHead, { pageSEO } from '../components/shared/SEOHead';

const IMAGES = {
  lab: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/025e8ec13_laboratory-glassware-and-molecular-structure-sitti-2026-01-09-09-41-04-utc.jpg",
  innovation: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/76fc85d0c_a-woman-holds-the-skincare-jar-for-beauty-wellne-2026-01-07-02-20-26-utc.jpg"
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20">
      <SEOHead {...pageSEO.about} />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-white relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <img src={IMAGES.lab} alt="" className="w-full h-full object-cover" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <Badge className="bg-violet-100 text-violet-700 border-violet-300 mb-6">
            Our Story
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Powerful Tools for Everyone
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Suttain brings powerful tools and insights to everyone:making it easy for creators, teams, and businesses to create, test, and innovate with confidence.
          </p>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#02988C] to-[#09D2FF] rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Our Mission</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Empower individuals, startups, and enterprises with AI tools for creating, testing, and optimizing products:removing barriers to innovation while ensuring safety, compliance, and environmental responsibility.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#9531F5] to-[#09D2FF] rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Our Vision</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              A world where powerful tools and safety insights are accessible to everyone:from DIY creators to Fortune 500 companies:accelerating innovation while protecting people and the planet.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white/70 relative overflow-hidden border-y border-slate-200">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="bg-purple-100 text-purple-700 border-purple-300 mb-4">
              Our Platform
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              A Complete Ecosystem for Innovation
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From quick safety checks to advanced research simulations:all in one platform for everyone.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                num: '1',
                title: 'Chemical Safety Simulator',
                desc: 'Test interactions and predict reactions before mixing. Get instant hazard profiles, SDS analysis, and AI risk scoring.',
                icon: Beaker
              },
              {
                num: '2',
                title: 'AI Formula Generator',
                desc: 'Create custom skincare, cleaning, and specialty formulas with safety scoring, compliance flags, and sustainability ratings.',
                icon: Sparkles
              },
              {
                num: '3',
                title: 'Product Scanner',
                desc: 'Scan any product barcode for a full ingredient breakdown, toxicity profile, and eco-impact score.',
                icon: Smartphone
              },
              {
                num: '4',
                title: 'Hydration Intelligence',
                desc: 'Track daily water intake with biological food-linked adjustments, smart reminders, and progress analytics.',
                icon: Droplets
              },
              {
                num: '5',
                title: 'Computational Simulations',
                desc: 'Run DFT, molecular dynamics, drug discovery, protein modeling, and quantum chemistry scripts without a lab.',
                icon: Microscope
              },
              {
                num: '6',
                title: 'Carbon & Sustainability Reporting',
                desc: 'Simulate carbon tax scenarios, model decarbonization ROI, and generate exportable sustainability reports.',
                icon: Leaf
              },
              {
                num: '7',
                title: 'Ingredient Database',
                desc: 'Explore 250k+ chemicals by toxicity, INCI name, eco-impact, regulatory status, CAS number, and origin.',
                icon: Database
              },
              {
                num: '8',
                title: 'Enterprise API',
                desc: 'Integrate Suttain into enterprise systems for automated chemical analysis, compliance checks, and reporting at scale.',
                icon: Rocket
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <Card className="h-full hover:shadow-lg transition-all border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 flex-shrink-0 text-violet-600">
                        <item.icon className="w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-slate-600">{item.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Suttain */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
             Why Choose Suttain
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
             Reliable intelligence meets easy-to-use design.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'For Everyone',
                desc: 'Hobbyists, startups, researchers, and enterprises all benefit from the same powerful platform.'
              },
              {
                icon: Cpu,
                title: 'Advanced Tools',
                desc: 'Access research-grade simulations and modeling previously limited to large institutions.'
              },
              {
                icon: Zap,
                title: 'Fast & Reliable',
                desc: 'Get accurate analysis in seconds. AI-powered insights you can trust.'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all border-t-4 border-t-violet-500">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-violet-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600 text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Different Users */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Built for Different Needs
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'DIY Creators',
                desc: 'Make safe skincare, soaps, and cleaners at home with instant safety analysis.',
                color: 'from-teal-500 to-cyan-500'
              },
              {
                title: 'Experts & Teams',
                desc: 'Run advanced analysis and detailed simulations without expensive infrastructure.',
                color: 'from-purple-500 to-violet-500'
              },
              {
                title: 'Enterprises',
                desc: 'Integrate Suttain API into your systems for automated analysis at scale.',
                color: 'from-blue-500 to-cyan-500'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center`}>
                  {idx === 0 ? <Home className="w-10 h-10 text-white" /> : idx === 1 ? <Microscope className="w-10 h-10 text-white" /> : <Building2 className="w-10 h-10 text-white" />}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Join the Innovation Revolution</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Start with our free tier or explore enterprise solutions for your team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-[#02988C] to-[#09D2FF] text-white hover:shadow-lg hover:opacity-90 transition-all">
                <Link to={createPageUrl('Simulator')}>
                  Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={createPageUrl('Careers')}>
                  Join Our Team
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}