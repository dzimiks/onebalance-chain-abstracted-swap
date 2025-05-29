import { apiClient } from '@/lib/api';
import { Asset } from '@/lib/types/assets';

/**
 * Retrieve information about supported aggregated assets.
 */
export const assetsApi = {
  getAssets: async (): Promise<Asset[]> => {
    const response = await apiClient.get('/assets/list');
    return response.data;
  },
};
