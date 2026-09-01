import React from 'react';
import { ShieldCheck, Database, Cog, Users, Ban, Cookie, Clock, FileText, Lock, Baby, RefreshCw, Mail } from 'lucide-react';

const SECTIONS = [
  {
    icon: Database,
    title: '1. Information We Collect',
    paragraphs: [
      { type: 'p', text: 'Suttain LLC ("Suttain," "we," "us") operates the website suttain.com, the Suttain consumer tools, the Research Portal, and the Suttain Enterprise API. This policy explains what data we collect, how we use it, and the choices you have.' },
      { type: 'subhead', text: 'Account data' },
      { type: 'p', text: 'When you create an account, we store your name, email address, and password (hashed). If you purchase a paid plan, we also store billing details processed through our payment provider. We do not store full card numbers on our servers.' },
      { type: 'subhead', text: 'Usage data' },
      { type: 'p', text: 'We log the queries you run (chemical names, ingredient searches, scans), the tools you use, and aggregated interaction data for improving our models. Individual scan data is aggregated and never sold as personally identifiable records.' },
      { type: 'subhead', text: 'Technical data' },
      { type: 'p', text: 'IP address, browser type, device type, and session timestamps for security and performance monitoring.' },
      { type: 'subhead', text: 'API data' },
      { type: 'p', text: 'If you use the Enterprise API, we log request counts, endpoint usage, and API key identifiers for rate limiting and abuse prevention. We do not store the content of your API request payloads beyond the time needed to return a response.' },
    ]
  },
  {
    icon: Cog,
    title: '2. How We Use Your Data',
    paragraphs: [
      { type: 'list', items: [
        'To provide and improve the Suttain platform and tools',
        'To process payments and manage subscriptions',
        'To improve our chemical safety models through aggregate, de-identified usage patterns',
        'To send service notifications, security alerts, and (with consent) product updates',
        'To enforce rate limits and prevent abuse',
      ]}
    ]
  },
  {
    icon: Ban,
    title: '3. What We Do Not Do',
    paragraphs: [
      { type: 'list', items: [
        'We do not sell your personal data to third parties',
        'We do not share individual scan or query histories with advertisers',
        'We do not use your data to train third-party models without consent',
        'We do not retain payment card details on our infrastructure',
      ]}
    ]
  },
  {
    icon: Users,
    title: '4. Third-Party Services',
    paragraphs: [
      { type: 'p', text: 'We rely on these third-party services to operate the platform:' },
      { type: 'list', items: [
        'PubChem, ChEMBL, EPA CompTox, RCSB PDB, and AlphaFold DB for chemical and protein data',
        'Google, Microsoft, or Apple for authentication (if you use social sign-in)',
        'Our payment processor for billing (card data never touches our servers)',
        'Open-Meteo for weather data (Suttain Farm, if applicable)',
        'USDA FoodData Central and OpenFoodFacts for nutrition data',
      ]},
      { type: 'p', text: 'Each third party has its own privacy policy. We recommend reviewing them.' },
    ]
  },
  {
    icon: Cookie,
    title: '5. Cookies',
    paragraphs: [
      { type: 'p', text: 'We use essential cookies for authentication and session management. We do not use advertising or tracking cookies. You can disable cookies in your browser, but some features may not work.' },
    ]
  },
  {
    icon: Clock,
    title: '6. Data Retention',
    paragraphs: [
      { type: 'p', text: 'Account data is retained while your account is active. You can request deletion at any time. API request logs are retained for 90 days for security auditing, then automatically purged. Aggregate, de-identified usage data may be retained indefinitely for model improvement.' },
    ]
  },
  {
    icon: FileText,
    title: '7. Your Rights',
    paragraphs: [
      { type: 'p', text: 'You have the right to:' },
      { type: 'list', items: [
        'Access the personal data we hold about you',
        'Request correction of inaccurate data',
        'Request deletion of your account and associated data',
        'Export your data in a machine-readable format',
        'Object to certain processing of your data',
      ]},
      { type: 'p', text: 'To exercise any of these rights, contact us at contact@suttain.com.' },
    ]
  },
  {
    icon: Lock,
    title: '8. Security',
    paragraphs: [
      { type: 'p', text: 'We use industry-standard practices including encrypted data transmission (TLS), hashed passwords, and access controls. No method of transmission or storage is 100% secure, but we work to protect your data.' },
    ]
  },
  {
    icon: Baby,
    title: "9. Children's Privacy",
    paragraphs: [
      { type: 'p', text: 'Suttain is not directed to children under 13. We do not knowingly collect personal data from children under 13. If you believe we have, contact us and we will delete it.' },
    ]
  },
  {
    icon: RefreshCw,
    title: '10. Changes to This Policy',
    paragraphs: [
      { type: 'p', text: 'We may update this policy as our services evolve. Material changes will be posted on this page with an updated date. Continued use after changes constitutes acceptance.' },
    ]
  },
  {
    icon: Mail,
    title: '11. Contact',
    paragraphs: [
      { type: 'p', text: 'Questions? Email contact@suttain.com or write to Suttain LLC, 8539 Alma Lily Dr, Richmond, TX 77469.' },
    ]
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="w-7 h-7" style={{ color: '#02988C' }} />
            <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-[#0A1F1D]">Privacy Policy</h1>
          </div>
          <p className="text-sm text-slate-500">Last updated: September 1, 2026</p>
        </div>

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
                    if (para.type === 'subhead') {
                      return <p key={pidx} className="text-[15px] font-semibold text-slate-800 pt-1">{para.text}</p>;
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