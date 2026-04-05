import React, { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle2, XCircle, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const REGULATORY_DATABASE = {
  EU: {
    name: 'EU Cosmetic Regulation (EC 1223/2009)',
    banned: ['mercury', 'lead acetate', 'formaldehyde', 'boric acid', 'hexachlorophene', 'halogenated salicylanilides', 'nitrosamine compounds', 'certain phthalates'],
    restricted: {
      'phenol': 'Max 0.3%',
      'salicylic acid': 'Max 2%',
      'hydroquinone': 'Banned',
      'tretinoin': 'Banned in cosmetics',
      'resorcinol': 'Max 1%',
      'hydrogen peroxide': 'Max 12% in hair dye',
    },
    requirements: ['Safety assessment', 'Stability data', 'Microbiological testing', 'Toxicology report'],
    documentation: ['Product information file', 'Safety report', 'Stability data', 'Raw material declarations']
  },
  FDA: {
    name: 'FDA Cosmetic Regulations (21 CFR Part 700+)',
    banned: ['vinyl chloride', 'methylene chloride', 'chloroform', 'halogenated salicylanilides', 'bithionol', 'hexachlorophene (over 0.1%)'],
    restricted: {
      'lead acetate': 'Hair dyes only, max 0.6%',
      'formaldehyde': 'Max 0.1%',
      'selenium sulfide': 'Max 1% in shampoos',
      'hydroquinone': 'Max 2% OTC',
      'salicylic acid': 'Max 2% in cosmetics',
    },
    requirements: ['Manufacturing processes compliant', 'Ingredient declarations', 'Safety substantiation for claims'],
    documentation: ['Ingredient list', 'Manufacturing location registration', 'Facility inspection ready']
  },
  China: {
    name: 'China Cosmetics Regulation (2015)',
    banned: ['hexachlorophene', 'certain banned substances list'],
    restricted: {
      'sunscreen filters': 'Pre-approved list only',
      'preservatives': 'Approved list required',
      'colorants': 'Approved cosmetic colorants only',
    },
    requirements: ['Safety assessment', 'Bioequivalence testing for sunscreens', 'Stability data'],
    documentation: ['Chinese language labels', 'Safety report', 'Ingredient documentation']
  },
  Canada: {
    name: 'Canadian Cosmetic Regulations (Health Canada)',
    banned: ['boric acid', 'hexachlorophene', 'lead acetate', 'mercury compounds'],
    restricted: {
      'hydroquinone': 'Max 2%',
      'salicylic acid': 'Max 2%',
      'sunscreen actives': 'Approved list only',
    },
    requirements: ['Safety assessment', 'Stability testing'],
    documentation: ['Product information file', 'Safety report', 'Cosmetic license']
  }
};

export default function RegulatoryScanner({ ingredients = [], onClose }) {
  const [selectedRegions, setSelectedRegions] = useState(['EU', 'FDA']);

  const toggleRegion = (region) => {
    setSelectedRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const normalizeIngredient = (ing) => {
    if (typeof ing === 'string') return ing.toLowerCase().trim();
    if (typeof ing === 'object' && ing.chemical_name) return ing.chemical_name.toLowerCase().trim();
    return '';
  };

  const scanResults = useMemo(() => {
    const results = {};
    
    selectedRegions.forEach(region => {
      const regs = REGULATORY_DATABASE[region];
      results[region] = {
        ...regs,
        violations: [],
        warnings: [],
        compliant: []
      };

      ingredients.forEach(ing => {
        const normalizedIng = normalizeIngredient(ing);
        
        // Check banned list
        if (regs.banned.some(b => normalizedIng.includes(b))) {
          results[region].violations.push({
            ingredient: normalizedIng,
            type: 'banned',
            message: 'This ingredient is banned in this region',
            severity: 'critical'
          });
        }
        // Check restricted list
        else if (regs.restricted[normalizedIng]) {
          results[region].warnings.push({
            ingredient: normalizedIng,
            type: 'restricted',
            message: `Restricted: ${regs.restricted[normalizedIng]}`,
            severity: 'warning'
          });
        }
        else {
          results[region].compliant.push(normalizedIng);
        }
      });
    });

    return results;
  }, [ingredients, selectedRegions]);

  return (
    <div className="w-full space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Regulatory Compliance Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Region Selection */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Select regions to check:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(REGULATORY_DATABASE).map(region => (
                <button
                  key={region}
                  onClick={() => toggleRegion(region)}
                  className={cn(
                    'p-3 rounded-lg border-2 text-left transition-all font-medium',
                    selectedRegions.includes(region)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  )}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {selectedRegions.length > 0 && (
            <div className="space-y-4">
              <Tabs defaultValue={selectedRegions[0]} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  {selectedRegions.map(region => (
                    <TabsTrigger key={region} value={region} className="text-xs">
                      {region}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {selectedRegions.map(region => {
                  const result = scanResults[region];
                  const hasViolations = result.violations.length > 0;
                  const hasWarnings = result.warnings.length > 0;

                  return (
                    <TabsContent key={region} value={region} className="space-y-4">
                      <div className="text-sm text-slate-600 mb-4">
                        <p className="font-semibold mb-1">{result.name}</p>
                      </div>

                      {/* Critical Violations */}
                      {hasViolations && (
                        <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <p className="font-semibold text-red-900">
                              Banned Ingredients ({result.violations.length})
                            </p>
                          </div>
                          <div className="space-y-2">
                            {result.violations.map((v, idx) => (
                              <div key={idx} className="text-sm text-red-800 bg-white rounded p-2 border-l-3 border-red-500">
                                <p className="font-medium capitalize">{v.ingredient}</p>
                                <p className="text-xs text-red-700 mt-1">{v.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Warnings/Restrictions */}
                      {hasWarnings && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            <p className="font-semibold text-yellow-900">
                              Restricted Ingredients ({result.warnings.length})
                            </p>
                          </div>
                          <div className="space-y-2">
                            {result.warnings.map((w, idx) => (
                              <div key={idx} className="text-sm text-yellow-800 bg-white rounded p-2 border-l-3 border-yellow-500">
                                <p className="font-medium capitalize">{w.ingredient}</p>
                                <p className="text-xs text-yellow-700 mt-1">{w.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Compliant */}
                      {result.compliant.length > 0 && (
                        <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <p className="font-semibold text-green-900">
                              Compliant Ingredients ({result.compliant.length})
                            </p>
                          </div>
                          <p className="text-xs text-green-700">
                            {result.compliant.slice(0, 5).join(', ')}{result.compliant.length > 5 ? ', and more...' : ''}
                          </p>
                        </div>
                      )}

                      {/* Documentation Requirements */}
                      {!hasViolations && (
                        <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                          <p className="font-semibold text-blue-900 mb-3">Documentation Requirements:</p>
                          <ul className="space-y-2">
                            {result.documentation.map((doc, idx) => (
                              <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{doc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Overall Status */}
                      <div className={cn(
                        'p-3 rounded-lg font-semibold text-center text-sm',
                        hasViolations
                          ? 'bg-red-100 text-red-800'
                          : hasWarnings
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      )}>
                        {hasViolations
                          ? 'Not Compliant - Banned ingredients found'
                          : hasWarnings
                          ? 'Conditional - Restrictions apply'
                          : 'Compliant - No restrictions found'}
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      {onClose && (
        <Button variant="outline" onClick={onClose} className="w-full">
          Close Regulatory Check
        </Button>
      )}
    </div>
  );
}