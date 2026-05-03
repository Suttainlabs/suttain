import React from "react";
import { Info, Zap, Move, MousePointer, Atom } from "lucide-react";

export default function SandboxInfo({ selectedAtom, stats }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Selected atom info */}
      {selectedAtom && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Selected</p>
          <div className="flex items-center gap-3">
            <span
              className="w-8 h-8 rounded-full ring-2 ring-white/20 flex-shrink-0"
              style={{ backgroundColor: selectedAtom.color }}
            />
            <div>
              <p className="text-sm font-bold text-white">{selectedAtom.label} ({selectedAtom.id})</p>
              <p className="text-xs text-slate-400">Mass: {selectedAtom.mass} u · r: {selectedAtom.radius} Å</p>
              <p className="text-xs text-slate-400">Charge: {selectedAtom.charge > 0 ? "+" : ""}{selectedAtom.charge} e</p>
            </div>
          </div>
        </div>
      )}

      {/* Live stats */}
      {stats && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Stats</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900 rounded-lg p-2">
              <p className="text-slate-500">Kinetic E</p>
              <p className="font-mono font-bold text-cyan-400">{stats.ke.toFixed(2)} eV</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-2">
              <p className="text-slate-500">Avg Speed</p>
              <p className="font-mono font-bold text-amber-400">{stats.avgSpeed.toFixed(2)} Å/fs</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-2">
              <p className="text-slate-500">Bonds</p>
              <p className="font-mono font-bold text-green-400">{stats.bonds}</p>
            </div>
            <div className="bg-slate-900 rounded-lg p-2">
              <p className="text-slate-500">Step</p>
              <p className="font-mono font-bold text-violet-400">{stats.step}</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 space-y-1.5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Controls</p>
        {[
          { IconComp: MousePointer, text: "Click grid to place atom" },
          { IconComp: Move, text: "Right-drag to orbit view" },
          { IconComp: Zap, text: "Scroll to zoom" },
          { IconComp: Info, text: "Click atom to inspect" },
        ].map(({ IconComp, text }) => (
          <div key={text} className="flex items-center gap-2 text-xs text-slate-400">
            <IconComp className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}