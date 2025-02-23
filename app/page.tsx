'use client';

import { useState } from 'react';
import { useAssets, useChains } from '@/lib/hooks';
import { AssetSelect } from '@/components/AssetSelect';
import { ChainSelect } from '@/components/ChainSelect';
import { ArrowDownUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { assets, loading } = useAssets();
  const { chains } = useChains();

  const [sourceAsset, setSourceAsset] = useState('');
  const [sourceChain, setSourceChain] = useState('');
  const [targetAsset, setTargetAsset] = useState('');
  const [targetChain, setTargetChain] = useState('');

  const handleSwapDirection = () => {
    setSourceAsset(targetAsset);
    setTargetAsset(sourceAsset);
    setSourceChain(targetChain);
    setTargetChain(sourceChain);
  };

  return (
    <div className="flex flex-col min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      {loading && <div>Loading...</div>}
      {!loading && (
        <div className="flex flex-col gap-4">
          <h3>Assets</h3>
          <pre className="border max-h-[350px] overflow-auto">{JSON.stringify(assets, null, 2)}</pre>

          <h2 className="text-2xl font-bold text-center">Cross-Chain Swap</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <ChainSelect
                chains={chains}
                value={sourceChain}
                onValueChange={setSourceChain}
                label="From Chain"
                disabled={loading}
              />
              <AssetSelect
                assets={assets}
                value={sourceAsset}
                onValueChange={setSourceAsset}
                label="From Asset"
                disabled={loading}
              />
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwapDirection}
                disabled={loading}
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
                disabled={loading}
              />
              <AssetSelect
                assets={assets}
                value={targetAsset}
                onValueChange={setTargetAsset}
                label="To Asset"
                disabled={loading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
