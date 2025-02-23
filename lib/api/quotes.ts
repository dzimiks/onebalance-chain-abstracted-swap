import { apiClient } from '@/lib/api';
import type { QuoteRequest, Quote, QuoteStatus } from '@/lib/types/quote';

/**
 * Request and execute a quote for a transaction.
 */
export const quotesApi = {
  getQuote: async (request: QuoteRequest): Promise<Quote> => {
    const response = await apiClient.post('?endpoint=/api/quotes/swap-quote', request);
    return response.data;
  },

  executeQuote: async (quote: Quote): Promise<void> => {
    await apiClient.post('?endpoint=/api/quotes/execute-quote', quote);
  },

  getQuoteStatus: async (quoteId: string): Promise<QuoteStatus> => {
    const response = await apiClient.get(`?endpoint=/api/status/get-execution-status?quoteId=${quoteId}`);
    return response.data;
  },
};
