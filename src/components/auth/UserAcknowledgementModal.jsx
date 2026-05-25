import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import {
  CheckCircle2, ChevronRight, ChevronLeft,
  Shirt, Beaker, Droplets, Heart, Package,
  Building2, FlaskConical, Factory, Wrench, User as UserIcon,
  Shield, Leaf, BarChart3, DollarSign,
  Globe, MapPin, Plane, Map
} from 'lucide-react';

// ── Q1: What do you make? ─────────────────────────────────────────────────────
const WHAT_YOU_MAKE = [
  { id: 'cleaning',     label: 'Cleaning products',  icon: Beaker },
  { id: 'cosmetics',    label: 'Cosmetics',           icon: Shirt },
  { id: 'soap',         label: 'Soap',                icon: Droplets },
  { id: 'personal_care',label: 'Personal care',       icon: Heart },
  { id: 'other',        label: 'Other',               icon: Package },
];

// ── Q2: What is your role? ────────────────────────────────────────────────────
const ROLES = [
  { id: 'founder',      label: 'Founder',             icon: Building2 },
  { id: 'formulator',   label: 'Formulator',          icon: FlaskConical },
  { id: 'manufacturer', label: 'Manufacturer',        icon: Factory },
  { id: 'diy',          label: 'DIY Maker',           icon: Wrench },
  { id: 'consultant',   label: 'Consultant',          icon: UserIcon },
];

// ── Q3: What matters most? ────────────────────────────────────────────────────
const PRIORITIES = [
  { id: 'safety',         label: 'Safety',            icon: Shield },
  { id: 'compliance',     label: 'Compliance',        icon: CheckCircle2 },
  { id: 'sustainability', label: 'Sustainability',    icon: Leaf },
  { id: 'carbon_costs',   label: 'Carbon costs',      icon: DollarSign },
];

// ── Q4: Where do you sell? ────────────────────────────────────────────────────
const MARKETS = [
  { id: 'usa',          label: 'USA',                 icon: MapPin },
  { id: 'eu',           label: 'EU',                  icon: Globe },
  { id: 'africa',       label: 'Africa',              icon: Map },
  { id: 'asia_pacific', label: 'Asia-Pacific',        icon: Plane },
  { id: 'global',       label: 'Global',              icon: Globe },
];

const QUESTIONS = [
  {
    key: 'what_you_make',
    question: 'What do you make?',
    subtitle: 'We will tailor your dashboard to your product category.',
    options: WHAT_YOU_MAKE,
    multi: false,
  },
  {
    key: 'role',
    question: 'What is your role?',
    subtitle: 'This helps us show the right level of detail for your work.',
    options: ROLES,
    multi: false,
  },
  {
    key: 'priority',
    question: 'What matters most to you?',
    subtitle: 'We will surface the insights most relevant to your goals.',
    options: PRIORITIES,
    multi: false,
  },
  {
    key: 'markets',
    question: 'Where do you sell?',
    subtitle: 'We will pre-load compliance rules for your target markets.',
    options: MARKETS,
    multi: true,
  },
];

const DEFAULTS = {
  what_you_make: 'other',
  role: 'founder',
  priority: 'safety',
  markets: ['global'],
};

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0 }),
};

