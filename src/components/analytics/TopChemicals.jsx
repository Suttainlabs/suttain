import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";

export default function TopChemicals({ simulations }) {
  // Count chemical occurrences from simulations
  const counts = {};
  (simulations || []).forEach(sim => {
    (sim.chemicals || []).forEach(chem => {
      const name = chem.trim().toLowerCase();
      if (name) counts[name] = (counts[name] || 0) + 1;
    });
  });

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const max = sorted[0]?.[1] || 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-[var(--suttain-teal)]" />
          <CardTitle className="text-lg">Most Searched Chemicals</CardTitle>
        </div>
        <p className="text-sm text-slate-500">From your simulation history</p>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            Run simulations to see your most-used chemicals here.
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(([name, count]) => (
              <div key={name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700 capitalize">{name}</span>
                  <span className="text-xs text-slate-500">{count}×</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[var(--suttain-teal)] to-[var(--suttain-blue)]"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}