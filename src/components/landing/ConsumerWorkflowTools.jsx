import React from 'react';
import { Link } from 'react-router-dom';
import { ScanLine, Atom, FlaskConical, BarChart2, FileText, ArrowUpRight } from 'lucide-react';

const tools = [
  { title: 'Product scanner', goal: 'Understand a product', to: '/BarcodeScanner', icon: ScanLine },
  { title: 'Chemical Analysis', goal: 'Explore interactions', to: '/Simulator', icon: Atom },
  { title: 'Formula generator', goal: 'Develop a formula', to: '/generator', icon: FlaskConical },
  { title: 'Tax simulator', goal: 'Estimate carbon tax exposure', to: '/CarbonTaxSimulator', icon: BarChart2 },
  { title: 'SDS analyzer', goal: 'Review document hazards', to: '/SDSAnalyzer', icon: FileText },
];

export default function ConsumerWorkflowTools() {
  return (
    <nav aria-label="Choose a tool for your task" className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
      {tools.map(({ title, goal, to, icon: Icon }) => (
        <Link key={title} to={to} className="flex items-center gap-3 rounded-lg border border-research-border bg-research-card p-3 hover:border-research-accent">
          <Icon className="h-4 w-4 shrink-0 text-research-accent" strokeWidth={1.5} aria-hidden="true" />
          <span className="min-w-0"><span className="block text-sm font-medium">{title}</span><span className="block text-xs text-research-muted">{goal}</span></span>
          <ArrowUpRight className="ml-auto h-3 w-3 shrink-0 text-research-muted" aria-hidden="true" />
        </Link>
      ))}
    </nav>
  );
}