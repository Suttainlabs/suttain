import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { base44 } from '@/api/base44Client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { CheckCircle2, Beaker, Atom, QrCode, Leaf, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const GOALS = [
  { id: 'formulate', label: 'Create & formulate products', icon: Beaker },
  { id: 'simulate', label: 'Simulate chemical interactions', icon: Atom },
  { id: 'scan', label: 'Scan & analyze products', icon: QrCode },
  { id: 'sustainability', label: 'Track sustainability impact', icon: Leaf },
];

const ROLES = [
  { value: 'individual', label: 'Individual / DIY Enthusiast' },
  { value: 'student', label: 'Student' },
  { value: 'researcher', label: 'Researcher / Scientist' },
  { value: 'teacher', label: 'STEM Teacher / Educator' },
  { value: 'business', label: 'Business / Brand Owner' },
  { value: 'formulator', label: 'Professional Formulator' },
];

const INDUSTRIES = [
  { value: 'cosmetics', label: 'Cosmetics & Personal Care' },
  { value: 'cleaning', label: 'Cleaning & Home Products' },
  { value: 'food', label: 'Food & Nutrition' },
  { value: 'pharma', label: 'Pharmaceutical' },
  { value: 'agriculture', label: 'Agriculture & Environment' },
  { value: 'education', label: 'Education & Research' },
  { value: 'other', label: 'Other' },
];

export default function UserAcknowledgementModal({ isOpen, onAccept, onClose }) {
  const [step, setStep] = useState(1); // 1 = goals, 2 = profile, 3 = terms
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toggleGoal = (id) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const canProceedStep1 = selectedGoals.length > 0;
  const canProceedStep2 = role && industry;

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      const currentUser = await base44.auth.me();

      base44.analytics.track({
        eventName: 'signup_completed',
        properties: { goals: selectedGoals.join(','), role, industry }
      });

      await base44.auth.updateMe({
        first_login: false,
        onboarding_goals: selectedGoals,
        generator_category: role === 'business' || role === 'formulator' ? 'business' : 'individual',
        simulator_category: role,
        industry,
      });

      await base44.entities.Notification.create({
        title: 'New User Signup',
        message: `${currentUser.full_name || currentUser.email} just signed up. Role: ${role}, Industry: ${industry}`,
        type: 'user_signup',
        severity: 'info',
        target_user: 'admin',
        metadata: { user_email: currentUser.email, user_name: currentUser.full_name, role, industry, goals: selectedGoals }
      });

      try {
        await base44.functions.invoke('sendSlackNotification', {
          channel: '#all-suttain',
          type: 'new_user',
          data: { userName: currentUser.full_name, userEmail: currentUser.email, role, industry, goals: selectedGoals.join(', ') }
        });
      } catch {}

      if (onAccept) onAccept(); else onClose();
    } catch (error) {
      console.error("Failed to save user preferences:", error);
      alert("Could not save your preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[520px]">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={cn(
              "h-1.5 flex-1 rounded-full transition-all",
              s <= step ? "bg-gradient-to-r from-teal-500 to-cyan-500" : "bg-slate-100"
            )} />
          ))}
        </div>

        {/* Step 1: Goals */}
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Welcome to Suttain!</DialogTitle>
              <DialogDescription>What are you hoping to do here? Select all that apply.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-4">
              {GOALS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => toggleGoal(id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium",
                    selectedGoals.includes(id)
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    selectedGoals.includes(id) ? "bg-teal-100" : "bg-slate-100"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {label}
                  {selectedGoals.includes(id) && (
                    <CheckCircle2 className="w-4 h-4 text-teal-500 absolute top-2 right-2" />
                  )}
                </button>
              ))}
            </div>
            <Button onClick={() => setStep(2)} disabled={!canProceedStep1} className="w-full">
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </>
        )}

        {/* Step 2: Profile */}
        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Tell us about yourself</DialogTitle>
              <DialogDescription>Help us personalize your experience.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>What best describes your role?</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger><SelectValue placeholder="Select your role..." /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Which industry are you in?</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger><SelectValue placeholder="Select your industry..." /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button onClick={() => setStep(3)} disabled={!canProceedStep2} className="flex-1">
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Terms */}
        {step === 3 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">One last thing</DialogTitle>
              <DialogDescription>Please acknowledge our terms before you begin.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="text-sm p-4 bg-slate-50 rounded-lg max-h-36 overflow-y-auto space-y-2 text-slate-600">
                <p>By using Suttain, you agree to formulate responsibly and accept that our tools are for informational purposes only. All real-world product decisions are your responsibility.</p>
                <p>You must validate critical decisions with expert review or lab testing and follow all applicable regulations for manufacturing and labeling.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button onClick={handleFinish} disabled={isSaving} className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                {isSaving ? "Saving..." : "I Agree & Get Started"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}