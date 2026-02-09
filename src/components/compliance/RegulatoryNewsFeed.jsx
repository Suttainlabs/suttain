import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Newspaper, Bell, BellOff, Filter, ExternalLink, Clock, 
  AlertTriangle, CheckCircle2, Info, Globe, ChevronDown, 
  ChevronUp, Bookmark, BookmarkCheck, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';

const REGIONS = [
  { id: 'usa', name: 'USA', flag: '🇺🇸' },
  { id: 'eu', name: 'EU', flag: '🇪🇺' },
  { id: 'canada', name: 'Canada', flag: '🇨🇦' },
  { id: 'asia', name: 'Asia Pacific', flag: '🌏' },
  { id: 'global', name: 'Global', flag: '🌐' },
];

const REGULATION_TYPES = [
  { id: 'cosmetics', name: 'Cosmetics' },
  { id: 'chemicals', name: 'Chemicals' },
  { id: 'food', name: 'Food & Beverage' },
  { id: 'environmental', name: 'Environmental' },
  { id: 'labeling', name: 'Labeling' },
];

const MOCK_NEWS = [
  {
    id: '1',
    title: 'FDA Announces New Cosmetics Safety Requirements Under MoCRA',
    summary: 'The FDA has released final guidance on facility registration and product listing requirements under the Modernization of Cosmetics Regulation Act.',
    region: 'usa',
    type: 'cosmetics',
    severity: 'critical',
    source: 'FDA',
    url: 'https://www.fda.gov',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'EU REACH: New Restrictions on PFAS in Consumer Products',
    summary: 'The European Chemicals Agency proposes comprehensive restrictions on per- and polyfluoroalkyl substances (PFAS) affecting cosmetics and cleaning products.',
    region: 'eu',
    type: 'chemicals',
    severity: 'warning',
    source: 'ECHA',
    url: 'https://echa.europa.eu',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'California Prop 65: 12 New Chemicals Added to Warning List',
    summary: 'California OEHHA adds twelve new chemicals to the Proposition 65 list, including several commonly used preservatives in cosmetic formulations.',
    region: 'usa',
    type: 'labeling',
    severity: 'warning',
    source: 'CA OEHHA',
    url: 'https://oehha.ca.gov',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Health Canada Updates Cosmetic Ingredient Hotlist',
    summary: 'Health Canada revises the Cosmetic Ingredient Hotlist with updated restrictions on 15 ingredients and new prohibitions on 3 substances.',
    region: 'canada',
    type: 'cosmetics',
    severity: 'info',
    source: 'Health Canada',
    url: 'https://www.canada.ca',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'China NMPA Issues New Cosmetics Safety Assessment Guidelines',
    summary: 'National Medical Products Administration releases updated safety assessment requirements for imported cosmetics effective Q2 2025.',
    region: 'asia',
    type: 'cosmetics',
    severity: 'info',
    source: 'NMPA',
    url: 'https://www.nmpa.gov.cn',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    title: 'GHS Revision 10: Global Harmonization Updates for 2025',
    summary: 'The UN releases the 10th revision of GHS with updated classification criteria and labeling requirements for chemical products.',
    region: 'global',
    type: 'chemicals',
    severity: 'info',
    source: 'UN',
    url: 'https://unece.org/ghs',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const severityConfig = {
  critical: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle, iconColor: 'text-red-600' },
  warning: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-600' },
  info: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Info, iconColor: 'text-blue-600' },
};

