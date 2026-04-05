import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  HeartPulse,
  Leaf,
  AppWindow,
  Sparkles,
  ChevronRight,
  Gem
} from 'lucide-react';
import { motion } from 'framer-motion';

const premiumFeatures = [
  {
    name: "AI Compliance Co-Pilot",
    description: "Automated regulatory checks across 50+ regions",
    icon: ShieldCheck,
    href: "ComplianceCoPilot",
  },
  {
    name: "Personalized Safety Alerts",
    description: "Custom alerts based on your health profile",
    icon: HeartPulse,
    href: "PersonalizedSafety",
  },
  {
    name: "Sustainability Scoring",
    description: "Detailed eco-impact analysis for your formulas",
    icon: Leaf,
    href: "ComparativeImpactReport",
  },
  {
    name: "Priority Support",
    description: "24/7 support with < 4 hour response time",
    icon: AppWindow,
    href: "FAQ",
  },
];

export default function PremiumFeatures() {
  return (
    <Card className="h-full bg-gradient-to-br from-violet-50 to-purple-100 border-purple-200/80 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
               <Gem className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
               Unlock the <span className="gradient-text">Premium Suite</span>
            </h2>
        </div>
        <p className="text-sm text-slate-600">
          Supercharge your workflow with advanced tools for businesses and professionals.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {premiumFeatures.map((feature, index) => (
            <Link
              to={createPageUrl(feature.href)}
              key={index}
              className="block group"
            >
              <motion.div 
                whileHover={{ scale: 1.02, x: 2 }}
                className="flex items-center gap-4 p-3 bg-white/60 hover:bg-white rounded-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-purple-200 hover:shadow-md"
              >
                <div className="w-10 h-10 bg-[var(--suttain-violet)] rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                    {feature.name}
                    {feature.status === "soon" && (
                       <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                        Soon
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">{feature.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </motion.div>
            </Link>
          ))}
        </div>
        
        <Button className="w-full mt-6 btn-secondary font-semibold text-base py-3 h-auto">
          <Sparkles className="w-4 h-4 mr-2" />
          Explore Premium Features
        </Button>
      </CardContent>
    </Card>
  );
}