import React from "react";
import ResearchCategoryPage from "@/components/research/ResearchCategoryPage";
import { RESEARCH_TOOLS } from "@/components/navigation/domainNav";

export default function ResearchSimulation() {
  return (
    <ResearchCategoryPage
      title="Simulation and modeling"
      intro="Run DFT, molecular dynamics and semi-empirical calculations, then compare and revisit every run."
      tools={RESEARCH_TOOLS.filter(t => t.category === "Simulation & Modeling Suite" || t.category === "Workspace")}
    />
  );
}