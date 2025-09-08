import { apiClient } from '@/lib/api';
import { BalancesResponse, BalancesResponseV3, BalanceParamsV3 } from '@/lib/types/balances';

/**
 * Track aggregated balances across multiple chains.
 */
export const balancesApi = {
  // Legacy v2 API for single EVM addresses
  getAggregatedBalance: async (address: string): Promise<BalancesResponse> => {
    const response = await apiClient.get(`/v2/balances/aggregated-balance?address=${address}`);
    return response.data;
  },

  // New v3 API for multi-account (EVM + Solana) balance queries
  getAggregatedBalanceV3: async (params: BalanceParamsV3): Promise<BalancesResponseV3> => {
    const queryParams = new URLSearchParams({
      account: params.account,
    });

    // At least one of aggregatedAssetId or assetId must be provided
    if (params.aggregatedAssetId) {
      queryParams.append('aggregatedAssetId', params.aggregatedAssetId);
    }

    if (params.assetId) {
      queryParams.append('assetId', params.assetId);
    }

    // Ensure at least one filter is provided (API requirement)
    if (!params.aggregatedAssetId && !params.assetId) {
      throw new Error('At least one of aggregatedAssetId or assetId must be provided');
    }

    const response = await apiClient.get(
      `/v3/balances/aggregated-balance?${queryParams.toString()}`
    );
    return response.data;
  },
};
