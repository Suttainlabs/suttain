import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export default function ToolsCarousel({ tools, autoInterval = 3500 }) {
  const scrollRef = useRef(null);
  const [paused, setPaused] = useState(false);

  const getStep = () => {
    const el = scrollRef.current;
    if (!el) return 240;
    const pill = el.querySelector("[data-card]");
    return pill ? pill.offsetWidth + 12 : el.clientWidth;
  };

  const scrollByDir = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * getStep(), behavior: "smooth" });
  };

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: getStep(), behavior: "smooth" });
      }
    }, autoInterval);
    return () => clearInterval(id);
  }, [paused, autoInterval]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1"
      >
        {tools.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <div key={i} data-card className="snap-start shrink-0">
              <Link
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
            </div>
          );
        })}
      </div>

      {/* Arrow controls */}
      <button
        onClick={() => scrollByDir(-1)}
        aria-label="Previous tools"
        className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 hover:shadow-md transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => scrollByDir(1)}
        aria-label="Next tools"
        className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 hover:shadow-md transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}