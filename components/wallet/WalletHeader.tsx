'use client';

import { Wallet } from 'lucide-react';

interface WalletHeaderProps {
  address?: string;
}

export const WalletHeader = ({ address }: WalletHeaderProps) => {
  const formatAddress = (addr?: string) => {
    if (!addr) return 'Unknown';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-4 pb-4 border-b border-border">
      <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center shadow-lg">
        <Wallet className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">Wallet Details</h2>
        <p className="text-sm text-muted-foreground">
          {address ? formatAddress(address) : 'Connected'}
        </p>
      </div>
    </div>
  );
};
