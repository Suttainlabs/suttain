import React from "react";
import ResearchCategoryPage from "@/components/research/ResearchCategoryPage";
import { RESEARCH_TOOLS } from "@/components/navigation/domainNav";

export default function ResearchCompute() {
  return (
    <ResearchCategoryPage
      title="Compute and jobs"
      intro="Queue, monitor and manage long-running computational jobs across your research workloads."
      tools={RESEARCH_TOOLS.filter(t => t.category === "Compute & Jobs")}
    />
  );
}