import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Maximize2, Ruler, Box, Eye, EyeOff } from "lucide-react";

// CPK element colors
const ELEMENT_COLORS = {
  H: 0xffffff, He: 0xfff0c0, Li: 0xcc80ff, Be: 0xc2ff00, B: 0xffb5b5, C: 0x909090,
  N: 0x3050f8, O: 0xff0d0d, F: 0x90e050, Ne: 0xb3e3f5, Na: 0xab5cf2, Mg: 0x8aff00,
  Al: 0xbfa6a6, Si: 0xf0c8a0, P: 0xff8000, S: 0xffff30, Cl: 0x1ff01f, K: 0x8f40d4,
  Ca: 0x3dff00, Ti: 0xbfc2c7, Fe: 0xe06633, Cu: 0xc88033, Zn: 0x7d80b0, Br: 0xa62929,
  I: 0x940094, Ba: 0x00c900, Au: 0xdda233, Ag: 0xc0c0c0, Pt: 0xd0d0e0, Pb: 0x575757,
};

// Covalent radii (Angstroms)
const COVALENT_RADII = {
  H: 0.31, He: 0.28, Li: 1.28, Be: 0.96, B: 0.84, C: 0.76, N: 0.71, O: 0.66,
  F: 0.57, Ne: 0.58, Na: 1.66, Mg: 1.41, Al: 1.21, Si: 1.11, P: 1.07, S: 1.05,
  Cl: 1.02, K: 2.03, Ca: 1.76, Ti: 1.36, Fe: 1.24, Cu: 1.32, Zn: 1.22, Br: 1.20,
  I: 1.39, Ba: 2.15, Au: 1.36, Ag: 1.45, Pt: 1.36, Pb: 1.46,
};

function getColor(element) {
  return ELEMENT_COLORS[element] || 0xff9090;
}

function getRadius(element) {
  return (COVALENT_RADII[element] || 0.7) * 0.5;
}

