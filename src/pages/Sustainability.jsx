import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Search, Building2 } from "lucide-react";
import PremiumFeatureGate from "../components/shared/PremiumFeatureGate";
import AuthContext from "../components/auth/AuthContext";
import ProductLookup from "../components/sustainability/ProductLookup";
import BusinessAssessment from "../components/sustainability/BusinessAssessment";
import ScoreResultView from "../components/sustainability/ScoreResultView";

export default function Sustainability() {
  const { user } = useContext(AuthContext);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState("individual");
  const [recentSearches, setRecentSearches] = useState([]);

  const handleResult = (data) => {
    setResult(data);
    if (data?.product_name && !recentSearches.includes(data.product_name)) {
      setRecentSearches(prev => [data.product_name, ...prev].slice(0, 5));
    }
  };

  return (
    <PremiumFeatureGate
      featureName="Sustainability Scoring"
      featureDescription="Analyze and improve your product's environmental impact with comprehensive sustainability metrics, greener alternatives, and actionable insights."
    >
      <div className="min-h-screen bg-slate-50">
        {/* Hero */}
        <section className="bg-white border-b border-slate-200 py-10 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 bg-[#02988C]/10 text-[#02988C] px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Leaf className="w-4 h-4" />
                Sustainability Scoring
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                Measure Your Product's Eco-Impact
              </h1>
              <p className="text-slate-500 max-w-xl mx-auto">
                Get science-based sustainability scores, understand your environmental footprint, and discover greener alternatives.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-4xl mx-auto px-4 py-8">
          {result ? (
            <ScoreResultView
              result={result}
              onBack={() => setResult(null)}
              isBusiness={mode === "business"}
            />
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Tabs value={mode} onValueChange={(v) => { setMode(v); setResult(null); }}>
                <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto mb-8">
                  <TabsTrigger value="individual" className="gap-2">
                    <Search className="w-4 h-4" />
                    Individual
                  </TabsTrigger>
                  <TabsTrigger value="business" className="gap-2">
                    <Building2 className="w-4 h-4" />
                    Business
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="individual">
                  <ProductLookup onAnalyze={handleResult} recentSearches={recentSearches} />
                </TabsContent>

                <TabsContent value="business">
                  <BusinessAssessment onAnalyze={handleResult} />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </section>
      </div>
    </PremiumFeatureGate>
  );
}