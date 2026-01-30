import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Thermometer,
  Gauge,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  Beaker,
  Scale,
  Timer,
  Droplets,
  AlertTriangle,
  Info,
  Atom,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SOLVENT_OPTIONS = [
  { value: "water", label: "Water (H₂O)", polarity: "high" },
  { value: "ethanol", label: "Ethanol", polarity: "medium" },
  { value: "acetone", label: "Acetone", polarity: "medium" },
  { value: "dmso", label: "DMSO", polarity: "high" },
  { value: "dichloromethane", label: "Dichloromethane", polarity: "low" },
  { value: "hexane", label: "Hexane", polarity: "very low" },
  { value: "toluene", label: "Toluene", polarity: "low" },
  { value: "none", label: "No Solvent (Neat)", polarity: "n/a" },
];

const CATALYST_OPTIONS = [
  { value: "none", label: "No Catalyst" },
  { value: "acid", label: "Acid Catalyst (H⁺)" },
  { value: "base", label: "Base Catalyst (OH⁻)" },
  { value: "palladium", label: "Palladium (Pd)" },
  { value: "platinum", label: "Platinum (Pt)" },
  { value: "nickel", label: "Nickel (Ni)" },
  { value: "enzyme", label: "Enzyme" },
  { value: "custom", label: "Custom Catalyst" },
];

