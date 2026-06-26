import React from 'react';
import { CheckCircle, AlertTriangle, Shield, HelpCircle, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const RISK_CONFIG = {
  low: {
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
  medium: {
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
  high: {
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
  unknown: {
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
};

export default function RiskExplanationModal({ isOpen, onClose, currentRisk }) {
  const config = RISK_CONFIG[currentRisk] || RISK_CONFIG.unknown;
  const { label, Icon, color, bg, border, summary, details } = config;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Info className="w-4 h-4 text-slate-500" />
            What does this mean?
          </DialogTitle>
        </DialogHeader>

        <div className={`mx-4 mb-3 p-3 rounded-lg border ${border} ${bg}`}>
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-5 h-5 ${color}`} />
            <span className={`font-bold text-base ${color}`}>{label}</span>
            <span className="text-xs text-slate-500 ml-auto">{summary}</span>
          </div>
          <ul className="space-y-1">
            {details.map((d, i) => (
              <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                <span className={`mt-1 w-1 h-1 rounded-full flex-shrink-0 ${color.replace('text-', 'bg-')}`} />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="px-4 pb-4 text-[11px] text-slate-400 leading-snug">
          Rating from PubChem, EWG, and EU regulatory data.
        </p>
      </DialogContent>
    </Dialog>
  );
}