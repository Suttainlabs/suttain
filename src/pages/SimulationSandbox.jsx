import React, { useState, useRef, useCallback, useEffect } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Atom, ChevronLeft, Info } from "lucide-react";
import { Link } from "react-router-dom";
import SandboxCanvas from "../components/sandbox/SandboxCanvas";
import SandboxControls, { ATOM_TYPES } from "../components/sandbox/SandboxControls";
import SandboxInfo from "../components/sandbox/SandboxInfo";

let _atomIdCounter = 0;
const nextId = () => `atom_${++_atomIdCounter}`;

export default function SimulationSandbox() {
  const [atoms, setAtoms] = useState([]);
  const [selectedAtomType, setSelectedAtomType] = useState(ATOM_TYPES[0]);
  const [gridSize, setGridSize] = useState(12);
  const [isRunning, setIsRunning] = useState(false);
  const [forceType, setForceType] = useState("lj");
  const [temperature, setTemperature] = useState(300);
  const [highlightedId, setHighlightedId] = useState(null);
  const [step, setStep] = useState(0);
  const canvasRef = useRef(null);

  // Live stats (computed from atoms + simulation)
  const [stats, setStats] = useState({ ke: 0, avgSpeed: 0, bonds: 0, step: 0 });

  // Update stats every second while running
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setStep(s => s + 1);
    }, 500);
    return () => clearInterval(id);
  }, [isRunning]);

  useEffect(() => {
    // Derive rough stats from atom count + temperature
    const n = atoms.length;
    const kbT = temperature * 8.617e-5; // eV
    const ke = n > 0 ? (1.5 * n * kbT) : 0;
    const avgSpeed = n > 0 ? Math.sqrt(2 * kbT / (atoms[0]?.type?.mass || 1)) * 1000 : 0;
    // Count bonds: rough estimate from proximity
    let bonds = 0;
    const BOND_DIST = 2.2;
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const d = atoms[i].position.distanceTo(atoms[j].position);
        if (d < BOND_DIST) bonds++;
      }
    }
    setStats({ ke, avgSpeed, bonds, step });
  }, [atoms, temperature, step]);

  const handlePlaceAtom = useCallback((position) => {
    if (!selectedAtomType) return;
    // Prevent duplicate placement at same grid cell
    const occupied = atoms.some(a =>
      Math.abs(a.position.x - position.x) < 0.5 &&
      Math.abs(a.position.z - position.z) < 0.5
    );
    if (occupied) return;

    setAtoms(prev => [...prev, {
      id: nextId(),
      type: selectedAtomType,
      position: position.clone(),
    }]);
  }, [selectedAtomType, atoms]);

  const handleSelectAtom = useCallback((atomId) => {
    setHighlightedId(atomId);
  }, []);

  const handleClear = () => {
    setAtoms([]);
    setIsRunning(false);
    setStep(0);
    setHighlightedId(null);
    _atomIdCounter = 0;
  };

  const handleGridSize = (size) => {
    setGridSize(size);
    setAtoms([]);
    setIsRunning(false);
  };

  const highlightedAtom = atoms.find(a => a.id === highlightedId);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800">
        <Link to="/ComputationalSimulation" className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center flex-shrink-0">
          <Atom className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white leading-tight">3D Simulation Sandbox</h1>
          <p className="text-xs text-slate-400 leading-tight">Interactive atomic placement &amp; real-time physics</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {isRunning && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="flex items-center gap-1.5 bg-green-900/50 border border-green-700 rounded-full px-3 py-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs font-semibold text-green-300">Simulating</span>
            </motion.div>
          )}
          <span className="text-xs text-slate-500 hidden sm:block">
            Right-drag to orbit · Scroll to zoom · Click grid to place
          </span>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* Left panel — controls */}
        <div className="w-56 flex-shrink-0 bg-slate-900 border-r border-slate-800 p-3 overflow-y-auto hidden md:flex flex-col">
          <SandboxControls
            selectedAtom={selectedAtomType}
            onSelectAtom={setSelectedAtomType}
            gridSize={gridSize}
            onGridSize={handleGridSize}
            isRunning={isRunning}
            onToggleRun={() => setIsRunning(r => !r)}
            onClear={handleClear}
            forceType={forceType}
            onForceType={setForceType}
            temperature={temperature}
            onTemperature={setTemperature}
            atomCount={atoms.length}
          />
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <SandboxCanvas
            ref={canvasRef}
            gridSize={gridSize}
            atoms={atoms}
            onPlaceAtom={handlePlaceAtom}
            onSelectAtom={handleSelectAtom}
            selectedAtomType={selectedAtomType}
            isRunning={isRunning}
            forceType={forceType}
            temperature={temperature}
          />

          {/* Empty state overlay */}
          {atoms.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl px-8 py-6 text-center max-w-xs">
                <Atom className="w-10 h-10 text-violet-400 mx-auto mb-3 opacity-70" />
                <p className="text-sm font-semibold text-white mb-1">Place Your First Atom</p>
                <p className="text-xs text-slate-400">Select an element from the left panel, then click anywhere on the grid.</p>
              </div>
            </div>
          )}

          {/* Mobile controls strip */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-800 px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {ATOM_TYPES.slice(0, 5).map(a => (
              <button
                key={a.id}
                onClick={() => setSelectedAtomType(a)}
                className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border transition-colors cursor-pointer ${
                  selectedAtomType?.id === a.id
                    ? "border-violet-500 bg-violet-900/50"
                    : "border-slate-700 bg-slate-800"
                }`}
              >
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: a.color }} />
                <span className="text-[10px] font-bold text-white">{a.id}</span>
              </button>
            ))}
            <div className="flex-shrink-0 ml-auto flex gap-2">
              <button
                onClick={() => setIsRunning(r => !r)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isRunning ? "border-amber-500 bg-amber-900/50 text-amber-300" : "border-violet-500 bg-violet-900/50 text-violet-300"
                }`}
              >
                {isRunning ? "Pause" : "Play"}
              </button>
              <button
                onClick={handleClear}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-600 text-slate-400 bg-slate-800 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Right panel — info */}
        <div className="w-52 flex-shrink-0 bg-slate-900 border-l border-slate-800 p-3 overflow-y-auto hidden lg:block">
          <SandboxInfo
            selectedAtom={highlightedAtom ? highlightedAtom.type : selectedAtomType}
            stats={stats}
          />
        </div>
      </div>
    </div>
  );
}