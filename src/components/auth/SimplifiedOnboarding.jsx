import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { ChevronRight, QrCode, Beaker, Zap, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Interest options for all users
const INTEREST_OPTIONS = [
  {
    id: 'scan',
    icon: QrCode,
    title: 'Scan a product',
    subtitle: 'Check ingredients & toxicity',
    color: '#00B478',
  },
  {
    id: 'simulate',
    icon: Beaker,
    title: 'Simulate a chemical mix',
    subtitle: 'Test safety & compatibility',
    color: '#02988C',
  },
  {
    id: 'generate',
    icon: Zap,
    title: 'Generate a formula',
    subtitle: 'Create & optimize recipes',
    color: '#6B3FA0',
  },
  {
    id: 'browsing',
    icon: BookOpen,
    title: 'Just browsing',
    subtitle: 'Explore the platform',
    color: '#00A8C8',
  },
];

export default function SimplifiedOnboarding({ isOpen, onAccept, onClose }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleContinue = async () => {
    if (!selected) return;

    setIsSaving(true);
    try {
      // Map interest to onboarding data
      const onboardingData = {
        first_login: false,
        profile_type: 'consumer', // Default all to consumer; can be changed later in settings
        onboarding_interest: selected,
        generator_category: 'individual',
        target_markets: ['global'], // Progressive profiling: ask later when needed
      };

      // For simulate/generate, we can ask market preferences later in-tool
      await base44.auth.updateMe(onboardingData);

      // Track the choice
      base44.analytics.track({
        eventName: 'onboarding_completed',
        properties: {
          interest: selected,
          simplified_flow: true,
        }
      });

      localStorage.removeItem('suttain_onboarding_progress');
      if (onAccept) onAccept();
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      alert('Could not save your preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 flex-shrink-0">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png"
          alt="Suttain"
          className="h-8 w-auto"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-3">
              What are you interested in exploring today?
            </h1>
            <p className="text-slate-500 text-base">
              Choose one to get started. You can explore everything else anytime.
            </p>
          </div>

          {/* Interest Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
            {INTEREST_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = selected === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  onClick={() => setSelected(opt.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'w-full text-left rounded-2xl border-2 p-4 transition-all duration-150 focus:outline-none',
                    isActive
                      ? 'shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  )}
                  style={isActive ? { borderColor: opt.color, background: opt.color + '06' } : {}}
                >
                  <div className="flex flex-col items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: opt.color + '20' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: opt.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className={cn('font-semibold text-sm', isActive ? 'text-slate-900' : 'text-slate-800')}>
                        {opt.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.subtitle}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Skip option */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                localStorage.removeItem('suttain_onboarding_progress');
                if (onAccept) onAccept();
              }}
              className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 pt-4 flex-shrink-0">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleContinue}
            disabled={!selected || isSaving}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-base transition-all',
              selected && !isSaving
                ? 'text-white shadow-lg'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
            style={
              selected && !isSaving
                ? {
                    background:
                      INTEREST_OPTIONS.find((o) => o.id === selected)?.color,
                  }
                : {}
            }
          >
            {isSaving ? 'Getting you started...' : 'Continue'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}