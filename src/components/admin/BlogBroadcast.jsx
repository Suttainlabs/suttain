import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, CheckCircle2, AlertCircle, Loader2, Rss, Info } from 'lucide-react';

export default function BlogBroadcast() {
  const [form, setForm] = useState({ articleTitle: '', articleExcerpt: '', articleUrl: '' });
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [result, setResult] = useState(null);

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!form.articleTitle.trim()) return;

    setStatus('loading');
    setResult(null);

    try {
      const res = await base44.functions.invoke('broadcastBlogPost', {
        action: 'broadcast',
        articleTitle: form.articleTitle.trim(),
        articleExcerpt: form.articleExcerpt.trim() || undefined,
        articleUrl: form.articleUrl.trim() || 'https://suttain.com/Blog',
      });
      setResult(res);
      setStatus('success');
      setForm({ articleTitle: '', articleExcerpt: '', articleUrl: '' });
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
          This will send an email to every registered user on the platform. Make sure the article is already published before triggering a broadcast.
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
          <form onSubmit={handleBroadcast} className="space-y-4">
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
              {status === 'loading' ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Sending to all users...</>
              ) : (
                <><Send className="w-4 h-4" />Broadcast to All Users</>
              )}
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
    </div>
  );
}