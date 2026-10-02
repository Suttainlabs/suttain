import React from 'react';
import SmartChemicalSearch from '@/components/landing/SmartChemicalSearch';

export default function LandingHeroSearch() {
  return <section className="home-hero home-container text-center">
    <h1>One platform. Two ways to work.</h1>
    <p className="home-hero-copy">Scan, test, and formulate safer products, or explore Atomistic Simulation and Drug Design with scientific context from PubChem, ChEMBL, and EPA CompTox. Choose the workspace that fits your question.</p>
    <div className="home-hero-search"><SmartChemicalSearch /></div>
  </section>;
}