import React from "react";
import ResearchCategoryPage from "@/components/research/ResearchCategoryPage";
import { RESEARCH_TOOLS } from "@/components/navigation/domainNav";

export default function ResearchSafety() {
  return (
    <ResearchCategoryPage
      title="Safety data"
      intro="Hazard prediction, GHS classification and regulatory context, with confidence scores and sources."
      tools={RESEARCH_TOOLS.filter(t => t.category === "Safety and compliance")}
    />
  );
}