import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Copy, Check, Loader2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const CONTENT_SECTIONS = [
  { key: "seo_description", label: "SEO product description", icon: "search" },
  { key: "instagram_caption", label: "Instagram caption", icon: "instagram" },
  { key: "blog_outline", label: "Blog post outline", icon: "blog" },
  { key: "email_draft", label: "Email newsletter draft", icon: "email" },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="inline-flex items-center gap-1.5 text-[#02988C] text-sm font-semibold hover:underline">
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function ContentToolkit() {
  const [form, setForm] = useState({ productName: "", ingredients: "", audience: "general", tone: "friendly" });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editedContent, setEditedContent] = useState({});

  const handleGenerate = async () => {
    if (!form.productName.trim()) return;
    setLoading(true); setError(null); setResults(null);
    try {
      // Step 1: Get safety context from suttainIntelligence
      let safetySummary = "";
      try {
        const safetyRes = await base44.functions.invoke("suttainIntelligence", {
          task: "ingredient_analysis",
          input: form.ingredients || form.productName,
        });
        if (safetyRes?.result?.summary) {
          safetySummary = `Risk rating: ${safetyRes.result.risk_rating}. ${safetyRes.result.summary}`;
          if (safetyRes.result.concerns?.length) safetySummary += ` Concerns: ${safetyRes.result.concerns.join(", ")}.`;
          if (safetyRes.result.regulatory_notes) safetySummary += ` Regulatory notes: ${safetyRes.result.regulatory_notes}`;
        }
      } catch {}

      // Step 2: Generate marketing content via runConsumerLLM
      const content = await base44.functions.invoke("runConsumerLLM", {
        operation: "contentToolkit",
        data: {
          productName: form.productName,
          ingredients: form.ingredients,
          targetAudience: form.audience,
          tone: form.tone,
          safetySummary,
        },
      });
      setResults(content);
      setEditedContent(content);
    } catch (e) {
      setError(e.message || "Content generation failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[linear-gradient(135deg,#02988C_0%,#09D2FF_100%)] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>Marketing Toolkit</h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Generate SEO descriptions, social captions, blog outlines, and email drafts — all grounded in ingredient safety data.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Input */}
        <Card className="border-[#E5E7EB] shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0A1F1D] mb-1.5">Product name</label>
                <Input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  placeholder="e.g. Gentle Glow Face Serum" className="h-11 border-[#E5E7EB] focus-visible:ring-[#02988C]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0A1F1D] mb-1.5">Target audience</label>
                <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}
                  className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#02988C]">
                  <option value="general">General consumers</option>
                  <option value="eco">Eco-conscious shoppers</option>
                  <option value="parents">Parents / families</option>
                  <option value="professionals">Beauty professionals</option>
                  <option value="sensitive">Sensitive skin users</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0A1F1D] mb-1.5">Key ingredients (comma-separated)</label>
              <Textarea value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                placeholder="e.g. hyaluronic acid, niacinamide, green tea extract" className="border-[#E5E7EB] focus-visible:ring-[#02988C]" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0A1F1D] mb-1.5">Desired tone</label>
              <div className="flex flex-wrap gap-2">
                {["friendly", "professional", "playful", "scientific", "luxurious"].map((t) => (
                  <button key={t} onClick={() => setForm({ ...form, tone: t })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.tone === t ? "bg-[#02988C] text-white" : "bg-[#F0FDFA] text-[#02988C] hover:bg-[#02988C]/10"}`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-[#DC2626] text-sm">{error}</p>}
            <Button onClick={handleGenerate} loading={loading} size="lg" variant="gradient" className="w-full sm:w-auto">
              <Sparkles className="w-4 h-4" /> Generate content
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-4">
            {CONTENT_SECTIONS.map((section) => (
              <Card key={section.key} className="border-[#E5E7EB] shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-[#02988C]" style={{ fontFamily: "var(--font-heading)" }}>{section.label}</h3>
                    <CopyButton text={editedContent[section.key] || ""} />
                  </div>
                  <Textarea
                    value={editedContent[section.key] || ""}
                    onChange={(e) => setEditedContent({ ...editedContent, [section.key]: e.target.value })}
                    className="border-[#E5E7EB] focus-visible:ring-[#02988C] text-sm"
                    rows={section.key === "blog_outline" ? 10 : 6}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}