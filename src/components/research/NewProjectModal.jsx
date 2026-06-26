import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FilePlus, FlaskConical, ShieldAlert, Cpu, Scale,
  Atom, Leaf, Microscope, Check, ChevronRight
} from 'lucide-react';
import { PROJECT_TEMPLATES } from './projectTemplates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';

const ICONS = {
  FilePlus, FlaskConical, ShieldAlert, Cpu, Scale, Atom, Leaf, Microscope,
};

export default function NewProjectModal({ isOpen, onClose, onCreate }) {
  const [step, setStep] = useState('template'); // 'template' | 'details'
  const [selectedId, setSelectedId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const selected = selectedId ? PROJECT_TEMPLATES.find(t => t.id === selectedId) : null;

  const reset = () => {
    setStep('template');
    setSelectedId(null);
    setName('');
    setDescription('');
    setIsCreating(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSelectTemplate = (template) => {
    setSelectedId(template.id);
    // Pre-fill name with the template name so the user can edit it
    setName(template.id === 'blank' ? '' : template.name);
    setDescription(template.description === 'Start from scratch with no pre-filled fields.' ? '' : template.description);
    setStep('details');
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim() || selected?.description || '',
        color: selected?.color || '#6B3FA0',
        project_type: selected?.project_type || 'custom',
        tags: selected?.tags || [],
        notes: selected?.notes || '',
        template_id: selected?.id || null,
      });
      handleClose();
    } catch (e) {
      console.error('Failed to create project:', e);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {step === 'template' ? 'Choose a Project Template' : 'Project Details'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {step === 'template'
              ? 'Select a template to pre-fill standard fields and settings, or start blank.'
              : 'Review and adjust the auto-populated fields for your new project.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'template' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
            {PROJECT_TEMPLATES.map((t) => {
              const Icon = ICONS[t.icon] || FilePlus;
              return (
                <motion.button
                  key={t.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelectTemplate(t)}
                  className="text-left p-4 rounded-xl border border-slate-200 hover:border-violet-400 hover:shadow-md transition-all bg-white group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: (t.color || '#6B3FA0') + '15' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: t.color || '#6B3FA0' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800">{t.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{t.description}</p>
                      {t.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {t.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {step === 'details' && selected && (
          <div className="space-y-4 py-2">
            {/* Template summary banner */}
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: (selected.color || '#6B3FA0') + '10' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: (selected.color || '#6B3FA0') + '20' }}>
                {React.createElement(ICONS[selected.icon] || FilePlus, { className: 'w-4 h-4', style: { color: selected.color || '#6B3FA0' } })}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{selected.name}</p>
                <p className="text-xs text-slate-500">{selected.project_type} template applied</p>
              </div>
              <button onClick={() => setStep('template')} className="text-xs text-violet-600 font-semibold hover:underline">
                Change
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Project Name</label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter project name"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Description</label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description of the project"
                  rows={2}
                />
              </div>

              {/* Auto-populated preview */}
              {selected.id !== 'blank' && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Auto-populated from template</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 w-16">Type</span>
                      <span className="font-medium text-slate-700 capitalize">{selected.project_type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 w-16">Color</span>
                      <span className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: selected.color }} />
                      <span className="font-mono text-slate-600 text-[11px]">{selected.color}</span>
                    </div>
                    {selected.tags.length > 0 && (
                      <div className="flex items-start gap-2 text-xs">
                        <span className="text-slate-500 w-16 mt-0.5">Tags</span>
                        <div className="flex flex-wrap gap-1">
                          {selected.tags.map(tag => (
                            <span key={tag} className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">
                              <Check className="w-2.5 h-2.5" />{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selected.notes && (
                      <div className="flex items-start gap-2 text-xs pt-1">
                        <span className="text-slate-500 w-16 mt-0.5">Notes</span>
                        <span className="text-slate-600 leading-snug">{selected.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'details' && (
            <>
              <Button variant="outline" onClick={() => setStep('template')} disabled={isCreating}>
                Back
              </Button>
              <Button onClick={handleCreate} disabled={!name.trim() || isCreating}>
                {isCreating ? 'Creating...' : 'Create Project'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}