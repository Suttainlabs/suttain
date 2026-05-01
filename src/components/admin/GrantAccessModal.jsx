import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Clock, Infinity } from 'lucide-react';

const DURATIONS = [
  { label: '7 Days', value: 7, unit: 'days' },
  { label: '30 Days', value: 30, unit: 'days' },
  { label: '90 Days', value: 90, unit: 'days' },
  { label: '6 Months', value: 180, unit: 'days' },
  { label: '1 Year', value: 365, unit: 'days' },
  { label: 'Lifetime', value: null, unit: 'lifetime' },
];

export default function GrantAccessModal({ user, onConfirm, onClose }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selected) return;
    setLoading(true);
    await onConfirm(user, selected);
    setLoading(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            Grant Full Access
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-3 text-sm">
            <p className="font-semibold text-slate-800">{user.full_name || 'User'}</p>
            <p className="text-slate-500">{user.email}</p>
          </div>

          <p className="text-sm text-slate-600">Select how long this user should have full Pro access:</p>

          <div className="grid grid-cols-2 gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.label}
                onClick={() => setSelected(d)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  selected?.label === d.label
                    ? 'border-violet-600 bg-violet-50 text-violet-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300'
                }`}
              >
                {d.unit === 'lifetime' ? <Infinity className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                {d.label}
              </button>
            ))}
          </div>

          {selected && (
            <p className="text-xs text-slate-500 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2">
              {selected.unit === 'lifetime'
                ? '⚡ This user will have permanent Pro access until manually revoked.'
                : `⚡ Access will expire on ${new Date(Date.now() + selected.value * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
              onClick={handleConfirm}
              disabled={!selected || loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Grant Access
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}