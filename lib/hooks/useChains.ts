import { useState, useEffect } from 'react';
import { chainsApi } from '@/lib/api/chains';
import { Chain, CHAIN_NAMES } from '@/lib/types/chains';

interface ChainData {
  chains: Chain[];
  loading: boolean;
  error: string | null;
  getChainName: (reference: string) => string;
}

export function useChains(): ChainData {
  const [chains, setChains] = useState<Chain[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChains = async () => {
    try {
      const data = await chainsApi.getChains();
      setChains(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chains');
    } finally {
      setLoading(false);
    }
  };

  const getChainName = (reference: string): string => {
    return CHAIN_NAMES[reference] || `Chain ${reference}`;
  };

  useEffect(() => {
    fetchChains();
  }, []);

  return {
    chains,
    loading,
    error,
    getChainName,
  };
}
