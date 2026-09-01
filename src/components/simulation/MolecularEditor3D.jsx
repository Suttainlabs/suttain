/**
 * MolecularEditor3D: Avogadro/ChimeraX-style interactive molecular editor
 * Built on Three.js for full interactive control: add/delete atoms, bonds,
 * cations/anions, water molecules, separate chains, simulate forces.
 */
import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// ── Element data ────────────────────────────────────────────────────────────
const ELEMENTS = {
  H:  { color: 0xffffff, radius: 0.25, name: "Hydrogen",   mass: 1.008 },
  C:  { color: 0x404040, radius: 0.40, name: "Carbon",     mass: 12.011 },
  N:  { color: 0x3050f8, radius: 0.38, name: "Nitrogen",   mass: 14.007 },
  O:  { color: 0xff0d0d, radius: 0.35, name: "Oxygen",     mass: 15.999 },
  F:  { color: 0x90e050, radius: 0.32, name: "Fluorine",   mass: 18.998 },
  P:  { color: 0xff8000, radius: 0.45, name: "Phosphorus", mass: 30.974 },
  S:  { color: 0xffff30, radius: 0.45, name: "Sulfur",     mass: 32.06  },
  Cl: { color: 0x1ff01f, radius: 0.43, name: "Chlorine",   mass: 35.45  },
  Br: { color: 0xa62929, radius: 0.50, name: "Bromine",    mass: 79.904 },
  I:  { color: 0x940094, radius: 0.55, name: "Iodine",     mass: 126.90 },
  Na: { color: 0xab5cf2, radius: 0.48, name: "Sodium",     mass: 22.99, charge: +1 },
  K:  { color: 0x8f40d4, radius: 0.55, name: "Potassium",  mass: 39.10, charge: +1 },
  Ca: { color: 0x3dff00, radius: 0.52, name: "Calcium",    mass: 40.08, charge: +2 },
  Mg: { color: 0x8aff00, radius: 0.44, name: "Magnesium",  mass: 24.31, charge: +2 },
  Zn: { color: 0x7d80b0, radius: 0.42, name: "Zinc",       mass: 65.38, charge: +2 },
  Fe: { color: 0xe06633, radius: 0.46, name: "Iron",       mass: 55.85 },
  Cu: { color: 0xc88033, radius: 0.44, name: "Copper",     mass: 63.55 },
};

const PRESET_MOLECULES = [
  { name: "Water (H2O)",     atoms: [{ e:"O",x:0,y:0,z:0 },{ e:"H",x:0.96,y:0,z:0 },{ e:"H",x:-0.24,y:0.93,z:0 }], bonds:[[0,1],[0,2]] },
  { name: "Methane (CH4)",   atoms: [{ e:"C",x:0,y:0,z:0 },{ e:"H",x:0.63,y:0.63,z:0.63 },{ e:"H",x:-0.63,y:-0.63,z:0.63 },{ e:"H",x:-0.63,y:0.63,z:-0.63 },{ e:"H",x:0.63,y:-0.63,z:-0.63 }], bonds:[[0,1],[0,2],[0,3],[0,4]] },
  { name: "Ethanol (C2H6O)", atoms: [{ e:"C",x:-0.75,y:0,z:0 },{ e:"C",x:0.75,y:0,z:0 },{ e:"O",x:1.4,y:1.1,z:0 },{ e:"H",x:2.3,y:0.9,z:0 },{ e:"H",x:-1.2,y:1.0,z:0 },{ e:"H",x:-1.2,y:-0.5,z:0.9 },{ e:"H",x:-1.2,y:-0.5,z:-0.9 },{ e:"H",x:1.2,y:-0.5,z:0.9 },{ e:"H",x:1.2,y:-0.5,z:-0.9 }], bonds:[[0,1],[1,2],[2,3],[0,4],[0,5],[0,6],[1,7],[1,8]] },
  { name: "Benzene (C6H6)",  atoms: [{ e:"C",x:1.4,y:0,z:0 },{ e:"C",x:0.7,y:1.21,z:0 },{ e:"C",x:-0.7,y:1.21,z:0 },{ e:"C",x:-1.4,y:0,z:0 },{ e:"C",x:-0.7,y:-1.21,z:0 },{ e:"C",x:0.7,y:-1.21,z:0 },{ e:"H",x:2.5,y:0,z:0 },{ e:"H",x:1.25,y:2.16,z:0 },{ e:"H",x:-1.25,y:2.16,z:0 },{ e:"H",x:-2.5,y:0,z:0 },{ e:"H",x:-1.25,y:-2.16,z:0 },{ e:"H",x:1.25,y:-2.16,z:0 }], bonds:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]] },
  { name: "Ammonia (NH3)",   atoms: [{ e:"N",x:0,y:0,z:0 },{ e:"H",x:0.94,y:0,z:-0.33 },{ e:"H",x:-0.47,y:0.82,z:-0.33 },{ e:"H",x:-0.47,y:-0.82,z:-0.33 }], bonds:[[0,1],[0,2],[0,3]] },
];

