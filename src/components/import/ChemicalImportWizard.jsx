import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileSpreadsheet, FileJson, CheckCircle, AlertTriangle, X,
  ChevronRight, ChevronLeft, Loader2, Sparkles, Eye, Download,
  RefreshCw, AlertCircle, HelpCircle, Wand2, Check, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const CHEMICAL_FIELDS = [
  { id: 'name', label: 'Name', required: true, description: 'Common name of the chemical' },
  { id: 'scientific_name', label: 'Scientific Name', description: 'Scientific or INCI name' },
  { id: 'iupac_name', label: 'IUPAC Name', description: 'IUPAC systematic name' },
  { id: 'cas_number', label: 'CAS Number', description: 'Chemical Abstracts Service number' },
  { id: 'pubchem_cid', label: 'PubChem CID', description: 'PubChem Compound ID' },
  { id: 'smiles', label: 'SMILES', description: 'SMILES notation' },
  { id: 'canonical_smiles', label: 'Canonical SMILES', description: 'Canonical SMILES representation' },
  { id: 'inchi', label: 'InChI', description: 'International Chemical Identifier' },
  { id: 'inchi_key', label: 'InChI Key', description: 'Hashed InChI key' },
  { id: 'molecular_formula', label: 'Molecular Formula', description: 'Chemical formula (e.g., H2O)' },
  { id: 'molecular_weight', label: 'Molecular Weight', description: 'Molecular weight in g/mol' },
  { id: 'chemical_type', label: 'Chemical Type', description: 'Type of chemical substance' },
  { id: 'category', label: 'Category', description: 'Chemical category' },
  { id: 'safety_level', label: 'Safety Level', description: 'Safety classification' },
  { id: 'function_description', label: 'Function/Description', description: 'What this chemical does' },
  { id: 'storage_requirements', label: 'Storage Requirements', description: 'How to store' },
  { id: 'synonyms', label: 'Synonyms', description: 'Alternative names (comma-separated)' },
];

const STEPS = [
  { id: 'upload', title: 'Upload File', icon: Upload },
  { id: 'mapping', title: 'Map Columns', icon: Wand2 },
  { id: 'preview', title: 'Preview & Validate', icon: Eye },
  { id: 'import', title: 'Import', icon: CheckCircle },
];

