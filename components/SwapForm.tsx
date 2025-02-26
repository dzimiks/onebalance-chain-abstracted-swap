import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ArrowDownUp, CircleCheck, TriangleAlert } from 'lucide-react';
import { AssetSelect } from '@/components/AssetSelect';
import { QuoteDetails } from '@/components/QuoteDetails';
import { QuoteCountdown } from '@/components/QuoteCountdown';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAssets, useChains, useQuotes, useBalances } from '@/lib/hooks';
import { Asset } from '@/lib/types/assets';
import { formatTokenAmount, parseTokenAmount } from '@/lib/utils/token';
import debounce from 'lodash.debounce';

export const SwapForm = () => {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');

  // Asset state
  const [sourceAsset, setSourceAsset] = useState<string>('ds:usdt');
  const [targetAsset, setTargetAsset] = useState<string>('');

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
  } = useQuotes();

  // Balances
  const { balances } = useBalances(predictedAddress);

  // Use state for dynamically tracking balances
  const [sourceBalance, setSourceBalance] = useState(null);
  const [targetBalance, setTargetBalance] = useState(null);

  // Get selected assets
  const selectedSourceAsset: Asset | null = assets.find(asset => asset.aggregatedAssetId === sourceAsset) ?? null;
  const selectedTargetAsset: Asset | null = assets.find(asset => asset.aggregatedAssetId === targetAsset) ?? null;
  const quoteStatus: string | null = status?.status?.status ?? null;

  // Update balance state when balances or selected assets change
  useEffect(() => {
    if (balances?.balanceByAsset) {
      const newSourceBalance = balances.balanceByAsset.find(b => b.aggregatedAssetId === sourceAsset) || null;
      const newTargetBalance = balances.balanceByAsset.find(b => b.aggregatedAssetId === targetAsset);

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
      setToAmount(formatTokenAmount(
        quote.destinationToken.amount,
        selectedTargetAsset.decimals || 18,
      ));
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

  // Debounce quote fetching to reduce API calls
  const debouncedGetQuote = useCallback(
    debounce(async (request) => {
      await getQuote(request);
    }, 1000),
    [getQuote],
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

      // Auto-refresh quote
      if (authenticated && embeddedWallet && sourceAsset && targetAsset) {
        debouncedGetQuote({
          fromTokenAmount: parsed,
          fromAggregatedAssetId: sourceAsset,
          toAggregatedAssetId: targetAsset,
        });
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

  // Manual quote fetching button handler
  const handleGetQuote = async () => {
    if (!sourceAsset || !targetAsset || !parsedFromAmount) return;

    if (!authenticated || !embeddedWallet) {
      return; // ConnectButton will handle this
    }

    await getQuote({
      fromTokenAmount: parsedFromAmount,
      fromAggregatedAssetId: sourceAsset,
      toAggregatedAssetId: targetAsset,
    });
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

  // Balance state is now managed via useState

  // Loading state
  if (assetsLoading || chainsLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading assets and chains...</p>
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
          <AlertDescription>
            {assetsError || chainsError}
          </AlertDescription>
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
    <Card className="w-full max-w-lg mx-auto p-6">
      <div className="space-y-6">
        <h2 className="text-center text-2xl font-bold">OneBalance Cross-Chain Swap</h2>

        <div className="space-y-4">
          {/* From Section */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-sm font-medium">From Asset</label>
              {sourceBalance && (
                <span className="text-sm text-gray-500">
                  {/*  eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/*@ts-expect-error*/}
                  Balance: {formatTokenAmount(sourceBalance.balance, selectedSourceAsset?.decimals || 18)}
                  {/*  eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/*@ts-expect-error*/}
                  {' '}(${sourceBalance.fiatValue?.toFixed(2)})
                </span>
              )}
            </div>

            <AssetSelect
              assets={assets}
              value={sourceAsset}
              onValueChange={(value) => {
                setSourceAsset(value);
                if (fromAmount && value !== sourceAsset) {
                  // Refresh quote when asset changes
                  const asset = assets.find(a => a.aggregatedAssetId === value);
                  if (asset) {
                    const parsed = parseTokenAmount(fromAmount, asset.decimals || 18);
                    setParsedFromAmount(parsed);

                    if (authenticated && embeddedWallet && targetAsset) {
                      debouncedGetQuote({
                        fromTokenAmount: parsed,
                        fromAggregatedAssetId: value,
                        toAggregatedAssetId: targetAsset,
                      });
                    }
                  }
                }
              }}
              label=""
              disabled={loading}
              showBalances={true}
              balances={balances?.balanceByAsset}
            />
          </div>

          {/* From Amount Input */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="text"
              placeholder="0.0"
              value={fromAmount}
              onChange={handleFromAmountChange}
              disabled={loading}
              className="text-lg h-14 p-4"
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

          {/* To Section */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-sm font-medium">To Asset</label>
              {targetBalance && (
                <span className="text-sm text-gray-500">
                  {/*  eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/*@ts-expect-error*/}
                  Balance: {formatTokenAmount(targetBalance.balance, selectedTargetAsset?.decimals || 18)}
                  {/*  eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/*@ts-expect-error*/}
                  {' '}(${targetBalance.fiatValue?.toFixed(2)})
                </span>
              )}
            </div>

            <AssetSelect
              assets={assets}
              value={targetAsset}
              onValueChange={(value) => {
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
              label=""
              disabled={loading}
              showBalances={true}
              balances={balances?.balanceByAsset}
            />
          </div>

          {/* To Amount Input */}
          <div className="space-y-1">
            <label className="text-sm font-medium">You will receive (estimated)</label>
            <Input
              type="text"
              placeholder="0.0"
              value={toAmount}
              readOnly
              disabled={true}
              className="text-lg h-14 p-4 bg-gray-50"
            />
          </div>

          {/* Wallet Connection Alert */}
          {!authenticated && (
            <Alert variant="info">
              <AlertTitle>Connect Wallet</AlertTitle>
              <AlertDescription>
                Please connect your wallet to execute swaps
              </AlertDescription>
            </Alert>
          )}

          {/* Quote Loading Alert */}
          {authenticated && fromAmount && parsedFromAmount && !quote && loading && (
            <Alert>
              <AlertTitle>Getting quote...</AlertTitle>
              <AlertDescription>
                Please wait while we find the best rate for your swap
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          {/*  eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/*@ts-expect-error*/}
          {(!quote || quote?.error) ? (
            <Button
              className="w-full"
              onClick={handleGetQuote}
              disabled={(!sourceAsset || !targetAsset || !fromAmount || loading)}
            >
              {loading ? 'Getting Quote...' : 'Get Quote'}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={executeQuote}
                disabled={loading || !authenticated}
              >
                {loading && quoteStatus === 'PENDING' ? 'Executing Swap...' : 'Sign & Swap'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={resetQuote}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Error Handling */}
          {error && (
            <Alert variant="destructive">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>An error occurred</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {quoteStatus === 'COMPLETED' && (
            <Alert variant="success">
              <CircleCheck className="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Swap completed successfully!
              </AlertDescription>
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
            <div className="space-y-4">
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
                      selectedSourceAsset?.decimals ?? 18,
                    ),
                  },
                  destinationToken: {
                    ...quote.destinationToken,
                    amount: formatTokenAmount(
                      quote.destinationToken.amount,
                      assets.find(a => a.aggregatedAssetId === quote.destinationToken.aggregatedAssetId)?.decimals ?? 18,
                    ),
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
