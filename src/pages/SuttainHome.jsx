import React from 'react';
import SEOHead from '@/components/shared/SEOHead';
import HomeNav from '@/components/homepage/HomeNav';
import HomeHero from '@/components/homepage/HomeHero';
import HomeFeatureCards from '@/components/homepage/HomeFeatureCards';

export default function SuttainHome() {
  return (
    <div className="min-h-screen">
      <SEOHead
        title="Suttain — Formula and compliance tools for brands"
        description="Build formulas, check compliance, and get to market with confidence. Formula builder, compliance co-pilot and batch records in one platform."
      />
      <HomeNav />
      <HomeHero />
      <HomeFeatureCards />
    </div>
  );
}