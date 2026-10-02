import React from 'react';

export default function LandingStatBand() {
  return <section className="home-stat-band text-center">
    <div className="home-container">
      <p className="home-stat-number">130M+</p>
      <p className="font-mono home-stat-label">CHEMICALS CATALOGUED</p>
      <p className="home-stat-copy">Scientific source records support safer product decisions, molecular inputs for Atomistic Simulation, and biological context for Drug Design.</p>
      <div className="home-stat-sources font-mono"><span>PubChem</span><span>ChEMBL</span><span>EPA CompTox</span><span>RCSB PDB</span></div>
    </div>
  </section>;
}