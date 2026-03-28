import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function TrialExpiredBanner({ featureName }) {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full mx-auto"
      >
        <Card className="text-center shadow-xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Monthly Limit Reached
            </h2>
            <p className="text-white/80 text-sm">
              You've used your free monthly allowance for {featureName || 'this feature'}
            </p>
          </div>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3 text-left">
              <p className="text-slate-600 text-center">
                Upgrade to Pro for unlimited simulations, formula generation, and product scanning every month.
              </p>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span className="text-sm text-purple-800 font-medium">Unlimited access to all tools</span>
              </div>
            </div>

            <Link to={createPageUrl("Pricing")} className="block">
              <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-6 text-base shadow-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                View Plans & Upgrade
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <p className="text-xs text-slate-500 text-center">
              Your free limits reset at the start of each month. Questions? <a href="mailto:contact@suttain.com" className="underline">Contact us</a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}