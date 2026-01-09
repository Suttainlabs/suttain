
import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  History, Search, Filter, Calendar, Beaker,
  ArrowLeft, Eye, Download, Trash2, MoreVertical, Loader2, AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client'; // Added base44 import
import AuthContext from '../components/auth/AuthContext';
import AuthGate from '../components/auth/AuthGate';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FormulaHistory() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formulaHistory, setFormulaHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadFormulas();
    }
  }, [user]);

  const loadFormulas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const formulas = await base44.entities.Formula.list('-updated_date', 100); // Changed Formula.list to base44.entities.Formula.list
      
      // Map formulas to the expected format
      const mappedFormulas = formulas.map(formula => ({
        id: formula.id,
        name: formula.name || 'Untitled Formula',
        type: formula.product_type || 'custom',
        created_date: new Date(formula.created_date),
        ingredients_count: formula.ingredients?.length || 0,
        completion_percentage: formula.status === 'completed' ? 100 : (formula.last_step ? (formula.last_step / 5) * 100 : 50),
        business_mode: formula.is_business_mode || false,
        full_data: formula
      }));
      
      setFormulaHistory(mappedFormulas);
    } catch (error) {
      console.error('Failed to load formulas:', error);
      setError('Failed to load your formulas. Please try again.');
      setFormulaHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <AuthGate
          featureName="Formula History"
          featureDescription="Please log in to view your saved formulas and continue working on your projects."
        />
      </div>
    );
  }

  const filteredHistory = formulaHistory.filter(formula => {
    const matchesSearch = formula.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || formula.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeDisplayName = (type) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCompletionColor = (percentage) => {
    if (percentage === 100) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (percentage >= 80) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  const handleView = (formula) => {
    // Navigate to generator with the formula data
    navigate(createPageUrl('generator'), {
      state: {
        formulaToLoad: formula.full_data
      }
    });
  };

  const handleExport = (formula) => {
    const exportData = `
Formula: ${formula.name}
Type: ${getTypeDisplayName(formula.type)}
Date: ${format(formula.created_date, 'MMM d, yyyy')}
Ingredients: ${formula.ingredients_count}
Completion: ${formula.completion_percentage}%
Business Mode: ${formula.business_mode ? 'Yes' : 'No'}
    `.trim();

    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formula.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (formulaId) => {
    if (window.confirm('Are you sure you want to delete this formula? This action cannot be undone.')) {
      try {
        await base44.entities.Formula.delete(formulaId); // Changed Formula.delete to base44.entities.Formula.delete
        setFormulaHistory(prev => prev.filter(f => f.id !== formulaId));
      } catch (error) {
        console.error('Failed to delete formula:', error);
        alert('Failed to delete formula. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Mobile-first header */}
          <div className="mb-6 sm:mb-8">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl('generator'))}
              className="mb-4 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Generator
            </Button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center sm:text-left"
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-3 mb-2">
                <History className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                Formula History
              </h1>
              <p className="text-slate-600 text-sm sm:text-base">
                View and manage your recently generated formulas
              </p>
            </motion.div>
          </div>

          {/* Mobile-optimized search and filters */}
          <Card className="mb-6 shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search your formulas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="flex-1 px-3 py-3 border rounded-lg bg-white text-base"
                  >
                    <option value="all">All Product Types</option>
                    <option value="all_purpose_cleaner">All-Purpose Cleaner</option>
                    <option value="hand_soap">Hand Soap</option>
                    <option value="facial_moisturizer">Facial Moisturizer</option>
                    <option value="body_wash">Body Wash</option>
                    <option value="shampoo">Shampoo</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card className="shadow-lg">
              <CardContent className="p-12 text-center">
                <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-600">Loading your formulas...</p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Card className="shadow-lg border-rose-200">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-rose-700 mb-2">{error}</h3>
                <Button onClick={loadFormulas} variant="outline" className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Mobile-optimized formula cards */}
          {!isLoading && !error && (
            <div className="space-y-4">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((formula, index) => (
                  <motion.div
                    key={formula.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-xl transition-shadow shadow-lg">
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4">
                          {/* Header with title and menu */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-slate-900 text-lg sm:text-xl leading-tight mb-2">
                                {formula.name}
                              </h3>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="outline" className="text-xs font-medium">
                                  {getTypeDisplayName(formula.type)}
                                </Badge>
                                {formula.business_mode && (
                                  <Badge className="bg-violet-100 text-violet-800 text-xs">
                                    Business Mode
                                  </Badge>
                                )}
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getCompletionColor(formula.completion_percentage)}`}
                                >
                                  {formula.completion_percentage}% Complete
                                </Badge>
                              </div>
                            </div>

                            {/* Mobile dropdown menu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10">
                                  <MoreVertical className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleView(formula)}>
                                  <Eye className="w-4 h-4 mr-3" />
                                  View & Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport(formula)}>
                                  <Download className="w-4 h-4 mr-3" />
                                  Export Formula
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(formula.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-3" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Stats row */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-700 truncate">
                                {format(formula.created_date, 'MMM d, yyyy')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
                              <Beaker className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-700">
                                {formula.ingredients_count} ingredients
                              </span>
                            </div>
                          </div>

                          {/* Action buttons - mobile */}
                          <div className="grid grid-cols-2 gap-3 sm:hidden">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(formula)}
                              className="w-full"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExport(formula)}
                              className="w-full"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="shadow-lg">
                  <CardContent className="p-8 sm:p-12 text-center">
                    <History className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300 mx-auto mb-6" />
                    <h3 className="text-xl sm:text-2xl font-medium text-slate-700 mb-4">
                      No Formula History Found
                    </h3>
                    <p className="text-slate-500 mb-8 text-sm sm:text-base max-w-md mx-auto">
                      {searchTerm || filterType !== 'all'
                        ? 'Try adjusting your search or filters to find your formulas'
                        : 'Start creating formulas to build your personal library'
                      }
                    </p>
                    <Button
                      onClick={() => navigate(createPageUrl('generator'))}
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      <Beaker className="w-5 h-5 mr-2" />
                      Create Your First Formula
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
