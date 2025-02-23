import { Input } from '@/components/ui/input';
import { parseTokenAmount } from '@/lib/utils/token';
import type { Asset } from '@/lib/types/assets';

interface AmountInputProps {
  value: string;
  onChange: (value: string, parsedValue: string) => void;
  disabled?: boolean;
  selectedAsset?: Asset | null;
}

export const AmountInput = ({
  value,
  onChange,
  disabled = false,
  selectedAsset,
}: AmountInputProps) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Only allow numbers and decimals
    if (!/^\d*\.?\d*$/.test(inputValue) && inputValue !== '') {
      return;
    }

    // Get the decimals from the selected asset or default to 18 (ETH)
    const decimals = selectedAsset?.decimals ?? 18;

    // Convert the human-readable amount to token units
    const parsedValue = parseTokenAmount(inputValue || '0', decimals);

    onChange(inputValue, parsedValue);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Amount</label>
      <Input
        type="text"
        placeholder="Enter amount"
        value={value}
        onChange={handleAmountChange}
        disabled={disabled}
      />
    </div>
  );
};
