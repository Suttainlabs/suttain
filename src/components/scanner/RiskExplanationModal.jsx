import React from 'react';
import { CheckCircle, AlertTriangle, Shield, HelpCircle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const RISK_LEVELS = [
  {
    key: 'low',
    label: 'Low Risk',
    Icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    summary: 'This product is generally safe to use.',
    details: [
      'Ingredients have little to no known health or environmental concerns.',
      'No significant hazards or restricted substances were detected.',
      'Suitable for regular, everyday use by most people.'
    ]
  },
  {
    key: 'medium',
    label: 'Medium Risk',
    Icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    summary: 'Use with some caution.',
    details: [
      'One or more ingredients may cause irritation or mild reactions in sensitive individuals.',
      'Some ingredients have moderate environmental or regulatory concerns.',
      'Check the Safety and Ingredients tabs for specifics before regular use.'
    ]
  },
  {
    key: 'high',
    label: 'High Risk',
    Icon: Shield,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    summary: 'Consider avoiding or finding an alternative.',
    details: [
      'Contains ingredients linked to known health hazards, allergens, or banned/restricted substances.',
      'May pose risks with repeated or long-term use.',
      'Review the Safety tab and consider the suggested alternatives.'
    ]
  },
  {
    key: 'unknown',
    label: 'Risk Unknown',
    Icon: HelpCircle,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    summary: 'Not enough data to rate this product.',
    details: [
      'We could not verify the full ingredient list or safety data for this product.',
      'Try scanning again or check the Ingredients tab for what we could find.'
    ]
  }
];

export default function RiskExplanationModal({ isOpen, onClose, currentRisk }) {
  const levels = RISK_LEVELS;
  const current = levels.find(l => l.key === currentRisk) || levels.find(l => l.key === 'unknown');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="w-5 h-5 text-slate-500" />
            Understanding Risk Levels
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {levels.map(({ key, label, Icon, color, bg, border, summary, details }) => {
            const isCurrent = key === current.key;
            return (
              <div
                key={key}
                className={`p-4 rounded-xl border ${border} ${bg} ${isCurrent ? 'ring-2 ring-offset-1 ring-slate-300' : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className={`font-bold text-base ${color}`}>{label}</span>
                  {isCurrent && (
                    <span className="ml-auto text-[11px] font-semibold text-slate-500 bg-white/70 px-2 py-0.5 rounded-full">
                      This product
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-700 mb-1.5">{summary}</p>
                <ul className="space-y-1">
                  {details.map((d, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 leading-relaxed">
            Risk levels are calculated from ingredient safety scores, known hazards, and regulatory data
            sourced from PubChem, EWG, and EU regulatory databases. Tap the badge anytime to revisit this guide.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}