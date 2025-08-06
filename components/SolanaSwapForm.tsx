'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ArrowDownUp, TriangleAlert } from 'lucide-react';
import { TokenInput } from '@/components/TokenInput';
import { QuoteDetails } from '@/components/QuoteDetails';
import { QuoteCountdown } from '@/components/QuoteCountdown';
import { TransactionStatus } from '@/components/TransactionStatus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSolanaWallet } from '@/lib/hooks/useSolanaWallet';
import { useQuotesV3 } from '@/lib/hooks/useQuotesV3';
import { useBalancesV3 } from '@/lib/hooks/useBalancesV3';
import { SOLANA_ASSETS, SOLANA_UI_ASSETS } from '@/lib/constants';
import { QuoteRequestV3 } from '@/lib/types/quote';
import { getReadableStatus } from '@/lib/utils/solanaSigning';
import { formatTokenAmount, parseTokenAmount } from '@/lib/utils/token';
import debounce from 'lodash.debounce';

export const SolanaSwapForm = () => {
  const { authenticated } = usePrivy();
  const { embeddedWallet, isReady, connected } = useSolanaWallet();
  const { quote, status, loading, error, isPolling, getQuote, executeQuote, resetQuote } =
    useQuotesV3();
  const {
    balances,
    loading: balancesLoading,
    fetchAggregatedBalance,
    getBalanceForAsset,
  } = useBalancesV3();

  // Form state
  const [fromAmount, setFromAmount] = useState('0.001'); // Default 0.001 SOL
  const [parsedFromAmount, setParsedFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromAsset, setFromAsset] = useState<string>(SOLANA_ASSETS.SOL); // ds:sol
  const [toAsset, setToAsset] = useState<string>(SOLANA_ASSETS.USDC); // ds:usdc

  // Get selected assets
  const selectedFromAsset = SOLANA_UI_ASSETS.find(asset => asset.aggregatedAssetId === fromAsset);
  const selectedToAsset = SOLANA_UI_ASSETS.find(asset => asset.aggregatedAssetId === toAsset);

  // Get balances for selected assets
  const fromBalance = getBalanceForAsset(fromAsset);
  const toBalance = getBalanceForAsset(toAsset);

  // Fetch balances when wallet connects
  useEffect(() => {
    if (authenticated && embeddedWallet?.address) {
      const solanaAccount = `solana:${embeddedWallet.address}`;
      fetchAggregatedBalance([solanaAccount]);
    }
  }, [authenticated, embeddedWallet?.address, fetchAggregatedBalance]);

  // Manual balance refresh function (following working implementation pattern)
  const refreshBalances = useCallback(() => {
    if (embeddedWallet?.address) {
      const solanaAccount = `solana:${embeddedWallet.address}`;
      fetchAggregatedBalance([solanaAccount]);
    }
  }, [embeddedWallet?.address, fetchAggregatedBalance]);

  // Update toAmount when quote is received
  useEffect(() => {
    if (quote && selectedToAsset) {
      setToAmount(formatTokenAmount(quote.destinationToken.amount, selectedToAsset.decimals || 6));
    } else {
      setToAmount('');
    }
  }, [quote, selectedToAsset]);

  // Reset quote when amount changes
  useEffect(() => {
    resetQuote();
  }, [fromAmount, resetQuote]);

  // Handle transaction completion (following working implementation pattern)
  useEffect(() => {
    if (status?.status === 'COMPLETED') {
      // Refresh balances when transaction completes successfully
      setTimeout(() => {
        refreshBalances();
      }, 2000);
    }

    if (
      status?.status === 'COMPLETED' ||
      status?.status === 'FAILED' ||
      status?.status === 'REFUNDED'
    ) {
      // Reset form after transaction finishes
      setTimeout(() => {
        setFromAmount('');
        setToAmount('');
        setParsedFromAmount('');
        resetQuote();
      }, 3000);
    }
  }, [status, resetQuote, refreshBalances]);

  // Debounced quote fetching (match working implementation timing)
  const debouncedGetQuote = debounce(async (request: QuoteRequestV3) => {
    await getQuote(request);
  }, 500);

  const handleGetQuote = async () => {
    if (!embeddedWallet?.address || !fromAmount || !selectedFromAsset) return;

    const parsed = parseTokenAmount(fromAmount, selectedFromAsset.decimals);
    setParsedFromAmount(parsed);

    const request: QuoteRequestV3 = {
      from: {
        accounts: [
          {
            type: 'solana',
            accountAddress: embeddedWallet.address,
          },
        ],
        asset: {
          assetId: fromAsset,
        },
        amount: parsed,
      },
      to: {
        asset: {
          assetId: toAsset,
        },
      },
    };

    await getQuote(request);
  };

  // Handle from amount change
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Validate number format
    if (!/^(\d*\.?\d*)?$/.test(value)) return;

    setFromAmount(value);

    if (value && selectedFromAsset && authenticated && embeddedWallet?.address) {
      const parsed = parseTokenAmount(value, selectedFromAsset.decimals);
      setParsedFromAmount(parsed);

      const request: QuoteRequestV3 = {
        from: {
          accounts: [
            {
              type: 'solana',
              accountAddress: embeddedWallet.address,
            },
          ],
          asset: {
            assetId: fromAsset,
          },
          amount: parsed,
        },
        to: {
          asset: {
            assetId: toAsset,
          },
        },
      };

      debouncedGetQuote(request);
    } else {
      setParsedFromAmount('');
      setToAmount('');
      resetQuote();
    }
  };

  // Asset switching
  const handleSwapDirection = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setFromAmount('');
    setToAmount('');
    setParsedFromAmount('');
    resetQuote();
  };

  const handleExecuteSwap = async () => {
    if (!quote || !embeddedWallet) return;
    await executeQuote(quote, embeddedWallet);
  };

  // Loading state
  if (!isReady || balancesLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading Solana wallet...</p>
        </div>
      </Card>
    );
  }

  // Not authenticated state
  if (!authenticated) {
    return (
      <Card className="w-full max-w-lg mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Please connect your wallet to start swapping</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto p-6">
      <div className="space-y-6">
        <h2 className="text-center text-2xl font-bold text-foreground">Swap Solana Tokens</h2>

        {/* Solana Address Display */}
        {embeddedWallet?.address && (
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-300 mb-1">
                Your Solana Address:
              </p>
              <div className="flex items-center justify-between">
                <code className="text-xs font-mono bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded break-all">
                  {embeddedWallet.address}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(embeddedWallet.address)}
                  className="ml-2 px-2 py-1 text-xs bg-blue-700 text-white rounded hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
              <p className="text-blue-700 text-xs mt-1">
                💡 Send SOL or USDC to this address to fund your account for testing
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* From Token Input */}
          <div>
            <TokenInput
              label="Sell"
              assets={SOLANA_UI_ASSETS as any}
              selectedAsset={fromAsset}
              onAssetChange={value => {
                setFromAsset(value);
                setFromAmount('');
                setToAmount('');
                setParsedFromAmount('');
                resetQuote();
              }}
              amount={fromAmount}
              onAmountChange={handleFromAmountChange}
              balance={
                fromBalance
                  ? {
                      aggregatedAssetId: fromAsset,
                      balance: fromBalance.balance,
                      fiatValue: fromBalance.fiatValue,
                    }
                  : null
              }
              showPercentageButtons={true}
              onPercentageClick={percentage => {
                if (fromBalance && selectedFromAsset) {
                  const maxAmount = formatTokenAmount(
                    fromBalance.balance,
                    selectedFromAsset.decimals
                  );
                  const targetAmount = ((parseFloat(maxAmount) * percentage) / 100).toString();
                  setFromAmount(targetAmount);

                  // Trigger quote update
                  const parsed = parseTokenAmount(targetAmount, selectedFromAsset.decimals);
                  setParsedFromAmount(parsed);

                  if (authenticated && embeddedWallet?.address) {
                    const request: QuoteRequestV3 = {
                      from: {
                        accounts: [
                          {
                            type: 'solana',
                            accountAddress: embeddedWallet.address,
                          },
                        ],
                        asset: {
                          assetId: fromAsset,
                        },
                        amount: parsed,
                      },
                      to: {
                        asset: {
                          assetId: toAsset,
                        },
                      },
                    };
                    debouncedGetQuote(request);
                  }
                }
              }}
              disabled={loading}
              balances={balances.map(b => ({
                aggregatedAssetId: b.assetId,
                balance: b.balance,
                fiatValue: b.fiatValue,
              }))}
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
          <div>
            <TokenInput
              label="Buy"
              assets={SOLANA_UI_ASSETS as any}
              selectedAsset={toAsset}
              onAssetChange={value => {
                setToAsset(value);
                if (fromAmount && parsedFromAmount && authenticated && embeddedWallet?.address) {
                  const request: QuoteRequestV3 = {
                    from: {
                      accounts: [
                        {
                          type: 'solana',
                          accountAddress: embeddedWallet.address,
                        },
                      ],
                      asset: {
                        assetId: fromAsset,
                      },
                      amount: parsedFromAmount,
                    },
                    to: {
                      asset: {
                        assetId: value,
                      },
                    },
                  };
                  debouncedGetQuote(request);
                }
              }}
              amount={toAmount}
              onAmountChange={() => {}} // Read-only
              balance={
                toBalance
                  ? {
                      aggregatedAssetId: toAsset,
                      balance: toBalance.balance,
                      fiatValue: toBalance.fiatValue,
                    }
                  : null
              }
              usdValue={quote?.destinationToken?.fiatValue || null}
              showPercentageButtons={false}
              disabled={loading}
              readOnly={true}
              balances={balances.map(b => ({
                aggregatedAssetId: b.assetId,
                balance: b.balance,
                fiatValue: b.fiatValue,
              }))}
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
              onClick={handleExecuteSwap}
              disabled={!quote || loading || isPolling || !authenticated}
            >
              {!authenticated
                ? 'Login to Swap'
                : loading
                  ? 'Getting Quote...'
                  : isPolling
                    ? 'Monitoring Transaction...'
                    : !quote
                      ? 'Enter Amount'
                      : 'Swap'}
            </Button>

            {/* Cancel button */}
            {quote && (
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

          {/* Quote Details */}
          {quote && selectedFromAsset && !status?.status && (
            <div className="space-y-4">
              <QuoteCountdown
                expirationTimestamp={parseInt(quote.expirationTimestamp)}
                onExpire={() => {
                  if (parsedFromAmount) {
                    handleGetQuote();
                  }
                }}
              />
              <QuoteDetails
                quote={
                  {
                    ...quote,
                    originToken: {
                      ...quote.originToken,
                      aggregatedAssetId: fromAsset,
                      amount: formatTokenAmount(
                        quote.originToken.amount,
                        selectedFromAsset.decimals
                      ),
                    },
                    destinationToken: {
                      ...quote.destinationToken,
                      aggregatedAssetId: toAsset,
                      amount: formatTokenAmount(
                        quote.destinationToken.amount,
                        selectedToAsset?.decimals ?? 6
                      ),
                    },
                  } as any
                }
              />
            </div>
          )}

          {/* Transaction Status */}
          <TransactionStatus
            status={status as any}
            isPolling={isPolling}
            onComplete={() => {
              setFromAmount('');
              setToAmount('');
              setParsedFromAmount('');
              resetQuote();

              // Refresh balances after transaction (handled in useEffect above)
              refreshBalances();
            }}
          />
        </div>
      </div>
    </Card>
  );
};
