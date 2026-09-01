import React from 'react';
import { FileText, UserCheck, Ban, Code2, CreditCard, Copyright, AlertTriangle, ShieldOff, LogOut, Scale, RefreshCw, Mail } from 'lucide-react';

const SECTIONS = [
  {
    icon: UserCheck,
    title: '1. Eligibility',
    paragraphs: [
      { type: 'p', text: 'You must be at least 13 years old to use Suttain. If you use the API or paid features, you must be authorized to bind your organization to these Terms.' },
    ]
  },
  {
    icon: UserCheck,
    title: '2. Accounts',
    paragraphs: [
      { type: 'p', text: 'You are responsible for safeguarding your account credentials. You agree not to share your password or API key with others. Notify us immediately at contact@suttain.com if you suspect unauthorized access.' },
    ]
  },
  {
    icon: Ban,
    title: '3. Acceptable Use',
    paragraphs: [
      { type: 'p', text: 'You agree not to:' },
      { type: 'list', items: [
        'Use Suttain to manufacture illegal or dangerous substances',
        'Attempt to reverse-engineer, decompile, or extract our proprietary models or datasets',
        'Scrape or bulk-download data beyond API rate limits',
        'Use the platform to generate content that violates applicable law',
        'Interfere with or disrupt the service or servers',
      ]},
      { type: 'p', text: 'Suttain provides chemical safety information for educational and research purposes. Our tools are not a substitute for professional toxicological advice, regulatory certification, or laboratory testing.' },
    ]
  },
  {
    icon: Code2,
    title: '4. Enterprise API Terms',
    paragraphs: [
      { type: 'p', text: 'API access is governed by your selected tier (Free Academic, Pro, or Enterprise). Free Academic tier allows 100 requests per day for non-commercial research. Pro and Enterprise tiers permit commercial use within your rate limits. API keys are non-transferable. We may suspend access for abuse, excessive rate-limit violations, or security concerns.' },
    ]
  },
  {
    icon: CreditCard,
    title: '5. Subscriptions and Billing',
    paragraphs: [
      { type: 'p', text: 'Paid plans (Suttain Core, Small Business, and Enterprise API tiers) are billed monthly or annually as selected. You can cancel anytime. Cancellations take effect at the end of your current billing cycle. Refunds are issued at our discretion for documented service interruptions.' },
    ]
  },
  {
    icon: Copyright,
    title: '6. Intellectual Property',
    paragraphs: [
      { type: 'p', text: 'Suttain owns the platform, its models, its user interface, and its compiled data. You retain ownership of any formulas, research outputs, or data you create using Suttain. Data sourced from PubChem, ChEMBL, EPA CompTox, RCSB PDB, and AlphaFold remains under their respective licenses. Citation exports include proper attribution to original sources.' },
    ]
  },
  {
    icon: AlertTriangle,
    title: '7. Disclaimers',
    paragraphs: [
      { type: 'p', text: 'Suttain provides information based on publicly available scientific databases and AI-assisted analysis. We do not guarantee the accuracy, completeness, or timeliness of any result. Chemical safety predictions are probabilistic, not definitive. Always verify critical safety decisions with a qualified professional or certified laboratory. Suttain is not liable for decisions made solely based on platform outputs.' },
    ]
  },
  {
    icon: ShieldOff,
    title: '8. Limitation of Liability',
    paragraphs: [
      { type: 'p', text: 'To the maximum extent permitted by law, Suttain LLC shall not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits or data, arising from your use of the platform. Our total liability is limited to the amount you paid us in the 12 months preceding the claim.' },
    ]
  },
  {
    icon: LogOut,
    title: '9. Termination',
    paragraphs: [
      { type: 'p', text: 'We may suspend or terminate your account for violations of these Terms. You may close your account at any time by contacting contact@suttain.com. Upon termination, your data will be deleted within 30 days, except where retention is required by law.' },
    ]
  },
  {
    icon: Scale,
    title: '10. Governing Law',
    paragraphs: [
      { type: 'p', text: 'These Terms are governed by the laws of the State of Wyoming, USA. Any disputes will be resolved in the courts of Wyoming.' },
    ]
  },
  {
    icon: RefreshCw,
    title: '11. Changes to These Terms',
    paragraphs: [
      { type: 'p', text: 'We may update these Terms as our services evolve. Material changes will be posted on this page with an updated date. Continued use after changes constitutes acceptance.' },
    ]
  },
  {
    icon: Mail,
    title: '12. Contact',
    paragraphs: [
      { type: 'p', text: 'Questions? Email contact@suttain.com or write to Suttain LLC, 8539 Alma Lily Dr, Richmond, TX 77469.' },
    ]
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-7 h-7" style={{ color: '#02988C' }} />
            <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-[#0A1F1D]">Terms of Service</h1>
          </div>
          <p className="text-sm text-slate-500">Last updated: September 1, 2026</p>
        </div>

        <p className="text-[15px] text-slate-700 leading-[1.7] mb-10">
          These Terms of Service ("Terms") govern your use of suttain.com and all Suttain products, including consumer tools, the Research Portal, and the Enterprise API. By using Suttain, you agree to these Terms.
        </p>

        <div className="space-y-10">
          {SECTIONS.map((section, idx) => {
            const Icon = section.icon;
            return (
              <section key={idx}>
                <h2 className="flex items-center gap-2.5 text-lg sm:text-xl font-heading font-semibold mb-4" style={{ color: '#02988C' }}>
                  <Icon className="w-5 h-5 flex-shrink-0" style={{ color: '#02988C' }} />
                  {section.title}
                </h2>
                <div className="space-y-3 pl-7">
                  {section.paragraphs.map((para, pidx) => {
                    if (para.type === 'p') {
                      return <p key={pidx} className="text-[15px] text-slate-700 leading-[1.7]">{para.text}</p>;
                    }
                    if (para.type === 'list') {
                      return (
                        <ul key={pidx} className="space-y-1.5">
                          {para.items.map((item, iidx) => (
                            <li key={iidx} className="text-[15px] text-slate-700 leading-[1.7] flex gap-2">
                              <span className="flex-shrink-0 mt-2 w-1 h-1 rounded-full bg-slate-400" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return null;
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}