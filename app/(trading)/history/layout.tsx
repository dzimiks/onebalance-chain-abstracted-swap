import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transaction History',
  description:
    'View your complete transaction history across all supported blockchains. Track swaps, transfers, and all cross-chain activities in one place.',
  keywords: [
    'transaction history',
    'crypto history',
    'blockchain transactions',
    'swap history',
    'transfer history',
    'cross-chain history',
    'DeFi activity',
    'portfolio tracking',
  ],
  openGraph: {
    title: 'Transaction History | OneBalance',
    description: 'View your complete transaction history across all supported blockchains.',
    url: '/history',
  },
  twitter: {
    title: 'Transaction History | OneBalance',
    description: 'View your complete transaction history across all supported blockchains.',
  },
  alternates: {
    canonical: '/history',
  },
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
