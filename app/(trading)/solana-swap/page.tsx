'use client';

import { SolanaSwapForm } from '@/components/SolanaSwapForm';
import { TabNavigation } from '@/components/TabNavigation';

export default function SolanaSwapPage() {
  return (
    <div className="p-4 flex-1">
      <TabNavigation />
      <SolanaSwapForm />
    </div>
  );
}
