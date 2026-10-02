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
    <div className="agent-home research-surface min-h-screen bg-research-card">
      <SEOHead
        title="Suttain | Autonomous research workflows and chemical safety"
        description="A workflow agent for computational research: search scientific databases, prepare quantum chemistry and QM/MM inputs, review methods and trace outputs. Plus chemical safety, product scanning and formulation tools."
      />
      <LandingHero />
      <AgentWalkthrough />
      <LatestResearch />
      <LandingTrustBand />
      <LandingDoors />
      <LandingFeatures />
      <LandingToolkit />
      <LandingFinalCta />
    </div>
  );
}