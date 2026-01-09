
import React, { useState, useEffect } from 'react';
import { ContactSubmission } from '@/entities/ContactSubmission';
import { Review } from '@/entities/Review';
import { DemoRequest } from '@/entities/DemoRequest';
import { EnterpriseWaitlist } from '@/entities/EnterpriseWaitlist';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Mail, ListChecks, CalendarCheck, Star, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';

const submissionTypes = [
  { id: 'contact', label: 'Contact Messages', icon: Mail, entity: ContactSubmission },
  { id: 'reviews', label: 'Product Reviews', icon: Star, entity: Review },
  { id: 'demos', label: 'Demo Requests', icon: CalendarCheck, entity: DemoRequest },
  { id: 'waitlist', label: 'Enterprise Waitlist', icon: ListChecks, entity: EnterpriseWaitlist },
];

const Renderers = {
  contact: ({ item }) => (
    <>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 truncate">{item.name} <span className="font-normal text-slate-500">&lt;{item.email}&gt;</span></p>
        <p className="text-sm font-medium text-slate-600">{item.subject}</p>
        <p className="text-sm text-slate-500 mt-1">{item.message}</p>
      </div>
      <div className="text-right flex-shrink-0">
         <p className="text-xs text-slate-400">{format(new Date(item.created_date), 'MMM d, yyyy')}</p>
         {!item.is_read && <Badge variant="destructive" className="mt-2">New</Badge>}
      </div>
    </>
  ),
  reviews: ({ item }) => (
     <>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-800 truncate">{item.created_by}</p>
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < item.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                ))}
            </div>
        </div>
        <p className="text-sm font-medium text-slate-600 capitalize">{item.feature_used} Review</p>
        {item.feedback && <p className="text-sm text-slate-500 mt-1 italic">"{item.feedback}"</p>}
      </div>
      <p className="text-xs text-slate-400 flex-shrink-0">{format(new Date(item.created_date), 'MMM d, yyyy')}</p>
    </>
  ),
  demos: ({ item, handleDemoStatusChange }) => {
    const statusConfig = {
      pending: 'bg-amber-100 text-amber-800',
      contacted: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    };

    return (
      <>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 truncate">{item.name} at {item.company_name}</p>
          <p className="text-sm text-slate-600">{item.email}</p>
          {item.role && <p className="text-sm text-slate-500">Role: {item.role}</p>}
        </div>
        <div className="text-right flex-shrink-0 flex items-center gap-4">
          <div className="text-xs text-slate-400">{format(new Date(item.created_date), 'MMM d, yyyy')}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Badge className={`capitalize border-none ${statusConfig[item.status]}`}>{item.status}</Badge>
                <MoreVertical className="w-4 h-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDemoStatusChange(item.id, 'pending')}>
                Set as Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDemoStatusChange(item.id, 'contacted')}>
                Set as Contacted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDemoStatusChange(item.id, 'completed')}>
                Set as Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </>
    );
  },
  waitlist: ({ item }) => (
    <>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 truncate">{item.name} at {item.company_name}</p>
        <p className="text-sm text-slate-600">{item.email}</p>
        {item.role && <p className="text-sm text-slate-500">Role: {item.role}</p>}
      </div>
      <p className="text-xs text-slate-400 flex-shrink-0">{format(new Date(item.created_date), 'MMM d, yyyy')}</p>
    </>
  )
}

export default function SubmissionsManagement() {
  const [activeTab, setActiveTab] = useState(submissionTypes[0].id);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const dataPromises = submissionTypes.map(type => type.entity.list('-created_date'));
      const results = await Promise.all(dataPromises);
      const submissionsData = submissionTypes.reduce((acc, type, index) => {
        acc[type.id] = results[index];
        return acc;
      }, {});
      setSubmissions(submissionsData);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDemoStatusChange = async (id, status) => {
    try {
      await DemoRequest.update(id, { status });
      // Refresh data to show the change
      fetchData();
    } catch (error) {
      console.error("Failed to update demo request status:", error);
    }
  };

  const currentSubmissions = submissions[activeTab] || [];
  const Renderer = Renderers[activeTab];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Submissions</h1>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="border-b border-slate-200 mb-6">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {submissionTypes.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
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
          ) : currentSubmissions.length > 0 ? (
            <ul className="divide-y divide-slate-200">
              {currentSubmissions.map((item) => (
                <li key={item.id} className="p-4 flex items-start gap-4">
                  <Renderer item={item} handleDemoStatusChange={handleDemoStatusChange} />
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
