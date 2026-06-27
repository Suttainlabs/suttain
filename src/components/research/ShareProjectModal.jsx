import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { Loader2, Share2, Mail, Link2, Check, Trash2, Eye, Pencil } from 'lucide-react';

export default function ShareProjectModal({ project, isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shares, setShares] = useState([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      setEmail('');
      setPermission('view');
      setMessage('');
      setError('');
      setSuccess('');
      fetchShares();
    }
  }, [isOpen, project]);

  const fetchShares = async () => {
    if (!project) return;
    setLoadingShares(true);
    try {
      const data = await base44.entities.ProjectShare.filter({ project_id: project.id });
      setShares(data || []);
    } catch (err) {
      console.error('Failed to load shares:', err);
    } finally {
      setLoadingShares(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !project) return;
    setError('');
    setSuccess('');

    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const token = crypto.randomUUID();
      const owner = await base44.auth.me().catch(() => null);
      const created = await base44.entities.ProjectShare.create({
        project_id: project.id,
        project_name: project.name,
        shared_with_email: normalized,
        permission,
        status: 'pending',
        invited_by_email: owner?.email || '',
        token,
        message: message.trim() || undefined
      });

      // Send invite email
      let emailSent = true;
      try {
        const origin = window.location.origin;
        const inviteLink = `${origin}/research?share=${token}`;
        const res = await base44.functions.invoke('sendProjectShareEmail', {
          to: normalized,
          project_name: project.name,
          permission,
          invite_link: inviteLink,
          message: message.trim(),
          inviter_name: owner?.full_name || owner?.email || 'A Suttain researcher'
        });
        emailSent = res?.data?.email_sent !== false;
      } catch (emailErr) {
        console.error('Invite email failed (share still recorded):', emailErr);
        emailSent = false;
      }

      setShares(prev => [created, ...prev]);
      setSuccess(
        emailSent
          ? `Invitation sent to ${normalized}.`
          : `${normalized} has been granted access. They'll see this project when they log in with that email.`
      );
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err.message || 'Failed to create share.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (shareId) => {
    try {
      await base44.entities.ProjectShare.delete(shareId);
      setShares(prev => prev.filter(s => s.id !== shareId));
    } catch (err) {
      console.error('Failed to revoke share:', err);
    }
  };

  const handleCopyLink = async () => {
    if (!project) return;
    const origin = window.location.origin;
    const link = `${origin}/research?project=${project.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-violet-400" />
            </div>
            <DialogTitle className="text-base font-bold">Share Project</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 text-xs">
            Invite team members to collaborate on <span className="font-semibold text-slate-200">{project.name}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Invite form */}
        <form onSubmit={handleSubmit} className="space-y-3 py-2">
          <div>
            <Label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Team member email</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@university.edu"
                required
                className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Permission</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setPermission('view')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                  permission === 'view'
                    ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              <button
                type="button"
                onClick={() => setPermission('edit')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                  permission === 'edit'
                    ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          </div>

          <div>
            <Label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Message (optional)</Label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Added you to review the PFAS panel..."
              className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 text-sm"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          {success && <p className="text-xs text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" />{success}</p>}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          >
            {submitting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Share2 className="w-4 h-4 mr-1.5" />}
            Send Invitation
          </Button>
        </form>

        {/* Copy direct link */}
        <div className="pt-2 border-t border-slate-700/50">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
            {copied ? 'Link copied' : 'Copy project link'}
          </button>
        </div>

        {/* Existing shares */}
        {shares.length > 0 && (
          <div className="pt-3 border-t border-slate-700/50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Shared with ({shares.length})
            </p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {shares.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-slate-800/60">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-300 truncate">{s.shared_with_email}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        s.permission === 'edit' ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {s.permission}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        s.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-400' :
                        s.status === 'revoked' ? 'bg-red-500/15 text-red-400' :
                        'bg-slate-700 text-slate-500'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(s.id)}
                    className="p-1.5 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                    title="Revoke access"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {loadingShares && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}