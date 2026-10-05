import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';
import ComputeEngineDocs from '@/components/enterprise/ComputeEngineDocs';
import ApiKeyPlatform from '@/components/api/ApiKeyPlatform';
import ApiRequestDocs from '@/components/api/ApiRequestDocs';

export default function APIPortal() {
  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Link to="/ResearchPortal" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-8 hover:text-primary"><ArrowLeft className="h-4 w-4" />Research overview</Link>
        <header className="border-b border-border pb-8 mb-8">
          <div className="flex items-center gap-2 text-primary text-sm mb-3"><BookOpen className="h-4 w-4" />Suttain documentation</div>
          <h1 className="font-heading font-medium">Research API</h1>
                     <p className="text-muted-foreground mt-3 max-w-2xl">Secure keys for personal scripts and team notebooks, with Research-premium access to chemical data and supported computational workflows.</p>
        </header>
        <div className="grid lg:grid-cols-[180px_minmax(0,1fr)] gap-8 lg:gap-12">
          <nav aria-label="Documentation sections" className="lg:sticky lg:top-24 self-start flex flex-wrap lg:flex-col gap-2 text-sm">
            <a href="#api-keys" className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary">API keys</a>
            <a href="#api-usage" className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary">Usage</a>
            <a href="#api-requests" className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary">Scripts and notebooks</a>
            <a href="#overview" className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary">Overview</a>
            <a href="#compute-engines" className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary">Engine reference</a>
            <a href="#software-references" className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary">Software citations</a>
          </nav>
          <main className="min-w-0">
            <ApiKeyPlatform />
            <ApiRequestDocs />
            <section id="overview" className="scroll-mt-24 mb-8">
              <h2 className="font-heading font-medium">Overview</h2>
              <p className="text-muted-foreground mt-3">This documentation describes the functions used by Suttain's research workflows. External scripts call the key-authenticated Research API; in-app tools continue to use their authenticated app session. Both remain subject to access and usage limits.</p>
              <p className="text-muted-foreground mt-3">Rowan performs supported hosted quantum-chemistry calculations. Local engines generate input files to run on your own computer or cluster; preparing files does not run a calculation.</p>
            </section>
            <ComputeEngineDocs />
            <p className="text-sm text-muted-foreground border-t border-border pt-6">For Rowan calculations, cite Rowan and the engine, method, basis set and solvent model used. <a href="https://docs.rowansci.com/citations" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">Rowan citation guidance</a> · <a href="https://docs.rowansci.com/api" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">Rowan API reference</a></p>
          </main>
        </div>
      </div>
    </div>
  );
}