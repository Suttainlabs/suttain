import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, User as UserIcon, ShieldCheck, Sparkles, X, Crown } from 'lucide-react';
import { format } from 'date-fns';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

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

  const handleToggleAccess = async (user) => {
    setUpdatingId(user.id);
    try {
      const hasAccess = !!user.admin_granted_access;
      await base44.entities.User.update(user.id, {
        admin_granted_access: !hasAccess,
        // If granting, set plan fields; if revoking, clear them
        subscription_plan: !hasAccess ? 'pro' : (user.subscription_plan === 'pro' && !user.stripe_subscription_id ? null : user.subscription_plan),
        subscription_status: !hasAccess ? 'active' : (user.stripe_subscription_id ? user.subscription_status : null),
      });
      setUsers(prev => prev.map(u => u.id === user.id ? {
        ...u,
        admin_granted_access: !hasAccess,
        subscription_plan: !hasAccess ? 'pro' : (u.stripe_subscription_id ? u.subscription_plan : null),
        subscription_status: !hasAccess ? 'active' : (u.stripe_subscription_id ? u.subscription_status : null),
      } : u));
    } catch (e) {
      console.error('Failed to update user access:', e);
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

                    return (
                      <TableRow key={user.id} className={granted ? 'bg-violet-50' : ''}>
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
                          ) : granted ? (
                            <Badge className="bg-violet-600 text-white"><Sparkles className="w-3 h-3 mr-1" />Pro (Admin)</Badge>
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
                          ) : granted ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50 text-xs"
                              onClick={() => handleToggleAccess(user)}
                              disabled={isUpdating}
                            >
                              {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <><X className="w-3 h-3 mr-1" />Revoke</>}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-violet-600 hover:bg-violet-700 text-white text-xs"
                              onClick={() => handleToggleAccess(user)}
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
    </div>
  );
}