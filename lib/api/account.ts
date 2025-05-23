import { apiClient } from '@/lib/api';

/**
 * Manage account information and operations.
 */
export const accountApi = {
  predictAddress: async (sessionAddress: string, adminAddress: string): Promise<string> => {
    console.log({ sessionAddress, adminAddress });
    const response = await apiClient.post('?endpoint=/api/account/predict-address', { sessionAddress, adminAddress });
    return response.data?.predictedAddress;
  },
};
