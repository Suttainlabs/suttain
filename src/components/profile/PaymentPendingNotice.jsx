import React from 'react';
import { AlertTriangle, ArrowUpRight } from 'lucide-react';

// Shown when Stripe could not collect an upgrade payment. The current plan stays active
// until the invoice is paid; the payment webhook then switches the plan.
export default function PaymentPendingNotice({ invoiceUrl }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-yellow-800">Payment needed to finish the change</p>
        <p className="text-xs text-yellow-700 mt-0.5">
          Your current plan stays active. Once the payment is confirmed, your plan switches automatically.
        </p>
        {invoiceUrl && (
          <a
            href={invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-yellow-900 underline underline-offset-4"
          >
            Complete payment <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        )}
        <p className="text-xs text-yellow-700 mt-2">The pending change expires after 23 hours if unpaid.</p>
      </div>
    </div>
  );
}