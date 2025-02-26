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
      {label && <label className="block text-sm font-medium">{label}</label>}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="h-14">
          <SelectValue>
            {selectedAsset && (
              <div className="flex items-center">
                <span className="font-bold">{selectedAsset.symbol}</span>
                <span className="text-gray-500 text-sm ml-2">({selectedAsset.aggregatedAssetId})</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-80">
          <div className="sticky top-0 bg-white p-2 z-10">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
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
              <div className="py-6 text-center text-gray-500">
                No assets found matching <span className="font-semibold">{searchTerm}</span>
              </div>
            ) : (
              displayAssets.map((asset) => {
                const assetBalance = showBalances ? getAssetBalance(asset.aggregatedAssetId) : null;

                return (
                  <SelectItem
                    key={asset.aggregatedAssetId}
                    value={asset.aggregatedAssetId}
                    className="py-3 hover:bg-gray-50"
                  >
                    <div className="flex gap-4 justify-between w-full">
                      <div>
                        <div className="font-medium">{asset.symbol}</div>
                        <div className="text-gray-500 text-xs">{asset.name}</div>
                        <div className="text-gray-400 text-xs">{asset.aggregatedAssetId}</div>
                      </div>

                      {showBalances && assetBalance && (
                        <div className="text-right text-sm">
                          <div className="font-medium">
                            {formatTokenAmount(assetBalance.balance, asset.decimals)}
                          </div>
                          <div className="text-xs text-gray-500">
                            ${assetBalance.fiatValue?.toFixed(2) || '0.00'}
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
