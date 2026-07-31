import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Download, Loader2, FileText, AlertTriangle, CheckCircle2, Globe } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PERSONA_REGULATIONS = {
  manufacturer:  ['REACH', 'GHS/SDS', 'EPA TSCA', 'OSHA HazCom'],
  engineer:      ['REACH', 'EPA TSCA', 'OSHA PEL', 'NFPA 704'],
  petroleum:     ['EPA Clean Air Act', 'OSHA PSM', 'DOT HazMat', 'NFPA 30'],
  textile:       ['REACH SVHC', 'ZDHC MRSL', 'OEKO-TEX 100', 'EPA Dye Discharge'],
  automotive:    ['REACH ELV', 'RoHS', 'EU IMDS', 'EPA VOC'],
  logistics:     ['DOT 49 CFR', 'IATA DGR', 'IMDG Code', 'UN GHS'],
  mining:        ['EPA CWA', 'MSHA CFR 30', 'UN GHS', 'RCRA'],
  pharma:        ['FDA 21 CFR', 'ICH Q3D', 'EU Annex II/III', 'USP/NF'],
  doctor:        ['FDA Drug Interactions', 'DEA Schedule', 'JCAHO Standards'],
  nutrition:     ['FDA GRAS', 'EU E-numbers', 'Codex Alimentarius'],
  fitness:       ['FDA DSHEA', 'WADA Prohibited List', 'NSF Sport'],
  nurse:         ['FDA MedWatch', 'USP 797/800', 'OSHA BBP'],
  vet:           ['FDA CVM', 'EPA Pesticide Reg', 'USDA APHIS'],
  eco:           ['EU Green Deal', 'ISO 14040 LCA', 'EPA Safer Choice'],
  water:         ['EPA SDWA', 'EU WFD', 'WHO Drinking Water'],
  forestry:      ['EPA FIFRA', 'EU Plant Protection', 'USDA NOP'],
  marine:        ['MARPOL', 'EPA Ocean Dumping', 'CWA §404'],
  air:           ['EPA CAA', 'NIOSH REL', 'ACGIH TLV', 'OSHA PEL'],
  recycling:     ['EU WEEE', 'RoHS', 'Basel Convention', 'EPA RCRA'],
  household:     ['EPA Safer Choice', 'CPSC', 'California Prop 65'],
  parent:        ['CPSC 16 CFR', 'REACH Child Safety', 'FDA Cosmetics'],
  diy:           ['OSHA HazCom', 'EPA Safer Choice', 'ANSI Labels'],
  chef:          ['FDA FSMA', 'EU 1333/2008', 'Codex Alimentarius'],
  traveler:      ['IATA DGR', 'EU Cosmetics Reg', 'TSA Rules'],
  business:      ['EU Cosmetics Reg 1223/2009', 'FDA Cosmetics', 'REACH'],
  cosmetic:      ['EU Cosmetics Reg 1223/2009', 'FDA 21 CFR 700', 'REACH SVHC'],
  safety:        ['OSHA 29 CFR 1910', 'GHS/SDS', 'NFPA 704', 'ISO 45001'],
  regulatory:    ['REACH', 'EU CLP', 'FDA Cosmetics', 'EPA TSCA'],
  consultant:    ['REACH', 'GHS', 'EPA TSCA', 'ISO 9001'],
  lab:           ['OSHA Lab Std 1910.1450', 'NFPA 45', 'ISO 17025', 'GLP'],
  student:       ['GHS Safety Labels', 'OSHA Lab Safety', 'ACS Guidelines'],
  teacher:       ['OSHA Lab Std', 'ACS Safety', 'NSTA Standards'],
  professor:     ['OSHA 1910.1450', 'NIH Guidelines', 'EPA Research Waste'],
  researcher:    ['OSHA 1910.1450', 'EPA Research Exemption', 'GLP Standards'],
};

const STATUS_COLORS = {
  'Banned/Highly Controlled': 'bg-red-100 text-red-800 border-red-200',
  'Restricted': 'bg-orange-100 text-orange-800 border-orange-200',
  'Requires Warning/Labeling': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Generally Permitted': 'bg-green-100 text-green-800 border-green-200',
};

