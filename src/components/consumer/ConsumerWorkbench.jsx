import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, LayoutGrid, Loader2 } from 'lucide-react';
import { CONSUMER_TOOLS, toolById } from '@/components/consumer/consumerTools';

// Shared shell for the consumer & brand tools, built on the same workbench system as
// Atomistic Simulation (research-surface tokens + simulation-workspace overrides), in Suttain teal.

export function ConsumerToolNav() {
  const { pathname } = useLocation();
  return (
    <div className="sticky top-14 z-30 border-b border-research-border bg-research-page/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-3 sm:gap-5 py-2.5 overflow-x-auto no-scrollbar">
        <Link to="/ConsumerPortal" className="shrink-0 flex items-center gap-2 text-sm font-medium text-research-text"><LayoutGrid className="h-4 w-4 text-research-accent" /><span>Consumer &amp; Brand</span></Link>
        <span className="hidden sm:block h-5 w-px bg-research-border shrink-0" />
        <nav aria-label="Consumer tools" className="flex items-center gap-1">
          {CONSUMER_TOOLS.map(tool => {
            const active = pathname === tool.route || pathname.startsWith(`${tool.route}/`);
            const Icon = tool.icon;
            return (
              <Link key={tool.id} to={tool.route} aria-current={active ? 'page' : undefined}
                className={`shrink-0 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${active ? 'bg-research-soft text-research-accent font-medium' : 'text-research-muted hover:text-research-text'}`}>
                <Icon className="h-3.5 w-3.5" />{tool.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function ConsumerWorkflowHeader({ toolId, tag, children }) {
  const tool = toolById(toolId);
  const Icon = tool.icon;
  return (
    <header className="border-b border-research-border pb-7 mb-7">
      <Link to="/ConsumerPortal" className="inline-flex items-center gap-2 text-sm text-research-muted hover:text-research-accent mb-6"><ArrowLeft className="h-4 w-4" />All consumer tools</Link>
      <div className="grid grid-cols-12 gap-5 items-end">
        <div className="col-span-12 lg:col-span-9">
          <p className="research-label mb-3">Consumer &amp; Brand / Step {tool.step} · {tool.verb}</p>
          <div className="flex items-start gap-4">
            <div className="research-icon bg-research-soft"><Icon className="h-5 w-5" strokeWidth={1.5} /></div>
            <div className="min-w-0"><h1 className="mb-2 !text-2xl sm:!text-3xl">{tool.name}</h1><p className="text-research-muted max-w-2xl">{tool.summary}</p></div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-3 flex lg:justify-end">{tag && <span className="inline-flex rounded border border-research-border bg-research-card px-3 py-2 font-mono text-xs text-research-muted capitalize">{tag}</span>}</div>
      </div>
      {children}
    </header>
  );
}

export default function ConsumerWorkbench({ toolId, tag, headerExtra, children, banner }) {
  return (
    <div className="simulation-workspace research-surface consumer-theme min-h-screen">
      <ConsumerToolNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-12">
        {banner}
        <ConsumerWorkflowHeader toolId={toolId} tag={tag}>{headerExtra}</ConsumerWorkflowHeader>
        {children}
      </div>
    </div>
  );
}

export function ModeTabs({ modes, value, onChange, label = 'Mode' }) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto no-scrollbar border-b border-research-border mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
      {modes.map(({ id, label: text, icon: Icon }) => (
        <button key={id} type="button" role="tab" aria-selected={value === id} onClick={() => onChange(id)}
          className={`shrink-0 inline-flex items-center gap-2 min-h-11 px-4 -mb-px border-b-2 text-sm transition-colors ${value === id ? 'border-research-accent text-research-accent font-medium' : 'border-transparent text-research-muted hover:text-research-text'}`}>
          {Icon && <Icon className="h-4 w-4" />}{text}
        </button>
      ))}
    </div>
  );
}

export function WorkbenchGrid({ children, wide = false }) {
  return <div className={`grid grid-cols-1 gap-6 items-start ${wide ? 'lg:grid-cols-[400px_minmax(0,1fr)]' : 'lg:grid-cols-[360px_minmax(0,1fr)]'}`}>{children}</div>;
}

export function SetupRail({ label = 'Configuration', title = 'Set up your analysis', children, footer }) {
  return (
    <aside className="consumer-setup-rail min-w-0 rounded-xl border border-research-border bg-research-card p-5 self-start lg:sticky lg:top-32 space-y-5">
      <div><p className="research-label mb-1">{label}</p><h2 className="!text-lg">{title}</h2></div>
      {children}
      {footer}
    </aside>
  );
}

export function ResultsRail({ hasOutput, isRunning, runningText = 'Working on it…', emptyTitle = 'Your results will appear here', emptyText, tag, children, emptyExtra }) {
  return (
    <section aria-label="Results" className="min-w-0 space-y-5">
      <div className="flex items-center justify-between gap-3"><h2 className="!text-lg">Results &amp; activity</h2>{tag && <span className="research-label">{tag}</span>}</div>
      {!hasOutput && !isRunning && (
        <div className="rounded-xl border border-dashed border-research-border bg-research-card px-6 py-14 text-center">
          <FileText className="h-7 w-7 text-research-muted mx-auto mb-4" />
          <h3>{emptyTitle}</h3>
          {emptyText && <p className="text-sm text-research-muted mt-2 max-w-md mx-auto">{emptyText}</p>}
          {emptyExtra}
        </div>
      )}
      {isRunning && <div role="status" className="flex items-center gap-3 rounded-xl border border-research-border bg-research-soft p-5 text-sm"><Loader2 className="h-4 w-4 animate-spin text-research-accent" />{runningText}</div>}
      {children}
    </section>
  );
}
