import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  LayoutDashboard, Users, FileText, Power,
  Menu, X, Briefcase, Megaphone, Crown, Headphones, Mail, BarChart2, Rss, Wifi
} from 'lucide-react';
import RealTimeTrafficPanel from './RealTimeTrafficPanel';
import DashboardOverview from './DashboardOverview';
import UserManagement from './UserManagement';
import SubmissionsManagement from './SubmissionsManagement';
import JobManagement from './JobManagement';
import SendUpdateAnnouncement from './SendUpdateAnnouncement';
import SubscriptionsPanel from './SubscriptionsPanel';
import CustomerSupportCRM from './CustomerSupportCRM';
import SubscriptionEmailPanel from './SubscriptionEmailPanel';
import UserAnalytics from './UserAnalytics';
import BlogBroadcast from './BlogBroadcast';

const navCategories = [
  {
    title: 'Users & Subscriptions',
    items: [
      { id: 'users', label: 'User Management', icon: Users },
      { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
      { id: 'subscription-emails', label: 'Subscription Emails', icon: Mail },
    ]
  },
  {
    title: 'Analytics & Logs',
    items: [
      { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
      { id: 'traffic', label: 'Live Traffic', icon: Wifi },
      { id: 'analytics', label: 'User Analytics', icon: BarChart2 },
    ]
  },
  {
    title: 'Platform Actions',
    items: [
      { id: 'support', label: 'Support CRM', icon: Headphones },
      { id: 'blog-broadcast', label: 'Blog Broadcast', icon: Rss },
      { id: 'announcements', label: 'Announcements', icon: Megaphone },
      { id: 'submissions', label: 'Submissions', icon: FileText },
      { id: 'jobs', label: 'Job Postings', icon: Briefcase },
    ]
  },
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
              <p className="text-sm text-slate-500 mt-1">Real-time visitor analytics — auto-refreshes every 15 seconds</p>
            </div>
            <RealTimeTrafficPanel />
          </div>
        );
      case 'analytics':
        return <UserAnalytics />;
      case 'blog-broadcast':
        return <BlogBroadcast />;
      case 'support':
        return <CustomerSupportCRM />;
      case 'subscriptions':
        return <SubscriptionsPanel />;
      case 'subscription-emails':
        return <SubscriptionEmailPanel />;
      case 'users':
        return <UserManagement />;
      case 'submissions':
        return <SubmissionsManagement />;
      case 'jobs':
        return <JobManagement />;
      case 'announcements':
        return <SendUpdateAnnouncement />;
      default:
        return <DashboardOverview />;
    }
  };
  
  const SidebarContent = () => (
     <div className="flex flex-col h-full bg-[#0A0E17]">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-slate-100">Admin Panel</h2>
          <p className="text-xs text-slate-400 mt-1">Platform Management</p>
        </div>
        <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
          {navCategories.map((category) => (
            <div key={category.title}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">{category.title}</p>
              <div className="space-y-1">
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-semibold ${
                      activeTab === item.id
                        ? 'bg-[#007850] text-white'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link to={createPageUrl("Home")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-semibold text-slate-400 hover:text-slate-300 hover:bg-slate-800/50">
             <Power className="w-4 h-4" />
             Exit Admin Panel
          </Link>
        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0E17] flex">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 rounded-md shadow-md border border-slate-800"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="w-6 h-6 text-slate-100" /> : <Menu className="w-6 h-6 text-slate-100" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-[#0F1419] border-r border-slate-800 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
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