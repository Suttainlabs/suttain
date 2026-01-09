import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Globe, Sparkles, Lock, Crown, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthContext from '../auth/AuthContext';

const ComplianceUpsellModal = ({ isOpen, onClose, productName, ingredients = [] }) => {
  const { user, openAuthModal } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const features = [
    { icon: Globe, text: 'Check compliance across USA, EU, Canada & more' },
    { icon: ShieldCheck, text: 'FDA, EPA, TSCA, Prop 65 & ASTM regulations' },
    { icon: Sparkles, text: 'AI-powered ingredient analysis' },
  ];

  const handleGetAccess = () => {
    if (!user) {
      openAuthModal('signup');
      onClose();
    } else {
      // Navigate to compliance page
      window.location.href = createPageUrl('ComplianceCoPilot');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 shadow-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 text-white relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DialogTitle className="text-xl font-bold text-white">Compliance Check</DialogTitle>
                  <Badge className="bg-amber-400 text-amber-900 font-semibold text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </div>
                <DialogDescription className="text-white/80 text-sm">
                  Ensure your formula meets regulatory standards
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Product Info */}
            {productName && (
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Your Formula</p>
                <p className="font-semibold text-slate-900">{productName}</p>
                <p className="text-xs text-slate-500 mt-1">{ingredients.length} ingredients to analyze</p>
              </div>
            )}

            {/* Features */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">What you'll get:</p>
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-sm text-slate-700">{feature.text}</p>
                </motion.div>
              ))}
            </div>

            {/* Regions Preview */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
              <p className="text-xs font-medium text-indigo-700 mb-2">Supported Regions</p>
              <div className="flex flex-wrap gap-2">
                {['🇺🇸 USA', '🇪🇺 EU', '🇨🇦 Canada', '🌍 Global'].map((region) => (
                  <Badge key={region} variant="outline" className="bg-white text-xs">
                    {region}
                  </Badge>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-2">
              {isAdmin ? (
                <Link to={createPageUrl('ComplianceCoPilot')} className="block">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white h-12 text-base font-semibold shadow-lg">
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Run Compliance Check
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Button 
                    onClick={handleGetAccess}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white h-12 text-base font-semibold shadow-lg"
                  >
                    <Lock className="w-5 h-5 mr-2" />
                    {user ? 'Upgrade to Premium' : 'Sign Up for Access'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <p className="text-center text-xs text-slate-500">
                    Premium feature • Requires admin access
                  </p>
                </>
              )}
              
              <Button variant="ghost" onClick={onClose} className="w-full text-slate-600">
                Maybe Later
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ComplianceUpsellModal;