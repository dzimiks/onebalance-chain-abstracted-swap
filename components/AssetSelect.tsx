import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Asset } from '@/lib/types/assets';
import { CHAIN_NAMES } from '@/lib/types/chains';
import { getChainIdFromAssetType } from '@/lib/utils/chain';

interface AssetSelectProps {
  assets: Asset[];
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  selectedChainId?: string;
}

export const AssetSelect = ({
  assets,
  value,
  onValueChange,
  label,
  placeholder = 'Select asset',
  disabled,
  selectedChainId,
}: AssetSelectProps) => {
  // Filter assets based on selected chain
  const filteredAssets: Asset[] = selectedChainId
    ? assets.filter(asset =>
      asset.aggregatedEntities.some(entity =>
        getChainIdFromAssetType(entity.assetType) === selectedChainId
      )
    )
    : assets;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled || filteredAssets?.length === 0}>
        <SelectTrigger className="h-16">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Assets{selectedChainId ? ` on ${CHAIN_NAMES[selectedChainId]}` : ''}</SelectLabel>
            {filteredAssets.map((asset: Asset) => (
              <SelectItem
                key={asset.aggregatedAssetId}
                value={asset.aggregatedAssetId}
                className="flex items-center justify-between"
              >
                <span><span className="font-semibold">{asset.symbol}</span> ({asset.aggregatedAssetId})</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
