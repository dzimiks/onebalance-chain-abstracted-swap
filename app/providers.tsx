'use client';

import React from 'react';
import PlausibleProvider from 'next-plausible';
import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ThemeProvider';
import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider';
import { PredictedAddressProvider } from '@/lib/contexts/PredictedAddressContext';

// Create a client
const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => (
  <PlausibleProvider domain="onebalance-chain-abstracted-swap.vercel.app">
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
          config={{
            embeddedWallets: {
              // Create embedded wallets for users who don't have a wallet
              createOnLogin: 'users-without-wallets',
              solana: {
                createOnLogin: 'users-without-wallets',
              },
            },
            loginMethods: ['email', 'passkey', 'wallet'],
            appearance: {
              theme: 'light',
              accentColor: '#FFAB40',
            },
          }}
        >
          <PredictedAddressProvider>
            <OnboardingProvider>{children}</OnboardingProvider>
          </PredictedAddressProvider>
        </PrivyProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </PlausibleProvider>
);
