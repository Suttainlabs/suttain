import React, { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Factory, Droplets, Package, ShieldCheck, Globe, Info } from "lucide-react";
import { getScoreColor } from "./ScoreGauge";

const METRICS = [
  { key: "carbon_footprint", label: "Carbon Footprint", weight: "30%", icon: Factory, description: "Measures greenhouse gas emissions across the product lifecycle, including raw material extraction, manufacturing, transport, and disposal." },
  { key: "water_consumption", label: "Water Consumption", weight: "20%", icon: Droplets, description: "Evaluates total water usage in sourcing raw materials, manufacturing, and product use phase." },
  { key: "packaging_sustainability", label: "Packaging Sustainability", weight: "20%", icon: Package, description: "Assesses packaging material recyclability, biodegradability, weight efficiency, and use of post-consumer recycled content." },
  { key: "toxicity_safety", label: "Toxicity & Safety", weight: "20%", icon: ShieldCheck, description: "Rates ingredient safety for humans and ecosystems — considers endocrine disruptors, carcinogens, aquatic toxicity, and biodegradability." },
  { key: "ethical_sourcing", label: "Ethical Sourcing", weight: "10%", icon: Globe, description: "Evaluates fair trade practices, supply chain transparency, deforestation-free sourcing, and labor standards." },
];

export { METRICS };

export default function MetricBreakdown({ metrics }) {
  const [openMetric, setOpenMetric] = useState(null);

  if (!metrics) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Score Breakdown</h3>
      {METRICS.map((m) => {
        const score = metrics[m.key] ?? 0;
        const colors = getScoreColor(score);
        return (
          <div key={m.key} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <m.icon className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">{m.label}</span>
                <Badge variant="outline" className="text-[10px] text-slate-400">{m.weight}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${colors.text}`}>{score}</span>
                <button onClick={() => setOpenMetric(m)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>
            </div>
            <Progress value={score} className="h-2" />
          </div>
        );
      })}

      <Dialog open={!!openMetric} onOpenChange={() => setOpenMetric(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {openMetric && <openMetric.icon className="w-5 h-5 text-slate-600" />}
              {openMetric?.label}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 leading-relaxed">{openMetric?.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">Weight: {openMetric?.weight}</Badge>
            <Badge variant="outline">Score: {metrics?.[openMetric?.key] ?? '-'}/100</Badge>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}