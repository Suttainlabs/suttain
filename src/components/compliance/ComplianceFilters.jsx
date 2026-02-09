import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Filter, X, Save, ChevronDown, ChevronUp, Check, 
  Bookmark, Trash2, AlertTriangle, Shield, Globe 
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REGULATIONS = [
  { id: 'FDA', name: 'FDA (US)', region: 'USA' },
  { id: 'EPA', name: 'EPA (US)', region: 'USA' },
  { id: 'TSCA', name: 'TSCA (US)', region: 'USA' },
  { id: 'Prop65', name: 'Prop 65 (California)', region: 'USA' },
  { id: 'CPSC', name: 'CPSC (US)', region: 'USA' },
  { id: 'REACH', name: 'REACH (EU)', region: 'EU' },
  { id: 'CLP', name: 'CLP (EU)', region: 'EU' },
  { id: 'EU_Cosmetics', name: 'EU Cosmetics Regulation', region: 'EU' },
  { id: 'WHMIS', name: 'WHMIS (Canada)', region: 'Canada' },
  { id: 'CEPA', name: 'CEPA (Canada)', region: 'Canada' },
  { id: 'GHS', name: 'GHS (Global)', region: 'Global' },
  { id: 'OECD', name: 'OECD Guidelines', region: 'Global' },
  { id: 'NMPA', name: 'NMPA (China)', region: 'Asia' },
  { id: 'PMDA', name: 'PMDA (Japan)', region: 'Asia' },
  { id: 'MFDS', name: 'MFDS (Korea)', region: 'Asia' },
];

const HAZARD_LEVELS = [
  { id: 'Compliant', name: 'Compliant', color: 'bg-green-100 text-green-700' },
  { id: 'Warning', name: 'Requires Warning', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'Restricted', name: 'Restricted', color: 'bg-amber-100 text-amber-700' },
  { id: 'Banned', name: 'Banned', color: 'bg-red-100 text-red-700' },
];

const INGREDIENT_TYPES = [
  { id: 'preservative', name: 'Preservatives' },
  { id: 'surfactant', name: 'Surfactants' },
  { id: 'fragrance', name: 'Fragrances' },
  { id: 'colorant', name: 'Colorants' },
  { id: 'emulsifier', name: 'Emulsifiers' },
  { id: 'active', name: 'Active Ingredients' },
  { id: 'solvent', name: 'Solvents' },
  { id: 'thickener', name: 'Thickeners' },
];

