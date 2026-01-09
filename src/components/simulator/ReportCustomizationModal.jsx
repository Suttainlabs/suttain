import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileText, Loader2 } from 'lucide-react';

export default function ReportCustomizationModal({ 
  isOpen, 
  onClose, 
  onGenerate, 
  isGenerating,
  persona 
}) {
  const [sections, setSections] = useState({
    experimentDetails: true,
    riskAssessment: true,
    safetyProtocols: true,
    experimentalConditions: true,
    reactionDetails: true,
    supervisorApproval: persona === 'researcher' || persona === 'teacher'
  });
  
  const [template, setTemplate] = useState('professional');
  const [customNotes, setCustomNotes] = useState('');
  const [includeDisclaimer, setIncludeDisclaimer] = useState(true);

  const templates = [
    { 
      id: 'professional', 
      name: 'Professional Report', 
      description: 'Formal scientific layout with detailed sections' 
    },
    { 
      id: 'summary', 
      name: 'Executive Summary', 
      description: 'Condensed format focusing on key findings' 
    },
    { 
      id: 'educational', 
      name: 'Educational Format', 
      description: 'Student-friendly layout with explanations' 
    }
  ];

  const handleSectionToggle = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleGenerate = () => {
    onGenerate({
      sections,
      template,
      customNotes: customNotes.trim() || null,
      includeDisclaimer
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5 text-[var(--suttain-teal)]" />
            Customize Your Lab Report
          </DialogTitle>
          <DialogDescription>
            Select which sections to include and choose a template for your report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Report Template</Label>
            <RadioGroup value={template} onValueChange={setTemplate}>
              <div className="space-y-3">
                {templates.map((temp) => (
                  <div 
                    key={temp.id}
                    className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      template === temp.id 
                        ? 'border-[var(--suttain-teal)] bg-teal-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setTemplate(temp.id)}
                  >
                    <RadioGroupItem value={temp.id} id={temp.id} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={temp.id} className="font-semibold cursor-pointer">
                        {temp.name}
                      </Label>
                      <p className="text-sm text-slate-600 mt-1">{temp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Sections to Include */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Sections to Include</Label>
            <div className="space-y-3">
              {[
                { id: 'experimentDetails', label: 'Experiment Details', description: 'Title, chemicals, and analyst information' },
                { id: 'riskAssessment', label: 'Risk Assessment', description: 'Safety scores and overall risk evaluation' },
                { id: 'safetyProtocols', label: 'Safety Protocols', description: 'PPE requirements and emergency equipment' },
                { id: 'experimentalConditions', label: 'Experimental Conditions', description: 'Temperature, pressure, and time parameters' },
                { id: 'reactionDetails', label: 'Reaction Details', description: 'Equations and reaction mechanisms' },
                { id: 'supervisorApproval', label: 'Supervisor Approval', description: 'Signature and approval section' }
              ].map((section) => (
                <div 
                  key={section.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50"
                >
                  <Checkbox
                    id={section.id}
                    checked={sections[section.id]}
                    onCheckedChange={() => handleSectionToggle(section.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor={section.id} className="font-medium cursor-pointer">
                      {section.label}
                    </Label>
                    <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Notes */}
          <div>
            <Label htmlFor="notes" className="text-base font-semibold mb-2 block">
              Custom Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Add any additional comments, observations, or special instructions..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Disclaimer Toggle */}
          <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <Checkbox
              id="disclaimer"
              checked={includeDisclaimer}
              onCheckedChange={setIncludeDisclaimer}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="disclaimer" className="font-medium cursor-pointer">
                Include Safety Disclaimer
              </Label>
              <p className="text-xs text-slate-600 mt-1">
                Adds a disclaimer stating that this is a simulation and professional verification is recommended
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-gradient-to-r from-[var(--suttain-teal)] to-[var(--suttain-blue)] text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}