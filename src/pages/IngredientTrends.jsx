import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Leaf, FlaskConical, BarChart3, Eye, Sparkles, ArrowUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function IngredientTrends() {
  const [aggregatedData, setAggregatedData] = useState({
    topIngredients: [],
    concernIngredients: [],
    sustainableAlternatives: [],
    categoryBreakdown: [],
    statusDistribution: []
  });

  const { data: complianceChecks = [], isLoading: loadingCompliance } = useQuery({
    queryKey: ['complianceChecks'],
    queryFn: async () => {
      const result = await base44.entities.ComplianceCheck.list('-created_date', 100);
      return result || [];
    }
  });

  const { data: scannedProducts = [], isLoading: loadingScans } = useQuery({
    queryKey: ['barcodeHistory'],
    queryFn: async () => {
      const result = await base44.entities.BarcodeHistory.list('-created_date', 100);
      return result || [];
    }
  });

  useEffect(() => {
    if (complianceChecks.length > 0 || scannedProducts.length > 0) {
      analyzeIngredients();
    }
  }, [complianceChecks, scannedProducts]);

  const analyzeIngredients = () => {
    const ingredientFrequency = {};
    const ingredientConcerns = {};
    const categoryCount = {};
    const statusCount = { Compliant: 0, Restricted: 0, Banned: 0, 'Requires Warning': 0, Unknown: 0 };

    // Analyze compliance checks
    complianceChecks.forEach(check => {
      if (check.product_category) {
        categoryCount[check.product_category] = (categoryCount[check.product_category] || 0) + 1;
      }

      check.ingredients?.forEach(ingredient => {
        ingredientFrequency[ingredient] = (ingredientFrequency[ingredient] || 0) + 1;
      });

      check.compliance_details?.forEach(detail => {
        if (detail.status && detail.status !== 'Compliant') {
          ingredientConcerns[detail.ingredient] = {
            count: (ingredientConcerns[detail.ingredient]?.count || 0) + 1,
            status: detail.status,
            details: detail.details
          };
        }
        if (detail.status) {
          statusCount[detail.status] = (statusCount[detail.status] || 0) + 1;
        }
      });
    });

    // Top ingredients
    const topIngredients = Object.entries(ingredientFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, count]) => ({ name, count }));

    // Concern ingredients
    const concernIngredients = Object.entries(ingredientConcerns)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([name, data]) => ({ name, count: data.count, status: data.status, details: data.details }));

    // Sustainable alternatives (ingredients that appear frequently and are compliant)
    const sustainableAlternatives = Object.entries(ingredientFrequency)
      .filter(([ingredient]) => {
        const hasConcerns = ingredientConcerns[ingredient];
        return !hasConcerns;
      })
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Category breakdown
    const categoryBreakdown = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([category, count]) => ({ category, count }));

    // Status distribution
    const statusDistribution = Object.entries(statusCount)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({ status, count }));

    setAggregatedData({
      topIngredients,
      concernIngredients,
      sustainableAlternatives,
      categoryBreakdown,
      statusDistribution
    });
  };

  const COLORS = ['#9531F5', '#02988C', '#09D2FF', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899'];

  const statusColors = {
    Compliant: '#10b981',
    Restricted: '#f59e0b',
    Banned: '#ef4444',
    'Requires Warning': '#eab308',
    Unknown: '#64748b'
  };

  const isLoading = loadingCompliance || loadingScans;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Ingredient Trends</h1>
                  <p className="text-white/90">Analyze common ingredients, emerging concerns, and sustainable alternatives</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Analyzing ingredient data...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">Total Products</p>
                      <p className="text-3xl font-bold text-slate-900">{complianceChecks.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Eye className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">Unique Ingredients</p>
                      <p className="text-3xl font-bold text-slate-900">{aggregatedData.topIngredients.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                      <FlaskConical className="w-6 h-6 text-teal-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">Concerns Identified</p>
                      <p className="text-3xl font-bold text-slate-900">{aggregatedData.concernIngredients.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">Safe Alternatives</p>
                      <p className="text-3xl font-bold text-slate-900">{aggregatedData.sustainableAlternatives.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Leaf className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Content */}
            <Tabs defaultValue="trending" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white shadow-md">
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="concerns">Concerns</TabsTrigger>
                <TabsTrigger value="sustainable">Sustainable</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Trending Ingredients */}
              <TabsContent value="trending">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle>Top Trending Ingredients</CardTitle>
                          <CardDescription>Most commonly used ingredients across analyzed products</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={aggregatedData.topIngredients}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} fontSize={12} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#9531F5" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {aggregatedData.topIngredients.slice(0, 6).map((ingredient, index) => (
                          <div key={index} className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-slate-900 text-sm">{ingredient.name}</h4>
                              <Badge className="bg-purple-600 text-white">#{index + 1}</Badge>
                            </div>
                            <p className="text-2xl font-bold text-purple-700">{ingredient.count}</p>
                            <p className="text-xs text-slate-600">products contain this</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Emerging Concerns */}
              <TabsContent value="concerns">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <CardTitle>Emerging Concerns</CardTitle>
                          <CardDescription>Ingredients with regulatory restrictions or warnings</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {aggregatedData.concernIngredients.length === 0 ? (
                        <div className="text-center py-12">
                          <Sparkles className="w-12 h-12 text-green-500 mx-auto mb-3" />
                          <p className="text-lg font-semibold text-slate-900">Great News!</p>
                          <p className="text-slate-600">No major concerns identified in analyzed ingredients</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {aggregatedData.concernIngredients.map((ingredient, index) => (
                            <div key={index} className="p-5 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-l-4 border-red-500">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-bold text-slate-900">{ingredient.name}</h4>
                                    <Badge className={`${
                                      ingredient.status === 'Banned' ? 'bg-red-500' :
                                      ingredient.status === 'Restricted' ? 'bg-amber-500' :
                                      'bg-yellow-500'
                                    } text-white`}>
                                      {ingredient.status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-slate-700 mb-2">{ingredient.details}</p>
                                  <p className="text-xs text-slate-600">Found in <span className="font-semibold">{ingredient.count}</span> analyzed products</p>
                                </div>
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                  <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Sustainable Alternatives */}
              <TabsContent value="sustainable">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Leaf className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle>Popular Sustainable Alternatives</CardTitle>
                          <CardDescription>Safe and widely-used compliant ingredients</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aggregatedData.sustainableAlternatives.map((ingredient, index) => (
                          <div key={index} className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Leaf className="w-5 h-5 text-green-600" />
                                  <h4 className="font-bold text-slate-900">{ingredient.name}</h4>
                                </div>
                                <Badge className="bg-green-600 text-white">Compliant</Badge>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-700">{ingredient.count}</p>
                                <p className="text-xs text-green-600">products</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-green-700">
                              <ArrowUp className="w-4 h-4" />
                              <span>Popular choice</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Analytics */}
              <TabsContent value="analytics">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {/* Status Distribution */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle>Compliance Status Distribution</CardTitle>
                          <CardDescription>Breakdown of ingredient compliance status</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={aggregatedData.statusDistribution}
                            dataKey="count"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                          >
                            {aggregatedData.statusDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={statusColors[entry.status] || COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Category Breakdown */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div>
                          <CardTitle>Product Categories</CardTitle>
                          <CardDescription>Distribution across product types</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={aggregatedData.categoryBreakdown}
                            dataKey="count"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                          >
                            {aggregatedData.categoryBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}