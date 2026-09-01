import React from 'react';
import { Edit2, Bell, Settings, Crown, Sparkles } from 'lucide-react';

export default function DashboardGreeting({ user, isPro, onEdit, onNotifications, onSettings, unreadCount = 0 }) {
  const firstName = user?.display_name || user?.full_name?.split(' ')[0] || 'User';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="flex items-center justify-between gap-4 flex-wrap pb-1">
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
            {user?.profile_image_url ? (
              <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-teal-50">
                <span className="text-lg font-semibold text-[#02988C]">{firstName.charAt(0)}</span>
              </div>
            )}
          </div>
          <button
            onClick={onEdit}
            aria-label="Edit profile"
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <Edit2 className="w-3 h-3 text-slate-600" />
          </button>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold text-slate-900 truncate">
              {greeting}, {firstName}
            </h1>
            {isPro ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <Crown className="w-3 h-3" /> Pro
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                <Sparkles className="w-3 h-3" /> Free
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 truncate">{user?.role === 'admin' ? 'Administrator' : user?.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNotifications}
          aria-label="Notifications"
          className="relative w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-colors"
        >
          <Bell className="w-4 h-4 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={onSettings}
          aria-label="Settings"
          className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-600" />
        </button>
      </div>
    </header>
  );
}