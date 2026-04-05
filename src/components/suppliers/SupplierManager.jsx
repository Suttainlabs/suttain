import React, { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import AuthContext from '../auth/AuthContext';
import { Plus, Edit2, Trash2, Building2, Loader2 } from 'lucide-react';

export default function SupplierManager() {
  const { user } = useContext(AuthContext);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    region: 'Global',
    min_order_quantity: '',
    lead_time_days: '',
    certifications: ''
  });

  const loadSuppliers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await base44.entities.Supplier.list('-created_date');
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.contact_email) {
      alert('Name and email are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        certifications: formData.certifications ? formData.certifications.split(',').map(c => c.trim()) : [],
        lead_time_days: formData.lead_time_days ? parseInt(formData.lead_time_days) : null
      };

      if (editing) {
        await base44.entities.Supplier.update(editing.id, payload);
        setSuppliers(prev => prev.map(s => s.id === editing.id ? { ...s, ...payload } : s));
      } else {
        const newSupplier = await base44.entities.Supplier.create(payload);
        setSuppliers(prev => [newSupplier, ...prev]);
      }

      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Failed to save supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (supplierId) => {
    if (!confirm('Delete this supplier?')) return;
    try {
      await base44.entities.Supplier.delete(supplierId);
      setSuppliers(prev => prev.filter(s => s.id !== supplierId));
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact_email: '',
      contact_phone: '',
      website: '',
      region: 'Global',
      min_order_quantity: '',
      lead_time_days: '',
      certifications: ''
    });
    setEditing(null);
  };

  const startEdit = (supplier) => {
    setEditing(supplier);
    setFormData({
      ...supplier,
      certifications: Array.isArray(supplier.certifications) ? supplier.certifications.join(', ') : ''
    });
    setIsOpen(true);
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Ingredient Suppliers
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <Input
                placeholder="Supplier Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                placeholder="Email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
              <Input
                placeholder="Phone (optional)"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
              <Input
                placeholder="Website (optional)"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
              <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="North America">North America</SelectItem>
                  <SelectItem value="Europe">Europe</SelectItem>
                  <SelectItem value="Asia">Asia</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Global">Global</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Min Order (e.g., 25kg)"
                value={formData.min_order_quantity}
                onChange={(e) => setFormData({ ...formData, min_order_quantity: e.target.value })}
              />
              <Input
                placeholder="Lead Time (days)"
                type="number"
                value={formData.lead_time_days}
                onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })}
              />
              <Input
                placeholder="Certifications (ISO, Organic, Fair Trade, etc. - comma separated)"
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
              />
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : suppliers.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No suppliers added yet. Start by adding your first supplier.</p>
        ) : (
          <div className="space-y-2">
            {suppliers.map(supplier => (
              <div key={supplier.id} className="p-3 border border-slate-200 rounded-lg flex items-start justify-between hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{supplier.name}</p>
                  <p className="text-xs text-slate-500">{supplier.contact_email}</p>
                  {supplier.region && <p className="text-xs text-slate-600 mt-1">{supplier.region} | Lead time: {supplier.lead_time_days || 'N/A'} days</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => startEdit(supplier)} className="h-8 w-8">
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(supplier.id)} className="h-8 w-8">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}