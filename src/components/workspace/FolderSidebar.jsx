import { useState } from 'react';
import { Folder, FolderOpen, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const FOLDER_COLORS = ['#02988C', '#9531F5', '#09D2FF', '#f97316', '#22c55e', '#ef4444', '#3b82f6', '#a855f7'];

export default function FolderSidebar({ folders, selectedFolderId, onSelectFolder, onFoldersChange }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(FOLDER_COLORS[0]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const folder = await base44.entities.WorkspaceFolder.create({ name: newName.trim(), color: newColor });
    onFoldersChange([...folders, folder]);
    setNewName('');
    setIsCreating(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.WorkspaceFolder.delete(id);
    onFoldersChange(folders.filter(f => f.id !== id));
    if (selectedFolderId === id) onSelectFolder(null);
  };

  const handleEdit = async (folder) => {
    await base44.entities.WorkspaceFolder.update(folder.id, { name: editName });
    onFoldersChange(folders.map(f => f.id === folder.id ? { ...f, name: editName } : f));
    setEditingId(null);
  };

  return (
    <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200">
        <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Folders</h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* All Sessions */}
        <button
          onClick={() => onSelectFolder(null)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            selectedFolderId === null
              ? 'bg-violet-100 text-violet-700'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <FolderOpen className="w-4 h-4" />
          All Sessions
        </button>

        {folders.map(folder => (
          <div key={folder.id} className="group relative">
            {editingId === folder.id ? (
              <div className="flex items-center gap-1 px-2 py-1">
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="h-7 text-xs"
                  onKeyDown={e => e.key === 'Enter' && handleEdit(folder)}
                  autoFocus
                />
                <button onClick={() => handleEdit(folder)} className="text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button>
                <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <button
                onClick={() => onSelectFolder(folder.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedFolderId === folder.id
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <Folder className="w-4 h-4 flex-shrink-0" style={{ color: folder.color || '#02988C' }} />
                <span className="flex-1 text-left truncate">{folder.name}</span>
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={e => { e.stopPropagation(); setEditingId(folder.id); setEditName(folder.name); }}
                    className="p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(folder.id); }}
                    className="p-0.5 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </button>
            )}
          </div>
        ))}
      </nav>

      {/* New Folder */}
      <div className="p-3 border-t border-slate-200">
        {isCreating ? (
          <div className="space-y-2">
            <Input
              placeholder="Folder name..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="h-8 text-sm"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <div className="flex flex-wrap gap-1.5">
              {FOLDER_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={cn('w-5 h-5 rounded-full border-2 transition-all', newColor === c ? 'border-slate-800 scale-110' : 'border-transparent')}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} className="flex-1 h-7 text-xs bg-violet-600 hover:bg-violet-700">Create</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)} className="h-7 text-xs">Cancel</Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="w-full text-slate-500 hover:text-violet-600 text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Folder
          </Button>
        )}
      </div>
    </div>
  );
}