import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/app/providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'OneBalance Cross-Chain Swap',
    template: '%s | OneBalance',
  },
  description:
    'Modern cross-chain token swap and transfer application built with OneBalance Chain Abstraction Toolkit. Swap tokens across multiple blockchains with a unified interface.',
  keywords: [
    'cross-chain',
    'token swap',
    'DeFi',
    'blockchain',
    'cryptocurrency',
    'OneBalance',
    'multi-chain',
    'crypto exchange',
    'decentralized finance',
    'Web3',
  ],
  authors: [{ name: 'dzimiks', url: 'https://github.com/dzimiks' }],
  creator: 'dzimiks',
  publisher: 'OneBalance',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://one-balance-cross-chain-swap.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://one-balance-cross-chain-swap.vercel.app',
    title: 'OneBalance Cross-Chain Swap',
    description:
      'Modern cross-chain token swap and transfer application built with OneBalance Chain Abstraction Toolkit.',
    siteName: 'OneBalance Cross-Chain Swap',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OneBalance Cross-Chain Swap',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OneBalance Cross-Chain Swap',
    description:
      'Modern cross-chain token swap and transfer application built with OneBalance Chain Abstraction Toolkit.',
    images: ['/og-image.png'],
    creator: '@dzimiks',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
