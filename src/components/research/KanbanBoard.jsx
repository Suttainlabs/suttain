import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Share2 } from 'lucide-react';

const COLUMNS = [
  { id: 'planning', title: 'Planning', color: '#64748b' },
  { id: 'in_progress', title: 'In Progress', color: '#0D9E8E' },
  { id: 'completed', title: 'Completed', color: '#10b981' },
  { id: 'archived', title: 'Archived', color: '#6B3FA0' },
];

export default function KanbanBoard({ projects, onStatusChange, onNewProject, onShare }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const projectId = result.draggableId;
    const newStatus = result.destination.droppableId;
    if (newStatus === result.source.droppableId) return;
    onStatusChange(projectId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-2 min-h-[300px]">
        {COLUMNS.map((col) => {
          const colProjects = projects.filter((p) => (p.status || 'planning') === col.id);
          return (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-shrink-0 w-64 bg-slate-900/40 border rounded-xl p-3 transition-colors ${
                    snapshot.isDraggingOver
                      ? 'border-violet-500/60 bg-slate-800/60'
                      : 'border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 px-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: col.color }}
                      />
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        {col.title}
                      </span>
                      <span className="text-[10px] text-slate-600 font-semibold">
                        {colProjects.length}
                      </span>
                    </div>
                    <button
                      onClick={onNewProject}
                      className="text-slate-600 hover:text-slate-400 transition-colors"
                      title="New project"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 min-h-[60px]">
                    {colProjects.map((p, index) => (
                      <Draggable key={p.id} draggableId={p.id} index={index}>
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={`bg-slate-800/80 border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-shadow ${
                              snap.isDragging
                                ? 'border-violet-500 shadow-lg shadow-violet-500/20'
                                : 'border-slate-700/60'
                            }`}
                          >
                            <div className="flex items-start gap-2 mb-1.5">
                              <span
                                className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                                style={{ backgroundColor: p.color || '#6B3FA0' }}
                              />
                              <p className="text-xs font-semibold text-slate-200 leading-snug">
                                {p.name}
                              </p>
                            </div>
                            {p.description && (
                              <p className="text-[10px] text-slate-500 leading-snug mb-2 line-clamp-2">
                                {p.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {p.project_type && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-700/60 text-slate-400 font-medium capitalize">
                                    {p.project_type.replace(/_/g, ' ')}
                                  </span>
                                )}
                                {p.tags?.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-700/40 text-slate-500 font-medium"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              {onShare && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); onShare(p); }}
                                  className="p-1 rounded text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors flex-shrink-0"
                                  title="Share project"
                                >
                                  <Share2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {colProjects.length === 0 && !snapshot.isDraggingOver && (
                      <p className="text-[10px] text-slate-700 text-center py-6">
                        Drop projects here
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}