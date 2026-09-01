import React from "react";
import { FlaskConical, FlaskRound, ShieldAlert, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Professional ACS/RSC-style mixing instructions card.
 * Renders numbered phase sections with teal badges, a blue batch-size note,
 * and optional apparatus / reagents / waste disposal sections.
 */
export default function MixingInstructions({
  instructions,
  fallbackInstructions,
  batchSize,
  batchUnit,
  apparatus,
  reagents,
  wasteDisposal,
}) {
  const phases = Array.isArray(instructions) && instructions.length > 0 ? instructions : [];

  const hasApparatus = Array.isArray(apparatus) && apparatus.length > 0;
  const hasReagents = Array.isArray(reagents) && reagents.length > 0;
  const hasDisposal = Array.isArray(wasteDisposal) && wasteDisposal.length > 0;

  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#0A1F1D]">
          <FlaskConical className="w-5 h-5 text-[#02988C]" />
          Mixing Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Batch-size note */}
        <div className="rounded-lg bg-[#EFF4FF] px-4 py-3">
          <p className="text-sm text-[#1A3B8B] leading-relaxed">
            <strong>Note:</strong> Instructions automatically update based on your batch size ({batchSize} {batchUnit}).
          </p>
        </div>

        {/* Apparatus & Materials */}
        {hasApparatus && (
          <div className="rounded-lg bg-[#F8F9FA] p-4 space-y-2">
            <div className="flex items-center gap-2">
              <FlaskRound className="w-4 h-4 text-[#02988C]" />
              <h4 className="font-semibold text-[#0A1F1D] text-sm sm:text-base">Apparatus &amp; materials</h4>
            </div>
            <ul className="list-disc pl-6 space-y-1.5">
              {apparatus.map((item, i) => (
                <li key={i} className="text-sm sm:text-base text-[#0A1F1D] leading-relaxed">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Reagents table */}
        {hasReagents && (
          <div className="rounded-lg bg-[#F8F9FA] p-4 space-y-2">
            <h4 className="font-semibold text-[#0A1F1D] text-sm sm:text-base">Reagents</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-2 pr-3 font-medium text-slate-600">Reagent</th>
                    <th className="py-2 pr-3 font-medium text-slate-600">Function</th>
                    <th className="py-2 font-medium text-slate-600">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {reagents.map((r, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-b-0">
                      <td className="py-2 pr-3 text-[#0A1F1D]">{r.name}</td>
                      <td className="py-2 pr-3 text-slate-600">{r.function}</td>
                      <td className="py-2 text-[#0A1F1D] font-medium">{r.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Numbered procedure phases */}
        {phases.length > 0 ? (
          phases.map((phase, i) => (
            <div key={i} className="rounded-lg bg-[#F8F9FA] p-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#02988C] text-white text-sm font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <h4 className="font-semibold text-[#0A1F1D] text-sm sm:text-base">
                  {phase.phase || `Phase ${i + 1}`}
                </h4>
              </div>
              <ul className="list-disc pl-6 sm:pl-10 space-y-2">
                {Array.isArray(phase.steps)
                  ? phase.steps.map((step, j) => (
                      <li key={j} className="text-sm sm:text-base text-[#0A1F1D] leading-relaxed">{step}</li>
                    ))
                  : typeof phase.steps === "string"
                  ? <li className="text-sm sm:text-base text-[#0A1F1D] leading-relaxed">{phase.steps}</li>
                  : null}
              </ul>
            </div>
          ))
        ) : fallbackInstructions && typeof fallbackInstructions === "string" && fallbackInstructions.trim() ? (
          <div className="rounded-lg bg-[#F8F9FA] p-4">
            <p className="text-sm text-[#0A1F1D] whitespace-pre-wrap leading-relaxed">{fallbackInstructions}</p>
          </div>
        ) : (
          <p className="text-slate-500 italic text-sm sm:text-base">No mixing instructions available for this formula.</p>
        )}

        {/* Waste disposal */}
        {hasDisposal && (
          <div className="rounded-lg bg-[#F8F9FA] p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#02988C]" />
              <h4 className="font-semibold text-[#0A1F1D] text-sm sm:text-base">Waste disposal</h4>
            </div>
            <ul className="list-disc pl-6 space-y-1.5">
              {wasteDisposal.map((item, i) => (
                <li key={i} className="text-sm sm:text-base text-[#0A1F1D] leading-relaxed">{item}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}