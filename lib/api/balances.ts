import { apiClient } from '@/lib/api';

/**
 * Track aggregated balances across multiple chains.
 */
export const balancesApi = {
  getAggregatedBalance: async (address: string): Promise<string> => {
    const response = await apiClient.get(`?endpoint=/api/balances/aggregated-balance?address=${address}`);
    return response.data;
  },
};
