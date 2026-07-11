import React, { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function EnterpriseWaitlistForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company_name: "",
    role: "",
    description: "",
  });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      await base44.entities.EnterpriseWaitlist.create({
        name: formData.name,
        email: formData.email,
        company_name: formData.company_name,
        role: formData.role,
        description: formData.description,
      });
      setStatus("success");
    } catch (err) {
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-teal-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">You're on the list!</h3>
        <p className="text-sm text-slate-500">
          We'll be in touch as we onboard new organizations in upcoming cohorts.
          Keep an eye on your inbox.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-lg mx-auto"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Work Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
            placeholder="jane@company.com"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Organization <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="company_name"
            required
            value={formData.company_name}
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
            placeholder="Acme Corp"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Role
          </label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
            placeholder="CTO"
          />
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Tell us about your use case
        </label>
        <textarea
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-none"
          placeholder="We need to batch-screen 10,000 ingredients for EU compliance..."
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-500 mb-3">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-[#007850] to-[#00A8C8] hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 disabled:opacity-60"
      >
        {status === "submitting" && <Loader2 className="w-4 h-4 animate-spin" />}
        {status === "submitting" ? "Submitting..." : "Join the Waitlist"}
      </button>
    </form>
  );
}