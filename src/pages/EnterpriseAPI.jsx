import React from "react";
import { Link } from "react-router-dom";
import { Microscope, BookOpen, Mail } from "lucide-react";
import { createPageUrl } from "@/utils";
import EnterpriseHero from "@/components/enterprise/EnterpriseHero";
import EnterpriseCapabilities from "@/components/enterprise/EnterpriseCapabilities";
import EnterpriseDevExperience from "@/components/enterprise/EnterpriseDevExperience";
import EnterpriseWaitlistForm from "@/components/enterprise/EnterpriseWaitlistForm";

export default function EnterpriseAPI() {
  return (
    <div className="min-h-screen bg-[#EDF7F2]">
      <EnterpriseHero />
      <EnterpriseCapabilities />
      <EnterpriseDevExperience />

      {/* Waitlist Section */}
      <section id="waitlist" className="py-16 bg-[#EDF7F2] scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="text-xs font-bold tracking-widest text-violet-500 uppercase mb-2">
              Get Early Access
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
              Join the Enterprise Waitlist
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Be among the first to access the Suttain API. We are onboarding
              organizations in cohorts.
            </p>
          </div>

          <EnterpriseWaitlistForm />
        </div>
      </section>

      {/* Footer Links */}
      <footer className="bg-gradient-to-br from-[#1a3a35] via-slate-900 to-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
            <Link
              to={createPageUrl("ResearchPortal")}
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-teal-400 transition-colors"
            >
              <Microscope className="w-4 h-4" />
              Research Portal
            </Link>
            <Link
              to={createPageUrl("APIPortal")}
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-teal-400 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Interactive API Docs
            </Link>
            <a
              href="mailto:enterprise@suttain.com"
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-teal-400 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contact Sales
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}