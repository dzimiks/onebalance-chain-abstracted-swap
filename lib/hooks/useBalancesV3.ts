import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';

interface BalanceV3 {
  assetId: string;
  balance: string;
  fiatValue: number;
}

interface IndividualAssetBalance {
  assetType: string;
  balance: string;
  fiatValue: number;
}

interface AggregatedAssetBalance {
  aggregatedAssetId: string;
  balance: string;
  individualAssetBalances: IndividualAssetBalance[];
  fiatValue: number;
}

interface AggregatedBalanceV3Response {
  accounts: {
    solana: string;
  };
  balanceByAggregatedAsset: AggregatedAssetBalance[];
  balanceBySpecificAsset: any[];
  totalBalance: {
    fiatValue: number;
  };
}

/**
 * Hook for v3 aggregated balances (supports Solana accounts)
 */
export const useBalancesV3 = () => {
  const [balances, setBalances] = useState<BalanceV3[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAggregatedBalance = useCallback(async (accounts: string[]): Promise<BalanceV3[]> => {
    setLoading(true);
    setError(null);

    try {
      const accountParam = accounts.join(',');

      const response = await apiClient.get(
        `/v3/balances/aggregated-balance?account=${accountParam}`
      );
      const data: AggregatedBalanceV3Response = response.data;

      // Transform the response to our expected format
      const transformedBalances: BalanceV3[] = data.balanceByAggregatedAsset.map(item => ({
        assetId: item.aggregatedAssetId,
        balance: item.balance,
        fiatValue: item.fiatValue,
      }));

      setBalances(transformedBalances);
      return transformedBalances;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balances';
      console.error('Balance fetch error:', err);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getBalanceForAsset = useCallback(
    (assetId: string): BalanceV3 | null => {
      return balances.find(b => b.assetId === assetId) || null;
    },
    [balances]
  );

  return {
    balances,
    loading,
    error,
    fetchAggregatedBalance,
    getBalanceForAsset,
  };
};
