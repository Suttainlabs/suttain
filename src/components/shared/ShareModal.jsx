import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { Copy, Check, Link, Loader2, UserPlus, X, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";

/**
 * Generic share modal for simulations and formula drafts.
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - title: string, default title for the shared item
 *  - shareType: "simulation" | "formula"
 *  - payload: object, data snapshot to persist in SharedSimulation.simulation_data
 */
export default function ShareModal({ isOpen, onClose, title: defaultTitle, shareType = "simulation", payload }) {
    const [title, setTitle] = useState(defaultTitle || "");
    const [notes, setNotes] = useState("");
    const [emailInput, setEmailInput] = useState("");
    const [invitedEmails, setInvitedEmails] = useState([]);
    const [permission, setPermission] = useState("read"); // "read" | "edit"
    const [isSharing, setIsSharing] = useState(false);
    const [shareLink, setShareLink] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleAddEmail = () => {
        const email = emailInput.trim().toLowerCase();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }
        if (invitedEmails.find(e => e.email === email)) {
            toast.error("This email has already been added.");
            return;
        }
        setInvitedEmails(prev => [...prev, { email, permission }]);
        setEmailInput("");
    };

    const handleRemoveEmail = (email) => {
        setInvitedEmails(prev => prev.filter(e => e.email !== email));
    };

    const handleToggleEmailPermission = (email) => {
        setInvitedEmails(prev =>
            prev.map(e => e.email === email
                ? { ...e, permission: e.permission === "read" ? "edit" : "read" }
                : e
            )
        );
    };

    const handleShare = async () => {
        if (!title.trim()) {
            toast.error("Please add a title before sharing.");
            return;
        }
        setIsSharing(true);
        try {
            const shareToken = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
            const sharedWithEmails = invitedEmails.map(e => e.email);

            await base44.entities.SharedSimulation.create({
                simulation_id: shareToken,
                title: title.trim(),
                description: notes,
                share_type: sharedWithEmails.length > 0 ? "team" : "private_link",
                share_link: shareToken,
                shared_with: sharedWithEmails,
                simulation_data: {
                    ...payload,
                    share_type_label: shareType,
                    permissions: invitedEmails,
                    default_permission: permission,
                },
                allow_comments: true,
                view_count: 0,
            });

            const url = `${window.location.origin}/SharedSimulationView?token=${shareToken}`;
            setShareLink(url);

            if (sharedWithEmails.length > 0) {
                toast.success(`Shared with ${sharedWithEmails.length} team member${sharedWithEmails.length > 1 ? "s" : ""}.`);
            }
        } catch (err) {
            toast.error("Failed to generate share link. Please try again.");
            console.error(err);
        } finally {
            setIsSharing(false);
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(shareLink);
        setCopied(true);
        toast.success("Link copied to clipboard.");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setShareLink(null);
        setCopied(false);
        setInvitedEmails([]);
        setEmailInput("");
        setNotes("");
        onClose();
    };

    const shareTypeLabel = shareType === "formula" ? "Formula Draft" : "Simulation";

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Link className="w-4 h-4 text-teal-600" />
                        Share {shareTypeLabel}
                    </DialogTitle>
                    <DialogDescription>
                        Invite team members to view or collaborate on this {shareTypeLabel.toLowerCase()}.
                    </DialogDescription>
                </DialogHeader>

                {!shareLink ? (
                    <div className="space-y-5 py-1">
                        {/* Title */}
                        <div className="space-y-1.5">
                            <Label htmlFor="share-title">Title</Label>
                            <Input
                                id="share-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={`${shareTypeLabel} title`}
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-1.5">
                            <Label htmlFor="share-notes">Notes for reviewers (optional)</Label>
                            <textarea
                                id="share-notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add context or questions for your team..."
                                className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                            />
                        </div>

                        {/* Default permission toggle */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2">
                                {permission === "read"
                                    ? <Eye className="w-4 h-4 text-slate-500" />
                                    : <Pencil className="w-4 h-4 text-teal-600" />
                                }
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Default: {permission === "read" ? "Read-only" : "Can edit"}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {permission === "read"
                                            ? "Recipients can view but not modify."
                                            : "Recipients can view and suggest edits."}
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={permission === "edit"}
                                onCheckedChange={(v) => setPermission(v ? "edit" : "read")}
                            />
                        </div>

                        {/* Invite by email */}
                        <div className="space-y-2">
                            <Label>Invite team members (optional)</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="teammate@company.com"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                                    className="flex-1"
                                />
                                <Button variant="outline" size="sm" onClick={handleAddEmail} className="flex-shrink-0">
                                    <UserPlus className="w-4 h-4 mr-1" />
                                    Add
                                </Button>
                            </div>

                            {invitedEmails.length > 0 && (
                                <div className="space-y-1.5 mt-2">
                                    {invitedEmails.map(({ email, permission: p }) => (
                                        <div key={email} className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg">
                                            <span className="text-sm text-slate-700 truncate flex-1">{email}</span>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {/* Per-invitee permission toggle */}
                                                <button
                                                    onClick={() => handleToggleEmailPermission(email)}
                                                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border transition-colors ${
                                                        p === "edit"
                                                            ? "bg-teal-50 border-teal-200 text-teal-700"
                                                            : "bg-slate-50 border-slate-200 text-slate-600"
                                                    }`}
                                                >
                                                    {p === "edit"
                                                        ? <><Pencil className="w-3 h-3" /> Edit</>
                                                        : <><Eye className="w-3 h-3" /> View</>
                                                    }
                                                </button>
                                                <button onClick={() => handleRemoveEmail(email)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <p className="text-xs text-slate-500">
                            A private link will be generated. Invited team members will also be granted access by email.
                        </p>

                        <div className="flex justify-end gap-2 pt-1">
                            <Button variant="outline" onClick={handleClose}>Cancel</Button>
                            <Button onClick={handleShare} disabled={isSharing || !title.trim()}>
                                {isSharing
                                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                                    : <><Link className="w-4 h-4 mr-2" />Generate Link</>
                                }
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 py-2">
                        <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                            <p className="text-sm font-semibold text-teal-900 mb-1">Link ready</p>
                            <p className="text-xs text-teal-700">
                                Share this link with your team.
                                {invitedEmails.length > 0 && ` ${invitedEmails.length} team member${invitedEmails.length > 1 ? "s" : ""} have been granted access.`}
                            </p>
                        </div>

                        {invitedEmails.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {invitedEmails.map(({ email, permission: p }) => (
                                    <Badge key={email} variant="outline" className="text-xs gap-1">
                                        {p === "edit" ? <Pencil className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                                        {email}
                                    </Badge>
                                ))}
                            </div>
                        )}

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