import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Search, Loader2, AlertTriangle } from "lucide-react";
import { lookupBarcode } from "@/functions/lookupBarcode";

const EXAMPLE_BARCODE = "8901030704944"; // Nivea Creme

export default function ScanIngredientsModal({ isOpen, onClose, onIngredientsAdd }) {
  const [barcode, setBarcode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setBarcode("");
      setIsLoading(false);
      setProductInfo(null);
      setError(null);
    }
  }, [isOpen]);

  const handleLookup = async () => {
    if (!barcode.trim()) return;
    setIsLoading(true);
    setProductInfo(null);
    setError(null);
    try {
      const response = await lookupBarcode({ barcode });
      if (response?.data?.products?.length > 0) {
        setProductInfo(response.data.products[0]);
      } else {
        setError('Product not found. Please check the barcode or try another product.');
      }
    } catch (err) {
      console.error('Lookup failed:', err);
      setError('Failed to look up barcode. The service may be unavailable or the barcode is invalid.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIngredients = () => {
    if (productInfo?.ingredients) {
      const newIngredients = productInfo.ingredients.map(ing => ({
        name: ing.text || "Unknown Ingredient",
        purpose: "Scanned from product",
        eco_friendly: false,
        allergen: false,
      }));
      onIngredientsAdd(newIngredients);
      onClose();
    }
  };

  const copyExample = () => {
    navigator.clipboard.writeText(EXAMPLE_BARCODE);
    setBarcode(EXAMPLE_BARCODE);
  };
  
  const handleEnterPress = (e) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Scan Ingredients from Product
          </DialogTitle>
          <DialogDescription>
            Enter a real product barcode to look up its ingredients and add them to your formula.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter barcode number..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyPress={handleEnterPress}
              disabled={isLoading}
            />
            <Button
              onClick={handleLookup}
              disabled={!barcode.trim() || isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Look up
                </>
              )}
            </Button>
          </div>
          
          <div className="text-xs text-slate-500 text-center">
            Try a real barcode, like from a soda can or shampoo bottle. <br/>
            Example (Nivea Creme):
            <button
              onClick={copyExample}
              className="ml-2 font-mono text-teal-600 hover:text-teal-800 p-1 rounded-md bg-teal-50 inline-flex items-center gap-1"
            >
              {EXAMPLE_BARCODE}
              <Copy className="w-3 h-3" />
            </button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Lookup Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {productInfo && (
            <div className="p-4 border rounded-lg bg-slate-50">
              <h4 className="font-semibold text-slate-800">{productInfo.product_name}</h4>
              <p className="text-sm text-slate-600">
                Found {productInfo.ingredients?.length || 0} ingredients.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddIngredients} disabled={!productInfo || !productInfo.ingredients}>
            Add Ingredients
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}