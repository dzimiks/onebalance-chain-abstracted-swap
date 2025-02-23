'use client';

import { SwapForm } from '@/components/SwapForm';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen p-12 font-[family-name:var(--font-geist-sans)]">
      <SwapForm />
    </div>
  );
}
