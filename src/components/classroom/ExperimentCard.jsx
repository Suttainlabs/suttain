import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, AlertTriangle, Clock, BookOpen, ExternalLink, FlaskConical, Shield, Star, GraduationCap, Layers, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import GradingModal from './GradingModal';

const LABEL_STYLES = {
  highly_feasible: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Highly Feasible' },
  feasible: { color: 'bg-teal-100 text-teal-700', icon: CheckCircle, label: 'Feasible' },
  marginal: { color: 'bg-amber-100 text-amber-700', icon: AlertTriangle, label: 'Marginal' },
  unlikely: { color: 'bg-orange-100 text-orange-700', icon: AlertTriangle, label: 'Unlikely' },
  not_recommended: { color: 'bg-red-100 text-red-700', icon: AlertTriangle, label: 'Not Recommended' }
};

const STATUS_STYLES = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  graded: 'bg-teal-100 text-teal-700',
  flagged: 'bg-orange-100 text-orange-700',
  rejected: 'bg-red-100 text-red-700'
};

export default function ExperimentCard({ experiment, isTeacher, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [showGrading, setShowGrading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const labelStyle = experiment.feasibility_label ? LABEL_STYLES[experiment.feasibility_label] : null;
  const LabelIcon = labelStyle?.icon;

  const updateStatus = async (newStatus) => {
    setSubmitting(true);
    try {
      await base44.entities.StudentExperiment.update(experiment.id, {
        status: newStatus,
        reviewed_date: new Date().toISOString()
      });
      onUpdate();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-bold text-slate-900 text-sm truncate">{experiment.title}</h3>
                <Badge className={`${STATUS_STYLES[experiment.status]} text-[10px]`}>{experiment.status.replace(/_/g, ' ')}</Badge>
                {experiment.grade != null && (
                  <Badge className="bg-teal-100 text-teal-700 text-[10px] font-bold">
                    <GraduationCap className="w-2.5 h-2.5 mr-0.5" /> {experiment.grade}/100
                  </Badge>
                )}
              </div>
              {experiment.module_title && (
                <p className="text-[11px] text-violet-600 font-medium flex items-center gap-1 mb-0.5">
                  <Layers className="w-2.5 h-2.5" /> {experiment.module_title}
                </p>
              )}
              <p className="text-xs text-slate-500">
                {experiment.student_name} · {experiment.submitted_date ? new Date(experiment.submitted_date).toLocaleDateString() : ''}
              </p>
            </div>
            {labelStyle && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${labelStyle.color} flex-shrink-0`}>
                <LabelIcon className="w-3 h-3" />
                <span className="text-[10px] font-bold">{labelStyle.label}</span>
                {experiment.feasibility_score != null && (
                  <span className="text-[10px] font-bold ml-1">{experiment.feasibility_score}/100</span>
                )}
              </div>
            )}
          </div>

          <p className="text-sm text-slate-600 line-clamp-2 mb-3">{experiment.hypothesis}</p>

          <div className="flex items-center gap-2 flex-wrap mb-3">
            {experiment.chemicals?.slice(0, 4).map((c, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full text-slate-600 font-medium">
                {c.name || c}
              </span>
            ))}
            {experiment.chemicals?.length > 4 && (
              <span className="text-[10px] text-slate-400">+{experiment.chemicals.length - 4} more</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setExpanded(true)} className="text-xs h-7">
              <BookOpen className="w-3 h-3 mr-1" /> View Details
            </Button>
            {isTeacher && (
              <>
                <Button size="sm" variant="outline" onClick={() => updateStatus('approved')} disabled={submitting} className="text-xs h-7 text-green-600 border-green-300 hover:bg-green-50">
                  <CheckCircle className="w-3 h-3 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus('flagged')} disabled={submitting} className="text-xs h-7 text-orange-600 border-orange-300 hover:bg-orange-50">
                  <AlertTriangle className="w-3 h-3 mr-1" /> Flag
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowGrading(true)} className="text-xs h-7 border-teal-300 text-teal-600 hover:bg-teal-50">
                  <GraduationCap className="w-3 h-3 mr-1" /> Grade
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={expanded} onOpenChange={(open) => !open && setExpanded(false)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{experiment.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Hypothesis</h4>
              <p className="text-sm text-slate-700">{experiment.hypothesis}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Chemicals</h4>
              <div className="flex flex-wrap gap-2">
                {experiment.chemicals?.map((c, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-slate-100 rounded-lg text-slate-700">
                    {c.name || c}
                    {c.concentration && ` (${c.concentration})`}
                    {c.amount && ` [${c.amount}]`}
                  </span>
                ))}
              </div>
            </div>

            {experiment.conditions && Object.values(experiment.conditions).some(v => v) && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Conditions</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  {Object.entries(experiment.conditions).filter(([, v]) => v).map(([k, v]) => (
                    <div key={k}><span className="font-medium capitalize">{k}:</span> {v}</div>
                  ))}
                </div>
              </div>
            )}

            {labelStyle && (
              <div className={`p-3 rounded-lg ${labelStyle.color}`}>
                <div className="flex items-center gap-2 mb-1">
                  <LabelIcon className="w-4 h-4" />
                  <span className="font-bold text-sm">{labelStyle.label}</span>
                  {experiment.feasibility_score != null && <span className="font-bold text-sm">· {experiment.feasibility_score}/100</span>}
                </div>
              </div>
            )}

            {experiment.feasibility_reasoning && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1"><FlaskConical className="w-3 h-3" /> Feasibility Analysis</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{experiment.feasibility_reasoning}</p>
              </div>
            )}

            {experiment.predicted_outcome && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Predicted Outcome</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{experiment.predicted_outcome}</p>
              </div>
            )}

            {experiment.safety_assessment && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> Safety Assessment</h4>
                <p className="text-sm text-amber-800 leading-relaxed">{experiment.safety_assessment}</p>
              </div>
            )}

            {experiment.citations?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Related Research & Citations</h4>
                <div className="space-y-2">
                  {experiment.citations.map((cit, i) => (
                    <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-sm font-medium text-slate-800">{cit.title}</p>
                      {cit.authors && <p className="text-xs text-slate-500">{cit.authors}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        {cit.source && <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 rounded text-slate-600">{cit.source}</span>}
                        {cit.url && (
                          <a href={cit.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-violet-600 hover:underline flex items-center gap-0.5">
                            <ExternalLink className="w-2.5 h-2.5" /> View
                          </a>
                        )}
                      </div>
                      {cit.relevance && <p className="text-xs text-slate-500 mt-1 italic">{cit.relevance}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {experiment.similar_experiments?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Similar Experiments</h4>
                <div className="space-y-2">
                  {experiment.similar_experiments.map((sim, i) => (
                    <div key={i} className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-slate-700">{sim.description}</p>
                      {sim.outcome && <p className="text-xs text-slate-500 mt-0.5"><span className="font-medium">Outcome:</span> {sim.outcome}</p>}
                      {sim.source && <p className="text-[10px] text-slate-400 mt-0.5">Source: {sim.source}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {experiment.teacher_feedback && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Teacher Feedback</h4>
                <p className="text-sm text-teal-800">{experiment.teacher_feedback}</p>
                {experiment.teacher_rating > 0 && (
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={`w-3 h-3 ${n <= experiment.teacher_rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Grading Modal */}
      <GradingModal
        experiment={experiment}
        isOpen={showGrading}
        onClose={() => setShowGrading(false)}
        onGraded={onUpdate}
      />
    </>
  );
}

function Sparkles({ className }) {
  return <span className={className}>✦</span>;
}