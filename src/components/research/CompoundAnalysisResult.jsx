import React, { useState } from 'react';
import { Shield, Leaf, FlaskConical, Globe, BookOpen, Download, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import ChemicalFormula from '@/components/shared/ChemicalFormula';

function ConfidenceBar({ value }) {
  const color = value >= 80 ? 'bg-emerald-500' : value >= 55 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value || 0}%` }} />
      </div>
      <span className="text-[10px] text-slate-500 w-8 text-right">{value || 0}%</span>
    </div>
  );
}

function SourceBadge({ source }) {
  if (!source) return null;
  return (
    <span className="inline-block px-1.5 py-0.5 bg-slate-700/60 text-slate-400 text-[10px] rounded font-mono leading-tight">
      {source}
    </span>
  );
}

function Section({ icon: Icon, title, children, color = '#0D9E8E' }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/50">
        <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{title}</span>
      </div>
      {children}
    </div>
  );
}

function DataRow({ label, value, source, confidence }) {
  if (!value) return null;
  return (
    <div className="py-2 border-b border-slate-700/30 last:border-0">
      <div className="flex items-start justify-between gap-3 mb-1">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide flex-shrink-0">{label}</span>
        <span className="text-xs text-slate-300 text-right">{value}</span>
      </div>
      {(source || confidence) && (
        <div className="flex items-center justify-between gap-2 mt-1">
          {source && <SourceBadge source={source} />}
          {confidence != null && <ConfidenceBar value={confidence} />}
        </div>
      )}
    </div>
  );
}

export default function CompoundAnalysisResult({ data, query }) {
  const [activeTab, setActiveTab] = useState('identity');
  const { pubchem, analysis } = data || {};

  const tabs = [
    { id: 'identity', label: 'Identity', icon: FlaskConical },
    { id: 'hazard', label: 'Hazard', icon: Shield },
    { id: 'toxicology', label: 'Toxicology', icon: AlertTriangle },
    { id: 'environment', label: 'Environment', icon: Leaf },
    { id: 'regulatory', label: 'Regulatory', icon: Globe },
    { id: 'references', label: 'References', icon: BookOpen },
  ];

  const handleExport = (format) => {
    const content = format === 'json'
      ? JSON.stringify(data, null, 2)
      : Object.entries({ ...(pubchem || {}), ...(analysis || {}) })
          .map(([k, v]) => `${k},${typeof v === 'object' ? JSON.stringify(v) : v}`)
          .join('\n');
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(analysis?.compound_name || query).replace(/\s+/g, '_')}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hazardScore = analysis?.hazard_classification?.overall_hazard_score;
  const hazardColor = hazardScore >= 70 ? '#ef4444' : hazardScore >= 40 ? '#f59e0b' : '#10b981';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">
              {analysis?.compound_name || pubchem?.iupac_name || query}
            </h2>
            {pubchem?.cas_number && (
              <p className="text-xs text-slate-500 font-mono mt-0.5">CAS {pubchem.cas_number}</p>
            )}
            {pubchem?.molecular_formula && (
              <p className="text-sm font-mono text-[#0D9E8E] mt-1">
                <ChemicalFormula formula={pubchem.molecular_formula} />
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hazardScore != null && (
              <div className="text-center px-3 py-2 rounded-lg border" style={{ borderColor: hazardColor + '40', backgroundColor: hazardColor + '10' }}>
                <div className="text-xl font-black" style={{ color: hazardColor }}>{hazardScore}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: hazardColor }}>Hazard</div>
              </div>
            )}
            {analysis?.confidence_overall != null && (
              <div className="text-center px-3 py-2 rounded-lg border border-slate-700 bg-slate-800">
                <div className="text-xl font-black text-slate-300">{analysis.confidence_overall}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Confidence</div>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <button onClick={() => handleExport('json')} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-colors">
                <Download className="w-3 h-3" /> JSON
              </button>
              <button onClick={() => handleExport('csv')} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-colors">
                <Download className="w-3 h-3" /> CSV
              </button>
            </div>
          </div>
        </div>
        {analysis?.hazard_classification?.signal_word && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: hazardColor + '15', color: hazardColor }}>
            <Shield className="w-3 h-3" />
            {analysis.hazard_classification.signal_word}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                activeTab === t.id
                  ? 'bg-[#0D9E8E]/15 text-[#0D9E8E] border border-[#0D9E8E]/30'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'identity' && pubchem && (
        <Section icon={FlaskConical} title="Molecular Identity">
          <div className="mb-3 py-2 border-b border-slate-700/30">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Molecular Formula</p>
            <p className="text-base font-mono text-[#0D9E8E]">
              <ChemicalFormula formula={pubchem.molecular_formula} />
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <DataRow label="PubChem CID" value={pubchem.cid} />
            <DataRow label="Molecular Weight" value={pubchem.molecular_weight ? `${pubchem.molecular_weight} g/mol` : null} />
            <DataRow label="IUPAC Name" value={pubchem.iupac_name} />
            <DataRow label="XLogP" value={pubchem.xlogp} />
            <DataRow label="HBD Count" value={pubchem.hbd_count} />
            <DataRow label="HBA Count" value={pubchem.hba_count} />
            <DataRow label="TPSA" value={pubchem.tpsa ? `${pubchem.tpsa} A²` : null} />
            <DataRow label="Heavy Atoms" value={pubchem.heavy_atom_count} />
            <DataRow label="Complexity" value={pubchem.complexity} />
          </div>
          {pubchem.canonical_smiles && (
            <div className="mt-3 pt-3 border-t border-slate-700/40">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">SMILES</p>
              <p className="text-xs font-mono text-slate-400 break-all bg-slate-900/60 rounded-lg p-2">{pubchem.canonical_smiles}</p>
            </div>
          )}
          {pubchem.inchi_key && (
            <div className="mt-2">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">InChIKey</p>
              <p className="text-xs font-mono text-slate-400 break-all bg-slate-900/60 rounded-lg p-2">{pubchem.inchi_key}</p>
            </div>
          )}
          {pubchem.synonyms?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-700/40">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Synonyms</p>
              <div className="flex flex-wrap gap-1.5">
                {pubchem.synonyms.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-[10px] rounded font-mono">{s}</span>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {activeTab === 'hazard' && analysis?.hazard_classification && (
        <Section icon={Shield} title="Hazard Classification" color="#ef4444">
          <DataRow label="Signal Word" value={analysis.hazard_classification.signal_word} />
          <DataRow label="Overall Score" value={analysis.hazard_classification.overall_hazard_score} confidence={analysis.hazard_classification.confidence_score} />
          {analysis.hazard_classification.ghs_classes?.length > 0 && (
            <div className="py-2 border-b border-slate-700/30">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">GHS Classifications</p>
              <div className="space-y-1">
                {analysis.hazard_classification.ghs_classes.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}
          <DataRow label="Source" value={analysis.hazard_classification.source} />
          {analysis.safer_alternatives?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-700/40">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Safer Alternatives</p>
              {analysis.safer_alternatives.map((alt, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-slate-300">{alt.name}</p>
                    {alt.cas_number && <p className="text-[10px] font-mono text-slate-600">CAS {alt.cas_number}</p>}
                    {alt.reason && <p className="text-[10px] text-slate-500 mt-0.5">{alt.reason}</p>}
                  </div>
                  {alt.comparison_score != null && (
                    <div className="text-right ml-3">
                      <span className="text-sm font-bold text-emerald-400">{alt.comparison_score}</span>
                      <p className="text-[9px] text-slate-600">score</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {activeTab === 'toxicology' && analysis?.toxicity_profile && (
        <Section icon={AlertTriangle} title="Toxicology Profile" color="#f59e0b">
          {analysis.toxicity_profile.acute && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Acute Toxicity</p>
              <DataRow label="LD50 Oral" value={analysis.toxicity_profile.acute.ld50_oral} />
              <DataRow label="LD50 Dermal" value={analysis.toxicity_profile.acute.ld50_dermal} />
              <DataRow label="LC50 Inhalation" value={analysis.toxicity_profile.acute.lc50_inhalation} />
              <DataRow label="Classification" value={analysis.toxicity_profile.acute.classification} confidence={analysis.toxicity_profile.acute.confidence} source={analysis.toxicity_profile.acute.source} />
            </div>
          )}
          {analysis.toxicity_profile.chronic && (
            <div className="mb-4 pt-3 border-t border-slate-700/40">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Chronic Toxicity</p>
              <DataRow label="Assessment" value={analysis.toxicity_profile.chronic.assessment} confidence={analysis.toxicity_profile.chronic.confidence} source={analysis.toxicity_profile.chronic.source} />
            </div>
          )}
          {analysis.toxicity_profile.carcinogenicity && (
            <div className="mb-4 pt-3 border-t border-slate-700/40">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Carcinogenicity</p>
              <DataRow label="IARC Group" value={analysis.toxicity_profile.carcinogenicity.iarc_group} />
              <DataRow label="NTP" value={analysis.toxicity_profile.carcinogenicity.ntp_classification} />
              <DataRow label="Assessment" value={analysis.toxicity_profile.carcinogenicity.assessment} confidence={analysis.toxicity_profile.carcinogenicity.confidence} source={analysis.toxicity_profile.carcinogenicity.source} />
            </div>
          )}
          {analysis.toxicity_profile.endocrine_disruption && (
            <div className="mb-4 pt-3 border-t border-slate-700/40">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Endocrine Disruption</p>
              <DataRow label="Status" value={analysis.toxicity_profile.endocrine_disruption.status} />
              <DataRow label="Mechanism" value={analysis.toxicity_profile.endocrine_disruption.mechanism} confidence={analysis.toxicity_profile.endocrine_disruption.confidence} source={analysis.toxicity_profile.endocrine_disruption.source} />
            </div>
          )}
          {analysis.bioavailability && (
            <div className="pt-3 border-t border-slate-700/40">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bioavailability</p>
              <DataRow label="Oral Estimate" value={analysis.bioavailability.oral_estimate_percent != null ? `${analysis.bioavailability.oral_estimate_percent}%` : null} />
              <DataRow label="Dermal Estimate" value={analysis.bioavailability.dermal_estimate_percent != null ? `${analysis.bioavailability.dermal_estimate_percent}%` : null} />
              <DataRow label="Primary Route" value={analysis.bioavailability.primary_route} confidence={analysis.bioavailability.confidence} source={analysis.bioavailability.source} />
            </div>
          )}
        </Section>
      )}

      {activeTab === 'environment' && analysis?.environmental_fate && (
        <Section icon={Leaf} title="Environmental Fate" color="#10b981">
          {analysis.environmental_fate.biodegradability && (
            <DataRow label="Biodegradability" value={analysis.environmental_fate.biodegradability.classification} confidence={analysis.environmental_fate.biodegradability.confidence} />
          )}
          {analysis.environmental_fate.aquatic_toxicity && (
            <>
              <DataRow label="Fish LC50" value={analysis.environmental_fate.aquatic_toxicity.fish_lc50} />
              <DataRow label="Aquatic Classification" value={analysis.environmental_fate.aquatic_toxicity.classification} confidence={analysis.environmental_fate.aquatic_toxicity.confidence} />
            </>
          )}
          {analysis.environmental_fate.atmospheric_persistence && (
            <DataRow label="Atmospheric Half-life" value={analysis.environmental_fate.atmospheric_persistence.half_life} />
          )}
          {analysis.environmental_fate.soil_adsorption && (
            <DataRow label="Soil Adsorption (Koc)" value={analysis.environmental_fate.soil_adsorption.koc} />
          )}
          <DataRow label="Data Source" value={analysis.environmental_fate.source} />
        </Section>
      )}

      {activeTab === 'regulatory' && analysis?.regulatory_status && (
        <Section icon={Globe} title="Regulatory Status" color="#6366f1">
          {analysis.regulatory_status.fda && (
            <div className="mb-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">FDA</p>
              <DataRow label="Status" value={analysis.regulatory_status.fda.status} />
              <DataRow label="Notes" value={analysis.regulatory_status.fda.notes} />
            </div>
          )}
          {analysis.regulatory_status.epa && (
            <div className="mb-3 pt-3 border-t border-slate-700/40">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">EPA</p>
              <DataRow label="Status" value={analysis.regulatory_status.epa.status} />
              <DataRow label="List" value={analysis.regulatory_status.epa.list} />
              <DataRow label="Notes" value={analysis.regulatory_status.epa.notes} />
            </div>
          )}
          {analysis.regulatory_status.reach && (
            <div className="mb-3 pt-3 border-t border-slate-700/40">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">REACH / EU</p>
              <DataRow label="Status" value={analysis.regulatory_status.reach.status} />
              <DataRow label="SVHC" value={analysis.regulatory_status.reach.svhc ? 'Yes — Substance of Very High Concern' : 'No'} />
              <DataRow label="Notes" value={analysis.regulatory_status.reach.notes} />
            </div>
          )}
          {analysis.regulatory_status.safe_concentration_range && (
            <div className="pt-3 border-t border-slate-700/40">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Safe Concentration</p>
              <DataRow label="Value" value={analysis.regulatory_status.safe_concentration_range.value} />
              <DataRow label="Units" value={analysis.regulatory_status.safe_concentration_range.units} />
              <DataRow label="Application" value={analysis.regulatory_status.safe_concentration_range.application} source={analysis.regulatory_status.safe_concentration_range.source} />
            </div>
          )}
        </Section>
      )}

      {activeTab === 'references' && (
        <Section icon={BookOpen} title="Key Citations" color="#94a3b8">
          {analysis?.key_citations?.length > 0 ? (
            <div className="space-y-2">
              {analysis.key_citations.map((cite, i) => (
                <div key={i} className="flex gap-2 py-2 border-b border-slate-700/30 last:border-0">
                  <span className="text-[10px] font-bold text-slate-600 w-5 flex-shrink-0 pt-0.5">[{i + 1}]</span>
                  <p className="text-xs text-slate-400 leading-relaxed">{cite}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-600">No citations available.</p>
          )}
          {analysis?.data_gaps?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700/40">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Data Gaps</p>
              <div className="space-y-1">
                {analysis.data_gaps.map((gap, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-500">
                    <Info className="w-3 h-3 flex-shrink-0 mt-0.5 text-slate-600" />
                    {gap}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}