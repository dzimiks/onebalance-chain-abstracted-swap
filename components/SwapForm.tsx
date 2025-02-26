import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ArrowDownUp, CircleCheck, TriangleAlert, Search } from 'lucide-react';
import { AssetSelect } from '@/components/AssetSelect';
import { QuoteDetails } from '@/components/QuoteDetails';
import { QuoteCountdown } from '@/components/QuoteCountdown';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAssets, useChains, useQuotes2, useBalances } from '@/lib/hooks';
import { Asset } from '@/lib/types/assets';
import { formatTokenAmount, parseTokenAmount } from '@/lib/utils/token';
import debounce from 'lodash.debounce';

export function SwapForm() {
  const { login, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');

  // Asset state
  const [sourceAsset, setSourceAsset] = useState<string>('ds:avax');
  const [targetAsset, setTargetAsset] = useState<string>('ds:usdc');

  // Amount state
  const [fromAmount, setFromAmount] = useState<string>('0.0008');
  const [parsedFromAmount, setParsedFromAmount] = useState('800000000000000');
  const [toAmount, setToAmount] = useState<string>('');

  // Search state
  const [assetSearch, setAssetSearch] = useState<string>('');

  // API data
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
  } = useQuotes2();

  // Balances
  const { balances, loading: balancesLoading } = useBalances(predictedAddress);

  const quoteStatus: string | null = status?.status?.status ?? null;
  const selectedSourceAsset: Asset | null = assets.find(asset => asset.aggregatedAssetId === sourceAsset) ?? null;
  const selectedTargetAsset: Asset | null = assets.find(asset => asset.aggregatedAssetId === targetAsset) ?? null;

  // Get user balances for each asset
  const getAssetBalance = useCallback((assetId: string) => {
    if (!balances?.balanceByAsset) return null;
    const assetBalance = balances.balanceByAsset.find(b => b.aggregatedAssetId === assetId);
    return assetBalance || null;
  }, [balances]);

  // Sort assets by balance (highest first)
  const sortedAssets = useCallback(() => {
    if (!balances?.balanceByAsset) return assets;

    return [...assets].sort((a, b) => {
      const aBalance = getAssetBalance(a.aggregatedAssetId);
      const bBalance = getAssetBalance(b.aggregatedAssetId);

      const aValue = aBalance?.fiatValue || 0;
      const bValue = bBalance?.fiatValue || 0;

      return bValue - aValue;
    });
  }, [assets, balances, getAssetBalance]);

  // Filter assets by search term
  const filteredAssets = useCallback(() => {
    if (!assetSearch) return sortedAssets();

    return sortedAssets().filter(asset =>
      asset.symbol.toLowerCase().includes(assetSearch.toLowerCase()) ||
      asset.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
      asset.aggregatedAssetId.toLowerCase().includes(assetSearch.toLowerCase())
    );
  }, [assetSearch, sortedAssets]);

  // Get the predicted address when wallet connects
  useEffect(() => {
    if (authenticated && embeddedWallet && !predictedAddress) {
      getPredictedAddress();
    }
  }, [authenticated, embeddedWallet, predictedAddress, getPredictedAddress]);

  // Update toAmount when quote is received
  useEffect(() => {
    if (quote && !quote.error && quote.destinationToken && selectedTargetAsset) {
      setToAmount(formatTokenAmount(
        quote.destinationToken.amount,
        selectedTargetAsset.decimals || 18
      ));
    } else {
      setToAmount('');
    }
  }, [quote, selectedTargetAsset]);

  // Debounce quote fetching
  const debouncedGetQuote = useCallback(
    debounce(async (request) => {
      await getQuote(request);
    }, 500),
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

  // Handle to amount change (currently read-only)
  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Currently to amount is read-only, derived from quote
    // Future: could implement reverse quote lookup
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
      login();
      return;
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

  // Loading state
  if (assetsLoading || chainsLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto p-6">
        <div className="text-center">Loading...</div>
      </Card>
    );
  }

  // Error state
  if (assetsError || chainsError) {
    return (
      <Card className="w-full max-w-lg mx-auto p-6">
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>An error occurred</AlertTitle>
          <AlertDescription>
            {assetsError || chainsError}
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  // Get balance for display
  const sourceBalance = getAssetBalance(sourceAsset);
  const targetBalance = getAssetBalance(targetAsset);

  return (
    <Card className="w-full max-w-lg mx-auto p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">OneBalance Cross-Chain Swap</h2>
        </div>

        <div className="space-y-4">
          {/* From Section */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-sm font-medium">From Asset</label>
              {sourceBalance && (
                <span className="text-sm text-gray-500">
                  Balance: {formatTokenAmount(sourceBalance.balance, selectedSourceAsset?.decimals || 18)}
                  {" "}(${sourceBalance.fiatValue.toFixed(2)})
                </span>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search assets..."
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
                className="pl-9 mb-1"
              />
            </div>

            <AssetSelect
              assets={filteredAssets()}
              value={sourceAsset}
              onValueChange={(value) => {
                setSourceAsset(value);
                setAssetSearch('');
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
                  Balance: {formatTokenAmount(targetBalance.balance, selectedTargetAsset?.decimals || 18)}
                  {" "}(${targetBalance.fiatValue.toFixed(2)})
                </span>
              )}
            </div>

            <AssetSelect
              assets={sortedAssets()}
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
              onChange={handleToAmountChange}
              disabled={true} // Read-only
              className="text-lg h-14 p-4 bg-gray-50"
            />
          </div>

          {!authenticated && (
            <Alert variant="info">
              <AlertTitle>Connect Wallet</AlertTitle>
              <AlertDescription>
                Please connect your wallet to execute swaps
              </AlertDescription>
            </Alert>
          )}

          {authenticated && fromAmount && parsedFromAmount && !quote && !loading && (
            <Alert variant="info">
              <AlertTitle>Getting quote...</AlertTitle>
              <AlertDescription>
                Please wait while we find the best rate for your swap
              </AlertDescription>
            </Alert>
          )}

          {(!quote || quote?.error) ? (
            <Button
              className="w-full"
              onClick={handleGetQuote}
              disabled={!sourceAsset || !targetAsset || !fromAmount || loading}
            >
              {!authenticated ? 'Connect Wallet' :
                loading ? 'Getting Quote...' :
                  'Get Quote'}
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

          {error && (
            <Alert variant="destructive">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>An error occurred</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {quoteStatus === 'COMPLETED' && (
            <Alert variant="success">
              <CircleCheck className="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Swap completed successfully!
              </AlertDescription>
            </Alert>
          )}

          {quote?.error && (
            <Alert variant="destructive">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Quote Error</AlertTitle>
              <AlertDescription>
                {quote?.message}
              </AlertDescription>
            </Alert>
          )}

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
}
