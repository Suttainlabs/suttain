import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Trash2, RotateCcw, AlertCircle, Loader } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await base44.asServiceRole.entities.User.list('-created_date', 100);
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleAction = async (action) => {
    if (!selected.size) return;
    
    if (action === 'delete' && !window.confirm(`Delete ${selected.size} user(s)? This cannot be undone.`)) return;
    if (action === 'reset' && !window.confirm(`Reset subscription for ${selected.size} user(s)?`)) return;

    setActioning(true);
    try {
      for (const userId of selected) {
        if (action === 'delete') {
          await base44.asServiceRole.entities.User.delete(userId);
        } else if (action === 'reset') {
          await base44.functions.invoke('adminFixUserSubscription', { userId });
        }
      }
      setSelected(new Set());
      await fetchUsers();
    } catch (error) {
      alert('Action failed: ' + error.message);
    } finally {
      setActioning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">User Management</h1>
          <p className="text-sm text-slate-400 mt-1">{users.length} total users</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Selected: {selected.size}</p>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selected.size > 0 && (
        <div className="bg-[#0F1419] border border-[#007850]/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">{selected.size} selected</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAction('reset')}
              disabled={actioning}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#007850] text-white text-sm font-semibold hover:bg-[#005a3d] disabled:opacity-50 transition-colors"
            >
              {actioning ? <Loader className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Reset Subscription
            </button>
            <button
              onClick={() => handleAction('delete')}
              disabled={actioning}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6B3FA0] text-white text-sm font-semibold hover:bg-[#5a2d8a] disabled:opacity-50 transition-colors"
            >
              {actioning ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#0F1419] border border-slate-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selected.size === users.length && users.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelected(new Set(users.map(u => u.id)));
                        } else {
                          setSelected(new Set());
                        }
                      }}
                      className="w-4 h-4 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Tier</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Joined</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map(user => (
                  <tr
                    key={user.id}
                    className={`hover:bg-slate-800/30 transition-colors cursor-pointer ${
                      selected.has(user.id) ? 'bg-slate-800/50' : ''
                    }`}
                    onClick={() => toggleSelect(user.id)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="w-4 h-4 rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-100 font-semibold">{user.full_name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-slate-400">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.subscription_tier === 'Free' ? 'bg-slate-700 text-slate-200' :
                        user.subscription_tier === 'Pro' ? 'bg-[#007850]/20 text-[#10d981]' :
                        'bg-[#6B3FA0]/20 text-[#c084fc]'
                      }`}>
                        {user.subscription_tier || 'Free'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {user.created_date ? new Date(user.created_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#10d981]" />
                        <span className="text-slate-300">Active</span>
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