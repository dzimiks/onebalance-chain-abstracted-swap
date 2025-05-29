import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Swap',
  description:
    'Swap tokens across multiple blockchains instantly. Exchange cryptocurrencies with the best rates using OneBalance chain-abstracted technology.',
  keywords: [
    'token swap',
    'chain-abstracted swap',
    'cryptocurrency exchange',
    'defi',
    'blockchain',
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
