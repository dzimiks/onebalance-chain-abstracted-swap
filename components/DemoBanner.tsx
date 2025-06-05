'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';

export function DemoBanner() {
  return (
    <Alert className="rounded-none border-l-0 border-r-0 border-t-0 border-orange-500/50 bg-orange-50 text-orange-900 dark:bg-orange-950/50 dark:text-orange-100 [&>svg]:text-current">
      <AlertDescription>
        <p className="text-center w-full">
          This is a demo app for testing purposes only. For the production application, please visit{' '}
          <a
            href="https://app.onebalance.io"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline font-medium"
          >
            app.onebalance.io
          </a>
        </p>
      </AlertDescription>
    </Alert>
  );
}
