import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";

export default function ToolsCarousel({ tools, speed = 30 }) {
  const [paused, setPaused] = useState(false);
  const loop = [...tools, ...tools];

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex gap-3 w-max"
        style={{
          animation: `tools-marquee ${speed}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {loop.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <Link
              key={i}
              to={createPageUrl(tool.href)}
              className="inline-flex items-center gap-2.5 pl-3.5 pr-3 py-2.5 bg-white rounded-full border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group whitespace-nowrap"
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: tool.color + "14" }}
              >
                <Icon className="w-4 h-4" style={{ color: tool.color }} />
              </span>
              <span className="text-sm font-semibold text-slate-800">{tool.label}</span>
              <ArrowRight
                className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                style={{ color: tool.color }}
              />
            </Link>
          );
        })}
      </div>

      <style>{`
        @keyframes tools-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}