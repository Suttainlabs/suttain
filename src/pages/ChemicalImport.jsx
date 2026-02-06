import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ChemicalImportWizard from '../components/import/ChemicalImportWizard';
import AuthGate from '../components/auth/AuthGate';

export default function ChemicalImportPage() {
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(true);

  const handleClose = () => {
    setShowWizard(false);
    navigate(createPageUrl('Home'));
  };

  const handleImportComplete = (results) => {
    console.log('Import complete:', results);
  };

  return (
    <AuthGate featureName="Chemical Import">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Dialog open={showWizard} onOpenChange={setShowWizard}>
            <DialogContent className="max-w-4xl p-0">
              <ChemicalImportWizard 
                onClose={handleClose}
                onImportComplete={handleImportComplete}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AuthGate>
  );
}