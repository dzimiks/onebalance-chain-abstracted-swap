'use client';

import Link from 'next/link';
// import { SwapForm } from '@/components/SwapForm';
import { SwapForm2 } from '@/components/SwapForm2';
import { ConnectButton } from '@/components/ConnectButton';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen justify-between font-[family-name:var(--font-geist-sans)]">
      <header className="flex items-center justify-between gap-2 flex-wrap bg-gray-100 p-4">
        <h1 className="font-semibold text-lg">OneBalance Cross-Chain Swap Task - February 2025</h1>
        <ConnectButton />
      </header>
      <div className="p-4">
        <SwapForm2 />
      </div>
      <footer className="text-center bg-gray-100 p-4">
        <span>Made by <Link className="text-blue-500 hover:underline" href="https://twitter.com/dzimiks">@dzimiks</Link></span>
      </footer>
    </div>
  );
}
