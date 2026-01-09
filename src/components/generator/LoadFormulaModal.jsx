import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Beaker } from "lucide-react";
import { Formula } from "@/entities/Formula";

export default function LoadFormulaModal({ isOpen, onClose, onSelectFormula }) {
  const [formulas, setFormulas] = useState([]);
  const [filteredFormulas, setFilteredFormulas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFormulas();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = formulas.filter(formula => 
        formula.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formula.product_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFormulas(filtered);
    } else {
      setFilteredFormulas(formulas);
    }
  }, [searchTerm, formulas]);

  const loadFormulas = async () => {
    setIsLoading(true);
    try {
      // Use the correct Formula.list() method
      const userFormulas = await Formula.list('-updated_date', 100); // Get last 100 formulas
      setFormulas(userFormulas);
      setFilteredFormulas(userFormulas);
    } catch (error) {
      console.error("Failed to load formulas:", error);
      setFormulas([]);
      setFilteredFormulas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFormula = (formula) => {
    onSelectFormula(formula);
    onClose();
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Unknown date";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Beaker className="w-5 h-5 text-teal-600" />
            Load Saved Formula
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search formulas by name or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="overflow-y-auto max-h-96 space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredFormulas.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                {formulas.length === 0 ? "No saved formulas found" : "No formulas match your search"}
              </div>
            ) : (
              filteredFormulas.map((formula) => (
                <Card
                  key={formula.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border border-slate-200"
                  onClick={() => handleSelectFormula(formula)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-900 text-lg">
                        {formula.name || "Unnamed Formula"}
                      </h3>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {formula.product_type?.replace(/_/g, ' ') || "Unknown Type"}
                        </Badge>
                        {formula.status && (
                          <Badge 
                            variant="outline" 
                            className={formula.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}
                          >
                            {formula.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-slate-600 text-sm mb-3">
                      {formula.description || "No description available"}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Updated: {formatDate(formula.updated_date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {formula.ingredients && (
                          <span>{formula.ingredients.length} ingredients</span>
                        )}
                        {formula.is_business_mode && (
                          <Badge variant="outline" className="text-xs bg-violet-50 text-violet-700 border-violet-200">
                            Business Mode
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}