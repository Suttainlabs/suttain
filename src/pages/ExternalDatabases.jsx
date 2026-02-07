import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuthGate from '../components/auth/AuthGate';
import ExternalDatabaseIntegration from '../components/enrichment/ExternalDatabaseIntegration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Database, FlaskConical, ChevronRight } from 'lucide-react';

export default function ExternalDatabasesPage() {
  const [selectedChemical, setSelectedChemical] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: chemicals = [], isLoading } = useQuery({
    queryKey: ['chemicals-for-enrichment', searchTerm],
    queryFn: () => searchTerm 
      ? base44.entities.Chemical.filter({ name: { $regex: searchTerm, $options: 'i' } }, '-updated_date', 20)
      : base44.entities.Chemical.list('-updated_date', 20),
    initialData: []
  });

  const handleEnrich = (enrichmentData) => {
    console.log('Enrichment applied:', enrichmentData);
  };

  return (
    <AuthGate featureName="External Database Integration">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chemical Selection Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-indigo-500" />
                    Select Chemical to Enrich
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search chemicals..."
                      className="pl-9"
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {chemicals.map((chem) => (
                      <button
                        key={chem.id}
                        onClick={() => setSelectedChemical(chem)}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          selectedChemical?.id === chem.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{chem.name}</p>
                            {chem.cas_number && (
                              <p className="text-xs text-slate-500">CAS: {chem.cas_number}</p>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                        {chem.data_source && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {chem.data_source}
                          </Badge>
                        )}
                      </button>
                    ))}
                    {chemicals.length === 0 && !isLoading && (
                      <p className="text-sm text-slate-500 text-center py-4">
                        No chemicals found. Search above or add chemicals first.
                      </p>
                    )}
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => setSelectedChemical({ name: searchTerm || '' })}
                  >
                    <Database className="w-4 h-4" />
                    Search External Only
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Integration Panel */}
            <div className="lg:col-span-2">
              <ExternalDatabaseIntegration 
                chemical={selectedChemical}
                onEnrich={handleEnrich}
              />
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}