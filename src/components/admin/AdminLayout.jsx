import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  LayoutDashboard, Users, FileText, Power,
  Menu, X, Briefcase, Megaphone, Crown, Headphones, Mail, BarChart2, Rss, Wifi, Activity, UserCheck
} from 'lucide-react';
import RealTimeTrafficPanel from './RealTimeTrafficPanel';
import DashboardOverview from './DashboardOverview';
import UserManagement from './UserManagement';
import SubmissionsManagement from './SubmissionsManagement';
import JobManagement from './JobManagement';
import AnnouncementPanel from './AnnouncementPanel';
import SubscriptionsPanel from './SubscriptionsPanel';
import SubscribedUsersPanel from './SubscribedUsersPanel';
import CustomerSupportCRM from './CustomerSupportCRM';
import SubscriptionEmailPanel from './SubscriptionEmailPanel';
import UserAnalytics from './UserAnalytics';
import AdminActivityLogs from './AdminActivityLogs';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'traffic', label: 'Live Traffic', icon: Wifi },
  { id: 'analytics', label: 'User Analytics', icon: BarChart2 },
  { id: 'activity', label: 'Activity Logs', icon: Activity },
  { id: 'support', label: 'Support CRM', icon: Headphones },
  { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
  { id: 'subscribed-users', label: 'Subscribed Users', icon: UserCheck },
  { id: 'subscription-emails', label: 'Subscription Emails', icon: Mail },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'submissions', label: 'Submissions', icon: FileText },
  { id: 'jobs', label: 'Job Postings', icon: Briefcase },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
];

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'traffic':
        return (
          <div className="space-y-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Live Traffic</h1>
              <p className="text-sm text-slate-500 mt-1">Real-time visitor analytics, auto-refreshes every 15 seconds</p>
            </div>
            <RealTimeTrafficPanel />
          </div>
        );
      case 'analytics':
        return <UserAnalytics />;
      case 'activity':
        return <AdminActivityLogs />;
      case 'support':
        return <CustomerSupportCRM />;
      case 'subscriptions':
        return <SubscriptionsPanel />;
      case 'subscribed-users':
        return <SubscribedUsersPanel />;
      case 'subscription-emails':
        return <SubscriptionEmailPanel />;
      case 'users':
        return <UserManagement />;
      case 'submissions':
        return <SubmissionsManagement />;
      case 'jobs':
        return <JobManagement />;
      case 'announcements':
        return <AnnouncementPanel />;
      default:
        return <DashboardOverview />;
    }
  };
  
  const SidebarContent = () => (
     <div className="flex flex-col h-full">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-semibold ${
                activeTab === item.id
                  ? 'bg-teal-100 text-teal-800'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <Link to={createPageUrl("Home")} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-semibold text-slate-600 hover:bg-slate-100">
             <Power className="w-5 h-5" />
             Exit Admin Panel
          </Link>
        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
         <SidebarContent />
      </aside>
      
       {/* Mobile Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
}