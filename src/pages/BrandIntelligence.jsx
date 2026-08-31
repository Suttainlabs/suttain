import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeftRight, Search, CheckCircle, XCircle, Loader2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

function ScoreBadge({ value }) {
  if (!value) return <span className="text-[#6B7280] text-sm">No data</span>;
  const num = typeof value === "number" ? value : null;
  if (num !== null) {
    const color = num >= 0.8 ? "text-[#02988C]" : num >= 0.5 ? "text-[#D4900A]" : "text-[#DC2626]";
    return <span className={`font-bold ${color}`}>{(num * 100).toFixed(0)}%</span>;
  }
  return <span className="text-[#0A1F1D] text-sm font-medium">{value}</span>;
}

function CompareRow({ label, yourValue, competitorValue }) {
  const yourBetter = yourValue && (!competitorValue || yourValue === "low" || yourValue === "safe");
  const competitorBetter = competitorValue && (!yourValue || competitorValue === "low" || competitorValue === "safe");
  return (
    <div className="grid grid-cols-3 gap-2 py-3 border-b border-[#E5E7EB] last:border-0">
      <div className="text-sm font-medium text-[#4B5563]">{label}</div>
      <div className="flex items-center gap-1.5">
        {yourBetter && <CheckCircle className="w-4 h-4 text-[#02988C]" />}
        <ScoreBadge value={yourValue} />
      </div>
      <div className="flex items-center gap-1.5">
        {competitorBetter && <CheckCircle className="w-4 h-4 text-[#02988C]" />}
        <ScoreBadge value={competitorValue} />
      </div>
    </div>
  );
}

