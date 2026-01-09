import React, { useState, useContext } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Download, Loader2, FileText, User, Building } from 'lucide-react';
import { generateFormulaPDF } from '@/functions/generateFormulaPDF';
import { base44 } from '@/api/base44Client';
import AuthContext from '../auth/AuthContext';
import { toast } from 'sonner';

export default function PDFExportModal({ isOpen, onClose, formula, businessMode, onActionComplete }) {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  // Default to business mode if enabled, otherwise individual.
  const [exportType, setExportType] = useState(businessMode ? 'business' : 'individual');

  const handleExport = async () => {
    setIsLoading(true);
    try {
      // The function now returns the PDF directly as an ArrayBuffer in the response body.
      const response = await generateFormulaPDF({
        formulaData: formula,
        exportType: exportType
      });

      // The raw response data is the ArrayBuffer
      const data = response.data;
      
      // Create download link for the PDF blob
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${formula.name?.replace(/\s+/g, '_') || 'formula'}_${exportType}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Send PDF to user's email
      if (user?.email) {
        try {
          const uploadResult = await base44.integrations.Core.UploadFile({ file: blob });
          const fileUrl = uploadResult?.file_url;
          if (fileUrl) {
            await base44.functions.invoke('sendEmailResend', {
              to: user.email,
              subject: `Your Formula Report - ${formula.name || 'Formula'}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: ${businessMode ? '#9531F5' : '#02988C'};">Your Formula Report</h2>
                  <p>Hi ${user.full_name || 'there'},</p>
                  <p>Your formula PDF has been generated and is ready for download.</p>
                  <p><strong>Formula:</strong> ${formula.name || 'Untitled Formula'}</p>
                  <p><strong>Ingredients:</strong> ${formula.ingredients?.length || 0} ingredients</p>
                  <p><strong>Report Type:</strong> ${exportType === 'business' ? 'Business' : 'Individual'}</p>
                  <p><a href="${fileUrl}" style="display: inline-block; background: linear-gradient(135deg, ${businessMode ? '#9531F5, #7c3aed' : '#02988C, #09D2FF'}); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Download PDF</a></p>
                  <p style="color: #666; font-size: 12px; margin-top: 24px;">Happy formulating!<br/>The Suttain Team</p>
                </div>
              `
            });
            toast.success('PDF also sent to your email!');
          }
        } catch (emailErr) {
          console.error('Failed to send PDF email:', emailErr);
        }
      }

      if (onActionComplete) {
        onActionComplete();
      }

    } catch (error) {
      console.error("PDF Export failed:", error);
      // Attempt to parse error from response if available
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || 'An unknown error occurred.';
      alert(`Error generating PDF: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-600" />
            Export Formula as PDF
          </DialogTitle>
          <DialogDescription>
            Choose the type of report you want to generate. Business reports include more detailed compliance and batch information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <button
            onClick={() => setExportType('individual')}
            className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${exportType === 'individual' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
          >
            <User className="w-6 h-6 text-teal-700 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-slate-800">Individual Report</p>
              <p className="text-sm text-slate-600">Perfect for personal use. Includes ingredients, instructions, and safety info.</p>
            </div>
          </button>
          
          <button
            onClick={() => setExportType('business')}
            className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${exportType === 'business' ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
          >
            <Building className="w-6 h-6 text-violet-700 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-slate-800">Business Report</p>
              <p className="text-sm text-slate-600">For commercial use. Includes batch records, compliance data, and supplier fields.</p>
            </div>
          </button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleExport} disabled={isLoading} className="bg-teal-600 hover:bg-teal-700">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}