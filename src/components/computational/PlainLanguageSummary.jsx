import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Loader2, RefreshCw } from "lucide-react";

export default function PlainLanguageSummary({ results, simLabel, domain }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (results) generateSummary();
  }, [results]);

  const generateSummary = async () => {
    if (!results) return;
    setLoading(true);
    try {
      const response = (await base44.functions.invoke('runResearchLLM', {
        operation: 'plainLanguageSummary',
        data: { simLabel, domain, results }
      })).data;
      setSummary(typeof response === "string" ? response : response?.text || String(response));
    } catch {
      setSummary("Plain language summary could not be generated for this result.");
    } finally {
      setLoading(false);
    }
  };

  if (!results) return null;

  return (
    <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-teal-900 flex items-center gap-2 text-sm">
            <MessageSquare className="w-4 h-4 text-teal-600" />
            Plain Language Summary
          </h3>
          {!loading && summary && (
            <button
              onClick={generateSummary}
              className="text-teal-600 hover:text-teal-800 transition-colors"
              title="Regenerate summary"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-teal-600 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Translating results into plain language...
          </div>
        ) : (
          <p className="text-teal-800 text-sm leading-relaxed">{summary}</p>
        )}
      </CardContent>
    </Card>
  );
}