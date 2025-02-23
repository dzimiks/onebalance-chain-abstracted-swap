import { useState } from 'react';
import { ArrowDownUp, CircleCheck, TriangleAlert } from 'lucide-react';
import { AssetSelect } from '@/components/AssetSelect';
import { ChainSelect } from '@/components/ChainSelect';
import { QuoteDetails } from '@/components/QuoteDetails';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAssets, useChains, useQuotes } from '@/lib/hooks';

export function SwapForm() {
  const [sourceAsset, setSourceAsset] = useState<string>('ds:eth');
  const [targetAsset, setTargetAsset] = useState<string>('ds:usdc');
  const [sourceChain, setSourceChain] = useState<string>('8453');
  const [targetChain, setTargetChain] = useState<string>('42161');
  const [amount, setAmount] = useState<string>('800000000000000');

  console.log({
    fromTokenAmount: amount,
    fromAggregatedAssetId: sourceAsset,
    toAggregatedAssetId: targetAsset,
  });

  const { assets, loading: assetsLoading, error: assetsError } = useAssets();
  const { chains, loading: chainsLoading, error: chainsError } = useChains();
  const { quote, status, loading, error, getQuote, executeQuote, resetQuote } = useQuotes();
  const quoteStatus: string | null = status?.status?.status ?? null;

  const handleSwapDirection = () => {
    setSourceAsset(targetAsset);
    setTargetAsset(sourceAsset);
    setSourceChain(targetChain);
    setTargetChain(sourceChain);
  };

  const handleGetQuote = async () => {
    if (!sourceAsset || !targetAsset || !amount) return;

    const dummyAccount = {
      sessionAddress: '0x1cBFbFd62a276BF6D79d504eA4CA75a7baDcf5b1',
      adminAddress: '0xc162a3cE45ad151eeCd0a5532D6E489D034aB3B8',
      accountAddress: '0xa8305CAD3ECEA0E4B4a02CE45E240e8687B4C2E0',
    };

    await getQuote({
      account: dummyAccount,
      fromTokenAmount: amount,
      fromAggregatedAssetId: sourceAsset,
      toAggregatedAssetId: targetAsset,
    });
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

  return (
    <Card className="w-full max-w-lg mx-auto p-6">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">OneBalance Cross-Chain Swap</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <ChainSelect
              chains={chains}
              value={sourceChain}
              onValueChange={setSourceChain}
              label="From Chain"
              disabled={loading}
            />
            <AssetSelect
              assets={assets}
              value={sourceAsset}
              onValueChange={setSourceAsset}
              label="From Asset"
              disabled={loading}
              selectedChainId={sourceChain}
            />
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapDirection}
              disabled={loading}
              className="rounded-full"
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <ChainSelect
              chains={chains}
              value={targetChain}
              onValueChange={setTargetChain}
              label="To Chain"
              disabled={loading}
            />
            <AssetSelect
              assets={assets}
              value={targetAsset}
              onValueChange={setTargetAsset}
              label="To Asset"
              disabled={loading}
              selectedChainId={targetChain}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Amount</label>
            <Input
              type="text"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>An error occurred</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {!quote ? (
            <Button
              className="w-full"
              onClick={handleGetQuote}
              disabled={!sourceAsset || !targetAsset || !amount || loading}
            >
              {loading && quoteStatus === 'PENDING' ? 'Getting Quote...' : 'Get Quote'}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={executeQuote}
                disabled={loading}
              >
                {loading && quoteStatus === 'PENDING' ? 'Executing Swap...' : 'Swap Now'}
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

          {quoteStatus === 'COMPLETED' && (
            <Alert>
              <CircleCheck className="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Swap completed successfully!
              </AlertDescription>
            </Alert>
          )}

          {quote && <QuoteDetails quote={quote} />}
        </div>
      </div>
    </Card>
  );
}