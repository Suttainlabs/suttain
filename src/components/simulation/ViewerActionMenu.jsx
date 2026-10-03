import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Settings, Play, Pause, SlidersHorizontal, Eye, EyeOff, Image, Maximize, Minimize, ArrowLeft } from 'lucide-react';
import useViewerActions from '@/components/simulation/useViewerActions';
export default function ViewerActionMenu({ viewerRef, viewportRef, ready, hideCH, onHideCH, name, resetKey, viewControls }) {
  const [open, setOpen] = useState(false), [manage, setManage] = useState(false);
  const actions = useViewerActions({ viewerRef, viewportRef, ready, resetKey, name });
  const run = action => { action(); setOpen(false); };
  const rows = [
    { label: actions.rotating ? 'Stop rotation' : 'Rotate structure', icon: actions.rotating ? Pause : Play, action: () => run(actions.rotate) },
    { label: 'Manage molecule view', icon: SlidersHorizontal, action: () => setManage(true) },
    { label: hideCH ? 'Show C–H bonds' : 'Hide C–H bonds', icon: hideCH ? EyeOff : Eye, action: () => run(() => onHideCH(!hideCH)) },
    { label: 'Download PNG', icon: Image, action: () => run(actions.download) }
  ];
  const buttonClass = 'flex h-11 w-11 items-center justify-center rounded-lg border border-research-border bg-research-card text-research-text hover:bg-research-soft disabled:opacity-50';
  return <div className="viewer-action-controls absolute bottom-3 left-3 z-20 font-viewer">
    {actions.error && <p role="alert" className="mb-2 max-w-64 rounded-lg bg-research-card p-3 text-xs text-destructive">{actions.error}</p>}
    <div className="flex gap-2">
      <Popover.Root open={ready && open} onOpenChange={value => { setOpen(value); if (value) setManage(false); }}>
        <Popover.Trigger asChild><button type="button" disabled={!ready} aria-label="Molecule actions" className={buttonClass}><Settings className="h-5 w-5" /></button></Popover.Trigger>
        <Popover.Content side="top" align="start" sideOffset={8} collisionBoundary={viewportRef.current} collisionPadding={8} className="z-50 w-72 max-w-[calc(100vw-2rem)] max-h-[min(70vh,var(--radix-popover-content-available-height))] overflow-y-auto rounded-xl border border-research-accent bg-research-card p-2 text-research-text shadow-lg font-viewer">
          {manage ? <div className="p-2"><button type="button" onClick={() => setManage(false)} className="flex min-h-11 items-center gap-2 text-sm mb-2"><ArrowLeft className="h-4 w-4" />Molecule view</button>{viewControls}</div> : rows.map(({ label, icon: Icon, action }) => <button key={label} type="button" onClick={action} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-research-soft"><Icon className="h-5 w-5 shrink-0" /><span>{label}</span></button>)}
        </Popover.Content>
      </Popover.Root>
      <button type="button" disabled={!ready} onClick={actions.toggleFullscreen} aria-label={actions.fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} className={buttonClass}>{actions.fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}</button>
    </div>
  </div>;
}