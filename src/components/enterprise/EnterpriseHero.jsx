import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { createPageUrl } from "@/utils";

const STATS = [
  { value: "130M+", label: "Chemical Records" },
  { value: "< 200ms", label: "Avg. Response Time" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "3", label: "Native SDKs" },
];

export default function EnterpriseHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#F0FAF5] to-[#EDF7F2] pt-16 pb-12">
      {/* Decorative gradient orbs */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200 mb-6">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-xs font-bold tracking-widest text-violet-600 uppercase">
            Enterprise API: Early Access
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-2">
          <span className="bg-gradient-to-r from-violet-600 via-cyan-500 to-teal-600 bg-clip-text text-transparent">
            Integrate Molecular Intelligence
          </span>
        </h1>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 leading-tight mb-6">
          Into Your Stack
        </h2>

        {/* Paragraph */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          A production-grade REST API with native SDKs for Python, JavaScript, and R.
          Access 130M+ chemical records, run computational simulations, and automate
          safety compliance at scale.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#waitlist"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-[#007850] to-[#00A8C8] hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300"
          >
            Join Enterprise Waitlist
            <ArrowRight className="w-4 h-4" />
          </a>
          <Link
            to={createPageUrl("APIPortal")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#007850] text-[#007850] font-semibold text-sm hover:bg-[#007850]/5 transition-all duration-300"
          >
            <BookOpen className="w-4 h-4" />
            Explore API Docs
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 mt-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 text-center"
            >
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 to-teal-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}