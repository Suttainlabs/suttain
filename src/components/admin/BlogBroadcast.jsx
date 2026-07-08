import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, CheckCircle2, AlertCircle, Loader2, Rss, Info, AlertTriangle, Users } from 'lucide-react';
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

export default function BlogBroadcast() {
  const [form, setForm] = useState({ articleTitle: '', articleExcerpt: '', articleUrl: '' });
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [result, setResult] = useState(null);
  const [recipientCount, setRecipientCount] = useState(null);
  const [countLoading, setCountLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  // Fetch recipient count when the dialog opens
  useEffect(() => {
    if (!dialogOpen) {
      setConfirmText('');
      return;
    }
    setCountLoading(true);
    setRecipientCount(null);
    base44.functions.invoke('getAdminUsers', {})
      .then(res => {
        const count = Array.isArray(res) ? res.length : (res?.users?.length ?? res?.count ?? 0);
        setRecipientCount(count);
      })
      .catch(() => setRecipientCount(null))
      .finally(() => setCountLoading(false));
  }, [dialogOpen]);

  const canConfirm = confirmText.trim() === form.articleTitle.trim() && recipientCount !== null && !countLoading;

  const handleBroadcast = async () => {
    if (!canConfirm) return;

    setStatus('loading');
    setResult(null);
    setDialogOpen(false);

    try {
      const res = await base44.functions.invoke('broadcastBlogPost', {
        action: 'broadcast',
        confirm: true,
        articleTitle: form.articleTitle.trim(),
        articleExcerpt: form.articleExcerpt.trim() || undefined,
        articleUrl: form.articleUrl.trim() || 'https://suttain.com/Blog',
      });
      setResult(res);
      setStatus('success');
      setForm({ articleTitle: '', articleExcerpt: '', articleUrl: '' });
      setConfirmText('');
    } catch (err) {
      console.error('Broadcast error:', err);
      setResult({ error: err.message });
      setStatus('error');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Blog Broadcast</h2>
        <p className="text-sm text-slate-500 mt-1">
          Notify all registered users by email when a new article is published.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          This will send an email to every registered user on the platform. A confirmation dialog will appear before any emails are sent. Make sure the article is already published before triggering a broadcast.
        </p>
      </div>

      {/* Broadcast Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Rss className="w-4 h-4 text-teal-600" />
            New Article Notification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); if (form.articleTitle.trim()) setDialogOpen(true); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Article Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.articleTitle}
                onChange={handleChange('articleTitle')}
                placeholder="e.g. The Future of Sustainable Formulation"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Short Excerpt <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <Textarea
                value={form.articleExcerpt}
                onChange={handleChange('articleExcerpt')}
                placeholder="A brief 1-2 sentence summary of what the article covers..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Article URL <span className="text-slate-400 font-normal">(optional — defaults to /Blog)</span>
              </label>
              <Input
                value={form.articleUrl}
                onChange={handleChange('articleUrl')}
                placeholder="https://suttain.com/Blog"
                type="url"
              />
            </div>

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  type="submit"
                  disabled={status === 'loading' || !form.articleTitle.trim()}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white gap-2"
                >
                  {status === 'loading' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Sending to all users...</>
                  ) : (
                    <><Send className="w-4 h-4" />Broadcast to All Users</>
                  )}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Confirm Broadcast to All Users
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-3 text-sm text-slate-600">
                      <p>You are about to send an email to <strong>every registered user</strong> on the platform.</p>

                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Article Title</span>
                          <p className="text-sm font-medium text-slate-800">{form.articleTitle}</p>
                        </div>
                        {form.articleExcerpt && (
                          <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Excerpt</span>
                            <p className="text-sm text-slate-700">{form.articleExcerpt}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">URL</span>
                          <p className="text-sm text-blue-600 break-all">{form.articleUrl.trim() || 'https://suttain.com/Blog'}</p>
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
                          Type the article title to confirm: <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder={form.articleTitle}
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
                    onClick={handleBroadcast}
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
            <p className="text-sm font-semibold text-green-800">Broadcast complete</p>
            <p className="text-sm text-green-700 mt-0.5">
              {result.sent} emails sent successfully{result.failed > 0 ? `, ${result.failed} failed` : ''}.
              {result.recipient_count != null && <> {result.recipient_count} total recipients.</>}
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Broadcast failed</p>
            <p className="text-sm text-red-600 mt-0.5">{result?.error || 'An unexpected error occurred.'}</p>
          </div>
        </div>
      )}
    </div>
  );
}