import { useState, useCallback } from 'react';
import { quotesApi } from '@/lib/api/quotes';
import type { QuoteRequest, Quote, QuoteStatus } from '@/lib/types/quote';

interface QuoteState {
  quote: Quote | null;
  status: QuoteStatus | null;
  loading: boolean;
  error: string | null;
}

interface UseQuotesReturn extends QuoteState {
  getQuote: (request: QuoteRequest) => Promise<void>;
  executeQuote: () => Promise<void>;
  resetQuote: () => void;
}

export const useQuotes = (): UseQuotesReturn => {
  const [state, setState] = useState<QuoteState>({
    quote: null,
    status: null,
    loading: false,
    error: null,
  });
  console.log({ state });

  const resetQuote = useCallback(() => {
    setState({
      quote: null,
      status: null,
      loading: false,
      error: null,
    });
  }, []);

  const getQuote = useCallback(async (request: QuoteRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const quote = await quotesApi.getQuote(request);
      setState(prev => ({ ...prev, quote, loading: false }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to get quote',
        loading: false,
      }));
    }
  }, []);

  const executeQuote = useCallback(async () => {
    if (!state.quote) {
      setState(prev => ({ ...prev, error: 'No quote to execute' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // First validate the quote hasn't expired
      const expirationTime = parseInt(state.quote.expirationTimestamp) * 1000;

      if (Date.now() > expirationTime) {
        setState(prev => ({
          ...prev,
          error: 'Quote has expired',
          loading: false,
        }));

        return;
      }

      const resp = await quotesApi.executeQuote(state.quote);
      console.log({ response: resp });
      if (resp?.error) {
        setState(prev => ({
          ...prev,
          error: resp?.message || 'Failed to execute quote',
          loading: false,
        }));
      }

      // Start polling for status
      const pollStatus = async () => {
        try {
          const statusResponse = await quotesApi.getQuoteStatus(state.quote!.id);
          setState(prev => ({ ...prev, status: statusResponse }));

          if (statusResponse?.status?.status === 'PENDING') {
            // Poll every 2 seconds
            setTimeout(pollStatus, 2000);
          } else {
            setState(prev => ({ ...prev, loading: false }));
          }
        } catch (err) {
          setState(prev => ({
            ...prev,
            error: err instanceof Error ? err.message : 'Failed to get status',
            loading: false,
          }));
        }
      };

      pollStatus();
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to execute quote',
        loading: false,
      }));
    }
  }, [state.quote]);

  return {
    ...state,
    getQuote,
    executeQuote,
    resetQuote,
  };
};
