'use client';

import { TransferForm } from '@/components/TransferForm';
import { TabNavigation } from '@/components/TabNavigation';

export default function TransferPage() {
  return (
    <div className="p-4 flex-1">
      <TabNavigation />
      <TransferForm />
    </div>
  );
}
