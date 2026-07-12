import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FlaskConical, Plus, X, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { evaluateExperiment } from '@/functions/evaluateExperiment';

export default function SubmitExperimentModal({ isOpen, onClose, classroom, modules = [], defaultModuleId = '', onSubmitted }) {
  const [title, setTitle] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState(defaultModuleId);
  const [chemicals, setChemicals] = useState([{ name: '', concentration: '', amount: '' }]);
  const [conditions, setConditions] = useState({ temperature: '', pressure: '', ph: '', solvent: '', duration: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedModuleId(defaultModuleId || '');
    }
  }, [isOpen, defaultModuleId]);

  const addChemical = () => setChemicals([...chemicals, { name: '', concentration: '', amount: '' }]);
  const removeChemical = (i) => setChemicals(chemicals.filter((_, idx) => idx !== i));
  const updateChemical = (i, field, val) => {
    const updated = [...chemicals];
    updated[i][field] = val;
    setChemicals(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !hypothesis.trim() || chemicals.filter(c => c.name.trim()).length === 0) return;
    setSubmitting(true);
    setEvaluating(true);
    setError('');
    try {
      const user = await base44.auth.me();
      const cleanChemicals = chemicals.filter(c => c.name.trim());

      // Run AI evaluation
      let evaluation = null;
      try {
        const result = await evaluateExperiment({
          title: title.trim(),
          hypothesis: hypothesis.trim(),
          chemicals: cleanChemicals,
          conditions
        });
        evaluation = result?.evaluation || result;
      } catch (evalErr) {
        console.error('Evaluation failed:', evalErr);
      }

      const selectedModule = modules.find(m => m.id === selectedModuleId);
      const experiment = await base44.entities.StudentExperiment.create({
        classroom_id: classroom.id,
        classroom_name: classroom.name,
        module_id: selectedModuleId || null,
        module_title: selectedModule?.title || null,
        student_name: user?.full_name || 'Student',
        student_email: user?.email || '',
        title: title.trim(),
        hypothesis: hypothesis.trim(),
        chemicals: cleanChemicals,
        conditions,
        feasibility_score: evaluation?.feasibility_score ?? null,
        feasibility_label: evaluation?.feasibility_label ?? null,
        feasibility_reasoning: evaluation?.feasibility_reasoning ?? null,
        predicted_outcome: evaluation?.predicted_outcome ?? null,
        safety_assessment: evaluation?.safety_assessment ?? null,
        citations: evaluation?.citations ?? [],
        similar_experiments: evaluation?.similar_experiments ?? [],
        status: 'submitted',
        submitted_date: new Date().toISOString()
      });

      onSubmitted(experiment);
      onClose();
      setTitle(''); setHypothesis(''); setSelectedModuleId(defaultModuleId || ''); setChemicals([{ name: '', concentration: '', amount: '' }]);
      setConditions({ temperature: '', pressure: '', ph: '', solvent: '', duration: '', notes: '' });
    } catch (err) {
      setError(err.message || 'Failed to submit experiment');
    } finally {
      setSubmitting(false);
      setEvaluating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-violet-600" />
            </div>
            <DialogTitle className="text-base font-bold">Submit Experiment Idea</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            {classroom?.name} — Your experiment will be evaluated by AI for feasibility, safety, and related research.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {modules.length > 0 && (
            <div>
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Module</Label>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="">General submission (no specific module)</option>
                {modules.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Experiment Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Effect of temperature on ascorbic acid degradation" required className="mt-1" />
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Hypothesis *</Label>
            <Textarea value={hypothesis} onChange={(e) => setHypothesis(e.target.value)} placeholder="I predict that increasing the temperature will accelerate the oxidation of ascorbic acid, resulting in faster color change..." rows={3} required className="mt-1" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chemicals *</Label>
              <button type="button" onClick={addChemical} className="text-xs text-violet-600 font-semibold flex items-center gap-1 hover:text-violet-700">
                <Plus className="w-3 h-3" /> Add chemical
              </button>
            </div>
            <div className="space-y-2">
              {chemicals.map((chem, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={chem.name} onChange={(e) => updateChemical(i, 'name', e.target.value)} placeholder="Chemical name" className="flex-1" />
                  <Input value={chem.concentration} onChange={(e) => updateChemical(i, 'concentration', e.target.value)} placeholder="Concentration" className="w-32" />
                  <Input value={chem.amount} onChange={(e) => updateChemical(i, 'amount', e.target.value)} placeholder="Amount" className="w-28" />
                  {chemicals.length > 1 && (
                    <button type="button" onClick={() => removeChemical(i)} className="p-2 text-slate-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Experimental Conditions</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
              <Input value={conditions.temperature} onChange={(e) => setConditions({ ...conditions, temperature: e.target.value })} placeholder="Temp (e.g. 25C)" />
              <Input value={conditions.pressure} onChange={(e) => setConditions({ ...conditions, pressure: e.target.value })} placeholder="Pressure" />
              <Input value={conditions.ph} onChange={(e) => setConditions({ ...conditions, ph: e.target.value })} placeholder="pH" />
              <Input value={conditions.solvent} onChange={(e) => setConditions({ ...conditions, solvent: e.target.value })} placeholder="Solvent" />
              <Input value={conditions.duration} onChange={(e) => setConditions({ ...conditions, duration: e.target.value })} placeholder="Duration" />
              <Input value={conditions.notes} onChange={(e) => setConditions({ ...conditions, notes: e.target.value })} placeholder="Other notes" />
            </div>
          </div>

          {evaluating && (
            <div className="flex items-center gap-2 p-3 bg-violet-50 border border-violet-200 rounded-lg">
              <Sparkles className="w-4 h-4 text-violet-600 animate-pulse" />
              <p className="text-xs text-violet-700 font-medium">AI is evaluating your experiment for feasibility, safety, and related research...</p>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-violet-600 hover:bg-violet-700">
              {submitting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <FlaskConical className="w-4 h-4 mr-1.5" />}
              {submitting ? 'Evaluating & Submitting...' : 'Submit for Evaluation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}