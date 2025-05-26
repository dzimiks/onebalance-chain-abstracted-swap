'use client';

import { SwapForm } from '@/components/SwapForm';
import { TabNavigation } from '@/components/TabNavigation';

export default function SwapPage() {
  return (
    <div className="p-4 flex-1">
      <TabNavigation />
      <SwapForm />
    </div>
  );
}