export default function ChemicalImportWizard({ onClose, onImportComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [mappings, setMappings] = useState({});
  const [aiMappingSuggestions, setAiMappingSuggestions] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);

  const parseFile = useCallback(async (uploadedFile) => {
    const text = await uploadedFile.text();
    const isJson = uploadedFile.name.endsWith('.json');
    
    let data = [];
    let detectedColumns = [];

    if (isJson) {
      const parsed = JSON.parse(text);
      data = Array.isArray(parsed) ? parsed : [parsed];
      if (data.length > 0) {
        detectedColumns = Object.keys(data[0]);
      }
    } else {
      // CSV parsing
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        detectedColumns = lines[0].split(',').map(col => col.trim().replace(/^"|"$/g, ''));
        data = lines.slice(1).map(line => {
          const values = parseCSVLine(line);
          const row = {};
          detectedColumns.forEach((col, i) => {
            row[col] = values[i]?.trim().replace(/^"|"$/g, '') || '';
          });
          return row;
        });
      }
    }

    setFileData(data);
    setColumns(detectedColumns);
    return { data, columns: detectedColumns };
  }, []);

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const handleFileDrop = useCallback(async (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files[0] || e.target.files[0];
    
    if (!droppedFile) return;
    
    const validTypes = ['.csv', '.json'];
    const fileExt = droppedFile.name.substring(droppedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(fileExt)) {
      toast.error('Please upload a CSV or JSON file');
      return;
    }

    setFile(droppedFile);
    
    try {
      await parseFile(droppedFile);
      toast.success('File parsed successfully');
    } catch (error) {
      toast.error('Failed to parse file: ' + error.message);
    }
  }, [parseFile]);

  const analyzeColumnsWithAI = async () => {
    if (columns.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const sampleData = fileData.slice(0, 5);
      
      const prompt = `
        Analyze these CSV/JSON columns and their sample data to map them to chemical database fields.
        
        Columns: ${JSON.stringify(columns)}
        Sample data (first 5 rows): ${JSON.stringify(sampleData)}
        
        Available target fields:
        ${CHEMICAL_FIELDS.map(f => `- ${f.id}: ${f.description}`).join('\n')}
        
        Return a JSON object mapping source columns to target fields. Only include confident mappings.
        Also identify any data quality issues you notice.
        
        Format:
        {
          "mappings": {
            "source_column_name": "target_field_id",
            ...
          },
          "confidence": {
            "source_column_name": 0.0-1.0,
            ...
          },
          "issues": [
            { "column": "column_name", "issue": "description", "suggestion": "how to fix" }
          ],
          "unmapped_columns": ["columns that couldn't be mapped"]
        }
      `;

      const response = await base44.functions.invoke('runConsumerLLM', {
        operation: 'chemicalImportMapping',
        data: { headers: columns, sampleRows: sampleData }
      });

      setAiMappingSuggestions(response);
      setMappings(response.mappings || {});
      toast.success('AI analysis complete!');
    } catch (error) {
      toast.error('AI analysis failed: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const validateData = () => {
    const errors = [];
    const warnings = [];
    const validRows = [];
    const invalidRows = [];

    // Check required fields
    const requiredFields = CHEMICAL_FIELDS.filter(f => f.required);
    const mappedRequired = requiredFields.filter(f => 
      Object.values(mappings).includes(f.id)
    );

    if (mappedRequired.length < requiredFields.length) {
      const missing = requiredFields.filter(f => !Object.values(mappings).includes(f.id));
      errors.push({
        type: 'missing_required',
        message: `Missing required field mappings: ${missing.map(f => f.label).join(', ')}`
      });
    }

    // Validate each row
    fileData.forEach((row, index) => {
      const rowErrors = [];
      const transformedRow = {};

      Object.entries(mappings).forEach(([sourceCol, targetField]) => {
        let value = row[sourceCol];
        
        // Transform and validate based on field type
        if (targetField === 'molecular_weight' && value) {
          const num = parseFloat(value);
          if (isNaN(num)) {
            rowErrors.push(`Invalid molecular weight: ${value}`);
          } else {
            value = num;
          }
        }
        
        if (targetField === 'cas_number' && value) {
          const casPattern = /^\d{2,7}-\d{2}-\d$/;
          if (!casPattern.test(value)) {
            warnings.push({ row: index + 1, message: `Unusual CAS format: ${value}` });
          }
        }

        if (targetField === 'synonyms' && value) {
          value = value.split(',').map(s => s.trim()).filter(Boolean);
        }

        transformedRow[targetField] = value;
      });

      // Ensure chemical_type has a default
      if (!transformedRow.chemical_type) {
        transformedRow.chemical_type = 'compound';
      }

      if (rowErrors.length > 0) {
        invalidRows.push({ index: index + 1, data: row, errors: rowErrors });
      } else {
        validRows.push(transformedRow);
      }
    });

    setValidationResults({
      errors,
      warnings,
      validRows,
      invalidRows,
      totalRows: fileData.length
    });
  };

  const performImport = async () => {
    if (!validationResults?.validRows?.length) {
      toast.error('No valid rows to import');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    const results = { success: 0, failed: 0, errors: [] };
    const batchSize = 10;
    const rows = validationResults.validRows;

    try {
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        
        try {
          await base44.entities.Chemical.bulkCreate(batch);
          results.success += batch.length;
        } catch (error) {
          results.failed += batch.length;
          results.errors.push({ batch: Math.floor(i / batchSize) + 1, error: error.message });
        }

        setImportProgress(Math.round(((i + batch.length) / rows.length) * 100));
      }

      setImportResults(results);
      
      if (results.success > 0) {
        toast.success(`Successfully imported ${results.success} chemicals`);
        if (onImportComplete) {
          onImportComplete(results);
        }
      }
    } catch (error) {
      toast.error('Import failed: ' + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const goToNextStep = () => {
    if (currentStep === 0 && file && fileData) {
      setCurrentStep(1);
      analyzeColumnsWithAI();
    } else if (currentStep === 1 && Object.keys(mappings).length > 0) {
      validateData();
      setCurrentStep(2);
    } else if (currentStep === 2 && validationResults?.validRows?.length > 0) {
      setCurrentStep(3);
      performImport();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                file ? 'border-green-300 bg-green-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50'
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
            >
              {file ? (
                <div className="space-y-3">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <div>
                    <p className="font-semibold text-slate-900">{file.name}</p>
                    <p className="text-sm text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB • {fileData?.length || 0} rows detected
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setFile(null); setFileData(null); setColumns([]); }}>
                    Remove & Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-center gap-4">
                    <FileSpreadsheet className="w-12 h-12 text-green-500" />
                    <FileJson className="w-12 h-12 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Drop your file here</p>
                    <p className="text-sm text-slate-500">or click to browse • CSV or JSON</p>
                  </div>
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileDrop}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    style={{ position: 'relative' }}
                  />
                  <Button variant="outline" className="relative">
                    <Upload className="w-4 h-4 mr-2" />
                    Browse Files
                    <input
                      type="file"
                      accept=".csv,.json"
                      onChange={handleFileDrop}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </Button>
                </div>
              )}
            </div>

            {columns.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Detected Columns ({columns.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {columns.map((col) => (
                      <Badge key={col} variant="outline">{col}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            {isAnalyzing ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
                <p className="font-semibold text-slate-900">AI is analyzing your data...</p>
                <p className="text-sm text-slate-500">Detecting column types and suggesting mappings</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">Column Mappings</h3>
                    <p className="text-sm text-slate-500">Map your file columns to chemical database fields</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={analyzeColumnsWithAI} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Re-analyze with AI
                  </Button>
                </div>

                {aiMappingSuggestions?.issues?.length > 0 && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
                        <AlertTriangle className="w-4 h-4" />
                        Data Quality Issues Detected
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {aiMappingSuggestions.issues.map((issue, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium text-amber-900">{issue.column}:</span>{' '}
                          <span className="text-amber-700">{issue.issue}</span>
                          {issue.suggestion && (
                            <span className="text-amber-600 italic"> → {issue.suggestion}</span>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-3">
                  {columns.map((col) => {
                    const confidence = aiMappingSuggestions?.confidence?.[col];
                    const currentMapping = mappings[col];
                    
                    return (
                      <div key={col} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 truncate">{col}</span>
                            {confidence && (
                              <Badge variant={confidence > 0.8 ? 'default' : confidence > 0.5 ? 'secondary' : 'outline'} className="text-xs">
                                {Math.round(confidence * 100)}% match
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            Sample: {fileData?.[0]?.[col] || 'N/A'}
                          </p>
                        </div>
                        
                        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        
                        <Select
                          value={currentMapping || '_skip'}
                          onValueChange={(value) => {
                            if (value === '_skip') {
                              const newMappings = { ...mappings };
                              delete newMappings[col];
                              setMappings(newMappings);
                            } else {
                              setMappings({ ...mappings, [col]: value });
                            }
                          }}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select field..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_skip">
                              <span className="text-slate-400">Skip this column</span>
                            </SelectItem>
                            {CHEMICAL_FIELDS.map((field) => (
                              <SelectItem key={field.id} value={field.id}>
                                <div className="flex items-center gap-2">
                                  <span>{field.label}</span>
                                  {field.required && <span className="text-red-500">*</span>}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="w-4 h-4 text-slate-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              {CHEMICAL_FIELDS.find(f => f.id === currentMapping)?.description || 'Select a target field'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    );
                  })}
                </div>

                {aiMappingSuggestions?.unmapped_columns?.length > 0 && (
                  <div className="text-sm text-slate-500">
                    <span className="font-medium">Unmapped columns:</span>{' '}
                    {aiMappingSuggestions.unmapped_columns.join(', ')}
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {validationResults && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-700">{validationResults.validRows.length}</div>
                      <div className="text-sm text-green-600">Valid Rows</div>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4 text-center">
                      <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-700">{validationResults.invalidRows.length}</div>
                      <div className="text-sm text-red-600">Invalid Rows</div>
                    </CardContent>
                  </Card>
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-amber-700">{validationResults.warnings.length}</div>
                      <div className="text-sm text-amber-600">Warnings</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Errors */}
                {validationResults.errors.length > 0 && (
                  <Card className="border-red-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        Validation Errors
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {validationResults.errors.map((error, i) => (
                        <div key={i} className="text-sm text-red-600">{error.message}</div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Preview Table */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Data Preview (First 10 rows)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 font-medium text-slate-600">Status</th>
                            {Object.values(mappings).map((field) => (
                              <th key={field} className="text-left py-2 px-3 font-medium text-slate-600">
                                {CHEMICAL_FIELDS.find(f => f.id === field)?.label || field}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {validationResults.validRows.slice(0, 10).map((row, i) => (
                            <tr key={i} className="border-b hover:bg-slate-50">
                              <td className="py-2 px-3">
                                <Check className="w-4 h-4 text-green-500" />
                              </td>
                              {Object.values(mappings).map((field) => (
                                <td key={field} className="py-2 px-3 truncate max-w-[200px]">
                                  {Array.isArray(row[field]) ? row[field].join(', ') : row[field] || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 text-center py-8">
            {isImporting ? (
              <>
                <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto" />
                <div>
                  <p className="font-semibold text-slate-900">Importing chemicals...</p>
                  <p className="text-sm text-slate-500">{importProgress}% complete</p>
                </div>
                <Progress value={importProgress} className="w-64 mx-auto" />
              </>
            ) : importResults ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <div>
                  <p className="font-semibold text-slate-900 text-xl">Import Complete!</p>
                  <div className="mt-4 space-y-2">
                    <p className="text-green-600">{importResults.success} chemicals imported successfully</p>
                    {importResults.failed > 0 && (
                      <p className="text-red-600">{importResults.failed} failed to import</p>
                    )}
                  </div>
                </div>
                <Button onClick={onClose} className="mt-4">
                  Close
                </Button>
              </>
            ) : null}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Import Chemical Data</h2>
              <p className="text-white/80 text-sm">Upload CSV or JSON files with AI-powered mapping</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 bg-slate-50 border-b">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep;
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isComplete ? 'bg-green-500 text-white' :
                    isActive ? 'bg-indigo-500 text-white' :
                    'bg-slate-200 text-slate-400'
                  }`}>
                    {isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${index < currentStep ? 'bg-green-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      {currentStep < 3 && (
        <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : onClose()}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={goToNextStep}
            disabled={
              (currentStep === 0 && !file) ||
              (currentStep === 1 && (isAnalyzing || Object.keys(mappings).length === 0)) ||
              (currentStep === 2 && (!validationResults || validationResults.validRows.length === 0))
            }
            className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-500"
          >
            {currentStep === 2 ? (
              <>
                <Sparkles className="w-4 h-4" />
                Import {validationResults?.validRows?.length || 0} Chemicals
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}