import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import {
  CheckCircle2, Beaker, Atom, QrCode, Leaf, ChevronRight, ChevronLeft,
  FlaskConical, Sparkles, Shield, BarChart3, Droplets, Home, Apple,
  Pill, Microscope, GraduationCap, Building2, User as UserIcon, Briefcase
} from 'lucide-react';

const ROLES = [
  { value: 'formulator', label: 'Professional Formulator', icon: FlaskConical, desc: 'I create products for brands or clients' },
  { value: 'researcher', label: 'Researcher / Scientist', icon: Microscope, desc: 'I conduct scientific research' },
  { value: 'business', label: 'Brand Manager', icon: Building2, desc: 'I manage or own a product brand' },
  { value: 'teacher', label: 'Educator / Teacher', icon: GraduationCap, desc: 'I teach chemistry or formulation' },
  { value: 'individual', label: 'DIY Enthusiast', icon: UserIcon, desc: 'I make products for personal use' },
  { value: 'student', label: 'Student', icon: Briefcase, desc: 'I am studying chemistry or related fields' },
];

const FORMULATION_GOALS = [
  { id: 'skincare', label: 'Skincare', icon: Droplets },
  { id: 'haircare', label: 'Haircare', icon: Sparkles },
  { id: 'cleaning', label: 'Cleaning Products', icon: Home },
  { id: 'supplements', label: 'Supplements', icon: Pill },
  { id: 'food', label: 'Food & Nutrition', icon: Apple },
  { id: 'industrial', label: 'Industrial Chemicals', icon: FlaskConical },
  { id: 'pharmaceutical', label: 'Pharmaceutical', icon: Shield },
  { id: 'cosmetics', label: 'Cosmetics & Makeup', icon: Leaf },
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner', desc: 'I am just getting started' },
  { value: 'intermediate', label: 'Intermediate', desc: 'I have some experience' },
  { value: 'expert', label: 'Expert', desc: 'I work professionally in this field' },
];

const PLATFORM_GOALS = [
  { id: 'formulate', label: 'Create formulas', icon: Beaker },
  { id: 'simulate', label: 'Simulate chemistry', icon: Atom },
  { id: 'scan', label: 'Scan products', icon: QrCode },
  { id: 'sustainability', label: 'Track eco impact', icon: BarChart3 },
];

const TOTAL_STEPS = 4;

