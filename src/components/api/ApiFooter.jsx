import React from "react";
import { Link } from "react-router-dom";

const linkClass = "text-slate-500 hover:text-api-accent transition-colors";

export default function ApiFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 text-sm">
      <div className="content-container px-4 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-3">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png"
            alt="Suttain"
            className="h-7 w-auto"
          />
          <p className="text-slate-500 leading-relaxed">
            The Suttain API exposes the same molecular intelligence behind Formula builder and Research,
            with source citations and confidence scores on every field.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-slate-800">Developers</h3>
          <ul className="space-y-1.5">
            <li><Link to="/APIPortal" className={linkClass}>Docs</Link></li>
            <li><Link to="/APIPortal" className={linkClass}>Status</Link></li>
            <li><Link to="/APIPortal" className={linkClass}>Changelog</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-slate-800">More from Suttain</h3>
          <ul className="space-y-1.5">
            <li><a href="https://suttain.com" target="_blank" rel="noopener noreferrer" className={linkClass}>suttain.com</a></li>
            <li><a href="https://research.suttain.com" target="_blank" rel="noopener noreferrer" className={linkClass}>research.suttain.com</a></li>
            <li><a href="https://farm.suttain.com/SuttainFarm" target="_blank" rel="noopener noreferrer" className={linkClass}>farm.suttain.com</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-slate-800">Company</h3>
          <ul className="space-y-1.5">
            <li><Link to="/Pricing" className={linkClass}>Pricing</Link></li>
            <li><a href="mailto:contact@suttain.com" className={linkClass}>Contact</a></li>
            <li><Link to="/TermsOfService" className={linkClass}>Legal</Link></li>
          </ul>
        </div>
      </div>

      <div className="content-container px-4 pb-6 text-slate-400">
        © {new Date().getFullYear()} Suttain. All rights reserved.
      </div>
    </footer>
  );
}