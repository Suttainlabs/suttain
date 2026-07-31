import React from 'react';

export default function FootprintBreakdown({ ingredients, totalCO2e, annualCO2e, taxExposure, unitsPerMonth, carbonPrice }) {
  if (ingredients.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-8">Add ingredients on the left to see their carbon footprint.</p>;
  }

  return (
    <div>
      <h3 className="font-bold text-slate-800 mb-3 text-sm">Ingredient Carbon Breakdown</h3>
      <div className="space-y-2">
        {[...ingredients]
          .sort((a, b) => (b.quantity_kg * b.carbon_intensity) - (a.quantity_kg * a.carbon_intensity))
          .map(ing => {
            const contribution = totalCO2e > 0 ? ((ing.quantity_kg * ing.carbon_intensity) / totalCO2e * 100) : 0;
            return (
              <div key={ing.id} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 w-32 truncate">{ing.name}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${contribution}%`,
                      background: contribution > 30 ? '#ef4444' : contribution > 15 ? '#f59e0b' : '#02988C'
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600 w-12 text-right">{contribution.toFixed(1)}%</span>
                <span className="text-xs text-slate-500 w-20 text-right">{(ing.quantity_kg * ing.carbon_intensity).toFixed(2)} kg CO2e</span>
              </div>
            );
          })}
        <div className="pt-3 border-t border-slate-100 flex justify-between text-sm font-bold text-slate-800">
          <span>Total</span>
          <span>{totalCO2e.toFixed(2)} kg CO2e per batch</span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-xs text-blue-700 leading-relaxed">
          At {unitsPerMonth.toLocaleString()} units/month, your estimated annual carbon exposure is <strong>{(annualCO2e / 1000).toFixed(1)} tonnes CO2e</strong> — equivalent to a carbon tax liability of <strong>${taxExposure.toLocaleString()}/yr</strong> at ${carbonPrice}/tonne.
        </p>
      </div>
    </div>
  );
}