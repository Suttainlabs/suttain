import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit2, Trash2, Clock, AlertCircle, CheckCircle, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const statusColors = {
  new: 'bg-blue-100 text-blue-700',
  open: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-amber-100 text-amber-700',
  waiting: 'bg-purple-100 text-purple-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-slate-200 text-slate-600',
};

const priorityColors = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const categoryOptions = ['billing', 'technical', 'feature_request', 'bug', 'general', 'other'];
const statusOptions = ['new', 'open', 'in_progress', 'waiting', 'resolved', 'closed'];
const priorityOptions = ['low', 'medium', 'high', 'urgent'];

export default function CustomerSupportCRM() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' or 'tasks'
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    customer_email: '',
    customer_name: '',
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    status: 'new',
    assigned_to: '',
  });

  // Fetch tickets
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date', 100),
  });

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['support-tasks'],
    queryFn: () => base44.entities.SupportTask.list('-created_date', 100),
  });

  // Create/Update ticket
  const ticketMutation = useMutation({
    mutationFn: (data) => 
      editingId 
        ? base44.entities.SupportTicket.update(editingId, data)
        : base44.entities.SupportTicket.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      resetForm();
    },
  });

  // Delete ticket
  const deleteTicketMutation = useMutation({
    mutationFn: (id) => base44.entities.SupportTicket.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setSelectedTicket(null);
    },
  });

  // Update ticket status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.SupportTicket.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['support-tickets'] }),
  });

  const resetForm = () => {
    setFormData({
      customer_email: '',
      customer_name: '',
      title: '',
      description: '',
      priority: 'medium',
      category: 'general',
      status: 'new',
      assigned_to: '',
    });
    setEditingId(null);
    setShowNewTicketForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    ticketMutation.mutate(formData);
  };

  const handleEdit = (ticket) => {
    setFormData(ticket);
    setEditingId(ticket.id);
    setShowNewTicketForm(true);
  };

  // Filter tickets
  const filteredTickets = tickets.filter(t => {
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Filter tasks for selected ticket
  const ticketTasks = selectedTicket ? tasks.filter(t => t.ticket_id === selectedTicket.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customer Support CRM</h1>
          <p className="text-slate-500 mt-1">Manage support tickets and assign tasks to your team</p>
        </div>
        {activeTab === 'tickets' && (
          <Button onClick={() => setShowNewTicketForm(!showNewTicketForm)} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" /> New Ticket
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'tickets'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Support Tickets
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'tasks'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Team Tasks
        </button>
      </div>

      {activeTab === 'tickets' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-2 space-y-4">
            {showNewTicketForm && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">{editingId ? 'Edit Ticket' : 'New Support Ticket'}</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Customer Email" type="email" value={formData.customer_email} onChange={e => setFormData({...formData, customer_email: e.target.value})} />
                    <Input placeholder="Customer Name" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} />
                  </div>
                  <Input placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  <textarea placeholder="Description" rows="4" className="w-full border border-slate-300 rounded px-3 py-2 text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  <div className="grid grid-cols-3 gap-3">
                    <select className="border border-slate-300 rounded px-2 py-2 text-sm" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                      {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select className="border border-slate-300 rounded px-2 py-2 text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="border border-slate-300 rounded px-2 py-2 text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <Input placeholder="Assign to (email)" value={formData.assigned_to} onChange={e => setFormData({...formData, assigned_to: e.target.value})} />
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={ticketMutation.isPending}>
                      {ticketMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {editingId ? 'Update' : 'Create'} Ticket
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Search & Filter */}
            <div className="flex gap-2">
              <Input placeholder="Search by title or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1" />
              <select className="border border-slate-300 rounded px-3 py-2 text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Tickets */}
            {ticketsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.length === 0 ? (
                  <Card><CardContent className="py-8 text-center text-slate-500">No tickets found</CardContent></Card>
                ) : (
                  filteredTickets.map(ticket => (
                    <motion.div key={ticket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 border border-slate-200 rounded-lg cursor-pointer transition-all ${selectedTicket?.id === ticket.id ? 'bg-teal-50 border-teal-300' : 'hover:bg-slate-50'}`} onClick={() => setSelectedTicket(ticket)}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{ticket.title}</h4>
                          <p className="text-xs text-slate-500">{ticket.customer_name} • {ticket.customer_email}</p>
                        </div>
                        <div className="flex gap-1">
                          <Badge className={statusColors[ticket.status]}>{ticket.status}</Badge>
                          <Badge className={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{ticket.description}</p>
                      <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                        <span>{ticket.assigned_to || 'Unassigned'}</span>
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(ticket); }} className="text-teal-600 hover:text-teal-800"><Edit2 className="w-3 h-3" /></button>
                          <button onClick={(e) => { e.stopPropagation(); deleteTicketMutation.mutate(ticket.id); }} className="text-red-600 hover:text-red-800"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Ticket Details & Tasks */}
          {selectedTicket && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 h-fit sticky top-6">
              <div>
                <h3 className="font-semibold text-slate-900">{selectedTicket.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{selectedTicket.description}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Status:</span><select className="border border-slate-300 rounded px-2 py-1 text-xs" value={selectedTicket.status} onChange={(e) => updateStatusMutation.mutate({ id: selectedTicket.id, status: e.target.value })}>{statusOptions.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div className="flex justify-between"><span className="text-slate-500">Priority:</span><span className="font-medium">{selectedTicket.priority}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Category:</span><span className="font-medium">{selectedTicket.category}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Assigned to:</span><span className="font-medium">{selectedTicket.assigned_to || 'Unassigned'}</span></div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Team Tasks</h4>
                <div className="space-y-2">
                  {ticketTasks.map(task => (
                    <div key={task.id} className="p-2 bg-slate-50 rounded border border-slate-200 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-slate-900">{task.title}</span>
                        <Badge className={task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>{task.status}</Badge>
                      </div>
                      <p className="text-slate-600 mt-1">{task.assigned_to}</p>
                    </div>
                  ))}
                  {ticketTasks.length === 0 && <p className="text-slate-500 text-xs">No tasks yet</p>}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {tasksLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map(task => (
                <Card key={task.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{task.title}</CardTitle>
                    <p className="text-xs text-slate-500">{task.ticket_id}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>{task.status}</Badge>
                      <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{task.assigned_to}</p>
                    {task.due_date && <p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {task.due_date}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}