import React from "react";

const PARTNERS = [
  { name: 'PubChem', logo: '/images/data-sources/pubchem.svg' },
  { name: 'ChEMBL', logo: '/images/data-sources/chembl.png', label: 'ChEMBL' },
  { name: 'ChEBI', logo: '/images/data-sources/chebi.svg' },
  { name: 'ChemSpider', logo: '/images/data-sources/chemspider.svg' },
  { name: 'Suttain DB', logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png', label: 'DB' },
];

export default function LandingTrustBand() {
  return (
    <section className="home-trust home-container text-center" aria-label="Scientific data sources">
      <p className="home-eyebrow font-mono">Scientific data sources / Not endorsements</p>
      <div className="home-source-row items-center">{PARTNERS.map(p => <div key={p.name} className="flex items-center justify-center gap-2" aria-label={p.name}>
        <img src={p.logo} alt={p.label ? '' : p.name} className={p.name === 'ChEMBL' ? 'h-10 w-10 object-contain' : 'h-10 w-32 object-contain'} loading="lazy" />
        {p.label && <span>{p.label}</span>}
      </div>)}</div>
      <p className="home-trust-note">130M+ records in PubChem’s compound index. Verify original records before scientific use.</p>
    </section>
  );
}