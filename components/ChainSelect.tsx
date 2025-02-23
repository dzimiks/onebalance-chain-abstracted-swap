import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Chain, CHAIN_NAMES } from '@/lib/types/chains';

interface ChainSelectProps {
  chains: Chain[];
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export const ChainSelect = ({
  chains,
  value,
  onValueChange,
  label,
  placeholder = 'Select chain',
  disabled,
}: ChainSelectProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Networks</SelectLabel>
            {chains.map((chain) => (
              <SelectItem
                key={chain.chain.reference}
                value={chain.chain.reference}
              >
                <Image
                  className="bg-black"
                  src={`https://storage.googleapis.com/tenderly-public-assets/networks/${chain.chain.reference}.svg`}
                  alt={chain.chain.reference}
                  width={16}
                  height={16}
                />
                <span>{CHAIN_NAMES[chain.chain.reference] ?? 'Unknown Chain'}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};