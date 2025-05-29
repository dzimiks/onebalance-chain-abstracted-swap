import { apiClient } from '@/lib/api';

/**
 * Manage account information and operations.
 */
export const accountApi = {
  predictAddress: async (sessionAddress: string, adminAddress: string): Promise<string> => {
    const response = await apiClient.post('/account/predict-address', {
      sessionAddress,
      adminAddress,
    });
    return response.data?.predictedAddress;
  },
};
