import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Mail, ListChecks, CalendarCheck, Star, MoreVertical, Trash2, CheckCircle, Clock, XCircle, PhoneCall } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';

const submissionTypes = [
  { id: 'contact', label: 'Contact Messages', icon: Mail, entityName: 'ContactSubmission' },
  { id: 'reviews', label: 'Product Reviews', icon: Star, entityName: 'Review' },
  { id: 'demos', label: 'Demo Requests', icon: CalendarCheck, entityName: 'DemoRequest' },
  { id: 'waitlist', label: 'Enterprise Waitlist', icon: ListChecks, entityName: 'EnterpriseWaitlist' },
];

const STATUS_CONFIGS = {
  pending:   { label: 'Pending',   className: 'bg-amber-100 text-amber-800',  icon: Clock },
  contacted: { label: 'Contacted', className: 'bg-blue-100 text-blue-800',    icon: PhoneCall },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-800',  icon: CheckCircle },
  void:      { label: 'Void',      className: 'bg-slate-100 text-slate-500',  icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIGS[status] || STATUS_CONFIGS.pending;
  return <Badge className={`capitalize border-none text-xs ${cfg.className}`}>{cfg.label}</Badge>;
}

function ActionMenu({ item, entityName, onDelete, onStatusChange, showStatus }) {
  const statuses = ['pending', 'contacted', 'completed', 'void'];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
          <MoreVertical className="w-4 h-4 text-slate-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {showStatus && statuses.map(s => (
          <DropdownMenuItem
            key={s}
            onClick={() => onStatusChange(item.id, s)}
            className="flex items-center gap-2 text-sm"
            disabled={item.status === s}
          >
            {React.createElement(STATUS_CONFIGS[s].icon, { className: 'w-3.5 h-3.5' })}
            {STATUS_CONFIGS[s].label}
          </DropdownMenuItem>
        ))}
        {showStatus && <DropdownMenuSeparator />}
        <DropdownMenuItem
          onClick={() => onDelete(item.id, entityName)}
          className="flex items-center gap-2 text-sm text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function SubmissionsManagement() {
  const [activeTab, setActiveTab] = useState('contact');
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        submissionTypes.map(t => base44.entities[t.entityName].list('-created_date'))
      );
      const data = submissionTypes.reduce((acc, t, i) => { acc[t.id] = results[i]; return acc; }, {});
      setSubmissions(data);
    } catch (e) {
      console.error('Failed to fetch submissions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id, entityName) => {
    if (!window.confirm('Delete this item permanently?')) return;
    await base44.entities[entityName].delete(id);
    fetchData();
  };

  const handleStatusChange = async (id, status, entityName) => {
    await base44.entities[entityName].update(id, { status });
    fetchData();
  };

  const currentItems = submissions[activeTab] || [];
  const currentType = submissionTypes.find(t => t.id === activeTab);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Submissions</h1>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {submissionTypes.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <Badge variant="secondary" className="ml-1">{submissions[tab.id]?.length || 0}</Badge>
            </button>
          ))}
        </nav>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : currentItems.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {currentItems.map((item) => (
                <li key={item.id} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                  {/* Content by tab */}
                  <div className="flex-1 min-w-0">
                    {activeTab === 'contact' && (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-800 text-sm">
                            {item.name} <span className="font-normal text-slate-500">&lt;{item.email}&gt;</span>
                          </p>
                          <p className="text-xs text-slate-400 flex-shrink-0">{format(new Date(item.created_date), 'MMM d, yyyy')}</p>
                        </div>
                        <p className="text-sm font-medium text-slate-700 mt-0.5">{item.subject}</p>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.message}</p>
                        {!item.is_read && <Badge variant="destructive" className="mt-2 text-xs">New</Badge>}
                      </>
                    )}
                    {activeTab === 'reviews' && (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-800 text-sm">{item.created_by}</p>
                          <p className="text-xs text-slate-400 flex-shrink-0">{format(new Date(item.created_date), 'MMM d, yyyy')}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < item.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-slate-500 capitalize">{item.feature_used} Review</span>
                        </div>
                        {item.feedback && <p className="text-sm text-slate-500 mt-1 italic line-clamp-2">"{item.feedback}"</p>}
                      </>
                    )}
                    {activeTab === 'demos' && (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-800 text-sm">{item.name} at {item.company_name}</p>
                          <p className="text-xs text-slate-400 flex-shrink-0">{format(new Date(item.created_date), 'MMM d, yyyy')}</p>
                        </div>
                        <p className="text-sm text-slate-500">{item.email}</p>
                        {item.role && <p className="text-xs text-slate-400">Role: {item.role}</p>}
                        {item.message && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.message}</p>}
                        <div className="mt-2"><StatusBadge status={item.status} /></div>
                      </>
                    )}
                    {activeTab === 'waitlist' && (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-800 text-sm">{item.name} at {item.company_name}</p>
                          <p className="text-xs text-slate-400 flex-shrink-0">{format(new Date(item.created_date), 'MMM d, yyyy')}</p>
                        </div>
                        <p className="text-sm text-slate-500">{item.email}</p>
                        {item.role && <p className="text-xs text-slate-400">Role: {item.role}</p>}
                        {item.notified && <Badge className="mt-2 bg-green-100 text-green-700 border-none text-xs">Notified</Badge>}
                      </>
                    )}
                  </div>

                  {/* Action menu */}
                  <ActionMenu
                    item={item}
                    entityName={currentType.entityName}
                    onDelete={handleDelete}
                    onStatusChange={(id, status) => handleStatusChange(id, status, currentType.entityName)}
                    showStatus={activeTab === 'demos' || activeTab === 'waitlist'}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-slate-500">No submissions of this type yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}