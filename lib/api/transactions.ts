import { apiClient } from '@/lib/api';
import { TransactionHistoryResponse, TransactionHistoryParams } from '@/lib/types/transaction';

/**
 * Retrieve transaction history and status information.
 */
export const transactionsApi = {
  getTransactionHistory: async (
    params: TransactionHistoryParams
  ): Promise<TransactionHistoryResponse> => {
    const queryParams = new URLSearchParams({
      user: params.user,
      limit: params.limit.toString(),
    });

    if (params.continuation) {
      queryParams.append('continuation', params.continuation);
    }

    const response = await apiClient.get(`/status/get-tx-history?${queryParams.toString()}`);
    return response.data;
  },
};
