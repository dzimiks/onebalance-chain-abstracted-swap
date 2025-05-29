import { apiClient } from '@/lib/api';
import { Chain } from '@/lib/types/chains';

/**
 * Retrieve information about supported chains.
 */
export const chainsApi = {
  getChains: async (): Promise<Chain[]> => {
    const response = await apiClient.get('/chains/supported-list');
    return response.data;
  },
};
