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
    default: 'OneBalance Chain-Abstracted Swap',
    template: '%s | OneBalance',
  },
  description:
    'Modern chain-abstracted token swap and transfer application built with OneBalance Chain Abstraction Toolkit. Swap tokens across multiple blockchains with a unified interface.',
  keywords: [
    'chain-abstracted',
    'defi',
    'crypto',
    'blockchain',
    'ethereum',
    'swap',
    'transfer',
    'onebalance',
    'web3',
  ],
  authors: [
    {
      name: 'OneBalance Team',
    },
  ],
  creator: 'OneBalance Team',
  publisher: 'OneBalance',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://onebalance-chain-abstracted-swap.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://onebalance-chain-abstracted-swap.vercel.app',
    title: 'OneBalance Chain-Abstracted Swap',
    description:
      'Modern chain-abstracted token swap and transfer application built with OneBalance Chain Abstraction Toolkit.',
    siteName: 'OneBalance Chain-Abstracted Swap',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OneBalance Chain-Abstracted Swap',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OneBalance Chain-Abstracted Swap',
    description:
      'Modern chain-abstracted token swap and transfer application built with OneBalance Chain Abstraction Toolkit.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
