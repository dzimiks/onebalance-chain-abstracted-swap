'use client';

import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { TransactionHistory } from '@/components/TransactionHistory';
import { TabNavigation } from '@/components/TabNavigation';
import { useEmbeddedWallet } from '@/lib/hooks';
import { usePredictedAddress } from '@/lib/contexts/PredictedAddressContext';

export default function HistoryPage() {
  const { authenticated } = usePrivy();
  const embeddedWallet = useEmbeddedWallet();
  const { predictedAddress, getPredictedAddress } = usePredictedAddress();

  // Get predicted address when wallet connects
  useEffect(() => {
    if (authenticated && embeddedWallet && !predictedAddress) {
      getPredictedAddress();
    }
  }, [authenticated, embeddedWallet, predictedAddress, getPredictedAddress]);

  return (
    <div className="p-4 flex-1">
      <TabNavigation />
      <div className="max-w-4xl mx-auto">
        <TransactionHistory userAddress={predictedAddress || ''} />
      </div>
    </div>
  );
}
