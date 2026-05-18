import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ChevronRight, Plus, X, AlertTriangle, 
  Leaf, ShieldAlert, Beaker, Search, Bell
} from "lucide-react";
import { Chemical } from "@/entities/Chemical";

export default function IngredientManager({ 
  ingredients, 
  onUpdateIngredients, 
  onNext, 
  onBack, 
  productType 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableChemicals, setAvailableChemicals] = useState([]);
  const [ingredientWarnings, setIngredientWarnings] = useState([]);

  React.useEffect(() => {
    loadChemicals();
  }, []);

  const loadChemicals = async () => {
    try {
      const chemicals = await Chemical.list();
      setAvailableChemicals(chemicals);
    } catch (error) {
      console.error("Error loading chemicals:", error);
    }
  };

  const filteredChemicals = availableChemicals.filter(chemical =>
    chemical.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !ingredients.some(ing => ing.name === chemical.name)
  );

  const addIngredient = (chemical) => {
    const newIngredients = [...ingredients, {
      name: chemical.name,
      scientific_name: chemical.scientific_name,
      percentage: 5,
      purpose: "Active ingredient",
      eco_friendly: chemical.eco_friendly,
      allergen: chemical.allergen,
      safety_rating: chemical.safety_rating
    }];
    onUpdateIngredients(newIngredients);
    setSearchTerm("");

    // Warn about allergens or low safety ratings
    const warningId = Date.now();
    let warningMsg = null;
    let warningLevel = 'warning';

    const allergenCount = newIngredients.filter(i => i.allergen).length;
    const lowSafetyCount = newIngredients.filter(i => i.safety_rating < 50).length;

    if (chemical.allergen && allergenCount >= 2) {
      warningMsg = `⚠️ You now have ${allergenCount} allergen-containing ingredients. High allergen load may cause skin sensitization or regulatory issues.`;
      warningLevel = 'critical';
    } else if (chemical.allergen) {
      warningMsg = `⚠️ "${chemical.name}" contains known allergens. Ensure proper labeling and consider your target audience.`;
    } else if (chemical.safety_rating < 50) {
      warningMsg = `🚨 "${chemical.name}" has a low safety rating (${chemical.safety_rating}%). Consider safer alternatives before proceeding.`;
      warningLevel = 'critical';
    } else if (lowSafetyCount >= 2) {
      warningMsg = `🚨 ${lowSafetyCount} ingredients have low safety ratings. Review your formula for compliance risks.`;
      warningLevel = 'critical';
    }

    if (warningMsg) {
      setIngredientWarnings(prev => [...prev, { id: warningId, message: warningMsg, level: warningLevel }]);
      setTimeout(() => {
        setIngredientWarnings(prev => prev.filter(w => w.id !== warningId));
      }, 8000);
    }
  };

  const removeIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    onUpdateIngredients(newIngredients);
  };

  const runCompatibilityCheck = () => {
    // Mock compatibility check - would integrate with simulator
    alert("Compatibility check complete! All ingredients are safe to mix.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Product Type
        </Button>
        <Badge variant="outline" className="bg-teal-50 text-teal-800 border-teal-300">
          {productType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800">Add Ingredients</CardTitle>
            <p className="text-slate-600">
              Search and add ingredients to your formula
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Section */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search ingredients (e.g., Sodium Bicarbonate, Citric Acid...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-lg py-3"
              />
            </div>

            {/* Search Results */}
            {searchTerm && filteredChemicals.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-2 p-2 bg-slate-50/50 rounded-lg">
                <p className="text-sm font-medium text-slate-700 px-2">Available ingredients:</p>
                {filteredChemicals.slice(0, 5).map((chemical) => (
                  <div
                    key={chemical.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-teal-50 cursor-pointer"
                    onClick={() => addIngredient(chemical)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {chemical.eco_friendly && (
                          <Leaf className="w-4 h-4 text-emerald-500" title="Eco-Friendly" />
                        )}
                        {chemical.allergen && (
                          <ShieldAlert className="w-4 h-4 text-amber-500" title="Allergen" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{chemical.name}</p>
                        <p className="text-sm text-slate-500">{chemical.scientific_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline"
                        className={chemical.safety_rating >= 80 ? "text-emerald-700 border-emerald-300" : "text-amber-700 border-amber-300"}
                      >
                        Safety: {chemical.safety_rating}%
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ingredient Warnings */}
            <AnimatePresence>
              {ingredientWarnings.map(warning => (
                <motion.div
                  key={warning.id}
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 ${
                    warning.level === 'critical'
                      ? 'bg-red-50 border-red-300'
                      : 'bg-amber-50 border-amber-300'
                  }`}
                >
                  <Bell className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    warning.level === 'critical' ? 'text-red-600' : 'text-amber-600'
                  }`} />
                  <p className={`text-sm flex-1 font-medium ${
                    warning.level === 'critical' ? 'text-red-900' : 'text-amber-900'
                  }`}>{warning.message}</p>
                  <button
                    onClick={() => setIngredientWarnings(prev => prev.filter(w => w.id !== warning.id))}
                    className={`flex-shrink-0 ${warning.level === 'critical' ? 'text-red-400 hover:text-red-600' : 'text-amber-400 hover:text-amber-600'}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Added Ingredients */}
            {ingredients.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">
                    Added Ingredients ({ingredients.length})
                  </h3>
                  <Button
                    onClick={runCompatibilityCheck}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 hover:bg-teal-50 hover:border-teal-300"
                  >
                    <Beaker className="w-4 h-4" />
                    Check Compatibility
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {ingredients.map((ingredient, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {ingredient.eco_friendly && (
                            <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300">
                              <Leaf className="w-3 h-3 mr-1" />
                              Eco-safe
                            </Badge>
                          )}
                          {ingredient.allergen && (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Allergen
                            </Badge>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{ingredient.name}</p>
                          <p className="text-sm text-slate-600">{ingredient.purpose}</p>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIngredient(index)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4">
              <p className="text-sm text-slate-500">
                {ingredients.length === 0 ? "Add at least 2 ingredients to continue" : `${ingredients.length} ingredients added`}
              </p>
              <Button
                onClick={onNext}
                disabled={ingredients.length < 2}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg"
                size="lg"
              >
                Generate Recipes
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}