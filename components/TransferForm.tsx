import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Send, TriangleAlert } from 'lucide-react';
import { TokenInput } from '@/components/TokenInput';
import { QuoteDetails } from '@/components/QuoteDetails';
import { QuoteCountdown } from '@/components/QuoteCountdown';
import { TransactionStatus } from '@/components/TransactionStatus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAssets, useChains, useQuotes, useBalances } from '@/lib/hooks';
import { Asset } from '@/lib/types/assets';
import { formatTokenAmount, parseTokenAmount } from '@/lib/utils/token';
import debounce from 'lodash.debounce';

export const TransferForm = () => {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');

  // Asset state
  const [selectedAsset, setSelectedAsset] = useState<string>('ds:usdc');
  const [amount, setAmount] = useState<string>('');
  const [parsedAmount, setParsedAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [recipientChain, setRecipientChain] = useState<string>('eip155:42161'); // Default to Arbitrum

  // API data hooks
  const { assets, loading: assetsLoading, error: assetsError } = useAssets();
  const { chains, loading: chainsLoading, error: chainsError } = useChains();
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

  // Use state for dynamically tracking balance
  const [assetBalance, setAssetBalance] = useState(null);

  // Get selected asset
  const selectedAssetData: Asset | null =
    assets.find(asset => asset.aggregatedAssetId === selectedAsset) ?? null;

  // Chain names mapping
  const getChainName = (chainId: string) => {
    const chainNames: Record<string, string> = {
      '1': 'Ethereum',
      '10': 'Optimism',
      '137': 'Polygon',
      '8453': 'Base',
      '42161': 'Arbitrum',
      '43114': 'Avalanche',
      '59144': 'Linea',
    };
    return chainNames[chainId] || `Chain ${chainId}`;
  };

  // Update balance state when balances or selected asset change
  useEffect(() => {
    if (balances?.balanceByAggregatedAsset) {
      const newBalance =
        balances.balanceByAggregatedAsset.find(b => b.aggregatedAssetId === selectedAsset) || null;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      setAssetBalance(newBalance);
    }
  }, [balances, selectedAsset]);

  // Get the predicted address when wallet connects
  useEffect(() => {
    if (authenticated && embeddedWallet && !predictedAddress) {
      getPredictedAddress();
    }
  }, [authenticated, embeddedWallet, predictedAddress, getPredictedAddress]);

  // Reset everything after a successful transfer
  useEffect(() => {
    if (status?.status === 'COMPLETED') {
      setAmount('');
      setParsedAmount('');
      setRecipientAddress('');
      resetQuote();
    }
  }, [status, resetQuote]);

  // Debounce quote fetching to reduce API calls
  const debouncedGetQuote = useCallback(
    debounce(async request => {
      await getQuote(request);
    }, 1000),
    [getQuote]
  );

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Validate number format
    if (!/^(\d*\.?\d*)?$/.test(value)) return;

    setAmount(value);

    if (value && selectedAssetData) {
      const parsed = parseTokenAmount(value, selectedAssetData.decimals || 18);
      setParsedAmount(parsed);

      // Auto-refresh quote for transfer if recipient is provided
      if (
        authenticated &&
        embeddedWallet &&
        selectedAsset &&
        recipientAddress &&
        isValidAddress(recipientAddress)
      ) {
        debouncedGetQuote({
          fromTokenAmount: parsed,
          fromAggregatedAssetId: selectedAsset,
          toAggregatedAssetId: selectedAsset, // Same asset for transfers
          recipientAddress: `${recipientChain}:${recipientAddress}`,
        });
      }
    } else {
      setParsedAmount('');
      resetQuote();
    }
  };

  // Handle recipient address change
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRecipientAddress(value);

    // Auto-refresh quote when recipient changes and amount is set
    if (
      value &&
      isValidAddress(value) &&
      amount &&
      parsedAmount &&
      authenticated &&
      embeddedWallet &&
      selectedAsset
    ) {
      debouncedGetQuote({
        fromTokenAmount: parsedAmount,
        fromAggregatedAssetId: selectedAsset,
        toAggregatedAssetId: selectedAsset, // Same asset for transfers
        recipientAddress: `${recipientChain}:${value}`,
      });
    } else {
      resetQuote();
    }
  };

  // Handle recipient chain change
  const handleRecipientChainChange = (value: string) => {
    setRecipientChain(value);

    // Auto-refresh quote when chain changes and other fields are set
    if (
      recipientAddress &&
      isValidAddress(recipientAddress) &&
      amount &&
      parsedAmount &&
      authenticated &&
      embeddedWallet &&
      selectedAsset
    ) {
      debouncedGetQuote({
        fromTokenAmount: parsedAmount,
        fromAggregatedAssetId: selectedAsset,
        toAggregatedAssetId: selectedAsset, // Same asset for transfers
        recipientAddress: `${value}:${recipientAddress}`,
      });
    } else {
      resetQuote();
    }
  };

  // Simple address validation
  const isValidAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address) || address.endsWith('.eth');
  };

  // Quote expiration handler
  const handleQuoteExpire = async () => {
    if (selectedAsset && recipientAddress && isValidAddress(recipientAddress) && parsedAmount) {
      await getQuote({
        fromTokenAmount: parsedAmount,
        fromAggregatedAssetId: selectedAsset,
        toAggregatedAssetId: selectedAsset,
        recipientAddress: `${recipientChain}:${recipientAddress}`,
      });
    }
  };

  // Get transfer button state
  const getTransferButtonState = () => {
    if (!authenticated) {
      return { disabled: true, text: 'Connect Wallet to Transfer' };
    }

    if (loading && status?.status === 'PENDING') {
      return { disabled: true, text: 'Executing Transfer...' };
    }

    if (loading) {
      return { disabled: true, text: 'Getting Quote...' };
    }

    const isDisabled =
      !selectedAsset ||
      !amount ||
      !recipientAddress ||
      !parsedAmount ||
      !isValidAddress(recipientAddress) ||
      !quote ||
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      quote?.error;

    return { disabled: isDisabled, text: 'Transfer' };
  };

  // Transaction completion handler
  const handleTransactionComplete = useCallback(() => {
    // Clear the form
    setAmount('');
    setParsedAmount('');
    setRecipientAddress('');
    resetQuote();

    // Refresh balances after transaction completion
    if (predictedAddress) {
      fetchBalances();
    }
  }, [predictedAddress, fetchBalances, resetQuote]);

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
    <Card className="w-full max-w-lg mx-auto p-6" data-onboarding="transfer-card">
      <div className="space-y-6">
        <h2 className="text-center text-2xl font-bold text-foreground">Transfer Tokens</h2>

        <div className="space-y-4">
          {/* Token Input */}
          <div data-onboarding="transfer-token">
            <TokenInput
              label="You're sending"
              assets={assets}
              selectedAsset={selectedAsset}
              onAssetChange={value => {
                setSelectedAsset(value);
                if (amount && value !== selectedAsset) {
                  // Update parsed amount when asset changes
                  const asset = assets.find(a => a.aggregatedAssetId === value);
                  if (asset) {
                    const parsed = parseTokenAmount(amount, asset.decimals || 18);
                    setParsedAmount(parsed);

                    // Refresh quote if recipient is provided
                    if (
                      authenticated &&
                      embeddedWallet &&
                      recipientAddress &&
                      isValidAddress(recipientAddress)
                    ) {
                      debouncedGetQuote({
                        fromTokenAmount: parsed,
                        fromAggregatedAssetId: value,
                        toAggregatedAssetId: value, // Same asset for transfers
                        recipientAddress: `${recipientChain}:${recipientAddress}`,
                      });
                    }
                  }
                }
              }}
              amount={amount}
              onAmountChange={handleAmountChange}
              balance={assetBalance}
              showPercentageButtons={true}
              onPercentageClick={percentage => {
                if (assetBalance && selectedAssetData) {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                  const balance = assetBalance.balance;
                  const decimals = selectedAssetData.decimals || 18;
                  const maxAmount = formatTokenAmount(balance, decimals);
                  const targetAmount = ((parseFloat(maxAmount) * percentage) / 100).toString();

                  setAmount(targetAmount);

                  // Update parsed amount and trigger quote
                  const parsed = parseTokenAmount(targetAmount, decimals);
                  setParsedAmount(parsed);

                  if (
                    authenticated &&
                    embeddedWallet &&
                    selectedAsset &&
                    recipientAddress &&
                    isValidAddress(recipientAddress)
                  ) {
                    debouncedGetQuote({
                      fromTokenAmount: parsed,
                      fromAggregatedAssetId: selectedAsset,
                      toAggregatedAssetId: selectedAsset, // Same asset for transfers
                      recipientAddress: `${recipientChain}:${recipientAddress}`,
                    });
                  }
                }
              }}
              disabled={loading}
              balances={balances?.balanceByAggregatedAsset}
            />
          </div>

          {/* Recipient Address Input */}
          <div data-onboarding="transfer-recipient">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">To</label>
              <div className="relative bg-muted/50 rounded-2xl p-4 border border-border hover:border-muted-foreground/20 transition-colors">
                <Input
                  type="text"
                  placeholder="Wallet address or ENS name"
                  value={recipientAddress}
                  onChange={handleRecipientChange}
                  disabled={loading}
                  className="text-lg bg-transparent border-none p-0 h-auto shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50 text-foreground"
                />
                {recipientAddress && !isValidAddress(recipientAddress) && (
                  <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                    Please enter a valid Ethereum address or ENS name
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recipient Network Picker */}
          <div data-onboarding="transfer-network">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Recipient network</label>
              <Select
                value={recipientChain}
                onValueChange={handleRecipientChainChange}
                disabled={loading}
              >
                <SelectTrigger className="bg-muted/50 rounded-2xl border-border hover:border-muted-foreground/20 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chains.map(chain => (
                    <SelectItem key={chain.chain.reference} value={chain.chain.chain}>
                      {getChainName(chain.chain.reference)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quote Loading Alert */}
          {authenticated &&
            amount &&
            parsedAmount &&
            recipientAddress &&
            isValidAddress(recipientAddress) &&
            !quote &&
            loading && (
              <Alert>
                <AlertTitle>Getting quote...</AlertTitle>
                <AlertDescription>
                  Please wait while we calculate the transfer cost
                </AlertDescription>
              </Alert>
            )}

          {/* Transfer Button */}
          <div className="space-y-2" data-onboarding="transfer-button">
            <Button
              className="w-full"
              onClick={executeQuote}
              disabled={getTransferButtonState().disabled}
            >
              <Send className="mr-2 h-4 w-4" />
              {getTransferButtonState().text}
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
                      selectedAssetData?.decimals ?? 18
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
