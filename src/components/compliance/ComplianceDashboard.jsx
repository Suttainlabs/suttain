import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, PlusCircle, Bell, FileText, CheckCircle2, AlertTriangle, Sparkles, BookOpen, Video, Eye, Download, Settings, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, subDays, subMonths, isAfter, startOfDay } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ComplianceFilters from './ComplianceFilters';
import RegulatoryNewsFeed from './RegulatoryNewsFeed';

const ComplianceDashboard = ({ onNewCheck, onViewCheck, onSettings }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    regulations: [],
    hazardLevels: [],
    ingredientTypes: [],
    dateRange: 'all',
    searchText: ''
  });

  const { data: checks = [], isLoading } = useQuery({
    queryKey: ['complianceChecks'],
    queryFn: async () => {
      const result = await base44.entities.ComplianceCheck.list('-created_date', 50);
      return result || [];
    }
  });

  const handleFilterChange = useCallback((filters) => {
    setActiveFilters(filters);
  }, []);

  // Filter the checks based on active filters
  const filteredChecks = checks.filter(check => {
    // Search text filter
    if (activeFilters.searchText) {
      const searchLower = activeFilters.searchText.toLowerCase();
      const matchesSearch = 
        check.product_name?.toLowerCase().includes(searchLower) ||
        check.product_brand?.toLowerCase().includes(searchLower) ||
        check.ingredients?.some(ing => ing.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Date range filter
    if (activeFilters.dateRange !== 'all') {
      const checkDate = new Date(check.created_date);
      const now = new Date();
      let cutoffDate;
      
      switch (activeFilters.dateRange) {
        case 'today':
          cutoffDate = startOfDay(now);
          break;
        case 'week':
          cutoffDate = subDays(now, 7);
          break;
        case 'month':
          cutoffDate = subDays(now, 30);
          break;
        case 'quarter':
          cutoffDate = subMonths(now, 3);
          break;
        default:
          cutoffDate = null;
      }
      
      if (cutoffDate && !isAfter(checkDate, cutoffDate)) return false;
    }

    // Hazard level filter
    if (activeFilters.hazardLevels.length > 0) {
      const checkStatus = getStatusBadge(check.compliance_details);
      if (!activeFilters.hazardLevels.includes(checkStatus)) return false;
    }

    // Regulations filter (check if any selected regulation is in the checked regions)
    if (activeFilters.regulations.length > 0) {
      const checkRegions = check.checked_regions || [];
      const regionsStr = checkRegions.join(' ').toLowerCase();
      const matchesRegulation = activeFilters.regulations.some(reg => {
        const regLower = reg.toLowerCase();
        return regionsStr.includes(regLower) || 
               checkRegions.some(r => r.toLowerCase().includes(regLower));
      });
      if (!matchesRegulation) return false;
    }

    return true;
  });

  const stats = [
    { label: 'Compliance Score', value: '98%', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Checks', value: filteredChecks.length.toString(), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Reviews', value: '0', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const getStatusBadge = (complianceDetails) => {
    if (!complianceDetails || complianceDetails.length === 0) return 'Unknown';
    const hasBanned = complianceDetails.some(d => d.status === 'Banned');
    const hasRestricted = complianceDetails.some(d => d.status === 'Restricted');
    const hasWarning = complianceDetails.some(d => d.status === 'Requires Warning');
    
    if (hasBanned) return 'Banned';
    if (hasRestricted) return 'Restricted';
    if (hasWarning) return 'Warning';
    return 'Compliant';
  };

  const statusColors = {
    'Compliant': 'bg-green-100 text-green-700 border-green-200',
    'Restricted': 'bg-amber-100 text-amber-700 border-amber-200',
    'Banned': 'bg-red-100 text-red-700 border-red-200',
    'Warning': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Unknown': 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const handleDownloadReport = async (check) => {
    const reportContent = `
COMPLIANCE ANALYSIS REPORT
Product: ${check.product_name}
Brand: ${check.product_brand || 'N/A'}
Category: ${check.product_category || 'N/A'}
Date: ${format(new Date(check.created_date), 'MMMM dd, yyyy')}

SUMMARY:
${check.summary}

CHECKED REGIONS:
${check.checked_regions?.join(', ') || 'N/A'}

INGREDIENTS ANALYZED:
${check.ingredients?.join(', ') || 'N/A'}

DETAILED ANALYSIS:
${check.compliance_details?.map((detail, idx) => `
${idx + 1}. ${detail.ingredient}
   Status: ${detail.status}
   Details: ${detail.details}
   Recommendation: ${detail.recommendation}
`).join('\n')}

---
Generated by Suttain AI Compliance Co-Pilot
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${check.product_name.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-8 rounded-2xl bg-gradient-to-r from-[#02988C] to-[#09D2FF] p-6 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
            >
              <ShieldCheck className="w-6 h-6 text-[#02988C]" />
            </motion.div>
            <div className="text-white">
              <h1 className="text-xl md:text-2xl font-bold mb-1">AI Compliance Co-Pilot</h1>
              <p className="text-sm text-white/90">Ensure your products meet global regulatory standards</p>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-2"
          >
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className={`bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm ${showFilters ? 'ring-2 ring-white/50' : ''}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button
              onClick={onSettings}
              variant="outline"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              onClick={onNewCheck}
              size="default"
              className="bg-white text-[#02988C] hover:bg-white/95 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Start New Check
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Filters Section */}
      {showFilters && (
        <ComplianceFilters 
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index + 0.4 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900">Active Projects</CardTitle>
                    <CardDescription className="text-sm">Track your compliance checks in progress</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-slate-500 mt-4">Loading checks...</p>
                </div>
              ) : filteredChecks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Active Projects</h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    Start your first compliance check to track and manage your product formulas
                  </p>
                  <Button 
                    onClick={onNewCheck}
                    className="bg-gradient-to-r from-[#02988C] to-[#09D2FF] hover:opacity-90 text-white shadow-lg hover:shadow-xl"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Your First Check
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredChecks.slice(0, 10).map((check) => (
                    <motion.div
                      key={check.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border-2 border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 truncate mb-1">{check.product_name}</h4>
                          {check.product_brand && (
                            <p className="text-sm text-slate-600 mb-2">{check.product_brand}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge className={`text-xs border ${statusColors[getStatusBadge(check.compliance_details)]}`}>
                              {getStatusBadge(check.compliance_details)}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {check.ingredients?.length || 0} ingredients
                            </span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-500">
                              {format(new Date(check.created_date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {check.checked_regions?.slice(0, 3).map((region, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {region}
                              </Badge>
                            ))}
                            {check.checked_regions?.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{check.checked_regions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewCheck && onViewCheck(check)}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadReport(check)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Report
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
            <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900">Notifications</CardTitle>
                  <CardDescription className="text-sm">Recent alerts & updates</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-8 h-8 text-amber-400" />
                </div>
                <p className="text-sm text-slate-600 font-medium mb-2">All Caught Up!</p>
                <p className="text-xs text-slate-500">No new notifications at the moment</p>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">Pro Tip</p>
                    <p className="text-xs text-slate-600">
                      Use Clara, our AI assistant, to get instant answers about compliance regulations!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Regulatory News Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6"
      >
        <RegulatoryNewsFeed />
      </motion.div>

      {/* Quick Resources Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6"
      >
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <Link to={createPageUrl('ComplianceGuide')} className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all cursor-pointer group block">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Documentation</h3>
                    <p className="text-sm text-slate-700 mb-4">
                      Learn about global compliance regulations and how to use the Co-Pilot effectively
                    </p>
                    <Button variant="outline" className="bg-white hover:bg-slate-50 text-slate-900 border-slate-300">
                      View Docs
                    </Button>
                  </div>
                </div>
              </Link>

              <Link to={createPageUrl('LearningSuite')} className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all cursor-pointer group block">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Video Tutorial</h3>
                    <p className="text-sm text-slate-700 mb-4">
                      Watch step-by-step tutorials on checking compliance and understanding results
                    </p>
                    <Button variant="outline" className="bg-white hover:bg-slate-50 text-slate-900 border-slate-300">
                      Watch Now
                    </Button>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ComplianceDashboard;