const CATIONS = [
  { symbol:"Na+", elem:"Na", charge:+1, color:"bg-purple-600" },
  { symbol:"K+",  elem:"K",  charge:+1, color:"bg-purple-800" },
  { symbol:"Ca²⁺",elem:"Ca", charge:+2, color:"bg-green-600" },
  { symbol:"Mg²⁺",elem:"Mg", charge:+2, color:"bg-lime-600" },
  { symbol:"Zn²⁺",elem:"Zn", charge:+2, color:"bg-slate-600" },
];
const ANIONS = [
  { symbol:"Cl⁻",  elem:"Cl", charge:-1, color:"bg-green-500" },
  { symbol:"F⁻",   elem:"F",  charge:-1, color:"bg-yellow-600" },
  { symbol:"Br⁻",  elem:"Br", charge:-1, color:"bg-red-800" },
  { symbol:"I⁻",   elem:"I",  charge:-1, color:"bg-violet-800" },
];

let atomIdCounter = 1;

export default function MolecularEditor3D() {
  const mountRef    = useRef(null);
  const sceneRef    = useRef(null);
  const cameraRef   = useRef(null);
  const rendererRef = useRef(null);
  const raycasterRef= useRef(new THREE.Raycaster());
  const mouseRef    = useRef(new THREE.Vector2());
  const frameRef    = useRef(null);

  // Orbit state
  const isDragging  = useRef(false);
  const isRightDrag = useRef(false);
  const lastMouse   = useRef({ x:0, y:0 });
  const theta       = useRef(0);
  const phi         = useRef(Math.PI / 3);
  const radius      = useRef(12);
  const panOffset   = useRef(new THREE.Vector3());

  // Molecule state
  const [atoms, setAtoms]         = useState([]);
  const [bonds, setBonds]         = useState([]);
  const [selectedId, setSelectedId]= useState(null);
  const [tool, setTool]           = useState("select"); // select | add | delete | bond
  const [addElement, setAddElement]= useState("C");
  const [bondStart, setBondStart] = useState(null);
  const [chains, setChains]       = useState(["A"]);
  const [atomChain, setAtomChain] = useState({}); // atomId -> chain
  const [log, setLog]             = useState([]);
  const [simRunning, setSimRunning]= useState(false);
  const [simStep, setSimStep]     = useState(0);
  const simRef                    = useRef(null);
  const atomsRef                  = useRef(atoms);
  const bondsRef                  = useRef(bonds);

  atomsRef.current = atoms;
  bondsRef.current = bonds;

  const pushLog = (msg) => setLog(prev => [msg, ...prev].slice(0, 40));

  // ── Three.js setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    const W = mountRef.current.clientWidth;
    const H = mountRef.current.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);
    sceneRef.current = scene;

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x1e293b, 0x1e293b);
    grid.position.y = -3;
    scene.add(grid);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(5, 10, 7);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0x8888ff, 0.3);
    fill.position.set(-5, -5, -5);
    scene.add(fill);

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 500);
    cameraRef.current = camera;
    updateCamera();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = mountRef.current?.clientWidth || W;
      const h = mountRef.current?.clientHeight || H;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  const updateCamera = () => {
    if (!cameraRef.current) return;
    const r = radius.current;
    const t = theta.current;
    const p = phi.current;
    cameraRef.current.position.set(
      r * Math.sin(p) * Math.cos(t),
      r * Math.cos(p),
      r * Math.sin(p) * Math.sin(t)
    );
    cameraRef.current.position.add(panOffset.current);
    cameraRef.current.lookAt(panOffset.current);
  };

  // ── Rebuild scene when atoms/bonds change ───────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old atom/bond meshes
    const toRemove = [];
    scene.children.forEach(c => {
      if (c.userData.isMolPart) toRemove.push(c);
    });
    toRemove.forEach(c => scene.remove(c));

    // Atom spheres
    atoms.forEach(atom => {
      const el = ELEMENTS[atom.elem] || ELEMENTS.C;
      const geo = new THREE.SphereGeometry(el.radius * 0.8, 24, 24);
      const isSelected = atom.id === selectedId;
      const mat = new THREE.MeshPhongMaterial({
        color: isSelected ? 0x00ffff : el.color,
        emissive: isSelected ? 0x004444 : 0x000000,
        shininess: 80,
        opacity: 1,
        transparent: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(atom.x, atom.y, atom.z);
      mesh.userData = { isMolPart: true, atomId: atom.id };
      mesh.castShadow = true;
      scene.add(mesh);

      // Chain color ring
      if (atomChain[atom.id]) {
        const chainColors = { A: 0x00ff88, B: 0xff6600, C: 0x0088ff, D: 0xff00ff };
        const c = chainColors[atomChain[atom.id]] || 0xffffff;
        const ringGeo = new THREE.TorusGeometry(el.radius * 0.9, 0.05, 8, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: c });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(atom.x, atom.y, atom.z);
        ring.userData = { isMolPart: true };
        scene.add(ring);
      }

      // Charge label indicator
      if (atom.charge && atom.charge !== 0) {
        const sp = new THREE.SphereGeometry(0.15, 8, 8);
        const cm = new THREE.MeshBasicMaterial({ color: atom.charge > 0 ? 0xff4444 : 0x4444ff });
        const cs = new THREE.Mesh(sp, cm);
        cs.position.set(atom.x + el.radius, atom.y + el.radius, atom.z);
        cs.userData = { isMolPart: true };
        scene.add(cs);
      }
    });

    // Bonds as cylinders
    bonds.forEach(b => {
      const a0 = atoms.find(a => a.id === b[0]);
      const a1 = atoms.find(a => a.id === b[1]);
      if (!a0 || !a1) return;
      const p0 = new THREE.Vector3(a0.x, a0.y, a0.z);
      const p1 = new THREE.Vector3(a1.x, a1.y, a1.z);
      const dir = new THREE.Vector3().subVectors(p1, p0);
      const len = dir.length();
      const mid = new THREE.Vector3().addVectors(p0, p1).multiplyScalar(0.5);
      const geo = new THREE.CylinderGeometry(0.08, 0.08, len, 8);
      const mat = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, shininess: 40 });
      const cyl = new THREE.Mesh(geo, mat);
      cyl.position.copy(mid);
      cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.normalize());
      cyl.userData = { isMolPart: true };
      scene.add(cyl);
    });

    // Bond-start highlight
    if (bondStart !== null) {
      const ba = atoms.find(a => a.id === bondStart);
      if (ba) {
        const geo = new THREE.SphereGeometry(0.65, 16, 16);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
        const m = new THREE.Mesh(geo, mat);
        m.position.set(ba.x, ba.y, ba.z);
        m.userData = { isMolPart: true };
        scene.add(m);
      }
    }
  }, [atoms, bonds, selectedId, atomChain, bondStart]);

  // ── Mouse events ────────────────────────────────────────────────────────────
  const getAtomAtMouse = useCallback((e) => {
    const rect = mountRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const meshes = sceneRef.current.children.filter(c => c.userData.atomId !== undefined);
    const hits = raycasterRef.current.intersectObjects(meshes);
    return hits.length > 0 ? hits[0].object.userData.atomId : null;
  }, []);

  const get3DPosition = useCallback((e) => {
    const rect = mountRef.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const my = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const ray = new THREE.Raycaster();
    ray.setFromCamera({ x: mx, y: my }, cameraRef.current);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const target = new THREE.Vector3();
    ray.ray.intersectPlane(plane, target);
    return target;
  }, []);

  const onMouseDown = useCallback((e) => {
    if (e.button === 2) { isRightDrag.current = true; isDragging.current = true; }
    else isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };

    if (e.button !== 0) return;

    const hitId = getAtomAtMouse(e);

    if (tool === "select") {
      setSelectedId(hitId);
    } else if (tool === "delete" && hitId !== null) {
      setAtoms(prev => prev.filter(a => a.id !== hitId));
      setBonds(prev => prev.filter(b => b[0] !== hitId && b[1] !== hitId));
      setAtomChain(prev => { const n={...prev}; delete n[hitId]; return n; });
      pushLog(`Deleted atom #${hitId}`);
      setSelectedId(null);
    } else if (tool === "add" && hitId === null) {
      const pos = get3DPosition(e);
      if (pos) {
        const id = atomIdCounter++;
        const el = ELEMENTS[addElement] || ELEMENTS.C;
        const newAtom = { id, elem: addElement, x: pos.x, y: 0, z: pos.z, charge: el.charge || 0 };
        setAtoms(prev => [...prev, newAtom]);
        pushLog(`Added ${addElement} atom #${id}`);
      }
    } else if (tool === "bond") {
      if (hitId !== null) {
        setBondStart(prev => {
          if (prev === null) return hitId;
          if (prev === hitId) return null;
          // Add bond
          const exists = bondsRef.current.some(b => (b[0]===prev&&b[1]===hitId)||(b[0]===hitId&&b[1]===prev));
          if (!exists) {
            setBonds(pb => [...pb, [prev, hitId]]);
            pushLog(`Bonded #${prev}: #${hitId}`);
          }
          return null;
        });
      }
    }
  }, [tool, addElement, getAtomAtMouse, get3DPosition]);

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };

    if (isRightDrag.current) {
      // Pan
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();
      cameraRef.current.getWorldDirection(right);
      right.cross(cameraRef.current.up).normalize();
      up.copy(cameraRef.current.up).normalize();
      panOffset.current.addScaledVector(right, -dx * 0.02);
      panOffset.current.addScaledVector(up, dy * 0.02);
    } else {
      // Orbit
      theta.current -= dx * 0.01;
      phi.current   = Math.max(0.1, Math.min(Math.PI - 0.1, phi.current + dy * 0.01));
    }
    updateCamera();
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    isRightDrag.current = false;
  }, []);

  const onWheel = useCallback((e) => {
    radius.current = Math.max(2, Math.min(50, radius.current + e.deltaY * 0.02));
    updateCamera();
  }, []);

  // ── Molecule loading ────────────────────────────────────────────────────────
  const loadPreset = (preset) => {
    const base = atomIdCounter;
    const newAtoms = preset.atoms.map((a, i) => ({ id: base + i, elem: a.e, x: a.x, y: a.y, z: a.z, charge: 0 }));
    atomIdCounter += preset.atoms.length;
    const newBonds = preset.bonds.map(b => [base + b[0], base + b[1]]);
    setAtoms(newAtoms);
    setBonds(newBonds);
    setAtomChain({});
    setSelectedId(null);
    setBondStart(null);
    pushLog(`Loaded preset: ${preset.name}`);
  };

  const clearAll = () => {
    setAtoms([]);
    setBonds([]);
    setAtomChain({});
    setSelectedId(null);
    setBondStart(null);
    pushLog("Cleared scene");
  };

  // ── Add ion ─────────────────────────────────────────────────────────────────
  const addIon = (elem, charge) => {
    const id = atomIdCounter++;
    const angle = Math.random() * Math.PI * 2;
    const r = 3 + Math.random() * 2;
    setAtoms(prev => [...prev, { id, elem, x: Math.cos(angle)*r, y: 0, z: Math.sin(angle)*r, charge }]);
    pushLog(`Added ${elem} ion (charge ${charge > 0 ? '+' : ''}${charge})`);
  };

  // ── Add water box ───────────────────────────────────────────────────────────
  const addWaterBox = (count) => {
    const newAtoms = [];
    const newBonds = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 4 + 2;
      const z = (Math.random() - 0.5) * 10;
      const oId = atomIdCounter++;
      const h1Id = atomIdCounter++;
      const h2Id = atomIdCounter++;
      newAtoms.push({ id: oId,  elem: "O", x, y, z, charge: 0 });
      newAtoms.push({ id: h1Id, elem: "H", x: x+0.96, y, z, charge: 0 });
      newAtoms.push({ id: h2Id, elem: "H", x: x-0.24, y: y+0.93, z, charge: 0 });
      newBonds.push([oId, h1Id], [oId, h2Id]);
    }
    setAtoms(prev => [...prev, ...newAtoms]);
    setBonds(prev => [...prev, ...newBonds]);
    pushLog(`Added ${count} water molecules`);
  };

  // ── Separate chain ──────────────────────────────────────────────────────────
  const assignChain = (chain) => {
    if (selectedId === null) { pushLog("Select an atom first, then assign chain"); return; }
    setAtomChain(prev => ({ ...prev, [selectedId]: chain }));
    pushLog(`Atom #${selectedId} assigned to chain ${chain}`);
  };

  const addChain = () => {
    const next = String.fromCharCode("A".charCodeAt(0) + chains.length);
    if (chains.length < 8) {
      setChains(prev => [...prev, next]);
      pushLog(`Added chain ${next}`);
    }
  };

  // ── Simple force simulation ─────────────────────────────────────────────────
  const runSimulation = () => {
    if (simRunning) {
      clearInterval(simRef.current);
      setSimRunning(false);
      pushLog("Simulation stopped");
      return;
    }
    setSimRunning(true);
    let step = 0;
    pushLog("Running force simulation...");
    simRef.current = setInterval(() => {
      step++;
      setSimStep(step);
      setAtoms(prev => {
        return prev.map(atom => {
          let fx = 0, fy = 0, fz = 0;
          // Simple Lennard-Jones repulsion
          prev.forEach(other => {
            if (other.id === atom.id) return;
            const dx = atom.x - other.x, dy = atom.y - other.y, dz = atom.z - other.z;
            const r2 = dx*dx + dy*dy + dz*dz + 0.01;
            const r6 = r2*r2*r2;
            const f = 0.05 / r6;
            fx += f * dx; fy += f * dy; fz += f * dz;
          });
          // Bond spring forces
          bondsRef.current.forEach(b => {
            let partner = null;
            if (b[0] === atom.id) partner = prev.find(a => a.id === b[1]);
            if (b[1] === atom.id) partner = prev.find(a => a.id === b[0]);
            if (!partner) return;
            const dx = partner.x - atom.x, dy = partner.y - atom.y, dz = partner.z - atom.z;
            const r = Math.sqrt(dx*dx+dy*dy+dz*dz)+0.001;
            const k = 0.05 * (r - 1.5);
            fx += k * dx/r; fy += k * dy/r; fz += k * dz/r;
          });
          const dt = 0.01;
          return { ...atom, x: atom.x + fx * dt, y: atom.y + fy * dt, z: atom.z + fz * dt };
        });
      });
      if (step >= 200) {
        clearInterval(simRef.current);
        setSimRunning(false);
        pushLog("Simulation converged");
      }
    }, 50);
  };

  useEffect(() => () => clearInterval(simRef.current), []);

  // ── Move selected atom with arrow keys ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (selectedId === null) return;
      const d = 0.2;
      const moves = { ArrowLeft: [-d,0,0], ArrowRight: [d,0,0], ArrowUp: [0,d,0], ArrowDown: [0,-d,0] };
      if (!moves[e.key]) return;
      e.preventDefault();
      const [dx, dy, dz] = moves[e.key];
      setAtoms(prev => prev.map(a => a.id === selectedId ? { ...a, x: a.x+dx, y: a.y+dy, z: a.z+dz } : a));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId]);

  const selectedAtom = atoms.find(a => a.id === selectedId);

  const TOOL_COLORS = {
    select: "bg-blue-600",
    add:    "bg-green-600",
    delete: "bg-red-600",
    bond:   "bg-yellow-600",
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-white font-mono text-xs select-none">
      {/* ── Top Toolbar ── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#161b22] border-b border-[#30363d] flex-wrap">
        <span className="text-[#58a6ff] font-bold text-sm mr-2">Molecular Editor</span>

        {/* Tools */}
        {[
          { id:"select", label:"Select (S)" },
          { id:"add",    label:"Add Atom (A)" },
          { id:"delete", label:"Delete (D)" },
          { id:"bond",   label:"Bond (B)" },
        ].map(t => (
          <button key={t.id} onClick={() => { setTool(t.id); setBondStart(null); }}
            className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all ${
              tool === t.id
                ? `${TOOL_COLORS[t.id]} border-transparent text-white`
                : "bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-white hover:bg-[#30363d]"
            }`}>
            {t.label}
          </button>
        ))}

        {tool === "add" && (
          <select value={addElement} onChange={e => setAddElement(e.target.value)}
            className="bg-[#21262d] border border-[#30363d] text-white rounded px-2 py-1 text-xs">
            {Object.entries(ELEMENTS).map(([sym, el]) => (
              <option key={sym} value={sym}>{sym}: {el.name}</option>
            ))}
          </select>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button onClick={runSimulation}
            className={`px-3 py-1 rounded text-xs font-bold border transition-all ${
              simRunning
                ? "bg-orange-600 border-orange-500 text-white animate-pulse"
                : "bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-white hover:bg-[#30363d]"
            }`}>
            {simRunning ? `Stop Sim (step ${simStep})` : "Run Simulation"}
          </button>
          <button onClick={clearAll}
            className="px-2.5 py-1 rounded text-xs border bg-[#21262d] border-[#30363d] text-[#f85149] hover:bg-[#30363d]">
            Clear
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel ── */}
        <div className="w-52 flex-shrink-0 bg-[#161b22] border-r border-[#30363d] overflow-y-auto flex flex-col">

          {/* Presets */}
          <div className="px-3 py-2 border-b border-[#30363d]">
            <p className="text-[#8b949e] font-bold uppercase text-[10px] tracking-widest mb-2">Load Molecule</p>
            {PRESET_MOLECULES.map(p => (
              <button key={p.name} onClick={() => loadPreset(p)}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-[#21262d] text-[#c9d1d9] text-xs transition-colors mb-0.5">
                {p.name}
              </button>
            ))}
          </div>

          {/* Cations */}
          <div className="px-3 py-2 border-b border-[#30363d]">
            <p className="text-[#8b949e] font-bold uppercase text-[10px] tracking-widest mb-2">Add Cation</p>
            <div className="grid grid-cols-2 gap-1">
              {CATIONS.map(c => (
                <button key={c.symbol} onClick={() => addIon(c.elem, c.charge)}
                  className="px-2 py-1.5 rounded text-[10px] font-bold bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] hover:border-[#58a6ff] transition-colors">
                  {c.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Anions */}
          <div className="px-3 py-2 border-b border-[#30363d]">
            <p className="text-[#8b949e] font-bold uppercase text-[10px] tracking-widest mb-2">Add Anion</p>
            <div className="grid grid-cols-2 gap-1">
              {ANIONS.map(a => (
                <button key={a.symbol} onClick={() => addIon(a.elem, a.charge)}
                  className="px-2 py-1.5 rounded text-[10px] font-bold bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] hover:border-[#f85149] transition-colors">
                  {a.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Water box */}
          <div className="px-3 py-2 border-b border-[#30363d]">
            <p className="text-[#8b949e] font-bold uppercase text-[10px] tracking-widest mb-2">Add Water</p>
            {[1, 5, 10, 20].map(n => (
              <button key={n} onClick={() => addWaterBox(n)}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-[#21262d] text-[#79c0ff] text-xs transition-colors mb-0.5">
                + {n} H₂O molecule{n > 1 ? "s" : ""}
              </button>
            ))}
          </div>

          {/* Chains */}
          <div className="px-3 py-2 border-b border-[#30363d]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#8b949e] font-bold uppercase text-[10px] tracking-widest">Chains</p>
              <button onClick={addChain} className="text-[#58a6ff] text-[10px] hover:underline">+ Add</button>
            </div>
            <div className="flex flex-wrap gap-1">
              {chains.map(c => (
                <button key={c} onClick={() => assignChain(c)}
                  className="px-2 py-1 rounded text-[10px] font-bold bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff] text-[#c9d1d9] transition-colors">
                  Chain {c}
                </button>
              ))}
            </div>
            <p className="text-[#484f58] text-[10px] mt-1">Select atom, then click chain to assign</p>
          </div>

          {/* Selected atom info */}
          {selectedAtom && (
            <div className="px-3 py-2 bg-[#0d1117] border-b border-[#30363d]">
              <p className="text-[#58a6ff] font-bold text-[10px] uppercase tracking-widest mb-1">Selected Atom</p>
              <div className="space-y-0.5 text-[11px] text-[#c9d1d9]">
                <div>ID: <span className="text-white">{selectedAtom.id}</span></div>
                <div>Element: <span className="text-white">{selectedAtom.elem}: {ELEMENTS[selectedAtom.elem]?.name}</span></div>
                <div>Position: <span className="text-[#79c0ff] font-mono">{selectedAtom.x.toFixed(2)}, {selectedAtom.y.toFixed(2)}, {selectedAtom.z.toFixed(2)}</span></div>
                {selectedAtom.charge !== 0 && <div>Charge: <span className={selectedAtom.charge > 0 ? "text-[#f85149]" : "text-[#79c0ff]"}>{selectedAtom.charge > 0 ? "+" : ""}{selectedAtom.charge}</span></div>}
                {atomChain[selectedAtom.id] && <div>Chain: <span className="text-[#56d364]">{atomChain[selectedAtom.id]}</span></div>}
              </div>
              <div className="mt-2 flex gap-1">
                <button onClick={() => setAtoms(prev => prev.map(a => a.id === selectedAtom.id ? { ...a, y: a.y + 0.5 } : a))}
                  className="flex-1 py-1 rounded bg-[#21262d] text-[#8b949e] hover:text-white hover:bg-[#30363d] text-[10px]">
                  Move Up
                </button>
                <button onClick={() => { setAtoms(p => p.filter(a => a.id !== selectedAtom.id)); setBonds(p => p.filter(b => b[0]!==selectedAtom.id&&b[1]!==selectedAtom.id)); setSelectedId(null); }}
                  className="flex-1 py-1 rounded bg-[#21262d] text-[#f85149] hover:bg-[#30363d] text-[10px]">
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="px-3 py-2 mt-auto">
            <p className="text-[#8b949e] font-bold uppercase text-[10px] tracking-widest mb-1">Scene</p>
            <div className="text-[11px] text-[#8b949e] space-y-0.5">
              <div>Atoms: <span className="text-white">{atoms.length}</span></div>
              <div>Bonds: <span className="text-white">{bonds.length}</span></div>
              <div>Chains: <span className="text-white">{chains.length}</span></div>
            </div>
          </div>
        </div>

        {/* ── 3D Viewport ── */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={mountRef}
            className="w-full h-full cursor-crosshair"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onWheel={onWheel}
            onContextMenu={e => e.preventDefault()}
            style={{ minHeight: 400 }}
          />

          {/* Viewport overlays */}
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-[10px] text-[#8b949e] pointer-events-none">
            Tool: <span className="text-white font-bold uppercase">{tool}</span>
            {tool === "add" && <span className="text-[#56d364] ml-2">[{addElement}]</span>}
            {tool === "bond" && bondStart !== null && <span className="text-yellow-400 ml-2">Click second atom</span>}
          </div>

          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-[10px] text-[#8b949e] pointer-events-none">
            Left-drag: Orbit  |  Right-drag: Pan  |  Scroll: Zoom  |  Arrow keys: Move selected atom
          </div>

          {/* Element legend */}
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded px-2 py-2 pointer-events-none">
            <p className="text-[9px] text-[#8b949e] mb-1 uppercase tracking-widest">CPK Colors</p>
            {[["C","#404040"],["H","#ffffff"],["O","#ff0d0d"],["N","#3050f8"],["S","#ffff30"],["P","#ff8000"]].map(([s,c]) => (
              <div key={s} className="flex items-center gap-1 text-[10px] text-[#c9d1d9]">
                <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                {s}
              </div>
            ))}
          </div>

          {simRunning && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2 text-orange-400 font-bold text-sm pointer-events-none animate-pulse">
              Simulating... step {simStep}/200
            </div>
          )}
        </div>

        {/* ── Right Log Panel ── */}
        <div className="w-44 flex-shrink-0 bg-[#161b22] border-l border-[#30363d] overflow-y-auto">
          <div className="px-2 py-2 border-b border-[#30363d]">
            <p className="text-[#8b949e] font-bold uppercase text-[10px] tracking-widest">Log</p>
          </div>
          <div className="px-2 py-1 space-y-0.5">
            {log.length === 0 && <p className="text-[#484f58] text-[10px] py-2">No events yet</p>}
            {log.map((entry, i) => (
              <div key={i} className="text-[10px] text-[#8b949e] py-0.5 border-b border-[#21262d] leading-tight">
                {entry}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}