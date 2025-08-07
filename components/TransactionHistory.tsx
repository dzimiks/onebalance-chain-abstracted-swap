import { useState } from 'react';
import { format } from 'date-fns';
import {
  History,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTransactionHistory } from '@/lib/hooks/useTransactionHistory';
import { useAssets } from '@/lib/hooks';
import { Transaction } from '@/lib/types/transaction';
import { formatTokenAmount } from '@/lib/utils/token';
import { getChainName, getChainLogoUrl } from '@/lib/types/chains';
import { findTokenByAggregatedAssetId } from '@/lib/constants';

interface TransactionHistoryProps {
  userAddress?: string;
}

export const TransactionHistory = ({ userAddress }: TransactionHistoryProps) => {
  const { transactions, loading, error, hasMore, loadMore, refresh } =
    useTransactionHistory(userAddress);
  const { assets } = useAssets();
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set());

  const toggleExpanded = (quoteId: string) => {
    setExpandedTransactions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(quoteId)) {
        newSet.delete(quoteId);
      } else {
        newSet.add(quoteId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'REFUNDED':
        return <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'REFUNDED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'SWAP' ? (
      <Badge
        variant="default"
        className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      >
        <ArrowUpRight className="h-3 w-3 mr-1" />
        Swap
      </Badge>
    ) : (
      <Badge
        variant="secondary"
        className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      >
        <ArrowDownLeft className="h-3 w-3 mr-1 rotate-240" />
        Transfer
      </Badge>
    );
  };

  const formatFiatValue = (fiatValue?: string | { assetType: string; fiatValue: string }[]) => {
    if (!fiatValue) return null;

    if (typeof fiatValue === 'string') {
      return `$${parseFloat(fiatValue).toFixed(2)}`;
    }

    if (Array.isArray(fiatValue) && fiatValue.length > 0) {
      return `$${parseFloat(fiatValue[0].fiatValue).toFixed(2)}`;
    }

    return null;
  };

  const getAssetSymbol = (aggregatedAssetId: string) => {
    // Extract symbol from aggregated asset ID (e.g., "ds:usdc" -> "USDC")
    return aggregatedAssetId.split(':')[1]?.toUpperCase() || aggregatedAssetId;
  };

  // Get token icon for display
  const getTokenIcon = (assetId: string) => {
    const token = findTokenByAggregatedAssetId(assetId);
    return (
      token?.icon || 'https://storage.googleapis.com/onebalance-public-assets/networks/solana.svg'
    );
  };

  const formatTokenAmountForDisplay = (amount: string, aggregatedAssetId: string) => {
    // Find the asset to get proper decimals
    const asset = assets.find(a => a.aggregatedAssetId === aggregatedAssetId);
    const decimals = asset?.decimals || 18;

    const formatted = formatTokenAmount(amount, decimals);
    const num = parseFloat(formatted);

    // Format based on the size of the number
    if (num === 0) return '0';
    if (num < 0.000001) return num.toExponential(2);
    if (num < 0.01) return num.toFixed(6);
    if (num < 1) return num.toFixed(4);
    if (num < 1000) return num.toFixed(2);
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    return (num / 1000000).toFixed(1) + 'M';
  };

  if (!userAddress) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Transaction History</h3>
          <p className="text-muted-foreground">Login to view transaction history</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && transactions.length === 0 && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading transaction history...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && transactions.length === 0 && !error && (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">No transactions yet</h4>
            <p className="text-muted-foreground">Your transaction history will appear here</p>
          </div>
        )}

        {/* Transaction List */}
        {transactions.length > 0 && (
          <div className="space-y-3">
            {transactions.map(transaction => (
              <TransactionCard
                key={transaction.quoteId}
                transaction={transaction}
                isExpanded={expandedTransactions.has(transaction.quoteId)}
                onToggleExpanded={() => toggleExpanded(transaction.quoteId)}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                getTypeBadge={getTypeBadge}
                getChainName={getChainName}
                formatFiatValue={formatFiatValue}
                getAssetSymbol={getAssetSymbol}
                formatTokenAmountForDisplay={formatTokenAmountForDisplay}
                getTokenIcon={getTokenIcon}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => loadMore()}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    'Load More Transactions'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

interface TransactionCardProps {
  transaction: Transaction;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  getStatusIcon: (status: string) => React.ReactElement;
  getStatusColor: (status: string) => string;
  getTypeBadge: (type: string) => React.ReactElement;
  getChainName: (chainId: number) => string;
  formatFiatValue: (
    fiatValue?: string | { assetType: string; fiatValue: string }[]
  ) => string | null;
  getAssetSymbol: (aggregatedAssetId: string) => string;
  formatTokenAmountForDisplay: (amount: string, aggregatedAssetId: string) => string;
  getTokenIcon: (assetId: string) => string | undefined;
}

const TransactionCard = ({
  transaction: initialTransaction,
  isExpanded,
  onToggleExpanded,
  getStatusIcon,
  getStatusColor,
  getTypeBadge,
  getChainName,
  formatFiatValue,
  getAssetSymbol,
  formatTokenAmountForDisplay,
  getTokenIcon,
}: TransactionCardProps) => {
  // Small fix
  const transaction =
    initialTransaction.originToken.aggregatedAssetId ===
    initialTransaction.destinationToken?.aggregatedAssetId
      ? { ...initialTransaction, type: 'TRANSFER' }
      : { ...initialTransaction };
  const originSymbol = getAssetSymbol(transaction.originToken.aggregatedAssetId);
  const destinationSymbol = transaction.destinationToken
    ? getAssetSymbol(transaction.destinationToken.aggregatedAssetId)
    : originSymbol;

  const originAmount = formatTokenAmountForDisplay(
    transaction.originToken.amount,
    transaction.originToken.aggregatedAssetId
  );
  const destinationAmount = transaction.destinationToken
    ? formatTokenAmountForDisplay(
        transaction.destinationToken.amount,
        transaction.destinationToken.aggregatedAssetId
      )
    : originAmount;

  const originFiat = formatFiatValue(transaction.originToken.fiatValue);
  const destinationFiat = transaction.destinationToken
    ? formatFiatValue(transaction.destinationToken.fiatValue)
    : originFiat;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
      <Card className="border border-border hover:border-muted-foreground/20 py-4 transition-all duration-200 hover:shadow-md">
        <CollapsibleTrigger asChild>
          <div className="px-3 cursor-pointer transition-colors">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {getTypeBadge(transaction.type)}
                    <Badge className={getStatusColor(transaction.status)} variant="secondary">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(transaction.status)}
                        <span className="text-xs">{transaction.status}</span>
                      </div>
                    </Badge>
                  </div>

                  <div className="text-xs sm:text-sm text-muted-foreground">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center overflow-hidden border">
                          {getTokenIcon(transaction.originToken.aggregatedAssetId) ? (
                            <img
                              src={getTokenIcon(transaction.originToken.aggregatedAssetId)}
                              alt={originSymbol}
                              className="w-full h-full object-cover"
                              onError={e => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <span
                            className={`text-white text-xs font-bold ${getTokenIcon(transaction.originToken.aggregatedAssetId) ? 'hidden' : ''}`}
                            style={{ fontSize: '6px' }}
                          >
                            {originSymbol.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">
                          {originAmount} {originSymbol}
                        </span>
                      </div>
                      {transaction.type === 'SWAP' && transaction.destinationToken && (
                        <>
                          <span className="hidden sm:inline mx-1">→</span>
                          <span className="sm:hidden text-xs text-muted-foreground/70">to</span>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center overflow-hidden border">
                              {getTokenIcon(transaction.destinationToken.aggregatedAssetId) ? (
                                <img
                                  src={getTokenIcon(transaction.destinationToken.aggregatedAssetId)}
                                  alt={destinationSymbol}
                                  className="w-full h-full object-cover"
                                  onError={e => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <span
                                className={`text-white text-xs font-bold ${getTokenIcon(transaction.destinationToken.aggregatedAssetId) ? 'hidden' : ''}`}
                                style={{ fontSize: '6px' }}
                              >
                                {destinationSymbol.charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium">
                              {destinationAmount} {destinationSymbol}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <div className="text-right">
                  <div className="text-sm sm:text-lg font-semibold text-foreground">
                    {originFiat || `${originAmount} ${originSymbol}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(transaction.timestamp), 'MMM dd')}
                  </div>
                  <div className="text-xs text-muted-foreground sm:hidden">
                    {format(new Date(transaction.timestamp), 'HH:mm')}
                  </div>
                  <div className="hidden sm:block text-xs text-muted-foreground">
                    {format(new Date(transaction.timestamp), 'HH:mm')}
                  </div>
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-border/50">
            <div className="pt-3 sm:pt-4 space-y-4 sm:space-y-6">
              {/* Quote ID */}
              <div className="bg-muted/40 rounded-lg p-2 sm:p-3">
                <div className="text-xs text-muted-foreground mb-1">Quote ID</div>
                <div className="font-mono text-xs text-foreground break-all">
                  {transaction.quoteId}
                </div>
              </div>

              {/* Token Flow */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Transaction Details</h4>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
                  {/* From Token */}
                  <div className="bg-muted/40 rounded-lg p-3">
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Sold</div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center overflow-hidden border">
                            {getTokenIcon(transaction.originToken.aggregatedAssetId) ? (
                              <img
                                src={getTokenIcon(transaction.originToken.aggregatedAssetId)}
                                alt={originSymbol}
                                className="w-full h-full object-cover"
                                onError={e => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <span
                              className={`text-white text-xs font-bold ${getTokenIcon(transaction.originToken.aggregatedAssetId) ? 'hidden' : ''}`}
                            >
                              {originSymbol.charAt(0)}
                            </span>
                          </div>
                          <div className="text-base sm:text-lg font-semibold text-foreground">
                            {originAmount} {originSymbol}
                          </div>
                        </div>
                        {originFiat && (
                          <div className="text-sm text-muted-foreground">{originFiat}</div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Network</div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                            {getChainLogoUrl(transaction.originChainOperations[0]?.chainId) ? (
                              <img
                                src={getChainLogoUrl(transaction.originChainOperations[0]?.chainId)}
                                alt={getChainName(transaction.originChainOperations[0]?.chainId)}
                                className="w-full h-full object-contain"
                                onError={e => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <span
                              className={`text-muted-foreground text-xs font-bold ${getChainLogoUrl(transaction.originChainOperations[0]?.chainId) ? 'hidden' : ''}`}
                            >
                              {getChainName(transaction.originChainOperations[0]?.chainId).charAt(
                                0
                              )}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-foreground">
                            {getChainName(transaction.originChainOperations[0]?.chainId)}
                          </div>
                        </div>
                      </div>
                      {/* Origin Transaction Links */}
                      {transaction.originChainOperations.map((op, index) => (
                        <div key={index} className="pt-2 border-t border-border/30">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-muted-foreground">Transaction</div>
                              <div className="font-mono text-xs text-foreground">
                                {op.hash.slice(0, 6)}...{op.hash.slice(-6)}
                              </div>
                            </div>
                            <Button variant="outline" size="sm" asChild className="h-7 px-2">
                              <a
                                href={op.explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                <span className="text-xs">View</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arrow for swaps */}
                  {transaction.type === 'SWAP' && transaction.destinationToken && (
                    <div className="flex justify-center">
                      <div className="w-10 h-10 rounded-full bg-muted/40 flex items-center justify-center">
                        <ArrowDownLeft className="h-5 w-5 text-primary rotate-180" />
                      </div>
                    </div>
                  )}

                  {/* Arrow for transfers */}
                  {transaction.type === 'TRANSFER' && transaction.destinationToken && (
                    <div className="flex justify-center">
                      <div className="w-10 h-10 rounded-full bg-muted/40 flex items-center justify-center">
                        <ArrowDownLeft className="h-5 w-5 text-primary rotate-240" />
                      </div>
                    </div>
                  )}

                  {/* To Token (for swaps) */}
                  {transaction.destinationToken && (
                    <div className="bg-muted/40 rounded-lg p-3">
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Bought</div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center overflow-hidden border">
                              {getTokenIcon(transaction.destinationToken.aggregatedAssetId) ? (
                                <img
                                  src={getTokenIcon(transaction.destinationToken.aggregatedAssetId)}
                                  alt={destinationSymbol}
                                  className="w-full h-full object-cover"
                                  onError={e => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <span
                                className={`text-white text-xs font-bold ${getTokenIcon(transaction.destinationToken.aggregatedAssetId) ? 'hidden' : ''}`}
                              >
                                {destinationSymbol.charAt(0)}
                              </span>
                            </div>
                            <div className="text-base sm:text-lg font-semibold text-foreground">
                              {destinationAmount} {destinationSymbol}
                            </div>
                          </div>
                          {destinationFiat && (
                            <div className="text-sm text-muted-foreground">{destinationFiat}</div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Network</div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                              {getChainLogoUrl(
                                transaction.destinationChainOperations?.[0]?.chainId ||
                                  transaction.originChainOperations[0]?.chainId
                              ) ? (
                                <img
                                  src={getChainLogoUrl(
                                    transaction.destinationChainOperations?.[0]?.chainId ||
                                      transaction.originChainOperations[0]?.chainId
                                  )}
                                  alt={getChainName(
                                    transaction.destinationChainOperations?.[0]?.chainId ||
                                      transaction.originChainOperations[0]?.chainId
                                  )}
                                  className="w-full h-full object-contain"
                                  onError={e => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <span
                                className={`text-muted-foreground text-xs font-bold ${
                                  getChainLogoUrl(
                                    transaction.destinationChainOperations?.[0]?.chainId ||
                                      transaction.originChainOperations[0]?.chainId
                                  )
                                    ? 'hidden'
                                    : ''
                                }`}
                              >
                                {getChainName(
                                  transaction.destinationChainOperations?.[0]?.chainId ||
                                    transaction.originChainOperations[0]?.chainId
                                ).charAt(0)}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-foreground">
                              {getChainName(
                                transaction.destinationChainOperations?.[0]?.chainId ||
                                  transaction.originChainOperations[0]?.chainId
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Destination Transaction Links */}
                        {transaction.destinationChainOperations?.map((op, index) => (
                          <div key={index} className="pt-2 border-t border-border/30">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-muted-foreground">Transaction</div>
                                <div className="font-mono text-xs text-foreground">
                                  {op.hash.slice(0, 6)}...{op.hash.slice(-6)}
                                </div>
                              </div>
                              <Button variant="outline" size="sm" asChild className="h-7 px-2">
                                <a
                                  href={op.explorerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1"
                                >
                                  <span className="text-xs">View</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
