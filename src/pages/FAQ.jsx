import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, MessageSquare, Send, CheckCircle, Phone } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const faqData = [
  {
    question: "What is Suttain?",
    answer: "Suttain is a unified AI-powered platform for chemical intelligence. We bridge the gap between consumer product safety (scanning and formulation) and professional-grade research (computational simulation and structural biology). From DIY creators to enterprise R&D teams, Suttain provides the tools to create, test, and innovate with confidence."
  },
  {
    question: "Can I use Suttain for professional research?",
    answer: "Yes. Our Research Portal offers advanced computational tools including DFT and molecular dynamics simulations, AlphaFold-powered protein structure exploration, and a comprehensive Chemical Intelligence API for enterprise-scale integration with PubChem, ChEMBL, and EPA CompTox data."
  },
  {
    question: "How does the ingredient safety scoring work?",
    answer: "We combine regulatory data (FDA, EU, REACH, EPA) with toxicological evidence and usage concentrations. We weigh the total amount of an ingredient, not just its presence, to provide a transparent, evidence-based score. Each scan includes a 'Why this score' panel for full transparency."
  },
  {
    question: "What tools are available on the platform?",
    answer: "Suttain offers a Chemical Simulator, AI Formula Generator, Product Scanner (barcode product scanner), Computational Simulations, Structural Biology tools, an SDS Analyzer, Carbon Tax Simulator, and an Enterprise API."
  },
  {
    question: "Is there an API for my organization?",
    answer: "Yes. Suttain offers an Enterprise API that provides programmatic access to our chemical database (130M+ records), simulation engine, and compliance tools with native SDKs for Python, JavaScript, and R. Visit the Enterprise API page to join the waitlist."
  },
  {
    question: "Do I need to be a chemist to use Suttain?",
    answer: "Not at all. Suttain is built for everyone, from hobbyists to scientists. Our consumer tools use plain language and provide clear guidance, while our research portal offers professional-grade depth for those who need it."
  },
  {
    question: "How does Suttain handle regulatory compliance?",
    answer: "Our Compliance Co-Pilot automates regulatory checks across 50+ global regions including EU (REACH), FDA, and ASEAN. For businesses, Suttain helps identify restricted or banned ingredients by region, suggests compliant formulations, and auto-generates ingredient lists aligned with INCI and global standards."
  },
  {
    question: "What data sources power Suttain?",
    answer: "Suttain integrates with the world's leading scientific databases including PubChem (130M+ compounds), ChEMBL (bioactivity data), EPA CompTox (toxicity predictions), and RCSB PDB (3D biomolecular structures). All results are citation-ready."
  },
  {
    question: "Is Suttain free to use?",
    answer: "Suttain offers a free tier to get started, with Pro, Academic, Lifetime, and Enterprise plans for advanced tools and business support. Visit our Pricing page for full details on each tier."
  },
  {
    question: "Can Suttain help with sustainability and carbon reporting?",
    answer: "Yes. Suttain provides detailed eco-impact analysis, biodegradability scores, carbon footprint calculations per formula, and a Carbon Tax Simulator to model decarbonization ROI. You can generate exportable sustainability and comparative impact reports."
  },
  {
    question: "How can I partner with Suttain?",
    answer: "We're actively seeking early-stage startup collaborators, academic or lab partners, regulatory advisors, and impact investors. Please use the contact form on this page to start the conversation."
  }
];

export default function FAQPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await base44.entities.ContactSubmission.create({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });

      try {
        await base44.functions.invoke('sendEmailResend', {
          type: 'contact_form',
          data: {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
          }
        });
      } catch (emailError) {
        console.error("Failed to send admin notification email:", emailError);
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setError('Failed to submit message. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="help-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="2" fill="#09D2FF" opacity="0.4"/>
              <circle cx="10" cy="10" r="1" fill="#02988C" opacity="0.3"/>
              <circle cx="50" cy="50" r="1.5" fill="#9531F5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#help-pattern)"/>
        </svg>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="bg-blue-100 text-blue-800 border-blue-300 mb-6">
              Help & Support
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              FAQs & Contact Us
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Get answers to common questions or reach out to our support team directly.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section - 2/3 width */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="w-8 h-8 text-[#09D2FF]" />
                <h2 className="text-3xl font-bold text-slate-900">
                  Frequently Asked Questions
                </h2>
              </div>
            </motion.div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqData.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl border border-slate-200/80 px-4"
                  >
                    <AccordionTrigger className="text-left font-semibold text-slate-800 hover:text-[var(--suttain-blue)] py-4">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 leading-relaxed pb-4 pr-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Contact Form - 1/3 width */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="sticky top-24 z-10">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-8 h-8 text-[var(--suttain-teal)]" />
                <h2 className="text-2xl font-bold text-slate-900">Contact Us</h2>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-blue-50/40 rounded-lg">
                    <Phone className="w-5 h-5 text-[var(--suttain-teal)]" />
                    <div>
                      <p className="font-medium text-slate-900">Response Time</p>
                      <p className="text-sm text-slate-600">Within 24 hours</p>
                    </div>
                  </div>
                </div>

                {submitted ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-8"
                  >
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-emerald-800 mb-2">Message Submitted!</h3>
                    <p className="text-emerald-700 text-sm">Thank you! We've received your message.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <Input
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="border-slate-300 focus:border-blue-500"
                      />
                      <Input
                        name="email"
                        type="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="border-slate-300 focus:border-blue-500"
                      />
                    </div>
                    <Input
                      name="subject"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="border-slate-300 focus:border-blue-500"
                    />
                    <Textarea
                      name="message"
                      placeholder="Your message..."
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      className="border-slate-300 focus:border-blue-500 resize-none"
                    />

                    {error && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                        <p className="text-sm text-rose-600">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[var(--suttain-teal)] to-[var(--suttain-blue)] hover:from-[#028a7f] hover:to-[#08bde6] text-white shadow-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}