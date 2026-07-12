import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { GraduationCap, Plus, Users, FlaskConical, Copy, Check, Search, Layers, ExternalLink, Archive } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import CreateClassroomModal from '@/components/classroom/CreateClassroomModal';
import CreateModuleModal from '@/components/classroom/CreateModuleModal';
import ModuleCard from '@/components/classroom/ModuleCard';
import ExperimentCard from '@/components/classroom/ExperimentCard';
import { SUTTAIN_TOOLS, autoGenerateModules } from '@/components/classroom/suttainTools';

export default function ClassroomDashboard() {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [modules, setModules] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [activeTab, setActiveTab] = useState('modules');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedCode, setCopiedCode] = useState(null);
  const [user, setUser] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const fetchClassrooms = useCallback(async () => {
    try {
      const data = await base44.entities.Classroom.list('-created_date', 50);
      setClassrooms(data || []);
    } catch (err) {
      console.error('Failed to load classrooms:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchModules = useCallback(async () => {
    if (!selectedClassroom) return;
    try {
      let data = await base44.entities.ExperimentModule.filter(
        { classroom_id: selectedClassroom.id }, 'order', 50
      );
      if ((!data || data.length === 0) && user && selectedClassroom.created_by_id === user.id) {
        try {
          await autoGenerateModules(selectedClassroom);
          data = await base44.entities.ExperimentModule.filter(
            { classroom_id: selectedClassroom.id }, 'order', 50
          );
        } catch (e) {
          console.error('Auto-generate failed:', e);
        }
      }
      setModules(data || []);
    } catch (err) {
      console.error('Failed to load modules:', err);
    }
  }, [selectedClassroom, user]);

  const fetchExperiments = useCallback(async () => {
    if (!selectedClassroom) return;
    try {
      const data = await base44.entities.StudentExperiment.filter(
        { classroom_id: selectedClassroom.id }, '-submitted_date', 100
      );
      setExperiments(data || []);
    } catch (err) {
      console.error('Failed to load experiments:', err);
    }
  }, [selectedClassroom]);

  useEffect(() => { fetchClassrooms(); }, [fetchClassrooms]);
  useEffect(() => { fetchModules(); }, [fetchModules]);
  useEffect(() => { fetchExperiments(); }, [fetchExperiments]);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const archiveModule = async (mod) => {
    try {
      await base44.entities.ExperimentModule.update(mod.id, { status: 'archived' });
      toast({ title: 'Module archived', description: `"${mod.title}" has been archived.` });
      fetchModules();
    } catch (err) {
      console.error('Failed to archive module:', err);
      toast({ title: 'Failed to archive', description: err.message, variant: 'destructive' });
    }
  };

  const restoreModule = async (mod) => {
    try {
      await base44.entities.ExperimentModule.update(mod.id, { status: 'active' });
      toast({ title: 'Module restored', description: `"${mod.title}" is now active.` });
      fetchModules();
    } catch (err) {
      console.error('Failed to restore module:', err);
      toast({ title: 'Failed to restore', description: err.message, variant: 'destructive' });
    }
  };

  const filteredExperiments = experiments.filter(exp => {
    const matchesSearch = !searchQuery ||
      exp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.hypothesis?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  // No classroom selected — show list
  if (!selectedClassroom) {
    return (
      <div className="page-wrapper">
        <div className="content-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-7 h-7 text-teal-600" />
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Classroom Research OS</h1>
                </div>
                <p className="text-slate-500 text-sm">Create classrooms, assign experiment modules with Suttain tools, and grade student submissions.</p>
              </div>
              <Button onClick={() => setShowCreate(true)} className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-1.5" /> Create Classroom
              </Button>
            </div>
          </motion.div>

          {classrooms.length === 0 ? (
            <Card className="bg-white/80 border-dashed border-2 border-slate-200">
              <CardContent className="p-12 text-center">
                <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-slate-700 mb-1">No classrooms yet</h3>
                <p className="text-sm text-slate-500 mb-4">Create your first classroom. Experiment modules will be auto-generated with relevant Suttain tools.</p>
                <Button onClick={() => setShowCreate(true)} className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="w-4 h-4 mr-1.5" /> Create Your First Classroom
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {classrooms.map((cr, i) => (
                <motion.div key={cr.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="bg-white/90 hover:shadow-lg transition-all cursor-pointer group h-full" onClick={() => { setSelectedClassroom(cr); setActiveTab('modules'); }}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
                          <FlaskConical className="w-5 h-5 text-white" />
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); copyCode(cr.class_code); }} className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                          {copiedCode === cr.class_code ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                          <span className="text-xs font-mono font-bold text-slate-700">{cr.class_code}</span>
                        </button>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1">{cr.name}</h3>
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{cr.description || 'No description'}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] capitalize">{cr.subject?.replace(/_/g, ' ')}</Badge>
                        <Badge variant="secondary" className="text-[10px] capitalize">{cr.grade_level?.replace(/_/g, ' ')}</Badge>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Users className="w-3 h-3" /> {cr.roster?.length || 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <CreateClassroomModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={(cr) => { fetchClassrooms(); setSelectedClassroom(cr); }} />
      </div>
    );
  }

  // Classroom selected — show modules + submissions with tabs
  return (
    <div className="page-wrapper">
      <div className="content-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <button onClick={() => setSelectedClassroom(null)} className="text-xs text-slate-500 hover:text-slate-700 mb-2 flex items-center gap-1">
            ← All classrooms
          </button>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">{selectedClassroom.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-[10px] capitalize">{selectedClassroom.subject?.replace(/_/g, ' ')}</Badge>
                <Badge variant="secondary" className="text-[10px] capitalize">{selectedClassroom.grade_level?.replace(/_/g, ' ')}</Badge>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Users className="w-3 h-3" /> {selectedClassroom.roster?.length || 0} students
                </div>
                <button onClick={() => copyCode(selectedClassroom.class_code)} className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-lg">
                  {copiedCode === selectedClassroom.class_code ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                  <span className="text-xs font-mono font-bold text-slate-700">{selectedClassroom.class_code}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 mb-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'modules' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5 inline mr-1.5" /> Modules ({modules.length})
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'submissions' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 inline mr-1.5" /> Submissions ({experiments.length})
          </button>
        </div>

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Experiment Modules</h2>
              <Button onClick={() => setShowCreateModule(true)} size="sm" className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-1" /> Create Module
              </Button>
            </div>

            {modules.length === 0 ? (
              <Card className="bg-white/80 border-dashed border-2 border-slate-200">
                <CardContent className="p-8 text-center">
                  <Layers className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 mb-3">No modules yet. Create one to assign tools and experiments to your students.</p>
                  <Button onClick={() => setShowCreateModule(true)} size="sm" className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="w-4 h-4 mr-1" /> Create Module
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  {modules.filter(m => m.status !== 'archived').map((mod, i) => (
                    <motion.div key={mod.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <ModuleCard module={mod} isTeacher={true} onArchive={archiveModule} />
                    </motion.div>
                  ))}
                </div>

                {modules.filter(m => m.status === 'archived').length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700 mb-2"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      {showArchived ? 'Hide' : 'Show'} Archived ({modules.filter(m => m.status === 'archived').length})
                    </button>
                    {showArchived && (
                      <div className="grid gap-3 md:grid-cols-2">
                        {modules.filter(m => m.status === 'archived').map((mod) => (
                          <ModuleCard key={mod.id} module={mod} isTeacher={true} onRestore={restoreModule} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* All Suttain Tools */}
            <div>
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">All Suttain Tools</h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {SUTTAIN_TOOLS.map(tool => (
                  <a
                    key={tool.id}
                    href={tool.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 p-3 bg-white/80 border border-slate-200 rounded-lg hover:shadow-sm hover:border-teal-300 transition-all"
                  >
                    <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center flex-shrink-0">
                      <tool.Icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-700">{tool.label}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{tool.description}</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-300 flex-shrink-0 mt-1" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search experiments..." className="pl-9" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="graded">Graded</option>
                <option value="approved">Approved</option>
                <option value="flagged">Flagged</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {filteredExperiments.length === 0 ? (
              <Card className="bg-white/80 border-dashed border-2 border-slate-200">
                <CardContent className="p-10 text-center">
                  <FlaskConical className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No experiments submitted yet. Share the class code <span className="font-mono font-bold text-slate-700">{selectedClassroom.class_code}</span> with your students.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {filteredExperiments.map((exp, i) => (
                  <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <ExperimentCard experiment={exp} isTeacher={true} onUpdate={fetchExperiments} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <CreateModuleModal
        isOpen={showCreateModule}
        onClose={() => setShowCreateModule(false)}
        classroom={selectedClassroom}
        onCreated={() => fetchModules()}
      />
    </div>
  );
}