export default function AdvancedReactionParameters({
  chemicals,
  parameters,
  onParametersChange,
  isExpanded,
  onToggleExpanded,
}) {
  const [stoichiometry, setStoichiometry] = useState(
    chemicals.reduce((acc, chem) => {
      acc[chem.id] = { coefficient: 1, isLimiting: false, amount: 0, unit: "mol" };
      return acc;
    }, {})
  );

  const handleParameterChange = (key, value) => {
    onParametersChange({ ...parameters, [key]: value });
  };

  const handleStoichiometryChange = (chemId, field, value) => {
    const newStoich = {
      ...stoichiometry,
      [chemId]: { ...stoichiometry[chemId], [field]: value },
    };
    
    // If setting one as limiting, unset others
    if (field === "isLimiting" && value) {
      Object.keys(newStoich).forEach((id) => {
        if (id !== chemId) {
          newStoich[id].isLimiting = false;
        }
      });
    }
    
    setStoichiometry(newStoich);
    onParametersChange({ ...parameters, stoichiometry: newStoich });
  };

  const calculateTheoreticalYield = () => {
    const limitingReactant = Object.entries(stoichiometry).find(
      ([_, data]) => data.isLimiting
    );
    if (!limitingReactant) return null;
    
    const [chemId, data] = limitingReactant;
    const chem = chemicals.find((c) => c.id === chemId);
    if (!chem || !data.amount) return null;
    
    return {
      limitingReactant: chem.name,
      moles: data.amount,
      theoretical: (data.amount * data.coefficient).toFixed(4),
    };
  };

  const yieldInfo = calculateTheoreticalYield();

  return (
    <Card className="border-2 border-slate-200 bg-white/90 backdrop-blur-sm shadow-lg">
      <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800">
                    Advanced Reaction Parameters
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    Configure environmental conditions & stoichiometry
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-indigo-50 text-indigo-700 border-indigo-200"
                >
                  {isExpanded ? "Expanded" : "Collapsed"}
                </Badge>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-6 space-y-8">
            {/* Environmental Conditions Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <Thermometer className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-slate-800">
                  Environmental Conditions
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Temperature */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      Temperature
                    </Label>
                    <span className="text-sm font-bold text-orange-600">
                      {parameters.temperature || 25}°C
                    </span>
                  </div>
                  <Slider
                    value={[parameters.temperature || 25]}
                    onValueChange={([value]) =>
                      handleParameterChange("temperature", value)
                    }
                    min={-50}
                    max={300}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>-50°C</span>
                    <span>Room temp (25°C)</span>
                    <span>300°C</span>
                  </div>
                </div>

                {/* Pressure */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-blue-500" />
                      Pressure
                    </Label>
                    <span className="text-sm font-bold text-blue-600">
                      {parameters.pressure || 1} atm
                    </span>
                  </div>
                  <Slider
                    value={[parameters.pressure || 1]}
                    onValueChange={([value]) =>
                      handleParameterChange("pressure", value)
                    }
                    min={0.01}
                    max={100}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Vacuum</span>
                    <span>1 atm (STP)</span>
                    <span>100 atm</span>
                  </div>
                </div>

                {/* pH */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-cyan-500" />
                      pH Level
                    </Label>
                    <span
                      className={`text-sm font-bold ${
                        (parameters.pH || 7) < 6
                          ? "text-red-600"
                          : (parameters.pH || 7) > 8
                          ? "text-purple-600"
                          : "text-green-600"
                      }`}
                    >
                      {parameters.pH || 7}
                    </span>
                  </div>
                  <Slider
                    value={[parameters.pH || 7]}
                    onValueChange={([value]) =>
                      handleParameterChange("pH", value)
                    }
                    min={0}
                    max={14}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="text-red-500">Acidic (0)</span>
                    <span className="text-green-500">Neutral (7)</span>
                    <span className="text-purple-500">Basic (14)</span>
                  </div>
                </div>

                {/* Reaction Time */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Timer className="w-4 h-4 text-amber-500" />
                    Reaction Time
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={parameters.reactionTime || 60}
                      onChange={(e) =>
                        handleParameterChange(
                          "reactionTime",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="flex-1"
                      min={0}
                    />
                    <Select
                      value={parameters.timeUnit || "min"}
                      onValueChange={(value) =>
                        handleParameterChange("timeUnit", value)
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sec">sec</SelectItem>
                        <SelectItem value="min">min</SelectItem>
                        <SelectItem value="hr">hr</SelectItem>
                        <SelectItem value="day">day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Solvent */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Beaker className="w-4 h-4 text-teal-500" />
                    Solvent
                  </Label>
                  <Select
                    value={parameters.solvent || "water"}
                    onValueChange={(value) =>
                      handleParameterChange("solvent", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select solvent" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOLVENT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center justify-between gap-2">
                            <span>{opt.label}</span>
                            <Badge variant="outline" className="text-xs">
                              {opt.polarity}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Catalyst */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Atom className="w-4 h-4 text-violet-500" />
                    Catalyst
                  </Label>
                  <Select
                    value={parameters.catalyst || "none"}
                    onValueChange={(value) =>
                      handleParameterChange("catalyst", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select catalyst" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATALYST_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Stoichiometry Section */}
            {chemicals.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-semibold text-slate-800">
                      Reaction Stoichiometry
                    </h3>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          Define molar ratios and identify the limiting reactant
                          to calculate theoretical yield.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="space-y-4">
                  {chemicals.map((chem) => {
                    const stoichData = stoichiometry[chem.id] || {
                      coefficient: 1,
                      isLimiting: false,
                      amount: 0,
                      unit: "mol",
                    };

                    return (
                      <motion.div
                        key={chem.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          stoichData.isLimiting
                            ? "border-amber-400 bg-amber-50"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center">
                              <FlaskConical className="w-4 h-4 text-teal-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 capitalize">
                                {chem.display_name || chem.name}
                              </p>
                              {chem.molecular_formula && (
                                <p className="text-xs text-slate-500">
                                  {chem.molecular_formula}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-slate-600 whitespace-nowrap">
                              Coefficient:
                            </Label>
                            <Input
                              type="number"
                              value={stoichData.coefficient}
                              onChange={(e) =>
                                handleStoichiometryChange(
                                  chem.id,
                                  "coefficient",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-16 h-8 text-center"
                              min={1}
                              max={10}
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-slate-600 whitespace-nowrap">
                              Amount:
                            </Label>
                            <Input
                              type="number"
                              value={stoichData.amount}
                              onChange={(e) =>
                                handleStoichiometryChange(
                                  chem.id,
                                  "amount",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-20 h-8"
                              min={0}
                              step={0.01}
                            />
                            <Select
                              value={stoichData.unit}
                              onValueChange={(value) =>
                                handleStoichiometryChange(chem.id, "unit", value)
                              }
                            >
                              <SelectTrigger className="w-20 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mol">mol</SelectItem>
                                <SelectItem value="mmol">mmol</SelectItem>
                                <SelectItem value="g">g</SelectItem>
                                <SelectItem value="mg">mg</SelectItem>
                                <SelectItem value="mL">mL</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            variant={stoichData.isLimiting ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                              handleStoichiometryChange(
                                chem.id,
                                "isLimiting",
                                !stoichData.isLimiting
                              )
                            }
                            className={`h-8 ${
                              stoichData.isLimiting
                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                : "border-amber-300 text-amber-700 hover:bg-amber-50"
                            }`}
                          >
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {stoichData.isLimiting ? "Limiting" : "Set Limiting"}
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Theoretical Yield Calculation */}
                {yieldInfo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Scale className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-emerald-800 font-medium">
                          Theoretical Yield Calculation
                        </p>
                        <p className="text-emerald-700">
                          Based on{" "}
                          <span className="font-bold">
                            {yieldInfo.limitingReactant}
                          </span>{" "}
                          as limiting reactant ({yieldInfo.moles} mol)
                        </p>
                        <p className="text-lg font-bold text-emerald-900 mt-1">
                          Max theoretical product: {yieldInfo.theoretical} mol
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Quick Presets */}
            <div className="pt-4 border-t border-slate-200">
              <Label className="text-sm font-medium text-slate-700 mb-3 block">
                Quick Presets
              </Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onParametersChange({
                      ...parameters,
                      temperature: 25,
                      pressure: 1,
                      pH: 7,
                      solvent: "water",
                    })
                  }
                  className="text-xs"
                >
                  Standard (STP)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onParametersChange({
                      ...parameters,
                      temperature: 100,
                      pressure: 1,
                      pH: 7,
                      solvent: "water",
                    })
                  }
                  className="text-xs"
                >
                  Reflux (H₂O)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onParametersChange({
                      ...parameters,
                      temperature: -78,
                      pressure: 1,
                      solvent: "dichloromethane",
                    })
                  }
                  className="text-xs"
                >
                  Cryogenic (-78°C)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onParametersChange({
                      ...parameters,
                      temperature: 150,
                      pressure: 50,
                      catalyst: "palladium",
                    })
                  }
                  className="text-xs"
                >
                  High Pressure
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onParametersChange({
                      ...parameters,
                      pH: 2,
                      catalyst: "acid",
                      solvent: "water",
                    })
                  }
                  className="text-xs"
                >
                  Acidic Conditions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onParametersChange({
                      ...parameters,
                      pH: 12,
                      catalyst: "base",
                      solvent: "water",
                    })
                  }
                  className="text-xs"
                >
                  Basic Conditions
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}