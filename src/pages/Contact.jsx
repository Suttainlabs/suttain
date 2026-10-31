import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle, HelpCircle, Building2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SEOHead from '../components/shared/SEOHead';

const CONTACT_EMAIL = 'contact@suttain.com';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent
  const [error, setError] = useState('');

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!(await base44.auth.isAuthenticated().catch(() => false))) {
      setError('signin');
      return;
    }
    setStatus('sending');
    try {
      await base44.entities.ContactSubmission.create({ ...form });
      try {
        await base44.functions.invoke('sendEmailResend', { type: 'contact_form', data: { ...form } });
      } catch (notifyError) {
        console.error('Contact notification failed', notifyError);
      }
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Contact form failed', err);
      setError('We could not send your message. Please try again, or email us directly.');
      setStatus('idle');
    }
  };

  const field = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#02988C]';

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
      <SEOHead title="Contact Suttain" description="Contact the Suttain team about chemical safety tools, research workflows, partnerships or support." />
      <h1 className="text-3xl font-medium text-slate-900">Contact us</h1>
      <p className="mt-3 text-slate-600 max-w-2xl">Questions about a result, your account, research workflows or partnerships? Send us a message and we'll reply by email.</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6">
          {status === 'sent' ? (
            <div className="flex items-start gap-3" role="status">
              <CheckCircle className="w-5 h-5 text-[#02988C] mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-medium text-slate-900">Message sent</h2>
                <p className="mt-1 text-sm text-slate-600">Thanks. We'll get back to you by email.</p>
                <button type="button" onClick={() => setStatus('idle')} className="mt-4 text-sm text-[#02988C] underline">Send another message</button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-slate-800 mb-1">Name</label>
                  <input id="contact-name" name="name" required maxLength={120} value={form.name} onChange={update} className={field} />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-slate-800 mb-1">Email</label>
                  <input id="contact-email" name="email" type="email" required maxLength={254} value={form.email} onChange={update} className={field} />
                </div>
              </div>
              <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium text-slate-800 mb-1">Subject</label>
                <input id="contact-subject" name="subject" required maxLength={200} value={form.subject} onChange={update} className={field} />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-slate-800 mb-1">Message</label>
                <textarea id="contact-message" name="message" required rows={6} maxLength={5000} value={form.message} onChange={update} className={field} />
              </div>
              {error === 'signin' ? (
                <p className="text-sm text-slate-700" role="alert">
                  Please <Link className="underline text-[#02988C]" to={`/login?returnTo=${encodeURIComponent('/Contact')}`}>sign in</Link> to send a message, or email us at <a className="underline text-[#02988C]" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                </p>
              ) : error ? (
                <p className="text-sm text-red-700" role="alert">{error}</p>
              ) : null}
              <button type="submit" disabled={status === 'sending'} className="h-11 px-5 rounded-lg bg-[#02988C] text-white text-sm font-medium hover:bg-[#027A70] disabled:opacity-60">
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <Mail className="w-5 h-5 text-[#02988C]" aria-hidden="true" />
            <h2 className="mt-2 text-sm font-medium text-slate-900">Email</h2>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-[#02988C] underline">{CONTACT_EMAIL}</a>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <HelpCircle className="w-5 h-5 text-[#02988C]" aria-hidden="true" />
            <h2 className="mt-2 text-sm font-medium text-slate-900">Help and FAQ</h2>
            <Link to="/FAQ" className="text-sm text-[#02988C] underline">Read common questions</Link>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <Building2 className="w-5 h-5 text-[#02988C]" aria-hidden="true" />
            <h2 className="mt-2 text-sm font-medium text-slate-900">Teams and research groups</h2>
            <Link to="/enterprise" className="text-sm text-[#02988C] underline">See enterprise options</Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
