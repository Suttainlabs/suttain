import React from "react";

const PARTNERS = ["PubChem", "ChEMBL", "ChEBI", "ChemSpider", "Suttain DB"];

export default function LandingTrustBand() {
  return (
    <section className="home-trust home-container text-center" aria-label="Scientific data sources">
      <p className="home-eyebrow font-mono">Scientific data sources / Not endorsements</p>
      <div className="home-source-row">{PARTNERS.map(p => <span key={p}>{p}</span>)}</div>
      <p className="home-trust-note">130M+ records in PubChem’s compound index. Verify original records before scientific use.</p>
    </section>
  );
}