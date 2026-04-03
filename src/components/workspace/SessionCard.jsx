import { useState } from 'react';
import { Pin, PinOff, Trash2, ExternalLink, Tag, FileText, Folder, MoreVertical, Edit2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const TYPE_CONFIG = {
  simulation: { label: 'Simulation', color: 'bg-teal-100 text-teal-700', route: 'Simulator' },
  formula: { label: 'Formula', color: 'bg-violet-100 text-violet-700', route: 'generator' },
  scan: { label: 'Scan', color: 'bg-cyan-100 text-cyan-700', route: 'BarcodeScanner' },
  compliance: { label: 'Compliance', color: 'bg-orange-100 text-orange-700', route: 'ComplianceCoPilot' },
};

export default function SessionCard({ session, folders, onDelete, onUpdate }) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(session.notes || '');
  const config = TYPE_CONFIG[session.type] || TYPE_CONFIG.simulation;
  const folder = folders.find(f => f.id === session.folder_id);

  const togglePin = async () => {
    const updated = await base44.entities.WorkspaceSession.update(session.id, { is_pinned: !session.is_pinned });
    onUpdate(updated);
  };

  const saveNotes = async () => {
    const updated = await base44.entities.WorkspaceSession.update(session.id, { notes });
    onUpdate(updated);
    setEditingNotes(false);
  };

  const handleDelete = async () => {
    await base44.entities.WorkspaceSession.delete(session.id);
    onDelete(session.id);
  };

  return (
    <Card className={cn('hover:shadow-md transition-all border-slate-200', session.is_pinned && 'ring-2 ring-violet-300')}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', config.color)}>{config.label}</span>
              {session.is_pinned && <Pin className="w-3.5 h-3.5 text-violet-500" />}
              {folder && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Folder className="w-3 h-3" style={{ color: folder.color }}/>
                  {folder.name}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-slate-900 truncate">{session.title}</h3>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={togglePin}>
                {session.is_pinned ? <PinOff className="w-4 h-4 mr-2" /> : <Pin className="w-4 h-4 mr-2" />}
                {session.is_pinned ? 'Unpin' : 'Pin to top'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditingNotes(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit notes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Snapshot Preview */}
        {session.snapshot && Object.keys(session.snapshot).length > 0 && (
          <div className="bg-slate-50 rounded-lg p-3 mb-3 grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(session.snapshot).slice(0, 4).map(([k, v]) => (
              <div key={k} className="text-xs">
                <span className="text-slate-400 capitalize">{k.replace(/_/g, ' ')}: </span>
                <span className="font-medium text-slate-700">{String(v)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {session.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {session.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                <Tag className="w-2.5 h-2.5" />{tag}
              </span>
            ))}
          </div>
        )}

        {/* Notes */}
        {editingNotes ? (
          <div className="space-y-2 mb-3">
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add notes..."
              className="text-sm min-h-[80px]"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveNotes} className="h-7 text-xs bg-violet-600 hover:bg-violet-700">Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingNotes(false)} className="h-7 text-xs">Cancel</Button>
            </div>
          </div>
        ) : notes ? (
          <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2 mb-3 line-clamp-2">
            <FileText className="w-3 h-3 inline mr-1 text-slate-400" />{notes}
          </p>
        ) : null}

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{new Date(session.created_date).toLocaleDateString()}</span>
          <Link to={createPageUrl(config.route)} className="flex items-center gap-1 text-violet-600 hover:text-violet-700 font-medium">
            Open Tool <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}