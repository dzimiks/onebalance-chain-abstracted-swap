'use client';

import { useState } from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PortfolioSummaryProps {
  totalValue: number;
  assetCount: number;
  chainCount: number;
  onRefresh: () => Promise<void>;
}

export const PortfolioSummary = ({
  totalValue,
  assetCount,
  chainCount,
  onRefresh,
}: PortfolioSummaryProps) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
            Total Portfolio Value
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/20"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            className={`h-3 w-3 text-emerald-600 dark:text-emerald-400 ${refreshing ? 'animate-spin' : ''}`}
          />
        </Button>
      </div>
      <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
        $
        {totalValue.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
      <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
        Across {assetCount} assets on {chainCount} chains
      </div>
    </div>
  );
};
