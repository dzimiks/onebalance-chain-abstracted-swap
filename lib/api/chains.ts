import { apiClient } from '@/lib/api';

/**
 * Retrieve information about supported chains.
 */
export const chainsApi = {
  getChains: async () => {
    const response = await apiClient.get('?endpoint=/api/chains/supported-list');
    return response.data;
  },
};
