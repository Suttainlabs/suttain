import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Atom,
  Download,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move3D,
  Layers,
  Image,
  Film,
  ArrowRight,
  Maximize2,
  Minimize2,
  Settings2,
  FlaskConical,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";

// Atom color mapping based on element
const ELEMENT_COLORS = {
  H: "#FFFFFF",
  C: "#404040",
  N: "#3050F8",
  O: "#FF0D0D",
  S: "#FFFF30",
  P: "#FF8000",
  Cl: "#1FF01F",
  Na: "#AB5CF2",
  K: "#8F40D4",
  Ca: "#3DFF00",
  Fe: "#E06633",
  Mg: "#8AFF00",
  Br: "#A62929",
  I: "#940094",
  default: "#808080",
};

// Atom radius mapping
const ELEMENT_RADII = {
  H: 0.31,
  C: 0.77,
  N: 0.71,
  O: 0.66,
  S: 1.05,
  P: 1.07,
  Cl: 0.99,
  Na: 1.66,
  K: 2.03,
  Ca: 1.76,
  Fe: 1.26,
  Mg: 1.41,
  Br: 1.14,
  I: 1.33,
  default: 0.8,
};

// Parse molecular formula to get atom counts
const parseFormula = (formula) => {
  if (!formula || formula === "N/A") return [];
  const atoms = [];
  const matches = formula.match(/([A-Z][a-z]?)(\d*)/g) || [];

  matches.forEach((match) => {
    const elementMatch = match.match(/[A-Z][a-z]?/);
    const element = elementMatch ? elementMatch[0] : "";
    const countMatch = match.match(/\d+/);
    const count = countMatch ? parseInt(countMatch[0]) : 1;

    for (let i = 0; i < count; i++) {
      atoms.push(element);
    }
  });

  return atoms;
};

// Generate 3D positions for atoms (simplified molecular structure)
const generateAtomPositions = (atoms) => {
  const positions = [];
  const bondDistance = 1.5;

  atoms.forEach((atom, index) => {
    const angle = (index / atoms.length) * Math.PI * 2;
    const radius = atoms.length > 1 ? bondDistance * (1 + Math.floor(index / 6)) : 0;

    positions.push({
      element: atom,
      x: Math.cos(angle) * radius + (Math.random() - 0.5) * 0.3,
      y: Math.sin(angle) * radius + (Math.random() - 0.5) * 0.3,
      z: (index % 3 - 1) * bondDistance * 0.5 + (Math.random() - 0.5) * 0.3,
    });
  });

  return positions;
};

