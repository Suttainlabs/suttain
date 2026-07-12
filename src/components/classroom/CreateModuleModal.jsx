import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Layers, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { SUTTAIN_TOOLS } from './suttainTools';

export default function CreateModuleModal({ isOpen, onClose, classroom, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState('');
  const [selectedTools, setSelectedTools] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleTool = (id) => {
    setSelectedTools(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || selectedTools.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      const module = await base44.entities.ExperimentModule.create({
        classroom_id: classroom.id,
        classroom_name: classroom.name,
        title: title.trim(),
        description: description.trim(),
        learning_objectives: objectives.trim(),
        tool_ids: selectedTools,
        due_date: dueDate || null,
        order: 99,
        is_auto_generated: false,
        status: 'active'
      });
      onCreated(module);
      onClose();
      setTitle(''); setDescription(''); setObjectives(''); setSelectedTools([]); setDueDate('');
    } catch (err) {
      setError(err.message || 'Failed to create module');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
              <Layers className="w-4 h-4 text-teal-600" />
            </div>
            <DialogTitle className="text-base font-bold">Create Experiment Module</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            {classroom?.name} — Assign a module with specific Suttain tools for students to use.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Module Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Ascorbic Acid Degradation Study" required className="mt-1" />
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Instructions for students on what to explore and document..." rows={2} className="mt-1" />
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Learning Objectives</Label>
            <Textarea value={objectives} onChange={(e) => setObjectives(e.target.value)} placeholder="What students should learn from this module..." rows={2} className="mt-1" />
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date (optional)</Label>
            <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1" />
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suttain Tools *</Label>
            <p className="text-[11px] text-slate-400 mb-2">Select which tools students should use for this module.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUTTAIN_TOOLS.map(tool => {
                const selected = selectedTools.includes(tool.id);
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => toggleTool(tool.id)}
                    className={`flex items-start gap-2 p-2.5 rounded-lg border text-left transition-all ${
                      selected
                        ? 'border-teal-400 bg-teal-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${selected ? 'bg-teal-500' : 'bg-slate-100'}`}>
                      {selected ? <Check className="w-3.5 h-3.5 text-white" /> : <tool.Icon className="w-3.5 h-3.5 text-slate-500" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700">{tool.label}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{tool.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting || selectedTools.length === 0} className="bg-teal-600 hover:bg-teal-700">
              {submitting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Layers className="w-4 h-4 mr-1.5" />}
              Create Module
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}