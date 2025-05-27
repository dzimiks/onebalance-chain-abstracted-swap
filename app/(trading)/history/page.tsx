'use client';

import { useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { TransactionHistory } from '@/components/TransactionHistory';
import { TabNavigation } from '@/components/TabNavigation';
import { useQuotes } from '@/lib/hooks';

export default function HistoryPage() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');

  // Use the predicted address (smart account) for transaction history
  const { predictedAddress, getPredictedAddress } = useQuotes();

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