const ComplianceFilters = ({ onFilterChange, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filters, setFilters] = useState({
    regulations: [],
    hazardLevels: [],
    ingredientTypes: [],
    dateRange: 'all',
    searchText: ''
  });
  const [savedFilters, setSavedFilters] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    loadSavedFilters();
  }, []);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const loadSavedFilters = async () => {
    try {
      const user = await base44.auth.me();
      if (user?.saved_compliance_filters) {
        setSavedFilters(user.saved_compliance_filters);
      }
    } catch (error) {
      console.error('Failed to load saved filters:', error);
    }
  };

  const saveFilter = async () => {
    if (!filterName.trim()) return;
    
    const newFilter = {
      id: Date.now().toString(),
      name: filterName,
      filters: { ...filters }
    };
    
    const updatedFilters = [...savedFilters, newFilter];
    
    try {
      await base44.auth.updateMe({ saved_compliance_filters: updatedFilters });
      setSavedFilters(updatedFilters);
      setFilterName('');
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Failed to save filter:', error);
    }
  };

  const deleteFilter = async (filterId) => {
    const updatedFilters = savedFilters.filter(f => f.id !== filterId);
    try {
      await base44.auth.updateMe({ saved_compliance_filters: updatedFilters });
      setSavedFilters(updatedFilters);
    } catch (error) {
      console.error('Failed to delete filter:', error);
    }
  };

  const applyFilter = (savedFilter) => {
    setFilters(savedFilter.filters);
  };

  const toggleRegulation = (regId) => {
    setFilters(prev => ({
      ...prev,
      regulations: prev.regulations.includes(regId)
        ? prev.regulations.filter(r => r !== regId)
        : [...prev.regulations, regId]
    }));
  };

  const toggleHazardLevel = (levelId) => {
    setFilters(prev => ({
      ...prev,
      hazardLevels: prev.hazardLevels.includes(levelId)
        ? prev.hazardLevels.filter(l => l !== levelId)
        : [...prev.hazardLevels, levelId]
    }));
  };

  const toggleIngredientType = (typeId) => {
    setFilters(prev => ({
      ...prev,
      ingredientTypes: prev.ingredientTypes.includes(typeId)
        ? prev.ingredientTypes.filter(t => t !== typeId)
        : [...prev.ingredientTypes, typeId]
    }));
  };

  const clearFilters = () => {
    setFilters({
      regulations: [],
      hazardLevels: [],
      ingredientTypes: [],
      dateRange: 'all',
      searchText: ''
    });
  };

  const activeFilterCount = 
    filters.regulations.length + 
    filters.hazardLevels.length + 
    filters.ingredientTypes.length +
    (filters.dateRange !== 'all' ? 1 : 0) +
    (filters.searchText ? 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white border-2 border-slate-200 rounded-xl shadow-lg overflow-hidden mb-6"
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Filter className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Advanced Filters</h3>
            <p className="text-xs text-slate-500">
              {activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} active` : 'No filters applied'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={(e) => { e.stopPropagation(); clearFilters(); }}
              className="text-slate-500 hover:text-red-600"
            >
              <X className="w-4 h-4 mr-1" /> Clear
            </Button>
          )}
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 space-y-5"
          >
            {/* Saved Filters */}
            {savedFilters.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <Bookmark className="w-4 h-4" /> Saved Filters
                </Label>
                <div className="flex flex-wrap gap-2">
                  {savedFilters.map((sf) => (
                    <div key={sf.id} className="flex items-center gap-1">
                      <Badge
                        onClick={() => applyFilter(sf)}
                        className="cursor-pointer bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1"
                      >
                        {sf.name}
                      </Badge>
                      <button
                        onClick={() => deleteFilter(sf.id)}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">Search Products</Label>
              <Input
                value={filters.searchText}
                onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
                placeholder="Search by product name, brand, or ingredient..."
                className="border-slate-200"
              />
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">Date Range</Label>
              <Select 
                value={filters.dateRange} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="quarter">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Regulations Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Regulations
              </Label>
              <div className="flex flex-wrap gap-2">
                {REGULATIONS.map((reg) => (
                  <Badge
                    key={reg.id}
                    onClick={() => toggleRegulation(reg.id)}
                    className={`cursor-pointer transition-all text-xs ${
                      filters.regulations.includes(reg.id)
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filters.regulations.includes(reg.id) && <Check className="w-3 h-3 mr-1" />}
                    {reg.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Hazard Levels */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Hazard Status
              </Label>
              <div className="flex flex-wrap gap-2">
                {HAZARD_LEVELS.map((level) => (
                  <Badge
                    key={level.id}
                    onClick={() => toggleHazardLevel(level.id)}
                    className={`cursor-pointer transition-all text-xs ${
                      filters.hazardLevels.includes(level.id)
                        ? level.color + ' ring-2 ring-offset-1 ring-slate-400'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filters.hazardLevels.includes(level.id) && <Check className="w-3 h-3 mr-1" />}
                    {level.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Ingredient Types */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Ingredient Types
              </Label>
              <div className="flex flex-wrap gap-2">
                {INGREDIENT_TYPES.map((type) => (
                  <Badge
                    key={type.id}
                    onClick={() => toggleIngredientType(type.id)}
                    className={`cursor-pointer transition-all text-xs ${
                      filters.ingredientTypes.includes(type.id)
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filters.ingredientTypes.includes(type.id) && <Check className="w-3 h-3 mr-1" />}
                    {type.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Save Filter */}
            <div className="pt-4 border-t border-slate-200">
              {showSaveDialog ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder="Filter name..."
                    className="flex-1 h-9 text-sm"
                  />
                  <Button size="sm" onClick={saveFilter} className="bg-indigo-600 hover:bg-indigo-700">
                    <Save className="w-4 h-4 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowSaveDialog(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowSaveDialog(true)}
                  disabled={activeFilterCount === 0}
                  className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                >
                  <Bookmark className="w-4 h-4 mr-2" /> Save Current Filters
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ComplianceFilters;