import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Sparkles, ArrowRight, Shield, Zap, HeartPulse } from 'lucide-react';
import AuthContext from '../auth/AuthContext';

export default function SubscriptionCard() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const premiumFeatures = [
    { icon: Shield, label: 'AI Compliance Co-Pilot', description: 'Automated regulatory checks' },
    { icon: HeartPulse, label: 'Personalized Safety Alerts', description: 'Health-based warnings' },
    { icon: Sparkles, label: 'Sustainability Scoring', description: 'Environmental impact analysis' },
    { icon: Zap, label: 'Priority Support', description: '24/7 dedicated assistance' },
  ];

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardHeader className={`${isAdmin ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-slate-600 to-slate-700'} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">Subscription Status</CardTitle>
              <p className="text-white/80 text-xs mt-0.5">
                {isAdmin ? 'Premium Access' : 'Free Tier'}
              </p>
            </div>
          </div>
          <Badge className={`${isAdmin ? 'bg-white/20 text-white' : 'bg-white/10 text-white'} border-white/30`}>
            {isAdmin ? 'Admin' : 'Free'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {isAdmin ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900 mb-1">Full Access Granted</p>
                  <p className="text-xs text-yellow-800">
                    You have unlimited access to all premium features, including compliance tools, safety alerts, and sustainability scoring.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700 mb-2">Your Premium Features:</p>
              {premiumFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">{feature.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600 mb-3">
                Unlock premium features to access advanced tools for compliance, safety, and sustainability.
              </p>
              <div className="space-y-2">
                {premiumFeatures.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{feature.label}</p>
                        <p className="text-xs text-slate-500">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button 
              asChild
              className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg"
            >
              <Link to={createPageUrl('Pricing')}>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <p className="text-xs text-center text-slate-500">
              View all plans and pricing options
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}