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

interface AssetSelectProps {
  assets: Asset[];
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  placeholder?: string;
}

export const AssetSelect = ({
  assets,
  value,
  onValueChange,
  label,
  placeholder = 'Select asset',
}: AssetSelectProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Assets</SelectLabel>
            {assets.map((asset) => (
              <SelectItem key={asset.aggregatedAssetId} value={asset.aggregatedAssetId}>
                {asset.symbol} - {asset.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
