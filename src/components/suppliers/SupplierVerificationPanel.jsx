import React, { useState, useEffect, useContext } from 'react';
import { base44 } from '@/api/base44Client';
import { inviteSupplierVerification } from '@/functions/inviteSupplierVerification';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  CheckCircle, Clock, XCircle, AlertCircle, Send, Plus, Loader2,
  ChevronDown, ChevronUp, FileText, Trash2, ShieldCheck, UserCheck
} from 'lucide-react';
import { format } from 'date-fns';
import AuthContext from '../auth/AuthContext';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',    icon: Clock,         className: 'bg-amber-100 text-amber-700' },
  submitted: { label: 'Submitted',  icon: CheckCircle,   className: 'bg-blue-100 text-blue-700' },
  validated: { label: 'Validated',  icon: ShieldCheck,   className: 'bg-green-100 text-green-700' },
  rejected:  { label: 'Rejected',   icon: XCircle,       className: 'bg-red-100 text-red-700' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.className}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
}

function VerificationCard({ verification, onStatusChange, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white hover:bg-slate-50 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-slate-800 text-sm">{verification.supplier_name || verification.supplier_email}</span>
            <StatusBadge status={verification.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{verification.supplier_email} · {verification.ingredients_to_verify?.length || 0} ingredients</p>
          {verification.created_date && (
            <p className="text-xs text-slate-400">Invited {format(new Date(verification.created_date), 'MMM d, yyyy')}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {verification.status === 'submitted' && (
            <>
              <Button size="sm" variant="ghost" onClick={() => onStatusChange(verification.id, 'validated')}
                className="text-green-600 hover:bg-green-50 text-xs h-7 px-2">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Validate
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onStatusChange(verification.id, 'rejected')}
                className="text-red-500 hover:bg-red-50 text-xs h-7 px-2">
                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
              </Button>
            </>
          )}
          {verification.status === 'submitted' && (
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(verification.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Expanded submitted data */}
      {expanded && verification.submitted_data && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Supplier Submission</p>
          <div className="grid gap-2">
            {Object.entries(verification.submitted_data).map(([ingredient, data]) => (
              <div key={ingredient} className="bg-white rounded-lg p-3 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 text-sm">{ingredient}</span>
                  {data.confirmed && <UserCheck className="w-4 h-4 text-green-500" />}
                </div>
                {data.grade && <p className="text-xs text-slate-500 mt-1">Grade: {data.grade}</p>}
                {data.origin && <p className="text-xs text-slate-500">Origin: {data.origin}</p>}
                {data.notes && <p className="text-xs text-slate-500 italic mt-1">{data.notes}</p>}
              </div>
            ))}
          </div>
          {verification.supplier_notes && (
            <div className="bg-white rounded-lg p-3 border border-slate-100">
              <p className="text-xs font-medium text-slate-600 mb-1">Supplier Notes</p>
              <p className="text-sm text-slate-700">{verification.supplier_notes}</p>
            </div>
          )}
          {verification.document_urls?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Uploaded Documents ({verification.document_urls.length})</p>
              <div className="space-y-1">
                {verification.document_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                    <FileText className="w-3.5 h-3.5" /> Document {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SupplierVerificationPanel({ formula }) {
  const { user } = useContext(AuthContext);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [sending, setSending] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    supplierName: '',
    supplierEmail: '',
    selectedIngredients: [],
  });

  const formulaIngredients = (formula?.ingredients || []).map(i => i.chemical_name).filter(Boolean);

  const loadVerifications = async () => {
    if (!formula?.id) return;
    setLoading(true);
    try {
      const data = await base44.entities.SupplierVerification.filter({ formula_id: formula.id });
      setVerifications(data);
    } catch (e) {
      console.error('Failed to load verifications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVerifications(); }, [formula?.id]);

  const toggleIngredient = (ing) => {
    setInviteForm(prev => ({
      ...prev,
      selectedIngredients: prev.selectedIngredients.includes(ing)
        ? prev.selectedIngredients.filter(i => i !== ing)
        : [...prev.selectedIngredients, ing]
    }));
  };

  const handleSendInvite = async () => {
    if (!inviteForm.supplierEmail) { alert('Supplier email is required'); return; }
    if (inviteForm.selectedIngredients.length === 0) { alert('Select at least one ingredient to verify'); return; }

    setSending(true);
    try {
      // Generate a unique token
      const token = crypto.randomUUID().replace(/-/g, '');
      const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

      // Create verification record
      const record = await base44.entities.SupplierVerification.create({
        formula_id: formula.id,
        formula_name: formula.name,
        supplier_name: inviteForm.supplierName,
        supplier_email: inviteForm.supplierEmail,
        ingredients_to_verify: inviteForm.selectedIngredients,
        status: 'pending',
        token,
        invited_by: user.email,
        expires_at: expiresAt,
      });

      // Send invitation email
      await inviteSupplierVerification({
        verificationId: record.id,
        supplierEmail: inviteForm.supplierEmail,
        supplierName: inviteForm.supplierName,
        formulaName: formula.name,
        ingredients: inviteForm.selectedIngredients,
        token,
      });

      setShowInviteDialog(false);
      setInviteForm({ supplierName: '', supplierEmail: '', selectedIngredients: [] });
      loadVerifications();
    } catch (e) {
      console.error('Failed to send invite:', e);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    await base44.entities.SupplierVerification.update(id, { status });
    loadVerifications();
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this verification request?')) return;
    await base44.entities.SupplierVerification.delete(id);
    loadVerifications();
  };

  const pendingCount = verifications.filter(v => v.status === 'pending').length;
  const submittedCount = verifications.filter(v => v.status === 'submitted').length;
  const validatedCount = verifications.filter(v => v.status === 'validated').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-500" />
            Supplier Verification
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Invite suppliers to verify ingredient data & submit documentation</p>
        </div>
        <Button size="sm" onClick={() => setShowInviteDialog(true)}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
          <Plus className="w-4 h-4 mr-1" /> Invite Supplier
        </Button>
      </div>

      {/* Summary stats */}
      {verifications.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Pending', count: pendingCount, color: 'text-amber-600 bg-amber-50' },
            { label: 'Awaiting Review', count: submittedCount, color: 'text-blue-600 bg-blue-50' },
            { label: 'Validated', count: validatedCount, color: 'text-green-600 bg-green-50' },
          ].map(s => (
            <div key={s.label} className={`rounded-lg p-2 text-center ${s.color}`}>
              <p className="text-lg font-bold">{s.count}</p>
              <p className="text-xs font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : verifications.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
          <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 font-medium">No verifications yet</p>
          <p className="text-xs text-slate-400 mt-1">Invite a supplier to verify ingredient data for this formula</p>
        </div>
      ) : (
        <div className="space-y-3">
          {verifications.map(v => (
            <VerificationCard
              key={v.id}
              verification={v}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-teal-500" />
              Invite Supplier to Verify Ingredients
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Supplier Name</label>
                <Input
                  placeholder="Company name"
                  value={inviteForm.supplierName}
                  onChange={e => setInviteForm(prev => ({ ...prev, supplierName: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Supplier Email *</label>
                <Input
                  type="email"
                  placeholder="supplier@company.com"
                  value={inviteForm.supplierEmail}
                  onChange={e => setInviteForm(prev => ({ ...prev, supplierEmail: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-2">
                Select Ingredients to Verify * ({inviteForm.selectedIngredients.length} selected)
              </label>
              {formulaIngredients.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No ingredients found in this formula.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {formulaIngredients.map(ing => (
                    <label key={ing} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                      inviteForm.selectedIngredients.includes(ing)
                        ? 'border-teal-400 bg-teal-50 text-teal-800'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}>
                      <input
                        type="checkbox"
                        checked={inviteForm.selectedIngredients.includes(ing)}
                        onChange={() => toggleIngredient(ing)}
                        className="accent-teal-500 w-3.5 h-3.5"
                      />
                      <span className="truncate">{ing}</span>
                    </label>
                  ))}
                </div>
              )}
              <button
                className="text-xs text-teal-600 hover:underline mt-2"
                onClick={() => setInviteForm(prev => ({
                  ...prev,
                  selectedIngredients: prev.selectedIngredients.length === formulaIngredients.length ? [] : [...formulaIngredients]
                }))}
              >
                {inviteForm.selectedIngredients.length === formulaIngredients.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
              The supplier will receive a secure link to confirm ingredient data and upload Certificates of Analysis, Safety Data Sheets, and other documentation. The link expires in 14 days.
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSendInvite} disabled={sending} className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}