import { useState, useCallback } from 'react';
import { quotesApi } from '@/lib/api/quotes';
import { QuoteRequestV3, QuoteV3, QuoteStatusV3 } from '@/lib/types/quote';
import { signSolanaQuote } from '@/lib/utils/solanaSigning';

/**
 * Hook for managing v3 quotes (Solana and cross-chain operations)
 */
export const useQuotesV3 = () => {
  const [quote, setQuote] = useState<QuoteV3 | null>(null);
  const [status, setStatus] = useState<QuoteStatusV3 | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const getQuote = useCallback(async (request: QuoteRequestV3): Promise<QuoteV3 | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log('Requesting v3 quote:', request);
      const newQuote = await quotesApi.getQuoteV3(request);
      console.log('Received v3 quote:', newQuote);
      setQuote(newQuote);
      return newQuote;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get quote';
      console.error('Quote error:', err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const executeQuote = useCallback(
    async (quoteToExecute: QuoteV3, solanaWallet?: any): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        console.log('Executing v3 quote:', quoteToExecute);

        if (!solanaWallet) {
          throw new Error('Solana wallet required for Solana operations');
        }

        // Sign the quote (following working implementation pattern)
        console.log('Signing Solana quote...');
        const signedQuote = await signSolanaQuote(quoteToExecute, solanaWallet);
        console.log('Solana quote signed successfully');

        // Add a sanity check before execution
        console.log('Pre-execution validation:');
        console.log('- Quote ID exists:', !!signedQuote.id);
        console.log('- Has operations:', signedQuote.originChainsOperations?.length > 0);
        console.log(
          '- First operation has signature:',
          !!signedQuote.originChainsOperations[0]?.signature
        );
        console.log(
          '- Signature length:',
          signedQuote.originChainsOperations[0]?.signature?.length
        );

        console.log('About to execute signed quote. Final payload:', signedQuote);
        const result = await quotesApi.executeQuoteV3(signedQuote);
        console.log('Execution result:', result);

        // Start polling for status
        startPolling(quoteToExecute.id);

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to execute quote';
        console.error('Execution error:', err);
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const startPolling = useCallback((quoteId: string) => {
    setIsPolling(true);

    const poll = async () => {
      try {
        const newStatus = await quotesApi.getQuoteStatusV3(quoteId);
        setStatus(newStatus);

        if (
          newStatus.status === 'COMPLETED' ||
          newStatus.status === 'FAILED' ||
          newStatus.status === 'REFUNDED'
        ) {
          setIsPolling(false);
          return;
        }

        // Continue polling
        setTimeout(poll, 2000);
      } catch (err) {
        console.error('Polling error:', err);
        setIsPolling(false);
      }
    };

    poll();
  }, []);

  const resetQuote = useCallback(() => {
    setQuote(null);
    setStatus(null);
    setError(null);
    setIsPolling(false);
  }, []);

  return {
    quote,
    status,
    loading,
    error,
    isPolling,
    getQuote,
    executeQuote,
    resetQuote,
  };
};
