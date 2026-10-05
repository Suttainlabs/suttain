import React, { useState } from 'react';
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
export default function ApiSecretDialog({secret,onClose}) {
 const [copied,setCopied]=useState(false),[error,setError]=useState('');
 async function copy(){try{await navigator.clipboard.writeText(secret);setCopied(true);setError('');}catch{setError('Select and copy the key manually.');}}
 return <Dialog open onOpenChange={open=>{if(!open) onClose();}}><DialogContent><DialogHeader><DialogTitle>Save your API key</DialogTitle><DialogDescription>This secret is shown only once. Save it in a password manager or environment variable before closing.</DialogDescription></DialogHeader><code className="block break-all rounded-lg bg-muted p-4 text-sm select-all">{secret}</code><Button variant="outline" onClick={copy}><Copy className="h-4 w-4 mr-2"/>{copied?'Copied':'Copy key'}</Button>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<p className="text-sm text-muted-foreground">For team keys, use a secure team secrets manager. Never commit this key to a notebook, repository, or browser application.</p><Button onClick={onClose}>I have saved my key</Button></DialogContent></Dialog>;
}