import { useState } from 'react';
import { ArrowDownUp } from 'lucide-react';
import { AssetSelect } from '@/components/AssetSelect';
import { ChainSelect } from '@/components/ChainSelect';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAssets, useChains } from '@/lib/hooks';

export function SwapForm() {
  const [sourceAsset, setSourceAsset] = useState('');
  const [targetAsset, setTargetAsset] = useState('');
  const [sourceChain, setSourceChain] = useState('');
  const [targetChain, setTargetChain] = useState('');
  const [amount, setAmount] = useState('');

  const { assets, loading: assetsLoading, error: assetsError } = useAssets();
  const { chains, loading: chainsLoading, error: chainsError } = useChains();
  const isLoading = false;

  // Handlers
  const handleSwapDirection = () => {
    setSourceAsset(targetAsset);
    setTargetAsset(sourceAsset);
    setSourceChain(targetChain);
    setTargetChain(sourceChain);
  };

  if (assetsLoading || chainsLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto p-6">
        <div className="text-center">Loading...</div>
      </Card>
    );
  }

  if (assetsError || chainsError) {
    return (
      <Card className="w-full max-w-lg mx-auto p-6">
        <Alert variant="destructive">
          {assetsError || chainsError}
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto p-6">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Cross-Chain Swap</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <ChainSelect
              chains={chains}
              value={sourceChain}
              onValueChange={setSourceChain}
              label="From Chain"
              disabled={isLoading}
            />
            <AssetSelect
              assets={assets}
              value={sourceAsset}
              onValueChange={setSourceAsset}
              label="From Asset"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapDirection}
              disabled={isLoading}
              className="rounded-full"
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <ChainSelect
              chains={chains}
              value={targetChain}
              onValueChange={setTargetChain}
              label="To Chain"
              disabled={isLoading}
            />
            <AssetSelect
              assets={assets}
              value={targetAsset}
              onValueChange={setTargetAsset}
              label="To Asset"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Amount</label>
            <Input
              type="text"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}