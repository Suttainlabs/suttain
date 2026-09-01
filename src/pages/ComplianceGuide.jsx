import React from 'react';
import { ClipboardCheck, AlertOctagon, ListChecks, Code2, Mail } from 'lucide-react';

const COVERAGE = [
  {
    title: 'GHS Classification',
    body: 'Our Regulatory API and SDS Analyzer extract and display Globally Harmonized System (GHS) hazard classifications, including signal words (Danger, Warning), H-statements, and pictograms for compounds in our 130M+ database. Data is sourced directly from PubChem PUG-View, which aggregates GHS labels from authoritative bodies.',
  },
  {
    title: 'EPA CompTox Dashboard',
    body: 'We cross-reference compounds against the EPA CompTox Chemistry Dashboard, providing access to toxicity, environmental fate, and regulatory status data curated by the US Environmental Protection Agency.',
  },
  {
    title: 'REACH and ECHA',
    body: 'Where available, we surface REACH registration status and ECHA hazard classifications for compounds regulated under the European Chemicals Agency framework. This helps formulators selling in the EU understand registration and restriction requirements.',
  },
  {
    title: 'FDA Ingredient Status',
    body: 'For cosmetic and personal care formulators, we flag known FDA restrictions, warnings, or prohibitions on specific ingredients. This is informational only and does not constitute legal compliance certification.',
  },
  {
    title: 'IFRA Standards',
    body: 'For fragrance formulations, we reference International Fragrance Association (IFRA) standards where applicable, helping formulators understand maximum use levels and prohibited categories.',
  },
];

const NOT_COVERED = [
  'Provide legal compliance certification',
  'Replace certified toxicological risk assessments',
  'Guarantee that a formulation will pass regulatory review',
  'Cover every jurisdiction or regulatory body worldwide',
];

const WORKFLOW = [
  'Identify your compound: Use the Chemical Simulator or API to look up any compound by name, SMILES, InChI, or CAS number.',
  'Check hazard classification: Review GHS signal words, H-statements, and pictograms. Use the SDS Analyzer to extract data from existing Safety Data Sheets.',
  'Cross-reference regulatory databases: Our tools surface EPA CompTox, ECHA/REACH, and FDA data where available, all with source citations.',
  'Export citation-ready reports: Download results in CSV, JSON, or PDF with full source attribution for your compliance file.',
  'Flag restricted ingredients: Use the Formula Generator to check whether any ingredient in your formulation has known regulatory restrictions before you go to production.',
];

const ENDPOINTS = [
  { method: 'POST', path: '/v1/hazard-score', desc: 'Binary hazard classification with calibrated confidence' },
  { method: 'POST', path: '/v1/interactions', desc: 'Ingredient interaction and compatibility checks' },
  { method: 'POST', path: '/v1/sustainability', desc: 'Environmental impact scoring' },
  { method: 'GET',  path: '/v1/compound',     desc: 'Full compound lookup with regulatory fields' },
];

const TEAL = '#02988C';

export default function ComplianceGuide() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-10 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3 mb-3">
            <ClipboardCheck className="w-7 h-7" style={{ color: TEAL }} />
            <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-[#0A1F1D]">Compliance Guide</h1>
          </div>
          <p className="text-[15px] text-slate-700 leading-[1.7]">
            Suttain helps consumers, formulators, and researchers understand and navigate the regulatory landscape for chemical products. This guide explains what our tools cover, what they do not cover, and how to use them alongside professional regulatory advice.
          </p>
        </div>

        {/* What Suttain Covers */}
        <section className="mb-10">
          <h2 className="flex items-center gap-2.5 text-lg sm:text-xl font-heading font-semibold mb-5" style={{ color: TEAL }}>
            <ClipboardCheck className="w-5 h-5 flex-shrink-0" style={{ color: TEAL }} />
            What Suttain Covers
          </h2>
          <div className="space-y-4 pl-7">
            {COVERAGE.map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <h3 className="text-[15px] font-semibold text-[#0A1F1D] mb-2">{item.title}</h3>
                <p className="text-[14px] text-slate-700 leading-[1.7]">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What Suttain Does Not Cover */}
        <section className="mb-10">
          <h2 className="flex items-center gap-2.5 text-lg sm:text-xl font-heading font-semibold mb-5" style={{ color: TEAL }}>
            <AlertOctagon className="w-5 h-5 flex-shrink-0" style={{ color: TEAL }} />
            What Suttain Does Not Cover
          </h2>
          <div className="pl-7 space-y-3">
            <p className="text-[15px] text-slate-700 leading-[1.7]">
              Suttain provides regulatory information for research and educational purposes. We do not:
            </p>
            <ul className="space-y-1.5">
              {NOT_COVERED.map((item, idx) => (
                <li key={idx} className="text-[15px] text-slate-700 leading-[1.7] flex gap-2">
                  <span className="flex-shrink-0 mt-2 w-1 h-1 rounded-full bg-slate-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-[15px] text-slate-700 leading-[1.7] pt-1">
              For commercial product launches, always consult a qualified regulatory professional or compliance consultant.
            </p>
          </div>
        </section>

        {/* How to Use Suttain for Compliance Workflows */}
        <section className="mb-10">
          <h2 className="flex items-center gap-2.5 text-lg sm:text-xl font-heading font-semibold mb-5" style={{ color: TEAL }}>
            <ListChecks className="w-5 h-5 flex-shrink-0" style={{ color: TEAL }} />
            How to Use Suttain for Compliance Workflows
          </h2>
          <div className="pl-7 space-y-3">
            {WORKFLOW.map((step, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ backgroundColor: TEAL }}>
                  {idx + 1}
                </span>
                <p className="text-[15px] text-slate-700 leading-[1.7] pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* API Access for Compliance Teams */}
        <section className="mb-10">
          <h2 className="flex items-center gap-2.5 text-lg sm:text-xl font-heading font-semibold mb-5" style={{ color: TEAL }}>
            <Code2 className="w-5 h-5 flex-shrink-0" style={{ color: TEAL }} />
            API Access for Compliance Teams
          </h2>
          <div className="pl-7 space-y-4">
            <p className="text-[15px] text-slate-700 leading-[1.7]">
              The Enterprise API provides programmatic access to hazard scoring, regulatory data, and SDS parsing. Compliance teams can integrate Suttain into existing workflows to automatically screen formulations against multiple regulatory frameworks.
            </p>
            <p className="text-[15px] font-semibold text-[#0A1F1D]">Available endpoints:</p>
            <div className="space-y-2">
              {ENDPOINTS.map((ep, idx) => (
                <div key={idx} className="flex items-start gap-3 border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                  <span className="flex-shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: TEAL }}>
                    {ep.method}
                  </span>
                  <div>
                    <code className="text-[13px] font-mono text-[#0A1F1D] font-semibold">{ep.path}</code>
                    <p className="text-[13px] text-slate-600 mt-0.5">{ep.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="flex items-center gap-2.5 text-lg sm:text-xl font-heading font-semibold mb-5" style={{ color: TEAL }}>
            <Mail className="w-5 h-5 flex-shrink-0" style={{ color: TEAL }} />
            Contact
          </h2>
          <div className="pl-7">
            <p className="text-[15px] text-slate-700 leading-[1.7]">
              Questions about compliance features? Email{' '}
              <a href="mailto:contact@suttain.com" className="font-semibold hover:underline" style={{ color: TEAL }}>
                contact@suttain.com
              </a>{' '}
              or explore the Enterprise API page for programmatic access.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}