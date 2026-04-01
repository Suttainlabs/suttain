import React, { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AuthContext from "../components/auth/AuthContext";
import AuthGate from "../components/auth/AuthGate";
import UsageChart from "../components/analytics/UsageChart";
import TopChemicals from "../components/analytics/TopChemicals";
import SustainabilityTrend from "../components/analytics/SustainabilityTrend";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart2, TestTube, Atom, QrCode } from "lucide-react";

function StatCard({ icon: Icon, label, value, colorClass }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyAnalytics() {
  const { user } = useContext(AuthContext);

  const { data: simulations = [] } = useQuery({
    queryKey: ["my-simulations"],
    queryFn: () => base44.entities.Simulation.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const { data: formulas = [] } = useQuery({
    queryKey: ["my-formulas"],
    queryFn: () => base44.entities.Formula.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const { data: scans = [] } = useQuery({
    queryKey: ["my-scans"],
    queryFn: () => base44.entities.BarcodeHistory.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const { data: sustainabilityProfiles = [] } = useQuery({
    queryKey: ["my-sustainability"],
    queryFn: () => base44.entities.SustainabilityProfile.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  return (
    <AuthGate featureName="My Analytics" featureDescription="Track your usage, top chemicals, and sustainability progress.">
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-xl flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Analytics</h1>
              <p className="text-sm text-slate-500">A personal snapshot of your Suttain activity</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard icon={TestTube} label="Simulations Run" value={simulations.length} colorClass="bg-teal-500" />
            <StatCard icon={Atom} label="Formulas Created" value={formulas.length} colorClass="bg-violet-600" />
            <StatCard icon={QrCode} label="Products Scanned" value={scans.length} colorClass="bg-cyan-500" />
          </div>

          <UsageChart simulations={simulations} formulas={formulas} scans={scans} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TopChemicals simulations={simulations} />
            <SustainabilityTrend profiles={sustainabilityProfiles} />
          </div>

        </div>
      </div>
    </AuthGate>
  );
}