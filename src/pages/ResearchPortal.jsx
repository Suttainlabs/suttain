import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ResearchHero from '@/components/research/ResearchHero';
import ResearchDataSources from '@/components/research/ResearchDataSources';
import ResearchPrinciples from '@/components/research/ResearchPrinciples';
import ResearchComputeCard from '@/components/research/ResearchComputeCard';
import ResearchAPIOverview from '@/components/research/ResearchAPIOverview';
import ResearchAudience from '@/components/research/ResearchAudience';

export default function ResearchPortal() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash !== '#research-api') return;
    const frame = requestAnimationFrame(() => document.getElementById('research-api')?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [hash]);
  return (
    <div className="research-surface min-h-screen">
      <div className="border-b border-research-border bg-research-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
          <span className="research-label">Suttain / Research</span>
          <nav aria-label="Research navigation" className="flex items-center gap-5 text-sm text-research-muted">
            <Link to="/ComputationalStudio" className="hover:text-research-accent">Studio</Link>
            <a href="#research-api" className="hover:text-research-accent">API overview</a>
          </nav>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
        <ResearchHero />
        <ResearchDataSources />
        <ResearchPrinciples />
        <ResearchComputeCard />
        <ResearchAPIOverview />
        <ResearchAudience />
      </div>
    </div>
  );
}