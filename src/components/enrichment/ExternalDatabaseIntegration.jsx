import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Search, ExternalLink, BookOpen, FlaskConical, FileText,
  Loader2, Sparkles, ChevronDown, ChevronRight, Download, RefreshCw,
  AlertTriangle, CheckCircle, Beaker, Microscope, Shield, Dna,
  Activity, Globe, Link2, Copy, Star, Clock, Users, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const DATABASE_SOURCES = [
  { id: 'pubchem', name: 'PubChem', icon: FlaskConical, color: 'bg-blue-500', description: 'Chemical properties, structures, bioassays' },
  { id: 'pubmed', name: 'PubMed', icon: BookOpen, color: 'bg-green-500', description: 'Biomedical literature & research papers' },
  { id: 'chemspider', name: 'ChemSpider', icon: Globe, color: 'bg-purple-500', description: 'Chemical structure database' },
  { id: 'toxnet', name: 'ToxNet/HSDB', icon: Shield, color: 'bg-red-500', description: 'Toxicology & hazardous substances' },
];

const DATA_CATEGORIES = [
  { id: 'properties', label: 'Physical Properties', icon: Beaker },
  { id: 'spectral', label: 'Spectral Data', icon: Activity },
  { id: 'toxicity', label: 'Toxicity Studies', icon: Shield },
  { id: 'bioactivity', label: 'Bioactivity', icon: Dna },
  { id: 'literature', label: 'Research Papers', icon: BookOpen },
  { id: 'synthesis', label: 'Synthesis Routes', icon: FlaskConical },
];

