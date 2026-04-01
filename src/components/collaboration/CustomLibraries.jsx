import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Library, Plus, Search, Trash2, Globe, Lock, Edit2, Beaker } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AuthContext from '../auth/AuthContext';
import { toast } from 'sonner';

export default function CustomLibraries() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingLibrary, setEditingLibrary] = useState(null);
  const [newLibrary, setNewLibrary] = useState({ name: '', description: '', is_public: false, chemicals: [] });
  const [newChemical, setNewChemical] = useState({ name: '', scientific_name: '', notes: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const { data: libraries = [], isLoading } = useQuery({
    queryKey: ['libraries', user?.email],
    queryFn: async () => {
      const all = await base44.entities.CustomLibrary.list();
      return all.filter(l => 
        l.created_by === user?.email || 
        l.shared_with?.includes(user?.email) ||
        l.is_public
      );
    },
    enabled: !!user
  });

  const createLibraryMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomLibrary.create(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries(['libraries']);
      const prev = queryClient.getQueryData(['libraries', user?.email]);
      const optimistic = { ...data, id: `temp_${Date.now()}`, created_by: user?.email };
      queryClient.setQueryData(['libraries', user?.email], old => [...(old || []), optimistic]);
      setShowCreateDialog(false);
      setNewLibrary({ name: '', description: '', is_public: false, chemicals: [] });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      queryClient.setQueryData(['libraries', user?.email], ctx.prev);
      toast.error('Failed to create library');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['libraries']);
      toast.success('Library created!');
    }
  });

  const updateLibraryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CustomLibrary.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['libraries']);
      setEditingLibrary(null);
      toast.success('Library updated!');
    }
  });

  const deleteLibraryMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomLibrary.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries(['libraries']);
      const prev = queryClient.getQueryData(['libraries', user?.email]);
      queryClient.setQueryData(['libraries', user?.email], old => (old || []).filter(l => l.id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      queryClient.setQueryData(['libraries', user?.email], ctx.prev);
      toast.error('Failed to delete library');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['libraries']);
      toast.success('Library deleted');
    }
  });

  const addChemicalToLibrary = () => {
    if (!newChemical.name) return;
    if (editingLibrary) {
      const updatedChemicals = [...(editingLibrary.chemicals || []), newChemical];
      setEditingLibrary({ ...editingLibrary, chemicals: updatedChemicals });
    } else {
      setNewLibrary({ ...newLibrary, chemicals: [...newLibrary.chemicals, newChemical] });
    }
    setNewChemical({ name: '', scientific_name: '', notes: '' });
  };

  const removeChemicalFromLibrary = (index) => {
    if (editingLibrary) {
      const updatedChemicals = editingLibrary.chemicals.filter((_, i) => i !== index);
      setEditingLibrary({ ...editingLibrary, chemicals: updatedChemicals });
    } else {
      setNewLibrary({ ...newLibrary, chemicals: newLibrary.chemicals.filter((_, i) => i !== index) });
    }
  };

  const filteredLibraries = libraries.filter(lib => 
    lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lib.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myLibraries = filteredLibraries.filter(l => l.created_by === user?.email);
  const sharedLibraries = filteredLibraries.filter(l => l.created_by !== user?.email);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center gap-4 flex-wrap">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
              <Plus className="w-4 h-4" /> Create Library
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            <DialogHeader>
              <DialogTitle>Create Chemical Library</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Library name"
                value={newLibrary.name}
                onChange={(e) => setNewLibrary({ ...newLibrary, name: e.target.value })}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newLibrary.description}
                onChange={(e) => setNewLibrary({ ...newLibrary, description: e.target.value })}
              />
              <div className="flex items-center justify-between">
                <Label htmlFor="public-switch">Make library public</Label>
                <Switch
                  id="public-switch"
                  checked={newLibrary.is_public}
                  onCheckedChange={(v) => setNewLibrary({ ...newLibrary, is_public: v })}
                />
              </div>

              {/* Add Chemicals */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Add Chemicals</h4>
                <div className="space-y-2">
                  <Input
                    placeholder="Chemical name"
                    value={newChemical.name}
                    onChange={(e) => setNewChemical({ ...newChemical, name: e.target.value })}
                  />
                  <Input
                    placeholder="Scientific name (optional)"
                    value={newChemical.scientific_name}
                    onChange={(e) => setNewChemical({ ...newChemical, scientific_name: e.target.value })}
                  />
                  <Input
                    placeholder="Notes (optional)"
                    value={newChemical.notes}
                    onChange={(e) => setNewChemical({ ...newChemical, notes: e.target.value })}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addChemicalToLibrary}
                    disabled={!newChemical.name}
                    className="w-full"
                  >
                    Add Chemical
                  </Button>
                </div>

                {/* Chemical List */}
                {newLibrary.chemicals.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {newLibrary.chemicals.map((chem, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{chem.name}</p>
                          {chem.scientific_name && (
                            <p className="text-xs text-slate-500">{chem.scientific_name}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeChemicalFromLibrary(i)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                onClick={() => createLibraryMutation.mutate(newLibrary)}
                disabled={!newLibrary.name || createLibraryMutation.isPending}
                className="w-full"
              >
                {createLibraryMutation.isPending ? 'Creating...' : 'Create Library'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search libraries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* My Libraries */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">My Libraries</h3>
        {myLibraries.length === 0 ? (
          <Card className="bg-white/90">
            <CardContent className="p-8 text-center">
              <Library className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Create your first chemical library</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {myLibraries.map((library) => (
              <LibraryCard 
                key={library.id} 
                library={library} 
                isOwner={true}
                onEdit={() => setEditingLibrary(library)}
                onDelete={() => deleteLibraryMutation.mutate(library.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Shared Libraries */}
      {sharedLibraries.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Shared with You</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {sharedLibraries.map((library) => (
              <LibraryCard key={library.id} library={library} isOwner={false} />
            ))}
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingLibrary} onOpenChange={() => setEditingLibrary(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
          <DialogHeader>
            <DialogTitle>Edit Library</DialogTitle>
          </DialogHeader>
          {editingLibrary && (
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Library name"
                value={editingLibrary.name}
                onChange={(e) => setEditingLibrary({ ...editingLibrary, name: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={editingLibrary.description || ''}
                onChange={(e) => setEditingLibrary({ ...editingLibrary, description: e.target.value })}
              />
              <div className="flex items-center justify-between">
                <Label>Make library public</Label>
                <Switch
                  checked={editingLibrary.is_public}
                  onCheckedChange={(v) => setEditingLibrary({ ...editingLibrary, is_public: v })}
                />
              </div>

              {/* Chemicals */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Chemicals ({editingLibrary.chemicals?.length || 0})</h4>
                <div className="space-y-2 mb-4">
                  <Input
                    placeholder="Chemical name"
                    value={newChemical.name}
                    onChange={(e) => setNewChemical({ ...newChemical, name: e.target.value })}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addChemicalToLibrary}
                    disabled={!newChemical.name}
                    className="w-full"
                  >
                    Add Chemical
                  </Button>
                </div>
                {editingLibrary.chemicals?.map((chem, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg mb-2">
                    <span className="text-sm">{chem.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeChemicalFromLibrary(i)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => updateLibraryMutation.mutate({ id: editingLibrary.id, data: editingLibrary })}
                disabled={updateLibraryMutation.isPending}
                className="w-full"
              >
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LibraryCard({ library, isOwner, onEdit, onDelete }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-white/90 hover:shadow-md transition-shadow h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Library className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">{library.name}</h4>
                <div className="flex items-center gap-1">
                  {library.is_public ? (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Globe className="w-3 h-3" /> Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Lock className="w-3 h-3" /> Private
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {isOwner && (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={onEdit}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={onDelete}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            )}
          </div>
          
          {library.description && (
            <p className="text-sm text-slate-600 mb-3">{library.description}</p>
          )}
          
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Beaker className="w-4 h-4" />
            <span>{library.chemicals?.length || 0} chemicals</span>
          </div>

          {library.chemicals?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {library.chemicals.slice(0, 5).map((chem, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {chem.name}
                </Badge>
              ))}
              {library.chemicals.length > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{library.chemicals.length - 5} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}