import { apiClient } from '@/lib/api';

// Retrieve information about supported aggregated assets
export const assetsApi = {
  getAssets: async () => {
    const response = await apiClient.get('?endpoint=/api/assets/list');
    return response.data;
  },
};
