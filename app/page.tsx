'use client';

import { useState } from 'react';
import { useAssets } from '@/lib/hooks';
import { AssetSelect } from '@/components/AssetSelect';

export default function Home() {
  const { assets, loading } = useAssets();
  const [sourceAsset, setSourceAsset] = useState('');
  const [targetAsset, setTargetAsset] = useState('');

  return (
    <div className="flex flex-col min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      {loading && <div>Loading...</div>}
      {!loading && (
        <div className="flex flex-col gap-4">
          <h3>Assets</h3>
          <pre className="border max-h-[350px] overflow-auto">{JSON.stringify(assets, null, 2)}</pre>
          <AssetSelect
            assets={assets}
            value={sourceAsset}
            onValueChange={setSourceAsset}
            label="From"
            placeholder="Select source asset"
          />
          <AssetSelect
            assets={assets}
            value={targetAsset}
            onValueChange={setTargetAsset}
            label="To"
            placeholder="Select target asset"
          />
        </div>
      )}
    </div>
  );
}
