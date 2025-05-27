'use client';

import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, ChevronRight, LogOut } from 'lucide-react';
import { useBalances } from '@/lib/hooks/useBalances';
import { useAssets } from '@/lib/hooks/useAssets';
import { useQuotes } from '@/lib/hooks';
import { WalletHeader } from '@/components/wallet/WalletHeader';
import { AccountAddress } from '@/components/wallet/AccountAddress';
import { PortfolioSummary } from '@/components/wallet/PortfolioSummary';
import { AssetList } from '@/components/wallet/AssetList';

export const ConnectButton = () => {
  const { login, logout, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');
  const [open, setOpen] = useState(false);

  const { predictedAddress, getPredictedAddress } = useQuotes();
  const { balances, loading: balancesLoading, fetchBalances } = useBalances(predictedAddress);
  const { assets } = useAssets();

  // Get the predicted address when wallet connects
  useEffect(() => {
    if (authenticated && embeddedWallet && !predictedAddress) {
      getPredictedAddress();
    }
  }, [authenticated, embeddedWallet, predictedAddress, getPredictedAddress]);

  // Refresh balances when dialog opens
  useEffect(() => {
    if (open && predictedAddress) {
      fetchBalances();
    }
  }, [open, predictedAddress]);

  // Calculate unique chain count
  const getUniqueChainCount = () => {
    if (!balances?.balanceByAggregatedAsset) return 0;

    const uniqueChains = new Set<string>();
    balances.balanceByAggregatedAsset.forEach(asset => {
      asset.individualAssetBalances.forEach(individualAsset => {
        const chainId = individualAsset.assetType.split('/')[0];
        uniqueChains.add(chainId);
      });
    });

    return uniqueChains.size;
  };

  // Format wallet address for display
  const formatAddress = (address?: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!ready) {
    return (
      <Button variant="outline" size="sm" disabled className="animate-pulse">
        <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
        Loading...
      </Button>
    );
  }

  if (!authenticated) {
    return (
      <Button
        size="sm"
        onClick={login}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 transition-all duration-200 hover:shadow-md"
        >
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">
            {predictedAddress ? formatAddress(predictedAddress) : 'Connected'}
          </span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden">
        <DialogTitle className="sr-only">Wallet Details</DialogTitle>
        <div className="space-y-6 overflow-y-auto max-h-[80vh] pr-2">
          {/* Wallet Header */}
          <WalletHeader address={predictedAddress || ''} />

          {/* Account Address Section */}
          {predictedAddress && <AccountAddress address={predictedAddress} />}

          {/* Portfolio Summary */}
          {balances?.totalBalance && (
            <PortfolioSummary
              totalValue={balances.totalBalance.fiatValue || 0}
              assetCount={balances.balanceByAggregatedAsset?.length || 0}
              chainCount={getUniqueChainCount()}
              onRefresh={fetchBalances}
            />
          )}

          {/* Asset List */}
          <AssetList
            balances={balances?.balanceByAggregatedAsset}
            assets={assets}
            loading={balancesLoading}
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-border mt-6">
          <Button
            variant="outline"
            className="w-full text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-700/50 transition-colors"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect Wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
