/**
 * TrajectoryPlayer: MD trajectory playback with RMSD/RMSF plots
 */
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const SPEEDS = [0.25, 0.5, 1, 2, 4];

function generateMockRMSD(frames) {
  let val = 0;
  return Array.from({ length: frames }, (_, i) => {
    val += (Math.random() - 0.48) * 0.08;
    val = Math.max(0, val);
    return { frame: i, rmsd: parseFloat(val.toFixed(3)) };
  });
}

function generateMockRMSF(residues) {
  return Array.from({ length: residues }, (_, i) => ({
    residue: i + 1,
    rmsf: parseFloat((0.5 + Math.random() * 2.5).toFixed(3)),
  }));
}

export default function TrajectoryPlayer({ totalFrames = 100, residueCount = 50, onFrameChange }) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef(null);
  const rmsdData = useRef(generateMockRMSD(totalFrames));
  const rmsfData = useRef(generateMockRMSF(residueCount));

  useEffect(() => {
    if (playing) {
      const delay = 100 / speed;
      intervalRef.current = setInterval(() => {
        setFrame(f => {
          const next = f + 1;
          if (next >= totalFrames) { setPlaying(false); return totalFrames - 1; }
          onFrameChange?.(next);
          return next;
        });
      }, delay);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, speed, totalFrames]);

  const handleRMSDClick = (data) => {
    if (data?.activePayload?.[0]) {
      const f = data.activePayload[0].payload.frame;
      setFrame(f);
      onFrameChange?.(f);
    }
  };

  const progress = totalFrames > 1 ? (frame / (totalFrames - 1)) * 100 : 0;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-bold text-teal-400">Trajectory Player</h3>
        <span className="text-xs text-slate-400">Frame {frame + 1} / {totalFrames}</span>
      </div>

      {/* Scrubber */}
      <div className="px-4 pt-3">
        <input
          type="range" min={0} max={totalFrames - 1} value={frame}
          onChange={e => { const f = Number(e.target.value); setFrame(f); onFrameChange?.(f); }}
          className="w-full accent-teal-500"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-4 pb-3 pt-1">
        <div className="flex items-center gap-1">
          <button onClick={() => { setFrame(0); onFrameChange?.(0); }}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">
            <SkipBack className="w-4 h-4" />
          </button>
          <button onClick={() => { const f = Math.max(0, frame - 1); setFrame(f); onFrameChange?.(f); }}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setPlaying(p => !p)}
            className="p-2 rounded bg-teal-700 hover:bg-teal-600 text-white">
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={() => { setPlaying(false); setFrame(0); onFrameChange?.(0); }}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">
            <Square className="w-4 h-4" />
          </button>
          <button onClick={() => { const f = Math.min(totalFrames - 1, frame + 1); setFrame(f); onFrameChange?.(f); }}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => { setFrame(totalFrames - 1); onFrameChange?.(totalFrames - 1); }}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500">Speed:</span>
          {SPEEDS.map(s => (
            <button key={s} onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                speed === s ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}>
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* RMSD + RMSF plots */}
      <div className="grid grid-cols-2 gap-0 border-t border-slate-700">
        <div className="p-3 border-r border-slate-700">
          <p className="text-xs text-slate-400 mb-2 font-semibold">RMSD (A), click to jump</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={rmsdData.current} onClick={handleRMSDClick} style={{ cursor: 'pointer' }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#334155" />
              <XAxis dataKey="frame" tick={{ fontSize: 9, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', fontSize: 11 }} />
              <ReferenceLine x={frame} stroke="#14b8a6" strokeWidth={1} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="rmsd" stroke="#14b8a6" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="p-3">
          <p className="text-xs text-slate-400 mb-2 font-semibold">RMSF per Residue (A)</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={rmsfData.current}>
              <CartesianGrid strokeDasharray="2 2" stroke="#334155" />
              <XAxis dataKey="residue" tick={{ fontSize: 9, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', fontSize: 11 }} />
              <Line type="monotone" dataKey="rmsf" stroke="#a78bfa" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}