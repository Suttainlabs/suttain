import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Eye, Printer } from 'lucide-react';

export default function PrintLabelModal({ isOpen, onClose, formula, businessMode, onActionComplete }) {
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Label</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { 
              font-family: 'Inter', sans-serif; 
              margin: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100%;
            }
            .label-container {
              border: 2px dashed #9ca3af;
              padding: 24px;
              width: 4in;
              height: 3in;
              display: flex;
              flex-direction: column;
            }
            h1 { font-size: 16px; font-weight: 700; margin: 0 0 8px 0; color: #1f2937; }
            h2 { font-size: 12px; font-weight: 600; margin: 12px 0 4px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; color: #374151;}
            p { font-size: 10px; margin: 0; color: #4b5563; }
            ul { list-style: none; padding: 0; margin: 0; font-size: 9px; color: #4b5563;}
            .ingredients { column-count: 2; column-gap: 16px; }
            .footer { margin-top: auto; font-size: 8px; color: #6b7281; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 8px; }
            @media print {
              .label-container { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            <h1>${formula.name}</h1>
            <p>${formula.description || `A formula for ${formula.productType?.replace(/_/g, ' ')}`}</p>
            
            <h2>Ingredients:</h2>
            <ul class="ingredients">
              ${formula.ingredients.map(ing => `<li>${ing.chemical_name}</li>`).join('')}
            </ul>

            <h2>Directions:</h2>
            <p>Follow formula instructions for use. For external use only unless specified otherwise.</p>

            <div class="footer">
              Batch Date: ${new Date().toLocaleDateString()} • Shelf Life: ${formula.properties?.shelf_life || '6 months'}
              <br/>
              ${businessMode ? `Manufactured for commercial use.` : 'For personal use only.'}
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    // Use a timeout to ensure content is loaded before printing
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);

    if (onActionComplete) {
      onActionComplete();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-6 h-6 text-sky-600" />
            Label Preview
          </DialogTitle>
          <DialogDescription>
            This is a preview of the product label based on your formula. Use the print button to generate a physical label.
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 p-6 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">{formula.name}</h3>
          <p className="text-sm text-slate-600 mb-4">
            {formula.description || `A formula for ${formula.productType?.replace(/_/g, ' ')}`}
          </p>
          <h4 className="text-sm font-semibold mb-2">Ingredients:</h4>
          <p className="text-xs text-slate-500">
            {formula.ingredients.map(ing => ing.chemical_name).join(', ')}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handlePrint} className="bg-sky-600 hover:bg-sky-700">
            <Printer className="w-4 h-4 mr-2" />
            Print Label
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}