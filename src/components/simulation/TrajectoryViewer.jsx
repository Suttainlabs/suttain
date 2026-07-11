import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Play, Pause, SkipBack, SkipForward, ChevronFirst, ChevronLast,
  Upload, Loader2, Film, Eye, Settings2, RotateCcw, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Load NGL from CDN once
let _nglLoaded = false;
let _nglCallbacks = [];
function loadNGL(cb) {
  if (window.NGL) { cb(); return; }
  _nglCallbacks.push(cb);
  if (_nglLoaded) return;
  _nglLoaded = true;
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/ngl@2.0.0-dev.37/dist/ngl.js";
  script.onload = () => { _nglCallbacks.forEach(fn => fn()); _nglCallbacks = []; };
  script.onerror = () => {
    // Fallback CDN
    const s2 = document.createElement("script");
    s2.src = "https://unpkg.com/ngl@2.0.0-dev.37/dist/ngl.js";
    s2.onload = () => { _nglCallbacks.forEach(fn => fn()); _nglCallbacks = []; };
    document.head.appendChild(s2);
  };
  document.head.appendChild(script);
}

const REPR_STYLES = [
  { label: "Cartoon", value: "cartoon" },
  { label: "Ball+Stick", value: "ball+stick" },
  { label: "Licorice", value: "licorice" },
  { label: "Ribbon", value: "ribbon" },
  { label: "Surface", value: "surface" },
  { label: "Line", value: "line" },
];

const COLOR_SCHEMES = [
  { label: "Chain", value: "chainname" },
  { label: "Element", value: "element" },
  { label: "Residue", value: "resname" },
  { label: "B-Factor", value: "bfactor" },
  { label: "Electrostatic", value: "electrostatic" },
];

