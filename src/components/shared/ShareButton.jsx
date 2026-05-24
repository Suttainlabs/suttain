import React, { useState } from 'react';
import { Share2, Twitter, Linkedin, Link, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function ShareButton({ text, url, label = 'Share', size = 'sm', variant = 'outline' }) {
    const [copied, setCopied] = useState(false);
    const shareUrl = url || window.location.href;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(shareUrl);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(`${text}\n\n${shareUrl}`);
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size={size} variant={variant} className="gap-1.5">
                    <Share2 className="w-3.5 h-3.5" />
                    {label}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                    <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
                        <Twitter className="w-4 h-4 text-sky-500" />
                        Share on X / Twitter
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
                        <Linkedin className="w-4 h-4 text-blue-600" />
                        Share on LinkedIn
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy} className="flex items-center gap-2 cursor-pointer">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Link className="w-4 h-4 text-slate-500" />}
                    {copied ? 'Copied!' : 'Copy link'}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}