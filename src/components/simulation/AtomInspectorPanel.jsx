import React from 'react';
import { X, Atom, Link2, Zap, Circle, Info, Activity } from 'lucide-react';

// Known van der Waals radii (Å) by element
const VDW_RADII = {
  H: 1.20, C: 1.70, N: 1.55, O: 1.52, F: 1.47, P: 1.80, S: 1.80,
  Cl: 1.75, Br: 1.85, I: 1.98, Na: 2.27, K: 2.75, Ca: 2.31, Mg: 1.73,
  Fe: 2.05, Cu: 1.40, Zn: 1.39, Al: 1.84, Si: 2.10, Se: 1.90, As: 1.85,
};

// Covalent radii (Å)
const COVALENT_RADII = {
  H: 0.31, C: 0.76, N: 0.71, O: 0.66, F: 0.57, P: 1.07, S: 1.05,
  Cl: 1.02, Br: 1.20, I: 1.39, Na: 1.66, K: 2.03, Ca: 1.76, Mg: 1.41,
  Fe: 1.32, Cu: 1.32, Zn: 1.22, Al: 1.21, Si: 1.11, Se: 1.20, As: 1.19,
};

// Electronegativity (Pauling scale)
const ELECTRONEGATIVITY = {
  H: 2.20, C: 2.55, N: 3.04, O: 3.44, F: 3.98, P: 2.19, S: 2.58,
  Cl: 3.16, Br: 2.96, I: 2.66, Na: 0.93, K: 0.82, Ca: 1.00, Mg: 1.31,
  Fe: 1.83, Cu: 1.90, Zn: 1.65, Al: 1.61, Si: 1.90, Se: 2.55, As: 2.18,
};

// Atomic masses (g/mol)
const ATOMIC_MASSES = {
  H: 1.008, C: 12.011, N: 14.007, O: 15.999, F: 18.998, P: 30.974, S: 32.06,
  Cl: 35.45, Br: 79.904, I: 126.90, Na: 22.990, K: 39.098, Ca: 40.078, Mg: 24.305,
  Fe: 55.845, Cu: 63.546, Zn: 65.38, Al: 26.982, Si: 28.085, Se: 78.971, As: 74.922,
};

// CPK colors for element bubbles
const CPK_COLORS = {
  H: '#FFFFFF', C: '#404040', N: '#3050F8', O: '#FF0D0D', F: '#90E050',
  P: '#FF8000', S: '#FFFF30', Cl: '#1FF01F', Br: '#A62929', I: '#940094',
  Na: '#AB5CF2', K: '#8F40D4', Ca: '#3DFF00', Mg: '#8AFF00', Fe: '#E06633',
  Cu: '#C88033', Zn: '#7D80B0', Al: '#BFA6A6', Si: '#F0C8A0', DEFAULT: '#888888',
};

function estimatePartialCharge(elem, atomData) {
  // Simple Gasteiger-style approximation using electronegativity
  const en = ELECTRONEGATIVITY[elem] || 2.5;
  // Rough partial charge based on deviation from average EN (2.55 ≈ carbon baseline)
  const delta = ((en - 2.55) * 0.25).toFixed(3);
  return delta >= 0 ? `+${delta}` : `${delta}`;
}

function calcBondLength(atom1, atom2) {
  if (!atom1 || !atom2) return null;
  const dx = atom1.x - atom2.x;
  const dy = atom1.y - atom2.y;
  const dz = atom1.z - atom2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(3);
}

function PropertyRow({ label, value, unit, icon: IconComp, color = 'text-slate-600', highlight = false }) {
  return (
    <div className={`flex items-center justify-between py-1.5 px-2 rounded-lg ${highlight ? 'bg-fuchsia-50/10' : 'hover:bg-slate-800/60'} transition-colors`}>
      <div className="flex items-center gap-1.5">
        {IconComp && <IconComp className={`w-3 h-3 ${color} flex-shrink-0`} />}
        <span className="text-xs text-slate-500 font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className={`text-xs font-bold ${highlight ? 'text-fuchsia-700' : 'text-slate-800'}`}>{value}</span>
        {unit && <span className="text-[10px] text-slate-400">{unit}</span>}
      </div>
    </div>
  );
}

