import React from 'react';
import { TrendingDown, TrendingUp, Leaf, DollarSign } from 'lucide-react';

export default function CarbonSummaryPanel({ totalCO2e, annualCO2e, taxExposure, unitsPerMonth }) {
  const perUnit = unitsPerMonth > 0 ? (totalCO2e / unitsPerMonth).toFixed(3) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <Leaf className="w-4 h-4 text-[#02988C] mx-auto mb-1" />
        <p className="text-xs text-slate-400 mb-1">Batch CO2e</p>
        <p className="text-xl font-bold text-slate-900">{totalCO2e.toFixed(1)}</p>
        <p className="text-xs text-slate-400">kg per batch</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <TrendingDown className="w-4 h-4 text-blue-500 mx-auto mb-1" />
        <p className="text-xs text-slate-400 mb-1">Per Unit</p>
        <p className="text-xl font-bold text-slate-900">{perUnit}</p>
        <p className="text-xs text-slate-400">kg CO2e</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <TrendingUp className="w-4 h-4 text-purple-500 mx-auto mb-1" />
        <p className="text-xs text-slate-400 mb-1">Annual CO2e</p>
        <p className="text-xl font-bold text-slate-900">{(annualCO2e / 1000).toFixed(1)}</p>
        <p className="text-xs text-slate-400">tonnes/year</p>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
        <DollarSign className="w-4 h-4 mx-auto mb-1 text-amber-500" />
        <p className="text-xs text-amber-600 mb-1">Tax Exposure</p>
        <p className="text-xl font-bold text-amber-700">${taxExposure.toLocaleString()}</p>
        <p className="text-xs text-amber-500">est. annual</p>
      </div>
    </div>
  );
}