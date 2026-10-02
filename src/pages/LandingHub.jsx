import React from "react";
import SEOHead from "@/components/shared/SEOHead";
import LandingHero from "@/components/landing/LandingHero";
import LandingDoors from "@/components/landing/LandingDoors";
import LandingTrustBand from "@/components/landing/LandingTrustBand";
import LandingFeatures from "@/components/landing/LandingFeatures";
import AgentWalkthrough from '@/components/landing/AgentWalkthrough';
import LatestResearch from '@/components/landing/LatestResearch';
import LandingToolkit from "@/components/landing/LandingToolkit";
import LandingFinalCta from "@/components/landing/LandingFinalCta";

export default function LandingHub() {
  return (
    <div className="agent-home min-h-screen bg-background text-foreground font-body">
      <SEOHead
        title="Suttain | Consumer and brand tools · Research workflows"
        description="Two distinct Suttain workspaces: product scanning, formulation and sustainability for consumers and brands; computational chemistry, scientific databases and autonomous workflows for researchers and R&D teams."
      />
      <LandingHero />
      <LandingDoors />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 grid gap-5 md:grid-cols-2 items-stretch">
        <LandingFeatures />
        <LandingToolkit />
      </div>
      <AgentWalkthrough />
      <LatestResearch />
      <LandingTrustBand />
      <LandingFinalCta />
    </div>
  );
}