import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { base44 } from '@/api/base44Client';
import { Send, Plus, X, Loader2, CheckCircle, Mail, MessageSquare, Upload, Image } from 'lucide-react';

export default function SendUpdateAnnouncement() {
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [features, setFeatures] = useState(['']);
  const [sendTo, setSendTo] = useState('all'); // 'all', 'email', 'slack'
  const [slackChannel, setSlackChannel] = useState('#all-suttain');
  const [attachedFile, setAttachedFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFileUrl(file_url);
      setAttachedFile(file);
    } catch (err) {
      setError('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    setUploadedFileUrl('');
  };

  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const removeFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const updateFeature = (index, value) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const handleSend = async () => {
    if (!updateTitle || !updateDescription) {
      setError('Please fill in the title and description');
      return;
    }

    setIsSending(true);
    setError('');
    setSuccess(false);

    try {
      const filteredFeatures = features.filter(f => f.trim());

      // Send emails if selected
      if (sendTo === 'all' || sendTo === 'email') {
        const users = await base44.entities.User.list();
        const recipients = users.map(u => u.email).filter(Boolean);

        if (recipients.length === 0 && sendTo === 'email') {
          setError('No users found to send update to');
          setIsSending(false);
          return;
        }

        if (recipients.length > 0) {
          await base44.functions.invoke('sendEmailResend', {
            type: 'update_announcement',
            data: {
              updateTitle,
              updateDescription,
              features: filteredFeatures,
              recipients,
              attachmentUrl: uploadedFileUrl || null
            }
          });
        }
      }

      // Send Slack notification if selected
      if (sendTo === 'all' || sendTo === 'slack') {
        if (!slackChannel) {
          setError('Please enter a Slack channel');
          setIsSending(false);
          return;
        }
        await base44.functions.invoke('sendSlackNotification', {
          channel: slackChannel,
          type: 'update_announcement',
          data: {
            updateTitle,
            updateDescription,
            features: filteredFeatures,
            attachmentUrl: uploadedFileUrl || null
          }
        });
      }

      setSuccess(true);
      setUpdateTitle('');
      setUpdateDescription('');
      setFeatures(['']);
      setAttachedFile(null);
      setUploadedFileUrl('');
      setSlackChannel('');
    } catch (err) {
      setError(err.message || 'Failed to send update announcement');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Send Update Announcement
        </CardTitle>
        <CardDescription>
          Notify all users about new features and updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Update Title</Label>
          <Input
            id="title"
            placeholder="e.g., New Formula Generator Features"
            value={updateTitle}
            onChange={(e) => setUpdateTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what's new in this update..."
            value={updateDescription}
            onChange={(e) => setUpdateDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Send To</Label>
          <RadioGroup value={sendTo} onValueChange={setSendTo} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="flex items-center gap-1 cursor-pointer font-normal">
                <Mail className="w-4 h-4" />
                <MessageSquare className="w-4 h-4" />
                Both
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="email" />
              <Label htmlFor="email" className="flex items-center gap-1 cursor-pointer font-normal">
                <Mail className="w-4 h-4" />
                Email Only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="slack" id="slack" />
              <Label htmlFor="slack" className="flex items-center gap-1 cursor-pointer font-normal">
                <MessageSquare className="w-4 h-4" />
                Slack Only
              </Label>
            </div>
          </RadioGroup>
        </div>

        {(sendTo === 'all' || sendTo === 'slack') && (
          <div className="space-y-2">
            <Label htmlFor="slack-channel">Slack Channel</Label>
            <Input
              id="slack-channel"
              placeholder="e.g., #general or #announcements"
              value={slackChannel}
              onChange={(e) => setSlackChannel(e.target.value)}
            />
            <p className="text-xs text-slate-500">Enter the channel name including # (e.g., #general)</p>
          </div>
        )}

        <div className="space-y-2">
          <Label>New Features</Label>
          {features.map((feature, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Feature ${index + 1}`}
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
              />
              {features.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFeature(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addFeature}>
            <Plus className="w-4 h-4 mr-1" /> Add Feature
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Attachment (Optional)</Label>
          {!attachedFile ? (
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Click to upload image or PDF</span>
                  </div>
                )}
              </label>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
              <Image className="w-5 h-5 text-slate-500" />
              <span className="flex-1 text-sm truncate">{attachedFile.name}</span>
              <Button variant="ghost" size="icon" onClick={removeFile}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            Update announcement sent successfully!
          </div>
        )}

        <Button 
          onClick={handleSend} 
          disabled={isSending}
          className="w-full"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {sendTo === 'all' ? 'Send to All' : sendTo === 'email' ? 'Send Email' : 'Send to Slack'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}