import React, { useState, useEffect } from 'react';
import { ExternalLink, FileText, Loader2, Receipt } from 'lucide-react';
import { getBillingHistory } from '@/functions/getBillingHistory';

function formatAmount(amount, currency) {
  const divisor = ['jpy', 'krw', 'vnd', 'clp'].includes(currency) ? 1 : 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: divisor === 1 ? 0 : 2,
  }).format(amount / divisor);
}

export default function BillingHistory() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getBillingHistory({})
      .then(res => setInvoices(res.data?.invoices || []))
      .catch(() => setError('Could not load billing history.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-center gap-2 text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading billing history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <Receipt className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700">Billing History</h3>
        </div>
        <p className="text-sm text-slate-400 mt-2">No invoices found yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <Receipt className="w-4 h-4 text-slate-500" />
        <h3 className="text-sm font-bold text-slate-700">Billing History</h3>
      </div>
      <div className="divide-y divide-slate-50">
        {invoices.map(inv => {
          const date = new Date(inv.created * 1000).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          });
          const isPaid = inv.status === 'paid';
          return (
            <div key={inv.id} className="px-6 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {inv.description || `Invoice ${inv.number || inv.id.slice(-8)}`}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{date}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-semibold text-slate-800">
                  {formatAmount(inv.amount_paid, inv.currency)}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {isPaid ? 'Paid' : inv.status}
                </span>
                {inv.invoice_pdf && (
                  <a
                    href={inv.invoice_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-teal-600 transition-colors"
                    title="Download PDF"
                  >
                    <FileText className="w-4 h-4" />
                  </a>
                )}
                {inv.hosted_invoice_url && (
                  <a
                    href={inv.hosted_invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-teal-600 transition-colors"
                    title="View invoice"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}