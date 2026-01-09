
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScanLine, Search, Loader2, AlertTriangle, Check, Copy, PlusCircle } from 'lucide-react';
import { lookupBarcode } from '@/functions/lookupBarcode';
import { InvokeLLM } from '@/integrations/Core';

export default function BarcodeScannerModal({ isOpen, onClose, onScanSuccess }) {
    const [barcode, setBarcode] = useState('');
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleScan = async () => {
        if (!barcode) {
            setError("Please enter a barcode number.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setProduct(null);

        try {
             // Step 1: Get raw product data from the backend function
            const rawProductResponse = await lookupBarcode({ barcode });
            if (!rawProductResponse || !rawProductResponse.data || rawProductResponse.data.error) {
                setError(rawProductResponse?.data?.error || "Could not retrieve product data.");
                setIsLoading(false);
                return;
            }
            const rawProduct = rawProductResponse.data;

            // Step 2: Analyze ingredients with AI on the frontend
            const analysisResult = await InvokeLLM({
                prompt: `Analyze the following ingredient list from the product "${rawProduct.name}". For each ingredient, determine its primary purpose in a product like this, and assign a safety score and a sustainability score (both from 0 to 100, where 100 is best). If you identify a potential allergen or a noteworthy concern, add a brief "notes" field.

Ingredient List: ${rawProduct.ingredientsText}

Return ONLY a JSON object with a single key "ingredients" which is an array of objects. Each object in the array should have the keys: "name", "purpose", "safety", "sustainability", and optionally "notes".`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        ingredients: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    purpose: { type: "string" },
                                    safety: { type: "number" },
                                    sustainability: { type: "number" },
                                    notes: { type: "string" }
                                },
                                required: ["name", "purpose", "safety", "sustainability"]
                            }
                        }
                    }
                }
            });
            
            const finalProductData = { ...rawProduct, ingredients: analysisResult.ingredients || [] };
            setProduct(finalProductData);

        } catch(e) {
             setError(e.response?.data?.error || "An error occurred while looking up the barcode or analyzing ingredients.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddIngredients = () => {
        if (product && product.ingredients) {
            onScanSuccess(product.ingredients);
            handleClose();
        }
    };
    
    const handleClose = () => {
        setBarcode('');
        setProduct(null);
        setError(null);
        setIsLoading(false);
        onClose();
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] p-0">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <ScanLine className="w-6 h-6 text-teal-600"/>
                        Scan Ingredients from Product
                    </DialogTitle>
                    <DialogDescription>
                        Enter a real product barcode to look up its ingredients and add them to your formula.
                    </DialogDescription>
                </DialogHeader>
                <div className="p-6 pt-0">
                    <AnimatePresence mode="wait">
                        {product ? (
                             <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                             >
                                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                                <div className="max-h-60 overflow-y-auto space-y-2 p-3 bg-slate-50 rounded-md border">
                                    {product.ingredients.map((ing, index) => (
                                        <div key={index} className="text-sm text-slate-700">{ing.name}</div>
                                    ))}
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button onClick={handleAddIngredients}>
                                        <PlusCircle className="w-4 h-4 mr-2"/>
                                        Add {product.ingredients.length} Ingredients
                                    </Button>
                                </div>
                             </motion.div>
                        ) : (
                            <motion.div
                                key="scanner"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Enter barcode number..."
                                        value={barcode}
                                        onChange={(e) => { setBarcode(e.target.value); setError(null); }}
                                        onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                                        className="h-12 text-lg"
                                        disabled={isLoading}
                                    />
                                </div>
                                 {error && (
                                    <p className="text-sm text-red-600 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        {error}
                                    </p>
                                )}
                                <div>
                                    <Button onClick={handleScan} disabled={isLoading || !barcode} className="w-full">
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                        <span className="ml-2">Look up Product</span>
                                    </Button>
                                </div>
                                <div className="text-center text-xs text-slate-500 pt-2">
                                    <p>Try a real barcode, like from a soda can or shampoo bottle.</p>
                                    <p>Example (Nivea Creme): 
                                        <span className="font-mono text-slate-700 bg-slate-100 p-1 rounded-md mx-1">
                                            8901030704944
                                        </span>
                                        <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => copyToClipboard('8901030704944')}>
                                            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                        </Button>
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
