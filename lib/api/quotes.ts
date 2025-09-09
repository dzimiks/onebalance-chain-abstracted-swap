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
    try {
      const response = await apiClient.post('/v3/quote', request);

      // Check if response contains an error object even with 200 status
      if (response.data.error && response.data.statusCode) {
        console.log('API returned error in response body:', response.data);
        // Create a proper error to be caught by the error handler
        const error = new Error(`API Error: ${response.data.message}`);
        (error as any).response = { data: response.data };
        throw error;
      }

      return response.data;
    } catch (error) {
      console.log('Quote API error:', error);
      throw error;
    }
  },

  executeQuoteV3: async (quote: QuoteV3): Promise<any> => {
    const response = await apiClient.post('/v3/quote/execute-quote', quote);
    return response.data;
  },

  getQuoteStatusV3: async (quoteId: string): Promise<QuoteStatusV3> => {
    const response = await apiClient.get(`/v3/status/get-execution-status?quoteId=${quoteId}`);
    return response.data;
  },
};
