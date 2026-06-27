import React, { useState } from 'react';
import { Search, User, Settings, Mail, Database, X } from 'lucide-react';

const COMMAND_ITEMS = [
  { category: 'Users', icon: User, items: ['Find User', 'Grant Access', 'Reset Subscription', 'Ban User'] },
  { category: 'System', icon: Database, items: ['View Logs', 'Trigger Backup', 'Clear Cache', 'System Status'] },
  { category: 'Communications', icon: Mail, items: ['Broadcast Email', 'Send Alert', 'Newsletter', 'Notification'] },
  { category: 'Settings', icon: Settings, items: ['Platform Config', 'Feature Flags', 'Rate Limits', 'API Keys'] },
];

export default function AdminCommandMenu({ onClose }) {
  const [search, setSearch] = useState('');

  const filteredItems = COMMAND_ITEMS.map(group => ({
    ...group,
    items: group.items.filter(item => item.toLowerCase().includes(search.toLowerCase()))
  })).filter(group => group.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0F1419] border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="border-b border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-500" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search commands, users, settings..."
              className="flex-1 bg-transparent text-slate-100 outline-none text-base"
            />
            <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Commands */}
        <div className="max-h-96 overflow-y-auto">
          {filteredItems.length > 0 ? (
            filteredItems.map(group => (
              <div key={group.category}>
                <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 bg-slate-900/50">
                  {group.category}
                </div>
                {group.items.map(item => (
                  <button
                    key={item}
                    onClick={() => {
                      console.log('Executing:', item);
                      onClose();
                    }}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-900 transition-colors border-b border-slate-800 last:border-b-0"
                  >
                    <group.icon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{item}</span>
                    <span className="ml-auto text-xs text-slate-500">⏎</span>
                  </button>
                ))}
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-slate-500 text-sm">
              No commands found for "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}