import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transaction History',
  description:
    'View your complete transaction history across all supported blockchains. Track swaps, transfers, and all chain-abstracted activities in one place.',
  keywords: [
    'transaction history',
    'crypto history',
    'blockchain transactions',
    'chain-abstracted history',
    'trading history',
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
