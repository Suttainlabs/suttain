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
        title="Suttain | Consumer tools · Atomistic Simulation · Drug Design"
        description="Explore consumer and brand tools for safer products, or choose Research for Atomistic Simulation and Drug Design: configure molecular calculations, search biological targets, and organize research with source-backed context."
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