// 2D Structure Renderer Component
const Structure2D = ({ formula, name, isProduct = false }) => {
  const atoms = parseFormula(formula);
  const svgSize = 200;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const radius = 60;

  const atomPositions = atoms.map((atom, i) => {
    const angle = (i / Math.max(atoms.length, 1)) * Math.PI * 2 - Math.PI / 2;
    const r = atoms.length > 1 ? radius : 0;
    return {
      element: atom,
      x: centerX + Math.cos(angle) * r,
      y: centerY + Math.sin(angle) * r,
    };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={svgSize} height={svgSize} className="bg-slate-50 rounded-lg border border-slate-200">
        {/* Bonds */}
        {atomPositions.length > 1 &&
          atomPositions.map((pos, i) => {
            const nextPos = atomPositions[(i + 1) % atomPositions.length];
            return (
              <line
                key={`bond-${i}`}
                x1={pos.x}
                y1={pos.y}
                x2={nextPos.x}
                y2={nextPos.y}
                stroke="#94a3b8"
                strokeWidth="2"
              />
            );
          })}

        {/* Atoms */}
        {atomPositions.map((pos, i) => {
          const color = ELEMENT_COLORS[pos.element] || ELEMENT_COLORS.default;
          const atomRadius = (ELEMENT_RADII[pos.element] || ELEMENT_RADII.default) * 18;

          return (
            <g key={`atom-${i}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={atomRadius}
                fill={color}
                stroke="#1e293b"
                strokeWidth="1.5"
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-xs font-bold"
                fill={pos.element === "C" || pos.element === "H" ? "#fff" : "#000"}
              >
                {pos.element}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-sm font-medium text-slate-700 text-center">{name}</p>
      <p className="text-xs text-slate-500 font-mono">{formula}</p>
      {isProduct && (
        <Badge className="mt-1 bg-emerald-100 text-emerald-700 border-emerald-200">
          Product
        </Badge>
      )}
    </div>
  );
};

// 3D Molecule Viewer Component
const Molecule3DViewer = ({ formula, name }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const moleculeRef = useRef(null);
  const animationRef = useRef(null);
  const [isRotating, setIsRotating] = useState(true);
  const [zoom, setZoom] = useState(5);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = zoom;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Create molecule
    const atoms = parseFormula(formula);
    const atomPositions = generateAtomPositions(atoms);
    const moleculeGroup = new THREE.Group();

    // Add atoms as spheres
    atomPositions.forEach((atom) => {
      const color = ELEMENT_COLORS[atom.element] || ELEMENT_COLORS.default;
      const radius = (ELEMENT_RADII[atom.element] || ELEMENT_RADII.default) * 0.5;

      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(color),
        specular: 0x444444,
        shininess: 30,
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(atom.x, atom.y, atom.z);
      moleculeGroup.add(sphere);
    });

    // Add bonds
    for (let i = 0; i < atomPositions.length - 1; i++) {
      const start = new THREE.Vector3(
        atomPositions[i].x,
        atomPositions[i].y,
        atomPositions[i].z
      );
      const end = new THREE.Vector3(
        atomPositions[i + 1].x,
        atomPositions[i + 1].y,
        atomPositions[i + 1].z
      );

      const direction = new THREE.Vector3().subVectors(end, start);
      const length = direction.length();

      const bondGeometry = new THREE.CylinderGeometry(0.08, 0.08, length, 8);
      const bondMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
      const bond = new THREE.Mesh(bondGeometry, bondMaterial);

      bond.position.copy(start.clone().add(direction.multiplyScalar(0.5)));
      bond.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize()
      );
      moleculeGroup.add(bond);
    }

    scene.add(moleculeGroup);
    moleculeRef.current = moleculeGroup;

    // Animation
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      if (isRotating && moleculeRef.current) {
        moleculeRef.current.rotation.y += 0.01;
        moleculeRef.current.rotation.x += 0.005;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, [formula]);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.z = zoom;
    }
  }, [zoom]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-full h-64 rounded-lg border border-slate-200 overflow-hidden"
      />
      <div className="absolute bottom-2 left-2 flex gap-1">
        <Button
          size="icon"
          variant="secondary"
          className="h-7 w-7 bg-white/90"
          onClick={() => setIsRotating(!isRotating)}
        >
          {isRotating ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-7 w-7 bg-white/90"
          onClick={() => setZoom((z) => Math.max(2, z - 1))}
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-7 w-7 bg-white/90"
          onClick={() => setZoom((z) => Math.min(10, z + 1))}
        >
          <ZoomOut className="h-3 w-3" />
        </Button>
      </div>
      <div className="text-center mt-2">
        <p className="text-sm font-medium text-slate-700">{name}</p>
        <p className="text-xs text-slate-500 font-mono">{formula}</p>
      </div>
    </div>
  );
};

// Reaction Pathway Diagram Component
const ReactionPathway = ({ reactants, products, energyProfile }) => {
  const svgWidth = 600;
  const svgHeight = 250;
  const pathRef = useRef(null);

  const isExothermic = energyProfile?.type === "Exothermic";
  const activationEnergy = energyProfile?.activation_energy || 50;
  const energyChange = energyProfile?.energy_change || 0;

  // Calculate pathway points
  const startY = 150;
  const peakY = startY - (activationEnergy / 100) * 100 - 30;
  const endY = isExothermic ? startY + Math.abs(energyChange) / 3 : startY - energyChange / 3;

  return (
    <div className="w-full overflow-x-auto">
      <svg width={svgWidth} height={svgHeight} className="bg-white rounded-lg">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Energy axis label */}
        <text x="15" y="30" className="text-xs fill-slate-500">
          Energy
        </text>
        <line x1="30" y1="40" x2="30" y2="220" stroke="#94a3b8" strokeWidth="1" />
        <polygon points="30,40 25,50 35,50" fill="#94a3b8" />

        {/* Reaction coordinate axis */}
        <text x="520" y="235" className="text-xs fill-slate-500">
          Reaction Progress
        </text>
        <line x1="30" y1="220" x2="570" y2="220" stroke="#94a3b8" strokeWidth="1" />
        <polygon points="570,220 560,215 560,225" fill="#94a3b8" />

        {/* Energy pathway curve */}
        <path
          ref={pathRef}
          d={`M 60 ${startY} 
              Q 150 ${startY} 200 ${peakY} 
              Q 250 ${startY - 20} 300 ${peakY + 20}
              Q 400 ${endY + 30} 540 ${endY}`}
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Gradient for path */}
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor={isExothermic ? "#10b981" : "#f59e0b"} />
          </linearGradient>
        </defs>

        {/* Activation energy arrow */}
        <line
          x1="200"
          y1={startY}
          x2="200"
          y2={peakY}
          stroke="#ef4444"
          strokeWidth="2"
          strokeDasharray="5,3"
        />
        <text x="210" y={(startY + peakY) / 2} className="text-xs fill-red-600 font-medium">
          Ea = {activationEnergy} kJ/mol
        </text>

        {/* Energy change arrow */}
        <line
          x1="450"
          y1={startY}
          x2="450"
          y2={endY}
          stroke={isExothermic ? "#10b981" : "#f59e0b"}
          strokeWidth="2"
          strokeDasharray="5,3"
        />
        <text
          x="460"
          y={(startY + endY) / 2}
          className={`text-xs font-medium ${isExothermic ? "fill-emerald-600" : "fill-amber-600"}`}
        >
          ΔH = {energyChange} kJ/mol
        </text>

        {/* Reactants marker */}
        <circle cx="60" cy={startY} r="8" fill="#6366f1" />
        <text x="60" y={startY + 25} textAnchor="middle" className="text-xs fill-indigo-700 font-medium">
          Reactants
        </text>

        {/* Transition state marker */}
        <circle cx="200" cy={peakY} r="8" fill="#ec4899" />
        <text x="200" y={peakY - 15} textAnchor="middle" className="text-xs fill-pink-700 font-medium">
          Transition State
        </text>

        {/* Products marker */}
        <circle cx="540" cy={endY} r="8" fill={isExothermic ? "#10b981" : "#f59e0b"} />
        <text
          x="540"
          y={endY + 25}
          textAnchor="middle"
          className={`text-xs font-medium ${isExothermic ? "fill-emerald-700" : "fill-amber-700"}`}
        >
          Products
        </text>

        {/* Reaction type label */}
        <rect
          x="460"
          y="10"
          width="120"
          height="24"
          rx="4"
          fill={isExothermic ? "#d1fae5" : "#fef3c7"}
        />
        <text
          x="520"
          y="26"
          textAnchor="middle"
          className={`text-xs font-bold ${isExothermic ? "fill-emerald-800" : "fill-amber-800"}`}
        >
          {isExothermic ? "EXOTHERMIC" : "ENDOTHERMIC"}
        </text>
      </svg>
    </div>
  );
};

// Main Visualization Component
export default function ChemicalVisualization({ data }) {
  const [activeView, setActiveView] = useState("2d");
  const [selectedMolecule, setSelectedMolecule] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const visualizationRef = useRef(null);

  const chemicals = data?.chemicals || [];
  const products = data?.reaction_details?.products_formed || [];
  const energyProfile = data?.energy_profile || {};
  const balancedEquation = data?.reaction_details?.balanced_equation || "";

  useEffect(() => {
    if (chemicals.length > 0 && !selectedMolecule) {
      setSelectedMolecule(chemicals[0]);
    }
  }, [chemicals]);

  const exportAsImage = async (format = "png") => {
    if (!visualizationRef.current) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(visualizationRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `chemical-visualization-${Date.now()}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`);
      link.click();

      toast.success(`Visualization exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export visualization");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card
      className={`border-slate-200 shadow-lg transition-all duration-300 ${
        isFullscreen ? "fixed inset-4 z-50 overflow-auto" : ""
      }`}
    >
      <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Atom className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Chemical Visualization</CardTitle>
              <p className="text-sm text-slate-500">
                Interactive 2D/3D structures & reaction pathways
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            <Select
              value="png"
              onValueChange={(format) => exportAsImage(format)}
            >
              <SelectTrigger className="w-32 h-8">
                <Download className="w-3 h-3 mr-1" />
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">Export PNG</SelectItem>
                <SelectItem value="jpeg">Export JPEG</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4" ref={visualizationRef}>
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-4">
            <TabsTrigger value="2d" className="flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              2D Structures
            </TabsTrigger>
            <TabsTrigger value="3d" className="flex items-center gap-1.5">
              <Move3D className="w-4 h-4" />
              3D View
            </TabsTrigger>
            <TabsTrigger value="pathway" className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Pathway
            </TabsTrigger>
          </TabsList>

          {/* 2D Structures View */}
          <TabsContent value="2d" className="space-y-6">
            {/* Reaction Equation */}
            {balancedEquation && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="text-sm text-slate-600 mb-1">Balanced Equation</p>
                <p className="font-mono text-lg text-indigo-700 font-medium">
                  {balancedEquation}
                </p>
              </div>
            )}

            {/* Reactants & Products Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reactants */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-indigo-500" />
                  Reactants
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {chemicals.map((chem, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Structure2D
                        formula={chem.molecular_formula || ""}
                        name={chem.name || chem.scientific_name}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <ArrowRight className="w-8 h-8 text-slate-400" />
                  <span className="text-xs text-slate-500">Reaction</span>
                </div>
              </div>

              {/* Products */}
              <div className="lg:col-span-1">
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  Products
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {products.slice(0, 4).map((product, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                    >
                      <Structure2D
                        formula={product.formula || ""}
                        name={product.name}
                        isProduct={true}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 3D View */}
          <TabsContent value="3d" className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {[...chemicals, ...products.map((p) => ({ name: p.name, molecular_formula: p.formula }))].map(
                (mol, idx) => (
                  <Button
                    key={idx}
                    variant={selectedMolecule?.name === mol.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMolecule(mol)}
                    className={
                      selectedMolecule?.name === mol.name
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : ""
                    }
                  >
                    {mol.name || mol.scientific_name}
                  </Button>
                )
              )}
            </div>

            {selectedMolecule && (
              <Molecule3DViewer
                formula={selectedMolecule.molecular_formula || ""}
                name={selectedMolecule.name || selectedMolecule.scientific_name}
              />
            )}

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600">
                <strong>Controls:</strong> Click and drag to rotate • Scroll to zoom • Use buttons for
                play/pause rotation
              </p>
            </div>
          </TabsContent>

          {/* Reaction Pathway View */}
          <TabsContent value="pathway" className="space-y-4">
            <ReactionPathway
              reactants={chemicals}
              products={products}
              energyProfile={energyProfile}
            />

            {/* Energy Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 text-center">
                <p className="text-xs text-indigo-600 mb-1">Activation Energy</p>
                <p className="text-lg font-bold text-indigo-900">
                  {energyProfile.activation_energy || 0} kJ/mol
                </p>
              </div>
              <div
                className={`p-4 rounded-xl border text-center ${
                  energyProfile.type === "Exothermic"
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <p
                  className={`text-xs mb-1 ${
                    energyProfile.type === "Exothermic" ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  Energy Change (ΔH)
                </p>
                <p
                  className={`text-lg font-bold ${
                    energyProfile.type === "Exothermic" ? "text-emerald-900" : "text-amber-900"
                  }`}
                >
                  {energyProfile.energy_change || 0} kJ/mol
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center">
                <p className="text-xs text-purple-600 mb-1">Reaction Type</p>
                <p className="text-lg font-bold text-purple-900">
                  {energyProfile.type || "Unknown"}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}