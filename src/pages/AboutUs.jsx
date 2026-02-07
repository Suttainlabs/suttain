import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, ArrowRight, Eye } from 'lucide-react';
import SEOHead, { pageSEO } from '../components/shared/SEOHead';



const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-blue-50/20">
      <SEOHead {...pageSEO.about} />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="bg-green-100 text-green-700 border-green-200 text-sm px-4 py-2">
            Our Story
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4">
            Blending Science, Technology, and Human Care
          </h1>
          <p className="mt-6 text-base text-slate-600 max-w-3xl mx-auto">
            At Suttain, we design AI-powered solutions that help people and businesses make safer choices, create responsibly, and build a healthier future.
          </p>
        </motion.div>
      </section>

      {/* Our Mission & Vision Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#02988C] to-[#09D2FF] rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Our Mission</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              To make chemical safety and sustainability accessible to all with AI-powered insights, hazard detection, and eco-impact guidance — helping users choose safer alternatives and stay compliant.
            </p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-gradient-to-br from-[#9531F5] to-[#09D2FF] rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Our Vision</h2>
            </div>
             <p className="text-sm text-slate-600 leading-relaxed">
              A world where everyone can access chemical knowledge, make safer choices, and support public health and environmental sustainability.
            </p>
          </div>
        </div>
      </section>
      
      {/* Why Suttain Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white/70">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Target className="w-4 h-4" />
              Why Suttain
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Empowering Safer Chemical Decisions</h2>
            <p className="text-base text-slate-600 mt-4 max-w-2xl mx-auto">
              Suttain combines cutting-edge AI with scientific expertise to democratize chemical safety knowledge for everyone.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-t-4 border-t-[#02988C]">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#02988C] to-[#09D2FF] rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">For Everyone</h3>
                  <p className="text-sm text-slate-600">
                    Whether you're a concerned parent checking household products, a student learning chemistry, or a professional formulator — Suttain makes complex chemical data accessible and actionable.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-t-4 border-t-[#9531F5]">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#9531F5] to-[#09D2FF] rounded-xl flex items-center justify-center mb-4">
                    <Eye className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Transparent Science</h3>
                  <p className="text-sm text-slate-600">
                    We believe in open access to chemical safety information. Our AI analyzes data from trusted scientific sources to provide clear, evidence-based insights you can trust.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-t-4 border-t-[#09D2FF]">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#09D2FF] to-[#02988C] rounded-xl flex items-center justify-center mb-4">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Sustainability First</h3>
                  <p className="text-sm text-slate-600">
                    Every feature we build considers environmental impact. From eco-scoring formulas to suggesting greener alternatives, we're committed to a healthier planet.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* What We Offer */}
          <div className="bg-gradient-to-br from-slate-50 to-teal-50/50 rounded-2xl p-8 md:p-12">
            <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">What Suttain Offers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#02988C] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Chemical Safety Simulator</h4>
                  <p className="text-sm text-slate-600">Test chemical combinations and understand potential reactions, hazards, and safety precautions before mixing.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#9531F5] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">AI Formula Generator</h4>
                  <p className="text-sm text-slate-600">Create custom household and skincare formulas with AI-guided ingredient selection and safety validation.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#09D2FF] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Quick Product Scanner</h4>
                  <p className="text-sm text-slate-600">Scan any product barcode to instantly analyze ingredients, identify allergens, and get safety ratings.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Compliance & Regulatory Tools</h4>
                  <p className="text-sm text-slate-600">Stay compliant with global regulations through AI-powered compliance checking and documentation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Join Our Mission</h2>
          <p className="text-base text-slate-600 mb-8 max-w-2xl mx-auto">
            Help us revolutionize the future of chemical sustainability. We are always looking for passionate talent to join our growing team.
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-[#02988C] to-[#09D2FF] text-white hover:shadow-lg hover:opacity-90 transition-all">
            <Link to={createPageUrl('Careers')}>
              View Open Positions <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;