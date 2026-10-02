import React from "react";

const PARTNERS = ["PubChem", "ChEMBL", "ChEBI", "ChemSpider", "Suttain DB"];

export default function LandingTrustBand() {
  return (
    <section className="quiet-trust quiet-container" aria-label="Scientific data sources">
      <p className="quiet-eyebrow">Scientific data sources / Not endorsements</p>
      <div className="quiet-source-row">{PARTNERS.map(p => <span key={p}>{p}</span>)}</div>
      <p className="quiet-note">130M+ records in PubChem’s compound index. Verify original records before scientific use.</p>
    </section>
  );
}