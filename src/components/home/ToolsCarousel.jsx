import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export default function ToolsCarousel({ tools, autoInterval = 3500 }) {
  const scrollRef = useRef(null);
  const [paused, setPaused] = useState(false);

  const getStep = () => {
    const el = scrollRef.current;
    if (!el) return 300;
    const card = el.querySelector("[data-card]");
    return card ? card.offsetWidth + 20 : el.clientWidth;
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
        className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2"
      >
        {tools.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <div
              key={i}
              data-card
              className="snap-start shrink-0 w-[85%] sm:w-[45%] lg:w-[28%] xl:w-[24%]"
            >
              <Link
                to={createPageUrl(tool.href)}
                className="block bg-white rounded-2xl p-5 border border-slate-200 h-full hover:shadow-md hover:border-slate-300 transition-all group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: tool.color + "14" }}
                >
                  <Icon className="w-5 h-5" style={{ color: tool.color }} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">{tool.label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">{tool.desc}</p>
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold"
                  style={{ color: tool.color }}
                >
                  Open tool
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Arrow controls */}
      <button
        onClick={() => scrollByDir(-1)}
        aria-label="Previous tools"
        className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 hover:shadow-md transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => scrollByDir(1)}
        aria-label="Next tools"
        className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 hover:shadow-md transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}