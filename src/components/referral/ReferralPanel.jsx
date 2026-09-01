import React, { useState, useEffect } from 'react';
import { Copy, Check, Gift, Users, Link } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { generateReferralCode } from '@/functions/generateReferralCode';
import { processReferral } from '@/functions/processReferral';

export default function ReferralPanel({ user, onPointsUpdated }) {
    const [referralCode, setReferralCode] = useState(user?.referral_code || '');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [inputCode, setInputCode] = useState('');
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        if (!user?.referral_code) {
            loadCode();
        } else {
            setReferralCode(user.referral_code);
        }
    }, [user]);

    const loadCode = async () => {
        setIsLoading(true);
        const res = await generateReferralCode({});
        if (res?.data?.referral_code) {
            setReferralCode(res.data.referral_code);
        }
        setIsLoading(false);
    };

    const referralLink = `https://suttain.com?ref=${referralCode}`;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(referralLink);
        setCopied(true);
        toast.success('Referral link copied');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleApplyCode = async () => {
        if (!inputCode.trim()) return;
        setIsApplying(true);
        const res = await processReferral({ referral_code: inputCode.trim().toUpperCase() });
        if (res?.data?.success) {
            toast.success('Referral code applied successfully.');
            if (onPointsUpdated) onPointsUpdated();
        } else {
            toast.error(res?.data?.error || 'Invalid or already used code.');
        }
        setIsApplying(false);
        setInputCode('');
    };

    return (
        <Card className="border border-slate-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Gift className="w-4 h-4 text-violet-500" />
                    Refer a Friend: Earn 100 Points
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-slate-500">
                    Share your unique link. When a friend signs up and uses your code, you earn 100 reward points.
                </p>

                {/* Your referral link */}
                <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                        <Link className="w-3.5 h-3.5" /> Your referral link
                    </p>
                    <div className="flex gap-2">
                        <Input
                            readOnly
                            value={isLoading ? 'Generating...' : referralLink}
                            className="text-xs font-mono bg-slate-50"
                        />
                        <Button size="sm" variant="outline" onClick={handleCopy} disabled={isLoading}>
                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                    {referralCode && (
                        <p className="text-xs text-slate-400 mt-1">
                            Code: <span className="font-mono font-semibold text-slate-600">{referralCode}</span>
                        </p>
                    )}
                </div>

                {/* Apply someone else's code */}
                {!user?.referred_by && (
                    <div className="pt-2 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> Have a referral code?
                        </p>
                        <div className="flex gap-2">
                            <Input
                                value={inputCode}
                                onChange={e => setInputCode(e.target.value.toUpperCase())}
                                placeholder="Enter code (e.g. JOH12AB)"
                                className="text-xs font-mono"
                                maxLength={10}
                            />
                            <Button size="sm" onClick={handleApplyCode} disabled={isApplying || !inputCode.trim()}>
                                {isApplying ? 'Applying...' : 'Apply'}
                            </Button>
                        </div>
                    </div>
                )}

                {user?.referred_by && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            Referred by: {user.referred_by}
                        </Badge>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}