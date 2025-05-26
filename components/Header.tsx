'use client';

import { ConnectButton } from '@/components/ConnectButton';
import { ModeToggle } from '@/components/ModeToggle';

export const Header = () => {
  return (
    <header className="flex items-center justify-between gap-4 bg-muted/50 p-4 border-b border-border transition-colors">
      <div className="flex items-center gap-2">
        <h1 className="font-bold text-xl text-foreground">OneBalance</h1>
        <span className="text-sm text-muted-foreground hidden sm:inline">Cross-Chain Swap</span>
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle />
        <ConnectButton />
      </div>
    </header>
  );
};
