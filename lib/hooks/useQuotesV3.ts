import { useState, useCallback } from 'react';
import { quotesApi } from '@/lib/api/quotes';
import {
  QuoteRequestV3,
  QuoteV3,
  QuoteStatusV3,
  SolanaOperation,
  EVMOperation,
} from '@/lib/types/quote';
import { signSolanaQuote, signSolanaOperationWithHook } from '@/lib/utils/solanaSigning';
import { signTypedDataWithPrivy, sequentialPromises } from '@/lib/utils/privySigningUtils';
import { processApiError, type ProcessedError } from '@/lib/utils/errorHandling';
import type { ConnectedStandardSolanaWallet } from '@privy-io/react-auth/solana';
import { useSignTransaction } from '@privy-io/react-auth/solana';

/**
 * Hook for managing v3 quotes (Solana and cross-chain operations)
 *
 * Contains two signing approaches for comparison:
 * 1. signMixedQuote: Single pass through operations, handles Solana/EVM in one loop
 * 2. signQuote: Sequential approach, signs Solana operations first, then EVM operations
 *
 * Currently using: signMixedQuote (more efficient, single pass)
 */
export const useQuotesV3 = () => {
  const [quote, setQuote] = useState<QuoteV3 | null>(null);
  const [status, setStatus] = useState<QuoteStatusV3 | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ProcessedError | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Privy v3 hook for signing Solana transactions
  const { signTransaction: signSolanaTransaction } = useSignTransaction();

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
      console.error('Quote error:', err);
      const processedError = processApiError(err);
      setError(processedError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign EVM operations using the proven pattern from useQuotes.ts
  const signEVMOperation = useCallback(
    (evmWallet: any) => (operation: EVMOperation) => async (): Promise<EVMOperation> => {
      const signature = await signTypedDataWithPrivy(evmWallet)(operation.typedDataToSign);
      return {
        ...operation,
        userOp: { ...operation.userOp, signature },
      };
    },
    []
  );

  // Mixed signing - single pass through operations (new approach)
  // Key difference: Uses sequential signing instead of Promise.all (parallel)
  const signMixedQuote = useCallback(
    async (
      quote: QuoteV3,
      solanaWallet?: ConnectedStandardSolanaWallet,
      evmWallet?: any
    ): Promise<QuoteV3> => {
      console.log('Signing mixed quote with operations:', quote.originChainsOperations.length);

      // Use sequential signing instead of parallel to match working approach
      const signedOperations = [];

      for (const operation of quote.originChainsOperations) {
        // Handle Solana operations
        if ('type' in operation && operation.type === 'solana') {
          const solanaOp = operation as SolanaOperation;

          // Skip if already signed
          if (solanaOp.signature && solanaOp.signature !== '0x' && solanaOp.signature !== '') {
            console.log('Solana operation already signed');
            signedOperations.push(solanaOp);
            continue;
          }

          if (!solanaWallet) {
            throw new Error('Solana wallet required for Solana operations');
          }

          console.log('Signing Solana operation...');
          const signature = await signSolanaOperationWithHook(
            solanaOp.dataToSign,
            solanaWallet,
            signSolanaTransaction
          );

          signedOperations.push({
            ...solanaOp,
            signature: signature,
          });
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
            console.log('EVM operation already signed');
            signedOperations.push(evmOp);
            continue;
          }

          if (!evmWallet) {
            throw new Error('EVM wallet required for EVM operations');
          }

          console.log('Signing EVM operation...');
          const signature = await signTypedDataWithPrivy(evmWallet)(evmOp.typedDataToSign);

          signedOperations.push({
            ...evmOp,
            userOp: {
              ...evmOp.userOp,
              signature: signature,
            },
          });
        }

        // Unknown operation type
        else {
          console.warn('Unknown operation type:', operation);
          signedOperations.push(operation);
        }
      }

      const signedQuote = {
        ...quote,
        originChainsOperations: signedOperations,
      };

      console.log('Mixed quote signing completed');
      return signedQuote;
    },
    [signSolanaTransaction]
  );

  // Sequential signing following useQuotes.ts pattern (original approach for comparison)
  const signQuote = useCallback(
    async (
      quote: QuoteV3,
      solanaWallet?: ConnectedStandardSolanaWallet,
      evmWallet?: any
    ): Promise<QuoteV3> => {
      console.log('Signing v3 quote with operations:', quote.originChainsOperations.length);

      let signedQuote = { ...quote };

      // Step 1: Sign Solana operations if present and wallet available
      if (solanaWallet) {
        console.log('Signing Solana operations...');
        signedQuote = await signSolanaQuote(signedQuote, solanaWallet);
      }

      // Step 2: Sign EVM operations if present and wallet available
      if (evmWallet) {
        const evmOperations = signedQuote.originChainsOperations.filter(
          (op): op is EVMOperation => 'userOp' in op && 'typedDataToSign' in op
        );

        if (evmOperations.length > 0) {
          console.log('Signing EVM operations...', evmOperations.length);
          const signWithEVM = signEVMOperation(evmWallet);

          // Sign EVM operations sequentially (following useQuotes.ts pattern)
          const signedEVMOps = await sequentialPromises(evmOperations.map(signWithEVM));

          // Replace EVM operations in the quote
          let evmIndex = 0;
          signedQuote.originChainsOperations = signedQuote.originChainsOperations.map(op => {
            if ('userOp' in op && 'typedDataToSign' in op) {
              return signedEVMOps[evmIndex++];
            }
            return op;
          });
        }
      }

      console.log('Quote signing completed');
      return signedQuote;
    },
    [signEVMOperation]
  );

  const executeQuote = useCallback(
    async (
      quoteToExecute: QuoteV3,
      solanaWallet?: ConnectedStandardSolanaWallet,
      evmWallet?: any
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        console.log('Executing v3 quote:', quoteToExecute.id);

        // Choose signing approach:
        // - signMixedQuote: Single pass through operations (new approach)
        // - signQuote: Sequential Solana then EVM signing (original approach)
        const signedQuote = await signMixedQuote(quoteToExecute, solanaWallet, evmWallet);

        // Validate before execution
        if (!signedQuote.id || signedQuote.originChainsOperations.length === 0) {
          throw new Error('Invalid signed quote');
        }

        // Execute the signed quote
        await quotesApi.executeQuoteV3(signedQuote);

        // Start polling for status
        startPolling(quoteToExecute.id);

        return true;
      } catch (err) {
        console.error('Execution error:', err);
        const processedError = processApiError(err);
        setError(processedError);
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
