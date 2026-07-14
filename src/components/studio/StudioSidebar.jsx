import React from 'react';
import { LayoutGrid, Boxes, Workflow, Code2, Briefcase, FlaskConical, Database, Layers } from 'lucide-react';
import { StatCard } from './StudioShared';

export default function StudioSidebar({ stats, activeSection, onSectionChange }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'usecases', label: 'Use Cases', icon: Boxes },
    { id: 'runmodes', label: 'Run Modes', icon: Workflow },
    { id: 'api', label: 'API', icon: Code2 },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
  ];

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-60 flex-shrink-0">
      <div className="sticky top-24 space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center flex-shrink-0">
              <FlaskConical className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-800 text-sm leading-tight">Computational</div>
              <div className="font-bold text-slate-800 text-sm leading-tight">Studio</div>
            </div>
          </div>
          <nav className="space-y-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeSection === item.id ? 'bg-violet-100 text-violet-700' : 'text-slate-600 hover:bg-slate-50'
                }`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <StatCard label="Tools" value={stats.tools} icon={FlaskConical} accent="#007850" />
          <StatCard label="Data Sources" value={stats.sources} icon={Database} accent="#6B3FA0" />
          <StatCard label="Run Modes" value="3" icon={Layers} accent="#00A8C8" />
        </div>
      </div>
    </aside>
  );
}