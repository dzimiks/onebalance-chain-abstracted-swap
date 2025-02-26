import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ArrowDownUp, CircleCheck, TriangleAlert } from 'lucide-react';
import { AssetSelect } from '@/components/AssetSelect';
import { QuoteDetails } from '@/components/QuoteDetails';
import { AmountInput } from '@/components/AmountInput';
import { QuoteCountdown } from '@/components/QuoteCountdown';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAssets, useChains, useQuotes2 } from '@/lib/hooks';
import { Asset } from '@/lib/types/assets';
import { formatTokenAmount } from '@/lib/utils/token';

export function SwapForm2() {
  const { login, authenticated } = usePrivy();
  const { wallets } = useWallets();
  // const embeddedWallet = wallets[0];
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');

  const [sourceAsset, setSourceAsset] = useState<string>('ds:avax');
  const [targetAsset, setTargetAsset] = useState<string>('ds:usdc');
  const [sourceChain, setSourceChain] = useState<string>('43114');
  const [targetChain, setTargetChain] = useState<string>('42161');
  const [amount, setAmount] = useState<string>(formatTokenAmount('800000000000000', 18));
  const [parsedAmount, setParsedAmount] = useState('800000000000000');

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

  const quoteStatus: string | null = status?.status?.status ?? null;
  const selectedSourceAsset: Asset | null = assets.find(asset => asset.aggregatedAssetId === sourceAsset) ?? null;

  // Get the predicted address when wallet connects
  useEffect(() => {
    if (authenticated && embeddedWallet && !predictedAddress) {
      getPredictedAddress();
    }
  }, [authenticated, embeddedWallet, predictedAddress, getPredictedAddress]);

  const handleSwapDirection = () => {
    setSourceAsset(targetAsset);
    setTargetAsset(sourceAsset);
    setSourceChain(targetChain);
    setTargetChain(sourceChain);
  };

  const handleAmountChange = (inputValue: string, parsedValue: string) => {
    setAmount(inputValue);
    setParsedAmount(parsedValue);
  };

  const handleGetQuote = async () => {
    if (!sourceAsset || !targetAsset || !parsedAmount) return;
    if (!authenticated || !embeddedWallet) {
      login();
      return;
    }

    await getQuote({
      fromTokenAmount: parsedAmount,
      fromAggregatedAssetId: sourceAsset,
      toAggregatedAssetId: targetAsset,
    });
  };

  const handleQuoteExpire = async () => {
    if (sourceAsset && targetAsset && parsedAmount) {
      await getQuote({
        fromTokenAmount: parsedAmount,
        fromAggregatedAssetId: sourceAsset,
        toAggregatedAssetId: targetAsset,
      });
    }
  };

  if (assetsLoading || chainsLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto p-6">
        <div className="text-center">Loading...</div>
      </Card>
    );
  }

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

  console.log({ predictedAddress });
  return (
    <Card className="w-full max-w-lg mx-auto p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">OneBalance Cross-Chain Swap</h2>
        </div>

        <div className="space-y-4">
          {/* From Section */}
          <div className="space-y-2">
            <AssetSelect
              assets={assets}
              value={sourceAsset}
              onValueChange={setSourceAsset}
              label="From Asset"
              disabled={loading}
            />
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <AmountInput
              value={amount}
              onChange={handleAmountChange}
              disabled={loading}
              selectedAsset={selectedSourceAsset}
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

          <div className="space-y-2">
            <AssetSelect
              assets={assets}
              value={targetAsset}
              onValueChange={setTargetAsset}
              label="To Asset"
              disabled={loading}
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

          {(!quote || quote?.error) ? (
            <Button
              className="w-full"
              onClick={handleGetQuote}
              disabled={!sourceAsset || !targetAsset || !amount || loading}
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
