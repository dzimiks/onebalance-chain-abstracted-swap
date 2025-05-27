import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transfer Tokens',
  description:
    'Send tokens across different blockchains securely and efficiently. Transfer cryptocurrencies to any address on supported networks with OneBalance.',
  keywords: [
    'token transfer',
    'cross-chain transfer',
    'send crypto',
    'blockchain transfer',
    'multi-chain send',
    'cryptocurrency transfer',
    'secure transfer',
    'instant transfer',
  ],
  openGraph: {
    title: 'Transfer Tokens | OneBalance',
    description: 'Send tokens across different blockchains securely and efficiently.',
    url: '/transfer',
  },
  twitter: {
    title: 'Transfer Tokens | OneBalance',
    description: 'Send tokens across different blockchains securely and efficiently.',
  },
  alternates: {
    canonical: '/transfer',
  },
};

export default function TransferLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
