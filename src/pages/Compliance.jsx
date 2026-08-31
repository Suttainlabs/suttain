import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Shield, AlertTriangle, ExternalLink, Database, Send, CheckCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const GHS_PICTOGRAMS = {
  GHS01: "Explosive", GHS02: "Flammable", GHS03: "Oxidizing",
  GHS04: "Compressed Gas", GHS05: "Corrosive", GHS06: "Toxic",
  GHS07: "Harmful / Irritant", GHS08: "Health Hazard", GHS09: "Environmental Hazard",
};

export default function Compliance() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const [dsr, setDsr] = useState({ name: "", email: "", type: "access", message: "" });
  const [dsrStatus, setDsrStatus] = useState(null);
  const [dsrLoading, setDsrLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(null); setResults(null);
    try {
      const [regulatory, hazard] = await Promise.all([
        base44.functions.invoke("suttainRegulatory", { query: query.trim() }).catch(() => null),
        base44.functions.invoke("suttainHazardData", { query: query.trim() }).catch(() => null),
      ]);
      if (!regulatory && !hazard) throw new Error("No regulatory data found for this query.");
      setResults({ regulatory, hazard });
    } catch (e) {
      setError(e.message || "Search failed. Please try again.");
    } finally { setLoading(false); }
  };

  const handleDSR = async (e) => {
    e.preventDefault();
    if (!dsr.email.trim()) return;
    setDsrLoading(true); setDsrStatus(null);
    try {
      await base44.entities.ContactSubmission.create({
        name: dsr.name,
        email: dsr.email,
        subject: `Data Subject Request — ${dsr.type === "access" ? "Data Access" : "Data Deletion"}`,
        message: dsr.message || `Requesting ${dsr.type === "access" ? "access to" : "deletion of"} my personal data.`,
      });
      setDsrStatus("submitted");
      setDsr({ name: "", email: "", type: "access", message: "" });
    } catch {
      setDsrStatus("error");
    } finally { setDsrLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[linear-gradient(135deg,#02988C_0%,#09D2FF_100%)] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>Compliance Co-Pilot</h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Search any ingredient or CAS number for GHS classifications, EPA CompTox data, and regulatory guidance — with cited sources.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* Search */}
        <Card className="border-[#E5E7EB] shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter product name, ingredient, or CAS number..."
                className="flex-1 h-12 text-base border-[#E5E7EB] focus-visible:ring-[#02988C]"
              />
              <Button onClick={handleSearch} loading={loading} size="lg" className="sm:w-auto">
                <Search className="w-4 h-4" /> Search
              </Button>
            </div>
            {error && <p className="text-[#DC2626] text-sm mt-3">{error}</p>}
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* GHS Classification */}
            {results.regulatory && (
              <Card className="border-[#E5E7EB] shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-[#02988C]" />
                    <h2 className="text-xl font-bold text-[#0A1F1D]" style={{ fontFamily: "var(--font-heading)" }}>GHS Classification</h2>
                  </div>

                  {!results.regulatory.ghs_available ? (
                    <p className="text-[#4B5563]">{results.regulatory.message || "No published GHS classification found."}</p>
                  ) : (
                    <div className="space-y-4">
                      {results.regulatory.signal_word && (
                        <div className="inline-flex items-center gap-2 bg-[#FEF6E4] text-[#D4900A] px-4 py-2 rounded-lg font-semibold">
                          Signal word: {results.regulatory.signal_word}
                        </div>
                      )}
                      {results.regulatory.pictograms?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {results.regulatory.pictograms.map((p) => (
                            <span key={p} className="bg-[#F0FDFA] text-[#02988C] border border-[#02988C]/20 px-3 py-1.5 rounded-lg text-sm font-medium">
                              {p} — {GHS_PICTOGRAMS[p] || "Hazard"}
                            </span>
                          ))}
                        </div>
                      )}
                      {results.regulatory.hazard_statements?.length > 0 && (
                        <div className="space-y-1.5">
                          {results.regulatory.hazard_statements.map((h, i) => (
                            <div key={i} className="flex gap-2 text-sm text-[#0A1F1D]">
                              <span className="font-mono font-semibold text-[#9531F5] min-w-[60px]">{h.code}</span>
                              <span>{h.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-[#6B7280] mt-4">Source: {results.regulatory.source} {results.regulatory.cid && `| PubChem CID: ${results.regulatory.cid}`}</p>
                </CardContent>
              </Card>
            )}

            {/* Identity & EPA CompTox */}
            {results.hazard && (
              <Card className="border-[#E5E7EB] shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="w-5 h-5 text-[#9531F5]" />
                    <h2 className="text-xl font-bold text-[#0A1F1D]" style={{ fontFamily: "var(--font-heading)" }}>Chemical Identity & EPA CompTox</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {[
                      ["Preferred name", results.hazard.preferred_name],
                      ["CAS number", results.hazard.cas_number],
                      ["DTXSID", results.hazard.dtxsid],
                      ["Molecular formula", results.hazard.molecular_formula],
                      ["Molecular weight", results.hazard.molecular_weight ? `${results.hazard.molecular_weight} g/mol` : null],
                      ["SMILES", results.hazard.smiles],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between border-b border-[#E5E7EB] pb-2">
                        <span className="text-[#4B5563] font-medium">{label}</span>
                        <span className="text-[#0A1F1D] font-mono text-xs">{val || "—"}</span>
                      </div>
                    ))}
                  </div>
                  {results.hazard.dashboard_url && (
                    <a href={results.hazard.dashboard_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#02988C] text-sm font-semibold mt-4 hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" /> View on EPA CompTox Dashboard
                    </a>
                  )}
                  {results.hazard.cid && (
                    <a href={`https://pubchem.ncbi.nlm.nih.gov/compound/${results.hazard.cid}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#02988C] text-sm font-semibold mt-4 ml-4 hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" /> View on PubChem
                    </a>
                  )}
                  <p className="text-xs text-[#6B7280] mt-4">Source: {results.hazard.source}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Data Subject Request */}
        <Card className="border-[#E5E7EB] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-[#02988C]" />
              <h2 className="text-xl font-bold text-[#0A1F1D]" style={{ fontFamily: "var(--font-heading)" }}>Data Subject Request (GDPR / CCPA)</h2>
            </div>
            <p className="text-[#4B5563] text-sm mb-4">Request access to or deletion of your personal data. We respond within 30 days.</p>

            {dsrStatus === "submitted" ? (
              <div className="flex items-center gap-2 bg-[#F0FDFA] text-[#02988C] px-4 py-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Your request has been submitted. We will contact you at the email provided.</span>
              </div>
            ) : (
              <form onSubmit={handleDSR} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input placeholder="Your name" value={dsr.name} onChange={(e) => setDsr({ ...dsr, name: e.target.value })}
                    className="h-11 border-[#E5E7EB] focus-visible:ring-[#02988C]" />
                  <Input type="email" required placeholder="Your email" value={dsr.email} onChange={(e) => setDsr({ ...dsr, email: e.target.value })}
                    className="h-11 border-[#E5E7EB] focus-visible:ring-[#02988C]" />
                </div>
                <select value={dsr.type} onChange={(e) => setDsr({ ...dsr, type: e.target.value })}
                  className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#02988C]">
                  <option value="access">Request data access</option>
                  <option value="deletion">Request data deletion</option>
                </select>
                <Textarea placeholder="Additional details (optional)" value={dsr.message} onChange={(e) => setDsr({ ...dsr, message: e.target.value })}
                  className="border-[#E5E7EB] focus-visible:ring-[#02988C]" rows={3} />
                {dsrStatus === "error" && <p className="text-[#DC2626] text-sm">Failed to submit. Please email contact@suttain.com directly.</p>}
                <Button type="submit" loading={dsrLoading} className="w-full sm:w-auto">
                  <Send className="w-4 h-4" /> Submit request
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}