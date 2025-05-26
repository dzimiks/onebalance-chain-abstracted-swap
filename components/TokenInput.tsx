import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AssetSelect } from '@/components/AssetSelect';
import { Asset } from '@/lib/types/assets';
import { formatTokenAmount } from '@/lib/utils/token';

interface TokenBalance {
  aggregatedAssetId: string;
  balance: string;
  fiatValue: number;
}

interface TokenInputProps {
  label: string;
  assets: Asset[];
  selectedAsset: string;
  onAssetChange: (value: string) => void;
  amount: string;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  balance?: TokenBalance | null;
  showPercentageButtons?: boolean;
  onPercentageClick?: (percentage: number) => void;
  disabled?: boolean;
  readOnly?: boolean;
  balances?: TokenBalance[];
}

export const TokenInput = ({
  label,
  assets,
  selectedAsset,
  onAssetChange,
  amount,
  onAmountChange,
  balance,
  showPercentageButtons = false,
  onPercentageClick,
  disabled = false,
  readOnly = false,
  balances = [],
}: TokenInputProps) => {
  const selectedAssetData = assets.find(asset => asset.aggregatedAssetId === selectedAsset);
  
  // Get asset symbol for display
  const getAssetSymbol = (assetId: string) => {
    return assetId.split(':')[1]?.toUpperCase() || assetId;
  };

  // Format balance for display
  const formatBalance = (balance: TokenBalance, asset: Asset) => {
    const formattedAmount = formatTokenAmount(balance.balance, asset.decimals || 18);
    const numericAmount = Number(formattedAmount);
    return numericAmount.toFixed(numericAmount < 0.01 ? 6 : 2);
  };

  // Calculate USD value of current amount
  const getUSDValue = () => {
    if (!balance || !amount || !selectedAssetData) return null;
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount === 0) return null;
    
    const balanceAmount = parseFloat(formatTokenAmount(balance.balance, selectedAssetData.decimals || 18));
    if (balanceAmount === 0) return null;
    
    const pricePerToken = balance.fiatValue / balanceAmount;
    const usdValue = numericAmount * pricePerToken;
    return usdValue.toFixed(2);
  };

  return (
    <div className="space-y-1">
      {/* Label */}
      <div className="flex items-center justify-between px-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>

        {/* Percentage Buttons */}
        {showPercentageButtons && balance && selectedAssetData && onPercentageClick && (
            <div className="flex gap-2 px-1">
            {[25, 50, 75, 100].map((percentage) => (
                <Button
                key={percentage}
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs bg-white hover:bg-gray-50 border-gray-200 text-gray-600 font-medium"
                onClick={() => onPercentageClick(percentage)}
                disabled={disabled}
                >
                {percentage === 100 ? 'MAX' : `${percentage}%`}
                </Button>
            ))}
            </div>
        )}
      </div>

      {/* Main Input Container */}
      <div className="relative bg-gray-50 rounded-2xl p-4 border border-gray-200 hover:border-gray-300 transition-colors">
        <div className="flex items-start justify-between gap-4">
          {/* Left Side - Amount */}
          <div className="flex-1 space-y-1">
            <Input
              type="text"
              placeholder="0"
              value={amount}
              onChange={onAmountChange}
              disabled={disabled}
              readOnly={readOnly}
              className="text-2xl! font-medium bg-transparent border-none p-0 h-auto shadow-none focus-visible:ring-0 placeholder:text-gray-300 text-gray-900"
            />
            {/* USD Value */}
            <div className="text-sm text-gray-500">
              {getUSDValue() ? `$${getUSDValue()}` : '$0.00'}
            </div>
          </div>

          {/* Right Side - Asset Selector */}
          <div className="flex flex-col items-end space-y-1">
            <AssetSelect
              assets={assets}
              value={selectedAsset}
              onValueChange={onAssetChange}
              label=""
              disabled={disabled}
              showBalances={true}
              balances={balances}
            />
            {/* Balance in asset */}
            {balance && selectedAssetData && (
              <div className="text-xs text-gray-500">
                {formatBalance(balance, selectedAssetData)} {getAssetSymbol(selectedAsset)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 