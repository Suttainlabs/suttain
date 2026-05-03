import React from "react";
import { Atom, Grid3x3, Play, Pause, RotateCcw, Trash2, Zap, Thermometer, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";

const ATOM_TYPES = [
  { id: "H",  label: "Hydrogen",  color: "#ffffff", radius: 0.31, mass: 1,  charge: 0  },
  { id: "C",  label: "Carbon",    color: "#404040", radius: 0.77, mass: 12, charge: 0  },
  { id: "N",  label: "Nitrogen",  color: "#3050f8", radius: 0.75, mass: 14, charge: 0  },
  { id: "O",  label: "Oxygen",    color: "#ff0d0d", radius: 0.73, mass: 16, charge: 0  },
  { id: "Na", label: "Sodium",    color: "#ab5cf2", radius: 1.54, mass: 23, charge: 1  },
  { id: "Cl", label: "Chlorine",  color: "#1ff01f", radius: 0.99, mass: 35, charge: -1 },
  { id: "Fe", label: "Iron",      color: "#e06633", radius: 1.26, mass: 56, charge: 0  },
  { id: "Au", label: "Gold",      color: "#ffd700", radius: 1.44, mass: 197, charge: 0 },
];

const FORCE_TYPES = [
  { id: "lj",       label: "Lennard-Jones", icon: Atom  },
  { id: "coulomb",  label: "Coulomb",       icon: Zap   },
  { id: "gravity",  label: "Gravity",       icon: Wind  },
];

export { ATOM_TYPES };

export default function SandboxControls({
  selectedAtom, onSelectAtom,
  gridSize, onGridSize,
  isRunning, onToggleRun,
  onClear,
  forceType, onForceType,
  temperature, onTemperature,
  atomCount,
}) {
  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Atom className="w-4 h-4 text-violet-400" /> Sandbox Controls
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">{atomCount} atom{atomCount !== 1 ? "s" : ""} placed</p>
      </div>

      {/* Atom Palette */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Place Atom</p>
        <div className="grid grid-cols-2 gap-1.5">
          {ATOM_TYPES.map(a => (
            <button
              key={a.id}
              onClick={() => onSelectAtom(a)}
              aria-label={`Select ${a.label}`}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-colors cursor-pointer text-left ${
                selectedAtom?.id === a.id
                  ? "border-violet-500 bg-violet-900/50 text-white"
                  : "border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500 hover:bg-slate-700/60"
              }`}
            >
              <span
                className="w-4 h-4 rounded-full flex-shrink-0 ring-1 ring-white/20"
                style={{ backgroundColor: a.color }}
              />
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight">{a.id}</p>
                <p className="text-[10px] text-slate-400 truncate leading-tight">{a.label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Size */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Grid3x3 className="w-3.5 h-3.5" /> Grid Size
        </p>
        <div className="flex gap-1.5">
          {[8, 12, 16, 20].map(s => (
            <button
              key={s}
              onClick={() => onGridSize(s)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                gridSize === s
                  ? "border-teal-500 bg-teal-900/50 text-teal-300"
                  : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Force Type */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Interaction Force</p>
        <div className="space-y-1">
          {FORCE_TYPES.map(f => {
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => onForceType(f.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                  forceType === f.id
                    ? "border-amber-500 bg-amber-900/40 text-amber-300"
                    : "border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500"
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Temperature */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5" /> Temperature: {temperature} K
        </p>
        <input
          type="range" min="0" max="1000" step="10"
          value={temperature}
          onChange={e => onTemperature(Number(e.target.value))}
          className="w-full accent-violet-500 cursor-pointer"
          aria-label="Temperature"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>0 K</span><span>500 K</span><span>1000 K</span>
        </div>
      </div>

      {/* Simulation Actions */}
      <div className="mt-auto space-y-2 pt-2 border-t border-slate-700">
        <Button
          onClick={onToggleRun}
          className={`w-full gap-2 font-bold ${
            isRunning
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : "bg-violet-600 hover:bg-violet-700 text-white"
          }`}
        >
          {isRunning ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Simulate</>}
        </Button>
        <Button
          onClick={onClear}
          variant="outline"
          className="w-full gap-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <Trash2 className="w-4 h-4" /> Clear All
        </Button>
      </div>
    </div>
  );
}