import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, GraduationCap, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GradingModal({ experiment, isOpen, onClose, onGraded }) {
  const [grade, setGrade] = useState(experiment?.grade ?? '');
  const [rating, setRating] = useState(experiment?.teacher_rating || 0);
  const [feedback, setFeedback] = useState(experiment?.teacher_feedback || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async (approve = false) => {
    setSubmitting(true);
    try {
      const updates = {
        grade: grade !== '' ? Number(grade) : null,
        teacher_rating: rating,
        teacher_feedback: feedback,
        status: approve ? 'graded' : 'under_review',
        reviewed_date: new Date().toISOString()
      };
      await base44.entities.StudentExperiment.update(experiment.id, updates);
      onGraded();
      onClose();
    } catch (err) {
      console.error('Failed to save grade:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!experiment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-teal-600" />
            </div>
            <DialogTitle className="text-base font-bold">Grade Submission</DialogTitle>
          </div>
          <p className="text-xs text-slate-500">{experiment.title} — {experiment.student_name}</p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Grade (0-100)</Label>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="range"
                min="0"
                max="100"
                value={grade || 0}
                onChange={(e) => setGrade(e.target.value)}
                className="flex-1 accent-teal-600"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-16 px-2 py-1 border border-slate-300 rounded-lg text-center font-bold text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</Label>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setRating(n)}>
                  <Star className={`w-6 h-6 ${n <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 hover:text-yellow-300'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Feedback</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Detailed feedback for the student..."
              rows={4}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => handleSave(false)}
            className="border-slate-300"
          >
            Save Draft
          </Button>
          <Button
            type="button"
            disabled={submitting}
            onClick={() => handleSave(true)}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {submitting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <GraduationCap className="w-4 h-4 mr-1.5" />}
            Grade & Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}