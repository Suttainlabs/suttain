import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Atom,
  Download,
  Layers,
  ArrowRight,
  Maximize2,
  Minimize2,
  FlaskConical,
  Activity,
  AlertTriangle,
  Beaker,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";

// ---------------------------------------------------------------------------
// Structures come from PubChem's own 2D depictions (real connectivity, correct
// ionic representation, e.g. NaOH as Na+ and OH-). We never draw structures
// from a molecular formula alone: a formula does not determine connectivity.
// If PubChem cannot resolve a name we show the formula and say so, rather than
// inventing a picture.
// ---------------------------------------------------------------------------

const HAZARD_LEVELS = new Set(["DANGEROUS", "CRITICAL", "FATAL"]);
export const isHazardLevel = (level) => HAZARD_LEVELS.has(String(level || "").toUpperCase());

// Common household products -> main active ingredient (PubChem-resolvable).
// Shown to the user as "Active ingredient", never as the product itself.
const HOUSEHOLD_ACTIVES = [
  [/bleach|hypochlorite/i, "sodium hypochlorite"],
  [/ammonia/i, "ammonia"],
  [/vinegar/i, "acetic acid"],
  [/rubbing alcohol|isopropyl/i, "isopropyl alcohol"],
  [/hydrogen peroxide|peroxide/i, "hydrogen peroxide"],
  [/baking soda|bicarbonate/i, "sodium bicarbonate"],
  [/drain cleaner|lye|caustic soda/i, "sodium hydroxide"],
  [/muriatic|hydrochloric/i, "hydrochloric acid"],
];

const activeIngredientFor = (name) => {
  if (!name) return null;
  const hit = HOUSEHOLD_ACTIVES.find(([re]) => re.test(name));
  return hit ? hit[1] : null;
};

const pubchemPng = (query) =>
  `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/PNG?image_size=300x300`;

// Subscript digits that follow an element/bracket; leave coefficients (2 NH3) alone.
export const FormulaText = ({ text }) => {
  if (!text) return null;
  const parts = String(text).split(/(\d+)/);
  return (
    <>
      {parts.map((p, i) =>
        /^\d+$/.test(p) && i > 0 && /[A-Za-z)\]]$/.test(parts[i - 1]) ? (
          <sub key={i}>{p}</sub>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        )
      )}
    </>
  );
};

