import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, PenLine } from 'lucide-react';

/**
 * Supervisor approval modal with a segmented toggle between:
 *  - "self": instant self-approval (existing signature path) → onSelfApprove(name, signature)
 *  - "email": email round-trip approval request → onSendRequest(name, email)
 */
export default function SupervisorApprovalModal({
  isOpen,
  onClose,
  onSelfApprove,
  onSendRequest,
  isGenerating,
  isSending,
  persona
}) {
  const [mode, setMode] = useState('self');
  const [supervisorName, setSupervisorName] = useState('');
  const [supervisorSignature, setSupervisorSignature] = useState('');
  const [supervisorEmail, setSupervisorEmail] = useState('');

  const reset = () => {
    setSupervisorName('');
    setSupervisorSignature('');
    setSupervisorEmail('');
    setMode('self');
  };

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Supervisor approval</DialogTitle>
          <DialogDescription>
            Choose how this simulation should be approved before generating the lab report.
          </DialogDescription>
        </DialogHeader>

        {/* Segmented toggle */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('self')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'self' ? 'bg-white text-[#02988C] shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <PenLine className="w-4 h-4" />
            Instant
          </button>
          <button
            type="button"
            onClick={() => setMode('email')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'email' ? 'bg-white text-[#02988C] shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Mail className="w-4 h-4" />
            Email request
          </button>
        </div>

        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <Label htmlFor="sup-name">Supervisor name</Label>
            <Input
              id="sup-name"
              placeholder="Dr. Jane Smith"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
            />
          </div>

          {mode === 'self' ? (
            <div className="space-y-2">
              <Label htmlFor="sup-sig">Digital signature</Label>
              <Input
                id="sup-sig"
                placeholder="Type full name to confirm"
                value={supervisorSignature}
                onChange={(e) => setSupervisorSignature(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                By typing your name, you confirm that you have reviewed and approved this experimental procedure.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="sup-email">Supervisor email</Label>
              <Input
                id="sup-email"
                type="email"
                placeholder="supervisor@university.edu"
                value={supervisorEmail}
                onChange={(e) => setSupervisorEmail(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                We will email your supervisor a secure preview link. They can approve or reject the simulation without creating an account, and you will be notified of their decision.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={isGenerating || isSending}>
            Cancel
          </Button>
          {mode === 'self' ? (
            <Button
              onClick={() => onSelfApprove(supervisorName, supervisorSignature)}
              disabled={!supervisorName || !supervisorSignature || isGenerating}
              className="bg-gradient-to-r from-[var(--suttain-teal)] to-[var(--suttain-blue)] text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Approve & Generate Report'
              )}
            </Button>
          ) : (
            <Button
              onClick={() => onSendRequest(supervisorName, supervisorEmail)}
              disabled={!supervisorName || !supervisorEmail || isSending}
              className="bg-gradient-to-r from-[var(--suttain-teal)] to-[var(--suttain-blue)] text-white"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send approval request'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}