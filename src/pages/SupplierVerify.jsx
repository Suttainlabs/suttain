import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Upload, FileText, AlertCircle, Loader2, Leaf, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SupplierVerify() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Per-ingredient data
  const [ingredientData, setIngredientData] = useState({});
  const [supplierNotes, setSupplierNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!token) { setError('Invalid or missing verification token.'); setLoading(false); return; }
    base44.asServiceRole?.entities?.SupplierVerification?.filter({ token })
      .then(results => {
        if (!results || results.length === 0) { setError('Verification request not found or expired.'); return; }
        const req = results[0];
        if (req.status === 'submitted' || req.status === 'validated') { setSubmitted(true); }
        setRequest(req);
        // Pre-fill ingredient data state
        const init = {};
        (req.ingredients_to_verify || []).forEach(ing => { init[ing] = { confirmed: false, grade: '', origin: '', notes: '' }; });
        setIngredientData(init);
      })
      .catch(() => setError('Failed to load verification request.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return { name: file.name, url: file_url };
      }));
      setUploadedFiles(prev => [...prev, ...urls]);
    } catch (err) {
      alert('File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    const confirmed = Object.values(ingredientData).filter(d => d.confirmed).length;
    if (confirmed === 0) { alert('Please confirm at least one ingredient.'); return; }

    setSubmitting(true);
    try {
      await base44.entities.SupplierVerification.update(request.id, {
        status: 'submitted',
        submitted_data: ingredientData,
        supplier_notes: supplierNotes,
        document_urls: uploadedFiles.map(f => f.url),
      });
      setSubmitted(true);
    } catch (err) {
      alert('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Invalid Request</h2>
        <p className="text-slate-500">{error}</p>
      </Card>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full">
        <Card className="text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Verification Submitted!</h2>
          <p className="text-slate-500 mb-4">
            Thank you for verifying the ingredient data for <strong>"{request?.formula_name}"</strong>. 
            The formula owner will review your submission shortly.
          </p>
          <Badge className="bg-green-100 text-green-700 border-none">Submission Received</Badge>
        </Card>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png"
            alt="Suttain"
            className="h-10 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-slate-800">Supplier Ingredient Verification</h1>
          <p className="text-slate-500 mt-2">
            You've been invited to verify ingredient data for formula <strong>"{request?.formula_name}"</strong>
          </p>
        </div>

        {/* Ingredient Confirmation Cards */}
        <div className="space-y-4 mb-6">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-teal-500" />
            Ingredients to Verify ({request?.ingredients_to_verify?.length || 0})
          </h2>
          {(request?.ingredients_to_verify || []).map(ingredient => (
            <Card key={ingredient} className={`border-2 transition-colors ${ingredientData[ingredient]?.confirmed ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Leaf className="w-4 h-4 text-teal-600" />
                    </div>
                    <span className="font-semibold text-slate-800">{ingredient}</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ingredientData[ingredient]?.confirmed || false}
                      onChange={e => setIngredientData(prev => ({ ...prev, [ingredient]: { ...prev[ingredient], confirmed: e.target.checked } }))}
                      className="w-4 h-4 rounded accent-teal-500"
                    />
                    <span className="text-sm font-medium text-slate-600">Confirm Data</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">Grade / Purity</label>
                    <input
                      type="text"
                      placeholder="e.g., Food Grade, 99.5%"
                      value={ingredientData[ingredient]?.grade || ''}
                      onChange={e => setIngredientData(prev => ({ ...prev, [ingredient]: { ...prev[ingredient], grade: e.target.value } }))}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">Origin / Source</label>
                    <input
                      type="text"
                      placeholder="e.g., Synthetic, Plant-based"
                      value={ingredientData[ingredient]?.origin || ''}
                      onChange={e => setIngredientData(prev => ({ ...prev, [ingredient]: { ...prev[ingredient], origin: e.target.value } }))}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500 font-medium block mb-1">Additional Notes</label>
                    <input
                      type="text"
                      placeholder="Any relevant notes, certifications, or remarks"
                      value={ingredientData[ingredient]?.notes || ''}
                      onChange={e => setIngredientData(prev => ({ ...prev, [ingredient]: { ...prev[ingredient], notes: e.target.value } }))}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Document Upload */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-500" />
              Upload Documents (CoA, SDS, Certifications)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input type="file" multiple className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.png,.xlsx,.csv,.docx" />
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              ) : (
                <>
                  <FileText className="w-6 h-6 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">Click to upload PDF, images, or spreadsheets</p>
                </>
              )}
            </label>
            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                    <FileText className="w-4 h-4 text-teal-500 flex-shrink-0" />
                    <span className="truncate">{f.name}</span>
                    <CheckCircle className="w-4 h-4 text-green-500 ml-auto flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* General Notes */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <label className="text-sm font-medium text-slate-700 block mb-2">General Notes / Comments</label>
            <textarea
              rows={3}
              placeholder="Any additional information, concerns, or comments about the formula ingredients..."
              value={supplierNotes}
              onChange={e => setSupplierNotes(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
            />
          </CardContent>
        </Card>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-3 rounded-xl text-base"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
          Submit Verification
        </Button>
        <p className="text-xs text-center text-slate-400 mt-3">
          Your data is securely stored and only shared with the formula owner.
        </p>
      </div>
    </div>
  );
}