export default function AtomInspectorPanel({ atomData, bondData, onClear }) {
  const hasAtom = !!atomData;
  const hasBond = !!bondData;
  const isEmpty = !hasAtom && !hasBond;

  if (isEmpty) {
    return (
      <div className="bg-slate-900 border-t border-slate-700 px-4 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
          <Atom className="w-4 h-4 text-slate-500" />
        </div>
        <p className="text-xs text-slate-500 italic">
          Click any <span className="text-fuchsia-400 font-semibold">atom</span> or <span className="text-cyan-400 font-semibold">bond</span> in the 3D viewer to inspect its properties
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border-t border-slate-700">
      {/* Inspector header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          {hasAtom ? (
            <>
              <div
                className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0"
                style={{ backgroundColor: CPK_COLORS[atomData.elem] || CPK_COLORS.DEFAULT }}
              />
              <span className="text-xs font-bold text-white">Atom Inspector</span>
              <span className="text-xs text-fuchsia-300 bg-fuchsia-900/50 px-2 py-0.5 rounded-full font-mono">
                {atomData.elem} #{atomData.serial || atomData.index}
              </span>
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span className="text-xs font-bold text-white">Bond Inspector</span>
              <span className="text-xs text-cyan-300 bg-cyan-900/50 px-2 py-0.5 rounded-full font-mono">
                {bondData.atom1?.elem}–{bondData.atom2?.elem}
              </span>
            </>
          )}
        </div>
        <button
          onClick={onClear}
          className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Properties */}
      <div className="px-3 py-2">
        {hasAtom && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-0.5">
            <PropertyRow
              label="Element"
              value={atomData.elem || '?'}
              icon={Atom}
              color="text-fuchsia-400"
              highlight
            />
            <PropertyRow
              label="Residue"
              value={atomData.resn || ':'}
              icon={Info}
              color="text-blue-400"
            />
            <PropertyRow
              label="Chain"
              value={atomData.chain || ':'}
              icon={Activity}
              color="text-green-400"
            />
            <PropertyRow
              label="Atom Serial"
              value={atomData.serial ?? atomData.index ?? ':'}
              icon={Info}
              color="text-slate-400"
            />
            <PropertyRow
              label="vdW Radius"
              value={VDW_RADII[atomData.elem] ?? ':'}
              unit="Å"
              icon={Circle}
              color="text-orange-400"
            />
            <PropertyRow
              label="Covalent Radius"
              value={COVALENT_RADII[atomData.elem] ?? ':'}
              unit="Å"
              icon={Circle}
              color="text-yellow-400"
            />
            <PropertyRow
              label="Atomic Mass"
              value={ATOMIC_MASSES[atomData.elem] ?? ':'}
              unit="g/mol"
              icon={Zap}
              color="text-purple-400"
            />
            <PropertyRow
              label="Electronegativity"
              value={ELECTRONEGATIVITY[atomData.elem] ?? ':'}
              unit="(Pauling)"
              icon={Zap}
              color="text-pink-400"
            />
            <PropertyRow
              label="Partial Charge"
              value={estimatePartialCharge(atomData.elem, atomData)}
              unit="e"
              icon={Zap}
              color="text-red-400"
            />
            <PropertyRow
              label="Position X"
              value={atomData.x != null ? Number(atomData.x).toFixed(3) : ':'}
              unit="Å"
              icon={Info}
              color="text-slate-400"
            />
            <PropertyRow
              label="Position Y"
              value={atomData.y != null ? Number(atomData.y).toFixed(3) : ':'}
              unit="Å"
              icon={Info}
              color="text-slate-400"
            />
            <PropertyRow
              label="Position Z"
              value={atomData.z != null ? Number(atomData.z).toFixed(3) : ':'}
              unit="Å"
              icon={Info}
              color="text-slate-400"
            />
          </div>
        )}

        {hasBond && !hasAtom && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5">
            <PropertyRow
              label="Bond Length"
              value={calcBondLength(bondData.atom1, bondData.atom2) ?? ':'}
              unit="Å"
              icon={Link2}
              color="text-cyan-400"
              highlight
            />
            <PropertyRow
              label="Atom 1"
              value={`${bondData.atom1?.elem || '?'} (${bondData.atom1?.resn || ':'})`}
              icon={Atom}
              color="text-fuchsia-400"
            />
            <PropertyRow
              label="Atom 2"
              value={`${bondData.atom2?.elem || '?'} (${bondData.atom2?.resn || ':'})`}
              icon={Atom}
              color="text-fuchsia-400"
            />
            <PropertyRow
              label="EN Difference"
              value={bondData.atom1?.elem && bondData.atom2?.elem
                ? Math.abs((ELECTRONEGATIVITY[bondData.atom1.elem] || 2.5) - (ELECTRONEGATIVITY[bondData.atom2.elem] || 2.5)).toFixed(2)
                : ':'}
              unit="(Pauling)"
              icon={Zap}
              color="text-pink-400"
            />
            <PropertyRow
              label="Bond Polarity"
              value={(() => {
                if (!bondData.atom1?.elem || !bondData.atom2?.elem) return ':';
                const diff = Math.abs((ELECTRONEGATIVITY[bondData.atom1.elem] || 2.5) - (ELECTRONEGATIVITY[bondData.atom2.elem] || 2.5));
                if (diff < 0.4) return 'Nonpolar';
                if (diff < 1.7) return 'Polar';
                return 'Ionic';
              })()}
              icon={Activity}
              color="text-green-400"
            />
            <PropertyRow
              label="Est. Bond Order"
              value={bondData.order ?? ':'}
              icon={Link2}
              color="text-cyan-400"
            />
          </div>
        )}
      </div>
    </div>
  );
}