import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Plus, Users, BookOpen, ArrowRight, Layers, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModuleCard from '@/components/classroom/ModuleCard';
import ExperimentCard from '@/components/classroom/ExperimentCard';
import SubmitExperimentModal from '@/components/classroom/SubmitExperimentModal';
import { SUTTAIN_TOOLS } from '@/components/classroom/suttainTools';

export default function StudentLab() {
  const [joinCode, setJoinCode] = useState('');
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [modules, setModules] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [preselectedModule, setPreselectedModule] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const fetchClassrooms = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      if (!user) return;
      const all = await base44.entities.Classroom.list('-created_date', 50);
      const mine = (all || []).filter(cr =>
        cr.roster?.some(s => s.student_email === user.email)
      );
      setClassrooms(mine);
    } catch (err) {
      console.error('Failed to load classrooms:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchModules = useCallback(async () => {
    if (!selectedClassroom) return;
    try {
      const data = await base44.entities.ExperimentModule.filter(
        { classroom_id: selectedClassroom.id, status: 'active' },
        'order', 50
      );
      setModules(data || []);
    } catch (err) {
      console.error('Failed to load modules:', err);
    }
  }, [selectedClassroom]);

  const fetchExperiments = useCallback(async () => {
    if (!selectedClassroom) return;
    try {
      const data = await base44.entities.StudentExperiment.filter(
        { classroom_id: selectedClassroom.id },
        '-submitted_date', 100
      );
      setExperiments(data || []);
    } catch (err) {
      console.error('Failed to load experiments:', err);
    }
  }, [selectedClassroom]);

  useEffect(() => { fetchClassrooms(); }, [fetchClassrooms]);
  useEffect(() => { fetchModules(); }, [fetchModules]);
  useEffect(() => { fetchExperiments(); }, [fetchExperiments]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoining(true);
    setJoinError('');
    try {
      const user = await base44.auth.me();
      const results = await base44.entities.Classroom.filter({ class_code: joinCode.trim().toUpperCase() });
      if (!results || results.length === 0) {
        setJoinError('No classroom found with that code. Check with your teacher.');
        return;
      }
      const cr = results[0];
      const alreadyIn = cr.roster?.some(s => s.student_email === user.email);
      if (alreadyIn) {
        setSelectedClassroom(cr);
        return;
      }
      const updatedRoster = [...(cr.roster || []), {
        student_name: user.full_name || user.email,
        student_email: user.email,
        joined_date: new Date().toISOString()
      }];
      await base44.entities.Classroom.update(cr.id, { roster: updatedRoster });
      await fetchClassrooms();
      setSelectedClassroom({ ...cr, roster: updatedRoster });
      setJoinCode('');
    } catch (err) {
      setJoinError(err.message || 'Failed to join classroom');
    } finally {
      setJoining(false);
    }
  };

  const handleModuleSubmit = (module) => {
    setPreselectedModule(module);
    setShowSubmit(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  // No classroom selected
  if (!selectedClassroom) {
    return (
      <div className="page-wrapper">
        <div className="content-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <FlaskConical className="w-7 h-7 text-violet-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Student Lab</h1>
            </div>
            <p className="text-slate-500 text-sm">Join a classroom with a code from your teacher, then use Suttain tools and submit experiments for grading.</p>
          </motion.div>

          <Card className="bg-white/90 mb-6">
            <CardContent className="p-5">
              <form onSubmit={handleJoin} className="flex items-center gap-2">
                <Input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="Enter class code (e.g. CHEM42)" className="font-mono uppercase" maxLength={6} />
                <Button type="submit" disabled={joining || !joinCode.trim()} className="bg-violet-600 hover:bg-violet-700">
                  {joining ? 'Joining...' : 'Join'} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
              {joinError && <p className="text-xs text-red-500 mt-2">{joinError}</p>}
            </CardContent>
          </Card>

          {classrooms.length > 0 && (
            <>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Your Classrooms</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classrooms.map((cr, i) => (
                  <motion.div key={cr.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="bg-white/90 hover:shadow-lg transition-all cursor-pointer group h-full" onClick={() => setSelectedClassroom(cr)}>
                      <CardContent className="p-5">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center mb-3">
                          <FlaskConical className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-1">{cr.name}</h3>
                        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{cr.description || cr.research_focus || 'No description'}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px] capitalize">{cr.subject?.replace(/_/g, ' ')}</Badge>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Users className="w-3 h-3" /> {cr.roster?.length || 0}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Classroom selected — show modules + tools + experiments
  return (
    <div className="page-wrapper">
      <div className="content-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <button onClick={() => setSelectedClassroom(null)} className="text-xs text-slate-500 hover:text-slate-700 mb-2 flex items-center gap-1">
            ← Your classrooms
          </button>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">{selectedClassroom.name}</h1>
              <p className="text-xs text-slate-500 mt-0.5">Teacher: {selectedClassroom.teacher_name}</p>
            </div>
          </div>
        </motion.div>

        {/* Experiment Modules */}
        {selectedClassroom.research_focus && (
          <Card className="bg-violet-50 border-violet-200 mb-4">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-600 flex-shrink-0" />
                <p className="text-sm text-violet-800"><span className="font-semibold">Research Focus:</span> {selectedClassroom.research_focus}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {modules.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Experiment Modules</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {modules.map((mod, i) => (
                <motion.div key={mod.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <ModuleCard module={mod} isTeacher={false} onSubmitExperiment={handleModuleSubmit} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Suttain Tools */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">All Suttain Tools</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SUTTAIN_TOOLS.map(tool => (
              <a
                key={tool.id}
                href={tool.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 p-3 bg-white/80 border border-slate-200 rounded-lg hover:shadow-sm hover:border-violet-300 transition-all"
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

        {/* My Submissions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">My Submissions</h2>
            <Button onClick={() => { setPreselectedModule(null); setShowSubmit(true); }} size="sm" className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-1" /> Submit Experiment
            </Button>
          </div>

          {experiments.length === 0 ? (
            <Card className="bg-white/80 border-dashed border-2 border-slate-200">
              <CardContent className="p-10 text-center">
                <FlaskConical className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-4">No experiments submitted yet. Use the Suttain tools above, then submit your findings!</p>
                <Button onClick={() => { setPreselectedModule(null); setShowSubmit(true); }} size="sm" className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="w-4 h-4 mr-1" /> Submit Experiment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {experiments.map((exp, i) => (
                <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <ExperimentCard experiment={exp} isTeacher={false} onUpdate={fetchExperiments} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SubmitExperimentModal
        isOpen={showSubmit}
        onClose={() => setShowSubmit(false)}
        classroom={selectedClassroom}
        modules={modules}
        defaultModuleId={preselectedModule?.id || ''}
        onSubmitted={fetchExperiments}
      />
    </div>
  );
}