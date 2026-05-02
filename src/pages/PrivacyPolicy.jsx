import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Database, Cog, Users, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: ShieldCheck,
      title: "1. Our Commitment to Your Privacy",
      content: "Welcome to Suttain. We are committed to protecting your personal information and your right to privacy. This policy explains what information we collect, how we use it, and what rights you have in relation to it. If you have any questions, please reach out."
    },
    {
      icon: Database,
      title: "2. Information We Collect",
      content: "We collect information you voluntarily provide, such as your name and email when you create an account. We also collect data generated from your use of our tools, like the chemicals you simulate or formulas you create, to improve our services and ensure safety."
    },
    {
      icon: Cog,
      title: "3. How We Use Your Information",
      content: "We use your information to operate and improve the Suttain platform, personalize your experience, provide you with safety alerts, and communicate with you. We process this data based on our legitimate business interests and to fulfill our contractual service to you."
    },
    {
      icon: Users,
      title: "4. When We Share Your Information",
      content: "We do not sell your personal data. We only share information with your consent, to comply with laws, to provide our services (e.g., with our secure cloud provider), to protect your rights, or to fulfill essential business obligations. Your trust is paramount."
    },
    {
      icon: Mail,
      title: "5. How to Contact Us",
      content: "If you have questions or comments about this policy, you may contact us through the form on our <a href='/FAQ' class='text-[var(--suttain-violet)] hover:underline'>Help &amp; FAQ page</a> or by emailing us directly at <a href='mailto:contact@suttain.com' class='text-[var(--suttain-violet)] hover:underline'>contact@suttain.com</a>."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="text-center bg-slate-50 p-8 rounded-t-xl">
            <CardTitle className="text-3xl font-bold text-slate-800">Privacy Policy</CardTitle>
            <p className="text-slate-500 mt-2">Effective May 2, 2026</p>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-10">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <section key={index}>
                  <h2 className="flex items-center gap-3 text-2xl font-semibold text-slate-700 mb-4">
                    <Icon className="w-6 h-6 text-[var(--suttain-teal)]" />
                    {section.title}
                  </h2>
                  <div
                    className="prose prose-slate max-w-none prose-ul:my-3 prose-li:my-1"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </section>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}