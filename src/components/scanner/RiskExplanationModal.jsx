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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Info className="w-5 h-5 text-slate-500" />
            What does this mean?
          </DialogTitle>
        </DialogHeader>

        <div className={`mt-2 p-5 rounded-xl border ${border} ${bg}`}>
          <div className="flex items-center gap-2.5 mb-2">
            <Icon className={`w-7 h-7 ${color}`} />
            <span className={`font-bold text-xl ${color}`}>{label}</span>
          </div>
          <p className="text-sm font-medium text-slate-700 mb-3">{summary}</p>
          <ul className="space-y-2">
            {details.map((d, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${color.replace('text-', 'bg-')}`} />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 leading-relaxed">
            This rating is calculated from ingredient safety scores, known hazards, and regulatory data
            sourced from PubChem, EWG, and EU regulatory databases.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}