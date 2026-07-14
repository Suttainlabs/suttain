import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Users, Lock } from 'lucide-react';
import StudioSidebar from '@/components/studio/StudioSidebar';
import UseCaseSection from '@/components/studio/UseCaseSection';
import RunModeBlock from '@/components/studio/RunModeBlock';
import SingleRunForm from '@/components/studio/SingleRunForm';
import ApiCodeBlock from '@/components/studio/ApiCodeBlock';
import JobPanel from '@/components/studio/JobPanel';
import { UpgradePrompt } from '@/components/studio/StudioShared';
import { BATCH_IMG, PIPELINE_IMG, SINGLE_RUN_IMG } from '@/components/studio/useCaseData';

export default function ComputationalStudio() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('proteins');
  const [activeSection, setActiveSection] = useState('overview');
  const sectionRefs = {
    overview: useRef(null),
    usecases: useRef(null),
    runmodes: useRef(null),
    api: useRef(null),
    jobs: useRef(null),
  };

  const handleSectionChange = (id) => {
    setActiveSection(id);
    sectionRefs[id]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const stats = { tools: 17, sources: 5 };

  return (
    <div className="min-h-screen bg-[#EDF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        <StudioSidebar stats={stats} activeSection={activeSection} onSectionChange={handleSectionChange} />

        <div className="flex-1 min-w-0 space-y-16">
          {/* Hero */}
          <section ref={sectionRefs.overview} className="text-center pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full mb-4">
              <FlaskConical className="w-3.5 h-3.5 text-[#007850]" />
              <span className="text-xs font-semibold text-[#007850] uppercase tracking-wider">Computational Studio</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 max-w-3xl mx-auto leading-tight">
              Design, predict, and analyze molecules and proteins in one workspace
            </h1>
            <p className="text-sm md:text-base text-slate-500 mt-4 max-w-2xl mx-auto">
              A unified computational science platform for structural biology, molecular intelligence, materials, and hazard prediction with full source traceability.
            </p>
          </section>

          {/* Use cases */}
          <section ref={sectionRefs.usecases}>
            <UseCaseSection activeTab={activeTab} onTabChange={setActiveTab} />
          </section>

          {/* Run modes */}
          <section ref={sectionRefs.runmodes} className="space-y-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900">Three Run Modes</h2>
              <p className="text-sm text-slate-500 mt-2">Every tool supports single run, batch workflows, and visual pipelines</p>
            </div>

            {/* Single Run */}
            <div className="space-y-4">
              <RunModeBlock
                title="Single Run"
                description="A clean form for one input: sequence, SMILES, structure ID, or file. Configure settings, run, and get results with visualizations and downloadable output."
                image={SINGLE_RUN_IMG}
                tier="free"
                isReversed={false}
                onOpen={() => document.getElementById('single-run-form')?.scrollIntoView({ behavior: 'smooth' })}
              />
              <div id="single-run-form">
                <SingleRunForm />
              </div>
            </div>

            {/* Batch Workflows */}
            <RunModeBlock
              title="Batch Workflows"
              description="Upload a spreadsheet or paste a list of inputs, pick a tool, and run across all rows in high throughput. Jobs table with per-row status, progress, and bulk download."
              image={BATCH_IMG}
              tier="pro"
              isReversed={true}
              onOpen={() => navigate('/Pricing')}
            />
            <UpgradePrompt feature="Batch workflows" />

            {/* Pipelines */}
            <RunModeBlock
              title="Pipelines"
              description="A visual builder to chain tools so the output of one feeds the next. Fetch structures, filter by a computed score, then run a property calculation. Connect steps, set filter conditions, and run the whole chain."
              image={PIPELINE_IMG}
              tier="pro"
              isReversed={false}
              onOpen={() => navigate('/Pricing')}
            />
            <UpgradePrompt feature="Pipelines" />
          </section>

          {/* API */}
          <section ref={sectionRefs.api}>
            <ApiCodeBlock />
          </section>

          {/* Social proof */}
          <section className="text-center py-8 border-t border-slate-200">
            <div className="inline-flex items-center gap-2 text-slate-500">
              <Users className="w-4 h-4 text-[#007850]" />
              <p className="text-sm">Built for researchers, formulators, and students, from independent labs to institutions.</p>
            </div>
          </section>

          {/* Jobs */}
          <section ref={sectionRefs.jobs}>
            <JobPanel />
          </section>
        </div>
      </div>
    </div>
  );
}