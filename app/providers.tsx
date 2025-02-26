'use client';

import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => (
  <QueryClientProvider client={queryClient}>
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        embeddedWallets: {
          // Create embedded wallets for users who don't have a wallet
          createOnLogin: 'users-without-wallets',
        },
        loginMethods: ['email'],
        appearance: {
          theme: 'light',
          accentColor: '#7c3aed',
        },
      }}
    >
      {children}
    </PrivyProvider>
  </QueryClientProvider>
);