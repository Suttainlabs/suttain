import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthContext from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { getBillingHistory } from '@/functions/getBillingHistory';
import {
  ArrowLeft, CreditCard, Crown, CheckCircle2, Clock, AlertCircle,
  Download, FileText, ExternalLink, Loader2, Receipt, Zap, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import useTrialStatus from '@/hooks/useTrialStatus';

function formatAmount(amount, currency) {
  const divisor = ['jpy', 'krw', 'vnd', 'clp'].includes(currency) ? 1 : 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: divisor === 1 ? 0 : 2,
  }).format(amount / divisor);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export default function BillingDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const trialStatus = useTrialStatus(user);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [invoiceError, setInvoiceError] = useState(null);

  const isPro = trialStatus.isPro;
  const isLifetime = user?.subscription_billing === 'lifetime';
  const isMonthly = user?.subscription_billing === 'monthly';
  const isYearly = user?.subscription_billing === 'yearly';

  useEffect(() => {
    if (!user) return;
    getBillingHistory({})
      .then(res => setInvoices(res.data?.invoices || []))
      .catch(() => setInvoiceError('Could not load billing history.'))
      .finally(() => setLoadingInvoices(false));
  }, [user]);

  if (!user) {
    return <div className="text-center py-10 text-slate-600">Please log in to view your billing.</div>;
  }

  const billingLabel = isLifetime ? 'One-time payment (Lifetime)' : isYearly ? 'Annual ($49.99/yr)' : 'Monthly ($4.99/mo)';
  const nextBillingLabel = isLifetime ? 'Never — lifetime access' :
    (user?.subscription_cancel_at
      ? `Access until ${formatDate(user.subscription_cancel_at)}`
      : 'Auto-renews at next cycle');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EDF7F2' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Dashboard')} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-teal-600" />
              Billing & Subscription
            </h1>
            <p className="text-slate-500 text-base mt-2">Manage your plan, payment history, and subscription settings.</p>
          </div>
        </div>

        {/* Current Plan Status */}
        {isPro ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Plan Overview Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-amber-200 p-8 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Suttain Pro</h2>
                    <p className="text-sm text-slate-600 mt-0.5">{billingLabel}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                  user?.subscription_status === 'canceling' 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${user?.subscription_status === 'canceling' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  {user?.subscription_status === 'canceling' ? 'Canceling' : 'Active'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Renewal</p>
                  <p className="text-base font-bold text-slate-800">{nextBillingLabel}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Days Remaining</p>
                  <p className="text-base font-bold text-slate-800">
                    {user?.subscription_cancel_at 
                      ? Math.max(0, Math.ceil((new Date(user.subscription_cancel_at) - new Date()) / (1000 * 60 * 60 * 24)))
                      : '∞'
                    } days
                  </p>
                </div>
              </div>

              <div className="bg-white/60 rounded-xl p-4 mb-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">What's Included</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Unlimited simulations',
                    'AI compliance co-pilot',
                    'Sustainability scoring',
                    'PDF & lab report export',
                    'Priority support',
                    'Advanced analytics'
                  ].map(feature => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to={createPageUrl('Pricing')} className="flex-1">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold">
                    <Zap className="w-4 h-4 mr-2" />
                    Change Plan
                  </Button>
                </Link>
                <Link to={createPageUrl('Settings')} className="flex-1">
                  <Button variant="outline" className="w-full font-semibold">
                    Manage Subscription
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-400" />
                Account Summary
              </h3>
              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Account Status</p>
                  <p className="text-base font-bold text-slate-800">Active</p>
                </div>
                <div className="pb-4 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Member Since</p>
                  <p className="text-base font-bold text-slate-800">{formatDate(user?.created_date)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Invoices</p>
                  <p className="text-base font-bold text-slate-800">{invoices.length}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Free Plan CTA */
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl border-2 border-violet-200 p-8 mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Upgrade to Pro</h2>
            </div>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">Unlock unlimited simulations, AI compliance tools, and advanced analytics with Suttain Pro.</p>
            <Link to={createPageUrl('Pricing')}>
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white font-semibold px-8">
                <Zap className="w-4 h-4 mr-2" />
                View Pricing Plans
              </Button>
            </Link>
          </div>
        )}

        {/* Billing History Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              Billing History
            </h2>
            <p className="text-sm text-slate-500 mt-1">View all your invoices and payment details.</p>
          </div>

          {loadingInvoices ? (
            <div className="px-8 py-12 flex items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading invoices...</span>
            </div>
          ) : invoiceError ? (
            <div className="px-8 py-6 flex items-start gap-3 bg-red-50 border-t border-red-100">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">{invoiceError}</p>
                <p className="text-sm text-red-600 mt-1">Please contact support if you need help.</p>
              </div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="px-8 py-12 text-center">
              <Receipt className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">No invoices yet</p>
              <p className="text-xs text-slate-400 mt-1">When you upgrade, your invoices will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {invoices.map((inv, idx) => {
                const date = new Date(inv.created * 1000).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                });
                const isPaid = inv.status === 'paid';
                return (
                  <div key={inv.id} className="px-8 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800">
                          {inv.description || `Invoice #${inv.number || inv.id.slice(-8)}`}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{date}</p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-800">
                            {formatAmount(inv.amount_paid, inv.currency)}
                          </p>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-block mt-1 ${
                            isPaid 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {isPaid ? 'Paid' : inv.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {inv.invoice_pdf && (
                            <a
                              href={inv.invoice_pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          {inv.hosted_invoice_url && (
                            <a
                              href={inv.hosted_invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              title="View invoice"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Help Footer */}
        <div className="mt-8 bg-slate-50 rounded-2xl border border-slate-100 p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Need help with your billing?</h3>
            <p className="text-xs text-slate-500 mt-1">Our support team is here to assist you.</p>
          </div>
          <a href="mailto:contact@suttain.com" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">
            Contact Support <ChevronRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
}