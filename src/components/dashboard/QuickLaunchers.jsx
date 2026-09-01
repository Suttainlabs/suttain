import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  TestTube, Atom, QrCode, FileText, BarChart2, Microscope,
} from 'lucide-react';

const TOOLS = [
  { href: 'Simulator', label: 'Chemical Simulator', icon: TestTube, accent: '#02988C' },
  { href: 'generator', label: 'Formula Generator', icon: Atom, accent: '#02988C' },
  { href: 'BarcodeScanner', label: 'Product Scanner', icon: QrCode, accent: '#02988C' },
  { href: 'SDSAnalyzer', label: 'SDS Analyzer', icon: FileText, accent: '#02988C' },
  { href: 'CarbonTaxSimulator', label: 'Carbon Tax', icon: BarChart2, accent: '#02988C' },
  { href: 'MoleculeAnalysis', label: 'Molecule Analysis', icon: Microscope, accent: '#02988C' },
];

export default function QuickLaunchers() {
  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Quick tools</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TOOLS.map(({ href, label, icon: Icon, accent }) => (
          <Link
            key={href}
            to={createPageUrl(href)}
            className="group bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 hover:border-[#02988C]/40 hover:shadow-sm transition-all"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{ backgroundColor: `${accent}14` }}
            >
              <Icon className="w-5 h-5" style={{ color: accent }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-tight">{label}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}