const RegulatoryNewsFeed = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState({});
  const queryClient = useQueryClient();

  // Fetch user preferences
  const { data: user } = useQuery({
    queryKey: ['user-news-prefs'],
    queryFn: async () => {
      const u = await base44.auth.me();
      if (u?.news_preferences) {
        setSavedArticles(u.news_preferences.saved_articles || []);
        setNotificationsEnabled(u.news_preferences.notifications || {});
      }
      return u;
    }
  });

  // Simulate fetching news (in production, this would be an API call)
  const { data: newsItems = MOCK_NEWS, isLoading, refetch } = useQuery({
    queryKey: ['regulatory-news'],
    queryFn: async () => {
      // In production, fetch from a real API
      return MOCK_NEWS;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const savePreferencesMutation = useMutation({
    mutationFn: async (prefs) => {
      await base44.auth.updateMe({ news_preferences: prefs });
    }
  });

  const toggleRegion = (regionId) => {
    setSelectedRegions(prev => 
      prev.includes(regionId) ? prev.filter(r => r !== regionId) : [...prev, regionId]
    );
  };

  const toggleType = (typeId) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]
    );
  };

  const toggleSaveArticle = async (articleId) => {
    const newSaved = savedArticles.includes(articleId) 
      ? savedArticles.filter(id => id !== articleId)
      : [...savedArticles, articleId];
    setSavedArticles(newSaved);
    await savePreferencesMutation.mutateAsync({
      saved_articles: newSaved,
      notifications: notificationsEnabled
    });
  };

  const toggleNotification = async (key) => {
    const newNotifs = { ...notificationsEnabled, [key]: !notificationsEnabled[key] };
    setNotificationsEnabled(newNotifs);
    await savePreferencesMutation.mutateAsync({
      saved_articles: savedArticles,
      notifications: newNotifs
    });
  };

  const filteredNews = newsItems.filter(item => {
    if (selectedRegions.length > 0 && !selectedRegions.includes(item.region)) return false;
    if (selectedTypes.length > 0 && !selectedTypes.includes(item.type)) return false;
    return true;
  });

  const criticalCount = filteredNews.filter(n => n.severity === 'critical').length;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader 
        className="border-b bg-gradient-to-r from-indigo-50 to-purple-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                Regulatory News Feed
                {criticalCount > 0 && (
                  <Badge className="bg-red-500 text-white text-xs">{criticalCount} Critical</Badge>
                )}
              </CardTitle>
              <p className="text-xs text-slate-500">Real-time regulatory updates from global sources</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); refetch(); }}
              className="text-slate-500"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <CardContent className="p-4">
              {/* Filter Toggle & Notification Settings */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  size="sm"
                  variant={showFilters ? 'secondary' : 'outline'}
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-xs"
                >
                  <Filter className="w-3 h-3 mr-1" />
                  Filters {(selectedRegions.length + selectedTypes.length) > 0 && `(${selectedRegions.length + selectedTypes.length})`}
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={notificationsEnabled.critical ? 'default' : 'outline'}
                    onClick={() => toggleNotification('critical')}
                    className={`text-xs ${notificationsEnabled.critical ? 'bg-red-500 hover:bg-red-600' : ''}`}
                  >
                    {notificationsEnabled.critical ? <Bell className="w-3 h-3 mr-1" /> : <BellOff className="w-3 h-3 mr-1" />}
                    Critical Alerts
                  </Button>
                </div>
              </div>

              {/* Filters Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-2">Region</p>
                        <div className="flex flex-wrap gap-1.5">
                          {REGIONS.map(region => (
                            <Badge
                              key={region.id}
                              onClick={() => toggleRegion(region.id)}
                              className={`cursor-pointer text-xs ${
                                selectedRegions.includes(region.id)
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {region.flag} {region.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-2">Regulation Type</p>
                        <div className="flex flex-wrap gap-1.5">
                          {REGULATION_TYPES.map(type => (
                            <Badge
                              key={type.id}
                              onClick={() => toggleType(type.id)}
                              className={`cursor-pointer text-xs ${
                                selectedTypes.includes(type.id)
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {type.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* News Items */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredNews.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No news matching your filters</p>
                  </div>
                ) : (
                  filteredNews.map((item, index) => {
                    const severity = severityConfig[item.severity];
                    const SeverityIcon = severity.icon;
                    const region = REGIONS.find(r => r.id === item.region);
                    const isSaved = savedArticles.includes(item.id);

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3 rounded-lg border-2 ${
                          item.severity === 'critical' ? 'border-red-200 bg-red-50/50' : 'border-slate-200 bg-white'
                        } hover:shadow-md transition-all`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            item.severity === 'critical' ? 'bg-red-100' : 
                            item.severity === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                          }`}>
                            <SeverityIcon className={`w-4 h-4 ${severity.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-sm text-slate-900 leading-tight">{item.title}</h4>
                              <button
                                onClick={() => toggleSaveArticle(item.id)}
                                className="flex-shrink-0 p-1 hover:bg-slate-100 rounded"
                              >
                                {isSaved ? (
                                  <BookmarkCheck className="w-4 h-4 text-indigo-600" />
                                ) : (
                                  <Bookmark className="w-4 h-4 text-slate-400" />
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.summary}</p>
                            <div className="flex items-center flex-wrap gap-2 mt-2">
                              <Badge className={`text-[10px] border ${severity.color}`}>
                                {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">
                                {region?.flag} {region?.name}
                              </Badge>
                              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                              </span>
                              <span className="text-[10px] text-slate-400">• {item.source}</span>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-indigo-600 hover:underline flex items-center gap-0.5 ml-auto"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Read More <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Showing {filteredNews.length} of {newsItems.length} updates
                </p>
                <Button size="sm" variant="link" className="text-xs text-indigo-600 p-0 h-auto">
                  View All Updates →
                </Button>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default RegulatoryNewsFeed;