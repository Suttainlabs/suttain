import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { Loader2, DollarSign, Leaf } from 'lucide-react';

export default function SupplierLinkModal({ isOpen, onClose, ingredientName, onSave }) {
  const [suppliers, setSuppliers] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newLink, setNewLink] = useState({
    supplier_id: '',
    supplier_sku: '',
    price_per_unit: '',
    unit_of_measure: 'kg',
    sourcing_method: 'unknown',
    sustainability_rating: 50
  });

  useEffect(() => {
    if (isOpen) loadData();
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [suppliersList, linksList] = await Promise.all([
        base44.entities.Supplier.list(),
        base44.entities.IngredientSupplier.filter({ ingredient_name: ingredientName })
      ]);
      setSuppliers(suppliersList);
      setLinks(linksList);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!newLink.supplier_id || !newLink.price_per_unit) {
      alert('Please select a supplier and enter a price');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ingredient_name: ingredientName,
        ...newLink,
        price_per_unit: parseFloat(newLink.price_per_unit),
        sustainability_rating: parseInt(newLink.sustainability_rating),
        last_updated: new Date().toISOString()
      };

      const created = await base44.entities.IngredientSupplier.create(payload);
      setLinks(prev => [created, ...prev]);
      setNewLink({
        supplier_id: '',
        supplier_sku: '',
        price_per_unit: '',
        unit_of_measure: 'kg',
        sourcing_method: 'unknown',
        sustainability_rating: 50
      });

      if (onSave) onSave(created);
    } catch (error) {
      console.error('Error adding supplier link:', error);
      alert('Failed to add supplier link');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (linkId) => {
    if (!confirm('Remove this supplier link?')) return;
    try {
      await base44.entities.IngredientSupplier.delete(linkId);
      setLinks(prev => prev.filter(l => l.id !== linkId));
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || 'Unknown Supplier';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Supplier Links: {ingredientName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Existing Links */}
            {links.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">Current Suppliers:</p>
                {links.map(link => (
                  <div key={link.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{getSupplierName(link.supplier_id)}</p>
                        <p className="text-xs text-slate-600">SKU: {link.supplier_sku || 'N/A'}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(link.id)}
                        className="text-red-600 hover:text-red-700 h-8"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-600" />
                        <span>${link.price_per_unit}/{link.unit_of_measure}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-teal-600" />
                        <span>{link.sustainability_rating}/100</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Link */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <p className="text-sm font-semibold text-slate-700">Add New Supplier:</p>
              
              <Select value={newLink.supplier_id} onValueChange={(value) => setNewLink({ ...newLink, supplier_id: value })}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select supplier..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="SKU/Product Code"
                size="sm"
                value={newLink.supplier_sku}
                onChange={(e) => setNewLink({ ...newLink, supplier_sku: e.target.value })}
                className="text-sm"
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Price"
                  type="number"
                  step="0.01"
                  value={newLink.price_per_unit}
                  onChange={(e) => setNewLink({ ...newLink, price_per_unit: e.target.value })}
                  className="text-sm"
                />
                <Select value={newLink.unit_of_measure} onValueChange={(value) => setNewLink({ ...newLink, unit_of_measure: value })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Sustainability Rating: {newLink.sustainability_rating}/100</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newLink.sustainability_rating}
                  onChange={(e) => setNewLink({ ...newLink, sustainability_rating: e.target.value })}
                  className="w-full"
                />
              </div>

              <Select value={newLink.sourcing_method} onValueChange={(value) => setNewLink({ ...newLink, sourcing_method: value })}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="synthetic">Synthetic</SelectItem>
                  <SelectItem value="natural">Natural</SelectItem>
                  <SelectItem value="organic">Organic</SelectItem>
                  <SelectItem value="wild-harvested">Wild-Harvested</SelectItem>
                  <SelectItem value="lab-grown">Lab-Grown</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleAddLink} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Add Supplier Link
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}