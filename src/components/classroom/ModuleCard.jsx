import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, Sparkles, Archive, Plus, RotateCcw } from 'lucide-react';
import { getToolById } from './suttainTools';

export default function ModuleCard({ module, isTeacher, onArchive, onRestore, onSubmitExperiment }) {
  const tools = (module.tool_ids || []).map(getToolById).filter(Boolean);
  const dueDate = module.due_date ? new Date(module.due_date) : null;
  const isOverdue = dueDate && dueDate < new Date();
  const isArchived = module.status === 'archived';

  return (
    <Card className={`bg-white/90 border-slate-200 transition-shadow ${isArchived ? 'opacity-60' : 'hover:shadow-md'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-slate-900 text-sm">{module.title}</h3>
              {module.is_auto_generated && (
                <Badge className="bg-violet-100 text-violet-600 text-[10px]">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Auto-generated
                </Badge>
              )}
              {isArchived && (
                <Badge className="bg-slate-100 text-slate-500 text-[10px]">Archived</Badge>
              )}
            </div>
            {module.description && (
              <p className="text-xs text-slate-500 line-clamp-2 mb-2">{module.description}</p>
            )}
          </div>
        </div>

        {module.learning_objectives && (
          <div className="mb-3 p-2 bg-teal-50 border border-teal-100 rounded-lg">
            <p className="text-[11px] font-semibold text-teal-600 uppercase tracking-wide mb-0.5">Objectives</p>
            <p className="text-xs text-teal-800 line-clamp-2">{module.learning_objectives}</p>
          </div>
        )}

        <div className="mb-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Tools</p>
          <div className="flex flex-wrap gap-1.5">
            {tools.map(tool => (
              <Link
                key={tool.id}
                to={tool.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-teal-50 hover:border-teal-300 border border-transparent rounded-lg transition-colors"
              >
                <tool.Icon className="w-3 h-3 text-slate-500" />
                <span className="text-[11px] font-medium text-slate-700">{tool.label}</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          {dueDate ? (
            <div className={`flex items-center gap-1 text-[11px] ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>
              <Calendar className="w-3 h-3" />
              {isOverdue ? 'Overdue: ' : 'Due: '}
              {dueDate.toLocaleDateString()}
            </div>
          ) : (
            <span className="text-[11px] text-slate-400">No due date</span>
          )}

          <div className="flex items-center gap-1.5">
            {isTeacher && !isArchived && (
              <Button size="sm" variant="ghost" onClick={() => onArchive?.(module)} className="text-xs h-7 text-slate-500 hover:text-red-600">
                <Archive className="w-3 h-3 mr-1" /> Archive
              </Button>
            )}
            {isTeacher && isArchived && (
              <Button size="sm" variant="ghost" onClick={() => onRestore?.(module)} className="text-xs h-7 text-slate-500 hover:text-teal-600">
                <RotateCcw className="w-3 h-3 mr-1" /> Restore
              </Button>
            )}
            {!isTeacher && module.status === 'active' && (
              <Button size="sm" onClick={() => onSubmitExperiment?.(module)} className="text-xs h-7 bg-violet-600 hover:bg-violet-700">
                <Plus className="w-3 h-3 mr-1" /> Submit Experiment
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}