import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Trash2, Edit, KeyRound, Mail, ArrowUpRight, MoreVertical } from 'lucide-react';

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await base44.asServiceRole.entities.User.list('-created_date', 50);
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleAction = async (action, userId) => {
    switch (action) {
      case 'delete':
        if (window.confirm('Delete this user? This cannot be undone.')) {
          try {
            await base44.asServiceRole.entities.User.delete(userId);
            setUsers(users.filter(u => u.id !== userId));
          } catch (error) {
            alert('Failed to delete user');
          }
        }
        break;
      case 'reset':
        try {
          await base44.functions.invoke('adminFixUserSubscription', { userId });
          alert('Subscription reset successfully');
        } catch (error) {
          alert('Failed to reset subscription');
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-[#0F1419] border border-slate-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50">
              <th className="px-6 py-3 text-left font-semibold text-slate-300">User</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-300">Subscription</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-300">Status</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-300">Joined</th>
              <th className="px-6 py-3 text-right font-semibold text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-slate-900">
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-slate-100 font-semibold">{user.full_name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-violet-500/10 text-violet-300">
                    {user.subscription_tier || 'Free'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-300">Active</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {user.created_date ? new Date(user.created_date).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => handleAction('reset', user.id)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-cyan-400" title="Reset subscription">
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleAction('delete', user.id)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-red-400" title="Delete user">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}