import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { Copy, Check, Link, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareSimulationModal({ isOpen, onClose, simulationData, chemicals, persona }) {
    const [title, setTitle] = useState(
        chemicals?.length ? `${chemicals.map(c => c.name || c.scientific_name).join(' + ')} Analysis` : 'Simulation Results'
    );
    const [notes, setNotes] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [shareLink, setShareLink] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        setIsSharing(true);
        try {
            const shareToken = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
            const record = await base44.entities.SharedSimulation.create({
                simulation_id: shareToken,
                title,
                description: notes,
                share_type: 'private_link',
                share_link: shareToken,
                simulation_data: simulationData,
                allow_comments: true,
                view_count: 0,
            });

            const url = `${window.location.origin}/SharedSimulationView?token=${shareToken}`;
            setShareLink(url);
        } catch (err) {
            toast.error('Failed to generate share link. Please try again.');
            console.error(err);
        } finally {
            setIsSharing(false);
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(shareLink);
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setShareLink(null);
        setCopied(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Link className="w-4 h-4 text-teal-600" />
                        Share Simulation
                    </DialogTitle>
                    <DialogDescription>
                        Generate a link to share this simulation with team members for review.
                    </DialogDescription>
                </DialogHeader>

                {!shareLink ? (
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="share-title">Title</Label>
                            <Input
                                id="share-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Simulation title"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="share-notes">Notes for reviewers (optional)</Label>
                            <textarea
                                id="share-notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add context or questions for your team..."
                                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                            />
                        </div>
                        <p className="text-xs text-slate-500">
                            Anyone with the link can view the full simulation results. The link does not expire.
                        </p>
                        <div className="flex justify-end gap-2 pt-1">
                            <Button variant="outline" onClick={handleClose}>Cancel</Button>
                            <Button onClick={handleShare} disabled={isSharing || !title.trim()}>
                                {isSharing ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                                ) : (
                                    <><Link className="w-4 h-4 mr-2" />Generate Link</>
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 py-2">
                        <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                            <p className="text-sm font-semibold text-teal-900 mb-1">Link ready</p>
                            <p className="text-xs text-teal-700">Share this link with your team members.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input value={shareLink} readOnly className="text-xs font-mono bg-slate-50" />
                            <Button size="sm" onClick={handleCopy} className="flex-shrink-0">
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={handleClose}>Done</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}