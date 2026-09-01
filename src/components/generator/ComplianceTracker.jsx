import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Globe, FileText, AlertCircle, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

// Documentation checklist per framework.
// Each item is [label, isComplete], derived from the formula's available data.
function buildChecklists(formula, complianceData) {
  const ings = formula?.ingredients || [];
  const hasIngredients = ings.length > 0;
  const hasSafety = (formula?.safety_precautions || []).length > 0;
  const hasProps = !!formula?.properties;
  const hasPh = !!formula?.ph_level_value || !!formula?.properties?.ph_level;
  const hasName = !!formula?.name;
  const hasDesc = !!formula?.description;
  const hasInstructions = (formula?.instructions || []).length > 0;
  const hasCosting = !!formula?.costing_data;
  const hasSuppliers = ings.some(i => i.supplier_id || i.supplier_name);

  // ComplianceChecker output (optional)
  const regional = complianceData?.regional_compliance || [];
  const fdaRegion = regional.find(r => /FDA|USA/i.test(r.region));
  const euRegion = regional.find(r => /EU|Cosing|REACH/i.test(r.region));
  const restricted = complianceData?.restricted_ingredients || [];
  const concLimits = complianceData?.concentration_limits || [];
  const allergens = complianceData?.allergen_declarations || [];
  const labeling = complianceData?.labeling_requirements || [];

  const ghs = [
    ["Hazard classification per ingredient", hasIngredients],
    ["Safety precautions documented", hasSafety],
    ["Signal word & pictogram assignment", hasSafety],
    ["SDS-ready properties (pH, physical state)", hasPh && hasProps],
    ["First-aid / handling notes", hasSafety],
  ];

  const fda = [
    ["Ingredient INCI list compiled", hasIngredients && ings.every(i => i.chemical_name)],
    ["Product type & intended use defined", hasName && hasDesc],
    ["Concentration limits reviewed", concLimits.length > 0],
    ["Allergen declarations prepared", allergens.length > 0],
    ["FDA regional compliance status", !!fdaRegion],
  ];

  const reach = [
    ["Ingredient registration status checked", hasIngredients],
    ["Restricted substances screened", restricted.length > 0 || !!euRegion],
    ["EU regional compliance status", !!euRegion],
    ["Supplier verification on file", hasSuppliers],
    ["Labeling requirements mapped", labeling.length > 0],
  ];

  return { ghs, fda, reach };
}

function statusFor(pct) {
  if (pct >= 100) return { label: "Complete", color: "text-emerald-600", bar: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  if (pct >= 60) return { label: "In review", color: "text-amber-600", bar: "bg-amber-500", badge: "bg-amber-100 text-amber-700 border-amber-200" };
  if (pct > 0) return { label: "In progress", color: "text-blue-600", bar: "bg-blue-500", badge: "bg-blue-100 text-blue-700 border-blue-200" };
  return { label: "Not started", color: "text-slate-500", bar: "bg-slate-300", badge: "bg-slate-100 text-slate-600 border-slate-200" };
}

function TrackerRow({ icon: Icon, title, subtitle, items, accent }) {
  const completed = items.filter(([, done]) => done).length;
  const pct = items.length ? Math.round((completed / items.length) * 100) : 0;
  const status = statusFor(pct);

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", accent.bg)}>
              <Icon className={cn("w-4 h-4", accent.text)} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-semibold text-slate-900 truncate">{title}</CardTitle>
              <p className="text-xs text-slate-500 truncate">{subtitle}</p>
            </div>
          </div>
          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0", status.badge)}>
            {status.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative h-2 flex-1 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full transition-all duration-500", status.bar)}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={cn("text-sm font-bold tabular-nums w-10 text-right", status.color)}>{pct}%</span>
        </div>
        <ul className="space-y-1.5">
          {items.map(([label, done], i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
              {done
                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                : <Circle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
              <span className={done ? "text-slate-700" : "text-slate-400"}>{label}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function ComplianceTracker({ formula, complianceData }) {
  const { ghs, fda, reach } = useMemo(
    () => buildChecklists(formula, complianceData),
    [formula, complianceData]
  );

  const overallPct = useMemo(() => {
    const all = [...ghs, ...fda, ...reach];
    const done = all.filter(([, d]) => d).length;
    return all.length ? Math.round((done / all.length) * 100) : 0;
  }, [ghs, fda, reach]);

  const overall = statusFor(overallPct);

  return (
    <div className="space-y-4">
      {/* Overall summary */}
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-white">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Business compliance readiness</p>
              <p className="text-xs text-slate-500">Aggregated documentation status across GHS, FDA & EU REACH</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className={cn("text-2xl font-bold tabular-nums", overall.color)}>{overallPct}%</p>
            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", overall.badge)}>{overall.label}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <TrackerRow
          icon={AlertCircle}
          title="GHS hazard mapping"
          subtitle="Globally Harmonized System classification & SDS"
          items={ghs}
          accent={{ bg: "bg-amber-100", text: "text-amber-600" }}
        />
        <TrackerRow
          icon={FileText}
          title="FDA compliance"
          subtitle="US FDA ingredient & labeling requirements"
          items={fda}
          accent={{ bg: "bg-blue-100", text: "text-blue-600" }}
        />
        <TrackerRow
          icon={Globe}
          title="EU REACH"
          subtitle="Registration, evaluation & authorisation mapping"
          items={reach}
          accent={{ bg: "bg-emerald-100", text: "text-emerald-600" }}
        />
      </div>
    </div>
  );
}