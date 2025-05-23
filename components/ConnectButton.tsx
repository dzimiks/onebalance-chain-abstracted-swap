'use client';

import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, CircleUser, Copy, CheckCircle2 } from 'lucide-react';
import { useBalances } from '@/lib/hooks/useBalances';
import { useQuotes } from '@/lib/hooks';
import { formatTokenAmount } from '@/lib/utils/token';
import { BalanceByAssetDto } from '@/lib/types/balances';

export const ConnectButton = () => {
  const { login, logout, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    predictedAddress,
    getPredictedAddress,
  } = useQuotes();

  const {
    balances,
    loading: balancesLoading,
    fetchBalances,
  } = useBalances(predictedAddress);

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

  // Copy address to clipboard
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format wallet address for display
  const formatAddress = (address?: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get the number of chains an asset is on
  const getChainCount = (asset: BalanceByAssetDto) => {
    return asset.individualAssetBalances.length;
  };

  // Display the asset symbol from aggregatedAssetId
  const getAssetSymbol = (assetId: string) => {
    return assetId.split(':')[1]?.toUpperCase() || assetId;
  };

  if (!ready) {
    return <Button variant="outline" size="sm" disabled>Loading...</Button>;
  }

  if (!authenticated) {
    return (
      <Button size="sm" onClick={login}>
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          <span>{embeddedWallet ? formatAddress(embeddedWallet.address) : 'Connected'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CircleUser className="h-5 w-5" />
            Wallet Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Wallet Address */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Wallet Address</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => embeddedWallet && copyAddress(embeddedWallet.address)}
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm p-2 bg-gray-100 rounded break-all">
              {embeddedWallet?.address}
            </p>
          </div>

          {/* Predicted Address */}
          {predictedAddress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Account Address (Predicted)</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyAddress(predictedAddress)}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm p-2 bg-gray-100 rounded break-all">
                {predictedAddress}
              </p>
            </div>
          )}

          {/* Total Balance */}
          {balances?.totalBalance && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="text-sm text-gray-500 mb-1">Total Balance</div>
              <div className="text-2xl font-bold">
                ${balances.totalBalance.fiatValue?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) || 0}
              </div>
            </div>
          )}

          {/* Asset List */}
          <div className="space-y-2">
            <h3 className="text-md font-medium">Your Balances</h3>
            {balancesLoading ? (
              <div className="py-4 text-center text-sm text-gray-500">
                Loading balances...
              </div>
            ) : balances?.balanceByAggregatedAsset && balances.balanceByAggregatedAsset.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {balances.balanceByAggregatedAsset
                  .sort((a, b) => (b.fiatValue || 0) - (a.fiatValue || 0))
                  .map((asset) => (
                    <Card key={asset.aggregatedAssetId} className="p-3 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">
                            {getAssetSymbol(asset.aggregatedAssetId)}
                          </span>
                          <div className="text-xs text-gray-500">
                            {getChainCount(asset)} chain{getChainCount(asset) > 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="text-right">
                          <div>
                            ${asset.fiatValue?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }) || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTokenAmount(asset.balance, asset.decimals || 18)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No assets found
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="pt-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={logout}
            >
              Disconnect Wallet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
