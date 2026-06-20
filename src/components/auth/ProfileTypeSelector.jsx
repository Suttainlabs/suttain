import React, { useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Microscope, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";

const OPTIONS = [
  {
    id: "consumer",
    icon: FlaskConical,
    title: "Consumer, DIY creator, or small brand",
    description: "I formulate products, scan ingredients for safety, or manage a small brand. I want formula tools, sustainability scoring, and compliance guidance.",
    color: "#007850",
    route: "/Dashboard",
  },
  {
    id: "researcher",
    icon: Microscope,
    title: "Researcher, scientist, or institution",
    description: "I run computational simulations, query chemical databases, publish research, or manage a lab. I need molecular intelligence, DFT, and API access.",
    color: "#6366f1",
    route: "/research",
  },
];

export default function ProfileTypeSelector({ onComplete }) {
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await base44.auth.updateMe({
        profile_type: selected,
        first_login: false,
      });
    } catch (e) {
      // best-effort; don't block
    } finally {
      setSaving(false);
      const option = OPTIONS.find(o => o.id === selected);
      onComplete && onComplete();
      navigate(option.route);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-1">How will you use Suttain?</h2>
          <p className="text-sm text-slate-500">
            This helps us route you to the right tools. You can switch at any time.
          </p>
        </div>

        {/* Options */}
        <div className="px-8 py-6 flex flex-col gap-4">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = selected === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
                  isActive
                    ? "shadow-md"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
                style={isActive ? { borderColor: opt.color, background: opt.color + "06" } : {}}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: opt.color + "14" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: opt.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm mb-1">{opt.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{opt.description}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all ${
                      isActive ? "border-4" : "border-slate-300"
                    }`}
                    style={isActive ? { borderColor: opt.color, background: opt.color } : {}}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-400">You can change this later in your profile settings.</p>
          <button
            onClick={handleContinue}
            disabled={!selected || saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: selected ? OPTIONS.find(o => o.id === selected)?.color : "#94a3b8" }}
          >
            {saving ? "Saving..." : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}