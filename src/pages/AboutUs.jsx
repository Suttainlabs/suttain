import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, ArrowRight, Linkedin, Eye, Briefcase } from 'lucide-react';

const teamMembers = [
  {
    name: 'Abel Egbemhenghe',
    role: 'Founder & Advisor', // Updated role as per the outline
    bio: 'A visionary computational chemist with a passion for sustainable innovation.',
    avatar: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/44c39db8e_undraw_pic-profile_nr491.png',
    linkedin: 'https://www.linkedin.com/in/abelegbemhenghe/',
  },
];

const openPositions = [
  { role: 'Co-founder, Product Marketing', description: 'Driving our go-to-market strategy and shaping the future of our product.' },
  { role: 'AI Engineer', description: 'Building the core machine learning models for predictive chemical analysis.' },
  { role: 'Software Engineer', description: 'Developing the robust platform that powers our AI solutions.' },
  { role: 'Product Lead', description: 'Bridging the gap between complex science and user-friendly design.' },
  { role: 'Regulatory Specialist', description: 'Ensuring our solutions meet global compliance and safety standards.' },
  { role: 'AI Research Scientist', description: 'Pushing the boundaries of what\'s possible in computational chemistry.' }
];

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-blue-50/20">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="bg-green-100 text-green-700 border-green-200 text-sm px-4 py-2">
            Our Story
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4">
            Blending Science, Technology, and Human Care
          </h1>
          <p className="mt-6 text-base text-slate-600 max-w-3xl mx-auto">
            At Suttain, we design AI-powered solutions that help people and businesses make safer choices, create responsibly, and build a healthier future.
          </p>
        </motion.div>
      </section>

      {/* Our Mission & Vision Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#02988C] to-[#09D2FF] rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Our Mission</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              To make chemical safety and sustainability accessible to all with AI-powered insights, hazard detection, and eco-impact guidance — helping users choose safer alternatives and stay compliant.
            </p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-gradient-to-br from-[#9531F5] to-[#09D2FF] rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Our Vision</h2>
            </div>
             <p className="text-sm text-slate-600 leading-relaxed">
              A world where everyone can access chemical knowledge, make safer choices, and support public health and environmental sustainability.
            </p>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white/70">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Users className="w-4 h-4" />
              Our Team
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">The Innovators Behind Suttain</h2>
            <p className="text-base text-slate-600 mt-4 max-w-2xl mx-auto">
              We are a dedicated group of scientists, engineers, and visionaries committed to making a difference.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center h-full group hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                    />
                    <h3 className="font-bold text-lg text-slate-900">{member.name}</h3>
                    <p className="text-sm text-[#02988C] font-semibold mb-2">{member.role}</p>
                    <p className="text-sm text-slate-600">{member.bio}</p>
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-slate-400 hover:text-[#9531F5] transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Open Positions */}
            {openPositions.map((position, index) => (
              <motion.div
                key={`open-position-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center h-full group hover:shadow-2xl transition-all duration-300 bg-slate-50/50 border-2 border-dashed">
                  <CardContent className="p-6 flex flex-col items-center justify-center">
                    <div className="w-28 h-28 rounded-full mx-auto mb-4 bg-slate-200/70 border-4 border-white shadow-inner flex items-center justify-center">
                      <Briefcase className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">{position.role}</h3>
                    <p className="text-sm text-[#02988C] font-semibold mb-2">Open Position</p>
                    <p className="text-sm text-slate-600 flex-grow">{position.description}</p>
                    <Button asChild size="sm" className="mt-4 bg-gradient-to-r from-[var(--suttain-teal)] to-[var(--suttain-blue)] text-white hover:shadow-lg hover:opacity-90 transition-all">
                      <Link to={createPageUrl('Careers')}>
                        Learn More <ArrowRight className="w-3 h-3 ml-1.5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Join Our Mission</h2>
          <p className="text-base text-slate-600 mb-8 max-w-2xl mx-auto">
            Help us revolutionize the future of chemical sustainability. We are always looking for passionate talent to join our growing team.
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-[#02988C] to-[#09D2FF] text-white hover:shadow-lg hover:opacity-90 transition-all">
            <Link to={createPageUrl('Careers')}>
              View Open Positions <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;