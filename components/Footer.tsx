'use client';

import Link from 'next/link';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border transition-colors">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4">
        {/* Left side - Project info */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Powered by</span>
            <Link
              href="https://onebalance.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 hover:underline transition-colors font-medium"
            >
              OneBalance
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full font-medium">
              Open Source
            </span>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
              100% Free
            </span>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link
              href="https://github.com/dzimiks/onebalance-chain-abstracted-swap"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              <span>View Source</span>
            </Link>
          </Button>
        </div>

        {/* Right side - Creator info */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Built by{' '}
            <Link
              href="https://twitter.com/dzimiks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              @dzimiks
            </Link>
          </span>

          <div className="flex items-center gap-2">
            <Link
              href="https://github.com/dzimiks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
              aria-label="GitHub Profile"
            >
              <Github className="h-4 w-4" />
            </Link>

            <Link
              href="https://twitter.com/dzimiks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
              aria-label="Twitter Profile"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
