import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ArrowDownUp, TriangleAlert } from 'lucide-react';
import { TokenInput } from '@/components/TokenInput';
import { QuoteDetails } from '@/components/QuoteDetails';
import { QuoteCountdown } from '@/components/QuoteCountdown';
import { TransactionStatus } from '@/components/TransactionStatus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAssets, useChains, useQuotes, useBalances } from '@/lib/hooks';
import { Asset } from '@/lib/types/assets';
import { formatTokenAmount, parseTokenAmount } from '@/lib/utils/token';
import debounce from 'lodash.debounce';

export const SwapForm = () => {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');

  // Asset state
  const [sourceAsset, setSourceAsset] = useState<string>('ds:usdc');
  const [targetAsset, setTargetAsset] = useState<string>('ds:eth');

  // Amount state
  const [fromAmount, setFromAmount] = useState<string>('');
  const [parsedFromAmount, setParsedFromAmount] = useState('');
  const [toAmount, setToAmount] = useState<string>('');

  // API data hooks
  const { assets, loading: assetsLoading, error: assetsError } = useAssets();
  const { loading: chainsLoading, error: chainsError } = useChains();
  const {
    quote,
    status,
    loading,
    error,
    predictedAddress,
    getPredictedAddress,
    getQuote,
    executeQuote,
    resetQuote,
    isPolling,
  } = useQuotes();

  // Balances
  const { balances, fetchBalances } = useBalances(predictedAddress);

  // Use state for dynamically tracking balances
  const [sourceBalance, setSourceBalance] = useState(null);
  const [targetBalance, setTargetBalance] = useState(null);

  // Helper function to check if user has sufficient balance
  const hasSufficientBalance = (amount: string) => {
    if (!sourceBalance || !selectedSourceAsset || !amount) return false;

    try {
      const parsedAmount = parseTokenAmount(amount, selectedSourceAsset.decimals || 18);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return BigInt(sourceBalance.balance) >= BigInt(parsedAmount);
    } catch {
      return false;
    }
  };

  // Calculate USD value for destination token from quote
  const getDestinationUSDValue = () => {
    if (quote && !(quote as any)?.error && (quote as any)?.destinationToken && toAmount) {
      const fiatValue = (quote as any).destinationToken.fiatValue;
      if (fiatValue) {
        const numericValue = typeof fiatValue === 'number' ? fiatValue : parseFloat(fiatValue);
        return !isNaN(numericValue) ? numericValue.toFixed(2) : null;
      }
    }
    return null;
  };

  // Get selected assets
  const selectedSourceAsset: Asset | null =
    assets.find(asset => asset.aggregatedAssetId === sourceAsset) ?? null;
  const selectedTargetAsset: Asset | null =
    assets.find(asset => asset.aggregatedAssetId === targetAsset) ?? null;

  // Update balance state when balances or selected assets change
  useEffect(() => {
    if (balances?.balanceByAggregatedAsset) {
      const newSourceBalance =
        balances.balanceByAggregatedAsset.find(b => b.aggregatedAssetId === sourceAsset) || null;
      const newTargetBalance = balances.balanceByAggregatedAsset.find(
        b => b.aggregatedAssetId === targetAsset
      );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      setSourceBalance(newSourceBalance || null);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      setTargetBalance(newTargetBalance || null);
    }
  }, [balances, sourceAsset, targetAsset]);

  // Update toAmount when quote is received
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (quote && !quote.error && quote.destinationToken && selectedTargetAsset) {
      setToAmount(
        formatTokenAmount(quote.destinationToken.amount, selectedTargetAsset.decimals || 18)
      );
    } else {
      setToAmount('');
    }
  }, [quote, selectedTargetAsset]);

  // Get the predicted address when wallet connects
  useEffect(() => {
    if (authenticated && embeddedWallet && !predictedAddress) {
      getPredictedAddress();
    }
  }, [authenticated, embeddedWallet, predictedAddress, getPredictedAddress]);

  // Reset everything after a successful swap
  useEffect(() => {
    if (status?.status === 'COMPLETED') {
      setFromAmount('');
      setToAmount('');
      setParsedFromAmount('');
      resetQuote();
    }
  }, [status]);

  // Debounce quote fetching to reduce API calls
  const debouncedGetQuote = useCallback(
    debounce(async request => {
      await getQuote(request);
    }, 1000),
    [getQuote]
  );

  // Handle from amount change
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Validate number format
    if (!/^(\d*\.?\d*)?$/.test(value)) return;

    setFromAmount(value);

    if (value && selectedSourceAsset) {
      const parsed = parseTokenAmount(value, selectedSourceAsset.decimals || 18);
      setParsedFromAmount(parsed);

      // Only fetch quote if user has sufficient balance
      if (
        authenticated &&
        embeddedWallet &&
        sourceAsset &&
        targetAsset &&
        hasSufficientBalance(value)
      ) {
        debouncedGetQuote({
          fromTokenAmount: parsed,
          fromAggregatedAssetId: sourceAsset,
          toAggregatedAssetId: targetAsset,
        });
      } else {
        // Clear quote if insufficient balance
        resetQuote();
      }
    } else {
      setParsedFromAmount('');
      setToAmount('');
      resetQuote();
    }
  };

  // Asset switching
  const handleSwapDirection = () => {
    setSourceAsset(targetAsset);
    setTargetAsset(sourceAsset);

    // Reset amounts when switching directions
    setFromAmount('');
    setToAmount('');
    setParsedFromAmount('');
    resetQuote();
  };

  // Quote expiration handler
  const handleQuoteExpire = async () => {
    if (sourceAsset && targetAsset && parsedFromAmount) {
      await getQuote({
        fromTokenAmount: parsedFromAmount,
        fromAggregatedAssetId: sourceAsset,
        toAggregatedAssetId: targetAsset,
      });
    }
  };

  // Transaction completion handler
  const handleTransactionComplete = useCallback(() => {
    // Clear the form
    setFromAmount('');
    setToAmount('');
    setParsedFromAmount('');
    resetQuote();

    // Refresh balances after transaction completion
    if (predictedAddress) {
      fetchBalances();
    }
  }, [predictedAddress, fetchBalances, resetQuote]);

  // Get swap button state
  const getSwapButtonState = () => {
    if (!authenticated) {
      return { disabled: true, text: 'Login to Swap' };
    }

    if (loading && status?.status === 'PENDING') {
      return { disabled: true, text: 'Executing Swap...' };
    }

    if (loading) {
      return { disabled: true, text: 'Getting Quote...' };
    }

    // Check for insufficient balance first
    if (fromAmount && !hasSufficientBalance(fromAmount)) {
      return { disabled: true, text: 'Insufficient Balance' };
    }

    const isDisabled =
      !sourceAsset ||
      !targetAsset ||
      !fromAmount ||
      !quote ||
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      quote?.error;

    return { disabled: isDisabled, text: 'Swap' };
  };

  // Balance state is now managed via useState

  // Loading state
  if (assetsLoading || chainsLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading assets...</p>
        </div>
      </Card>
    );
  }

  // Error state
  if (assetsError || chainsError) {
    return (
      <Card className="w-full max-w-lg mx-auto p-6">
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Failed to load</AlertTitle>
          <AlertDescription>{assetsError || chainsError}</AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto p-6" data-onboarding="main-card">
      <div className="space-y-6">
        <h2 className="text-center text-2xl font-bold text-foreground">Swap Tokens</h2>

        <div className="space-y-4">
          {/* From Token Input */}
          <div data-onboarding="from-token">
            <TokenInput
              label="Sell"
              assets={assets}
              selectedAsset={sourceAsset}
              onAssetChange={value => {
                setSourceAsset(value);
                if (fromAmount && value !== sourceAsset) {
                  // Refresh quote when asset changes
                  const asset = assets.find(a => a.aggregatedAssetId === value);
                  if (asset) {
                    const parsed = parseTokenAmount(fromAmount, asset.decimals || 18);
                    setParsedFromAmount(parsed);

                    // Check balance before fetching quote
                    if (
                      authenticated &&
                      embeddedWallet &&
                      targetAsset &&
                      hasSufficientBalance(fromAmount)
                    ) {
                      debouncedGetQuote({
                        fromTokenAmount: parsed,
                        fromAggregatedAssetId: value,
                        toAggregatedAssetId: targetAsset,
                      });
                    } else {
                      resetQuote();
                    }
                  }
                }
              }}
              amount={fromAmount}
              onAmountChange={handleFromAmountChange}
              balance={sourceBalance}
              showPercentageButtons={true}
              onPercentageClick={percentage => {
                if (sourceBalance && selectedSourceAsset) {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                  const balance = sourceBalance.balance;
                  const decimals = selectedSourceAsset.decimals || 18;
                  const maxAmount = formatTokenAmount(balance, decimals);
                  const targetAmount = ((parseFloat(maxAmount) * percentage) / 100).toString();

                  setFromAmount(targetAmount);

                  // Update parsed amount and trigger quote
                  const parsed = parseTokenAmount(targetAmount, decimals);
                  setParsedFromAmount(parsed);

                  // Check balance before fetching quote (should always be sufficient for percentage clicks)
                  if (
                    authenticated &&
                    embeddedWallet &&
                    sourceAsset &&
                    targetAsset &&
                    hasSufficientBalance(targetAmount)
                  ) {
                    debouncedGetQuote({
                      fromTokenAmount: parsed,
                      fromAggregatedAssetId: sourceAsset,
                      toAggregatedAssetId: targetAsset,
                    });
                  }
                }
              }}
              disabled={loading}
              balances={balances?.balanceByAggregatedAsset}
            />
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapDirection}
              disabled={loading}
              className="rounded-full h-10 w-10 bg-background border-2"
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          {/* To Token Input */}
          <div data-onboarding="to-token">
            <TokenInput
              label="Buy"
              assets={assets}
              selectedAsset={targetAsset}
              onAssetChange={value => {
                setTargetAsset(value);
                if (fromAmount && parsedFromAmount && value !== targetAsset) {
                  // Refresh quote when target asset changes
                  if (authenticated && embeddedWallet && sourceAsset) {
                    debouncedGetQuote({
                      fromTokenAmount: parsedFromAmount,
                      fromAggregatedAssetId: sourceAsset,
                      toAggregatedAssetId: value,
                    });
                  }
                }
              }}
              amount={toAmount}
              onAmountChange={() => {}} // No-op since it's read-only
              balance={targetBalance}
              usdValue={getDestinationUSDValue()}
              showPercentageButtons={false}
              disabled={loading}
              readOnly={true}
              balances={balances?.balanceByAggregatedAsset}
            />
          </div>

          {/* Quote Loading Alert */}
          {authenticated && fromAmount && parsedFromAmount && !quote && loading && (
            <Alert>
              <AlertTitle>Getting quote...</AlertTitle>
              <AlertDescription>
                Please wait while we find the best rate for your swap
              </AlertDescription>
            </Alert>
          )}

          {/* Swap Button */}
          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={executeQuote}
              disabled={getSwapButtonState().disabled}
              data-onboarding="swap-button"
            >
              {getSwapButtonState().text}
            </Button>

            {/* Cancel button only shows when there's a quote */}
            {/*  eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/*@ts-expect-error*/}
            {quote && !quote?.error && (
              <Button variant="outline" className="w-full" onClick={resetQuote} disabled={loading}>
                Cancel Quote
              </Button>
            )}
          </div>

          {/* Error Handling */}
          {error && (
            <Alert variant="destructive">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>An error occurred</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Quote Error */}
          {/*  eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/*@ts-expect-error*/}
          {quote?.error && (
            <Alert variant="destructive">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Quote Error</AlertTitle>
              <AlertDescription>
                {/*  eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/*@ts-expect-error*/}
                {quote?.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Quote Details */}
          {/*  eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/*@ts-expect-error*/}
          {!quote?.error && quote?.originToken && (
            <div className="space-y-4" data-onboarding="quote-details">
              <QuoteCountdown
                expirationTimestamp={parseInt(quote.expirationTimestamp)}
                onExpire={handleQuoteExpire}
              />
              <QuoteDetails
                quote={{
                  ...quote,
                  originToken: {
                    ...quote.originToken,
                    amount: formatTokenAmount(
                      quote.originToken.amount,
                      selectedSourceAsset?.decimals ?? 18
                    ),
                  },
                  destinationToken: {
                    ...quote.destinationToken,
                    amount: formatTokenAmount(
                      quote.destinationToken.amount,
                      assets.find(
                        a => a.aggregatedAssetId === quote.destinationToken.aggregatedAssetId
                      )?.decimals ?? 18
                    ),
                  },
                }}
              />
            </div>
          )}

          {/* Transaction Status */}
          <TransactionStatus
            status={status}
            isPolling={isPolling}
            onComplete={handleTransactionComplete}
          />
        </div>
      </div>
    </Card>
  );
};