export default function UserAcknowledgementModal({ isOpen, onAccept, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [formulationGoals, setFormulationGoals] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [platformGoals, setPlatformGoals] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleFormulationGoal = (id) => {
    setFormulationGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const togglePlatformGoal = (id) => {
    setPlatformGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const canProceed = {
    1: !!selectedRole,
    2: formulationGoals.length > 0,
    3: !!experienceLevel,
    4: platformGoals.length > 0,
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({
        first_login: false,
        onboarding_goals: platformGoals,
        formulation_goals: formulationGoals,
        experience_level: experienceLevel,
        generator_category: selectedRole === 'business' || selectedRole === 'formulator' ? 'business' : 'individual',
        simulator_category: selectedRole,
        industry: formulationGoals[0] || 'other',
      });

      base44.auth.me().then(currentUser => {
        base44.analytics.track({
          eventName: 'onboarding_completed',
          properties: {
            role: selectedRole,
            experience: experienceLevel,
            formulation_goals: formulationGoals.join(','),
            platform_goals: platformGoals.join(',')
          }
        });

        base44.entities.Notification.create({
          title: 'New User Signup',
          message: `${currentUser.full_name || currentUser.email} signed up. Role: ${selectedRole}, Experience: ${experienceLevel}, Goals: ${formulationGoals.join(', ')}`,
          type: 'user_signup',
          severity: 'info',
          target_user: 'admin',
          metadata: { user_email: currentUser.email, role: selectedRole, experience: experienceLevel, formulation_goals: formulationGoals }
        }).catch(() => {});

        base44.functions.invoke('sendSlackNotification', {
          channel: '#all-suttain',
          type: 'new_user',
          data: { userName: currentUser.full_name, userEmail: currentUser.email, role: selectedRole, experience: experienceLevel, goals: formulationGoals.join(', ') }
        }).catch(() => {});
      }).catch(() => {});

      if (onAccept) onAccept(); else onClose();
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
      alert("Could not save your preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-[#02988C] to-[#09D2FF] px-6 pt-6 pb-5">
          <div className="flex gap-1.5 mb-4">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className={cn(
                "h-1 flex-1 rounded-full transition-all duration-300",
                i < step ? "bg-white" : "bg-white/30"
              )} />
            ))}
          </div>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">
            Step {step} of {TOTAL_STEPS}
          </p>
          <h2 className="text-white text-xl font-bold leading-tight">
            {step === 1 && "What is your role?"}
            {step === 2 && "What do you want to formulate?"}
            {step === 3 && "What is your experience level?"}
            {step === 4 && "What will you use Suttain for?"}
          </h2>
          <p className="text-white/75 text-sm mt-1">
            {step === 1 && "We'll tailor your dashboard and safety alerts to your role."}
            {step === 2 && "Select all product types you plan to work with."}
            {step === 3 && "This helps us set the right complexity for your results."}
            {step === 4 && "Select everything that applies — you can change this later."}
          </p>
        </div>

        <div className="px-6 py-5">
          {/* Step 1: Role */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-2.5">
              {ROLES.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  onClick={() => setSelectedRole(value)}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
                    selectedRole === value
                      ? "border-[#02988C] bg-teal-50"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                    selectedRole === value ? "bg-teal-100" : "bg-slate-100"
                  )}>
                    <Icon className={cn("w-4 h-4", selectedRole === value ? "text-[#02988C]" : "text-slate-500")} />
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-sm font-semibold leading-tight", selectedRole === value ? "text-[#02988C]" : "text-slate-700")}>
                      {label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-snug">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Formulation goals */}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-2.5">
              {FORMULATION_GOALS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => toggleFormulationGoal(id)}
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
                    formulationGoals.includes(id)
                      ? "border-[#9531F5] bg-violet-50"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                    formulationGoals.includes(id) ? "bg-violet-100" : "bg-slate-100"
                  )}>
                    <Icon className={cn("w-4 h-4", formulationGoals.includes(id) ? "text-[#9531F5]" : "text-slate-500")} />
                  </div>
                  <p className={cn("text-sm font-semibold", formulationGoals.includes(id) ? "text-[#9531F5]" : "text-slate-700")}>
                    {label}
                  </p>
                  {formulationGoals.includes(id) && (
                    <CheckCircle2 className="w-4 h-4 text-[#9531F5] ml-auto flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Experience level */}
          {step === 3 && (
            <div className="flex flex-col gap-3">
              {EXPERIENCE_LEVELS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setExperienceLevel(value)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all",
                    experienceLevel === value
                      ? "border-[#02988C] bg-teal-50"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div>
                    <p className={cn("text-base font-semibold", experienceLevel === value ? "text-[#02988C]" : "text-slate-700")}>
                      {label}
                    </p>
                    <p className="text-sm text-slate-400 mt-0.5">{desc}</p>
                  </div>
                  {experienceLevel === value && <CheckCircle2 className="w-5 h-5 text-[#02988C] flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}

          {/* Step 4: Platform goals + Terms */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                {PLATFORM_GOALS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => togglePlatformGoal(id)}
                    className={cn(
                      "flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
                      platformGoals.includes(id)
                        ? "border-[#02988C] bg-teal-50"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                      platformGoals.includes(id) ? "bg-teal-100" : "bg-slate-100"
                    )}>
                      <Icon className={cn("w-4 h-4", platformGoals.includes(id) ? "text-[#02988C]" : "text-slate-500")} />
                    </div>
                    <p className={cn("text-sm font-semibold", platformGoals.includes(id) ? "text-[#02988C]" : "text-slate-700")}>
                      {label}
                    </p>
                  </button>
                ))}
              </div>

              <div className="text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 space-y-1.5 leading-relaxed">
                <p className="font-semibold text-slate-600">Before you start, please note:</p>
                <p>Suttain's tools are for informational purposes. All real-world product decisions remain your responsibility and must comply with applicable regulations.</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className={cn("flex gap-3 mt-5", step === 1 ? "justify-end" : "justify-between")}>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(s => s - 1)} className="gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            )}
            {step < TOTAL_STEPS ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed[step]}
                className="gap-1 bg-gradient-to-r from-[#02988C] to-[#09D2FF] text-white border-0 hover:opacity-90"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={isSaving || !canProceed[step]}
                className="gap-1 bg-gradient-to-r from-[#02988C] to-[#09D2FF] text-white border-0 hover:opacity-90"
              >
                {isSaving ? "Saving..." : "I Agree and Get Started"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}