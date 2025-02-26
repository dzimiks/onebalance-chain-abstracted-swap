'use client';

import { useEffect, useState } from 'react';
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
import { Wallet, CircleUser } from 'lucide-react';
import { useBalances } from '@/lib/hooks/useBalances';
import { useQuotes2 } from '@/lib/hooks';

export const ConnectButton = () => {
  const { login, logout, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  // const embeddedWallet = wallets[0];
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');
  const [open, setOpen] = useState(false);

  const {
    predictedAddress,
    getPredictedAddress,
  } = useQuotes2();

  const {
    balances,
    loading: balancesLoading,
  } = useBalances(predictedAddress);

  // Get the predicted address when wallet connects
  useEffect(() => {
    if (authenticated && embeddedWallet && !predictedAddress) {
      getPredictedAddress();
    }
  }, [authenticated, embeddedWallet, predictedAddress, getPredictedAddress]);

  if (!ready) {
    return <Button variant="outline" disabled>Loading...</Button>;
  }

  if (!authenticated) {
    return <Button onClick={login}>Connect Wallet</Button>;
  }

  console.log({ balances });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          <span>{embeddedWallet?.address.slice(0, 6)}...{embeddedWallet?.address.slice(-4)}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CircleUser className="h-5 w-5" />
            Wallet Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="text-md font-medium">Wallet Address</h3>
            <p className="text-sm p-2 bg-gray-100 rounded break-all">
              {embeddedWallet?.address}
            </p>
          </div>

          {predictedAddress && (
            <div className="space-y-2">
              <h3 className="text-md font-medium">Account Address (Predicted)</h3>
              <p className="text-sm p-2 bg-gray-100 rounded break-all">
                {predictedAddress}
              </p>
            </div>
          )}

          {balancesLoading ? (
            <div className="py-4 text-center text-sm text-gray-500">
              Loading balances...
            </div>
          ) : balances?.balanceByAsset && (
            <div className="space-y-2">
              <h3 className="flex items-center justify-between gap-2 text-md font-medium">
                <span>Your Balances</span>
                <span>Total: ${balances.totalBalance?.fiatValue.toFixed(2)}</span>
              </h3>
              <div className="max-h-70 overflow-y-auto space-y-2">
                {balances.balanceByAsset.sort((a, b) => b.balance - a.balance).map((asset: any) => (
                  <Card key={asset.aggregatedAssetId} className="p-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">
                          {asset.aggregatedAssetId.split(':')[1].toUpperCase()}
                        </span>
                        <div className="text-xs text-gray-500">
                          {asset.individualAssetBalances.length} chain{asset.individualAssetBalances.length > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div>
                          ${asset.fiatValue?.toFixed(2) || 0}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={logout}
            >
              Log out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
