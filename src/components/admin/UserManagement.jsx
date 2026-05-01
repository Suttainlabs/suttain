import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, User as UserIcon, ShieldCheck, Sparkles, X, Crown, Clock } from 'lucide-react';
import { format } from 'date-fns';
import GrantAccessModal from './GrantAccessModal';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [grantingUser, setGrantingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const userList = await base44.entities.User.list('-created_date', 500);
      setUsers(userList);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleGrantConfirm = async (user, duration) => {
    setUpdatingId(user.id);
    try {
      const isLifetime = duration.unit === 'lifetime';
      const expiresAt = isLifetime ? null : new Date(Date.now() + duration.value * 86400000).toISOString();

      await base44.entities.User.update(user.id, {
        admin_granted_access: true,
        admin_access_expires_at: expiresAt,
        admin_access_duration_label: duration.label,
        subscription_plan: 'pro',
        subscription_status: 'active',
      });

      // Send email notification to user
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          from_name: 'Suttain',
          subject: '🎉 You\'ve been granted Full Pro Access on Suttain!',
          body: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#9531F5);border-radius:12px 12px 0 0;padding:40px;text-align:center;">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png" alt="Suttain" style="height:44px;margin-bottom:16px;"/>
            <div style="font-size:40px;margin-bottom:10px;">🎉</div>
            <h1 style="color:#fff;margin:0 0 8px;font-size:26px;">You've Got Full Pro Access!</h1>
            <p style="color:rgba(255,255,255,0.85);margin:0;font-size:15px;">Compliments of the Suttain team</p>
          </td>
        </tr>
        <tr>
          <td style="background:#fff;padding:36px 40px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
            <p style="font-size:16px;color:#1e293b;">Hi ${user.full_name?.split(' ')[0] || 'there'} 👋</p>
            <p style="color:#475569;font-size:15px;line-height:1.6;">Great news! The Suttain team has granted you <strong>full Pro access</strong> to the Suttain platform.</p>

            <div style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border:1px solid #c4b5fd;border-radius:12px;padding:20px 24px;margin:24px 0;text-align:center;">
              <p style="margin:0 0 4px;font-weight:700;font-size:18px;color:#5b21b6;">Suttain Pro</p>
              <p style="margin:0;color:#7c3aed;font-size:14px;font-weight:600;">
                ${isLifetime ? '⚡ Lifetime Access — Never Expires' : `⏱ Valid for ${duration.label} · Expires ${new Date(expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
              </p>
            </div>

            <p style="color:#475569;font-size:14px;line-height:1.6;margin-bottom:8px;"><strong>What you now have unlimited access to:</strong></p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${[
                'Unlimited Chemical Simulations',
                'Unlimited Formula Generation',
                'Unlimited Quick Scans',
                'Computational Simulations (DFT, MD, QM)',
                'AI Compliance Co-Pilot (50+ regions)',
                'Sustainability & Eco Impact Scoring',
                'Comparative Impact Reports',
                'Personalized Safety Alerts',
                'My Workspace (Unlimited Storage)',
                'PDF & Lab Report Export',
                'Priority Support',
              ].map(f => `<tr><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#1e293b;"><span style="color:#7c3aed;font-weight:700;margin-right:8px;">✓</span>${f}</td></tr>`).join('')}
            </table>

            <div style="text-align:center;margin:32px 0 24px;">
              <a href="https://suttain.com/Simulator" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#9531F5);color:#fff;font-weight:700;font-size:15px;text-decoration:none;padding:14px 40px;border-radius:50px;">Start Using Pro Now →</a>
            </div>

            <p style="color:#94a3b8;font-size:13px;text-align:center;border-top:1px solid #f1f5f9;padding-top:16px;margin:0;">
              Questions? Contact us at <a href="mailto:contact@suttain.com" style="color:#7c3aed;">contact@suttain.com</a>
            </p>
          </td>
        </tr>
        <tr><td style="text-align:center;padding:16px 0;">
          <p style="color:#cbd5e1;font-size:12px;margin:0;">© ${new Date().getFullYear()} Suttain. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
        });
      } catch (emailErr) {
        console.error('Failed to send grant access email:', emailErr);
      }

      setUsers(prev => prev.map(u => u.id === user.id ? {
        ...u,
        admin_granted_access: true,
        admin_access_expires_at: expiresAt,
        admin_access_duration_label: duration.label,
        subscription_plan: 'pro',
        subscription_status: 'active',
      } : u));
    } catch (e) {
      console.error('Failed to grant access:', e);
    } finally {
      setUpdatingId(null);
      setGrantingUser(null);
    }
  };

  const handleRevoke = async (user) => {
    setUpdatingId(user.id);
    try {
      await base44.entities.User.update(user.id, {
        admin_granted_access: false,
        admin_access_expires_at: null,
        admin_access_duration_label: null,
        subscription_plan: user.stripe_subscription_id ? user.subscription_plan : null,
        subscription_status: user.stripe_subscription_id ? user.subscription_status : null,
      });
      setUsers(prev => prev.map(u => u.id === user.id ? {
        ...u,
        admin_granted_access: false,
        admin_access_expires_at: null,
        admin_access_duration_label: null,
        subscription_plan: u.stripe_subscription_id ? u.subscription_plan : null,
        subscription_status: u.stripe_subscription_id ? u.subscription_status : null,
      } : u));
    } catch (e) {
      console.error('Failed to revoke access:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(user =>
    (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isPaidPro = (u) => (u.subscription_plan === 'pro' || u.subscription_plan === 'enterprise') && u.stripe_subscription_id;
  const hasAdminAccess = (u) => !!u.admin_granted_access;

  const getAccessLabel = (u) => {
    if (!u.admin_granted_access) return null;
    if (!u.admin_access_expires_at) return 'Lifetime';
    const expires = new Date(u.admin_access_expires_at);
    const now = new Date();
    if (expires < now) return 'Expired';
    const daysLeft = Math.ceil((expires - now) / 86400000);
    return `${u.admin_access_duration_label || ''} · ${daysLeft}d left`;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">User Management</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>All Users ({users.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Full Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => {
                    const granted = hasAdminAccess(user);
                    const paid = isPaidPro(user);
                    const isUpdating = updatingId === user.id;
                    const accessLabel = getAccessLabel(user);
                    const isExpired = granted && user.admin_access_expires_at && new Date(user.admin_access_expires_at) < new Date();

                    return (
                      <TableRow key={user.id} className={granted && !isExpired ? 'bg-violet-50' : ''}>
                        <TableCell className="font-medium">{user.full_name || '—'}</TableCell>
                        <TableCell className="text-slate-600 text-sm">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className={user.role === 'admin' ? 'bg-teal-600 text-white' : ''}>
                            {user.role === 'admin' ? <ShieldCheck className="w-3 h-3 mr-1" /> : <UserIcon className="w-3 h-3 mr-1" />}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {paid ? (
                            <Badge className="bg-teal-600 text-white"><Crown className="w-3 h-3 mr-1" />Pro (Paid)</Badge>
                          ) : granted && !isExpired ? (
                            <div>
                              <Badge className="bg-violet-600 text-white"><Sparkles className="w-3 h-3 mr-1" />Pro (Admin)</Badge>
                              <p className="text-[10px] text-violet-500 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />{accessLabel}
                              </p>
                            </div>
                          ) : (
                            <Badge variant="secondary">Free</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {user.created_date ? format(new Date(user.created_date), 'MMM d, yyyy') : '—'}
                        </TableCell>
                        <TableCell>
                          {user.role === 'admin' ? (
                            <span className="text-xs text-slate-400">N/A</span>
                          ) : granted && !isExpired ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50 text-xs"
                              onClick={() => handleRevoke(user)}
                              disabled={isUpdating}
                            >
                              {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <><X className="w-3 h-3 mr-1" />Revoke</>}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-violet-600 hover:bg-violet-700 text-white text-xs"
                              onClick={() => setGrantingUser(user)}
                              disabled={isUpdating || paid}
                              title={paid ? 'Already a paid Pro subscriber' : 'Grant temporary full access'}
                            >
                              {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Sparkles className="w-3 h-3 mr-1" />Grant</>}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {grantingUser && (
        <GrantAccessModal
          user={grantingUser}
          onConfirm={handleGrantConfirm}
          onClose={() => setGrantingUser(null)}
        />
      )}
    </div>
  );
}