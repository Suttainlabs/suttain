import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthContext from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { getBillingHistory } from '@/functions/getBillingHistory';
import { cancelSubscription } from '@/functions/cancelSubscription';
import {
  ArrowLeft, CreditCard, Crown, CheckCircle2, Clock, AlertCircle,
  Download, FileText, ExternalLink, Loader2, Receipt, Zap, ChevronRight,
  XCircle, TrendingUp
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
    month: 'long', day: 'numeric', year: 'numeric'
  });
}

const PLAN_LABELS = {
  starter: { name: 'Suttain Starter', color: 'from-cyan-400 to-blue-500', features: ['10 simulations per month', 'Structural Biology access', 'Unlimited formula generations', 'Unlimited product scans'] },
  pro: { name: 'Suttain Pro', color: 'from-violet-500 to-purple-600', features: ['Unlimited simulations (DFT, MD)', 'Research API access', 'Citation-ready exports', 'Priority support'] },
  academic: { name: 'Suttain Academic', color: 'from-teal-500 to-emerald-600', features: ['Up to 10 team seats', 'Priority compute queue', 'Lab workspace', 'API included'] },
  lifetime: { name: 'Suttain Lifetime', color: 'from-amber-400 to-orange-500', features: ['All Pro features forever', 'Unlimited simulations', 'No recurring payments', 'Research API access'] },
};

export default function BillingDashboard() {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const trialStatus = useTrialStatus(user);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [invoiceError, setInvoiceError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const isPro = trialStatus.isPro;
  const isLifetime = user?.subscription_billing === 'lifetime';
  const isMonthly = user?.subscription_billing === 'monthly';
  const isYearly = user?.subscription_billing === 'yearly';
  const isCanceling = user?.subscription_status === 'canceling';

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

  const planKey = user?.subscription_plan || (isLifetime ? 'lifetime' : null);
  const planInfo = planKey ? PLAN_LABELS[planKey] : null;

  const billingLabel = isLifetime ? 'One-time payment (Lifetime)' : isYearly ? 'Annual billing' : 'Monthly billing';

  // The date the current billing period ends (renewal date for active subs, or access-end for canceling subs)
  const renewalDate = user?.subscription_cancel_at || user?.subscription_end_date;
  const daysRemaining = renewalDate
    ? Math.max(0, Math.ceil((new Date(renewalDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  const nextBillingLabel = isLifetime ? 'Never — lifetime access' :
    (user?.subscription_cancel_at
      ? `Access until ${formatDate(user.subscription_cancel_at)}`
      : user?.subscription_end_date
        ? `Renews ${formatDate(user.subscription_end_date)}`
        : 'Auto-renews at next cycle');

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await cancelSubscription({});
      if (refreshUser) await refreshUser();
      setShowCancelConfirm(false);
    } catch (error) {
      console.error('Cancel failed:', error);
      alert('Failed to cancel subscription. Please try again or contact support.');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EDF7F2' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

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
        {isPro && planInfo ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Plan Overview Card */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${planInfo.color} flex items-center justify-center flex-shrink-0`}>
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{planInfo.name}</h2>
                    <p className="text-sm text-slate-600 mt-0.5">{billingLabel}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                  isCanceling ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isCanceling ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  {isCanceling ? 'Canceling' : 'Active'}
                </span>
              </div>

              {isCanceling && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">Your subscription is set to cancel</p>
                    <p className="text-xs text-yellow-700 mt-1">You'll keep access until {formatDate(user?.subscription_cancel_at)}. You can resubscribe anytime.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Renewal</p>
                  <p className="text-base font-bold text-slate-800">{nextBillingLabel}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Days Remaining</p>
                  <p className="text-base font-bold text-slate-800">
                    {isLifetime
                      ? 'Lifetime'
                      : daysRemaining !== null
                        ? `${daysRemaining} days`
                        : '—'
                    }
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">What's Included</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {planInfo.features.map(feature => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {!isLifetime && !isCanceling && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to={createPageUrl('Pricing')} className="flex-1">
                    <Button className="w-full bg-[#00695C] hover:bg-[#005048] text-white font-semibold">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Upgrade or Switch Plan
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="flex-1 font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setShowCancelConfirm(true)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Subscription
                  </Button>
                </div>
              )}
              {isLifetime && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-sm font-semibold text-amber-800">Lifetime access — no renewal or cancellation needed.</p>
                </div>
              )}
              {isCanceling && (
                <Link to={createPageUrl('Pricing')} className="block">
                  <Button className="w-full bg-[#00695C] hover:bg-[#005048] text-white font-semibold">
                    <Zap className="w-4 h-4 mr-2" />
                    Resubscribe
                  </Button>
                </Link>
              )}
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-400" />
                Account Summary
              </h3>
              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Account Status</p>
                  <p className="text-base font-bold text-slate-800">{isCanceling ? 'Canceling' : 'Active'}</p>
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
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl border-2 border-violet-200 p-5 sm:p-8 mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">You're on the Free Plan</h2>
            </div>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">Unlock unlimited simulations, AI compliance tools, and advanced analytics with a paid plan.</p>
            <Link to={createPageUrl('Pricing')}>
              <Button className="bg-[#00695C] hover:bg-[#005048] text-white font-semibold px-8">
                <Zap className="w-4 h-4 mr-2" />
                View Pricing Plans
              </Button>
            </Link>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Cancel Subscription?</h3>
              </div>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Your subscription will remain active until the end of your current billing period, after which it will not renew. You can resubscribe anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="w-full sm:flex-1 font-semibold min-h-[44px]"
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={cancelLoading}
                >
                  Keep My Plan
                </Button>
                <Button
                  className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold min-h-[44px]"
                  onClick={handleCancel}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {cancelLoading ? 'Canceling...' : 'Confirm Cancellation'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Billing History Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              Billing History
            </h2>
            <p className="text-sm text-slate-500 mt-1">View all your invoices and payment details.</p>
          </div>

          {loadingInvoices ? (
            <div className="px-5 sm:px-8 py-12 flex items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading invoices...</span>
            </div>
          ) : invoiceError ? (
            <div className="px-5 sm:px-8 py-6 flex items-start gap-3 bg-red-50 border-t border-red-100">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">{invoiceError}</p>
                <p className="text-sm text-red-600 mt-1">Please contact support if you need help.</p>
              </div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="px-5 sm:px-8 py-12 text-center">
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
                  <div key={inv.id} className="px-5 sm:px-8 py-4 hover:bg-slate-50 transition-colors">
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
                            isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
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
        <div className="mt-6 sm:mt-8 bg-slate-50 rounded-2xl border border-slate-100 p-5 sm:p-6 flex items-center justify-between flex-wrap gap-4">
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