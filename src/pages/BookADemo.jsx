import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DemoRequest } from '@/entities/DemoRequest';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, CheckCircle, Briefcase, User, Mail, MessageSquare, Loader2 } from 'lucide-react';

export default function BookADemo() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company_name: '',
    role: '',
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
    if (!formData.name || !formData.email || !formData.company_name) {
        setError('Please fill in all required fields.');
        return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      await DemoRequest.create(formData);
      
      // Send email notification to admin
      try {
        await base44.functions.invoke('sendEmailResend', {
          type: 'demo_request',
          data: {
            name: formData.name,
            email: formData.email,
            companyName: formData.company_name,
            role: formData.role,
            message: formData.message
          }
        });
      } catch (emailErr) {
        console.error('Failed to send demo notification email:', emailErr);
      }
      
      setSubmitted(true);
      setFormData({ name: '', email: '', company_name: '', role: '', message: '' });
    } catch (err) {
      console.error('Error submitting demo request:', err);
      setError('Failed to submit request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-slate-900">Book a Demo</CardTitle>
              <p className="text-slate-600">Do you have questions, need more information about our compliance platform? Book a demo!</p>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-emerald-800">Request Received!</h3>
                  <p className="text-slate-600">Our team will get in touch with you shortly to schedule your demo.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <User className="w-4 h-4 absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                    <Input 
                      name="name" 
                      placeholder="Full Name *" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      required 
                      className="pl-9" 
                    />
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                    <Input 
                      name="email" 
                      type="email" 
                      placeholder="Work Email *" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      required 
                      className="pl-9" 
                    />
                  </div>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                    <Input 
                      name="company_name" 
                      placeholder="Company Name *" 
                      value={formData.company_name} 
                      onChange={handleInputChange} 
                      required 
                      className="pl-9" 
                    />
                  </div>
                  <div className="relative">
                    <User className="w-4 h-4 absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                    <Input 
                      name="role" 
                      placeholder="Your Role (Optional)" 
                      value={formData.role} 
                      onChange={handleInputChange} 
                      className="pl-9" 
                    />
                  </div>
                  <div className="relative">
                     <MessageSquare className="w-4 h-4 absolute top-3 left-3 text-slate-400" />
                    <Textarea 
                      name="message" 
                      placeholder="What would you like to see in the demo? (Optional)" 
                      rows={4} 
                      value={formData.message} 
                      onChange={handleInputChange} 
                      className="pl-9" 
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold py-3"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin mr-2" />Submitting...</>
                    ) : (
                      <><Send className="w-4 h-4 mr-2" />Submit Request</>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}