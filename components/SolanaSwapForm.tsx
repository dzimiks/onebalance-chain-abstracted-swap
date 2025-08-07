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
import { useEmbeddedWallet } from '@/lib/hooks/useEmbeddedWallet';
import { usePredictedAddress } from '@/lib/contexts/PredictedAddressContext';
import { ENHANCED_SOLANA_ASSETS } from '@/lib/constants';
import { QuoteRequestV3, AccountV3, SolanaAccount, EVMRoleBasedAccount } from '@/lib/types/quote';
import { formatTokenAmount, parseTokenAmount } from '@/lib/utils/token';
import debounce from 'lodash.debounce';

export const SolanaSwapForm = () => {
  const { authenticated } = usePrivy();
  const { embeddedWallet } = useSolanaWallet();
  const evmWallet = useEmbeddedWallet();
  const { predictedAddress, getPredictedAddress } = usePredictedAddress();
  const { quote, status, loading, error, isPolling, getQuote, executeQuote, resetQuote } =
    useQuotesV3();
  const { balances, fetchAggregatedBalance } = useBalancesV3();

  // Asset state - following SwapForm pattern
  const [sourceAsset, setSourceAsset] = useState<string>('ds:sol');
  const [targetAsset, setTargetAsset] = useState<string>('ds:usdc');

  // Amount state - following SwapForm pattern
  const [fromAmount, setFromAmount] = useState<string>('');
  const [parsedFromAmount, setParsedFromAmount] = useState('');
  const [toAmount, setToAmount] = useState<string>('');

  // Use state for dynamically tracking balances - following SwapForm pattern
  const [sourceBalance, setSourceBalance] = useState(null);
  const [targetBalance, setTargetBalance] = useState(null);

  // Helper function to check if user has sufficient balance - following SwapForm pattern
  const hasSufficientBalance = (amount: string) => {
    if (!sourceBalance || !selectedSourceAsset || !amount) return false;

    try {
      const parsedAmount = parseTokenAmount(amount, selectedSourceAsset.decimals || 9);
      // @ts-expect-error - sourceBalance comes from balances API with unknown structure
      return BigInt(sourceBalance.balance) >= BigInt(parsedAmount);
    } catch {
      return false;
    }
  };

  // Calculate USD value for destination token from quote - following SwapForm pattern
  const getDestinationUSDValue = () => {
    if (quote && quote.destinationToken && toAmount) {
      const fiatValue = quote.destinationToken.fiatValue;
      if (fiatValue) {
        const numericValue = typeof fiatValue === 'number' ? fiatValue : parseFloat(fiatValue);
        return !isNaN(numericValue) ? numericValue.toFixed(2) : null;
      }
    }
    return null;
  };

  // Get selected assets - following SwapForm pattern
  const selectedSourceAsset =
    ENHANCED_SOLANA_ASSETS.find(asset => asset.aggregatedAssetId === sourceAsset) ?? null;
  const selectedTargetAsset =
    ENHANCED_SOLANA_ASSETS.find(asset => asset.aggregatedAssetId === targetAsset) ?? null;

  // Update balance state when balances or selected assets change - following SwapForm pattern
  useEffect(() => {
    if (balances?.length > 0) {
      const newSourceBalance = balances.find(b => b.assetId === sourceAsset) || null;
      const newTargetBalance = balances.find(b => b.assetId === targetAsset) || null;

      // @ts-expect-error - balance objects have dynamic structure from API
      setSourceBalance(newSourceBalance);
      // @ts-expect-error - balance objects have dynamic structure from API
      setTargetBalance(newTargetBalance);
    }
  }, [balances, sourceAsset, targetAsset]);

  // Update toAmount when quote is received - following SwapForm pattern
  useEffect(() => {
    if (quote && quote.destinationToken && selectedTargetAsset) {
      setToAmount(
        formatTokenAmount(quote.destinationToken.amount, selectedTargetAsset.decimals || 6)
      );
    } else {
      setToAmount('');
    }
  }, [quote, selectedTargetAsset]);

  // Get the predicted address when wallet connects - following SwapForm pattern
  useEffect(() => {
    if (authenticated && evmWallet && !predictedAddress) {
      getPredictedAddress();
    }
  }, [authenticated, evmWallet, predictedAddress, getPredictedAddress]);

  // Fetch balances when wallets connect
  useEffect(() => {
    if (authenticated && embeddedWallet?.address) {
      const accounts = [`solana:${embeddedWallet.address}`];

      // Add EVM account if available
      if (predictedAddress) {
        accounts.push(`eip155:42161:${predictedAddress}`);
      }

      fetchAggregatedBalance(accounts);
    }
  }, [authenticated, embeddedWallet?.address, predictedAddress, fetchAggregatedBalance]);

  // Reset everything after a successful swap - following SwapForm pattern
  useEffect(() => {
    if (status?.status === 'COMPLETED') {
      setFromAmount('');
      setToAmount('');
      setParsedFromAmount('');
      resetQuote();
    }
  }, [status, resetQuote]);

  // Helper function to create accounts array for quotes
  const createAccountsArray = (): AccountV3[] => {
    const accounts: AccountV3[] = [];

    // Always include Solana account if available
    if (embeddedWallet?.address) {
      const solanaAccount: SolanaAccount = {
        type: 'solana',
        accountAddress: embeddedWallet.address,
      };
      accounts.push(solanaAccount);
    }

    // Include EVM account if available (for cross-chain swaps)
    if (evmWallet?.address && predictedAddress) {
      const evmAccount: EVMRoleBasedAccount = {
        sessionAddress: evmWallet.address,
        adminAddress: evmWallet.address,
        accountAddress: predictedAddress,
      };
      accounts.push(evmAccount);
    }

    return accounts;
  };

  // Debounce quote fetching to reduce API calls - following SwapForm pattern
  const debouncedGetQuote = useCallback(
    debounce(async (request: QuoteRequestV3) => {
      await getQuote(request);
    }, 1000),
    [getQuote]
  );

  // Handle from amount change - following SwapForm pattern
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Validate number format
    if (!/^(\d*\.?\d*)?$/.test(value)) return;

    setFromAmount(value);

    if (value && selectedSourceAsset) {
      const parsed = parseTokenAmount(value, selectedSourceAsset.decimals || 9);
      setParsedFromAmount(parsed);

      // Only fetch quote if user has sufficient balance
      if (
        authenticated &&
        embeddedWallet &&
        sourceAsset &&
        targetAsset &&
        hasSufficientBalance(value)
      ) {
        const request: QuoteRequestV3 = {
          from: {
            accounts: createAccountsArray(),
            asset: {
              assetId: sourceAsset,
            },
            amount: parsed,
          },
          to: {
            asset: {
              assetId: targetAsset,
            },
          },
        };
        debouncedGetQuote(request);
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

  // Asset switching - following SwapForm pattern
  const handleSwapDirection = () => {
    setSourceAsset(targetAsset);
    setTargetAsset(sourceAsset);

    // Reset amounts when switching directions
    setFromAmount('');
    setToAmount('');
    setParsedFromAmount('');
    resetQuote();
  };

  // Quote expiration handler - following SwapForm pattern
  const handleQuoteExpire = async () => {
    if (sourceAsset && targetAsset && parsedFromAmount) {
      const request: QuoteRequestV3 = {
        from: {
          accounts: createAccountsArray(),
          asset: {
            assetId: sourceAsset,
          },
          amount: parsedFromAmount,
        },
        to: {
          asset: {
            assetId: targetAsset,
          },
        },
      };
      await getQuote(request);
    }
  };

  // Transaction completion handler - following SwapForm pattern
  const handleTransactionComplete = useCallback(() => {
    // Clear the form
    setFromAmount('');
    setToAmount('');
    setParsedFromAmount('');
    resetQuote();

    // Refresh balances after transaction completion
    if (embeddedWallet?.address) {
      const accounts = [`solana:${embeddedWallet.address}`];
      if (predictedAddress) {
        accounts.push(`eip155:42161:${predictedAddress}`);
      }
      fetchAggregatedBalance(accounts);
    }
  }, [embeddedWallet?.address, predictedAddress, fetchAggregatedBalance, resetQuote]);

  // Get swap button state - following SwapForm pattern
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

    const isDisabled = !sourceAsset || !targetAsset || !fromAmount || !quote;

    return { disabled: isDisabled, text: 'Swap' };
  };

  const handleExecuteSwap = async () => {
    if (!quote || !embeddedWallet) return;
    await executeQuote(quote, embeddedWallet, evmWallet);
  };

  return (
    <Card className="w-full max-w-lg mx-auto p-6">
      <div className="space-y-6">
        <h2 className="text-center text-2xl font-bold text-foreground">Solana Swap TEST</h2>

        {/* Account Addresses Display - Useful for testing and funding */}
        {embeddedWallet?.address && (
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg space-y-3">
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
            </div>

            {predictedAddress && (
              <div className="text-sm border-t border-blue-200 dark:border-blue-800 pt-3">
                <p className="font-medium text-blue-900 dark:text-blue-300 mb-1">
                  Your EVM Account:
                </p>
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded break-all">
                    {predictedAddress}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(predictedAddress)}
                    className="ml-2 px-2 py-1 text-xs bg-blue-700 text-white rounded hover:bg-blue-700"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                  Session & Admin:{' '}
                  {evmWallet?.address
                    ? `${evmWallet.address.slice(0, 6)}...${evmWallet.address.slice(-4)}`
                    : 'Loading...'}
                </p>
              </div>
            )}

            <p className="text-blue-700 dark:text-blue-400 text-xs">
              💡 Both accounts are used for cross-chain swaps. Fund with SOL for swapping.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* From Token Input */}
          <div>
            <TokenInput
              label="Sell"
              assets={ENHANCED_SOLANA_ASSETS as any}
              selectedAsset={sourceAsset}
              onAssetChange={value => {
                setSourceAsset(value);
                if (fromAmount && value !== sourceAsset) {
                  // Refresh quote when asset changes
                  const asset = ENHANCED_SOLANA_ASSETS.find(a => a.aggregatedAssetId === value);
                  if (asset) {
                    const parsed = parseTokenAmount(fromAmount, asset.decimals || 9);
                    setParsedFromAmount(parsed);

                    // Check balance before fetching quote
                    if (
                      authenticated &&
                      embeddedWallet &&
                      targetAsset &&
                      hasSufficientBalance(fromAmount)
                    ) {
                      const request: QuoteRequestV3 = {
                        from: {
                          accounts: createAccountsArray(),
                          asset: {
                            assetId: value,
                          },
                          amount: parsed,
                        },
                        to: {
                          asset: {
                            assetId: targetAsset,
                          },
                        },
                      };
                      debouncedGetQuote(request);
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
                  // @ts-expect-error - sourceBalance has dynamic structure from API
                  const balance = sourceBalance.balance;
                  const decimals = selectedSourceAsset.decimals || 9;
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
                    const request: QuoteRequestV3 = {
                      from: {
                        accounts: createAccountsArray(),
                        asset: {
                          assetId: sourceAsset,
                        },
                        amount: parsed,
                      },
                      to: {
                        asset: {
                          assetId: targetAsset,
                        },
                      },
                    };
                    debouncedGetQuote(request);
                  }
                }
              }}
              disabled={loading}
              balances={balances?.map(b => ({
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
              assets={ENHANCED_SOLANA_ASSETS as any}
              selectedAsset={targetAsset}
              onAssetChange={value => {
                setTargetAsset(value);
                if (fromAmount && parsedFromAmount && value !== targetAsset) {
                  // Refresh quote when target asset changes
                  if (authenticated && embeddedWallet && sourceAsset) {
                    const request: QuoteRequestV3 = {
                      from: {
                        accounts: createAccountsArray(),
                        asset: {
                          assetId: sourceAsset,
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
                }
              }}
              amount={toAmount}
              onAmountChange={() => {}} // No-op since it's read-only
              balance={targetBalance}
              usdValue={getDestinationUSDValue()}
              showPercentageButtons={false}
              disabled={loading}
              readOnly={true}
              balances={balances?.map(b => ({
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
              disabled={getSwapButtonState().disabled}
            >
              {getSwapButtonState().text}
            </Button>

            {/* Cancel button only shows when there's a quote */}
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

          {/* Quote Error - V3 API doesn't have error field in quote response */}

          {/* Quote Details */}
          {quote?.originToken && !status?.status && (
            <div className="space-y-4">
              <QuoteCountdown
                expirationTimestamp={parseInt(quote.expirationTimestamp)}
                onExpire={handleQuoteExpire}
              />
              <QuoteDetails
                quote={
                  {
                    ...quote,
                    originToken: {
                      ...quote.originToken,
                      aggregatedAssetId: sourceAsset,
                      amount: formatTokenAmount(
                        quote.originToken.amount,
                        selectedSourceAsset?.decimals ?? 9
                      ),
                    },
                    destinationToken: {
                      ...quote.destinationToken,
                      aggregatedAssetId: targetAsset,
                      amount: formatTokenAmount(
                        quote.destinationToken.amount,
                        selectedTargetAsset?.decimals ?? 6
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
            onComplete={handleTransactionComplete}
          />
        </div>
      </div>
    </Card>
  );
};