export default function CrystalViewer3D({ structure, bonds }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const atomsGroupRef = useRef(null);
  const cellGroupRef = useRef(null);
  const bondsGroupRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const selectedAtomsRef = useRef([]);

  const [showUnitCell, setShowUnitCell] = useState(true);
  const [showBonds, setShowBonds] = useState(true);
  const [measureMode, setMeasureMode] = useState(false);
  const [hoveredAtom, setHoveredAtom] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [atomInfo, setAtomInfo] = useState(null);

  useEffect(() => {
    if (!structure || !mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controlsRef.current = controls;

    // Lights
    const ambient = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // Atoms group
    const atomsGroup = new THREE.Group();
    scene.add(atomsGroup);
    atomsGroupRef.current = atomsGroup;

    // Bonds group
    const bondsGroup = new THREE.Group();
    scene.add(bondsGroup);
    bondsGroupRef.current = bondsGroup;

    // Unit cell group
    const cellGroup = new THREE.Group();
    scene.add(cellGroup);
    cellGroupRef.current = cellGroup;

    // Compute center
    const positions = structure.atoms.map((a) => a.position);
    const center = [0, 0, 0];
    positions.forEach((p) => { center[0] += p[0]; center[1] += p[1]; center[2] += p[2]; });
    center[0] /= positions.length; center[1] /= positions.length; center[2] /= positions.length;

    // Add atoms
    const atomMeshes = [];
    structure.atoms.forEach((atom, i) => {
      const radius = getRadius(atom.element);
      const geo = new THREE.SphereGeometry(radius, 24, 24);
      const mat = new THREE.MeshPhongMaterial({ color: getColor(atom.element), shininess: 60 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(atom.position[0] - center[0], atom.position[1] - center[1], atom.position[2] - center[2]);
      mesh.userData = { index: i, element: atom.element, position: atom.position };
      atomsGroup.add(mesh);
      atomMeshes.push(mesh);
    });

    // Add bonds
    if (bonds && bonds.length > 0) {
      bonds.forEach((bond) => {
        const a1 = structure.atoms[bond.a].position;
        const a2 = structure.atoms[bond.b].position;
        const start = new THREE.Vector3(a1[0] - center[0], a1[1] - center[1], a1[2] - center[2]);
        const end = new THREE.Vector3(a2[0] - center[0], a2[1] - center[1], a2[2] - center[2]);
        const dir = new THREE.Vector3().subVectors(end, start);
        const len = dir.length();
        if (len < 0.01) return;
        const geo = new THREE.CylinderGeometry(0.04, 0.04, len, 8);
        const mat = new THREE.MeshPhongMaterial({ color: 0x888888 });
        const cyl = new THREE.Mesh(geo, mat);
        cyl.position.copy(start).add(dir.multiplyScalar(0.5));
        cyl.lookAt(end);
        cyl.rotateX(Math.PI / 2);
        bondsGroup.add(cyl);
      });
    }

    // Add unit cell wireframe
    if (structure.is_crystal && structure.lattice) {
      const lat = structure.lattice;
      let matrix;
      if (lat.matrix) {
        matrix = lat.matrix;
      } else {
        const { a = 5, b = 5, c = 5, alpha = 90, beta = 90, gamma = 90 } = lat;
        const ar = alpha * Math.PI / 180, br = beta * Math.PI / 180, gr = gamma * Math.PI / 180;
        matrix = [
          [a, 0, 0],
          [b * Math.cos(gr), b * Math.sin(gr), 0],
          [c * Math.cos(br), c * (Math.cos(ar) - Math.cos(br) * Math.cos(gr)) / Math.sin(gr),
           c * Math.sqrt(1 - Math.cos(ar)**2 - Math.cos(br)**2 - Math.cos(gr)**2 + 2 * Math.cos(ar) * Math.cos(br) * Math.cos(gr)) / Math.sin(gr)]
        ];
      }

      const corners = [
        [0,0,0], [1,0,0], [1,1,0], [0,1,0],
        [0,0,1], [1,0,1], [1,1,1], [0,1,1]
      ].map(([fx, fy, fz]) => [
        fx * matrix[0][0] + fy * matrix[1][0] + fz * matrix[2][0] - center[0],
        fx * matrix[0][1] + fy * matrix[1][1] + fz * matrix[2][1] - center[1],
        fx * matrix[0][2] + fy * matrix[1][2] + fz * matrix[2][2] - center[2],
      ]);

      const edges = [
        [0,1],[1,2],[2,3],[3,0],
        [4,5],[5,6],[6,7],[7,4],
        [0,4],[1,5],[2,6],[3,7]
      ];

      const points = [];
      edges.forEach(([a, b]) => {
        points.push(new THREE.Vector3(...corners[a]));
        points.push(new THREE.Vector3(...corners[b]));
      });
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color: 0x00a8c8, linewidth: 2 });
      const lines = new THREE.LineSegments(geo, mat);
      cellGroup.add(lines);
    }

    // Auto-scale camera
    let maxDist = 0;
    positions.forEach((p) => {
      const d = Math.sqrt((p[0]-center[0])**2 + (p[1]-center[1])**2 + (p[2]-center[2])**2);
      if (d > maxDist) maxDist = d;
    });
    const camDist = Math.max(maxDist * 3, 5);
    camera.position.set(camDist, camDist * 0.7, camDist);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();

    // Animation loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener("resize", handleResize);

    // Click handler for atom inspection and measurement
    const handleClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(atomsGroup.children);
      if (intersects.length > 0) {
        const mesh = intersects[0].object;
        const data = mesh.userData;
        if (measureMode) {
          selectedAtomsRef.current.push(data);
          mesh.material.emissive = new THREE.Color(0x00ff00);
          mesh.material.emissiveIntensity = 0.4;
          if (selectedAtomsRef.current.length === 2) {
            const [a1, a2] = selectedAtomsRef.current;
            const dx = a1.position[0] - a2.position[0];
            const dy = a1.position[1] - a2.position[1];
            const dz = a1.position[2] - a2.position[2];
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            setMeasurements((prev) => [...prev, { a: a1, b: a2, distance: dist }]);
            selectedAtomsRef.current = [];
            // Reset emissive after a delay
            setTimeout(() => {
              atomMeshes.forEach((m) => { m.material.emissiveIntensity = 0; });
            }, 500);
          }
        } else {
          setAtomInfo(data);
        }
      }
    };
    renderer.domElement.addEventListener("click", handleClick);

    // Hover handler
    const handleHover = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(atomsGroup.children);
      if (intersects.length > 0) {
        setHoveredAtom(intersects[0].object.userData);
        renderer.domElement.style.cursor = "pointer";
      } else {
        setHoveredAtom(null);
        renderer.domElement.style.cursor = "grab";
      }
    };
    renderer.domElement.addEventListener("mousemove", handleHover);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("click", handleClick);
      renderer.domElement.removeEventListener("mousemove", handleHover);
      controls.dispose();
      renderer.dispose();
      if (mountRef.current) mountRef.current.innerHTML = "";
    };
  }, [structure, bonds, measureMode]);

  // Toggle unit cell visibility
  useEffect(() => {
    if (cellGroupRef.current) cellGroupRef.current.visible = showUnitCell;
  }, [showUnitCell]);

  // Toggle bonds visibility
  useEffect(() => {
    if (bondsGroupRef.current) bondsGroupRef.current.visible = showBonds;
  }, [showBonds]);

  const resetView = () => {
    if (cameraRef.current && controlsRef.current) {
      const camDist = 10;
      cameraRef.current.position.set(camDist, camDist * 0.7, camDist);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  if (!structure) return null;

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={resetView} className="gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" /> Reset View
        </Button>
        <Button
          size="sm"
          variant={showUnitCell ? "default" : "outline"}
          onClick={() => setShowUnitCell(!showUnitCell)}
          className="gap-1.5"
        >
          {showUnitCell ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          Unit Cell
        </Button>
        <Button
          size="sm"
          variant={showBonds ? "default" : "outline"}
          onClick={() => setShowBonds(!showBonds)}
          className="gap-1.5"
        >
          {showBonds ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          Bonds
        </Button>
        <Button
          size="sm"
          variant={measureMode ? "default" : "outline"}
          onClick={() => { setMeasureMode(!measureMode); selectedAtomsRef.current = []; }}
          className={`gap-1.5 ${measureMode ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}`}
        >
          <Ruler className="w-3.5 h-3.5" />
          {measureMode ? "Click 2 atoms" : "Measure"}
        </Button>
      </div>

      {/* 3D Viewer */}
      <div
        ref={mountRef}
        className="w-full rounded-xl overflow-hidden border border-slate-700"
        style={{ height: 500, backgroundColor: "#0a0e17" }}
      />

      {/* Hover info */}
      {hoveredAtom && !measureMode && (
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
            {hoveredAtom.element} (#{hoveredAtom.index + 1})
          </span>
          <span className="font-mono">
            ({hoveredAtom.position[0].toFixed(3)}, {hoveredAtom.position[1].toFixed(3)}, {hoveredAtom.position[2].toFixed(3)}) Å
          </span>
        </div>
      )}

      {/* Measurement instructions */}
      {measureMode && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center gap-2">
          <Ruler className="w-3.5 h-3.5" />
          Click two atoms to measure the distance between them. Click "Measure" again to exit.
        </div>
      )}

      {/* Measurements list */}
      {measurements.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Distance Measurements</h4>
          {measurements.map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-sm bg-slate-50 rounded-lg px-3 py-1.5">
              <span className="font-mono text-slate-700">{m.a.element}#{m.a.index + 1}</span>
              <span className="text-slate-400">—</span>
              <span className="font-mono text-slate-700">{m.b.element}#{m.b.index + 1}</span>
              <Badge className="ml-auto bg-amber-100 text-amber-700 font-mono">{m.distance.toFixed(4)} Å</Badge>
            </div>
          ))}
          <Button size="sm" variant="ghost" onClick={() => setMeasurements([])} className="text-xs text-red-500">
            Clear measurements
          </Button>
        </div>
      )}

      {/* Structure info */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
        <Box className="w-3 h-3" />
        <span>{structure.atoms.length} atoms</span>
        {structure.is_crystal && <Badge variant="outline" className="text-xs">Crystal</Badge>}
        {!structure.is_crystal && <Badge variant="outline" className="text-xs">Molecule</Badge>}
        <span className="text-slate-400">· Drag to rotate · Scroll to zoom · Right-click to pan</span>
      </div>
    </div>
  );
}