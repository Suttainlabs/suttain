import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Folder, FlaskConical, TestTube, TrendingUp, ArrowRight, Clock, Leaf } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ProjectCard = ({ project }) => {
  const getProjectIcon = () => {
    if (project.type === 'formula') return FlaskConical;
    if (project.type === 'simulation') return TestTube;
    return Folder;
  };

  const Icon = getProjectIcon();
  const sustainabilityScore = project.sustainability_score || 0;

  return (
    <div className="group relative p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            project.type === 'formula' ? 'bg-violet-100' : 'bg-teal-100'
          }`}>
            <Icon className={`w-5 h-5 ${project.type === 'formula' ? 'text-violet-600' : 'text-teal-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{project.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{project.type === 'formula' ? 'Formula' : 'Simulation'}</p>
          </div>
        </div>
        {project.status && (
          <Badge variant="outline" className="text-xs">
            {project.status}
          </Badge>
        )}
      </div>

      {sustainabilityScore > 0 && (
        <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-green-50 rounded-lg">
          <Leaf className="w-4 h-4 text-green-600" />
          <span className="text-xs font-medium text-green-700">
            {sustainabilityScore}% Sustainable
          </span>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(project.updated_date || project.created_date), { addSuffix: true })}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          asChild
        >
          <Link to={project.type === 'formula' ? `${createPageUrl('generator')}?load=${project.id}` : createPageUrl('Simulator')}>
            Open
            <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default function ProjectsOverview({ formulas = [], simulations = [], isLoading }) {
  // Combine and sort projects by date
  const projects = [
    ...formulas.map(f => ({ ...f, type: 'formula', sustainability_score: f.full_recipe_data?.sustainability?.overall_score })),
    ...simulations.map(s => ({ ...s, type: 'simulation', status: null }))
  ].sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-teal-600" />
            Active Projects
          </div>
          <Badge variant="outline" className="font-normal">
            {projects.length} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {projects.slice(0, 6).map(project => (
                <ProjectCard key={`${project.type}-${project.id}`} project={project} />
              ))}
            </div>
            {projects.length > 6 && (
              <div className="text-center">
                <Button variant="outline" size="sm" asChild>
                  <Link to={createPageUrl('ActivityHistory')}>
                    View All Projects ({projects.length})
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <Folder className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No projects yet</p>
            <p className="text-xs text-slate-400 mt-1">Start creating formulas or running simulations</p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Button size="sm" asChild>
                <Link to={createPageUrl('generator')}>Create Formula</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link to={createPageUrl('Simulator')}>Run Simulation</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}