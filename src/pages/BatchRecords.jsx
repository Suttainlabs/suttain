import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Boxes, Search, Calendar, AlertTriangle, CheckCircle, Clock, FileText, Trash2, Loader2 } from 'lucide-react';

const STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-600',
  in_production: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  quarantined: 'bg-amber-100 text-amber-700',
  expired: 'bg-red-100 text-red-700',
};

export default function BatchRecords() {
  const { toast } = useToast();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.BatchRecord.list('-created_date', 100);
      setBatches(data);
    } catch (error) {
      console.error('Failed to load batches:', error);
      toast({ title: 'Load failed', description: 'Could not load batch records.', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this batch record?')) return;
    try {
      await base44.entities.BatchRecord.delete(id);
      setBatches((prev) => prev.filter((b) => b.id !== id));
      toast({ title: 'Batch deleted' });
    } catch (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await base44.entities.BatchRecord.update(id, { status: newStatus });
      setBatches((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
    } catch (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    }
  };

  // Check for expiring batches (within 30 days)
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const getExpirationStatus = (batch) => {
    if (!batch.expiration_date) return null;
    const expDate = new Date(batch.expiration_date);
    if (expDate < now) return { type: 'expired', label: 'Expired', color: 'bg-red-100 text-red-700' };
    if (expDate < thirtyDays) return { type: 'expiring', label: 'Expiring soon', color: 'bg-amber-100 text-amber-700' };
    return { type: 'valid', label: 'Valid', color: 'bg-emerald-100 text-emerald-700' };
  };

  const filtered = batches.filter((b) =>
    !search ||
    (b.batch_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.batch_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.formula_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <div className="content-container space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Boxes className="w-6 h-6 text-teal-600" /> Batch Records
            </h1>
            <p className="text-sm text-slate-500 mt-1">Track all formula batches with traceability, compliance, and expiration status</p>
          </div>
          <Button size="sm" variant="outline" className="text-xs" onClick={loadBatches}>
            <Clock className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by batch number, name, or formula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-slate-200">
            <CardContent className="p-3">
              <p className="text-xs text-slate-500">Total Batches</p>
              <p className="text-2xl font-bold text-slate-800">{batches.length}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-3">
              <p className="text-xs text-slate-500">Completed</p>
              <p className="text-2xl font-bold text-emerald-600">{batches.filter((b) => b.status === 'completed').length}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-3">
              <p className="text-xs text-slate-500">In Production</p>
              <p className="text-2xl font-bold text-blue-600">{batches.filter((b) => b.status === 'in_production').length}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-3">
              <p className="text-xs text-slate-500">Expiring / Expired</p>
              <p className="text-2xl font-bold text-amber-600">
                {batches.filter((b) => {
                  const s = getExpirationStatus(b);
                  return s && (s.type === 'expired' || s.type === 'expiring');
                }).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Batch List */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="p-8 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">No batch records found</p>
              <p className="text-xs text-slate-400 mt-1">Generate a formula and create a batch from the Formula Builder's Batch tab.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((batch) => {
              const expStatus = getExpirationStatus(batch);
              const risk = batch.compliance_data?.overall_risk || 'unknown';
              const riskColor = risk === 'low' ? 'bg-emerald-100 text-emerald-700' : risk === 'medium' ? 'bg-amber-100 text-amber-700' : risk === 'high' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600';

              return (
                <Card key={batch.id} className="border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-800 text-sm">{batch.batch_number}</p>
                          <Badge className={`text-[10px] ${STATUS_COLORS[batch.status] || 'bg-slate-100 text-slate-600'}`}>{batch.status}</Badge>
                          {expStatus && (
                            <Badge className={`text-[10px] ${expStatus.color}`}>{expStatus.label}</Badge>
                          )}
                          <Badge className={`text-[10px] ${riskColor}`}>Risk: {risk}</Badge>
                        </div>
                        <p className="text-sm text-slate-700 mt-1">{batch.batch_name}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Created: {new Date(batch.created_date).toLocaleDateString()}
                          </span>
                          <span>Size: {batch.batch_size} {batch.batch_unit}</span>
                          {batch.expiration_date && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Expires: {new Date(batch.expiration_date).toLocaleDateString()}
                            </span>
                          )}
                          <span>Shelf life: {batch.predicted_shelf_life_months || '?'}mo</span>
                          {batch.total_batch_cost != null && (
                            <span className="font-medium text-teal-700">${batch.total_batch_cost.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <select
                          value={batch.status}
                          onChange={(e) => handleStatusChange(batch.id, e.target.value)}
                          className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white"
                        >
                          <option value="draft">Draft</option>
                          <option value="in_production">In Production</option>
                          <option value="completed">Completed</option>
                          <option value="quarantined">Quarantined</option>
                          <option value="expired">Expired</option>
                        </select>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700" onClick={() => handleDelete(batch.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Lot alerts */}
                    {batch.ingredient_lots?.some((lot) => {
                      if (!lot.expiration_date) return false;
                      return new Date(lot.expiration_date) < thirtyDays;
                    }) && (
                      <div className="mt-2 p-2 rounded-md bg-amber-50 border border-amber-200 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <p className="text-xs text-amber-700">One or more ingredient lots are expiring within 30 days</p>
                      </div>
                    )}

                    {/* Concentration warnings */}
                    {batch.concentration_warnings?.length > 0 && (
                      <div className="mt-2 p-2 rounded-md bg-red-50 border border-red-200">
                        <p className="text-xs font-semibold text-red-700 mb-1">Concentration Warnings:</p>
                        {batch.concentration_warnings.map((w, i) => (
                          <p key={i} className="text-xs text-red-600">• {w.ingredient}: {w.warning}</p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}