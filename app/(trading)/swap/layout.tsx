import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Swap Tokens',
  description:
    'Swap tokens across multiple blockchains instantly. Exchange cryptocurrencies with the best rates using OneBalance cross-chain technology.',
  keywords: [
    'token swap',
    'crypto exchange',
    'cross-chain swap',
    'DeFi trading',
    'cryptocurrency exchange',
    'multi-chain trading',
    'instant swap',
    'best rates',
  ],
  openGraph: {
    title: 'Swap Tokens | OneBalance',
    description: 'Swap tokens across multiple blockchains instantly with the best rates.',
    url: '/swap',
  },
  twitter: {
    title: 'Swap Tokens | OneBalance',
    description: 'Swap tokens across multiple blockchains instantly with the best rates.',
  },
  alternates: {
    canonical: '/swap',
  },
};

export default function SwapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