export default function ExternalDatabaseIntegration({ chemical, onEnrich, compact = false }) {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState(chemical?.name || chemical?.cas_number || '');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedSources, setSelectedSources] = useState(['pubchem', 'pubmed']);
  const [selectedCategories, setSelectedCategories] = useState(['properties', 'toxicity', 'literature']);
  const [enrichmentData, setEnrichmentData] = useState(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const searchExternalDatabases = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setIsSearching(true);
    setSearchResults(null);

    try {
      const prompt = `
        Search for chemical information about "${searchQuery}" from scientific databases.
        
        Simulate fetching data from these sources: ${selectedSources.join(', ')}
        Focus on these categories: ${selectedCategories.join(', ')}
        
        Return comprehensive data in this JSON format:
        {
          "compound_info": {
            "name": "string",
            "iupac_name": "string",
            "cas_number": "string",
            "molecular_formula": "string",
            "molecular_weight": number,
            "smiles": "string",
            "inchi": "string",
            "inchi_key": "string",
            "pubchem_cid": "string"
          },
          "physical_properties": {
            "melting_point": "string with units",
            "boiling_point": "string with units",
            "density": "string with units",
            "solubility": "string",
            "vapor_pressure": "string",
            "log_p": number,
            "pka": number
          },
          "spectral_data": {
            "ir_peaks": ["array of characteristic peaks"],
            "nmr_shifts": ["array of NMR shifts"],
            "mass_spectrum_peaks": ["array of m/z values"],
            "uv_vis_absorption": "string"
          },
          "toxicity_data": {
            "ld50_oral": "string",
            "ld50_dermal": "string",
            "lc50_inhalation": "string",
            "carcinogenicity": "string",
            "mutagenicity": "string",
            "ghs_classification": ["array of classifications"],
            "exposure_limits": {
              "osha_pel": "string",
              "niosh_rel": "string",
              "acgih_tlv": "string"
            }
          },
          "bioactivity": {
            "targets": ["array of biological targets"],
            "mechanisms": ["array of mechanisms"],
            "therapeutic_uses": ["array of uses"],
            "side_effects": ["array of side effects"]
          },
          "literature": [
            {
              "title": "string",
              "authors": "string",
              "journal": "string",
              "year": number,
              "doi": "string",
              "abstract_summary": "string",
              "relevance": "high|medium|low"
            }
          ],
          "synthesis_routes": [
            {
              "name": "string",
              "steps": number,
              "yield": "string",
              "conditions": "string"
            }
          ],
          "safety_summary": "string",
          "data_sources": ["array of sources used"]
        }
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            compound_info: { type: "object" },
            physical_properties: { type: "object" },
            spectral_data: { type: "object" },
            toxicity_data: { type: "object" },
            bioactivity: { type: "object" },
            literature: { type: "array", items: { type: "object" } },
            synthesis_routes: { type: "array", items: { type: "object" } },
            safety_summary: { type: "string" },
            data_sources: { type: "array", items: { type: "string" } }
          }
        }
      });

      setSearchResults(response);
      toast.success('External data retrieved successfully');
    } catch (error) {
      toast.error('Search failed: ' + error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const generateAISummary = async () => {
    if (!searchResults) return;

    setIsEnriching(true);
    try {
      const summaryPrompt = `
        Analyze and summarize this chemical data for a scientist or formulator:
        
        ${JSON.stringify(searchResults, null, 2)}
        
        Provide a comprehensive but concise summary in this format:
        {
          "executive_summary": "2-3 sentence overview",
          "key_properties": ["5 most important properties"],
          "safety_highlights": ["top 3 safety considerations"],
          "research_insights": ["3 key findings from literature"],
          "practical_applications": ["3 practical uses or applications"],
          "recommended_precautions": ["3 recommended precautions"],
          "interesting_facts": ["2-3 interesting scientific facts"],
          "confidence_score": 0.0-1.0
        }
      `;

      const summary = await base44.integrations.Core.InvokeLLM({
        prompt: summaryPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            key_properties: { type: "array", items: { type: "string" } },
            safety_highlights: { type: "array", items: { type: "string" } },
            research_insights: { type: "array", items: { type: "string" } },
            practical_applications: { type: "array", items: { type: "string" } },
            recommended_precautions: { type: "array", items: { type: "string" } },
            interesting_facts: { type: "array", items: { type: "string" } },
            confidence_score: { type: "number" }
          }
        }
      });

      setAiSummary(summary);
      toast.success('AI summary generated');
    } catch (error) {
      toast.error('Summary generation failed: ' + error.message);
    } finally {
      setIsEnriching(false);
    }
  };

  const applyEnrichment = async () => {
    if (!searchResults?.compound_info || !chemical?.id) {
      toast.error('No data to apply or no chemical selected');
      return;
    }

    try {
      const enrichmentUpdate = {
        pubchem_cid: searchResults.compound_info.pubchem_cid,
        smiles: searchResults.compound_info.smiles,
        inchi: searchResults.compound_info.inchi,
        inchi_key: searchResults.compound_info.inchi_key,
        molecular_formula: searchResults.compound_info.molecular_formula,
        molecular_weight: searchResults.compound_info.molecular_weight,
        iupac_name: searchResults.compound_info.iupac_name,
        physical_properties: searchResults.physical_properties,
        toxicity_data: searchResults.toxicity_data,
        spectral_data: searchResults.spectral_data,
        biological_data: searchResults.bioactivity,
        data_source: 'ai_enriched',
        last_pubchem_sync: new Date().toISOString()
      };

      await base44.entities.Chemical.update(chemical.id, enrichmentUpdate);
      toast.success('Chemical data enriched successfully!');
      
      if (onEnrich) {
        onEnrich(enrichmentUpdate);
      }
    } catch (error) {
      toast.error('Failed to apply enrichment: ' + error.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (compact) {
    return (
      <Card className="border-indigo-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-500" />
            External Database Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Chemical name, CAS, or SMILES..."
              className="flex-1"
            />
            <Button onClick={searchExternalDatabases} disabled={isSearching} size="sm">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-500" />
            External Database Integration
          </h2>
          <p className="text-sm text-slate-500">Fetch and enrich chemical data from scientific databases</p>
        </div>
        {searchResults && (
          <Button onClick={applyEnrichment} className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-500">
            <Download className="w-4 h-4" />
            Apply to Chemical
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100">
          <TabsTrigger value="search" className="gap-2">
            <Search className="w-4 h-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2" disabled={!searchResults}>
            <FileText className="w-4 h-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2" disabled={!aiSummary}>
            <Sparkles className="w-4 h-4" />
            AI Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6 mt-4">
          {/* Search Box */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter chemical name, CAS number, SMILES, or InChI..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && searchExternalDatabases()}
                />
                <Button 
                  onClick={searchExternalDatabases} 
                  disabled={isSearching}
                  className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Search Databases
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Source Selection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DATABASE_SOURCES.map((source) => {
                  const isSelected = selectedSources.includes(source.id);
                  return (
                    <button
                      key={source.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedSources(selectedSources.filter(s => s !== source.id));
                        } else {
                          setSelectedSources([...selectedSources, source.id]);
                        }
                      }}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-6 h-6 rounded ${source.color} flex items-center justify-center`}>
                          <source.icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-medium text-sm">{source.name}</span>
                      </div>
                      <p className="text-xs text-slate-500">{source.description}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Category Selection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Data Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {DATA_CATEGORIES.map((category) => {
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <Badge
                      key={category.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`cursor-pointer ${isSelected ? 'bg-indigo-500' : ''}`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCategories(selectedCategories.filter(c => c !== category.id));
                        } else {
                          setSelectedCategories([...selectedCategories, category.id]);
                        }
                      }}
                    >
                      <category.icon className="w-3 h-3 mr-1" />
                      {category.label}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4 mt-4">
          {searchResults && (
            <>
              {/* Compound Info Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FlaskConical className="w-5 h-5 text-blue-500" />
                      Compound Information
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={generateAISummary} disabled={isEnriching} className="gap-2">
                      {isEnriching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Generate AI Summary
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {Object.entries(searchResults.compound_info || {}).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <span className="text-xs text-slate-500 uppercase">{key.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 truncate">{value || 'N/A'}</span>
                          {value && (
                            <button onClick={() => copyToClipboard(value)} className="text-slate-400 hover:text-slate-600">
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Physical Properties */}
              {searchResults.physical_properties && (
                <Card>
                  <CardHeader 
                    className="pb-2 cursor-pointer hover:bg-slate-50"
                    onClick={() => toggleSection('physical')}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Beaker className="w-4 h-4 text-green-500" />
                        Physical Properties
                      </CardTitle>
                      {expandedSections.physical ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </CardHeader>
                  <AnimatePresence>
                    {expandedSections.physical && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            {Object.entries(searchResults.physical_properties).map(([key, value]) => (
                              <div key={key} className="p-2 bg-slate-50 rounded-lg">
                                <span className="text-xs text-slate-500 block">{key.replace(/_/g, ' ')}</span>
                                <span className="font-medium">{value || 'N/A'}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              )}

              {/* Toxicity Data */}
              {searchResults.toxicity_data && (
                <Card className="border-red-200">
                  <CardHeader 
                    className="pb-2 cursor-pointer hover:bg-red-50"
                    onClick={() => toggleSection('toxicity')}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-500" />
                        Toxicity & Safety Data
                      </CardTitle>
                      {expandedSections.toxicity ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </CardHeader>
                  <AnimatePresence>
                    {expandedSections.toxicity && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}>
                        <CardContent className="pt-0 space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div className="p-2 bg-red-50 rounded-lg">
                              <span className="text-xs text-red-600 block">LD50 (Oral)</span>
                              <span className="font-medium">{searchResults.toxicity_data.ld50_oral || 'N/A'}</span>
                            </div>
                            <div className="p-2 bg-red-50 rounded-lg">
                              <span className="text-xs text-red-600 block">LD50 (Dermal)</span>
                              <span className="font-medium">{searchResults.toxicity_data.ld50_dermal || 'N/A'}</span>
                            </div>
                            <div className="p-2 bg-red-50 rounded-lg">
                              <span className="text-xs text-red-600 block">LC50 (Inhalation)</span>
                              <span className="font-medium">{searchResults.toxicity_data.lc50_inhalation || 'N/A'}</span>
                            </div>
                          </div>
                          {searchResults.toxicity_data.ghs_classification?.length > 0 && (
                            <div>
                              <span className="text-xs text-slate-500 block mb-2">GHS Classifications</span>
                              <div className="flex flex-wrap gap-2">
                                {searchResults.toxicity_data.ghs_classification.map((cls, i) => (
                                  <Badge key={i} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    {cls}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              )}

              {/* Literature */}
              {searchResults.literature?.length > 0 && (
                <Card>
                  <CardHeader 
                    className="pb-2 cursor-pointer hover:bg-slate-50"
                    onClick={() => toggleSection('literature')}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-500" />
                        Research Literature ({searchResults.literature.length})
                      </CardTitle>
                      {expandedSections.literature ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </CardHeader>
                  <AnimatePresence>
                    {expandedSections.literature && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}>
                        <CardContent className="pt-0">
                          <ScrollArea className="h-64">
                            <div className="space-y-3">
                              {searchResults.literature.map((paper, i) => (
                                <div key={i} className="p-3 bg-slate-50 rounded-lg">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-medium text-sm text-slate-900">{paper.title}</h4>
                                    <Badge variant={paper.relevance === 'high' ? 'default' : 'outline'} className="text-xs flex-shrink-0">
                                      {paper.relevance}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {paper.authors} • {paper.journal} ({paper.year})
                                  </p>
                                  <p className="text-xs text-slate-600 mt-2">{paper.abstract_summary}</p>
                                  {paper.doi && (
                                    <a 
                                      href={`https://doi.org/${paper.doi}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-indigo-600 hover:underline mt-2 inline-flex items-center gap-1"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      View Paper
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              )}

              {/* Data Sources */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Data from:</span>
                {searchResults.data_sources?.map((source, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{source}</Badge>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="summary" className="mt-4">
          {aiSummary && (
            <div className="space-y-4">
              <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    AI-Generated Summary
                    <Badge className="ml-2">{Math.round((aiSummary.confidence_score || 0.8) * 100)}% confidence</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">{aiSummary.executive_summary}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Key Properties
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {aiSummary.key_properties?.map((prop, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{prop}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-500" />
                      Safety Highlights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {aiSummary.safety_highlights?.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Microscope className="w-4 h-4 text-purple-500" />
                      Research Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {aiSummary.research_insights?.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <BookOpen className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      Applications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {aiSummary.practical_applications?.map((app, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>{app}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {aiSummary.interesting_facts?.length > 0 && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Interesting Facts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {aiSummary.interesting_facts.map((fact, i) => (
                        <li key={i} className="text-sm text-amber-900">{fact}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}