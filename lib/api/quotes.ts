import { apiClient } from '@/lib/api';
import type { QuoteRequest, Quote, QuoteStatus } from '@/lib/types/quote';

/**
 * Request and execute a quote for a transaction.
 */
export const quotesApi = {
  getQuote: async (request: QuoteRequest): Promise<Quote> => {
    const response = await apiClient.post('/v1/quote', request);
    return response.data;
  },

  executeQuote: async (quote: Quote): Promise<any> => {
    const response = await apiClient.post('/quotes/execute-quote', quote);
    return response.data;
  },

  getQuoteStatus: async (quoteId: string): Promise<QuoteStatus> => {
    const response = await apiClient.get(`/status/get-execution-status?quoteId=${quoteId}`);
    return response.data;
  },
};
