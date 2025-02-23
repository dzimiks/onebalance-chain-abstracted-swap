'use client';

import { useAssets, useChains } from '@/lib/hooks';

export default function Home() {
  const { assets, loading } = useAssets();
  const { chains } = useChains();

  return (
    <div className="flex flex-col min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      {loading && <div>Loading...</div>}
      {!loading && (
        <div className="flex flex-col gap-4">
          <h3>Assets</h3>
          <pre className="border max-h-[300px] overflow-auto">{JSON.stringify(assets, null, 2)}</pre>
          <h3>Chains</h3>
          <pre className="border max-h-[300px] overflow-auto">{JSON.stringify(chains, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
