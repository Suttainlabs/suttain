import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, CheckCircle2, AlertCircle, Loader2, Rss, Info, Users } from 'lucide-react';
import {
  AlertDialog,
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
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [recipientCount, setRecipientCount] = useState(null);
  const [countLoading, setCountLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [sending, setSending] = useState(false);

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  // Fetch recipient count when dialog opens
  useEffect(() => {
    if (!showConfirm) {
      setConfirmText('');
      return;
    }
    setCountLoading(true);
    setRecipientCount(null);
    base44.functions.invoke('getAdminUsers', {})
      .then(res => setRecipientCount(res.data?.users?.length || 0))
      .catch(() => setRecipientCount(null))
      .finally(() => setCountLoading(false));
  }, [showConfirm]);

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    if (!form.articleTitle.trim()) return;
    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    setSending(true);
    setStatus(null);
    setResult(null);
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
      setShowConfirm(false);
    } catch (err) {
      console.error('Broadcast error:', err);
      setResult({ error: err.message });
      setStatus('error');
      setShowConfirm(false);
    } finally {
      setSending(false);
    }
  };

  const canConfirm = confirmText.trim() === form.articleTitle.trim() && !countLoading && !sending;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Blog Broadcast</h2>
        <p className="text-sm text-slate-500 mt-1">
          Notify all registered users by email when a new article is published.
        </p>
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
        <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">
          This sends an email to every registered user. You will be asked to confirm before any email is sent.
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
          <form onSubmit={handleOpenConfirm} className="space-y-4">
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

            <Button
              type="submit"
              disabled={status === 'loading' || !form.articleTitle.trim()}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white gap-2"
            >
              <Send className="w-4 h-4" />Review & Confirm Broadcast
            </Button>
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

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              Confirm Bulk Email Broadcast
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  You are about to send an email to <strong className="text-slate-900">
                    {countLoading ? '...' : (recipientCount !== null ? `${recipientCount} users` : 'all users')}
                  </strong>. This cannot be undone.
                </p>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1.5">
                  <div className="flex gap-2">
                    <span className="text-xs font-semibold text-slate-500 w-16 flex-shrink-0">Title:</span>
                    <span className="text-sm text-slate-900 font-medium">{form.articleTitle}</span>
                  </div>
                  {form.articleExcerpt && (
                    <div className="flex gap-2">
                      <span className="text-xs font-semibold text-slate-500 w-16 flex-shrink-0">Excerpt:</span>
                      <span className="text-sm text-slate-600">{form.articleExcerpt}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <span className="text-xs font-semibold text-slate-500 w-16 flex-shrink-0">URL:</span>
                    <span className="text-sm text-blue-600 truncate">{form.articleUrl || 'https://suttain.com/Blog'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Type the article title to confirm: <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={form.articleTitle}
                    className="text-sm"
                    autoComplete="off"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSend}
              disabled={!canConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {sending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
              ) : (
                <>Confirm and Send</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}