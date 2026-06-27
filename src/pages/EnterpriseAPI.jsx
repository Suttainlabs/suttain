import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Terminal, Code2, Server, Cloud, Lock, Database,
  Zap, ArrowRight, CheckCircle2, Cpu,
  GitBranch, BarChart2, ShieldCheck,
  BookOpen, Webhook, FileJson,
  Mail, Building2, User, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Section, SectionHeader } from "@/components/shared/Section";

const API_FEATURES = [
  {
    icon: Database,
    title: "Chemical Intelligence API",
    desc: "Query 115M+ compounds with property, toxicity, and regulatory data via a single REST endpoint.",
    endpoints: ["GET /v1/chemicals/{cid}", "POST /v1/chemicals/search", "GET /v1/chemicals/batch"],
    gradient: "from-[#6B3FA0] to-[#8B5CF6]"
  },
  {
    icon: Server,
    title: "Simulation Engine API",
    desc: "Submit computational jobs (DFT, MD, QM/MM) programmatically and retrieve results asynchronously.",
    endpoints: ["POST /v1/simulations/run", "GET /v1/simulations/{id}", "GET /v1/simulations/queue"],
    gradient: "from-[#00A8C8] to-[#0096B7]"
  },
  {
    icon: ShieldCheck,
    title: "Safety & Compliance API",
    desc: "Automated SDS parsing, GHS classification, and regulatory cross-referencing across REACH, EPA, and FDA.",
    endpoints: ["POST /v1/sds/analyze", "GET /v1/compliance/{formula_id}", "GET /v1/alerts/regulatory"],
    gradient: "from-[#007850] to-[#00B478]"
  },
  {
    icon: BarChart2,
    title: "Sustainability API",
    desc: "Carbon footprint calculation, LCA scoring, and sustainability benchmarking for chemical formulations.",
    endpoints: ["POST /v1/sustainability/score", "GET /v1/sustainability/benchmark", "GET /v1/carbon/calculate"],
    gradient: "from-[#007850] to-[#009970]"
  },
  {
    icon: Webhook,
    title: "Webhooks & Events",
    desc: "Real-time event streaming for simulation completion, regulatory changes, and safety alert triggers.",
    endpoints: ["POST /v1/webhooks/register", "GET /v1/webhooks/events", "DELETE /v1/webhooks/{id}"],
    gradient: "from-[#6B3FA0] to-[#9333EA]"
  },
  {
    icon: Lock,
    title: "Auth & Rate Limiting",
    desc: "API key authentication, role-based access control, and intelligent rate limiting with burst allowances.",
    endpoints: ["POST /v1/auth/token", "GET /v1/auth/limits", "POST /v1/auth/rotate-key"],
    gradient: "from-slate-500 to-slate-700"
  }
];

const SDK_LANGUAGES = [
  { name: "Python", color: "from-[#00A8C8] to-[#0096B7]", badge: "Primary" },
  { name: "JavaScript", color: "from-[#007850] to-[#009970]", badge: "Node/Browser" },
  { name: "R", color: "from-[#6B3FA0] to-[#8B5CF6]", badge: "CRAN" },
  { name: "cURL", color: "from-slate-400 to-slate-600", badge: "Any" },
];

