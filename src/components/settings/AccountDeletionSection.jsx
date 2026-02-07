import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, Loader2, ShieldAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteAccount } from '@/functions/deleteAccount';
import { base44 } from '@/api/base44Client';

export default function AccountDeletionSection({ user }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(1);
  const [confirmText, setConfirmText] = useState('');
  const [acknowledgements, setAcknowledgements] = useState({
    dataLoss: false,
    noRecovery: false,
    understand: false
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const CONFIRM_PHRASE = 'DELETE MY ACCOUNT';
  const allAcknowledged = acknowledgements.dataLoss && acknowledgements.noRecovery && acknowledgements.understand;
  const canProceedStep1 = allAcknowledged;
  const canProceedStep2 = confirmText === CONFIRM_PHRASE;

  const handleOpenDialog = () => {
    setShowDeleteDialog(true);
    setConfirmationStep(1);
    setConfirmText('');
    setAcknowledgements({ dataLoss: false, noRecovery: false, understand: false });
    setError(null);
  };

  const handleCloseDialog = () => {
    setShowDeleteDialog(false);
    setConfirmationStep(1);
    setConfirmText('');
    setAcknowledgements({ dataLoss: false, noRecovery: false, understand: false });
    setError(null);
  };

  const handleDeleteAccount = async () => {
    if (!canProceedStep2) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await deleteAccount({});
      
      if (response.data?.success) {
        // Logout and redirect to home
        await base44.auth.logout('/');
      } else {
        setError(response.data?.error || 'Failed to delete account. Please try again.');
      }
    } catch (err) {
      console.error('Account deletion error:', err);
      setError('An unexpected error occurred. Please contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="border-red-200 bg-red-50/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-800">Danger Zone</CardTitle>
              <CardDescription className="text-red-600">
                Irreversible and destructive actions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-lg border border-red-200">
            <div>
              <h4 className="font-semibold text-slate-900">Delete Account</h4>
              <p className="text-sm text-slate-600 mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleOpenDialog}
              className="flex-shrink-0"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-red-800">Delete Your Account</DialogTitle>
                <DialogDescription>
                  Step {confirmationStep} of 2
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {confirmationStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">What will be deleted:</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Your profile and personal information</li>
                    <li>• All saved simulations and formulas</li>
                    <li>• Safety profiles and alert history</li>
                    <li>• Reward points and achievements</li>
                    <li>• Team memberships and shared data</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="dataLoss"
                      checked={acknowledgements.dataLoss}
                      onCheckedChange={(checked) => 
                        setAcknowledgements(prev => ({ ...prev, dataLoss: checked }))
                      }
                    />
                    <Label htmlFor="dataLoss" className="text-sm leading-tight cursor-pointer">
                      I understand all my data will be permanently deleted
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="noRecovery"
                      checked={acknowledgements.noRecovery}
                      onCheckedChange={(checked) => 
                        setAcknowledgements(prev => ({ ...prev, noRecovery: checked }))
                      }
                    />
                    <Label htmlFor="noRecovery" className="text-sm leading-tight cursor-pointer">
                      I understand this action cannot be undone or recovered
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="understand"
                      checked={acknowledgements.understand}
                      onCheckedChange={(checked) => 
                        setAcknowledgements(prev => ({ ...prev, understand: checked }))
                      }
                    />
                    <Label htmlFor="understand" className="text-sm leading-tight cursor-pointer">
                      I have exported any data I need to keep
                    </Label>
                  </div>
                </div>
              </motion.div>
            )}

            {confirmationStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    To confirm deletion, please type <strong>{CONFIRM_PHRASE}</strong> below:
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmText">Confirmation</Label>
                  <Input
                    id="confirmText"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                    placeholder={CONFIRM_PHRASE}
                    className="font-mono"
                    autoComplete="off"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            
            {confirmationStep === 1 ? (
              <Button
                variant="destructive"
                onClick={() => setConfirmationStep(2)}
                disabled={!canProceedStep1}
                className="w-full sm:w-auto"
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={!canProceedStep2 || isDeleting}
                className="w-full sm:w-auto"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Permanently Delete
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}