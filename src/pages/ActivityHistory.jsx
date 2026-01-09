import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  History, Search, ArrowLeft, Loader2, AlertTriangle,
  Sparkles, Zap, QrCode, Clock, FileText
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AuthContext from '../components/auth/AuthContext';
import AuthGate from '../components/auth/AuthGate';

const activityConfig = {
  formula: {
    icon: Sparkles,
    color: 'bg-purple-100 text-purple-600',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    label: 'Formula'
  },
  simulation: {
    icon: Zap,
    color: 'bg-blue-100 text-blue-600',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    label: 'Simulation'
  },
  scan: {
    icon: QrCode,
    color: 'bg-teal-100 text-teal-600',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    label: 'Scan'
  }
};

const formatProductType = (type) => {
  if (!type) return null;
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const ActivityItem = ({ item, onClick }) => {
  const config = activityConfig[item.type] || { icon: FileText, color: 'bg-slate-100 text-slate-600', badgeColor: 'bg-slate-50 text-slate-700 border-slate-200', label: 'Activity' };
  const Icon = config.icon;
  let title, subtitle;

  switch (item.type) {
    case 'formula':
      title = item.name || 'Unnamed Formula';
      subtitle = formatProductType(item.product_type);
      break;
    case 'simulation':
      title = 'Chemical Simulation';
      subtitle = item.chemicals?.slice(0, 3).join(', ') + (item.chemicals?.length > 3 ? '...' : '');
      break;
    case 'scan':
      title = item.product_name || 'Product Scan';
      subtitle = item.barcode;
      break;
    default:
      title = 'Activity';
      subtitle = '';
  }

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-medium ${config.badgeColor}`}>
                {config.label}
              </Badge>
            </div>
            <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{title}</p>
            {subtitle && (
              <p className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>
            )}
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(item.created_date), { addSuffix: true })}
              <span className="mx-1">•</span>
              {format(new Date(item.created_date), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ActivityHistory() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadAllActivity();
    }
  }, [user]);

  const loadAllActivity = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [formulas, simulations, scans] = await Promise.all([
        base44.entities.Formula.list('-created_date', 50),
        base44.entities.Simulation.list('-created_date', 50),
        base44.entities.BarcodeHistory.list('-created_date', 50)
      ]);

      const allActivity = [
        ...formulas.map(f => ({ ...f, type: 'formula' })),
        ...simulations.map(s => ({ ...s, type: 'simulation' })),
        ...scans.map(s => ({ ...s, type: 'scan' }))
      ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

      setActivity(allActivity);
    } catch (err) {
      console.error('Failed to load activity:', err);
      setError('Failed to load your activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (item) => {
    switch (item.type) {
      case 'formula':
        navigate(createPageUrl('generator'), { state: { formulaToLoad: item } });
        break;
      case 'simulation':
        navigate(createPageUrl('Simulator'));
        break;
      case 'scan':
        navigate(createPageUrl('BarcodeScanner'));
        break;
    }
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 bg-slate-50">
        <AuthGate
          featureName="Activity History"
          featureDescription="Please log in to view your activity history."
        />
      </div>
    );
  }

  const filteredActivity = activity.filter(item => {
    const matchesFilter = filterType === 'all' || item.type === filterType;
    if (!matchesFilter) return false;
    
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    switch (item.type) {
      case 'formula':
        return item.name?.toLowerCase().includes(term);
      case 'simulation':
        return item.chemicals?.some(c => c.toLowerCase().includes(term));
      case 'scan':
        return item.product_name?.toLowerCase().includes(term) || item.barcode?.includes(term);
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl('Profile'))}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
                <History className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                Activity History
              </h1>
              <p className="text-slate-600 text-sm">
                View all your formulas, simulations, and scans
              </p>
            </motion.div>
          </div>

          {/* Search */}
          <Card className="mb-4 shadow-sm">
            <CardContent className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search activity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Filter Tabs */}
          <Tabs value={filterType} onValueChange={setFilterType} className="mb-4">
            <TabsList className="w-full grid grid-cols-4 h-auto p-1">
              <TabsTrigger value="all" className="text-xs py-2">All</TabsTrigger>
              <TabsTrigger value="formula" className="text-xs py-2">
                <Sparkles className="w-3 h-3 mr-1" />
                Formulas
              </TabsTrigger>
              <TabsTrigger value="simulation" className="text-xs py-2">
                <Zap className="w-3 h-3 mr-1" />
                Sims
              </TabsTrigger>
              <TabsTrigger value="scan" className="text-xs py-2">
                <QrCode className="w-3 h-3 mr-1" />
                Scans
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Loading */}
          {isLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-600">Loading activity...</p>
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {error && !isLoading && (
            <Card className="border-rose-200">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
                <p className="text-rose-700 mb-4">{error}</p>
                <Button onClick={loadAllActivity} variant="outline">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Activity List */}
          {!isLoading && !error && (
            <div className="space-y-3">
              {filteredActivity.length > 0 ? (
                filteredActivity.map((item, index) => (
                  <motion.div
                    key={`${item.type}-${item.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <ActivityItem item={item} onClick={() => handleItemClick(item)} />
                  </motion.div>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 mb-2">
                      No Activity Found
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {searchTerm || filterType !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Start using the tools to see your activity here'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}