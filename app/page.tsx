'use client';

import { useAssets } from '@/lib/hooks/useAssets';

export default function Home() {
  const { assets, loading, error } = useAssets();

  console.log({ assets, loading, error });

  return (
    <div className="flex flex-col min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <pre>{JSON.stringify(assets, null, 2)}</pre>
    </div>
  );
}