export default function EnterpriseAPI() {
  const [form, setForm] = useState({ name: "", email: "", company_name: "", role: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.company_name) return;
    setSubmitting(true);
    try {
      await base44.entities.EnterpriseWaitlist.create({
        name: form.name,
        email: form.email,
        company_name: form.company_name,
        role: form.role,
        message: form.message,
        status: "pending"
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Waitlist submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="text-slate-800">
      <div className="relative z-10">
        {/* ── Hero ── */}
        <Section spacing="default" width="wide" className="hero-offset">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-4 py-1.5 mb-8">
              <div className="w-1.5 h-1.5 bg-[#6B3FA0] rounded-full animate-pulse" />
              <span className="text-xs text-violet-700 uppercase tracking-[0.2em] font-bold">
                Enterprise API — Early Access
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6 text-slate-900">
              <span className="bg-gradient-to-r from-[#6B3FA0] via-[#00A8C8] to-[#007850] bg-clip-text text-transparent">
                Integrate Molecular Intelligence
              </span>
              <br />
              <span className="text-2xl md:text-4xl text-slate-500 font-medium">
                Into Your Stack
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-6">
              A production-grade REST API with native SDKs for Python, JavaScript, and R.
              Access 115M+ chemical records, run computational simulations, and automate safety compliance at scale.
            </p>

            <div className="flex items-center justify-center gap-4 mt-10">
              <a href="#waitlist">
                <Button size="lg" className="bg-gradient-to-r from-[#007850] to-[#00A8C8] hover:opacity-90 text-white border-0 h-14 px-10 text-base font-semibold rounded-xl shadow-md">
                  Join Enterprise Waitlist
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <a href="#features">
                <Button variant="outline" size="lg" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 h-14 px-10 text-base rounded-xl">
                  <BookOpen className="mr-2 w-5 h-5" />
                  Explore API Docs
                </Button>
              </a>
            </div>
          </div>
        </Section>

        {/* ── Stats Strip ── */}
        <section className="border-y border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "115M+", label: "Chemical Records", icon: Database },
                { value: "< 200ms", label: "Avg. Response Time", icon: Zap },
                { value: "99.9%", label: "Uptime SLA", icon: Cloud },
                { value: "3", label: "Native SDKs", icon: Code2 },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <stat.icon className="w-5 h-5 text-[#6B3FA0] mb-1" />
                  <div className="text-3xl md:text-4xl font-bold text-slate-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── API Features Grid ── */}
        <Section spacing="default" width="wide" background="muted">
          <SectionHeader
            align="center"
            eyebrow={<span className="text-xs text-[#6B3FA0] uppercase tracking-[0.2em] font-semibold">API Capabilities</span>}
            heading={<span className="text-slate-900">Everything You Need, Programmatically</span>}
            subtext={<span className="text-slate-600">RESTful endpoints with JSON responses, comprehensive error handling, and interactive API reference.</span>}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {API_FEATURES.map((feature, i) => (
              <div key={i} className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:border-violet-200 hover:shadow-lg transition-all duration-500">
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.gradient} rounded-t-2xl`} />

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-md`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="font-bold text-slate-900 text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">{feature.desc}</p>

                <div className="space-y-1.5">
                  {feature.endpoints.map((ep, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5">
                      <span className={`w-1 h-1 rounded-full ${ep.startsWith("GET") ? "bg-emerald-500" : ep.startsWith("POST") ? "bg-violet-500" : "bg-rose-500"}`} />
                      {ep}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── SDK Section ── */}
        <Section spacing="default" width="wide">
          <div className="bg-white border border-slate-200 rounded-3xl p-10 md:p-16">
            <div className="text-center mb-12">
              <p className="text-xs text-[#00A8C8] uppercase tracking-[0.2em] font-semibold mb-4">Developer Experience</p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Native SDKs for Every Stack</h2>
              <p className="text-slate-600 max-w-xl mx-auto">
                Install in seconds. Full type support. Auto-complete. Production-ready from day one.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {SDK_LANGUAGES.map((lang, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center hover:border-violet-200 transition-all group">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${lang.color} flex items-center justify-center mx-auto mb-4 shadow-md`}>
                    <Code2 className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg mb-1">{lang.name}</h4>
                  <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">{lang.badge}</span>
                  <div className="mt-5 bg-slate-900 rounded-xl p-4 text-left">
                    <code className="text-xs text-slate-300 font-mono">
                      {lang.name === "Python" && <>pip install suttain-sdk</>}
                      {lang.name === "JavaScript" && <>npm install @suttain/sdk</>}
                      {lang.name === "R" && <>install.packages("suttain")</>}
                      {lang.name === "cURL" && <>curl -H "Authorization: Bearer $TOKEN" https://api.suttain.com/v1/chemicals/search</>}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Waitlist Form ── */}
        <Section spacing="default" width="wide" background="muted">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs text-[#6B3FA0] uppercase tracking-[0.2em] font-semibold mb-4">Get Early Access</p>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                Join the Enterprise Waitlist
              </h2>
              <p className="text-slate-600 max-w-xl mx-auto text-lg">
                Be among the first to access the Suttain API. We are onboarding organizations in cohorts.
              </p>
            </div>

            {submitted ? (
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-3xl p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#007850] to-[#00A8C8] flex items-center justify-center mx-auto mb-6 shadow-md">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">You are on the list.</h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  We will reach out within 1-2 business days with onboarding details and API credentials.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name <span className="text-[#6B3FA0]">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Dr. Jane Smith"
                        className="pl-10 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 h-12 rounded-xl focus:border-violet-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Work Email <span className="text-[#6B3FA0]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="jane@institution.edu"
                        className="pl-10 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 h-12 rounded-xl focus:border-violet-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Organization <span className="text-[#6B3FA0]">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        required
                        value={form.company_name}
                        onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                        placeholder="Stanford University"
                        className="pl-10 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 h-12 rounded-xl focus:border-violet-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Role
                    </label>
                    <Input
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      placeholder="Principal Investigator"
                      className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 h-12 rounded-xl focus:border-violet-400"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tell us about your use case
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={3}
                    placeholder="Describe how you plan to use the API, expected volume, and any specific endpoints you are interested in."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl p-4 text-sm focus:border-violet-400 focus:outline-none resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-[#007850] to-[#00A8C8] hover:opacity-90 text-white h-14 text-base font-bold rounded-xl shadow-md"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Join the Waitlist
                      <ArrowUpRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </Section>

        {/* ── Bottom CTA ── */}
        <section className="border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-16 text-center">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link to={createPageUrl("ResearchLanding")}>
                <Button variant="outline" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 h-12 px-8 rounded-xl">
                  <Cpu className="mr-2 w-4 h-4" />
                  Research Portal
                </Button>
              </Link>
              <Link to={createPageUrl("APIPortal")}>
                <Button variant="outline" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 h-12 px-8 rounded-xl">
                  <BookOpen className="mr-2 w-4 h-4" />
                  Interactive API Docs
                </Button>
              </Link>
              <a href="mailto:enterprise@suttain.com">
                <Button variant="outline" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 h-12 px-8 rounded-xl">
                  <Mail className="mr-2 w-4 h-4" />
                  Contact Sales
                </Button>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}