import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Server, UserCheck, Phone, Handshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ComplianceGuide() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="text-center bg-slate-50 p-8 rounded-t-xl">
            <CardTitle className="text-3xl font-bold text-slate-800">Suttain Compliance & Data Policy</CardTitle>
            <p className="text-slate-500 mt-2">Effective Date: August 22, 2025</p>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-10">
            
            <section>
              <h2 className="flex items-center gap-3 text-2xl font-semibold text-slate-700 mb-4">
                <ShieldCheck className="w-6 h-6 text-[var(--suttain-teal)]" />
                1. Safety & Regulatory Guidance
              </h2>
              <div className="prose prose-slate max-w-none">
                <p>
                  Suttain is built to help users formulate safer, more sustainable products. However:
                </p>
                <ul>
                  <li>All real-world product decisions are your responsibility.</li>
                  <li>Users must follow applicable U.S. regulations for ingredients, manufacturing, labeling, and safety.</li>
                  <li>Simulations are informational — not a replacement for lab testing or legal review.</li>
                </ul>
              </div>
            </section>
            
            <section>
              <h2 className="flex items-center gap-3 text-2xl font-semibold text-slate-700 mb-4">
                <Handshake className="w-6 h-6 text-[var(--suttain-violet)]" />
                2. U.S. Regulatory References
              </h2>
              <div className="prose prose-slate max-w-none">
                <p>
                  If you're formulating for commercial or public use, ensure compliance with:
                </p>
                <ul>
                  <li><strong>TSCA</strong> – Chemical substance evaluation</li>
                  <li><strong>FDA</strong> – Skincare, beauty, or personal product guidelines</li>
                  <li><strong>OSHA</strong> – Safety in chemical handling</li>
                  <li><strong>GHS</strong> – Standardized hazard labeling</li>
                  <li><strong>FTC</strong> – Honest product marketing and claims</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-semibold text-slate-700 mb-4">
                <Server className="w-6 h-6 text-[var(--suttain-blue)]" />
                3. Data Ethics & Storage
              </h2>
              <div className="prose prose-slate max-w-none">
                <ul>
                  <li>All user data is encrypted and stored securely.</li>
                  <li>We comply with privacy principles under CCPA and general U.S. best practices.</li>
                  <li>We do not sell, share, or exploit your data — ever!</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-semibold text-slate-700 mb-4">
                <UserCheck className="w-6 h-6 text-amber-600" />
                4. User Acknowledgement
              </h2>
              <div className="prose prose-slate max-w-none">
                <p>
                  By using Suttain, you agree to:
                </p>
                <ul>
                  <li>Formulate responsibly.</li>
                  <li>Validate critical decisions with expert review or lab testing.</li>
                  <li>Accept that Suttain is an advisory tool, not a regulatory agency or certifier.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-semibold text-slate-700 mb-4">
                <Phone className="w-6 h-6 text-slate-500" />
                5. Contact
              </h2>
              <div className="prose prose-slate max-w-none">
                <p>
                  Questions about compliance or safety?{' '}
                  <Link to={createPageUrl('FAQ')} className="text-[var(--suttain-violet)] hover:underline">Contact us</Link>.
                </p>
              </div>
            </section>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}