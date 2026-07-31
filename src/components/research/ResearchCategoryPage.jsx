import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ResearchNav from "./ResearchNav";
import ResearchFooter from "./ResearchFooter";
import SEOHead from "../shared/SEOHead";

export default function ResearchCategoryPage({ title, intro, tools }) {
  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <SEOHead title={`${title} — Suttain Research`} description={intro} />
      <ResearchNav />

      <section className="page-wrapper content-container">
        <h1>{title}</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">{intro}</p>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map(({ path, label, description, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className="group block rounded-2xl border border-research-accent-light bg-white p-6 h-full transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="w-11 h-11 rounded-xl bg-research-accent-light flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-research-accent" />
              </div>
              <h3 className="mb-2">{label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-research-accent">
                Open
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <ResearchFooter />
    </div>
  );
}