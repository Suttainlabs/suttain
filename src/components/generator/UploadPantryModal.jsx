import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, UploadCloud, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { UploadFile, ExtractDataFromUploadedFile } from '@/integrations/Core';
import { Chemical } from '@/entities/Chemical';

export default function UploadPantryModal({ isOpen, onClose, onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const resetState = useCallback(() => {
    setFile(null);
    setIsUploading(false);
    setError(null);
    setDragActive(false);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const { file_url } = await UploadFile({ file });
      const schema = {
        type: 'object',
        properties: {
          chemicals: {
            type: 'array',
            items: {
              type: 'object',
              properties: { name: { type: 'string' }, cas_number: { type: 'string' } }
            }
          }
        }
      };
      
      const extractionResult = await ExtractDataFromUploadedFile({ file_url, json_schema: schema });
      if (extractionResult.status === 'error' || !extractionResult.output?.chemicals) {
        throw new Error(extractionResult.details || "Could not extract chemical data from file.");
      }

      const chemicalNames = extractionResult.output.chemicals.map(c => c.name);
      const existingChemicals = await Chemical.filter({ name: { '$in': chemicalNames } });
      const existingChemicalNames = new Set(existingChemicals.map(c => c.name.toLowerCase()));

      const newChemicalsToAdd = extractionResult.output.chemicals.filter(
        c => !existingChemicalNames.has(c.name.toLowerCase())
      ).map(c => ({
        name: c.name,
        scientific_name: c.name,
        cas_number: c.cas_number || null,
        chemical_type: 'compound',
        eco_friendly: false,
        allergen: false,
      }));

      if (newChemicalsToAdd.length > 0) {
        await Chemical.bulkCreate(newChemicalsToAdd);
      }

      const allChemicals = [...existingChemicals, ...newChemicalsToAdd];
      onUploadComplete(allChemicals);
      handleClose();

    } catch (e) {
      console.error("Upload failed:", e);
      setError(`Upload failed: ${e.message}. Please check the file format and try again.`);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800">Upload Your Chemical Pantry</h3>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="p-6 space-y-4">
            <p className="text-slate-600">
              Upload a CSV, XLS, or JSON file with your chemical inventory. The file should contain columns for 'name' and 'cas_number'.
            </p>

            <label
              htmlFor="pantry-file-upload"
              className={`relative w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragActive ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-500 hover:bg-teal-50/50'
              }`}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            >
              <input
                id="pantry-file-upload"
                type="file"
                className="hidden"
                accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .json"
                onChange={handleFileChange}
              />
              
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="w-10 h-10 text-teal-600" />
                  <p className="font-semibold text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 text-slate-400" />
                  <p className="mt-2 text-slate-600">
                    <span className="font-semibold text-teal-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-500">CSV, XLS, or JSON files</p>
                </>
              )}
            </label>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
          
          <div className="px-6 pb-6 pt-2 flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="btn-primary"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : 'Upload & Analyze'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}