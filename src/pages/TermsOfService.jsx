import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake, BrainCircuit, UserCheck, Ban, AlertTriangle, ShieldOff } from 'lucide-react';

export default function TermsOfService() {
  const sections = [
    {
      icon: Handshake,
      title: "1. Agreement to Terms",
      content: "By using our application, you agree to be bound by these Terms of Service. These terms help ensure our platform remains safe, reliable, and constructive for everyone. If you do not agree, please do not use the application."
    },
    {
      icon: BrainCircuit,
      title: "2. Intellectual Property Rights",
      content: "The application, its underlying AI models, and all original content are the exclusive property of Suttain Inc. and its licensors. We grant you a limited license to use the platform as intended, but not to replicate or misuse our intellectual property."
    },
    {
      icon: UserCheck,
      title: "3. User Responsibilities",
      content: "You agree to provide accurate information when you sign up and to use Suttain for lawful and ethical purposes. You are responsible for your own formulations and for ensuring they comply with all local safety and regulatory standards."
    },
    {
      icon: Ban,
      title: "4. Prohibited Activities",
      content: "You may not use Suttain for any illegal purpose, to reverse-engineer our technology, to introduce malicious software, or to create products intended to cause harm. We reserve the right to suspend accounts that violate these rules."
    },
    {
      icon: AlertTriangle,
      title: "5. Disclaimer of Warranties",
      content: "Suttain is a powerful informational tool, but it is provided on an 'as is' basis. We make no warranties about the absolute accuracy of every simulation or its fitness for a specific commercial purpose. Always validate critical formulations with real-world testing."
    },
    {
      icon: ShieldOff,
      title: "6. Limitation of Liability",
      content: "Suttain Inc. is not liable for any damages or losses resulting from your use of the platform. You are solely responsible for the products you create and for any consequences that arise from their use, sale, or distribution."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="text-center bg-slate-50 p-8 rounded-t-xl">
            <CardTitle className="text-3xl font-bold text-slate-800">Suttain Terms of Service</CardTitle>
            <p className="text-slate-500 mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-10">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <section key={index}>
                  <h2 className="flex items-center gap-3 text-2xl font-semibold text-slate-700 mb-4">
                    <Icon className="w-6 h-6 text-[var(--suttain-violet)]" />
                    {section.title}
                  </h2>
                  <p className="prose prose-slate max-w-none">{section.content}</p>
                </section>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}