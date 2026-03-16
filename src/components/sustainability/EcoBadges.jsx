import React from "react";
import { Badge } from "@/components/ui/badge";
import { Leaf, Droplets, ShieldCheck, Recycle, Factory } from "lucide-react";

const BADGE_MAP = {
  "Low Carbon": { icon: Factory, color: "bg-green-100 text-green-700" },
  "Plastic-Free": { icon: Recycle, color: "bg-teal-100 text-teal-700" },
  "Zero Toxins": { icon: ShieldCheck, color: "bg-emerald-100 text-emerald-700" },
  "Water Efficient": { icon: Droplets, color: "bg-blue-100 text-blue-700" },
  "Ethically Sourced": { icon: Leaf, color: "bg-lime-100 text-lime-700" },
  "Biodegradable": { icon: Recycle, color: "bg-green-100 text-green-700" },
};

export default function EcoBadges({ badges }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, i) => {
        const config = BADGE_MAP[badge] || { icon: Leaf, color: "bg-slate-100 text-slate-700" };
        const Icon = config.icon;
        return (
          <Badge key={i} className={`${config.color} gap-1.5 text-xs font-medium px-3 py-1`}>
            <Icon className="w-3 h-3" />
            {badge}
          </Badge>
        );
      })}
    </div>
  );
}