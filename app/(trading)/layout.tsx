'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function TradingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen justify-between font-[family-name:var(--font-geist-sans)] bg-background transition-colors">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
