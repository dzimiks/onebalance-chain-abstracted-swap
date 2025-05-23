import { useState, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { signQuote } from '@/lib/utils/privySigningUtils';
import { Quote, QuoteRequest } from '@/lib/types/quote';
import { accountApi } from '@/lib/api/account';
import { quotesApi } from '@/lib/api/quotes';

interface QuoteState {
  quote: Quote | null;
  status: any | null;
  loading: boolean;
  error: string | null;
}

// Simple interface for components to use
interface SimpleQuoteRequest {
  fromTokenAmount: string;
  fromAggregatedAssetId: string;
  toAggregatedAssetId: string;
}

export const useQuotes = () => {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');

  const [state, setState] = useState<QuoteState>({
    quote: null,
    status: null,
    loading: false,
    error: null,
  });

  const [predictedAddress, setPredictedAddress] = useState<string | null>(null);

  // Get the predicted address for the account
  const getPredictedAddress = useCallback(async () => {
    if (!embeddedWallet || !embeddedWallet.address) {
      return null;
    }

    try {
      // Use the same wallet address for both session and admin
      const address = embeddedWallet.address;
      const predicted = await accountApi.predictAddress(address, address);
      setPredictedAddress(predicted);
      return predicted;
    } catch (err) {
      console.error('Failed to predict address:', err);
      return null;
    }
  }, [embeddedWallet]);

  const resetQuote = useCallback(() => {
    setState({
      quote: null,
      status: null,
      loading: false,
      error: null,
    });
  }, []);

  const getQuote = useCallback(async (request: SimpleQuoteRequest) => {
    if (!authenticated || !embeddedWallet) {
      setState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Get or fetch the predicted address
      let predicted = predictedAddress;
      if (!predicted) {
        predicted = await getPredictedAddress();
        if (!predicted) {
          throw new Error('Failed to get account address');
        }
      }

      // Build the new v1 nested quote request format
      const v1QuoteRequest: QuoteRequest = {
        from: {
          account: {
            sessionAddress: embeddedWallet.address,
            adminAddress: embeddedWallet.address,
            accountAddress: predicted,
          },
          asset: {
            assetId: request.fromAggregatedAssetId,
          },
          amount: request.fromTokenAmount,
        },
        to: {
          asset: {
            assetId: request.toAggregatedAssetId,
          },
        },
      };

      // Get the quote
      const quote = await quotesApi.getQuote(v1QuoteRequest);

      setState(prev => ({ ...prev, quote, loading: false }));
      return quote;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to get quote',
        loading: false,
      }));
    }
  }, [authenticated, embeddedWallet, predictedAddress, getPredictedAddress]);

  const executeQuote = useCallback(async () => {
    if (!authenticated || !embeddedWallet) {
      setState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return;
    }

    if (!state.quote) {
      setState(prev => ({ ...prev, error: 'No quote to execute' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Validate the quote hasn't expired
      const expirationTime = parseInt(state.quote.expirationTimestamp) * 1000;
      if (Date.now() > expirationTime) {
        setState(prev => ({
          ...prev,
          error: 'Quote has expired',
          loading: false,
        }));
        return;
      }

      // Sign the quote with Privy
      const signedQuote = await signQuote(state.quote, embeddedWallet);

      // Execute the signed quote
      await quotesApi.executeQuote(signedQuote);

      // Start polling for status immediately after execution
      const pollStatus = async () => {
        try {
          const statusResponse = await quotesApi.getQuoteStatus(state.quote!.id);
          setState(prev => ({ ...prev, status: statusResponse }));

          if (statusResponse?.status === 'PENDING' || statusResponse?.status === 'IN_PROGRESS') {
            // Continue polling
            setTimeout(pollStatus, 1000);
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
  }, [state.quote, authenticated, embeddedWallet]);

  return {
    quote: state.quote,
    status: state.status,
    loading: state.loading,
    error: state.error,
    predictedAddress,
    getPredictedAddress,
    getQuote,
    executeQuote,
    resetQuote,
  };
};
