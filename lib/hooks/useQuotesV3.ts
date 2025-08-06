import { useState, useCallback } from 'react';
import { quotesApi } from '@/lib/api/quotes';
import {
  QuoteRequestV3,
  QuoteV3,
  QuoteStatusV3,
  SolanaOperation,
  EVMOperation,
} from '@/lib/types/quote';
import { signSolanaOperation } from '@/lib/utils/solanaSigning';
import { signTypedDataWithPrivy } from '@/lib/utils/privySigningUtils';

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

  // Mixed signing function for both Solana and EVM operations
  const signMixedQuote = useCallback(
    async (quote: QuoteV3, solanaWallet?: any, evmWallet?: any): Promise<QuoteV3> => {
      console.log('Signing mixed quote with operations:', quote.originChainsOperations);

      const signedOperations = await Promise.all(
        quote.originChainsOperations.map(async operation => {
          // Handle Solana operations
          if ('type' in operation && operation.type === 'solana') {
            const solanaOp = operation as SolanaOperation;

            // Skip if already signed
            if (solanaOp.signature && solanaOp.signature !== '0x' && solanaOp.signature !== '') {
              console.log('Solana operation already signed:', solanaOp.signature);
              return solanaOp;
            }

            if (!solanaWallet) {
              throw new Error('Solana wallet required for Solana operations');
            }

            console.log('Signing Solana operation with dataToSign:', solanaOp.dataToSign);
            const signature = await signSolanaOperation(solanaOp.dataToSign, solanaWallet);

            return {
              ...solanaOp,
              signature: signature,
            };
          }

          // Handle EVM operations
          else if ('userOp' in operation && 'typedDataToSign' in operation) {
            const evmOp = operation as EVMOperation;

            // Skip if already signed
            if (
              evmOp.userOp.signature &&
              evmOp.userOp.signature !== '0x' &&
              evmOp.userOp.signature !== ''
            ) {
              console.log('EVM operation already signed:', evmOp.userOp.signature);
              return evmOp;
            }

            if (!evmWallet) {
              throw new Error('EVM wallet required for EVM operations');
            }

            console.log('Signing EVM operation with typedData:', evmOp.typedDataToSign);
            const signature = await signTypedDataWithPrivy(evmWallet)(evmOp.typedDataToSign);

            return {
              ...evmOp,
              userOp: {
                ...evmOp.userOp,
                signature: signature,
              },
            };
          }

          // Unknown operation type
          else {
            console.warn('Unknown operation type:', operation);
            return operation;
          }
        })
      );

      const signedQuote = {
        ...quote,
        originChainsOperations: signedOperations,
      };

      console.log('Mixed quote signed successfully:', signedQuote);
      return signedQuote;
    },
    []
  );

  const executeQuote = useCallback(
    async (quoteToExecute: QuoteV3, solanaWallet?: any, evmWallet?: any): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        console.log('Executing v3 quote:', quoteToExecute);

        // Sign the quote using mixed signing approach
        console.log('Signing mixed quote (Solana + EVM)...');
        const signedQuote = await signMixedQuote(quoteToExecute, solanaWallet, evmWallet);
        console.log('Mixed quote signed successfully');

        // Add a sanity check before execution
        console.log('Pre-execution validation:');
        console.log('- Quote ID exists:', !!signedQuote.id);
        console.log('- Has operations:', signedQuote.originChainsOperations?.length > 0);

        signedQuote.originChainsOperations.forEach((op, index) => {
          if ('type' in op && op.type === 'solana') {
            console.log(`- Solana operation ${index} signature:`, !!op.signature);
            console.log(`- Solana signature length:`, op.signature?.length);
          } else if ('userOp' in op) {
            console.log(`- EVM operation ${index} signature:`, !!op.userOp.signature);
            console.log(`- EVM signature length:`, op.userOp.signature?.length);
          }
        });

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
    [signMixedQuote]
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
