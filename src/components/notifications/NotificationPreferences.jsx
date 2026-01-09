import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Shield, Sparkles, AlertTriangle, Mail, SlidersHorizontal } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    safety_alerts: true,
    compliance_alerts: true,
    subscription_updates: true,
    feature_releases: true,
    system_notifications: true,
    email_notifications: false,
    safety_threshold: 'all',
    compliance_threshold: 'all'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const user = await base44.auth.me();
        if (user.notification_preferences) {
          setPreferences({ ...preferences, ...user.notification_preferences });
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };
    loadPreferences();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await base44.auth.updateMe({ notification_preferences: preferences });
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update preferences');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (key) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  const updateThreshold = (key, value) => {
    setPreferences({ ...preferences, [key]: value });
  };

  const notificationTypes = [
    {
      key: 'safety_alerts',
      icon: Shield,
      label: 'Safety Alerts',
      description: 'Critical safety warnings based on your health profile',
      color: 'text-rose-600',
      hasThreshold: true,
      thresholdKey: 'safety_threshold'
    },
    {
      key: 'compliance_alerts',
      icon: AlertTriangle,
      label: 'Compliance Issues',
      description: 'Regulatory compliance warnings and updates',
      color: 'text-amber-600',
      hasThreshold: true,
      thresholdKey: 'compliance_threshold'
    },
    {
      key: 'subscription_updates',
      icon: Sparkles,
      label: 'Subscription Updates',
      description: 'Status changes and renewal reminders',
      color: 'text-purple-600'
    },
    {
      key: 'feature_releases',
      icon: Sparkles,
      label: 'New Features',
      description: 'Updates about new platform features',
      color: 'text-teal-600'
    },
    {
      key: 'system_notifications',
      icon: Bell,
      label: 'System Notifications',
      description: 'Important platform updates and maintenance',
      color: 'text-blue-600'
    }
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Notification Preferences</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Manage how you receive updates</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {notificationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.key}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      <Icon className={`w-5 h-5 ${type.color}`} />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={type.key} className="font-semibold text-slate-900 cursor-pointer">
                        {type.label}
                      </Label>
                      <p className="text-xs text-slate-600 mt-1">{type.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={type.key}
                    checked={preferences[type.key]}
                    onCheckedChange={() => togglePreference(type.key)}
                  />
                </div>
                {type.hasThreshold && preferences[type.key] && (
                  <div className="mt-3 ml-8 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-600">Alert threshold:</span>
                    <Select
                      value={preferences[type.thresholdKey]}
                      onValueChange={(value) => updateThreshold(type.thresholdKey, value)}
                    >
                      <SelectTrigger className="w-40 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All alerts</SelectItem>
                        <SelectItem value="warning_critical">Warning & Critical</SelectItem>
                        <SelectItem value="critical_only">Critical only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            );
          })}

          {/* Email Notifications */}
          <div className="flex items-start justify-between p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex gap-3 flex-1">
              <div className="flex-shrink-0 mt-1">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <Label htmlFor="email_notifications" className="font-semibold text-slate-900 cursor-pointer">
                  Email Notifications
                </Label>
                <p className="text-xs text-slate-600 mt-1">
                  Receive important alerts via email (critical only)
                </p>
              </div>
            </div>
            <Switch
              id="email_notifications"
              checked={preferences.email_notifications}
              onCheckedChange={() => togglePreference('email_notifications')}
            />
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  );
}