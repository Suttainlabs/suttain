import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Database, BookOpen, AlertTriangle, Activity, Info, Atom } from "lucide-react";

const SOURCE_COLORS = {
  'Materials Project': 'bg-amber-100 text-amber-700 border-amber-200',
  'COD (OPTIMADE)': 'bg-blue-100 text-blue-700 border-blue-200',
  'Materials Cloud (OPTIMADE)': 'bg-teal-100 text-teal-700 border-teal-200',
};

function getSourceColor(source) {
  if (!source) return 'bg-slate-100 text-slate-700 border-slate-200';
  for (const key of Object.keys(SOURCE_COLORS)) {
    if (source.includes(key)) return SOURCE_COLORS[key];
  }
  if (source.includes('web search')) return 'bg-purple-100 text-purple-700 border-purple-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function formatValue(val, unit) {
  if (val === null || val === undefined) return ':';
  if (typeof val === 'number') return `${val.toFixed(4)}${unit ? ` ${unit}` : ''}`;
  return `${val}${unit ? ` ${unit}` : ''}`;
}

function PropertyRow({ label, value, unit, explanation }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-slate-100 last:border-0">
      <div className="min-w-0">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
        {explanation && (
          <p className="text-xs text-slate-400 mt-0.5">{explanation}</p>
        )}
      </div>
      <span className="text-sm font-mono font-bold text-slate-800 whitespace-nowrap">
        {formatValue(value, unit)}
      </span>
    </div>
  );
}

export default function MaterialsResults({ results }) {
  if (!results) return null;

  if (results.error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="font-semibold">{results.error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const materials = results.results || [];
  const methodNote = results.method_note || '';
  const sourcesQueried = results.sources_queried || [];
  const hasMpKey = results.has_mp_key;

  if (materials.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <Database className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No materials found</p>
          <p className="text-sm text-slate-400 mt-1">Try a different formula or element set.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Method note banner */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-sm mb-1">Search Method</h3>
              <p className="text-sm text-slate-600">{methodNote}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {sourcesQueried.map((src, i) => (
                  <Badge key={i} variant="outline" className={`text-xs ${getSourceColor(src)}`}>
                    <Database className="w-3 h-3 mr-1" />
                    {src}
                  </Badge>
                ))}
              </div>
              {!hasMpKey && (
                <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Add a Materials Project API key in Materials Settings above for richer live data (formation energies, band gaps, densities).
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Layers className="w-4 h-4" />
        <span>{materials.length} material{materials.length !== 1 ? 's' : ''} found</span>
      </div>

      {/* Material cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {materials.map((mat, i) => (
          <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              {/* Header: formula + source */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 font-mono truncate">
                    {mat.formula || 'Unknown'}
                  </h3>
                  {mat.material_id && (
                    <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {mat.material_id}</p>
                  )}
                </div>
                <Badge variant="outline" className={`text-xs flex-shrink-0 ${getSourceColor(mat.source)}`}>
                  <Database className="w-3 h-3 mr-1" />
                  {mat.source}
                </Badge>
              </div>

              {/* Properties */}
              <div className="mb-3">
                <PropertyRow
                  label="Formation Energy"
                  value={mat.formation_energy_per_atom}
                  unit="eV/atom"
                  explanation="Energy to form from pure elements (lower = more stable)"
                />
                <PropertyRow
                  label="Band Gap"
                  value={mat.band_gap}
                  unit="eV"
                  explanation="0 = metal, 0.1-3 = semiconductor, >3 = insulator"
                />
                <PropertyRow
                  label="Density"
                  value={mat.density}
                  unit="g/cm³"
                />
                <PropertyRow
                  label="Crystal System"
                  value={mat.crystal_system}
                />
                {mat.spacegroup && (
                  <PropertyRow
                    label="Space Group"
                    value={mat.spacegroup}
                  />
                )}
                {mat.is_stable !== undefined && mat.is_stable !== null && (
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Stability</span>
                    <Badge className={mat.is_stable ? "bg-green-100 text-green-700 text-xs" : "bg-amber-100 text-amber-700 text-xs"}>
                      {mat.is_stable ? "Stable (on hull)" : "Metastable"}
                    </Badge>
                  </div>
                )}
                {mat.elements && mat.elements.length > 0 && (
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Elements</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {mat.elements.map((el, j) => (
                        <span key={j} className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{el}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Plain language explanation */}
              {mat.plain_language && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 leading-relaxed">{mat.plain_language}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Source footer */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Activity className="w-3 h-3" />
        <span>Properties sourced from open materials databases. Explanations generated to help interpret results.</span>
      </div>
    </div>
  );
}