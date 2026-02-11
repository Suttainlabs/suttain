import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Recycle, Globe, TreeDeciduous, Droplets, Wind } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import PremiumFeatureGate from '../components/shared/PremiumFeatureGate';

const SUSTAINABILITY_IMAGES = {
  earthDay: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/e46816a88_earth-day-environment-concept-and-eco-concept-2026-01-09-07-31-34-utc.jpg",
  globeBicycle: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/9b1ee8422_globe-and-bicycle-save-the-planet-idea-internati-2026-01-08-02-40-42-utc.jpg",
  handsPlanting: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/c8f95960f_good-soil-makes-growth-easier-2026-01-09-09-55-54-utc.jpg",
  sunscreenBeach: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/24e9e62d3_colorful-sunscreen-bottles-arranged-on-sandy-beach-2026-01-08-06-02-42-utc.jpg",
  kidsSunscreen: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/ee1fe1c1c_kids-summer-accesories-and-sun-screen-bottle-for-s-2026-01-09-00-08-34-utc.jpg"
};

export default function Sustainability() {
  return (
    <PremiumFeatureGate
      featureName="Sustainability Scoring"
      featureDescription="Analyze and improve your product's environmental impact with comprehensive sustainability metrics."
    >
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img 
              src={SUSTAINABILITY_IMAGES.earthDay} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="max-w-6xl mx-auto relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Leaf className="w-4 h-4" />
                Sustainability Scoring
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Build Products That <span className="text-green-600">Protect Our Planet</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Comprehensive environmental analysis for every formula you create. Make informed decisions that benefit both your business and the environment.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                { icon: Recycle, title: "Biodegradability Analysis", desc: "Understand how quickly your ingredients break down naturally" },
                { icon: Globe, title: "Carbon Footprint", desc: "Calculate and minimize the environmental impact of production" },
                { icon: Droplets, title: "Water Usage", desc: "Optimize formulations for water efficiency" },
                { icon: TreeDeciduous, title: "Renewable Content", desc: "Track percentage of plant-based ingredients" },
                { icon: Wind, title: "VOC Assessment", desc: "Monitor volatile organic compound emissions" },
                { icon: Leaf, title: "Eco Certifications", desc: "Guidance for COSMOS, ECOCERT, and more" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow border-green-100">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-slate-600">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Image Gallery */}
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl overflow-hidden shadow-xl"
              >
                <img 
                  src={SUSTAINABILITY_IMAGES.sunscreenBeach} 
                  alt="Eco-friendly products" 
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl overflow-hidden shadow-xl"
              >
                <img 
                  src={SUSTAINABILITY_IMAGES.handsPlanting} 
                  alt="Growing together" 
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl overflow-hidden shadow-xl"
              >
                <img 
                  src={SUSTAINABILITY_IMAGES.kidsSunscreen} 
                  alt="Safe products for all" 
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </PremiumFeatureGate>
  );
}