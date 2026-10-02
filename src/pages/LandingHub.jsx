import React from "react";
import SEOHead from "@/components/shared/SEOHead";
import LandingHeroSearch from '@/components/landing/LandingHeroSearch';
import LandingPathCards from '@/components/landing/LandingPathCards';
import LandingStatBand from '@/components/landing/LandingStatBand';
import LandingConsumerGrid from '@/components/landing/LandingConsumerGrid';
import LandingResearchGrid from '@/components/landing/LandingResearchGrid';
import LandingWorkflowLoop from '@/components/landing/LandingWorkflowLoop';
import LandingTrustBand from "@/components/landing/LandingTrustBand";
import LandingFinalCta from "@/components/landing/LandingFinalCta";

export default function LandingHub() {
  return (
    <div className="screenshot-home min-h-screen font-body">
      <SEOHead
        title="Suttain | Consumer and brand tools · Research workflows"
        description="Two distinct Suttain workspaces: product scanning, formulation and sustainability for consumers and brands; computational chemistry, scientific databases and autonomous workflows for researchers and R&D teams."
      />
      <LandingHeroSearch />
      <LandingPathCards />
      <LandingStatBand />
      <LandingConsumerGrid />
      <LandingResearchGrid />
      <LandingWorkflowLoop />
      <LandingTrustBand />
      <LandingFinalCta />
    </div>
  );
}