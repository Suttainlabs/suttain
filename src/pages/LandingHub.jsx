import React from "react";
import SEOHead from "@/components/shared/SEOHead";
import LandingHero from "@/components/landing/LandingHero";
import LandingDoors from "@/components/landing/LandingDoors";
import LandingTrustBand from "@/components/landing/LandingTrustBand";
import LandingFeatures from "@/components/landing/LandingFeatures";
import AgentWalkthrough from '@/components/landing/AgentWalkthrough';
import LandingToolkit from "@/components/landing/LandingToolkit";
import LandingFinalCta from "@/components/landing/LandingFinalCta";

export default function LandingHub() {
  return (
    <div className="agent-home quiet-home min-h-screen bg-background text-foreground font-body">
      <SEOHead
        title="Suttain | Consumer and brand tools · Research workflows"
        description="Two distinct Suttain workspaces: product scanning, formulation and sustainability for consumers and brands; computational chemistry, scientific databases and autonomous workflows for researchers and R&D teams."
      />
      <LandingHero />
      <LandingDoors />
      <LandingFeatures />
      <LandingToolkit />
      <AgentWalkthrough />
      <LandingTrustBand />
      <LandingFinalCta />
    </div>
  );
}