import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, GraduationCap, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { autoGenerateModules } from './suttainTools';

function generateClassCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function CreateClassroomModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('chemistry');
  const [gradeLevel, setGradeLevel] = useState('undergraduate');
  const [safetyBounds, setSafetyBounds] = useState('moderate');
  const [researchFocus, setResearchFocus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const user = await base44.auth.me();
      const classroom = await base44.entities.Classroom.create({
        name: name.trim(),
        description: description.trim(),
        class_code: generateClassCode(),
        teacher_name: user?.full_name || user?.email || 'Teacher',
        subject,
        grade_level: gradeLevel,
        safety_bounds: safetyBounds,
        research_focus: researchFocus.trim(),
        roster: [],
        is_active: true,
        settings: {
          allow_student_experiments: true,
          require_teacher_approval: true,
          show_citations: true
        }
      });
      // Auto-generate default experiment modules for the new classroom
      try {
        await autoGenerateModules(classroom);
      } catch (modErr) {
        console.error('Failed to auto-generate modules:', modErr);
      }

      onCreated(classroom);
      onClose();
      setName(''); setDescription(''); setResearchFocus('');
    } catch (err) {
      setError(err.message || 'Failed to create classroom');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-teal-600" />
            </div>
            <DialogTitle className="text-base font-bold">Create Classroom</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Set up a classroom where students can join, submit experiment ideas, and get AI-powered feasibility feedback.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Class Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="CHEM 201 - Fall 2026" required className="mt-1" />
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Introduction to organic chemistry with focus on reaction mechanisms..." rows={2} className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</Label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="chemistry">Chemistry</option>
                <option value="biology">Biology</option>
                <option value="biochemistry">Biochemistry</option>
                <option value="materials_science">Materials Science</option>
                <option value="environmental_science">Environmental Science</option>
                <option value="chemical_engineering">Chemical Engineering</option>
                <option value="pharmacology">Pharmacology</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Grade Level</Label>
              <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="high_school">High School</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="graduate">Graduate</option>
                <option value="vocational">Vocational</option>
              </select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Safety Bounds</Label>
            <select value={safetyBounds} onChange={(e) => setSafetyBounds(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="strict">Strict — Household-safe chemicals only</option>
              <option value="moderate">Moderate — Standard lab-safe chemicals</option>
              <option value="open">Open — All chemicals permitted</option>
            </select>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Research Focus (optional)</Label>
            <Input value={researchFocus} onChange={(e) => setResearchFocus(e.target.value)} placeholder="e.g. Green chemistry and sustainable formulations" className="mt-1" />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-700">
              {submitting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <GraduationCap className="w-4 h-4 mr-1.5" />}
              Create Classroom
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}