import { useState, useContext } from 'react';
import WorkspaceDashboard from '../components/workspace/WorkspaceDashboard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuthContext from '../components/auth/AuthContext';
import AuthGate from '../components/auth/AuthGate';
import FolderSidebar from '../components/workspace/FolderSidebar';
import SessionCard from '../components/workspace/SessionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Pin, LayoutGrid, List, FolderOpen, BarChart2, Library } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Workspace() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('sessions');
  const [folders, setFolders] = useState([]);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['workspace-sessions', user?.role],
    queryFn: () => {
      // Admins see all sessions; regular users see only their own
      if (user?.role === 'admin') {
        return base44.entities.WorkspaceSession.list('-created_date');
      }
      return base44.entities.WorkspaceSession.filter({ created_by: user?.email }, '-created_date');
    },
    enabled: !!user,
  });

  const { data: foldersData = [] } = useQuery({
    queryKey: ['workspace-folders', user?.role],
    queryFn: () => {
      // Admins see all folders; regular users see only their own
      if (user?.role === 'admin') {
        return base44.entities.WorkspaceFolder.list('name');
      }
      return base44.entities.WorkspaceFolder.filter({ created_by: user?.email }, 'name');
    },
    enabled: !!user,
    onSuccess: (data) => setFolders(data),
  });

  const handleDeleteSession = (id) => {
    queryClient.setQueryData(['workspace-sessions'], (old = []) => old.filter(s => s.id !== id));
  };

  const handleUpdateSession = (updated) => {
    queryClient.setQueryData(['workspace-sessions'], (old = []) =>
      old.map(s => s.id === updated.id ? updated : s)
    );
  };

  // Filter & sort
  let filtered = sessions.filter(s => {
    const matchFolder = selectedFolderId === null || s.folder_id === selectedFolderId;
    const matchType = typeFilter === 'all' || s.type === typeFilter;
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchFolder && matchType && matchSearch;
  });

  if (sortBy === 'newest') filtered = [...filtered].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  else if (sortBy === 'oldest') filtered = [...filtered].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  else if (sortBy === 'pinned') filtered = [...filtered].sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));

  const pinned = filtered.filter(s => s.is_pinned);
  const unpinned = filtered.filter(s => !s.is_pinned);

  return (
    <AuthGate featureName="Workspace" featureDescription="Save and organize your analysis sessions.">
      <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
        {/* Sidebar */}
        <FolderSidebar
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onFoldersChange={setFolders}
        />

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
        <div className="bg-white border-b border-slate-200 px-4 flex items-center gap-1 pt-1">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'sessions' ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Sessions
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'dashboard' ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" /> Dashboard
          </button>
          <button
            onClick={() => window.location.href = '/ChemicalLibrary'}
            className="px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 border-transparent text-slate-500 hover:text-slate-700 ml-auto"
          >
            <Library className="w-3.5 h-3.5" /> Chemical Library
          </button>
        </div>

        {/* Toolbar sessions only */}
        {activeTab === 'sessions' && (
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search sessions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="simulation">Simulation</SelectItem>
              <SelectItem value="formula">Formula</SelectItem>
              <SelectItem value="scan">Scan</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="pinned">Pinned first</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 ml-auto">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('grid')}>
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('list')}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="flex-1 overflow-y-auto">
            <WorkspaceDashboard sessions={sessions} />
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FolderOpen className="w-12 h-12 text-slate-200 mb-3" />
                <h3 className="text-base font-semibold text-slate-500 mb-1">No sessions yet</h3>
                <p className="text-sm text-slate-400 max-w-xs">
                  Run a simulation, formula, or scan, then save it to your workspace.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {pinned.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Pin className="w-3.5 h-3.5" /> Pinned
                    </h3>
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                      {pinned.map(session => (
                        <motion.div key={session.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <SessionCard session={session} folders={folders} onDelete={handleDeleteSession} onUpdate={handleUpdateSession} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                {unpinned.length > 0 && (
                  <div>
                    {pinned.length > 0 && (
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">All Sessions</h3>
                    )}
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                      {unpinned.map(session => (
                        <motion.div key={session.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <SessionCard session={session} folders={folders} onDelete={handleDeleteSession} onUpdate={handleUpdateSession} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        </div>
        </div>
        </AuthGate>
        );
        }