export default function TrajectoryViewer({ initialPdbId = null, compact = false }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const structureCompRef = useRef(null);
  const trajCompRef = useRef(null);
  const animFrameRef = useRef(null);

  const [nglReady, setNglReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [loadStatus, setLoadStatus] = useState(null);

  // Trajectory state
  const [frameCount, setFrameCount] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(5); // frames per second
  const [loopMode, setLoopMode] = useState(true);

  // Visual
  const [reprStyle, setReprStyle] = useState("cartoon");
  const [colorScheme, setColorScheme] = useState("chainname");
  const [showSettings, setShowSettings] = useState(false);

  // File inputs
  const [structureFile, setStructureFile] = useState(null);
  const [trajectoryFile, setTrajectoryFile] = useState(null);
  const [pdbIdInput, setPdbIdInput] = useState(initialPdbId || "");

  // Load NGL on mount
  useEffect(() => {
    loadNGL(() => setNglReady(true));
  }, []);

  // Init NGL stage when ready and container is available
  useEffect(() => {
    if (!nglReady || !containerRef.current) return;
    if (stageRef.current) return; // already initialized

    stageRef.current = new window.NGL.Stage(containerRef.current, {
      backgroundColor: "#0f172a",
      tooltip: true,
    });

    // Handle resize
    const ro = new ResizeObserver(() => stageRef.current?.handleResize());
    ro.observe(containerRef.current);
    return () => {
      ro.disconnect();
      stageRef.current?.dispose();
      stageRef.current = null;
    };
  }, [nglReady]);

  // Playback loop
  useEffect(() => {
    if (!isPlaying || !trajCompRef.current) return;
    const interval = 1000 / playSpeed;
    animFrameRef.current = setInterval(() => {
      setCurrentFrame(prev => {
        const next = prev + 1;
        if (next >= frameCount) {
          if (loopMode) { goToFrame(0); return 0; }
          else { setIsPlaying(false); return prev; }
        }
        goToFrame(next);
        return next;
      });
    }, interval);
    return () => clearInterval(animFrameRef.current);
  }, [isPlaying, playSpeed, frameCount, loopMode]);

  const goToFrame = useCallback((frame) => {
    if (!trajCompRef.current) return;
    try {
      trajCompRef.current.trajectory.setFrame(frame);
    } catch (_) {}
  }, []);

  const applyRepresentation = useCallback((comp) => {
    if (!comp) return;
    comp.removeAllRepresentations();
    comp.addRepresentation(reprStyle, {
      colorScheme,
      smoothSheet: true,
    });
    stageRef.current?.autoView();
  }, [reprStyle, colorScheme]);

  // Re-apply repr when settings change
  useEffect(() => {
    if (structureCompRef.current) applyRepresentation(structureCompRef.current);
  }, [reprStyle, colorScheme]);

  // Load from PDB ID (structure only, no trajectory)
  const loadFromPdbId = useCallback(async () => {
    if (!stageRef.current || !pdbIdInput.trim()) return;
    setLoading(true);
    setError(null);
    setLoaded(false);
    setLoadStatus(null);
    try {
      stageRef.current.removeAllComponents();
      structureCompRef.current = null;
      trajCompRef.current = null;

      const comp = await stageRef.current.loadFile(
        `rcsb://${pdbIdInput.trim().toUpperCase()}`,
        { defaultRepresentation: false }
      );
      structureCompRef.current = comp;
      applyRepresentation(comp);
      const pdbAtomCount = comp.structure?.atomCount || 0;
      setFrameCount(0);
      setCurrentFrame(0);
      setLoaded(true);
      console.log(`[TrajectoryViewer] PDB loaded: ${pdbIdInput.trim().toUpperCase()} | atoms=${pdbAtomCount}`);
      setLoadStatus({ type: "info", text: `RCSB structure "${pdbIdInput.trim().toUpperCase()}" loaded (${pdbAtomCount} atoms). No trajectory attached.` });
    } catch (e) {
      setError(`Could not load PDB "${pdbIdInput}": ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [pdbIdInput, applyRepresentation]);

  // Validate structure + trajectory file pair before loading
  const validateFilePair = useCallback((structFile, trajFile) => {
    const validStructExts = ["pdb", "gro", "psf", "mol2", "mmcif", "cif"];
    const validTrajExts = ["xtc", "dcd", "trr", "nc", "trj", "lammpstrj"];
    const structExt = structFile.name.split(".").pop().toLowerCase();
    if (!validStructExts.includes(structExt)) {
      return { ok: false, message: `Unsupported structure format ".${structExt}". Use PDB, GRO, PSF, MOL2, or CIF.` };
    }
    if (trajFile) {
      const trajExt = trajFile.name.split(".").pop().toLowerCase();
      if (!validTrajExts.includes(trajExt)) {
        return { ok: false, message: `Unsupported trajectory format ".${trajExt}". Use XTC, DCD, TRR, or NC.` };
      }
    }
    return { ok: true };
  }, []);

  // Load structure + trajectory files
  const loadTrajectory = useCallback(async () => {
    if (!stageRef.current || !structureFile) return;

    const validation = validateFilePair(structureFile, trajectoryFile);
    if (!validation.ok) {
      setError(validation.message);
      setLoadStatus(null);
      return;
    }

    setLoading(true);
    setError(null);
    setLoaded(false);
    setLoadStatus(null);
    setIsPlaying(false);
    setCurrentFrame(0);

    try {
      stageRef.current.removeAllComponents();
      structureCompRef.current = null;
      trajCompRef.current = null;

      // Load structure as topology — don't force mime type, NGL parses by ext
      const structExt = structureFile.name.split(".").pop().toLowerCase();
      const structBlob = new Blob([await structureFile.arrayBuffer()]);
      const structComp = await stageRef.current.loadFile(structBlob, {
        ext: structExt,
        defaultRepresentation: false,
      });
      structureCompRef.current = structComp;
      applyRepresentation(structComp);

      const atomCount = structComp.structure?.atomCount || 0;
      console.log(`[TrajectoryViewer] Topology loaded: "${structureFile.name}" | ext=${structExt} | atoms=${atomCount}`);

      if (trajectoryFile) {
        const trajExt = trajectoryFile.name.split(".").pop().toLowerCase();
        const trajBlob = new Blob([await trajectoryFile.arrayBuffer()]);

        // Explicitly map trajectory onto the structure's coordinate system
        const trajPlayer = await structComp.addTrajectory(trajBlob, { ext: trajExt });
        trajCompRef.current = structComp;

        // Retrieve frame count from NGL trajectory object
        const trajObj = trajPlayer?.trajectory || structComp.trajList?.[0]?.trajectory;
        const frames = trajObj?.numFrames || trajObj?.frames?.length || 0;
        setFrameCount(frames);

        console.log(`[TrajectoryViewer] Trajectory linked: "${trajectoryFile.name}" | ext=${trajExt} | frames=${frames} | topology atoms=${atomCount}`);

        if (frames === 0) {
          setLoadStatus({ type: "warning", text: `Topology loaded (${atomCount} atoms), but no frames found in "${trajectoryFile.name}". Check that atom counts match.` });
        } else {
          setLoadStatus({ type: "success", text: `Topology: "${structureFile.name}" (${atomCount} atoms) | Trajectory: ${frames} frames from "${trajectoryFile.name}"` });
        }
      } else {
        setFrameCount(0);
        setLoadStatus({ type: "info", text: `Structure loaded: "${structureFile.name}" (${atomCount} atoms). Upload a trajectory file to animate.` });
      }

      stageRef.current.autoView();
      setLoaded(true);
    } catch (e) {
      setError("Failed to load trajectory: " + e.message);
      setLoadStatus(null);
    } finally {
      setLoading(false);
    }
  }, [structureFile, trajectoryFile, applyRepresentation, validateFilePair]);

  const handleFrameSlider = (val) => {
    const f = parseInt(val);
    setCurrentFrame(f);
    goToFrame(f);
  };

  const handleReset = () => {
    if (stageRef.current) {
      stageRef.current.autoView();
    }
  };

  const handleScreenshot = () => {
    if (!stageRef.current) return;
    stageRef.current.makeImage({ factor: 2, antialias: true, trim: false }).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `trajectory_frame_${currentFrame}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className={`bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 flex flex-col ${compact ? "" : ""}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 border-b border-slate-700">
        <Film className="w-4 h-4 text-cyan-400 flex-shrink-0" />
        <span className="text-sm font-semibold text-white">3D Trajectory Viewer</span>
        <span className="text-xs text-slate-400 hidden sm:inline">· NGL Engine · XTC / DCD / TRR / PDB</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={handleReset} title="Reset view" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={handleScreenshot} disabled={!loaded} title="Screenshot" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40">
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettings(v => !v)}
            title="Representation settings"
            className={`p-1.5 rounded-lg transition-colors ${showSettings ? "bg-cyan-700 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700"}`}>
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Style:</span>
            <select value={reprStyle} onChange={e => setReprStyle(e.target.value)}
              className="text-xs bg-slate-700 text-white border border-slate-600 rounded-lg px-2 py-1">
              {REPR_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Color:</span>
            <select value={colorScheme} onChange={e => setColorScheme(e.target.value)}
              className="text-xs bg-slate-700 text-white border border-slate-600 rounded-lg px-2 py-1">
              {COLOR_SCHEMES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Speed:</span>
            <input type="range" min="1" max="30" value={playSpeed}
              onChange={e => setPlaySpeed(Number(e.target.value))}
              className="w-20 accent-cyan-500" />
            <span className="text-xs text-slate-300">{playSpeed} fps</span>
          </div>
          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
            <input type="checkbox" checked={loopMode} onChange={e => setLoopMode(e.target.checked)} className="accent-cyan-500" />
            Loop
          </label>
        </div>
      )}

      {/* Load controls */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 space-y-2">
        {/* PDB ID quick load */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 w-24 flex-shrink-0">PDB ID:</span>
          <input
            value={pdbIdInput}
            onChange={e => setPdbIdInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && loadFromPdbId()}
            placeholder="e.g. 1AKI, 3J3Q…"
            className="flex-1 bg-slate-700 text-white text-xs border border-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-400 placeholder-slate-500"
          />
          <Button size="sm" onClick={loadFromPdbId} disabled={loading || !pdbIdInput.trim()}
            className="h-7 px-3 text-xs bg-cyan-600 hover:bg-cyan-700 text-white flex-shrink-0">
            Load
          </Button>
        </div>

        {/* File upload row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 w-24 flex-shrink-0">Structure:</span>
          <label className="flex-1 flex items-center gap-2 cursor-pointer bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-300 transition-colors">
            <Upload className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{structureFile ? structureFile.name : "Upload .pdb / .gro / .psf"}</span>
            <input type="file" className="hidden" accept=".pdb,.gro,.psf,.mol2,.mmcif,.cif"
              onChange={e => setStructureFile(e.target.files[0] || null)} />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 w-24 flex-shrink-0">Trajectory:</span>
          <label className="flex-1 flex items-center gap-2 cursor-pointer bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-300 transition-colors">
            <Upload className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{trajectoryFile ? trajectoryFile.name : "Upload .xtc / .dcd / .trr / .nc (optional)"}</span>
            <input type="file" className="hidden" accept=".xtc,.dcd,.trr,.nc,.trj,.lammpstrj"
              onChange={e => setTrajectoryFile(e.target.files[0] || null)} />
          </label>
          <Button size="sm" onClick={loadTrajectory} disabled={loading || !structureFile}
            className="h-7 px-3 text-xs bg-violet-600 hover:bg-violet-700 text-white flex-shrink-0">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Load Files"}
          </Button>
        </div>
      </div>

      {/* Load status */}
      {loadStatus && (
        <div className={`px-4 py-2 border-b border-slate-700 text-xs flex items-center gap-2 ${
          loadStatus.type === "success" ? "bg-emerald-900/30 text-emerald-300" :
          loadStatus.type === "warning" ? "bg-amber-900/30 text-amber-300" :
          "bg-slate-800 text-slate-300"
        }`}>
          {loadStatus.text}
        </div>
      )}

      {/* 3D viewport */}
      <div className="relative flex-1" style={{ minHeight: compact ? "280px" : "380px" }}>
        <div ref={containerRef} className="w-full h-full absolute inset-0" />

        {!nglReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            <span className="ml-2 text-xs text-slate-400">Loading NGL engine…</span>
          </div>
        )}

        {loading && nglReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-10">
            <Loader2 className="w-7 h-7 text-cyan-400 animate-spin mb-2" />
            <p className="text-xs text-slate-300">Loading structure{trajectoryFile ? " + trajectory" : ""}…</p>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
            <div className="w-10 h-10 rounded-full bg-red-900/50 flex items-center justify-center mb-2">
              <Eye className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-xs text-red-300 font-medium mb-1">Load error</p>
            <p className="text-xs text-slate-400 max-w-xs">{error}</p>
          </div>
        )}

        {!loading && !error && !loaded && nglReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 pointer-events-none">
            <Film className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-xs text-slate-500">Enter a PDB ID or upload structure/trajectory files above</p>
            <p className="text-xs text-slate-600 mt-1">Supports: PDB · GRO · XTC · DCD · TRR</p>
          </div>
        )}

        {/* Frame counter badge */}
        {loaded && frameCount > 0 && (
          <div className="absolute bottom-2 right-2 z-10 bg-slate-900/80 text-cyan-300 text-[10px] px-2 py-1 rounded-lg font-mono">
            Frame {currentFrame + 1} / {frameCount}
          </div>
        )}
      </div>

      {/* Playback controls */}
      {loaded && frameCount > 0 && (
        <div className="bg-slate-800 border-t border-slate-700 px-4 py-3 space-y-2">
          {/* Slider */}
          <input
            type="range"
            min={0}
            max={frameCount - 1}
            value={currentFrame}
            onChange={e => handleFrameSlider(e.target.value)}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          {/* Buttons */}
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => { setCurrentFrame(0); goToFrame(0); }}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700">
              <ChevronFirst className="w-4 h-4" />
            </button>
            <button onClick={() => { const f = Math.max(0, currentFrame - 1); setCurrentFrame(f); goToFrame(f); }}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={() => setIsPlaying(v => !v)}
              className="w-9 h-9 rounded-full bg-cyan-600 hover:bg-cyan-500 flex items-center justify-center text-white shadow-lg">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button onClick={() => { const f = Math.min(frameCount - 1, currentFrame + 1); setCurrentFrame(f); goToFrame(f); }}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700">
              <SkipForward className="w-4 h-4" />
            </button>
            <button onClick={() => { setCurrentFrame(frameCount - 1); goToFrame(frameCount - 1); }}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700">
              <ChevronLast className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Footer hint */}
      <div className="px-4 py-2 bg-slate-800 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          🖱️ Rotate: left-click drag · Zoom: scroll · Pan: right-click drag · Powered by <span className="text-cyan-400">NGL Viewer</span>
        </p>
      </div>
    </div>
  );
}