import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText, Plus, Search, Filter, Calendar, Clock, Send,
  MoreVertical, Eye, Trash2, Copy, Download, Loader2,
  CheckCircle, AlertCircle, Clock4, FileWarning
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import ReportBuilder from './ReportBuilder';
import ReportViewer from './ReportViewer';

const STATUS_CONFIG = {
  draft: { label: 'Draft', icon: FileText, color: 'bg-slate-100 text-slate-700' },
  generating: { label: 'Generating', icon: Loader2, color: 'bg-blue-100 text-blue-700', spin: true },
  completed: { label: 'Completed', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  failed: { label: 'Failed', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
  scheduled: { label: 'Scheduled', icon: Clock4, color: 'bg-purple-100 text-purple-700' },
};

export default function ReportsDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports', filterType, filterStatus],
    queryFn: async () => {
      const query = {};
      if (filterType !== 'all') query.report_type = filterType;
      if (filterStatus !== 'all') query.status = filterStatus;
      return base44.entities.Report.filter(query, '-created_date');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Report.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      toast.success('Report deleted');
    }
  });

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowViewer(true);
  };

  const handleDeleteReport = (id) => {
    if (confirm('Are you sure you want to delete this report?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleReportSaved = (report) => {
    setShowBuilder(false);
    queryClient.invalidateQueries(['reports']);
    setSelectedReport(report);
    setShowViewer(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
          <p className="text-slate-600">Create and manage custom reports with AI insights</p>
        </div>
        <Button
          onClick={() => setShowBuilder(true)}
          className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600"
        >
          <Plus className="w-4 h-4" />
          New Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="simulation">Simulation</SelectItem>
            <SelectItem value="formula">Formula</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
            <SelectItem value="sustainability">Sustainability</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filteredReports.length === 0 ? (
        <Card className="p-12 text-center">
          <FileWarning className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">No Reports Found</h3>
          <p className="text-slate-500 mb-4">Create your first report to get started</p>
          <Button onClick={() => setShowBuilder(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Report
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredReports.map((report) => {
              const statusConfig = STATUS_CONFIG[report.status] || STATUS_CONFIG.draft;
              const StatusIcon = statusConfig.icon;
              
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="flex-1"
                          onClick={() => handleViewReport(report)}
                        >
                          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {report.title}
                          </h3>
                          <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                            {report.description || 'No description'}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewReport(report)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteReport(report.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">{report.report_type}</Badge>
                        <Badge className={`${statusConfig.color} gap-1`}>
                          <StatusIcon className={`w-3 h-3 ${statusConfig.spin ? 'animate-spin' : ''}`} />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(report.created_date).toLocaleDateString()}
                        </span>
                        {report.schedule?.enabled && (
                          <span className="flex items-center gap-1 text-purple-600">
                            <Clock className="w-3 h-3" />
                            {report.schedule.frequency}
                          </span>
                        )}
                        {report.delivery?.email_recipients?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Send className="w-3 h-3" />
                            {report.delivery.email_recipients.length}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Report Builder Modal */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-4xl p-0">
          <ReportBuilder
            onClose={() => setShowBuilder(false)}
            onSave={handleReportSaved}
          />
        </DialogContent>
      </Dialog>

      {/* Report Viewer Modal */}
      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent className="max-w-4xl p-0">
          {selectedReport && (
            <ReportViewer
              report={selectedReport}
              onClose={() => setShowViewer(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}