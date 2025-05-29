import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transfer',
  description:
    'Send tokens to any address across multiple blockchains. Fast, secure chain-abstracted transfers with OneBalance.',
  keywords: [
    'token transfer',
    'chain-abstracted transfer',
    'send crypto',
    'blockchain transfer',
    'multi-chain',
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
