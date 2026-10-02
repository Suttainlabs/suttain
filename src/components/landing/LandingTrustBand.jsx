import React from "react";

const PARTNERS = ["PubChem", "ChEMBL", "ChEBI", "ChemSpider", "Suttain DB"];

export default function LandingTrustBand() {
  return (
    <section className="border-y border-research-border bg-research-soft px-4 py-8 sm:px-6" aria-label="Scientific data sources">
      <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-3 md:items-center">
        <div><p className="text-2xl font-medium">130M+</p><p className="research-label mt-1">Records in PubChem’s compound index</p></div>
        <p className="text-sm text-research-muted">Sources, not a seal of approval. Database labels help you trace a result; verify the original record and references before scientific use.</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">{PARTNERS.map(p => <span key={p} className="text-xs font-mono text-research-text">{p}</span>)}</div>
      </div>
    </section>
  );
}