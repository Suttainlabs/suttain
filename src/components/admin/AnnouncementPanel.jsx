import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Megaphone, Send, CheckCircle2, AlertCircle, Loader2,
  Info, AlertTriangle, Users,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'announcement', label: 'Announcement' },
  { value: 'tool', label: 'New Tool' },
  { value: 'research', label: 'Research' },
  { value: 'business', label: 'Business' },
  { value: 'improvement', label: 'Improvement' },
];

export default function AnnouncementPanel() {
  const [form, setForm] = useState({ title: '', message: '', category: 'announcement' });
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [recipientCount, setRecipientCount] = useState(null);
  const [countLoading, setCountLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  useEffect(() => {
    if (!dialogOpen) {
      setConfirmText('');
      return;
    }
    setCountLoading(true);
    setRecipientCount(null);
    base44.functions.invoke('getAdminUsers', {})
      .then(res => {
        const count = Array.isArray(res) ? res.length : (res?.users?.length ?? 0);
        setRecipientCount(count);
      })
      .catch(() => setRecipientCount(null))
      .finally(() => setCountLoading(false));
  }, [dialogOpen]);

  const canConfirm = confirmText.trim() === form.title.trim() && recipientCount !== null && !countLoading;

  const handleSend = async () => {
    if (!canConfirm) return;

    setStatus('loading');
    setResult(null);
    setDialogOpen(false);

    try {
      const res = await base44.functions.invoke('sendPlatformUpdateEmail', {
        title: form.title.trim(),
        message: form.message.trim(),
        category: form.category,
        confirm: true,
      });
      setResult(res);
      setStatus('success');
      setForm({ title: '', message: '', category: 'announcement' });
      setConfirmText('');
    } catch (err) {
      console.error('Announcement error:', err);
      setResult({ error: err.message });
      setStatus('error');
    }
  };

  const isFormValid = form.title.trim() && form.message.trim();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Send Announcement</h2>
        <p className="text-sm text-slate-500 mt-1">
          Send a platform-wide announcement email to all registered users.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          This will send an email to every registered user on the platform and save a record to the Platform Update log. A confirmation dialog will appear before any emails are sent.
        </p>
      </div>

      {/* Announcement Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-violet-600" />
            New Announcement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); if (isFormValid) setDialogOpen(true); }} className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-1">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.title}
                onChange={handleChange('title')}
                placeholder="e.g. Scheduled Maintenance on July 15"
                required
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={(val) => setForm(prev => ({ ...prev, category: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-1">
                Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={form.message}
                onChange={handleChange('message')}
                placeholder="Write your announcement message here..."
                rows={6}
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                The message will be rendered as plain text in the email template. Line breaks are preserved.
              </p>
            </div>

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  type="submit"
                  disabled={status === 'loading' || !isFormValid}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white gap-2"
                >
                  {status === 'loading' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Sending to all users...</>
                  ) : (
                    <><Send className="w-4 h-4" />Send to All Users</>
                  )}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Confirm Announcement to All Users
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-3 text-sm text-slate-600">
                      <p>You are about to send an email to <strong>every registered user</strong> on the platform.</p>

                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</span>
                          <p className="text-sm font-medium text-slate-800">{form.title}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</span>
                          <p className="text-sm text-slate-700 capitalize">{form.category}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Message</span>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-4">{form.message}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <Users className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <p className="text-sm text-amber-800">
                          {countLoading
                            ? 'Counting recipients...'
                            : recipientCount !== null
                              ? <>This will send an email to <strong>{recipientCount}</strong> users. This cannot be undone.</>
                              : 'Could not fetch recipient count. Proceed with caution.'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Type the announcement title to confirm: <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder={form.title}
                          autoComplete="off"
                        />
                        <p className="text-xs text-slate-400 mt-1">Must match exactly to enable the confirm button.</p>
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => { setConfirmText(''); setDialogOpen(false); }}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSend}
                    disabled={!canConfirm || status === 'loading'}
                    className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : 'Confirm and Send'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </form>
        </CardContent>
      </Card>

      {/* Result feedback */}
      {status === 'success' && result && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">Announcement sent</p>
            <p className="text-sm text-green-700 mt-0.5">
              {result.sent} emails sent successfully{result.failed > 0 ? `, ${result.failed} failed` : ''}.
              {result.total != null && <> {result.total} total recipients.</>}
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Announcement failed</p>
            <p className="text-sm text-red-600 mt-0.5">{result?.error || 'An unexpected error occurred.'}</p>
          </div>
        </div>
      )}
    </div>
  );
}