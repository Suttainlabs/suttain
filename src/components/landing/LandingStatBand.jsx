import React from 'react';
import { HEADLINE } from '@/data/dataSources';

export default function LandingStatBand() {
  return <section className="home-stat-band text-center">
    <div className="home-container">
      <p className="home-stat-number">{HEADLINE.value}</p>
      <p className="font-mono home-stat-label">{HEADLINE.label.toUpperCase()}</p>
      <p className="home-stat-copy">Live connections to public scientific databases ({HEADLINE.note}) support safer product decisions, molecular inputs for Atomistic Simulation, and biological context for Drug Design.</p>
      <div className="home-stat-sources font-mono"><span>PubChem</span><span>ChEMBL</span><span>RCSB PDB</span><span>UniProt</span><span>AlphaFold DB</span></div>
    </div>
  </section>;
}
