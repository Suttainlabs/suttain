import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { QrCode, Sparkles, TestTube, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const TOOLS = [
  {
    icon: QrCode,
    label: "SuttainScan",
    desc: "Scan any product barcode for a full ingredient breakdown, toxicity profile, and eco-impact score.",
    href: "BarcodeScanner",
    color: "#0D9E8E",
  },
  {
    icon: Sparkles,
    label: "Formula Generator",
    desc: "Build fully validated formulas with safety scoring, compliance flags, and sustainability ratings.",
    href: "generator",
    color: "#007850",
  },
  {
    icon: TestTube,
    label: "Chemical Simulator",
    desc: "Test chemical interactions, predict hazards, and analyze safety data sheets with AI-powered risk scoring.",
    href: "Simulator",
    color: "#007850",
  },
];

export default function AnalyzeProductModal({ open, onOpenChange }) {
  const navigate = useNavigate();

  const handleSelect = (href) => {
    onOpenChange(false);
    navigate(createPageUrl(href));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Choose a tool to get started
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            All tools are free to start — no credit card required.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.href}
                onClick={() => handleSelect(tool.href)}
                className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white text-left hover:border-slate-300 hover:shadow-md transition-all group"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: tool.color + "14", border: `1px solid ${tool.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: tool.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{tool.label}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{tool.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1 group-hover:translate-x-1 group-hover:text-slate-600 transition-all" />
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}