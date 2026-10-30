import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ResearchHero from '@/components/research/ResearchHero';
import ResearchDataSources from '@/components/research/ResearchDataSources';
import ResearchPrinciples from '@/components/research/ResearchPrinciples';
import ResearchAPIOverview from '@/components/research/ResearchAPIOverview';
import ResearchAudience from '@/components/research/ResearchAudience';
import ResearchWorkflowMap from '@/components/research/ResearchWorkflowMap';
import ResearchProductNav from '@/components/research/ResearchProductNav';
import ResearchProductsMap from '@/components/research/ResearchProductsMap';
import ResearchProductCards from '@/components/research/ResearchProductCards';

export default function ResearchPortal() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const frame = requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [hash]);
  return (
    <div className="research-surface min-h-screen">
      <ResearchProductNav />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
        <ResearchHero />
        <ResearchProductsMap />
        <ResearchProductCards />
        <ResearchWorkflowMap />
        <ResearchDataSources />
        <ResearchPrinciples />
        <ResearchAPIOverview />
        <ResearchAudience />
      </div>
    </div>
  );
}
