import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Trash2, KeyRound, Loader } from 'lucide-react';

export default function UserManagement() {
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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-500 mt-1">{users.length} total users</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left font-semibold text-slate-600">User</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-600">Subscription</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-600">Joined</th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-slate-900 font-semibold">{user.full_name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-violet-100 text-violet-700">
                        {user.subscription_tier || 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-slate-700">Active</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {user.created_date ? new Date(user.created_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => handleAction('reset', user.id)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-teal-600" title="Reset subscription">
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleAction('delete', user.id)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-red-500" title="Delete user">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}