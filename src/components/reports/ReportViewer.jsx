import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, Share2, Send, Printer, Calendar, Clock,
  BarChart3, PieChart, Brain, Atom, Table, ChevronDown, ChevronRight,
  Loader2, Check, AlertTriangle, Sparkles, ExternalLink, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart as RechartsPie, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const ChemicalVisualization = lazy(() => import('../simulator/ChemicalVisualization'));

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

export default function ReportViewer({ report, onClose }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [isDelivering, setIsDelivering] = useState(false);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleDeliver = async () => {
    setIsDelivering(true);
    try {
      const { data } = await base44.functions.invoke('deliverReport', {
        reportId: report.id
      });
      
      const successCount = [
        ...data.results.email.filter(r => r.status === 'sent'),
        ...data.results.slack.filter(r => r.status === 'sent'),
        ...data.results.webhook.filter(r => r.status === 'sent')
      ].length;
      
      toast.success(`Report delivered to ${successCount} recipient(s)`);
    } catch (error) {
      toast.error('Failed to deliver report: ' + error.message);
    } finally {
      setIsDelivering(false);
    }
  };

  const renderChart = (chart) => {
    if (!chart || !chart.data) return null;

    switch (chart.type) {
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={chart.data}>
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  const renderSection = (section) => {
    const isExpanded = expandedSections[section.id] !== false;

    return (
      <Card key={section.id} className="overflow-hidden">
        <CardHeader
          className="cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => toggleSection(section.id)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              {getSectionIcon(section.type)}
              {section.title}
            </CardTitle>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0">
            {renderSectionContent(section)}
          </CardContent>
        )}
      </Card>
    );
  };

  const getSectionIcon = (type) => {
    const icons = {
      summary: <FileText className="w-4 h-4 text-indigo-500" />,
      ai_insights: <Brain className="w-4 h-4 text-purple-500" />,
      visualization_2d: <Atom className="w-4 h-4 text-cyan-500" />,
      visualization_3d: <Atom className="w-4 h-4 text-cyan-500" />,
      chart: <BarChart3 className="w-4 h-4 text-green-500" />,
      table: <Table className="w-4 h-4 text-orange-500" />,
    };
    return icons[type] || <FileText className="w-4 h-4 text-slate-500" />;
  };

  const renderSectionContent = (section) => {
    switch (section.type) {
      case 'summary':
        return (
          <div className="prose prose-sm max-w-none">
            <p className="text-slate-700 leading-relaxed">
              {report.ai_insights?.executive_summary || 'Executive summary will be generated...'}
            </p>
          </div>
        );

      case 'ai_insights':
        const insights = report.ai_insights || {};
        return (
          <div className="space-y-4">
            {/* Key Findings */}
            {insights.key_findings?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Key Findings
                </h4>
                <ul className="space-y-2">
                  {insights.key_findings.map((finding, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {insights.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ChevronRight className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Assessment */}
            {insights.risk_assessment && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-sm mb-2 text-amber-800">Risk Assessment</h4>
                <p className="text-sm text-amber-700">{insights.risk_assessment}</p>
              </div>
            )}
          </div>
        );

      case 'visualization_3d':
        return (
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          }>
            <ChemicalVisualization data={report.visualization_data} />
          </Suspense>
        );

      case 'chart':
        const charts = report.visualization_data?.charts || [];
        return (
          <div className="space-y-6">
            {charts.map((chart, i) => (
              <div key={i}>
                <h4 className="font-semibold text-sm mb-3">{chart.title}</h4>
                {renderChart(chart)}
              </div>
            ))}
          </div>
        );

      default:
        return (
          <p className="text-sm text-slate-500">Content for this section type is not yet implemented.</p>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{report.title}</h2>
            <div className="flex items-center gap-3 mt-1 text-white/80 text-sm">
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {report.report_type}
              </Badge>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(report.metadata?.generated_at || report.created_date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(report.metadata?.generated_at || report.created_date).toLocaleTimeString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Download className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Printer className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {report.sections
          ?.filter(s => s.enabled)
          .sort((a, b) => a.order - b.order)
          .map(renderSection)}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between">
        <div className="text-sm text-slate-500">
          {report.delivery?.email_recipients?.length > 0 && (
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {report.delivery.email_recipients.length} recipient(s) configured
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={handleDeliver}
            disabled={isDelivering}
            className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600"
          >
            {isDelivering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Delivering...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Deliver Report
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}