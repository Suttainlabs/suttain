import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Loader2, ExternalLink } from "lucide-react";

export default function RelatedResearch({ molecule, simType }) {
  const [papers, setPapers] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (molecule) fetchPapers();
  }, [molecule]);

  const fetchPapers = async () => {
    if (!molecule) return;
    setLoading(true);
    try {
      const prompt = `You are a research assistant. For the molecule or system "${molecule}" in the context of ${simType || "computational chemistry"}, return the 3 most relevant real PubMed research abstracts.

Return a JSON array of 3 objects, each with:
- title: string (real paper title)
- authors: string (first author et al., year)
- journal: string (journal name)
- abstract_snippet: string (1-2 sentence description of what the paper found)
- pubmed_id: string (real PMID if you know it, otherwise "N/A")

Only include real, plausible papers. Do not fabricate PMIDs.`;

      const resp = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              authors: { type: "string" },
              journal: { type: "string" },
              abstract_snippet: { type: "string" },
              pubmed_id: { type: "string" },
            }
          }
        }
      });
      setPapers(Array.isArray(resp) ? resp : []);
    } catch {
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  if (!molecule) return null;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm mb-4">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          Related Research
        </h3>
        {loading ? (
          <div className="flex items-center gap-2 text-indigo-600 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Fetching relevant publications...
          </div>
        ) : papers?.length > 0 ? (
          <div className="space-y-3">
            {papers.map((paper, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-semibold text-slate-800 text-xs leading-snug mb-1">{paper.title}</p>
                <p className="text-[11px] text-slate-500 mb-1">{paper.authors} — {paper.journal}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{paper.abstract_snippet}</p>
                {paper.pubmed_id && paper.pubmed_id !== "N/A" && (
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pubmed_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 mt-1.5 font-medium"
                  >
                    <ExternalLink className="w-3 h-3" /> PubMed {paper.pubmed_id}
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No related research found for this molecule.</p>
        )}
      </CardContent>
    </Card>
  );
}