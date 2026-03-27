import React from "react";
import SEOHead, { pageSEO } from "../shared/SEOHead";
import HeroSection from "./HeroSection";
import ToolsShowcase from "./ToolsShowcase";
import BentoGrid from "./BentoGrid";
import AudienceSection from "./AudienceSection";
import HowItWorks from "./HowItWorks";
import TestimonialsSection from "./TestimonialsSection";
import FinalCTA from "./FinalCTA";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead {...pageSEO.home} />
      <HeroSection />
      <ToolsShowcase />
      <BentoGrid />
      <AudienceSection />
      <HowItWorks />
      <TestimonialsSection />
      <FinalCTA />
    </div>
  );
}