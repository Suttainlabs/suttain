import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ContactSubmission } from '@/entities/ContactSubmission';
import { base44 } from '@/api/base44Client';

const TOOL_COLORS = {
  simulator: '#02988C',
  generator: '#9531F5',
  scanner: '#09D2FF',
  computational: '#f97316',
  experimentation: '#ec4899',
  other: '#94a3b8',
};

const TOOL_LABELS = {
  simulator: 'Simulator',
  generator: 'Generator',
  scanner: 'Scanner',
  computational: 'Computational',
  experimentation: 'Experimentation',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-bold text-slate-800 mb-1">{d.name}</p>
      <p className="text-slate-600">{d.value} review{d.value !== 1 ? 's' : ''}</p>
      <p className="text-yellow-500 font-semibold">Avg: {'★'.repeat(Math.round(d.avg))}{'☆'.repeat(5 - Math.round(d.avg))} {d.avg}</p>
    </div>
  );
};
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
import { HelpCircle, MessageSquare, Send, CheckCircle, Phone, Star, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const faqData = [
  {
    question: "What is Suttain and who is it for?",
    answer: "Suttain is an AI-powered virtual lab assistant designed to help individuals, startups, and small labs create safer, cleaner, and more sustainable chemical products. It's ideal for home formulators, indie beauty brands, eco-cleaning startups, and anyone working with chemicals without access to a full lab or regulatory team."
  },
  {
    question: "How does Suttain help prevent harmful chemical combinations?",
    answer: "Suttain includes a Chemical Interaction Simulator that predicts the outcome of combining ingredients. It flags potentially hazardous reactions and suggests safer alternatives — helping users avoid dangerous mixtures before they happen."
  },
  {
    question: "Can I use Suttain even if I'm not a chemist?",
    answer: "Absolutely. Suttain is built for non-experts too. Whether you're experimenting at home or building a clean product line, our guided tools make it easy to create safe and compliant formulas — no advanced science degree required."
  },
  {
    question: "What makes Suttain different from other formulation tools?",
    answer: "Suttain goes beyond recipe generation. It combines AI-powered simulations, personalized safety alerts, sustainability scoring, and regulatory support — all in one platform. It's built specifically to support safe, ethical, and eco-friendly product development from idea to label."
  },
  {
    question: "Is Suttain available for businesses and personal use?",
    answer: "Yes. Suttain supports both personal users and small businesses. Whether you're a DIY enthusiast or a startup creating your first product line, you can use the same tools to build, test, and optimize your formulas safely and sustainably."
  },
  {
    question: "Is Suttain free to use?",
    answer: "Right now, our Micro MVP is free to explore as we're currently testing features and gathering feedback. A free tier will remain available when we launch officially, with pro plans for advanced tools and business support."
  },
  {
    question: "Can Suttain help with compliance or labeling?",
    answer: "Yes. For businesses, Suttain helps: Identify restricted or banned ingredients by region, suggest compliant formulations, and auto-generate ingredient lists or labels aligned with INCI and global standards (EU, US, etc.)."
  },
  {
    question: "How can I partner with Suttain?",
    answer: "We're actively seeking early-stage startup collaborators, academic or lab partners, regulatory advisors, and grant funders or impact investors. Please connect with us to start the conversation."
  }
];



export default function FAQPage() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    base44.entities.Review.list('-created_date', 200).then(setReviews).catch(() => {});
  }, []);

  const chartData = (() => {
    const grouped = {};
    for (const r of reviews) {
      const key = r.feature_used || 'other';
      if (!grouped[key]) grouped[key] = { total: 0, sum: 0 };
      grouped[key].total += 1;
      grouped[key].sum += r.rating || 0;
    }
    return Object.entries(grouped).map(([key, val]) => ({
      name: TOOL_LABELS[key] || key,
      value: val.total,
      avg: val.total > 0 ? (val.sum / val.total).toFixed(1) : '0.0',
      color: TOOL_COLORS[key] || TOOL_COLORS.other,
    }));
  })();

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Create a record in the database instead of sending an email
      await ContactSubmission.create({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });

      // Send admin notification email via Resend
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
      {/* Decorative watermark */}
      <div className="absolute top-40 right-0 w-56 h-56 opacity-5 pointer-events-none hidden lg:block">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/76fc85d0c_a-woman-holds-the-skincare-jar-for-beauty-wellne-2026-01-07-02-20-26-utc.jpg"
          alt=""
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="sticky top-24 z-0"
            >
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-8 h-8 text-[var(--suttain-teal)]" />
                <h2 className="text-2xl font-bold text-slate-900">
                  Contact Us
                </h2>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 space-y-6">
                {/* Contact Info */}
                <div className="space-y-4">
                  {/* Removed Email Contact Info */}
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

      {/* Ratings Chart Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-7 h-7 text-[var(--suttain-teal)]" />
            <h2 className="text-2xl font-bold text-slate-900">User Ratings by Tool</h2>
          </div>
          <p className="text-slate-500 text-sm">Breakdown of community ratings across all Suttain tools.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 md:p-10"
        >
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Star className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">No ratings yet</p>
              <p className="text-sm text-slate-400 mt-1">Ratings will appear here as users review the tools.</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Pie Chart */}
              <div className="w-full lg:w-1/2" style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={130}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} stroke="white" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend + Stats */}
              <div className="w-full lg:w-1/2 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Tool Breakdown</p>
                {chartData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="font-semibold text-slate-800 text-sm">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-500">{d.value} review{d.value !== 1 ? 's' : ''}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-slate-700">{d.avg}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 mt-4">
                  <span className="font-bold text-white text-sm">Total Reviews</span>
                  <span className="font-bold text-white">{reviews.length}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}