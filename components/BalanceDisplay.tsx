import { Alert } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface BalanceDisplayProps {
  balances: any;
  loading: boolean;
  error: string | null;
  selectedAssetId?: string;
}

export const BalanceDisplay = ({
  balances,
  loading,
  error,
  selectedAssetId,
}: BalanceDisplayProps) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <p className="text-sm">Error loading balances: {error}</p>
      </Alert>
    );
  }

  if (!balances) {
    return null;
  }

  // Find balance for selected asset if specified
  let selectedBalance = null;
  if (selectedAssetId && balances.balanceByAggregatedAsset) {
    selectedBalance = balances.balanceByAggregatedAsset.find(
      (b: any) => b.aggregatedAssetId === selectedAssetId
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Total Balance</h3>
          <span className="font-medium">${balances.totalBalance?.fiatValue.toFixed(2)}</span>
        </div>

        {selectedBalance && (
          <div className="flex justify-between mt-2 border-t pt-2">
            <h3 className="text-sm font-medium">Selected Asset</h3>
            <div className="text-right">
              <div className="font-medium">
                {parseFloat(selectedBalance.balance) / 10 ** 18}{' '}
                {selectedBalance.aggregatedAssetId.split(':')[1]}
              </div>
              <div className="text-xs text-gray-500">${selectedBalance.fiatValue?.toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
