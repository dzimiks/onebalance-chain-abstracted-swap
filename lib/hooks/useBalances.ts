import { useState, useEffect } from 'react';
import { balancesApi } from '@/lib/api/balances';

export const useBalances = (predictedAddress: string | null) => {
  const [balances, setBalances] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = async () => {
    if (!predictedAddress) return;

    setLoading(true);
    setError(null);

    try {
      const data = await balancesApi.getAggregatedBalance(predictedAddress);
      setBalances(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (predictedAddress) {
      fetchBalances();
    }
  }, [predictedAddress]);

  return {
    balances,
    loading,
    error,
    fetchBalances,
  };
};
