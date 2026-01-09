
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnterpriseWaitlist } from '@/entities/EnterpriseWaitlist';
import { SendEmail } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle, Mail, User, Briefcase, Loader2, Send } from 'lucide-react';

const ADMIN_EMAIL = "contact@suttain.com";

export default function WaitlistModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ name: '', email: '', company_name: '', role: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      await EnterpriseWaitlist.create(formData);
      
      // --- Send Admin Notification Email ---
      try {
        await SendEmail({
          to: ADMIN_EMAIL,
          subject: `🏢 New Enterprise Waitlist Signup: ${formData.company_name}`,
          from_name: "Suttain Notifications",
          body: `
            <p>A new user has joined the enterprise waitlist.</p>
            <h3>User Details:</h3>
            <ul>
              <li><strong>Name:</strong> ${formData.name}</li>
              <li><strong>Company:</strong> ${formData.company_name}</li>
              <li><strong>Email:</strong> ${formData.email}</li>
              <li><strong>Role:</strong> ${formData.role || 'Not provided'}</li>
            </ul>
            <br/>
            <p>You can view this submission in the admin dashboard.</p>
          `
        });
      } catch (emailError) {
        console.error("Failed to send admin notification email:", emailError);
        // Do not block main flow if email notification fails
      }
      // --- End Notification ---

      setSubmitted(true);
    } catch (err) {
      console.error('Error joining waitlist:', err);
      setError('Failed to submit request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form after a short delay to allow for closing animation
    setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', company_name: '', role: '' });
        setError('');
    }, 300);
  }

  // Adding explicit return null when not open, though Dialog open prop handles most of it.
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">Join the Enterprise API Waitlist</DialogTitle>
          <DialogDescription>
            Get notified when our Enterprise API launches, with priority access and special pricing.
          </DialogDescription>
        </DialogHeader>
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-emerald-800">You're on the list!</h3>
            <p className="text-slate-600">We'll notify you as soon as the Enterprise API is available.</p>
            <Button onClick={handleClose} className="mt-6">Close</Button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="relative">
              <User className="w-4 h-4 absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <Input name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} required className="pl-9" />
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <Input name="email" type="email" placeholder="Work Email" value={formData.email} onChange={handleInputChange} required className="pl-9" />
            </div>
            <div className="relative">
              <Briefcase className="w-4 h-4 absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <Input name="company_name" placeholder="Company Name" value={formData.company_name} onChange={handleInputChange} required className="pl-9" />
            </div>
            <div className="relative">
              <User className="w-4 h-4 absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <Input name="role" placeholder="Your Role (Optional)" value={formData.role} onChange={handleInputChange} className="pl-9" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold py-3">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" />Join Waitlist</>}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
