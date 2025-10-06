import { useState, useCallback } from 'react';
import { balancesApi } from '@/lib/api/balances';
import {
  BalancesResponseV3,
  BalanceParamsV3,
  BalanceByAssetDto,
  SpecificAssetBalance,
} from '@/lib/types/balances';

interface BalanceV3 {
  assetId: string;
  balance: string;
  fiatValue: number;
}

/**
 * Hook for v3 aggregated balances (supports multi-account: EVM + Solana)
 */
export const useBalancesV3 = () => {
  const [balances, setBalances] = useState<BalanceV3[]>([]);
  const [fullResponse, setFullResponse] = useState<BalancesResponseV3 | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch aggregated balances using the v3 API
   * @param accounts Array of account identifiers (CAIP-10 format or custom)
   * @param aggregatedAssetId Optional: comma-separated list of aggregated asset IDs (e.g., "ob:eth,ob:usdc")
   * @param assetId Optional: comma-separated list of specific asset IDs
   */
  const fetchAggregatedBalance = useCallback(
    async (
      accounts: string[],
      aggregatedAssetId?: string,
      assetId?: string
    ): Promise<BalanceV3[]> => {
      setLoading(true);
      setError(null);

      try {
        const accountParam = accounts.join(',');

        const params: BalanceParamsV3 = {
          account: accountParam,
          aggregatedAssetId,
          assetId,
        };

        // If no filters are provided, default to a common set of aggregated assets
        if (!aggregatedAssetId && !assetId) {
          params.aggregatedAssetId = 'ob:eth,ob:usdc,ob:usdt,ob:sol'; // Default to common assets
        }

        const data = await balancesApi.getAggregatedBalanceV3(params);
        setFullResponse(data);

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
        setFullResponse(null);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Convenience method to fetch balances for specific aggregated assets
   */
  const fetchBalancesByAssets = useCallback(
    async (accounts: string[], aggregatedAssetIds: string[]): Promise<BalanceV3[]> => {
      return fetchAggregatedBalance(accounts, aggregatedAssetIds.join(','));
    },
    [fetchAggregatedBalance]
  );

  const getBalanceForAsset = useCallback(
    (assetId: string): BalanceV3 | null => {
      return balances.find(b => b.assetId === assetId) || null;
    },
    [balances]
  );

  /**
   * Get the full aggregated asset balance details (including individual asset breakdown)
   */
  const getAggregatedAssetDetails = useCallback(
    (assetId: string): BalanceByAssetDto | null => {
      return (
        fullResponse?.balanceByAggregatedAsset.find(b => b.aggregatedAssetId === assetId) || null
      );
    },
    [fullResponse]
  );

  /**
   * Get specific asset balances (non-aggregated)
   */
  const getSpecificAssetBalances = useCallback((): SpecificAssetBalance[] => {
    return fullResponse?.balanceBySpecificAsset || [];
  }, [fullResponse]);

  /**
   * Get parsed account addresses from the response
   */
  const getAccountAddresses = useCallback(() => {
    return fullResponse?.accounts || null;
  }, [fullResponse]);

  /**
   * Get total balance across all assets
   */
  const getTotalBalance = useCallback(() => {
    return fullResponse?.totalBalance.fiatValue || 0;
  }, [fullResponse]);

  return {
    balances,
    fullResponse,
    loading,
    error,
    fetchAggregatedBalance,
    fetchBalancesByAssets,
    getBalanceForAsset,
    getAggregatedAssetDetails,
    getSpecificAssetBalances,
    getAccountAddresses,
    getTotalBalance,
  };
};