export default function BrandIntelligence() {
  const [yourProduct, setYourProduct] = useState("");
  const [competitorProduct, setCompetitorProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleCompare = async () => {
    if (!yourProduct.trim() || !competitorProduct.trim()) return;
    setLoading(true); setError(null); setResults(null);
    try {
      const [yourReg, yourHaz, compReg, compHaz] = await Promise.all([
        base44.functions.invoke("suttainRegulatory", { query: yourProduct.trim() }).catch(() => null),
        base44.functions.invoke("suttainHazardData", { query: yourProduct.trim() }).catch(() => null),
        base44.functions.invoke("suttainRegulatory", { query: competitorProduct.trim() }).catch(() => null),
        base44.functions.invoke("suttainHazardData", { query: competitorProduct.trim() }).catch(() => null),
      ]);
      if (!yourReg && !yourHaz && !compReg && !compHaz) throw new Error("No data found for either product.");
      setResults({ your: { regulatory: yourReg, hazard: yourHaz }, competitor: { regulatory: compReg, hazard: compHaz } });
    } catch (e) {
      setError(e.message || "Comparison failed. Please try again.");
    } finally { setLoading(false); }
  };

  const yourName = results?.your?.hazard?.preferred_name || results?.your?.regulatory?.query || yourProduct;
  const compName = results?.competitor?.hazard?.preferred_name || results?.competitor?.regulatory?.query || competitorProduct;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[linear-gradient(135deg,#02988C_0%,#09D2FF_100%)] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <ArrowLeftRight className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>Brand Intelligence</h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Compare your product head-to-head with a competitor on hazard scores, regulatory status, and chemical transparency.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Input */}
        <Card className="border-[#E5E7EB] shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#02988C] mb-1.5">Your product</label>
                <Input value={yourProduct} onChange={(e) => setYourProduct(e.target.value)}
                  placeholder="e.g. Seventh Generation Dish Soap" className="h-11 border-[#E5E7EB] focus-visible:ring-[#02988C]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#9531F5] mb-1.5">Competitor product</label>
                <Input value={competitorProduct} onChange={(e) => setCompetitorProduct(e.target.value)}
                  placeholder="e.g. Dawn Dish Soap" className="h-11 border-[#E5E7EB] focus-visible:ring-[#9531F5]" />
              </div>
            </div>
            {error && <p className="text-[#DC2626] text-sm mt-3">{error}</p>}
            <Button onClick={handleCompare} loading={loading} size="lg" variant="gradient" className="w-full sm:w-auto mt-4">
              <Search className="w-4 h-4" /> Compare products
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Comparison Table */}
            <Card className="border-[#E5E7EB] shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-[#0A1F1D] mb-4" style={{ fontFamily: "var(--font-heading)" }}>Side-by-side comparison</h2>
                <div className="grid grid-cols-3 gap-2 pb-3 border-b-2 border-[#E5E7EB]">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Metric</div>
                  <div className="text-sm font-bold text-[#02988C]">{yourName}</div>
                  <div className="text-sm font-bold text-[#9531F5]">{compName}</div>
                </div>

                <CompareRow label="Preferred name" yourValue={results.your.hazard?.preferred_name} competitorValue={results.competitor.hazard?.preferred_name} />
                <CompareRow label="CAS number" yourValue={results.your.hazard?.cas_number} competitorValue={results.competitor.hazard?.cas_number} />
                <CompareRow label="DTXSID (EPA)" yourValue={results.your.hazard?.dtxsid} competitorValue={results.competitor.hazard?.dtxsid} />
                <CompareRow label="Molecular formula" yourValue={results.your.hazard?.molecular_formula} competitorValue={results.competitor.hazard?.molecular_formula} />
                <CompareRow
                  label="GHS available"
                  yourValue={results.your.regulatory?.ghs_available ? "Yes" : "No"}
                  competitorValue={results.competitor.regulatory?.ghs_available ? "Yes" : "No"}
                />
                <CompareRow
                  label="Signal word"
                  yourValue={results.your.regulatory?.signal_word || "None"}
                  competitorValue={results.competitor.regulatory?.signal_word || "None"}
                />
                <CompareRow
                  label="Hazard statements"
                  yourValue={results.your.regulatory?.hazard_statements?.length ? `${results.your.regulatory.hazard_statements.length} found` : "None"}
                  competitorValue={results.competitor.regulatory?.hazard_statements?.length ? `${results.competitor.regulatory.hazard_statements.length} found` : "None"}
                />
                <CompareRow
                  label="Pictograms"
                  yourValue={results.your.regulatory?.pictograms?.length ? `${results.your.regulatory.pictograms.length} flagged` : "None"}
                  competitorValue={results.competitor.regulatory?.pictograms?.length ? `${results.competitor.regulatory.pictograms.length} flagged` : "None"}
                />
              </CardContent>
            </Card>

            {/* What This Means */}
            <Card className="border-[#02988C]/20 shadow-sm bg-[#F0FDFA]">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-[#02988C]" />
                  <h2 className="text-lg font-bold text-[#0A1F1D]" style={{ fontFamily: "var(--font-heading)" }}>What this means</h2>
                </div>
                <div className="space-y-2 text-sm text-[#0A1F1D]">
                  {results.your.regulatory?.hazard_statements?.length <= (results.competitor.regulatory?.hazard_statements?.length || 0) ? (
                    <p>Your product has fewer or equal GHS hazard statements compared to the competitor — a positive signal for safety positioning.</p>
                  ) : (
                    <p>Your product has more GHS hazard statements than the competitor. Consider reformulating or highlighting other safety advantages.</p>
                  )}
                  {results.your.hazard?.dtxsid && <p>Your product is registered in the EPA CompTox Dashboard, providing transparency and traceability for regulators and consumers.</p>}
                  {results.your.regulatory?.ghs_available && <p>GHS data is publicly available for your product, enabling clear hazard communication on labels and safety data sheets.</p>}
                  {results.competitor.regulatory?.pictograms?.length > results.your.regulatory?.pictograms?.length && (
                    <p className="font-medium text-[#02988C]">Your product requires fewer hazard pictograms than the competitor — leverage this in marketing materials.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Source citations */}
            <div className="text-xs text-[#6B7280] space-y-1">
              <p>Sources: PubChem GHS Classification, EPA CompTox Dashboard, PubChem Compound Database.</p>
              {results.your.hazard?.dashboard_url && <a href={results.your.hazard.dashboard_url} target="_blank" rel="noopener noreferrer" className="text-[#02988C] hover:underline block">View your product on EPA CompTox</a>}
              {results.competitor.hazard?.dashboard_url && <a href={results.competitor.hazard.dashboard_url} target="_blank" rel="noopener noreferrer" className="text-[#02988C] hover:underline block">View competitor on EPA CompTox</a>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}