export default function UserAcknowledgementModal({ isOpen, onAccept, onClose }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState({ what_you_make: '', role: '', priority: '', markets: [] });
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Persist progress in case user closes mid-quiz
  useEffect(() => {
    const saved = localStorage.getItem('suttain_onboarding_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.step !== undefined) setStep(parsed.step);
        if (parsed.answers) setAnswers(parsed.answers);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('suttain_onboarding_progress', JSON.stringify({ step, answers }));
  }, [step, answers]);

  if (!isOpen) return null;

  const q = QUESTIONS[step];

  const select = (id) => {
    if (q.multi) {
      setAnswers(prev => {
        const cur = prev[q.key] || [];
        return { ...prev, [q.key]: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] };
      });
    } else {
      setAnswers(prev => ({ ...prev, [q.key]: id }));
    }
  };

  const isSelected = (id) => {
    const val = answers[q.key];
    return q.multi ? (val || []).includes(id) : val === id;
  };

  const canAdvance = q.multi
    ? (answers[q.key] || []).length > 0
    : !!answers[q.key];

  const advance = () => {
    if (!canAdvance) return;
    if (step < QUESTIONS.length - 1) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      save(answers);
    }
  };

  const back = () => {
    setDirection(-1);
    setStep(s => s - 1);
  };

  const applySkip = () => {
    const filled = { ...DEFAULTS };
    Object.keys(answers).forEach(k => {
      const v = answers[k];
      if (v && (!Array.isArray(v) || v.length > 0)) filled[k] = v;
    });
    save(filled);
    setShowSkipConfirm(false);
  };

  const save = async (data) => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({
        first_login: false,
        onboarding_goals: [data.priority],
        formulation_goals: [data.what_you_make],
        generator_category: ['founder', 'formulator', 'manufacturer'].includes(data.role) ? 'business' : 'individual',
        simulator_category: data.role,
        industry: data.what_you_make,
        target_markets: Array.isArray(data.markets) ? data.markets : [data.markets],
      });

      base44.analytics.track({
        eventName: 'onboarding_completed',
        properties: {
          what_you_make: data.what_you_make,
          role: data.role,
          priority: data.priority,
          markets: Array.isArray(data.markets) ? data.markets.join(',') : data.markets,
        }
      });

      base44.auth.me().then(currentUser => {
        base44.entities.Notification.create({
          title: 'New User Signup',
          message: `${currentUser.full_name || currentUser.email} signed up. Role: ${data.role}, Makes: ${data.what_you_make}, Priority: ${data.priority}`,
          type: 'user_signup',
          severity: 'info',
          target_user: 'admin',
          metadata: { user_email: currentUser.email, role: data.role, industry: data.what_you_make, priority: data.priority }
        }).catch(() => {});

        base44.functions.invoke('sendSlackNotification', {
          channel: '#all-suttain',
          type: 'new_user',
          data: { userName: currentUser.full_name, userEmail: currentUser.email, role: data.role, industry: data.what_you_make }
        }).catch(() => {});
      }).catch(() => {});

      localStorage.removeItem('suttain_onboarding_progress');
      if (onAccept) onAccept(); else onClose();
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
      alert("Could not save your preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
      {/* Skip confirm overlay */}
      <AnimatePresence>
        {showSkipConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">Skip personalisation?</h3>
              <p className="text-slate-500 text-sm mb-6">We will use default settings. You can update your preferences anytime in your profile.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSkipConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:border-slate-300 transition-colors"
                >
                  Continue Quiz
                </button>
                <button
                  onClick={applySkip}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors"
                >
                  Yes, Skip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 flex-shrink-0">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png"
          alt="Suttain"
          className="h-8 w-auto"
        />
        <button
          onClick={() => setShowSkipConfirm(true)}
          className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
        >
          Skip for now
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 py-3 flex-shrink-0">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "rounded-full transition-all duration-300",
              i === step
                ? "w-6 h-2.5 bg-[#02988C]"
                : i < step
                  ? "w-2.5 h-2.5 bg-[#02988C]/50"
                  : "w-2.5 h-2.5 bg-slate-200"
            )}
          />
        ))}
      </div>

      {/* Question card — animated */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="w-full max-w-lg"
          >
            {/* Question heading */}
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#02988C] mb-2">
                Question {step + 1} of {QUESTIONS.length}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-3">
                {q.question}
              </h1>
              <p className="text-slate-500 text-base">{q.subtitle}</p>
            </div>

            {/* Answer cards */}
            <div className={cn(
              "grid gap-3",
              q.options.length <= 4 ? "grid-cols-1 max-w-sm mx-auto" : "grid-cols-2"
            )}>
              {q.options.map(({ id, label, icon: Icon }) => {
                const selected = isSelected(id);
                return (
                  <button
                    key={id}
                    onClick={() => select(id)}
                    className={cn(
                      "relative flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-150 focus:outline-none",
                      selected
                        ? "border-[#02988C] bg-[#02988C]/5 shadow-sm"
                        : "border-slate-200 bg-white hover:border-[#02988C]/40 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      selected ? "bg-[#02988C]/15" : "bg-slate-100"
                    )}>
                      <Icon className={cn("w-5 h-5", selected ? "text-[#02988C]" : "text-slate-500")} />
                    </div>
                    <span className={cn(
                      "text-sm font-semibold flex-1",
                      selected ? "text-[#02988C]" : "text-slate-700"
                    )}>
                      {label}
                    </span>
                    {selected && (
                      <CheckCircle2 className="w-4 h-4 text-[#02988C] flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {q.multi && (
              <p className="text-center text-xs text-slate-400 mt-3">Select all that apply</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="px-6 pb-8 pt-4 flex-shrink-0">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={back}
              className="flex items-center gap-1.5 px-5 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:border-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <button
            onClick={advance}
            disabled={!canAdvance || isSaving}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-base transition-all",
              canAdvance && !isSaving
                ? "bg-[#02988C] text-white hover:bg-[#027d72] shadow-lg shadow-[#02988C]/25"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            {isSaving
              ? "Building your dashboard..."
              : step === QUESTIONS.length - 1
                ? "Build My Dashboard"
                : "Next"}
            {!isSaving && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}