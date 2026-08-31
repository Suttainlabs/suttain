import React from "react";
import SEOHead from "@/components/shared/SEOHead";
import LandingHero from "@/components/landing/LandingHero";
import LandingDoors from "@/components/landing/LandingDoors";
import LandingTrustBand from "@/components/landing/LandingTrustBand";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingLoop from "@/components/landing/LandingLoop";
import LandingToolkit from "@/components/landing/LandingToolkit";
import LandingFinalCta from "@/components/landing/LandingFinalCta";

export default function LandingHub() {
  return (
    <div className="min-h-screen bg-white font-body">
      <SEOHead
        title="Suttain, chemical intelligence for consumer safety and professional research"
        description="One platform for chemical safety analysis, formula generation, product scanning, computational simulation, and research-grade API access."
      />
      <LandingHero />
      <LandingDoors />
      <LandingTrustBand />
      <LandingFeatures />
      <LandingLoop />
      <LandingToolkit />
      <LandingFinalCta />
    </div>
  );
}