const BANNED = ['mercury', 'lead', 'arsenic', 'asbestos', 'ddt', 'pcbs', 'chloroform', 'benzene', 'formaldehyde', 'vinyl chloride', 'cadmium'];
const RESTRICTED = ['ammonia', 'hydrogen peroxide', 'sulfuric acid', 'hydrochloric acid', 'sodium hydroxide', 'acetone', 'toluene', 'methanol', 'chlorine', 'nitric acid'];
const WARNING = ['bleach', 'sodium hypochlorite', 'isopropyl alcohol', 'acetic acid', 'ethanol', 'xylene'];

function quickClassify(name) {
  const n = (name || '').toLowerCase();
  if (BANNED.some(b => n.includes(b))) return 'Banned/Highly Controlled';
  if (RESTRICTED.some(r => n.includes(r))) return 'Restricted';
  if (WARNING.some(w => n.includes(w))) return 'Requires Warning/Labeling';
  return 'Generally Permitted';
}

function getStatusIcon(status) {
  if (status === 'Banned/Highly Controlled') return <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
  if (status === 'Restricted') return <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />;
  if (status === 'Requires Warning/Labeling') return <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />;
  return <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />;
}

export default function ComplianceAuditPanel({ chemicals, persona, simulationData }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const regs = PERSONA_REGULATIONS[persona] || PERSONA_REGULATIONS['household'];
  const chemNames = chemicals.map(c => c.name || c.scientific_name || String(c));

  const handleDownload = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // Invoke via the SDK so the user's auth token is attached automatically.
      // A raw fetch with credentials:'include' does not send the Bearer token,
      // which caused "Authentication required to view users" and no download.
      const response = await base44.functions.invoke('generateComplianceReport', {
        chemicals,
        persona,
        simulationData: simulationData ? {
          risk_assessment: simulationData.risk_assessment,
          safety_status: simulationData.safety_status
        } : null
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suttain-compliance-audit-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Compliance report error:', err);
      const msg = err?.response?.data?.error || err?.message || 'Failed to generate report.';
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Regulatory Compliance Audit</h3>
            <p className="text-xs text-slate-500 mt-0.5">AI-powered scan against global databases</p>
          </div>
        </div>
        <Button
          onClick={handleDownload}
          disabled={isGenerating}
          size="sm"
          className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-xs font-semibold px-4 flex-shrink-0"
        >
          {isGenerating ? (
            <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Generating...</>
          ) : (
            <><Download className="w-3.5 h-3.5 mr-1.5" />Download PDF</>
          )}
        </Button>
      </div>

      {/* Chemical quick-status */}
      <div className="space-y-1.5 mb-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Chemicals in scope</p>
        {chemNames.map((name, i) => {
          const status = quickClassify(name);
          return (
            <div key={i} className="flex items-center gap-2">
              {getStatusIcon(status)}
              <span className="text-xs text-slate-700 font-medium flex-1 truncate capitalize">{name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[status]}`}>
                {status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Regulatory frameworks covered */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Frameworks checked for your profile</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {regs.map(reg => (
            <span key={reg} className="text-[10px] font-semibold px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
              {reg}
            </span>
          ))}
        </div>
      </div>

      {/* What's included */}
      <div className="bg-slate-50 rounded-xl p-3 mb-3">
        <p className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Report includes:
        </p>
        <ul className="space-y-1">
          {[
            'Per-chemical compliance status (banned / restricted / permitted)',
            'SDS classification & hazard categories',
            'Critical compliance gaps & risk flags',
            `${regs.length} regulatory framework analysis tailored to your persona`,
            'AI-generated actionable recommendations',
            'Cross-chemical regulatory interaction notes',
          ].map(item => (
            <li key={item} className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-teal-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-slate-600">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {isGenerating && (
        <div className="text-center py-2">
          <p className="text-xs text-slate-500 animate-pulse">
            Scanning regulatory databases & generating PDF… this may take 20–30 seconds.
          </p>
        </div>
      )}
    </motion.div>
  );
}