import { useState, useEffect } from 'react';
import { assetsApi } from '@/lib/api/assets';
import type { Asset } from '@/lib/types/assets';

interface AssetsData {
  assets: Asset[];
  loading: boolean;
  error: string | null;
}

export const useAssets = (): AssetsData => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = async () => {
    try {
      const data: Asset[] = await assetsApi.getAssets();
      setAssets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return { assets, loading, error };
};
