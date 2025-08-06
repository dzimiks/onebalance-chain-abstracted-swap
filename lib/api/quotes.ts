import { apiClient } from '@/lib/api';
import type {
  QuoteRequest,
  Quote,
  QuoteStatus,
  QuoteRequestV3,
  QuoteV3,
  QuoteStatusV3,
} from '@/lib/types/quote';

/**
 * Request and execute a quote for a transaction.
 */
export const quotesApi = {
  // Original v1 API for EVM operations
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

  // New v3 API for Solana and cross-chain operations
  getQuoteV3: async (request: QuoteRequestV3): Promise<QuoteV3> => {
    const response = await apiClient.post('/v3/quote', request);
    return response.data;
  },

  executeQuoteV3: async (quote: QuoteV3): Promise<any> => {
    const response = await apiClient.post('/v3/quote/execute', quote);
    return response.data;
  },

  getQuoteStatusV3: async (quoteId: string): Promise<QuoteStatusV3> => {
    const response = await apiClient.get(`/v3/status/get-execution-status?quoteId=${quoteId}`);
    return response.data;
  },
};
