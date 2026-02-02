import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Settings, Eye, Send, Calendar, Mail, MessageSquare,
  Link2, ChevronRight, ChevronDown, GripVertical, Plus, Trash2,
  BarChart3, PieChart, LineChart, Atom, Brain, Table, FileCode,
  Loader2, Check, X, Clock, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const SECTION_TYPES = [
  { id: 'summary', label: 'Executive Summary', icon: FileText, description: 'AI-generated overview' },
  { id: 'visualization_2d', label: '2D Structures', icon: Atom, description: 'Molecular diagrams' },
  { id: 'visualization_3d', label: '3D Models', icon: Atom, description: 'Interactive 3D molecules' },
  { id: 'chart', label: 'Charts & Graphs', icon: BarChart3, description: 'Data visualizations' },
  { id: 'table', label: 'Data Tables', icon: Table, description: 'Structured data' },
  { id: 'ai_insights', label: 'AI Insights', icon: Brain, description: 'Intelligent analysis' },
  { id: 'raw_data', label: 'Raw Data', icon: FileCode, description: 'Source data export' },
  { id: 'custom_text', label: 'Custom Text', icon: FileText, description: 'Your notes' },
];

const DEFAULT_SECTIONS = [
  { id: 'sec_1', title: 'Executive Summary', type: 'summary', enabled: true, order: 0 },
  { id: 'sec_2', title: 'Risk Assessment', type: 'ai_insights', enabled: true, order: 1 },
  { id: 'sec_3', title: 'Chemical Structures', type: 'visualization_2d', enabled: true, order: 2 },
  { id: 'sec_4', title: 'Interactive 3D View', type: 'visualization_3d', enabled: true, order: 3 },
  { id: 'sec_5', title: 'Analysis Charts', type: 'chart', enabled: true, order: 4 },
];

