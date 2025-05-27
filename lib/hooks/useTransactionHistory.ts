import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionHistoryParams } from '@/lib/types/transaction';
import { transactionsApi } from '@/lib/api/transactions';

export const useTransactionHistory = (userAddress?: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [continuation, setContinuation] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);

  const fetchTransactionHistory = useCallback(async (params: TransactionHistoryParams) => {
    if (!params.user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await transactionsApi.getTransactionHistory(params);

      if (params.continuation) {
        // Append to existing transactions for pagination
        setTransactions(prev => [...prev, ...data.transactions]);
      } else {
        // Replace transactions for initial load or refresh
        setTransactions(data.transactions);
      }

      setContinuation(data.continuation);
      setHasMore(!!data.continuation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction history');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInitial = useCallback(
    (limit: number = 10) => {
      if (!userAddress) return;

      setTransactions([]);
      setContinuation(undefined);
      setHasMore(true);

      fetchTransactionHistory({
        user: userAddress,
        limit,
      });
    },
    [userAddress, fetchTransactionHistory]
  );

  const loadMore = useCallback(
    (limit: number = 10) => {
      if (!userAddress || !continuation || loading) return;

      fetchTransactionHistory({
        user: userAddress,
        limit,
        continuation,
      });
    },
    [userAddress, continuation, loading, fetchTransactionHistory]
  );

  const refresh = useCallback(() => {
    loadInitial();
  }, [loadInitial]);

  // Auto-load when user address changes
  useEffect(() => {
    if (userAddress) {
      loadInitial();
    }
  }, [userAddress, loadInitial]);

  return {
    transactions,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    loadInitial,
  };
};
