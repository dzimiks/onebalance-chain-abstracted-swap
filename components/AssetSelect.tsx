import { useState } from 'react';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Asset } from '@/lib/types/assets';
import { formatTokenAmount } from '@/lib/utils/token';

interface AssetBalance {
  aggregatedAssetId: string;
  balance: string;
  fiatValue: number;
}

interface AssetSelectProps {
  assets: Asset[];
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  showBalances?: boolean;
  balances?: AssetBalance[];
}

export function AssetSelect({
  assets,
  value,
  onValueChange,
  label,
  disabled = false,
  showBalances = false,
  balances = [],
}: AssetSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const selectedAsset = assets.find(a => a.aggregatedAssetId === value);

  // Get balance for an asset
  const getAssetBalance = (assetId: string) => {
    if (!balances?.length) return null;
    return balances.find(b => b.aggregatedAssetId === assetId);
  };

  // Get asset symbol for display
  const getAssetSymbol = (assetId: string) => {
    return assetId.split(':')[1]?.toUpperCase() || assetId;
  };

  // Filter assets by search term
  const filteredAssets = assets.filter(asset =>
    !searchTerm ? true : (
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.aggregatedAssetId.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  );

  // If no assets match search, show a message
  const displayAssets = filteredAssets.length > 0 ? filteredAssets : [];

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-foreground">{label}</label>}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="h-auto p-2 bg-background border border-border rounded-xl hover:border-muted-foreground/20 transition-colors min-w-[120px]">
          <SelectValue>
            {selectedAsset && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {getAssetSymbol(selectedAsset.aggregatedAssetId).charAt(0)}
                  </span>
                </div>
                <span className="font-semibold text-foreground">
                  {getAssetSymbol(selectedAsset.aggregatedAssetId)}
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-80">
          <div className="sticky -top-1 bg-background p-2 z-10">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <SelectGroup>
            {displayAssets.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                No assets found matching <span className="font-semibold">{searchTerm}</span>
              </div>
            ) : (
              displayAssets
                .sort((a, b) => (getAssetBalance(b.aggregatedAssetId || '0')?.fiatValue || 0) - (getAssetBalance(a.aggregatedAssetId || '0')?.fiatValue || 0))
                .map((asset) => {
                const assetBalance = showBalances ? getAssetBalance(asset.aggregatedAssetId) : null;

                return (
                  <SelectItem
                    key={asset.aggregatedAssetId}
                    value={asset.aggregatedAssetId}
                    className="py-3 hover:bg-muted/50"
                  >
                    <div className="flex gap-4 items-center justify-between md:w-[250px] lg:w-[400px] max-w-full">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {getAssetSymbol(asset.aggregatedAssetId).charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{getAssetSymbol(asset.aggregatedAssetId)}</div>
                          <div className="text-muted-foreground text-xs">{asset.name}</div>
                        </div>
                      </div>

                      {showBalances && assetBalance && (
                        <div className="flex flex-col text-right text-sm">
                          <div className="font-medium text-foreground">
                            ${assetBalance.fiatValue?.toFixed(2) || '0.00'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTokenAmount(assetBalance.balance, asset.decimals)}
                          </div>
                        </div>
                      )}
                    </div>
                  </SelectItem>
                );
              })
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