export default function ReportBuilder({ sourceData, sourceType, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('content');
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState({
    title: `${sourceType} Report - ${new Date().toLocaleDateString()}`,
    description: '',
    report_type: sourceType || 'simulation',
    source_type: sourceType,
    sections: DEFAULT_SECTIONS,
    schedule: {
      enabled: false,
      frequency: 'weekly',
      day_of_week: 1,
      time: '09:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    delivery: {
      email_recipients: [],
      slack_channels: [],
      webhook_urls: [],
      include_pdf: true,
      include_interactive_link: true
    }
  });
  const [newEmail, setNewEmail] = useState('');
  const [newSlackChannel, setNewSlackChannel] = useState('');
  const [newWebhook, setNewWebhook] = useState('');

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(report.sections);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    
    const updatedItems = items.map((item, index) => ({ ...item, order: index }));
    setReport({ ...report, sections: updatedItems });
  };

  const toggleSection = (sectionId) => {
    setReport({
      ...report,
      sections: report.sections.map(s =>
        s.id === sectionId ? { ...s, enabled: !s.enabled } : s
      )
    });
  };

  const addSection = (type) => {
    const typeInfo = SECTION_TYPES.find(t => t.id === type);
    const newSection = {
      id: `sec_${Date.now()}`,
      title: typeInfo?.label || 'New Section',
      type,
      enabled: true,
      order: report.sections.length
    };
    setReport({ ...report, sections: [...report.sections, newSection] });
  };

  const removeSection = (sectionId) => {
    setReport({
      ...report,
      sections: report.sections.filter(s => s.id !== sectionId)
    });
  };

  const addRecipient = (type) => {
    if (type === 'email' && newEmail) {
      setReport({
        ...report,
        delivery: {
          ...report.delivery,
          email_recipients: [...report.delivery.email_recipients, newEmail]
        }
      });
      setNewEmail('');
    } else if (type === 'slack' && newSlackChannel) {
      setReport({
        ...report,
        delivery: {
          ...report.delivery,
          slack_channels: [...report.delivery.slack_channels, newSlackChannel]
        }
      });
      setNewSlackChannel('');
    } else if (type === 'webhook' && newWebhook) {
      setReport({
        ...report,
        delivery: {
          ...report.delivery,
          webhook_urls: [...report.delivery.webhook_urls, newWebhook]
        }
      });
      setNewWebhook('');
    }
  };

  const removeRecipient = (type, value) => {
    if (type === 'email') {
      setReport({
        ...report,
        delivery: {
          ...report.delivery,
          email_recipients: report.delivery.email_recipients.filter(e => e !== value)
        }
      });
    } else if (type === 'slack') {
      setReport({
        ...report,
        delivery: {
          ...report.delivery,
          slack_channels: report.delivery.slack_channels.filter(c => c !== value)
        }
      });
    } else if (type === 'webhook') {
      setReport({
        ...report,
        delivery: {
          ...report.delivery,
          webhook_urls: report.delivery.webhook_urls.filter(w => w !== value)
        }
      });
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Create the report record
      const createdReport = await base44.entities.Report.create({
        ...report,
        source_id: sourceData?.id,
        status: 'generating'
      });

      // Generate report content
      const { data } = await base44.functions.invoke('generateReport', {
        reportId: createdReport.id,
        sourceData,
        reportConfig: report
      });

      toast.success('Report generated successfully!');
      
      if (onSave) {
        onSave({ ...createdReport, ...data.data });
      }
    } catch (error) {
      toast.error('Failed to generate report: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const getSectionIcon = (type) => {
    const sectionType = SECTION_TYPES.find(t => t.id === type);
    return sectionType?.icon || FileText;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Report Builder</h2>
              <p className="text-white/80 text-sm">Create custom interactive reports</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="px-6 pt-4 bg-slate-50 border-b justify-start gap-1">
          <TabsTrigger value="content" className="gap-2">
            <FileText className="w-4 h-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2">
            <Calendar className="w-4 h-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="delivery" className="gap-2">
            <Send className="w-4 h-4" />
            Delivery
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-6">
          <TabsContent value="content" className="mt-0 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Report Title</Label>
                <Input
                  id="title"
                  value={report.title}
                  onChange={(e) => setReport({ ...report, title: e.target.value })}
                  placeholder="Enter report title..."
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={report.description}
                  onChange={(e) => setReport({ ...report, description: e.target.value })}
                  placeholder="Brief description of the report..."
                  rows={2}
                />
              </div>
            </div>

            {/* Sections */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Report Sections</Label>
                <Select onValueChange={addSection}>
                  <SelectTrigger className="w-[180px]">
                    <Plus className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Add section" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTION_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {report.sections
                        .sort((a, b) => a.order - b.order)
                        .map((section, index) => {
                          const Icon = getSectionIcon(section.type);
                          return (
                            <Draggable key={section.id} draggableId={section.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center gap-3 p-3 bg-slate-50 rounded-lg border ${
                                    snapshot.isDragging ? 'shadow-lg border-indigo-300' : 'border-slate-200'
                                  }`}
                                >
                                  <div {...provided.dragHandleProps} className="cursor-grab">
                                    <GripVertical className="w-4 h-4 text-slate-400" />
                                  </div>
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    section.enabled ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'
                                  }`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1">
                                    <Input
                                      value={section.title}
                                      onChange={(e) => {
                                        setReport({
                                          ...report,
                                          sections: report.sections.map(s =>
                                            s.id === section.id ? { ...s, title: e.target.value } : s
                                          )
                                        });
                                      }}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {SECTION_TYPES.find(t => t.id === section.type)?.label || section.type}
                                  </Badge>
                                  <Switch
                                    checked={section.enabled}
                                    onCheckedChange={() => toggleSection(section.id)}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-red-500"
                                    onClick={() => removeSection(section.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="mt-0 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    Automated Scheduling
                  </CardTitle>
                  <Switch
                    checked={report.schedule.enabled}
                    onCheckedChange={(checked) => setReport({
                      ...report,
                      schedule: { ...report.schedule, enabled: checked }
                    })}
                  />
                </div>
              </CardHeader>
              {report.schedule.enabled && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Frequency</Label>
                      <Select
                        value={report.schedule.frequency}
                        onValueChange={(value) => setReport({
                          ...report,
                          schedule: { ...report.schedule, frequency: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={report.schedule.time}
                        onChange={(e) => setReport({
                          ...report,
                          schedule: { ...report.schedule, time: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                  {report.schedule.frequency === 'weekly' && (
                    <div>
                      <Label>Day of Week</Label>
                      <Select
                        value={String(report.schedule.day_of_week)}
                        onValueChange={(value) => setReport({
                          ...report,
                          schedule: { ...report.schedule, day_of_week: parseInt(value) }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => (
                            <SelectItem key={i} value={String(i)}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {report.schedule.frequency === 'monthly' && (
                    <div>
                      <Label>Day of Month</Label>
                      <Select
                        value={String(report.schedule.day_of_month || 1)}
                        onValueChange={(value) => setReport({
                          ...report,
                          schedule: { ...report.schedule, day_of_month: parseInt(value) }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 28 }, (_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <p className="text-xs text-slate-500">
                    Timezone: {report.schedule.timezone}
                  </p>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="delivery" className="mt-0 space-y-6">
            {/* Email Recipients */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-500" />
                  Email Recipients
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter email address..."
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addRecipient('email')}
                  />
                  <Button onClick={() => addRecipient('email')} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {report.delivery.email_recipients.map((email) => (
                    <Badge key={email} variant="secondary" className="gap-1">
                      {email}
                      <button onClick={() => removeRecipient('email', email)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Slack Channels */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-500" />
                  Slack Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter channel ID (e.g., C01234567)..."
                    value={newSlackChannel}
                    onChange={(e) => setNewSlackChannel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addRecipient('slack')}
                  />
                  <Button onClick={() => addRecipient('slack')} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {report.delivery.slack_channels.map((channel) => (
                    <Badge key={channel} variant="secondary" className="gap-1">
                      #{channel}
                      <button onClick={() => removeRecipient('slack', channel)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Webhooks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-indigo-500" />
                  Webhook Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter webhook URL..."
                    value={newWebhook}
                    onChange={(e) => setNewWebhook(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addRecipient('webhook')}
                  />
                  <Button onClick={() => addRecipient('webhook')} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {report.delivery.webhook_urls.map((url) => (
                    <Badge key={url} variant="secondary" className="gap-1 max-w-xs truncate">
                      {url}
                      <button onClick={() => removeRecipient('webhook', url)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Options */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Delivery Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Include PDF Attachment</p>
                    <p className="text-xs text-slate-500">Attach a PDF version of the report</p>
                  </div>
                  <Switch
                    checked={report.delivery.include_pdf}
                    onCheckedChange={(checked) => setReport({
                      ...report,
                      delivery: { ...report.delivery, include_pdf: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Include Interactive Link</p>
                    <p className="text-xs text-slate-500">Link to interactive web version</p>
                  </div>
                  <Switch
                    checked={report.delivery.include_interactive_link}
                    onCheckedChange={(checked) => setReport({
                      ...report,
                      delivery: { ...report.delivery, include_interactive_link: checked }
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <div className="border rounded-xl p-6 bg-slate-50">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">{report.title}</h3>
                {report.description && (
                  <p className="text-slate-600 mt-1">{report.description}</p>
                )}
                <Badge className="mt-2">{report.report_type}</Badge>
              </div>
              
              <div className="space-y-4">
                {report.sections
                  .filter(s => s.enabled)
                  .sort((a, b) => a.order - b.order)
                  .map((section) => {
                    const Icon = getSectionIcon(section.type);
                    return (
                      <div key={section.id} className="bg-white rounded-lg p-4 border">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-4 h-4 text-indigo-500" />
                          <h4 className="font-semibold">{section.title}</h4>
                        </div>
                        <div className="h-20 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-sm">
                          {section.type === 'visualization_3d' ? 'Interactive 3D Model' :
                           section.type === 'chart' ? 'Dynamic Chart' :
                           section.type === 'ai_insights' ? 'AI-Generated Analysis' :
                           'Content Preview'}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Footer */}
      <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Eye className="w-4 h-4" />
            Save as Draft
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}