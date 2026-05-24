import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FlaskConical, Atom, QrCode, Cpu, BarChart3, Shield, Sparkles, ArrowRight } from 'lucide-react';

const ROLE_RECOMMENDATIONS = {
  formulator: {
    headline: 'Recommended for Formulators',
    items: [
      { label: 'Generate a Formula', desc: 'AI-built, safety-validated formula for your product type', href: 'generator', icon: FlaskConical, color: '#02988C' },
      { label: 'Run Simulation', desc: 'Test ingredient combinations before mixing', href: 'Simulator', icon: Atom, color: '#9531F5' },
      { label: 'Check Compliance', desc: 'Verify your formula meets global regulations', href: 'ComplianceCoPilot', icon: Shield, color: '#0891b2' },
    ]
  },
  researcher: {
    headline: 'Recommended for Researchers',
    items: [
      { label: 'Computational Simulation', desc: 'DFT, MD, protein docking, QM scripting', href: 'ComputationalSimulation', icon: Cpu, color: '#7c3aed' },
      { label: 'Chemical Simulator', desc: 'Predict reactions and hazard profiles', href: 'Simulator', icon: Atom, color: '#02988C' },
      { label: 'Ingredient Database', desc: 'Search 250k+ chemicals with full data', href: 'IngredientDatabase', icon: FlaskConical, color: '#0891b2' },
    ]
  },
  business: {
    headline: 'Recommended for Brand Managers',
    items: [
      { label: 'Comparative Impact Report', desc: 'Benchmark your formula vs. industry averages', href: 'ComparativeImpactReport', icon: BarChart3, color: '#02988C' },
      { label: 'Scan a Product', desc: 'Analyze any competitor or supplier product', href: 'BarcodeScanner', icon: QrCode, color: '#9531F5' },
      { label: 'Generate Formula', desc: 'Create production-ready formulas at scale', href: 'generator', icon: Sparkles, color: '#0891b2' },
    ]
  },
  teacher: {
    headline: 'Recommended for Educators',
    items: [
      { label: 'Chemical Simulator', desc: 'Safe, interactive chemical reaction demos', href: 'Simulator', icon: Atom, color: '#02988C' },
      { label: 'Learning Center', desc: 'Tutorials and guided walkthroughs', href: 'LearningSuite', icon: FlaskConical, color: '#9531F5' },
      { label: 'Ingredient Database', desc: 'Reference database for classroom use', href: 'IngredientDatabase', icon: Shield, color: '#0891b2' },
    ]
  },
  individual: {
    headline: 'Recommended for You',
    items: [
      { label: 'Scan a Product', desc: 'Check what is in any product you own', href: 'BarcodeScanner', icon: QrCode, color: '#02988C' },
      { label: 'Make a Formula', desc: 'Create DIY skincare, cleaning, or haircare', href: 'generator', icon: FlaskConical, color: '#9531F5' },
      { label: 'Safety Simulator', desc: 'Test chemical safety before mixing anything', href: 'Simulator', icon: Shield, color: '#0891b2' },
    ]
  },
  student: {
    headline: 'Recommended for Students',
    items: [
      { label: 'Chemical Simulator', desc: 'Explore reactions interactively', href: 'Simulator', icon: Atom, color: '#02988C' },
      { label: 'Learning Center', desc: 'Guided tutorials and chemistry guides', href: 'LearningSuite', icon: FlaskConical, color: '#9531F5' },
      { label: 'Ingredient Database', desc: 'Look up any chemical with full data', href: 'IngredientDatabase', icon: BarChart3, color: '#0891b2' },
    ]
  },
};

const DEFAULT_RECOMMENDATIONS = {
  headline: 'Where would you like to start?',
  items: [
    { label: 'Chemical Simulator', desc: 'Test ingredient combinations for safety', href: 'Simulator', icon: Atom, color: '#02988C' },
    { label: 'Formula Generator', desc: 'Create AI-built, validated formulas', href: 'generator', icon: FlaskConical, color: '#9531F5' },
    { label: 'SuttainScan', desc: 'Scan any product barcode', href: 'BarcodeScanner', icon: QrCode, color: '#0891b2' },
  ]
};

export default function PersonalizedRecommendations({ user }) {
  if (!user) return null;

  const role = user.simulator_category;
  const rec = ROLE_RECOMMENDATIONS[role] || DEFAULT_RECOMMENDATIONS;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">{rec.headline}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {rec.items.map(({ label, desc, href, icon: Icon, color }) => (
          <Link
            key={href}
            to={createPageUrl(href)}
            className="group flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-slate-50 hover:bg-white"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}15` }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">{desc}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 mt-1 flex-shrink-0 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}