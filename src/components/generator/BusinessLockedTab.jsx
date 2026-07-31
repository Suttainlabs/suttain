import React from "react";
import { Link } from "react-router-dom";
import { Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const BUSINESS_FEATURES = [
  "Industrial scale-up engineering with batch loss calculations",
  "Raw material sourcing & supplier procurement integration",
  "Full regulatory compliance audit (FDA / EU REACH / GHS)",
  "One-click Technical Data Sheets (TDS) & batch records",
  "Commercial cost-per-kg production analysis",
];

export default function BusinessLockedTab({ title, description }) {
  return (
    <div className="flex items-center justify-center py-6">
      <Card className="w-full max-w-xl bg-gradient-to-br from-violet-50 to-white border-2 border-violet-200 shadow-sm">
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-violet-100 flex items-center justify-center">
            <Lock className="w-7 h-7 text-violet-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            {title || "Business Mode feature"}
          </h3>
          <p className="text-sm text-slate-600 mb-5 max-w-md mx-auto">
            {description ||
              "This professional tool is exclusive to Business Mode. Switch modes or upgrade to unlock industrial-grade formulation, compliance, and scale-up tooling."}
          </p>

          <ul className="text-left space-y-2 mb-6 max-w-md mx-auto">
            {BUSINESS_FEATURES.map((feat) => (
              <li key={feat} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white">
              <Link to="/Pricing">
                Upgrade to Business
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-violet-300 text-violet-700 hover:bg-violet-50">
              <Link to="/generator">Start in Business Mode</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}