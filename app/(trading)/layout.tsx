'use client';

import Link from 'next/link';
import { ConnectButton } from '@/components/ConnectButton';
import { ModeToggle } from '@/components/ModeToggle';

export default function TradingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen justify-between font-[family-name:var(--font-geist-sans)] bg-background transition-colors">
      <header className="flex items-center justify-between gap-2 flex-wrap bg-muted/50 p-4 border-b border-border transition-colors">
        <h1 className="font-semibold text-lg text-foreground">
          OneBalance Cross-Chain Swap Task - February 2025
        </h1>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <ConnectButton />
        </div>
      </header>
      {children}
      <footer className="text-center bg-muted/50 p-4 border-t border-border transition-colors">
        <span className="text-muted-foreground">
          Made by{' '}
          <Link
            className="text-primary hover:text-primary/80 hover:underline transition-colors"
            href="https://twitter.com/dzimiks"
          >
            @dzimiks
          </Link>
        </span>
      </footer>
    </div>
  );
}