const MoleculeTile = ({ name, scientificName, formula, isProduct = false, hazards = [] }) => {
  const active = activeIngredientFor(name) || activeIngredientFor(scientificName);
  const candidates = [
    ...new Set(
      [scientificName, name, active].filter(Boolean).map((s) => String(s).trim()).filter(Boolean)
    ),
  ];
  const key = candidates.join("|");
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIdx(0);
    setLoaded(false);
  }, [key]);

  const query = candidates[idx];
  const usedActive = loaded && active && query === active && active.toLowerCase() !== String(name || "").toLowerCase();
  const exhausted = idx >= candidates.length;
  const isHazardous = isProduct && hazards.length > 0;

  return (
    <figure className="flex flex-col items-center text-center min-w-0">
      <div
        className={`relative w-full max-w-[170px] aspect-square rounded-xl border bg-white overflow-hidden flex items-center justify-center ${
          isHazardous ? "border-red-300" : "border-slate-200"
        }`}
      >
        {!exhausted && query && (
          <img
            key={query}
            src={pubchemPng(query)}
            alt={`2D structure of ${query}`}
            crossOrigin="anonymous"
            loading="lazy"
            className={`w-full h-full object-contain p-2 transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setLoaded(false);
              setIdx((i) => i + 1);
            }}
          />
        )}
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 gap-1">
            {exhausted ? (
              <>
                <span className="font-mono text-lg text-slate-700">
                  {formula ? <FormulaText text={formula} /> : "—"}
                </span>
                <span className="text-[11px] text-slate-500 leading-tight">
                  {formula ? "Structure not available" : "Mixture: no single structure"}
                </span>
              </>
            ) : (
              <span className="text-[11px] text-slate-400">Loading structure…</span>
            )}
          </div>
        )}
      </div>
      <figcaption className="mt-2 w-full">
        <p className="text-sm font-medium text-slate-800 break-words">{name || scientificName}</p>
        {usedActive && (
          <p className="text-[11px] text-slate-500">Active ingredient: {active}</p>
        )}
        {formula && (
          <p className="text-xs text-slate-500 font-mono">
            <FormulaText text={formula} />
          </p>
        )}
        {isHazardous && (
          <Badge className="mt-1 bg-red-50 text-red-700 border border-red-200 hover:bg-red-50">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {hazards[0]}
          </Badge>
        )}
      </figcaption>
    </figure>
  );
};

// Reaction Pathway Diagram Component (illustrative)
const ReactionPathway = ({ energyProfile }) => {
  const svgWidth = 600;
  const svgHeight = 250;

  const isExothermic = energyProfile?.type === "Exothermic";
  const activationEnergy = energyProfile?.activation_energy || 50;
  const energyChange = energyProfile?.energy_change || 0;

  const startY = 150;
  const peakY = startY - (activationEnergy / 100) * 100 - 30;
  const endY = isExothermic ? startY + Math.abs(energyChange) / 3 : startY - energyChange / 3;

  return (
    <div className="w-full overflow-x-auto">
      <svg width={svgWidth} height={svgHeight} className="bg-white rounded-lg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
          </pattern>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor={isExothermic ? "#10b981" : "#f59e0b"} />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        <text x="15" y="30" className="text-xs fill-slate-500">Energy</text>
        <line x1="30" y1="40" x2="30" y2="220" stroke="#94a3b8" strokeWidth="1" />
        <polygon points="30,40 25,50 35,50" fill="#94a3b8" />

        <text x="520" y="235" className="text-xs fill-slate-500">Reaction Progress</text>
        <line x1="30" y1="220" x2="570" y2="220" stroke="#94a3b8" strokeWidth="1" />
        <polygon points="570,220 560,215 560,225" fill="#94a3b8" />

        <path
          d={`M 60 ${startY}
              Q 150 ${startY} 200 ${peakY}
              Q 250 ${startY - 20} 300 ${peakY + 20}
              Q 400 ${endY + 30} 540 ${endY}`}
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <line x1="200" y1={startY} x2="200" y2={peakY} stroke="#ef4444" strokeWidth="2" strokeDasharray="5,3" />
        <text x="210" y={(startY + peakY) / 2} className="text-xs fill-red-600 font-medium">
          Ea ≈ {activationEnergy} kJ/mol
        </text>

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
          ΔH ≈ {energyChange} kJ/mol
        </text>

        <circle cx="60" cy={startY} r="8" fill="#6366f1" />
        <text x="60" y={startY + 25} textAnchor="middle" className="text-xs fill-indigo-700 font-medium">
          Reactants
        </text>

        <circle cx="200" cy={peakY} r="8" fill="#ec4899" />
        <text x="200" y={peakY - 15} textAnchor="middle" className="text-xs fill-pink-700 font-medium">
          Transition State
        </text>

        <circle cx="540" cy={endY} r="8" fill={isExothermic ? "#10b981" : "#f59e0b"} />
        <text
          x="540"
          y={endY + 25}
          textAnchor="middle"
          className={`text-xs font-medium ${isExothermic ? "fill-emerald-700" : "fill-amber-700"}`}
        >
          Products
        </text>
      </svg>
    </div>
  );
};

// Main Visualization Component
export default function ChemicalVisualization({ data }) {
  const [activeView, setActiveView] = useState("2d");
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const visualizationRef = useRef(null);

  const chemicals = data?.chemicals || [];
  const products = data?.reaction_details?.products_formed || [];
  const energyProfile = data?.energy_profile || {};
  const balancedEquation = data?.reaction_details?.balanced_equation || "";
  const hazardous = isHazardLevel(data?.safety_status?.level);

  const exportAsImage = async (format = "png") => {
    if (!visualizationRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(visualizationRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
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

  return (
    <Card
      className={`border-slate-200 shadow-sm transition-all duration-300 ${
        isFullscreen ? "fixed inset-4 z-50 overflow-auto" : ""
      }`}
    >
      <CardHeader className="border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#02988C] rounded-xl flex items-center justify-center flex-shrink-0">
              <Atom className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">Structures</CardTitle>
              <p className="text-xs text-slate-500">2D structures from PubChem</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen((f) => !f)} className="h-8 w-8 p-0">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportAsImage("png")}
              disabled={isExporting}
              className="h-8 gap-1.5"
            >
              <Download className="w-3 h-3" />
              <span className="text-xs">Export PNG</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4" ref={visualizationRef}>
        {hazardous && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Hazardous combination.</strong> These structures show what forms if the products are mixed. Do not mix them.
            </span>
          </div>
        )}

        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-xs mx-auto mb-4">
            <TabsTrigger value="2d" className="flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              Structures
            </TabsTrigger>
            <TabsTrigger value="pathway" className="flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              Energy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="2d" className="space-y-6">
            {balancedEquation && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Balanced equation</p>
                <p className="font-mono text-base sm:text-lg text-slate-900 break-words">
                  <FormulaText text={balancedEquation} />
                </p>
              </div>
            )}

            <div className="flex flex-col xl:flex-row xl:items-start gap-6">
              <section className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-[#02988C]" />
                  What you're mixing
                </h4>
                <div className="grid grid-cols-2 gap-4 justify-items-center">
                  {chemicals.map((chem, idx) => (
                    <motion.div
                      key={idx}
                      className="w-full flex justify-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                    >
                      <MoleculeTile
                        name={chem.name}
                        scientificName={chem.scientific_name}
                        formula={chem.molecular_formula}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>

              <div className="flex xl:flex-col items-center justify-center gap-2 text-slate-400 xl:pt-24">
                <ArrowRight className="w-6 h-6 rotate-90 xl:rotate-0" />
                <span className="text-xs">forms</span>
              </div>

              <section className="flex-1 min-w-0">
                <h4
                  className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                    hazardous ? "text-red-700" : "text-slate-700"
                  }`}
                >
                  {hazardous ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  ) : (
                    <Beaker className="w-4 h-4 text-slate-500" />
                  )}
                  {hazardous ? "What forms (hazardous)" : "What forms"}
                </h4>
                {products.length === 0 ? (
                  <p className="text-sm text-slate-500">No reaction products predicted.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4 justify-items-center">
                    {products.slice(0, 4).map((product, idx) => (
                      <motion.div
                        key={idx}
                        className="w-full flex justify-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + idx * 0.08 }}
                      >
                        <MoleculeTile
                          name={product.name}
                          formula={product.formula}
                          isProduct
                          hazards={product.hazards || []}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </TabsContent>

          <TabsContent value="pathway" className="space-y-4">
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Illustrative energy profile. Values are model estimates, not measured data. Do not use them for
                process design.
              </span>
            </div>

            <ReactionPathway energyProfile={energyProfile} />

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-1">Activation energy (est.)</p>
                <p className="text-lg font-bold text-slate-900">{energyProfile.activation_energy || 0} kJ/mol</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-1">ΔH (est.)</p>
                <p className="text-lg font-bold text-slate-900">{energyProfile.energy_change || 0} kJ/mol</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-1">Reaction type</p>
                <p className="text-lg font-bold text-slate-900">{energyProfile.type || "Unknown"}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
