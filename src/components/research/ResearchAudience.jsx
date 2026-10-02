import React from 'react';
import { Users } from 'lucide-react';

export default function ResearchAudience() {
  return <footer className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-8 mt-10 border-t border-research-border text-sm text-research-muted"><Users className="h-4 w-4 shrink-0 text-research-accent" strokeWidth={1.5} /><p>Built for researchers, formulators and students. From independent labs to enterprise teams and institutions.</p></footer>;
}