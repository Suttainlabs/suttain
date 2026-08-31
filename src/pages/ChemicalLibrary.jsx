import { useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AuthContext from '../components/auth/AuthContext';
import AuthGate from '../components/auth/AuthGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search, Plus, FolderOpen, Trash2, X, ChevronRight,
  FlaskConical, Calendar, Bookmark, Hash, GripVertical
} from 'lucide-react';
import HazardBadge from '../components/shared/HazardBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PROJECT_COLORS = ['#6B3FA0', '#007850', '#00A8C8', '#D4900A', '#C42B2B', '#1A1A2E'];

export default function ChemicalLibrary() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(PROJECT_COLORS[0]);
  const [showAddChemical, setShowAddChemical] = useState(false);
  const [chemicalSearch, setChemicalSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['chemical-projects'],
    queryFn: () => base44.entities.ChemicalProject.filter({}, 'name'),
    enabled: !!user,
  });

  const { data: projectItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['chemical-project-items', selectedProjectId],
    queryFn: () => selectedProjectId
      ? base44.entities.ChemicalProjectItem.filter({ project_id: selectedProjectId }, '-created_date')
      : Promise.resolve([]),
    enabled: !!user && !!selectedProjectId,
  });

  const createProjectMutation = useMutation({
    mutationFn: (data) => base44.entities.ChemicalProject.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['chemical-projects']);
      setShowNewProject(false);
      setNewProjectName('');
      setNewProjectDesc('');
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id) => base44.entities.ChemicalProject.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['chemical-projects']);
      if (selectedProjectId) setSelectedProjectId(null);
    },
  });

  const addChemicalMutation = useMutation({
    mutationFn: (data) => base44.entities.ChemicalProjectItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['chemical-project-items', selectedProjectId]);
      setShowAddChemical(false);
      setChemicalSearch('');
      setSearchResults([]);
    },
  });

  const removeChemicalMutation = useMutation({
    mutationFn: (id) => base44.entities.ChemicalProjectItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['chemical-project-items', selectedProjectId]);
    },
  });

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Search chemicals from the Chemical entity
  useEffect(() => {
    if (!chemicalSearch || chemicalSearch.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await base44.entities.Chemical.filter({
          name: { $ilike: `%${chemicalSearch}%` }
        }, 'name', 15);
        setSearchResults(results || []);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [chemicalSearch]);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    createProjectMutation.mutate({
      name: newProjectName.trim(),
      description: newProjectDesc.trim(),
      color: newProjectColor,
    });
  };

  const handleAddChemical = (chemical) => {
    addChemicalMutation.mutate({
      project_id: selectedProjectId,
      chemical_id: chemical.id || chemical.pubchem_cid || chemical.name,
      chemical_name: chemical.name,
      added_date: new Date().toISOString(),
    });
  };

  return (
    <AuthGate featureName="Chemical Library" featureDescription="Organize your chemicals into project folders.">
      <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Projects</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {projectsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-violet-500 rounded-full animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 px-3">
                <FolderOpen className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No projects yet</p>
              </div>
            ) : (
              <AnimatePresence>
                {projects.map(project => (
                  <motion.button
                    key={project.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                      selectedProjectId === project.id
                        ? 'bg-violet-50 text-violet-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color || PROJECT_COLORS[0] }}
                    />
                    <span className="flex-1 truncate text-sm">{project.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete project "${project.name}"?`)) {
                          deleteProjectMutation.mutate(project.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.button>
                ))}
              </AnimatePresence>
            )}
          </div>

          <div className="p-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs font-semibold"
              onClick={() => setShowNewProject(true)}
            >
              <Plus className="w-3.5 h-3.5" /> New Project
            </Button>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedProject ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-sm">
                <FolderOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-500 mb-2">Chemical Library</h2>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Create project folders to organize your chemicals by research phase, campaign, or therapeutic area.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewProject(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" /> Create First Project
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: selectedProject?.color || PROJECT_COLORS[0] }}
                    />
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">{selectedProject?.name}</h2>
                      {selectedProject?.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{selectedProject.description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="gap-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-700"
                    onClick={() => setShowAddChemical(true)}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Chemicals
                  </Button>
                </div>
              </div>

              {/* Chemical List */}
              <div className="flex-1 overflow-y-auto p-6">
                {itemsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin" />
                  </div>
                ) : projectItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FlaskConical className="w-12 h-12 text-slate-200 mb-3" />
                    <h3 className="text-base font-semibold text-slate-500 mb-1">No chemicals in this project</h3>
                    <p className="text-sm text-slate-400 mb-4 max-w-xs">
                      Search and add chemicals from the library to this project.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddChemical(true)}
                      className="gap-2"
                    >
                      <Search className="w-4 h-4" /> Browse Chemicals
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projectItems.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-4 hover:border-violet-200 hover:shadow-sm transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                          <FlaskConical className="w-5 h-5 text-violet-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-slate-800 truncate">{item.chemical_name}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Hash className="w-3 h-3" /> {item.chemical_id}
                            </span>
                            {item.added_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {new Date(item.added_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeChemicalMutation.mutate(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                          title="Remove from project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      <AnimatePresence>
        {showNewProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setShowNewProject(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-800">New Project</h3>
                <button onClick={() => setShowNewProject(false)} className="p-1 rounded hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Name</label>
                  <Input
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    placeholder="e.g. Kinase Inhibitor Screen"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description (optional)</label>
                  <Input
                    value={newProjectDesc}
                    onChange={e => setNewProjectDesc(e.target.value)}
                    placeholder="Brief description of this research phase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Color</label>
                  <div className="flex gap-2">
                    {PROJECT_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewProjectColor(color)}
                        className={`w-8 h-8 rounded-full transition-all ${
                          newProjectColor === color ? 'ring-2 ring-offset-2 ring-violet-500 scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowNewProject(false)}>Cancel</Button>
                  <Button
                    className="flex-1 bg-violet-600 hover:bg-violet-700"
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim()}
                  >
                    Create Project
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Chemicals Modal */}
      <AnimatePresence>
        {showAddChemical && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setShowAddChemical(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[70vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Add Chemicals to {selectedProject?.name}</h3>
                <button onClick={() => setShowAddChemical(false)} className="p-1 rounded hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={chemicalSearch}
                  onChange={e => setChemicalSearch(e.target.value)}
                  placeholder="Search chemicals by name..."
                  className="pl-9"
                  autoFocus
                />
              </div>

              <div className="flex-1 overflow-y-auto -mx-1 px-1">
                {searching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-slate-200 border-t-violet-500 rounded-full animate-spin" />
                  </div>
                ) : chemicalSearch.length < 2 ? (
                  <p className="text-sm text-slate-400 text-center py-8">Type at least 2 characters to search</p>
                ) : searchResults.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No chemicals found matching "{chemicalSearch}"</p>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map(chemical => (
                      <button
                        key={chemical.id}
                        onClick={() => handleAddChemical(chemical)}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-violet-50 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100">
                          <FlaskConical className="w-4 h-4 text-slate-500 group-hover:text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{chemical.name}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {chemical.cas_number && (
                              <span className="text-xs text-slate-400">{chemical.cas_number}</span>
                            )}
                            {chemical.molecular_formula && (
                              <span className="text-xs text-slate-400">{chemical.molecular_formula}</span>
                            )}
                          </div>
                          <div className="mt-1.5">
                            <HazardBadge safetyLevel={chemical.safety_level} dataSource={chemical.data_source} size="xs" />
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-slate-300 group-hover:text-violet-500 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthGate>
  );
}