'use client';

import React from 'react';
import PlausibleProvider from 'next-plausible';
import { PrivyProvider } from '@privy-io/react-auth';
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';
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
          config={
            {
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
              // Solana RPC config from v3 (type assertion needed until type definitions are updated)
              solana: {
                rpcs: {
                  'solana:mainnet': {
                    // Use custom RPC endpoint or fallback to public (can be rate-limited)
                    rpc: createSolanaRpc(process.env.NEXT_PUBLIC_SOLANA_RPC_URL),
                    rpcSubscriptions: createSolanaRpcSubscriptions(
                      process.env.NEXT_PUBLIC_SOLANA_WS_URL
                    ),
                  },
                },
              },
            } as any
          }
        >
          <PredictedAddressProvider>
            <OnboardingProvider>{children}</OnboardingProvider>
          </PredictedAddressProvider>
        </PrivyProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </PlausibleProvider>
);
