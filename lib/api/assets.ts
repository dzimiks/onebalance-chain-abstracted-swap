import { apiClient } from '@/lib/api';

export const assetsApi = {
  getAssets: async () => {
    const response = await apiClient.get('?endpoint=/api/assets/list');
    return response.data;
  },
};
