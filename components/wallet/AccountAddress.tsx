'use client';

import { useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccountAddressProps {
  address: string;
}

export const AccountAddress = ({ address }: AccountAddressProps) => {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Account Address</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 hover:bg-muted transition-colors"
          onClick={copyAddress}
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-1" />
              <span className="text-emerald-600 text-xs">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-muted-foreground text-xs">Copy</span>
            </>
          )}
        </Button>
      </div>
      <div className="bg-muted/30 border border-border rounded-xl p-3">
        <p className="text-sm font-mono text-foreground break-all leading-relaxed">{address}</p>
      </div>
    </div>
  );
};
