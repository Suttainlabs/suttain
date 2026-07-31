import React from "react";
import ResearchCategoryPage from "@/components/research/ResearchCategoryPage";
import { RESEARCH_TOOLS } from "@/components/navigation/domainNav";

export default function ResearchMolecules() {
  return (
    <ResearchCategoryPage
      title="Molecules and materials"
      intro="Query compounds, proteins, crystals and their properties from trusted scientific databases."
      tools={RESEARCH_TOOLS.filter(t => t.category === "Molecules & Materials")}
    />
  );
}