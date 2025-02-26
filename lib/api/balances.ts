import { apiClient } from '@/lib/api';
import { BalancesResponse } from '@/lib/types/balances';

/**
 * Track aggregated balances across multiple chains.
 */
export const balancesApi = {
  getAggregatedBalance: async (address: string): Promise<BalancesResponse> => {
    const response = await apiClient.get(`?endpoint=/api/balances/aggregated-balance?address=${address}`);
    return response.data;
  },
};
