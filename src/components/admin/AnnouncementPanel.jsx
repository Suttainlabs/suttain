import React, { useState } from 'react';
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
  Megaphone, Send, CheckCircle2, AlertCircle, Loader2, Info,
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

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;

    setStatus('loading');
    setResult(null);

    try {
      await base44.entities.PlatformUpdate.create({
        title: form.title.trim(),
        description: form.message.trim(),
        category: form.category,
        is_published: true,
      });
      setResult({ success: true });
      setStatus('success');
      setForm({ title: '', message: '', category: 'announcement' });
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
        <h2 className="text-xl font-bold text-slate-800">Create Announcement</h2>
        <p className="text-sm text-slate-500 mt-1">
          Create an in-app announcement visible to all users in the platform update feed.
        </p>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          This will publish an in-app announcement to the platform update feed. No emails are sent.
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-violet-600" />
            New Announcement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
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
            </div>

            <Button
              type="submit"
              disabled={status === 'loading' || !isFormValid}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white gap-2"
            >
              {status === 'loading' ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Publishing...</>
              ) : (
                <><Send className="w-4 h-4" />Publish Announcement</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {status === 'success' && result && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">Announcement published</p>
            <p className="text-sm text-green-700 mt-0.5">
              The announcement is now live in the platform update feed.
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