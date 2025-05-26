'use client';

import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Wallet, 
  CircleUser, 
  Copy, 
  CheckCircle2, 
  RefreshCw, 
  TrendingUp,
  LogOut,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useBalances } from '@/lib/hooks/useBalances';
import { useAssets } from '@/lib/hooks/useAssets';
import { useQuotes } from '@/lib/hooks';
import { formatTokenAmount } from '@/lib/utils/token';
import { BalanceByAssetDto } from '@/lib/types/balances';

export const ConnectButton = () => {
  const { login, logout, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());

  const {
    predictedAddress,
    getPredictedAddress,
  } = useQuotes();

  const {
    balances,
    loading: balancesLoading,
    fetchBalances,
  } = useBalances(predictedAddress);

  const { assets } = useAssets();

  // Get the predicted address when wallet connects
  useEffect(() => {
    if (authenticated && embeddedWallet && !predictedAddress) {
      getPredictedAddress();
    }
  }, [authenticated, embeddedWallet, predictedAddress, getPredictedAddress]);

  // Refresh balances when dialog opens
  useEffect(() => {
    if (open && predictedAddress) {
      fetchBalances();
    }
  }, [open, predictedAddress]);

  // Copy address to clipboard with improved feedback
  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  // Manual refresh balances
  const handleRefreshBalances = async () => {
    if (!predictedAddress) return;
    setRefreshing(true);
    await fetchBalances();
    setTimeout(() => setRefreshing(false), 500); // Minimum animation time
  };

  // Format wallet address for display
  const formatAddress = (address?: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get the number of chains an asset is on
  const getChainCount = (asset: BalanceByAssetDto) => {
    return asset.individualAssetBalances.length;
  };

  // Display the asset symbol from aggregatedAssetId
  const getAssetSymbol = (assetId: string) => {
    return assetId.split(':')[1]?.toUpperCase() || assetId;
  };

  // Get asset decimals from assets data
  const getAssetDecimals = (aggregatedAssetId: string) => {
    const asset = assets.find(a => a.aggregatedAssetId === aggregatedAssetId);
    return asset?.decimals || 18;
  };

  // Get token icon color based on symbol
  const getTokenIconColor = (symbol: string) => {
    const colors = [
      'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500'
    ];
    const index = symbol.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get chain name from asset type
  const getChainName = (assetType: string) => {
    const chainNames: Record<string, string> = {
      'eip155:1': 'Ethereum',
      'eip155:10': 'Optimism',
      'eip155:137': 'Polygon',
      'eip155:8453': 'Base',
      'eip155:42161': 'Arbitrum',
      'eip155:43114': 'Avalanche',
      'eip155:59144': 'Linea',
    };
    
    const chainId = assetType.split('/')[0];
    return chainNames[chainId] || chainId.split(':')[1] || 'Unknown';
  };

  // Get chain icon color
  const getChainIconColor = (chainName: string) => {
    const chainColors: Record<string, string> = {
      'Ethereum': 'bg-blue-600',
      'Optimism': 'bg-red-500',
      'Polygon': 'bg-purple-600',
      'Base': 'bg-blue-500',
      'Arbitrum': 'bg-blue-400',
      'Avalanche': 'bg-red-600',
      'Linea': 'bg-black',
    };
    return chainColors[chainName] || 'bg-gray-500';
  };

  // Toggle asset expansion
  const toggleAssetExpansion = (assetId: string) => {
    setExpandedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  };

  if (!ready) {
    return (
      <Button variant="outline" size="sm" disabled className="animate-pulse">
        <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
        Loading...
      </Button>
    );
  }

  if (!authenticated) {
    return (
              <Button 
          size="sm" 
          onClick={login}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 transition-all duration-200 hover:shadow-md"
        >
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">
              {predictedAddress ? formatAddress(predictedAddress) : 'Connected'}
            </span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center gap-3 text-xl">
           <CircleUser className="h-6 w-6 text-foreground" />
            <div>
              <div className="text-foreground">Wallet Details</div>
              <div className="text-sm font-normal text-muted-foreground mt-1">
                Manage your account and view balances
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">
          {/* Account Address Section */}
          {predictedAddress && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Account Address
                </h3>
                                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 hover:bg-muted transition-colors"
                    onClick={() => copyAddress(predictedAddress)}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-1" />
                        <span className="text-emerald-600 text-xs">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-muted-foreground text-xs">Copy</span>
                      </>
                    )}
                  </Button>
              </div>
                              <div className="bg-muted border border-border rounded-xl p-3">
                  <p className="text-sm font-mono text-foreground break-all leading-relaxed">
                    {predictedAddress}
                  </p>
                </div>
            </div>
          )}

          {/* Total Balance Section */}
          {balances?.totalBalance && (
                         <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-4">
               <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                   <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                   <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Total Portfolio Value</span>
                 </div>
                 <Button
                   variant="ghost"
                   size="sm"
                   className="h-6 w-6 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/20"
                   onClick={handleRefreshBalances}
                   disabled={refreshing}
                 >
                   <RefreshCw className={`h-3 w-3 text-emerald-600 dark:text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
                 </Button>
               </div>
               <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                 ${balances.totalBalance.fiatValue?.toLocaleString(undefined, {
                   minimumFractionDigits: 2,
                   maximumFractionDigits: 2
                 }) || '0.00'}
               </div>
               <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                 Across {balances.balanceByAggregatedAsset?.length || 0} assets
               </div>
             </div>
          )}

          {/* Asset List Section */}
          <div className="space-y-3">
                         <div className="flex items-center justify-between">
               <h3 className="text-sm font-semibold text-foreground">Asset Balances</h3>
               {balancesLoading && (
                 <div className="flex items-center gap-1 text-xs text-muted-foreground">
                   <RefreshCw className="h-3 w-3 animate-spin" />
                   Loading...
                 </div>
               )}
             </div>
            
            {balancesLoading ? (
                             <div className="space-y-3">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="flex items-center justify-between p-3 border border-border rounded-xl bg-card">
                     <div className="flex items-center gap-3">
                       <Skeleton className="w-10 h-10 rounded-full" />
                       <div className="space-y-1">
                         <Skeleton className="w-16 h-4" />
                         <Skeleton className="w-12 h-3" />
                       </div>
                     </div>
                     <div className="space-y-1 text-right">
                       <Skeleton className="w-16 h-4" />
                       <Skeleton className="w-20 h-3" />
                     </div>
                   </div>
                 ))}
               </div>
            ) : balances?.balanceByAggregatedAsset && balances.balanceByAggregatedAsset.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                 {balances.balanceByAggregatedAsset
                   .filter(asset => asset.fiatValue && asset.fiatValue > 0)
                   .sort((a, b) => (b.fiatValue || 0) - (a.fiatValue || 0))
                   .map((asset) => {
                     const symbol = getAssetSymbol(asset.aggregatedAssetId);
                     const chainCount = getChainCount(asset);
                     const isExpanded = expandedAssets.has(asset.aggregatedAssetId);
                     
                     return (
                       <Card 
                         key={asset.aggregatedAssetId} 
                         className="border-border hover:border-muted-foreground/20 transition-all duration-200 overflow-hidden bg-card"
                       >
                         {/* Main Asset Row */}
                         <div className="px-4 transition-colors duration-200">
                           <div className="flex justify-between items-center">
                             <div className="flex items-center gap-3">
                               <div className={`w-10 h-10 ${getTokenIconColor(symbol)} rounded-full flex items-center justify-center shadow-sm`}>
                                 <span className="text-white text-sm font-bold">
                                   {symbol.charAt(0)}
                                 </span>
                               </div>
                               <div>
                                 <div className="font-semibold text-foreground">{symbol}</div>
                                 <div className="text-xs text-muted-foreground flex items-center gap-1">
                                   <button
                                     onClick={() => toggleAssetExpansion(asset.aggregatedAssetId)}
                                     className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors"
                                   >
                                     {chainCount} chain{chainCount > 1 ? 's' : ''}
                                     {isExpanded ? 
                                       <ChevronUp className="h-3 w-3" /> : 
                                       <ChevronDown className="h-3 w-3" />
                                     }
                                   </button>
                                 </div>
                               </div>
                             </div>
                             <div className="text-right">
                               <div className="font-semibold text-foreground">
                                 ${asset.fiatValue?.toLocaleString(undefined, {
                                   minimumFractionDigits: 2,
                                   maximumFractionDigits: 2
                                 }) || '0.00'}
                               </div>
                               <div className="text-xs text-muted-foreground font-mono">
                                 {formatTokenAmount(asset.balance, getAssetDecimals(asset.aggregatedAssetId))}
                               </div>
                             </div>
                           </div>
                         </div>

                         {/* Expanded Chain Details */}
                         {isExpanded && (
                           <div className="border-t border-border bg-muted/30">
                             <div className="p-3 space-y-2">
                               <div className="text-xs font-medium text-muted-foreground mb-3 px-1">
                                 Chain Distribution
                               </div>
                               {asset.individualAssetBalances
                                 .sort((a, b) => (b.fiatValue || 0) - (a.fiatValue || 0))
                                 .map((individualAsset, index) => {
                                   const chainName = getChainName(individualAsset.assetType);
                                   const chainIconColor = getChainIconColor(chainName);
                                   
                                   return (
                                     <div 
                                       key={`${asset.aggregatedAssetId}-${index}`}
                                       className="flex items-center justify-between py-2 px-3 bg-background rounded-lg border border-border hover:border-muted-foreground/20 transition-colors"
                                     >
                                       <div className="flex items-center gap-3">
                                         <div className={`w-6 h-6 ${chainIconColor} rounded-full flex items-center justify-center`}>
                                           <span className="text-white text-xs font-bold">
                                             {chainName.charAt(0)}
                                           </span>
                                         </div>
                                         <div>
                                           <div className="text-sm font-medium text-foreground">{chainName}</div>
                                           <div className="text-xs text-muted-foreground">
                                             {formatTokenAmount(individualAsset.balance, getAssetDecimals(asset.aggregatedAssetId))} {symbol}
                                           </div>
                                         </div>
                                       </div>
                                       <div className="text-right">
                                         <div className="text-sm font-medium text-foreground">
                                           ${individualAsset.fiatValue?.toLocaleString(undefined, {
                                             minimumFractionDigits: 2,
                                             maximumFractionDigits: 2
                                           }) || '0.00'}
                                         </div>
                                         <div className="text-xs text-muted-foreground">
                                           {((individualAsset.fiatValue / asset.fiatValue) * 100).toFixed(1)}%
                                         </div>
                                       </div>
                                     </div>
                                   );
                                 })}
                             </div>
                           </div>
                         )}
                       </Card>
                     );
                   })}
              </div>
            ) : (
                             <div className="text-center py-8 text-muted-foreground">
                 <Wallet className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                 <div className="font-medium">No assets found</div>
                 <div className="text-xs mt-1">Your balances will appear here</div>
               </div>
            )}
          </div>
        </div>

                 {/* Footer Actions */}
         <div className="pt-4 border-t border-border mt-6">
           <Button
             variant="outline"
             className="w-full text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-700/50 transition-colors"
             onClick={logout}
           >
             <LogOut className="mr-2 h-4 w-4" />
             Disconnect Wallet
           </Button>
         </div>
      </DialogContent>
    </Dialog>
  );
};
