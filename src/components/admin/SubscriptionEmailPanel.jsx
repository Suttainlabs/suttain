import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, Send, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SubscriptionEmailPanel() {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailStatus, setEmailStatus] = useState(null);

  // Fetch users with active subscriptions
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['subscription-users'],
    queryFn: () => base44.entities.User.list('-created_date', 100),
  });

  // Send thank you email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (userIds) => {
      const results = [];
      for (const userId of userIds) {
        const user = users.find(u => u.id === userId);
        if (user && user.subscription_status === 'active') {
          const res = await base44.functions.invoke('sendSubscriptionThankYouEmail', {
            email: user.email,
            full_name: user.full_name || 'User',
            plan_name: user.subscription_plan || 'Pro'
          });
          results.push({ userId, success: res.data?.success });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      const successful = results.filter(r => r.success).length;
      setEmailStatus({
        type: 'success',
        message: `✅ Sent ${successful} thank you email(s) successfully!`
      });
      setSelectedUsers([]);
      setTimeout(() => setEmailStatus(null), 4000);
    },
    onError: (error) => {
      setEmailStatus({
        type: 'error',
        message: `❌ Error sending emails: ${error.message}`
      });
    }
  });

  // Filter users with active subscriptions
  const subscribedUsers = users.filter(u => 
    u.subscription_status === 'active' &&
    (u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSendEmails = () => {
    if (selectedUsers.length === 0) return;
    sendEmailMutation.mutate(selectedUsers);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (selectedUsers.length === subscribedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(subscribedUsers.map(u => u.id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Subscription Thank You Emails</h1>
        <p className="text-slate-500 mt-1">Send thank you emails to subscribers manually or automatically on subscription</p>
      </div>

      {/* Status Message */}
      {emailStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-4 rounded-lg border ${
            emailStatus.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {emailStatus.message}
        </motion.div>
      )}

      {/* Info Box */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="w-5 h-5 text-teal-600" />
            Automated Emails
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <p>✅ <strong>Automatic:</strong> Thank you emails are sent automatically when users activate a subscription.</p>
          <p>📧 <strong>Manual:</strong> You can also manually select users below and send thank you emails.</p>
          <p>🎯 <strong>Personalized:</strong> Each email includes the user's name and plan type.</p>
        </CardContent>
      </Card>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button
          onClick={selectAll}
          variant="outline"
          className="whitespace-nowrap"
        >
          {selectedUsers.length === subscribedUsers.length && subscribedUsers.length > 0
            ? 'Deselect All'
            : 'Select All'}
        </Button>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : subscribedUsers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-500">
              No active subscribers found
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-sm font-semibold text-slate-700">
                {selectedUsers.length} of {subscribedUsers.length} selected
              </p>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {subscribedUsers.map(user => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => toggleUserSelection(user.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => {}}
                    className="w-4 h-4 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{user.full_name || 'User'}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-teal-600">{user.subscription_plan || 'Pro'}</p>
                    <p className="text-xs text-slate-500">Active</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendEmails}
              disabled={selectedUsers.length === 0 || sendEmailMutation.isPending}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white h-11 font-semibold"
            >
              {sendEmailMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending {selectedUsers.length} email(s)...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Thank You Emails ({selectedUsers.length})
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}