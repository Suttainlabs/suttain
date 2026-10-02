import React from 'react';
import SmartChemicalSearch from '@/components/landing/SmartChemicalSearch';

export default function LandingHeroSearch() {
  return <section className="home-hero home-container text-center">
    <h1>One platform. Two ways to work.</h1>
    <p className="home-hero-copy">Scan, simulate, and formulate safer products, or run molecular research backed by PubChem, ChEMBL, and EPA CompTox. Same engine, either door.</p>
    <div className="home-hero-search"><SmartChemicalSearch /></div>
  </section>;
}